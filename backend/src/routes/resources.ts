import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// In-memory / mock database store for production fallback
let sampleResources = [
  {
    id: "doc-guide-1",
    title: "2026 ESC Guidelines for Management of Acute Coronary Syndromes (STEMI / NSTEMI)",
    author: "European Society of Cardiology (ESC) Task Force",
    authorRole: "Clinical Guidelines Board",
    specialty: "Interventional Cardiology",
    category: "Clinical Guideline",
    description: "Full clinical practice guidelines covering dual antiplatelet therapy (DAPT), primary PCI timing, high-sensitivity Troponin algorithms, and cardiogenic shock pathways.",
    pageCount: 48,
    fileSize: "4.2 MB",
    downloadUrl: "https://medmedia.health/docs/esc_stemi_2026.pdf",
    upvotesCount: 1420,
    isUpvoted: true,
    isSaved: true,
    keyPearls: [
      "Door-to-Balloon time target < 90 minutes from first medical contact for STEMI.",
      "High-potency P2Y12 inhibitors (Ticagrelor or Prasugrel) preferred over Clopidogrel.",
      "High-dose Statin (Atorvastatin 80mg or Rosuvastatin 40mg) initiated immediately regardless of baseline LDL."
    ],
    aiSummary: "Primary Takeaways:\n1. Emergency Angiography: Indicated within 2 hours for very high-risk NSTEMI.\n2. Anticoagulation: Unfractionated heparin (70-100 IU/kg) during PCI.\n3. Long-term secondary prevention: ACEi/ARB for LVEF < 40%.",
    publishedDate: "2026"
  },
  {
    id: "doc-guide-2",
    title: "High-Yield 12-Lead ECG Interpretation Manual: 50 Real Emergency Room Cases",
    author: "Prof. (Dr.) Rajeshwar Sharma, MD, DM",
    authorRole: "HOD Cardiology",
    specialty: "Emergency Medicine & Cardiology",
    category: "Exam Prep & Notes",
    description: "High-yield diagnostic handbook for MBBS interns and emergency medicine residents. Features annotated tracings of VT vs SVT, Wellens, De Winter, and Brugada pattern.",
    pageCount: 32,
    fileSize: "3.1 MB",
    downloadUrl: "https://medmedia.health/docs/ecg_manual_prof_sharma.pdf",
    upvotesCount: 2890,
    isUpvoted: false,
    isSaved: true,
    keyPearls: [
      "De Winter T-wave pattern (upsloping ST depression with tall symmetrical T-waves in V1-V6) signifies acute LAD occlusion.",
      "Wellens Type A shows biphasic T-waves in V2-V3; Type B shows deep symmetrical inversion.",
      "Always check Lead V4R for right ventricular infarction in all inferior wall STEMIs."
    ],
    aiSummary: "High-Yield Summary:\n1. Brugada Type 1: Coved ST elevation > 2mm in V1-V2 followed by negative T wave.\n2. S1Q3T3 sign in Pulmonary Embolism is present in < 20% of cases; sinus tachycardia is most common.\n3. Electrical Alternans indicates massive pericardial effusion with cardiac tamponade.",
    publishedDate: "2026"
  },
  {
    id: "doc-guide-3",
    title: "WHO Clinical Protocol: Pediatric Sepsis & Antimicrobial Dosing Guide",
    author: "World Health Organization (WHO Guidelines)",
    authorRole: "Pediatric Emergency Panel",
    specialty: "Pediatrics & Critical Care",
    category: "Clinical Guideline",
    description: "Evidence-based pediatric resuscitation guidelines including fluid bolus limits, weight-based antibiotic dosing, and septic shock vasoactive drug administration.",
    pageCount: 24,
    fileSize: "2.5 MB",
    downloadUrl: "https://medmedia.health/docs/who_pediatric_sepsis.pdf",
    upvotesCount: 980,
    isUpvoted: false,
    isSaved: false,
    keyPearls: [
      "First-hour fluid resuscitation: 10-20 mL/kg isotonic crystalloid bolus over 10-20 mins.",
      "Empiric antibiotic therapy within 60 minutes of recognizing septic shock.",
      "Epinephrine infusion preferred first-line in cold pediatric septic shock."
    ],
    aiSummary: "Key Guidance:\n1. Blood cultures before antibiotics if achievable without delay (> 15 min).\n2. Monitor capillary refill time (< 2s target) and urine output (> 1 mL/kg/h).",
    publishedDate: "2026"
  },
  {
    id: "doc-guide-4",
    title: "NEET-PG & USMLE Step 1 Surgery Revision Notes: High-Yield Principles",
    author: "Prof. (Dr.) Meenakshi Sundaram, MS, FRCS",
    authorRole: "Professor of Surgery",
    specialty: "General Surgery",
    category: "Exam Prep & Notes",
    description: "Concise surgical anatomy, wound healing, shock classification, thyroid oncology, and acute abdomen algorithms for competitive exam aspirants.",
    pageCount: 64,
    fileSize: "5.8 MB",
    downloadUrl: "https://medmedia.health/docs/surgery_high_yield_notes.pdf",
    upvotesCount: 3450,
    isUpvoted: true,
    isSaved: true,
    keyPearls: [
      "Alvarado score >= 7 strongly predicts Acute Appendicitis.",
      "Triple therapy for H. Pylori associated peptic ulcer disease.",
      "Triad of Charcot (Fever, Jaundice, RUQ pain) in acute cholangitis."
    ],
    aiSummary: "Summary of High-Yield Surgical Concepts:\n1. Breast Cancer Staging & Sentinel Lymph Node Biopsy rules.\n2. Fluid resuscitation in Burns using Parkland Formula (4mL x kg x %TBSA).\n3. Management of Obstructive Jaundice.",
    publishedDate: "2026"
  }
];

// GET /api/resources
router.get('/', (req: Request, res: Response) => {
  const { category, search, specialty } = req.query;
  let filtered = [...sampleResources];

  if (category && category !== 'All') {
    filtered = filtered.filter(r => r.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (specialty && specialty !== 'All') {
    filtered = filtered.filter(r => r.specialty.toLowerCase().includes((specialty as string).toLowerCase()));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: filtered.length, resources: filtered });
});

// POST /api/resources (Upload medical document / notes)
router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const { title, description, category, specialty, downloadUrl, keyPearls } = req.body;
    const user = (req as any).user;

    const newDoc = {
      id: `doc-${Date.now()}`,
      title: title || 'Clinical Document Notes',
      author: user?.fullName || 'MedMedia Practitioner',
      authorRole: user?.role || 'DOCTOR',
      specialty: specialty || 'General Medicine',
      category: category || 'Exam Prep & Notes',
      description: description || 'Clinical guidelines shared with MedMedia Network.',
      pageCount: Math.floor(Math.random() * 20) + 5,
      fileSize: '3.4 MB',
      downloadUrl: downloadUrl || 'https://medmedia.health/docs/sample_doc.pdf',
      upvotesCount: 1,
      isUpvoted: true,
      isSaved: false,
      keyPearls: Array.isArray(keyPearls) ? keyPearls : [description || 'Key clinical takeaways'],
      aiSummary: `AI Summary for ${title}:\n1. High-yield medical guidance verified by MedMedia.`,
      publishedDate: new Date().getFullYear().toString()
    };

    sampleResources.unshift(newDoc);
    res.status(201).json({ success: true, resource: newDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not post document' });
  }
});

// POST /api/resources/:id/upvote
router.post('/:id/upvote', requireAuth, (req: Request, res: Response) => {
  const doc = sampleResources.find(r => r.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

  doc.isUpvoted = !doc.isUpvoted;
  doc.upvotesCount += doc.isUpvoted ? 1 : -1;

  res.json({ success: true, isUpvoted: doc.isUpvoted, upvotesCount: doc.upvotesCount });
});

export default router;
