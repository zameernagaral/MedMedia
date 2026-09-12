import { Router, Request, Response } from 'express';
import { JOBS, OPPORTUNITIES, Job, OpportunityItem } from '../data/mockDb';

const router = Router();

// GET /api/opportunities/hub (Slide 8: Research, Freelancing, Community, Courses, Events)
router.get('/hub', (req: Request, res: Response) => {
  const { type } = req.query; // 'RESEARCH' | 'FREELANCE' | 'COMMUNITY' | 'EVENT' | 'COURSE'
  let list = [...OPPORTUNITIES];

  if (type) {
    list = list.filter(o => o.type === type);
  }

  res.json({
    success: true,
    count: list.length,
    opportunities: list
  });
});

// GET /api/opportunities/jobs (Slide 9: Jobs Board with preferences & filters)
router.get('/jobs', (req: Request, res: Response) => {
  const { category, type, place, company, search } = req.query;
  let filtered = [...JOBS];

  if (category) {
    filtered = filtered.filter(j => j.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (type) {
    filtered = filtered.filter(j => j.type.toLowerCase() === (type as string).toLowerCase());
  }
  if (place) {
    filtered = filtered.filter(j => j.place.toLowerCase().includes((place as string).toLowerCase()));
  }
  if (company) {
    filtered = filtered.filter(j => j.companyName.toLowerCase().includes((company as string).toLowerCase()));
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

// GET /api/opportunities/jobs/:id (Slide 9: Job detail modal / overview)
router.get('/jobs/:id', (req: Request, res: Response) => {
  const job = JOBS.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: "Job opening not found" });
  }
  res.json({ success: true, job });
});

// POST /api/opportunities/jobs/:id/apply
router.post('/jobs/:id/apply', (req: Request, res: Response) => {
  const { applicantId, coverNote } = req.body;
  const job = JOBS.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: "Job opening not found" });
  }

  res.json({
    success: true,
    message: `Application successfully submitted to ${job.companyName} for the position of ${job.title}. Your verified credentials have been attached.`
  });
});

// POST /api/opportunities/research/create (Slide 8: add Research / calls)
router.post('/research', (req: Request, res: Response) => {
  const { title, subtitle, description, tags, organizerOrAffiliation } = req.body;
  const newOpp: OpportunityItem = {
    id: `opp-${Date.now()}`,
    type: "RESEARCH",
    title,
    subtitle: subtitle || "Collaboration Call",
    description,
    tags: tags || ["#MedicalResearch"],
    organizerOrAffiliation: organizerOrAffiliation || "Independent Medical Investigator",
    actionLabel: "Join Research Project"
  };

  OPPORTUNITIES.unshift(newOpp);
  res.status(201).json({ success: true, opportunity: newOpp });
});

// POST /api/opportunities/freelance/create (Slide 8: Post job / collaborate)
router.post('/freelance', (req: Request, res: Response) => {
  const { title, hospital, location, description, tags } = req.body;
  const newGig: OpportunityItem = {
    id: `opp-${Date.now()}`,
    type: "FREELANCE",
    title,
    subtitle: `${hospital} • Locum Gig`,
    description,
    tags: tags || ["#LocumTenens", "#DoctorFreelance"],
    organizerOrAffiliation: hospital,
    locationOrVenue: location,
    actionLabel: "Apply for Locum"
  };

  OPPORTUNITIES.unshift(newGig);
  res.status(201).json({ success: true, opportunity: newGig });
});

export default router;
