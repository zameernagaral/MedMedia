import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  GraduationCap, 
  ShieldCheck, 
  Upload, 
  Mail, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sun,
  Moon,
  FileText,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole, StudentDiscipline } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, initialPostContent?: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'recovery'>('signup');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('DOCTOR');
  const [selectedDiscipline, setSelectedDiscipline] = useState<StudentDiscipline>('MEDICAL_STUDENT');
  
  // Mandatory Step 1 Fields
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  
  // Medical Verification Credentials
  const [specialization, setSpecialization] = useState('Cardiology');
  const [medicalRegNumber, setMedicalRegNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [academicYear, setAcademicYear] = useState('4');
  const [fileUploaded, setFileUploaded] = useState(false);
  
  // Step 2 Theme Choice
  const [chosenTheme, setChosenTheme] = useState<'dark' | 'light'>(isDarkMode ? 'dark' : 'light');
  
  // Step 3 First Post Content (Optional)
  const [firstPostContent, setFirstPostContent] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Validate Step 1 before moving to Theme selection
  const handleNextToTheme = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || !emailOrPhone.trim() || !password.trim() || !dob.trim()) {
      setStatusMessage("Please fill all mandatory fields (Name, Email/Phone, Password, and Date of Birth).");
      return;
    }
    setStatusMessage('');
    setSignupStep(2);
  };

  // Apply Theme and proceed to Step 3
  const handleThemeContinue = (applyChosenTheme: boolean) => {
    if (applyChosenTheme && onToggleDarkMode) {
      if (chosenTheme === 'dark' && !isDarkMode) {
        onToggleDarkMode();
      } else if (chosenTheme === 'light' && isDarkMode) {
        onToggleDarkMode();
      }
    }
    setSignupStep(3);
  };

  // Complete Signup (with or without first post)
  const handleFinalSignUp = (skipPost: boolean) => {
    setStatusMessage("Creating verified medical account & credentials...");

    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        fullName: fullName.trim() || (selectedRole === 'DOCTOR' ? "Dr. Healthcare Clinician" : "Medical Scholar"),
        username: selectedRole === 'DOCTOR' 
          ? (specialization.toLowerCase().replace(/\s+/g, '_') || 'dr_specialist')
          : (selectedDiscipline.toLowerCase().replace(/_/g, '_') || 'med_scholar'),
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@medmedia.health`,
        avatarUrl: selectedRole === 'DOCTOR'
          ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        role: selectedRole,
        verificationStatus: fileUploaded ? "VERIFIED" : "PENDING",
        badgeTitle: selectedRole === 'DOCTOR'
          ? (fileUploaded ? `Verified ${specialization} Specialist` : "Doctor (Verification Pending)")
          : (fileUploaded ? `Verified ${selectedDiscipline.replace('_', ' ')}` : "Student (Verification Pending)"),
        bio: selectedRole === 'DOCTOR'
          ? `Clinical specialist in ${specialization}. DOB: ${dob || 'Confidential'}. Verified medical practitioner.`
          : `${selectedDiscipline.replace('_', ' ')} candidate at ${collegeName || 'Medical College'}. DOB: ${dob || 'Confidential'}.`,
        doctorDetails: selectedRole === 'DOCTOR' ? {
          specialization,
          qualifications: ["MBBS", "MD / DNB"],
          hospitalAffiliation: "State Medical Center",
          location: "Central Healthcare Campus",
          yearsExperience: 4,
          clinicalInterests: [specialization, "Clinical Case Review"],
          researchPublications: ["Clinical Outcome Evaluation in Tertiary Care"],
          medicalCouncilRegNumber: medicalRegNumber || "MCI-REG-2026",
          isAcceptingMentees: true,
          mentorshipSlots: { available: 2, total: 3 },
          activeResearchProject: "Clinical Outcomes & Patient Pathways"
        } : undefined,
        studentDetails: selectedRole === 'STUDENT' ? {
          discipline: selectedDiscipline,
          collegeName: collegeName || "State Medical College & Research Institute",
          academicYear: Number(academicYear) || 4,
          interests: ["Clinical Rounds", "Diagnostics", "Pharmacology"],
          futureSpecialty: "Internal Medicine / Surgery",
          researchInterests: ["Evidence-Based Clinical Audits"],
          isSeekingInternship: true
        } : undefined,
        stats: {
          postsCount: !skipPost && firstPostContent.trim() ? 1 : 0,
          followersCount: 18,
          connectionsCount: 9
        }
      };

      const finalPostText = skipPost ? undefined : (firstPostContent.trim() || undefined);
      onLoginSuccess(newUser, finalPostText);
      onClose();
    }, 850);
  };

  // Regular Sign In / Login
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) {
      setStatusMessage("Please enter your Phone/Email and Password.");
      return;
    }
    setStatusMessage("Authenticating with MedMedia Secure Vault...");

    setTimeout(() => {
      const isDoc = emailOrPhone.toLowerCase().includes('doc') || !emailOrPhone.includes('student');
      const existingUser: UserProfile = {
        id: `usr-login-${Date.now()}`,
        fullName: isDoc ? "Dr. Rajesh Sharma" : "Ananya Deshmukh",
        username: isDoc ? "rajesh_cardio" : "ananya_mbbs",
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@medmedia.health`,
        avatarUrl: isDoc
          ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        role: isDoc ? 'DOCTOR' : 'STUDENT',
        verificationStatus: "VERIFIED",
        badgeTitle: isDoc ? "Verified Cardiothoracic Specialist" : "Verified MBBS Scholar (Year 4)",
        bio: isDoc
          ? "Senior Cardiothoracic consultant & professor at AllMS. Passionate about surgical trials."
          : "Final-year MBBS scholar actively seeking clinical internship and mentorship.",
        doctorDetails: isDoc ? {
          specialization: "Cardiothoracic Surgery",
          qualifications: ["MBBS", "MS", "MCh"],
          hospitalAffiliation: "Metro Heart Institute",
          location: "New Delhi",
          yearsExperience: 8,
          clinicalInterests: ["Minimally Invasive Surgery", "TAVI"],
          researchPublications: ["Modern Perfusion Techniques in Pediatric Cases"],
          medicalCouncilRegNumber: "MCI-48291-DEL",
          isAcceptingMentees: true,
          mentorshipSlots: { available: 2, total: 3 },
          activeResearchProject: "Perfusion Protocols in High-Risk Bypass"
        } : undefined,
        studentDetails: !isDoc ? {
          discipline: "MEDICAL_STUDENT",
          collegeName: "King George's Medical University",
          academicYear: 4,
          interests: ["Internal Medicine", "ICU Rounds"],
          futureSpecialty: "Cardiology",
          researchInterests: ["Preventive Cardiology Audits"],
          isSeekingInternship: true
        } : undefined,
        stats: {
          postsCount: 4,
          followersCount: 340,
          connectionsCount: 118
        }
      };

      onLoginSuccess(existingUser);
      onClose();
    }, 700);
  };

  const handleGoogleLogin = () => {
    setStatusMessage("Connecting with Google Healthcare SSO...");
    setTimeout(() => {
      const googleUser: UserProfile = {
        id: "usr-google-1",
        fullName: "Dr. Google Authenticated",
        username: "google_clinician",
        email: "verified.doctor@gmail.com",
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
        role: selectedRole,
        verificationStatus: "VERIFIED",
        badgeTitle: selectedRole === 'DOCTOR' ? "Google Verified Physician" : "Google Verified Scholar",
        bio: "Practicing physician verified via OAuth 2.0 and medical credential registry.",
        stats: { postsCount: 3, followersCount: 145, connectionsCount: 52 }
      };
      onLoginSuccess(googleUser);
      onClose();
    }, 600);
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignupStep(1);
              setStatusMessage('');
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'signup' 
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            New Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setStatusMessage('');
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'signin' 
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In / Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('recovery');
              setStatusMessage('');
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'recovery' 
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Recovery
          </button>
        </div>

        {/* Sign Up Step Progress Bar */}
        {mode === 'signup' && (
          <div className="px-6 pt-3 pb-2 bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
              <span className={signupStep >= 1 ? "text-sky-600 dark:text-sky-400 flex items-center gap-1" : "text-slate-400"}>
                <span>1. Info & DOB *</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">→</span>
              <span className={signupStep >= 2 ? "text-sky-600 dark:text-sky-400 flex items-center gap-1" : "text-slate-400"}>
                <span>2. Theme</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Skip</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">→</span>
              <span className={signupStep >= 3 ? "text-sky-600 dark:text-sky-400 flex items-center gap-1" : "text-slate-400"}>
                <span>3. First Post</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Skip</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-sky-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(signupStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIGN UP WIZARD                                                            */}
        {/* ========================================================================= */}
        {mode === 'signup' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* ---------------- STEP 1: CREDENTIALS & MANDATORY FIELDS ---------------- */}
            {signupStep === 1 && (
              <form onSubmit={handleNextToTheme} className="space-y-4">
                
                {/* Role Picker */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Select Your Medical Role *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('DOCTOR')}
                      className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                        selectedRole === 'DOCTOR'
                          ? 'border-sky-600 dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/50 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-1.5 rounded-xl ${selectedRole === 'DOCTOR' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        {selectedRole === 'DOCTOR' && <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Doctor / Professor</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Consultants, Mentors, Faculty</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('STUDENT')}
                      className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                        selectedRole === 'STUDENT'
                          ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-1.5 rounded-xl ${selectedRole === 'STUDENT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        {selectedRole === 'STUDENT' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Scholar</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">MBBS, Nursing, Pharmacy, MLT</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Mandatory Fields Group */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Mandatory Identification Fields
                    </span>
                    <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">
                      * All 4 required
                    </span>
                  </div>

                  {/* 1. Full Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedRole === 'DOCTOR' ? "Dr. Priya Patel" : "Alex Morgan"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* 2. Email or Phone */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                      <span>Email or Phone Number <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">For OTP & Login</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="doctor@hospital.org or +91 98765 43210"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* 3. Password */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* 4. Date of Birth (DOB) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        Date of Birth (DOB) <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Age verification</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Role Specific Credentials */}
                {selectedRole === 'DOCTOR' ? (
                  <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl space-y-2.5">
                    <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      Medical Council Credentials
                    </h4>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Specialty / Discipline:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cardiology, Neurology, Orthopedics"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Medical Council Registration Number (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KMC-58291-IND"
                        value={medicalRegNumber}
                        onChange={(e) => setMedicalRegNumber(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                      />
                    </div>
                    <div
                      onClick={() => setFileUploaded(!fileUploaded)}
                      className={`p-2.5 border border-dashed rounded-xl text-center cursor-pointer transition ${
                        fileUploaded 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : 'border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 mx-auto mb-1 text-sky-600 dark:text-sky-400" />
                      <p className="text-[11px] font-bold">
                        {fileUploaded ? "✓ Medical Registration Certificate Attached" : "Upload Medical License / Certificate (Optional)"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2.5">
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Academic Healthcare Discipline
                    </h4>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Discipline Stream:
                      </label>
                      <select
                        value={selectedDiscipline}
                        onChange={(e) => setSelectedDiscipline(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                      >
                        <option value="MEDICAL_STUDENT">Medical Student (MBBS)</option>
                        <option value="NURSING">Nursing (B.Sc / GNM)</option>
                        <option value="B_PHARM">B Pharm (Bachelor of Pharmacy)</option>
                        <option value="D_PHARM">D Pharm (Diploma in Pharmacy)</option>
                        <option value="LAB_PRACTITIONER">Lab Practitioner (MLT / Allied)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        College / Institution Name:
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
                      className={`p-2.5 border border-dashed rounded-xl text-center cursor-pointer transition ${
                        fileUploaded 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-[11px] font-bold">
                        {fileUploaded ? "✓ Student ID Attached" : "Upload Student ID Card / College Slip (Optional)"}
                      </p>
                    </div>
                  </div>
                )}

                {statusMessage && (
                  <p className="text-xs text-center font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg">
                    {statusMessage}
                  </p>
                )}

                {/* Continue to Step 2 */}
                <button
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Theme Setup (Step 2 of 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* ---------------- STEP 2: THEME SETUP (WITH SKIP) ---------------- */}
            {signupStep === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Choose Your Workspace Theme
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Tailored for low-fatigue hospital rounds. You can toggle this anytime in Profile Settings or skip this step.
                  </p>
                </div>

                {/* Theme Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  
                  {/* Daylight Card */}
                  <button
                    type="button"
                    onClick={() => setChosenTheme('light')}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      chosenTheme === 'light'
                        ? 'border-sky-600 dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                        <Sun className="w-5 h-5" />
                      </div>
                      {chosenTheme === 'light' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Medical Daylight</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        High clarity, crisp documentation, and daylight clinical study.
                      </p>
                    </div>
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => setChosenTheme('dark')}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      chosenTheme === 'dark'
                        ? 'border-sky-600 dark:border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-400 flex items-center justify-center">
                        <Moon className="w-5 h-5" />
                      </div>
                      {chosenTheme === 'dark' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clinical Dark Mode</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Reduced eye strain for night shifts, OT imaging review, and low-light wards.
                      </p>
                    </div>
                  </button>

                </div>

                {/* Theme Action Buttons (Apply vs Skip) */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleThemeContinue(true)}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apply {chosenTheme === 'dark' ? 'Dark Mode' : 'Daylight'} & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeContinue(false)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Skip Theme Selection (Keep Current) →</span>
                  </button>
                </div>

                <div className="flex justify-start pt-1">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Account Details</span>
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: FIRST POST (OPTIONAL WITH SKIP) ---------------- */}
            {signupStep === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Publish Your First Clinical Post (Optional)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Introduce yourself, share a clinical question, case observation, or internship goal. You can also skip this and enter directly.
                  </p>
                </div>

                {/* Suggested Topics / Tags */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    "👋 Introduction",
                    "🫀 Cardiology Case",
                    "🔬 Research Query",
                    "🏥 Internship Observership",
                    "🩺 Clinical Pearls"
                  ].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        setFirstPostContent(prev => prev ? `${prev} ${topic}` : `Hello MedMedia! ${topic}: `);
                      }}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-300 hover:text-sky-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                {/* First Post Textarea */}
                <div className="space-y-1">
                  <textarea
                    rows={4}
                    placeholder={
                      selectedRole === 'DOCTOR'
                        ? "e.g. Hello colleagues! Starting my clinical discussions here on MedMedia. Looking forward to reviewing interesting cardiac ECG cases, clinical research, and mentoring students."
                        : "e.g. Hello everyone! Final-year MBBS scholar here. Currently preparing for clinical rounds & excited to connect with professors for guidance on cardiology case studies!"
                    }
                    value={firstPostContent}
                    onChange={(e) => setFirstPostContent(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Patient confidentiality protected under MedMedia Shield</span>
                    <span>{firstPostContent.length} chars</span>
                  </div>
                </div>

                {statusMessage && (
                  <p className="text-xs text-center font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 py-2 rounded-lg">
                    {statusMessage}
                  </p>
                )}

                {/* Final Actions: Publish vs Skip */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleFinalSignUp(false)}
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀 Publish First Post & Enter MedMedia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalSignUp(true)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Skip Post & Enter MedMedia →</span>
                  </button>
                </div>

                <div className="flex justify-start pt-1">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Theme Setup</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* SIGN IN FORM                                                              */}
        {/* ========================================================================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone or Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="doctor@hospital.org or +91 98765 43210"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('recovery')}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {statusMessage && (
              <p className="text-xs text-center font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 py-2 rounded-lg">
                {statusMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to MedMedia</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google Login */}
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
                <span>Continue with Google OAuth</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* RECOVERY FORM                                                             */}
        {/* ========================================================================= */}
        {mode === 'recovery' && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setStatusMessage("Reset code dispatched via SMS / Encrypted Email.");
            }} 
            className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Registered Phone or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="doctor@hospital.org or +91 98765 43210"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {statusMessage && (
              <p className="text-xs text-center font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 py-2 rounded-lg">
                {statusMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send Recovery Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMode('signin')}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Back to Sign In
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
