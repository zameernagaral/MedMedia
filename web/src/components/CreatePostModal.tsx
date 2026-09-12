import React, { useState } from 'react';
import { X, Image, Link2, BarChart2, ShieldAlert, Sparkles, Send, Stethoscope } from 'lucide-react';
import { Post, UserProfile } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onPostCreated
}) => {
  const [postType, setPostType] = useState<'TEXT' | 'TWEET' | 'IMAGE_CASE' | 'ARTICLE_LINK' | 'CLINICAL_DISCUSSION'>('CLINICAL_DISCUSSION');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('#Cardiology #ClinicalCase');
  const [pollQuestion, setPollQuestion] = useState('Recommended Next Diagnostic Step:');
  const [pollOptions, setPollOptions] = useState(['CT Angiography', 'Echocardiography', 'Cardiac MRI', 'Coronary Angiogram']);
  const [hipaaAcknowledged, setHipaaAcknowledged] = useState(false);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=500&fit=crop');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
      mediaUrls: (postType === 'IMAGE_CASE' && imageUrl) ? [imageUrl] : undefined,
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Clinical Post</h3>
              <p className="text-[11px] text-slate-500">Posting as {currentUser.fullName} ({currentUser.badgeTitle})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector (Slide 5: Text, twits, Images, Links, Medical discussions - No shorts or reels) */}
        <div className="flex border-b border-slate-100 px-4 pt-2 gap-1 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { type: 'CLINICAL_DISCUSSION', label: 'Case Discussion & Poll' },
            { type: 'TEXT', label: 'Clinical Thought' },
            { type: 'TWEET', label: 'MedTweet' },
            { type: 'IMAGE_CASE', label: 'Image Case' },
            { type: 'ARTICLE_LINK', label: 'Journal Link' }
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setPostType(item.type as any)}
              className={`px-3 py-2 border-b-2 whitespace-nowrap transition ${
                postType === item.type
                  ? 'border-sky-600 text-sky-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <textarea
            rows={4}
            required
            placeholder={
              postType === 'CLINICAL_DISCUSSION'
                ? "Describe the patient presentation, vitals, clinical findings, and prompt your peer colleagues..."
                : postType === 'TWEET'
                ? "Share a high-yield clinical pearl, pharmacology warning, or study tip..."
                : "Share clinical insights, guidelines, or research observations..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {/* Diagnostic Poll Builder for Clinical Discussions */}
          {postType === 'CLINICAL_DISCUSSION' && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <span>Diagnostic Poll Options</span>
              </div>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll question..."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
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
                    className="text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image URL preview for Image Case */}
          {postType === 'IMAGE_CASE' && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Clinical Media / Imaging URL:
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Clinical Tags:
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="#Specialty #Topic"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          {/* HIPAA De-Identification Consent Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-amber-900">
              <label className="flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={hipaaAcknowledged}
                  onChange={(e) => setHipaaAcknowledged(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>I certify all patient identifiers (names, dates, MRN, faces) have been completely removed in compliance with medical privacy laws.</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hipaaAcknowledged || !content.trim()}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Publish to Medical Feed
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
