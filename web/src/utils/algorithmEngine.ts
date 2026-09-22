import { UserProfile, Post, Medclip, Job, OpportunityItem } from '../types';

/**
 * MedMedia Algorithmic Personalization Engine
 * 
 * Blends Instagram-style high-engagement visual case ranking with LinkedIn-style
 * academic authority, professor-student mentorship affinity, alumni institution overlap,
 * and clinical internship matching based on the active viewer context.
 */

export interface AlgorithmicPost extends Post {
  algorithmScore: number;
  matchReasonBadge: string;
}

export interface AlgorithmicMentor extends UserProfile {
  matchScore: number;
  mentorMatchReason: string;
  isAlumniMatch: boolean;
}

export interface AlgorithmicInternship {
  job?: Job;
  opportunity?: OpportunityItem;
  id: string;
  title: string;
  hospital: string;
  type: string;
  stipend: string;
  duration?: string;
  matchScore: number;
  matchReason: string;
}

/**
 * Computes personalized Home Feed posts ranked by viewer affinity
 */
export function getPersonalizedFeed(posts: Post[], viewer: UserProfile): AlgorithmicPost[] {
  return posts.map(post => {
    let score = 50; // base score
    let reason = 'Clinical Network Recommendation';

    // 1. Author authority boost: Professors & Verified Consultants
    if (post.authorIsProfessor) {
      score += 25;
    }
    if (post.isVerified) {
      score += 15;
    }

    // 2. Viewer Persona Adaptations
    if (viewer.role === 'STUDENT') {
      const studentSpec = viewer.studentDetails?.futureSpecialty?.toLowerCase() || '';
      const studentDiscipline = viewer.studentDetails?.discipline || 'MEDICAL_STUDENT';
      
      // Match specialty of interest
      const matchesSpecialty = post.clinicalTags.some(t => 
        studentSpec.includes(t.toLowerCase().replace('#', '')) || 
        post.content.toLowerCase().includes(studentSpec)
      );

      if (post.targetAudience === 'STUDENT_HIGH_YIELD' || matchesSpecialty) {
        score += 35;
        reason = `✨ Recommended for your ${viewer.studentDetails?.futureSpecialty || 'Specialty'} preparation`;
      } else if (post.authorIsProfessor) {
        score += 20;
        reason = `👨‍🏫 Case pearl by Academic Professor (${post.authorSpecializationOrDiscipline})`;
      } else if (post.casePoll) {
        score += 18;
        reason = `🧠 Diagnostic Poll: Test your clinical bedside reasoning`;
      } else if (studentDiscipline === 'B_PHARM' && post.clinicalTags.some(t => t.toLowerCase().includes('pharm'))) {
        score += 30;
        reason = `💊 Matched to Pharmacokinetics & Drug Therapy focus`;
      }
    } else {
      // DOCTOR / PROFESSOR VIEWER
      const docSpec = viewer.doctorDetails?.specialization?.toLowerCase() || '';
      const isProf = viewer.doctorDetails?.isProfessor;

      if (isProf && post.targetAudience === 'PROFESSOR_ACADEMIC') {
        score += 35;
        reason = `🎓 Academic Faculty & Multicentric Trial Discussion`;
      } else if (post.clinicalTags.some(t => docSpec.includes(t.toLowerCase().replace('#', '')))) {
        score += 30;
        reason = `🩺 Peer ${viewer.doctorDetails?.specialization} Clinical Insight`;
      } else if (post.clinicalTags.includes('#LocumTenens') || post.clinicalTags.includes('#EmergencyDuty')) {
        score += 20;
        reason = `💼 Urgent Clinical Coverage & Locum Match`;
      }
    }

    // Add engagement factor
    score += Math.min(post.likesCount / 50, 15) + Math.min(post.commentsCount / 10, 10);

    return {
      ...post,
      algorithmScore: Math.round(score),
      matchReasonBadge: reason
    };
  }).sort((a, b) => b.algorithmScore - a.algorithmScore);
}

/**
 * Finds and ranks Medical Professors & Mentors for students or peer faculty
 */
export function getPersonalizedMentorsAndProfessors(users: UserProfile[], viewer: UserProfile): AlgorithmicMentor[] {
  const isStudentViewer = viewer.role === 'STUDENT';
  const studentCollege = viewer.studentDetails?.collegeName?.toLowerCase() || '';
  const studentSpecialty = viewer.studentDetails?.futureSpecialty?.toLowerCase() || '';

  // Filter for doctors/professors excluding current viewer
  const candidates = users.filter(u => u.id !== viewer.id && u.role === 'DOCTOR');

  return candidates.map(candidate => {
    let score = 40;
    let reason = 'Senior Medical Consultant';
    let isAlumni = false;

    const doc = candidate.doctorDetails;
    if (!doc) return { ...candidate, matchScore: score, mentorMatchReason: reason, isAlumniMatch: false };

    // Professor authority
    if (doc.isProfessor) {
      score += 30;
    }

    // Mentorship availability
    if (doc.isAcceptingMentees) {
      score += 25;
    }

    // Internship vacancy
    if (doc.isAcceptingInterns) {
      score += 20;
    }

    if (isStudentViewer) {
      // Alumni institution overlap (e.g. AIIMS, KMC, BMCRI, Manipal)
      if (doc.alumniCollege && studentCollege.includes(doc.alumniCollege.toLowerCase())) {
        score += 40;
        isAlumni = true;
        reason = `🏛️ Alumni Mentor from your institution (${doc.alumniCollege})`;
      } else if (doc.specialization.toLowerCase().includes(studentSpecialty) || studentSpecialty.includes(doc.specialization.toLowerCase())) {
        score += 35;
        reason = `🎯 Top Professor in your target specialty (${doc.specialization})`;
      } else if (doc.isAcceptingMentees) {
        score += 20;
        reason = `🩺 Actively Mentoring Medical Students (${doc.mentorshipSlots?.available || 2} slots open)`;
      } else if (doc.isAcceptingInterns) {
        score += 20;
        reason = `🏥 Currently recruiting clinical interns & co-authors`;
      }
    } else {
      // Peer Faculty matching
      if (doc.isProfessor) {
        score += 25;
        reason = `🎓 Department Chair & Research Collaborator`;
      } else {
        reason = `🩺 Colleague Specialist (${doc.specialization})`;
      }
    }

    return {
      ...candidate,
      matchScore: Math.round(score),
      mentorMatchReason: reason,
      isAlumniMatch: isAlumni
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Finds and ranks Clinical Internships, Observerships & Research Calls
 */
export function getPersonalizedInternships(
  jobs: Job[], 
  opportunities: OpportunityItem[], 
  viewer: UserProfile
): AlgorithmicInternship[] {
  const isStudent = viewer.role === 'STUDENT';
  const targetSpec = (viewer.studentDetails?.futureSpecialty || viewer.doctorDetails?.specialization || '').toLowerCase();

  const results: AlgorithmicInternship[] = [];

  // 1. Process Jobs that are Internships or Fellowships
  jobs.forEach(job => {
    let score = 40;
    let reason = 'Clinical Vacancy';

    if (job.category === 'Internship') {
      score += isStudent ? 40 : 10;
      reason = isStudent ? '🎓 Prime Clinical Internship for Medical Scholars' : 'Junior Internship Opportunity';
    } else if (job.category === 'fellowship') {
      score += isStudent ? 20 : 35;
      reason = '🏆 Post-Graduate Accredited Clinical Fellowship';
    } else if (job.type === 'Locum') {
      score += isStudent ? 5 : 40;
      reason = '⚡ Weekend Casualty Locum (Immediate Payout)';
    }

    if (job.title.toLowerCase().includes(targetSpec) || job.description.toLowerCase().includes(targetSpec)) {
      score += 25;
      reason = `🎯 Matched to your interest in ${targetSpec.toUpperCase()}`;
    }

    results.push({
      job,
      id: job.id,
      title: job.title,
      hospital: job.companyName,
      type: job.type,
      stipend: job.stipend || job.salary,
      duration: job.duration || '6 Months Rotational',
      matchScore: score,
      matchReason: reason
    });
  });

  // 2. Process Opportunities that are Research or Hands-on Courses
  opportunities.forEach(opp => {
    let score = 35;
    let reason = opp.type === 'RESEARCH' ? '🔬 Research Co-Authorship' : '📅 Medical Event & CME';

    if (opp.type === 'RESEARCH') {
      score += isStudent ? 35 : 25;
      reason = isStudent ? '📄 Open Call: Student Co-Author Wanted for PubMed Study' : 'Multicenter Research Collaboration';
    }

    results.push({
      opportunity: opp,
      id: opp.id,
      title: opp.title,
      hospital: opp.organizerOrAffiliation,
      type: opp.type,
      stipend: opp.stipendOrFunding || 'Certificate + Co-Authorship',
      duration: 'Flexible / Part-Time',
      matchScore: score,
      matchReason: reason
    });
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Sorts and tags Medclips according to viewer level
 */
export function getPersonalizedMedclips(clips: Medclip[], viewer: UserProfile): Medclip[] {
  const isStudent = viewer.role === 'STUDENT';

  return [...clips].sort((a, b) => {
    let scoreA = a.likesCount;
    let scoreB = b.likesCount;

    if (isStudent) {
      if (a.targetAudience === 'STUDENT_HIGH_YIELD') scoreA += 500;
      if (b.targetAudience === 'STUDENT_HIGH_YIELD') scoreB += 500;
    } else {
      if (a.clinicalCategory === 'clinical updates') scoreA += 300;
      if (b.clinicalCategory === 'clinical updates') scoreB += 300;
    }

    return scoreB - scoreA;
  });
}
