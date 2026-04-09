/**
 * 12大文化传统与商业实践 — 种子数据
 * 每个文化传统的核心智慧如何帮助企业建设文化根基、实现基业长青
 * 目标受众: 企业老板、CEO、高管
 */

export interface ReligionBusinessValue {
  key: string;
  label: string;
  description: string;
}

export interface ReligionBusinessContent {
  businessPhilosophy: string;
  businessValues: ReligionBusinessValue[];
  businessInsight: string;
}

export const RELIGION_BUSINESS_CONTENT: Record<string, ReligionBusinessContent> = {
  buddhism: {
    businessPhilosophy: '以正念觉察经营企业，以因果法则构建长期价值——真正的商业智慧始于内观',
    businessValues: [
      { key: 'mindful_leadership', label: '正念领导力', description: '领导者以清醒觉察替代冲动决策，在不确定中保持定力，Google、SAP、Intel均已引入正念管理课程' },
      { key: 'impermanence', label: '无常应变', description: '拥抱变化而非抗拒，让组织具备敏捷转型的基因——诺基亚的衰落正是执着于确定性的教训' },
      { key: 'karma_management', label: '因果管理', description: '每个商业决策都会产生连锁反应，重视长期因果而非短期利润，是百年企业的底层逻辑' },
      { key: 'middle_way', label: '中道平衡', description: '在扩张与稳健、创新与传统、效率与人文之间找到动态平衡，避免极端决策' },
    ],
    businessInsight: '稻盛和夫将佛教文化"利他"哲学注入京瓷与KDDI，创造两家世界500强。乔布斯的禅修习惯直接影响了苹果"少即是多"的产品哲学。正念已成为硅谷高管的标配修行，帮助领导者在信息洪流中保持清明决策力。',
  },

  taoism: {
    businessPhilosophy: '上善若水，无为而治——最高明的管理是让组织如水般自然流动',
    businessValues: [
      { key: 'wuwei_management', label: '无为而治', description: '不是无所作为，而是不做违背规律的事。张瑞敏的"人单合一"模式正是道家管理的现代实践' },
      { key: 'water_philosophy', label: '上善若水', description: '水利万物而不争，善于找到阻力最小的路径。企业文化应如水般包容、适应、持续渗透' },
      { key: 'yinyang_balance', label: '阴阳平衡', description: '竞争与合作、集权与分权、速度与质量，对立统一是企业永恒的经营辩证法' },
      { key: 'natural_law', label: '道法自然', description: '遵循市场规律和人性本质，不逆势而为。顺势而为的企业往往比强行突破的企业更持久' },
    ],
    businessInsight: '任正非的"灰度管理"深植道家思想——不追求非黑即白的绝对正确，在灰度中寻找最优解。华为"让听见炮声的人做决策"正是无为而治的现代诠释。日本经营之神松下幸之助的"自来水哲学"也源于道家的水之智慧。',
  },

  confucianism: {
    businessPhilosophy: '仁义礼智信，修齐治平——从修身开始，到治理天下企业',
    businessValues: [
      { key: 'five_virtues', label: '五常治企', description: '仁(关爱员工)义(公平竞争)礼(制度流程)智(知识管理)信(诚信经营)，五常即五大管理支柱' },
      { key: 'self_cultivation', label: '修身齐家', description: '领导者必须先修身才能齐家治国。企业家的个人修养直接决定企业文化的天花板' },
      { key: 'ritual_system', label: '礼制管理', description: '"礼"即制度与规范。孔子的礼制思想是现代企业制度化管理的文化源头' },
      { key: 'zhongyong', label: '中庸之道', description: '不偏不倚，过犹不及。在激进与保守之间找到恰到好处的经营节奏' },
    ],
    businessInsight: '日本企业界将儒家思想视为经营圣经——涩泽荣一的《论语与算盘》奠定了"义利合一"的日本商道。三星创始人李秉喆以儒家"事业报国"为信条。中国新一代企业家如曹德旺、任正非都在企业文化中融入儒家精神，证明了两千年前的智慧依然是商业竞争力的源泉。',
  },

  christianity: {
    businessPhilosophy: '仆人式领导，契约精神——伟大的领导者首先是伟大的服务者',
    businessValues: [
      { key: 'servant_leadership', label: '仆人领导', description: '领导者是为团队服务的仆人，而非高高在上的统治者。这是西方管理学"服务型领导"理论的神学根源' },
      { key: 'covenant_faith', label: '契约诚信', description: '圣经中的"约"是西方契约精神的源头。商业信用体系、合同法、信托制度都根植于此' },
      { key: 'altruism', label: '利他精神', description: '"施比受更为有福"——利他型企业往往获得更深的客户忠诚和更强的品牌溢价' },
      { key: 'grace_culture', label: '恩典文化', description: '包容失败、给予机会、鼓励成长。允许试错的组织文化是创新的温床' },
    ],
    businessInsight: '沃尔玛创始人山姆·沃尔顿将基督文化仆人精神融入零售帝国——"超越顾客期望"。万豪酒店的"以人为本"文化直接源于创始人的基督文化。美国企业界的慈善传统(洛克菲勒、卡内基、盖茨)也深植于基督文化的"管家"观念——财富是上帝的托付，而非个人的所有。',
  },

  islam: {
    businessPhilosophy: '诚信经商，公平交易——先知穆罕默德本身就是一位杰出的商人',
    businessValues: [
      { key: 'halal_business', label: '清真商道', description: '伊斯兰商业伦理强调交易透明、禁止欺诈。全球清真产业规模已超2万亿美元，是增长最快的商业领域之一' },
      { key: 'zakat_sharing', label: '天课共享', description: '企业利润2.5%用于社会责任——这比现代CSR理念早了1400年。共享财富让企业获得社区深度信任' },
      { key: 'riba_free', label: '伊斯兰金融', description: '禁止利息、强调风险共担。伊斯兰金融体系在2008年金融危机中表现更稳健，资产规模已超4万亿美元' },
      { key: 'ummah_community', label: '社区共建', description: '"乌玛"(社区)概念让伊斯兰商业天然具备社区嵌入性，用户即社区，社区即市场' },
    ],
    businessInsight: '迪拜和新加坡的崛起证明了伊斯兰商业伦理的全球竞争力。马来西亚的伊斯兰银行业务增速是传统银行的3倍。土耳其安纳多卢集团以伊斯兰商业伦理构建了横跨26国的产业帝国。清真认证已成为全球食品行业的黄金标准，惠及穆斯林与非穆斯林消费者。',
  },

  hinduism: {
    businessPhilosophy: '达摩(天命使命)与业力(因果法则)——企业的存在必须回应更高的使命召唤',
    businessValues: [
      { key: 'dharma_mission', label: '天命使命', description: '每个企业都有其"达摩"——超越利润的存在意义。塔塔集团"回馈社会"的使命感正源于此' },
      { key: 'karma_law', label: '业力因果', description: '善业得善果——高品质的产品和真诚的服务终将获得市场回报。急功近利必遭反噬' },
      { key: 'yoga_balance', label: '瑜伽平衡', description: '瑜伽的核心是身心灵合一。企业同样需要战略、执行、文化三位一体的整合力' },
      { key: 'jugaad_innovation', label: '朴素创新', description: '"Jugaad"(朴素创新)是印度商业的独特哲学——用最少资源解决最大问题，反对资源浪费' },
    ],
    businessInsight: '塔塔集团在150年间秉持"达摩"精神，从钢铁到软件横跨100+产业，66%股份归属慈善信托。印孚瑟斯的穆尔蒂将"业力瑜伽"(行动的修行)融入IT服务业，打造了印度科技业的全球名片。印度裔CEO(谷歌、微软、Adobe)群体的崛起背后是深厚的印度哲学思维训练。',
  },

  judaism: {
    businessPhilosophy: '契约忠诚，教育传承——犹太人占全球0.2%人口却获得22%诺贝尔奖的秘密',
    businessValues: [
      { key: 'covenant_loyalty', label: '契约忠诚', description: '犹太人与上帝的"约"培养了极致的契约精神。在商业中表现为对承诺的绝对尊重和对信用的极度珍视' },
      { key: 'shabbat_wisdom', label: '安息智慧', description: '每周强制休息的安息日制度，是防止企业家过劳和保持创造力的古老智慧。定期"停下来思考"比持续奔跑更重要' },
      { key: 'talmudic_debate', label: '塔木德辩证', description: '犹太文化育鼓励质疑和辩论——"两个犹太人三个观点"。这种辩证思维是以色列创新之国的文化根基' },
      { key: 'community_support', label: '社区互助', description: '"修复世界"(Tikkun Olam)的理念让犹太商业社区形成了强大的互助网络，信息共享、资源共用' },
    ],
    businessInsight: '犹太人在金融(罗斯柴尔德)、科技(谷歌、Facebook、Dell)、媒体(好莱坞)、零售(沃尔玛、星巴克)等领域的卓越成就，根源在于塔木德教育培养的辩证思维和契约精神。以色列"创业之国"的底层密码是犹太文化中鼓励质疑、容忍失败、终身学习的传统。',
  },

  sikhism: {
    businessPhilosophy: '平等共食，诚实劳动——用双手创造的财富才是真正的财富',
    businessValues: [
      { key: 'equality_leadership', label: '平等领导', description: '锡克文化"兰加尔"(共食)传统——无论身份地位一律平等用餐。消除等级的扁平化管理在此有千年原型' },
      { key: 'honest_labor', label: '诚实劳动', description: '"Kirat Karo"(诚实劳动)是锡克文化三大支柱之一。靠投机取巧获利在锡克商业伦理中是不道德的' },
      { key: 'selfless_service', label: '无私服务', description: '"Seva"(无私服务)培养了锡克社区极强的志愿精神和团队协作意识' },
      { key: 'shared_prosperity', label: '社区共富', description: '"Vand Chakko"(分享所得)——企业利润必须与社区分享，这是锡克商人慷慨慈善的文化根源' },
    ],
    businessInsight: '锡克教徒仅占印度人口2%却贡献了印度军队的15%和出租车行业的大部分——这反映了锡克文化中的勤奋、勇气和服务精神。在海外(英国、加拿大、美国)，锡克社区是最成功的移民企业家群体之一。他们的"兰加尔"传统(全球最大的免费厨房网络)是企业社会责任的活教材。',
  },

  shinto: {
    businessPhilosophy: '匠人精神，万物有灵——日本百年企业数量全球第一的文化密码',
    businessValues: [
      { key: 'monozukuri', label: '匠心经营', description: '神道文化"物造"精神追求极致完美。日本拥有全球最多的百年企业(33,000+家)，秘密就是不求大、但求精' },
      { key: 'purification', label: '清净管理', description: '"禊"(净化)仪式延伸为5S管理(整理/整顿/清扫/清洁/素养)，丰田生产方式的文化源头' },
      { key: 'gratitude_culture', label: '感恩文化', description: '对自然万物怀感恩之心——对原材料感恩、对客户感恩、对员工感恩，构建深度忠诚关系' },
      { key: 'harmony', label: '和之道', description: '"和"是日本商业的最高追求。内部和谐、与客户和谐、与自然和谐，避免对抗式竞争' },
    ],
    businessInsight: '日本百年企业密度全球第一(33,000+家)，千年企业也有7家。金刚组(建筑公司，公元578年创立)存续近1,500年的秘密就是神道文化的"匠人精神"——不追求规模扩张，专注把一件事做到极致。丰田的"现地现物"、索尼的"工匠魂"、无印良品的"素之美"，都是神道文化的商业化表达。',
  },

  'tibetan-buddhism': {
    businessPhilosophy: '慈悲领导，禅定决策——在纷繁复杂中修炼洞察本质的智慧',
    businessValues: [
      { key: 'compassion_mgmt', label: '慈悲管理', description: '达赖喇嘛提出"慈悲经济学"——企业决策必须考虑对所有利益相关者的影响，不仅仅是股东' },
      { key: 'meditation_decision', label: '禅定决策', description: '冥想训练培养深度专注力和洞察力。越来越多的硅谷CEO和华尔街交易员将冥想作为决策前的必修课' },
      { key: 'adversity_transform', label: '转化逆境', description: '藏传文化的"转烦恼为菩提"思想——每一次危机都是转型的契机，每一个障碍都是成长的台阶' },
      { key: 'bodhichitta', label: '菩提心愿', description: '发愿利益一切众生——企业的终极使命应超越利润，指向更广泛的社会福祉' },
    ],
    businessInsight: '达赖喇嘛与商界领袖的对话已成为达沃斯论坛的固定节目。"慈悲领导力"理论被哈佛商学院、沃顿商学院纳入MBA课程。Salesforce创始人马克·贝尼奥夫的"利益相关者资本主义"理念深受藏传文化影响。冥想App(Headspace、Calm)的数十亿美元估值证明了冥想商业化的巨大潜力。',
  },

  indigenous: {
    businessPhilosophy: '七代思维，万物互联——每个决策都要考虑对未来七代人的影响',
    businessValues: [
      { key: 'seven_generations', label: '长远思维', description: '易洛魁联盟的"七代法则"——做决策时必须思考对未来七代人的影响。这比ESG理念早了数百年' },
      { key: 'ecological_wisdom', label: '生态智慧', description: '万物有灵、万物互联——企业是生态系统的一部分而非征服者。循环经济和可持续发展的古老原型' },
      { key: 'circle_leadership', label: '圆圈领导', description: '原住民的圆圈会议——没有首席、人人平等、轮流发言。这是现代敏捷会议和扁平化组织的文化先驱' },
      { key: 'story_heritage', label: '故事传承', description: '通过口述故事传递知识和价值观——企业文化的核心不在制度手册，而在被反复讲述的"创业故事"' },
    ],
    businessInsight: 'Patagonia创始人伊冯·乔伊纳德将原住民生态智慧融入品牌DNA——"地球是我们唯一的股东"。新西兰的毛利经济模式(集体所有、长期视角)正被全球研究。原住民的"七代思维"已成为ESG(环境、社会、治理)运动的哲学基石。在气候危机时代，原住民智慧正从边缘走向商业思想的中心。',
  },

  bahai: {
    businessPhilosophy: '多元统一，协商决策——在多样性中寻找统一性是全球化企业的终极命题',
    businessValues: [
      { key: 'global_vision', label: '全球视野', description: '巴哈伊文化"地球是一个国家，人类是其公民"的理念，是跨国企业全球化治理的哲学根基' },
      { key: 'consultation', label: '协商共治', description: '巴哈伊的"磋商"制度——决策时每个参与者都必须充分表达，一旦达成共识则全体执行。超越了简单多数决的局限' },
      { key: 'diversity_inclusion', label: '多元包容', description: '巴哈伊文化义核心是消除一切偏见(种族/性别/阶级)。DEI(多元、平等、包容)战略的精神先驱' },
      { key: 'science_religion', label: '科教融合', description: '巴哈伊文化强调科学与文化智慧必须和谐——数据驱动与价值驱动并重，理性决策与道德判断合一' },
    ],
    businessInsight: '巴哈伊社区遍布全球200+国家和地区，其"磋商"制度被联合国和多个国际组织采纳为决策参考模型。巴哈伊文化义中"消除极端贫富差距"的经济思想，与当代"包容性增长"理念高度吻合。在全球化企业面临文化冲突加剧的今天，巴哈伊"多元统一"的哲学提供了独特的解决框架。',
  },
};
