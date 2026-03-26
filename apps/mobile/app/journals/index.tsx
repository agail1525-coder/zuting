import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

interface JournalEntry {
  id: string;
  title: string;
  excerpt: string;
  mood: string;
  moodEmoji: string;
  date: string;
  siteName?: string;
  wordCount: number;
}

const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: '1',
    title: '白马寺的晨钟暮鼓',
    excerpt: '清晨五点，寺院的钟声悠远地响起。站在这座中国第一古刹前，感受到千年佛法东传的庄严与感动。白马寺始建于东汉，是佛教传入中国后兴建的第一座官办寺院...',
    mood: '平静',
    moodEmoji: '🧘',
    date: '2026-04-02',
    siteName: '白马寺',
    wordCount: 856,
  },
  {
    id: '2',
    title: '少林寺：武与禅的交融',
    excerpt: '在少林寺的练功房里，看到僧人们的晨练。拳法之中蕴含着禅意，每一个动作都是身心合一的修行。达摩面壁九年的故事在这里变得真实可触...',
    mood: '感动',
    moodEmoji: '🥋',
    date: '2026-04-05',
    siteName: '少林寺',
    wordCount: 1243,
  },
  {
    id: '3',
    title: '修行日记：初印系体悟',
    excerpt: '今天修习了初印系的第一印。在安静的禅房中，按照修行法门一步步观照内心。才发现，原来修行不是追求什么，而是放下什么...',
    mood: '感悟',
    moodEmoji: '🪷',
    date: '2026-03-20',
    wordCount: 678,
  },
  {
    id: '4',
    title: '菩提伽耶：在佛陀成道处打坐',
    excerpt: '坐在菩提树下，闭上眼睛。两千五百年前，悉达多太子就在这样一棵菩提树下证悟成佛。时间仿佛静止了，所有的喧嚣都远去...',
    mood: '宁静',
    moodEmoji: '🌳',
    date: '2026-01-12',
    siteName: '菩提伽耶',
    wordCount: 1567,
  },
  {
    id: '5',
    title: '恒河日出：生与死的河流',
    excerpt: '天还没亮就来到恒河边。晨曦中，信徒们在河中沐浴祈祷。同一条河流，承载着生的祝福与死的超度，印度教的生死观在这里一览无余...',
    mood: '震撼',
    moodEmoji: '🌅',
    date: '2026-01-15',
    siteName: '瓦拉纳西',
    wordCount: 923,
  },
];

const MOOD_COLORS: Record<string, string> = {
  '平静': '#6366F1',
  '感动': '#EC4899',
  '感悟': '#F59E0B',
  '宁静': '#22C55E',
  '震撼': '#EF4444',
};

export default function JournalsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_JOURNALS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>📖</Text>
            <Text style={styles.headerTitle}>朝圣日记</Text>
            <Text style={styles.headerSubtitle}>
              记录每一段修行与朝圣的感悟
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{MOCK_JOURNALS.length}</Text>
                <Text style={styles.statLabel}>篇日记</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {MOCK_JOURNALS.reduce((sum, j) => sum + j.wordCount, 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>总字数</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const moodColor = MOOD_COLORS[item.mood] || colors.gold;
          return (
            <Animated.View entering={FadeInDown.duration(300).delay(index * 80)}>
              <Pressable
                style={({ pressed }) => [
                  styles.journalCard,
                  pressed && styles.journalCardPressed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{item.moodEmoji}</Text>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardDate}>{item.date}</Text>
                      {item.siteName && (
                        <>
                          <Text style={styles.cardMetaDot}>·</Text>
                          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                          <Text style={styles.cardSite}>{item.siteName}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={[styles.moodTag, { backgroundColor: `${moodColor}20` }]}>
                    <Text style={[styles.moodText, { color: moodColor }]}>{item.mood}</Text>
                  </View>
                </View>

                <Text style={styles.cardExcerpt} numberOfLines={3}>
                  {item.excerpt}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardWordCount}>{item.wordCount} 字</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
      />

      {/* Floating write button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="create" size={24} color={colors.backgroundDark} />
        <Text style={styles.fabText}>写日记</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.gold,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  journalCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  journalCardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardDate: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  cardMetaDot: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  cardSite: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  moodTag: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  moodText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  cardExcerpt: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cardWordCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    backgroundColor: colors.goldDark,
    transform: [{ scale: 0.95 }],
  },
  fabText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
