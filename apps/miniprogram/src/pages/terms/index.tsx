import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

const SECTIONS = [
  {
    title: '一、服务说明',
    paragraphs: [
      '祖庭之旅（JOINUS.COM）是一个全球宗教文化旅行服务平台，为用户提供圣地信息浏览、朝圣行程规划、路线预订、社区交流等服务。',
      '我们持续改进和优化服务内容，可能会新增、调整或停止部分功能，届时将提前通知用户。',
    ],
    items: [],
  },
  {
    title: '二、账户注册与管理',
    paragraphs: [
      '使用祖庭之旅的部分功能需要注册账户，您在注册时应当：',
    ],
    items: [
      '1. 提供真实、准确、完整的个人信息',
      '2. 妥善保管账户和密码，对账户下的所有行为负责',
      '3. 不得转让、借用或共享账户给他人使用',
      '4. 发现账户异常应立即联系我们',
    ],
  },
  {
    title: '三、用户行为规范',
    paragraphs: [
      '使用祖庭之旅服务时，您应遵守以下行为规范：',
    ],
    items: [
      '1. 遵守中华人民共和国法律法规及相关国际条约',
      '2. 尊重各宗教信仰和文化传统，不发布亵渎性内容',
      '3. 不发布虚假、误导性或侵犯他人权益的信息',
      '4. 不干扰平台正常运营或其他用户正常使用',
      '5. 不利用平台从事任何违法违规活动',
      '6. 尊重其他用户的隐私和个人信息',
    ],
  },
  {
    title: '四、内容发布',
    paragraphs: [
      '您在平台上发布的朝圣日志、评价、攻略、照片等内容（统称"用户内容"），应符合以下要求：',
    ],
    items: [
      '1. 内容真实、客观，不含虚假或误导性信息',
      '2. 不侵犯任何第三方的知识产权、肖像权等合法权益',
      '3. 不包含违法、淫秽、暴力、歧视性内容',
      '4. 尊重宗教文化，不发布伤害宗教感情的内容',
    ],
  },
  {
    title: '五、预订与支付',
    paragraphs: [
      '通过祖庭之旅预订路线和服务时：',
    ],
    items: [
      '1. 请仔细阅读路线详情、价格、退改政策等信息',
      '2. 预订成功后请按时参加，如需变更请提前联系',
      '3. 支付完成后，如需退款将按照退改政策执行',
      '4. 因不可抗力导致行程取消，我们将协助处理退款',
    ],
  },
  {
    title: '六、知识产权',
    paragraphs: [
      '祖庭之旅平台上的所有内容，包括但不限于文字、图片、音频、视频、软件、数据等，其知识产权归JOINUS.COM或相关权利人所有。',
      '您发布的用户内容，您保留原始权利，同时授予我们在平台展示和推广的非独占性许可。',
    ],
    items: [],
  },
  {
    title: '七、免责声明',
    paragraphs: [
      '在法律允许的范围内：',
    ],
    items: [
      '1. 平台提供的宗教文化信息仅供参考，不构成宗教指导',
      '2. 我们不对第三方商家提供的服务质量承担直接责任',
      '3. 因网络、设备等原因导致的服务中断，我们将尽力恢复',
      '4. 用户之间的纠纷应自行协商解决，平台可协助调解',
    ],
  },
  {
    title: '八、条款变更',
    paragraphs: [
      '我们保留随时修改本服务条款的权利。条款变更后，我们将通过应用内公告等方式通知用户。如您继续使用祖庭之旅的服务，即表示同意接受修改后的条款。',
    ],
    items: [],
  },
  {
    title: '九、争议解决',
    paragraphs: [
      '本条款的解释和执行适用中华人民共和国法律。如因本条款或使用服务引发争议，双方应友好协商解决；协商不成的，应提交有管辖权的人民法院诉讼解决。',
    ],
    items: [],
  },
  {
    title: '十、联系方式',
    paragraphs: [
      '如您对本服务条款有任何疑问，请通过以下方式联系我们：',
      '邮箱：support@joinus.com',
      '我们将竭诚为您服务。',
    ],
    items: [],
  },
]

export default function TermsPage() {
  return (
    <ScrollView className='terms-page' scrollY enhanced showScrollbar={false}>
      {/* Header */}
      <View className='terms-card'>
        <Text className='terms-card__update'>最后更新日期：2026年3月1日</Text>
        <Text className='terms-card__intro'>
          欢迎使用祖庭之旅（JOINUS.COM）全球祖庭旅行平台。在使用我们的服务之前，请您仔细阅读并理解以下服务条款。使用我们的服务即表示您同意遵守本条款。
        </Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} className='terms-section'>
          <Text className='terms-section__title'>{section.title}</Text>
          {section.paragraphs.map((p, i) => (
            <Text key={i} className='terms-section__text'>{p}</Text>
          ))}
          {section.items.map((item, i) => (
            <Text key={i} className='terms-section__item'>{item}</Text>
          ))}
        </View>
      ))}

      {/* Footer */}
      <View className='terms-footer'>
        <Text className='terms-footer__text'>JOINUS.COM 全球祖庭旅行平台</Text>
      </View>
    </ScrollView>
  )
}
