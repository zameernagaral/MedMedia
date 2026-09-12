import React, { useState } from 'react';
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
  Pause,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Medclip, UserProfile } from '../types';

interface MedclipsPlayerProps {
  clips: Medclip[];
  currentUser: UserProfile;
  onLikeClip: (clipId: string) => void;
  onSaveClip: (clipId: string) => void;
  onConnectAuthor: (authorName: string) => void;
}

export const MedclipsPlayer: React.FC<MedclipsPlayerProps> = ({
  clips,
  currentUser,
  onLikeClip,
  onSaveClip,
  onConnectAuthor
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'clinical updates' | 'social update' | 'following'>('clinical updates');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [clipComments, setClipComments] = useState<string[]>([
    "Crucial pearl on using the wrist rather than finger flexion to set the knot.",
    "This should be mandatory viewing for all incoming surgical interns!"
  ]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    "clip-1": true,
    "clip-2": true
  });

  const filteredClips = clips.filter(c => {
    if (activeCategory === 'all') return true;
    return c.clinicalCategory.toLowerCase() === activeCategory.toLowerCase();
  });

  const currentClip = filteredClips[currentIndex] || clips[0];

  const handleNext = () => {
    if (currentIndex < filteredClips.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMoreDrawer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowMoreDrawer(false);
    }
  };

  const toggleFollow = (clipId: string) => {
    setFollowingMap(prev => ({ ...prev, [clipId]: !prev[clipId] }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setClipComments([...clipComments, commentText.trim()]);
    setCommentText('');
  };

  if (!currentClip) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 rounded-3xl text-white">
        No Medclips available in this stream.
      </div>
    );
  }

  return (
    <div className="relative max-w-sm mx-auto h-[calc(100vh-140px)] sm:h-[720px] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800">
      
      {/* 1. Category Switcher Bar (Slide 6: social update / clinical updates / following (Main)) */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-4 pb-6 px-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-center">
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20">
          {(['clinical updates', 'social update', 'following'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
              }}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full capitalize transition ${
                activeCategory === cat
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Video / Media Canvas */}
      <div 
        onClick={() => setIsPlaying(!isPlaying)}
        className="relative w-full h-full flex items-center justify-center cursor-pointer bg-slate-950"
      >
        <video
          src={currentClip.videoUrl}
          poster={currentClip.thumbnailUrl}
          autoPlay={isPlaying}
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Play/Pause Overlay Indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
              <Play className="w-8 h-8 ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Up/Down Floating Nav Buttons */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
              title="Previous Clip"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
          {currentIndex < filteredClips.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
              title="Next Clip"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Audio Mute/Unmute Quick Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="absolute top-16 right-4 z-20 p-2 rounded-full bg-black/40 text-white/90 hover:bg-black/70 backdrop-blur-sm"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 3. Right Side Interaction Bar (Slide 6: Like, comment, Share, Save, more) */}
      <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-4">
        
        {/* Like */}
        <button
          onClick={() => onLikeClip(currentClip.id)}
          className="flex flex-col items-center group"
          title="Like Medclip"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition transform group-active:scale-125 ${
            currentClip.isLiked ? 'bg-rose-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'
          }`}>
            <Heart className={`w-6 h-6 ${currentClip.isLiked ? 'fill-white' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            {currentClip.likesCount}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowCommentsModal(true)}
          className="flex flex-col items-center group"
          title="Clinical Comments"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            {currentClip.commentsCount + (clipComments.length - 2)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard?.writeText?.(`https://medmedia.health/clips/${currentClip.id}`);
            alert("Medclip link copied to clipboard!");
          }}
          className="flex flex-col items-center group"
          title="Share Medclip"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            {currentClip.sharesCount}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={() => onSaveClip(currentClip.id)}
          className="flex flex-col items-center group"
          title="Save Clip"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition ${
            currentClip.isSaved ? 'bg-sky-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'
          }`}>
            <Bookmark className={`w-6 h-6 ${currentClip.isSaved ? 'fill-white' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            Save
          </span>
        </button>

        {/* More Drawer Button (Slide 6: Report, Connect, copy link, Interested) */}
        <button
          onClick={() => setShowMoreDrawer(!showMoreDrawer)}
          className="flex flex-col items-center group"
          title="More Actions"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition">
            <MoreVertical className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
            More
          </span>
        </button>
      </div>

      {/* 4. Bottom Info: Name, Follow, Caption (Slide 6) */}
      <div className="absolute bottom-0 left-0 right-14 z-20 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        
        {/* Author Info & Follow Button */}
        <div className="flex items-center gap-2.5 mb-2">
          <img
            src={currentClip.authorAvatar}
            alt={currentClip.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-400"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-xs font-bold leading-tight">
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

          <button
            onClick={() => toggleFollow(currentClip.id)}
            className={`ml-2 text-[11px] font-bold px-3 py-1 rounded-full transition flex items-center gap-1 ${
              followingMap[currentClip.id]
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-sky-500 hover:bg-sky-600 text-white'
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

      {/* Slide 6 "More" Drawer Modal */}
      {showMoreDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Medclip Options</h4>
            <button
              onClick={() => setShowMoreDrawer(false)}
              className="text-white/60 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="py-2 space-y-1">
            <button
              onClick={() => {
                onConnectAuthor(currentClip.authorName);
                setShowMoreDrawer(false);
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
              Connect with {currentClip.authorName}
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(`https://medmedia.health/clips/${currentClip.id}`);
                alert("Link copied!");
                setShowMoreDrawer(false);
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              Copy Link
            </button>

            <button
              onClick={() => {
                alert("Preference registered: You will see more clips like this.");
                setShowMoreDrawer(false);
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-white hover:bg-slate-800 rounded-xl transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Interested in this Specialty
            </button>

            <button
              onClick={() => {
                alert("Medclip reported for clinical accuracy & compliance review.");
                setShowMoreDrawer(false);
              }}
              className="w-full py-2.5 px-3 flex items-center gap-3 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
            >
              <Flag className="w-4 h-4 text-rose-400" />
              Report Clip
            </button>
          </div>
        </div>
      )}

      {/* Slide 6 Comments Drawer Modal */}
      {showCommentsModal && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl p-4 max-h-[420px] flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800">
              Clinical Discussion ({clipComments.length})
            </span>
            <button
              onClick={() => setShowCommentsModal(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto space-y-2 py-2 flex-1">
            {clipComments.map((c, i) => (
              <div key={i} className="text-xs p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 mr-1.5">Colleague:</span>
                {c}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Add your observation..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-full px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-full"
            >
              Send
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
