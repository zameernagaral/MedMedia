import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Job, UserProfile } from '../types';

interface OpportunitiesScreenProps {
  currentUser: UserProfile;
}

export const OpportunitiesScreen: React.FC<OpportunitiesScreenProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'research' | 'freelance' | 'events' | 'courses'>('jobs');
  const [jobCategory, setJobCategory] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const jobs: Job[] = [
    {
      id: 'job-1',
      title: 'Consultant Interventional Cardiologist',
      category: 'Doctor jobs',
      type: 'Full time',
      companyName: 'Fortis Memorial Research Institute',
      place: 'Gurugram, NCR',
      experience: '5+ Years Post DM',
      salary: '₹38L - ₹55L / annum',
      description: 'Lead state-of-the-art Cath Lab unit, handle complex PCI, radial interventions, and participate in academic trials.',
      preferenceEducation: 'DM / DNB in Cardiology with state council registration. FACC preferred.',
      skills: ['Complex PCI', 'Cath Lab', 'Rotablation', 'IVUS/OCT']
    },
    {
      id: 'job-2',
      title: 'Assistant Professor - Pathology',
      category: 'academic jobs',
      type: 'Full time',
      companyName: "St. John's National Academy",
      place: 'Bangalore, Karnataka',
      experience: '2-4 Years Post MD',
      salary: '₹18L - ₹24L / annum',
      description: 'Teaching MBBS & MD scholars, clinical histopathology reporting, and research grant execution.',
      preferenceEducation: 'MD Pathology with 3+ PubMed indexed research papers.',
      skills: ['Histopathology', 'Undergraduate Teaching', 'Cytogenetics']
    },
    {
      id: 'job-3',
      title: 'Clinical Oncology Research Internship',
      category: 'Internship',
      type: 'Part time',
      companyName: 'Tata Memorial Centre',
      place: 'Mumbai (Hybrid)',
      experience: 'Final Year MBBS / Intern',
      salary: '₹35,000 / month stipend',
      description: 'Rotational clinical research internship on immunotherapy trials, GCP protocols, and biobanking.',
      preferenceEducation: 'Final year MBBS or recent graduates interested in oncology.',
      skills: ['GCP Guidelines', 'Clinical Protocols', 'Data Abstraction']
    },
    {
      id: 'job-4',
      title: 'Fellowship in Pediatric Critical Care',
      category: 'fellowship',
      type: 'Full time',
      companyName: "Rainbow Children's Hospital",
      place: 'Hyderabad, Telangana',
      experience: 'MD / DNB Pediatrics',
      salary: '₹1,20,000 / month stipend',
      description: 'Accredited 1-year PICU fellowship covering ECMO, ventilator management, and bedside echocardiography.',
      preferenceEducation: 'MD / DNB Pediatrics completed.',
      skills: ['Pediatric ECMO', 'Airway Management', 'POCUS']
    }
  ];

  const filteredJobs = jobs.filter(j => {
    if (jobCategory === 'All') return true;
    return j.category.toLowerCase() === jobCategory.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Opportunities Hub</Text>
        <Text style={styles.headerSub}>Jobs, Research, Locum & CME Conferences</Text>
      </View>

      {/* Slide 8 Horizontal Tabs: Research, Free lancing, Job offers, Course, Events */}
      <View style={styles.navRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}>
          {[
            { id: 'jobs', label: 'Job Offers' },
            { id: 'research', label: 'Research' },
            { id: 'freelance', label: 'Free Lancing / Locum' },
            { id: 'events', label: 'Events & CME' },
            { id: 'courses', label: 'Courses' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              style={[styles.tabPill, activeTab === tab.id && styles.tabPillActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SUBTAB: JOBS (Slide 9) */}
        {activeTab === 'jobs' && (
          <View style={styles.section}>
            
            {/* Filter Pills (Slide 9: Doctor jobs, academic jobs, Internship, fellowship) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {['All', 'Doctor jobs', 'academic jobs', 'Internship', 'fellowship'].map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setJobCategory(c)}
                  style={[styles.filterChip, jobCategory === c && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, jobCategory === c && styles.filterChipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Jobs List */}
            {filteredJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                onPress={() => setSelectedJob(job)}
                style={styles.jobCard}
              >
                <View style={styles.jobTopRow}>
                  <Text style={styles.jobBadge}>{job.category.toUpperCase()}</Text>
                  <Text style={styles.jobSalary}>{job.salary}</Text>
                </View>

                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobHospital}>{job.companyName} • {job.place}</Text>
                <Text style={styles.jobExp}>Experience: {job.experience} | {job.type}</Text>

                <View style={styles.skillsRow}>
                  {job.skills.map((s, idx) => (
                    <Text key={idx} style={styles.skillPill}>{s}</Text>
                  ))}
                </View>

                <TouchableOpacity 
                  onPress={() => setSelectedJob(job)}
                  style={styles.applyBtn}
                >
                  <Text style={styles.applyBtnText}>View Details & 1-Click Apply</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SUBTAB: RESEARCH (Slide 8) */}
        {activeTab === 'research' && (
          <View style={styles.section}>
            <View style={styles.bannerBox}>
              <Text style={styles.bannerTitle}>🔬 Research Projects & Co-Author Calls</Text>
              <Text style={styles.bannerSub}>Connect on multicenter clinical trials and scientific publications.</Text>
            </View>

            <View style={styles.jobCard}>
              <Text style={styles.jobBadge}>OPEN CALL</Text>
              <Text style={styles.jobTitle}>AI-Powered ECG Detection of Cardiomyopathy</Text>
              <Text style={styles.jobHospital}>Apollo Health AI Innovations • Dr. Arvind Ramesh</Text>
              <Text style={styles.jobDesc}>Seeking 3 medical student / resident co-investigators for digital ECG record validation. Co-authorship guaranteed on PubMed submission.</Text>
              <TouchableOpacity 
                onPress={() => Alert.alert("Research Call", "Collaboration request sent to Principal Investigator.")}
                style={[styles.applyBtn, { backgroundColor: '#0284c7' }]}
              >
                <Text style={styles.applyBtnText}>Join Research Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SUBTAB: FREELANCING / LOCUM (Slide 8) */}
        {activeTab === 'freelance' && (
          <View style={styles.section}>
            <View style={styles.jobCard}>
              <Text style={[styles.jobBadge, { backgroundColor: '#ecfdf5', color: '#059669' }]}>LOCUM TENENS</Text>
              <Text style={styles.jobTitle}>Emergency Dept Weekend Casualty Coverage</Text>
              <Text style={styles.jobHospital}>Manipal Hospital - Whitefield</Text>
              <Text style={styles.jobDesc}>Urgent 12-hour trauma & casualty weekend shifts for licensed MBBS/MD physicians. On-call quarters and competitive hourly stipend.</Text>
              <TouchableOpacity 
                onPress={() => Alert.alert("Applied", "Application for locum weekend shift sent to Casualty Division.")}
                style={[styles.applyBtn, { backgroundColor: '#059669' }]}
              >
                <Text style={styles.applyBtnText}>Apply for Locum</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SUBTAB: EVENTS (Slide 8: Upcoming, Near by you, By category, Search; Overview: title, venue, time/date, organized by, contact) */}
        {activeTab === 'events' && (
          <View style={styles.section}>
            <View style={styles.jobCard}>
              <Text style={[styles.jobBadge, { backgroundColor: '#eef2ff', color: '#4f46e5' }]}>6 CME CREDITS</Text>
              <Text style={styles.jobTitle}>77th All India Medical Congress & Surgical Expo 2026</Text>
              
              <View style={styles.eventGrid}>
                <Text style={styles.eventLabel}>VENUE: <Text style={styles.eventVal}>Bangalore International Exhibition Centre</Text></Text>
                <Text style={styles.eventLabel}>TIME & DATE: <Text style={styles.eventVal}>Nov 14 - Nov 16, 2026 • 09:00 AM</Text></Text>
                <Text style={styles.eventLabel}>ORGANIZED BY: <Text style={styles.eventVal}>Indian Medical Association (IMA)</Text></Text>
                <Text style={styles.eventLabel}>CONTACT: <Text style={styles.eventVal}>cme-secretariat@ima-events.org</Text></Text>
              </View>

              <TouchableOpacity 
                onPress={() => Alert.alert("RSVP", "Registration confirmed! Confirmation badge sent to your registered email.")}
                style={[styles.applyBtn, { backgroundColor: '#4f46e5' }]}
              >
                <Text style={styles.applyBtnText}>RSVP & Register for CME</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SUBTAB: COURSES (Slide 8) */}
        {activeTab === 'courses' && (
          <View style={styles.section}>
            <View style={styles.jobCard}>
              <Text style={styles.jobBadge}>ACCREDITED CME</Text>
              <Text style={styles.jobTitle}>Mastering Bedside Point-of-Care Ultrasound (POCUS)</Text>
              <Text style={styles.jobHospital}>Society of Critical Care Medicine • 4.5 CME Credits</Text>
              <Text style={styles.jobDesc}>Comprehensive hybrid simulation module on eFAST, lung ultrasound (B-lines vs A-lines), and focused echo.</Text>
              <TouchableOpacity 
                onPress={() => Alert.alert("Enrolled", "Access granted to Medmedia CME LMS.")}
                style={styles.applyBtn}
              >
                <Text style={styles.applyBtnText}>Enroll in Course</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Slide 9 Job Detail Modal (Overview, Preference education, skills) */}
      <Modal visible={!!selectedJob} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedJob && (
              <>
                <Text style={styles.modalTitle}>{selectedJob.title}</Text>
                <Text style={styles.modalSub}>{selectedJob.companyName} • {selectedJob.place}</Text>
                <Text style={styles.modalSalary}>{selectedJob.salary}</Text>

                <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
                  <Text style={styles.modalHeader}>JOB DESCRIPTION</Text>
                  <Text style={styles.modalText}>{selectedJob.description}</Text>

                  <Text style={styles.modalHeader}>EDUCATIONAL QUALIFICATIONS</Text>
                  <Text style={styles.modalText}>{selectedJob.preferenceEducation}</Text>

                  <Text style={styles.modalHeader}>REQUIRED SKILLS</Text>
                  <View style={styles.skillsRow}>
                    {selectedJob.skills.map((s, i) => (
                      <Text key={i} style={styles.skillPill}>{s}</Text>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert("Application Sent", `Your verified credentials were sent to ${selectedJob.companyName}.`);
                    setSelectedJob(null);
                  }}
                  style={styles.modalApplyBtn}
                >
                  <Text style={styles.modalApplyText}>Submit 1-Click Verified Application</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setSelectedJob(null)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  navRow: { backgroundColor: '#ffffff', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  tabPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 6 },
  tabPillActive: { backgroundColor: '#0284c7' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  tabTextActive: { color: '#ffffff', fontWeight: 'bold' },
  content: { flex: 1 },
  section: { padding: 14 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#e2e8f0', marginRight: 8 },
  filterChipActive: { backgroundColor: '#0f172a' },
  filterChipText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  filterChipTextActive: { color: '#ffffff' },
  jobCard: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  jobTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  jobBadge: { fontSize: 10, fontWeight: 'bold', backgroundColor: '#e0f2fe', color: '#0369a1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  jobSalary: { fontSize: 12, fontWeight: 'bold', color: '#059669' },
  jobTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  jobHospital: { fontSize: 12, color: '#475569', fontWeight: '500' },
  jobExp: { fontSize: 11, color: '#64748b', marginTop: 2, marginBottom: 8 },
  jobDesc: { fontSize: 12, color: '#334155', lineHeight: 18, marginVertical: 8 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillPill: { fontSize: 10, backgroundColor: '#f1f5f9', color: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '500' },
  applyBtn: { backgroundColor: '#0284c7', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  bannerBox: { backgroundColor: '#0f172a', padding: 14, borderRadius: 16, marginBottom: 14 },
  bannerTitle: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  bannerSub: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  eventGrid: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginVertical: 10, gap: 4 },
  eventLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  eventVal: { fontWeight: 'normal', color: '#0f172a' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  modalSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  modalSalary: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginTop: 4 },
  modalHeader: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginTop: 10, marginBottom: 4 },
  modalText: { fontSize: 12, color: '#334155', lineHeight: 18 },
  modalApplyBtn: { backgroundColor: '#0284c7', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  modalApplyText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  modalCloseBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  modalCloseText: { color: '#64748b', fontSize: 12, fontWeight: '600' }
});
