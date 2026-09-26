import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').toLowerCase().trim();
    const category = (req.query.category as string || 'Accounts').toLowerCase();

    const results: any = {
      accounts: [], communities: [], associations: [], posts: [], jobOffers: [], hospitals: [], networkingSuggestions: []
    };

    results.networkingSuggestions = await prisma.user.findMany({ take: 5 });

    if (category === 'all' || category === 'accounts' || category === 'all accounts') {
      results.accounts = await prisma.user.findMany({
        where: { OR: [{ fullName: { contains: q } }, { username: { contains: q } }] }
      });
    }

    if (category === 'all' || category === 'community' || category === 'communities') {
      results.communities = await prisma.community.findMany({
        where: { name: { contains: q } }
      });
    }

    if (category === 'all' || category === 'posts') {
      const posts = await prisma.post.findMany({
        where: { content: { contains: q } }, include: { user: true }
      });
      results.posts = posts.map(p => ({ id: p.id, authorName: p.user.fullName, content: p.content }));
    }

    if (category === 'all' || category === 'job offers' || category === 'jobs') {
      results.jobOffers = await prisma.job.findMany({
        where: { title: { contains: q } }
      });
    }

    res.json({ success: true, query: q, category, results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search Error' });
  }
});

export default router;
