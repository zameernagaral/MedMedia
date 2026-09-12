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
import { PostCommentsModal } from './PostCommentsModal';

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
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentsCount || 2);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false);


  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://medmedia.health/posts/${post.id}`);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowMoreMenu(false);
    }, 1500);
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl mb-4 overflow-hidden shadow-xs hover:shadow-md dark:shadow-slate-950/40 transition-all duration-200">
      
      {/* Algorithmic Reason Pill */}
      {(post as any).matchReasonBadge && (
        <div className="mx-4 mt-3 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-indigo-50/60 dark:from-sky-950/40 dark:to-indigo-950/30 border border-sky-100/90 dark:border-sky-800/50 rounded-xl text-[11px] text-sky-900 dark:text-sky-200 font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span>{(post as any).matchReasonBadge}</span>
          </div>
          {(post as any).algorithmScore && (
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-900/60 px-1.5 py-0.5 rounded">
              {(post as any).algorithmScore}% match
            </span>
          )}
        </div>
      )}

      {/* 1. Header: Name / Follow (Slide 7: Copy instagram feature) */}
      <div className="p-4 flex items-center justify-between">
        <div 
          onClick={() => onSelectUser && onSelectUser(post.authorId)}
          className="flex items-center gap-3 cursor-pointer group select-none active:opacity-80"
          title={`Open ${post.authorName}'s medical profile`}
        >
          <div className="relative">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-sky-400 transition"
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:underline transition cursor-pointer">
                {post.authorName}
              </h3>
              {post.isVerified && (
                <span title="Verified Medical Practitioner" className="inline-flex items-center">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 inline" />
                </span>
              )}
              {post.authorIsProfessor && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  Professor
                </span>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500">• {post.createdAt}</span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              @{post.authorUsername} • <span className="text-slate-600 dark:text-slate-300">{post.authorSpecializationOrDiscipline}</span>
            </p>
          </div>
        </div>

        {/* Follow / Connect Button & More Options Menu (Slide 7) */}
        <div className="flex items-center gap-2">
          {post.authorId !== currentUser.id && (
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition flex items-center gap-1 cursor-pointer ${
                isFollowing
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
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
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="More Actions"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Slide 6 & 7 "More" Popover Menu */}
            {showMoreMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </button>
                {onConnectAuthor && (
                  <button
                    onClick={() => {
                      onConnectAuthor(post.authorId);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    Connect Professionally
                  </button>
                )}
                <button
                  onClick={() => {
                    alert("Marked as interested. Your feed preferences have been updated.");
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Interested in Topic
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <button
                  onClick={() => {
                    alert("Clinical case submitted to MedMedia ethical moderation board.");
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                >
                  <Flag className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  Report Case / HIPAA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Body (Slide 5: Text, tweets, Images, Links, Discussions) */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-normal">
          {post.content}
        </p>

        {/* Clinical Tags */}
        {post.clinicalTags && post.clinicalTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.clinicalTags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 cursor-pointer transition border border-sky-100/60 dark:border-sky-800/40"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Case Poll / Diagnostic Discussion Widget */}
      {post.casePoll && (
        <div className="mx-4 mb-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-2.5">
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
                  className={`w-full text-left relative overflow-hidden p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    isVoted
                      ? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/50 font-bold text-sky-900 dark:text-sky-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-sky-100/60 dark:bg-sky-900/40 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between z-10">
                    <span className="flex items-center gap-2">
                      {isVoted && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                      {opt.text}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">{percentage}% ({opt.votes})</span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-2">
            Total {post.casePoll.totalVotes} verified peer votes
          </p>
        </div>
      )}

      {/* Media Images (No shorts/reels) */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="border-t border-b border-slate-100 dark:border-slate-800 bg-slate-900">
          <img
            src={post.mediaUrls[0]}
            alt="Clinical visual"
            className="w-full max-h-[460px] object-cover hover:opacity-95 transition"
          />
        </div>
      )}

      {/* External Journal / Article Link Preview */}
      {post.linkUrl && post.linkMeta && (
        <div className="mx-4 mb-3 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
          <div className="p-3">
            <div className="flex items-center justify-between text-[11px] text-sky-600 dark:text-sky-400 font-bold mb-1">
              <span>{post.linkMeta.source}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{post.linkMeta.title}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{post.linkMeta.description}</p>
          </div>
        </div>
      )}

      {/* 3. Action Footer Bar (Slide 7: Like/comment/save/share, more) */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Like */}
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition group cursor-pointer ${
              post.isLiked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <Heart className={`w-5 h-5 transition transform group-active:scale-125 ${
              post.isLiked ? 'fill-rose-600 dark:fill-rose-400 text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-rose-600'
            }`} />
            <span>{post.likesCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowCommentsModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer"
            title="Open Medical Discussion & Comments"
          >
            <MessageCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 hover:text-sky-600" />
            <span>{commentCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer"
            title="Share Post"
          >
            <Share2 className="w-5 h-5 text-slate-500 dark:text-slate-400 hover:text-sky-600" />
            <span className="hidden sm:inline">{post.sharesCount}</span>
          </button>
        </div>

        {/* Save / Bookmark (Slide 7) */}
        <button
          onClick={() => onSave(post.id)}
          className={`p-1.5 rounded-full transition cursor-pointer ${
            post.isSaved ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
          title="Save to Clinical Library"
        >
          <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-sky-600 dark:fill-sky-400' : ''}`} />
        </button>
      </div>

      {/* Instagram-style "View all comments" link & quick trigger */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setShowCommentsModal(true)}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 font-semibold cursor-pointer flex items-center gap-1 transition"
        >
          <span>View all {commentCount} peer comments and replies...</span>
        </button>
      </div>

      {/* Instagram-style Full Comments Drawer / Modal */}
      <PostCommentsModal
        isOpen={showCommentsModal}
        post={post}
        currentUser={currentUser}
        onClose={() => setShowCommentsModal(false)}
        onCommentCountChange={(newCnt) => setCommentCount(newCnt)}
      />
    </article>
  );
};
