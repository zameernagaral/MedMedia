const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('backend/prisma/dev.db', { readOnly: true });
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = ? AND name NOT LIKE ?")
  .all('table', 'sqlite_%')
  .map(row => row.name);
const tableDetails = Object.fromEntries(tables.map(table => {
  const safeName = table.replace(/"/g, '""');
  const count = db.prepare(`SELECT COUNT(*) AS count FROM "${safeName}"`).get().count;
  const columns = db.prepare(`PRAGMA table_info("${safeName}")`).all().map(column => column.name);
  return [table, { count, columns }];
}));
const authSummary = db.prepare('SELECT role, COUNT(*) AS count, SUM(passwordHash IS NOT NULL) AS passwordAccounts, SUM(email IS NOT NULL) AS emailAccounts FROM User GROUP BY role').all();
const duplicateEmails = db.prepare('SELECT COUNT(*) AS count FROM (SELECT LOWER(email) AS value FROM User WHERE email IS NOT NULL GROUP BY LOWER(email) HAVING COUNT(*) > 1)').get().count;
const duplicateUsernames = db.prepare('SELECT COUNT(*) AS count FROM (SELECT LOWER(username) AS value FROM User GROUP BY LOWER(username) HAVING COUNT(*) > 1)').get().count;
console.log(JSON.stringify({ tableDetails, authSummary, duplicateEmails, duplicateUsernames }));
db.close();
