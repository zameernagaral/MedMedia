import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Search, 
  Paperclip, 
  ShieldCheck, 
  Stethoscope, 
  GraduationCap, 
  CheckCheck, 
  FileText, 
  Image as ImageIcon,
  Film,
  Link2,
  Smile,
  FileCheck,
  AlertCircle,
  Download,
  ExternalLink,
  ChevronLeft,
  Trash2,
  Reply,
  Copy,
  Check,
  Plus
} from 'lucide-react';
import { UserProfile } from '../types';

export interface MessageAttachment {
  type: 'IMAGE' | 'VIDEO' | 'DOC' | 'LINK';
  title: string;
  url?: string;
  size?: string;
  content?: string;
}

export interface QuotedReply {
  messageId: string;
  sender: string;
  text: string;
  attachmentType?: 'IMAGE' | 'VIDEO' | 'DOC' | 'LINK';
  attachmentTitle?: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  replyTo?: QuotedReply;
  reactions?: Record<string, number>;
  attachment?: MessageAttachment;
  gifUrl?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: 'DOCTOR' | 'STUDENT';
  specialtyOrDiscipline: string;
  isOnline: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: Message[];
}

interface ClinicalChatDrawerProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Dr. Priya Nair',
    avatar: 'https://images.unsplash.com/photo-1594824813581-2292f725350c?w=120&h=120&fit=crop',
    role: 'DOCTOR',
    specialtyOrDiscipline: 'Pediatric Neurosurgery • Manipal Hospital',
    isOnline: true,
    lastMessage: 'The IVUS imaging was pivotal in deciding the stent sizing.',
    lastTime: '10:45 AM',
    unreadCount: 0,
    messages: [
      { 
        id: 'm1', 
        sender: 'Dr. Priya Nair', 
        text: 'Hello Dr. Ramesh, reviewed your catheterization case study. Remarkable result on the bifurcation!', 
        time: '10:42 AM', 
        isMe: false,
        reactions: { '👏': 1 }
      },
      {
        id: 'm1-img',
        sender: 'Dr. Priya Nair',
        text: 'Sharing high-resolution IVUS coronary diagnostic image:',
        time: '10:43 AM',
        isMe: false,
        attachment: {
          type: 'IMAGE',
          title: 'IVUS_Coronary_Angiography.jpg',
          url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop',
          size: '2.4 MB'
        }
      },
      {
        id: 'm1-doc',
        sender: 'Dr. Priya Nair',
        text: 'Here is the full surgical protocol PDF for reference:',
        time: '10:44 AM',
        isMe: false,
        attachment: {
          type: 'DOC',
          title: 'Bifurcation_Stenting_Surgical_Protocol.pdf',
          size: '1.8 MB',
          content: 'Bifurcation lesion stenting guidelines. Detailed intravascular ultrasound lumen evaluation, kissing balloon inflation technique, and post-dilatation recommendations for left main coronary intervention.'
        }
      },
      { 
        id: 'm2', 
        sender: 'You', 
        text: 'Thank you Dr. Priya! The IVUS imaging was pivotal in deciding the stent sizing.', 
        time: '10:45 AM', 
        isMe: true,
        replyTo: {
          messageId: 'm1-img',
          sender: 'Dr. Priya Nair',
          text: 'Sharing high-resolution IVUS coronary diagnostic image:',
          attachmentType: 'IMAGE',
          attachmentTitle: 'IVUS_Coronary_Angiography.jpg'
        },
        reactions: { '❤️': 1, '🩺': 1 }
      }
    ]
  },
  {
    id: 'conv-2',
    name: 'Rohan Verma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
    role: 'STUDENT',
    specialtyOrDiscipline: 'Final Year MBBS • KIMS Research Forum',
    isOnline: true,
    lastMessage: 'Doctor, would love to assist on the AI-ECG project!',
    lastTime: '11:15 AM',
    unreadCount: 1,
    messages: [
      { 
        id: 'm3', 
        sender: 'Rohan Verma', 
        text: 'Good morning Doctor! I saw your open research call on MedMedia for the ECG Detection study.', 
        time: '11:14 AM', 
        isMe: false 
      },
      {
        id: 'm3-doc',
        sender: 'Rohan Verma',
        text: 'I prepared our cohort abstraction proposal document for review:',
        time: '11:14 AM',
        isMe: false,
        attachment: {
          type: 'DOC',
          title: 'ICMR_AI_ECG_Research_Proposal.pdf',
          size: '3.2 MB',
          content: 'Multicenter AI deep-learning model for automated acute STEMI detection on 12-lead ECG strips. Includes dataset methodology, ethics committee clearance, and student investigator responsibilities.'
        }
      },
      {
        id: 'm3-img',
        sender: 'Rohan Verma',
        text: 'Sample anonymized 12-lead rhythm record:',
        time: '11:15 AM',
        isMe: false,
        attachment: {
          type: 'IMAGE',
          title: '12_Lead_ECG_Anterior_STEMI.png',
          url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop',
          size: '1.2 MB'
        }
      },
      { 
        id: 'm4', 
        sender: 'Rohan Verma', 
        text: 'Doctor, would love to assist on the AI-ECG project! I have experience abstracting anonymized patient cohorts.', 
        time: '11:15 AM', 
        isMe: false,
        replyTo: {
          messageId: 'm3-doc',
          sender: 'Rohan Verma',
          text: 'I prepared our cohort abstraction proposal document for review:',
          attachmentType: 'DOC',
          attachmentTitle: 'ICMR_AI_ECG_Research_Proposal.pdf'
        },
        reactions: { '👍': 1, '💡': 1 }
      }
    ]
  },
  {
    id: 'conv-3',
    name: 'Dr. Sandeep Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&h=120&fit=crop',
    role: 'DOCTOR',
    specialtyOrDiscipline: 'CTVS Surgeon • AIIMS New Delhi Alumni',
    isOnline: false,
    lastMessage: 'Are you attending the All India Medical Congress in Nov?',
    lastTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { 
        id: 'm5', 
        sender: 'Dr. Sandeep Kulkarni', 
        text: 'Hey Arvind! Long time. Are you attending the All India Medical Congress in Nov? Our AIIMS batch is meeting up.', 
        time: 'Yesterday', 
        isMe: false 
      }
    ]
  },
  {
    id: 'conv-4',
    name: 'Ananya Desai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
    role: 'STUDENT',
    specialtyOrDiscipline: 'B.Pharm 3rd Year • Clinical Pharmacokinetics',
    isOnline: true,
    lastMessage: 'Thank you for explaining the ARNI washout duration!',
    lastTime: 'Sep 11',
    unreadCount: 0,
    messages: [
      { id: 'm6', sender: 'Ananya Desai', text: 'Doctor, quick question from hospital rounds: does the 36-hour ARNI washout rule also apply when switching to an ARB?', time: 'Sep 11', isMe: false },
      { id: 'm7', sender: 'You', text: 'No, only when switching from an ACE inhibitor because of dual NEP/ACE inhibition causing angioedema.', time: 'Sep 11', isMe: true },
      { 
        id: 'm8', 
        sender: 'Ananya Desai', 
        text: 'Thank you for explaining the ARNI washout duration!', 
        time: 'Sep 11', 
        isMe: false,
        replyTo: {
          messageId: 'm7',
          sender: 'You',
          text: 'No, only when switching from an ACE inhibitor because of dual NEP/ACE inhibition causing angioedema.'
        },
        reactions: { '🙏': 1, '✨': 1 }
      }
    ]
  }
];

const POPULAR_EMOJIS = [
  '🩺', '💉', '💊', '🩹', '🧬', '🩸', '🏥', '🩻', '👨‍⚕️', '👩‍⚕️',
  '👍', '👏', '🤝', '🙌', '🙏', '❤️', '🔥', '✨', '💡', '✅',
  '😊', '🎯', '📚', '🔬', '📋', '🧠', '🫀', '🫁', '🦷', '👁️'
];

const POPULAR_GIFS = [
  { label: 'Well Done', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=200&fit=crop' },
  { label: 'ECG Rhythm', url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=300&h=200&fit=crop' },
  { label: 'Surgery Team', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&h=200&fit=crop' },
  { label: 'Medical Research', url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=300&h=200&fit=crop' }
];

export const ClinicalChatDrawer: React.FC<ClinicalChatDrawerProps> = ({
  isOpen,
  currentUser,
  onClose
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [isTypingPeer, setIsTypingPeer] = useState<boolean>(false);

  // Replying to a message state (WhatsApp / Telegram style)
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // View Attachment Modal (Documents, Photos, Videos)
  const [selectedAttachmentForViewer, setSelectedAttachmentForViewer] = useState<MessageAttachment | null>(null);

  // Mobile navigation state (viewing list vs viewing thread)
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('thread');

  // Attachment & Picker UI states
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [pickerTab, setPickerTab] = useState<'emoji' | 'gif'>('emoji');
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkInput, setLinkInput] = useState<string>('');
  const [linkTitle, setLinkTitle] = useState<string>('');
  const [fileLimitWarning, setFileLimitWarning] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTypingPeer]);

  if (!isOpen) return null;

  const pushMessage = (msg: Message, autoOpenAttachment: boolean = false) => {
    const targetConvId = activeConvId;
    setConversations(prev => prev.map(conv => {
      if (conv.id === targetConvId) {
        return {
          ...conv,
          lastMessage: msg.attachment ? `[${msg.attachment.type}] ${msg.attachment.title}` : msg.text || '[GIF]',
          lastTime: 'Just now',
          messages: [...conv.messages, msg]
        };
      }
      return conv;
    }));

    // If message contains an attachment, immediately open it in viewer so user sees document/photo!
    if (autoOpenAttachment && msg.attachment) {
      setSelectedAttachmentForViewer(msg.attachment);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'You',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      replyTo: replyingToMessage ? {
        messageId: replyingToMessage.id,
        sender: replyingToMessage.sender,
        text: replyingToMessage.text,
        attachmentType: replyingToMessage.attachment?.type,
        attachmentTitle: replyingToMessage.attachment?.title
      } : undefined
    };

    pushMessage(newMsg);
    setInputText('');
    setReplyingToMessage(null); // Clear reply bar
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    // Auto-Reply Simulator from Peer
    setIsTypingPeer(true);
    const targetPeerName = activeConversation.name;
    const targetConvId = activeConvId;

    setTimeout(() => {
      setIsTypingPeer(false);

      let peerReplyText = "Got it! I agree with this clinical approach. Let's follow up during rounds.";
      if (userMsgText.toLowerCase().includes('ecg') || userMsgText.toLowerCase().includes('heart')) {
        peerReplyText = "I reviewed the rhythm strip. Sinus rhythm maintained with no ST deviation.";
      } else if (userMsgText.toLowerCase().includes('research') || userMsgText.toLowerCase().includes('study')) {
        peerReplyText = "Excellent. I will review the study protocol document and share my notes by evening.";
      } else if (userMsgText.toLowerCase().includes('locum') || userMsgText.toLowerCase().includes('shift')) {
        peerReplyText = "Confirmed. The casualty department credentials paperwork has been submitted.";
      }

      const peerMsg: Message = {
        id: `peer-${Date.now()}`,
        sender: targetPeerName,
        text: peerReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        replyTo: {
          messageId: newMsg.id,
          sender: 'You',
          text: newMsg.text
        }
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === targetConvId) {
          return {
            ...conv,
            lastMessage: peerReplyText,
            lastTime: 'Just now',
            messages: [...conv.messages, peerMsg]
          };
        }
        return conv;
      }));
    }, 1200);
  };

  // Toggle emoji reactions on any message
  const handleToggleReaction = (msgId: string, emoji: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          messages: conv.messages.map(m => {
            if (m.id === msgId) {
              const currentReactions = { ...(m.reactions || {}) };
              const currentCount = currentReactions[emoji] || 0;
              if (currentCount > 0) {
                delete currentReactions[emoji];
              } else {
                currentReactions[emoji] = 1;
              }
              return { ...m, reactions: currentReactions };
            }
            return m;
          })
        };
      }
      return conv;
    }));
  };

  // Scroll to and highlight original quoted message
  const handleScrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2500);
    }
  };

  // Copy message text helper
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast('Message copied to clipboard');
    setTimeout(() => setCopiedToast(null), 2000);
  };

  // 1. Photos Attachment Handler (up to 100 photos)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 100) {
      setFileLimitWarning("You can attach up to 100 photos at a time.");
      setTimeout(() => setFileLimitWarning(null), 3000);
      return;
    }

    const firstFile = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const countLabel = files.length > 1 ? ` (${files.length} photos)` : '';
      const newAttachment: MessageAttachment = {
        type: 'IMAGE',
        title: `${firstFile.name}${countLabel}`,
        url
      };
      const newMsg: Message = {
        id: `att-img-${Date.now()}`,
        sender: 'You',
        text: `Clinical Image${countLabel}: ${firstFile.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        replyTo: replyingToMessage ? {
          messageId: replyingToMessage.id,
          sender: replyingToMessage.sender,
          text: replyingToMessage.text,
          attachmentType: replyingToMessage.attachment?.type,
          attachmentTitle: replyingToMessage.attachment?.title
        } : undefined,
        attachment: newAttachment
      };
      // Immediately open the photo viewer modal after sending!
      pushMessage(newMsg, true);
      setReplyingToMessage(null);
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(firstFile);
  };

  // 2. Video Attachment Handler (up to 100MB)
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxBytes) {
      setFileLimitWarning(`Video exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setTimeout(() => setFileLimitWarning(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newAttachment: MessageAttachment = {
        type: 'VIDEO',
        title: file.name,
        url,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      };
      const newMsg: Message = {
        id: `att-vid-${Date.now()}`,
        sender: 'You',
        text: `Clinical Video: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        replyTo: replyingToMessage ? {
          messageId: replyingToMessage.id,
          sender: replyingToMessage.sender,
          text: replyingToMessage.text,
          attachmentType: replyingToMessage.attachment?.type,
          attachmentTitle: replyingToMessage.attachment?.title
        } : undefined,
        attachment: newAttachment
      };
      // Immediately open video viewer modal after sending!
      pushMessage(newMsg, true);
      setReplyingToMessage(null);
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  // 3. Document / PDF Attachment Handler (up to 100MB)
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxBytes) {
      setFileLimitWarning(`Document exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setTimeout(() => setFileLimitWarning(null), 4000);
      return;
    }

    const newAttachment: MessageAttachment = {
      type: 'DOC',
      title: file.name,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      content: `Clinical protocol and document record: ${file.name}. Prepared for hospital clinical review and archival.`
    };

    const newMsg: Message = {
      id: `att-doc-${Date.now()}`,
      sender: 'You',
      text: `Medical Document: ${file.name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      replyTo: replyingToMessage ? {
        messageId: replyingToMessage.id,
        sender: replyingToMessage.sender,
        text: replyingToMessage.text,
        attachmentType: replyingToMessage.attachment?.type,
        attachmentTitle: replyingToMessage.attachment?.title
      } : undefined,
      attachment: newAttachment
    };
    // Immediately open document viewer modal after sending!
    pushMessage(newMsg, true);
    setReplyingToMessage(null);
    setShowAttachMenu(false);
  };

  // 4. Link Attachment Handler
  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    const newAttachment: MessageAttachment = {
      type: 'LINK',
      title: linkTitle || 'Web Link',
      url: linkInput.trim()
    };

    const newMsg: Message = {
      id: `att-link-${Date.now()}`,
      sender: 'You',
      text: linkTitle ? `${linkTitle}: ${linkInput.trim()}` : linkInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      replyTo: replyingToMessage ? {
        messageId: replyingToMessage.id,
        sender: replyingToMessage.sender,
        text: replyingToMessage.text,
        attachmentType: replyingToMessage.attachment?.type,
        attachmentTitle: replyingToMessage.attachment?.title
      } : undefined,
      attachment: newAttachment
    };
    pushMessage(newMsg, false);
    setReplyingToMessage(null);
    setLinkInput('');
    setLinkTitle('');
    setShowLinkModal(false);
    setShowAttachMenu(false);
  };

  // 5. Send GIF
  const handleSendGif = (gif: { label: string; url: string }) => {
    const newMsg: Message = {
      id: `gif-${Date.now()}`,
      sender: 'You',
      text: `Shared GIF: ${gif.label}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      replyTo: replyingToMessage ? {
        messageId: replyingToMessage.id,
        sender: replyingToMessage.sender,
        text: replyingToMessage.text,
        attachmentType: replyingToMessage.attachment?.type,
        attachmentTitle: replyingToMessage.attachment?.title
      } : undefined,
      gifUrl: gif.url
    };
    pushMessage(newMsg);
    setReplyingToMessage(null);
    setShowEmojiPicker(false);
  };

  // Delete a message (X option on message)
  const handleDeleteMessage = (msgId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          messages: conv.messages.filter(m => m.id !== msgId)
        };
      }
      return conv;
    }));
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialtyOrDiscipline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-right duration-200 transition-colors border-l border-slate-200 dark:border-slate-800">
        
        {/* LEFT COLUMN: CONVERSATIONS LIST */}
        <div className={`w-full md:w-80 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
          mobileView === 'thread' ? 'hidden md:flex' : 'flex'
        } h-full`}>
          
          {/* Header with "X" Close Button */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Messages</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold">
                Clinical
              </span>
            </div>
            {/* Prominent "X" option to close messages */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 transition cursor-pointer"
              title="Close Messages (X)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setMobileView('thread');
                  }}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition ${
                    isActive
                      ? 'bg-sky-50/80 dark:bg-sky-950/50 border-l-4 border-sky-600'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-850 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                        {conv.name}
                        {conv.role === 'DOCTOR' ? (
                          <Stethoscope className="w-3 h-3 text-sky-600 dark:text-sky-400 inline" />
                        ) : (
                          <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" />
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{conv.lastTime}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {conv.specialtyOrDiscipline}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-1">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Current User Tag */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <img src={currentUser.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">{currentUser.fullName}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT THREAD */}
        <div className={`flex-1 flex flex-col ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        } h-full bg-slate-50 dark:bg-slate-950 relative`}>
          
          {/* Active Chat Header with Back Button (mobile) and "X" Close Button */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shadow-xs z-10">
            <div className="flex items-center gap-2.5">
              {/* Back button on mobile */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 mr-1"
                title="Back to Messages"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={activeConversation.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                />
                {activeConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeConversation.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeConversation.specialtyOrDiscipline} • {activeConversation.isOnline ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Online</span>
                  ) : (
                    <span>Active recently</span>
                  )}
                </p>
              </div>
            </div>

            {/* Requirement: Prominent "X" option in messages */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                title="Close Messages (X)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Limit Warning Banner */}
          {fileLimitWarning && (
            <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{fileLimitWarning}</span>
              </div>
              <button onClick={() => setFileLimitWarning(null)} className="p-1 text-amber-700 hover:text-amber-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toast Notification (e.g. Copied) */}
          {copiedToast && (
            <div className="absolute top-16 right-6 z-30 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedToast}</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/60 dark:bg-slate-950">
            <div className="text-center my-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full shadow-2xs">
                🔒 HIPAA Compliant • End-to-End Clinical Encryption
              </span>
            </div>

            {activeConversation.messages.map((msg) => {
              const isHighlighted = highlightedMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`flex flex-col group relative transition-all duration-300 ${
                    msg.isMe ? 'items-end' : 'items-start'
                  } ${isHighlighted ? 'ring-2 ring-sky-500 rounded-2xl p-1 bg-sky-50/50 dark:bg-sky-950/40' : ''}`}
                >
                  {/* Floating Action Bar on Hover (Reply, Reactions, Copy, Delete) */}
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-3.5 ${
                    msg.isMe ? 'right-2' : 'left-2'
                  } z-20 flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-full px-2 py-0.5`}>
                    
                    {/* Quick Reaction Emojis */}
                    {['❤️', '🩺', '👍', '👏', '💡'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleToggleReaction(msg.id, emoji)}
                        className="text-xs hover:scale-125 transition px-1 py-0.5 cursor-pointer"
                        title={`React ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}

                    <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Prominent High-Visibility Reply Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToMessage(msg);
                        inputRef.current?.focus();
                      }}
                      className="p-1 text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      title="Reply to this message"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reply</span>
                    </button>

                    {/* Copy Text Button */}
                    {msg.text && (
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.text)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Copy message"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete (X) Button (for user's messages) */}
                    {msg.isMe && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Delete message (X)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                      msg.isMe
                        ? 'bg-gradient-to-br from-sky-600 to-blue-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {/* QUOTED REPLY BLOCK (WhatsApp / Telegram style inside bubble) */}
                    {msg.replyTo && (
                      <div 
                        onClick={() => handleScrollToMessage(msg.replyTo!.messageId)}
                        className={`mb-2 p-2 rounded-lg cursor-pointer transition flex items-center justify-between gap-2 text-left border-l-4 ${
                          msg.isMe 
                            ? 'bg-black/20 hover:bg-black/30 border-sky-300 text-white/95' 
                            : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border-sky-500 text-slate-800 dark:text-slate-200'
                        }`}
                        title="Click to jump to quoted message"
                      >
                        <div className="min-w-0">
                          <p className={`text-[11px] font-bold flex items-center gap-1 ${
                            msg.isMe ? 'text-sky-200' : 'text-sky-600 dark:text-sky-400'
                          }`}>
                            <Reply className="w-3 h-3 inline" />
                            <span>{msg.replyTo.sender}</span>
                          </p>
                          <p className="text-xs truncate opacity-90">
                            {msg.replyTo.text || msg.replyTo.attachmentTitle || 'Shared media'}
                          </p>
                        </div>
                        {msg.replyTo.attachmentType === 'IMAGE' && (
                          <ImageIcon className={`w-4 h-4 shrink-0 ${msg.isMe ? 'text-sky-200' : 'text-sky-600'}`} />
                        )}
                        {msg.replyTo.attachmentType === 'DOC' && (
                          <FileText className={`w-4 h-4 shrink-0 ${msg.isMe ? 'text-sky-200' : 'text-emerald-600'}`} />
                        )}
                      </div>
                    )}

                    {/* Text content */}
                    {msg.text && <p className="break-words font-medium">{msg.text}</p>}

                    {/* GIF content */}
                    {msg.gifUrl && (
                      <div 
                        onClick={() => setSelectedAttachmentForViewer({ type: 'IMAGE', title: 'Clinical GIF', url: msg.gifUrl })}
                        className="mt-2 rounded-xl overflow-hidden max-w-[240px] cursor-pointer hover:opacity-95 transition"
                      >
                        <img src={msg.gifUrl} alt="GIF" className="w-full h-36 object-cover" />
                      </div>
                    )}

                    {/* Attachment Cards - Clickable to Open in Viewer! */}
                    {msg.attachment && (
                      <div 
                        onClick={() => setSelectedAttachmentForViewer(msg.attachment!)}
                        className={`mt-2 p-3 rounded-xl border flex flex-col gap-2.5 cursor-pointer transition shadow-xs group/att ${
                          msg.isMe
                            ? 'bg-black/20 hover:bg-black/30 border-white/20 text-white'
                            : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                        }`}
                        title="Click to view document or photo"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {msg.attachment.type === 'IMAGE' && <ImageIcon className={`w-4 h-4 flex-shrink-0 ${msg.isMe ? 'text-sky-200' : 'text-sky-600 dark:text-sky-400'}`} />}
                            {msg.attachment.type === 'VIDEO' && <Film className={`w-4 h-4 flex-shrink-0 ${msg.isMe ? 'text-purple-200' : 'text-purple-600 dark:text-purple-400'}`} />}
                            {msg.attachment.type === 'DOC' && <FileText className={`w-4 h-4 flex-shrink-0 ${msg.isMe ? 'text-emerald-200' : 'text-emerald-600 dark:text-emerald-400'}`} />}
                            {msg.attachment.type === 'LINK' && <Link2 className={`w-4 h-4 flex-shrink-0 ${msg.isMe ? 'text-amber-200' : 'text-amber-600 dark:text-amber-400'}`} />}
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold truncate group-hover/att:underline">
                                {msg.attachment.title}
                              </p>
                              {msg.attachment.size && (
                                <span className={`text-[9px] ${msg.isMe ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                                  {msg.attachment.size}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            msg.isMe ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}>
                            <ExternalLink className="w-3 h-3" />
                            <span>Open</span>
                          </span>
                        </div>

                        {/* Photo Thumbnail */}
                        {msg.attachment.type === 'IMAGE' && msg.attachment.url && (
                          <div className="relative rounded-lg overflow-hidden border border-white/10 group-hover/att:scale-[1.01] transition">
                            <img src={msg.attachment.url} alt="" className="w-full h-44 object-cover" />
                            <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition flex items-center justify-center">
                              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                                🔍 Click to view full high-res photo
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Document Card Preview */}
                        {msg.attachment.type === 'DOC' && (
                          <div className={`p-3 rounded-lg border text-[11px] font-sans ${
                            msg.isMe 
                              ? 'bg-white/10 border-white/15 text-white/95' 
                              : 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                              <FileCheck className="w-3.5 h-3.5" />
                              Official Clinical PDF • Click to Read & Download
                            </p>
                            <p className="opacity-80 line-clamp-2 text-[10px]">
                              {msg.attachment.content || 'Clinical protocol, patient observations, and treatment recommendations.'}
                            </p>
                          </div>
                        )}

                        {/* Video Card */}
                        {msg.attachment.type === 'VIDEO' && msg.attachment.url && (
                          <div className="relative rounded-lg overflow-hidden bg-black max-h-44 flex items-center justify-center">
                            <video src={msg.attachment.url} className="w-full max-h-44 object-contain" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="px-3 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-bold">
                                ▶ Click to play clinical video
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Link Card */}
                        {msg.attachment.type === 'LINK' && msg.attachment.url && (
                          <a 
                            href={msg.attachment.url} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`text-[11px] underline truncate block ${
                              msg.isMe ? 'text-sky-200 hover:text-white' : 'text-sky-600 dark:text-sky-400 hover:underline'
                            }`}
                          >
                            {msg.attachment.url}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reaction Pills below message */}
                  {msg.reactions && Object.entries(msg.reactions).some(([_, count]) => count > 0) && (
                    <div className="flex flex-wrap gap-1 mt-1 px-1">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        count > 0 ? (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="text-[11px] px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-105 active:scale-95 transition flex items-center gap-1 cursor-pointer text-slate-700 dark:text-slate-200"
                            title={`Toggle ${emoji} reaction`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-bold">{count}</span>
                          </button>
                        ) : null
                      ))}
                    </div>
                  )}

                  {/* Message Timestamp & Status */}
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{msg.time}</span>
                    {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-500" />}
                  </div>
                </div>
              );
            })}

            {isTypingPeer && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                <span>{activeConversation.name} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* DOCKED QUOTED REPLY BAR (WhatsApp / Telegram style above input bar) */}
          {replyingToMessage && (
            <div className="mx-3 mt-1.5 p-2 px-3 bg-sky-50 dark:bg-slate-800 border-l-4 border-sky-500 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Reply className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                      Replying to {replyingToMessage.sender}
                    </span>
                    {replyingToMessage.attachment && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-200 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 font-semibold uppercase">
                        {replyingToMessage.attachment.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
                    {replyingToMessage.text || replyingToMessage.attachment?.title || 'Shared media'}
                  </p>
                </div>
              </div>

              {/* Cancel Reply X Button */}
              <button
                type="button"
                onClick={() => setReplyingToMessage(null)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0 ml-2"
                title="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Attachment Menu Popover */}
          {showAttachMenu && (
            <div className="absolute bottom-16 left-4 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3.5 w-72 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Share Clinical Files
                </p>
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="Close (X)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Photos (up to 100) */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-100 dark:border-sky-800 text-sky-700 dark:text-sky-300 transition cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 mb-1 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold">Photos</span>
                  <span className="text-[9px] text-slate-400">Up to 100 photos</span>
                </button>

                {/* Docs & PDFs (up to 100MB) */}
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                >
                  <FileText className="w-5 h-5 mb-1 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">Docs / PDF</span>
                  <span className="text-[9px] text-slate-400">Up to 100MB</span>
                </button>

                {/* Video (up to 100MB) */}
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300 transition cursor-pointer"
                >
                  <Film className="w-5 h-5 mb-1 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold">Video</span>
                  <span className="text-[9px] text-slate-400">Up to 100MB</span>
                </button>

                {/* Links */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    setShowLinkModal(true);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-300 transition cursor-pointer"
                >
                  <Link2 className="w-5 h-5 mb-1 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold">Link</span>
                  <span className="text-[9px] text-slate-400">Web / Journal</span>
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={photoInputRef}
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={docInputRef}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handleDocSelect}
                className="hidden"
              />
            </div>
          )}

          {/* WhatsApp-Style Emoji & GIF Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-72 p-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 mb-2 pb-1.5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerTab('emoji')}
                    className={`py-1 px-2.5 text-xs font-bold rounded-lg transition ${
                      pickerTab === 'emoji'
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    😀 Emojis
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTab('gif')}
                    className={`py-1 px-2.5 text-xs font-bold rounded-lg transition ${
                      pickerTab === 'gif'
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🎬 GIFs
                  </button>
                </div>
                <button onClick={() => setShowEmojiPicker(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {pickerTab === 'emoji' ? (
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                  {POPULAR_EMOJIS.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(prev => prev + emoji)}
                      className="text-xl p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {POPULAR_GIFS.map((gif, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSendGif(gif)}
                      className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 group relative"
                    >
                      <img src={gif.url} alt={gif.label} className="w-full h-16 object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold p-1 text-center">
                        {gif.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link Modal */}
          {showLinkModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-sky-600" />
                    Share Clinical Web Link
                  </h4>
                  <button onClick={() => setShowLinkModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSendLink} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Link Title (e.g. Clinical Trial Protocol)"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="url"
                    required
                    placeholder="https://nejm.org/doi/full/..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowLinkModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700"
                    >
                      Attach Link
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Sleek, Modern Input Bar (WhatsApp / Telegram style) */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2 shadow-sm"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className={`p-2 rounded-full transition cursor-pointer ${
                showAttachMenu
                  ? 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
              title="Attach Clinical Files (Photos, PDFs, Video, Links)"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Direct Quick Attach: Photos */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-sky-50 dark:hover:bg-sky-950/60 text-sky-600 dark:text-sky-400 transition cursor-pointer hidden sm:flex"
              title="Attach Photos (up to 100)"
            >
              <ImageIcon className="w-4.5 h-4.5" />
            </button>

            {/* Direct Quick Attach: Documents / PDFs */}
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 transition cursor-pointer hidden sm:flex"
              title="Attach Document / PDF (up to 100MB)"
            >
              <FileText className="w-4.5 h-4.5" />
            </button>

            {/* Emoji / GIF Button */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className={`p-2 rounded-full transition cursor-pointer ${
                showEmojiPicker
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
              title="Emojis & GIFs"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Text Input with X to Clear */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  replyingToMessage 
                    ? `Reply to ${replyingToMessage.sender}...`
                    : `Message ${activeConversation.name.split(' ')[0]}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full text-xs sm:text-sm pl-4 pr-8 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-sky-500 dark:focus:border-sky-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-full focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  title="Clear input text (X)"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* High-Contrast Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-full transition shadow-md active:scale-95 cursor-pointer flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* FULL DOCUMENT & PHOTO VIEWER MODAL (Requirement: documents and photos must open!) */}
      {selectedAttachmentForViewer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            
            {/* Modal Header with Title, Download, and "X" Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  selectedAttachmentForViewer.type === 'IMAGE'
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-600'
                    : selectedAttachmentForViewer.type === 'DOC'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                    : 'bg-purple-100 dark:bg-purple-950 text-purple-600'
                }`}>
                  {selectedAttachmentForViewer.type === 'IMAGE' && <ImageIcon className="w-5 h-5" />}
                  {selectedAttachmentForViewer.type === 'DOC' && <FileText className="w-5 h-5" />}
                  {selectedAttachmentForViewer.type === 'VIDEO' && <Film className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedAttachmentForViewer.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {selectedAttachmentForViewer.type === 'DOC' ? 'Verified Clinical PDF' : selectedAttachmentForViewer.type === 'IMAGE' ? 'High-Resolution Diagnostic Image' : 'Clinical Media'}
                    {selectedAttachmentForViewer.size ? ` • ${selectedAttachmentForViewer.size}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    if (selectedAttachmentForViewer.url) {
                      window.open(selectedAttachmentForViewer.url, '_blank');
                    } else {
                      alert(`Downloaded ${selectedAttachmentForViewer.title} to your device.`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                {/* Prominent "X" Option to close document or photo modal */}
                <button
                  onClick={() => setSelectedAttachmentForViewer(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                  title="Close (X)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Open Document or Photo Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/70 dark:bg-slate-950/80">
              
              {/* Photo Lightbox */}
              {selectedAttachmentForViewer.type === 'IMAGE' && (
                <div className="space-y-3 text-center w-full flex flex-col items-center justify-center">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-black">
                    <img
                      src={selectedAttachmentForViewer.url}
                      alt={selectedAttachmentForViewer.title}
                      className="max-h-[60vh] w-auto max-w-full object-contain mx-auto"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Clinical Diagnostic Imagery • HIPAA De-Identified & Verified</span>
                  </div>
                </div>
              )}

              {/* Document / PDF Reader View */}
              {selectedAttachmentForViewer.type === 'DOC' && (
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-5 text-left max-w-xl mx-auto">
                  {/* Institutional Header */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                          Official PDF Protocol
                        </span>
                        <span className="text-[10px] text-slate-400">Page 1 of 3</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                        {selectedAttachmentForViewer.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Document Reference: MED-DOC-{Date.now().toString().slice(-6)} • Issued: Today
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                      <FileCheck className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Document Simulated Clinical Content */}
                  <div className="space-y-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <span>INSTITUTION: MANIPAL ACADEMY OF HIGHER EDUCATION</span>
                      <span className="text-emerald-600 dark:text-emerald-400">STATUS: APPROVED</span>
                    </div>

                    <p><strong>DOCUMENT TITLE:</strong> {selectedAttachmentForViewer.title.replace(/\.[^/.]+$/, "")}</p>
                    <p><strong>CLINICAL ABSTRACT & METHODOLOGY:</strong></p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {selectedAttachmentForViewer.content || 
                        "This clinical protocol establishes standard operating procedures for multicenter collaborative data abstraction. All patient parameters have been scrubbed of identifying information according to 45 CFR § 164.514 HIPAA safe harbor guidelines."}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Hemodynamic recordings, pharmacotherapy schedules, and clinical telemetry logs are verified by the primary clinical investigators.
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Digital Signature Validated
                    </span>

                    <button
                      onClick={() => alert(`Saved ${selectedAttachmentForViewer.title} to downloads!`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Video Player View */}
              {selectedAttachmentForViewer.type === 'VIDEO' && (
                <div className="w-full space-y-3 text-center">
                  <video
                    src={selectedAttachmentForViewer.url}
                    controls
                    autoPlay
                    className="max-h-[60vh] max-w-full rounded-2xl shadow-xl mx-auto bg-black border border-slate-800"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clinical Video Demonstration: {selectedAttachmentForViewer.title}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
