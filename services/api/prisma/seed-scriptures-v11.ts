/**
 * M38.11 经论++ v11 — 精修模式第一轮：10 部跨传统新经论
 * 触发: 经论++ 循环精修 (2026-04-11)
 *
 * 本轮(10部, 188 → 198):
 *   - ZEN +2 (赵州从谂语录 / 马祖道一语录)
 *   - BUDDHISM +2 (法句经 / 清净道论)
 *   - TAOISM +2 (性命圭旨 / 文始真经关尹子)
 *   - CONFUCIANISM +2 (尚书 / 左传)
 *   - CHRISTIANITY +1 (以弗所书)
 *   - HINDUISM +1 (蒂鲁库拉尔)
 *
 * 执行: npx tsx prisma/seed-scriptures-v11.ts
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
    slug: "zhaozhou-yulu", title: "赵州从谂禅师语录", titleEn: "Recorded Sayings of Zhaozhou",
    author: "赵州从谂", era: "唐(778-897)",
    ring: 1, categorySlug: "zen-core",
    summary: "赵州从谂禅师（人称\"古佛\"）的语录集，以\"吃茶去\"、\"庭前柏树子\"、\"无\"字公案等朴素却深不见底的机锋闻名，是禅宗史上最富禅味的语录之一。",
    significance: "赵州的\"无\"字公案被无门慧开收入《无门关》第一则，成为日后日本禅宗与西方禅学最核心的参话头。\"吃茶去\"三字成为平常心禅法的不朽符号。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 35,
    tags: ["赵州", "公案", "吃茶去", "平常心"], sortOrder: 27,
    relatedSlugs: ["linji-lu", "wumen-guan", "biyan-lu"],
    chapters: [
      {
        chapterNo: 1, title: "吃茶去",
        originalText: "师问新到：\"曾到此间么？\"曰：\"曾到。\"师曰：\"吃茶去。\"又问僧，僧曰：\"不曾到。\"师曰：\"吃茶去。\"后院主问曰：\"为甚么曾到也云吃茶去，不曾到也云吃茶去？\"师召院主，主应诺。师曰：\"吃茶去。\"",
        commentary: "赵州三句\"吃茶去\"，把所有分别心一扫而光。曾到、不曾到、问问题的人，统统吃茶去 — 当下这一刻的茶，才是真正的修行。企业家读到这里应当震动：你所有的\"我已经会了\"和\"我还不会\"，都是分别心的把戏，放下后才能见本来面目。",
        practiceHint: "今天做一件小事时彻底专注在这件事本身 — 喝一杯茶就只是喝茶，不想工作不看手机，体会\"此刻就是全部\"。感受赵州的\"吃茶去\"不是口号，是修行的入口。",
      },
      {
        chapterNo: 2, title: "无字公案",
        originalText: "僧问：\"狗子还有佛性也无？\"师曰：\"无。\"僧曰：\"上至诸佛，下至蝼蚁，皆有佛性，狗子为甚么却无？\"师曰：\"为伊有业识在。\"",
        commentary: "这是禅宗最著名的公案。\"无\"不是\"没有\"的意思，而是打破一切二元对立的当头棒喝。狗子有佛性吗？有，也没有。这个\"无\"字，要在参究中体认，不是在概念上理解。企业家若能参透此\"无\"字，对\"成功/失败\"、\"得/失\"的执着都会松动。",
        practiceHint: "静坐时专注于一个\"无\"字，不要分析它不要判断它，只是让它在心中反复出现。持续 10 分钟，你会发现：很多你以为重要的问题，在这个\"无\"字前都消散了。",
      },
    ],
  },
  {
    slug: "mazu-yulu", title: "马祖道一禅师语录", titleEn: "Recorded Sayings of Mazu Daoyi",
    author: "马祖道一", era: "唐(709-788)",
    ring: 1, categorySlug: "zen-core",
    summary: "六祖下二代、洪州宗开山祖师马祖道一的语录。以\"即心即佛\"、\"非心非佛\"、\"平常心是道\"三大纲领开创汉传禅宗最生动活泼的风格，其下接出百丈、南泉、大珠等一流禅师。",
    significance: "马祖与石头希迁并称\"江西马祖、湖南石头\"，是中国禅宗走向本土化、生活化的关键转折点。其\"平常心\"思想对日本临济宗、曹洞宗乃至现代正念哲学都有根本性影响。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["马祖", "即心即佛", "平常心", "洪州宗"], sortOrder: 28,
    relatedSlugs: ["linji-lu", "baizhang-qinggui", "platform-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "即心即佛",
        originalText: "大寂（马祖）示众云：\"汝等诸人，各信自心是佛，此心即是佛心。达磨大师从南天竺国来至中华，传上乘一心之法，令汝等开悟。又引楞伽经，以印众生心地。恐汝颠倒不信，此一心之法各各有之，故楞伽经以佛语心为宗，无门为法门。\n\n夫求法者，应无所求。心外无别佛，佛外无别心。\"",
        commentary: "\"即心即佛\"是马祖最核心的命题。它不是说\"心可以修成佛\"，而是说\"当下这一念心，本来就是佛\"。这对企业家意味着：你不需要等到成功了、有钱了、退休了才能觉醒 — 当下这个正在经营烦恼的心，就是觉悟的起点。",
        practiceHint: "每当你觉得\"等我做到 X 就好了\"的时候，立刻停下来问：\"此刻我的心是佛吗？\"答案永远是\"是\"。练习一个月，你会发现很多追逐都变得可笑。",
      },
      {
        chapterNo: 2, title: "平常心是道",
        originalText: "师又云：\"道不用修，但莫污染。何为污染？但有生死心、造作趣向，皆是污染。若欲直会其道，平常心是道。何谓平常心？无造作、无是非、无取舍、无断常、无凡无圣。\n\n经云：\"非凡夫行，非圣贤行，是菩萨行。\"只如今行住坐卧、应机接物，尽是道。道即是法界，乃至河沙妙用，不出法界。\"",
        commentary: "\"平常心是道\"是马祖送给人类的最大礼物。不是出离日常去找道，而是在吃饭睡觉应对事务的当下即是道。这粉碎了所有\"修行是特殊活动\"的幻象。企业家的会议、谈判、决策，只要带着无造作无分别的心，都是活泼泼的修行。",
        practiceHint: "下次开会前默念\"平常心是道\"，让自己从\"要赢要对\"的紧绷中松下来。以平常心应对，你会发现决策质量和人际关系同时改善。",
      },
    ],
  },
  {
    slug: "dhammapada", title: "法句经", titleEn: "Dhammapada",
    author: "佛陀口授，部派结集", era: "前 3 世纪结集",
    ring: 2, categorySlug: "buddhist-general",
    summary: "早期佛教最重要的偈颂集，共 423 首诗偈，凝练地展现佛陀对心、业、道的教导。是上座部佛教与南传佛教的核心读本，也是全世界最广为翻译的佛教经典之一。",
    significance: "《法句经》是世界上最早被翻译成西方文字的佛教经典之一（1855 年丹麦 Fausbøll 拉丁译本）。其简洁有力的偈颂风格影响了从托尔斯泰到艾默生的无数西方思想家。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 8, readingMins: 40,
    tags: ["法句经", "偈颂", "上座部", "巴利文"], sortOrder: 29,
    relatedSlugs: ["ahan-jing", "buddhist-general"],
    chapters: [
      {
        chapterNo: 1, title: "双品 — 心为法本",
        originalText: "《法句经·双品》第一偈：\"诸法意先导，意主意造作。若以染污意，或语或行业，是则苦随彼，如轮随兽足。\"\n\n第二偈：\"诸法意先导，意主意造作。若以清净意，或语或行业，是则乐随彼，如影不离形。\"\n\n第五偈：\"在此世界中，从非怨止怨，唯以忍止怨。此古（圣常）法。\"",
        commentary: "《法句经》开篇就直指核心：一切苦乐，源于心念。不是外境带来苦乐，是你的心在染污或清净中自造苦乐。这是整个佛教的基石。第五偈的\"忍止怨\"对管理者尤其重要 — 以怨报怨只会升级冲突，以忍化怨才是古圣的智慧。",
        practiceHint: "遇到让你烦躁的人时默念\"若以染污意，苦随彼如轮随兽足\"，提醒自己是你的心而非对方在造苦。立刻换一个清净念头回应，体验\"乐如影不离形\"。",
      },
      {
        chapterNo: 2, title: "不放逸品",
        originalText: "《法句经·不放逸品》：\"无逸不死道，放逸趣死路。无逸者不死，放逸者如尸。\"\n\n\"智者深知此，所行不放逸。不放逸得乐，喜悦于圣境。\"\n\n\"智者常坚忍，勇猛修禅定。解脱得安隐，证无上涅槃。\"",
        commentary: "\"不放逸\"（appamāda）是佛陀临终最后嘱咐的一个词。它不是紧张用力，而是清醒觉知、不沉溺、不懈怠。对企业家意味着：不是要拼命工作到倒下，而是在每一刻保持觉知，不被成功冲昏头，也不被挫折压垮。",
        practiceHint: "设一个\"不放逸铃\"：每小时手机响一下，响时问自己\"此刻我放逸了吗？\"（刷手机、走神、情绪化？）。一周后你会发现，生产力和内心都更稳定。",
      },
    ],
  },
  {
    slug: "visuddhimagga", title: "清净道论", titleEn: "The Path of Purification",
    author: "觉音尊者(Buddhaghosa)", era: "5 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "南传上座部佛教最权威的修学百科全书，由 5 世纪印度尊者觉音在斯里兰卡撰成。以戒、定、慧三学为主轴，系统整理了从四念处到四十业处的全套禅修方法。",
    significance: "《清净道论》是全世界所有正念与内观传统（包括现代西方 MBSR、葛印卡内观等）的根本文献。没有这部书，现代正念运动的基础就不存在。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 60,
    tags: ["觉音", "上座部", "戒定慧", "四十业处"], sortOrder: 30,
    relatedSlugs: ["dhammapada", "ahan-jing"],
    chapters: [
      {
        chapterNo: 1, title: "戒 — 清净的根基",
        originalText: "觉音尊者《清净道论·戒品》开章云：\"戒为一切善法之根本。何为戒？戒即是离，即是思，即是律仪，即是不犯。\n\n譬如大地为诸有情所依止，戒亦如是为一切善法之所依止。若无戒则定慧无从生起；若有戒则如树有根，必能生长枝叶花果。\n\n故修行者首应护持五戒：不杀、不盗、不邪淫、不妄语、不饮酒乱性。此五戒非束缚，乃自由之基。\"",
        commentary: "\"戒为自由之基\"是觉音最深的洞见。世人以为戒律是束缚，殊不知没有戒律的心才是真正被束缚 — 被欲望、冲动、习气拉着走。对企业家而言，自我约束（戒）不是苦修，而是让你能自由选择，不被短期诱惑绑架。",
        practiceHint: "选一条自己最难守的\"戒\"（比如\"开会不看手机\"、\"生气时不说话\"），守 7 天。你会发现守戒后反而更自由，因为你不再被习气拉着走。",
      },
      {
        chapterNo: 2, title: "定 — 四十业处之要",
        originalText: "觉音续云：\"定者，心一境性。令心专注于一所缘而不散乱，即是定。佛陀开示四十业处为修定之门：十遍处、十不净、十随念、四梵住、四无色、一想、一差别、食厌想。\n\n初学者应择一适合自性之业处：贪行者修不净观，瞋行者修慈心观，痴行者修入出息念（安般），寻思行者修数息观，信行者修佛随念。\n\n所缘既定，则不可频换。如钻木取火，中途换木则永不出火。\"",
        commentary: "\"心一境性\"四个字道尽定学的精髓。现代人最大的问题就是心散乱 — 同时刷 10 个 tab、开 3 个会。觉音告诉我们：定力不是靠意志力逼出来的，而是选一个适合你本性的\"所缘\"持续专注培养出来的。",
        practiceHint: "选一个业处（最推荐入出息念 — 观察呼吸），每天早晨 15 分钟，持续 21 天不换方法。你会感到心的\"分辨率\"明显提升，决策更清晰。",
      },
    ],
  },
  {
    slug: "xingming-guizhi", title: "性命圭旨", titleEn: "Principles of Nature and Life",
    author: "尹真人高弟(明代)", era: "明末(约 1615)",
    ring: 3, categorySlug: "taoism",
    summary: "明末内丹集大成之作，以图配文系统讲解全真派内丹修炼九节功法。融合儒释道三家心性论，被誉为\"内丹学最清晰的地图\"，是研究中国内丹学的必读经典。",
    significance: "《性命圭旨》通过 50 余幅精美版画将抽象的内丹心法具象化，对日本江户时代白隐禅师的内观法、乃至现代气功、太极拳都有深远影响。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 50,
    tags: ["性命双修", "内丹", "全真", "图解"], sortOrder: 31,
    relatedSlugs: ["wuzhen-pian", "cantong-qi", "huangdi-neijing"],
    chapters: [
      {
        chapterNo: 1, title: "性命双修说",
        originalText: "《性命圭旨·元集》云：\"何谓之性？元始真如，一灵炯炯是也。何谓之命？先天至精，一气氤氲是也。然有性便有命，有命便有性，性命原不可分。\n\n但以其在天则谓之命，在人则谓之性。性命实一物也，因有形而后有名，名虽有二，其实一也。\n\n儒家只修性，释家只修性，唯我道家性命双修 — 性不离命，命不离性。修性而不修命，万劫阴灵难入圣；修命而不修性，寿同天地一愚夫。\"",
        commentary: "\"性命双修\"是道教内丹学相对儒释的核心差异。只修心性而不练身体，只练身体而不修心性，都是瘸腿。对现代企业家极有启发：你的事业成就和身体健康、心灵清明应当同步成长 — 只要一样偏废，另一样也保不住。",
        practiceHint: "每天早晨静坐 10 分钟（修性）+ 体能锻炼 20 分钟（修命），持续一个月。你会感到身心协同的力量远超单项训练。",
      },
      {
        chapterNo: 2, title: "涵养本源",
        originalText: "《性命圭旨》第一节功法云：\"涵养本源，救护命宝。\n\n其要在于收视返听 — 目不外视，耳不外听，鼻不外臭，口不外言。\n\n元神返归于内，则先天一气自然从虚无中来。此谓\"玄牝之门，是为天地根。绵绵若存，用之不勤\"。\n\n日久功深，丹田温煦，神气合一，性命双修之基乃立。\"",
        commentary: "\"涵养本源\"的具体方法是\"收视返听\" — 把平时向外攀缘的感官收回到内心。这对刷手机刷到焦虑的现代人是救命良药。当你把五根收回，你会发现很多问题根本不是问题，只是外界刺激在你心里的回响。",
        practiceHint: "每天选 20 分钟\"收视返听\"：闭眼、塞耳、不说话，只是觉察自己的内在。一周后你会发现决策更有定力。",
      },
    ],
  },
  {
    slug: "wenshi-zhenjing", title: "文始真经(关尹子)", titleEn: "The Guan Yinzi",
    author: "关尹(尹喜)", era: "春秋末(约前 5 世纪)",
    ring: 3, categorySlug: "taoism",
    summary: "相传为函谷关令尹喜（即老子过关时求著《道德经》者）所撰，是道家最古老的真经之一。全书九篇，以\"宇、柱、极、符、鉴、匕、釜、筹、药\"为目，展开比老庄更玄远的道论。",
    significance: "《文始真经》在道教内部被尊为\"三真经\"之一（与《道德经》《南华经》并列），唐玄宗封其为\"无上真人\"。其\"一切万物皆我心识所现\"的思想，与后世禅宗\"万法唯心\"遥相呼应。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 40,
    tags: ["关尹子", "道家", "唯心", "玄远"], sortOrder: 32,
    relatedSlugs: ["daodejing", "zhuangzi", "liezi"],
    chapters: [
      {
        chapterNo: 1, title: "宇篇 — 非有非无之道",
        originalText: "《文始真经·宇篇》云：\"非有道不可言，不可言即道。非有道不可思，不可思即道。\n\n天物怒流，人事错错然，若若乎回也，戛戛乎斗也。勃乎勃乎若海之漂，翕乎翕乎若风之聚。然相摩相荡，相趣相违，卒无所止。\n\n天地虽大，不能逃吾之念；万物虽众，不能隔吾之心。念之所及，即我所在；心之所照，即我所见。\"",
        commentary: "关尹子直言：道不可言、不可思。一旦你说\"道是什么\"，已经不是道了。但同时他又说\"念之所及即我所在\" — 心与万物原本不隔。这比老子更进一步，直接打到心识本源。",
        practiceHint: "试做一个\"不可言\"练习：闭目静观 5 分钟，任何想法冒出来立刻问自己\"这个念头能说出来吗？\"你会发现：最真实的感受永远无法完整言说。习惯这种\"不可言\"，你的表达反而会更精准。",
      },
      {
        chapterNo: 2, title: "柱篇 — 一切皆幻",
        originalText: "《文始真经·柱篇》云：\"知物之伪者，不必去物；譬如见土牛木马，虽知其伪，亦不必去之。人之畏死而务生者，惑也；人之厌生而乐死者，迷也。\n\n知物之非物，则物不能役我；知死之非死，则死不能迫我。\n\n圣人终日行，未尝动；终日应，未尝言。以其心无物，故物莫能滞。\"",
        commentary: "\"土牛木马\"的比喻极美：你知道木头做的马不是真马，但你不必把它砸掉。世间万物亦复如是 — 知其为幻即可，不必逃避。对企业家启示：财富、地位、名声都像木马，知道它们是\"缘起幻有\"就不会被它们奴役，反而能更好地使用它们。",
        practiceHint: "下次遇到很想拥有的东西（新手机、豪车、头衔），在心里默念\"此乃土牛木马\"。不是要你放弃追求，而是让你从\"被它控制\"变成\"主动选择\"。",
      },
    ],
  },
  {
    slug: "shangshu", title: "尚书(书经)", titleEn: "Book of Documents",
    author: "孔子编订", era: "先秦(前 11-前 7 世纪文献)",
    ring: 3, categorySlug: "confucianism",
    summary: "五经之一，中国最早的历史文献汇编，记载从尧舜到春秋中叶的君臣言论。\"允执厥中\"、\"人心惟危，道心惟微\"、\"克明俊德\"等后世心性论核心命题皆出自此书。",
    significance: "《尚书》是中国政治哲学的源头，其\"敬天保民\"、\"德治\"、\"慎罚\"思想奠定了中华治理的基本范式。宋代理学家朱熹称《书》为\"二帝三王治天下之大经大法\"。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 45,
    tags: ["尚书", "五经", "允执厥中", "敬天保民"], sortOrder: 33,
    relatedSlugs: ["yijing", "lunyu", "mengzi"],
    chapters: [
      {
        chapterNo: 1, title: "大禹谟 — 十六字心传",
        originalText: "《尚书·大禹谟》舜命禹云：\"人心惟危，道心惟微，惟精惟一，允执厥中。\n\n无稽之言勿听，弗询之谋勿庸。可爱非君？可畏非民？众非元后，何戴？后非众，罔与守邦？\n\n钦哉，慎乃有位，敬修其可愿。四海困穷，天禄永终。\"",
        commentary: "\"十六字心传\"是儒家心性论最古老的源头，宋儒朱熹视为儒门\"道统\"的第一块基石。\"人心惟危\"指欲望之心易走偏；\"道心惟微\"指天理之心很细微；\"惟精惟一\"是修养方法；\"允执厥中\"是最终境界。对企业家的意义：最高的领导力不在雄辩和决断，而在\"执中\" — 在极端之间持守分寸。",
        practiceHint: "每天睡前回顾当日最大一个决策，问自己：\"这是我的人心（欲望）还是道心（本然）？我是否执中了？\"连续 30 天，你会发现自己越来越能抓到事情的\"中\"。",
      },
      {
        chapterNo: 2, title: "尧典 — 克明俊德",
        originalText: "《尚书·尧典》云：\"曰若稽古，帝尧曰放勋，钦明文思安安，允恭克让，光被四表，格于上下。\n\n克明俊德，以亲九族；九族既睦，平章百姓；百姓昭明，协和万邦。\n\n黎民于变时雍。\"",
        commentary: "这是《大学》\"修身齐家治国平天下\"的直接出处。尧的治理秘诀是\"克明俊德\" — 先把自己的光明德性显发出来，然后从九族→百姓→万邦自然扩散。这给企业家一个震撼的提醒：组织文化的源头永远是创始人自己的德性，一切管理工具都是下游。",
        practiceHint: "今天只做一件事：把你自己正在做的某个\"不光明\"的事情（小谎言、推卸责任、抱怨）立刻停掉。你会惊讶地发现，团队氛围在 48 小时内就开始变化。",
      },
    ],
  },
  {
    slug: "zuozhuan", title: "左传", titleEn: "Zuo Tradition",
    author: "左丘明(传)", era: "战国早期(前 4 世纪)",
    ring: 3, categorySlug: "confucianism",
    summary: "中国第一部编年体史学巨著，记载春秋 242 年诸国史事。不仅是史书，更是礼、德、谋、辞的宝库。《论语》之后最重要的儒家原典之一。",
    significance: "《左传》与《公羊传》《谷梁传》并称\"春秋三传\"，但唯《左传》以丰富的史实与文学叙事见长。\"三不朽\"（立德、立功、立言）、\"多行不义必自毙\"等经典命题皆出此书。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 50,
    tags: ["左传", "春秋", "三不朽", "史学"], sortOrder: 34,
    relatedSlugs: ["lunyu", "shangshu", "mengzi"],
    chapters: [
      {
        chapterNo: 1, title: "襄公二十四年 — 三不朽",
        originalText: "《左传·襄公二十四年》记穆叔之言：\"豹闻之：太上有立德，其次有立功，其次有立言，虽久不废，此之谓不朽。\n\n若夫保姓受氏，以守宗祊，世不绝祀，无国无之。禄之大者，不可谓不朽。\"",
        commentary: "\"三不朽\"是中国人生命价值观最简洁的表达：德、功、言。\"德\"是品格的力量，\"功\"是事业的成就，\"言\"是思想的流传。三者以\"德\"为上 — 没有德作底，功和言都会被后人推翻。企业家若只追求功（规模、市值），而不修德不立言，终会被历史抹去。",
        practiceHint: "写下你希望别人在你去世后如何评价你的三句话：一句关于德、一句关于功、一句关于言。每季度回顾一次，你会开始调整自己当下的选择。",
      },
      {
        chapterNo: 2, title: "隐公元年 — 多行不义必自毙",
        originalText: "《左传·隐公元年》郑伯克段于鄢事：\"祭仲曰：\"都城过百雉，国之害也。先王之制：大都不过参国之一，中五之一，小九之一。今京不度，非制也，君将不堪。\"公曰：\"姜氏欲之，焉辟害？\"对曰：\"姜氏何厌之有？不如早为之所，无使滋蔓，蔓难图也。蔓草犹不可除，况君之宠弟乎！\"公曰：\"多行不义，必自毙，子姑待之。\"",
        commentary: "\"多行不义必自毙\"六个字，道尽历史的铁律。郑庄公不必亲自动手，只要让共叔段继续行不义，他自己就会毁灭自己。对企业家启示：对不义的竞争对手或内部叛乱者，有时最好的策略不是立刻镇压，而是\"让子弹飞一会儿\" — 不义之事自有其重力将其拉向深渊。",
        practiceHint: "下次遇到让你气愤的不公平事件，先不要行动，而是问：\"这件事如果继续发展 6 个月，它会自己崩塌吗？\"很多时候答案是肯定的。保持克制，你的境界就提升了一级。",
      },
    ],
  },
  {
    slug: "ephesians-epistle", title: "以弗所书", titleEn: "Epistle to the Ephesians",
    author: "使徒保罗", era: "约公元 60-62 年",
    ring: 3, categorySlug: "christianity",
    summary: "新约圣经中保罗的\"狱中书信\"之一，以神的救恩计划和教会的合一为主题。被誉为\"新约的王后\"，展现了基督教神学中最高的教会论与恩典论。",
    significance: "以弗所书对基督教\"因信称义\"与\"恩典得救\"的表述是最清晰的圣经文本之一。宗教改革家加尔文、路德的核心论据多出自此书。对理解西方恩典观念至关重要。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 25,
    tags: ["保罗", "恩典", "合一", "新约"], sortOrder: 35,
    relatedSlugs: ["romans-epistle", "john-gospel", "matthew-gospel"],
    chapters: [
      {
        chapterNo: 1, title: "因信蒙恩",
        originalText: "《以弗所书》2:8-10：\"你们得救是本乎恩，也因着信。这并不是出于自己，乃是神所赐的。也不是出于行为，免得有人自夸。\n\n我们原是他的工作，在基督耶稣里造成的，为要叫我们行善，就是神所预备叫我们行的。\"\n\n4:1-3：\"既然蒙召，行事为人就当与蒙召的恩相称。凡事谦虚、温柔、忍耐，用爱心互相宽容，用和平彼此联络，竭力保守圣灵所赐合而为一的心。\"",
        commentary: "保罗一句话击碎了所有\"靠自己努力挣得救赎\"的幻想：\"得救是本乎恩\"。这不等于放任不作为，而是让你从\"我必须证明自己\"的焦虑中释放出来。对企业家极重要：你的价值不是来自业绩表现，业绩表现是从你的根本价值流出来的。先有恩典，后有行动。",
        practiceHint: "明天一早，在做任何工作之前，花 3 分钟默想：\"我已经被接纳、被爱，不需要通过今天的业绩来证明自己。\"然后再开始工作。你会发现效率反而更高，因为焦虑消失了。",
      },
      {
        chapterNo: 2, title: "全副军装",
        originalText: "《以弗所书》6:10-17：\"你们要靠着主，倚赖他的大能大力作刚强的人。要穿戴神所赐的全副军装，就能抵挡魔鬼的诡计。\n\n因我们并不是与属血气的争战，乃是与那些执政的、掌权的、管辖这幽暗世界的，以及天空属灵气的恶魔争战。\n\n所以要拿起神所赐的全副军装：用真理当作带子束腰，用公义当作护心镜遮胸，又用平安的福音当作预备走路的鞋穿在脚上。此外，又拿着信德当作藤牌，可以灭尽那恶者一切的火箭。并戴上救恩的头盔，拿着圣灵的宝剑，就是神的道。\"",
        commentary: "\"全副军装\"是基督教灵修最精彩的比喻：真理是腰带，公义是护心镜，平安是鞋，信德是盾，救恩是头盔，神的道是剑。保罗提醒：你真正的敌人不是具体的人或事件，而是背后的\"幽暗权势\"。对企业家意味着：把商业竞争从人与人的对抗，升级为\"真理、公义、平安\"对\"欺骗、不义、恐惧\"的对抗。",
        practiceHint: "每天早晨出门前，像\"穿衣服\"一样在心里默念：\"今天我穿上真理、公义、平安、信心、救恩、神的道。\"一周后你会发现自己对挑衅更有底气，对焦虑更有抵抗力。",
      },
    ],
  },
  {
    slug: "tirukkural", title: "蒂鲁库拉尔", titleEn: "Thirukkural",
    author: "蒂鲁瓦鲁瓦尔(Thiruvalluvar)", era: "约前 3 世纪 - 公元 5 世纪",
    ring: 3, categorySlug: "hinduism",
    summary: "泰米尔古典文学的巅峰之作，由 1330 首对偶诗构成。分德（Aram）、利（Porul）、爱（Inbam）三部，被称为\"泰米尔人的薄伽梵歌\"，是超越宗教的普世伦理经典。",
    significance: "《蒂鲁库拉尔》是世界上被翻译成最多语言的古典作品之一（已超过 100 种语言）。其作者蒂鲁瓦鲁瓦尔被印度人尊为\"永恒的诗人\"，甘地称此书为\"为人类所写的最伟大的伦理手册\"。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 30,
    tags: ["蒂鲁库拉尔", "泰米尔", "普世伦理", "对偶诗"], sortOrder: 36,
    relatedSlugs: ["bhagavad-gita", "upanishad"],
    chapters: [
      {
        chapterNo: 1, title: "德之章 — 美德的力量",
        originalText: "《蒂鲁库拉尔》第 31 则：\"即便生命危在旦夕，智者也不会做有损美德之事。\"\n\n第 34 则：\"让你的心保持无瑕，此即为一切美德的总和；其余都不过是空洞的炫耀。\"\n\n第 40 则：\"让你今天就开始追求美德，不要等待明天；因为美德将在你死后成为你永恒的伴侣。\"",
        commentary: "蒂鲁瓦鲁瓦尔把\"心的无瑕\"列为美德的总和 — 不是外在的善行，而是内心的清净。这对企业家是振聋发聩：你可以做了很多好事（慈善、公益），但如果你的心不干净（攀比、炫耀、利益算计），那些好事都是空洞的炫耀。",
        practiceHint: "今天做一件善事，但不告诉任何人，也不记录在任何地方。体会\"隐秘行善\"的感觉。这是训练\"心的无瑕\"最快的方法。",
      },
      {
        chapterNo: 2, title: "利之章 — 正当的财富",
        originalText: "《蒂鲁库拉尔》第 754 则：\"不走邪道、不害他人而获得的财富，会带来美德与幸福。\"\n\n第 755 则：\"未经爱与德的财富，即使庞大，也应当彻底舍弃。\"\n\n第 211 则：\"真正的仁慈不期望回报；你能用什么回报天空降下的雨水？\"",
        commentary: "蒂鲁瓦鲁瓦尔把财富分得极清楚：有德的财富是祝福，无德的财富是诅咒。他甚至用\"雨水\"比喻真正的给予 — 不期待任何回报，像天空一样无私。对企业家启示：衡量你财富成就的不是金额，而是它是否\"不走邪道、不害他人\"。",
        practiceHint: "做一个\"财富审计\"：列出你最近一年的三笔主要收入，诚实问自己每一笔\"是否走邪道？是否害他人？\"。任何一笔答\"是\"的，立刻调整业务模式，哪怕牺牲短期利益。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.11 经论++ v11 精修模式 — 10 部跨传统新经论');

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
        sortOrder: def.sortOrder,
        isPublished: true,
      },
      update: {
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
        sortOrder: def.sortOrder,
      },
    });
    newScriptures++;

    for (const ch of def.chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo: ch.chapterNo } },
        create: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          practiceHint: ch.practiceHint,
        },
        update: {
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          practiceHint: ch.practiceHint,
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

  console.log('  填充新经论关联...');
  let relationCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.11 精修第一轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => {
    console.error('❌ 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
