import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  CornerDownRight, 
  ShieldCheck, 
  Stethoscope, 
  GraduationCap, 
  MessageCircle, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Post, UserProfile } from '../types';

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: 'DOCTOR' | 'STUDENT';
  isVerified: boolean;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  isLikedByAuthor?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: 'DOCTOR' | 'STUDENT';
  isVerified: boolean;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  isLikedByAuthor?: boolean;
  replies: CommentReply[];
}

interface PostCommentsModalProps {
  isOpen: boolean;
  post: Post | null;
  currentUser: UserProfile;
  onClose: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

// Initial clinical peer comments with author-like badge & replies
const INITIAL_DEMO_COMMENTS: Record<string, PostComment[]> = {
  'default': [
    {
      id: 'c-1',
      postId: 'default',
      authorId: 'doc-2',
      authorName: 'Dr. Priya Nair, MS, MCh',
      authorUsername: 'neuro_priya',
      authorAvatar: 'https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop&crop=faces',
      authorRole: 'DOCTOR',
      isVerified: true,
      content: 'Excellent clinical presentation. In our tertiary neuro/cath center, immediate Heparin 5000 IU IV and sublingual nitroglycerin are prioritized before immediate wire crossing.',
      createdAt: '1h ago',
      likesCount: 18,
      isLiked: false,
      isLikedByAuthor: true, // "Liked by author" badge!
      replies: [
        {
          id: 'r-1-1',
          authorId: 'stu-1',
          authorName: 'Rohan Verma',
          authorUsername: 'medical student',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
          authorRole: 'STUDENT',
          isVerified: true,
          content: 'Ma’am, should we avoid nitrates if right ventricular infarction is suspected on V4R lead?',
          createdAt: '45m ago',
          likesCount: 6,
          isLiked: true,
          isLikedByAuthor: true
        },
        {
          id: 'r-1-2',
          authorId: 'doc-2',
          authorName: 'Dr. Priya Nair, MS, MCh',
          authorUsername: 'neuro_priya',
          authorAvatar: 'https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop&crop=faces',
          authorRole: 'DOCTOR',
          isVerified: true,
          content: 'Precisely! Right-sided ventricular involvement causes severe preload dependency, so nitrates are contraindicated.',
          createdAt: '20m ago',
          likesCount: 9,
          isLiked: false,
          isLikedByAuthor: false
        }
      ]
    },
    {
      id: 'c-2',
      postId: 'default',
      authorId: 'stu-2',
      authorName: 'Ananya Desai',
      authorUsername: 'B parm',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
      authorRole: 'STUDENT',
      isVerified: true,
      content: 'From a pharmacology perspective, remember the loading dose of Ticagrelor 180 mg or Clopidogrel 600 mg prior to PCI!',
      createdAt: '35m ago',
      likesCount: 11,
      isLiked: false,
      isLikedByAuthor: true,
      replies: []
    }
  ]
};

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  isOpen,
  post,
  currentUser,
  onClose,
  onCommentCountChange
}) => {
  if (!isOpen || !post) return null;

  const isPostAuthor = currentUser.id === post.authorId;

  const [comments, setComments] = useState<PostComment[]>(() => {
    return INITIAL_DEMO_COMMENTS[post.id] || INITIAL_DEMO_COMMENTS['default'];
  });

  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; username: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({ 'c-1': true });

  const toggleRepliesExpanded = (commentId: string) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Like a comment (toggles author-like if currentUser is post author)
  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const nextLiked = !c.isLiked;
        return {
          ...c,
          isLiked: nextLiked,
          likesCount: c.likesCount + (nextLiked ? 1 : -1),
          // If post author clicks heart, toggle isLikedByAuthor!
          isLikedByAuthor: isPostAuthor ? !c.isLikedByAuthor : c.isLikedByAuthor
        };
      }
      return c;
    }));
  };

  // Like a nested reply
  const handleLikeReply = (commentId: string, replyId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: c.replies.map(r => {
            if (r.id === replyId) {
              const nextLiked = !r.isLiked;
              return {
                ...r,
                isLiked: nextLiked,
                likesCount: r.likesCount + (nextLiked ? 1 : -1),
                isLikedByAuthor: isPostAuthor ? !r.isLikedByAuthor : r.isLikedByAuthor
              };
            }
            return r;
          })
        };
      }
      return c;
    }));
  };

  // Submit comment or reply
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (replyingTo) {
      // Adding a nested reply
      const newReply: CommentReply = {
        id: `reply-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatarUrl,
        authorRole: currentUser.role,
        isVerified: currentUser.verificationStatus === 'VERIFIED',
        content: newCommentText.trim(),
        createdAt: 'Just now',
        likesCount: 0,
        isLiked: false,
        isLikedByAuthor: isPostAuthor
      };

      setComments(prev => prev.map(c => {
        if (c.id === replyingTo.commentId) {
          return {
            ...c,
            replies: [...c.replies, newReply]
          };
        }
        return c;
      }));

      // Automatically expand replies for this comment
      setExpandedReplies(prev => ({ ...prev, [replyingTo.commentId]: true }));
      setReplyingTo(null);
    } else {
      // Adding a top-level comment
      const newComment: PostComment = {
        id: `comment-${Date.now()}`,
        postId: post.id,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatarUrl,
        authorRole: currentUser.role,
        isVerified: currentUser.verificationStatus === 'VERIFIED',
        content: newCommentText.trim(),
        createdAt: 'Just now',
        likesCount: 0,
        isLiked: false,
        isLikedByAuthor: isPostAuthor,
        replies: []
      };

      const updated = [newComment, ...comments];
      setComments(updated);
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
    }

    setNewCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[82vh] overflow-hidden">
        
        {/* Modal Top Handle / Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Medical Discussion ({comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0)})
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Post by <span className="font-semibold text-slate-700 dark:text-slate-300">{post.authorName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Summary Preview */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <img
            src={post.authorAvatar}
            alt=""
            className="w-8 h-8 rounded-full object-cover ring-1 ring-sky-500/40 mt-0.5"
          />
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              {post.authorName}
              {post.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline" />}
            </p>
            <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>

        {/* Comments & Replies List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.map((comment) => {
            const hasReplies = comment.replies && comment.replies.length > 0;
            const isExpanded = !!expandedReplies[comment.id];

            return (
              <div key={comment.id} className="space-y-2">
                {/* Main Comment */}
                <div className="flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-3 flex-1">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {comment.authorName}
                        </span>
                        {comment.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline" />
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          • {comment.createdAt}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                        {comment.content}
                      </p>

                      {/* Author Like Badge (Instagram-style "Liked by author") */}
                      {comment.isLikedByAuthor && (
                        <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>Liked by author</span>
                          <span className="text-slate-400 font-normal">(@{post.authorUsername})</span>
                        </div>
                      )}

                      {/* Comment Action Sub-row: Reply, Likes count */}
                      <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {comment.likesCount > 0 && (
                          <span>{comment.likesCount} {comment.likesCount === 1 ? 'like' : 'likes'}</span>
                        )}
                        <button
                          onClick={() => setReplyingTo({ commentId: comment.id, username: comment.authorUsername })}
                          className="hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer"
                        >
                          Reply
                        </button>
                        {isPostAuthor && !comment.isLikedByAuthor && (
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                            title="Click to give Author Like"
                          >
                            Give Author Like
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comment Heart / Like Button */}
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title={isPostAuthor ? 'Like as author' : 'Like comment'}
                  >
                    <Heart
                      className={`w-4 h-4 transition ${
                        comment.isLiked || comment.isLikedByAuthor
                          ? 'fill-rose-500 text-rose-500 scale-110'
                          : 'hover:text-rose-500'
                      }`}
                    />
                  </button>
                </div>

                {/* Unlimited Nested Replies Section */}
                {hasReplies && (
                  <div className="pl-11">
                    {/* Expand/Collapse Toggle Button */}
                    <button
                      onClick={() => toggleRepliesExpanded(comment.id)}
                      className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1.5 cursor-pointer mb-2"
                    >
                      <div className="w-6 h-px bg-slate-300 dark:bg-slate-700"></div>
                      <span>
                        {isExpanded ? 'Hide replies' : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Replies List */}
                    {isExpanded && (
                      <div className="space-y-3 border-l-2 border-slate-100 dark:border-slate-800 pl-3 pt-1">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start justify-between gap-2 group">
                            <div className="flex items-start gap-2.5 flex-1">
                              <img
                                src={reply.authorAvatar}
                                alt={reply.authorName}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {reply.authorName}
                                  </span>
                                  {reply.isVerified && (
                                    <ShieldCheck className="w-3 h-3 text-sky-600 inline" />
                                  )}
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    • {reply.createdAt}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                                  {reply.content}
                                </p>

                                {reply.isLikedByAuthor && (
                                  <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[9px] font-bold text-rose-600 dark:text-rose-400">
                                    <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                                    <span>Liked by author</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-slate-400">
                                  {reply.likesCount > 0 && <span>{reply.likesCount} likes</span>}
                                  <button
                                    onClick={() => setReplyingTo({ commentId: comment.id, username: reply.authorUsername })}
                                    className="hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleLikeReply(comment.id, reply.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 transition ${
                                  reply.isLiked || reply.isLikedByAuthor
                                    ? 'fill-rose-500 text-rose-500'
                                    : 'hover:text-rose-500'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Replying Banner */}
        {replyingTo && (
          <div className="px-4 py-1.5 bg-sky-50 dark:bg-sky-950/60 border-t border-sky-100 dark:border-sky-900/40 flex items-center justify-between text-xs text-sky-700 dark:text-sky-300">
            <span className="flex items-center gap-1 font-medium">
              <CornerDownRight className="w-3.5 h-3.5" /> Replying to @{replyingTo.username}...
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="font-bold hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 sticky bottom-0">
          <img
            src={currentUser.avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <input
            type="text"
            required
            placeholder={
              replyingTo
                ? `Write a reply to @${replyingTo.username}...`
                : `Add clinical comment for ${post.authorName.split(' ')[0]}...`
            }
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-transparent focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="p-2.5 rounded-full bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white transition cursor-pointer"
            title="Post Comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
