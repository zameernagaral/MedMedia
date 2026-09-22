import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Briefcase, 
  FlaskConical, 
  Clock, 
  Calendar, 
  GraduationCap, 
  Users, 
  Filter, 
  Search, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Plus, 
  Mail, 
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  Image as ImageIcon,
  Film,
  FileText,
  X,
  Lock,
  MessageSquare,
  BookOpen,
  Share2,
  Paperclip,
  Check,
  ShieldAlert
} from 'lucide-react';
import { 
  Job, 
  OpportunityItem, 
  UserProfile, 
  Community, 
  ResearchProject, 
  ResearchNote, 
  ResearchMessage, 
  LocumGig, 
  ScholarshipItem, 
  CourseItem 
} from '../types';
import { apiService } from '../services/api';
import { JobDetailModal } from './JobDetailModal';
import { INITIAL_COURSES, INITIAL_SCHOLARSHIPS } from '../data/mockData';

const PRESET_COMMUNITY_AVATARS = [
  { label: 'Cardio', url: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=160&h=160&fit=crop' },
  { label: 'Surgery', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=160&h=160&fit=crop' },
  { label: 'Pediatrics', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=160&h=160&fit=crop' },
  { label: 'Neuro', url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=160&h=160&fit=crop' },
  { label: 'Emergency', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=160&h=160&fit=crop' },
  { label: 'Research', url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=160&h=160&fit=crop' }
];

interface OpportunitiesHubProps {
  jobs: Job[];
  opportunities: OpportunityItem[];
  currentUser: UserProfile;
  isManagerMode?: boolean;
  onDeleteJob?: (jobId: string) => void;
}

export const OpportunitiesHub: React.FC<OpportunitiesHubProps> = ({
  jobs,
  opportunities,
  currentUser,
  isManagerMode = false,
  onDeleteJob
}) => {
  // Navigation Tabs: Community, Jobs, Research, Locum, Courses, Scholarships
  const [activeTab, setActiveTab] = useState<'community' | 'jobs' | 'research' | 'locum' | 'courses' | 'scholarships'>('community');
  
  // Data States
  const [communities, setCommunities] = useState<Community[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [locumGigs, setLocumGigs] = useState<LocumGig[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>(INITIAL_SCHOLARSHIPS);

  // Community State
  const [communitySearch, setCommunitySearch] = useState('');
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Cardiology');
  const [newCommAvatar, setNewCommAvatar] = useState<string>('');
  const commFileInputRef = useRef<HTMLInputElement>(null);
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({});

  const handleCommPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Image is larger than 8MB. Please select a smaller photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewCommAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Job Filters
  const [jobCategory, setJobCategory] = useState<string>('All');
  const [jobType, setJobType] = useState<string>('All');
  const [jobSearch, setJobSearch] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Research Workspace & Approval State
  const [selectedResearchProject, setSelectedResearchProject] = useState<ResearchProject | null>(null);
  const [showAddResearchModal, setShowAddResearchModal] = useState(false);
  const [showJoinResearchModal, setShowJoinResearchModal] = useState<ResearchProject | null>(null);
  const [researchStatement, setResearchStatement] = useState('');
  const [newResearchTitle, setNewResearchTitle] = useState('');
  const [newResearchDesc, setNewResearchDesc] = useState('');
  const [newResearchTags, setNewResearchTags] = useState('#Cardiology #AI #ClinicalTrial');
  const [newResearchSample, setNewResearchSample] = useState('500 Patients');
  const [newResearchSkills, setNewResearchSkills] = useState('Data abstraction, Statistical analysis');

  // Research Workspace Internal State
  const [workspaceTab, setWorkspaceTab] = useState<'notes' | 'chat'>('notes');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatAttachment, setChatAttachment] = useState<{ type: 'IMAGE' | 'VIDEO' | 'DOC'; url: string; title: string } | null>(null);

  // Locum Modals State
  const [showPostLocumModal, setShowPostLocumModal] = useState(false);
  const [showApplyLocumModal, setShowApplyLocumModal] = useState<LocumGig | null>(null);
  const [locumHospital, setLocumHospital] = useState('');
  const [locumDepartment, setLocumDepartment] = useState('Emergency Medicine');
  const [locumLocation, setLocumLocation] = useState('Bangalore');
  const [locumStipendType, setLocumStipendType] = useState<'Per Shift' | 'Hourly' | 'Daily' | 'Monthly'>('Per Shift');
  const [locumStipendAmount, setLocumStipendAmount] = useState('₹18,000 per 12h duty');
  const [locumShiftTiming, setLocumShiftTiming] = useState('Night Shift (8 PM - 8 AM)');
  const [locumContactPhone, setLocumContactPhone] = useState('+91 98450 12345');
  const [locumContactEmail, setLocumContactEmail] = useState('casualty@manipal.health');
  
  // Locum Apply State
  const [locumApplicantPhone, setLocumApplicantPhone] = useState('');
  const [locumApplicantExp, setLocumApplicantExp] = useState('3 Years Clinical Casualty');
  const [locumApplicantFile, setLocumApplicantFile] = useState<string | null>(null);

  // Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Data on Mount
  useEffect(() => {
    apiService.getCommunities().then(data => {
      setCommunities(data || []);
    });
    apiService.getResearchProjects().then(data => {
      setResearchProjects(data || []);
    });
    apiService.getLocumGigs().then(data => {
      setLocumGigs(data || []);
    });
    apiService.getCourses().then(data => {
      setCourses(data || []);
    });
    apiService.getScholarships().then(data => {
      setScholarships(data || []);
    });
  }, []);

  // Filtered Communities with Search
  const filteredCommunities = useMemo(() => {
    const q = communitySearch.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [communities, communitySearch]);

  // Handle Community Join (10,000 Capacity Limit Enforcement)
  const handleJoinCommunity = async (community: Community) => {
    // Check if already 10,000
    if (community.membersCount >= 10000 && !joinedCommunities[community.id]) {
      alert("This community has reached its maximum capacity of 10,000 members. No further members can be accommodated.");
      return;
    }

    const isAlreadyJoined = joinedCommunities[community.id];
    const newStatus = !isAlreadyJoined;
    
    setJoinedCommunities(prev => ({ ...prev, [community.id]: newStatus }));
    setCommunities(prev => prev.map(c => {
      if (c.id === community.id) {
        return {
          ...c,
          membersCount: c.membersCount + (newStatus ? 1 : -1)
        };
      }
      return c;
    }));

    const res = await apiService.joinCommunity(community.id, currentUser.id);
    showToast(newStatus ? `Joined ${community.name}! (${community.membersCount + 1} / 10,000 members)` : `Left ${community.name}`);
  };

  // Create Community
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const chosenAvatar = newCommAvatar.trim() || PRESET_COMMUNITY_AVATARS[0].url;

    const res = await apiService.createCommunity({
      name: newCommName.trim(),
      description: newCommDesc.trim() || 'Collaborative clinical discussion and case review.',
      category: newCommCategory,
      avatarUrl: chosenAvatar,
      iconUrl: chosenAvatar,
      maxMembers: 10000
    });

    if (res.success && res.community) {
      setCommunities([res.community, ...communities]);
      setJoinedCommunities(prev => ({ ...prev, [res.community!.id]: true }));
      setShowCreateCommunityModal(false);
      setNewCommName('');
      setNewCommDesc('');
      setNewCommAvatar('');
      showToast(`Created community "${res.community.name}" (Capacity: 10,000)!`);
    }
  };

  // Manager: Delete Community
  const handleDeleteCommunity = async (communityId: string) => {
    if (!confirm("Manager Confirmation: Permanently remove this medical community?")) return;
    setCommunities(prev => prev.filter(c => c.id !== communityId));
    await apiService.deleteCommunity(communityId);
    showToast("Community deleted by Manager.");
  };

  // Research Project: Submit Add
  const handleCreateResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResearchTitle.trim()) return;

    const tagsArray = newResearchTags.split(' ').map(t => t.trim()).filter(Boolean);
    const created = await apiService.createResearchProject({
      title: newResearchTitle.trim(),
      leadDoctorName: currentUser.fullName,
      leadDoctorAvatar: currentUser.avatarUrl,
      institution: currentUser.doctorDetails?.hospitalAffiliation || currentUser.studentDetails?.collegeName || 'National Medical Center',
      description: newResearchDesc.trim(),
      hashtags: tagsArray,
      targetSampleSize: newResearchSample,
      requiredSkills: newResearchSkills.split(',').map(s => s.trim())
    });

    if (created) {
      setResearchProjects([created, ...researchProjects]);
      setShowAddResearchModal(false);
      setNewResearchTitle('');
      setNewResearchDesc('');
      showToast("Research project registered with algorithmic specialty hashtags!");
    }
  };

  // Research Project: Request Join
  const handleRequestJoinResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showJoinResearchModal) return;

    const projId = showJoinResearchModal.id;
    const res = await apiService.joinResearch(projId, currentUser.id);

    setResearchProjects(prev => prev.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          pendingJoinRequests: [
            ...(p.pendingJoinRequests || []),
            {
              userId: currentUser.id,
              userName: currentUser.fullName,
              userRole: currentUser.role,
              statement: researchStatement || 'Interested in contributing to data abstraction.',
              requestedAt: 'Just now'
            }
          ]
        };
      }
      return p;
    }));

    setShowJoinResearchModal(null);
    setResearchStatement('');
    showToast("Application submitted to Principal Investigator for review!");
  };

  // Manager / Lead: Approve Join Request
  const handleApproveResearchJoin = async (projectId: string, applicantId: string, applicantName: string) => {
    setResearchProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          collaboratorCount: (p.collaboratorCount || 0) + 1,
          pendingJoinRequests: p.pendingJoinRequests?.filter(r => r.userId !== applicantId)
        };
      }
      return p;
    }));

    await apiService.approveResearch(projectId, applicantId);
    showToast(`Approved ${applicantName} as co-investigator!`);
  };

  // Research Workspace: Add Note
  const handleAddResearchNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResearchProject || !newNoteTitle.trim()) return;

    const newNote = await apiService.addResearchNote(selectedResearchProject.id, {
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      authorName: currentUser.fullName,
      authorRole: currentUser.role
    });

    if (newNote) {
      setSelectedResearchProject({
        ...selectedResearchProject,
        notes: [newNote, ...(selectedResearchProject.notes || [])]
      });
      setNewNoteTitle('');
      setNewNoteContent('');
      showToast("Clinical research article note saved!");
    }
  };

  // Research Workspace: Edit Note
  const handleSaveEditNote = async (noteId: string) => {
    if (!selectedResearchProject) return;

    await apiService.editResearchNote(selectedResearchProject.id, noteId, editingNoteTitle, editingNoteContent);
    
    setSelectedResearchProject({
      ...selectedResearchProject,
      notes: selectedResearchProject.notes?.map(n => {
        if (n.id === noteId) {
          return { ...n, title: editingNoteTitle, content: editingNoteContent, updatedAt: 'Just now' };
        }
        return n;
      })
    });
    setEditingNoteId(null);
    showToast("Research note updated successfully.");
  };

  // Research Workspace: Delete Note
  const handleDeleteNote = (noteId: string) => {
    if (!selectedResearchProject || !confirm("Delete this research note?")) return;
    setSelectedResearchProject({
      ...selectedResearchProject,
      notes: selectedResearchProject.notes?.filter(n => n.id !== noteId)
    });
    showToast("Note deleted.");
  };

  // Research Workspace: Send Group Chat Message
  const handleSendResearchMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResearchProject || (!chatMessageText.trim() && !chatAttachment)) return;

    const newMsg = await apiService.sendResearchMessage(selectedResearchProject.id, {
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarUrl,
      text: chatMessageText.trim(),
      attachment: chatAttachment || undefined
    });

    if (newMsg) {
      setSelectedResearchProject({
        ...selectedResearchProject,
        messages: [...(selectedResearchProject.messages || []), newMsg]
      });
      setChatMessageText('');
      setChatAttachment(null);
    }
  };

  // Locum: Submit Post Gig
  const handlePostLocum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locumHospital.trim()) return;

    const res = await apiService.createLocumGig({
      hospitalName: locumHospital.trim(),
      department: locumDepartment,
      location: locumLocation,
      stipendType: locumStipendType,
      stipendAmount: locumStipendAmount,
      shiftTiming: locumShiftTiming,
      requiredDocuments: ['Medical Council Registration', 'MBBS/MD Degree Certificate', 'Photo ID'],
      contactPhone: locumContactPhone,
      contactEmail: locumContactEmail,
      postedByDoctorId: currentUser.id
    });

    if (res.success && res.gig) {
      setLocumGigs([res.gig, ...locumGigs]);
      setShowPostLocumModal(false);
      setLocumHospital('');
      showToast("Locum emergency shift posted successfully!");
    }
  };

  // Locum: Submit Application
  const handleApplyLocum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyLocumModal) return;

    const res = await apiService.applyLocum(showApplyLocumModal.id, {
      applicantId: currentUser.id,
      applicantName: currentUser.fullName,
      applicantRole: currentUser.role,
      applicantPhone: locumApplicantPhone || '+91 98765 43210',
      applicantEmail: currentUser.email || 'doctor@medmedia.org',
      yearsOfExperience: locumApplicantExp,
      resumeUrl: locumApplicantFile || 'https://medmedia.health/credentials/verified_cv.pdf',
      medicalCouncilRegNumber: currentUser.doctorDetails?.medicalCouncilRegNumber || 'KMC-84920'
    });

    setShowApplyLocumModal(null);
    setLocumApplicantPhone('');
    showToast(res.message || "Locum application submitted to hospital medical director!");
  };

  // Filtered Jobs
  const filteredJobs = jobs.filter(j => {
    if (jobCategory !== 'All' && j.category.toLowerCase() !== jobCategory.toLowerCase()) return false;
    if (jobType !== 'All' && j.type.toLowerCase() !== jobType.toLowerCase()) return false;
    if (jobSearch) {
      const q = jobSearch.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.place.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-sky-500/40 flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & MAIN TABS (Requirement 11: 1. Community & Mentorship, 2. Job Offers, 3. All) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Opportunities & Clinical Network
              {isManagerMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  Manager Mode
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Communities, verified appointments, research workspaces, and locum shifts.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'community', label: 'Community & Mentorship', icon: Users },
            { id: 'jobs', label: 'Job Offers', icon: Briefcase },
            { id: 'research', label: 'Research Projects', icon: FlaskConical },
            { id: 'locum', label: 'Locum Gigs', icon: Clock },
            { id: 'courses', label: 'Courses (Free)', icon: GraduationCap },
            { id: 'scholarships', label: 'Scholarships', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedResearchProject(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB: COMMUNITY & MENTORSHIP                                            */}
      {/* ========================================================================= */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          
          {/* Community Search & "+" Create Community Button */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search medical communities (Cardiology, Surgery, Pediatrics, NEET-PG)..."
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Requirement 11: "+" button to create community */}
              <button
                onClick={() => setShowCreateCommunityModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex-shrink-0"
                title="Create Community (Up to 10k Capacity)"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Create Community</span>
              </button>
            </div>

            {/* Suggested Communities Horizontal Row */}
            {communities.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  Suggested Specialties & State Councils
                </span>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {communities.slice(0, 4).map((c) => (
                    <div
                      key={`sugg-${c.id}`}
                      className="flex-shrink-0 w-52 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <img src={c.avatarUrl || c.iconUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</h4>
                          <span className="text-[9px] text-sky-600 dark:text-sky-400 font-semibold">{c.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                        <span className="text-slate-500 font-medium">
                          {c.membersCount.toLocaleString()} / 10,000
                        </span>
                        <button
                          onClick={() => handleJoinCommunity(c)}
                          className={`font-bold px-2 py-0.5 rounded-lg transition ${
                            joinedCommunities[c.id]
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.membersCount >= 10000
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {joinedCommunities[c.id] ? 'Joined' : c.membersCount >= 10000 ? 'Full' : 'Join'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Compact Community Cards List with 10k Capacity Limit Enforcement */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                All Medical Communities ({filteredCommunities.length})
              </h3>
              <span className="text-[11px] text-slate-500">Max Capacity: 10,000 members each</span>
            </div>

            {filteredCommunities.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Communities Created Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Start your own verified medical community for department rounds, case discussions, or student peer groups.
                </p>
                <button
                  onClick={() => setShowCreateCommunityModal(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Community</span>
                </button>
              </div>
            ) : (
              filteredCommunities.map((c) => {
                const isFull = c.membersCount >= 10000;
                const isJoined = joinedCommunities[c.id];
                const pct = Math.min(100, Math.round((c.membersCount / 10000) * 100));

                return (
                  <div
                    key={c.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <img
                        src={c.avatarUrl || c.iconUrl}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {c.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60">
                            {c.category}
                          </span>
                          {isFull && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">
                              Capacity Full
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {c.description}
                        </p>

                        {/* Requirement 11: 10,000 capacity limit meter & counter */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFull ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-sky-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {c.membersCount.toLocaleString()} / 10,000 members ({pct}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Join Button + Manager Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      {isManagerMode && (
                        <button
                          onClick={() => handleDeleteCommunity(c.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-xs transition cursor-pointer"
                          title="Delete Community (Manager)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleJoinCommunity(c)}
                        disabled={isFull && !isJoined}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                          isJoined
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                            : isFull
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                        }`}
                      >
                        {isJoined ? 'Joined ✓' : isFull ? 'Full (10k Reached)' : 'Join Community'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: JOB OFFERS                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          
          {/* Job Search & Filter Pills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search doctor appointments, hospitals, skills..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">All Types</option>
                <option value="Full time">Full Time</option>
                <option value="Part time">Part Time</option>
                <option value="Locum">Locum</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              {['All', 'Doctor jobs', 'academic jobs', 'Internship', 'fellowship'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setJobCategory(cat)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full capitalize transition cursor-pointer ${
                    jobCategory === cat
                      ? 'bg-slate-900 dark:bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Job List */}
          <div className="space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Job Offers Posted Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hospital departments, medical colleges, and clinics post clinical openings, fellowships, and internships here.
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-sky-300 dark:hover:border-sky-500 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={job.hospitalLogoUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                          {job.category}
                        </span>
                        <span className="text-xs text-slate-400">• {job.type}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{job.salary}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 hover:text-sky-600 dark:hover:text-sky-400 transition">
                        {job.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.companyName}
                        <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.place}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">+{job.skills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isManagerMode && onDeleteJob && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete job vacancy "${job.title}"?`)) {
                            onDeleteJob(job.id);
                            showToast("Job vacancy deleted by Manager.");
                          }
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-xs transition"
                        title="Delete Job (Manager)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      View & Apply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: RESEARCH PROJECTS & WORKSPACE                                     */}
      {/* ========================================================================= */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          
          {/* Header Banner with "Add Research" Modal Button */}
          <div className="flex items-center justify-between bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-5 rounded-3xl shadow-sm">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-sky-400" />
                Multicenter Clinical Research Registry
              </h3>
              <p className="text-xs text-sky-200 mt-0.5">
                PubMed indexed trials, collaborative data abstraction, and ICMR grants.
              </p>
            </div>
            
            {/* Requirement 12: Add Research Modal Button */}
            <button
              onClick={() => setShowAddResearchModal(true)}
              className="px-3.5 py-2 bg-white text-sky-950 font-bold text-xs rounded-xl hover:bg-sky-50 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-sky-600" />
              <span>Add Research</span>
            </button>
          </div>

          {/* Active Workspace View (If a project is selected) */}
          {selectedResearchProject ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <button
                    onClick={() => setSelectedResearchProject(null)}
                    className="text-xs text-sky-600 font-bold hover:underline mb-1 flex items-center gap-1"
                  >
                    ← Back to Research List
                  </button>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedResearchProject.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Principal Investigator: {selectedResearchProject.leadDoctorName} • {selectedResearchProject.institution}
                  </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setWorkspaceTab('notes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      workspaceTab === 'notes' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Articles & Notes
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('chat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      workspaceTab === 'chat' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Group Discussion
                  </button>
                </div>
              </div>

              {/* SECTION 1: Articles / Notes with 3-dot edit/delete menu */}
              {workspaceTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddResearchNote} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Post New Clinical Observation / Article Note</h4>
                    <input
                      type="text"
                      placeholder="Note Title (e.g. Interim Cohort Biomarker Statistics)"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="Write findings, protocol amendments, or literature references..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newNoteTitle.trim()}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                      >
                        Publish Note
                      </button>
                    </div>
                  </form>

                  {/* Notes List with 3-dot Menu */}
                  <div className="space-y-3">
                    {(selectedResearchProject.notes || []).map((note) => (
                      <div key={note.id} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                        {editingNoteId === note.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingNoteTitle}
                              onChange={(e) => setEditingNoteTitle(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            <textarea
                              rows={3}
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-3 py-1 text-xs text-slate-500"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditNote(note.id)}
                                className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                              >
                                Save Edits
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{note.title}</h5>
                              
                              {/* 3-Dot Menu */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">{note.createdAt}</span>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteTitle(note.title);
                                    setEditingNoteContent(note.content);
                                  }}
                                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-600 transition"
                                  title="Edit Note"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition"
                                  title="Delete Note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                            <span className="text-[10px] text-slate-400">By {note.authorName}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: Group Messaging with photos & video support */}
              {workspaceTab === 'chat' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto space-y-2.5">
                    {(selectedResearchProject.messages || []).length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">No discussion yet. Send a message or photo/video.</p>
                    ) : (
                      selectedResearchProject.messages?.map((m) => (
                        <div key={m.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-600 dark:text-sky-400">{m.senderName} ({m.senderRole})</span>
                            <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                          </div>
                          {m.text && <p className="text-slate-800 dark:text-slate-200">{m.text}</p>}
                          {m.attachment && m.attachment.type === 'IMAGE' && (
                            <img src={m.attachment.url} alt="" className="max-h-40 rounded-lg object-cover mt-1" />
                          )}
                          {m.attachment && m.attachment.type === 'VIDEO' && (
                            <video src={m.attachment.url} controls className="max-h-40 rounded-lg mt-1 bg-black" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendResearchMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discuss research protocol, patient cohort, or methodology..."
                      value={chatMessageText}
                      onChange={(e) => setChatMessageText(e.target.value)}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Enter Clinical Image URL for group discussion:");
                        if (url) setChatAttachment({ type: 'IMAGE', url, title: 'Discussion Photo' });
                      }}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="Attach Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Research Projects List */
            <div className="space-y-3">
              {researchProjects.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Research Projects Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Launch clinical registries, multi-centric clinical trials, and invite co-investigators to collaborate.
                  </p>
                  <button
                    onClick={() => setShowAddResearchModal(true)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start First Research Project</span>
                  </button>
                </div>
              ) : (
                researchProjects.map((proj) => (
                  <div key={proj.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img src={proj.leadDoctorAvatar} alt="" className="w-11 h-11 rounded-2xl object-cover ring-2 ring-sky-500/20" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                            Open Clinical Trial
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{proj.title}</h4>
                          <p className="text-xs text-slate-500">{proj.leadDoctorName} • {proj.institution}</p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 flex-shrink-0">
                        Sample: {proj.targetSampleSize}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{proj.description}</p>

                    {/* Hashtags for Algorithm */}
                    <div className="flex flex-wrap gap-1.5">
                      {(proj.hashtags || proj.tags || []).map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-100 dark:border-sky-800">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Pending Approval Requests (If Manager or Lead) */}
                    {(isManagerMode || proj.leadDoctorName === currentUser.fullName) && (proj.pendingJoinRequests || []).length > 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">
                          Pending Investigator Join Requests:
                        </span>
                        {proj.pendingJoinRequests?.map((req) => (
                          <div key={req.userId} className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded-xl">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{req.userName} ({req.userRole})</p>
                              <p className="text-[11px] text-slate-500">{req.statement}</p>
                            </div>
                            <button
                              onClick={() => handleApproveResearchJoin(proj.id, req.userId, req.userName)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                            >
                              Approve
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Card Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400">Collaborators: {proj.collaboratorCount}</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Open Workspace */}
                        <button
                          onClick={() => setSelectedResearchProject(proj)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Open Workspace
                        </button>

                        {/* Join Research Flow */}
                        <button
                          onClick={() => setShowJoinResearchModal(proj)}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Join Research
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: LOCUM GIGS                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'locum' && (
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Emergency & Casual Locum Tenens Shifts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hourly and per-shift duty openings with declared stipends.
              </p>
            </div>

            {/* Requirement 13: Post Locum Gig Button */}
            <button
              onClick={() => setShowPostLocumModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Locum Gig</span>
            </button>
          </div>

          <div className="space-y-3">
            {locumGigs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Locum Gigs Available</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hospital emergency and ICU departments post rotational shifts and urgent coverage duties here.
                </p>
                <button
                  onClick={() => setShowPostLocumModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Urgent Locum Shift</span>
                </button>
              </div>
            ) : (
              locumGigs.map((gig) => (
                <div key={gig.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                          {gig.department}
                        </span>
                        <span className="text-xs text-slate-400">• {gig.shiftTiming}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{gig.hospitalName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {gig.location}
                      </p>
                    </div>

                    {/* Mandatory Stipend Display */}
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                        {gig.stipendAmount}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{gig.stipendType}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Required Credentials:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(gig.requiredDocuments || []).map((doc, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500">Contact: {gig.contactPhone}</span>

                    {/* Requirement 13: Apply for Locum Modal */}
                    <button
                      onClick={() => setShowApplyLocumModal(gig)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Apply for Shift
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: COURSES                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              Verified Open-Access Medical Courses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accredited online CME modules and university medical certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {courses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3 col-span-full">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Courses Listed Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Accredited CME and university courses will appear here.
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => window.open(course.link, '_blank')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-400 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                        FREE
                      </span>
                      <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                        {course.platform}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Verified Certificate</span>
                    <span className="text-sky-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      Launch Course <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: SCHOLARSHIPS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'scholarships' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Global Medical & Healthcare Research Scholarships
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prestigious international funding fellowships for clinical scholars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {scholarships.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3 col-span-full">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Scholarships Listed Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Clinical fellowships and student research grant opportunities will appear here.
                </p>
              </div>
            ) : (
              scholarships.map((s) => (
                <div
                  key={s.id}
                  onClick={() => window.open(s.link, '_blank')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-amber-400 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200">
                        {s.coverage}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{s.deadline}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition">
                      {s.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{s.provider}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">{s.description}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Official Portal</span>
                    <span className="text-amber-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      Apply Online <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION                                                           */}
      {/* ========================================================================= */}

      {/* 1. Modal: Create Community (Max 10,000 Capacity) */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                Create Medical Community
              </h3>
              <button onClick={() => setShowCreateCommunityModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Communities connect doctors, faculty, and scholars. Maximum capacity is strictly enforced at <strong>10,000 members</strong>.
            </p>

            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Community Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Care Ultrasound Network"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Community Avatar / Emblem Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Community Photo / Emblem
                </label>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-sky-500/30 flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={newCommAvatar || PRESET_COMMUNITY_AVATARS[0].url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {newCommAvatar && (
                      <button
                        type="button"
                        onClick={() => setNewCommAvatar('')}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition cursor-pointer"
                        title="Remove uploaded photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      ref={commFileInputRef}
                      onChange={handleCommPhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => commFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>{newCommAvatar ? 'Change Photo' : 'Upload from Device'}</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP (Max 8MB)</p>
                  </div>
                </div>

                {/* Preset Clinical Badges */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                    Or Choose Clinical Preset
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {PRESET_COMMUNITY_AVATARS.map((preset) => {
                      const isSelected = (newCommAvatar || PRESET_COMMUNITY_AVATARS[0].url) === preset.url;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setNewCommAvatar(preset.url)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium border transition flex-shrink-0 cursor-pointer ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <img src={preset.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Specialty</label>
                <select
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="NEET-PG & USMLE Prep">NEET-PG & USMLE Prep</option>
                  <option value="Pharmacology">Pharmacology</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Goals, case review guidelines, and membership criteria..."
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-2 border border-sky-200 dark:border-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>Default limit: 10,000 verified medical practitioners.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCommunityModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Launch Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Add Research Project (with Hashtags for Algorithm) */}
      {showAddResearchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-sky-600" />
                Register Clinical Research Call
              </h3>
              <button onClick={() => setShowAddResearchModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResearch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trial / Research Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Assisted STEMI Detection on 12-Lead Rhythm ECG"
                  value={newResearchTitle}
                  onChange={(e) => setNewResearchTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hashtags for Algorithmic Matching *
                </label>
                <input
                  type="text"
                  required
                  placeholder="#Cardiology #ECG #MachineLearning #EmergencyCare"
                  value={newResearchTags}
                  onChange={(e) => setNewResearchTags(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">These tags feed the feed recommendation algorithm</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Sample Size</label>
                  <input
                    type="text"
                    value={newResearchSample}
                    onChange={(e) => setNewResearchSample(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Skills</label>
                  <input
                    type="text"
                    value={newResearchSkills}
                    onChange={(e) => setNewResearchSkills(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Abstract & Protocol</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe patient inclusion/exclusion criteria, ethical committee approvals..."
                  value={newResearchDesc}
                  onChange={(e) => setNewResearchDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResearchModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Publish Research Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Join Research Application */}
      {showJoinResearchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Apply to Join Clinical Research Cohort
              </h3>
              <button onClick={() => setShowJoinResearchModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{showJoinResearchModal.title}</p>
              <p className="text-slate-500 mt-0.5">PI: {showJoinResearchModal.leadDoctorName}</p>
            </div>

            <form onSubmit={handleRequestJoinResearch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Statement of Interest & Clinical Experience
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your clinical training, experience in medical statistics or patient abstraction, and weekly hours committed..."
                  value={researchStatement}
                  onChange={(e) => setResearchStatement(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinResearchModal(null)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Submit Application to PI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Post Locum Gig (Requirement 13) */}
      {showPostLocumModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Post Locum Tenens Duty
              </h3>
              <button onClick={() => setShowPostLocumModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostLocum} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital / Clinic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Manipal Hospital / Apollo Clinic"
                    value={locumHospital}
                    onChange={(e) => setLocumHospital(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={locumDepartment}
                    onChange={(e) => setLocumDepartment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / City</label>
                  <input
                    type="text"
                    required
                    value={locumLocation}
                    onChange={(e) => setLocumLocation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift Timings</label>
                  <input
                    type="text"
                    required
                    value={locumShiftTiming}
                    onChange={(e) => setLocumShiftTiming(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Requirement 13: Mandatory Stipend Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">Stipend Basis *</label>
                  <select
                    value={locumStipendType}
                    onChange={(e) => setLocumStipendType(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Per Shift">Per Shift</option>
                    <option value="Daily">Daily Stipend</option>
                    <option value="Hourly">Hourly Rate</option>
                    <option value="Monthly">Monthly Retainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">Stipend Amount *</label>
                  <input
                    type="text"
                    required
                    value={locumStipendAmount}
                    onChange={(e) => setLocumStipendAmount(e.target.value)}
                    placeholder="₹18,000 per 12h duty"
                    className="w-full text-xs p-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={locumContactPhone}
                    onChange={(e) => setLocumContactPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={locumContactEmail}
                    onChange={(e) => setLocumContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostLocumModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Publish Locum Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Apply for Locum Gig (Requirement 13) */}
      {showApplyLocumModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Apply for Locum Duty
              </h3>
              <button onClick={() => setShowApplyLocumModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-emerald-950 dark:text-emerald-200">{showApplyLocumModal.hospitalName}</p>
              <p className="text-emerald-800 dark:text-emerald-300">{showApplyLocumModal.department} • {showApplyLocumModal.shiftTiming}</p>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">Stipend: {showApplyLocumModal.stipendAmount}</p>
            </div>

            <form onSubmit={handleApplyLocum} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 12345"
                  value={locumApplicantPhone}
                  onChange={(e) => setLocumApplicantPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Experience / Past Casualty Duties</label>
                <input
                  type="text"
                  required
                  value={locumApplicantExp}
                  onChange={(e) => setLocumApplicantExp(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resume / Clinical CV</label>
                <div className="p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {locumApplicantFile ? "CV Attached (verified_resume.pdf)" : "Attach Clinical CV (PDF/DOCX)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setLocumApplicantFile(e.target.files[0].name);
                    }}
                    className="hidden"
                    id="locum-cv-upload"
                  />
                  <label htmlFor="locum-cv-upload" className="block text-[10px] text-sky-600 font-bold mt-1 cursor-pointer">
                    Browse File
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <input type="checkbox" required id="reg-confirm" className="rounded" />
                <label htmlFor="reg-confirm">I confirm active Medical Council registration credentials.</label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyLocumModal(null)}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Confirm & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        currentUser={currentUser}
        onClose={() => setSelectedJob(null)}
        onApply={(jobId) => showToast(`Application for job #${jobId} submitted with verified credentials!`)}
      />

    </div>
  );
};
