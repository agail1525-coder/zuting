import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, Review, ReviewStats } from '../lib/api';

function Stars({ rating }: { rating: number }) {
  return (
    <View style={st.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? 'star' : 'star-outline'}
          size={14}
          color={star <= Math.round(rating) ? '#F5A623' : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

interface ReviewSectionProps {
  targetType: string;
  targetId: string;
}

export default function ReviewSection({ targetType, targetId }: ReviewSectionProps) {
  const router = useRouter();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const loadData = () => {
    if (!targetId) return;
    setLoading(true);
    Promise.all([
      api.getReviewStats(targetType, targetId),
      api.getReviews(targetType, targetId, 3),
    ])
      .then(([statsData, reviewsData]) => {
        setStats(statsData);
        setReviews(reviewsData.data);
      })
      .catch((err) => { console.error('Load reviews failed:', err); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [targetType, targetId]);

  const handleVote = async (reviewId: string) => {
    const alreadyVoted = votedIds.has(reviewId);
    setVotedIds(prev => {
      const next = new Set(prev);
      if (alreadyVoted) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
    try {
      if (alreadyVoted) {
        await api.unvoteReview(reviewId);
      } else {
        await api.voteReview(reviewId);
      }
    } catch {
      // revert on error
      setVotedIds(prev => {
        const next = new Set(prev);
        if (alreadyVoted) next.add(reviewId);
        else next.delete(reviewId);
        return next;
      });
    }
  };

  const handleWriteReview = () => {
    router.push(`/write-review?targetType=${targetType}&targetId=${targetId}` as never);
  };

  const handleViewAll = () => {
    router.push(`/write-review?targetType=${targetType}&targetId=${targetId}` as never);
  };

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
      {/* Header */}
      <View style={st.headerRow}>
        <Text style={st.title}>朝圣评价</Text>
        <Pressable style={st.writeBtn} onPress={handleWriteReview}>
          <Ionicons name="create-outline" size={14} color="#0066FF" />
          <Text style={st.writeBtnText}>写评价</Text>
        </Pressable>
      </View>

      {isEmpty ? (
        <View style={st.emptyState}>
          <Text style={st.emptyIcon}>📝</Text>
          <Text style={st.emptyText}>暂无评价，来写第一条吧</Text>
        </View>
      ) : (
        <>
          {/* Stats Summary */}
          <View style={st.statsCard}>
            <View style={st.statsLeft}>
              <Text style={st.avgRating}>{(stats?.averageRating ?? 0).toFixed(1)}</Text>
              <Stars rating={stats?.averageRating ?? 0} />
              <Text style={st.totalCount}>{stats?.totalCount ?? 0} 条评价</Text>
            </View>
            <View style={st.statsRight}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats?.distribution[star] ?? 0;
                const total = stats?.totalCount ?? 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <View key={star} style={st.barRow}>
                    <Text style={st.barLabel}>{star}</Text>
                    <Ionicons name="star" size={9} color="#F5A623" />
                    <View style={st.barBg}>
                      <View style={[st.barFill, { width: `${pct}%` as unknown as number }]} />
                    </View>
                    <Text style={st.barCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Review List (first 3) */}
          {reviews.map((review) => (
            <View key={review.id} style={st.reviewCard}>
              <View style={st.reviewHeader}>
                <View style={st.avatar}>
                  <Text style={st.avatarText}>
                    {(review.user.nickname ?? '匿').charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.nickname}>{review.user.nickname ?? '匿名朝圣者'}</Text>
                  <Text style={st.date}>{review.createdAt.slice(0, 10)}</Text>
                </View>
                <Stars rating={review.rating} />
              </View>
              {review.content ? <Text style={st.reviewContent}>{review.content}</Text> : null}
              <Pressable
                style={[st.helpfulBtn, votedIds.has(review.id) && st.helpfulBtnActive]}
                onPress={() => handleVote(review.id)}
              >
                <Ionicons
                  name={votedIds.has(review.id) ? 'thumbs-up' : 'thumbs-up-outline'}
                  size={13}
                  color={votedIds.has(review.id) ? '#0066FF' : '#9CA3AF'}
                />
                <Text style={[st.helpfulText, votedIds.has(review.id) && st.helpfulTextActive]}>
                  有用
                </Text>
              </Pressable>
            </View>
          ))}

          {/* View All button */}
          {(stats?.totalCount ?? 0) > 3 && (
            <Pressable style={st.viewAllBtn} onPress={handleViewAll}>
              <Text style={st.viewAllText}>查看全部 {stats?.totalCount} 条评价</Text>
              <Ionicons name="chevron-forward" size={14} color="#0066FF" />
            </Pressable>
          )}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  writeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,102,255,0.3)',
  },
  writeBtnText: { fontSize: 12, color: '#0066FF' },
  loadingText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 2 },

  // Stats
  statsCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12,
  },
  statsLeft: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  avgRating: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  totalCount: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statsRight: { flex: 1, justifyContent: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  barLabel: { width: 12, fontSize: 10, color: '#6B7280', textAlign: 'right' },
  barBg: { flex: 1, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#F5A623', borderRadius: 3 },
  barCount: { width: 20, fontSize: 10, color: '#9CA3AF', textAlign: 'right' },

  // Review Card
  reviewCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,102,255,0.1)', borderWidth: 1, borderColor: 'rgba(0,102,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 13, color: '#0066FF', fontWeight: '600' },
  nickname: { fontSize: 13, fontWeight: '600', color: '#374151' },
  date: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  reviewContent: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 10 },

  // Helpful
  helpfulBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  helpfulBtnActive: { borderColor: 'rgba(0,102,255,0.3)', backgroundColor: '#EFF6FF' },
  helpfulText: { fontSize: 11, color: '#9CA3AF' },
  helpfulTextActive: { color: '#0066FF' },

  // View all
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    marginTop: 4,
  },
  viewAllText: { fontSize: 13, color: '#0066FF' },
});
