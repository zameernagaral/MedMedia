import fs from "fs";
import path from "path";
import { 
  UserProfile, 
  Post, 
  Story, 
  Medclip, 
  Job, 
  OpportunityItem,
  USERS, 
  POSTS, 
  STORIES, 
  MEDCLIPS, 
  JOBS, 
  OPPORTUNITIES 
} from "./mockDb";
import { mysqlDb } from "./mysqlDb";

export interface DeviceSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceOs: string;
  ipAddress: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

export interface LocalDatabaseSchema {
  users: UserProfile[];
  posts: Post[];
  stories: Story[];
  clips: Medclip[];
  jobs: Job[];
  opportunities: OpportunityItem[];
  sessions: DeviceSession[];
  lastUpdated: string;
}

const DB_DIR = path.resolve(__dirname, "../../data");
const DB_FILE = path.join(DB_DIR, "medmedia_local_db.json");

const INITIAL_SESSIONS: DeviceSession[] = [
  {
    id: "sess-1",
    userId: "doc-1",
    deviceName: "Pixel 8 Pro (Android 15)",
    deviceOs: "Android",
    ipAddress: "152.58.12.91",
    lastActive: "Active Now",
    isCurrentDevice: true
  },
  {
    id: "sess-2",
    userId: "doc-1",
    deviceName: "Chrome on Windows 11 (Laptop)",
    deviceOs: "Windows",
    ipAddress: "103.21.144.2",
    lastActive: "Active Now",
    isCurrentDevice: true
  }
];

class PersistentDatabase {
  private data: LocalDatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
    setTimeout(() => {
      mysqlDb.seedInitialDataIfEmpty(this.data.users, this.data.posts, this.data.stories).catch(() => {});
    }, 1500);
  }

  private loadFromDisk(): LocalDatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        console.log(`[MedMedia DB] Loaded persistent database from ${DB_FILE} (${parsed.users?.length || 0} users, ${parsed.posts?.length || 0} posts)`);
        return {
          users: parsed.users || [...USERS],
          posts: parsed.posts || [...POSTS],
          stories: parsed.stories || [...STORIES],
          clips: parsed.clips || [...MEDCLIPS],
          jobs: parsed.jobs || [...JOBS],
          opportunities: parsed.opportunities || [...OPPORTUNITIES],
          sessions: parsed.sessions || [...INITIAL_SESSIONS],
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };
      }
    } catch (err) {
      console.error("[MedMedia DB] Error reading database file from disk, initializing fresh:", err);
    }

    const initial: LocalDatabaseSchema = {
      users: [...USERS],
      posts: [...POSTS],
      stories: [...STORIES],
      clips: [...MEDCLIPS],
      jobs: [...JOBS],
      opportunities: [...OPPORTUNITIES],
      sessions: [...INITIAL_SESSIONS],
      lastUpdated: new Date().toISOString()
    };
    this.saveToDisk(initial);
    console.log(`[MedMedia DB] Initialized and saved brand new persistent database to ${DB_FILE}`);
    return initial;
  }

  private saveToDisk(snapshot?: LocalDatabaseSchema): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const dataToSave = snapshot || this.data;
      dataToSave.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (err) {
      console.error("[MedMedia DB] Error writing persistent database to disk:", err);
    }
  }

  public getUsers(role?: string): UserProfile[] {
    if (role) {
      return this.data.users.filter(u => u.role === role.toUpperCase());
    }
    return [...this.data.users];
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.data.users.find(u => 
      u.id === id || 
      u.username.toLowerCase() === id.toLowerCase() || 
      u.email.toLowerCase() === id.toLowerCase()
    );
  }

  public addUser(user: UserProfile): UserProfile {
    const existingIndex = this.data.users.findIndex(u => 
      u.id === user.id || 
      (user.email && u.email && u.email.toLowerCase() === user.email.toLowerCase())
    );
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = { ...this.data.users[existingIndex], ...user };
    } else {
      this.data.users.unshift(user);
    }
    this.saveToDisk();
    mysqlDb.syncUser(user).catch(() => {});
    return user;
  }

  public getPosts(filters?: { type?: string; tag?: string }): Post[] {
    let list = [...this.data.posts];
    if (filters?.type) {
      list = list.filter(p => p.postType === filters.type);
    }
    if (filters?.tag) {
      const tagLower = filters.tag.toLowerCase();
      list = list.filter(p => p.clinicalTags.some(t => t.toLowerCase() === tagLower));
    }
    return list;
  }

  public getPostById(id: string): Post | undefined {
    return this.data.posts.find(p => p.id === id);
  }

  public addPost(post: Post): Post {
    this.data.posts.unshift(post);
    const author = this.getUserById(post.authorId);
    if (author) {
      author.stats.postsCount = (author.stats.postsCount || 0) + 1;
      mysqlDb.syncUser(author).catch(() => {});
    }
    this.saveToDisk();
    mysqlDb.syncPost(post).catch(() => {});
    return post;
  }

  public toggleLikePost(postId: string): { isLiked: boolean; likesCount: number } | null {
    const post = this.getPostById(postId);
    if (!post) return null;
    post.isLiked = !post.isLiked;
    post.likesCount = Math.max(0, post.likesCount + (post.isLiked ? 1 : -1));
    this.saveToDisk();
    mysqlDb.syncPost(post).catch(() => {});
    return { isLiked: post.isLiked, likesCount: post.likesCount };
  }

  public toggleSavePost(postId: string): { isSaved: boolean; savesCount: number } | null {
    const post = this.getPostById(postId);
    if (!post) return null;
    post.isSaved = !post.isSaved;
    post.savesCount = Math.max(0, post.savesCount + (post.isSaved ? 1 : -1));
    this.saveToDisk();
    mysqlDb.syncPost(post).catch(() => {});
    return { isSaved: post.isSaved, savesCount: post.savesCount };
  }

  public votePoll(postId: string, optionId: string): any {
    const post = this.getPostById(postId);
    if (!post || !post.casePoll) return null;
    const option = post.casePoll.options.find(o => o.id === optionId);
    if (option) {
      option.votes += 1;
      post.casePoll.totalVotes += 1;
      post.casePoll.userVotedOptionId = optionId;
      this.saveToDisk();
      mysqlDb.syncPost(post).catch(() => {});
    }
    return post.casePoll;
  }

  public getStories(): Story[] {
    return [...this.data.stories];
  }

  public addStory(story: Story): Story {
    this.data.stories.unshift(story);
    this.saveToDisk();
    mysqlDb.syncStory(story).catch(() => {});
    return story;
  }

  public getClips(): Medclip[] {
    return [...this.data.clips];
  }

  public getJobs(): Job[] {
    return [...this.data.jobs];
  }

  public getOpportunities(): OpportunityItem[] {
    return [...this.data.opportunities];
  }

  public getSessions(): DeviceSession[] {
    return [...this.data.sessions];
  }

  public revokeSession(sessionId: string): DeviceSession[] {
    this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
    this.saveToDisk();
    return [...this.data.sessions];
  }
}

export const db = new PersistentDatabase();
