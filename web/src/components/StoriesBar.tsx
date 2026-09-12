import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Stethoscope, ChevronLeft, ChevronRight, Send, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Story, UserProfile } from '../types';

interface StoriesBarProps {
  stories: Story[];
  currentUser: UserProfile;
  onAddStorySuccess: (newStory: Story) => void;
  onSelectUser?: (userId: string) => void;
}

const SAMPLE_STORY_IMAGES = [
  { label: 'Cath Lab Procedure', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&h=1000&fit=crop' },
  { label: 'Pediatric Grand Rounds', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=700&h=1000&fit=crop' },
  { label: 'Surgical OR Prep', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=700&h=1000&fit=crop' },
  { label: 'Medical Ward Rounds', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=700&h=1000&fit=crop' }
];

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  onAddStorySuccess,
  onSelectUser
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newCaption, setNewCaption] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_STORY_IMAGES[0].url);
  const [replyText, setReplyText] = useState<string>('');
  const [replyFeedback, setReplyFeedback] = useState<string>('');

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Auto-advance timer for stories (Instagram style 5 seconds per story)
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // ~5 seconds (50 ticks * 100ms)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, stories.length]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setProgress(0);
    setIsPaused(false);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
      mediaUrl: selectedImage,
      caption: newCaption.trim(),
      timestamp: 'Just now',
      isViewed: false
    };

    onAddStorySuccess(newStory);
    setShowCreateModal(false);
    setNewCaption('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeStory) return;
    setReplyFeedback(`Reply sent to ${activeStory.userName}!`);
    setReplyText('');
    setTimeout(() => setReplyFeedback(''), 2500);
  };

  return (
    <section className="bg-white border border-slate-200/90 py-3.5 px-4 mb-4 shadow-xs rounded-2xl">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 tracking-wide uppercase">
          <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
          <span>Story Updates <span className="text-[10px] font-normal text-slate-400 capitalize">(Slide 5 Accessory)</span></span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-[11px] text-sky-600 font-bold hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Post Story
        </button>
      </div>

      {/* Horizontal Story Bubble Row */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        
        {/* Current User Add Story Bubble */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          title="Share a 24-hour clinical story update"
        >
          <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-sky-400 group-hover:border-sky-600 transition">
            <img
              src={currentUser.avatarUrl}
              alt="My Story"
              className="w-full h-full rounded-full object-cover group-hover:scale-95 transition"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-sky-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-700 mt-1 max-w-[68px] truncate">
            Your Update
          </span>
        </div>

        {/* Stories List */}
        {stories.map((story, idx) => (
          <div
            key={story.id}
            onClick={() => handleOpenStory(idx)}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-full p-0.5 transition transform group-hover:scale-105 ${
              story.isViewed
                ? 'border-2 border-slate-300'
                : 'bg-gradient-to-tr from-sky-500 via-teal-400 to-indigo-500 p-[2.5px]'
            }`}>
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <img
                  src={story.userAvatar}
                  alt={story.userName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 mt-1 max-w-[68px] truncate">
              {story.userName.split(' ')[story.userName.startsWith('Dr.') ? 1 : 0]}
            </span>
          </div>
        ))}
      </div>

      {/* CREATE STORY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-sky-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold">Add Clinical Story Update (24h)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  1. Select Clinical Media:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_STORY_IMAGES.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        selectedImage === img.url ? 'border-sky-600 ring-2 ring-sky-300' : 'border-slate-200'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-20 object-cover" />
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">
                        {img.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  2. Caption / Procedure Update:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Cath lab rounds finished. Preparing patient for complex PCI..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Publish to Story Ring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTAGRAM-STYLE STORY LIGHTBOX VIEWER */}
      {activeStory && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative w-full max-w-sm h-[90vh] max-h-[720px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            
            {/* Top Multi-Segment Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
              <div className="flex gap-1.5 mb-3">
                {stories.map((s, idx) => (
                  <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all"
                      style={{
                        width: idx < activeStoryIndex! ? '100%' : idx === activeStoryIndex ? `${progress}%` : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetUserId = activeStory.userId;
                    setActiveStoryIndex(null);
                    if (onSelectUser) {
                      onSelectUser(targetUserId);
                    }
                  }}
                  className="flex items-center gap-2.5 text-left group hover:opacity-95 transition focus:outline-none cursor-pointer"
                  title={`View ${activeStory.userName}'s verified medical profile`}
                >
                  <div className="relative">
                    <img
                      src={activeStory.userAvatar}
                      alt={activeStory.userName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-400 group-hover:ring-sky-300 transition"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-xs font-bold leading-tight group-hover:underline">{activeStory.userName}</p>
                      <span className="text-[9px] bg-sky-500/40 text-sky-200 px-1.5 py-0.5 rounded font-semibold border border-sky-400/40">
                        View Profile →
                      </span>
                    </div>
                    <p className="text-white/70 text-[10px]">{activeStory.timestamp}</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition cursor-pointer"
                  title="Close Story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Image */}
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={activeStory.mediaUrl}
                alt="Story Media"
                className="w-full h-full object-cover select-none"
              />

              {/* Tap Left / Right Overlay Controls */}
              <button
                onClick={handlePrevStory}
                className="absolute left-0 top-16 bottom-24 w-1/3 z-10 opacity-0 hover:opacity-20 bg-white cursor-pointer"
                title="Previous Story"
              />
              <button
                onClick={handleNextStory}
                className="absolute right-0 top-16 bottom-24 w-1/3 z-10 opacity-0 hover:opacity-20 bg-white cursor-pointer"
                title="Next Story"
              />

              {/* Explicit Prev / Next Floating Arrows */}
              {activeStoryIndex !== null && activeStoryIndex > 0 && (
                <button
                  onClick={handlePrevStory}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {activeStoryIndex !== null && activeStoryIndex < stories.length - 1 && (
                <button
                  onClick={handleNextStory}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bottom Caption & Reply Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
              <p className="text-white text-xs sm:text-sm font-medium leading-relaxed drop-shadow mb-3">
                {activeStory.caption}
              </p>

              {replyFeedback ? (
                <div className="p-2 bg-emerald-500/90 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{replyFeedback}</span>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${activeStory.userName.split(' ')[0]}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-white/20 text-white placeholder-white/60 text-xs px-4 py-2.5 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <button 
                    type="submit"
                    className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full transition"
                    title="Send Reply"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
