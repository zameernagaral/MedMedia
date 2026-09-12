import { Router, Request, Response } from 'express';
import { POSTS, STORIES, Post } from '../data/mockDb';

const router = Router();

// GET /api/posts - Home Feed (Slide 5: Text, tweets, Images, Links, Discussions - NO reels)
router.get('/', (req: Request, res: Response) => {
  const { type, tag } = req.query;
  let filtered = [...POSTS];

  if (type) {
    filtered = filtered.filter(p => p.postType === type);
  }
  if (tag) {
    filtered = filtered.filter(p => p.clinicalTags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
  }

  res.json({
    success: true,
    count: filtered.length,
    posts: filtered
  });
});

// GET /api/posts/stories - Accessory Feature: Story Updates (Slide 5)
router.get('/stories', (req: Request, res: Response) => {
  res.json({
    success: true,
    stories: STORIES
  });
});

// POST /api/posts - Create new post (+ button)
router.post('/', (req: Request, res: Response) => {
  const { authorId, content, postType, clinicalTags, mediaUrls, linkUrl, casePoll } = req.body;
  
  const newPost: Post = {
    id: `post-${Date.now()}`,
    authorId: authorId || "doc-1",
    authorName: "Dr. Arvind Ramesh, MD, DM",
    authorUsername: "cardio_ramesh",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces",
    authorRole: "DOCTOR",
    authorSpecializationOrDiscipline: "Interventional Cardiology",
    isVerified: true,
    postType: postType || "CLINICAL_DISCUSSION",
    content: content || "",
    clinicalTags: clinicalTags || ["#ClinicalDiscussion"],
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

  POSTS.unshift(newPost);

  res.status(201).json({
    success: true,
    post: newPost
  });
});

// POST /api/posts/:id/like (Slide 7: Like/comment/save/share)
router.post('/:id/like', (req: Request, res: Response) => {
  const post = POSTS.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  post.isLiked = !post.isLiked;
  post.likesCount += post.isLiked ? 1 : -1;

  res.json({
    success: true,
    isLiked: post.isLiked,
    likesCount: post.likesCount
  });
});

// POST /api/posts/:id/save
router.post('/:id/save', (req: Request, res: Response) => {
  const post = POSTS.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  post.isSaved = !post.isSaved;
  post.savesCount += post.isSaved ? 1 : -1;

  res.json({
    success: true,
    isSaved: post.isSaved,
    savesCount: post.savesCount
  });
});

// POST /api/posts/:id/poll
router.post('/:id/poll', (req: Request, res: Response) => {
  const { optionId } = req.body;
  const post = POSTS.find(p => p.id === req.params.id);
  if (!post || !post.casePoll) {
    return res.status(404).json({ success: false, message: "Poll not found" });
  }

  const option = post.casePoll.options.find(o => o.id === optionId);
  if (option) {
    option.votes += 1;
    post.casePoll.totalVotes += 1;
    post.casePoll.userVotedOptionId = optionId;
  }

  res.json({
    success: true,
    casePoll: post.casePoll
  });
});

export default router;
