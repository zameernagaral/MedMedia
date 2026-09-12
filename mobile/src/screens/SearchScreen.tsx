import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  TextInput,
  Image,
  Alert
} from 'react-native';
import { UserProfile } from '../types';

interface SearchScreenProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ currentUser, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Accounts');
  const [connectedIds, setConnectedIds] = useState<Record<string, boolean>>({});

  // Slide 10 Category Pills: Accounts | community | associations | posts | job offers | Hospital |
  const categories = [
    'Accounts',
    'community',
    'associations',
    'posts',
    'job offers',
    'Hospital'
  ];

  const networkingSuggestions = [
    {
      id: 'net-1',
      name: 'Dr. Sandeep Kulkarni',
      role: 'Cardiothoracic Surgeon @ Narayana Health',
      reason: 'Alumni connection: AIIMS New Delhi (Class of 2012)',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop'
    },
    {
      id: 'net-2',
      name: 'Sneha Rao',
      role: 'Final Year MBBS @ BMCRI',
      reason: 'Likely preference: Interested in Cardiothoracic Surgery',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
    }
  ];

  const communityBranches = [
    {
      id: 'cb-1',
      name: 'Cardiological Society of India',
      branch: 'Karnataka State Chapter (Branch 04)',
      members: '4,900 Active Clinicians'
    },
    {
      id: 'cb-2',
      name: 'IMA Youth Wing',
      branch: 'South Zone Medical Students Council',
      members: '24,500 Scholars'
    }
  ];

  const handleConnect = (id: string, name: string) => {
    setConnectedIds(prev => ({ ...prev, [id]: true }));
    Alert.alert("Request Sent", `Networking connection request sent to ${name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Slide 10 Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            placeholder="Search accounts, hospitals, posts, jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Slide 10 Categories Bar: Accounts | community | associations | posts | job offers | Hospital | */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 2. Slide 10 Left Column: Networking (Likely preference, Alumni connection, Suggestions) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>NETWORKING & PEER SUGGESTIONS</Text>
            <Text style={styles.cardBadge}>Alumni Engine</Text>
          </View>

          {networkingSuggestions.map((item) => (
            <View key={item.id} style={styles.personRow}>
              <Image source={{ uri: item.avatar }} style={styles.personAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{item.name} ✓</Text>
                <Text style={styles.personRole}>{item.role}</Text>
                <Text style={styles.personReason}>{item.reason}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleConnect(item.id, item.name)}
                style={[styles.connectBtn, connectedIds[item.id] && { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}
              >
                <Text style={[styles.connectBtnText, connectedIds[item.id] && { color: '#059669' }]}>
                  {connectedIds[item.id] ? 'Sent ✓' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 3. Slide 10 Right Column: Community branches (We will give data), Suggestions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>COMMUNITY CHAPTERS & BRANCHES</Text>
            <Text style={styles.cardBadge}>Official Data</Text>
          </View>

          {communityBranches.map((cb) => (
            <View key={cb.id} style={styles.branchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.branchName}>{cb.name}</Text>
                <Text style={styles.branchSub}>{cb.branch} • {cb.members}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => Alert.alert("Joined", `Joined chapter: ${cb.branch}`)}
                style={styles.joinBtn}
              >
                <Text style={styles.joinBtnText}>Join</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchHeader: { backgroundColor: '#ffffff', padding: 14, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  searchBar: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0f172a', marginLeft: 8 },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 6
  },
  catPillActive: { backgroundColor: '#0284c7' },
  catText: { fontSize: 11, fontWeight: '600', color: '#475569', textTransform: 'capitalize' },
  catTextActive: { color: '#ffffff', fontWeight: 'bold' },
  content: { flex: 1, padding: 14 },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  cardBadge: { fontSize: 9, fontWeight: 'bold', backgroundColor: '#e0f2fe', color: '#0284c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  personAvatar: { width: 44, height: 44, borderRadius: 22 },
  personName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  personRole: { fontSize: 11, color: '#475569' },
  personReason: { fontSize: 10, color: '#0284c7', fontWeight: 'bold', marginTop: 2 },
  connectBtn: { backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  connectBtnText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  branchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  branchName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  branchSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  joinBtn: { backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  joinBtnText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' }
});
