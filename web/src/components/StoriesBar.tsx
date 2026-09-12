import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  X, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Check, 
  Sparkles, 
  Upload, 
  Hash, 
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { Story, UserProfile } from '../types';
import { apiService } from '../services/api';

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

const SUGGESTED_MEDICAL_TAGS = [
  '#Surgery',
  '#Cardiology',
  '#MedicalStudent',
  '#BedsideRounds',
  '#Internship',
  '#ClinicalPearl',
  '#USMLE',
  '#NEETPG',
  '#Pediatrics',
  '#EmergencyMedicine',
  '#Pharmacology',
  '#Radiology'
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
  const [deviceFileName, setDeviceFileName] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['#BedsideRounds']);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [replyFeedback, setReplyFeedback] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Auto-advance timer for stories (~5 seconds per story)
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
        return prev + 2;
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

  // Device File Upload Handler
  const handleDeviceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeviceFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setSelectedImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      let cleaned = customTagInput.trim();
      if (!cleaned) return;
      if (!cleaned.startsWith('#')) cleaned = `#${cleaned}`;
      if (!selectedTags.includes(cleaned)) {
        setSelectedTags([...selectedTags, cleaned]);
      }
      setCustomTagInput('');
    }
  };

  // Create Story & Persist to MySQL + Local Laptop DB
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsSubmitting(true);
    try {
      const created = await apiService.createStory({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userAvatar: currentUser.avatarUrl,
        mediaUrl: selectedImage,
        caption: newCaption.trim() || 'Clinical update from ward rounds',
        clinicalTags: selectedTags
      });

      onAddStorySuccess(created);
      setShowCreateModal(false);
      setNewCaption('');
      setSelectedTags(['#BedsideRounds']);
      setDeviceFileName(null);
      setSelectedImage(SAMPLE_STORY_IMAGES[0].url);
    } catch (err) {
      console.error('Error creating story:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeStory) return;
    setReplyFeedback(`Reply sent to ${activeStory.userName}!`);
    setReplyText('');
    setTimeout(() => setReplyFeedback(''), 2500);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 py-3.5 px-4 mb-4 shadow-xs rounded-2xl transition-colors duration-200">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
          <Stethoscope className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Story Updates <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 capitalize">(24h Clinical Pearls)</span></span>
        </div>
      </div>

      {/* Horizontal Story Bubble Row */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        
        {/* Current User Add Story Bubble */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          title="Share a 24-hour clinical story update from your device"
        >
          <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-sky-400 dark:border-sky-500 group-hover:border-sky-600 transition">
            <img
              src={currentUser.avatarUrl}
              alt="My Story"
              className="w-full h-full rounded-full object-cover group-hover:scale-95 transition"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-sky-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1 max-w-[68px] truncate">
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
                ? 'border-2 border-slate-300 dark:border-slate-700'
                : 'bg-gradient-to-tr from-sky-500 via-teal-400 to-indigo-500 p-[2.5px]'
            }`}>
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-0.5">
                <img
                  src={story.userAvatar}
                  alt={story.userName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1 max-w-[68px] truncate">
              {story.userName.split(' ')[story.userName.startsWith('Dr.') ? 1 : 0]}
            </span>
          </div>
        ))}
      </div>

      {/* CREATE STORY MODAL (With Device Media Upload, Caption & Hashtags) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold">Post 24-Hour Clinical Story</h3>
                  <p className="text-[10px] text-sky-200">Share bedside cases, procedures, and learning pearls</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* SECTION 1: DEVICE UPLOAD OR SAMPLE PRESET */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
                  <span>1. Story Media (From Laptop/Device or Library):</span>
                  {deviceFileName && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[180px]">
                      ✓ {deviceFileName}
                    </span>
                  )}
                </label>

                {/* Prominent Device File Picker Button */}
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    onChange={handleDeviceFileSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-sky-300 dark:border-sky-700 hover:border-sky-500 dark:hover:border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 rounded-2xl p-4 text-center cursor-pointer transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {deviceFileName ? 'Change Selected File from Device' : 'Click to Upload Image/Video from Device'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP, MP4 from your laptop or phone
                    </p>
                  </div>
                </div>

                {/* Selected Image Preview with Delete / Reset */}
                {selectedImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-3 group h-40 bg-slate-950 flex items-center justify-center">
                    <img src={selectedImage} alt="Story Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-2.5">
                      <span className="text-[10px] text-white font-bold bg-black/50 px-2 py-0.5 rounded-md">
                        {deviceFileName ? `Device: ${deviceFileName}` : 'Preview'}
                      </span>
                      {deviceFileName && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeviceFileName(null);
                            setSelectedImage(SAMPLE_STORY_IMAGES[0].url);
                          }}
                          className="text-[10px] text-rose-300 hover:text-rose-100 bg-rose-900/70 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Reset
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Preset Clinical Library fallback */}
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5">
                    Or choose from clinical sample library:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_STORY_IMAGES.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedImage(img.url);
                          setDeviceFileName(null);
                        }}
                        className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                          selectedImage === img.url && !deviceFileName
                            ? 'border-sky-600 ring-2 ring-sky-300 dark:ring-sky-800 scale-95'
                            : 'border-slate-200 dark:border-slate-700 hover:opacity-90'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-14 object-cover" />
                        <span className="absolute bottom-0.5 left-0.5 text-[8px] font-bold bg-black/70 text-white px-1 py-0.5 rounded line-clamp-1">
                          {img.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: CAPTION INPUT */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Caption & Bedside Findings:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Post-op day 1: Successful bedside pleural tap completed with senior resident..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* SECTION 3: RECOMMENDATION HASHTAGS */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                  <Hash className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>3. Recommendation Hashtags (Boosts Discovery & Search):</span>
                </label>

                {/* Quick-tap Tag Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SUGGESTED_MEDICAL_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tag} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Hashtag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    placeholder="Type custom hashtag and press Enter (e.g. #Neurology)..."
                    className="flex-1 text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      let cleaned = customTagInput.trim();
                      if (!cleaned) return;
                      if (!cleaned.startsWith('#')) cleaned = `#${cleaned}`;
                      if (!selectedTags.includes(cleaned)) {
                        setSelectedTags([...selectedTags, cleaned]);
                      }
                      setCustomTagInput('');
                    }}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {selectedTags.length > 0 && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Selected: {selectedTags.join(', ')}
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedImage}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Saving to Database...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Share Story Update</span>
                    </>
                  )}
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
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetUserId = activeStory.userId;
                    setActiveStoryIndex(null);
                    if (onSelectUser) {
                      onSelectUser(targetUserId);
                    }
                  }}
                  className="flex items-center gap-2.5 text-left cursor-pointer group select-none active:opacity-80"
                  title={`Open ${activeStory.userName}'s medical profile`}
                >
                  <div className="relative">
                    <img
                      src={activeStory.userAvatar}
                      alt={activeStory.userName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-400 group-hover:ring-white transition"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white text-xs font-bold leading-tight group-hover:underline group-hover:text-sky-200 transition">
                      {activeStory.userName}
                    </p>
                    <p className="text-white/70 text-[10px]">{activeStory.timestamp}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition cursor-pointer"
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

            {/* Bottom Caption, Hashtags & Reply Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
              <p className="text-white text-xs sm:text-sm font-medium leading-relaxed drop-shadow mb-1.5">
                {activeStory.caption}
              </p>

              {/* Clinical Hashtags Display */}
              {((activeStory as any).clinicalTags && (activeStory as any).clinicalTags.length > 0) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(activeStory as any).clinicalTags.map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] font-semibold bg-sky-500/30 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

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
                    className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full transition cursor-pointer"
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
