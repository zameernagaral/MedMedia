import React, { useState } from 'react';
import { X, Briefcase, Building2, CheckCircle2, Calendar, FileText, Send, MapPin, DollarSign } from 'lucide-react';
import { UserProfile, InternshipApplication, Job } from '../types';

interface InternshipApplyModalProps {
  isOpen: boolean;
  job: Job | null;
  applicant: UserProfile;
  onClose: () => void;
  onSubmitSuccess: (app: InternshipApplication) => void;
}

export const InternshipApplyModal: React.FC<InternshipApplyModalProps> = ({
  isOpen,
  job,
  applicant,
  onClose,
  onSubmitSuccess
}) => {
  const [statement, setStatement] = useState<string>('');
  const [availableFrom, setAvailableFrom] = useState<string>('Next Month');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;

    const app: InternshipApplication = {
      id: `app-${Date.now()}`,
      applicantId: applicant.id,
      applicantName: applicant.fullName,
      applicantDiscipline: applicant.studentDetails?.discipline || 'Medical Student',
      applicantCollege: applicant.studentDetails?.collegeName || 'Recognized Medical College',
      applicantYear: applicant.studentDetails?.academicYear || 4,
      opportunityOrJobId: job.id,
      opportunityTitle: job.title,
      hospitalName: job.companyName,
      applicantSop: statement.trim(),
      availableFrom,
      status: 'SUBMITTED',
      submittedAt: 'Just now'
    };

    setIsSubmitted(true);
    setTimeout(() => {
      onSubmitSuccess(app);
      setIsSubmitted(false);
      setStatement('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <Briefcase className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base">Apply for Clinical Internship</h3>
                <p className="text-[11px] text-teal-200">Hospital Posting & Observership Application</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Job Target Banner */}
          <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/15 flex items-center gap-3">
            <img
              src={job.hospitalLogoUrl}
              alt=""
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-400 bg-white dark:bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs truncate">{job.title}</p>
              <p className="text-[11px] text-teal-200 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{job.companyName} • {job.place}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded">
                  {job.stipend || job.salary}
                </span>
                <span className="text-[10px] text-slate-300">
                  {job.duration || 'Rotational Posting'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Internship Application Submitted!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Your verified application and credentials have been submitted to the Medical Academic Director at <strong>{job.companyName}</strong>. Tracking status is now set to <strong>Under Review</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Applicant Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Verified Applicant</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{applicant.fullName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{applicant.studentDetails?.collegeName || applicant.bio}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-lg">
                Verified Candidate
              </span>
            </div>

            {/* Availability */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Earliest Starting Availability:
              </label>
              <select
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="Immediately (Within 7 Days)">Immediately (Within 7 Days)</option>
                <option value="Next Month (After Semester Exams)">Next Month (After Semester Exams)</option>
                <option value="Summer Elective / Observership">Summer Elective / Observership</option>
                <option value="Rotational Weekend Coverage">Rotational Weekend Coverage</option>
              </select>
            </div>

            {/* Brief Letter of Intent */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Clinical Experience & Statement of Motivation:</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Min 40 chars</span>
              </label>
              <textarea
                rows={3}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Briefly state your clinical rotations completed, diagnostic skills, and why you are enthusiastic about this hospital department..."
                className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!statement.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Clinical Application</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
