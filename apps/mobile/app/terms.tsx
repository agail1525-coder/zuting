import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

const SECTIONS = [
  {
    title: '一、服务说明',
    intro: '本平台致力于为用户提供全球宗教圣地旅行服务，包括但不限于：',
    items: [
      '十二大信仰的宗教文化知识展示与教育。',
      '全球60个宗教圣地的信息查询与导览。',
      '27个祖庭、28位祖师、39条祖训的详细介绍。',
      '曹溪愿命三十印的修行内容。',
      '小鸿AI智能助手，提供宗教文化知识问答。',
      '朝圣行程的创建、预订和管理。',
      '朝圣日志的记录与分享。',
      '订单管理与在线支付。',
    ],
  },
  {
    title: '二、用户注册',
    items: [
      '真实信息：您在注册时应提供真实、准确、完整的个人信息，并在信息变更时及时更新。',
      '账号安全：您应妥善保管您的账号和密码，因您保管不善导致的损失由您自行承担。如发现账号被盗用，请立即联系我们。',
      '年龄限制：您确认在注册时已年满16周岁。16周岁以下的未成年人不得注册或使用本平台。',
      '一人一号：每个用户仅可注册一个账号，不得将账号转让、出借给他人使用。',
    ],
  },
  {
    title: '三、用户行为规范',
    intro: '使用本平台时，您应遵守以下规范：',
    items: [
      '尊重宗教信仰：本平台涵盖多种宗教文化，请尊重各宗教信仰和传统，不得发布侮辱、歧视、攻击任何宗教或信仰的内容。',
      '禁止不当内容：不得发布违法、淫秽、暴力、恐怖、虚假信息或侵犯他人合法权益的内容。',
      '文明交流：在使用AI助手和社区功能时，请保持文明、友善的交流态度，促进跨宗教对话与理解。',
      '合法使用：不得利用本平台从事任何违反中华人民共和国法律法规的活动。',
      '禁止滥用：不得使用自动化工具、爬虫等方式批量访问平台，不得干扰平台正常运营。',
    ],
  },
  {
    title: '四、行程服务',
    items: [
      '预订条款：行程预订需经本平台确认后方可生效。我们将在收到预订后24小时内进行确认。',
      '取消政策：行程出发前7天（含）以上取消，全额退款；出发前3-6天取消，退还70%费用；出发前1-2天取消，退还50%费用；出发当天取消，不予退款。',
      '退款规则：退款将在确认后7-15个工作日内退回原支付账户。',
      '行程变更：因不可抗力（如天气、政策变化等）导致的行程变更，本平台将协助您调整行程或办理退款。',
      '行程状态：行程经历草稿、规划中、已提交、已确认、已支付、准备中、进行中、已完成、回顾中等状态，您可在行程详情页实时查看。',
    ],
  },
  {
    title: '五、支付条款',
    items: [
      '支付方式：本平台支持支付宝、微信支付等主流支付方式。',
      '价格说明：所有价格以人民币（CNY）为单位，均为含税价格。实际支付金额以订单确认页面显示为准。',
      '发票：您有权就支付金额申请开具发票。请在支付完成后30天内通过平台提交开票申请。',
      '支付安全：支付过程由第三方支付服务商提供安全保障，本平台不会存储您的支付密码。',
    ],
  },
  {
    title: '六、知识产权',
    items: [
      '本平台上展示的文字、图片、音频、视频、软件、数据及其他内容（除用户生成内容外），其知识产权归本平台或相关权利人所有。',
      '未经本平台书面许可，您不得以任何方式复制、转载、传播或以其他方式使用平台内容。',
      '您在本平台发布的朝圣日志等用户生成内容，著作权归您所有。但您同意授予本平台非独占的、免费的许可，用于平台内展示和推广。',
    ],
  },
  {
    title: '七、免责声明',
    items: [
      '旅行风险：朝圣旅行可能存在固有风险，包括但不限于交通、天气、健康等方面的风险。用户应自行评估旅行风险并采取适当的安全措施。本平台建议您出行前购买旅行保险。',
      '信息准确性：本平台尽力确保所提供的宗教文化信息的准确性，但不对其完整性、时效性作出保证。宗教教义和文化内容仅供参考。',
      '第三方服务：本平台可能包含第三方服务的链接或接入，我们不对第三方服务的内容、安全性和可用性承担责任。',
      'AI助手：小鸿AI助手提供的信息仅供参考，不构成专业的宗教、法律或医疗建议。',
      '不可抗力：因自然灾害、战争、政策变化、疫情等不可抗力导致的服务中断或损失，本平台不承担责任。',
    ],
  },
  {
    title: '八、争议解决',
    items: [
      '本协议的签订、履行、解释及争议解决均适用中华人民共和国法律（不含冲突法规则）。',
      '如双方就本协议内容或执行发生任何争议，应首先友好协商解决。',
      '协商不成的，任何一方均可将争议提交至深圳国际仲裁院按照其当时有效的仲裁规则进行仲裁。仲裁裁决为终局裁决，对双方均有约束力。',
    ],
  },
  {
    title: '九、条款修改',
    paragraphs: [
      '本平台有权根据需要不时修改本协议。修改后的协议将通过平台公告、推送通知或站内信等方式通知您。如果您在本协议修改后继续使用本平台服务，即表示您已接受修改后的协议。如您不同意修改后的协议，请停止使用本平台服务并注销账号。',
    ],
  },
  {
    title: '十、其他',
    items: [
      '本协议任何条款被认定为无效或不可执行的，不影响其余条款的效力。',
      '本平台未行使或延迟行使本协议项下的任何权利，不构成对该权利的放弃。',
      '本协议构成双方就使用本平台服务的完整协议，取代此前的任何口头或书面协议。',
    ],
  },
];

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>用户协议</Text>
        <Text style={styles.headerSubtitle}>Terms of Service</Text>
        <Text style={styles.headerDate}>生效日期：2026年3月25日</Text>
      </View>

      {/* Intro */}
      <View style={styles.card}>
        <Text style={styles.paragraph}>
          欢迎使用全球祖庭旅行平台（以下简称"本平台"）。本用户协议（以下简称"本协议"）是您与本平台运营方之间关于使用本平台各项服务的法律协议。请您在注册或使用本平台服务前，仔细阅读本协议的全部内容。如果您不同意本协议的任何条款，请勿注册或使用本平台。
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
        <Text style={styles.sectionTitle}>联系我们</Text>
        <View style={styles.contactBox}>
          <ContactRow label="平台名称" value="全球祖庭旅行平台" />
          <ContactRow label="电子邮箱" value="service@zuting.com" />
          <ContactRow label="办公地址" value="广东省深圳市南山区" />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>本用户协议自2026年3月25日起生效。</Text>
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
