/**
 * M38.5 经论++ v5 — 主流传统二线经论补充
 * 触发: 经论++ (2026-04-10 第四轮)
 *
 * 本轮目标(14部):
 *   - ISLAM +2 (宗教科学的复兴/智慧珍宝)
 *   - TIBETAN +2 (莲师心要/米拉日巴传)
 *   - CHRISTIANITY +2 (灵心城堡/十架若望·黑夜之灵歌)
 *   - CONFUCIANISM +2 (曾国藩家书/朱子家训)
 *   - TAOISM +2 (悟真篇/关尹子)
 *   - HINDUISM +2 (瓦希斯塔瑜伽/罗摩那尊者言教)
 *   - SHINTO +1 (叶隐闻书)
 *   - JUDAISM +1 (塔妮亚)
 *
 * 执行: npx tsx prisma/seed-scriptures-v5.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChapterDef {
  chapterNo: number;
  title: string;
  subtitle?: string;
  originalText: string;
  commentary?: string;
  keyQuotes?: { quote: string; explanation: string }[];
  practiceHint?: string;
}

interface NewScriptureDef {
  slug: string;
  title: string;
  titleEn?: string;
  author?: string;
  era?: string;
  ring: number;
  categorySlug: string;
  summary: string;
  significance?: string;
  difficulty: number;
  oxStageMin: number;
  oxStageMax: number;
  readingMins?: number;
  tags: string[];
  sortOrder: number;
  relatedSlugs?: string[];
  chapters: ChapterDef[];
}

const NEW_SCRIPTURES: NewScriptureDef[] = [
  // ─── ISLAM +2 ─────────────────────────────────
  {
    slug: 'ihya-ulum-al-din', title: '宗教科学的复兴', titleEn: 'Ihya Ulum al-Din',
    author: '伊玛目安萨里(Al-Ghazali)', era: '约1090-1106年',
    ring: 3, categorySlug: 'islam',
    summary: '安萨里40卷巨著，系统整合伊斯兰法学、神学、苏非灵修，被誉为"伊斯兰世界最伟大的神学著作"。',
    significance: '穆斯林世界公认的《古兰经》和圣训之后最重要的著作。安萨里因此被尊为"伊斯兰的证明"。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 80,
    tags: ['安萨里', '苏非', '伦理', '灵修'], sortOrder: 12,
    relatedSlugs: ['alchemy-of-happiness', 'masnavi'],
    chapters: [
      {
        chapterNo: 1, title: '知识之书', subtitle: '有益与无益的知识',
        originalText: '安萨里说："知识分为两种：对今生有益的，对后世有益的。但最高的知识是对今生和后世都有益的 — 那就是认识真主和认识自己。\n\n我见过许多学者，他们知识渊博却灵魂干涸；也见过许多农夫，他们目不识丁却心中有光。为什么？因为真正的知识不仅仅是信息，而是改变人的东西。\n\n如果你读了一本书但你的生活没有任何改变，那本书对你就是无效的。如果你听了一场讲道但你的心没有任何触动，那场讲道对你就是无效的。\n\n知识像药 — 只有服下去才有效。光是摆在那里欣赏，再珍贵也治不了病。"',
        commentary: '安萨里把知识分为"有效的"和"装饰性的" — 改变生命的才是真知识。',
        keyQuotes: [
          { quote: '真正的知识不仅仅是信息，而是改变人的东西', explanation: '区分"知道"和"懂得" — 如果你的生命没因此改变，那只是信息。' },
          { quote: '知识像药，只有服下去才有效', explanation: '读书不践行 = 收集药方却不吃药。企业家最大的浪费是"学而不用"。' },
        ],
        practiceHint: '回想你最近读的一本书。它改变了你什么具体行为？如果没有，它对你就是"装饰性知识"。',
      },
      {
        chapterNo: 2, title: '忏悔之书', subtitle: '回归的艺术',
        originalText: '安萨里说："忏悔(Tawbah)不是一次性的仪式，而是持续一生的姿态。\n\n完整的忏悔包含三步：\n第一步 — 承认错误。不找借口，不怪别人，直视自己的过失。\n第二步 — 真诚地后悔。不是害怕惩罚，而是心痛自己偏离了正道。\n第三步 — 决心不再犯。不是说不可能再犯 — 人是软弱的 — 而是此刻就停止，不再找借口。\n\n如果你伤害了别人，除了向真主忏悔，还必须向那个人道歉或补偿。没有这一步的忏悔是不完整的。\n\n最美的忏悔发生在你还没被发现之前。发现后的忏悔往往掺杂了对惩罚的恐惧。"',
        commentary: '安萨里的忏悔论是精细的心理学 — 区分"真忏悔"与"假忏悔"。',
        keyQuotes: [
          { quote: '忏悔不是一次性的仪式，而是持续一生的姿态', explanation: '修行不是一次得道，而是日复一日地回到正道。企业家的自省也是如此。' },
          { quote: '最美的忏悔发生在你还没被发现之前', explanation: '真正的品格是在无人看见时的选择。' },
        ],
        practiceHint: '今天选一件你最近做得不对的事，实践安萨里三步法：承认→后悔→决心。然后真诚道歉。',
      },
    ],
  },
  {
    slug: 'ibn-arabi-wisdom', title: '智慧珍宝', titleEn: 'Fusus al-Hikam',
    author: '伊本·阿拉比(Ibn Arabi)', era: '1229年',
    ring: 3, categorySlug: 'islam',
    summary: '苏非派"最伟大的导师"伊本·阿拉比的代表作，以27位先知为主题，阐述神圣智慧的27个面向。',
    significance: '苏非主义理论体系的巅峰。影响从但丁到荣格的无数西方思想家。',
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 60,
    tags: ['伊本阿拉比', '苏非', '存在一元论', '先知'], sortOrder: 13,
    relatedSlugs: ['masnavi', 'rumi-garden'],
    chapters: [
      {
        chapterNo: 1, title: '亚当之慧', subtitle: '神圣镜像',
        originalText: '伊本·阿拉比说："真主想要在一面镜子中看见自己，于是创造了人。人的心是能够映照神圣的唯一受造物。\n\n亚当的特殊性不在于他是第一个人，而在于他是第一个意识到自己是神的镜子的人。这就是「真主按自己的形象造人」的真义。\n\n每个人心中都有一面镜子。但大多数人的镜子蒙着灰尘 — 欲望、恐惧、自我。擦掉灰尘，镜子就能映照神的光。\n\n修行就是擦镜子。不是向外求什么，而是让里面的东西显现出来。"',
        commentary: '伊本·阿拉比最著名的隐喻 — 人心如镜，修行如擦拭。',
        keyQuotes: [
          { quote: '真主想要在镜子中看见自己，于是创造了人', explanation: '人的存在有宇宙意义 — 你不是偶然，你是神圣自我认识的一部分。' },
          { quote: '修行就是擦镜子', explanation: '所有的修行方法本质相同 — 去除遮蔽本心光明的东西。' },
        ],
        practiceHint: '今天觉察你的"灰尘" — 每次情绪起伏时问："这是哪种灰尘？恐惧？贪婪？骄傲？"识别就是擦拭的开始。',
      },
      {
        chapterNo: 2, title: '存在的统一', subtitle: '万物皆一',
        originalText: '伊本·阿拉比说："真正的存在只有一个 — 那就是真主的存在。万物的「存在」都是借来的，是真主存在的反光。\n\n这不是说万物不存在 — 万物确实存在。但它们存在的方式是「相对的」 — 每一个都依赖别的才能存在。只有真主是「绝对的」 — 自存的、不依赖任何东西的。\n\n当你看见一朵花，你看见的既是花，也是真主的一个面向。花是有限的，但它在宇宙中的位置、它的美、它的存在本身，都是无限者的显现。\n\n所以伊本·阿拉比说：「无论你向哪里看，真主的面都在那里。」(引古兰经2:115)\n\n这就是存在一元论(Wahdat al-Wujud)的核心 — 看见一切中的神圣，而不是把世界与神对立起来。"',
        commentary: '存在一元论是伊本·阿拉比思想的核心 — 神不在世界之外，而在世界的每一处。',
        keyQuotes: [
          { quote: '无论你向哪里看，真主的面都在那里', explanation: '神不是一个地方或一个人，而是一切存在背后的那个。学会在平凡中看见神圣。' },
          { quote: '花是有限的，但它的美是无限者的显现', explanation: '美、爱、善 — 都不是孤立的现象，而是通向终极的门。' },
        ],
        practiceHint: '今天选一样平凡的东西(一片叶子、一杯水、一个人的笑)，凝视它1分钟，尝试看见其中的神圣。',
      },
    ],
  },

  // ─── TIBETAN +2 ─────────────────────────────
  {
    slug: 'padmasambhava-terma', title: '莲师心要', titleEn: 'Padmasambhava Terma Teachings',
    author: '莲花生大士(Padmasambhava)', era: '8世纪(10-14世纪伏藏取出)',
    ring: 3, categorySlug: 'tibetan',
    summary: '宁玛派祖师莲花生大士留下的"伏藏"(Terma)精要，后世伏藏师陆续取出，是藏密最神秘的教法体系。',
    significance: '藏传佛教宁玛派的核心。莲师被视为"第二佛陀"，其伏藏教法至今仍在取出。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 50,
    tags: ['莲花生', '宁玛', '伏藏', '大圆满'], sortOrder: 12,
    relatedSlugs: ['bardo-thodol', 'kunzang-lama'],
    chapters: [
      {
        chapterNo: 1, title: '自然解脱', subtitle: '让念头自己解脱',
        originalText: "莲师说：\"当念头生起时，不要追随它，也不要压制它。只是看着它，就像看着天空中的云 — 云会自己飘走。\n\n念头的本质是空性的。如果你去追，它就变成实的；如果你看穿它的本质，它就自然消失。\n\n这叫做'自然解脱'(Self-Liberation) — 念头不需要你去做什么，它自己会解脱。\n\n初学者常犯两个错误：\n一是追随念头 — 一个想法起来，心就跑了。\n二是压制念头 — 想要「无念」的状态，结果更累。\n\n正确的方式是第三种：看着念头，不跟不压，让它自己来自己去。这就是大圆满的精髓。\"",
        commentary: '莲师最深的教法 — 念头本身就是解脱，不需要对治。',
        keyQuotes: [
          { quote: '念头不需要你去做什么，它自己会解脱', explanation: '所有的修行方法中，最高的是"不修" — 信任本心自然的智慧。' },
          { quote: '追随是一错，压制是二错，看着是正道', explanation: '这是对待一切情绪的最高法门。企业家处理压力时用这个方法。' },
        ],
        practiceHint: '今天用5分钟做"看云"练习 — 坐着，让任何念头自己来自己去。不追不压，只是看。',
      },
      {
        chapterNo: 2, title: '临终中阴教言', subtitle: '死亡的艺术',
        originalText: '莲师说："一切生者必死。但死亡不是终结 — 死亡是一次最大的机会。\n\n临终的那一刻，生命的能量最强，心识最清晰。如果你能在那一刻认出光明本性，就能一步解脱。\n\n这就是《中阴闻教得度》(Bardo Thodol)的秘密 — 在活着的时候准备好，让死亡成为你最后的老师。\n\n但更重要的是：每一刻都是一次小的死亡。\n\n每一个念头生起又消失，这是死亡。\n每一口呼吸进入又出去，这是死亡。\n每一天睡去又醒来，这是死亡。\n\n学会在每一次小死亡中放下，大死亡来临时你就不会慌乱。"',
        commentary: '莲师教法的核心之一 — 把生死看作连续的过程，而非突然的事件。',
        keyQuotes: [
          { quote: '每一刻都是一次小的死亡', explanation: '每一次放下都是一次死亡的练习。企业家最难的是放下 — 项目、团队、控制。' },
          { quote: '让死亡成为你最后的老师', explanation: '把人生最终的结局纳入决策，80%的焦虑会消失。' },
        ],
        practiceHint: '今晚睡前做一个小仪式：把今天彻底"送走" — 不带入明天。睡眠就是小死亡，明早醒来就是重生。',
      },
    ],
  },
  {
    slug: 'life-of-milarepa', title: '米拉日巴尊者传', titleEn: 'The Life of Milarepa',
    author: '藏巴·尊珠·嘉波(Tsang Nyön Heruka)', era: '1488年',
    ring: 3, categorySlug: 'tibetan',
    summary: '藏传佛教史上最著名的圣者米拉日巴的自传体传记，记录他从复仇者到大成就者的传奇一生。',
    significance: '世界文学史上最动人的灵修传记之一。托尔斯泰、鲁迅都曾赞叹。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 55,
    tags: ['米拉日巴', '噶举', '苦行', '忏悔'], sortOrder: 13,
    relatedSlugs: ['milarepa-songs', 'gampopa-mahamudra'],
    chapters: [
      {
        chapterNo: 1, title: '罪与忏悔', subtitle: '复仇者的觉醒',
        originalText: '米拉日巴年轻时家道中落，叔父霸占了他家的财产。母亲命他学黑巫术报复仇人。他学成后用巫术杀了35个仇家，又用冰雹毁了他们的庄稼。\n\n但复仇的满足没有持续。每一个深夜，他都被自己杀死的人的面孔困扰。他意识到：「我为了母亲的怒气，造下了无可挽回的罪业。这罪业的果报比仇人家的财产重得多。」\n\n米拉日巴开始寻找能救赎他的上师。他找到了玛尔巴译师。玛尔巴看出他的根器，却故意折磨他 — 让他在山坡上盖房子，盖好又拆，拆了又盖，一共七次。\n\n米拉日巴每次都流着眼泪照做。他知道：这些苦是他自己造的罪业必须还的债。没有捷径。',
        commentary: '米拉日巴的故事是最彻底的忏悔典范 — 他用一生的苦行偿还年轻时的罪。',
        keyQuotes: [
          { quote: '这罪业的果报比仇人家的财产重得多', explanation: '复仇的代价永远比想象的大。这是所有"以眼还眼"的最终结局。' },
          { quote: '这些苦是他自己造的罪业必须还的债。没有捷径', explanation: '真正的改变没有捷径。想要轻易获得的人永远停在表面。' },
        ],
        practiceHint: '想一件你曾经做错的事。不是去忘记它，而是问自己："我还能做什么来弥补？"然后去做。',
      },
      {
        chapterNo: 2, title: '雪山独修', subtitle: '最后的证悟',
        originalText: '玛尔巴将大手印法传给米拉日巴后，让他去雪山独修。米拉日巴在喜马拉雅山中的山洞里住了12年，只穿一件麻布衣，只吃野生的荨麻 — 吃到全身都变成了绿色。\n\n有一次，他的姐姐来找他，看见他瘦骨嶙峋、赤身裸体、浑身绿色，哭着说："哥哥，你到底图什么？下山吧，我养你。"\n\n米拉日巴平静地说："妹妹，世人为了这个身体奔波一生，可这身体终将死去。我为了永恒的东西在修行。我现在每一刻都是富足的 — 你看我的食物(荨麻)，我的衣服(麻布)，我的宫殿(山洞) — 我什么都不缺。"\n\n他证悟后，留下了十万道歌，成为藏传佛教最伟大的修行者之一。\n\n他的最后教言是：「我的修行很简单 — 从不欺骗自己。」',
        commentary: '米拉日巴用12年的极端苦行证明：彻底放下外物才能获得真自由。',
        keyQuotes: [
          { quote: '世人为了这个身体奔波一生，可这身体终将死去', explanation: '90%的焦虑来自对身体和物质的过度执着。定期问自己："我在为什么而奔波？"' },
          { quote: '我的修行很简单 — 从不欺骗自己', explanation: '最难的修行。所有的痛苦源于自欺。诚实是最短的解脱之路。' },
        ],
        practiceHint: '今天做一件"不欺骗自己"的小事 — 承认一个你一直假装没看见的事实。只要一件。',
      },
    ],
  },

  // ─── CHRISTIANITY +2 ──────────────────────────
  {
    slug: 'interior-castle', title: '灵心城堡', titleEn: 'The Interior Castle',
    author: '圣女大德兰(Teresa of Ávila)', era: '1577年',
    ring: 3, categorySlug: 'christianity',
    summary: '16世纪西班牙加尔默罗会改革家大德兰的灵修巨著，以"七重城堡"比喻灵魂走向神的七个阶段。',
    significance: '天主教神秘主义的最高峰。大德兰是历史上第一位被天主教会封为"教会圣师"的女性(1970年)。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 60,
    tags: ['大德兰', '加尔默罗', '神秘', '灵修'], sortOrder: 13,
    relatedSlugs: ['confessions-augustine', 'imitation-christ'],
    chapters: [
      {
        chapterNo: 1, title: '第一重城堡', subtitle: '灵魂的入口',
        originalText: "大德兰说：\"灵魂像一座城堡，由一颗钻石或一块纯净水晶制成。里面有许多房间，就像天上有许多住处。\n\n但大多数人从来没有进入过自己的城堡。他们以为自己在城堡里，其实只是在城墙外徘徊。\n\n第一重城堡的入口是 — 祈祷和反省。这听起来很简单，但做到的人很少。\n\n因为大多数人的心被外面的世界充满了：声音、影像、忙碌。他们以为自己在'活着'，其实只是被外界牵着走。真正的活是从进入自己内心开始的。\n\n当你第一次进入城堡时，你会发现里面很黑、很乱、很多蛇(指恶念)。不要害怕。光会随着你的进入慢慢点亮。\"",
        commentary: '大德兰把灵魂比作城堡是她最伟大的隐喻 — 每个人内心都有神圣的空间。',
        keyQuotes: [
          { quote: '大多数人以为自己在城堡里，其实只是在城墙外徘徊', explanation: '很多人一生都没进入过自己的内心。外在的成就无法替代内在的深度。' },
          { quote: '真正的活是从进入自己内心开始的', explanation: '外在的忙碌不是生命的全部。没有内在维度的生命是扁平的。' },
        ],
        practiceHint: '今天独处15分钟，关掉所有设备，什么都不做。只是"进入自己"。你会发现这比想象的难。',
      },
      {
        chapterNo: 2, title: '第七重城堡', subtitle: '神秘联合',
        originalText: '大德兰说："经过前六重城堡的净化和成长，灵魂来到了最深处的第七重城堡 — 那里是神直接居住的地方。\n\n在这里，灵魂与神的联合不再是感受、不再是异象、不再是狂喜 — 而是一种永恒的、安静的、确定的合一。\n\n奇妙的是，到达第七重城堡的人并不会离开世界 — 恰恰相反，他们变得更加活跃、更加有效地为世界服务。因为他们的行动不再来自焦虑或野心，而来自那个深处的宁静。\n\n大德兰自己就是例子 — 她在最深的祈祷中依然管理修道院、改革修会、写作教学。她的行动力不是减少了，而是增强了。\n\n真正的神秘主义者不是逃避世界的人 — 是比任何人都更深地进入世界的人。因为他们有一个永不枯竭的源头。"',
        commentary: '大德兰的神秘主义颠覆了一个刻板印象 — 深度的灵修不是逃避，而是更有效地参与。',
        keyQuotes: [
          { quote: '真正的神秘主义者是比任何人都更深地进入世界的人', explanation: '灵修的深度决定行动的力度。表面的忙碌永远不如深度的宁静产出多。' },
          { quote: '他们的行动不再来自焦虑或野心，而来自那个深处的宁静', explanation: '企业家最高的状态 — 从宁静中行动，而不是从焦虑中反应。' },
        ],
        practiceHint: '本周选一天，工作前先15分钟静默。比较那天的工作质量与其他日子的差别。',
      },
    ],
  },
  {
    slug: 'dark-night-soul', title: '心灵的黑夜', titleEn: 'Dark Night of the Soul',
    author: '十字若望(John of the Cross)', era: '约1585年',
    ring: 3, categorySlug: 'christianity',
    summary: '大德兰的门徒、西班牙神秘主义诗人十字若望的代表作，描述灵魂净化过程中的"黑夜"经验。',
    significance: '为"灵性危机"提供了最深刻的神学解读 — 黑夜不是神的缺席，而是更深的临在。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 45,
    tags: ['十字若望', '黑夜', '净化', '加尔默罗'], sortOrder: 14,
    relatedSlugs: ['interior-castle', 'confessions-augustine'],
    chapters: [
      {
        chapterNo: 1, title: '感官的黑夜', subtitle: '初学者的净化',
        originalText: '十字若望说："当一个人开始认真灵修时，起初会有许多甘甜的体验 — 祈祷时感到喜乐，读经时心里发热，想到神时眼中含泪。\n\n但在某个时刻，这些甘甜突然消失了。祈祷变得干燥，读经变得枯燥，心中一片死寂。这个人开始怀疑：「是不是我做错了什么？神离开我了吗？」\n\n其实恰恰相反。神并没有离开 — 神正在靠近得更深。\n\n初期的甘甜像母乳 — 它喂养婴儿，但不是给成人的食物。当一个灵魂开始长大，神就把母乳拿走，让它学会吃「干粮」。\n\n这就是「感官的黑夜」 — 神在清理你对「感觉良好」的依赖，好让你能在「没有感觉」中依然信靠。\n\n这是爱的洁净，不是惩罚。"',
        commentary: '十字若望最大的贡献 — 他让"灵性枯燥"这个普遍经验获得了意义。',
        keyQuotes: [
          { quote: '神并没有离开 — 神正在靠近得更深', explanation: '当你感到与神隔绝时，往往是最接近神的时候。只是形式变了。' },
          { quote: '神在清理你对"感觉良好"的依赖', explanation: '如果你的信仰只在感觉好时才成立，那不是信仰是情绪。' },
        ],
        practiceHint: '下次工作"枯燥无味"时，不要立刻寻求刺激。停下来问："这个枯燥在教我什么？"',
      },
      {
        chapterNo: 2, title: '灵性的黑夜', subtitle: '更深的净化',
        originalText: '十字若望说："感官的黑夜只是序曲。灵性的黑夜更深更重。\n\n在这个阶段，不仅你的感觉消失了，连你的信仰、希望、爱都感到动摇。你开始怀疑一切 — 你的修行有意义吗？神真的存在吗？你的生命有价值吗？\n\n这是所有圣人都经历过的黑暗之夜。连耶稣在十字架上都喊：「我的神，我的神，你为什么离弃我？」\n\n但这个黑夜是必须经历的。因为只有在这个绝望的深处，你才能放下所有对神的「概念」 — 那些你以为是神但其实只是你对神的想象。\n\n当所有的概念都死去后，真正的神 — 超越一切概念的那一位 — 才能以他本来的面目出现。\n\n所以黑夜不是灾难，是恩典。不是堕落，是飞翔的前奏。"',
        commentary: '十字若望对"灵性危机"的正面诠释 — 最深的黑暗就是最接近光明的时刻。',
        keyQuotes: [
          { quote: '只有在绝望的深处，你才能放下对神的"概念"', explanation: '最大的障碍不是怀疑，而是你对"正确答案"的执着。' },
          { quote: '黑夜不是灾难，是恩典', explanation: '企业家最黑暗的时刻往往是转折点。学会拥抱它而不是逃避。' },
        ],
        practiceHint: '回想你人生最黑暗的时刻。现在回头看，它带给你什么？这个视角可以帮助你度过下一个黑夜。',
      },
    ],
  },

  // ─── CONFUCIANISM +2 ────────────────────────
  {
    slug: 'zeng-guofan-letters', title: '曾国藩家书', titleEn: 'Zeng Guofan Family Letters',
    author: '曾国藩', era: '清朝(1840-1871)',
    ring: 3, categorySlug: 'confucianism',
    summary: '晚清名臣曾国藩写给家人的1500余封信，涉及修身、治家、理政、治军、教子等方方面面，是中国最著名的家书。',
    significance: '被誉为"千古第一完人的人生智慧总集"。毛泽东说："近代人物中，吾唯独服曾文正公。"',
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 55,
    tags: ['曾国藩', '家书', '修身', '治家'], sortOrder: 13,
    relatedSlugs: ['lunyu', 'chuanxi-lu'],
    chapters: [
      {
        chapterNo: 1, title: '致诸弟·修身要诀', subtitle: '早起·勤俭·恒心',
        originalText: '曾国藩致诸弟书：\n\n"吾观古今能任天下事者，皆有三字诀：勤、恒、慎。\n\n勤者，早起一日做一日之事，不推明日；\n恒者，日积月累不间断，虽慢却远；\n慎者，每事三思而后行，不因小而忽。\n\n吾自三十以后，每日必做日课：\n一、读书十页；二、写字百字；三、记录过失；四、反省一日；五、早起一小时。\n\n此五事若能坚持十年，必有大成。诸弟切勿以事小而轻之。\n\n人之败，非由大祸，而由小懒。小懒累积成大懒，大懒则一事无成。"',
        commentary: '曾国藩修身核心 — 不是天才，而是以"勤恒慎"三字补拙。',
        keyQuotes: [
          { quote: '勤、恒、慎三字诀', explanation: '曾国藩一生功业的秘诀。没有这三字，再高的天赋也无用。' },
          { quote: '人之败，非由大祸，而由小懒', explanation: '失败很少来自一次大错，常常来自日复一日的小懈怠。' },
          { quote: '小懒累积成大懒', explanation: '今天晚睡一小时，明天晚起一小时，一周就乱了。防微杜渐。' },
        ],
        practiceHint: '选一件你想养成的习惯，每天只做5分钟。坚持21天。这就是"恒"的开始。',
      },
      {
        chapterNo: 2, title: '致纪泽·读书之法', subtitle: '有志有识有恒',
        originalText: '曾国藩致长子纪泽书：\n\n"盖士人读书，第一要有志，第二要有识，第三要有恒。\n\n有志则不甘为下流；\n有识则知学问无尽，不敢以一得自足；\n有恒则断无不成之事。\n\n此三者缺一不可。汝今日课虽不多，但贵在坚持。「勤靠不如练靠」，「不怕慢就怕站」。\n\n读书之要，在于得法。不必求多，一日读一页，细嚼慢咽。读书如交友，不在多而在精。一本书真的读透了，胜过十本书浮光掠影。\n\n又有一法：读书必将心得记下。不记则看过就忘，等于未读。每日必写读书笔记，此是做学问的唯一法门。"',
        commentary: '曾国藩给长子的读书方法论 — 志、识、恒三字，至今仍是最好的学习法则。',
        keyQuotes: [
          { quote: '有志则不甘为下流，有识则不敢自足，有恒则无事不成', explanation: '三者缺一不可。志是起点，识是谦逊，恒是力量。' },
          { quote: '读书如交友，不在多而在精', explanation: '读100本书没读透一本书有用。深度永远胜过数量。' },
          { quote: '读书必将心得记下', explanation: '不记笔记的阅读等于没读。输出才能真正内化。' },
        ],
        practiceHint: '选一本你觉得重要的书，本月读完并写3页心得。不求快，求深。',
      },
    ],
  },
  {
    slug: 'zhu-zi-jia-xun', title: '朱子家训', titleEn: 'Zhu Zi Family Rules',
    author: '朱柏庐(朱用纯)', era: '明末清初',
    ring: 3, categorySlug: 'confucianism',
    summary: '明末清初朱柏庐所作，仅500余字，却涵盖修身、持家、处世、教子的全部要点，是中国最普及的家训。',
    significance: '三百多年来中国家庭的必读教材，海内外华人家庭大多能背诵几句。',
    difficulty: 2, oxStageMin: 1, oxStageMax: 9, readingMins: 15,
    tags: ['朱柏庐', '家训', '持家', '蒙学'], sortOrder: 14,
    relatedSlugs: ['zeng-guofan-letters', 'daxue'],
    chapters: [
      {
        chapterNo: 1, title: '持家之本', subtitle: '勤俭与秩序',
        originalText: '黎明即起，洒扫庭除，要内外整洁。\n既昏便息，关锁门户，必亲自检点。\n一粥一饭，当思来处不易；半丝半缕，恒念物力维艰。\n宜未雨而绸缪，毋临渴而掘井。\n自奉必须俭约，宴客切勿留连。\n器具质而洁，瓦缶胜金玉；饮食约而精，园蔬愈珍馐。\n勿营华屋，勿谋良田。\n三姑六婆，实淫盗之媒；婢美妾娇，非闺房之福。\n奴仆勿用俊美，妻妾切忌艳妆。\n祖宗虽远，祭祀不可不诚；子孙虽愚，经书不可不读。',
        commentary: '《朱子家训》前半篇 — 日常生活的细节即是修身的道场。',
        keyQuotes: [
          { quote: '一粥一饭，当思来处不易；半丝半缕，恒念物力维艰', explanation: '对物的珍惜就是对人的尊重。浪费是最隐蔽的傲慢。' },
          { quote: '宜未雨而绸缪，毋临渴而掘井', explanation: '所有重要的事都要提前准备。临时抱佛脚的人走不远。' },
          { quote: '器具质而洁，瓦缶胜金玉', explanation: '实用胜过奢华。真正的品味是简单而精致。' },
        ],
        practiceHint: '今天做一件"未雨绸缪"的事 — 提前准备一个你知道会发生但还没准备的事情。',
      },
      {
        chapterNo: 2, title: '处世之道', subtitle: '德行与气量',
        originalText: '居身务期质朴，教子要有义方。\n勿贪意外之财，勿饮过量之酒。\n与肩挑贸易，毋占便宜；见贫苦亲邻，须加温恤。\n刻薄成家，理无久享；伦常乖舛，立见消亡。\n兄弟叔侄，须分多润寡；长幼内外，宜法肃辞严。\n听妇言，乖骨肉，岂是丈夫？重资财，薄父母，不成人子。\n嫁女择佳婿，毋索重聘；娶媳求淑女，毋计厚奁。\n见富贵而生谄容者，最可耻；遇贫穷而作骄态者，贱莫甚。\n居家戒争讼，讼则终凶；处世戒多言，言多必失。\n毋恃势力而凌逼孤寡，毋贪口腹而恣杀生禽。\n乖僻自是，悔误必多；颓惰自甘，家道难成。',
        commentary: '《朱子家训》后半篇 — 做人做事的伦理准则。',
        keyQuotes: [
          { quote: '见富贵而生谄容者，最可耻；遇贫穷而作骄态者，贱莫甚', explanation: '对不同身份的人一视同仁 — 这是品格的试金石。' },
          { quote: '居家戒争讼，处世戒多言', explanation: '家里不要对簿公堂，外面不要说太多话。这两条能避免90%的麻烦。' },
          { quote: '乖僻自是，悔误必多', explanation: '固执己见的人最容易犯错。谦虚是最好的防错机制。' },
        ],
        practiceHint: '今天观察你自己："我对所有人都一视同仁吗？还是对上谄下傲？"诚实一点。',
      },
    ],
  },

  // ─── TAOISM +2 ────────────────────────
  {
    slug: 'wuzhen-pian', title: '悟真篇', titleEn: 'Wu Zhen Pian',
    author: '张伯端(紫阳真人)', era: '北宋(1075年)',
    ring: 3, categorySlug: 'taoism',
    summary: '道教内丹学南宗创始人张伯端的核心著作，以诗偈形式阐述金丹大道的修炼次第。',
    significance: '内丹学"南宗"的开山之作，与《周易参同契》并称为"丹经双璧"。',
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 40,
    tags: ['张伯端', '内丹', '南宗', '性命双修'], sortOrder: 18,
    relatedSlugs: ['daodejing', 'baopuzi', 'qingjing-jing'],
    chapters: [
      {
        chapterNo: 1, title: '性命双修', subtitle: '金丹大道',
        originalText: "张伯端《悟真篇》开篇七律：\n\n\"不求大道出迷途，纵负贤才岂丈夫？\n百岁光阴石火烁，一生身世水泡浮。\n只贪利禄求荣显，不顾形容暗瘁枯。\n试问堆金等山岳，无常买得不来无？\"\n\n张伯端说：\"世人只知追求功名利禄，不知性命双修。百年光阴转瞬即逝，到头来一场空。\n\n所谓'性'，是心性、智慧、觉悟；所谓'命'，是元气、生命力、身体。只修性不修命，是「独脚行」；只修命不修性，是「盲人跑」。\n\n真正的丹道必须性命双修 — 既要明心见性，又要养气炼形。两者如车之两轮，缺一不可。\"",
        commentary: '张伯端的核心命题 — 性命双修是内丹学与纯心性之学的分野。',
        keyQuotes: [
          { quote: '只贪利禄求荣显，不顾形容暗瘁枯', explanation: '很多成功的企业家在追求事业中牺牲了健康。这是本末倒置。' },
          { quote: '只修性不修命，独脚行；只修命不修性，盲人跑', explanation: '身心不能分割。西方的心理学与东方的气功，各缺一半。合起来才完整。' },
          { quote: '堆金等山岳，无常买得不来无', explanation: '钱再多也买不来时间。死亡是最大的平等。' },
        ],
        practiceHint: '检视你过去一周：花在心性(读书/冥想)和命功(运动/睡眠)上的时间各是多少？平衡了吗？',
      },
      {
        chapterNo: 2, title: '先天一气', subtitle: '内丹本原',
        originalText: '张伯端说："内丹之道，不在外求。「先天一气」就在你的身体里 — 在呼吸之间、在静坐之时、在心定之际。\n\n修丹三步：\n第一步 — 筑基。通过安静的生活、规律的作息、清淡的饮食，让身心回到自然状态。不急不躁。\n第二步 — 炼气化神。在安静中收摄散乱的念头，让气从散漫回归凝聚。如收散乱的羊群回圈。\n第三步 — 炼神还虚。当气充满时，让心完全虚静，神与道合。这时才算真正入门。\n\n注意：这些不是神秘学。就是让身体、能量、意识逐层回到本源的过程。\n\n「金丹」不是金属，是你生命能量的高度凝聚。「还丹」不是返老还童，是让散失的生命回到完整。\n\n企业家最需要这个 — 不是为了长生，而是为了在每个重要决定时有充足的生命能量。"',
        commentary: '内丹学的现代诠释 — 它不是神秘学，而是系统的身心能量管理。',
        keyQuotes: [
          { quote: '先天一气不在外求', explanation: '你所有的力量源头都在自己里面。向外找的人永远找不到。' },
          { quote: '金丹不是金属，是生命能量的高度凝聚', explanation: '最珍贵的不是你拥有的外物，是你生命能量的质量。' },
        ],
        practiceHint: '今天尝试"筑基"一次 — 早睡1小时，不看手机，吃一顿清淡饭。感受身体的反馈。',
      },
    ],
  },
  {
    slug: 'guan-yin-zi', title: '关尹子', titleEn: 'Guan Yin Zi',
    author: '关尹喜(托名)', era: '先秦至唐代整理',
    ring: 3, categorySlug: 'taoism',
    summary: '传说老子西出函谷关时所授关令尹喜之书，九篇讲宇宙万物与修道方法，是道家重要典籍。',
    significance: '与《道德经》《庄子》《列子》并列为道家四大经典。其思想融合了道家、阴阳家、神仙家。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 30,
    tags: ['关尹子', '尹喜', '函谷关', '道家'], sortOrder: 19,
    relatedSlugs: ['daodejing', 'liezi', 'zhuangzi'],
    chapters: [
      {
        chapterNo: 1, title: '一宇篇', subtitle: '道无形无声',
        originalText: '关尹子曰："非有道不可言，不可言即道。非有道不可思，不可思即道。\n\n天物怒流，人事错错然，若若乎回也，戛戛乎斗也。圣人过之，如风过竹，不留一叶。\n\n一者不独，人言之未着，物感之未应，此之谓元一。\n\n智虑愈多，愈不知道；思虑愈深，愈远于道。孩童无知，近道尤甚。"',
        commentary: '《关尹子》开篇即揭示道的超言绝相 — 可以言说的都不是真道。',
        keyQuotes: [
          { quote: '不可言即道', explanation: '最深的东西无法用语言传达。企业家要学会"无言的教导"。' },
          { quote: '圣人过之，如风过竹，不留一叶', explanation: '真正的修道者面对人事如风过竹林 — 经历而不粘着。' },
          { quote: '智虑愈多，愈不知道', explanation: '想得太多反而离本质更远。有时候直觉比分析更准确。' },
        ],
        practiceHint: '下次做决定卡住时，停止分析，闭眼3分钟让直觉浮现。这是关尹子的"近道"法。',
      },
      {
        chapterNo: 2, title: '九药篇', subtitle: '治心九药',
        originalText: '关尹子曰："人心如药有九：\n\n一曰静药。治浮躁。\n二曰和药。治怒气。\n三曰止药。治贪欲。\n四曰损药。治骄慢。\n五曰明药。治愚暗。\n六曰慎药。治轻率。\n七曰宽药。治狭隘。\n八曰谦药。治自满。\n九曰忘药。治执着。\n\n此九药者，非外来，人人本有之。遇病则用之。\n\n圣人常服此九药，故心如明镜，应物而不滞。凡人服药一时，忘药则病作，故修道贵在日日不断。"',
        commentary: '《关尹子》最实用的篇章 — 给"心病"开出的九味药方。',
        keyQuotes: [
          { quote: '九药非外来，人人本有之', explanation: '所有的心理工具你天生就有。问题是你没有使用。' },
          { quote: '凡人服药一时，忘药则病作', explanation: '偶尔的修行不起作用。只有日日不断才能治病。' },
        ],
        practiceHint: '从九药中选出你现在最需要的一味(如静药/忘药)，今日专门练习它一次。',
      },
    ],
  },

  // ─── HINDUISM +2 ────────────────────────
  {
    slug: 'yoga-vasistha', title: '瓦希斯塔瑜伽', titleEn: 'Yoga Vasistha',
    author: '瓦希斯塔圣人(托名)', era: '约公元10-14世纪',
    ring: 3, categorySlug: 'hinduism',
    summary: '印度教最长的哲学诗篇之一(32,000偈)，瓦希斯塔圣人向年轻的罗摩王子讲授解脱智慧，以故事承载哲理。',
    significance: '不二吠檀多哲学的经典之一，罗摩那尊者推荐的首选读物。故事的文学性与哲学深度并存。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 55,
    tags: ['瓦希斯塔', '罗摩', '不二论', '故事'], sortOrder: 13,
    relatedSlugs: ['viveka-chudamani', 'vedanta-sutra', 'upanishad'],
    chapters: [
      {
        chapterNo: 1, title: '罗摩的抑郁', subtitle: '觉醒前的危机',
        originalText: "年轻的罗摩王子从朝圣归来后陷入深深的抑郁。他对父王说：\"父亲，我看清了这个世界的真相 — 一切都是无常的、充满痛苦的、如梦如幻的。\n\n财富会消失，美貌会衰老，爱人会死亡，名誉会失落。连我们称之为'现实'的东西，也不过是心的投射。\n\n那么，活着还有什么意义？快乐不过是两次痛苦之间的间隙。成就不过是失败的前奏。\"\n\n众臣都担心王子疯了。但圣人瓦希斯塔微笑着说：\"王子没有疯 — 他开始觉醒了。这种对无常的深刻洞察，是一切真正智慧的开端。\n\n但单有这个洞察会陷入绝望。让我给你真正的智慧 — 不是否认世界，而是超越世界。\"",
        commentary: '《瓦希斯塔瑜伽》的开场 — 罗摩的抑郁是所有严肃求道者的必经之路。',
        keyQuotes: [
          { quote: '快乐不过是两次痛苦之间的间隙', explanation: '看清这一点的人要么陷入绝望，要么找到真正的出路。' },
          { quote: '对无常的深刻洞察是一切真正智慧的开端', explanation: '企业家也会有这样的时刻 — 当你达到一个顶峰后发现"就这样？"。这是升维的信号。' },
        ],
        practiceHint: '问自己："我所追求的东西，即使得到了，快乐能持续多久？"诚实回答。这个问题会改变你的方向。',
      },
      {
        chapterNo: 2, title: '心即世界', subtitle: '觉知的创造力',
        originalText: "瓦希斯塔对罗摩说：\"这个世界完全是你心的产物。不是说世界不存在 — 它确实存在 — 而是说它以你看待它的方式存在。\n\n同一件事，在快乐的心中是喜悦，在痛苦的心中是痛苦，在智者的心中什么都不是。\n\n我给你讲一个故事 — 国王拉法那的故事。这个国王梦见自己是一个乞丐，饱受饥寒二十年。醒来后他无法相信自己又变回了国王。那乞丐的二十年是真的还是假的？\n\n罗摩问：\"既是真的也是假的？\"\n\n瓦希斯塔说：\"比这更深 — 那乞丐的二十年既不是真的也不是假的。它只是一个经验。\n\n你现在的生活也一样。它是你的经验，但它不是'你'。当你知道这一点时，你就自由了 — 不是逃避经验，而是不被经验定义。\"",
        commentary: '《瓦希斯塔瑜伽》的核心教法 — 用故事承载"世界即心的创造"这个深刻命题。',
        keyQuotes: [
          { quote: '同一件事，在快乐的心中是喜悦，在痛苦的心中是痛苦', explanation: '外境不决定你的状态，是你的状态决定你看见什么样的外境。' },
          { quote: '它是你的经验，但它不是"你"', explanation: '最深的心理学洞察 — 你是经验的容器，不是经验本身。' },
        ],
        practiceHint: '今天每遇到一件让你反应强烈的事，提醒自己："这是我的经验，但不是我。"观察反应有什么变化。',
      },
    ],
  },
  {
    slug: 'ramana-maharshi', title: '罗摩那尊者言教', titleEn: 'Talks with Ramana Maharshi',
    author: '罗摩那尊者(Ramana Maharshi)', era: '1935-1939年对话记录',
    ring: 3, categorySlug: 'hinduism',
    summary: '20世纪印度最伟大的圣者罗摩那尊者(1879-1950)的对话录，他用最简单的问题"我是谁？"指引无数人觉醒。',
    significance: '被毛姆、荣格、坎贝尔等西方思想家推崇为"现代印度最纯粹的觉悟者"。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 40,
    tags: ['罗摩那', '自我探询', '我是谁', '觉醒'], sortOrder: 14,
    relatedSlugs: ['viveka-chudamani', 'ramakrishna-gospel'],
    chapters: [
      {
        chapterNo: 1, title: '我是谁', subtitle: '最简单的修行',
        originalText: '求道者问："尊者，我怎样才能觉悟？"\n\n罗摩那尊者平静地说："不要寻找觉悟。只要问一个问题 — 我是谁？\n\n不是理论上回答，而是真的追问。当你有一个念头时，问：「这个念头是谁的？」 — 答案会是「我的」。然后问：「这个我是谁？」\n\n不要给自己标签。不要说「我是一个商人」、「我是一个父亲」、「我是一个佛教徒」 — 这些都是角色。问「我是谁」时，要追问到所有角色之前的那个。\n\n这个追问本身就是修行。不需要呼吸法，不需要姿势，不需要咒语。只需要诚实地问，然后保持沉默听答案。"',
        commentary: '罗摩那尊者用最简单的"我是谁"法门震动了整个20世纪的灵修世界。',
        keyQuotes: [
          { quote: '不要寻找觉悟。只要问一个问题 — 我是谁？', explanation: '不是向外求，是向内探询。一切修行的核心。' },
          { quote: '这些都是角色。问"我是谁"时，要追问到所有角色之前的那个', explanation: '你的名片不是你。你的职业不是你。那个"不是"之下的"是"才是你。' },
        ],
        practiceHint: '今天做5次"我是谁"的追问。每次只需30秒。不要急着给答案，让答案自己浮现。',
      },
      {
        chapterNo: 2, title: '行动中的不动', subtitle: '瑜伽士的日常',
        originalText: "一位商人问：\"尊者，我每天要处理几十件事，哪有时间修行？\"\n\n罗摩那尊者说：\"修行不在于做什么，而在于以什么态度做。\n\n你的手在打算盘，你的心可以问'我是谁'。\n你的口在和客户讲话，你的觉知可以保持内观。\n你的身体在奔波，你的真我始终不动。\n\n太阳在天上移动，但它的中心从不移动。海面有波浪，但海底始终宁静。你也是这样 — 外在的活动不需要停止，内在的中心要保持不动。\n\n真正的瑜伽士不是逃到山洞里的人 — 是在市场上依然「在家」的人。\"",
        commentary: '罗摩那尊者对在家修行者最重要的指导 — 行动与不动可以同时存在。',
        keyQuotes: [
          { quote: '修行不在于做什么，而在于以什么态度做', explanation: '禅不是特殊的活动，是你做任何事时的特殊品质。' },
          { quote: '真正的瑜伽士是在市场上依然"在家"的人', explanation: '在繁忙中保持内心的宁静 — 这是企业家最高的修行。' },
        ],
        practiceHint: '明天工作中每完成一个任务，停3秒问"我是谁"。看看一天结束时你的心态有什么不同。',
      },
    ],
  },

  // ─── SHINTO +1 ─────────────────────────
  {
    slug: 'hagakure', title: '叶隐闻书', titleEn: 'Hagakure',
    author: '山本常朝口述·田代阵基记录', era: '1716年',
    ring: 3, categorySlug: 'shinto',
    summary: '江户时代佐贺藩武士山本常朝的武士道口述录，11卷1300余条，被誉为"武士道真髓"。',
    significance: '与《武士道》并列为日本武士道精神的最高文本。三岛由纪夫终生推崇。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 40,
    tags: ['叶隐', '武士道', '山本常朝', '佐贺'], sortOrder: 12,
    relatedSlugs: ['jinno-shotoki', 'kojiki'],
    chapters: [
      {
        chapterNo: 1, title: '武士道即死狂', subtitle: '生死一念',
        originalText: "山本常朝说：\"武士道者，死狂也。\n\n所谓'死狂'，不是鲁莽地去死 — 而是每天早晨在脑中彻底地「死一次」。\n\n具体做法：每天清晨静坐片刻，想象各种死法 — 被箭射死、被刀砍死、被火烧死、被水淹死、病死、老死、意外死... 把每一种都体验一遍，直到你觉得死亡是自然的。\n\n这样做了之后，这一整天你都是「已经死过的人」。一个已经死过的人还有什么可怕的？还有什么可贪的？还有什么可犹豫的？\n\n每天都「死一次」的人，每天都活得最彻底。这就是武士道的核心 — 不是崇拜死亡，而是通过死亡获得彻底的生。\"",
        commentary: '《叶隐》最著名的一句话 — "武士道即死狂"。常被误读，实为彻底活着的方法论。',
        keyQuotes: [
          { quote: '武士道者，死狂也', explanation: '不是寻死，是每天清晨在心中死一次。这种人反而最勇敢地活着。' },
          { quote: '一个已经死过的人还有什么可怕的？', explanation: '克服恐惧的最深方法 — 把最坏的结局先接受。然后什么都不再困扰你。' },
        ],
        practiceHint: '明早静坐5分钟，想象自己今天就死了。想象告别的场景。然后起身 — 你会发现今天的时间变得特别珍贵。',
      },
      {
        chapterNo: 2, title: '奉公之道', subtitle: '主君与家',
        originalText: '山本常朝说："武士奉公之道，在于专一。\n\n今日之世，武士多有怨言。怨主君吝啬、怨同僚嫉妒、怨上级无能。但这些怨言本身就是不武士道。\n\n真正的武士怎么做？「主君托我以事，我全力做之，不论功赏。主君不知我之好，我不改其忠。主君误解我，我默然受之。」\n\n这不是愚忠 — 是把「奉公」当作自己的修行。你做事不是为了主君，是为了自己的道。\n\n如果主君真的无德，你可以辞去 — 但不能带着怨恨。辞去之前，做到最后一刻都是全心全意。\n\n一个心里有怨的人，事业做不大。怨气会侵蚀你的力量。"',
        commentary: '《叶隐》对"奉公"的独特诠释 — 不是为了主君，而是为了自己的道。',
        keyQuotes: [
          { quote: '奉公不是为了主君，是为了自己的道', explanation: '企业家的顶级心态 — 做事不是为了老板或客户，是为了修炼自己。' },
          { quote: '一个心里有怨的人，事业做不大。怨气会侵蚀你的力量', explanation: '真相。抱怨是最大的能量漏洞。' },
        ],
        practiceHint: '今天检视你心中对谁还有怨气。选一个，今天就决定"放下这份怨" — 不是原谅他们，是释放自己。',
      },
    ],
  },

  // ─── JUDAISM +1 ─────────────────────────
  {
    slug: 'tanya', title: '塔妮亚', titleEn: 'Tanya',
    author: '沙雷姆·本·巴鲁赫(哈巴德第一代)', era: '1797年',
    ring: 3, categorySlug: 'judaism',
    summary: '哈巴德(Chabad)哈西德运动的核心著作，系统阐述犹太人心灵的结构、善恶的斗争与服侍神的方法。',
    significance: '被称为"哈巴德的口传妥拉"。全球数百万哈西德犹太人每日研读的根本文本。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 50,
    tags: ['塔妮亚', '哈巴德', '哈西德', '灵性心理学'], sortOrder: 12,
    relatedSlugs: ['hasidic-tales', 'pirkei-avot'],
    chapters: [
      {
        chapterNo: 1, title: '两个灵魂', subtitle: '神圣与兽性',
        originalText: '塔妮亚开篇说："每个犹太人心中都有两个灵魂 — 神圣灵魂(Nefesh Elokit)和兽性灵魂(Nefesh Behamit)。\n\n神圣灵魂爱神、渴望行善、追求真理。\n兽性灵魂爱自己、追求快感、逃避痛苦。\n\n这两个灵魂终身在争夺你的心。平常人的心是兽性灵魂的主场 — 神圣灵魂只在特殊时刻(祈祷、行善、感动时)出现。\n\n修行不是消灭兽性灵魂 — 它是神创造的，也有它的用处 — 而是让神圣灵魂成为主人，兽性灵魂成为仆人。\n\n当神圣灵魂统治时，即使是吃饭、做生意、照顾家庭，都成为神圣的行为。这就是哈西德的核心 — 把日常变成神圣。"',
        commentary: '《塔妮亚》核心 — 每个人心中都有两个声音，修行是让对的那个做主。',
        keyQuotes: [
          { quote: '修行不是消灭兽性灵魂，而是让它成为仆人', explanation: '压抑欲望不是解决方案。正确使用欲望才是。这是犹太智慧的精髓。' },
          { quote: '把日常变成神圣', explanation: '你不需要辞职去修道院。你的办公桌就是你的修行道场。' },
        ],
        practiceHint: '今天识别一次你的两个灵魂在争斗 — 比如想吃垃圾食品(兽性)vs想健康(神圣)。让神圣灵魂赢一次。',
      },
      {
        chapterNo: 2, title: '中间人', subtitle: 'Beinoni的境界',
        originalText: "塔妮亚说：\"人分三种：\n\n1. 义人(Tzaddik) — 兽性灵魂已经被征服，心中只有对善的渴望。这是极少数的圣人。\n2. 恶人(Rasha) — 被兽性灵魂完全控制。即使做善事也是出于自私。\n3. 中间人(Beinoni) — 两个灵魂还在斗争，但每一次斗争都让善的一方获胜。\n\n大多数人一生都不可能成为义人 — 这需要罕见的灵性天赋。但每个人都可以成为'中间人'。\n\n中间人的特征是：虽然心里有恶念，但从不让恶念变成行动或言语。就像水坝挡住洪水 — 水还在那里，但不会泛滥。\n\n塔妮亚说：'成为中间人就是最高的成就。「不要追求」心中无恶念「的不可能境界 — 追求」有恶念但不被它控制'的真实境界。\"",
        commentary: '塔妮亚对"完美主义陷阱"的治愈 — 不要追求没有黑暗，要追求不被黑暗控制。',
        keyQuotes: [
          { quote: '成为中间人就是最高的成就', explanation: '现实主义的修行观。不求圣人，但求自律。' },
          { quote: '水还在那里，但不会泛滥', explanation: '情绪/欲望还在，但不被它们驱动。这是最成熟的心理状态。' },
        ],
        practiceHint: '今天不追求"完美无恶念"，只追求"有念而不动"。每次心中起负念时，只是看着它，不让它出口或行动。',
      },
    ],
  },
];

async function main() {
  console.log('📜 M38.5 经论++ v5 — 主流传统二线经论补充...');

  console.log('  新增经论...');
  let newScriptures = 0;
  let newChapters = 0;

  for (const def of NEW_SCRIPTURES) {
    const existing = await prisma.scripture.findUnique({ where: { slug: def.slug } });
    if (existing) {
      console.log(`  ⏭  已存在: ${def.slug}`);
      continue;
    }
    const category = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
    if (!category) {
      console.warn(`  ⚠️  category 不存在: ${def.categorySlug}`);
      continue;
    }
    const scripture = await prisma.scripture.create({
      data: {
        slug: def.slug,
        title: def.title,
        titleEn: def.titleEn,
        author: def.author,
        era: def.era,
        ring: def.ring,
        categoryId: category.id,
        tradition: category.tradition,
        summary: def.summary,
        significance: def.significance,
        difficulty: def.difficulty,
        oxStageMin: def.oxStageMin,
        oxStageMax: def.oxStageMax,
        readingMins: def.readingMins,
        tags: def.tags,
        chapterCount: def.chapters.length,
        sortOrder: def.sortOrder,
        relatedIds: [],
      },
    });
    for (const ch of def.chapters) {
      await prisma.scriptureChapter.create({
        data: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          keyQuotes: ch.keyQuotes ?? [],
          practiceHint: ch.practiceHint,
        },
      });
      newChapters++;
    }
    newScriptures++;
  }
  console.log(`  ✓ ${newScriptures} 新经论, ${newChapters} 新章节`);

  console.log('  填充新经论关联...');
  let relatedCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const scripture = await prisma.scripture.findUnique({ where: { slug: def.slug } });
    if (!scripture) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    await prisma.scripture.update({
      where: { id: scripture.id },
      data: { relatedIds: related.map((r) => r.id) },
    });
    relatedCount++;
  }
  console.log(`  ✓ ${relatedCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log('\n📜 M38.5 完成！');
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
