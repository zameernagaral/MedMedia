import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Film,
  ShieldCheck,
  Users,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Community, UserProfile } from '../types';
import { apiService } from '../services/api';

interface CommunityMessage {
  id: string;
  text: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  senderId: string;
  communityId: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    role: string;
  };
}

interface CommunityModalProps {
  community: Community;
  currentUser: UserProfile;
  isJoined: boolean;
  isCreator: boolean;
  onClose: () => void;
  onJoin: () => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  community,
  currentUser,
  isJoined,
  isCreator,
  onClose,
  onJoin
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string | null>(null);
  const [pendingMediaType, setPendingMediaType] = useState<'image' | 'video' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages from DB
  const loadMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const res = await apiService.getCommunityMessages(community.id);
      if (res.success) {
        setMessages(res.messages);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoadingMessages(false);
    }
  }, [community.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Poll for new messages every 5 seconds (realtime-lite)
  useEffect(() => {
    if (!isJoined) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [isJoined, loadMessages]);

  const handleSend = async () => {
    if (!inputText.trim() && !pendingMediaUrl) return;
    if (isSending) return;

    setIsSending(true);
    // Optimistic update
    const optimisticMsg: CommunityMessage = {
      id: `optimistic-${Date.now()}`,
      text: inputText.trim() || (pendingMediaType === 'image' ? '📷 Sent an image' : '🎬 Sent a video'),
      imageUrl: pendingMediaType === 'image' ? pendingMediaUrl : null,
      videoUrl: pendingMediaType === 'video' ? pendingMediaUrl : null,
      senderId: currentUser.id,
      communityId: community.id,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role
      }
    };

    setMessages(prev => [...prev, optimisticMsg]);
    const textToSend = inputText.trim();
    const imageToSend = pendingMediaType === 'image' ? pendingMediaUrl! : undefined;
    const videoToSend = pendingMediaType === 'video' ? pendingMediaUrl! : undefined;

    setInputText('');
    setPendingMediaUrl(null);
    setPendingMediaType(null);
    setPreviewImage(null);
    setPreviewVideo(null);

    try {
      const res = await apiService.sendCommunityMessage(
        community.id,
        textToSend || (pendingMediaType === 'image' ? '📷 Sent an image' : '🎬 Sent a video'),
        imageToSend,
        videoToSend
      );
      if (res.success && res.message) {
        // Replace the optimistic message with the real one
        setMessages(prev =>
          prev.map(m => m.id === optimisticMsg.id ? res.message : m)
        );
      }
    } catch {
      // revert optimistic if failed
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Image must be under 8MB');
      return;
    }
    setIsUploadingMedia(true);
    try {
      const url = await apiService.uploadMedia(file);
      setPendingMediaUrl(url);
      setPendingMediaType('image');
      setPreviewImage(url);
      setPreviewVideo(null);
    } catch {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingMedia(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      alert('Video must be under 100MB');
      return;
    }
    setIsUploadingMedia(true);
    try {
      const url = await apiService.uploadMedia(file);
      setPendingMediaUrl(url);
      setPendingMediaType('video');
      setPreviewVideo(url);
      setPreviewImage(null);
    } catch {
      alert('Failed to upload video. Please try again.');
    } finally {
      setIsUploadingMedia(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const clearPendingMedia = () => {
    setPendingMediaUrl(null);
    setPendingMediaType(null);
    setPreviewImage(null);
    setPreviewVideo(null);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: CommunityMessage[] }[] = [];
  for (const msg of messages) {
    const dateLabel = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateLabel) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, msgs: [msg] });
    }
  }

  const pct = Math.min(100, Math.round((community.membersCount / 10000) * 100));

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={community.avatarUrl || community.iconUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${community.name}`}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm shrink-0"
              alt=""
            />
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                {community.name}
                {community.isOfficial && <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 font-semibold rounded">
                  {community.category}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {community.membersCount.toLocaleString()} / 10,000
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isJoined && (
              <button
                onClick={onJoin}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition"
              >
                Join Community
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-900">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Loading messages…</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-500">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No messages yet</p>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                {isJoined
                  ? `Be the first to start the conversation in ${community.name}!`
                  : `Join the community to start chatting.`}
              </p>
            </div>
          ) : (
            groupedMessages.map(({ date, msgs }) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-3 py-0.5 rounded-full">
                    {date}
                  </span>
                </div>
                {msgs.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const initials = msg.sender.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                          {msg.sender.avatarUrl ? (
                            <img src={msg.sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-700 dark:text-sky-300 font-bold text-[10px]">
                              {initials}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 ml-1">
                            {msg.sender.fullName}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm break-words ${
                            isMe
                              ? 'bg-sky-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-sm'
                          } ${msg.id.startsWith('optimistic-') ? 'opacity-70' : ''}`}
                        >
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Community image"
                              className="rounded-xl max-w-full mb-1 cursor-pointer"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                              onClick={() => window.open(msg.imageUrl!, '_blank')}
                            />
                          )}
                          {msg.videoUrl && (
                            <video
                              src={msg.videoUrl}
                              controls
                              className="rounded-xl max-w-full mb-1"
                              style={{ maxHeight: '200px' }}
                            />
                          )}
                          {msg.text && <span>{msg.text}</span>}
                        </div>
                        <span className={`text-[9px] text-slate-400 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.createdAt)}
                          {msg.id.startsWith('optimistic-') && ' · Sending…'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Media Preview */}
        {(previewImage || previewVideo) && (
          <div className="px-4 py-2 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="relative inline-block">
              {previewImage && (
                <img src={previewImage} alt="Preview" className="h-20 rounded-xl object-cover border border-slate-200" />
              )}
              {previewVideo && (
                <video src={previewVideo} className="h-20 rounded-xl border border-slate-200" />
              )}
              <button
                onClick={clearPendingMedia}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] hover:bg-rose-600 transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        {isJoined ? (
          <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />

            {isUploadingMedia ? (
              <Loader2 className="w-5 h-5 text-sky-500 animate-spin shrink-0" />
            ) : (
              <>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition shrink-0"
                  title="Send image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition shrink-0"
                  title="Send video"
                >
                  <Film className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message the community…"
                className="w-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white rounded-xl py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleSend}
                disabled={isSending || (!inputText.trim() && !pendingMediaUrl)}
                className="absolute right-2 top-1.5 p-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg transition"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Lock className="w-4 h-4" />
              <span>Join to start chatting</span>
            </div>
            <button
              onClick={onJoin}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition"
            >
              Join Community
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
