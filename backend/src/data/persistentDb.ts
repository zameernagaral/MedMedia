import fs from "fs";
import path from "path";
import { 
  UserProfile, 
  Post, 
  Story, 
  Medclip, 
  Job, 
  OpportunityItem,
  Community,
  ResearchProject,
  ResearchNote,
  ResearchMessage,
  LocumGig,
  LocumApplication,
  ScholarshipItem,
  CourseItem,
  NotificationItem,
  SupportTicket,
  USERS, 
  POSTS, 
  STORIES, 
  MEDCLIPS, 
  JOBS, 
  OPPORTUNITIES,
  COMMUNITIES,
  RESEARCH_PROJECTS,
  LOCUM_GIGS,
  LOCUM_APPLICATIONS,
  SCHOLARSHIPS,
  COURSES,
  NOTIFICATIONS,
  SUPPORT_TICKETS
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
  communities: Community[];
  researchProjects: ResearchProject[];
  locumGigs: LocumGig[];
  locumApplications: LocumApplication[];
  scholarships: ScholarshipItem[];
  courses: CourseItem[];
  notifications: NotificationItem[];
  supportTickets: SupportTicket[];
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
          users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : [...USERS],
          posts: Array.isArray(parsed.posts) ? parsed.posts : [],
          stories: Array.isArray(parsed.stories) ? parsed.stories : [],
          clips: Array.isArray(parsed.clips) && parsed.clips.length > 0 ? parsed.clips : [...MEDCLIPS],
          jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
          opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
          communities: Array.isArray(parsed.communities) ? parsed.communities : [],
          researchProjects: Array.isArray(parsed.researchProjects) ? parsed.researchProjects : [],
          locumGigs: Array.isArray(parsed.locumGigs) ? parsed.locumGigs : [],
          locumApplications: Array.isArray(parsed.locumApplications) ? parsed.locumApplications : [],
          scholarships: Array.isArray(parsed.scholarships) ? parsed.scholarships : [],
          courses: Array.isArray(parsed.courses) ? parsed.courses : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          supportTickets: Array.isArray(parsed.supportTickets) ? parsed.supportTickets : [],
          sessions: Array.isArray(parsed.sessions) && parsed.sessions.length > 0 ? parsed.sessions : [...INITIAL_SESSIONS],
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
      communities: [...COMMUNITIES],
      researchProjects: [...RESEARCH_PROJECTS],
      locumGigs: [...LOCUM_GIGS],
      locumApplications: [...LOCUM_APPLICATIONS],
      scholarships: [...SCHOLARSHIPS],
      courses: [...COURSES],
      notifications: [...NOTIFICATIONS],
      supportTickets: [...SUPPORT_TICKETS],
      sessions: [...INITIAL_SESSIONS],
      lastUpdated: new Date().toISOString()
    };
    this.saveToDisk(initial);
    console.log(`[MedMedia DB] Initialized clean persistent database at ${DB_FILE}`);
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

  // --- Users ---
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
      (u.email && u.email.toLowerCase() === id.toLowerCase())
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

  // --- Posts ---
  public getPosts(filters?: { type?: string; tag?: string }): Post[] {
    let list = [...this.data.posts];
    if (filters?.type) {
      list = list.filter(p => p.postType === filters.type);
    }
    if (filters?.tag) {
      const tagLower = filters.tag.toLowerCase();
      list = list.filter(p => p.clinicalTags && p.clinicalTags.some(t => t.toLowerCase() === tagLower));
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

  public deletePost(id: string): boolean {
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) return false;
    const post = this.data.posts[index];
    this.data.posts.splice(index, 1);
    const author = this.getUserById(post.authorId);
    if (author && author.stats.postsCount > 0) {
      author.stats.postsCount -= 1;
      mysqlDb.syncUser(author).catch(() => {});
    }
    this.saveToDisk();
    mysqlDb.deletePost(id).catch(() => {});
    return true;
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

  // --- Stories ---
  public getStories(): Story[] {
    return [...this.data.stories];
  }

  public addStory(story: Story): Story {
    this.data.stories.unshift(story);
    this.saveToDisk();
    mysqlDb.syncStory(story).catch(() => {});
    return story;
  }

  public deleteStory(id: string): boolean {
    const index = this.data.stories.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.data.stories.splice(index, 1);
    this.saveToDisk();
    mysqlDb.deleteStory(id).catch(() => {});
    return true;
  }

  // --- Clips / Reels ---
  public getClips(): Medclip[] {
    return [...this.data.clips];
  }

  public addClip(clip: Medclip): Medclip {
    this.data.clips.unshift(clip);
    this.saveToDisk();
    mysqlDb.syncClip(clip).catch(e => console.error("MySQL Sync Error:", e));
    return clip;
  }

  public updateClip(clip: Medclip): void {
    const idx = this.data.clips.findIndex(c => c.id === clip.id);
    if (idx !== -1) {
      this.data.clips[idx] = clip;
      this.saveToDisk();
      mysqlDb.syncClip(clip).catch(e => console.error("MySQL Sync Error:", e));
    }
  }

  // --- Jobs ---
  public getJobs(): Job[] {
    return [...this.data.jobs];
  }

  public addJob(job: Job): Job {
    this.data.jobs.unshift(job);
    this.saveToDisk();
    return job;
  }

  public deleteJob(jobId: string): boolean {
    const index = this.data.jobs.findIndex(j => j.id === jobId);
    if (index === -1) return false;
    this.data.jobs.splice(index, 1);
    this.saveToDisk();
    return true;
  }

  // --- Opportunities Hub Generic ---
  public getOpportunities(): OpportunityItem[] {
    return [...this.data.opportunities];
  }

  public addOpportunity(opp: OpportunityItem): OpportunityItem {
    this.data.opportunities.unshift(opp);
    this.saveToDisk();
    return opp;
  }

  // --- Communities (10,000 Capacity Limit) ---
  public getCommunities(): Community[] {
    return [...this.data.communities];
  }

  public createCommunity(comm: Community): { success: boolean; community: Community } {
    if (!comm.maxCapacity) comm.maxCapacity = 10000;
    if (!comm.membersCount) comm.membersCount = 1;
    this.data.communities.unshift(comm);
    const user = this.getUserById(comm.creatorId);
    if (user) {
      if (!user.joinedCommunityIds) user.joinedCommunityIds = [];
      if (!user.joinedCommunityIds.includes(comm.id)) user.joinedCommunityIds.push(comm.id);
    }
    this.saveToDisk();
    return { success: true, community: comm };
  }

  public joinCommunity(commId: string, userId: string): { success: boolean; message: string; membersCount?: number } {
    const comm = this.data.communities.find(c => c.id === commId);
    if (!comm) return { success: false, message: "Community not found" };
    if (comm.membersCount >= (comm.maxCapacity || 10000)) {
      return { success: false, message: "Community has reached its maximum limit of 10,000 members." };
    }
    const user = this.getUserById(userId);
    if (user) {
      if (!user.joinedCommunityIds) user.joinedCommunityIds = [];
      if (!user.joinedCommunityIds.includes(commId)) {
        user.joinedCommunityIds.push(commId);
        comm.membersCount += 1;
        this.saveToDisk();
        return { success: true, message: `Successfully joined ${comm.name}!`, membersCount: comm.membersCount };
      } else {
        return { success: true, message: `You are already a member of ${comm.name}.`, membersCount: comm.membersCount };
      }
    }
    comm.membersCount += 1;
    this.saveToDisk();
    return { success: true, message: `Successfully joined ${comm.name}!`, membersCount: comm.membersCount };
  }

  public deleteCommunity(commId: string): boolean {
    const index = this.data.communities.findIndex(c => c.id === commId);
    if (index === -1) return false;
    this.data.communities.splice(index, 1);
    this.saveToDisk();
    return true;
  }

  // --- Research Projects Workspace ---
  public getResearchProjects(): ResearchProject[] {
    return [...this.data.researchProjects];
  }

  public createResearchProject(proj: ResearchProject): ResearchProject {
    this.data.researchProjects.unshift(proj);
    this.saveToDisk();
    return proj;
  }

  public requestJoinResearch(projectId: string, userId: string): { success: boolean; message: string } {
    const proj = this.data.researchProjects.find(p => p.id === projectId);
    if (!proj) return { success: false, message: "Project not found" };
    if (proj.memberIds.includes(userId)) {
      return { success: true, message: "Already a member of this research project." };
    }
    if (!proj.pendingJoinRequestIds) proj.pendingJoinRequestIds = [];
    if (!proj.pendingJoinRequestIds.includes(userId)) {
      proj.pendingJoinRequestIds.push(userId);
      this.saveToDisk();
    }
    return { success: true, message: "Join request submitted to research lead for approval." };
  }

  public approveJoinResearch(projectId: string, userId: string): { success: boolean; message: string } {
    const proj = this.data.researchProjects.find(p => p.id === projectId);
    if (!proj) return { success: false, message: "Project not found" };
    proj.pendingJoinRequestIds = (proj.pendingJoinRequestIds || []).filter(id => id !== userId);
    if (!proj.memberIds.includes(userId)) {
      proj.memberIds.push(userId);
    }
    this.saveToDisk();
    return { success: true, message: "Researcher approved and granted access to project workspace." };
  }

  public addResearchNote(projectId: string, note: ResearchNote): ResearchNote | null {
    const proj = this.data.researchProjects.find(p => p.id === projectId);
    if (!proj) return null;
    if (!proj.notes) proj.notes = [];
    proj.notes.unshift(note);
    this.saveToDisk();
    return note;
  }

  public editResearchNote(projectId: string, noteId: string, title: string, content: string): ResearchNote | null {
    const proj = this.data.researchProjects.find(p => p.id === projectId);
    if (!proj || !proj.notes) return null;
    const note = proj.notes.find(n => n.id === noteId);
    if (!note) return null;
    note.title = title;
    note.content = content;
    note.updatedAt = "Just now";
    this.saveToDisk();
    return note;
  }

  public addResearchMessage(projectId: string, msg: ResearchMessage): ResearchMessage | null {
    const proj = this.data.researchProjects.find(p => p.id === projectId);
    if (!proj) return null;
    if (!proj.messages) proj.messages = [];
    proj.messages.push(msg);
    this.saveToDisk();
    return msg;
  }

  // --- Locum Gigs & Applications ---
  public getLocumGigs(): LocumGig[] {
    return [...this.data.locumGigs];
  }

  public createLocumGig(gig: LocumGig): LocumGig {
    this.data.locumGigs.unshift(gig);
    this.saveToDisk();
    return gig;
  }

  public applyLocumGig(app: LocumApplication): LocumApplication {
    this.data.locumApplications.unshift(app);
    this.saveToDisk();
    return app;
  }

  public getLocumApplications(gigId?: string): LocumApplication[] {
    if (gigId) {
      return this.data.locumApplications.filter(a => a.gigId === gigId);
    }
    return [...this.data.locumApplications];
  }

  // --- Scholarships & Courses ---
  public getScholarships(): ScholarshipItem[] {
    return [...this.data.scholarships];
  }

  public getCourses(): CourseItem[] {
    return [...this.data.courses];
  }

  // --- Notifications (Only Conferences, Job Updates, Job Applications, Follow Requests & Accepted) ---
  public getNotifications(userId?: string): NotificationItem[] {
    if (userId) {
      return this.data.notifications.filter(n => n.userId === userId);
    }
    return [...this.data.notifications];
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public addNotification(notif: NotificationItem): NotificationItem {
    this.data.notifications.unshift(notif);
    this.saveToDisk();
    return notif;
  }

  // --- Support Tickets (forward to medmedia1409@gmail.com) ---
  public createSupportTicket(ticket: SupportTicket): SupportTicket {
    ticket.forwardedTo = "medmedia1409@gmail.com";
    this.data.supportTickets.unshift(ticket);
    this.saveToDisk();
    console.log(`[MedMedia Support] Ticket #${ticket.id} from ${ticket.userName} (${ticket.userEmail}) forwarded to medmedia1409@gmail.com.`);
    return ticket;
  }

  public getSupportTickets(): SupportTicket[] {
    return [...this.data.supportTickets];
  }

  // --- Sessions & Auth ---
  public getSessions(): DeviceSession[] {
    return [...this.data.sessions];
  }

  public revokeSession(sessionId: string): DeviceSession[] {
    this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
    this.saveToDisk();
    return [...this.data.sessions];
  }

  public async clearAllData(): Promise<void> {
    this.data = {
      users: [],
      posts: [],
      stories: [],
      clips: [],
      jobs: [],
      opportunities: [],
      communities: [],
      researchProjects: [],
      locumGigs: [],
      locumApplications: [],
      scholarships: [],
      courses: [],
      notifications: [],
      supportTickets: [],
      sessions: [],
      lastUpdated: new Date().toISOString()
    };
    this.saveToDisk();
    await mysqlDb.clearAllTables();
    console.log("[MedMedia DB] Successfully cleared all data across JSON disk and MySQL tables.");
  }

  public async seedClinicalDemoData(): Promise<void> {
    this.data = {
      users: [...USERS],
      posts: [...POSTS],
      stories: [...STORIES],
      clips: [...MEDCLIPS],
      jobs: [...JOBS],
      opportunities: [...OPPORTUNITIES],
      communities: [...COMMUNITIES],
      researchProjects: [...RESEARCH_PROJECTS],
      locumGigs: [...LOCUM_GIGS],
      locumApplications: [...LOCUM_APPLICATIONS],
      scholarships: [...SCHOLARSHIPS],
      courses: [...COURSES],
      notifications: [...NOTIFICATIONS],
      supportTickets: [...SUPPORT_TICKETS],
      sessions: [...INITIAL_SESSIONS],
      lastUpdated: new Date().toISOString()
    };
    this.saveToDisk();
    await mysqlDb.seedInitialDataIfEmpty(this.data.users, this.data.posts, this.data.stories);
    console.log("[MedMedia DB] Successfully populated clinical demo dataset.");
  }

  public getStats() {
    return {
      usersCount: this.data.users.length,
      postsCount: this.data.posts.length,
      storiesCount: this.data.stories.length,
      clipsCount: this.data.clips.length,
      jobsCount: this.data.jobs.length,
      opportunitiesCount: this.data.opportunities.length,
      communitiesCount: this.data.communities.length,
      researchProjectsCount: this.data.researchProjects.length,
      locumGigsCount: this.data.locumGigs.length,
      scholarshipsCount: this.data.scholarships.length,
      coursesCount: this.data.courses.length,
      notificationsCount: this.data.notifications.length,
      supportTicketsCount: this.data.supportTickets.length,
      lastUpdated: this.data.lastUpdated,
      mysqlStatus: mysqlDb.getStatus()
    };
  }
}

export const db = new PersistentDatabase();
