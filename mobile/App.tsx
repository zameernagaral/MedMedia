import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { MedclipsScreen } from './src/screens/MedclipsScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { OpportunitiesScreen } from './src/screens/OpportunitiesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { UserProfile } from './src/types';
import { apiService } from './src/services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'medclips' | 'search' | 'opportunities' | 'profile'>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isResolvingSession, setIsResolvingSession] = useState(true);

  useEffect(() => {
    apiService.getCurrentUser()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setIsResolvingSession(false));
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch {
      // Clear the local screen even if the server session has already expired.
    }
    setCurrentUser(null);
  };

  const updateFollowingCount = (followingCount: number) => {
    setCurrentUser(previous => previous ? {
      ...previous,
      stats: { ...previous.stats, followingCount }
    } : previous);
  };

  if (isResolvingSession) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Connecting to MedMedia…</Text>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return <AuthScreen onSuccess={setCurrentUser} onCancel={() => {}} />;
  }

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
            onFollowCountChange={updateFollowingCount}
          />
        )}

        {currentTab === 'medclips' && (
          <MedclipsScreen currentUser={currentUser} onFollowCountChange={updateFollowingCount} />
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
            onSwitchUser={handleLogout}
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  loadingContainer: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: '#64748b' },
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
