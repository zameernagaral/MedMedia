import { useEffect } from 'react';
import { Link } from 'react-router-dom';

type PublicPage = 'about' | 'privacy' | 'terms' | 'contact';

const pages: Record<PublicPage, { title: string; description: string; paragraphs: string[] }> = {
  about: {
    title: 'About MedMedia',
    description: 'Learn about MedMedia, a professional networking product for healthcare professionals and students.',
    paragraphs: [
      'MedMedia is being built as a professional network for healthcare professionals and students to share learning, discuss clinical topics, and find career opportunities.',
      'The web and backend are under active development. Features and verification workflows should be treated according to their status in the application.'
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Privacy policy information for MedMedia users.',
    paragraphs: [
      'This page is a placeholder and is not a complete privacy policy. Before public launch, the operator must document the personal data collected, purposes and legal basis, retention periods, service providers, international transfers, user rights, and a monitored privacy contact.',
      'The implementation currently stores account and profile information, posts and interactions, and messages in the configured database. Media may be stored with the configured Cloudinary account. Confirm this inventory and the actual production configuration with counsel before publishing a final policy.',
      'Do not post patient-identifying information or clinical media unless you have the required authority and have removed identifying details.'
    ]
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms of service information for MedMedia users.',
    paragraphs: [
      'This page is a placeholder and is not a binding or complete set of terms. Before public launch, obtain legal review and add the operating entity, effective date, eligibility, acceptable-use rules, content and moderation rules, intellectual-property terms, account termination process, liability terms, dispute process, and governing law.',
      'MedMedia is a networking and learning product. It is not a substitute for professional clinical judgment or a clinician-patient relationship.'
    ]
  },
  contact: {
    title: 'Contact MedMedia',
    description: 'Contact information for MedMedia.',
    paragraphs: [
      'A monitored support contact has not been configured. Add and verify a support email address or contact form before public launch.',
      'Privacy requests and account-support requests need a documented owner and response process before the service is opened to the public.'
    ]
  }
};

export function PublicInfoPage({ page }: { page: PublicPage }) {
  const content = pages[page];

  useEffect(() => {
    document.title = `${content.title} | MedMedia`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute('content', content.description);
  }, [content]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-7 shadow-sm dark:bg-slate-900 sm:p-10">
        <Link to="/" className="text-sm font-semibold text-sky-700 dark:text-sky-400">MedMedia</Link>
        <h1 className="mt-5 text-3xl font-bold">{content.title}</h1>
        {(page === 'privacy' || page === 'terms' || page === 'contact') && (
          <p role="status" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            Launch placeholder: complete the required review and configure contact details before public launch.
          </p>
        )}
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
          {content.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <nav aria-label="Public information" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-sm dark:border-slate-700">
          <Link to="/about" className="text-sky-700 hover:underline dark:text-sky-400">About</Link>
          <Link to="/privacy" className="text-sky-700 hover:underline dark:text-sky-400">Privacy</Link>
          <Link to="/terms" className="text-sky-700 hover:underline dark:text-sky-400">Terms</Link>
          <Link to="/contact" className="text-sky-700 hover:underline dark:text-sky-400">Contact</Link>
        </nav>
      </article>
    </main>
  );
}

export function NotFoundPage() {
  useEffect(() => { document.title = 'Page not found | MedMedia'; }, []);
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="max-w-lg text-center">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">This MedMedia page does not exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white">Go to MedMedia</Link>
      </section>
    </main>
  );
}
