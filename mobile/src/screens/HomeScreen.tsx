import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  TextInput 
} from 'react-native';
import { Post, UserProfile } from '../types';

interface HomeScreenProps {
  currentUser: UserProfile;
  onOpenCreate: () => void;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  onOpenCreate,
  onOpenNotifications,
  onOpenMessages
}) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      authorName: 'Dr. Arvind Ramesh',
      authorUsername: 'cardio_ramesh',
      authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
      authorRole: 'DOCTOR',
      specialtyOrYear: 'Interventional Cardiology',
      isVerified: true,
      content: '🚨 58-year-old male with acute retrosternal chest pain. Notice ST elevations in II, III, aVF with complete AV dissociation. What is your culprit vessel?',
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=500&fit=crop',
      tags: ['#Cardiology', '#STEMI', '#ECGChallenge'],
      pollQuestion: 'Primary Culprit Vessel:',
      pollOptions: [
        { id: '1', text: 'Proximal RCA', votes: 142 },
        { id: '2', text: 'LAD Diagonal', votes: 18 },
        { id: '3', text: 'LCx Dominant', votes: 34 }
      ],
      likesCount: 342,
      commentsCount: 48,
      savesCount: 114,
      isLiked: false,
      createdAt: '2h ago'
    },
    {
      id: 'post-2',
      authorName: 'Rohan Verma',
      authorUsername: 'medical student',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      authorRole: 'STUDENT',
      specialtyOrYear: 'Final Year MBBS (KIMS)',
      isVerified: true,
      content: 'High-yield note for university exams: The sublingual capillary flow index correlates significantly better with septic shock 28-day survival than central venous oxygen saturation.',
      tags: ['#MedicalStudents', '#CriticalCare', '#NEJM'],
      likesCount: 189,
      commentsCount: 22,
      savesCount: 78,
      isLiked: true,
      createdAt: '4h ago'
    }
  ]);

  const toggleLike = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        const isLiked = !p.isLiked;
        return { ...p, isLiked, likesCount: p.likesCount + (isLiked ? 1 : -1) };
      }
      return p;
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Slide 5 Top Header Bar: Create +, Medmedia, Notifications, Messages */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.createBtn} onPress={onOpenCreate}>
            <Text style={styles.createBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medmedia</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>PRO</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenNotifications}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenMessages}>
            <Text style={styles.iconText}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Slide 5: Story update (Accessory feature) */}
        <View style={styles.storySection}>
          <Text style={styles.sectionHeader}>STORY UPDATES (ACCESSORY FEATURE)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyRow}>
            <View style={styles.storyBubble}>
              <View style={[styles.avatarRing, { borderColor: '#0284c7', borderStyle: 'dashed' }]}>
                <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarImg} />
              </View>
              <Text style={styles.storyLabel}>Your Story</Text>
            </View>

            {[
              { name: 'Dr. Priya', url: 'https://images.unsplash.com/photo-1594824813581-2292f725350c?w=100&h=100&fit=crop' },
              { name: 'Rohan (MBBS)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
              { name: 'Ananya (Pharm)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop' }
            ].map((s, idx) => (
              <View key={idx} style={styles.storyBubble}>
                <View style={[styles.avatarRing, { borderColor: '#0284c7' }]}>
                  <Image source={{ uri: s.url }} style={styles.avatarImg} />
                </View>
                <Text style={styles.storyLabel}>{s.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Slide 5 & 7: Home Feed (Text, tweets, Images, Links, Discussions - No shorts or reels) */}
        <View style={styles.feedSection}>
          <Text style={styles.feedHeader}>Clinical Discussions & Feed</Text>

          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              
              {/* Header: Name / Follow (Slide 7) */}
              <View style={styles.postHeader}>
                <View style={styles.authorRow}>
                  <Image source={{ uri: post.authorAvatar }} style={styles.postAvatar} />
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.postAuthorName}>{post.authorName}</Text>
                      <Text style={{ color: '#0284c7', fontWeight: 'bold' }}>✓</Text>
                    </View>
                    <Text style={styles.postAuthorMeta}>@{post.authorUsername} • {post.specialtyOrYear}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.followBtn}>
                  <Text style={styles.followBtnText}>Follow</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <Text style={styles.postContent}>{post.content}</Text>

              {post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.postMedia} resizeMode="cover" />
              )}

              {/* Poll Widget */}
              {post.pollQuestion && (
                <View style={styles.pollBox}>
                  <Text style={styles.pollTitle}>📊 {post.pollQuestion}</Text>
                  {post.pollOptions?.map((opt) => (
                    <TouchableOpacity key={opt.id} style={styles.pollOption}>
                      <Text style={styles.pollOptionText}>{opt.text}</Text>
                      <Text style={styles.pollVoteCount}>{opt.votes} votes</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Slide 7: Like / comment / save / share */}
              <View style={styles.postFooter}>
                <View style={styles.actionLeft}>
                  <TouchableOpacity onPress={() => toggleLike(post.id)} style={styles.actionItem}>
                    <Text style={styles.actionIcon}>{post.isLiked ? '❤️' : '🤍'}</Text>
                    <Text style={styles.actionNum}>{post.likesCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionItem}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionNum}>{post.commentsCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionItem}>
                    <Text style={styles.actionIcon}>↗️</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity>
                  <Text style={styles.actionIcon}>🔖</Text>
                </TouchableOpacity>
              </View>

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
  header: {
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  createBtnText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  verifiedBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  verifiedText: { fontSize: 9, fontWeight: 'bold', color: '#0369a1' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 6 },
  iconText: { fontSize: 18 },
  content: { flex: 1 },
  storySection: { backgroundColor: '#ffffff', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  sectionHeader: { fontSize: 10, fontWeight: '800', color: '#64748b', paddingHorizontal: 16, marginBottom: 8 },
  storyRow: { paddingLeft: 16 },
  storyBubble: { alignItems: 'center', marginRight: 14 },
  avatarRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, padding: 2, justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 54, height: 54, borderRadius: 27 },
  storyLabel: { fontSize: 11, color: '#334155', marginTop: 4, fontWeight: '500' },
  feedSection: { padding: 12 },
  feedHeader: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 10, textTransform: 'uppercase' },
  postCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: { width: 44, height: 44, borderRadius: 22 },
  postAuthorName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  postAuthorMeta: { fontSize: 11, color: '#64748b' },
  followBtn: { backgroundColor: '#f0f9ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#bae6fd' },
  followBtnText: { fontSize: 11, fontWeight: 'bold', color: '#0284c7' },
  postContent: { fontSize: 13, color: '#1e293b', lineHeight: 19, marginBottom: 10 },
  postMedia: { width: '100%', height: 220, borderRadius: 14, marginBottom: 10 },
  pollBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  pollTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  pollOption: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  pollOptionText: { fontSize: 12, color: '#334155', fontWeight: '500' },
  pollVoteCount: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9' },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 16 },
  actionNum: { fontSize: 12, fontWeight: 'bold', color: '#64748b' }
});
