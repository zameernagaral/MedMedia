import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Image,
  Alert
} from 'react-native';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  currentUser: UserProfile;
  onSwitchUser: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onSwitchUser }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'devices' | 'help'>('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const isDoctor = currentUser.role === 'DOCTOR';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: isDoctor ? '#0369a1' : '#065f46' }]}>
          <TouchableOpacity onPress={onSwitchUser} style={styles.switchPill}>
            <Text style={styles.switchPillText}>Switch: Doctor ↔ Student</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card Header (Slide 3 Doctor & Slide 4 Student) */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRow}>
            <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />

            {/* Follow | connect (Slide 3 & 4) */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                onPress={() => setIsFollowing(!isFollowing)}
                style={[styles.followBtn, isFollowing && { backgroundColor: '#f1f5f9' }]}
              >
                <Text style={[styles.followBtnText, isFollowing && { color: '#0f172a' }]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setIsConnected(!isConnected)}
                style={[styles.connectBtn, isConnected && { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}
              >
                <Text style={[styles.connectBtnText, isConnected && { color: '#059669' }]}>
                  {isConnected ? 'Connected ✓' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name & Username (Slide 3 Doctor username: specialization; Slide 4 Student username: medical student, etc.) */}
          <Text style={styles.fullName}>{currentUser.fullName} ✓</Text>
          <Text style={styles.username}>@{currentUser.username}</Text>
          <Text style={styles.bio}>{currentUser.bio}</Text>

          {/* Verification Badge */}
          <View style={styles.badgeBox}>
            <Text style={styles.badgeText}>🛡️ {currentUser.badgeTitle}</Text>
          </View>

          {/* Navigation Subtabs */}
          <View style={styles.subtabs}>
            <TouchableOpacity 
              onPress={() => setActiveTab('about')}
              style={[styles.subtabBtn, activeTab === 'about' && styles.subtabBtnActive]}
            >
              <Text style={[styles.subtabText, activeTab === 'about' && styles.subtabTextActive]}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('posts')}
              style={[styles.subtabBtn, activeTab === 'posts' && styles.subtabBtnActive]}
            >
              <Text style={[styles.subtabText, activeTab === 'posts' && styles.subtabTextActive]}>Posts (2)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('devices')}
              style={[styles.subtabBtn, activeTab === 'devices' && styles.subtabBtnActive]}
            >
              <Text style={[styles.subtabText, activeTab === 'devices' && styles.subtabTextActive]}>Devices</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('help')}
              style={[styles.subtabBtn, activeTab === 'help' && styles.subtabBtnActive]}
            >
              <Text style={[styles.subtabText, activeTab === 'help' && styles.subtabTextActive]}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabContent}>
          
          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <View style={styles.detailCard}>
              {isDoctor ? (
                // Slide 3: Doctor: Qualifications, Hospital, Location, Experience, Interests, Research
                <>
                  <Text style={styles.fieldLabel}>QUALIFICATIONS</Text>
                  <Text style={styles.fieldValue}>MBBS (AIIMS), MD Internal Medicine, DM Cardiology (PGI)</Text>

                  <Text style={styles.fieldLabel}>HOSPITAL AFFILIATION</Text>
                  <Text style={styles.fieldValue}>Apollo Hospitals, Bannerghatta Road</Text>

                  <Text style={styles.fieldLabel}>LOCATION</Text>
                  <Text style={styles.fieldValue}>Bangalore, Karnataka, India</Text>

                  <Text style={styles.fieldLabel}>EXPERIENCE</Text>
                  <Text style={styles.fieldValue}>14 Years Clinical Practice (Senior Consultant)</Text>

                  <Text style={styles.fieldLabel}>CLINICAL INTERESTS</Text>
                  <Text style={styles.fieldValue}>Coronary Angioplasty, TAVR, Intravascular Ultrasound (IVUS)</Text>

                  <Text style={styles.fieldLabel}>RESEARCH & PUBLICATIONS</Text>
                  <Text style={styles.fieldValue}>• 10-Year Clinical Outcomes of Bioresorbable Stents (JACC 2024)</Text>
                  <Text style={styles.fieldValue}>• Early DAPT Cessation in High Bleeding Risk Patients (Lancet)</Text>
                </>
              ) : (
                // Slide 4: Student: College, Year, Interests, Future specialty, Research interests, Verification badge
                <>
                  <Text style={styles.fieldLabel}>COLLEGE / UNIVERSITY</Text>
                  <Text style={styles.fieldValue}>Kempegowda Institute of Medical Sciences (KIMS)</Text>

                  <Text style={styles.fieldLabel}>CURRENT ACADEMIC YEAR</Text>
                  <Text style={styles.fieldValue}>Final Year MBBS (Phase III)</Text>

                  <Text style={styles.fieldLabel}>INTERESTS</Text>
                  <Text style={styles.fieldValue}>Cardiothoracic Surgery, POCUS, Bedside Clinical Semiology</Text>

                  <Text style={styles.fieldLabel}>FUTURE SPECIALTY GOAL</Text>
                  <Text style={styles.fieldValue}>Cardiovascular and Thoracic Surgery (CTVS)</Text>

                  <Text style={styles.fieldLabel}>RESEARCH INTERESTS</Text>
                  <Text style={styles.fieldValue}>Mechanical Circulatory Support, Post-CABG Hemodynamics</Text>
                </>
              )}
            </View>
          )}

          {/* POSTS TAB (Slide 3 & 4) */}
          {activeTab === 'posts' && (
            <View style={styles.detailCard}>
              <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }}>
                Published cases and discussions will be indexed here.
              </Text>
            </View>
          )}

          {/* DEVICE MANAGEMENT (Slide 4: Device management) */}
          {activeTab === 'devices' && (
            <View style={styles.detailCard}>
              <Text style={styles.fieldLabel}>ACTIVE SESSIONS</Text>
              <View style={styles.deviceRow}>
                <Text style={styles.deviceName}>📱 Pixel 8 Pro (Android 15)</Text>
                <Text style={styles.deviceStatus}>Active Now (Current)</Text>
              </View>
              <View style={styles.deviceRow}>
                <Text style={styles.deviceName}>💻 Chrome on macOS</Text>
                <TouchableOpacity onPress={() => Alert.alert("Revoked", "Session terminated.")}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 11 }}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* HELP CENTER (Slide 4: Help center) */}
          {activeTab === 'help' && (
            <View style={styles.detailCard}>
              <Text style={styles.fieldLabel}>HELP CENTER & GUIDELINES</Text>
              <Text style={styles.faqQ}>Q: How are Doctor credentials verified?</Text>
              <Text style={styles.faqA}>A: Medical council registrations are cross-checked against national physician registries.</Text>
              
              <Text style={styles.faqQ}>Q: What are clinical posting standards?</Text>
              <Text style={styles.faqA}>A: All cases must be 100% HIPAA de-identified with no patient PHI.</Text>
            </View>
          )}

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  banner: { height: 110, position: 'relative' },
  switchPill: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  switchPillText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  profileHeader: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#ffffff' },
  actionRow: { flexDirection: 'row', gap: 8 },
  followBtn: { backgroundColor: '#0284c7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  followBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  connectBtn: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  connectBtnText: { color: '#0f172a', fontSize: 12, fontWeight: 'bold' },
  fullName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  username: { fontSize: 13, fontWeight: 'bold', color: '#0284c7', marginTop: 1 },
  bio: { fontSize: 12, color: '#475569', marginTop: 6, lineHeight: 18 },
  badgeBox: { backgroundColor: '#f0f9ff', padding: 8, borderRadius: 10, marginVertical: 10 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#0369a1' },
  subtabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 10 },
  subtabBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  subtabBtnActive: { borderBottomWidth: 2, borderColor: '#0284c7' },
  subtabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  subtabTextActive: { color: '#0284c7', fontWeight: 'bold' },
  tabContent: { padding: 14 },
  detailCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  fieldLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 10, marginBottom: 2 },
  fieldValue: { fontSize: 12, color: '#1e293b', fontWeight: '500', lineHeight: 18 },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  deviceName: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  deviceStatus: { fontSize: 11, color: '#059669', fontWeight: 'bold' },
  faqQ: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginTop: 8 },
  faqA: { fontSize: 11, color: '#475569', marginTop: 2, lineHeight: 16 }
});
