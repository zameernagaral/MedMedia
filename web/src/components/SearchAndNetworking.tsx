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
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

interface SearchAndNetworkingProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onConnectSuggestion: (name: string) => void;
}

export const SearchAndNetworking: React.FC<SearchAndNetworkingProps> = ({
  currentUser,
  onSelectUser,
  onConnectSuggestion
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Accounts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

  // Slide 10 Category Pills: Accounts | community | associations | posts | job offers | Hospital |
  const categories = [
    'Accounts',
    'community',
    'associations',
    'posts',
    'job offers',
    'Hospital'
  ];

  // Slide 10: Networking & Alumni connection data
  const networkingSuggestions = [
    {
      id: "net-1",
      name: "Dr. Sandeep Kulkarni, MS, MCh",
      roleText: "Cardiothoracic Surgeon @ Narayana Health",
      reason: "Alumni connection: AIIMS New Delhi (Class of 2012)",
      tag: "Alumni Connection",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&h=120&fit=crop"
    },
    {
      id: "net-2",
      name: "Sneha Rao",
      roleText: "Final Year MBBS @ Bangalore Medical College (BMCRI)",
      reason: "Likely preference: Shared clinical interest in Cardiothoracic Surgery & POCUS",
      tag: "Likely Preference",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop"
    },
    {
      id: "net-3",
      name: "Dr. Clara Dubois, MD",
      roleText: "Pediatric Intensivist @ Boston Children's Hospital",
      reason: "Research collaborator suggestion: Co-investigator on ECMO protocols",
      tag: "Specialty Suggestion",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop"
    }
  ];

  // Slide 10: Community & Branches
  const communityBranches = [
    {
      id: "cb-1",
      name: "Cardiological Society of India",
      branch: "Karnataka State Chapter (Branch 04)",
      members: "4,900 Active Clinicians",
      recentTopic: "Live cath lab transmission updates"
    },
    {
      id: "cb-2",
      name: "Indian Medical Association - Youth Wing",
      branch: "South Zone Medical Students Council",
      members: "24,500 Scholars",
      recentTopic: "Internship stipend regulations & residency prep"
    },
    {
      id: "cb-3",
      name: "Association of Pharmaceutical Teachers of India",
      branch: "National Pharmacology Branch",
      members: "6,100 Professors & Students",
      recentTopic: "Clinical trial curriculum alignment"
    }
  ];

  const handleConnect = (id: string, name: string) => {
    setConnectedMap(prev => ({ ...prev, [id]: true }));
    onConnectSuggestion(name);
  };

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto">
      
      {/* 1. Slide 10 Search Bar with Filter Pills */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search accounts, hospital branches, posts, job offers, associations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        {/* Categories Bar (Slide 10: Accounts | community | associations | posts | job offers | Hospital |) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition ${
                activeCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Slide 10 Left Column: Networking (Likely preference, Alumni connection, Suggestions) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Networking Engine</h3>
              <p className="text-[11px] text-slate-500">Alumni connections, Likely preferences & Specialty matches</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            Automated Matching
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {networkingSuggestions.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{item.roleText}</p>
                  <p className="text-[10px] text-sky-700 font-semibold mt-1 bg-sky-100/60 px-2 py-0.5 rounded-md inline-block">
                    {item.reason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleConnect(item.id, item.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 flex-shrink-0 ${
                  connectedMap[item.id]
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                }`}
              >
                {connectedMap[item.id] ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sent
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Connect
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Slide 10 Right Column: Community & Branches (We will give data, Suggestions) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Community Chapters & Branches</h3>
              <p className="text-[11px] text-slate-500">Regional state medical branches & student councils</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Official Data
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
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-end sm:self-center"
              >
                <span>Join Chapter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
