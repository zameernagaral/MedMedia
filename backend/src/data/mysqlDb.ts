import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { UserProfile, Post, Story } from './mockDb';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_NAME = process.env.DB_NAME || 'medmedia_db';

class MySQLDatabaseManager {
  private pool: Pool | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initialize();
  }

  public async initialize(): Promise<void> {
    try {
      // Step 1: Connect to MySQL root instance to ensure database exists
      const bootstrapConnection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD
      });

      await bootstrapConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await bootstrapConnection.end();

      // Step 2: Create connection pool with medmedia_db
      this.pool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      await this.createTables();
      this.isConnected = true;
      console.log(`[MedMedia MySQL] Connected successfully to MySQL database "${DB_NAME}" at ${DB_HOST}:${DB_PORT}`);
    } catch (err: any) {
      console.warn(`[MedMedia MySQL] Could not establish connection to local MySQL (${err.message}). Using local JSON DB fallback.`);
      this.isConnected = false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.pool) return;

    // Users table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        role VARCHAR(50) NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        is_verified BOOLEAN DEFAULT TRUE,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Posts table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(100) PRIMARY KEY,
        author_id VARCHAR(100) NOT NULL,
        author_name VARCHAR(200),
        author_username VARCHAR(100),
        author_avatar TEXT,
        author_role VARCHAR(50),
        post_type VARCHAR(50) NOT NULL,
        content TEXT,
        media_urls TEXT,
        clinical_tags TEXT,
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        saves_count INT DEFAULT 0,
        shares_count INT DEFAULT 0,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Stories table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(200) NOT NULL,
        user_avatar TEXT,
        media_url LONGTEXT NOT NULL,
        caption TEXT,
        clinical_tags TEXT,
        timestamp VARCHAR(100),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log(`[MedMedia MySQL] Verified database schema for users, posts, and stories tables.`);
  }

  public getStatus(): { connected: boolean; host: string; database: string } {
    return {
      connected: this.isConnected,
      host: `${DB_HOST}:${DB_PORT}`,
      database: DB_NAME
    };
  }

  // Sync / insert User
  public async syncUser(user: UserProfile): Promise<void> {
    if (!this.pool || !this.isConnected) return;
    try {
      const sql = `
        INSERT INTO users (id, username, full_name, email, role, avatar_url, bio, is_verified, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          username = VALUES(username),
          full_name = VALUES(full_name),
          email = VALUES(email),
          role = VALUES(role),
          avatar_url = VALUES(avatar_url),
          bio = VALUES(bio),
          is_verified = VALUES(is_verified),
          data = VALUES(data);
      `;
      await this.pool.query(sql, [
        user.id,
        user.username,
        user.fullName,
        user.email || null,
        user.role,
        user.avatarUrl,
        user.bio || '',
        user.verificationStatus === 'VERIFIED' ? 1 : 0,
        JSON.stringify(user)
      ]);
    } catch (err: any) {
      console.error(`[MedMedia MySQL] Error syncing user ${user.id}:`, err.message);
    }
  }

  // Sync / insert Post
  public async syncPost(post: Post): Promise<void> {
    if (!this.pool || !this.isConnected) return;
    try {
      const sql = `
        INSERT INTO posts (
          id, author_id, author_name, author_username, author_avatar, author_role,
          post_type, content, media_urls, clinical_tags, likes_count, comments_count,
          saves_count, shares_count, data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          content = VALUES(content),
          media_urls = VALUES(media_urls),
          clinical_tags = VALUES(clinical_tags),
          likes_count = VALUES(likes_count),
          comments_count = VALUES(comments_count),
          saves_count = VALUES(saves_count),
          data = VALUES(data);
      `;
      await this.pool.query(sql, [
        post.id,
        post.authorId,
        post.authorName,
        post.authorUsername,
        post.authorAvatar,
        post.authorRole,
        post.postType,
        post.content,
        (post.mediaUrls || []).join(' '),
        (post.clinicalTags || []).join(' '),
        post.likesCount || 0,
        post.commentsCount || 0,
        post.savesCount || 0,
        post.sharesCount || 0,
        JSON.stringify(post)
      ]);
    } catch (err: any) {
      console.error(`[MedMedia MySQL] Error syncing post ${post.id}:`, err.message);
    }
  }

  // Sync / insert Story
  public async syncStory(story: Story): Promise<void> {
    if (!this.pool || !this.isConnected) return;
    try {
      const sql = `
        INSERT INTO stories (
          id, user_id, user_name, user_avatar, media_url, caption, clinical_tags, timestamp, data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          media_url = VALUES(media_url),
          caption = VALUES(caption),
          clinical_tags = VALUES(clinical_tags),
          data = VALUES(data);
      `;
      await this.pool.query(sql, [
        story.id,
        story.userId,
        story.userName,
        story.userAvatar,
        story.mediaUrl,
        story.caption,
        (story as any).clinicalTags ? (story as any).clinicalTags.join(' ') : '',
        story.timestamp || 'Just now',
        JSON.stringify(story)
      ]);
    } catch (err: any) {
      console.error(`[MedMedia MySQL] Error syncing story ${story.id}:`, err.message);
    }
  }

  // Seed default items if tables are empty
  public async seedInitialDataIfEmpty(users: UserProfile[], posts: Post[], stories: Story[]): Promise<void> {
    if (!this.pool || !this.isConnected) return;
    try {
      const [userRows]: any = await this.pool.query('SELECT COUNT(*) as cnt FROM users');
      if (userRows[0]?.cnt === 0) {
        console.log(`[MedMedia MySQL] Seeding ${users.length} initial users into MySQL...`);
        for (const u of users) {
          await this.syncUser(u);
        }
      }

      const [postRows]: any = await this.pool.query('SELECT COUNT(*) as cnt FROM posts');
      if (postRows[0]?.cnt === 0) {
        console.log(`[MedMedia MySQL] Seeding ${posts.length} initial posts into MySQL...`);
        for (const p of posts) {
          await this.syncPost(p);
        }
      }

      const [storyRows]: any = await this.pool.query('SELECT COUNT(*) as cnt FROM stories');
      if (storyRows[0]?.cnt === 0) {
        console.log(`[MedMedia MySQL] Seeding ${stories.length} initial stories into MySQL...`);
        for (const s of stories) {
          await this.syncStory(s);
        }
      }
    } catch (err: any) {
      console.error('[MedMedia MySQL] Error seeding initial data:', err.message);
    }
  }
}

export const mysqlDb = new MySQLDatabaseManager();
