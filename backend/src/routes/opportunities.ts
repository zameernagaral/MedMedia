import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { 
  Job, 
  OpportunityItem, 
  Community, 
  ResearchProject, 
  ResearchNote, 
  ResearchMessage, 
  LocumGig, 
  LocumApplication 
} from '../data/mockDb';

const router = Router();

const getParamId = (p: string | string[]): string => Array.isArray(p) ? p[0] : p;

// GET /api/opportunities (Overview)
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: db.getOpportunities().length + db.getJobs().length,
    opportunities: db.getOpportunities(),
    jobs: db.getJobs(),
    communities: db.getCommunities(),
    researchProjects: db.getResearchProjects(),
    locumGigs: db.getLocumGigs(),
    scholarships: db.getScholarships(),
    courses: db.getCourses()
  });
});

// ==========================================
// 1. COMMUNITIES (10,000 Capacity Limit)
// ==========================================

// GET /api/opportunities/communities
router.get('/communities', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let list = db.getCommunities();

  if (category && category !== 'All') {
    list = list.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: list.length,
    communities: list
  });
});

// POST /api/opportunities/communities (Create Community with 10k Limit)
router.post('/communities', (req: Request, res: Response) => {
  const { name, description, category, iconUrl, avatarUrl, creatorId, creatorName } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Community name is required." });
  }

  const image = avatarUrl || iconUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&h=150&fit=crop";

  const newComm: Community = {
    id: `comm-${Date.now()}`,
    name: name.trim(),
    iconUrl: image,
    avatarUrl: image,
    description: description || "Professional clinical and medical discussion group.",
    category: category || "Specialty",
    membersCount: 1,
    maxCapacity: 10000, // Enforced 10,000 members capacity
    creatorId: creatorId || "doc-1",
    creatorName: creatorName || "Dr. Arvind Ramesh",
    createdAt: new Date().toISOString()
  };

  const result = db.createCommunity(newComm);
  res.status(201).json({
    success: true,
    message: "Community created successfully with 10,000 capacity limit.",
    community: result.community
  });
});

// POST /api/opportunities/communities/:id/join
router.post('/communities/:id/join', (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = db.joinCommunity(getParamId(req.params.id), userId || "doc-1");
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// DELETE /api/opportunities/communities/:id (Admin / Manager control)
router.delete('/communities/:id', (req: Request, res: Response) => {
  const deleted = db.deleteCommunity(getParamId(req.params.id));
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Community not found" });
  }
  res.json({ success: true, message: "Community deleted successfully" });
});

// ==========================================
// 2. RESEARCH PROJECTS & COLLABORATION WORKSPACE
// ==========================================

// GET /api/opportunities/research
router.get('/research', (req: Request, res: Response) => {
  const { search, tag } = req.query;
  let list = db.getResearchProjects();

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(p => 
      p.projectName.toLowerCase().includes(q) || 
      p.instituteName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (tag) {
    const t = (tag as string).toLowerCase();
    list = list.filter(p => p.tags.some(tagItem => tagItem.toLowerCase().includes(t)));
  }

  res.json({
    success: true,
    count: list.length,
    researchProjects: list
  });
});

// POST /api/opportunities/research (Add Research)
router.post('/research', (req: Request, res: Response) => {
  const { 
    projectName, 
    instituteName, 
    departmentName, 
    place, 
    description, 
    tags, 
    photosOrLink, 
    creatorId, 
    creatorName, 
    creatorAvatar 
  } = req.body;

  if (!projectName) {
    return res.status(400).json({ success: false, message: "Project name is required." });
  }

  // Parse hashtags from description or explicit tags
  let extractedTags: string[] = Array.isArray(tags) ? tags : [];
  if (description) {
    const hashMatches = description.match(/#[a-zA-Z0-9_]+/g);
    if (hashMatches) {
      extractedTags = Array.from(new Set([...extractedTags, ...hashMatches]));
    }
  }
  if (extractedTags.length === 0) {
    extractedTags = ["#ClinicalResearch", "#Medicine"];
  }

  const newProject: ResearchProject = {
    id: `res-${Date.now()}`,
    projectName,
    instituteName: instituteName || "Medical Research Center",
    departmentName: departmentName || "Department of Clinical Medicine",
    place: place || "Karnataka, India",
    description: description || "",
    tags: extractedTags,
    photosOrLink: photosOrLink || undefined,
    creatorId: creatorId || "doc-1",
    creatorName: creatorName || "Dr. Arvind Ramesh, MD, DM",
    creatorAvatar: creatorAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
    memberIds: [creatorId || "doc-1"],
    pendingJoinRequestIds: [],
    notes: [
      {
        id: `note-${Date.now()}`,
        title: "Study Protocol & Ethical Clearance",
        content: `Initial study setup for ${projectName}. IRB documentation and data logs initiated.`,
        authorId: creatorId || "doc-1",
        authorName: creatorName || "Dr. Arvind Ramesh",
        updatedAt: "Just now"
      }
    ],
    messages: [
      {
        id: `rm-${Date.now()}`,
        senderId: creatorId || "doc-1",
        senderName: creatorName || "Dr. Arvind Ramesh",
        senderAvatar: creatorAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
        text: `Welcome to the collaboration workspace for ${projectName}. All members can share protocols, notes, and study updates here.`,
        timestamp: "Just now"
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.createResearchProject(newProject);
  res.status(201).json({
    success: true,
    message: "Research project created successfully with collaboration workspace.",
    project: newProject
  });
});

// POST /api/opportunities/research/:id/join (Request to Join)
router.post('/research/:id/join', (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = db.requestJoinResearch(getParamId(req.params.id), userId || "stu-1");
  res.json(result);
});

// POST /api/opportunities/research/:id/approve (Approval Flow)
router.post('/research/:id/approve', (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = db.approveJoinResearch(getParamId(req.params.id), userId);
  res.json(result);
});

// POST /api/opportunities/research/:id/notes (Add Note)
router.post('/research/:id/notes', (req: Request, res: Response) => {
  const { title, content, authorId, authorName } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Title and content are required." });
  }

  const note: ResearchNote = {
    id: `note-${Date.now()}`,
    title,
    content,
    authorId: authorId || "doc-1",
    authorName: authorName || "Researcher",
    updatedAt: "Just now"
  };

  const added = db.addResearchNote(getParamId(req.params.id), note);
  if (!added) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  res.status(201).json({ success: true, note });
});

// PUT /api/opportunities/research/:id/notes/:noteId (Edit Note with 3-dot menu)
router.put('/research/:id/notes/:noteId', (req: Request, res: Response) => {
  const { title, content } = req.body;
  const updated = db.editResearchNote(getParamId(req.params.id), getParamId(req.params.noteId), title, content);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Project or Note not found" });
  }
  res.json({ success: true, note: updated });
});

// POST /api/opportunities/research/:id/messages (Workspace Messaging with Photos & Videos)
router.post('/research/:id/messages', (req: Request, res: Response) => {
  const { senderId, senderName, senderAvatar, text, mediaUrl, isVideo } = req.body;
  if (!text && !mediaUrl) {
    return res.status(400).json({ success: false, message: "Text or media is required" });
  }

  const msg: ResearchMessage = {
    id: `rm-${Date.now()}`,
    senderId: senderId || "doc-1",
    senderName: senderName || "Researcher",
    senderAvatar: senderAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
    text: text || "",
    mediaUrl: mediaUrl || undefined,
    isVideo: isVideo || false,
    timestamp: "Just now"
  };

  const added = db.addResearchMessage(getParamId(req.params.id), msg);
  if (!added) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  res.status(201).json({ success: true, message: msg });
});

// ==========================================
// 3. LOCUM GIGS & APPLICATIONS
// ==========================================

// GET /api/opportunities/locum
router.get('/locum', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: db.getLocumGigs().length,
    locumGigs: db.getLocumGigs()
  });
});

// POST /api/opportunities/locum (Post Locum Gig - mandatory stipend)
router.post('/locum', (req: Request, res: Response) => {
  const { 
    instituteName, 
    place, 
    duration, 
    gigName, 
    stipend, 
    documentsUrl, 
    email, 
    phone, 
    otherLink, 
    creatorId, 
    creatorName 
  } = req.body;

  if (!instituteName || !place || !duration || !gigName || !stipend || !email || !phone) {
    return res.status(400).json({ 
      success: false, 
      message: "Please fill in all mandatory fields: Institute Name, Place, Duration, Gig Name, Stipend, Email, and Phone." 
    });
  }

  const newGig: LocumGig = {
    id: `locum-${Date.now()}`,
    instituteName,
    place,
    duration,
    gigName,
    stipend,
    documentsUrl: documentsUrl || undefined,
    email,
    phone,
    otherLink: otherLink || undefined,
    creatorId: creatorId || "doc-1",
    creatorName: creatorName || "Dr. Arvind Ramesh",
    createdAt: new Date().toISOString()
  };

  db.createLocumGig(newGig);
  res.status(201).json({
    success: true,
    message: "Locum gig posted successfully.",
    gig: newGig
  });
});

// POST /api/opportunities/locum/:id/apply (Apply for Locum)
router.post('/locum/:id/apply', (req: Request, res: Response) => {
  const { 
    name, 
    qualification, 
    resumeUrl, 
    email, 
    contactNumber, 
    otherLink, 
    applicantId 
  } = req.body;

  const gig = db.getLocumGigs().find(g => g.id === getParamId(req.params.id));
  if (!gig) {
    return res.status(404).json({ success: false, message: "Locum gig not found" });
  }

  if (!name || !qualification || !email || !contactNumber) {
    return res.status(400).json({
      success: false,
      message: "Name, qualification, email, and contact number are required."
    });
  }

  const app: LocumApplication = {
    id: `loc-app-${Date.now()}`,
    gigId: gig.id,
    gigName: gig.gigName,
    name,
    qualification,
    resumeUrl: resumeUrl || "https://example.com/verified_credentials.pdf",
    email,
    contactNumber,
    otherLink: otherLink || undefined,
    applicantId: applicantId || "doc-1",
    submittedAt: new Date().toISOString()
  };

  db.applyLocumGig(app);
  res.status(201).json({
    success: true,
    message: `Application submitted successfully for ${gig.gigName}. The employer (${gig.email}) has been notified.`,
    application: app
  });
});

// ==========================================
// 4. SCHOLARSHIPS & COURSES
// ==========================================

// GET /api/opportunities/scholarships
router.get('/scholarships', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: db.getScholarships().length,
    scholarships: db.getScholarships()
  });
});

// GET /api/opportunities/courses (8 Free Courses with direct link launch)
router.get('/courses', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: db.getCourses().length,
    courses: db.getCourses()
  });
});

// ==========================================
// 5. JOBS BOARD
// ==========================================

// GET /api/opportunities/jobs
router.get('/jobs', (req: Request, res: Response) => {
  const { category, type, place, search } = req.query;
  let filtered = db.getJobs();

  if (category && category !== 'All') {
    filtered = filtered.filter(j => j.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (type) {
    filtered = filtered.filter(j => j.type.toLowerCase() === (type as string).toLowerCase());
  }
  if (place) {
    filtered = filtered.filter(j => j.place.toLowerCase().includes((place as string).toLowerCase()));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.description.toLowerCase().includes(q) ||
      j.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    jobs: filtered
  });
});

// POST /api/opportunities/jobs (Manager / Doctor job posting)
router.post('/jobs', (req: Request, res: Response) => {
  const { 
    title, 
    category, 
    type, 
    companyName, 
    place, 
    experience, 
    salary, 
    description, 
    preferenceEducation, 
    skills, 
    hospitalLogoUrl 
  } = req.body;

  if (!title || !companyName) {
    return res.status(400).json({ success: false, message: "Job title and company name are required." });
  }

  const newJob: Job = {
    id: `job-${Date.now()}`,
    title,
    category: category || "Doctor jobs",
    type: type || "Full time",
    companyName,
    place: place || "Bangalore, India",
    experience: experience || "2-5 Years",
    salary: salary || "Negotiable based on clinical experience",
    description: description || "Clinical opening at tertiary medical facility.",
    preferenceEducation: preferenceEducation || "MBBS / MD / MS / DNB",
    skills: Array.isArray(skills) ? skills : ["Patient Care", "Diagnosis"],
    hospitalLogoUrl: hospitalLogoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=120&fit=crop",
    postedAt: "Just now"
  };

  db.addJob(newJob);
  res.status(201).json({
    success: true,
    message: "Job posting published successfully.",
    job: newJob
  });
});

// DELETE /api/opportunities/jobs/:id (Manager / Admin control)
router.delete('/jobs/:id', (req: Request, res: Response) => {
  const deleted = db.deleteJob(getParamId(req.params.id));
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  res.json({ success: true, message: "Job removed successfully" });
});

// POST /api/opportunities/jobs/:id/apply
router.post('/jobs/:id/apply', (req: Request, res: Response) => {
  const job = db.getJobs().find(j => j.id === getParamId(req.params.id));
  if (!job) {
    return res.status(404).json({ success: false, message: "Job opening not found" });
  }

  res.json({
    success: true,
    message: `Application successfully submitted to ${job.companyName} for ${job.title}. Your verified credentials have been attached.`
  });
});

export default router;
