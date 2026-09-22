import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { Post } from '../data/mockDb';

const router = Router();

// GET /api/posts - Home Feed from persistent database
router.get('/', (req: Request, res: Response) => {
  const { type, tag } = req.query;
  const filtered = db.getPosts({
    type: type as string | undefined,
    tag: tag as string | undefined
  });

  res.json({
    success: true,
    count: filtered.length,
    posts: filtered
  });
});

// POST /api/posts - Create new post & persist to local disk
router.post('/', (req: Request, res: Response) => {
  const { 
    authorId, 
    authorName,
    authorUsername,
    authorAvatar,
    authorRole,
    authorSpecializationOrDiscipline,
    content, 
    postType, 
    clinicalTags, 
    mediaUrls, 
    linkUrl, 
    casePoll 
  } = req.body;
  
  const author = authorId ? db.getUserById(authorId) : undefined;

  const newPost: Post = {
    id: `post-${Date.now()}`,
    authorId: author?.id || authorId || "doc-1",
    authorName: author?.fullName || authorName || "Dr. Clinical Specialist",
    authorUsername: author?.username || authorUsername || "clinician_md",
    authorAvatar: author?.avatarUrl || authorAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces",
    authorRole: author?.role || authorRole || "DOCTOR",
    authorSpecializationOrDiscipline: author?.role === 'DOCTOR' 
      ? (author.doctorDetails?.specialization || authorSpecializationOrDiscipline || "General Medicine")
      : (author?.studentDetails?.discipline?.replace(/_/g, ' ') || authorSpecializationOrDiscipline || "Medical Student"),
    isVerified: author?.verificationStatus === 'VERIFIED' || true,
    postType: postType || "CLINICAL_DISCUSSION",
    content: content || "",
    clinicalTags: clinicalTags && clinicalTags.length > 0 ? clinicalTags : ["#ClinicalDiscussion"],
    mediaUrls: mediaUrls || [],
    linkUrl: linkUrl || undefined,
    casePoll: casePoll || undefined,
    likesCount: 0,
    commentsCount: 0,
    savesCount: 0,
    sharesCount: 0,
    isLiked: false,
    isSaved: false,
    createdAt: "Just now"
  };

  // Persist directly to local database file on laptop
  db.addPost(newPost);
  console.log(`[MedMedia] Created & persisted post ${newPost.id} by ${newPost.authorName} to laptop database.`);

  res.status(201).json({
    success: true,
    message: "Post created and successfully persisted to local database.",
    post: newPost
  });
});

// POST /api/posts/:id/like
router.post('/:id/like', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = db.toggleLikePost(id);
  if (!result) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  res.json({
    success: true,
    isLiked: result.isLiked,
    likesCount: result.likesCount
  });
});

// POST /api/posts/:id/save
router.post('/:id/save', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = db.toggleSavePost(id);
  if (!result) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  res.json({
    success: true,
    isSaved: result.isSaved,
    savesCount: result.savesCount
  });
});

// POST /api/posts/:id/poll
router.post('/:id/poll', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { optionId } = req.body;
  const poll = db.votePoll(id, optionId);
  if (!poll) {
    return res.status(404).json({ success: false, message: "Poll not found" });
  }

  res.json({
    success: true,
    casePoll: poll
  });
});

// DELETE /api/posts/:id - Delete a clinical post
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = db.deletePost(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({
      success: true,
      message: 'Post deleted successfully',
      id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

export default router;
