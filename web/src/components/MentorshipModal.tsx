import React, { useState } from 'react';
import { X, GraduationCap, Stethoscope, CheckCircle2, FileText, Send, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile, MentorshipRequest } from '../types';

interface MentorshipModalProps {
  isOpen: boolean;
  professor: UserProfile | null;
  student: UserProfile;
  onClose: () => void;
  onSubmitSuccess: (request: MentorshipRequest) => void;
}

export const MentorshipModal: React.FC<MentorshipModalProps> = ({
  isOpen,
  professor,
  student,
  onClose,
  onSubmitSuccess
}) => {
  const [focusArea, setFocusArea] = useState<MentorshipRequest['focusArea']>('Clinical Research');
  const [statement, setStatement] = useState<string>('');
  const [hasCollegeNoc, setHasCollegeNoc] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !professor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;

    const request: MentorshipRequest = {
      id: `mentorship-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      studentCollege: student.studentDetails?.collegeName || 'Recognized Medical College',
      studentYear: student.studentDetails?.academicYear || 4,
      studentAvatar: student.avatarUrl,
      professorId: professor.id,
      professorName: professor.fullName,
      focusArea,
      statementOfPurpose: statement.trim(),
      hasCollegeNoc,
      status: 'PENDING',
      createdAt: 'Just now'
    };

    setIsSubmitted(true);
    setTimeout(() => {
      onSubmitSuccess(request);
      setIsSubmitted(false);
      setStatement('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300">
                <GraduationCap className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base">Request Professor Mentorship</h3>
                <p className="text-[11px] text-sky-200">Academic & Clinical Guidance Matching</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Professor Target Banner */}
          <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/15 flex items-center gap-3">
            <img
              src={professor.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-400"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-xs truncate">{professor.fullName}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-200 font-semibold">
                  {professor.doctorDetails?.isProfessor ? 'Professor & HOD' : 'Senior Specialist'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {professor.doctorDetails?.academicTitle || professor.doctorDetails?.specialization}
              </p>
              <p className="text-[10px] text-emerald-300 font-semibold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {professor.doctorDetails?.mentorshipSlots?.available ?? 2} open mentee slots available
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Mentorship Application Dispatched!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your academic profile, college credentials, and statement of purpose have been forwarded directly to <strong>{professor.fullName}</strong>. You will receive an alert once accepted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Guidance Focus Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                1. Select Mentorship Focus Area:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'Clinical Research', label: '🔬 ICMR-STS / Clinical Research' },
                  { id: 'USMLE / NEET-PG Strategy', label: '📚 NEET-PG / USMLE Strategy' },
                  { id: 'Surgical Skills', label: '✂️ Bedside & Surgical Skills' },
                  { id: 'Subspecialty Guidance', label: '🩺 Cardiology / Super-specialty' },
                  { id: 'Case Reporting', label: '📄 PubMed Clinical Case Report' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFocusArea(item.id as MentorshipRequest['focusArea'])}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      focusArea === item.id
                        ? 'border-sky-600 bg-sky-50/70 text-sky-900 ring-1 ring-sky-500 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Verified Profile Preview */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant Credentials</span>
                <p className="font-bold text-slate-800">{student.fullName} (Year {student.studentDetails?.academicYear || 4})</p>
                <p className="text-[11px] text-slate-500">{student.studentDetails?.collegeName}</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg">
                Verified Student ID
              </span>
            </div>

            {/* Statement of Purpose */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>2. Statement of Purpose & Academic Goals:</span>
                <span className="text-[10px] text-slate-400 font-normal">Min 50 chars</span>
              </label>
              <textarea
                rows={3}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Explain why you wish to be mentored by this professor, your previous research exposure, and what you aim to achieve..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400 text-slate-800"
              />
            </div>

            {/* Verification Checklist */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="noc-check"
                checked={hasCollegeNoc}
                onChange={(e) => setHasCollegeNoc(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <label htmlFor="noc-check" className="text-xs text-slate-600 font-medium">
                I confirm I have college approval/NOC for external academic mentorship & clinical electives.
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!statement.trim()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Mentorship Request</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
