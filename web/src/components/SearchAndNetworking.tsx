import React, { useState } from 'react';
import { 
  Search, 
  Users, 
  Building2, 
  Award, 
  FileText, 
  Briefcase, 
  Sparkles, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap, 
  Stethoscope, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  BookOpen
} from 'lucide-react';
import { UserProfile, Job } from '../types';
import { getPersonalizedMentorsAndProfessors, AlgorithmicMentor } from '../utils/algorithmEngine';

interface SearchAndNetworkingProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  jobs?: Job[];
  onSelectUser: (user: UserProfile) => void;
  onConnectSuggestion: (name: string) => void;
  onRequestMentorship?: (professor: UserProfile) => void;
  onApplyInternship?: (job: Job) => void;
}

export const SearchAndNetworking: React.FC<SearchAndNetworkingProps> = ({
  currentUser,
  availableUsers,
  jobs = [],
  onSelectUser,
  onConnectSuggestion,
  onRequestMentorship,
  onApplyInternship
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('Professors & Mentors');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

  // Slide 10 Categories & Dedicated Medical LinkedIn + Instagram Filters
  const filterTabs = [
    'Professors & Mentors',
    'Clinical Internships',
    'Alumni Matching',
    'All Accounts',
    'Associations & Chapters'
  ];

  // Algorithmic Personalized Professors & Mentors
  const algorithmicMentors = getPersonalizedMentorsAndProfessors(availableUsers, currentUser);

  // Filtered lists based on search
  const filteredMentors = algorithmicMentors.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.doctorDetails?.specialization.toLowerCase().includes(q) ||
      m.doctorDetails?.hospitalAffiliation.toLowerCase().includes(q) ||
      (m.doctorDetails?.academicTitle && m.doctorDetails.academicTitle.toLowerCase().includes(q))
    );
  });

  const internshipJobs = jobs.filter(j => j.category === 'Internship');
  const filteredInternships = internshipJobs.filter(j => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      j.place.toLowerCase().includes(q)
    );
  });

  // Slide 10: Community & Branches
  const communityBranches = [
    {
      id: "cb-1",
      name: "Cardiological Society of India",
      branch: "Karnataka State Chapter (Branch 04)",
      members: "4,900 Active Clinicians",
      recentTopic: "Live cath lab transmission updates & fellow training"
    },
    {
      id: "cb-2",
      name: "Indian Medical Association - Academic Youth Council",
      branch: "South Zone Medical Students Forum",
      members: "24,500 Scholars",
      recentTopic: "Clinical internship stipend regulations & NEET-PG prep"
    },
    {
      id: "cb-3",
      name: "Association of Medical Teachers & Surgeons of India",
      branch: "National Faculty & Mentorship Wing",
      members: "6,800 Professors & HODs",
      recentTopic: "Competency-based medical education & ICMR research grants"
    }
  ];

  const handleConnect = (id: string, name: string) => {
    setConnectedMap(prev => ({ ...prev, [id]: true }));
    onConnectSuggestion(name);
  };

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto">
      
      {/* 1. Slide 10 Search Bar with Smart Category Pills */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search medical professors, HODs, clinical internships, college alumni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === tab
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MEDICAL PROFESSORS & MENTOR MATCHING (LinkedIn-Style Professional Matching) */}
      {(activeFilter === 'Professors & Mentors' || activeFilter === 'All Accounts') && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Medical Professors & Research Mentors</h3>
                <p className="text-[11px] text-slate-500">
                  {currentUser.role === 'STUDENT'
                    ? `Recommended for your ${currentUser.studentDetails?.futureSpecialty || 'Clinical'} specialty goals`
                    : 'Colleague academic chairs & faculty collaborators'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              AI Match Engine
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {filteredMentors.map((prof) => (
              <div
                key={prof.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div 
                    onClick={() => onSelectUser(prof)}
                    className="flex items-start gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={prof.avatarUrl}
                        alt={prof.fullName}
                        className="w-13 h-13 rounded-2xl object-cover ring-2 ring-sky-500/30 group-hover:ring-sky-500 transition shadow-sm"
                      />
                      {prof.doctorDetails?.isProfessor && (
                        <div className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-0.5 rounded-full ring-2 ring-white" title="Verified Professor">
                          <GraduationCap className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition truncate">
                          {prof.fullName}
                        </h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 mt-0.5 truncate">
                        {prof.doctorDetails?.academicTitle || prof.doctorDetails?.specialization}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {prof.doctorDetails?.hospitalAffiliation}
                      </p>
                    </div>
                  </div>

                  {/* Open Slots Pill */}
                  {prof.doctorDetails?.isAcceptingMentees && (
                    <div className="flex-shrink-0 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {prof.doctorDetails.mentorshipSlots?.available ?? 2} Slots Open
                      </span>
                    </div>
                  )}
                </div>

                {/* Algorithm Reason Banner */}
                <div className="px-3 py-1.5 bg-sky-100/60 rounded-xl text-[11px] text-sky-900 font-medium flex items-center justify-between">
                  <span>{prof.mentorMatchReason}</span>
                  <span className="text-[10px] font-bold text-sky-700">{prof.matchScore}% Match</span>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => onSelectUser(prof)}
                    className="text-xs font-bold text-slate-600 hover:text-sky-600 hover:underline transition"
                  >
                    View Publications & CV →
                  </button>

                  <div className="flex items-center gap-2">
                    {currentUser.role === 'STUDENT' && prof.doctorDetails?.isAcceptingMentees && onRequestMentorship && (
                      <button
                        onClick={() => onRequestMentorship(prof)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Request Mentorship</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleConnect(prof.id, prof.fullName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        connectedMap[prof.id]
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                      }`}
                    >
                      {connectedMap[prof.id] ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CLINICAL INTERNSHIPS & OBSERVERSHIPS SECTION */}
      {(activeFilter === 'Clinical Internships' || activeFilter === 'All Accounts') && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clinical Internships & Observerships</h3>
                <p className="text-[11px] text-slate-500">Hospital rotations, ICMR research cohorts & surgical observerships</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Openings
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {filteredInternships.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={job.hospitalLogoUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0 bg-white"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{job.title}</h4>
                      <p className="text-[11px] text-slate-600 font-medium">{job.companyName} • {job.place}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          {job.stipend || job.salary}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {job.duration || 'Rotational'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Eligible: {job.experience}
                  </span>

                  {onApplyInternship && (
                    <button
                      onClick={() => onApplyInternship(job)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Apply for Posting</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ALUMNI MATCHING ENGINE */}
      {(activeFilter === 'Alumni Matching' || activeFilter === 'All Accounts') && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institutional Alumni Match</h3>
                <p className="text-[11px] text-slate-500">
                  {currentUser.role === 'STUDENT'
                    ? `Doctors & Professors graduated from ${currentUser.studentDetails?.collegeName || 'your college'}`
                    : 'Alumni colleagues & students from your alma mater'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Shared Alma Mater
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {algorithmicMentors.filter(m => m.isAlumniMatch || m.id === 'prof-1').map((item) => (
              <div
                key={`alumni-${item.id}`}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between gap-3"
              >
                <div 
                  onClick={() => onSelectUser(item)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={item.avatarUrl}
                    alt={item.fullName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                        {item.fullName}
                      </h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {item.doctorDetails?.academicTitle || item.doctorDetails?.specialization}
                    </p>
                    <p className="text-[10px] text-amber-800 font-semibold mt-0.5 bg-amber-100/70 px-2 py-0.5 rounded-md inline-block">
                      🏛️ Alumni: {item.doctorDetails?.alumniCollege || 'KIMS'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.role === 'STUDENT' && onRequestMentorship && (
                    <button
                      onClick={() => onRequestMentorship(item)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex-shrink-0 cursor-pointer"
                    >
                      Mentorship
                    </button>
                  )}
                  <button
                    onClick={() => handleConnect(`alumni-${item.id}`, item.fullName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                      connectedMap[`alumni-${item.id}`]
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    {connectedMap[`alumni-${item.id}`] ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ASSOCIATIONS & COMMUNITY CHAPTERS */}
      {(activeFilter === 'Associations & Chapters' || activeFilter === 'All Accounts') && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Community Chapters & Associations</h3>
                <p className="text-[11px] text-slate-500">Official medical state branches & student councils</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Official Bodies
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {communityBranches.map((branch) => (
              <div
                key={branch.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                    {branch.branch}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{branch.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {branch.members} • Recent: <span className="text-slate-700">{branch.recentTopic}</span>
                  </p>
                </div>

                <button
                  onClick={() => alert(`Joined ${branch.branch} of ${branch.name}!`)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
                >
                  <span>Join Chapter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
