import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal, Alert } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { MedclipsScreen } from './src/screens/MedclipsScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { OpportunitiesScreen } from './src/screens/OpportunitiesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { UserProfile } from './src/types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'medclips' | 'search' | 'opportunities' | 'profile'>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'doc-1',
    fullName: 'Dr. Arvind Ramesh, MD, DM',
    username: 'cardio_ramesh',
    email: 'dr.ramesh@apollohospitals.org',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
    role: 'DOCTOR',
    verificationStatus: 'VERIFIED',
    badgeTitle: 'Board Certified Interventional Cardiologist',
    bio: 'Senior Consultant Interventional Cardiologist @ Apollo Heart Institute. Specializing in complex CTO and TAVR.',
    specialization: 'Interventional Cardiology',
    hospital: 'Apollo Hospitals, Bangalore'
  });

  const [showAuthModal, setShowAuthModal] = useState(false);

  // Persona switch helper for testing tiered permissions
  const togglePersona = () => {
    if (currentUser.role === 'DOCTOR') {
      setCurrentUser({
        id: 'stu-1',
        fullName: 'Rohan Verma',
        username: 'medical student',
        email: 'rohan.v@kims.edu',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        role: 'STUDENT',
        verificationStatus: 'VERIFIED',
        badgeTitle: 'Verified Medical Student (MBBS)',
        bio: 'Final Year MBBS Student at Kempegowda Institute of Medical Sciences. Aspiring Cardiothoracic Surgeon.',
        discipline: 'MEDICAL_STUDENT',
        collegeName: 'Kempegowda Institute of Medical Sciences',
        academicYear: 4
      });
      Alert.alert("Persona Switched", "Now viewing as Student (Rohan Verma, MBBS 4th Year).");
    } else {
      setCurrentUser({
        id: 'doc-1',
        fullName: 'Dr. Arvind Ramesh, MD, DM',
        username: 'cardio_ramesh',
        email: 'dr.ramesh@apollohospitals.org',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
        role: 'DOCTOR',
        verificationStatus: 'VERIFIED',
        badgeTitle: 'Board Certified Interventional Cardiologist',
        bio: 'Senior Consultant Interventional Cardiologist @ Apollo Heart Institute.',
        specialization: 'Interventional Cardiology',
        hospital: 'Apollo Hospitals, Bangalore'
      });
      Alert.alert("Persona Switched", "Now viewing as Doctor (Dr. Arvind Ramesh, Interventional Cardiology).");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Screen Render Container */}
      <View style={styles.screenContainer}>
        {currentTab === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            onOpenCreate={() => Alert.alert("Create Post", "Select: Clinical Discussion, Case Poll, MedTweet, or Image.")}
            onOpenNotifications={() => Alert.alert("Notifications", "3 unread clinical alerts.")}
            onOpenMessages={() => Alert.alert("Direct Messages", "2 new clinical discussion threads.")}
          />
        )}

        {currentTab === 'medclips' && (
          <MedclipsScreen currentUser={currentUser} />
        )}

        {currentTab === 'search' && (
          <SearchScreen
            currentUser={currentUser}
            onSelectUser={(u) => setCurrentTab('profile')}
          />
        )}

        {currentTab === 'opportunities' && (
          <OpportunitiesScreen currentUser={currentUser} />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            onSwitchUser={togglePersona}
          />
        )}
      </View>

      {/* Slide 5 Bottom Navigation Bar: Home, Medclips, Search, Opportunities, Profile */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'medclips', label: 'Medclips', icon: '🎬' },
          { id: 'search', label: 'Search', icon: '🔍' },
          { id: 'opportunities', label: 'Opportunities', icon: '💼' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setCurrentTab(tab.id as any)}
              style={styles.tabBtn}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Auth / Verification Modal */}
      <Modal visible={showAuthModal} animationType="slide">
        <AuthScreen
          onSuccess={(u) => {
            setCurrentUser(u);
            setShowAuthModal(false);
          }}
          onCancel={() => setShowAuthModal(false)}
        />
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  screenContainer: { flex: 1 },
  bottomNav: {
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 20, opacity: 0.6 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: '#64748b', marginTop: 2, fontWeight: '500' },
  tabLabelActive: { color: '#0284c7', fontWeight: 'bold' }
});
