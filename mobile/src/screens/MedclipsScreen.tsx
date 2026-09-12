import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Alert,
  Modal
} from 'react-native';
import { Medclip, UserProfile } from '../types';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

interface MedclipsScreenProps {
  currentUser: UserProfile;
}

export const MedclipsScreen: React.FC<MedclipsScreenProps> = ({ currentUser }) => {
  const [activeCategory, setActiveCategory] = useState<'clinical updates' | 'social update' | 'following'>('clinical updates');
  const [likesCount, setLikesCount] = useState(1420);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);

  const currentClip: Medclip = {
    id: 'clip-1',
    authorName: 'Dr. Arvind Ramesh',
    authorSpecialty: 'Interventional Cardiology',
    authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    caption: 'Auscultation masterclass: How to instantly distinguish Aortic Stenosis from Mitral Regurgitation using simple bedside isometric handgrip maneuvers. 🎧🩺',
    category: 'clinical updates',
    tags: ['#Cardiology', '#Auscultation', '#ClinicalPearls', '#MedEd'],
    likesCount: likesCount,
    commentsCount: 114
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(likesCount + (isLiked ? -1 : 1));
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Category Switcher Bar (Slide 6: social update / clinical updates / following (Main)) */}
      <View style={styles.categoryBar}>
        {(['clinical updates', 'social update', 'following'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.catPill,
              activeCategory === cat && styles.catPillActive
            ]}
          >
            <Text style={[
              styles.catPillText,
              activeCategory === cat && styles.catPillTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2. Media Canvas (Simulated Video Clip) */}
      <View style={styles.mediaCanvas}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=1200&fit=crop' }}
          style={styles.clipBackground}
          resizeMode="cover"
        />

        {/* Play Overlay Icon */}
        <View style={styles.playIconBox}>
          <Text style={{ fontSize: 32, color: '#ffffff' }}>▶</Text>
        </View>

        {/* 3. Right Side Action Bar (Slide 6: Like, comment, Share, Save, more) */}
        <View style={styles.rightActions}>
          
          {/* Like */}
          <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
            <View style={[styles.actionCircle, isLiked && { backgroundColor: '#e11d48' }]}>
              <Text style={{ fontSize: 20 }}>{isLiked ? '❤️' : '🤍'}</Text>
            </View>
            <Text style={styles.actionCount}>{likesCount}</Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity 
            onPress={() => Alert.alert("Clinical Discussion", "114 verified peer responses on this clinical clip.")} 
            style={styles.actionBtn}
          >
            <View style={styles.actionCircle}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </View>
            <Text style={styles.actionCount}>114</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity 
            onPress={() => Alert.alert("Share", "Medclip link copied to clipboard.")} 
            style={styles.actionBtn}
          >
            <View style={styles.actionCircle}>
              <Text style={{ fontSize: 20 }}>↗️</Text>
            </View>
            <Text style={styles.actionCount}>Share</Text>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity 
            onPress={() => setIsSaved(!isSaved)} 
            style={styles.actionBtn}
          >
            <View style={[styles.actionCircle, isSaved && { backgroundColor: '#0284c7' }]}>
              <Text style={{ fontSize: 20 }}>🔖</Text>
            </View>
            <Text style={styles.actionCount}>{isSaved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>

          {/* More (Slide 6: Report, Connect, copy link, Interested) */}
          <TouchableOpacity 
            onPress={() => setShowMoreModal(true)} 
            style={styles.actionBtn}
          >
            <View style={styles.actionCircle}>
              <Text style={{ fontSize: 20 }}>⋮</Text>
            </View>
            <Text style={styles.actionCount}>More</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Bottom Info: Name, Follow, Caption (Slide 6) */}
        <View style={styles.bottomInfo}>
          <View style={styles.authorRow}>
            <Image source={{ uri: currentClip.authorAvatar }} style={styles.authorAvatar} />
            <View>
              <Text style={styles.authorName}>{currentClip.authorName} ✓</Text>
              <Text style={styles.authorSpec}>{currentClip.authorSpecialty}</Text>
            </View>

            <TouchableOpacity 
              onPress={() => setIsFollowing(!isFollowing)}
              style={[styles.followBtn, isFollowing && { backgroundColor: 'rgba(255,255,255,0.3)' }]}
            >
              <Text style={styles.followBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.captionText} numberOfLines={3}>
            {currentClip.caption}
          </Text>

          <View style={styles.tagRow}>
            {currentClip.tags.map((t, idx) => (
              <Text key={idx} style={styles.tagText}>{t} </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Slide 6 More Action Modal (Report, Connect, copy link, Interested) */}
      <Modal visible={showMoreModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Medclip Options</Text>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setShowMoreModal(false);
                Alert.alert("Connected", `Connection request sent to ${currentClip.authorName}`);
              }}
            >
              <Text style={styles.modalOptionText}>🤝 Connect with Author</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setShowMoreModal(false);
                Alert.alert("Copied", "Direct link to Medclip copied.");
              }}
            >
              <Text style={styles.modalOptionText}>🔗 Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setShowMoreModal(false);
                Alert.alert("Preference Updated", "You will see more clinical updates like this.");
              }}
            >
              <Text style={styles.modalOptionText}>⭐ Interested in this Topic</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowMoreModal(false);
                Alert.alert("Reported", "Case submitted for clinical ethics & HIPAA verification.");
              }}
            >
              <Text style={[styles.modalOptionText, { color: '#ef4444' }]}>🚩 Report Clip</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowMoreModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  categoryBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  catPillActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  catPillText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold' },
  catPillTextActive: { color: '#ffffff' },
  mediaCanvas: { flex: 1, position: 'relative' },
  clipBackground: { width: '100%', height: '100%' },
  playIconBox: {
    position: 'absolute',
    top: '40%',
    left: '42%',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightActions: {
    position: 'absolute',
    right: 14,
    bottom: 90,
    alignItems: 'center',
    gap: 16
  },
  actionBtn: { alignItems: 'center' },
  actionCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionCount: { color: '#ffffff', fontSize: 11, fontWeight: 'bold', marginTop: 3 },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 80
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#0284c7' },
  authorName: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  authorSpec: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  followBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8
  },
  followBtnText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  captionText: { color: '#ffffff', fontSize: 12, lineHeight: 18, marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagText: { color: '#7dd3fc', fontSize: 11, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20
  },
  modalTitle: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 14, textAlign: 'center' },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#334155'
  },
  modalOptionText: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    alignItems: 'center'
  },
  modalCancelText: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' }
});
