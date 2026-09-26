import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { Medclip } from '../data/mockDb';

const router = Router();

// GET /api/clips (Slide 6: Medclips main stream)
router.get('/', (req: Request, res: Response) => {
  const { category } = req.query; // 'social update' | 'clinical updates' | 'following'
  let clips = db.getClips();

  if (category) {
    clips = clips.filter(c => c.clinicalCategory.toLowerCase() === (category as string).toLowerCase());
  }

  res.json({
    success: true,
    count: clips.length,
    clips
  });
});

// POST /api/clips (Create new Medclip)
router.post('/', (req: Request, res: Response) => {
  const newClip = {
    id: `clip-${Date.now()}`,
    authorId: req.body.userId,
    authorName: req.body.userName,
    authorSpecialty: req.body.userSpecialty || '',
    authorAvatar: req.body.userAvatar,
    isVerified: true,
    videoUrl: req.body.mediaUrl,
    thumbnailUrl: req.body.mediaUrl,
    caption: req.body.caption,
    clinicalCategory: req.body.clinicalCategory || 'Clinical Update',
    tags: req.body.clinicalTags || [],
    likesCount: 0,
    commentsCount: 0,
    savesCount: 0,
    sharesCount: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    createdAt: 'Just now'
  };

  db.addClip(newClip);

  res.status(201).json({
    success: true,
    clip: newClip
  });
});

// POST /api/clips/:id/action (Slide 6 side actions: Like, comment, Share, Save, more)
router.post('/:id/action', (req: Request, res: Response) => {
  const { action } = req.body; // 'like' | 'save' | 'follow' | 'connect' | 'interested' | 'report'
  const clip = db.getClips().find(c => c.id === req.params.id);

  if (!clip) {
    return res.status(404).json({ success: false, message: "Medclip not found" });
  }

  switch (action) {
    case 'like':
      clip.isLiked = !clip.isLiked;
      clip.likesCount += clip.isLiked ? 1 : -1;
      db.updateClip(clip);
      return res.json({ success: true, action: 'like', isLiked: clip.isLiked, count: clip.likesCount });

    case 'save':
      clip.isSaved = !clip.isSaved;
      clip.savesCount += clip.isSaved ? 1 : -1;
      db.updateClip(clip);
      return res.json({ success: true, action: 'save', isSaved: clip.isSaved, count: clip.savesCount });

    case 'follow':
      clip.isFollowing = !clip.isFollowing;
      db.updateClip(clip);
      return res.json({ success: true, action: 'follow', isFollowing: clip.isFollowing });

    case 'connect':
      return res.json({ success: true, action: 'connect', message: `Connection request sent to ${clip.authorName}` });

    case 'interested':
      return res.json({ success: true, action: 'interested', message: "Preference updated: You'll see more clinical clips like this." });

    case 'report':
      return res.json({ success: true, action: 'report', message: "Clinical clip submitted for review by medical moderator." });

    default:
      return res.json({ success: true, clip });
  }
});

export default router;
