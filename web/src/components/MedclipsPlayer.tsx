import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical, 
  ShieldCheck, 
  UserPlus, 
  UserCheck, 
  Copy, 
  Flag, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Sparkles,
  Check
} from 'lucide-react';
import { Medclip, UserProfile } from '../types';

interface MedclipsPlayerProps {
  clips: Medclip[];
  currentUser: UserProfile;
  onLikeClip: (clipId: string) => void;
  onSaveClip: (clipId: string) => void;
  onConnectAuthor: (authorName: string) => void;
  onSelectUser?: (userId: string) => void;
}

export const MedclipsPlayer: React.FC<MedclipsPlayerProps> = ({
  clips,
  currentUser,
  onLikeClip,
  onSaveClip,
  onConnectAuthor,
  onSelectUser
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'clinical updates' | 'social update' | 'following'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [clipComments, setClipComments] = useState<string[]>([
    "Crucial pearl on using the wrist rather than finger flexion to set the knot.",
    "This should be mandatory viewing for all incoming surgical interns!"
  ]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    "clip-1": true,
    "clip-2": true,
    "clip-4": true,
    "clip-5": true,
    "clip-7": true,
    "clip-8": true
  });
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  // Wheel & touch scroll handling
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  const filteredClips = clips.filter(c => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'following') return c.isFollowing || followingMap[c.id];
    return c.clinicalCategory.toLowerCase() === activeCategory.toLowerCase();
  });

  const currentClip = filteredClips[currentIndex] || clips[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2200);
  };

  // Continuous seamless loop scrolling (reels never get stuck)
  const handleNext = useCallback(() => {
    if (filteredClips.length === 0) return;
    setCurrentIndex(prev => (prev < filteredClips.length - 1 ? prev + 1 : 0));
    setShowMoreDrawer(false);
    setShowCommentsModal(false);
  }, [filteredClips.length]);

  const handlePrev = useCallback(() => {
    if (filteredClips.length === 0) return;
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredClips.length - 1));
    setShowMoreDrawer(false);
    setShowCommentsModal(false);
  }, [filteredClips.length]);

  // Smooth mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 450) return; // Debounce 450ms for smooth 1-reel scroll

    if (e.deltaY > 20) {
      lastScrollTime.current = now;
      handleNext();
    } else if (e.deltaY < -20) {
      lastScrollTime.current = now;
      handlePrev();
    }
  };

  // Touch Swipe for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff > 35) {
      handleNext();
    } else if (diff < -35) {
      handlePrev();
    }
  };

  // Keyboard Navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Double Click / Tap to Like
  const handleDoubleTap = () => {
    if (!currentClip.isLiked) {
      onLikeClip(currentClip.id);
    }
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 800);
  };

  const toggleFollow = (clipId: string) => {
    setFollowingMap(prev => {
      const nextState = !prev[clipId];
      showToast(nextState ? `Following ${currentClip.authorName}` : `Unfollowed ${currentClip.authorName}`);
      return { ...prev, [clipId]: nextState };
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setClipComments([...clipComments, commentText.trim()]);
    setCommentText('');
    showToast("Comment posted to clinical discussion");
  };

  if (!currentClip) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 rounded-3xl text-white">
        No Medclips available in this stream.
      </div>
    );
  }

  const isFollowedReel = currentClip.isFollowing || followingMap[currentClip.id];

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative max-w-sm mx-auto h-[calc(100vh-140px)] sm:h-[730px] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800 select-none"
    >
      
      {/* 1. Category Switcher Bar with Attractive Red Followed Indicator */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-3 pb-5 px-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/20">
          {(['all', 'following', 'clinical updates', 'social update'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
              }}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full capitalize transition flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {cat === 'following' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/60" title="New reels from followed doctors"></span>
              )}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Scroll Helper Indicator */}
        <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium">
          <span>{currentIndex + 1} of {filteredClips.length}</span>
          <span>•</span>
          <span>Swipe or scroll to browse</span>
        </div>
      </div>

      {/* 2. Seamless Vertical Slide Track (Zero Blinking, Zero Black Flashes) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div 
          className="w-full h-full flex flex-col transition-transform duration-350 ease-out"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {filteredClips.map((clip, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div 
                key={clip.id}
                onClick={() => setIsPlaying(!isPlaying)}
                onDoubleClick={handleDoubleTap}
                className="relative w-full h-full flex-shrink-0 flex items-center justify-center cursor-pointer bg-slate-950 overflow-hidden"
              >
                {/* Poster image always present behind video - ensures zero unpainted blink */}
                <img
                  src={clip.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  loading={Math.abs(idx - currentIndex) <= 1 ? "eager" : "lazy"}
                />

                {/* Preloaded smooth video playback for active & adjacent reels */}
                {Math.abs(idx - currentIndex) <= 1 && (
                  <video
                    src={clip.videoUrl}
                    poster={clip.thumbnailUrl}
                    autoPlay={isActive && isPlaying}
                    muted={isMuted}
                    loop
                    playsInline
                    className={`relative z-10 w-full h-full object-cover transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attractive Red Badge on Followed Doctor's Reel */}
      {isFollowedReel && (
        <div className="absolute top-16 left-4 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-lg shadow-rose-600/50 border border-rose-400/50 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span>New from Followed Doctor</span>
        </div>
      )}

      {/* Double-tap Heart Pop Animation */}
      {showHeartAnimation && (
        <div className="absolute z-30 inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl scale-125 transition">
            <Heart className="w-14 h-14 fill-white" />
          </div>
        </div>
      )}

      {/* Play/Pause Overlay Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
            <Play className="w-8 h-8 ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* Mute/Unmute Quick Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
        className="absolute top-16 right-4 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm cursor-pointer"
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Floating Quick Next / Previous Vertical Arrow Buttons */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 shadow-lg border border-white/20 transition active:scale-95 cursor-pointer"
          title="Previous Clip (Up)"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 shadow-lg border border-white/20 transition active:scale-95 cursor-pointer"
          title="Next Clip (Down)"
        >
          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Vertical Reel Pagination Dots on Right Edge */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 items-center py-2 px-1 bg-black/40 backdrop-blur-xs rounded-full">
        {filteredClips.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
            className={`rounded-full transition-all duration-200 cursor-pointer ${
              i === currentIndex ? 'w-1.5 h-3.5 bg-white shadow-xs' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
            title={`Go to reel ${i + 1}`}
          />
        ))}
      </div>

      {/* 3. Right Side Interaction Bar (Slide 6: Like, comment, Share, Save, more) */}
      <div className="absolute right-2.5 bottom-20 z-30 flex flex-col items-center gap-3.5">
        
        {/* Like */}
        <button
          onClick={() => onLikeClip(currentClip.id)}
          className="flex flex-col items-center group"
          title="Like Medclip"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition transform group-active:scale-125 ${
            currentClip.isLiked ? 'bg-rose-600 text-white' : 'bg-black/55 text-white hover:bg-black/75'
          }`}>
            <Heart className={`w-6 h-6 ${currentClip.isLiked ? 'fill-white' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-0.5 drop-shadow">
            {currentClip.likesCount}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowCommentsModal(true)}
          className="flex flex-col items-center group"
          title="Clinical Comments"
        >
          <div className="w-11 h-11 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/75 transition">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-0.5 drop-shadow">
            {currentClip.commentsCount + (clipComments.length - 2)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard?.writeText?.(`https://medmedia.health/clips/${currentClip.id}`);
            showToast("Medclip link copied to clipboard!");
          }}
          className="flex flex-col items-center group"
          title="Share Medclip"
        >
          <div className="w-11 h-11 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/75 transition">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-0.5 drop-shadow">
            Share
          </span>
        </button>

        {/* Save */}
        <button
          onClick={() => {
            onSaveClip(currentClip.id);
            showToast(currentClip.isSaved ? "Removed from Library" : "Saved to Clinical Library");
          }}
          className="flex flex-col items-center group"
          title="Save Clip"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition ${
            currentClip.isSaved ? 'bg-sky-600 text-white' : 'bg-black/55 text-white hover:bg-black/75'
          }`}>
            <Bookmark className={`w-6 h-6 ${currentClip.isSaved ? 'fill-white' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-0.5 drop-shadow">
            Save
          </span>
        </button>

        {/* More Drawer Button (Slide 6: Report, Connect, copy link, Interested) */}
        <button
          onClick={() => setShowMoreDrawer(!showMoreDrawer)}
          className="flex flex-col items-center group"
          title="More Actions"
        >
          <div className="w-11 h-11 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/75 transition">
            <MoreVertical className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-0.5 drop-shadow">
            More
          </span>
        </button>
      </div>

      {/* 4. Bottom Info: Name, Follow, Caption (Slide 6) */}
      <div className="absolute bottom-0 left-0 right-14 z-20 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
        
        {/* Author Info & Follow Button */}
        <div className="flex items-center gap-2 mb-2">
          <div 
            onClick={() => onSelectUser && onSelectUser(currentClip.authorId)}
            className="flex items-center gap-2 cursor-pointer group select-none active:opacity-80"
            title={`Open ${currentClip.authorName}'s medical profile`}
          >
            <div className="relative">
              <img
                src={currentClip.authorAvatar}
                alt={currentClip.authorName}
                className={`w-10 h-10 rounded-full object-cover transition ${
                  isFollowedReel
                    ? 'ring-2 ring-rose-500 shadow-sm shadow-rose-500/60'
                    : 'ring-2 ring-sky-400 group-hover:ring-white'
                }`}
              />
              {isFollowedReel && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-950 rounded-full" title="New Reel from Followed Doctor"></span>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xs font-bold leading-tight group-hover:underline group-hover:text-sky-200 transition">
                  {currentClip.authorName}
                </span>
                {currentClip.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                )}
              </div>
              <span className="text-[10px] text-white/70 font-medium">
                {currentClip.authorSpecialty}
              </span>
            </div>
          </div>

          <button
            onClick={() => toggleFollow(currentClip.id)}
            className={`ml-2 text-[11px] font-bold px-3 py-1 rounded-full transition flex items-center gap-1 ${
              followingMap[currentClip.id]
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
            }`}
          >
            {followingMap[currentClip.id] ? (
              <>
                <UserCheck className="w-3 h-3" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" />
                Follow
              </>
            )}
          </button>
        </div>

        {/* Caption */}
        <p className="text-white text-xs leading-relaxed line-clamp-3 font-normal drop-shadow">
          {currentClip.caption}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {currentClip.tags.map((tag, i) => (
            <span key={i} className="text-[10px] text-sky-300 font-semibold hover:underline cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-slate-900/95 border border-sky-400/40 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Slide 6 "More" Drawer Modal */}
      {showMoreDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/98 backdrop-blur-2xl border-t border-slate-700 rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Medclip Options (Slide 6)</h4>
            <button
              onClick={() => setShowMoreDrawer(false)}
              className="text-white/60 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="py-2 space-y-1">
            <button
              onClick={() => {
                onConnectAuthor(currentClip.authorName);
                setShowMoreDrawer(false);
                showToast(`Connection request sent to ${currentClip.authorName}`);
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
              Connect with {currentClip.authorName}
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(`https://medmedia.health/clips/${currentClip.id}`);
                setShowMoreDrawer(false);
                showToast("Medclip link copied!");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              Copy Link
            </button>

            <button
              onClick={() => {
                setShowMoreDrawer(false);
                showToast("Preference saved: Prioritizing clinical updates");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Interested in this Topic
            </button>

            <button
              onClick={() => {
                setShowMoreDrawer(false);
                showToast("Clip reported for medical moderator review");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
            >
              <Flag className="w-4 h-4 text-rose-400" />
              Report Clip / Ethics
            </button>
          </div>
        </div>
      )}

      {/* Slide 6 Comments Drawer Modal */}
      {showCommentsModal && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-4 max-h-[440px] flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom transition-colors duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Clinical Observations ({clipComments.length})
            </span>
            <button
              onClick={() => setShowCommentsModal(false)}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto space-y-2 py-2 flex-1">
            {clipComments.map((c, i) => (
              <div key={i} className="text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/80 text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white mr-1.5">Colleague:</span>
                {c}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              placeholder="Add your observation..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-full px-3.5 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-full transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
