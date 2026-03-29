import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

const SECTIONS = [
  {
    title: '一、信息收集',
    items: [
      '手机号码：用于账号注册、登录验证和安全通知。',
      '电子邮箱：用于接收行程确认、订单通知和平台公告（选填）。',
      '位置信息：用于推荐附近圣地、行程导航和地图功能。仅在您授权后收集，您可以随时关闭。',
      '设备信息：包括设备型号、操作系统版本、唯一设备标识符等，用于保障服务安全和优化体验。',
      '行程数据：您创建的行程信息、朝圣日志、浏览记录等，用于提供个性化服务。',
      '支付信息：订单金额、支付方式、交易记录等，用于完成支付处理。我们不会存储您的完整银行卡号或支付密码。',
      'AI对话记录：您与小鸿AI助手的对话内容，用于提供智能问答服务和改善AI体验。',
    ],
  },
  {
    title: '二、信息使用',
    items: [
      '提供核心服务：宗教文化内容浏览、圣地查询、祖庭信息展示。',
      '行程管理：创建、管理和跟踪您的朝圣行程，提供行程状态更新。',
      '支付处理：处理订单支付、退款及相关财务记录。',
      'AI助手服务：基于您的提问提供宗教文化知识问答和行程建议。',
      '数据分析：分析用户使用趋势以改善平台服务质量（数据经匿名化处理）。',
      '安全保障：防范欺诈、保护账号安全、处理投诉和纠纷。',
    ],
  },
  {
    title: '三、信息共享',
    items: [
      '支付服务商：为完成支付交易，我们需要与支付宝、微信支付等支付服务商共享必要的订单和交易信息。',
      '导游及服务方：在您确认行程后，我们将向导游提供必要的行程信息（不包括您的支付信息和完整手机号）。',
      '法律要求：根据适用的法律法规、法律程序、政府主管部门的强制性要求，我们可能需要披露您的个人信息。',
      '征得您的同意：在获得您明确同意的其他情况下。',
    ],
  },
  {
    title: '四、信息存储',
    items: [
      '存储地点：您的个人信息存储在中华人民共和国境内的服务器上。如需跨境传输，我们将依照法律法规要求征得您的单独同意。',
      '加密存储：我们采用业界标准的加密技术（如AES-256、TLS 1.3）对您的个人信息进行加密存储和传输。',
      '保留期限：我们仅在为实现目的所必需的期限内保留您的个人信息。账号注销后，我们将在30个工作日内删除或匿名化处理您的个人信息，法律法规另有规定的除外。',
      '交易记录：根据《电子商务法》要求，交易信息保存期限不少于三年。',
    ],
  },
  {
    title: '五、用户权利',
    intro: '根据《中华人民共和国个人信息保护法》（PIPL）第四十五条及相关规定，您享有以下权利：',
    items: [
      '查看权：您有权查看我们收集的您的个人信息，可通过"个人中心"页面查看。',
      '更正权：当您发现我们处理的个人信息有误时，您有权要求我们更正。',
      '删除权：在法律规定的情形下，您有权要求我们删除您的个人信息。',
      '数据可携带权：您有权请求我们将您的个人信息以结构化、通用格式导出。',
      '账号注销：您有权随时注销您的账号。注销后我们将停止提供服务并依法删除您的个人信息。',
      '撤回同意：您有权撤回此前给予的同意，撤回同意不影响撤回前基于同意的处理活动的效力。',
    ],
  },
  {
    title: '六、未成年人保护',
    paragraphs: [
      '本平台不面向16周岁以下的未成年人提供服务。如果您是16周岁以下的未成年人，请勿注册或使用本平台。若我们发现在未获得可证实的监护人同意的情况下收集了未成年人的个人信息，我们将尽快删除相关数据。',
    ],
  },
  {
    title: '七、隐私政策的变更',
    paragraphs: [
      '我们可能会适时修订本隐私政策。当政策发生重大变更时，我们将通过平台公告、推送通知或电子邮件等方式通知您。若您在隐私政策修订后继续使用我们的服务，即表示您同意受修订后的隐私政策约束。',
    ],
  },
];

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>隐私政策</Text>
        <Text style={styles.headerSubtitle}>Privacy Policy</Text>
        <Text style={styles.headerDate}>生效日期：2026年3月25日</Text>
      </View>

      {/* Intro */}
      <View style={styles.card}>
        <Text style={styles.paragraph}>
          全球祖庭旅行平台（以下简称"本平台"或"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
        </Text>
        <Text style={styles.paragraph}>
          本隐私政策适用于您通过本平台的网站、移动应用程序、微信小程序等渠道使用我们的服务。请您在使用我们的服务前，仔细阅读并了解本隐私政策。
        </Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.intro && (
            <Text style={styles.paragraph}>{section.intro}</Text>
          )}
          {section.paragraphs?.map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}
          {section.items?.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Contact */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>八、联系我们</Text>
        <Text style={styles.paragraph}>
          如果您对本隐私政策有任何疑问、意见或建议，或者您需要行使您的个人信息权利，请通过以下方式联系我们：
        </Text>
        <View style={styles.contactBox}>
          <ContactRow label="平台名称" value="全球祖庭旅行平台" />
          <ContactRow label="电子邮箱" value="privacy@zuting.com" />
          <ContactRow label="办公地址" value="广东省深圳市南山区" />
          <ContactRow label="响应时间" value="收到请求后15个工作日内答复" />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>本隐私政策自2026年3月25日起生效。</Text>
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
  },
  headerSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  headerDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingRight: spacing.sm,
  },
  bullet: {
    fontSize: fontSize.md,
    color: colors.gold,
    marginRight: spacing.sm,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  contactBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginTop: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  contactLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  contactValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
