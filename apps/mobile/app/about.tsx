import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

const FEATURES = [
  { icon: 'globe-outline' as const, label: '12大信仰', desc: '佛教、道教、基督教等全球宗教文化' },
  { icon: 'location-outline' as const, label: '60+圣地', desc: '覆盖全球宗教圣地与朝圣目的地' },
  { icon: 'business-outline' as const, label: '27祖庭', desc: '各信仰重要祖庭完整档案' },
  { icon: 'people-outline' as const, label: '28祖师', desc: '各信仰创始人与重要人物传记' },
  { icon: 'language-outline' as const, label: '7语言', desc: '中/英/日/韩/泰/印地/阿拉伯' },
  { icon: 'chatbubble-ellipses-outline' as const, label: '小鸿AI', desc: '智能问答助手，随时解答宗教文化问题' },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo & Title */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="earth" size={56} color={colors.gold} />
        </View>
        <Text style={styles.title}>JOINUS.COM</Text>
        <Text style={styles.subtitle}>全球祖庭之旅</Text>
      </View>

      {/* Mission */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>我们的使命</Text>
        <Text style={styles.missionText}>
          帮助100万人走祖庭，建立全球宗教文化和平使者网络。
        </Text>
        <Text style={styles.cardDesc}>
          JOINUS.COM 致力于成为全球宗教文化旅行平台 NO.1，融合十大顶级旅行网站的全部优势功能，同时深耕宗教文化垂直领域，为每一位旅行者提供沉浸式的朝圣体验。
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

      {/* Core Values */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>核心价值观</Text>
        <View style={styles.valueGrid}>
          <ValueItem title="跨文明对话" desc="促进不同宗教信仰之间的理解与尊重" />
          <ValueItem title="和平使者" desc="通过旅行传播和平理念，连接世界" />
          <ValueItem title="数字传承" desc="用科技保存和传播珍贵的宗教文化遗产" />
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

      {/* Version */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>全球祖庭旅行平台 v0.2.0</Text>
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
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
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
  card: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
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
