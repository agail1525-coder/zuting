import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── 12 生命命题 ─────────────────────────────────────────────────────
const QUESTIONS = [
  { code: 'ORIGIN_PURPOSE', title: '生命的起源与目的', titleEn: 'Origin & Purpose', question: '我从哪里来？为何而活？', depth: '人类自有意识以来即追问此问。AI 观察：不同文化对"起源"的回答塑造其整个价值体系。' },
  { code: 'SUFFERING', title: '苦难的意义', titleEn: 'Meaning of Suffering', question: '为何有苦？苦从何来？如何面对？', depth: '苦是跨文化共同经验。AI 观察：文化对苦的诠释决定了应对策略——超越、救赎、接纳或转化。' },
  { code: 'LOVE_RELATIONSHIP', title: '爱与关系', titleEn: 'Love & Relationship', question: '如何去爱？如何与他人共在？', depth: '爱是文化的结晶体。AI 观察：从神圣之爱到世俗之爱，不同文化塑造不同关系伦理。' },
  { code: 'WEALTH_DESIRE', title: '财富与欲望', titleEn: 'Wealth & Desire', question: '欲望能否满足？财富是福是祸？', depth: 'AI 观察：各文化对欲望持截然不同态度——从禁欲到节制到积极。财富伦理是文化深层结构。' },
  { code: 'FREEDOM_FATE', title: '自由与命运', titleEn: 'Freedom & Fate', question: '我是自由的吗？命运是否注定？', depth: 'AI 观察：自由意志与命运预定的张力是所有哲学传统的核心议题。' },
  { code: 'DEATH_TRANSCENDENCE', title: '死亡与超越', titleEn: 'Death & Transcendence', question: '死后何往？如何超越死亡？', depth: 'AI 观察：面对死亡的方式，定义一个文化的终极关怀。' },
  { code: 'SIN_REDEMPTION', title: '罪与救赎', titleEn: 'Sin & Redemption', question: '人是否有原罪？如何获得救赎？', depth: 'AI 观察："罪"的概念在各文化中差异极大——从本体论之罪到关系性过失。' },
  { code: 'KNOWLEDGE', title: '知识与无知', titleEn: 'Knowledge & Ignorance', question: '何为真知？无知是祸还是福？', depth: 'AI 观察：知识论根本上影响一个文化的教育方式与觉悟路径。' },
  { code: 'SELF_OTHER', title: '自我与他者', titleEn: 'Self & Other', question: '我是谁？如何对待他者？', depth: 'AI 观察：自我概念的边界（从"无我"到"灵魂"）决定了伦理的基本形态。' },
  { code: 'TIME_ETERNITY', title: '时间与永恒', titleEn: 'Time & Eternity', question: '时间是线性的还是循环的？何为永恒？', depth: 'AI 观察：时间观是文化的深层编码——线性时间催生进步主义，循环时间孕育回归智慧。' },
  { code: 'BODY_SOUL', title: '身体与灵魂', titleEn: 'Body & Soul', question: '身心是一体还是分离？', depth: 'AI 观察：身心关系的不同解答，孕育不同的修行与医学传统。' },
  { code: 'LEGACY_IMMORTALITY', title: '传承与不朽', titleEn: 'Legacy & Immortality', question: '何为真正的不朽？如何传承？', depth: 'AI 观察：不朽的形式——肉身、精神、血脉、功业——折射文化的时间想象。' },
];

// ─── 6 高优先级文化 × 12 命题 = 72 观点（精炼版）──────────────────────
// 结构：[religionSlug, questionCode, corePosition, elaboration]
const PERSPECTIVES: Array<[string, string, string, string]> = [
  // 佛教 ────────────────────────
  ['buddhism', 'ORIGIN_PURPOSE', '无始以来，因缘和合，目的在解脱', '生命无始无终，由业力因缘流转。目的不在"起源"，而在当下觉悟，出离轮回。'],
  ['buddhism', 'SUFFERING', '苦是真谛，执着是因，涅槃是出路', '四圣谛：苦、集、灭、道。承认苦、洞察苦因（贪嗔痴）、以八正道灭苦。'],
  ['buddhism', 'LOVE_RELATIONSHIP', '慈悲喜舍，无缘大慈', '爱超越占有，本质是四无量心。最高之爱是愿一切众生离苦。'],
  ['buddhism', 'WEALTH_DESIRE', '欲为苦本，然非禁欲而是断执', '财富本身中性，对财富的执着才是苦源。正命获取、布施运用。'],
  ['buddhism', 'FREEDOM_FATE', '业力不是宿命，而是自作自受的可变之流', '每个当下的心念行为都在造新业。自由在于觉察与选择。'],
  ['buddhism', 'DEATH_TRANSCENDENCE', '生死一如，涅槃不生不灭', '死非终结而是下一次因缘。超越死亡即觉悟无生之性。'],
  ['buddhism', 'SIN_REDEMPTION', '无原罪，只有无明与业障', '人本具佛性，只因无明造业。解脱不靠外来救赎，靠自性觉悟。'],
  ['buddhism', 'KNOWLEDGE', '闻思修三慧，般若为究竟', '世俗知识有限，出世间智慧（般若）直见实相。'],
  ['buddhism', 'SELF_OTHER', '无我，自他不二', '"我"是五蕴假合，本无实体。破我执即见众生平等。'],
  ['buddhism', 'TIME_ETERNITY', '三世循环，当下即永恒', '过去、现在、未来相续流转。一念三千，当下一念具足永恒。'],
  ['buddhism', 'BODY_SOUL', '无灵魂，只有心识相续', '无独立永恒之灵魂，只有识的因缘相续。身是修行之器。'],
  ['buddhism', 'LEGACY_IMMORTALITY', '法身不灭，心灯相传', '肉身必朽，法（教法）与证悟不朽。师徒传灯是真不朽。'],

  // 道教 ────────────────────────
  ['taoism', 'ORIGIN_PURPOSE', '道生万物，法自然、致虚极', '生命源于道，目的是复归于道。无为而无不为。'],
  ['taoism', 'SUFFERING', '苦由失道，守柔处下即解', '苦源于违背自然、强求不属于己之物。守柔、知足、归朴即离苦。'],
  ['taoism', 'LOVE_RELATIONSHIP', '上善若水，利万物而不争', '真爱如水，润物无声，不占有、不控制。'],
  ['taoism', 'WEALTH_DESIRE', '知足常乐，少私寡欲', '财富越多，牵累越重。"祸莫大于不知足"。'],
  ['taoism', 'FREEDOM_FATE', '道法自然，顺势而为即自由', '自由不是反抗命运，而是洞悉道的运行并顺应之。'],
  ['taoism', 'DEATH_TRANSCENDENCE', '生死如昼夜，庄周梦蝶', '生死是气的聚散。真人"不知悦生，不知恶死"。'],
  ['taoism', 'SIN_REDEMPTION', '无罪只有失道，复返本真', '无原罪概念。"恶"是离道而动，回归婴儿般纯朴即救赎。'],
  ['taoism', 'KNOWLEDGE', '为学日益，为道日损', '知识越积越多，悟道却要越减越少。大智若愚。'],
  ['taoism', 'SELF_OTHER', '天地与我并生，万物与我为一', '破除主客二元，与天地万物同体感通。'],
  ['taoism', 'TIME_ETERNITY', '周而复始，道永恒运行', '时间循环，阴阳交替。永恒在节律本身。'],
  ['taoism', 'BODY_SOUL', '身心一如，性命双修', '精气神三位一体，修命不离修性。'],
  ['taoism', 'LEGACY_IMMORTALITY', '真人长生，与道合真', '得道者精神不朽。子孙、门人、典籍皆是传承。'],

  // 儒家 ────────────────────────
  ['confucianism', 'ORIGIN_PURPOSE', '天命之谓性，率性之谓道', '生命源于天命，目的在成就君子人格，参赞化育。'],
  ['confucianism', 'SUFFERING', '君子忧道不忧贫，以仁化苦', '苦由礼崩乐坏、仁心蔽塞。修身齐家治国即减苦之道。'],
  ['confucianism', 'LOVE_RELATIONSHIP', '仁者爱人，差序有等', '爱有亲疏远近：亲亲、仁民、爱物。由己及人的推扩之爱。'],
  ['confucianism', 'WEALTH_DESIRE', '富而好礼，义然后取', '不反对财富，但"不义而富且贵，于我如浮云"。'],
  ['confucianism', 'FREEDOM_FATE', '知命而尽人事，五十知天命', '承认命运之限，但在限内尽最大努力。'],
  ['confucianism', 'DEATH_TRANSCENDENCE', '未知生焉知死，三不朽', '不谈彼岸，专注此生。立德、立功、立言为不朽。'],
  ['confucianism', 'SIN_REDEMPTION', '人之初性本善，为仁由己', '无原罪，只有"习相远"。反求诸己、克己复礼即自我救赎。'],
  ['confucianism', 'KNOWLEDGE', '格物致知，知行合一', '真知必须践行。朱熹穷理，阳明致良知。'],
  ['confucianism', 'SELF_OTHER', '己所不欲勿施于人', '黄金律的东方表述。推己及人。'],
  ['confucianism', 'TIME_ETERNITY', '逝者如斯夫，薪火相传', '时间如流水，但礼乐文明可传承千秋。'],
  ['confucianism', 'BODY_SOUL', '形神相须，修身为本', '身体是道德实践的载体。"身体发肤受之父母"。'],
  ['confucianism', 'LEGACY_IMMORTALITY', '三不朽：立德立功立言', '肉身有尽，德功言可永垂。家族绵延也是不朽。'],

  // 基督文化 ────────────────────────
  ['christianity', 'ORIGIN_PURPOSE', '神按自己形象造人，为荣耀神而活', '生命源于神的爱。目的在荣耀神、与神同行。'],
  ['christianity', 'SUFFERING', '苦是试炼，十字架是救赎之路', '苦难考验信心，基督以十字架承担世人之苦。因信称义。'],
  ['christianity', 'LOVE_RELATIONSHIP', '爱是恒久忍耐、又有恩慈', '神即爱。爱邻如己，爱仇敌。哥林多前书13章是爱的诗篇。'],
  ['christianity', 'WEALTH_DESIRE', '贪财是万恶之根，施比受更有福', '财富是管家职分，非所有。"富人进天国比骆驼穿针眼还难"。'],
  ['christianity', 'FREEDOM_FATE', '神的预定与人的自由意志并存', '神全知全能预定，但人有道德选择。奥古斯丁与加尔文传统。'],
  ['christianity', 'DEATH_TRANSCENDENCE', '复活的盼望，永生之约', '死亡因基督复活而被战胜。信徒在末日复活得永生。'],
  ['christianity', 'SIN_REDEMPTION', '原罪与十字架救赎', '人因亚当堕落而有原罪，唯靠基督宝血救赎。'],
  ['christianity', 'KNOWLEDGE', '敬畏耶和华是智慧的开端', '世俗知识之上有神圣启示。圣经是真理之源。'],
  ['christianity', 'SELF_OTHER', '爱人如己，爱是律法的总纲', '人都是神的形象。"无论作什么，都要从心里作，像是给主作的"。'],
  ['christianity', 'TIME_ETERNITY', '线性时间，历史有终末', '从创造到末日的线性历史观。神在时间外又进入时间。'],
  ['christianity', 'BODY_SOUL', '身体是圣灵的殿', '身心统一，身体不是灵魂的牢笼。复活时身体也得救赎。'],
  ['christianity', 'LEGACY_IMMORTALITY', '永生在神里，名字记在生命册上', '真正的不朽是灵魂在神里永存。'],

  // 伊斯兰 ────────────────────────
  ['islam', 'ORIGIN_PURPOSE', '真主造化人类，为敬拜与代治', '生命源于真主。目的是敬拜真主（ibadah）、做大地代治者（khalifah）。'],
  ['islam', 'SUFFERING', '苦是考验，忍耐（sabr）是美德', '今世苦难是考验。忍耐者将得天堂之乐。'],
  ['islam', 'LOVE_RELATIONSHIP', '爱真主与众生，穆斯林如一体', '首要是爱真主，其次爱人类。穆斯林社群（ummah）如一体。'],
  ['islam', 'WEALTH_DESIRE', '天课（zakat）净财，克制私欲', '财富是真主寄存。每年缴 2.5% 天课济贫是宗教义务。'],
  ['islam', 'FREEDOM_FATE', '真主前定（qadar）与人的责任并存', '万事真主前定，但人有选择与责任。"主不加给人不能承受的"。'],
  ['islam', 'DEATH_TRANSCENDENCE', '末日复活，天堂与火狱', '死亡是过渡。末日真主审判，信者入天堂，不信入火狱。'],
  ['islam', 'SIN_REDEMPTION', '无原罪，直接向真主忏悔', '人生而纯洁（fitrah）。犯罪后向真主忏悔即得赦免，无需中保。'],
  ['islam', 'KNOWLEDGE', '求知是每位穆斯林的义务', '先知言："求知，从摇篮到坟墓"。知识分启示与理性两途。'],
  ['islam', 'SELF_OTHER', '顺服真主，善待邻居', '自我在顺服（islam 即顺服）中实现。"你们中最好者是对家人最好者"。'],
  ['islam', 'TIME_ETERNITY', '线性时间，末日是终点', '从创造到末日清算的线性时间。今世短暂，后世永恒。'],
  ['islam', 'BODY_SOUL', '身是真主赐托，心是战场', '身体是真主托管物。"大圣战"是内心对私欲的斗争。'],
  ['islam', 'LEGACY_IMMORTALITY', '三件善功不绝：义捐、知识、善后', '先知言：人死后，三件事功德继续——流水善捐、有益知识、为其祈祷的后代。'],

  // 印度文化 ────────────────────────
  ['hinduism', 'ORIGIN_PURPOSE', '阿特曼即梵，四大人生目标（purushartha）', '个我（atman）本与宇宙梵（Brahman）为一。人生四目标：法、利、欲、解脱。'],
  ['hinduism', 'SUFFERING', '苦源于无明，业报轮回', '不识真我便受苦。通过业瑜伽、智瑜伽、信瑜伽脱苦。'],
  ['hinduism', 'LOVE_RELATIONSHIP', '巴克蒂（bhakti）——对神的挚爱', '最高之爱是对神的献身（bhakti）。爱是解脱之道之一。'],
  ['hinduism', 'WEALTH_DESIRE', 'artha 与 kama 是合法追求，但须以 dharma 约束', '财富（artha）与欲望（kama）是四目标之二，但必须在正法（dharma）下追求。'],
  ['hinduism', 'FREEDOM_FATE', '业力决定境遇，自由在当下选择', '业（karma）塑造当下处境，但此刻的念行决定未来业。'],
  ['hinduism', 'DEATH_TRANSCENDENCE', '轮回中解脱（moksha）为究竟', '死是换身，真正超越是 moksha——跳出轮回，证梵我一如。'],
  ['hinduism', 'SIN_REDEMPTION', '无原罪，无明才是根本', '不识真我是根本"罪"。通过知识、奉献、行动纯化自我。'],
  ['hinduism', 'KNOWLEDGE', 'Jnana（智）通向解脱', '两种知识：世俗（apara）与梵知（para）。后者直接解脱。'],
  ['hinduism', 'SELF_OTHER', 'Tat tvam asi——你就是那（梵）', '终极真理：我即梵，你即梵，众生皆梵。'],
  ['hinduism', 'TIME_ETERNITY', '循环劫（yuga），梵的呼吸', '时间循环——四劫更替。梵的一日即宇宙周期。'],
  ['hinduism', 'BODY_SOUL', '多层身体鞘，阿特曼最核心', '身体五鞘：食物、气、心意、智慧、极乐。真我超越所有鞘。'],
  ['hinduism', 'LEGACY_IMMORTALITY', '阿特曼不生不灭，梵我一如', '真我永恒，本不生不灭。解脱者与梵合一即究竟不朽。'],
];

// ─── 6 文化 × 7 阶段 = 42 阶段指引 ─────────────────────────────────
// [religionSlug, stage, title, keyWisdom]
const STAGES: Array<[string, string, string, string]> = [
  ['buddhism', 'BIRTH', '佛教：人身难得，因缘显现', '人身难得如盲龟遇浮木。此生是修行殊胜机会。'],
  ['buddhism', 'GROWTH', '佛教：熏习善根，培养觉性', '童年种善因，少年学戒定慧。'],
  ['buddhism', 'MARRIAGE', '佛教：在家菩萨，相互成就', '配偶互为善知识，以慈悲智慧共建净土。'],
  ['buddhism', 'CAREER', '佛教：正命事业，利他即利己', '八正道之"正命"——不害众生的职业。'],
  ['buddhism', 'MIDLIFE', '佛教：从执到放，观照无常', '中年是最适合深入修行的阶段。看破放下，方得自在。'],
  ['buddhism', 'AGING', '佛教：修行佳期，预备往生', '老年身衰而心净。精进念佛、禅修，为临终做准备。'],
  ['buddhism', 'DEATH', '佛教：临终正念，随佛往生', '最后一念决定去向。助念、善终极为重要。'],

  ['taoism', 'BIRTH', '道教：婴儿至纯，先天之气盈满', '初生之婴先天元气最盛，"专气致柔能如婴儿乎"。'],
  ['taoism', 'GROWTH', '道教：存朴守真，勿失赤子心', '成长勿过度知识化，保持天真未凿。'],
  ['taoism', 'MARRIAGE', '道教：阴阳和合，夫妇同心修道', '婚姻是阴阳合道。双修共进。'],
  ['taoism', 'CAREER', '道教：无为而治，功成身退', '事业顺势而为，成后不居功。'],
  ['taoism', 'MIDLIFE', '道教：内丹修炼，返还先天', '中年转向内修，精气神合一。'],
  ['taoism', 'AGING', '道教：养生延年，与道合真', '顺四时、节饮食、导引炼气。'],
  ['taoism', 'DEATH', '道教：形解飞升，归于大道', '死是气散归道。修行有成者"羽化"登真。'],

  ['confucianism', 'BIRTH', '儒家：生而有性，父母之恩', '人之初性本善。孝亲始于生。'],
  ['confucianism', 'GROWTH', '儒家：洒扫应对，立志向学', '童蒙养正。"志于道、据于德、依于仁、游于艺"。'],
  ['confucianism', 'MARRIAGE', '儒家：夫妇有别，齐家之始', '婚姻是社会伦理起点。"夫义妇顺"，相敬如宾。'],
  ['confucianism', 'CAREER', '儒家：修己以安人，义以立事', '三十而立。事业是道德实践场。'],
  ['confucianism', 'MIDLIFE', '儒家：四十不惑，五十知天命', '中年是格物致知大成期。'],
  ['confucianism', 'AGING', '儒家：六十耳顺，七十从心所欲', '老年人格圆熟，自然合道。'],
  ['confucianism', 'DEATH', '儒家：尽人事以俟天命，朝闻道夕死可矣', '专注此生道德完成。慎终追远，礼敬祖先。'],

  ['christianity', 'BIRTH', '基督：神形象的降生，受洗入约', '每个婴孩都是神形象。洗礼立约。'],
  ['christianity', 'GROWTH', '基督：在主里成长，主日学与家庭祭坛', '"教养孩童，使他走当行的道"。'],
  ['christianity', 'MARRIAGE', '基督：二人成为一体，神所配合', '婚姻是神圣圣约。"神所配合的，人不可分开"。'],
  ['christianity', 'CAREER', '基督：尽心作工如同作在主前', '职业是圣召（vocation）。忠心管家。'],
  ['christianity', 'MIDLIFE', '基督：回归圣召，结圣灵果子', '中年审视人生意义。仁爱喜乐和平等九种圣灵果子。'],
  ['christianity', 'AGING', '基督：白发是荣耀冠冕', '老年传承信仰，见证神恩。'],
  ['christianity', 'DEATH', '基督：在主里睡了，等候复活', '死亡是进入主怀抱。"死亡啊，你得胜的权势在哪里？"'],

  ['islam', 'BIRTH', '伊斯兰：念诵宣礼入耳，阿基卡献牲', '婴孩右耳诵宣礼、左耳诵伊卡麦。第七日献牲、命名、剪发。'],
  ['islam', 'GROWTH', '伊斯兰：七岁教礼拜，十岁严教', '"教你们的孩子七岁做礼拜，十岁若不做则管教"。'],
  ['islam', 'MARRIAGE', '伊斯兰：尼卡契约，婚姻是半个宗教', '先知言："婚姻是半个宗教"。夫妻相互庇护。'],
  ['islam', 'CAREER', '伊斯兰：合法（halal）谋生是义务', '合法谋生是宗教义务。禁利息（riba）、禁不义之财。'],
  ['islam', 'MIDLIFE', '伊斯兰：朝觐（hajj）之年，反省此生', '若有能力，一生至少一次朝觐麦加。中年朝觐深化信仰。'],
  ['islam', 'AGING', '伊斯兰：孝敬年老父母，不得说"呸"', '古兰经严令孝亲。老年专注崇拜与施济。'],
  ['islam', 'DEATH', '伊斯兰：归信作证，速葬归土', '临终念清真言。速葬、简葬、裹白布归土。'],

  ['hinduism', 'BIRTH', '印度：十六圣礼之始，garbhadhana 至 jatakarma', '从受孕到出生有多项圣礼（samskara）。命名仪式后入户。'],
  ['hinduism', 'GROWTH', '印度：梵行期（brahmacharya），受圣线', '第一人生阶段——梵行期。习吠陀、守贞、事师。'],
  ['hinduism', 'MARRIAGE', '印度：居家期（grihastha），供奉五祀', '第二人生阶段。结婚成家，供养神、祖、客、人、生物。'],
  ['hinduism', 'CAREER', '印度：履行种姓职责（svadharma）', '按自己 dharma 行事业。"做好自己的本分胜过做别人的本分"。'],
  ['hinduism', 'MIDLIFE', '印度：林栖期（vanaprastha），逐步放下', '第三人生阶段。孙辈出生后渐退隐修。'],
  ['hinduism', 'AGING', '印度：遁世期（sannyasa），追求解脱', '第四人生阶段。舍弃一切外缘，专志 moksha。'],
  ['hinduism', 'DEATH', '印度：恒河边火葬，灵魂转世或解脱', '死于恒河边为吉。火葬解脱身体，灵魂转世或入梵。'],
];

async function main() {
  console.log('🌱 Seeding Culture-Life (M40)...');

  // 1) 12 questions
  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    await prisma.lifeQuestion.upsert({
      where: { code: q.code as any },
      create: {
        code: q.code as any,
        title: q.title,
        titleEn: q.titleEn,
        question: q.question,
        philosophicalDepth: q.depth,
        sortOrder: i + 1,
      },
      update: {
        title: q.title,
        titleEn: q.titleEn,
        question: q.question,
        philosophicalDepth: q.depth,
        sortOrder: i + 1,
      },
    });
  }
  console.log(`  ✓ ${QUESTIONS.length} LifeQuestions`);

  // 2) Perspectives (72)
  let pCount = 0;
  for (const [slug, code, corePosition, elaboration] of PERSPECTIVES) {
    const religion = await prisma.religion.findUnique({ where: { slug } });
    if (!religion) {
      console.warn(`  ⚠ Religion not found: ${slug}`);
      continue;
    }
    const question = await prisma.lifeQuestion.findUnique({ where: { code: code as any } });
    if (!question) continue;

    await prisma.lifeQuestionPerspective.upsert({
      where: { questionId_religionId: { questionId: question.id, religionId: religion.id } },
      create: {
        questionId: question.id,
        religionId: religion.id,
        corePosition,
        elaboration,
        scriptureRefs: [],
        masterQuotes: [],
      },
      update: { corePosition, elaboration },
    });
    pCount++;
  }
  console.log(`  ✓ ${pCount} LifeQuestionPerspectives`);

  // 3) Stages (42)
  let sCount = 0;
  for (const [slug, stage, title, keyWisdom] of STAGES) {
    const religion = await prisma.religion.findUnique({ where: { slug } });
    if (!religion) continue;

    await prisma.lifeStageGuide.upsert({
      where: { religionId_stage: { religionId: religion.id, stage: stage as any } },
      create: {
        religionId: religion.id,
        stage: stage as any,
        title,
        keyWisdom,
        rituals: [],
        challenges: [],
      },
      update: { title, keyWisdom },
    });
    sCount++;
  }
  console.log(`  ✓ ${sCount} LifeStageGuides`);

  console.log('✅ Culture-Life seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
