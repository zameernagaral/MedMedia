const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sourcePath = path.resolve(__dirname, '../prisma/dev.db');
const apply = process.argv.includes('--apply');
const quote = value => `\`${String(value).replace(/`/g, '``')}\``;

function getSqliteTables(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    .all().map(row => row.name).filter(name => name !== '_prisma_migrations');
}

function normalizeDate(value, dataType) {
  if (value == null) return value;
  if (!['date', 'datetime', 'timestamp', 'time'].includes(dataType)) return value;
  if (typeof value === 'number' || typeof value === 'bigint') {
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) throw new Error('Legacy database contains an invalid numeric date value.');
    const iso = date.toISOString();
    return dataType === 'date' ? iso.slice(0, 10) : iso.slice(0, 23).replace('T', ' ');
  }
  if (typeof value !== 'string') return value;
  return value.replace('T', ' ').replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
}

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('This local legacy import is disabled in production.');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  if (!require('node:fs').existsSync(sourcePath)) throw new Error('Legacy SQLite database was not found.');

  const sqlite = new DatabaseSync(sourcePath, { readOnly: true });
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const violations = sqlite.prepare('PRAGMA foreign_key_check').all();
    if (violations.length) throw new Error(`Legacy database has ${violations.length} foreign-key violations; import stopped.`);

    const sourceTables = getSqliteTables(sqlite);
    const [tableRows] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'"
    );
    const targetTables = new Map(tableRows.map(row => [row.TABLE_NAME.toLowerCase(), row.TABLE_NAME]));
    const [columnRows] = await connection.query(
      'SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT, EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()'
    );
    const targetColumns = new Map();
    for (const column of columnRows) {
      const tableKey = column.TABLE_NAME.toLowerCase();
      const tableColumns = targetColumns.get(tableKey) || new Map();
      tableColumns.set(column.COLUMN_NAME, column);
      targetColumns.set(tableKey, tableColumns);
    }

    const sourceRows = new Map();
    for (const table of sourceTables) {
      const safeTable = quote(table);
      const rows = sqlite.prepare(`SELECT * FROM ${safeTable}`).all();
      sourceRows.set(table, rows);
      if (rows.length && !targetTables.has(table.toLowerCase())) throw new Error(`Target schema is missing non-empty legacy table ${table}.`);
    }

    const activeTables = sourceTables.filter(table => targetTables.has(table.toLowerCase()));
    for (const table of activeTables) {
      const [countRows] = await connection.query(`SELECT COUNT(*) AS count FROM ${quote(table)}`);
      if (Number(countRows[0].count) !== 0) {
        throw new Error(`Target table ${table} is not empty; import stopped without writing data.`);
      }
    }

    const [foreignKeys] = await connection.query(
      'SELECT TABLE_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL'
    );
    const activeTablesByLowerName = new Map(activeTables.map(table => [table.toLowerCase(), table]));
    const dependencies = new Map(activeTables.map(table => [table, new Set()]));
    for (const key of foreignKeys) {
      const table = activeTablesByLowerName.get(key.TABLE_NAME.toLowerCase());
      const referencedTable = activeTablesByLowerName.get(key.REFERENCED_TABLE_NAME.toLowerCase());
      if (table && referencedTable && table !== referencedTable) {
        dependencies.get(table).add(referencedTable);
      }
    }

    const orderedTables = [];
    const pending = new Set(activeTables);
    while (pending.size) {
      const ready = [...pending].filter(table => [...dependencies.get(table)].every(dependency => !pending.has(dependency)));
      if (!ready.length) throw new Error('Target schema contains a table dependency cycle; import stopped.');
      for (const table of ready) {
        pending.delete(table);
        orderedTables.push(table);
      }
    }

    const oversizedFields = [];
    for (const table of activeTables) {
      const rows = sourceRows.get(table);
      if (!rows.length) continue;
      const mysqlColumns = targetColumns.get(table.toLowerCase());
      for (const column of Object.keys(rows[0])) {
        const metadata = mysqlColumns.get(column);
        const maxLength = Number(metadata.CHARACTER_MAXIMUM_LENGTH);
        if (!['char', 'varchar'].includes(metadata.DATA_TYPE) || !maxLength) continue;
        const sourceMaxLength = rows.reduce((max, row) => Math.max(max, typeof row[column] === 'string' ? [...row[column]].length : 0), 0);
        if (sourceMaxLength > maxLength) oversizedFields.push({ table, column, targetLimit: maxLength, legacyMax: sourceMaxLength });
      }
    }
    if (oversizedFields.length) {
      const detail = oversizedFields.map(field => `${field.table}.${field.column} (${field.legacyMax} > ${field.targetLimit})`).join(', ');
      throw new Error(`Legacy values exceed target string columns; widen these fields before importing: ${detail}`);
    }

    const [targetDatabase] = await connection.query('SELECT DATABASE() AS name');
    const summary = Object.fromEntries(sourceTables.map(table => [table, sourceRows.get(table).length]));
    if (!apply) {
      console.log(JSON.stringify({ dryRun: true, targetDatabase: targetDatabase[0].name, sourceRows: summary, targetTablesEmpty: true }));
      console.log('No data was written. Re-run with --apply to import into this empty database.');
      return;
    }

    await connection.beginTransaction();
    try {
      for (const table of orderedTables) {
        const rows = sourceRows.get(table);
        if (!rows.length) continue;
        const sourceColumns = Object.keys(rows[0]);
        const mysqlColumns = targetColumns.get(table.toLowerCase());
        const missingTargetColumns = sourceColumns.filter(column => !mysqlColumns.has(column));
        if (missingTargetColumns.length) throw new Error(`Target table ${table} is missing legacy columns: ${missingTargetColumns.join(', ')}`);
        const omittedRequiredColumns = [...mysqlColumns.values()].filter(column =>
          !sourceColumns.includes(column.COLUMN_NAME) && column.IS_NULLABLE === 'NO' && column.COLUMN_DEFAULT === null && !String(column.EXTRA).includes('auto_increment')
        );
        if (omittedRequiredColumns.length) throw new Error(`Target table ${table} has required fields absent from the legacy database.`);

        const columnsSql = sourceColumns.map(quote).join(', ');
        const columnMetadata = sourceColumns.map(column => mysqlColumns.get(column));
        const batchSize = 100;
        for (let offset = 0; offset < rows.length; offset += batchSize) {
          const batch = rows.slice(offset, offset + batchSize);
          const rowPlaceholder = `(${sourceColumns.map(() => '?').join(', ')})`;
          const valuesSql = batch.map(() => rowPlaceholder).join(', ');
          const values = batch.flatMap(row => sourceColumns.map((column, index) => normalizeDate(row[column], columnMetadata[index].DATA_TYPE)));
          await connection.execute(`INSERT INTO ${quote(table)} (${columnsSql}) VALUES ${valuesSql}`, values);
        }
      }
      const imported = {};
      for (const table of orderedTables) {
        const expected = sourceRows.get(table).length;
        const [countRows] = await connection.query(`SELECT COUNT(*) AS count FROM ${quote(table)}`);
        imported[table] = { expected, actual: Number(countRows[0].count) };
        if (expected !== imported[table].actual) throw new Error(`Post-import row count mismatch in ${table}.`);
      }
      await connection.commit();
      console.log(JSON.stringify({ imported: true, targetDatabase: targetDatabase[0].name, rowCounts: imported }));
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } finally {
    sqlite.close();
    await connection.end();
  }
}

main().catch(error => {
  console.error(`[Legacy import] ${error.message}`);
  process.exitCode = 1;
});
