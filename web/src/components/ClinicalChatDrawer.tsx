import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Search, 
  Paperclip, 
  ShieldCheck, 
  Phone, 
  Video, 
  MoreVertical, 
  Stethoscope, 
  GraduationCap, 
  CheckCheck, 
  FileText, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  attachment?: {
    type: 'ECG' | 'REPORT' | 'IMAGE';
    title: string;
  };
}

interface Conversation {
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
      { id: 'm1', sender: 'Dr. Priya Nair', text: 'Hello Dr. Ramesh, reviewed your catheterization case study. Remarkable result on the bifurcation!', time: '10:42 AM', isMe: false },
      { id: 'm2', sender: 'You', text: 'Thank you Dr. Priya! The IVUS imaging was pivotal in deciding the stent sizing.', time: '10:45 AM', isMe: true }
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
      { id: 'm3', sender: 'Rohan Verma', text: 'Good morning Doctor! I saw your open research call on MedMedia for the ECG Detection study.', time: '11:14 AM', isMe: false },
      { id: 'm4', sender: 'Rohan Verma', text: 'Doctor, would love to assist on the AI-ECG project! I have experience abstracting anonymized patient cohorts.', time: '11:15 AM', isMe: false }
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
      { id: 'm5', sender: 'Dr. Sandeep Kulkarni', text: 'Hey Arvind! Long time. Are you attending the All India Medical Congress in Nov? Our AIIMS batch is meeting up.', time: 'Yesterday', isMe: false }
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
      { id: 'm8', sender: 'Ananya Desai', text: 'Thank you for explaining the ARNI washout duration!', time: 'Sep 11', isMe: false }
    ]
  }
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
  const [callModal, setCallModal] = useState<'audio' | 'video' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation.messages, isTypingPeer]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'You',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    const targetConvId = activeConvId;
    const targetPeerName = activeConversation.name;

    // Append user message
    setConversations(prev => prev.map(conv => {
      if (conv.id === targetConvId) {
        return {
          ...conv,
          lastMessage: userMsgText,
          lastTime: 'Just now',
          messages: [...conv.messages, newMsg]
        };
      }
      return conv;
    }));

    setInputText('');

    // Realistic Auto-Reply Simulator from Peer Clinician
    setIsTypingPeer(true);
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
        isMe: false
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

  const handleAttachClinicalDocument = () => {
    const attachmentMsg: Message = {
      id: `att-${Date.now()}`,
      sender: 'You',
      text: 'Sharing anonymized diagnostic ECG case document for clinical review:',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      attachment: {
        type: 'ECG',
        title: 'Anonymized_12_Lead_ECG_Rhythm.pdf (Safe Harbor Verified)'
      }
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          lastMessage: 'Shared ECG Case document',
          lastTime: 'Just now',
          messages: [...conv.messages, attachmentMsg]
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* LEFT COLUMN: CONVERSATIONS LIST (Slide 5 Messages Drawer) */}
        <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-1/3 md:h-full">
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-slate-900">Clinical Messages</h3>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Contacts */}
          <div className="p-2.5 bg-white border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search colleagues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Conversations Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition ${
                    isActive ? 'bg-sky-50/80 border-l-4 border-sky-600' : 'hover:bg-slate-100/70 bg-white'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        {conv.name}
                        {conv.role === 'DOCTOR' ? (
                          <Stethoscope className="w-3 h-3 text-sky-600 inline" />
                        ) : (
                          <GraduationCap className="w-3 h-3 text-emerald-600 inline" />
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.lastTime}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {conv.specialtyOrDiscipline}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate mt-1">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Current User Tag */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <img src={currentUser.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-bold text-slate-800 text-[11px] truncate">{currentUser.fullName}</span>
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT THREAD */}
        <div className="flex-1 flex flex-col h-2/3 md:h-full bg-white">
          
          {/* Active Chat Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeConversation.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                />
                {activeConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{activeConversation.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500">
                  {activeConversation.specialtyOrDiscipline} • {activeConversation.isOnline ? (
                    <span className="text-emerald-600 font-bold">Online</span>
                  ) : (
                    <span>Last active yesterday</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions: Tele-Consult Call, Video, Close */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCallModal('audio')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
                title="Voice Consultation"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCallModal('video')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
                title="Video Consultation"
              >
                <Video className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
            <div className="text-center my-2">
              <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                🔒 End-to-End Encrypted HIPAA Clinical Messaging
              </span>
            </div>

            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.isMe
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Attachment card */}
                  {msg.attachment && (
                    <div className="mt-2 p-2.5 bg-black/10 rounded-xl border border-white/20 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white flex-shrink-0" />
                      <span className="text-[11px] font-semibold text-white truncate">
                        {msg.attachment.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[9px] text-slate-400">{msg.time}</span>
                  {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-600" />}
                </div>
              </div>
            ))}

            {/* Peer typing indicator */}
            {isTypingPeer && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-2xl border border-slate-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                <span>{activeConversation.name} is replying...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Medical Reply Suggestion Chips */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              "Agree with diagnosis 👍",
              "Please share the lab values",
              "Let's discuss on ward rounds",
              "Confirmed for conference"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(chip)}
                className="text-[11px] font-medium bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleAttachClinicalDocument}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition"
              title="Attach Diagnostic Case or ECG"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder={`Message ${activeConversation.name.split(' ')[0]}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-full transition shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* Tele-Consultation Call Simulation Modal */}
      {callModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-6 text-center text-white space-y-4 shadow-2xl border border-slate-700 animate-in zoom-in-95">
            <img
              src={activeConversation.avatar}
              alt=""
              className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-sky-400/50 animate-pulse"
            />
            <div>
              <h3 className="text-base font-bold">{activeConversation.name}</h3>
              <p className="text-xs text-sky-400 mt-0.5">
                {callModal === 'video' ? 'Encrypted Video Tele-Consult' : 'Encrypted Audio Call'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">Connecting to verified secure line...</p>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => setCallModal(null)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full transition"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
