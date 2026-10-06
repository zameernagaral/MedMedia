import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware';
import { isAdminAccount } from '../middleware/role';
import { z } from 'zod';
import { createNotification } from '../services/notificationService';

const router = Router();

const createPostSchema = z.object({
  content: z.string().trim().min(1, "Post content cannot be empty").max(10000),
  postType: z.string().trim().max(50).optional(),
  clinicalTags: z.array(z.string().trim().max(100)).max(50).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  linkUrl: z.string().url().optional(),
  casePoll: z.object({
    question: z.string().trim().min(1).max(500),
    options: z.array(z.object({
      id: z.string().max(100),
      text: z.string().trim().min(1).max(300),
      votes: z.number().int().min(0).default(0)
    })).min(2).max(8),
    totalVotes: z.number().int().min(0).default(0),
    userVotedOptionId: z.string().max(100).optional()
  }).optional()
});

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  parentId: z.string().uuid().optional()
});

const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  type: z.string().trim().min(1).max(50).optional(),
  tag: z.string().trim().min(1).max(100).optional()
}).strict();

const postLikeStateSchema = z.object({ isLiked: z.boolean() }).strict();
const postBookmarkStateSchema = z.object({ isSaved: z.boolean() }).strict();

async function canViewPost(postId: string, viewerId?: string): Promise<boolean | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true, user: { select: { isPrivate: true } } }
  });
  if (!post) return null;
  if (!post.user.isPrivate || post.userId === viewerId) return true;
  if (!viewerId) return false;
  return Boolean(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: post.userId } } }));
}

// GET /api/posts - Home Feed
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { type, tag, page: pageNum, limit: limitNum } = feedQuerySchema.parse(req.query);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};
    const currentUserId = (req as any).user?.userId;
    const isAdminViewer = currentUserId ? await isAdminAccount(currentUserId) : false;
    if (type) where.postType = type;
    if (tag) where.clinicalTags = { contains: tag as string };
    if (!isAdminViewer) {
      where.user = {
        OR: [
          { isPrivate: false },
          ...(currentUserId ? [
            { id: currentUserId },
            { followers: { some: { followerId: currentUserId } } }
          ] : [])
        ]
      };
    }

    const postsCount = await prisma.post.count({ where });
    const prismaPosts = await prisma.post.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { include: { doctorProfile: true, studentProfile: true } },
        ...(currentUserId ? {
          bookmarks: { where: { userId: currentUserId }, select: { id: true } },
          likes: { where: { userId: currentUserId }, select: { id: true } }
        } : {})
      }
    });

    const posts = prismaPosts.map(p => ({
      id: p.id,
      authorId: p.userId,
      authorName: p.user.fullName,
      authorUsername: p.user.username,
      authorAvatar: p.user.avatarUrl,
      authorRole: p.user.role,
      authorSpecializationOrDiscipline: p.user.role === 'DOCTOR' ? p.user.doctorProfile?.specialization : p.user.studentProfile?.discipline,
      isVerified: p.user.verificationStatus === 'VERIFIED',
      postType: p.postType,
      content: p.content,
      clinicalTags: p.clinicalTags ? JSON.parse(p.clinicalTags) : [],
      mediaUrls: p.mediaUrls ? JSON.parse(p.mediaUrls) : [],
      linkUrl: p.linkUrl,
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
      savesCount: p.savesCount,
      sharesCount: p.sharesCount,
      isLiked: currentUserId ? p.likes.length > 0 : false,
      isSaved: currentUserId ? p.bookmarks.length > 0 : false,
      createdAt: p.createdAt.toISOString()
    }));

    res.json({ success: true, count: posts.length, totalCount: postsCount, currentPage: pageNum, totalPages: Math.ceil(postsCount / limitNum), posts });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST /api/posts
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = createPostSchema.parse(req.body);
    const userId = (req as any).user.userId;

    const newPost = await prisma.post.create({
      data: {
        userId,
        postType: validatedData.postType || "TEXT",
        content: validatedData.content,
        clinicalTags: JSON.stringify(validatedData.clinicalTags || []),
        mediaUrls: JSON.stringify(validatedData.mediaUrls || []),
        linkUrl: validatedData.linkUrl,
        casePoll: validatedData.casePoll ? JSON.stringify(validatedData.casePoll) : null
      },
      include: { user: { include: { doctorProfile: true, studentProfile: true } } }
    });

    res.status(201).json({ success: true, post: {
      id: newPost.id,
      authorId: newPost.user.id,
      authorName: newPost.user.fullName,
      authorUsername: newPost.user.username,
      authorAvatar: newPost.user.avatarUrl,
      authorRole: newPost.user.role,
      authorSpecializationOrDiscipline: newPost.user.role === 'DOCTOR' ? newPost.user.doctorProfile?.specialization : newPost.user.studentProfile?.discipline,
      isVerified: newPost.user.verificationStatus === 'VERIFIED',
      postType: newPost.postType,
      content: newPost.content,
      clinicalTags: validatedData.clinicalTags || [],
      mediaUrls: validatedData.mediaUrls || [],
      linkUrl: newPost.linkUrl,
      casePoll: validatedData.casePoll,
      likesCount: newPost.likesCount,
      commentsCount: newPost.commentsCount,
      savesCount: newPost.savesCount,
      sharesCount: newPost.sharesCount,
      isLiked: false,
      isSaved: false,
      createdAt: newPost.createdAt.toISOString()
    } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: (error as any).errors });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.post('/:id/like', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId as string;
    const canView = await canViewPost(id, userId);
    if (canView === null) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'You cannot interact with this private post' });
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const requestedState = postLikeStateSchema.safeParse(req.body ?? {});
    if (Object.keys(req.body ?? {}).length > 0 && !requestedState.success) {
      return res.status(400).json({ success: false, message: 'isLiked must be a boolean' });
    }
    const result = await prisma.$transaction(async tx => {
      const existing = await tx.postLike.findUnique({ where: { userId_postId: { userId, postId: id } } });
      const isLiked = requestedState.success ? requestedState.data.isLiked : !existing;
      if (isLiked) {
        await tx.postLike.upsert({
          where: { userId_postId: { userId, postId: id } },
          create: { userId, postId: id },
          update: {}
        });
      } else if (existing) {
        await tx.postLike.delete({ where: { id: existing.id } });
      }
      const likesCount = await tx.postLike.count({ where: { postId: id } });
      await tx.post.update({ where: { id }, data: { likesCount } });
      return { isLiked, likesCount, wasCreated: isLiked && !existing };
    });
    if (result.wasCreated && post.userId !== userId) {
      await createNotification({ recipientId: post.userId, actorId: userId, type: 'LIKE', message: 'liked your post', entityId: id });
    }
    res.json({ success: true, isLiked: result.isLiked, likesCount: result.likesCount });
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to update post like' }); }
});

router.get('/:id/comments', optionalAuth, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    const canView = await canViewPost(postId, (req as any).user?.userId);
    if (canView === null) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'This post is private' });
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true, verificationStatus: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, comments: comments.map(comment => ({
      id: comment.id, postId: comment.postId, parentId: comment.parentId,
      authorId: comment.authorId, authorName: comment.author.fullName,
      authorUsername: comment.author.username, authorAvatar: comment.author.avatarUrl,
      authorRole: comment.author.role, isVerified: comment.author.verificationStatus === 'VERIFIED',
      content: comment.content, createdAt: comment.createdAt.toISOString()
    })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

router.post('/:id/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    const authorId = (req as any).user.userId as string;
    const data = createCommentSchema.parse(req.body);
    const canView = await canViewPost(postId, authorId);
    if (canView === null) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'You cannot comment on this private post' });
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, userId: true } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (data.parentId && !(await prisma.comment.findFirst({ where: { id: data.parentId, postId } }))) {
      return res.status(400).json({ success: false, message: 'Reply target not found' });
    }
    const comment = await prisma.comment.create({
      data: { postId, authorId, parentId: data.parentId, content: data.content },
      include: { author: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true, verificationStatus: true } } }
    });
    await prisma.post.update({ where: { id: postId }, data: { commentsCount: { increment: 1 } } });
    if (post.userId !== authorId) await createNotification({ recipientId: post.userId, actorId: authorId, type: 'COMMENT', message: 'commented on your post', entityId: postId });
    res.status(201).json({ success: true, comment: {
      id: comment.id, postId, parentId: comment.parentId, authorId,
      authorName: comment.author.fullName, authorUsername: comment.author.username,
      authorAvatar: comment.author.avatarUrl, authorRole: comment.author.role,
      isVerified: comment.author.verificationStatus === 'VERIFIED', content: comment.content,
      createdAt: comment.createdAt.toISOString()
    } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Failed to create comment' });
  }
});

router.delete('/:postId/comments/:commentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const comment = await prisma.comment.findFirst({ where: { id: req.params.commentId as string, postId: req.params.postId as string } });
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    const user = (req as any).user;
    if (comment.authorId !== user.userId && !(await isAdminAccount(user.userId))) return res.status(403).json({ success: false, message: 'Forbidden' });
    await prisma.comment.delete({ where: { id: comment.id } });
    await prisma.post.update({ where: { id: comment.postId }, data: { commentsCount: { decrement: 1 } } });
    res.json({ success: true, commentId: comment.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

async function updatePostBookmark(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId as string;
    const canView = await canViewPost(id, userId);
    if (canView === null) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'You cannot save this private post' });
    const requestedState = postBookmarkStateSchema.safeParse(req.body ?? {});
    if (req.method !== 'DELETE' && Object.keys(req.body ?? {}).length > 0 && !requestedState.success) {
      return res.status(400).json({ success: false, message: 'isSaved must be a boolean' });
    }
    const result = await prisma.$transaction(async tx => {
      const existing = await tx.bookmark.findUnique({ where: { userId_postId: { userId, postId: id } } });
      const isSaved = req.method === 'DELETE'
        ? false
        : requestedState.success ? requestedState.data.isSaved : !existing;
      if (isSaved) {
        await tx.bookmark.upsert({
          where: { userId_postId: { userId, postId: id } },
          create: { userId, postId: id },
          update: {}
        });
      } else if (existing) {
        await tx.bookmark.delete({ where: { id: existing.id } });
      }
      const savesCount = await tx.bookmark.count({ where: { postId: id } });
      await tx.post.update({ where: { id }, data: { savesCount } });
      return { isSaved, savesCount };
    });
    res.json({ success: true, ...result });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to update post bookmark' }); }
}

router.post('/:id/save', requireAuth, updatePostBookmark);
router.post('/:id/bookmark', requireAuth, updatePostBookmark);

router.delete('/:id/bookmark', requireAuth, async (req: Request, res: Response) => {
  await updatePostBookmark(req, res);
});

// POST /api/posts/:id/share — increment share count and return shareable URL
router.post('/:id/share', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId as string;
    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }
    const canView = await canViewPost(id, userId);
    if (canView === null) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canView) return res.status(403).json({ success: false, message: 'You cannot share this private post' });
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const updated = await prisma.$transaction(async tx => {
      await tx.postShare.create({ data: { userId, postId: id } });
      return tx.post.update({ where: { id }, data: { sharesCount: { increment: 1 } } });
    });
    res.json({ success: true, sharesCount: updated.sharesCount, shareUrl: `/#post-${id}` });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to track share' }); }
});

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId as string;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.userId !== userId && !(await isAdminAccount(userId))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await prisma.post.delete({ where: { id } });
    res.json({ success: true, postId: id });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to delete post' }); }
});

// Middleware to record a unique view per authenticated user
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    const viewerId = (req as any).user?.userId as string | undefined;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: { include: { doctorProfile: true, studentProfile: true } } }
    });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.isPrivate && post.userId !== viewerId) {
      const followsAuthor = viewerId ? await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: post.userId } }
      }) : null;
      if (!followsAuthor) return res.status(403).json({ success: false, message: 'This post is private' });
    }

    let viewsCount = post.viewsCount;
    if (viewerId) {
      const existingView = await prisma.postView.findUnique({ where: { userId_postId: { userId: viewerId, postId } } });
      if (!existingView) {
        try {
          const updatedPost = await prisma.$transaction(async tx => {
            await tx.postView.create({ data: { userId: viewerId, postId } });
            return tx.post.update({ where: { id: postId }, data: { viewsCount: { increment: 1 } } });
          });
          viewsCount = updatedPost.viewsCount;
        } catch (error) {
          if ((error as { code?: string }).code !== 'P2002') throw error;
        }
      }
    }

    const response = {
      id: post.id,
      authorId: post.userId,
      authorName: post.user.fullName,
      authorUsername: post.user.username,
      authorAvatar: post.user.avatarUrl,
      content: post.content,
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      clinicalTags: post.clinicalTags ? JSON.parse(post.clinicalTags) : [],
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      savesCount: post.savesCount,
      sharesCount: post.sharesCount,
      viewsCount,
      createdAt: post.createdAt.toISOString()
    };
    res.json({ success: true, post: response });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
});

// Owner‑only insights endpoint
router.get('/:id/insights', requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    const userId = (req as any).user.userId;
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.userId !== userId && !(await isAdminAccount(userId))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    // Gather related data
    const views = await prisma.postView.findMany({ where: { postId }, select: { userId: true, viewedAt: true } });
    const likes = await prisma.postLike.findMany({ where: { postId }, select: { userId: true } });
    const comments = await prisma.comment.findMany({ where: { postId }, select: { authorId: true, createdAt: true } });
    const saves = await prisma.bookmark.findMany({ where: { postId }, select: { userId: true } });
    const shares = await prisma.postShare.findMany({ where: { postId }, select: { userId: true } });
    res.json({
      success: true,
      insights: {
        totalViews: views.length,
        totalLikes: post.likesCount,
        totalComments: post.commentsCount,
        totalSaves: post.savesCount,
        totalShares: post.sharesCount,
        viewers: views.map(v => v.userId),
        likers: likes.map(like => like.userId),
        commenters: comments.map(c => c.authorId),
        savers: saves.map(s => s.userId),
        sharers: shares.map(share => share.userId)
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Insights error' });
  }
});

export default router;
