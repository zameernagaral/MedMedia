import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';

const router = Router();

// GET /api/users/:id - Profile data (with private account masking)
router.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const viewerId = req.query.viewerId as string | undefined;
  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const isSelf = viewerId === user.id;
  const isPrivate = Boolean(user.isPrivate);

  // If private and not self, check if viewer is following
  // For demo/sim, if not self and private, we can flag isMasked
  const userPosts = isPrivate && !isSelf ? [] : db.getPosts().filter(p => p.authorId === user.id);

  res.json({
    success: true,
    user,
    posts: userPosts,
    isMasked: isPrivate && !isSelf
  });
});

// PUT /api/users/:id - Update profile details (cover photo, bio, privacy, etc.)
router.put('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { 
    fullName, 
    bio, 
    coverPhotoUrl, 
    avatarUrl, 
    isPrivate, 
    badgeTitle, 
    doctorDetails, 
    studentDetails 
  } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (coverPhotoUrl !== undefined) user.coverPhotoUrl = coverPhotoUrl;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (isPrivate !== undefined) user.isPrivate = Boolean(isPrivate);
  if (badgeTitle !== undefined) user.badgeTitle = badgeTitle;
  if (doctorDetails !== undefined) user.doctorDetails = { ...user.doctorDetails, ...doctorDetails };
  if (studentDetails !== undefined) user.studentDetails = { ...user.studentDetails, ...studentDetails };

  db.addUser(user);
  res.json({ success: true, message: "Profile updated successfully", user });
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
    // connect action (fallback to followers/following model)
    user.stats.followersCount = (user.stats.followersCount || 0) + 1;
    db.addUser(user);
    return res.json({ success: true, message: `Connection request sent to ${user.fullName}`, followersCount: user.stats.followersCount });
  }
});

// GET /api/users - List doctors and students
router.get('/', (req: Request, res: Response) => {
  const { role } = req.query;
  const list = db.getUsers(role as string | undefined);
  res.json({ success: true, users: list });
});

export default router;
