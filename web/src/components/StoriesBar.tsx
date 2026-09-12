import React, { useState } from 'react';
import { Plus, X, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story, UserProfile } from '../types';

interface StoriesBarProps {
  stories: Story[];
  currentUser: UserProfile;
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  onAddStory
}) => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  return (
    <section className="bg-white border-b border-slate-200 py-3.5 px-4 mb-4 shadow-sm rounded-2xl sm:rounded-2xl">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 tracking-wide uppercase">
          <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
          <span>Story Updates <span className="text-[10px] font-normal text-slate-400 capitalize">(Accessory Feature)</span></span>
        </div>
        <span className="text-[11px] text-sky-600 font-semibold cursor-pointer hover:underline">
          Clinical Highlights
        </span>
      </div>

      {/* Horizontal Story Bubble Row */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        
        {/* Current User Story Add Bubble */}
        <div
          onClick={onAddStory}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
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

        {/* Peer Medical Stories */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => setActiveStory(story)}
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
              {story.userName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story Lightbox / Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[650px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Top Bar with progress bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-white w-2/3 animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.userAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-400"
                  />
                  <div>
                    <p className="text-white text-xs font-bold leading-tight">{activeStory.userName}</p>
                    <p className="text-white/70 text-[10px]">{activeStory.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Image */}
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={activeStory.mediaUrl}
                alt="Story Media"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
              <p className="text-white text-sm font-medium leading-relaxed drop-shadow">
                {activeStory.caption}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Send a clinical reply..."
                  className="flex-1 bg-white/20 text-white placeholder-white/60 text-xs px-4 py-2.5 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button 
                  onClick={() => setActiveStory(null)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-full transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
