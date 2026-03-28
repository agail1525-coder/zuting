import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, Review, ReviewStats } from '../lib/api';

function Stars({ rating, interactive, onSelect }: {
  rating: number;
  interactive?: boolean;
  onSelect?: (star: number) => void;
}) {
  return (
    <View style={st.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={interactive ? () => onSelect?.(star) : undefined}>
          <Ionicons
            name={star <= Math.round(rating) ? 'star' : 'star-outline'}
            size={interactive ? 28 : 16}
            color={star <= Math.round(rating) ? '#0066FF' : '#D1D5DB'}
          />
        </Pressable>
      ))}
    </View>
  );
}

function ReviewForm({ targetType, targetId, onSubmitted }: {
  targetType: string;
  targetId: string;
  onSubmitted: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!expanded) {
    return (
      <Pressable style={st.expandBtn} onPress={() => setExpanded(true)}>
        <Ionicons name="create-outline" size={16} color="#0066FF" />
        <Text style={st.expandBtnText}>写评价</Text>
      </Pressable>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('请选择评分');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.createReview({
        targetType: targetType as 'TRIP' | 'GUIDE' | 'SITE',
        targetId,
        rating,
        content: content.trim() || undefined,
      });
      setRating(0);
      setContent('');
      setExpanded(false);
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={st.formCard}>
      <View style={st.formRow}>
        <Text style={st.formLabel}>评分</Text>
        <Stars rating={rating} interactive onSelect={setRating} />
        {rating > 0 && <Text style={st.ratingHint}>{rating}星</Text>}
      </View>
      <TextInput
        style={st.textInput}
        value={content}
        onChangeText={setContent}
        placeholder="分享你的朝圣体验..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={3}
      />
      {error && <Text style={st.errorText}>{error}</Text>}
      <View style={st.formActions}>
        <Pressable onPress={() => setExpanded(false)} disabled={submitting}>
          <Text style={st.cancelText}>取消</Text>
        </Pressable>
        <Pressable
          style={[st.submitBtn, (submitting || rating === 0) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
        >
          <Text style={st.submitBtnText}>{submitting ? '提交中...' : '提交评价'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface ReviewSectionProps {
  targetType: string;
  targetId: string;
}

export default function ReviewSection({ targetType, targetId }: ReviewSectionProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!targetId) return;
    setLoading(true);
    Promise.all([
      api.getReviewStats(targetType, targetId),
      api.getReviews(targetType, targetId, 5),
    ])
      .then(([statsData, reviewsData]) => {
        setStats(statsData);
        setReviews(reviewsData.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [targetType, targetId]);

  if (loading) {
    return (
      <View style={st.container}>
        <Text style={st.title}>朝圣评价</Text>
        <Text style={st.loadingText}>加载评价中...</Text>
      </View>
    );
  }

  const isEmpty = !stats || stats.totalCount === 0;

  return (
    <View style={st.container}>
      <Text style={st.title}>朝圣评价</Text>

      {isEmpty ? (
        <>
          <View style={st.emptyState}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📝</Text>
            <Text style={st.emptyText}>暂无评价，来写第一条吧</Text>
          </View>
          <ReviewForm targetType={targetType} targetId={targetId} onSubmitted={loadData} />
        </>
      ) : (
        <>
          {/* Stats Summary */}
          <View style={st.statsCard}>
            <View style={st.statsLeft}>
              <Text style={st.avgRating}>{stats!.averageRating.toFixed(1)}</Text>
              <Stars rating={stats!.averageRating} />
            </View>
            <View style={st.statsRight}>
              <Text style={st.totalCount}>{stats!.totalCount} 条评价</Text>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats!.distribution[star] ?? 0;
                const pct = stats!.totalCount > 0 ? (count / stats!.totalCount) * 100 : 0;
                return (
                  <View key={star} style={st.barRow}>
                    <Text style={st.barLabel}>{star}</Text>
                    <Ionicons name="star" size={10} color="#0066FF" />
                    <View style={st.barBg}>
                      <View style={[st.barFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={st.barCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Review List */}
          {reviews.map((review) => (
            <View key={review.id} style={st.reviewCard}>
              <View style={st.reviewHeader}>
                <View style={st.avatar}>
                  <Text style={st.avatarText}>
                    {(review.user.nickname ?? '匿').charAt(0)}
                  </Text>
                </View>
                <Text style={st.nickname}>{review.user.nickname ?? '匿名朝圣者'}</Text>
                <Text style={st.date}>{review.createdAt.slice(0, 10)}</Text>
              </View>
              <Stars rating={review.rating} />
              {review.content ? <Text style={st.reviewContent}>{review.content}</Text> : null}
            </View>
          ))}

          <ReviewForm targetType={targetType} targetId={targetId} onSubmitted={loadData} />
        </>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  loadingText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 2 },

  // Stats
  statsCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12,
  },
  statsLeft: { alignItems: 'center', justifyContent: 'center' },
  avgRating: { fontSize: 28, fontWeight: '800', color: '#0066FF' },
  statsRight: { flex: 1 },
  totalCount: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  barLabel: { width: 12, fontSize: 10, color: '#6B7280', textAlign: 'right' },
  barBg: { flex: 1, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: 'rgba(0,102,255,0.5)', borderRadius: 3 },
  barCount: { width: 20, fontSize: 10, color: '#9CA3AF', textAlign: 'right' },

  // Review Card
  reviewCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,102,255,0.1)', borderWidth: 1, borderColor: 'rgba(0,102,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 12, color: '#0066FF' },
  nickname: { flex: 1, fontSize: 13, color: '#374151' },
  date: { fontSize: 11, color: '#9CA3AF' },
  reviewContent: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 6 },

  // Form
  expandBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,102,255,0.3)', borderStyle: 'dashed',
  },
  expandBtnText: { fontSize: 14, color: '#0066FF' },
  formCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  formLabel: { fontSize: 13, color: '#6B7280' },
  ratingHint: { fontSize: 12, color: '#9CA3AF' },
  textInput: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 10, fontSize: 14, color: '#374151', minHeight: 70, textAlignVertical: 'top',
  },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  cancelText: { fontSize: 13, color: '#6B7280', paddingVertical: 6 },
  submitBtn: {
    backgroundColor: '#0066FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
  },
  submitBtnText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
});
