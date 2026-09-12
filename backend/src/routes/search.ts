import { Router, Request, Response } from 'express';
import { SEARCH_INDEX, POSTS, JOBS } from '../data/mockDb';

const router = Router();

// GET /api/search (Slide 10: Search across Accounts, Communities, Associations, Posts, Jobs, Hospitals)
router.get('/', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  const category = (req.query.category as string || 'All').toLowerCase();

  const results: any = {
    accounts: [],
    communities: [],
    associations: [],
    posts: [],
    jobOffers: [],
    hospitals: [],
    networkingSuggestions: SEARCH_INDEX.networkingSuggestions
  };

  // Search Accounts
  if (category === 'all' || category === 'accounts') {
    results.accounts = SEARCH_INDEX.accounts.filter(a => 
      !q || a.fullName.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q)
    );
  }

  // Search Communities
  if (category === 'all' || category === 'community') {
    results.communities = SEARCH_INDEX.communities.filter(c => 
      !q || c.name.toLowerCase().includes(q) || c.branch.toLowerCase().includes(q)
    );
  }

  // Search Associations
  if (category === 'all' || category === 'associations') {
    results.associations = SEARCH_INDEX.associations.filter(ass => 
      !q || ass.name.toLowerCase().includes(q) || ass.regId.toLowerCase().includes(q)
    );
  }

  // Search Posts
  if (category === 'all' || category === 'posts') {
    results.posts = POSTS.filter(p => 
      !q || p.content.toLowerCase().includes(q) || p.clinicalTags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Search Job Offers
  if (category === 'all' || category === 'job offers' || category === 'jobs') {
    results.jobOffers = JOBS.filter(j => 
      !q || j.title.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q) || j.place.toLowerCase().includes(q)
    );
  }

  // Search Hospitals
  if (category === 'all' || category === 'hospital' || category === 'hospitals') {
    results.hospitals = SEARCH_INDEX.hospitals.filter(h => 
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
