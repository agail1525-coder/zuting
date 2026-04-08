/**
 * seed-faith-assessment.ts — 信仰力评估题库 60题 (20概念 × 3模式)
 * 独立执行: npx tsx prisma/seed-faith-assessment.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionConcept {
  dimension: string;
  sortOrder: number;
  modes: Record<string, { questionText: string; options: any[] }>;
}

const QUESTIONS: QuestionConcept[] = [
  // ═══════════════════════════════════════════════════════════
  // 觉察力 AWARENESS — Q1~Q4
  // ═══════════════════════════════════════════════════════════

  // Q1: 突发压力下的觉察
  {
    dimension: 'AWARENESS',
    sortOrder: 1,
    modes: {
      PERSONAL: {
        questionText: '当您的创业项目遭遇突然的市场变化时，您的第一反应是？',
        options: [
          { key: 'A', text: '先暂停，深呼吸，冷静观察全局再行动', score: 25, crossScores: { RESILIENCE: 3 } },
          { key: 'B', text: '感到焦虑但很快开始分析原因和对策', score: 18, crossScores: { VISION: 2 } },
          { key: 'C', text: '本能地立即行动，边做边调整方向', score: 10 },
          { key: 'D', text: '感到不知所措，需要较长时间消化情绪', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当家庭中出现意料之外的矛盾时，您通常的第一反应是？',
        options: [
          { key: 'A', text: '先让自己冷静下来，观察每个人的真实感受', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '虽然心里不舒服，但能很快理性面对', score: 18, crossScores: { RESILIENCE: 2 } },
          { key: 'C', text: '急于表达自己的看法，希望快速解决', score: 10 },
          { key: 'D', text: '选择回避，等大家都冷静了再说', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当公司面临突发市场危机时，您作为领导者的第一反应是？',
        options: [
          { key: 'A', text: '迅速冷静下来，全面评估局势后召集核心团队', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '紧张但能快速进入工作状态，开始制定应对方案', score: 18, crossScores: { RESILIENCE: 2 } },
          { key: 'C', text: '立即发布指令，要求团队全力应对', score: 10 },
          { key: 'D', text: '感到压力巨大，需要时间才能做出决策', score: 3 },
        ],
      },
    },
  },

  // Q2: 情绪模式觉察
  {
    dimension: 'AWARENESS',
    sortOrder: 2,
    modes: {
      PERSONAL: {
        questionText: '回顾过去一年，您对自己的情绪模式(什么情境下容易焦虑/愤怒/低落)了解多少？',
        options: [
          { key: 'A', text: '非常清楚，我定期反思并记录自己的情绪触发点', score: 25, crossScores: { LEGACY: 2 } },
          { key: 'B', text: '大致了解，有几个明确的情绪触发场景', score: 18 },
          { key: 'C', text: '偶尔意识到，但没有系统梳理过', score: 10 },
          { key: 'D', text: '很少关注，情绪来了就来了', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '您是否了解家庭中每位成员的情绪触发点和需求模式？',
        options: [
          { key: 'A', text: '非常了解，我能提前感知到家人情绪的变化', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '了解主要家人的，但可能忽略了一些细节', score: 18 },
          { key: 'C', text: '了解一部分，但常常被家人的反应所惊讶', score: 10 },
          { key: 'D', text: '坦白说，不太关注这些', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您是否了解团队成员在压力下的不同反应模式和需求？',
        options: [
          { key: 'A', text: '深入了解，我会根据每个人的特点调整沟通方式', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '了解核心成员的，但对基层员工关注不够', score: 18 },
          { key: 'C', text: '更关注工作结果，较少关注成员的情绪状态', score: 10 },
          { key: 'D', text: '认为工作就是工作，情绪管理是个人的事', score: 3 },
        ],
      },
    },
  },

  // Q3: 当下专注力
  {
    dimension: 'AWARENESS',
    sortOrder: 3,
    modes: {
      PERSONAL: {
        questionText: '在重要会议或谈判中，您能保持多久的全神贯注？',
        options: [
          { key: 'A', text: '整个过程都能高度专注，甚至能捕捉到对方微妙的表情变化', score: 25, crossScores: { CONNECTION: 2 } },
          { key: 'B', text: '大部分时间专注，偶尔会走神但能快速拉回', score: 18 },
          { key: 'C', text: '经常同时想其他事情，但不影响基本交流', score: 10 },
          { key: 'D', text: '很难长时间集中注意力，经常需要看手机', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当家人向您倾诉烦恼时，您能做到全身心倾听吗？',
        options: [
          { key: 'A', text: '放下一切，认真倾听并感受对方的情绪', score: 25, crossScores: { CONNECTION: 4 } },
          { key: 'B', text: '尽量专注，但偶尔会忍不住想给建议', score: 18 },
          { key: 'C', text: '一边听一边做其他事，但基本能跟上内容', score: 10 },
          { key: 'D', text: '坦白说，经常心不在焉或者急于结束话题', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '在长时间的战略研讨会中，您的专注度如何？',
        options: [
          { key: 'A', text: '全程投入，能够跟踪每个人的观点并发现深层关联', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '关键议题很专注，常规环节适度放松', score: 18 },
          { key: 'C', text: '经常同时处理手机消息，选择性参与讨论', score: 10 },
          { key: 'D', text: '超过一小时就很难集中，更希望看会议纪要', score: 3 },
        ],
      },
    },
  },

  // Q4: 自我反思深度
  {
    dimension: 'AWARENESS',
    sortOrder: 4,
    modes: {
      PERSONAL: {
        questionText: '您多久进行一次深度的自我反思(不是随意想想，而是认真审视自己的行为和动机)？',
        options: [
          { key: 'A', text: '每天都有固定的反思时间，已经成为习惯', score: 25, crossScores: { RESILIENCE: 2, LEGACY: 2 } },
          { key: 'B', text: '每周至少一次，通常在周末安静时', score: 18 },
          { key: 'C', text: '遇到大事或挫折时会反思', score: 10 },
          { key: 'D', text: '很少刻意反思，觉得向前看更重要', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '您多久会认真反思自己在家庭关系中的角色和表现？',
        options: [
          { key: 'A', text: '经常反思，并且会主动和家人沟通改进', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '偶尔反思，尤其是发生冲突之后', score: 18 },
          { key: 'C', text: '很少反思，觉得自己做得已经不错了', score: 10 },
          { key: 'D', text: '更多是思考家人应该如何改变', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您多久会系统性地反思自己的领导方式和决策质量？',
        options: [
          { key: 'A', text: '有定期复盘机制，包括征求团队的真实反馈', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '季度或年度会做复盘，主要看业绩指标', score: 18 },
          { key: 'C', text: '出了问题才会反思，顺利时不太关注', score: 10 },
          { key: 'D', text: '更关注外部市场变化，较少审视自身领导力', score: 3 },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // 定力 RESILIENCE — Q5~Q8
  // ═══════════════════════════════════════════════════════════

  // Q5: 挫折恢复速度
  {
    dimension: 'RESILIENCE',
    sortOrder: 5,
    modes: {
      PERSONAL: {
        questionText: '当一个您投入巨大心血的项目失败时，您通常需要多长时间恢复状态？',
        options: [
          { key: 'A', text: '虽然痛苦，但24小时内就能提炼教训并开始下一步', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '大约一周左右，给自己一些消化的时间', score: 18 },
          { key: 'C', text: '可能需要一个月，期间很难启动新事情', score: 10 },
          { key: 'D', text: '很长时间都走不出来，反复纠结于失败的原因', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当家庭遭遇重大变故(如亲人生病、经济困难)时，您的状态恢复能力如何？',
        options: [
          { key: 'A', text: '悲伤但不崩溃，能快速成为家人的支柱', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '需要一段时间调整，但最终能承担起责任', score: 18 },
          { key: 'C', text: '自己也很脆弱，需要别人来支撑', score: 10 },
          { key: 'D', text: '容易陷入无助感，长时间无法正常面对', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当公司经历重大挫折(关键客户流失、融资失败)时，您能多快带领团队重新振作？',
        options: [
          { key: 'A', text: '当天就能稳定军心，一周内拿出新方案', score: 25, crossScores: { VISION: 2, CONNECTION: 2 } },
          { key: 'B', text: '先给团队缓冲期，两周内重新组织进攻', score: 18 },
          { key: 'C', text: '自己需要先消化，团队可能出现一段混乱期', score: 10 },
          { key: 'D', text: '挫折对团队士气打击很大，恢复很慢', score: 3 },
        ],
      },
    },
  },

  // Q6: 混乱中保持冷静
  {
    dimension: 'RESILIENCE',
    sortOrder: 6,
    modes: {
      PERSONAL: {
        questionText: '当同时面对多个紧急问题(资金、团队、客户)时，您的内心状态如何？',
        options: [
          { key: 'A', text: '内心平静，能清晰地排列优先级逐个击破', score: 25, crossScores: { AWARENESS: 3 } },
          { key: 'B', text: '有些紧张，但能保持基本的条理性', score: 18 },
          { key: 'C', text: '心跳加速，思维容易混乱，但最终能应付', score: 10 },
          { key: 'D', text: '感觉要被淹没了，很难理清头绪', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当家庭中多个问题同时爆发(孩子学业、老人健康、夫妻分歧)时，您的状态如何？',
        options: [
          { key: 'A', text: '虽然辛苦但能保持冷静，一件一件处理', score: 25, crossScores: { AWARENESS: 2 } },
          { key: 'B', text: '会觉得疲惫，但能抓住最重要的先解决', score: 18 },
          { key: 'C', text: '容易烦躁，对家人发脾气后又后悔', score: 10 },
          { key: 'D', text: '感觉快要崩溃，想逃离一切', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当公司同时面对内部团队危机和外部竞争压力时，您能保持怎样的状态？',
        options: [
          { key: 'A', text: '越是混乱越冷静，能在复杂局面中找到突破口', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '保持表面冷静，虽然内心有压力但不影响决策', score: 18 },
          { key: 'C', text: '会把焦虑带到工作中，决策质量可能下降', score: 10 },
          { key: 'D', text: '感觉四面楚歌，很难保持清晰思考', score: 3 },
        ],
      },
    },
  },

  // Q7: 长期压力下的坚持
  {
    dimension: 'RESILIENCE',
    sortOrder: 7,
    modes: {
      PERSONAL: {
        questionText: '面对一个需要3-5年才能看到成果的长期目标，您的坚持程度如何？',
        options: [
          { key: 'A', text: '坚定不移，享受过程中的每一步积累', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '大方向不变，但会根据情况调整节奏', score: 18, crossScores: { VISION: 2 } },
          { key: 'C', text: '如果1-2年没明显进展，可能会动摇', score: 10 },
          { key: 'D', text: '很难坚持看不到短期回报的事情', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '建设一个温暖的家庭需要长期持续投入，您的持久力如何？',
        options: [
          { key: 'A', text: '家庭是一生的功课，我每天都在用心经营', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '大多数时候能坚持，偶尔工作忙会忽略', score: 18 },
          { key: 'C', text: '有激情时投入很多，低落时容易疏忽', score: 10 },
          { key: 'D', text: '坦白说，经常觉得已经尽力了，不想再多做', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当企业转型需要2-3年持续投入且短期可能亏损时，您能坚持吗？',
        options: [
          { key: 'A', text: '只要战略方向正确，坚定执行并鼓舞团队信心', score: 25, crossScores: { LEGACY: 2, VISION: 2 } },
          { key: 'B', text: '能坚持，但会设置阶段性里程碑来验证方向', score: 18 },
          { key: 'C', text: '如果超过一年没起色，可能会考虑放弃', score: 10 },
          { key: 'D', text: '很难承受长期亏损的压力，倾向于快速见效的策略', score: 3 },
        ],
      },
    },
  },

  // Q8: 面对缓慢进展的耐心
  {
    dimension: 'RESILIENCE',
    sortOrder: 8,
    modes: {
      PERSONAL: {
        questionText: '当个人成长(如学一门新技能)进展缓慢时，您的态度是？',
        options: [
          { key: 'A', text: '相信积累的力量，每天进步一点就是成功', score: 25, crossScores: { AWARENESS: 2 } },
          { key: 'B', text: '会寻找更高效的方法，但不会轻易放弃', score: 18, crossScores: { VISION: 2 } },
          { key: 'C', text: '容易失去耐心，会怀疑自己是否适合', score: 10 },
          { key: 'D', text: '进展慢就换一个方向，不想浪费时间', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当改善家庭关系(如和青春期孩子沟通)进展很慢时，您的态度是？',
        options: [
          { key: 'A', text: '有耐心地持续尝试，相信爱的力量终会打通', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '有些着急，但知道关系修复需要时间', score: 18 },
          { key: 'C', text: '容易感到挫败，有时候会放弃努力', score: 10 },
          { key: 'D', text: '觉得对方不配合就没办法，等他自己想通吧', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当组织文化变革推进缓慢，员工抵触情绪明显时，您如何应对？',
        options: [
          { key: 'A', text: '理解变革的难度，以身作则持续推动并倾听反馈', score: 25, crossScores: { CONNECTION: 2, LEGACY: 2 } },
          { key: 'B', text: '调整推进节奏，找到关键影响者先行突破', score: 18, crossScores: { VISION: 2 } },
          { key: 'C', text: '有些沮丧，考虑是否要强制推行', score: 10 },
          { key: 'D', text: '阻力太大就搁置，等时机更成熟再说', score: 3 },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // 格局力 VISION — Q9~Q12
  // ═══════════════════════════════════════════════════════════

  // Q9: 长期vs短期思维
  {
    dimension: 'VISION',
    sortOrder: 9,
    modes: {
      PERSONAL: {
        questionText: '做一个重大决策时，您主要考虑的时间跨度是？',
        options: [
          { key: 'A', text: '10年以上的影响，站在人生终局来思考当下', score: 25, crossScores: { LEGACY: 4 } },
          { key: 'B', text: '3-5年的规划，兼顾当下和未来', score: 18 },
          { key: 'C', text: '1年左右，主要看眼前的回报和风险', score: 10 },
          { key: 'D', text: '更关注当下，长远的事以后再说', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '在家庭重大决策(如教育、居住、理财)中，您的思考跨度是？',
        options: [
          { key: 'A', text: '考虑下一代甚至隔代的影响', score: 25, crossScores: { LEGACY: 4 } },
          { key: 'B', text: '5-10年的家庭规划', score: 18 },
          { key: 'C', text: '1-3年，解决当前最紧迫的问题', score: 10 },
          { key: 'D', text: '主要看当下负担得起什么', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '制定公司战略时，您的思考时间跨度是？',
        options: [
          { key: 'A', text: '思考10年甚至更远，构建真正有壁垒的核心能力', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '3-5年战略规划，年度滚动调整', score: 18 },
          { key: 'C', text: '1年为主，快速试错快速迭代', score: 10 },
          { key: 'D', text: '以季度业绩为导向，市场变化太快不适合长期规划', score: 3 },
        ],
      },
    },
  },

  // Q10: 对失败的学习态度
  {
    dimension: 'VISION',
    sortOrder: 10,
    modes: {
      PERSONAL: {
        questionText: '当您犯了一个严重的判断错误时，您的第一反应是？',
        options: [
          { key: 'A', text: '立刻复盘：这个错误背后揭示了什么盲点？', score: 25, crossScores: { AWARENESS: 3 } },
          { key: 'B', text: '承认错误并修正，同时记住教训', score: 18 },
          { key: 'C', text: '先处理后果，等事情过去再想', score: 10 },
          { key: 'D', text: '倾向于找外部原因，很难承认是自己的问题', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当您在家庭关系中做了错误的决定(如忽视了孩子的需求)，您会？',
        options: [
          { key: 'A', text: '真诚道歉，深入反思自己的盲点和改进方向', score: 25, crossScores: { AWARENESS: 2, CONNECTION: 2 } },
          { key: 'B', text: '道歉并尽力弥补，以后注意', score: 18 },
          { key: 'C', text: '觉得也不完全是自己的问题，各退一步', score: 10 },
          { key: 'D', text: '认为当时的决定有道理，不需要道歉', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当您的战略决策被证明是错误的时，您如何面对？',
        options: [
          { key: 'A', text: '公开复盘，建立组织级的学习机制防止重犯', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '承认错误，快速调整并与团队共享教训', score: 18 },
          { key: 'C', text: '默默调整方向，不太愿意在团队面前承认', score: 10 },
          { key: 'D', text: '寻找替罪羊或外部因素来解释', score: 3 },
        ],
      },
    },
  },

  // Q11: 关注圈的广度
  {
    dimension: 'VISION',
    sortOrder: 11,
    modes: {
      PERSONAL: {
        questionText: '除了自己的事业，您对以下哪些领域保持关注？',
        options: [
          { key: 'A', text: '跨行业趋势、全球格局、社会议题、科技前沿', score: 25, crossScores: { LEGACY: 2 } },
          { key: 'B', text: '本行业动态和相关领域的变化', score: 18 },
          { key: 'C', text: '主要关注与自己直接相关的信息', score: 10 },
          { key: 'D', text: '忙于日常事务，很少有精力关注外部', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '在关心自己小家庭的同时，您对更广泛的社会和社区关系的关注度如何？',
        options: [
          { key: 'A', text: '积极参与社区建设，关心社会议题，带孩子做公益', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '关注社会新闻，偶尔参与社区活动', score: 18 },
          { key: 'C', text: '主要精力在自己家庭，社会的事关注较少', score: 10 },
          { key: 'D', text: '管好自己的家就够了，社会太复杂', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '作为企业领导者，您关注的范围有多广？',
        options: [
          { key: 'A', text: '行业生态、供应链上下游、政策法规、社会责任全面关注', score: 25, crossScores: { LEGACY: 2, CONNECTION: 2 } },
          { key: 'B', text: '关注行业和直接竞争对手，对大环境有基本判断', score: 18 },
          { key: 'C', text: '主要关注自己公司的运营和业绩', score: 10 },
          { key: 'D', text: '聚焦当前最紧迫的业务问题', score: 3 },
        ],
      },
    },
  },

  // Q12: 危中见机的能力
  {
    dimension: 'VISION',
    sortOrder: 12,
    modes: {
      PERSONAL: {
        questionText: '当整个行业遇到低谷(如经济衰退)时，您看到的是什么？',
        options: [
          { key: 'A', text: '别人恐惧时我看到机会，这是重新洗牌的最佳时机', score: 25, crossScores: { RESILIENCE: 3 } },
          { key: 'B', text: '谨慎乐观，在控制风险的前提下寻找机会', score: 18 },
          { key: 'C', text: '主要想着怎么保住现有的，不敢冒险', score: 10 },
          { key: 'D', text: '很焦虑，只看到威胁和困难', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当家庭遇到困难期(如经济紧张或搬迁)时，您能看到积极面吗？',
        options: [
          { key: 'A', text: '困难是家庭凝聚力的催化剂，是一起成长的机会', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '虽然艰难但相信会过去，尝试从中学到东西', score: 18 },
          { key: 'C', text: '主要精力放在解决问题上，没时间想积极面', score: 10 },
          { key: 'D', text: '困难就是困难，很难想到积极的一面', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当行业遭遇颠覆性变化(如AI冲击)时，您的战略思考是？',
        options: [
          { key: 'A', text: '主动拥抱变化，在颠覆中重新定义公司的价值', score: 25, crossScores: { RESILIENCE: 2, LEGACY: 2 } },
          { key: 'B', text: '积极学习新技术，在保持核心优势的同时转型', score: 18 },
          { key: 'C', text: '观望为主，等看清方向再行动', score: 10 },
          { key: 'D', text: '担忧大于行动，不知道该往哪个方向走', score: 3 },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // 连接力 CONNECTION — Q13~Q16
  // ═══════════════════════════════════════════════════════════

  // Q13: 倾听质量
  {
    dimension: 'CONNECTION',
    sortOrder: 13,
    modes: {
      PERSONAL: {
        questionText: '当合作伙伴表达不同意见时，您通常如何回应？',
        options: [
          { key: 'A', text: '先完全听完并确认理解，再分享自己的看法', score: 25, crossScores: { AWARENESS: 3 } },
          { key: 'B', text: '认真听，但会在对方说话时准备自己的回应', score: 18 },
          { key: 'C', text: '有时候会打断对方，因为觉得自己已经明白了', score: 10 },
          { key: 'D', text: '更多是在等对方说完好表达自己的观点', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当家人(尤其是晚辈)说出让您意外的想法时，您的反应是？',
        options: [
          { key: 'A', text: '认真倾听并追问原因，试图理解他们的世界', score: 25, crossScores: { AWARENESS: 2 } },
          { key: 'B', text: '听完后分享自己的看法，尊重差异', score: 18 },
          { key: 'C', text: '虽然听了，但内心已经在想如何纠正', score: 10 },
          { key: 'D', text: '直接指出问题，觉得年轻人想法不成熟', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '在团队会议中，基层员工提出了一个看似不切实际的建议，您的反应是？',
        options: [
          { key: 'A', text: '认真倾听并引导深入，好想法往往来自非常规角度', score: 25, crossScores: { VISION: 2 } },
          { key: 'B', text: '先肯定勇气，再一起分析可行性', score: 18 },
          { key: 'C', text: '礼貌地感谢，但内心已经否定了', score: 10 },
          { key: 'D', text: '觉得浪费时间，希望快速回到正题', score: 3 },
        ],
      },
    },
  },

  // Q14: 冲突化解方式
  {
    dimension: 'CONNECTION',
    sortOrder: 14,
    modes: {
      PERSONAL: {
        questionText: '当您与重要的合作伙伴产生严重分歧时，您倾向于？',
        options: [
          { key: 'A', text: '深入对话找到分歧背后的真正需求，寻找双赢方案', score: 25, crossScores: { VISION: 2 } },
          { key: 'B', text: '各退一步，在核心问题上达成妥协', score: 18 },
          { key: 'C', text: '据理力争，用数据和逻辑说服对方', score: 10 },
          { key: 'D', text: '暂时搁置分歧，避免关系恶化', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当您和伴侣在重要问题(如教育理念)上意见对立时，您如何处理？',
        options: [
          { key: 'A', text: '找一个安静的时间，真诚沟通彼此的顾虑和期望', score: 25, crossScores: { AWARENESS: 2 } },
          { key: 'B', text: '各自表达后协商一个折中方案', score: 18 },
          { key: 'C', text: '反复争论，各持己见，最终看谁更坚持', score: 10 },
          { key: 'D', text: '一方让步以避免争吵，但心里不服', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '当团队两个部门因资源分配产生激烈冲突时，您如何调解？',
        options: [
          { key: 'A', text: '召集双方深入了解需求，从公司整体利益出发创造增量', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '了解情况后做出公正裁决，给出清晰理由', score: 18 },
          { key: 'C', text: '让双方自己协商，实在不行再介入', score: 10 },
          { key: 'D', text: '一碗水端平，各分一半', score: 3 },
        ],
      },
    },
  },

  // Q15: 建立信任的能力
  {
    dimension: 'CONNECTION',
    sortOrder: 15,
    modes: {
      PERSONAL: {
        questionText: '您认为最有效的建立深度信任关系的方式是？',
        options: [
          { key: 'A', text: '言行一致、主动展示脆弱面、在对方困难时挺身而出', score: 25, crossScores: { LEGACY: 2 } },
          { key: 'B', text: '长期合作中的靠谱表现和互惠互利', score: 18 },
          { key: 'C', text: '展示自己的能力和资源价值', score: 10 },
          { key: 'D', text: '信任需要时间自然建立，很难主动经营', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '您觉得家人之间深层信任的基础是什么？',
        options: [
          { key: 'A', text: '无条件的接纳、真诚的沟通、危难中的陪伴', score: 25, crossScores: { RESILIENCE: 2 } },
          { key: 'B', text: '兑现承诺、尊重隐私、互相支持', score: 18 },
          { key: 'C', text: '血缘关系本身就是信任的基础', score: 10 },
          { key: 'D', text: '家人之间也需要保持适当距离和防备', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您认为打造一支高信任度团队最关键的是？',
        options: [
          { key: 'A', text: '领导者以身作则展示透明和脆弱，建立心理安全感', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '公平的制度、清晰的规则、一致的执行', score: 18 },
          { key: 'C', text: '给予足够的物质激励和晋升机会', score: 10 },
          { key: 'D', text: '信任是奢侈品，制度约束比信任更可靠', score: 3 },
        ],
      },
    },
  },

  // Q16: 共情深度
  {
    dimension: 'CONNECTION',
    sortOrder: 16,
    modes: {
      PERSONAL: {
        questionText: '当员工因私人原因工作状态不佳时，您的态度是？',
        options: [
          { key: 'A', text: '主动关心，提供力所能及的支持，给予恢复空间', score: 25, crossScores: { AWARENESS: 2 } },
          { key: 'B', text: '表示理解，在不影响团队的前提下适当照顾', score: 18 },
          { key: 'C', text: '私人问题应该自己处理，不应该影响工作', score: 10 },
          { key: 'D', text: '如果持续影响业绩，可能需要考虑换人', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '当您的孩子/伴侣遭遇挫折(如考试失利、工作不顺)时，您的反应是？',
        options: [
          { key: 'A', text: '先共情感受，等对方情绪稳定后再一起分析和支持', score: 25, crossScores: { AWARENESS: 3 } },
          { key: 'B', text: '安慰并提供建议和帮助', score: 18 },
          { key: 'C', text: '分析原因，指出哪里做得不够好', score: 10 },
          { key: 'D', text: '觉得失败很正常，不需要太多安慰', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您在做影响员工利益的决策(如裁员、降薪)时，内心的感受是？',
        options: [
          { key: 'A', text: '深感责任重大，竭力减少伤害并对受影响者负责到底', score: 25, crossScores: { LEGACY: 3 } },
          { key: 'B', text: '为大局着想但内心不好受，做好沟通和补偿', score: 18 },
          { key: 'C', text: '商业决策需要理性，不能太感情用事', score: 10 },
          { key: 'D', text: '这是正常的商业操作，不需要太多情感纠结', score: 3 },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // 传承力 LEGACY — Q17~Q20
  // ═══════════════════════════════════════════════════════════

  // Q17: 人生使命清晰度
  {
    dimension: 'LEGACY',
    sortOrder: 17,
    modes: {
      PERSONAL: {
        questionText: '如果用一句话概括"我这一生要做成什么"，您能清晰地说出来吗？',
        options: [
          { key: 'A', text: '非常清晰，这个使命指引着我每天的决策', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '大方向清楚，但具体表达还在打磨中', score: 18 },
          { key: 'C', text: '有模糊的方向感，但说不出一句话', score: 10 },
          { key: 'D', text: '还没认真想过这个问题', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '您的家庭有明确的共同愿景吗(比如"我们这个家要成为什么样的家庭")？',
        options: [
          { key: 'A', text: '有，全家人都认同并且常常提起', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '有大致的方向，但没有明确表达过', score: 18 },
          { key: 'C', text: '各人有各人的想法，没有统一过', score: 10 },
          { key: 'D', text: '过好每一天就行，不需要什么宏大愿景', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您的公司使命和愿景是否真正深入人心(而不只是墙上的标语)？',
        options: [
          { key: 'A', text: '团队上下都能说出来，并且在决策中体现', score: 25, crossScores: { CONNECTION: 2, VISION: 2 } },
          { key: 'B', text: '管理层认同，但基层员工可能只是知道', score: 18 },
          { key: 'C', text: '有使命愿景，但主要用于品牌宣传', score: 10 },
          { key: 'D', text: '坦白说，使命什么的不如赚钱重要', score: 3 },
        ],
      },
    },
  },

  // Q18: 培养他人的意愿
  {
    dimension: 'LEGACY',
    sortOrder: 18,
    modes: {
      PERSONAL: {
        questionText: '您愿意花多少时间和精力来帮助年轻人成长？',
        options: [
          { key: 'A', text: '这是我人生重要使命之一，定期指导和培养后辈', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '愿意帮忙，但主要在有人主动求教时', score: 18 },
          { key: 'C', text: '偶尔分享经验，但时间有限不能太多', score: 10 },
          { key: 'D', text: '自己的事还忙不过来，没精力管别人', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '在培养下一代方面，您的投入程度如何？',
        options: [
          { key: 'A', text: '不只关注学业成绩，更注重品格、视野和独立思考能力的培养', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '关注全面发展，但精力有限会侧重某些方面', score: 18 },
          { key: 'C', text: '主要关注学业和特长，其他方面顺其自然', score: 10 },
          { key: 'D', text: '孩子的教育主要交给学校和另一半', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您在培养接班人和核心团队方面投入了多少精力？',
        options: [
          { key: 'A', text: '这是CEO最重要的工作，我有系统的培养计划', score: 25, crossScores: { VISION: 2 } },
          { key: 'B', text: '在重点培养几个有潜力的人选', score: 18 },
          { key: 'C', text: '业务太忙，培养人的事总是被推后', score: 10 },
          { key: 'D', text: '觉得核心能力应该自己掌握，怕培养了竞争对手', score: 3 },
        ],
      },
    },
  },

  // Q19: 利他vs利己心态
  {
    dimension: 'LEGACY',
    sortOrder: 19,
    modes: {
      PERSONAL: {
        questionText: '在事业已经有一定成就后，驱动您继续前进的核心动力是什么？',
        options: [
          { key: 'A', text: '希望创造更大的社会价值，帮助更多人', score: 25, crossScores: { CONNECTION: 2 } },
          { key: 'B', text: '既想实现自我价值，也想回馈社会', score: 18 },
          { key: 'C', text: '主要是自我突破和成就感', score: 10 },
          { key: 'D', text: '主要是财务回报和社会地位', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '在家庭资源(时间、金钱、精力)的分配上，您的优先级是？',
        options: [
          { key: 'A', text: '家人需要优先，适当预留给社区和公益', score: 25, crossScores: { CONNECTION: 3 } },
          { key: 'B', text: '照顾好家人为主，有余力时帮助他人', score: 18 },
          { key: 'C', text: '先满足自己和核心家庭的需求', score: 10 },
          { key: 'D', text: '资源有限，只能顾好自己', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您如何看待企业社会责任(CSR)？',
        options: [
          { key: 'A', text: '创造社会价值是企业存在的根本意义，利润是副产品', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '兼顾商业利益和社会责任，两者可以互相促进', score: 18 },
          { key: 'C', text: '盈利之余做些公益，但商业利益是第一位的', score: 10 },
          { key: 'D', text: 'CSR主要是品牌营销的一部分', score: 3 },
        ],
      },
    },
  },

  // Q20: 代际思维
  {
    dimension: 'LEGACY',
    sortOrder: 20,
    modes: {
      PERSONAL: {
        questionText: '您是否思考过：自己离开这个世界后，想留下什么？',
        options: [
          { key: 'A', text: '经常想，这个思考指引着我现在的选择和行动', score: 25, crossScores: { VISION: 3, AWARENESS: 2 } },
          { key: 'B', text: '偶尔想，觉得应该留下一些有价值的东西', score: 18 },
          { key: 'C', text: '很少想，觉得现在活好更重要', score: 10 },
          { key: 'D', text: '不喜欢想这种问题，太沉重了', score: 3 },
        ],
      },
      FAMILY: {
        questionText: '您希望给后代传承的最重要的东西是什么？',
        options: [
          { key: 'A', text: '价值观、精神品质和面对人生的智慧', score: 25, crossScores: { VISION: 2, CONNECTION: 2 } },
          { key: 'B', text: '良好的教育、健康的体魄和正确的三观', score: 18 },
          { key: 'C', text: '稳定的经济基础和社会关系', score: 10 },
          { key: 'D', text: '还没认真想过这个问题', score: 3 },
        ],
      },
      ENTERPRISE: {
        questionText: '您希望自己创建/领导的企业在100年后是什么样？',
        options: [
          { key: 'A', text: '成为行业精神灯塔，其价值观和文化影响一代又一代人', score: 25, crossScores: { VISION: 3 } },
          { key: 'B', text: '持续发展壮大，在行业中保持领先地位', score: 18 },
          { key: 'C', text: '很难想那么远，先做好当下10年', score: 10 },
          { key: 'D', text: '100年后的事谁也说不准，不切实际', score: 3 },
        ],
      },
    },
  },
];

const MODES = ['PERSONAL', 'FAMILY', 'ENTERPRISE'] as const;

async function seedFaithAssessment() {
  console.log('🔮 Seeding faith-assessment questions...');

  // 清空旧数据
  await prisma.faithQuestion.deleteMany({});
  console.log('  Cleared existing questions');

  let count = 0;
  for (const concept of QUESTIONS) {
    for (const mode of MODES) {
      const modeData = concept.modes[mode];
      if (!modeData) continue;

      await prisma.faithQuestion.create({
        data: {
          dimension: concept.dimension as any,
          mode: mode as any,
          sortOrder: concept.sortOrder,
          questionText: modeData.questionText,
          options: modeData.options,
        },
      });
      count++;
    }
  }

  console.log(`🔮 Faith assessment: ${count} questions seeded (${QUESTIONS.length} concepts x ${MODES.length} modes)`);
}

if (require.main === module) {
  seedFaithAssessment()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}

export { seedFaithAssessment };
