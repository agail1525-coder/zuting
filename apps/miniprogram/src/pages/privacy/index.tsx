import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

const SECTIONS = [
  {
    title: '一、信息收集',
    paragraphs: [
      '我们在您使用祖庭之旅服务时，可能会收集以下信息：',
    ],
    items: [
      '1. 账户信息：手机号码、昵称、头像等注册信息',
      '2. 位置信息：当您使用地图和导航功能时，我们可能获取您的地理位置',
      '3. 行程信息：您创建的朝圣行程、收藏的圣地、撰写的日志和评价',
      '4. 设备信息：设备型号、操作系统版本、唯一设备标识符',
      '5. 日志信息：访问时间、浏览页面、搜索记录等使用数据',
    ],
  },
  {
    title: '二、信息使用',
    paragraphs: [
      '我们收集的信息将用于以下目的：',
    ],
    items: [
      '1. 提供和改进祖庭之旅的核心服务功能',
      '2. 为您推荐个性化的朝圣路线和圣地内容',
      '3. 发送行程提醒、订单通知等服务消息',
      '4. 进行数据分析，优化用户体验',
      '5. 保障账户安全，防止欺诈行为',
    ],
  },
  {
    title: '三、信息共享',
    paragraphs: [
      '我们不会将您的个人信息出售给任何第三方。在以下情况下，我们可能共享您的信息：',
    ],
    items: [
      '1. 获得您的明确授权同意',
      '2. 根据法律法规要求或政府主管部门的强制性要求',
      '3. 与合作商家共享必要的订单信息以完成服务交付',
      '4. 在匿名化处理后用于统计分析和学术研究',
    ],
  },
  {
    title: '四、信息存储与保护',
    paragraphs: [
      '我们采用行业标准的安全措施保护您的个人信息，包括数据加密传输、访问权限控制、安全审计等技术手段。',
      '您的个人信息将存储在中国境内的安全服务器上。如需跨境传输，我们会遵循相关法律法规的要求。',
    ],
    items: [],
  },
  {
    title: '五、您的权利',
    paragraphs: [
      '您享有以下权利：',
    ],
    items: [
      '1. 访问和更正您的个人信息',
      '2. 删除您的账户和相关数据',
      '3. 撤回授权同意',
      '4. 注销账户',
      '5. 获取个人信息副本',
    ],
  },
  {
    title: '六、未成年人保护',
    paragraphs: [
      '我们非常重视对未成年人个人信息的保护。如果您是未满14周岁的未成年人，请在您的监护人指导下使用我们的服务，并由监护人代为提供个人信息。',
    ],
    items: [],
  },
  {
    title: '七、政策更新',
    paragraphs: [
      '我们可能会不时更新本隐私政策。重大变更时，我们会通过应用内通知或其他合理方式告知您。继续使用我们的服务即表示您同意更新后的政策。',
    ],
    items: [],
  },
  {
    title: '八、联系我们',
    paragraphs: [
      '如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：',
      '邮箱：privacy@joinus.com',
      '我们将在15个工作日内回复您的请求。',
    ],
    items: [],
  },
]

export default function PrivacyPage() {
  return (
    <ScrollView className='privacy-page' scrollY enhanced showScrollbar={false}>
      {/* Header */}
      <View className='policy-card'>
        <Text className='policy-card__update'>最后更新日期：2026年3月1日</Text>
        <Text className='policy-card__intro'>
          欢迎使用祖庭之旅（JOINUS.COM）。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。本隐私政策适用于祖庭之旅提供的所有服务，请您仔细阅读。
        </Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} className='policy-section'>
          <Text className='policy-section__title'>{section.title}</Text>
          {section.paragraphs.map((p, i) => (
            <Text key={i} className='policy-section__text'>{p}</Text>
          ))}
          {section.items.map((item, i) => (
            <Text key={i} className='policy-section__item'>{item}</Text>
          ))}
        </View>
      ))}

      {/* Footer */}
      <View className='policy-footer'>
        <Text className='policy-footer__text'>JOINUS.COM 全球祖庭旅行平台</Text>
      </View>
    </ScrollView>
  )
}
