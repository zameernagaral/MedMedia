import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { z } from 'zod';
import { createNotification } from '../services/notificationService';

const router = Router();

const createPostSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty"),
  postType: z.string().optional(),
  clinicalTags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  linkUrl: z.string().url().optional()
});

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  parentId: z.string().optional()
});

// GET /api/posts - Home Feed
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, tag, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};
    const currentUserId = (req as any).user?.userId;
    if (type) where.postType = type;
    if (tag) where.clinicalTags = { contains: tag as string };

    const postsCount = await prisma.post.count({ where });
    const prismaPosts = await prisma.post.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { include: { doctorProfile: true, studentProfile: true } },
        ...(currentUserId ? { bookmarks: { where: { userId: currentUserId }, select: { id: true } } } : {})
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
      isLiked: false,
      isSaved: currentUserId ? p.bookmarks.length > 0 : false,
      createdAt: p.createdAt.toISOString()
    }));

    res.json({ success: true, count: posts.length, totalCount: postsCount, currentPage: pageNum, totalPages: Math.ceil(postsCount / limitNum), posts });
  } catch (error) {
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
        linkUrl: validatedData.linkUrl
      },
      include: { user: { include: { doctorProfile: true, studentProfile: true } } }
    });

    res.status(201).json({ success: true, post: {
      id: newPost.id, authorId: newPost.user.id, authorName: newPost.user.fullName, 
      content: newPost.content, createdAt: newPost.createdAt.toISOString() 
    } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: (error as any).errors });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.post('/:id/like', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const updated = await prisma.post.update({ where: { id }, data: { likesCount: { increment: 1 } } });
    await createNotification({ recipientId: post.userId, actorId: (req as any).user.userId, type: 'LIKE', message: 'liked your post', entityId: id });
    res.json({ success: true, isLiked: true, likesCount: updated.likesCount });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
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
    if (comment.authorId !== user.userId && user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Forbidden' });
    await prisma.comment.delete({ where: { id: comment.id } });
    await prisma.post.update({ where: { id: comment.postId }, data: { commentsCount: { decrement: 1 } } });
    res.json({ success: true, commentId: comment.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});

router.post('/:id/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId as string;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const existing = await prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId: id } } });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      const updated = await prisma.post.update({ where: { id }, data: { savesCount: { decrement: 1 } } });
      return res.json({ success: true, isSaved: false, savesCount: Math.max(0, updated.savesCount) });
    }
    await prisma.bookmark.create({ data: { userId, postId: id } });
    const updated = await prisma.post.update({ where: { id }, data: { savesCount: { increment: 1 } } });
    res.json({ success: true, isSaved: true, savesCount: updated.savesCount });
  } catch (e) { res.status(500).json({ success: false }); }
});

router.post('/:id/bookmark', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const id = req.params.id as string;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const existing = await prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId: id } } });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      const updated = await prisma.post.update({ where: { id }, data: { savesCount: { decrement: 1 } } });
      return res.json({ success: true, isSaved: false, savesCount: Math.max(0, updated.savesCount) });
    }
    await prisma.bookmark.create({ data: { userId, postId: id } });
    const updated = await prisma.post.update({ where: { id }, data: { savesCount: { increment: 1 } } });
    res.json({ success: true, isSaved: true, savesCount: updated.savesCount });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to bookmark post' }); }
});

router.delete('/:id/bookmark', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const id = req.params.id as string;
    const bookmark = await prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId: id } } });
    if (bookmark) {
      await prisma.bookmark.delete({ where: { id: bookmark.id } });
      await prisma.post.update({ where: { id }, data: { savesCount: { decrement: 1 } } });
    }
    const post = await prisma.post.findUnique({ where: { id }, select: { savesCount: true } });
    res.json({ success: true, isSaved: false, savesCount: Math.max(0, post?.savesCount || 0) });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to remove bookmark' }); }
});

export default router;
