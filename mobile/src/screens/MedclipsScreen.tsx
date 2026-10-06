import React, { useEffect, useRef, useState } from 'react';
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
import { apiService } from '../services/api';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

interface MedclipsScreenProps {
  currentUser: UserProfile;
}

export const MedclipsScreen: React.FC<MedclipsScreenProps> = ({ currentUser, onFollowCountChange }) => {
  const [activeCategory, setActiveCategory] = useState<'clinical updates' | 'social update' | 'following'>('clinical updates');
  const [clips, setClips] = useState<Medclip[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const actionLocks = useRef(new Set<string>());

  useEffect(() => {
    Promise.all([apiService.getClips(), apiService.getSavedClips(), apiService.getFollowingIds()])
      .then(([loadedClips, savedClips, loadedFollowing]) => {
        const savedIds = new Set(savedClips.map(clip => clip.id));
        setClips(loadedClips.map(clip => ({ ...clip, isSaved: savedIds.has(clip.id) || clip.isSaved })));
        setFollowingIds(new Set(loadedFollowing));
      })
      .catch(() => Alert.alert('Could not load Medclips', 'Check your connection and try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleClips = clips.filter(clip => {
    const category = clip.category.toLowerCase();
    if (activeCategory === 'following') return followingIds.has(clip.authorId);
    if (activeCategory === 'clinical updates') return category.includes('clinical');
    return category.includes('social');
  });
  const currentClip = visibleClips[currentIndex];

  const toggleLike = async (clip: Medclip) => {
    const lock = 'like:' + clip.id;
    if (actionLocks.current.has(lock)) return;
    const shouldLike = !clip.isLiked;
    actionLocks.current.add(lock);
    setClips(previous => previous.map(item => item.id === clip.id
      ? { ...item, isLiked: shouldLike, likesCount: Math.max(0, item.likesCount + (shouldLike ? 1 : -1)) }
      : item));
    try {
      const result = await apiService.setClipLike(clip.id, shouldLike);
      setClips(previous => previous.map(item => item.id === clip.id
        ? { ...item, isLiked: result.isLiked, likesCount: result.likesCount }
        : item));
    } catch {
      Alert.alert('Like not saved', 'Check your connection and try again.');
      await apiService.getClips().then(setClips).catch(() => undefined);
    } finally {
      actionLocks.current.delete(lock);
    }
  };

  const toggleSave = async (clip: Medclip) => {
    const lock = 'save:' + clip.id;
    if (actionLocks.current.has(lock)) return;
    const shouldSave = !clip.isSaved;
    actionLocks.current.add(lock);
    setClips(previous => previous.map(item => item.id === clip.id
      ? { ...item, isSaved: shouldSave, savesCount: Math.max(0, item.savesCount + (shouldSave ? 1 : -1)) }
      : item));
    try {
      const result = await apiService.setClipSaved(clip.id, shouldSave);
      setClips(previous => previous.map(item => item.id === clip.id
        ? { ...item, isSaved: result.isSaved, savesCount: result.savesCount }
        : item));
    } catch {
      Alert.alert('Save not updated', 'Check your connection and try again.');
      await Promise.all([apiService.getClips(), apiService.getSavedClips()]).then(([allClips, savedClips]) => {
        const savedIds = new Set(savedClips.map(item => item.id));
        setClips(allClips.map(item => ({ ...item, isSaved: savedIds.has(item.id) })));
      }).catch(() => undefined);
    } finally {
      actionLocks.current.delete(lock);
    }
  };

  const toggleFollow = async (authorId: string) => {
    const lock = 'follow:' + authorId;
    if (!authorId || authorId === currentUser.id || actionLocks.current.has(lock)) return;
    const shouldFollow = !followingIds.has(authorId);
    actionLocks.current.add(lock);
    try {
      const result = shouldFollow ? await apiService.followUser(authorId) : await apiService.unfollowUser(authorId);
      setFollowingIds(previous => {
        const next = new Set(previous);
        if (result.isFollowing) next.add(authorId);
        else next.delete(authorId);
        return next;
      });
      onFollowCountChange(result.followingCount);
    } catch {
      Alert.alert('Follow not updated', 'Check your connection and try again.');
      await apiService.getFollowingIds().then(ids => setFollowingIds(new Set(ids))).catch(() => undefined);
    } finally {
      actionLocks.current.delete(lock);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.categoryBar}>
        {(['clinical updates', 'social update', 'following'] as const).map(category => (
          <TouchableOpacity key={category} onPress={() => { setActiveCategory(category); setCurrentIndex(0); }} style={[styles.catPill, activeCategory === category && styles.catPillActive]}>
            <Text style={[styles.catPillText, activeCategory === category && styles.catPillTextActive]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.emptyState}><ActivityIndicator color="#38bdf8" /><Text style={styles.emptyText}>Loading clips?</Text></View>
      ) : !currentClip ? (
        <View style={styles.emptyState}><Text style={styles.emptyText}>No clips in this feed yet.</Text></View>
      ) : (
        <View style={styles.mediaCanvas}>
          <Image source={{ uri: currentClip.thumbnailUrl || currentClip.authorAvatar }} style={styles.clipBackground} resizeMode="cover" />
          <View style={styles.playIconBox}><Text style={{ fontSize: 32, color: '#ffffff' }}>?</Text></View>
          <View style={styles.rightActions}>
            <TouchableOpacity onPress={() => toggleLike(currentClip)} style={styles.actionBtn}>
              <View style={[styles.actionCircle, currentClip.isLiked && { backgroundColor: '#e11d48' }]}><Text style={{ fontSize: 20 }}>{currentClip.isLiked ? '??' : '??'}</Text></View>
              <Text style={styles.actionCount}>{currentClip.likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Clinical Discussion', String(currentClip.commentsCount) + ' peer responses on this clip.')} style={styles.actionBtn}>
              <View style={styles.actionCircle}><Text style={{ fontSize: 20 }}>??</Text></View>
              <Text style={styles.actionCount}>{currentClip.commentsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Share', 'Medclip link copied to clipboard.')} style={styles.actionBtn}>
              <View style={styles.actionCircle}><Text style={{ fontSize: 20 }}>??</Text></View>
              <Text style={styles.actionCount}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleSave(currentClip)} style={styles.actionBtn}>
              <View style={[styles.actionCircle, currentClip.isSaved && { backgroundColor: '#0284c7' }]}><Text style={{ fontSize: 20 }}>??</Text></View>
              <Text style={styles.actionCount}>{currentClip.isSaved ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMoreModal(true)} style={styles.actionBtn}>
              <View style={styles.actionCircle}><Text style={{ fontSize: 20 }}>?</Text></View>
              <Text style={styles.actionCount}>More</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomInfo}>
            <View style={styles.authorRow}>
              <Image source={{ uri: currentClip.authorAvatar }} style={styles.authorAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>{currentClip.authorName}</Text>
                <Text style={styles.authorSpec}>{currentClip.authorSpecialty}</Text>
              </View>
              {currentClip.authorId !== currentUser.id && (
                <TouchableOpacity onPress={() => toggleFollow(currentClip.authorId)} style={[styles.followBtn, followingIds.has(currentClip.authorId) && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={styles.followBtnText}>{followingIds.has(currentClip.authorId) ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.captionText} numberOfLines={3}>{currentClip.caption}</Text>
            <View style={styles.tagRow}>{currentClip.tags.map((tag, index) => <Text key={index} style={styles.tagText}>{tag} </Text>)}</View>
          </View>
        </View>
      )}

      <Modal visible={showMoreModal} transparent animationType="slide">
        <View style={styles.modalOverlay}><View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Medclip Options</Text>
          {currentClip && currentClip.authorId !== currentUser.id && (
            <TouchableOpacity style={styles.modalOption} onPress={() => { setShowMoreModal(false); toggleFollow(currentClip.authorId); }}>
              <Text style={styles.modalOptionText}>{followingIds.has(currentClip.authorId) ? 'Unfollow author' : 'Follow author'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.modalOption} onPress={() => { setShowMoreModal(false); Alert.alert('Share', 'Medclip link copied to clipboard.'); }}><Text style={styles.modalOptionText}>Copy link</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => { setShowMoreModal(false); Alert.alert('Reported', 'This clip was submitted for review.'); }}><Text style={[styles.modalOptionText, { color: '#ef4444' }]}>Report clip</Text></TouchableOpacity>
          <TouchableOpacity style={styles.modalCancel} onPress={() => setShowMoreModal(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { marginTop: 12, color: '#cbd5e1', textAlign: 'center', fontSize: 13 },
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
