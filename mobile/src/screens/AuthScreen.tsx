import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { UserProfile, UserRole, StudentDiscipline } from '../types';
import { apiService } from '../services/api';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onCancel }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DOCTOR');
  const [selectedDiscipline, setSelectedDiscipline] = useState<StudentDiscipline>('MEDICAL_STUDENT');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [specialization, setSpecialization] = useState('Cardiology');
  const [regNumber, setRegNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if ((mode === 'signin' && !identifier.trim()) || !password) {
      Alert.alert('Missing details', mode === 'signin' ? 'Enter your email or phone and password.' : 'Enter a password.');
      return;
    }
    if (mode === 'signup' && (!fullName.trim() || !username.trim() || !email.trim())) {
      Alert.alert('Missing details', 'Enter your full name, username, and email to create an account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = mode === 'signin'
        ? await apiService.login(identifier.trim(), password)
        : await apiService.register({
            fullName: fullName.trim(),
            username: username.trim(),
            email: email.trim(),
            phoneNumber: identifier.includes('@') ? undefined : identifier.trim() || undefined,
            password,
            role: selectedRole,
            doctorDetails: selectedRole === 'DOCTOR'
              ? { specialization: specialization.trim(), medicalCouncilRegNumber: regNumber.trim() || undefined }
              : undefined,
            studentDetails: selectedRole === 'STUDENT'
              ? { discipline: selectedDiscipline, collegeName: collegeName.trim() || undefined }
              : undefined
          });
      onSuccess(user);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Could not connect to MedMedia.';
      Alert.alert(mode === 'signin' ? 'Sign in failed' : 'Registration failed', message);
    } finally {
      setIsSubmitting(false);
    }
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
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                placeholder="Choose a unique username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
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
          <View style={styles.passwordInputWrap}>
          <TextInput
            placeholder="••••••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, styles.passwordInput]}
          />
            <TouchableOpacity
              onPress={() => setShowPassword(visible => !visible)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityState={{ selected: showPassword }}
              hitSlop={8}
              style={styles.passwordVisibilityButton}
            >
              <View style={styles.eyeIcon}>
                <View style={styles.eyePupil} />
                {showPassword && <View style={styles.eyeSlash} />}
              </View>
            </TouchableOpacity>
          </View>

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
          <TouchableOpacity disabled={isSubmitting} onPress={handleSubmit} style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}>
            {isSubmitting
              ? <ActivityIndicator color="#ffffff" />
              : <Text style={styles.submitBtnText}>{mode === 'signup' ? `Create ${selectedRole} Account` : 'Sign In'}</Text>}
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
  passwordInputWrap: { position: 'relative' },
  passwordInput: { paddingRight: 42 },
  passwordVisibilityButton: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, alignItems: 'center', justifyContent: 'center' },
  eyeIcon: { width: 18, height: 12, borderWidth: 1.5, borderColor: '#64748b', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  eyePupil: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#64748b' },
  eyeSlash: { position: 'absolute', left: -2, top: 5, width: 20, height: 1.5, backgroundColor: '#64748b', transform: [{ rotate: '45deg' }] },
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
