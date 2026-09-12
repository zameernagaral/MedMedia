import React, { useState } from 'react';
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
  PlusCircle, 
  Mail, 
  Award,
  ChevronRight
} from 'lucide-react';
import { Job, OpportunityItem, UserProfile } from '../types';
import { JobDetailModal } from './JobDetailModal';

interface OpportunitiesHubProps {
  jobs: Job[];
  opportunities: OpportunityItem[];
  currentUser: UserProfile;
}

export const OpportunitiesHub: React.FC<OpportunitiesHubProps> = ({
  jobs,
  opportunities,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'research' | 'freelance' | 'events' | 'courses' | 'community'>('jobs');
  
  // Job Filters (Slide 9)
  const [jobCategory, setJobCategory] = useState<string>('All');
  const [jobType, setJobType] = useState<string>('All');
  const [jobSearch, setJobSearch] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Event Filters (Slide 8: Upcoming, Near by you, By category, Search)
  const [eventCategory, setEventCategory] = useState<string>('All');
  const [eventNearbyOnly, setEventNearbyOnly] = useState<boolean>(false);

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

  // Filtered Opportunities
  const researchItems = opportunities.filter(o => o.type === 'RESEARCH');
  const freelanceItems = opportunities.filter(o => o.type === 'FREELANCE');
  const eventItems = opportunities.filter(o => o.type === 'EVENT');
  const courseItems = opportunities.filter(o => o.type === 'COURSE');

  return (
    <div className="space-y-4 pb-20">
      
      {/* 1. Header & Navigation Pills for Opportunities (Slide 8) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Opportunities Hub</h2>
            <p className="text-xs text-slate-500">
              Verified clinical appointments, research calls, locum gigs, CME & conferences.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200">
            {jobs.length + opportunities.length} Openings Active
          </span>
        </div>

        {/* Slide 8 Horizontal Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'jobs', label: 'Job Offers', icon: Briefcase },
            { id: 'research', label: 'Research Projects', icon: FlaskConical },
            { id: 'freelance', label: 'Free Lancing / Locum', icon: Clock },
            { id: 'events', label: 'Events & CME', icon: Calendar },
            { id: 'courses', label: 'Courses', icon: GraduationCap },
            { id: 'community', label: 'Community & Mentorship', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUBTAB: JOBS (Slide 9) */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-4">
          
          {/* Filters Bar (Slide 9: Preference/filters: Company name, Type full time/part time, Place, Experience) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by specialty, hospital name, skills..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
              >
                <option value="All">All Job Types</option>
                <option value="Full time">Full Time</option>
                <option value="Part time">Part Time</option>
                <option value="Locum">Locum</option>
              </select>
            </div>

            {/* Category Filter Pills (Slide 9: Doctor jobs, academic jobs, Internship, fellowship) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {['All', 'Doctor jobs', 'academic jobs', 'Internship', 'fellowship'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setJobCategory(cat)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full capitalize transition ${
                    jobCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Job List */}
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={job.hospitalLogoUrl}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 p-0.5 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                        {job.category}
                      </span>
                      <span className="text-xs text-slate-400">• {job.type}</span>
                      <span className="text-xs text-emerald-600 font-bold">{job.salary}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1 hover:text-sky-600 transition">
                      {job.title}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {job.companyName}
                      <span className="text-slate-300 mx-1">|</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.place}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{job.skills.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    View & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 3. SUBTAB: RESEARCH (Slide 8: Projects, twits, add Research, posts, connect Projects, calls) */}
      {activeSubTab === 'research' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold">Research Collaboration Registry</h3>
              <p className="text-xs text-sky-200 mt-0.5">
                Connect on multicenter clinical trials, meta-analyses, and PubMed publications.
              </p>
            </div>
            <button
              onClick={() => alert("Research project creation form open. Post an open call to medical students and researchers.")}
              className="px-3.5 py-1.5 bg-white text-sky-950 font-bold text-xs rounded-xl hover:bg-sky-50 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-sky-600" />
              Add Research Call
            </button>
          </div>

          <div className="space-y-3">
            {researchItems.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    Open Research Call
                  </span>
                  <span className="text-xs text-slate-500">{item.organizerOrAffiliation}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{item.title}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{item.subtitle}</p>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">{item.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Co-authorship contract provided</span>
                  <button
                    onClick={() => alert(`Request submitted to Dr. Arvind Ramesh for research collaboration on: ${item.title}`)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SUBTAB: FREELANCING / LOCUM (Slide 8: Find work, Post job, collaborate) */}
      {activeSubTab === 'freelance' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Locum Tenens & Freelance Shifts</h3>
              <p className="text-xs text-slate-500">Find emergency cover, tele-consult shifts, and medical writing contracts.</p>
            </div>
            <button
              onClick={() => alert("Post a locum requirement for your hospital or clinical center.")}
              className="px-3.5 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 font-bold text-xs rounded-xl hover:bg-sky-100 transition"
            >
              Post Locum Gig
            </button>
          </div>

          <div className="space-y-3">
            {freelanceItems.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Locum Duty
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.locationOrVenue}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                <p className="text-xs font-semibold text-sky-600 mt-1">{item.dateTime}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{item.organizerOrAffiliation}</span>
                  <button
                    onClick={() => alert(`Locum application sent for ${item.title}`)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUBTAB: EVENTS & CONFERENCES (Slide 8: Upcoming, Near by you, By category, Search; Overview: title, venue, time, date, organized by, contact) */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          
          {/* Event Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Events:</span>
              <button
                onClick={() => setEventNearbyOnly(!eventNearbyOnly)}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                  eventNearbyOnly ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                📍 Near by you
              </button>
            </div>
            <span className="text-xs text-slate-500">Upcoming Medical Summits</span>
          </div>

          <div className="space-y-3">
            {eventItems.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    {item.subtitle}
                  </span>
                  <span className="text-xs text-slate-400">National Accreditation</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{item.title}</h3>
                
                {/* Event Overview: Venue, Time and Date, Organized By, Contact (Slide 8) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Venue:</span>
                    <span className="font-semibold text-slate-800">{item.locationOrVenue}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Time and Date:</span>
                    <span className="font-semibold text-slate-800">{item.dateTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Organized By:</span>
                    <span className="font-semibold text-slate-800">{item.organizerOrAffiliation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact / Secretariat:</span>
                    <span className="font-semibold text-sky-600 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {item.contactEmail}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 mt-3 leading-relaxed">{item.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => alert(`RSVP confirmed for: ${item.title}. Badge sent to your email.`)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SUBTAB: COURSES (Slide 8: Updates & CME) */}
      {activeSubTab === 'courses' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Accredited Continuing Medical Education (CME)</h3>
            <p className="text-xs text-slate-500">Earn recognized credit hours and update your clinical protocols.</p>
          </div>

          <div className="space-y-3">
            {courseItems.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {item.cmeCredits} CME Credits
                    </span>
                    <span className="text-xs text-slate-400">• {item.organizerOrAffiliation}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                </div>

                <button
                  onClick={() => alert(`Enrolled in ${item.title}. Access granted to MedMedia Academy portal.`)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl whitespace-nowrap transition"
                >
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SUBTAB: COMMUNITY & MENTORSHIP (Slide 8: groups, Mentorship, discussion, all community) */}
      {activeSubTab === 'community' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-800 to-sky-800 text-white p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold">Doctor-to-Student Mentorship Network</h3>
            <p className="text-xs text-teal-100 mt-1">
              Pairs verified senior consultants with aspiring MBBS, Pharmacy, and Nursing scholars for clinical guidance and residency preparation.
            </p>
            <button
              onClick={() => alert("Mentorship questionnaire opened. Connecting you with senior mentors in your field of interest.")}
              className="mt-3 px-4 py-1.5 bg-white text-teal-900 text-xs font-bold rounded-xl hover:bg-teal-50 transition"
            >
              Request Specialty Mentor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Surgical Case Discussion Group", members: "12,400 surgeons", topics: "Bowel anastomosis, Laparoscopy pearls" },
              { name: "USMLE & NEET-PG Aspirants", members: "28,900 students", topics: "Daily high-yield question discussions" },
              { name: "Clinical Pharmacology Forum", members: "5,800 pharmacologists", topics: "Therapeutic drug monitoring, oncology trials" },
              { name: "Emergency & Critical Care Circle", members: "9,200 intensivists", topics: "Ventilator protocols, sepsis bundles" }
            ].map((grp, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{grp.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{grp.members}</p>
                  <p className="text-[11px] text-slate-700 mt-2">Active: {grp.topics}</p>
                </div>
                <button
                  onClick={() => alert(`Joined ${grp.name}!`)}
                  className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  Join Community Group
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Job Overview Modal (Slide 9) */}
      <JobDetailModal
        job={selectedJob}
        currentUser={currentUser}
        onClose={() => setSelectedJob(null)}
        onApply={(jobId) => alert(`Application for job #${jobId} submitted with verified credentials!`)}
      />

    </div>
  );
};
