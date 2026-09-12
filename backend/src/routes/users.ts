import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';

const router = Router();

// GET /api/users/:id - Profile data
router.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const userPosts = db.getPosts().filter(p => p.authorId === user.id);

  res.json({
    success: true,
    user,
    posts: userPosts
  });
});

// POST /api/users/:id/connect
router.post('/:id/connect', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { action } = req.body; // 'follow' or 'connect'
  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (action === 'follow') {
    user.stats.followersCount = (user.stats.followersCount || 0) + 1;
    db.addUser(user);
    return res.json({ success: true, message: `Now following ${user.fullName}`, followersCount: user.stats.followersCount });
  } else {
    user.stats.connectionsCount = (user.stats.connectionsCount || 0) + 1;
    db.addUser(user);
    return res.json({ success: true, message: `Connection request sent to ${user.fullName}`, connectionsCount: user.stats.connectionsCount });
  }
});

// GET /api/users - List doctors and students
router.get('/', (req: Request, res: Response) => {
  const { role } = req.query;
  const list = db.getUsers(role as string | undefined);
  res.json({ success: true, users: list });
});

export default router;
