import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Download, 
  Sparkles, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  FileText, 
  ShieldCheck, 
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

export interface MedicalDocItem {
  id: string;
  title: string;
  author: string;
  authorRole?: string;
  specialty: string;
  category: 'Clinical Guideline' | 'Case Study PDF' | 'Exam Prep & Notes' | 'Drug Reference Index' | string;
  description: string;
  pageCount: number;
  fileSize: string;
  downloadUrl: string;
  upvotesCount: number;
  isUpvoted?: boolean;
  isSaved?: boolean;
  keyPearls: string[];
  aiSummary?: string;
  publishedDate: string;
}

interface DocHubModalProps {
  isOpen: boolean;
  doc: MedicalDocItem | null;
  currentUser: UserProfile;
  onClose: () => void;
  onDownloadDoc?: (doc: MedicalDocItem) => void;
}

export const DocHubModal: React.FC<DocHubModalProps> = ({
  isOpen,
  doc,
  currentUser,
  onClose,
  onDownloadDoc
}) => {
  const [upvotes, setUpvotes] = useState(doc?.upvotesCount || 0);
  const [hasUpvoted, setHasUpvoted] = useState(doc?.isUpvoted || false);
  const [isSaved, setIsSaved] = useState(doc?.isSaved || false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen || !doc) return null;

  const handleToggleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
    }
  };

  const handleDownload = () => {
    // Create a simulated downloadable file blob or trigger download
    const element = document.createElement('a');
    const fileContent = `=== MEDMEDIA DOCHUB CLINICAL DOCUMENT ===\nTitle: ${doc.title}\nAuthor: ${doc.author}\nSpecialty: ${doc.specialty}\nPublished: ${doc.publishedDate}\n\nKEY CLINICAL PEARLS:\n${doc.keyPearls.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\nAI CLINICAL SUMMARY:\n${doc.aiSummary || 'Available in MedMedia DocHub'}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_medmedia.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setToast("Document downloaded successfully to device!");
    setTimeout(() => setToast(null), 3000);

    if (onDownloadDoc) onDownloadDoc(doc);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                  {doc.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {doc.specialty}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                {doc.title}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Metadata Row */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Author / Institution</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                {doc.author}
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block">Format & Length</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                PDF • {doc.pageCount} Pages ({doc.fileSize})
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Document Abstract</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{doc.description}</p>
          </div>

          {/* Key Clinical Pearls */}
          <div className="p-4 bg-sky-50/70 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800/80 space-y-2">
            <h4 className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Key High-Yield Clinical Takeaways
            </h4>
            <ul className="space-y-1.5 text-sky-950 dark:text-sky-100 text-xs">
              {doc.keyPearls.map((pearl, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px]">{i+1}.</span>
                  <span>{pearl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Clinical Summary Assistant Drawer Toggle */}
          <div>
            <button
              onClick={() => setShowAiSummary(prev => !prev)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-xs flex items-center justify-between shadow-sm cursor-pointer hover:opacity-95 transition"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{showAiSummary ? 'Hide MedMedia Clinical AI Summary' : 'Summarize Document with Clinical AI'}</span>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform ${showAiSummary ? 'rotate-90' : ''}`} />
            </button>

            {showAiSummary && (
              <div className="mt-2 p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2 text-indigo-950 dark:text-indigo-100 animate-in fade-in">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  AI-Generated Diagnostic & Management Protocol
                </span>
                <p className="leading-relaxed">
                  {doc.aiSummary || `1. Primary Diagnosis Protocol: Identify hallmark symptoms and early biomarkers.\n2. Acute Management: Immediate pharmacotherapy guidelines and dose adjustments.\n3. Escalation Criteria: Monitoring indicators for specialist referral.`}
                </p>
              </div>
            )}
          </div>

          {/* Simulated Document Viewer Canvas */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-100 dark:bg-slate-950 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto opacity-70" />
            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {doc.title} (Official Medical Document)
            </p>
            <p className="text-[11px] text-slate-500">
              Verified for medical accuracy by MedMedia Editorial Board.
            </p>
          </div>

        </div>

        {/* Footer Controls (Download PDF, Upvote, Save) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleUpvote}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                hasUpvoted 
                  ? 'bg-sky-600 text-white shadow-xs' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{upvotes}</span>
            </button>

            <button
              onClick={() => setIsSaved(prev => !prev)}
              className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isSaved
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Bookmark Document"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Document ({doc.fileSize})</span>
          </button>
        </div>

      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
