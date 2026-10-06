import React, { useState } from 'react';
import { Award, X } from 'lucide-react';

export interface NewScholarshipData {
  title: string;
  amount: string;
  deadline: string;
  institution: string;
  description: string;
  coverage?: string;
  applyLink?: string;
}

interface CreateScholarshipModalProps {
  onClose: () => void;
  onSubmit: (scholarship: NewScholarshipData) => Promise<void>;
}

export const CreateScholarshipModal: React.FC<CreateScholarshipModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [amount, setAmount] = useState('');
  const [coverage, setCoverage] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        institution: institution.trim(),
        amount: amount.trim(),
        coverage: coverage.trim() || undefined,
        deadline: deadline.trim(),
        applyLink: applyLink.trim() || undefined,
        description: description.trim()
      });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save this scholarship.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="create-scholarship-title">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 id="create-scholarship-title" className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Add Scholarship
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Scholarship name *
            <input required maxLength={191} value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </label>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Provider / institution *
            <input required maxLength={191} value={institution} onChange={e => setInstitution(e.target.value)} className="mt-1 w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Award amount *
              <input required maxLength={191} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. Up to INR 1,00,000" className="mt-1 w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </label>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Deadline *
              <input required maxLength={120} value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="e.g. 31 Dec 2026 or Always Open" className="mt-1 w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Coverage / award type
            <input maxLength={191} value={coverage} onChange={e => setCoverage(e.target.value)} placeholder="e.g. Undergraduate scholarship" className="mt-1 w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </label>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Official application link
            <input type="url" value={applyLink} onChange={e => setApplyLink(e.target.value)} placeholder="https://..." className="mt-1 w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </label>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Description and eligibility *
            <textarea required maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 resize-y" />
          </label>
          {error && <p role="alert" className="text-xs font-semibold text-rose-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl disabled:opacity-50">
              {isSubmitting ? 'Saving…' : 'Save Scholarship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
