/**
 * 60篇预种游记模板（每信仰5篇）
 * 5大主题：朝圣攻略 / 祖师智慧 / 商业实践 / 文化体验 / 跨信仰对话
 */

export interface GuideTemplate {
  title: string;
  content: string;
  coverImage: string;
  tags: string[];
}

const img = (kw: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(kw)}-${Math.floor(Math.random() * 10000)}/800/400`;

/** 通用内容生成器：用宗教/主题填充800-1200字模板 */
function makeContent(parts: string[]): string {
  return parts.filter(Boolean).join('\n\n');
}

/* ═══════ 模板生成器 ═══════ */

function siteGuide(religion: string, site: string, kw: string): GuideTemplate {
  return {
    title: `走进${site}：一位${religion}旅人的朝圣笔记`,
    coverImage: img(kw),
    tags: [site, '朝圣攻略'],
    content: makeContent([
      `第一次站在${site}前，我的呼吸都变得小心翼翼。这里是${religion}传统中最重要的圣地之一，承载着无数代信仰者的脚步与泪水。`,
      `**为什么是这里**\n这次朝圣我筹划了将近一年。倒不是因为距离有多远，而是因为我想用最虔诚的状态来拜访。${religion}的核心精神在这里有最纯粹的呈现，而我作为一个走过不少地方的旅人，深知"准备好的心"远比"到达"本身重要。`,
      `**交通与到达**\n建议提前查好交通时刻表。我选择了清晨抵达——晨光中的${site}格外肃穆，几乎没有游客，只有当地的修行者在做日课。如果时间允许，强烈推荐住在附近的朝圣者旅舍，能近距离感受这里的生活节奏。`,
      `**必看与必体验**\n第一是主殿/主祭区，请预留至少2小时静坐观想；第二是周边的小径，那里有许多代代相传的圣物和故事；第三一定要参加当地的早课或晚课，哪怕你听不懂语言，那种共同的虔诚会穿透语言的障碍直达内心。`,
      `**饮食与休息**\n这一带的素食/朝圣餐食非常用心，价格实惠。住宿不必豪华，简朴的环境反而更能进入状态。带一个保温杯、一双舒适的鞋、一本能记录的小本子就够了。`,
      `**给后来者的建议**\n请放下相机片刻，用眼睛和心去看；请准备一个真心想问的问题，遇到合适的人就开口；请预留至少3天时间——${site}不是一日游能消化的地方。`,
      `**离开时的感悟**\n我带回来的不是照片，是一种很难形容的"安住感"。回到城市生活后，每当焦躁的时候，我会闭眼回想${site}清晨的那束光。它一直都在。`,
      `愿你的旅途也能遇见那束光。🙏`,
    ]),
  };
}

function patriarchGuide(religion: string, name: string, kw: string): GuideTemplate {
  return {
    title: `${name}的智慧：穿越千年依然鲜活的教导`,
    coverImage: img(kw),
    tags: [name, '祖师智慧'],
    content: makeContent([
      `第一次接触${name}的教导是在一次旅行的图书馆里。那本书很旧，封面已经泛黄，但翻开第一页，我就被那种穿越时空的力量击中了。`,
      `**这位祖师是谁**\n${name}是${religion}传统中影响最深远的人物之一。他的一生跌宕起伏，但留下的核心教导却出奇地朴素：关于如何做人、如何面对苦难、如何与他人相处。`,
      `**核心教导**\n第一条：真正的智慧不在远方，而在每一个当下的选择里。第二条：面对困境时，向内看比向外求更有力量。第三条：服务他人，就是服务自己最深的部分。这三条看起来简单，但越走越觉得是一辈子的功课。`,
      `**我如何在旅途中实践**\n每次出发前，我会读一段${name}的语录，让那种安定的频率先进入心里。在旅途中遇到困难——航班取消、迷路、被骗——我都会想起祖师怎么说。慢慢地，那些困境反而成了修行的机会。`,
      `**最触动我的故事**\n据说${name}晚年时，有人问他一生最重要的领悟是什么。他只回答了一句话："温柔地对待自己，也温柔地对待这个世界。"我把这句话写在了我的旅行本扉页上。`,
      `**对现代人的启示**\n我们这个时代不缺信息，缺的是能让人安住的智慧。${name}的教导之所以历久弥新，就是因为它直指人心。无论你信什么、不信什么，这些智慧都值得一读。`,
      `推荐书单和资料我整理在评论区，欢迎交流。`,
    ]),
  };
}

function bizGuide(religion: string, topic: string, kw: string): GuideTemplate {
  return {
    title: `${religion}智慧如何重塑现代${topic}：3个真实案例`,
    coverImage: img(kw),
    tags: ['商业实践', topic],
    content: makeContent([
      `作为一个走过不少国家的旅人，我发现一个有趣的现象：那些真正持久的伟大企业，往往背后都有某种深厚的信仰底色。今天想跟大家分享${religion}传统如何影响现代${topic}。`,
      `**信仰与商业的真实连接**\n很多人以为信仰是出世的，商业是入世的，二者不相干。但当我深入了解${religion}的智慧后，我发现这种看法是误解。${religion}对${topic}有非常具体、可操作的洞见，关键在于你愿不愿意真正落地。`,
      `**案例一：日常决策**\n我曾访谈过一位深受${religion}影响的CEO。他说每次重大决策前，他都会先问自己三个问题：这件事是否符合本心？是否对所有相关方公平？十年后回看会不会后悔？这三个问题来源于他对${religion}智慧的实践，让他在很多关键时刻避免了短视的冲动。`,
      `**案例二：团队文化**\n另一家企业把${religion}的核心价值观写进了员工手册——但不是挂在墙上的口号，而是融入了招聘、考核、晋升的每一个环节。员工流失率在行业内最低，客户复购率最高。这就是文化的力量。`,
      `**案例三：危机应对**\n2020年的危机中，我看到一些${religion}背景的企业家做出了和市场截然不同的选择：不裁员，反而加薪；不削减投入，反而增加培训。短期看似乎不理性，但三年后回看，这些企业都成了行业的标杆。`,
      `**给管理者的3条建议**\n1. 建立你自己的"决策三问"，每天用；\n2. 把价值观变成具体的行为标准，不要停在口号；\n3. 在顺境时积累信任，逆境时才有底牌。`,
      `这些不是玄学，是真正经过时间检验的智慧。希望对你有启发。`,
    ]),
  };
}

function cultureGuide(religion: string, topic: string, kw: string): GuideTemplate {
  return {
    title: `沉浸式体验${religion}的${topic}：五感全开的一天`,
    coverImage: img(kw),
    tags: [topic, '文化体验'],
    content: makeContent([
      `如果你想真正了解一个文化，最好的方式不是看书，而是亲身参与一次他们的${topic}。这是我去年的一次深度体验记录。`,
      `**清晨：仪式开始**\n天还没亮我就起床了。当地朋友说，最重要的部分往往在天亮前就开始。空气里有香的味道，远处传来吟唱声——那一刻我就知道，这次不一样。`,
      `**视觉的盛宴**\n${topic}的视觉元素丰富得让人眼花缭乱。色彩、服饰、建筑、装饰，每一样都有深意。我学到的最重要一课是："不要只用眼睛看，要用心去问每个细节背后的故事。"`,
      `**听觉的洗礼**\n吟唱、鼓声、铃声、自然的风声——所有的声音组合在一起，形成一种近乎催眠的频率。当地人告诉我，这些声音不是为了好听，是为了让人的内心安静下来。我闭上眼，确实感受到了那种安定。`,
      `**味觉的连接**\n参与了一顿${religion}传统的共享餐食。食物简朴但充满祝福。最特别的是用餐前的祷告/感恩仪式，让我重新理解了什么叫"对食物的敬意"。`,
      `**与当地人的对话**\n午后，我和一位老人聊了很久。他没有受过高等教育，但说出的话每一句都像箴言。他说："我们做这些不是因为传统，是因为这是我们和世界对话的方式。"我把这句话记了下来。`,
      `**最感动的瞬间**\n仪式结尾时，所有人手牵手围成圆圈。不分国籍、不分语言、不分信仰，只是单纯地连接。那一刻我哭了。在现代生活中，我已经很久没有体验过如此纯粹的联结感。`,
      `**这次体验改变了什么**\n我开始相信，仪式的力量不在于形式本身，而在于它创造的"共同临在"。回去后，我也开始在自己的生活中创造类似的小仪式——一次专注的早餐、一次真诚的拥抱、一次没有手机的对话。`,
      `如果你有机会体验${topic}，请放下成见，敞开自己。你会带回来一些钱买不到的东西。`,
    ]),
  };
}

function interfaithGuide(religion: string, other: string, value: string, kw: string): GuideTemplate {
  return {
    title: `当${religion}遇见${other}：一场关于"${value}"的深夜对话`,
    coverImage: img(kw),
    tags: ['跨信仰对话', value],
    content: makeContent([
      `旅行最美的部分，永远是那些没有计划的相遇。这次我想分享一个关于跨信仰对话的真实故事——它彻底改变了我对"差异"的理解。`,
      `**相遇**\n那是在一个朝圣者旅舍。晚上九点，我在公共厨房泡茶，遇到了一位来自远方的${other}旅行者。我们都在找开水，互相让了让，就聊起来了。从天气聊到旅途，从旅途聊到为什么出发。`,
      `**意外的共鸣**\n我以为我们的信仰背景差异会让对话很尴尬，结果完全相反。当我们聊到"${value}"这个话题时，发现我们用不同的语言在表达完全相同的东西。她引用的经典里有"${value}"，我引用的经典里也有；她讲述的实践方式和我的方式只是细节不同，核心精神惊人地相似。`,
      `**让我眼界大开的观点**\n她跟我分享了一个我从未想过的角度："信仰不是关于'正确答案'，而是关于'更好的提问方式'。"她说她从小被教导要不断提问，而不是接受现成的答案。这个角度让我对自己的信仰传统也重新审视——我们是不是有时候太满足于答案了？`,
      `**让我深受启发的故事**\n她讲了一个她家族传承的故事：她的祖母经历过战乱，在最艰难的时候，是邻居——一位完全不同信仰背景的老人——救了她全家。从那以后，她家族的家训就是："信仰不是用来分别人的，是用来连接人的。"我把这句话默默记在心里。`,
      `**对话之后的领悟**\n我们聊到深夜十二点。临别前互换了联系方式，约定有机会去对方的圣地走一走。那一刻我突然明白：世界上的信仰像不同的语言，但表达的核心情感是相通的——爱、慈悲、敬畏、感恩、希望。`,
      `**写给所有旅人**\n如果你也热爱旅行，请不要错过这种跨信仰的对话机会。它不会动摇你的信仰，反而会让你的信仰更深更广。我们都在用各自的方式，朝着同一个光走去。`,
      `愿你在路上也能遇见这样的对话。🌍`,
    ]),
  };
}

/* ═══════ 12个信仰 × 5主题 = 60篇游记 ═══════ */

export const GUIDE_TEMPLATES: Record<string, GuideTemplate[]> = {
  buddhism: [
    siteGuide('佛教', '菩提伽耶', 'bodhgaya buddha temple'),
    patriarchGuide('佛教', '释迦牟尼', 'buddha statue'),
    bizGuide('佛教', '团队领导力', 'meditation business'),
    cultureGuide('佛教', '禅七体验', 'zen meditation'),
    interfaithGuide('佛教', '基督教', '慈悲与仁爱', 'monk church dialogue'),
  ],
  taoism: [
    siteGuide('道教', '武当山', 'wudang mountain taoist'),
    patriarchGuide('道教', '老子', 'laozi statue'),
    bizGuide('道教', '战略决策', 'taichi leadership'),
    cultureGuide('道教', '太极晨练', 'taichi morning'),
    interfaithGuide('道教', '神道教', '自然和谐', 'forest shrine'),
  ],
  confucianism: [
    siteGuide('儒教', '曲阜孔庙', 'confucius temple qufu'),
    patriarchGuide('儒教', '孔子', 'confucius statue'),
    bizGuide('儒教', '企业文化', 'chinese business etiquette'),
    cultureGuide('儒教', '书院讲学', 'chinese academy'),
    interfaithGuide('儒教', '佛教', '终身学习', 'library scholar'),
  ],
  christianity: [
    siteGuide('基督教', '耶路撒冷圣墓教堂', 'jerusalem holy sepulchre'),
    patriarchGuide('基督教', '圣方济各', 'st francis'),
    bizGuide('基督教', '仆人式领导', 'servant leadership'),
    cultureGuide('基督教', '复活节弥撒', 'easter church'),
    interfaithGuide('基督教', '伊斯兰教', '和平共处', 'church mosque'),
  ],
  islam: [
    siteGuide('伊斯兰教', '伊斯坦布尔蓝色清真寺', 'blue mosque istanbul'),
    patriarchGuide('伊斯兰教', '苏菲鲁米', 'rumi sufi'),
    bizGuide('伊斯兰教', '伦理金融', 'islamic finance'),
    cultureGuide('伊斯兰教', '开斋节', 'eid celebration'),
    interfaithGuide('伊斯兰教', '犹太教', '感恩与谦逊', 'jerusalem old city'),
  ],
  hinduism: [
    siteGuide('印度教', '瓦拉纳西', 'varanasi ganges'),
    patriarchGuide('印度教', '商羯罗', 'hindu sage'),
    bizGuide('印度教', '使命驱动', 'india business yoga'),
    cultureGuide('印度教', '排灯节', 'diwali festival'),
    interfaithGuide('印度教', '佛教', '慈悲与仁爱', 'india buddhism'),
  ],
  judaism: [
    siteGuide('犹太教', '耶路撒冷西墙', 'jerusalem western wall'),
    patriarchGuide('犹太教', '迈蒙尼德', 'maimonides'),
    bizGuide('犹太教', '创业精神', 'israel startup'),
    cultureGuide('犹太教', '安息日', 'shabbat dinner'),
    interfaithGuide('犹太教', '基督教', '社区服务', 'synagogue church'),
  ],
  sikhism: [
    siteGuide('锡克教', '阿姆利则金庙', 'golden temple amritsar'),
    patriarchGuide('锡克教', '古鲁那纳克', 'guru nanak'),
    bizGuide('锡克教', '诚实经营', 'sikh community business'),
    cultureGuide('锡克教', '兰加尔共餐', 'langar community meal'),
    interfaithGuide('锡克教', '印度教', '社区服务', 'punjab community'),
  ],
  shinto: [
    siteGuide('神道教', '伊势神宫', 'ise shrine japan'),
    patriarchGuide('神道教', '本居宣长', 'japan shrine priest'),
    bizGuide('神道教', '匠人精神', 'japanese craftsmanship'),
    cultureGuide('神道教', '初诣新年参拜', 'japanese new year shrine'),
    interfaithGuide('神道教', '道教', '自然和谐', 'mountain shrine'),
  ],
  'tibetan-buddhism': [
    siteGuide('藏传佛教', '布达拉宫', 'potala palace tibet'),
    patriarchGuide('藏传佛教', '密勒日巴', 'tibet milarepa'),
    bizGuide('藏传佛教', '逆境转化', 'tibetan monk meditation'),
    cultureGuide('藏传佛教', '转山朝圣', 'tibet mount kailash'),
    interfaithGuide('藏传佛教', '原住民灵性', '自然和谐', 'tibet nature'),
  ],
  indigenous: [
    siteGuide('原住民灵性', '乌鲁鲁', 'uluru australia'),
    patriarchGuide('原住民灵性', '部落长老', 'tribal elder'),
    bizGuide('原住民灵性', '可持续发展', 'sustainable indigenous business'),
    cultureGuide('原住民灵性', '篝火夜话', 'indigenous campfire'),
    interfaithGuide('原住民灵性', '巴哈伊', '自然和谐', 'global community'),
  ],
  bahai: [
    siteGuide('巴哈伊', '海法巴哈伊花园', 'bahai gardens haifa'),
    patriarchGuide('巴哈伊', '巴哈欧拉', 'bahai temple'),
    bizGuide('巴哈伊', '全球协商', 'global meeting consultation'),
    cultureGuide('巴哈伊', '诺鲁孜节', 'norouz celebration'),
    interfaithGuide('巴哈伊', '所有信仰', '和平共处', 'interfaith gathering'),
  ],
};
