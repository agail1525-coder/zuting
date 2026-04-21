import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import { BRAND_DOMAIN, BRAND_NAME_ZH } from '../src/constants/brand';

const FEATURES = [
  { icon: 'globe-outline' as const, label: '12大文化传统', desc: '佛教文化、道教文化、基督文化等全球文化传统' },
  { icon: 'location-outline' as const, label: '300+圣地', desc: '覆盖全球文化圣地与文化探访目的地' },
  { icon: 'business-outline' as const, label: '27祖庭', desc: '各文化传统重要祖庭完整档案' },
  { icon: 'people-outline' as const, label: '28祖师', desc: '各文化传统创始人与重要人物传记' },
  { icon: 'language-outline' as const, label: '7语言', desc: '中/英/日/韩/泰/印地/阿拉伯' },
  { icon: 'chatbubble-ellipses-outline' as const, label: '小鸿AI', desc: '智能问答助手，随时解答文化知识问题' },
];

const PLATFORM_STATS = [
  { value: '300+', label: '文化圣地' },
  { value: '27+', label: '历史祖庭' },
  { value: '12', label: '文化传统' },
  { value: '7', label: '支持语言' },
  { value: '5', label: '跨端平台' },
  { value: '10+', label: '精品路线' },
];

const TRUST_BADGES = [
  { icon: 'shield-checkmark-outline' as const, label: '官方认证', desc: '正规合规运营' },
  { icon: 'star-outline' as const, label: '精选内容', desc: '专家团队审核' },
  { icon: 'globe-outline' as const, label: '全球覆盖', desc: '7国语言支持' },
  { icon: 'heart-outline' as const, label: '用户至上', desc: '持续改善体验' },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo & Title */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="earth" size={56} color={colors.gold} />
        </View>
        <Text style={styles.title}>{BRAND_DOMAIN.toUpperCase()}</Text>
        <Text style={styles.subtitle}>{BRAND_NAME_ZH}</Text>
      </View>

      {/* Platform Stats Bar */}
      <View style={styles.statsBar}>
        {PLATFORM_STATS.map((stat, idx) => (
          <View key={idx} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Mission */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>我们的使命</Text>
        <Text style={styles.missionText}>
          帮助100万人走祖庭，建立全球文化和平使者网络。
        </Text>
        <Text style={styles.cardDesc}>
          JOINUS.COM 致力于成为全球文化旅行平台 NO.1，融合十大顶级旅行网站的全部优势功能，同时深耕文化垂直领域，为每一位旅行者提供沉浸式的文化之旅体验。
        </Text>
      </View>

      {/* Features */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>平台亮点</Text>
        {FEATURES.map((item, index) => (
          <View
            key={index}
            style={[
              styles.featureRow,
              index < FEATURES.length - 1 && styles.featureRowBorder,
            ]}
          >
            <View style={styles.featureIcon}>
              <Ionicons name={item.icon} size={22} color={colors.gold} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>{item.label}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Trust Badges */}
      <View style={styles.trustCard}>
        <Text style={styles.cardTitle}>品质保证</Text>
        <View style={styles.trustGrid}>
          {TRUST_BADGES.map((badge, idx) => (
            <View key={idx} style={styles.trustBadge}>
              <View style={styles.trustIconWrap}>
                <Ionicons name={badge.icon} size={24} color="#3264ff" />
              </View>
              <Text style={styles.trustLabel}>{badge.label}</Text>
              <Text style={styles.trustDesc}>{badge.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Core Values */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>核心价值观</Text>
        <View style={styles.valueGrid}>
          <ValueItem title="跨文明对话" desc="促进不同文化传统之间的理解与尊重" />
          <ValueItem title="和平使者" desc="通过旅行传播和平理念，连接世界" />
          <ValueItem title="数字传承" desc="用科技保存和传播珍贵的文化遗产" />
          <ValueItem title="沉浸体验" desc="视频、全景、音频导览，身临其境" />
        </View>
      </View>

      {/* Contact */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>联系我们</Text>
        <ContactRow label="邮箱" value="contact@zuting.com" />
        <ContactRow label="地址" value="广东省深圳市南山区" />
        <ContactRow label="服务时间" value="周一至周五 9:00-18:00" />
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <Text style={styles.ctaTitle}>开始你的文化之旅</Text>
        <Text style={styles.ctaSubtitle}>探索全球圣地，体验文化之美</Text>
        <View style={styles.ctaButtons}>
          <Pressable style={styles.ctaBtn} onPress={() => router.push('/holy-sites')}>
            <Ionicons name="location-outline" size={16} color="#FFFFFF" />
            <Text style={styles.ctaBtnText}>探索圣地</Text>
          </Pressable>
          <Pressable style={[styles.ctaBtn, styles.ctaBtnOutline]} onPress={() => router.push('/xiaohong' as any)}>
            <Ionicons name="chatbubble-outline" size={16} color="#D4A855" />
            <Text style={[styles.ctaBtnText, { color: '#D4A855' }]}>AI规划路线</Text>
          </Pressable>
        </View>
      </View>

      {/* Version */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>佳绩之旅 v0.2.0</Text>
        <Text style={styles.footerSubtext}>
          加入我们，探索世界
        </Text>
      </View>
    </ScrollView>
  );
}

function ValueItem({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.valueItem}>
      <Text style={styles.valueTitle}>{title}</Text>
      <Text style={styles.valueDesc}>{desc}</Text>
    </View>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.contactRow}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  statsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    marginBottom: spacing.md,
  },
  statItem: { width: '33.33%', alignItems: 'center', paddingVertical: 8 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#D4A855' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  card: {
    backgroundColor: colors.backgroundCardSolid,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: spacing.md,
  },
  cardDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  missionText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  featureDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },

  trustCard: {
    backgroundColor: colors.backgroundCardSolid,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trustBadge: {
    width: '47%',
    backgroundColor: '#F8FAFF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  trustIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  trustLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  trustDesc: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },

  valueGrid: {
    gap: spacing.sm,
  },
  valueItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  valueTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  valueDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  contactValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  bottomCTA: {
    marginTop: spacing.lg,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  ctaSubtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 8, textAlign: 'center' },
  ctaButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3264ff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4A855',
  },
  ctaBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },

  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  footerSubtext: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
});
