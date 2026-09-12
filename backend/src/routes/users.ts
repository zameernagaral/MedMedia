import { Router, Request, Response } from 'express';
import { USERS, POSTS } from '../data/mockDb';

const router = Router();

// GET /api/users/:id - Profile data
router.get('/:id', (req: Request, res: Response) => {
  const user = USERS.find(u => u.id === req.params.id || u.username === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const userPosts = POSTS.filter(p => p.authorId === user.id);

  res.json({
    success: true,
    user,
    posts: userPosts
  });
});

// POST /api/users/:id/connect (Slide 3 & 4: Follow | connect)
router.post('/:id/connect', (req: Request, res: Response) => {
  const { action } = req.body; // 'follow' or 'connect'
  const user = USERS.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (action === 'follow') {
    user.stats.followersCount += 1;
    return res.json({ success: true, message: `Now following ${user.fullName}`, followersCount: user.stats.followersCount });
  } else {
    user.stats.connectionsCount += 1;
    return res.json({ success: true, message: `Connection request sent to ${user.fullName}`, connectionsCount: user.stats.connectionsCount });
  }
});

// GET /api/users - List sample doctors and students
router.get('/', (req: Request, res: Response) => {
  const { role } = req.query;
  let list = [...USERS];
  if (role) {
    list = list.filter(u => u.role === (role as string).toUpperCase());
  }
  res.json({ success: true, users: list });
});

export default router;
