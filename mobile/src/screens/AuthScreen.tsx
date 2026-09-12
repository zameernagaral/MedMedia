import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert
} from 'react-native';
import { UserProfile, UserRole, StudentDiscipline } from '../types';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onCancel }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DOCTOR');
  const [selectedDiscipline, setSelectedDiscipline] = useState<StudentDiscipline>('MEDICAL_STUDENT');
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [regNumber, setRegNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [documentUploaded, setDocumentUploaded] = useState(false);

  const handleSubmit = () => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: fullName || (selectedRole === 'DOCTOR' ? 'Dr. Sarah Jenkins' : 'Alex Morgan'),
      username: selectedRole === 'DOCTOR' ? specialization.toLowerCase() : selectedDiscipline.toLowerCase(),
      email: identifier.includes('@') ? identifier : `${identifier}@medmedia.health`,
      avatarUrl: selectedRole === 'DOCTOR' 
        ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      role: selectedRole,
      verificationStatus: 'VERIFIED',
      badgeTitle: selectedRole === 'DOCTOR' ? 'Verified Physician' : 'Verified Medical Scholar',
      bio: selectedRole === 'DOCTOR' ? `Physician specializing in ${specialization}` : `Healthcare scholar at ${collegeName || 'Medical College'}`
    };

    Alert.alert("Verified", "Your credentials have been authenticated.");
    onSuccess(newUser);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medmedia Authentication</Text>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Switcher: Sign In vs Sign Up (Slide 2) */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          onPress={() => setMode('signup')}
          style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>New Account (Verify)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setMode('signin')}
          style={[styles.tabBtn, mode === 'signin' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign In / Log In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Slide 3: Selection - Two User Types (Doctor verification vs Student verification) */}
        {mode === 'signup' && (
          <View style={styles.card}>
            <Text style={styles.label}>SELECT USER TYPE (SLIDE 3)</Text>
            
            <View style={styles.roleGrid}>
              <TouchableOpacity
                onPress={() => setSelectedRole('DOCTOR')}
                style={[styles.roleCard, selectedRole === 'DOCTOR' && styles.roleCardActive]}
              >
                <Text style={styles.roleIcon}>🩺</Text>
                <Text style={styles.roleTitle}>Doctor Verification</Text>
                <Text style={styles.roleSub}>Consultants, Specialists</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedRole('STUDENT')}
                style={[styles.roleCard, selectedRole === 'STUDENT' && styles.roleCardActive]}
              >
                <Text style={styles.roleIcon}>🎓</Text>
                <Text style={styles.roleTitle}>Student Verification</Text>
                <Text style={styles.roleSub}>MBBS, Nursing, B/D Pharm, Lab</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input Fields */}
        <View style={styles.card}>
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                placeholder={selectedRole === 'DOCTOR' ? "Dr. Full Name" : "Student Name"}
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.label}>PHONE OR EMAIL (SLIDE 2)</Text>
          <TextInput
            placeholder="doctor@hospital.org or +91 98765 43210"
            value={identifier}
            onChangeText={setIdentifier}
            style={styles.input}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            placeholder="••••••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {/* DOCTOR VERIFICATION DETAILS (Slide 3) */}
          {mode === 'signup' && selectedRole === 'DOCTOR' && (
            <>
              <Text style={styles.label}>USERNAME SPECIALIZATION</Text>
              <TextInput
                placeholder="Cardiology"
                value={specialization}
                onChangeText={setSpecialization}
                style={styles.input}
              />

              <Text style={styles.label}>MEDICAL COUNCIL REGISTRATION NUMBER</Text>
              <TextInput
                placeholder="e.g. KMC-49182-IND"
                value={regNumber}
                onChangeText={setRegNumber}
                style={styles.input}
              />

              <TouchableOpacity 
                onPress={() => setDocumentUploaded(!documentUploaded)}
                style={[styles.uploadBox, documentUploaded && { borderColor: '#10b981', backgroundColor: '#ecfdf5' }]}
              >
                <Text style={styles.uploadText}>
                  {documentUploaded ? '✓ Medical License Uploaded' : '📷 Upload Medical License / Council Registration'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* STUDENT VERIFICATION DETAILS (Slide 4) */}
          {mode === 'signup' && selectedRole === 'STUDENT' && (
            <>
              <Text style={styles.label}>DISCIPLINE CATEGORY (SLIDE 4)</Text>
              <View style={styles.disciplineRow}>
                {(['MEDICAL_STUDENT', 'NURSING', 'B_PHARM', 'D_PHARM', 'LAB_PRACTITIONER'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setSelectedDiscipline(d)}
                    style={[styles.dispChip, selectedDiscipline === d && styles.dispChipActive]}
                  >
                    <Text style={[styles.dispText, selectedDiscipline === d && styles.dispTextActive]}>
                      {d.replace('_', ' ').toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>COLLEGE / UNIVERSITY</Text>
              <TextInput
                placeholder="e.g. Medical College"
                value={collegeName}
                onChangeText={setCollegeName}
                style={styles.input}
              />

              <TouchableOpacity 
                onPress={() => setDocumentUploaded(!documentUploaded)}
                style={[styles.uploadBox, documentUploaded && { borderColor: '#10b981', backgroundColor: '#ecfdf5' }]}
              >
                <Text style={styles.uploadText}>
                  {documentUploaded ? '✓ Student ID Card Uploaded' : '📷 Upload College Student Photo ID'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>
              {mode === 'signup' ? `Submit ${selectedRole} Verification` : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Slide 2: Google login */}
          <TouchableOpacity 
            onPress={() => {
              Alert.alert("Google OAuth", "Authenticated via Google Single Sign-On.");
              handleSubmit();
            }}
            style={styles.googleBtn}
          >
            <Text style={styles.googleBtnText}>Continue with Google (Slide 2)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  cancelText: { fontSize: 13, color: '#64748b', fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderColor: '#0284c7' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#0284c7', fontWeight: 'bold' },
  content: { flex: 1, padding: 14 },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 12, color: '#0f172a' },
  roleGrid: { flexDirection: 'row', gap: 10, marginTop: 4 },
  roleCard: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, padding: 12, alignItems: 'center' },
  roleCardActive: { borderColor: '#0284c7', backgroundColor: '#f0f9ff' },
  roleIcon: { fontSize: 24, marginBottom: 4 },
  roleTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
  roleSub: { fontSize: 9, color: '#64748b', textAlign: 'center', marginTop: 2 },
  disciplineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  dispChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f1f5f9' },
  dispChipActive: { backgroundColor: '#0284c7' },
  dispText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  dispTextActive: { color: '#ffffff', fontWeight: 'bold' },
  uploadBox: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#0284c7', borderRadius: 12, padding: 14, alignItems: 'center', marginVertical: 10 },
  uploadText: { fontSize: 11, fontWeight: 'bold', color: '#0284c7' },
  submitBtn: { backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  googleBtn: { borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  googleBtnText: { color: '#334155', fontSize: 12, fontWeight: 'bold' }
});
