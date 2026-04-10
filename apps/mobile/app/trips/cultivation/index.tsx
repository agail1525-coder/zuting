import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../../src/lib/theme';
import { api, type CompassResponse } from '../../../src/lib/api';
import { useAuth } from '../../../src/lib/auth-context';

const REALM_LABEL: Record<string, string> = {
  AWAKENING: '初觉',
  CLARIFYING: '明心',
  SEEING: '见性',
  ATTAINING: '证道',
  INTEGRATING: '融通',
  RETURNING: '归源',
  GIVING_BACK: '布施',
};

const AXIS_SCREENS: {
  route: string;
  label: string;
  icon: string;
  desc: string;
  iosIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { route: '/trips/cultivation/ox-path', label: '十牛图', icon: '🐂', desc: '十阶进度', iosIcon: 'trail-sign' },
  { route: '/trips/cultivation/daily-seal', label: '每日印', icon: '🪷', desc: '晨晚课', iosIcon: 'flower' },
  { route: '/trips/cultivation/three-lives', label: '三生愿景', icon: '🏠', desc: '个人/家庭/事业', iosIcon: 'home' },
];

export default function CultivationCompassScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<CompassResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .getCompass()
      .then(setData)
      .catch(() => router.replace('/trips/cultivation/apply' as any))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4A855" />
      </View>
    );
  }
  if (!data) return null;

  const { journey, currentSymbol, todaySteps, streakDays } = data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 36 }}>☸</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.realmLabel}>
              当前境界 · {journey.primaryTradition}
            </Text>
            <Text style={styles.realm}>
              {REALM_LABEL[journey.currentRealm] || journey.currentRealm}
            </Text>
            <Text style={styles.heroMeta}>
              十牛图 第 {journey.oxStage} 阶 · 连击 {streakDays} 天 · {journey.karmaPoints} 因缘点
            </Text>
          </View>
        </View>

        {currentSymbol && (
          <View style={styles.symbolCard}>
            <Text style={styles.symbolName}>{currentSymbol.symbolName}</Text>
            <Text style={styles.symbolText}>{currentSymbol.originalText}</Text>
            <Text style={styles.symbolSource}>— {currentSymbol.source}</Text>
          </View>
        )}
      </View>

      {/* Today steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日修行</Text>
        {todaySteps.map((step) => (
          <View
            key={step.id}
            style={[styles.stepCard, step.completed && styles.stepDone]}
          >
            <View style={[styles.stepIcon, step.completed && { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
              <Text style={{ color: step.completed ? '#22C55E' : '#D4A855', fontSize: 14 }}>
                {step.completed ? '✓' : '○'}
              </Text>
            </View>
            <Text style={styles.stepText}>{step.title}</Text>
            <Text style={styles.stepKind}>{step.kind}</Text>
          </View>
        ))}
      </View>

      {/* Quick nav */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>修行轴</Text>
        {AXIS_SCREENS.map((ax) => (
          <Pressable
            key={ax.route}
            style={styles.axisCard}
            onPress={() => router.push(ax.route as any)}
          >
            <Text style={{ fontSize: 24 }}>{ax.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.axisLabel}>{ax.label}</Text>
              <Text style={styles.axisDesc}>{ax.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(212,168,85,0.4)" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0a06' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0a06' },
  hero: {
    margin: spacing.lg,
    marginTop: 20,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(120,85,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(212,168,85,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  realmLabel: { color: 'rgba(212,168,85,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  realm: { color: '#D4A855', fontSize: 24, fontWeight: '700', marginVertical: 2 },
  heroMeta: { color: 'rgba(212,168,85,0.5)', fontSize: 12 },
  symbolCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(120,85,40,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.2)',
  },
  symbolName: { color: '#D4A855', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  symbolText: { color: 'rgba(212,168,85,0.7)', fontSize: 13, lineHeight: 20 },
  symbolSource: { color: 'rgba(212,168,85,0.3)', fontSize: 11, marginTop: 6 },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { color: '#D4A855', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(120,85,40,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.2)',
    marginBottom: 8,
  },
  stepDone: { borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(34,197,94,0.05)' },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(120,85,40,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: { flex: 1, color: '#D4A855', fontSize: 14 },
  stepKind: { color: 'rgba(212,168,85,0.3)', fontSize: 11 },
  axisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(120,85,40,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.2)',
    marginBottom: 8,
  },
  axisLabel: { color: '#D4A855', fontWeight: '600', fontSize: 15 },
  axisDesc: { color: 'rgba(212,168,85,0.4)', fontSize: 12, marginTop: 2 },
});
