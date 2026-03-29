import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/lib/api';
import StarRating from '../src/components/StarRating';

export default function WriteReviewScreen() {
  const router = useRouter();
  const { targetType, targetId } = useLocalSearchParams<{ targetType: string; targetId: string }>();

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating > 0 && content.trim().length >= 10 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!targetType || !targetId) {
      Alert.alert('错误', '缺少评价目标信息');
      return;
    }
    setSubmitting(true);
    try {
      await api.createReview({
        targetType: targetType as 'TRIP' | 'GUIDE' | 'SITE',
        targetId,
        rating,
        content: content.trim(),
      });
      Alert.alert('成功', '评价已提交，感谢你的分享！', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('提交失败', e instanceof Error ? e.message : '请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>写评价</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>综合评分 *</Text>
          <View style={styles.ratingWrapper}>
            <StarRating value={rating} onChange={setRating} size={40} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            评价内容 *
            <Text style={styles.sectionHint}> (至少10个字)</Text>
          </Text>
          <TextInput
            style={[styles.textInput, content.trim().length > 0 && content.trim().length < 10 && styles.textInputError]}
            value={content}
            onChangeText={setContent}
            placeholder="分享你的朝圣体验，帮助更多旅行者..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, content.trim().length < 10 && content.length > 0 && styles.charCountError]}>
            {content.trim().length} 字{content.trim().length < 10 ? `，还需 ${10 - content.trim().length} 字` : ''}
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Ionicons name="bulb-outline" size={16} color="#F5A623" />
          <Text style={styles.tipsText}>
            真实的评价能帮助其他朝圣者做出更好的选择。请分享你的真实体验。
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <Text style={styles.submitBtnText}>提交中...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>提交评价</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1 },
  content: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },

  // Section
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  sectionHint: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },

  ratingWrapper: { alignItems: 'center', paddingVertical: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },

  textInput: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 14, fontSize: 14, color: '#374151',
    minHeight: 120,
  },
  textInputError: { borderColor: '#FCA5A5' },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
  charCountError: { color: '#EF4444' },

  tipsCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  tipsText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 16, marginTop: 24,
    backgroundColor: '#0066FF', paddingVertical: 14, borderRadius: 999,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
