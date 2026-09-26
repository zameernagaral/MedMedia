import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { Medclip, MedclipComment } from '../data/mockDb';

const router = Router();

// GET /api/clips (Filter by category/type)
router.get('/', (req: Request, res: Response) => {
  const { category, clipType } = req.query;
  let clips = db.getClips();

  if (clipType) {
    clips = clips.filter(c => 
      c.clipType?.toLowerCase() === (clipType as string).toLowerCase() ||
      c.clinicalCategory?.toLowerCase() === (clipType as string).toLowerCase()
    );
  } else if (category) {
    clips = clips.filter(c => c.clinicalCategory.toLowerCase() === (category as string).toLowerCase());
  }

  res.json({ success: true, count: clips.length, clips });
});

// GET /api/clips/:id — single clip
router.get('/:id', (req: Request, res: Response) => {
  const clip = db.getClips().find(c => c.id === req.params.id);
  if (!clip) return res.status(404).json({ success: false, message: 'Medclip not found' });
  res.json({ success: true, clip });
});

// POST /api/clips — Create/upload a MedClip
router.post('/', (req: Request, res: Response) => {
  const {
    authorId,
    authorName,
    authorSpecialty,
    authorAvatar,
    isVerified,
    videoUrl,
    thumbnailUrl,
    caption,
    clipType, // 'Clinical Update' | 'Social Update'
    tags
  } = req.body;

  if (!caption || !clipType) {
    return res.status(400).json({
      success: false,
      message: 'Caption and clipType (Clinical Update / Social Update) are required.'
    });
  }

  if (!['Clinical Update', 'Social Update'].includes(clipType)) {
    return res.status(400).json({
      success: false,
      message: 'clipType must be either "Clinical Update" or "Social Update".'
    });
  }

  const newClip: Medclip = {
    id: `clip-${Date.now()}`,
    authorId: authorId || 'doc-1',
    authorName: authorName || 'Dr. Clinician',
    authorSpecialty: authorSpecialty || 'General Medicine',
    authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
    isVerified: Boolean(isVerified),
    videoUrl: videoUrl || '',
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=900&fit=crop',
    caption,
    clipType, // Stored in DB
    clinicalCategory: clipType, // mirror for compatibility
    tags: Array.isArray(tags) ? tags : [],
    likesCount: 0,
    commentsCount: 0,
    savesCount: 0,
    sharesCount: 0,
    comments: [],
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    createdAt: new Date().toISOString()
  };

  db.addClip(newClip);
  res.status(201).json({ success: true, message: 'MedClip posted successfully.', clip: newClip });
});

// POST /api/clips/:id/action — Like, Save, Follow, Share
router.post('/:id/action', (req: Request, res: Response) => {
  const { action, userId } = req.body;
  const clips = db.getClips();
  const clip = clips.find(c => c.id === req.params.id);

  if (!clip) {
    return res.status(404).json({ success: false, message: 'Medclip not found' });
  }

  switch (action) {
    case 'like':
      clip.isLiked = !clip.isLiked;
      clip.likesCount = Math.max(0, clip.likesCount + (clip.isLiked ? 1 : -1));
      db.updateClip(clip);
      return res.json({ success: true, action: 'like', isLiked: clip.isLiked, likesCount: clip.likesCount });

    case 'save':
      clip.isSaved = !clip.isSaved;
      clip.savesCount = Math.max(0, clip.savesCount + (clip.isSaved ? 1 : -1));
      db.updateClip(clip);
      return res.json({ success: true, action: 'save', isSaved: clip.isSaved, savesCount: clip.savesCount });

    case 'follow':
      clip.isFollowing = !clip.isFollowing;
      db.updateClip(clip);
      return res.json({ success: true, action: 'follow', isFollowing: clip.isFollowing });

    case 'share':
      clip.sharesCount = (clip.sharesCount || 0) + 1;
      db.updateClip(clip);
      return res.json({
        success: true,
        action: 'share',
        sharesCount: clip.sharesCount,
        clipUrl: `${process.env.APP_URL || 'https://medmedia.health'}/clips/${clip.id}`
      });

    case 'report':
      return res.json({ success: true, action: 'report', message: 'Clip submitted for clinical ethics & HIPAA review.' });

    case 'interested':
      return res.json({ success: true, action: 'interested', message: "Preference updated: You'll see more clips like this." });

    default:
      return res.json({ success: true, clip });
  }
});

// POST /api/clips/:id/comments — Add a comment
router.post('/:id/comments', (req: Request, res: Response) => {
  const { userId, userName, userAvatar, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text is required.' });
  }

  const clip = db.getClips().find(c => c.id === req.params.id);
  if (!clip) return res.status(404).json({ success: false, message: 'Medclip not found' });

  const comment: MedclipComment = {
    id: `cmt-${Date.now()}`,
    userId: userId || 'doc-1',
    userName: userName || 'Healthcare Professional',
    userAvatar: userAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  if (!clip.comments) clip.comments = [];
  clip.comments.push(comment);
  clip.commentsCount = clip.comments.length;
  db.updateClip(clip);

  res.status(201).json({ success: true, comment, commentsCount: clip.commentsCount });
});

// GET /api/clips/:id/comments
router.get('/:id/comments', (req: Request, res: Response) => {
  const clip = db.getClips().find(c => c.id === req.params.id);
  if (!clip) return res.status(404).json({ success: false, message: 'Medclip not found' });
  res.json({ success: true, comments: clip.comments || [], commentsCount: clip.commentsCount });
});

export default router;
