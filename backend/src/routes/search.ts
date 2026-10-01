import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { z } from 'zod';

const router = Router();
const publicUserSelect = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
  role: true,
  verificationStatus: true
};
const searchQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
  category: z.string().trim().min(1).max(50).default('Accounts')
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q: query, category: rawCategory } = searchQuerySchema.parse(req.query);
    const q = query.toLowerCase();
    const category = rawCategory.toLowerCase();
    const userWhere = q ? { OR: [{ fullName: { contains: q } }, { username: { contains: q } }] } : {};
    const contentWhere = q ? { contains: q } : undefined;

    const results: any = {
      accounts: [], communities: [], associations: [], posts: [], jobOffers: [], hospitals: [], networkingSuggestions: []
    };

    results.networkingSuggestions = await prisma.user.findMany({ where: { isPrivate: false }, take: 5, select: publicUserSelect });

    if (category === 'all' || category === 'accounts' || category === 'all accounts') {
      results.accounts = await prisma.user.findMany({
        where: { ...userWhere, isPrivate: false },
        select: publicUserSelect
        ,take: 25
      });
    }

    if (category === 'all' || category === 'community' || category === 'communities') {
      results.communities = await prisma.community.findMany({
        where: q ? { name: { contains: q } } : {},
        take: 25
      });
    }

    if (category === 'all' || category === 'posts') {
      const posts = await prisma.post.findMany({
        where: { ...(contentWhere ? { content: contentWhere } : {}), user: { isPrivate: false } },
        include: { user: { select: publicUserSelect } },
        take: 25
      });
      results.posts = posts.map(p => ({ id: p.id, authorName: p.user.fullName, content: p.content }));
    }

    if (category === 'all' || category === 'job offers' || category === 'jobs') {
      results.jobOffers = await prisma.job.findMany({
        where: q ? { title: { contains: q } } : {},
        take: 25
      });
    }

    res.json({ success: true, query: q, category, results });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

export default router;
