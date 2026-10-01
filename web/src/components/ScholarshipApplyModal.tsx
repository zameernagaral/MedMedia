import React, { useState } from 'react';
import { 
  Award, 
  X, 
  CheckCircle2, 
  FileText, 
  Upload, 
  GraduationCap, 
  Building2, 
  DollarSign, 
  Calendar,
  AlertCircle,
  ShieldCheck,
  Paperclip
} from 'lucide-react';
import { ScholarshipItem, UserProfile } from '../types';

interface ScholarshipApplyModalProps {
  isOpen: boolean;
  scholarship: ScholarshipItem | null;
  applicant: UserProfile;
  onClose: () => void;
  onSubmitSuccess: (application: any) => void;
}

export const ScholarshipApplyModal: React.FC<ScholarshipApplyModalProps> = ({
  isOpen,
  scholarship,
  applicant,
  onClose,
  onSubmitSuccess
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState(applicant.phoneNumber || '');
  const [college, setCollege] = useState(
    applicant.studentDetails?.collegeName || 
    applicant.doctorDetails?.hospitalAffiliation || 
    'Kempegowda Institute of Medical Sciences'
  );
  const [academicScore, setAcademicScore] = useState('84.2% (Gold Medalist)');
  const [incomeBracket, setIncomeBracket] = useState('< ₹4.5 Lakhs / annum');
  const [statementOfPurpose, setStatementOfPurpose] = useState(
    'I am applying for this healthcare scholarship to fund my clinical research on cardiovascular disease biomarkers and support my MBBS clinical rotations.'
  );
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !scholarship) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const appData = {
        scholarshipId: scholarship.id,
        scholarshipTitle: scholarship.title || scholarship.name,
        applicantName: applicant.fullName,
        collegeName: college,
        academicScore,
        submittedAt: 'Just now',
        status: 'SUBMITTED'
      };
      onSubmitSuccess(appData);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Buddy4Study Medical Aid Portal
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {scholarship.title || scholarship.name}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scholarship Highlights Banner */}
        <div className="my-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/60 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">Grant Coverage</span>
            <span className="font-bold text-amber-700 dark:text-amber-300 text-sm">
              {scholarship.coverage || scholarship.fundingAmount || '₹50,000 / annum'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">Deadline</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {scholarship.deadline || 'Nov 30, 2026'}
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <button 
            type="button" 
            onClick={() => setStep(1)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              step === 1 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            1. Eligibility & Overview
          </button>
          <button 
            type="button" 
            onClick={() => setStep(2)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              step === 2 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            2. Application Form
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Grant Provider</h4>
              <p className="text-slate-600 dark:text-slate-300">{scholarship.provider || scholarship.organization || 'ICMR & Buddy4Study Medical Foundation'}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Description</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{scholarship.description}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Required Criteria & Documents
              </h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside pl-1">
                <li>Active enrolment in MBBS, MD, MS, BDS, Nursing, or Allied Health.</li>
                <li>Minimum 60% aggregate academic performance in recent examination.</li>
                <li>Valid Student ID Card & Medical College Admission Certificate.</li>
                <li>Income certificate / Self-declaration of family income bracket.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Application Form</span>
              <span>→</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Applicant Full Name</label>
              <input
                type="text"
                disabled
                value={applicant.fullName}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Score / CGPA *</label>
                <input
                  type="text"
                  required
                  value={academicScore}
                  onChange={(e) => setAcademicScore(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medical College / Institution *</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Annual Family Income Bracket *</label>
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="< ₹2.5 Lakhs / annum">&lt; ₹2.5 Lakhs / annum</option>
                <option value="< ₹4.5 Lakhs / annum">&lt; ₹4.5 Lakhs / annum</option>
                <option value="₹4.5L - ₹8.0L / annum">₹4.5L - ₹8.0L / annum</option>
                <option value="Merit-based (Income not applicable)">Merit-based (Income not applicable)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Statement of Purpose & Academic Goals *</label>
              <textarea
                rows={3}
                required
                value={statementOfPurpose}
                onChange={(e) => setStatementOfPurpose(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attach Marksheet / College ID Proof</label>
              <div className="p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-800/40">
                <Paperclip className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {uploadedDocName ? `Attached: ${uploadedDocName}` : 'Upload Marksheet / ID PDF (Max 10MB)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  id="scholarship-doc-file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setUploadedDocName(e.target.files[0].name);
                  }}
                />
                <label 
                  htmlFor="scholarship-doc-file" 
                  className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 cursor-pointer hover:underline"
                >
                  Browse Document
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Scholarship Application'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
