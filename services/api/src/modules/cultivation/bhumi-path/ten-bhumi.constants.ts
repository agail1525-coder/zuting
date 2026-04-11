// 菩萨十地 · 大愿行路径
// 出《华严经·十地品》· 每地 3 个大愿任务 (auto 挂钩 + 用户反思混合)

export type VowSource =
  | 'THREE_LIVES'    // 三生愿景
  | 'KARMA'          // 因缘日志
  | 'SEAL'           // 每日印证
  | 'QUIZ'           // 禅修考核
  | 'WISDOM'         // 智慧融通
  | 'JOURNAL'        // 文化之旅日志
  | 'REVIEW'         // 评价 UGC
  | 'GUIDE'          // 攻略游记
  | 'QUESTION'       // 社区问答
  | 'SHARE'          // 分享
  | 'REFERRAL'       // 推荐新用户
  | 'PERSONAL'       // 个人圆满主题
  | 'FAMILY'         // 家庭幸福主题
  | 'TEAM'           // 团队文化主题
  | 'REFLECTION';    // 纯用户反思文字 (手动)

export interface BhumiVow {
  type: VowSource;
  title: string;       // 任务名
  description: string; // 具体要求
  target: number;      // 完成阈值 (次数/天数/条数)
  reflectionMin: number; // 要求反思文字最少字数
}

export interface Bhumi {
  no: number;          // 1-10
  name: string;        // 欢喜地
  sanskrit: string;    // Pramuditā
  paramita: string;    // 布施
  paramitaEn: string;  // Dāna
  focus: string;       // 修行焦点一句
  vows: [BhumiVow, BhumiVow, BhumiVow]; // 3 个大愿
  gateVow: string;     // 入地发心偈一句
  scriptureSlugs: string[];
  recommendedSiteTradition: string; // 推荐圣地的文化传统
  emoji: string;
}

export const TEN_BHUMI: Bhumi[] = [
  {
    no: 1,
    name: '欢喜地',
    sanskrit: 'Pramuditā',
    paramita: '布施',
    paramitaEn: 'Dāna',
    focus: '初证法喜 · 发大菩提心',
    vows: [
      { type: 'THREE_LIVES', title: '发三生愿景', description: '完整填写个人/家庭/事业三生大愿', target: 1, reflectionMin: 0 },
      { type: 'KARMA', title: '随喜布施', description: '完成 5 次因缘布施记录 (物/财/法/无畏)', target: 5, reflectionMin: 50 },
      { type: 'REFLECTION', title: '发菩提心日志', description: '写一篇"为何发菩提心"反思', target: 1, reflectionMin: 500 },
    ],
    gateVow: '愿我尽未来际 · 度一切众生 · 入无余涅槃',
    scriptureSlugs: ['huayan-shi-di', 'huayan-jing'],
    recommendedSiteTradition: 'BUDDHISM',
    emoji: '🌸',
  },
  {
    no: 2,
    name: '离垢地',
    sanskrit: 'Vimalā',
    paramita: '持戒',
    paramitaEn: 'Śīla',
    focus: '戒行清净 · 十善业道',
    vows: [
      { type: 'SEAL', title: '21 天持戒印证', description: '连续 21 天完成每日印证不缺', target: 21, reflectionMin: 0 },
      { type: 'REFLECTION', title: '远离一项恶习', description: '识别并远离一项身口意恶习，周期 7 天', target: 1, reflectionMin: 300 },
      { type: 'REFLECTION', title: '持戒反思', description: '写一篇"戒为无上菩提本"反思', target: 1, reflectionMin: 500 },
    ],
    gateVow: '身口意三业 · 一一皆清净 · 同入菩萨道',
    scriptureSlugs: ['huayan-shi-di', 'fanwang-jing'],
    recommendedSiteTradition: 'ZEN',
    emoji: '💎',
  },
  {
    no: 3,
    name: '发光地',
    sanskrit: 'Prabhākarī',
    paramita: '忍辱',
    paramitaEn: 'Kṣānti',
    focus: '闻法修定 · 慧光初发',
    vows: [
      { type: 'KARMA', title: '记录接纳逆境', description: '记录 3 次接纳逆境因缘并转心', target: 3, reflectionMin: 100 },
      { type: 'REFLECTION', title: '原谅一人', description: '写一封"原谅信"给曾伤害你的人', target: 1, reflectionMin: 300 },
      { type: 'QUIZ', title: '忍辱禅修考核', description: '连续通过 7 天禅修考核', target: 7, reflectionMin: 0 },
    ],
    gateVow: '如大地忍 · 受一切践踏 · 而生万物',
    scriptureSlugs: ['huayan-shi-di', 'diamond-sutra'],
    recommendedSiteTradition: 'ZEN',
    emoji: '✨',
  },
  {
    no: 4,
    name: '焰慧地',
    sanskrit: 'Arciṣmatī',
    paramita: '精进',
    paramitaEn: 'Vīrya',
    focus: '慧焰烧烦恼薪',
    vows: [
      { type: 'SEAL', title: '30 天晨修无缺', description: '连续 30 天晨间印证', target: 30, reflectionMin: 0 },
      { type: 'QUIZ', title: '精进禅修考核', description: '连续通过 14 天禅修考核', target: 14, reflectionMin: 0 },
      { type: 'REFLECTION', title: '烦恼烧薪日志', description: '写一篇"慧焰烧一分烦恼"修证日志', target: 1, reflectionMin: 800 },
    ],
    gateVow: '精进无懈 · 烧尽无明 · 慧焰常明',
    scriptureSlugs: ['huayan-shi-di', 'diamond-sutra'],
    recommendedSiteTradition: 'TIBETAN',
    emoji: '🔥',
  },
  {
    no: 5,
    name: '难胜地',
    sanskrit: 'Sudurjayā',
    paramita: '禅定',
    paramitaEn: 'Dhyāna',
    focus: '真俗二谛 · 难胜合融',
    vows: [
      { type: 'WISDOM', title: '主持一次圆桌', description: '使用智慧融通启动一次 3 轮圆桌讨论', target: 1, reflectionMin: 0 },
      { type: 'SEAL', title: '深定印证', description: '连续 21 天禅定印证专修', target: 21, reflectionMin: 0 },
      { type: 'REFLECTION', title: '真俗二谛思辨', description: '写一篇"真俗二谛圆融"思辨', target: 1, reflectionMin: 1000 },
    ],
    gateVow: '真俗二谛 · 难胜合融 · 菩萨神通',
    scriptureSlugs: ['huayan-shi-di', 'platform-sutra'],
    recommendedSiteTradition: 'TAOISM',
    emoji: '🧘',
  },
  {
    no: 6,
    name: '现前地',
    sanskrit: 'Abhimukhī',
    paramita: '般若',
    paramitaEn: 'Prajñā',
    focus: '空性现前 · 般若照耀',
    vows: [
      { type: 'WISDOM', title: '答智慧融通十问', description: '使用智慧融通发起 10 次深度提问', target: 10, reflectionMin: 0 },
      { type: 'KARMA', title: '空性观照记录', description: '记录 7 次日常空性观照因缘', target: 7, reflectionMin: 50 },
      { type: 'REFLECTION', title: '般若心要反思', description: '写一篇"照见五蕴皆空"心要', target: 1, reflectionMin: 800 },
    ],
    gateVow: '般若波罗蜜 · 照见五蕴空 · 度一切苦厄',
    scriptureSlugs: ['huayan-shi-di', 'heart-sutra', 'diamond-sutra'],
    recommendedSiteTradition: 'ZEN',
    emoji: '🔍',
  },
  {
    no: 7,
    name: '远行地',
    sanskrit: 'Dūraṃgamā',
    paramita: '方便',
    paramitaEn: 'Upāya',
    focus: '方便度众 · 远离二乘',
    vows: [
      { type: 'REFERRAL', title: '带新用户入十牛图', description: '邀请 1 位新用户并陪伴其完成十牛图 1-3 阶', target: 1, reflectionMin: 0 },
      { type: 'GUIDE', title: '写方便接引攻略', description: '发布 1 篇"如何接引初学者"攻略', target: 1, reflectionMin: 0 },
      { type: 'REFLECTION', title: '方便心得', description: '写一篇"八万四千方便度生"心得', target: 1, reflectionMin: 600 },
    ],
    gateVow: '方便善巧 · 不舍一人 · 令入佛智',
    scriptureSlugs: ['huayan-shi-di', 'lotus-sutra'],
    recommendedSiteTradition: 'CHRISTIANITY',
    emoji: '🛤️',
  },
  {
    no: 8,
    name: '不动地',
    sanskrit: 'Acalā',
    paramita: '愿',
    paramitaEn: 'Praṇidhāna',
    focus: '无功用行 · 任运不动',
    vows: [
      { type: 'FAMILY', title: '发起家庭主题修行', description: '发起并完成 1 个家庭幸福主题包 21 天', target: 1, reflectionMin: 0 },
      { type: 'SEAL', title: '守愿印证 49 天', description: '连续 49 天不动本愿印证', target: 49, reflectionMin: 0 },
      { type: 'REFLECTION', title: '不动心日志', description: '写一篇"八风吹不动"证量日志', target: 1, reflectionMin: 1000 },
    ],
    gateVow: '如如不动 · 本愿坚固 · 任运度众',
    scriptureSlugs: ['huayan-shi-di', 'lotus-sutra'],
    recommendedSiteTradition: 'HINDUISM',
    emoji: '🏔️',
  },
  {
    no: 9,
    name: '善慧地',
    sanskrit: 'Sādhumatī',
    paramita: '力',
    paramitaEn: 'Bala',
    focus: '四无碍辩 · 说法自在',
    vows: [
      { type: 'GUIDE', title: '攻略被推荐', description: '发布攻略并获得官方推荐 1 次', target: 1, reflectionMin: 0 },
      { type: 'QUESTION', title: '四无碍辩答疑', description: '在社区问答回答 20 条被采纳', target: 20, reflectionMin: 0 },
      { type: 'REFLECTION', title: '善慧说法心得', description: '写一篇"法无碍辩"说法心得', target: 1, reflectionMin: 800 },
    ],
    gateVow: '四无碍辩 · 应机说法 · 破诸疑惑',
    scriptureSlugs: ['huayan-shi-di', 'lankavatara-sutra'],
    recommendedSiteTradition: 'ISLAM',
    emoji: '📣',
  },
  {
    no: 10,
    name: '法云地',
    sanskrit: 'Dharmameghā',
    paramita: '智',
    paramitaEn: 'Jñāna',
    focus: '大法雨润 · 普度众生',
    vows: [
      { type: 'KARMA', title: '百次善行', description: '累计 100 次因缘善行记录', target: 100, reflectionMin: 0 },
      { type: 'TEAM', title: '大法雨普度', description: '发起 1 个团队文化主题包服务众生', target: 1, reflectionMin: 0 },
      { type: 'REFLECTION', title: '法云地总结', description: '写一篇"愿财双圆 · 法云遍润"总集愿', target: 1, reflectionMin: 2000 },
    ],
    gateVow: '如大法云 · 普雨一切 · 愿财双圆',
    scriptureSlugs: ['huayan-shi-di', 'huayan-jing', 'platform-sutra'],
    recommendedSiteTradition: 'BAHAI',
    emoji: '☁️',
  },
];

export function getBhumi(no: number): Bhumi | null {
  if (no < 1 || no > 10) return null;
  return TEN_BHUMI[no - 1];
}

export const BHUMI_TOTAL = 10;
