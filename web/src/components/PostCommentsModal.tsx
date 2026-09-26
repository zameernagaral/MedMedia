import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, ShieldCheck, Trash2, X } from 'lucide-react';
import { Post, UserProfile } from '../types';
import { apiService } from '../services/api';

export interface PostComment {
  id: string;
  postId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string | null;
  authorRole: string;
  isVerified: boolean;
  content: string;
  createdAt: string;
}

interface PostCommentsModalProps {
  isOpen: boolean;
  post: Post | null;
  currentUser: UserProfile;
  onClose: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  isOpen, post, currentUser, onClose, onCommentCountChange
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !post) return;
    setLoading(true);
    setError('');
    apiService.getPostComments(post.id)
      .then(data => setComments(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load comments.'))
      .finally(() => setLoading(false));
  }, [isOpen, post]);

  const topLevel = useMemo(() => comments.filter(comment => !comment.parentId), [comments]);
  const repliesFor = (commentId: string) => comments.filter(comment => comment.parentId === commentId);

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || !post || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await apiService.createPostComment(post.id, content, replyTo?.id);
      setComments(previous => [...previous, created]);
      onCommentCountChange?.(comments.length + 1);
      setText('');
      setReplyTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (comment: PostComment) => {
    if (!post || comment.authorId !== currentUser.id) return;
    try {
      await apiService.deletePostComment(post.id, comment.id);
      const removedIds = new Set([comment.id, ...repliesFor(comment.id).map(reply => reply.id)]);
      setComments(previous => previous.filter(item => !removedIds.has(item.id)));
      onCommentCountChange?.(Math.max(0, comments.length - removedIds.size));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete comment.');
    }
  };

  if (!isOpen || !post) return null;

  const renderComment = (comment: PostComment, nested = false): React.ReactNode => (
    <div key={comment.id} className={`flex gap-3 ${nested ? 'ml-10 mt-3' : ''}`}>
      <img src={comment.authorAvatar || '/medmedia-logo.png'} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
            {comment.authorName}
            {comment.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 px-2 pt-1 text-[11px] text-slate-500">
          <button type="button" onClick={() => setReplyTo(comment)} className="font-semibold hover:text-sky-600">Reply</button>
          {comment.authorId === currentUser.id && (
            <button type="button" onClick={() => deleteComment(comment)} className="hover:text-rose-600" title="Delete comment"><Trash2 className="w-3.5 h-3.5" /></button>
          )}
        </div>
        {!nested && repliesFor(comment.id).map(reply => renderComment(reply, true))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center sm:p-4">
      <div className="w-full max-w-lg max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-sky-600" /><h3 className="font-bold text-slate-900 dark:text-white">Comments ({comments.length})</h3></div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-center text-sm text-slate-500">Loading comments...</p>}
          {!loading && error && <p className="text-center text-sm text-rose-600">{error}</p>}
          {!loading && !error && topLevel.length === 0 && <p className="text-center text-sm text-slate-500 py-10">Be the first to comment.</p>}
          {!loading && topLevel.map(comment => renderComment(comment))}
        </div>
        <form onSubmit={submitComment} className="p-3 border-t border-slate-200 dark:border-slate-800">
          {replyTo && <div className="text-xs text-slate-500 mb-2">Replying to <strong>{replyTo.authorName}</strong> <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-sky-600">Cancel</button></div>}
          <div className="flex items-center gap-2">
            <img src={currentUser.avatarUrl || '/medmedia-logo.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
            <input value={text} onChange={event => setText(event.target.value)} maxLength={2000} placeholder="Add a clinical comment..." className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white" />
            <button type="submit" disabled={!text.trim() || submitting} className="p-2.5 rounded-full bg-sky-600 text-white disabled:opacity-50"><Send className="w-4 h-4" /></button>
          </div>
        </form>
      </div>
    </div>
  );
};
