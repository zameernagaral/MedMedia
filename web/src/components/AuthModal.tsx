import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  GraduationCap, 
  ShieldCheck, 
  Upload, 
  Smartphone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { UserProfile, UserRole, StudentDiscipline } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'recovery'>('signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DOCTOR');
  const [selectedDiscipline, setSelectedDiscipline] = useState<StudentDiscipline>('MEDICAL_STUDENT');
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [medicalRegNumber, setMedicalRegNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [academicYear, setAcademicYear] = useState('4');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Validating credentials with verification registry...");

    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        fullName: fullName || (selectedRole === 'DOCTOR' ? "Dr. New Practitioner" : "New Student Scholar"),
        username: selectedRole === 'DOCTOR' 
          ? (specialization.toLowerCase().replace(/\s+/g, '_')) 
          : (selectedDiscipline.toLowerCase().replace(/_/g, ' ')),
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@medmedia.health`,
        avatarUrl: selectedRole === 'DOCTOR'
          ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        role: selectedRole,
        verificationStatus: fileUploaded ? "VERIFIED" : "PENDING",
        badgeTitle: selectedRole === 'DOCTOR'
          ? (fileUploaded ? `Verified ${specialization} Specialist` : "Doctor (Verification Pending)")
          : (fileUploaded ? `Verified ${selectedDiscipline.replace('_', ' ')}` : "Student (Verification Pending)"),
        bio: selectedRole === 'DOCTOR'
          ? `Clinical consultant specializing in ${specialization}.`
          : `${selectedDiscipline.replace('_', ' ')} scholar at ${collegeName || 'Medical College'}.`,
        doctorDetails: selectedRole === 'DOCTOR' ? {
          specialization,
          qualifications: ["MBBS", "MD"],
          hospitalAffiliation: "City Medical Center",
          location: "Metro Hospital Hub",
          yearsExperience: 5,
          clinicalInterests: [specialization, "Clinical Research"],
          researchPublications: ["Clinical Outcome Evaluation in Tertiary Care"],
          medicalCouncilRegNumber: medicalRegNumber || "KMC-REG-2026"
        } : undefined,
        studentDetails: selectedRole === 'STUDENT' ? {
          discipline: selectedDiscipline,
          collegeName: collegeName || "State Medical University",
          academicYear: Number(academicYear),
          interests: ["Clinical Rounds", "Diagnostics"],
          futureSpecialty: "Internal Medicine",
          researchInterests: ["Public Health & Clinical Audits"]
        } : undefined,
        stats: {
          postsCount: 1,
          followersCount: 12,
          connectionsCount: 8
        }
      };

      onLoginSuccess(newUser);
      onClose();
    }, 900);
  };

  const handleGoogleLogin = () => {
    setStatusMessage("Connecting to Google OAuth...");
    setTimeout(() => {
      // Mock Google Login as Doctor
      const googleUser: UserProfile = {
        id: "usr-google-1",
        fullName: "Dr. Google Authenticated",
        username: "google_clinician",
        email: "verified.doctor@gmail.com",
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
        role: selectedRole,
        verificationStatus: "VERIFIED",
        badgeTitle: selectedRole === 'DOCTOR' ? "Google Verified Physician" : "Google Verified Scholar",
        bio: "Practicing physician verified via OAuth 2.0 and medical credential integration.",
        stats: { postsCount: 5, followersCount: 120, connectionsCount: 45 }
      };
      onLoginSuccess(googleUser);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 transition-colors duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-sm">
              M
            </span>
            <span className="font-extrabold text-base tracking-tight">MedMedia Authentication</span>
          </div>

          <p className="text-xs text-white/70">
            {mode === 'signup'
              ? 'Join the verified healthcare professional and student community.'
              : mode === 'signin'
              ? 'Sign in with phone, email, or Google to access your clinical feed.'
              : 'Password recovery & session authentication.'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up vs Recovery - Slide 2) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-slate-950">
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'signup' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            New Account (Verify)
          </button>
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'signin' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In / Log In
          </button>
          <button
            onClick={() => setMode('recovery')}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'recovery' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Recovery
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* SLIDE 3: SELECTION - Two User Types (Doctor verification vs Student verification) */}
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                User Type Selection (Slide 3 & 4)
              </label>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Doctor Selection */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('DOCTOR')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'DOCTOR'
                      ? 'border-sky-600 dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${selectedRole === 'DOCTOR' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    {selectedRole === 'DOCTOR' && <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Doctor Verification</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Consultants, Specialists, Surgeons</p>
                  </div>
                </button>

                {/* Student Selection */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('STUDENT')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'STUDENT'
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${selectedRole === 'STUDENT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {selectedRole === 'STUDENT' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Verification</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">MBBS, Nursing, B.Pharm, D.Pharm, Lab</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Full Name & Identifiers (Phone / email - Slide 2) */}
          <div className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name {selectedRole === 'DOCTOR' ? '(e.g., Dr. Jane Smith)' : ''}
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'DOCTOR' ? "Dr. Priya Patel" : "Alex Morgan"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                <span>Phone or Email Address (Slide 2)</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Used for OTP / Password login</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="doctor@hospital.org or +91 98765 43210"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {mode !== 'recovery' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DOCTOR VERIFICATION FIELDS (Slide 3: Specialization, Qualifications, Medical Reg Number) */}
          {mode === 'signup' && selectedRole === 'DOCTOR' && (
            <div className="p-4 bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Medical Council Verification Details (Slide 3)
              </h4>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Username Specialization (e.g. Cardiology, Neurology, Pediatrics)
                </label>
                <input
                  type="text"
                  placeholder="Interventional Cardiology"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Medical Council Registration Number (MCI / State Council)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KMC-58291-IND"
                  value={medicalRegNumber}
                  onChange={(e) => setMedicalRegNumber(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                />
              </div>

              {/* Document Upload Button */}
              <div
                onClick={() => setFileUploaded(!fileUploaded)}
                className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
                  fileUploaded 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                    : 'border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/30'
                }`}
              >
                <Upload className="w-4 h-4 mx-auto mb-1 text-sky-600 dark:text-sky-400" />
                <p className="text-xs font-bold">
                  {fileUploaded ? "✓ Medical Registration Certificate Attached" : "Upload Medical License / Council Registration"}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG, or PDF up to 10MB</p>
              </div>
            </div>
          )}

          {/* STUDENT VERIFICATION FIELDS (Slide 4: medical student, nursing, B parm, D parm, lab practioner) */}
          {mode === 'signup' && selectedRole === 'STUDENT' && (
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Student Discipline & Institution Verification (Slide 4)
              </h4>

              {/* Student category username choice (Slide 4) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Username Category (Slide 4):
                </label>
                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="MEDICAL_STUDENT">medical student (MBBS)</option>
                  <option value="NURSING">nursing (B.Sc / GNM)</option>
                  <option value="B_PHARM">B parm (Bachelor of Pharmacy)</option>
                  <option value="D_PHARM">D parm (Diploma in Pharmacy)</option>
                  <option value="LAB_PRACTITIONER">lab practioner (MLT / Allied Health)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Medical / Pharmacy College Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore Medical College & Research Institute"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                />
              </div>

              <div
                onClick={() => setFileUploaded(!fileUploaded)}
                className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
                  fileUploaded 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                    : 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                <Upload className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-bold">
                  {fileUploaded ? "✓ Student Photo ID Attached" : "Upload College Student ID Card / Tuition Slip"}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Eligible for Academic Caduceus Badge</p>
              </div>
            </div>
          )}

          {statusMessage && (
            <p className="text-xs text-center font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 py-2 rounded-lg">
              {statusMessage}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {mode === 'signup'
                ? `Complete ${selectedRole === 'DOCTOR' ? 'Doctor' : 'Student'} Verification & Sign Up`
                : mode === 'signin'
                ? 'Sign In to MedMedia'
                : 'Send Password Reset Link'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Google Login (Slide 2: Google login) */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google (OAuth)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
