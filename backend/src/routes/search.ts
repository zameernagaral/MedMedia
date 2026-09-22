import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';

const router = Router();

const ASSOCIATIONS = [
  { name: "Indian Medical Association (IMA)", regId: "IMA-HQ-1928", members: "350,000+ Doctors" },
  { name: "Cardiological Society of India (CSI)", regId: "CSI-IND-1948", members: "4,500+ Cardiologists" },
  { name: "Association of Surgeons of India (ASI)", regId: "ASI-IND-1938", members: "28,000+ Surgeons" },
  { name: "Indian Academy of Pediatrics (IAP)", regId: "IAP-IND-1963", members: "32,000+ Pediatricians" },
  { name: "Neurological Society of India (NSI)", regId: "NSI-IND-1951", members: "3,800+ Neurosurgeons" }
];

const HOSPITALS = [
  { name: "Apollo Hospitals", city: "Bangalore & Pan-India", beds: "10,000+ Beds", accreditations: "JCI & NABH" },
  { name: "All India Institute of Medical Sciences (AIIMS)", city: "New Delhi", beds: "2,500+ Beds", accreditations: "Apex Medical Institute" },
  { name: "Manipal Hospital", city: "Bangalore", beds: "600+ Beds", accreditations: "NABH & NABL" },
  { name: "Fortis Memorial Research Institute", city: "Gurgaon / Delhi NCR", beds: "1,000+ Beds", accreditations: "JCI & NABH" },
  { name: "Tata Memorial Centre", city: "Mumbai", beds: "700+ Beds", accreditations: "National Cancer Centre" }
];

// GET /api/search (Search across Accounts, Communities, Associations, Posts, Jobs, Hospitals)
router.get('/', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  const category = (req.query.category as string || 'Accounts').toLowerCase();

  const results: any = {
    accounts: [],
    communities: [],
    associations: [],
    posts: [],
    jobOffers: [],
    hospitals: [],
    networkingSuggestions: db.getUsers().slice(0, 5)
  };

  // Search Accounts (Requirement 10: All Accounts default)
  if (category === 'all' || category === 'accounts' || category === 'all accounts') {
    results.accounts = db.getUsers().filter(a => 
      !q || (a.fullName && a.fullName.toLowerCase().includes(q)) || 
      (a.username && a.username.toLowerCase().includes(q)) || 
      (a.bio && a.bio.toLowerCase().includes(q)) ||
      (a.badgeTitle && a.badgeTitle.toLowerCase().includes(q)) ||
      (a.doctorDetails?.specialization && a.doctorDetails.specialization.toLowerCase().includes(q))
    );
  }

  // Search Communities
  if (category === 'all' || category === 'community' || category === 'communities') {
    results.communities = db.getCommunities().filter(c => 
      !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }

  // Search Associations
  if (category === 'all' || category === 'associations') {
    results.associations = ASSOCIATIONS.filter(ass => 
      !q || ass.name.toLowerCase().includes(q) || ass.regId.toLowerCase().includes(q)
    );
  }

  // Search Posts
  if (category === 'all' || category === 'posts') {
    results.posts = db.getPosts().filter(p => 
      !q || (p.content && p.content.toLowerCase().includes(q)) || 
      (p.clinicalTags && p.clinicalTags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // Search Job Offers
  if (category === 'all' || category === 'job offers' || category === 'jobs') {
    results.jobOffers = db.getJobs().filter(j => 
      !q || (j.title && j.title.toLowerCase().includes(q)) || 
      (j.companyName && j.companyName.toLowerCase().includes(q)) || 
      (j.place && j.place.toLowerCase().includes(q))
    );
  }

  // Search Hospitals
  if (category === 'all' || category === 'hospital' || category === 'hospitals') {
    results.hospitals = HOSPITALS.filter(h => 
      !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    query: q,
    category,
    results
  });
});

export default router;
