import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  fetchPkbOverview,
  updatePkbVows,
  submitPkbStruggle,
  fetchPkbEntriesMobile,
  type PkbOverviewMobile,
  type PkbEntryMobile,
  type PkbCategory,
} from '../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

type Tab = 'vows' | 'struggle' | 'journal';

const CATEGORY_LABEL: Record<PkbCategory, string> = {
  PERSONAL: '个人',
  FAMILY: '家庭',
  CAREER: '事业',
  DAILY_STRUGGLE: '当下烦恼',
  GENERAL: '通用',
};

export default function PkbScreen() {
  const [tab, setTab] = useState<Tab>('vows');
  const [overview, setOverview] = useState<PkbOverviewMobile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPkbOverview();
      setOverview(data);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (err || !overview) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>{err ?? '加载失败'}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: '修行库' }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.title}>修行库</Text>
        <Text style={styles.subtitle}>三生愿景 · 小鸿引经据典 · 修行日志</Text>

        <View style={styles.statsRow}>
          <StatCell label="条目" value={String(overview.pkb.entryCount)} />
          <StatCell label="洞见" value={String(overview.pkb.insightCount)} />
          <StatCell label="十牛图" value={`${overview.pkb.currentOxStage}/10`} />
        </View>

        <View style={styles.tabBar}>
          {(
            [
              ['vows', '愿景'],
              ['struggle', '当下烦恼'],
              ['journal', '日志'],
            ] as const
          ).map(([k, label]) => (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={[styles.tab, tab === k && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'vows' && <VowsSection overview={overview} onSaved={refresh} />}
        {tab === 'struggle' && <StruggleSection onSubmitted={refresh} />}
        {tab === 'journal' && <JournalSection />}
      </ScrollView>
    </>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function VowsSection({ overview, onSaved }: { overview: PkbOverviewMobile; onSaved: () => void }) {
  const [personal, setPersonal] = useState(overview.pkb.personalVow ?? '');
  const [family, setFamily] = useState(overview.pkb.familyVow ?? '');
  const [career, setCareer] = useState(overview.pkb.careerVow ?? '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await updatePkbVows({ personalVow: personal, familyVow: family, careerVow: career });
      onSaved();
    } catch (e) {
      Alert.alert('提示', e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      {([
        ['🧘 个人圆满', personal, setPersonal, '我想成为怎样的人？'],
        ['👨‍👩‍👧 家庭幸福', family, setFamily, '我想给家人怎样的生活？'],
        ['🏢 事业兴旺', career, setCareer, '我想为众生创造什么价值？'],
      ] as const).map(([label, value, setter, placeholder]) => (
        <View key={label} style={styles.card}>
          <Text style={styles.cardTitle}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={setter}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.textArea}
          />
        </View>
      ))}
      <Pressable style={styles.primaryBtn} onPress={onSave} disabled={saving}>
        <Text style={styles.primaryBtnText}>{saving ? '保存中…' : '保存三生愿景'}</Text>
      </Pressable>

      {overview.activeRecs.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>小鸿为你挑选的经论</Text>
          {overview.activeRecs.slice(0, 5).map((r) => (
            <View key={r.id} style={styles.recItem}>
              <Text style={styles.recCategory}>{CATEGORY_LABEL[r.category]}</Text>
              <Text style={styles.recTitle}>{r.title}</Text>
              <Text style={styles.recReason}>{r.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function StruggleSection({ onSubmitted }: { onSubmitted: () => void }) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<PkbCategory>('DAILY_STRUGGLE');
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState<{
    text: string;
    dailyPractice: string;
    cited: Array<{ title: string; tradition: string | null }>;
  } | null>(null);

  const onSend = async () => {
    if (message.trim().length < 5) {
      Alert.alert('提示', '请详细描述你的烦恼');
      return;
    }
    setSending(true);
    try {
      const res = await submitPkbStruggle({ message, category });
      setReply({
        text: res.reply,
        dailyPractice: res.dailyPractice,
        cited: res.citedScriptures.map((c) => ({ title: c.title, tradition: c.tradition })),
      });
      onSubmitted();
    } catch (e) {
      Alert.alert('提示', e instanceof Error ? e.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>告诉小鸿你的困惑</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="最近困扰你的事情…"
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.textArea}
        />
        <View style={styles.chipRow}>
          {(['DAILY_STRUGGLE', 'PERSONAL', 'FAMILY', 'CAREER'] as PkbCategory[]).map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {CATEGORY_LABEL[c]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.primaryBtn} onPress={onSend} disabled={sending}>
          <Text style={styles.primaryBtnText}>{sending ? '小鸿思考中…' : '送给小鸿 · 引经据典回应'}</Text>
        </Pressable>
      </View>

      {reply && (
        <View style={styles.replyCard}>
          <Text style={styles.replyTitle}>🙏 小鸿的回应</Text>
          <Text style={styles.replyText}>{reply.text}</Text>
          {reply.dailyPractice ? (
            <View style={styles.practiceBox}>
              <Text style={styles.practiceLabel}>📿 今日功课</Text>
              <Text style={styles.practiceText}>{reply.dailyPractice}</Text>
            </View>
          ) : null}
          {reply.cited.map((c, i) => (
            <Text key={i} style={styles.citation}>
              📖 《{c.title}》{c.tradition ? ` · ${c.tradition}` : ''}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function JournalSection() {
  const [items, setItems] = useState<PkbEntryMobile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPkbEntriesMobile()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />;
  if (items.length === 0) {
    return <Text style={styles.emptyText}>暂无修行条目，去「当下烦恼」开始第一次对话</Text>;
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((e) => (
        <View key={e.id} style={styles.card}>
          <Text style={styles.entryCategory}>{CATEGORY_LABEL[e.category]}</Text>
          <Text style={styles.entryTitle}>{e.title}</Text>
          <Text style={styles.entryContent} numberOfLines={4}>
            {e.content}
          </Text>
          {e.mood && <Text style={styles.entryMood}>心境: {e.mood}</Text>}
          <Text style={styles.entryDate}>{new Date(e.createdAt).toLocaleDateString()}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  errText: { color: colors.error, fontSize: fontSize.md },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 'bold', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCell: { flex: 1, backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.md, padding: spacing.sm },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  statValue: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 'bold', marginTop: 2 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  tab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.gold },
  tabText: { color: colors.textMuted, fontSize: fontSize.sm },
  tabTextActive: { color: colors.gold, fontWeight: 'bold' },
  card: { backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 'bold', marginBottom: spacing.sm },
  textArea: { color: colors.textPrimary, backgroundColor: colors.background, borderRadius: borderRadius.sm, padding: spacing.sm, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  primaryBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: 'bold' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  replyCard: { backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.gold + '40' },
  replyTitle: { color: colors.gold, fontSize: fontSize.sm, fontWeight: 'bold', marginBottom: spacing.sm },
  replyText: { color: colors.textPrimary, fontSize: fontSize.sm, lineHeight: 22 },
  practiceBox: { backgroundColor: colors.background, borderRadius: borderRadius.sm, padding: spacing.sm, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.gold + '50' },
  practiceLabel: { color: colors.gold, fontSize: fontSize.xs, marginBottom: 2 },
  practiceText: { color: colors.textPrimary, fontSize: fontSize.sm },
  citation: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs },
  recItem: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  recCategory: { color: colors.textMuted, fontSize: fontSize.xs },
  recTitle: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: 'bold', marginTop: 2 },
  recReason: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  entryCategory: { color: colors.gold, fontSize: fontSize.xs },
  entryTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 'bold', marginTop: 2 },
  entryContent: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  entryMood: { color: colors.gold, fontSize: fontSize.xs, marginTop: spacing.xs },
  entryDate: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs, textAlign: 'right' },
});
