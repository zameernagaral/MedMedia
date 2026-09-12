import React, { useState } from 'react';
import { X, Building2, MapPin, Briefcase, Clock, Award, CheckCircle2, Send, FileText } from 'lucide-react';
import { Job, UserProfile } from '../types';

interface JobDetailModalProps {
  job: Job | null;
  currentUser: UserProfile;
  onClose: () => void;
  onApply: (jobId: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  currentUser,
  onClose,
  onApply
}) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [coverNote, setCoverNote] = useState('');

  if (!job) return null;

  const handleApplication = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(job.id);
    setHasApplied(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={job.hospitalLogoUrl}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover bg-white p-1 border-2 border-sky-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-wider">
                  {job.category}
                </span>
                <span className="text-xs text-white/70">{job.type}</span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">{job.title}</h2>
              <p className="text-xs text-white/80 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                {job.companyName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-white/90">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              {job.place}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              {job.experience}
            </span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              {job.salary}
            </span>
          </div>
        </div>

        {/* Content Body (Slide 9: Job description, Overview with all data, Preference education, skills) */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* Overview & Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Job Description & Overview
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Preference Education */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Educational Qualifications & Eligibility
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-2">
              <Award className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
              <span>{job.preferenceEducation}</span>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Clinical Skills & Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 1-Click Application Box */}
          <div className="pt-3 border-t border-slate-100">
            {hasApplied ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold">Application Submitted!</h5>
                  <p className="text-[11px] text-emerald-700">
                    Your verified MedMedia portfolio and credentials have been transmitted to {job.companyName}.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplication} className="space-y-3">
                <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-900 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-sky-600" />
                    Applying as: <strong>{currentUser.fullName}</strong> ({currentUser.badgeTitle})
                  </span>
                  <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                    Verified Badge Attached
                  </span>
                </div>

                <textarea
                  rows={2}
                  placeholder="Optional cover note to the medical recruiting panel..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit 1-Click Verified Application
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
