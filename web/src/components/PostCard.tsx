import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  MoreHorizontal, 
  ShieldCheck, 
  GraduationCap, 
  Stethoscope, 
  ExternalLink, 
  UserPlus, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Flag,
  Sparkles
} from 'lucide-react';
import { Post, UserProfile } from '../types';

interface PostCardProps {
  post: Post;
  currentUser: UserProfile;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onVotePoll?: (postId: string, optionId: string) => void;
  onConnectAuthor?: (authorId: string) => void;
  onSelectUser?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onSave,
  onVotePoll,
  onConnectAuthor,
  onSelectUser
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<string[]>([
    "Agree with RCA involvement. Given the complete heart block, pacing readiness is paramount.",
    "Excellent teaching case. Thank you for sharing the clear reciprocal lead changes!"
  ]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments([...comments, commentInput.trim()]);
    setCommentInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://medmedia.health/posts/${post.id}`);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowMoreMenu(false);
    }, 1500);
  };

  return (
    <article className="bg-white border border-slate-200/90 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition duration-200">
      
      {/* Algorithmic Reason Pill */}
      {(post as any).matchReasonBadge && (
        <div className="mx-4 mt-3 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-100/90 rounded-xl text-[11px] text-sky-900 font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span>{(post as any).matchReasonBadge}</span>
          </div>
          {(post as any).algorithmScore && (
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded">
              {(post as any).algorithmScore}% match
            </span>
          )}
        </div>
      )}

      {/* 1. Header: Name / Follow (Slide 7: Copy instagram feature) */}
      <div className="p-4 flex items-center justify-between">
        <div 
          onClick={() => onSelectUser && onSelectUser(post.authorId)}
          className="flex items-center gap-3 cursor-pointer group"
          title={`View ${post.authorName}'s full medical portfolio`}
        >
          <div className="relative">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-sky-400 transition"
            />
            <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${
              post.authorRole === 'DOCTOR' ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {post.authorRole === 'DOCTOR' ? (
                <Stethoscope className="w-2.5 h-2.5" />
              ) : (
                <GraduationCap className="w-2.5 h-2.5" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
                {post.authorName}
              </h3>
              {post.isVerified && (
                <span title="Verified Medical Practitioner" className="inline-flex items-center">
                  <ShieldCheck className="w-4 h-4 text-sky-600 inline" />
                </span>
              )}
              {post.authorIsProfessor && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Professor
                </span>
              )}
              <span className="text-xs text-slate-400">• {post.createdAt}</span>
            </div>
            
            <p className="text-xs text-slate-500 font-medium">
              @{post.authorUsername} • <span className="text-slate-600">{post.authorSpecializationOrDiscipline}</span>
            </p>
          </div>
        </div>

        {/* Follow / Connect Button & More Options Menu (Slide 7) */}
        <div className="flex items-center gap-2">
          {post.authorId !== currentUser.id && (
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
                isFollowing
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="More Actions"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Slide 6 & 7 "More" Popover Menu */}
            {showMoreMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </button>
                {onConnectAuthor && (
                  <button
                    onClick={() => {
                      onConnectAuthor(post.authorId);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-sky-600" />
                    Connect Professionally
                  </button>
                )}
                <button
                  onClick={() => {
                    alert("Marked as interested. Your clinical feed algorithm has been prioritized.");
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Interested in Topic
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    alert("Clinical case submitted to MedMedia ethical moderation board.");
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Flag className="w-4 h-4 text-rose-500" />
                  Report Case / HIPAA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Body (Slide 5: Text, tweets, Images, Links, Discussions) */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal">
          {post.content}
        </p>

        {/* Clinical Tags */}
        {post.clinicalTags && post.clinicalTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.clinicalTags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 cursor-pointer transition"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Case Poll / Diagnostic Discussion Widget */}
      {post.casePoll && (
        <div className="mx-4 mb-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>{post.casePoll.question}</span>
          </div>

          <div className="space-y-2">
            {post.casePoll.options.map((opt) => {
              const percentage = post.casePoll?.totalVotes
                ? Math.round((opt.votes / post.casePoll.totalVotes) * 100)
                : 0;
              const isVoted = post.casePoll?.userVotedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => onVotePoll && onVotePoll(post.id, opt.id)}
                  className={`w-full text-left relative overflow-hidden p-2.5 rounded-lg border text-xs font-medium transition ${
                    isVoted
                      ? 'border-sky-500 bg-sky-50 font-bold text-sky-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-sky-100/60 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between z-10">
                    <span className="flex items-center gap-2">
                      {isVoted && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                      {opt.text}
                    </span>
                    <span className="text-slate-500 text-[11px] font-semibold">{percentage}% ({opt.votes})</span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 text-right mt-2">
            Total {post.casePoll.totalVotes} verified peer votes
          </p>
        </div>
      )}

      {/* Media Images (No shorts/reels) */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="border-t border-b border-slate-100 bg-slate-900">
          <img
            src={post.mediaUrls[0]}
            alt="Clinical visual"
            className="w-full max-h-[460px] object-cover hover:opacity-95 transition"
          />
        </div>
      )}

      {/* External Journal / Article Link Preview */}
      {post.linkUrl && post.linkMeta && (
        <div className="mx-4 mb-3 border border-slate-200 rounded-xl overflow-hidden hover:bg-slate-50 transition cursor-pointer">
          <div className="p-3">
            <div className="flex items-center justify-between text-[11px] text-sky-600 font-bold mb-1">
              <span>{post.linkMeta.source}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">{post.linkMeta.title}</h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{post.linkMeta.description}</p>
          </div>
        </div>
      )}

      {/* 3. Action Footer Bar (Slide 7: Like/comment/save/share, more) */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Like */}
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition group ${
              post.isLiked ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-5 h-5 transition transform group-active:scale-125 ${
              post.isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-500 group-hover:text-rose-600'
            }`} />
            <span>{post.likesCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition"
          >
            <MessageCircle className="w-5 h-5 text-slate-500 hover:text-sky-600" />
            <span>{post.commentsCount + (comments.length - 2)}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition"
            title="Share Post"
          >
            <Share2 className="w-5 h-5 text-slate-500 hover:text-sky-600" />
            <span className="hidden sm:inline">{post.sharesCount}</span>
          </button>
        </div>

        {/* Save / Bookmark (Slide 7) */}
        <button
          onClick={() => onSave(post.id)}
          className={`p-1.5 rounded-full transition ${
            post.isSaved ? 'text-sky-600' : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Save to Clinical Library"
        >
          <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-sky-600' : ''}`} />
        </button>
      </div>

      {/* Threaded Comment Section */}
      {showCommentBox && (
        <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add to the medical discussion..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-full transition"
            >
              Post
            </button>
          </form>

          <div className="space-y-2 pt-1">
            {comments.map((comment, i) => (
              <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 mr-1.5">Dr. Peer Colleague:</span>
                {comment}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
