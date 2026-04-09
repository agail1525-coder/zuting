import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchGuides, fetchQuestions, fetchLeaderboard, GuideItem, QuestionItem, LeaderboardEntry } from '../../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

type TabKey = 'guides' | 'questions' | 'leaderboard';
type GuideSort = 'latest' | 'hot';
type QuestionSort = 'latest' | 'hot' | 'unanswered';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'guides', label: '游记' },
  { key: 'questions', label: '问答' },
  { key: 'leaderboard', label: '排行' },
];

const RANK_BADGES: Record<number, string> = { 1: '\uD83C\uDFC6', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };

export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('guides');
  const [guideSort, setGuideSort] = useState<GuideSort>('latest');
  const [questionSort, setQuestionSort] = useState<QuestionSort>('latest');
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const loadGuides = useCallback(async () => {
    setGuideLoading(true);
    try {
      const res = await fetchGuides({ sort: guideSort });
      setGuides(Array.isArray(res?.items) ? res.items : []);
    } catch {
      setGuides([]);
    } finally {
      setGuideLoading(false);
    }
  }, [guideSort]);

  const loadQuestions = useCallback(async () => {
    setQuestionLoading(true);
    try {
      const res = await fetchQuestions({ sort: questionSort });
      setQuestions(Array.isArray(res?.items) ? res.items : []);
    } catch {
      setQuestions([]);
    } finally {
      setQuestionLoading(false);
    }
  }, [questionSort]);

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetchLeaderboard('guides', 'month');
      setLeaderboard(Array.isArray(res) ? res : []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'guides') loadGuides();
  }, [activeTab, loadGuides]);

  useEffect(() => {
    if (activeTab === 'questions') loadQuestions();
  }, [activeTab, loadQuestions]);

  useEffect(() => {
    if (activeTab === 'leaderboard') loadLeaderboard();
  }, [activeTab, loadLeaderboard]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>攻略社区</Text>
        <Pressable style={styles.writeBtn} onPress={() => router.push('/write-guide' as never)}>
          <Ionicons name="create-outline" size={18} color={colors.gold} />
          <Text style={styles.writeBtnText}>写游记</Text>
        </Pressable>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'guides' && (
        <GuidesTab
          guides={guides}
          loading={guideLoading}
          sort={guideSort}
          onSortChange={setGuideSort}
          onPress={(id) => router.push(`/community/guide/${id}` as never)}
        />
      )}
      {activeTab === 'questions' && (
        <QuestionsTab
          questions={questions}
          loading={questionLoading}
          sort={questionSort}
          onSortChange={setQuestionSort}
          onPress={(id) => router.push(`/community/question/${id}` as never)}
        />
      )}
      {activeTab === 'leaderboard' && <LeaderboardTab entries={leaderboard} loading={leaderboardLoading} />}
    </SafeAreaView>
  );
}

/* ── Guides Tab ── */
function GuidesTab({
  guides,
  loading,
  sort,
  onSortChange,
  onPress,
}: {
  guides: GuideItem[];
  loading: boolean;
  sort: GuideSort;
  onSortChange: (s: GuideSort) => void;
  onPress: (id: string) => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.sortBar}>
        {(['latest', 'hot'] as GuideSort[]).map(s => (
          <Pressable
            key={s}
            style={[styles.sortBtn, sort === s && styles.sortBtnActive]}
            onPress={() => onSortChange(s)}
          >
            <Text style={[styles.sortBtnText, sort === s && styles.sortBtnTextActive]}>
              {s === 'latest' ? '最新' : '最热'}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.gold} />
      ) : guides.length === 0 ? (
        <EmptyState icon="newspaper-outline" text="暂无游记" />
      ) : (
        <FlatList
          data={guides}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable style={styles.guideCard} onPress={() => onPress(item.id)}>
              {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} style={styles.guideCover} resizeMode="cover" />
              ) : (
                <View style={[styles.guideCover, styles.guideCoverPlaceholder]}>
                  <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                </View>
              )}
              <View style={styles.guideInfo}>
                <Text style={styles.guideTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.guideAuthorRow}>
                  <View style={styles.guideAvatar}>
                    <Text style={styles.guideAvatarText}>{(item.user?.nickname ?? '?')[0]}</Text>
                  </View>
                  <Text style={styles.guideAuthor}>{item.user?.nickname ?? '匿名'}</Text>
                </View>
                <View style={styles.guideMeta}>
                  <Ionicons name="heart-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.guideMetaText}>{item.likeCount ?? 0}</Text>
                  <Ionicons name="chatbubble-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.guideMetaText}>{item.commentCount ?? 0}</Text>
                  <Ionicons name="eye-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.guideMetaText}>{item.viewCount ?? 0}</Text>
                </View>
                {item.tags.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item.tags.slice(0, 3).map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

/* ── Questions Tab ── */
function QuestionsTab({
  questions,
  loading,
  sort,
  onSortChange,
  onPress,
}: {
  questions: QuestionItem[];
  loading: boolean;
  sort: QuestionSort;
  onSortChange: (s: QuestionSort) => void;
  onPress: (id: string) => void;
}) {
  const SORT_LABELS: Record<QuestionSort, string> = {
    latest: '最新',
    hot: '最热',
    unanswered: '未回答',
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.sortBar}>
        {(['latest', 'hot', 'unanswered'] as QuestionSort[]).map(s => (
          <Pressable
            key={s}
            style={[styles.sortBtn, sort === s && styles.sortBtnActive]}
            onPress={() => onSortChange(s)}
          >
            <Text style={[styles.sortBtnText, sort === s && styles.sortBtnTextActive]}>
              {SORT_LABELS[s]}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.gold} />
      ) : questions.length === 0 ? (
        <EmptyState icon="help-circle-outline" text="暂无问答" />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable style={styles.questionCard} onPress={() => onPress(item.id)}>
              <View style={styles.questionLeft}>
                <Ionicons name="help-circle" size={20} color={colors.gold} />
              </View>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.questionExcerpt} numberOfLines={1}>{item.content}</Text>
                <View style={styles.questionMeta}>
                  <Ionicons name="chatbubble-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.guideMetaText}>{item.answerCount ?? 0} 回答</Text>
                  <Ionicons name="eye-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.guideMetaText}>{item.viewCount ?? 0}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

/* ── Leaderboard Tab ── */
function LeaderboardTab({ entries, loading }: { entries: LeaderboardEntry[]; loading: boolean }) {
  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.gold} />;
  }
  return (
    <ScrollView contentContainerStyle={styles.listContent}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>本月游记排行</Text>
        <Text style={styles.leaderboardSubtitle}>发布游记最多的旅行者</Text>
      </View>
      {entries.length === 0 ? (
        <EmptyState icon="trophy-outline" text="暂无排行数据" />
      ) : (
        entries.map(entry => (
          <View key={entry.rank} style={styles.leaderEntry}>
            <Text style={styles.leaderRank}>
              {RANK_BADGES[entry.rank] ?? `#${entry.rank}`}
            </Text>
            <View style={styles.leaderAvatar}>
              <Text style={styles.leaderAvatarText}>{(entry.nickname ?? '?')[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.leaderNickname}>{entry.nickname}</Text>
              <Text style={styles.leaderCount}>{entry.count} 篇游记</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

/* ── Shared ── */
function EmptyState({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700', color: '#111827' },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,102,255,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  writeBtnText: { color: colors.gold, fontSize: fontSize.md, fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.gold },
  tabText: { fontSize: fontSize.lg, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: colors.gold, fontWeight: '700' },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#ffffff',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    backgroundColor: '#F3F4F6',
  },
  sortBtnActive: { backgroundColor: colors.gold },
  sortBtnText: { fontSize: fontSize.sm, color: '#6b7280', fontWeight: '500' },
  sortBtnTextActive: { color: '#ffffff', fontWeight: '600' },
  listContent: { padding: spacing.md, gap: spacing.sm },
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  guideCover: { width: '100%', height: 160 },
  guideCoverPlaceholder: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideInfo: { padding: spacing.md },
  guideTitle: { fontSize: fontSize.lg, fontWeight: '600', color: '#111827', marginBottom: 8 },
  guideAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  guideAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,102,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideAvatarText: { fontSize: 10, color: colors.gold, fontWeight: '700' },
  guideAuthor: { fontSize: fontSize.sm, color: '#6b7280' },
  guideMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  guideMetaText: { fontSize: fontSize.sm, color: '#6b7280', marginRight: 8 },
  tag: {
    backgroundColor: 'rgba(0,102,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  tagText: { fontSize: fontSize.xs, color: colors.gold },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  questionLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,102,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContent: { flex: 1 },
  questionTitle: { fontSize: fontSize.md, fontWeight: '600', color: '#111827', marginBottom: 4 },
  questionExcerpt: { fontSize: fontSize.sm, color: '#6b7280', marginBottom: 6 },
  questionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaderboardHeader: { alignItems: 'center', paddingVertical: spacing.lg },
  leaderboardTitle: { fontSize: fontSize.xl, fontWeight: '700', color: '#111827' },
  leaderboardSubtitle: { fontSize: fontSize.sm, color: '#6b7280', marginTop: 4 },
  leaderEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  leaderRank: { fontSize: fontSize.lg, width: 32, textAlign: 'center' },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,102,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderAvatarText: { fontSize: fontSize.md, fontWeight: '700', color: colors.gold },
  leaderNickname: { fontSize: fontSize.md, fontWeight: '600', color: '#111827' },
  leaderCount: { fontSize: fontSize.sm, color: '#6b7280' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyStateText: { fontSize: fontSize.md, color: colors.textMuted },
});
