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
  Check
} from 'lucide-react';
import { Medclip, UserProfile } from '../types';

interface MedclipsPlayerProps {
  clips: Medclip[];
  currentUser: UserProfile;
  onLikeClip: (clipId: string) => void;
  onSaveClip: (clipId: string) => void;
  onSelectUser?: (userId: string) => void;
}

export const MedclipsPlayer: React.FC<MedclipsPlayerProps> = ({
  clips,
  currentUser,
  onLikeClip,
  onSaveClip,
  onSelectUser
}) => {
  // Tabs: Following (with green dot, default), Clinical Updates, Social Updates
  const [activeCategory, setActiveCategory] = useState<'following' | 'clinical updates' | 'social updates'>('following');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
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
    if (activeCategory === 'following') {
      return c.isFollowing || followingMap[c.id];
    }
    if (activeCategory === 'clinical updates') {
      return c.clinicalCategory?.toLowerCase().includes('clinical') || c.tags?.some(t => t.toLowerCase().includes('clinical') || t.toLowerCase().includes('surgery') || t.toLowerCase().includes('cardio'));
    }
    if (activeCategory === 'social updates') {
      return c.clinicalCategory?.toLowerCase().includes('social') || !c.clinicalCategory?.toLowerCase().includes('clinical');
    }
    return true;
  });

  // Fallback to all clips if following list is empty
  const activeClipList = filteredClips.length > 0 ? filteredClips : clips;
  const currentClip = activeClipList[currentIndex] || clips[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2200);
  };

  // Continuous loop scrolling
  const handleNext = useCallback(() => {
    if (activeClipList.length === 0) return;
    setCurrentIndex(prev => (prev < activeClipList.length - 1 ? prev + 1 : 0));
    setShowMoreDrawer(false);
    setShowShareDrawer(false);
    setShowCommentsModal(false);
  }, [activeClipList.length]);

  const handlePrev = useCallback(() => {
    if (activeClipList.length === 0) return;
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : activeClipList.length - 1));
    setShowMoreDrawer(false);
    setShowShareDrawer(false);
    setShowCommentsModal(false);
  }, [activeClipList.length]);

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 450) return;

    if (e.deltaY > 20) {
      lastScrollTime.current = now;
      handleNext();
    } else if (e.deltaY < -20) {
      lastScrollTime.current = now;
      handlePrev();
    }
  };

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
      
      {/* 1. Header: Following (with green dot), Clinical Updates, Social Updates */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-3 pb-5 px-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/20">
          {/* Following with green dot */}
          <button
            onClick={() => {
              setActiveCategory('following');
              setCurrentIndex(0);
            }}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'following'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/50 animate-pulse shadow-sm shadow-emerald-400"></span>
            <span>Following</span>
          </button>

          {/* Clinical Updates */}
          <button
            onClick={() => {
              setActiveCategory('clinical updates');
              setCurrentIndex(0);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer ${
              activeCategory === 'clinical updates'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span>Clinical Updates</span>
          </button>

          {/* Social Updates */}
          <button
            onClick={() => {
              setActiveCategory('social updates');
              setCurrentIndex(0);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer ${
              activeCategory === 'social updates'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span>Social Updates</span>
          </button>
        </div>

        {/* Reel Counter */}
        <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium">
          <span>{currentIndex + 1} of {activeClipList.length}</span>
          <span>•</span>
          <span>Swipe or scroll</span>
        </div>
      </div>

      {/* 2. Seamless Slide Track */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div 
          className="w-full h-full flex flex-col transition-transform duration-350 ease-out"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {activeClipList.map((clip, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div 
                key={clip.id}
                onClick={() => setIsPlaying(!isPlaying)}
                onDoubleClick={handleDoubleTap}
                className="relative w-full h-full flex-shrink-0 flex items-center justify-center cursor-pointer bg-slate-950 overflow-hidden"
              >
                <img
                  src={clip.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  loading={Math.abs(idx - currentIndex) <= 1 ? "eager" : "lazy"}
                />

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

      {/* Requirement 9: Light green live/notification dot indicator on creator status */}
      {isFollowedReel && (
        <div className="absolute top-16 left-4 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-200 text-[10px] font-bold shadow-lg border border-emerald-500/40 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/50 animate-pulse"></span>
          <span>Following</span>
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
        className="absolute top-16 right-4 z-30 p-2 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/60 border border-white/15 text-white cursor-pointer shadow-md transition"
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Quick Up/Down Navigation Buttons */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="w-9 h-9 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/15 shadow-lg transition active:scale-95 cursor-pointer"
          title="Previous Clip (Up)"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="w-9 h-9 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/15 shadow-lg transition active:scale-95 cursor-pointer"
          title="Next Clip (Down)"
        >
          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Transparent Action Buttons (Like, Comment, Share, Save, More) */}
      <div className="absolute right-2 bottom-20 z-30 flex flex-col items-center gap-4">
        
        {/* Like - Transparent Icon */}
        <button
          onClick={() => onLikeClip(currentClip.id)}
          className="flex flex-col items-center group cursor-pointer bg-transparent border-0 p-0"
          title="Like Medclip"
        >
          <div className="p-2 rounded-full bg-transparent hover:bg-white/10 transition transform group-active:scale-125">
            <Heart className={`w-7 h-7 drop-shadow-lg transition ${
              currentClip.isLiked ? 'fill-rose-500 text-rose-500' : 'text-white stroke-[2]'
            }`} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md -mt-1">
            {currentClip.likesCount}
          </span>
        </button>

        {/* Comment - Transparent Icon */}
        <button
          onClick={() => setShowCommentsModal(true)}
          className="flex flex-col items-center group cursor-pointer bg-transparent border-0 p-0"
          title="Clinical Comments"
        >
          <div className="p-2 rounded-full bg-transparent hover:bg-white/10 transition transform group-hover:scale-110">
            <MessageCircle className="w-7 h-7 text-white stroke-[2] drop-shadow-lg" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md -mt-1">
            {currentClip.commentsCount + (clipComments.length - 2)}
          </span>
        </button>

        {/* Share - Transparent Icon */}
        <button
          onClick={() => setShowShareDrawer(true)}
          className="flex flex-col items-center group cursor-pointer bg-transparent border-0 p-0"
          title="Share Medclip"
        >
          <div className="p-2 rounded-full bg-transparent hover:bg-white/10 transition transform group-hover:scale-110">
            <Share2 className="w-7 h-7 text-white stroke-[2] drop-shadow-lg" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md -mt-1">
            Share
          </span>
        </button>

        {/* Save - Transparent Icon */}
        <button
          onClick={() => {
            onSaveClip(currentClip.id);
            showToast(currentClip.isSaved ? "Removed from Library" : "Saved to Clinical Library");
          }}
          className="flex flex-col items-center group cursor-pointer bg-transparent border-0 p-0"
          title="Save Clip"
        >
          <div className="p-2 rounded-full bg-transparent hover:bg-white/10 transition transform group-hover:scale-110">
            <Bookmark className={`w-7 h-7 drop-shadow-lg transition ${
              currentClip.isSaved ? 'fill-sky-400 text-sky-400' : 'text-white stroke-[2]'
            }`} />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md -mt-1">
            Save
          </span>
        </button>

        {/* More Drawer - Transparent Icon */}
        <button
          onClick={() => setShowMoreDrawer(!showMoreDrawer)}
          className="flex flex-col items-center group cursor-pointer bg-transparent border-0 p-0"
          title="More Actions"
        >
          <div className="p-2 rounded-full bg-transparent hover:bg-white/10 transition">
            <MoreVertical className="w-7 h-7 text-white stroke-[2] drop-shadow-lg" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow-md -mt-1">
            More
          </span>
        </button>
      </div>

      {/* 4. Bottom Info: Name, Follow, Caption with Light Green Live Indicator on Creator */}
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
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400 shadow-sm"
              />
              {/* Requirement 9: light green live/notification dot indicator */}
              <span 
                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full animate-pulse shadow-sm shadow-emerald-400" 
                title="Active Clinical Practitioner"
              />
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
            className={`ml-2 text-[11px] font-bold px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer ${
              followingMap[currentClip.id]
                ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
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

      {/* "More" Drawer Modal */}
      {showMoreDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/98 backdrop-blur-2xl border-t border-slate-700 rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Medclip Options</h4>
            <button
              onClick={() => setShowMoreDrawer(false)}
              className="text-white/60 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="py-2 space-y-1">
            <button
              onClick={() => {
                setShowMoreDrawer(false);
                showToast(`Started following ${currentClip.authorName}`);
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Follow {currentClip.authorName}
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(`https://medmedia.health/clips/${currentClip.id}`);
                setShowMoreDrawer(false);
                showToast("Medclip link copied!");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              Copy Link
            </button>

            <button
              onClick={() => {
                setShowMoreDrawer(false);
                showToast("Preference saved: Prioritizing clinical updates");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Interested in this Topic
            </button>

            <button
              onClick={() => {
                setShowMoreDrawer(false);
                showToast("Clip reported for medical moderator review");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
            >
              <Flag className="w-4 h-4 text-rose-400" />
              Report Clip / Ethics
            </button>
          </div>
        </div>
      )}

      {/* Share Drawer Modal */}
      {showShareDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/98 backdrop-blur-2xl border-t border-slate-700 rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Share Medclip</h4>
            <button
              onClick={() => setShowShareDrawer(false)}
              className="text-white/60 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="py-2 space-y-1">
            <button
              onClick={() => {
                window.open(`https://www.instagram.com/`, '_blank');
                setShowShareDrawer(false);
                showToast("Opening Instagram...");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </div>
              Instagram
            </button>

            <button
              onClick={() => {
                const url = `https://medmedia.health/clips/${currentClip.id}`;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                setShowShareDrawer(false);
                showToast("Opening Facebook...");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <Share2 className="w-3.5 h-3.5 text-white" />
              </div>
              Facebook
            </button>

            <button
              onClick={() => {
                const url = `https://medmedia.health/clips/${currentClip.id}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this Medclip: ' + url)}`, '_blank');
                setShowShareDrawer(false);
                showToast("Opening WhatsApp...");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              WhatsApp
            </button>

            <button
              onClick={() => {
                const url = `https://medmedia.health/clips/${currentClip.id}`;
                window.open(`mailto:?subject=Medclip&body=${encodeURIComponent('Check out this Medclip: ' + url)}`, '_blank');
                setShowShareDrawer(false);
                showToast("Opening Email...");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-slate-600 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-white" />
              </div>
              Email
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(`https://medmedia.health/clips/${currentClip.id}`);
                setShowShareDrawer(false);
                showToast("Medclip link copied to clipboard!");
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center">
                <Copy className="w-3.5 h-3.5 text-white" />
              </div>
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Comments Drawer Modal */}
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
