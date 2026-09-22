import React, { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Link2, 
  BarChart2, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  Stethoscope, 
  Upload, 
  Hash, 
  Trash2,
  Clock,
  Film,
  AlertCircle
} from 'lucide-react';
import { Post, UserProfile, Story } from '../types';
import { apiService } from '../services/api';

interface CreatePostModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  initialMode?: 'post' | 'story';
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  onStoryCreated?: (story: Story) => void;
}

const POPULAR_POST_TAGS = [
  '#Cardiology',
  '#GeneralSurgery',
  '#Pediatrics',
  '#InternalMedicine',
  '#Neurology',
  '#Orthopedics',
  '#Pharmacology',
  '#MedicalStudent',
  '#Internship',
  '#ClinicalCase',
  '#USMLE',
  '#NEETPG'
];

const SAMPLE_STORY_IMAGES = [
  { label: 'Cath Lab Procedure', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&h=1000&fit=crop' },
  { label: 'Pediatric Rounds', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=700&h=1000&fit=crop' },
  { label: 'Surgical OR Prep', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=700&h=1000&fit=crop' },
  { label: 'Ward Rounds', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=700&h=1000&fit=crop' }
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  currentUser,
  initialMode = 'post',
  onClose,
  onPostCreated,
  onStoryCreated
}) => {
  // Toggle between creating a regular Post vs a 24-Hour Story
  const [creationMode, setCreationMode] = useState<'post' | 'story'>(initialMode);

  // Common Media & File State
  const [mediaUrl, setMediaUrl] = useState(() => initialMode === 'story' ? SAMPLE_STORY_IMAGES[0].url : '');
  const [isVideo, setIsVideo] = useState(false);
  const [deviceFileName, setDeviceFileName] = useState<string | null>(null);
  const [videoWarning, setVideoWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post Specific State
  const [postType, setPostType] = useState<'TWEET' | 'IMAGE_CASE' | 'TEXT' | 'CLINICAL_DISCUSSION'>('TWEET');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('#Cardiology #ClinicalCase');
  const [pollQuestion, setPollQuestion] = useState('Recommended Next Diagnostic Step:');
  const [pollOptions, setPollOptions] = useState(['CT Angiography', 'Echocardiography', 'Cardiac MRI', 'Coronary Angiogram']);
  const [hipaaAcknowledged, setHipaaAcknowledged] = useState(false);

  // Story Specific State
  const [storyCaption, setStoryCaption] = useState('');
  const [storyTags, setStoryTags] = useState<string[]>(['#BedsideRounds', '#MedicalStudent']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle device file upload (Images & Videos with 30-sec limit checking)
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeviceFileName(file.name);
    setVideoWarning(null);

    const isVid = file.type.startsWith('video/');
    setIsVideo(isVid);

    // 30s video limit check
    if (isVid) {
      const vidObj = document.createElement('video');
      vidObj.preload = 'metadata';
      vidObj.onloadedmetadata = () => {
        window.URL.revokeObjectURL(vidObj.src);
        if (vidObj.duration > 30) {
          setVideoWarning(`Video is ${Math.round(vidObj.duration)}s. Stories are strictly limited to 30 seconds max (playback capped at 30s).`);
        } else {
          setVideoWarning(`Video duration: ${Math.round(vidObj.duration)}s (within 30s story limit).`);
        }
      };
      vidObj.src = URL.createObjectURL(file);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setMediaUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) => {
    if (creationMode === 'post') {
      const currentTags = tagInput.split(' ').map(t => t.trim()).filter(Boolean);
      if (currentTags.includes(tag)) {
        setTagInput(currentTags.filter(t => t !== tag).join(' '));
      } else {
        setTagInput([...currentTags, tag].join(' '));
      }
    } else {
      if (storyTags.includes(tag)) {
        setStoryTags(storyTags.filter(t => t !== tag));
      } else {
        setStoryTags([...storyTags, tag]);
      }
    }
  };

  // Submit Post
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tags = tagInput.split(' ').filter(t => t.startsWith('#'));

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorRole: currentUser.role,
      authorSpecializationOrDiscipline: currentUser.role === 'DOCTOR'
        ? (currentUser.doctorDetails?.specialization || "Clinical Medicine")
        : (currentUser.studentDetails?.discipline.replace('_', ' ') || "Medical Scholar"),
      isVerified: currentUser.verificationStatus === 'VERIFIED',
      postType,
      content,
      mediaUrls: mediaUrl ? [mediaUrl] : undefined,
      clinicalTags: tags.length > 0 ? tags : ["#ClinicalDiscussion"],
      casePoll: postType === 'CLINICAL_DISCUSSION' ? {
        question: pollQuestion,
        options: pollOptions.map((text, idx) => ({ id: `opt-${idx}`, text, votes: 0 })),
        totalVotes: 0
      } : undefined,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      createdAt: "Just now"
    };

    onPostCreated(newPost);
    onClose();
  };

  // Submit Story (30s limit saved to MySQL & local database)
  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMedia = mediaUrl || SAMPLE_STORY_IMAGES[0].url;

    setIsSubmitting(true);
    try {
      const created = await apiService.createStory({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userAvatar: currentUser.avatarUrl,
        mediaUrl: finalMedia,
        caption: storyCaption.trim() || 'Clinical update from ward rounds',
        clinicalTags: storyTags,
        isVideo: isVideo
      });

      if (onStoryCreated) {
        onStoryCreated(created);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create story:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 transition-colors duration-200">
        
        {/* Header with Post vs Story Mode Switcher */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">MedMedia Creator Studio</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Posting as {currentUser.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Mode Selector: Post vs 24h Story */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 mx-4 sm:mx-5 mt-4 rounded-2xl">
          <button
            type="button"
            onClick={() => setCreationMode('post')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              creationMode === 'post'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Create Feed Post</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setCreationMode('story');
              if (!mediaUrl) setMediaUrl(SAMPLE_STORY_IMAGES[0].url);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              creationMode === 'story'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Add 24h Story</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-extrabold">
              30s Max
            </span>
          </button>
        </div>

        {/* ================= MODE 1: CREATE FEED POST ================= */}
        {creationMode === 'post' && (
          <form onSubmit={handlePostSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Post Content Type Selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2 gap-1 overflow-x-auto no-scrollbar text-xs font-semibold">
              {[
                { type: 'TWEET', label: 'Medtweet' },
                { type: 'IMAGE_CASE', label: 'Imaging / Case Study' },
                { type: 'TEXT', label: 'Clinical Thought' },
                { type: 'CLINICAL_DISCUSSION', label: 'Case & Diagnostic Poll' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setPostType(item.type as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    postType === item.type
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-800'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Post Content Input */}
            <textarea
              rows={4}
              required
              placeholder={
                postType === 'CLINICAL_DISCUSSION'
                  ? "Describe the patient presentation, vitals, clinical findings, and prompt your peer colleagues..."
                  : postType === 'TWEET'
                  ? "Share a high-yield clinical pearl, pharmacology warning, or exam tip..."
                  : "Share clinical insights, guidelines, or research observations..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            {/* Diagnostic Poll Builder */}
            {postType === 'CLINICAL_DISCUSSION' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <BarChart2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Diagnostic Poll Options</span>
                </div>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Poll question..."
                  className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[i] = e.target.value;
                        setPollOptions(updated);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Device Media Upload (Image / Video from laptop or phone) */}
            <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Attach Clinical Media / Video from Device:</span>
                {deviceFileName && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[180px]">
                    ✓ {deviceFileName}
                  </span>
                )}
              </label>
              
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleDeviceUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-sky-100 transition"
                >
                  <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{deviceFileName ? 'Change File from Device' : 'Upload Image / Video from Device'}</span>
                </button>

                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">or URL:</span>
                
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setDeviceFileName(null);
                  }}
                  placeholder="https://..."
                  className="flex-1 w-full text-xs p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                />
              </div>

              {mediaUrl && (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                  {isVideo ? (
                    <video src={mediaUrl} controls className="w-full h-44 object-contain" />
                  ) : (
                    <img src={mediaUrl} alt="Case Preview" className="w-full h-44 object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('');
                      setDeviceFileName(null);
                      setIsVideo(false);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full cursor-pointer"
                    title="Remove Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Medical Hashtags with Quick-Tap Chips */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Recommendation Hashtags:</span>
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {POPULAR_POST_TAGS.map((tag) => {
                  const isSelected = tagInput.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
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

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. #Cardiology #ClinicalCase #ECGChallenge"
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none"
              />
            </div>

            {/* HIPAA Notice */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-amber-900 dark:text-amber-200">
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={hipaaAcknowledged}
                    onChange={(e) => setHipaaAcknowledged(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                  />
                  <span>I certify patient identifiers (names, MRN, faces) have been completely removed.</span>
                </label>
              </div>
            </div>

            {/* Post Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hipaaAcknowledged || !content.trim()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Publish to Medical Feed
              </button>
            </div>

          </form>
        )}

        {/* ================= MODE 2: ADD 24H STORY (30s LIMIT) ================= */}
        {creationMode === 'story' && (
          <form onSubmit={handleStorySubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* 30 Seconds Limit Highlight Banner */}
            <div className="p-3 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    24-Hour Clinical Story
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Strictly limited to 30 seconds max duration
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-600 text-white rounded-full">
                ⏱️ 30s Limit
              </span>
            </div>

            {/* Device Media Upload (Image or Video from Laptop/Device) */}
            <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Upload Story Photo or Video from Device:</span>
                {deviceFileName && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[180px]">
                    ✓ {deviceFileName}
                  </span>
                )}
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                className="hidden"
                onChange={handleDeviceUpload}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-300 dark:border-sky-700 hover:border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 rounded-2xl p-4 text-center cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {deviceFileName ? 'Change Media from Device' : 'Choose Photo or Video from Device'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Supports JPG, PNG, MP4, MOV (max 30 seconds duration)
                </p>
              </div>

              {/* 30s Warning if applicable */}
              {videoWarning && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{videoWarning}</span>
                </div>
              )}

              {/* Story Media Preview */}
              {mediaUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-44 bg-slate-950 flex items-center justify-center">
                  {isVideo ? (
                    <video src={mediaUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={mediaUrl} alt="Story Preview" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>30s Story</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('');
                      setDeviceFileName(null);
                      setIsVideo(false);
                      setVideoWarning(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full cursor-pointer"
                    title="Remove Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Sample preset images */}
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5">
                  Or select sample clinical case image:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_STORY_IMAGES.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setMediaUrl(img.url);
                        setDeviceFileName(null);
                        setIsVideo(false);
                        setVideoWarning(null);
                      }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        mediaUrl === img.url && !deviceFileName
                          ? 'border-sky-600 ring-2 ring-sky-300 dark:ring-sky-800 scale-95'
                          : 'border-slate-200 dark:border-slate-700 hover:opacity-90'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-12 object-cover" />
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] font-bold bg-black/70 text-white px-1 py-0.5 rounded line-clamp-1">
                        {img.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Story Caption Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Story Caption / Bedside Notes:
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g., Morning rounds: successful pleurocentesis performed under ultrasound guidance..."
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Story Recommendation Hashtags */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Story Recommendation Tags:</span>
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {POPULAR_POST_TAGS.map((tag) => {
                  const isSelected = storyTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
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

              {storyTags.length > 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Active tags: {storyTags.join(', ')}
                </p>
              )}
            </div>

            {/* Story Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Saving to MySQL...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Share 30s Story</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
