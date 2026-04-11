// 一花五叶 · 禅宗五家宗风常量
// 用于十牛图各阶按家染色 + 禅修考核注入公案 few-shot

export interface ZenHouse {
  code: string;              // LINJI | CAODONG | GUIYANG | YUNMEN | FAYAN
  name: string;              // 临济宗
  founder: string;           // 义玄
  foundedEra: string;        // 唐·会昌
  motto: string;             // 棒喝截流，直下承当
  introStyle: string;        // 接引风格一句
  signatureKoans: string[];  // 代表公案 (禅修考核 few-shot)
  stageTones: string[];      // 十阶该家视角描述 (覆盖通用描述)
  scriptureSlugs: string[];  // 关联经论 slug
  color: string;             // 主色
  emoji: string;
}

export const FIVE_HOUSES: Record<string, ZenHouse> = {
  LINJI: {
    code: 'LINJI',
    name: '临济宗',
    founder: '义玄禅师',
    foundedEra: '唐·会昌年间',
    motto: '棒喝截流，直下承当',
    introStyle: '一喝截流，全机大用；四料简辨人境，四宾主验主客',
    signatureKoans: [
      '临济三喝：有时一喝如金刚王宝剑，有时一喝如踞地金毛师子，有时一喝如探竿影草，有时一喝不作一喝用',
      '无位真人：赤肉团上有一无位真人，常从汝等诸人面门出入',
      '佛法无多子：老僧三十年前未参禅时，见山是山，见水是水',
    ],
    stageTones: [
      '初心莽撞，一喝当头——寻牛即是寻喝响处的那一念',
      '见迹不留迹，闻一喝而骨节松动',
      '一喝相逢即本地风光，无位真人赤裸裸现前',
      '得牛如夺枪，须照用同时，莫被境转',
      '牧牛用四料简：夺人不夺境，夺境不夺人，人境俱夺，人境俱不夺',
      '骑牛归家，全机大用，赤手空拳入闹市',
      '忘牛存人，四宾主分明，主中主岂可商量',
      '人牛俱忘，佛魔俱丧，一喝截流处即本地风光',
      '返本还源，方知三十年前老僧即是今日老僧',
      '入廛垂手，逢佛杀佛逢祖杀祖，全身入廛作活人',
    ],
    scriptureSlugs: ['linji-lu', 'transmission-of-lamp', 'wudeng-huiyuan'],
    color: '#C1272D',
    emoji: '🔥',
  },
  CAODONG: {
    code: 'CAODONG',
    name: '曹洞宗',
    founder: '洞山良价 · 曹山本寂',
    foundedEra: '唐·咸通年间',
    motto: '默照绵密，回互五位',
    introStyle: '只管打坐，宝镜三昧；正偏五位回互，功勋五位渐入',
    signatureKoans: [
      '洞山三渗漏：见渗漏、情渗漏、语渗漏',
      '宝镜三昧：银碗盛雪，明月藏鹭',
      '洞山问僧：世间何物最苦？僧云：地狱最苦。山云：不然，在此衣线下不明大事始是苦',
    ],
    stageTones: [
      '寻牛如默照初习，端坐观呼吸处牛影渐现',
      '见迹即正中偏，回互微露',
      '见牛如宝镜初明，银碗盛雪须细辨',
      '得牛须勘三渗漏，见情语一一照破',
      '牧牛只管打坐，绵密用功不作佛想',
      '骑牛归家即偏中正，不落功勋',
      '忘牛存人，功勋五位渐入无功之功',
      '人牛俱忘，兼中到，一色边事',
      '返本还源即正中来，无中唱出有句',
      '入廛垂手即兼中至，混融不二而行化',
    ],
    scriptureSlugs: ['dongshan-lu', 'baojing-sanmei', 'transmission-of-lamp'],
    color: '#1C2F4D',
    emoji: '🌌',
  },
  GUIYANG: {
    code: 'GUIYANG',
    name: '沩仰宗',
    founder: '沩山灵祐 · 仰山慧寂',
    foundedEra: '唐·元和年间',
    motto: '父子唱和，体用圆融',
    introStyle: '九十七圆相传心，父慈子孝机锋相契；水牯牛家风，一切现成',
    signatureKoans: [
      '沩山水牯牛：老僧百年后向山下作一头水牯牛',
      '仰山插锹：仰山插锹叉手，沩山云：今日大有人在',
      '沩山踢倒净瓶：不得唤作净瓶，汝唤作什么',
    ],
    stageTones: [
      '寻牛即觅自家水牯牛，莫向外寻',
      '见迹如仰山插锹处父子心契',
      '见牛即九十七圆相之第一相现前',
      '得牛须父子唱和，单传不行',
      '牧牛作水牯牛想，任运而食不杂人境',
      '骑牛归家，一切现成无劳造作',
      '忘牛存人，圆相层层递入',
      '人牛俱忘，体用一如不落两边',
      '返本还源即本来水牯牛，未曾离家',
      '入廛垂手，头角峥嵘为众生作耕作',
    ],
    scriptureSlugs: ['weishan-jingce', 'yangshan-yulu', 'transmission-of-lamp'],
    color: '#0A7D5B',
    emoji: '🐃',
  },
  YUNMEN: {
    code: 'YUNMEN',
    name: '云门宗',
    founder: '云门文偃',
    foundedEra: '五代·后梁',
    motto: '一字关，孤峻干云',
    introStyle: '一字截断众流，涵盖乾坤随波逐浪；云门三句立拆诸家',
    signatureKoans: [
      '云门干屎橛：如何是佛？干屎橛',
      '日日是好日：十五日已前不问汝，十五日已后道将一句来',
      '云门三句：函盖乾坤、截断众流、随波逐浪',
    ],
    stageTones: [
      '寻牛？干屎橛',
      '见迹？一字关前无门无户',
      '见牛？截断众流莫涉二边',
      '得牛？函盖乾坤随波逐浪',
      '牧牛？日日是好日',
      '骑牛归家？云在青天水在瓶',
      '忘牛存人？露',
      '人牛俱忘？普',
      '返本还源？是',
      '入廛垂手？好',
    ],
    scriptureSlugs: ['yunmen-lu', 'biyan-lu', 'transmission-of-lamp'],
    color: '#D68A2B',
    emoji: '⚡',
  },
  FAYAN: {
    code: 'FAYAN',
    name: '法眼宗',
    founder: '法眼文益',
    foundedEra: '五代·南唐',
    motto: '细密幽微，一切现成',
    introStyle: '六相圆融融华严理事，不知最亲切毫厘有差天地悬隔',
    signatureKoans: [
      '法眼毫厘有差：毫厘有差，天地悬隔',
      '不知最亲切：不知最亲切',
      '法眼问僧：汝名什么？僧云：慧超。法眼云：慧超咨和尚，如何是佛？',
    ],
    stageTones: [
      '寻牛之时毫厘有差天地悬隔，一念不正全盘皆偏',
      '见迹须知不知最亲切，疑情即法身',
      '见牛如六相圆融，总别同异成坏一时现前',
      '得牛莫作得想，一切现成不劳安排',
      '牧牛即事即理，华严境界层层无尽',
      '骑牛归家即因陀罗网一珠映万珠',
      '忘牛存人，理事无碍',
      '人牛俱忘，事事无碍',
      '返本还源即华严法界本自现成',
      '入廛垂手，重重无尽摄化群生',
    ],
    scriptureSlugs: ['fayan-lu', 'zongjing-lu', 'huayan-jing'],
    color: '#4A2C6A',
    emoji: '🕸️',
  },
};

export const ZEN_HOUSE_CODES = Object.keys(FIVE_HOUSES);

export function getZenHouse(code: string | null | undefined): ZenHouse | null {
  if (!code) return null;
  return FIVE_HOUSES[code] ?? null;
}
