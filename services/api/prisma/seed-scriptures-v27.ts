/**
 * M38.27 经论++ v27 — 精修第十七轮：10 部小传统经典深化
 * 本轮(10部, 338 → 348):
 *   SIKHISM +1 (古鲁那那克·晨祷经 Japji Sahib) 11→12
 *   BAHAI +1 (巴哈欧拉·隐言经 Hidden Words) 11→12
 *   INDIGENOUS +1 (黑麋鹿·大异象) 12→13
 *   ZEN-LINJI +1 (圆悟克勤·碧岩录)
 *   BUDDHIST-ZEN +1 (道原·景德传灯录)
 *   BUDDHIST-ZEN +1 (静筠·祖堂集)
 *   JUDAISM +1 (约瑟·卡罗·布就之席)
 *   SHINTO +1 (本居宣长·直毘灵)
 *   TIBETAN +1 (巴楚·普贤上师言教)
 *   ISLAM +1 (鲁米·论谈录 Fihi Ma Fihi)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChapterDef {
  chapterNo: number;
  title: string;
  subtitle?: string;
  originalText: string;
  commentary?: string;
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
  {
    slug: "japji-sahib", title: "古鲁那那克·晨祷经", titleEn: "Guru Nanak: Japji Sahib",
    author: "古鲁那那克", era: "印度(约 1520)",
    ring: 3, categorySlug: "sikhism",
    summary: "锡克教创始人古鲁那那克(Guru Nanak, 1469-1539)创作的晨祷经文，是《古鲁·格兰特·萨希卜》(Sri Guru Granth Sahib)开篇经文，也是每个锡克教徒每天黎明必诵的经文。全文 38 诗节加序诗和终诗，概括了锡克教的核心教义。",
    significance: "《晨祷经》被锡克教徒视为整部圣典的\"种子经\"——那那克在此经中第一次宣告了\"唯一神\"(Ik Onkar)的信念，打破了当时印度教与伊斯兰教之间的对立。每个锡克教徒从孩提时代就背诵此经，成为锡克身份认同的核心文本。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["锡克", "那那克", "晨祷", "唯一神"], sortOrder: 182,
    relatedSlugs: ["nanak-janamsakhi", "sukhmani-sahib"],
    chapters: [
      {
        chapterNo: 1, title: "唯一神",
        originalText: "Ik Onkar Satnam Karta Purakh Nirbhau Nirvair Akal Murat Ajuni Saibhang Gur Prasad. — 唯一真神，其名真实，创造万物，无畏无敌，超越时间，永不轮回，自有自立，借古鲁恩典而证悟。",
        commentary: "此为锡克教最根本的信仰宣言 Mul Mantar(根本咒)，在《晨祷经》开篇出现，也在每一部古鲁圣典前重复。那那克用此一句话定义了神的十个属性，既回应印度教的\"梵我不二\"，又回应伊斯兰教的\"真主独一\"。",
        practiceHint: "每日黎明诵念 Mul Mantar 十次，体会\"神不在庙里，也不在清真寺里\"的启示——那那克说神在每个诚实劳动的心中。",
      },
    ],
  },
  {
    slug: "bahaullah-hidden-words", title: "巴哈欧拉·隐言经", titleEn: "Bahaullah: The Hidden Words",
    author: "巴哈欧拉", era: "波斯(1858)",
    ring: 3, categorySlug: "bahai",
    summary: "巴哈伊信仰的创始人巴哈欧拉(Baha'u'llah, 1817-1892)最广为人知的灵性著作，由短小精辟的格言组成，分为\"阿拉伯语部分\"71 则和\"波斯语部分\"82 则。每则都以\"噢，人之子！\"或\"噢，精神之子！\"开头，直接以神的口吻对人讲话。",
    significance: "《隐言经》被誉为\"巴哈伊灵性生活的指南\"——巴哈欧拉自称此书汇集了过去所有先知(包括亚伯拉罕、摩西、耶稣、穆罕默德)曾经对人类心灵说过的话的精华。本书以极其简短的篇幅展示了巴哈伊\"人类合一、宗教合一\"的核心信念。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 20,
    tags: ["巴哈伊", "巴哈欧拉", "隐言", "心灵"], sortOrder: 183,
    relatedSlugs: ["tablets-bahaullah", "kitab-i-ahd"],
    chapters: [
      {
        chapterNo: 1, title: "噢，精神之子",
        originalText: "噢，精神之子！我的第一个忠告是：愿你拥有纯洁、仁慈、光明之心，使你拥有古老、恒久、永恒的主权。 / 噢，精神之子！在我看来，最可爱的事物是公正；若你渴望我，就不要忽视它。",
        commentary: "巴哈欧拉用\"神对心灵说话\"的直接口吻，绕过任何教义和仪式，要求人做到两件事：\"纯洁的心\"和\"公正的行\"。他宣称这是一切宗教的共同内核——无论你是基督徒、穆斯林、犹太人、佛教徒，都可以直接实践。",
        practiceHint: "每日清晨读三则《隐言经》，不作注释、不作分析，直接让文字在心中回响——巴哈欧拉说这些\"隐言\"能自动唤醒心灵本有的真理感知。",
      },
    ],
  },
  {
    slug: "black-elk-great-vision", title: "黑麋鹿·大异象", titleEn: "Black Elk: The Great Vision",
    author: "黑麋鹿口述 / John Neihardt 记录", era: "北美 Oglala Lakota 族(1931)",
    ring: 3, categorySlug: "indigenous",
    summary: "北美原住民 Lakota 族伟大萨满黑麋鹿(Black Elk, 1863-1950)九岁时所获\"大异象\"(Great Vision)的完整叙述——他被带到\"天地之心\"，见到六位祖爷爷(Six Grandfathers)分别代表六个方向，获得治愈部族的圣物和圣曲。这是北美原住民萨满传统最深的\"神启\"记录之一。",
    significance: "这段异象被视为北美原住民精神传统的\"启示录\"——它启发了 20 世纪的新萨满教、深层生态学、原住民文艺复兴运动。与《黑麋鹿说》(Black Elk Speaks)一起，使全世界第一次严肃地把\"萨满异象\"作为可比肩《圣经》《古兰经》的灵性文本看待。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["萨满", "异象", "Lakota", "六方位"], sortOrder: 184,
    relatedSlugs: ["black-elk-speaks", "lakota-sundance"],
    chapters: [
      {
        chapterNo: 1, title: "六位祖爷爷",
        originalText: "我站在世界的中央——第六位祖爷爷，就是万物之灵，直接对我说：\"孙子，你将带着我的能力行走在大地上。他们把你叫做黑麋鹿，因为你的力量将来自野鹿的家族。但你会看到黑夜，然后看到白昼。\"",
        commentary: "黑麋鹿的异象体现了 Lakota 宇宙观的核心结构——\"六方位\"(东南西北上下)对应六位祖灵，每一方位都代表一种智慧和力量。\"先黑夜后白昼\"预言了部族将经历苦难再复兴，被视为对整个原住民民族近代命运的神圣预言。",
        practiceHint: "每日清晨面向太阳、默念六个方位——东(黎明/启示)、南(成长/纯真)、西(考验/黄昏)、北(智慧/净化)、上(创造之源)、下(大地之母)。每一方位停三次呼吸。",
      },
    ],
  },
  {
    slug: "yuanwu-biyanlu", title: "圆悟克勤·碧岩录", titleEn: "Yuanwu Keqin: Blue Cliff Record",
    author: "圆悟克勤", era: "宋(约 1125)",
    ring: 1, categorySlug: "zen-linji",
    summary: "临济宗杨岐派大师圆悟克勤(1063-1135)对雪窦重显《颂古百则》的注解，全名《佛果圜悟禅师碧岩录》，共十卷。圆悟在雪窦\"举、颂、拈提\"的基础上增加了\"评唱\"——对每一则公案从出处、背景、人物、要旨进行全方位分析，使禅宗\"文字禅\"达到了前所未有的高度。",
    significance: "《碧岩录》被誉为\"禅门第一书\"，是中国禅宗\"文字禅\"的巅峰之作。本书对后世影响巨大——日本禅宗视其为必读经典，临济宗寺院几乎人手一册。但圆悟的徒弟大慧宗杲因为担心后人只读文字不参实悟，曾一度将《碧岩录》板毁，由此引出禅门\"看话禅\"运动。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 60,
    tags: ["圆悟", "碧岩", "公案", "文字禅"], sortOrder: 185,
    relatedSlugs: ["xuedou-songgu", "dahui-yulu"],
    chapters: [
      {
        chapterNo: 1, title: "达摩廓然无圣",
        originalText: "举：梁武帝问达磨大师：\"如何是圣谛第一义？\"磨云：\"廓然无圣。\"帝曰：\"对朕者谁？\"磨云：\"不识。\"帝不契，达磨遂渡江至魏。",
        commentary: "《碧岩录》第一则公案。梁武帝问\"什么是佛法最高真理？\"达摩答\"廓然无圣\"——真理如广阔虚空，没有\"圣俗\"的分别。武帝不懂，又问\"那对着我的是谁？\"达摩只答\"不识\"——这\"不识\"不是不知道，而是超越主客相对的\"本来面目\"。",
        practiceHint: "参\"廓然无圣\"与\"不识\"这两句——不要从理论上理解\"无分别\"，而是在具体的情境中问自己：此刻的我能\"不识\"地看待眼前吗？",
      },
    ],
  },
  {
    slug: "jingde-chuandeng-lu", title: "道原·景德传灯录", titleEn: "Daoyuan: Jingde Era Record of the Transmission of the Lamp",
    author: "释道原", era: "宋(1004)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "宋代法眼宗僧人道原编纂的禅宗史书，记录从过去七佛、西天二十八祖、东土六祖到宋初各家禅师共 1701 人的传记和机缘语录，共 30 卷。景德元年(1004)由道原进献宋真宗，皇帝赐名《景德传灯录》并收入《大藏经》——这是禅宗史第一次被官方正式承认。",
    significance: "《景德传灯录》是禅宗史学的奠基之作，后世\"五灯\"(《天圣广灯录》《建中靖国续灯录》《联灯会要》《嘉泰普灯录》《续传灯录》)都以它为蓝本。本书不仅记录历史，更重要的是保留了大量\"机缘问答\"原始语料，使后世参究公案有了可靠的文本依据。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 55,
    tags: ["传灯", "禅宗史", "道原", "景德"], sortOrder: 186,
    relatedSlugs: ["wudeng-huiyuan", "zutang-ji"],
    chapters: [
      {
        chapterNo: 1, title: "拈花微笑",
        originalText: "世尊在灵山会上拈花示众。是时众皆默然，唯迦叶尊者破颜微笑。世尊云：\"吾有正法眼藏，涅槃妙心，实相无相，微妙法门，不立文字，教外别传，付嘱摩诃迦叶。\"",
        commentary: "\"拈花微笑\"是禅宗\"教外别传\"的开端，出现在《景德传灯录》卷一\"释迦牟尼佛\"条下。佛陀拈一枝花，百千众都不懂，只有迦叶会心一笑——这\"不需言说的会心\"正是禅宗\"以心传心\"的传承方式。整个禅宗法脉由此开始。",
        practiceHint: "读\"拈花微笑\"时不要问\"这到底什么意思\"——那就又掉入文字分别。试着想象自己也在灵山会众中，佛陀拈花时你的第一个直觉反应是什么？那就是你的入处。",
      },
    ],
  },
  {
    slug: "zutang-ji", title: "静筠·祖堂集", titleEn: "Jing and Yun: Anthology of the Patriarchs' Hall",
    author: "静、筠二禅师", era: "五代南唐(952)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "五代南唐时期，泉州招庆寺静、筠二禅师编纂的禅宗史书，记录从过去七佛到晚唐五代禅师共 246 人的传记，共 20 卷。比《景德传灯录》早 52 年，是现存最早的禅宗\"灯录\"类著作。原本在中国失传一千年，民国时期在韩国海印寺重新发现，使早期禅宗史料得以复原。",
    significance: "《祖堂集》的重大价值在于保留了《景德传灯录》之前的\"唐代禅宗\"原貌——因为后来者对早期语录多有修饰润色，只有《祖堂集》保留了最原始粗粝的唐代口语形态。本书中有大量未出现在后世\"灯录\"中的早期禅师语录，是研究唐代禅宗绝无替代品的史料。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 50,
    tags: ["祖堂集", "唐代", "灯录", "失而复得"], sortOrder: 187,
    relatedSlugs: ["jingde-chuandeng-lu", "wudeng-huiyuan"],
    chapters: [
      {
        chapterNo: 1, title: "石头路滑",
        originalText: "石头希迁和尚示众云：\"吾之法门，先佛传授；不论禅定精进，唯达佛之知见；即心即佛，心佛众生，菩提烦恼，名异体一。\"时有人问：\"如何是解脱？\"师云：\"谁缚汝？\"问：\"如何是净土？\"师云：\"谁垢汝？\"",
        commentary: "石头希迁的\"谁缚汝\"\"谁垢汝\"是唐代禅宗最典型的\"反问法\"——当你问\"如何解脱\"时，你已经默认了\"自己被绑住\"的假设；当你问\"如何成就净土\"时，你已经默认了\"这里被染污\"的假设。石头直接戳破这些假设：没人绑你，没东西染你，你本来就是解脱的。",
        practiceHint: "每当你起\"我要解脱\"的念头时，立即问自己\"谁缚我？\"——持续问下去会发现，所有的\"束缚感\"都是自己制造的。",
      },
    ],
  },
  {
    slug: "shulkhan-arukh", title: "约瑟·卡罗·布就之席", titleEn: "Joseph Karo: Shulchan Aruch",
    author: "约瑟·卡罗", era: "西班牙/采法特(1565)",
    ring: 3, categorySlug: "judaism",
    summary: "16 世纪犹太法学大师约瑟·卡罗(Joseph Karo, 1488-1575)编纂的犹太律法(Halakha)权威汇编，分四部：Orach Chayim(日常生活)、Yoreh Deah(饮食洁净)、Even HaEzer(婚姻家庭)、Choshen Mishpat(民事法律)。\"Shulchan Aruch\"意为\"已摆好的桌子\"——意思是律法都已经整齐摆好，学者可以直接享用。",
    significance: "《布就之席》是后塔木德时代犹太律法的最高权威，至今所有正统犹太社区都以此书为法律标准。加上波兰拉比 Moses Isserles 的注解\"Mapah\"(桌布)——记录德系犹太(Ashkenazi)习俗以别于西班牙系(Sephardic)——形成了至今仍在使用的综合律法典籍。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 50,
    tags: ["犹太", "律法", "哈拉卡", "卡罗"], sortOrder: 188,
    relatedSlugs: ["pirkei-avot", "zohar"],
    chapters: [
      {
        chapterNo: 1, title: "黎明即起",
        originalText: "人应当像狮子一般勇猛地早起敬拜造物主——清晨第一件事就是赞美主。即使天寒地冷，即使软床眷恋，也要立刻起身；因为人应时刻谨记\"我将主置于我面前\"。",
        commentary: "《布就之席》第一章第一句就是\"黎明即起\"——卡罗把这条放在整部律法书最前面，表明在犹太传统中\"如何醒来\"比\"如何祈祷\"更根本。醒来的第一个动作已经在塑造一整天的灵性状态。\"我将主置于我面前\"(Shiviti)是犹太教最核心的灵修口诀。",
        practiceHint: "每天醒来第一件事不要拿手机，而是默念\"Modeh Ani\"(我感谢祢)——哪怕只有十秒钟，也能把一天的灵性基调定好。",
      },
    ],
  },
  {
    slug: "motoori-naobi", title: "本居宣长·直毘灵", titleEn: "Motoori Norinaga: Naobi no Mitama",
    author: "本居宣长", era: "江户(1771)",
    ring: 3, categorySlug: "shinto",
    summary: "日本江户时代国学大师本居宣长(Motoori Norinaga, 1730-1801)的神道教思想代表作，是他巨著《古事记传》的序言独立刊行。\"直毘灵\"(Naobi no Mitama)意为\"纠正曲灵、使之归直的神灵\"——宣长用这个概念来批判中国儒教和佛教对日本古道的\"扭曲\"，主张回归纯粹的\"大和心\"。",
    significance: "《直毘灵》是日本\"复古神道\"的宣言书，标志着国学运动从\"文学考据\"升级为\"思想体系\"。本书对明治维新的\"神道国教化\"有直接影响，后来的平田笃胤等复古神道学者都以此为思想起点。宣长\"物哀\"(mono no aware)美学也根植于此——大和心即是对万物的自然感动，不需要中国圣贤的教条。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["本居宣长", "国学", "复古神道", "大和心"], sortOrder: 189,
    relatedSlugs: ["motoori-kojikiden", "hirata-atsutane"],
    chapters: [
      {
        chapterNo: 1, title: "大和心",
        originalText: "若问何谓大和心，晨曦朝阳中山樱花。 / 我们的祖先不需要\"道理\"来判断善恶——他们只需要直接感受神明所赐的\"直心\"(naoki kokoro)，就能自然地行善避恶。中国的\"理学\"反而把人心变得扭曲。",
        commentary: "宣长最著名的和歌\"大和心即朝日山樱\"——他主张日本人的心灵本质不是由书本教条定义，而是由对自然美(晨阳、山樱)的直接感动定义。这种\"不学而知善恶\"的能力，就是\"直毘灵\"——纠正人心的神力。",
        practiceHint: "每日清晨观一次自然景物(一朵花、一片云、一缕光)，不评论不分析，只感受那种\"无法言说的美\"——宣长说这就是大和心的训练。",
      },
    ],
  },
  {
    slug: "patrul-kunzang-lamai", title: "巴楚·普贤上师言教", titleEn: "Patrul Rinpoche: The Words of My Perfect Teacher",
    author: "巴楚仁波切", era: "藏区(约 1860)",
    ring: 3, categorySlug: "tibetan",
    summary: "宁玛派第十九世纪大师巴楚仁波切(Patrul Rinpoche, 1808-1887)对龙钦心髓(Longchen Nyingthig)前行法的系统讲解。\"普贤上师\"指的是他自己的根本上师吉美嘉威纽古(Jigme Gyalwai Nyugu)。全书分为\"共同前行\"(人身难得、寿命无常、业力因果、轮回过患)和\"不共前行\"(皈依、发心、金刚萨埵、曼达拉、上师瑜伽)。",
    significance: "《普贤上师言教》是当代藏传佛教最广泛使用的前行法教科书——无论宁玛、萨迦、噶举的学人都以此为入门读物。巴楚以\"像讲故事一样讲佛法\"的独特风格，使极其严肃的修行题目(如人身难得)变得活泼动人。本书已被翻译成 20 多种语言，是 20 世纪藏传佛教向世界传播的核心文本。",
    difficulty: 4, oxStageMin: 2, oxStageMax: 10, readingMins: 45,
    tags: ["巴楚", "前行", "宁玛", "龙钦心髓"], sortOrder: 190,
    relatedSlugs: ["longchenpa-seven-treasuries", "lamrim-essentials"],
    chapters: [
      {
        chapterNo: 1, title: "人身难得",
        originalText: "如同在大海深处有一只盲龟，每百年浮出海面一次；海面上有一只木轭随波漂流。盲龟要把头套进木轭的孔中，几乎是不可能的。同样，获得具足八闲暇十圆满的珍贵人身，比这更为稀有。",
        commentary: "巴楚用\"盲龟浮木\"的譬喻讲\"人身难得\"——这不是要让人悲观，而是要让人珍惜当下。一旦意识到此生获得修行机会有多珍贵，就不可能再把时间浪费在无意义的琐事上。这个譬喻是藏传佛教\"转心四思维\"的第一个也是最根本的。",
        practiceHint: "每日早晨默想\"盲龟浮木\"一分钟——然后问自己：\"今天我会用这个珍贵人身做什么？\" 这个问题持续问三十天，生活状态会发生根本转变。",
      },
    ],
  },
  {
    slug: "rumi-fihi-ma-fihi", title: "鲁米·论谈录", titleEn: "Rumi: Fihi Ma Fihi (Discourses)",
    author: "莫拉纳·贾拉伦丁·鲁米", era: "塞尔柱(约 1270)",
    ring: 3, categorySlug: "islam",
    summary: "13 世纪伟大苏菲诗人鲁米(Mawlana Jalal al-Din Rumi, 1207-1273)晚年的散文讲话集，由其弟子记录。书名\"Fihi Ma Fihi\"字面意思是\"其中之所在\"——暗指\"真理就在字里行间\"。全书约 70 篇，涵盖鲁米对《古兰经》、苏菲修行、爱与智慧等主题的直接讲话。",
    significance: "与鲁米最著名的诗集《玛斯纳维》(Masnavi)相比，《论谈录》是鲁米用日常散文形式直接说话的记录，更贴近他\"活的形象\"。本书向读者展示了鲁米作为苏菲导师如何回答具体学生的具体问题——他不谈抽象哲学，而是针对每个人的具体处境给出针对性指引。是研究鲁米\"实际教学方式\"最直接的资料。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 35,
    tags: ["鲁米", "苏菲", "论谈", "爱"], sortOrder: 191,
    relatedSlugs: ["rumi-masnavi", "fusus-al-hikam"],
    chapters: [
      {
        chapterNo: 1, title: "爱即真主",
        originalText: "鲁米说：\"爱是海洋，爱人是浪花。浪花不停地生起又回到海里——这不是死亡，而是归家。不要问我爱的对象是谁——真正的爱没有对象，因为爱者、被爱者、爱本身是同一件事。\"",
        commentary: "鲁米苏菲思想的核心——\"爱的三位一体\"(Ishq, Ashiq, Mashuq：爱、爱者、被爱者)最终是同一个。这是对伊斯兰教\"认主独一\"(Tawhid)最深层的理解：不仅真主是独一的，连\"我爱真主\"这件事中的\"我\"、\"爱\"、\"真主\"三者也是独一的。这种思想后来被伊本·阿拉比(Ibn Arabi)发展为\"存在一性论\"。",
        practiceHint: "每日念一次鲁米\"浪花与海洋\"的譬喻，当你感到\"我在爱某个人/某件事\"时，试着消解那个\"我\"——看看剩下的是什么。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.27 经论++ v27 精修第十七轮 — 10 部小传统经典深化\n');

  let newScriptures = 0;
  let newChapters = 0;

  for (const def of NEW_SCRIPTURES) {
    const category = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
    if (!category) {
      console.warn(`  ⚠ 类别未找到: ${def.categorySlug}, 跳过 ${def.slug}`);
      continue;
    }

    const scripture = await prisma.scripture.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug, title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
        ring: def.ring, categoryId: category.id, tradition: category.tradition,
        summary: def.summary, significance: def.significance,
        difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
        readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder, isPublished: true,
      },
      update: {
        title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
        ring: def.ring, categoryId: category.id, tradition: category.tradition,
        summary: def.summary, significance: def.significance,
        difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
        readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder,
      },
    });
    newScriptures++;

    for (const ch of def.chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo: ch.chapterNo } },
        create: {
          scriptureId: scripture.id, chapterNo: ch.chapterNo, title: ch.title, subtitle: ch.subtitle,
          originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
        },
        update: {
          title: ch.title, subtitle: ch.subtitle,
          originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
        },
      });
      newChapters++;
    }

    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { chapterCount: def.chapters.length },
    });
  }

  console.log(`  ✓ ${newScriptures} 新经论, ${newChapters} 新章节`);

  let relationCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    if (related.length === 0) continue;
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.27 精修第十七轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
