import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  fetchGuide,
  fetchGuideComments,
  addGuideComment,
  likeGuide,
  unlikeGuide,
  GuideItem,
  GuideCommentItem,
} from '../../../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../../../src/lib/theme';

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [guide, setGuide] = useState<GuideItem | null>(null);
  const [comments, setComments] = useState<GuideCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchGuide(id)
      .then(data => {
        setGuide(data);
        setLikeCount(data.likeCount ?? 0);
      })
      .catch(() => setGuide(null))
      .finally(() => setLoading(false));

    setCommentsLoading(true);
    fetchGuideComments(id)
      .then(res => setComments(Array.isArray(res?.items) ? res.items : []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    try {
      if (liked) {
        await unlikeGuide(id);
        setLikeCount(c => Math.max(0, c - 1));
      } else {
        await likeGuide(id);
        setLikeCount(c => c + 1);
      }
      setLiked(prev => !prev);
    } catch { Alert.alert('提示', '操作失败'); }
  };

  const handleComment = async () => {
    if (!id || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await addGuideComment(id, commentText.trim());
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch { Alert.alert('提示', '操作失败'); } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.gold} />
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>游记不存在</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>返回</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>游记详情</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          {guide.coverImage ? (
            <Image source={{ uri: guide.coverImage }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="image-outline" size={48} color="#CBD5E1" />
            </View>
          )}

          <View style={styles.contentPad}>
            {/* Tags */}
            {guide.tags.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
                {guide.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Title */}
            <Text style={styles.title}>{guide.title}</Text>

            {/* Author + Date */}
            <View style={styles.authorRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(guide.user?.nickname ?? '?')[0]}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{guide.user?.nickname ?? '匿名'}</Text>
                <Text style={styles.publishDate}>
                  {guide.publishedAt
                    ? new Date(guide.publishedAt).toLocaleDateString('zh-CN')
                    : new Date(guide.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
              <View style={styles.authorSpacer} />
              <View style={styles.metaRow}>
                <Ionicons name="eye-outline" size={14} color="#6b7280" />
                <Text style={styles.metaText}>{guide.viewCount ?? 0}</Text>
              </View>
            </View>

            {/* Content */}
            <Text style={styles.content}>{guide.content}</Text>

            {/* Like Row */}
            <View style={styles.actionRow}>
              <Pressable style={styles.actionBtn} onPress={handleLike}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={liked ? '#EF4444' : '#6b7280'}
                />
                <Text style={[styles.actionText, liked && { color: '#EF4444' }]}>{likeCount}</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => inputRef.current?.focus()}>
                <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
                <Text style={styles.actionText}>{guide.commentCount ?? comments.length}</Text>
              </Pressable>
            </View>

            {/* Comments */}
            <Text style={styles.commentsTitle}>评论 ({comments.length})</Text>
            {commentsLoading ? (
              <ActivityIndicator size="small" color={colors.gold} style={{ marginVertical: 16 }} />
            ) : comments.length === 0 ? (
              <Text style={styles.noComments}>暂无评论，来抢沙发吧</Text>
            ) : (
              comments.map(c => (
                <View key={c.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Ionicons name="person" size={14} color={colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentContent}>{c.content}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 80 }} />
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="写下你的评论..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            onSubmitEditing={handleComment}
          />
          <Pressable
            style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
            onPress={handleComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={16} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#ffffff',
  },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '600', color: '#111827', textAlign: 'center' },
  scroll: { flex: 1 },
  coverImage: { width: '100%', height: 220 },
  coverPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentPad: { padding: spacing.md },
  tagRow: { marginBottom: spacing.sm },
  tag: {
    backgroundColor: 'rgba(0,102,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
  },
  tagText: { fontSize: fontSize.xs, color: colors.gold },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: spacing.md, lineHeight: 30 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,102,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: fontSize.md, fontWeight: '700', color: colors.gold },
  authorName: { fontSize: fontSize.md, fontWeight: '600', color: '#111827' },
  publishDate: { fontSize: fontSize.sm, color: '#6b7280' },
  authorSpacer: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: fontSize.sm, color: '#6b7280' },
  content: { fontSize: fontSize.lg, color: '#374151', lineHeight: 26, marginBottom: spacing.xl },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: spacing.lg,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: fontSize.md, color: '#6b7280' },
  commentsTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#111827', marginBottom: spacing.md },
  noComments: { fontSize: fontSize.md, color: '#6b7280', textAlign: 'center', paddingVertical: spacing.xl },
  commentItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,102,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: { fontSize: fontSize.md, color: '#374151', lineHeight: 20 },
  commentDate: { fontSize: fontSize.xs, color: '#9CA3AF', marginTop: 2 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: fontSize.md,
    color: '#111827',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: { fontSize: fontSize.lg, color: colors.textMuted },
  backBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  backBtnText: { color: '#ffffff', fontSize: fontSize.md, fontWeight: '600' },
});
