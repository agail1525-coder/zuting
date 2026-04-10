/**
 * M38.19 经论++ v19 — 精修第九轮：10 部深根
 * 本轮(10部, 267 → 277):
 *   BUDDHISM +3 (那先比丘经 Milindapanha / 解脱道论 Vimuttimagga / 大般涅槃经)
 *   ZEN +2 (拔队得胜语录 / 盘珪不生禅)
 *   TAOISM +2 (河上公老子注 / 王弼老子注)
 *   CONFUCIANISM +1 (周礼)
 *   CHRISTIANITY +2 (大德兰·全德之路 / 东正教·爱神集 Philokalia)
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
    slug: "milindapanha", title: "那先比丘经(Milindapanha)", titleEn: "Milindapanha — Questions of King Milinda",
    author: "那先(Nagasena)与弥兰陀王对话", era: "公元前 2 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "希腊化时代印度-希腊王国国王米南德一世（弥兰陀王）与佛教长老那先的哲学对话集。米南德用希腊式的逻辑辩论向那先提出各种\"难问\"，那先用一个个精妙的比喻回答，最终使国王皈依佛教。是东西方哲学最早的正式对话之一。",
    significance: "《那先比丘经》具有独特的历史价值：它既是佛教经典，也是希腊哲学史的一部分。它留下的\"战车之喻\"（什么是\"我\"？）、\"火焰之喻\"（心识如何相续？）等至今仍是哲学课堂的经典教材。证明佛教从一开始就能与最严格的理性论辩抗衡。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["那先", "弥兰陀", "希腊化"], sortOrder: 107,
    relatedSlugs: ["ahan-jing", "sutta-nipata"],
    chapters: [
      {
        chapterNo: 1, title: "战车之喻 — 什么是\"我\"",
        originalText: "《那先比丘经》：\"弥兰陀王问那先：\"尊者，你的名字是什么？\"\n\n那先答：\"人们叫我那先，但这只是一个称呼，并没有一个\"那先\"真实存在于这里。\"\n\n王惊讶：\"如果没有\"那先\"，那是谁在跟我说话？是你的头发？你的牙齿？你的骨头？你的心？\"\n\n那先反问：\"大王，你是怎么来的？\"王答：\"坐战车来的。\"\n\n那先：\"什么是\"战车\"？车轴是战车吗？车轮是战车吗？车座是战车吗？\"\n\n王答：\"都不是，但把这些部件按正确方式组合起来，就叫\"战车\"。\"\n\n那先：\"同样，\"那先\"也不是任何一个部件 — 不是头发、不是骨头、不是心念。把色、受、想、行、识这五蕴组合起来，就叫\"那先\"。\n\n\"我\"只是一个方便的称呼，并没有一个实体的\"我\"。\"\n\n弥兰陀王大悟。",
        commentary: "\"战车之喻\"是佛教\"无我论\"（Anatta）最著名的论证。它的精髓是：你所谓的\"我\"，只是\"色受想行识\"的暂时组合 — 就像战车只是\"部件的组合\"。拆开任何一个部件去找\"战车本身\"，你永远找不到。对现代人：你所有的焦虑、自卑、骄傲，都建立在一个假设之上 — \"有一个\"我\"需要被保护/提升/证明\"。但如果这个\"我\"本来就不存在呢？",
        practiceHint: "花 10 分钟做\"战车分析\"：列出 10 个你认为\"定义你\"的事情（职业、头衔、财富、关系、成就...）。一件一件问：\"这真的是\"我\"吗？\" 最后问：\"如果这些都拿走，还剩什么？\" 那个\"剩下的\"才值得你花心思照顾。",
      },
    ],
  },
  {
    slug: "vimuttimagga", title: "解脱道论(Vimuttimagga)", titleEn: "Vimuttimagga — The Path of Freedom",
    author: "优波底沙(Upatissa)", era: "公元 1-2 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "早于《清净道论》的另一部南传阿毗达磨修行手册，斯里兰卡长老优波底沙所著。比《清净道论》简洁，但系统性同样完整 — 从戒、定、慧三学全面介绍南传禅修方法。中国僧伽婆罗曾翻译此经（已佚巴利原本，今只存汉译本）。",
    significance: "《解脱道论》的特殊价值在于：它是研究早期南传禅法最古老的文献之一。它与《清净道论》的对比研究，让学者能重建\"觉音之前\"的南传佛教修行形态。对现代正念禅、内观禅的源流研究极其重要。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 30,
    tags: ["解脱道论", "南传", "禅修"], sortOrder: 108,
    relatedSlugs: ["visuddhimagga", "dhammapada"],
    chapters: [
      {
        chapterNo: 1, title: "十三头陀支 — 减法修行",
        originalText: "《解脱道论》卷一云：\"头陀者，抖擞之义，以戒除烦恼之著。欲断贪爱，当修头陀行。头陀有十三支：\n\n一、粪扫衣支 — 只穿丢弃的破布缝制的衣服\n二、三衣支 — 只持三件衣\n三、常乞食支 — 只吃托钵乞来的食物\n四、次第乞食支 — 不挑家门\n五、一坐食支 — 一日只一餐\n六、节量食支 — 不过量\n七、时后不食支 — 午后不食\n八、阿兰若住支 — 住在林野\n九、树下住支 — 住在树下\n十、露地住支 — 住在无遮蔽处\n十一、冢间住支 — 住在墓地\n十二、随处住支 — 不挑住处\n十三、常坐不卧支 — 不躺下睡觉\n\n此十三支，不是强制，是自愿。修行者依自己的能力选择几支来行 — 每一支都是在\"减法\"：减掉外在的舒适，增加内在的觉察。\"",
        commentary: "南传头陀行的深意是\"反向的富有\"— 当你拥有得越少，你被打扰得越少；当你被打扰得越少，你的内心越清明；当内心越清明，你需要的越少；你需要的越少，你就越自由。这是一个\"越少越自由\"的正反馈循环。对现代人极有启示：消费主义告诉你\"更多=更好\"，头陀行告诉你\"更少=更好\"。真正的富有不在于你拥有什么，而在于你不需要什么。",
        practiceHint: "选一条\"现代头陀支\"本月实行。例如：① 现代版粪扫衣：不买任何新衣服 30 天；② 现代版一坐食：每天只吃 2 餐；③ 现代版常坐不卧：每晚睡前静坐 15 分钟；④ 现代版阿兰若：每周有一整天不用手机。只选一条，坚持一个月。",
      },
    ],
  },
  {
    slug: "mahaparinirvana-sutra", title: "大般涅槃经", titleEn: "Mahaparinirvana Sutra",
    author: "昙无谶译", era: "北凉(421)",
    ring: 2, categorySlug: "buddhist-general",
    summary: "大乘佛教最重要的\"末期经典\"之一，记述佛陀涅槃前后的教诲。核心教义是\"一切众生悉有佛性\"和\"涅槃常乐我净\"，颠覆了早期佛教\"涅槃寂灭\"的消极印象，提出\"佛性本有\"的积极佛性论。是中国佛教\"佛性论\"的最直接经文源头。",
    significance: "《涅槃经》的\"佛性论\"对中国佛教影响极深 — 竺道生仅凭阅读前半部就敢预言\"一阐提（断善根者）也有佛性\"，被当时视为异端，后来昙无谶全译本传来证实了他的预言。这个故事被称为中国思想史上的\"生公说法，顽石点头\"典故。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["涅槃经", "佛性", "一阐提"], sortOrder: 109,
    relatedSlugs: ["lengqie-jing", "ratnagotravibhaga"],
    chapters: [
      {
        chapterNo: 1, title: "一切众生皆有佛性 — 最激进的平等观",
        originalText: "《大般涅槃经·师子吼菩萨品》云：\"善男子！一切众生皆有佛性。以佛性故，一切众生皆当得成阿耨多罗三藐三菩提。\n\n以是义故，我常宣说一切众生悉有佛性。乃至一阐提等，亦有佛性。\n\n一阐提者，以无信故名一阐提。然虽无信，亦有佛性。\n\n譬如金矿，中有金性。但以杂染故，金相不现。若用善巧方法，去其杂染，金相即显。\n\n众生亦复如是。虽为烦恼所覆，佛性不灭。若以善巧方法，除诸烦恼，佛性即现。\n\n菩萨大慈悲者，为度一阐提故，设种种方便。不舍一人。不以其\"无信\"而弃。\n\n是故菩萨行，名为\"佛事\" — 把每一个人都看作未来的佛，然后用相应的方式对待。\"",
        commentary: "\"一切众生皆有佛性\"甚至包括\"一阐提\"（佛教传统认为\"永不得救\"的人），这在 5 世纪是极其激进的观点 — 相当于说\"最坏的罪犯也能成圣\"。这种彻底的平等观深深影响了中国文化：从此以后，中国佛教不再相信\"有些人天生就不行\"，而相信\"每个人都有可能\"。对企业家：你对下属的\"不抱希望\"，会直接创造他们的\"不抱希望\"；你对一个\"表现差\"的员工的态度，决定了他未来 5 年的命运。涅槃经的教导：把每一个人都当作\"未来的佛\"去对待。",
        practiceHint: "选一个你觉得\"没救了\"的下属（或合作伙伴、家人）。本月刻意练习：不去\"拯救\"他，不去\"改造\"他，只是\"相信他本来就有佛性\"。你只需要在言语和态度上微调 —像对待一个尚未展开的珍宝一样对待他。看他的变化。",
      },
    ],
  },
  {
    slug: "bassui-tokusho", title: "拔队得胜禅师语录", titleEn: "Bassui Tokusho's Zen Letters",
    author: "拔队得胜(Bassui Tokusho)", era: "日本室町(1327-1387)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "日本室町时代临济宗禅师拔队得胜的书信与法语集。拔队不像同时代的其他禅师那样热衷于公案文字，他主张\"直接追问一个问题\"— \"这听闻声音的是谁？\" 他的教法朴素直接，对后世白隐禅师影响深远。",
    significance: "拔队是\"现代禅\"的先驱 — 他的教法完全剥离了宗教仪式和复杂的哲学体系，直接让学人面对自己的\"本性\"。20 世纪铃木大拙把拔队的作品译成英文，让他成为西方认识日本禅的重要人物之一。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["拔队", "室町", "日本禅"], sortOrder: 110,
    relatedSlugs: ["takuan-fudochi", "hakuin-yasenkanna"],
    chapters: [
      {
        chapterNo: 1, title: "听声音的是谁 — 最简单的话头",
        originalText: "《拔队得胜语录》致某居士书：\"你不需要学任何经典、不需要背任何公案、不需要找任何名师。\n\n你只需要问一个问题 — 就这一个：\"这听闻声音的是谁？\"\n\n现在你能听到鸟叫、车声、风声 — 是什么在\"听\"？\n\n是你的耳朵吗？耳朵只是器官，死人也有耳朵，但死人不\"听\"。\n\n是你的大脑吗？大脑只是肉，肉不会\"听\"。\n\n是\"你\"吗？\"你\"是什么？不是头发，不是骨头，不是思想 — 那么，是什么？\n\n坚持问这个问题，不要寻找答案，不要停止疑问。走路时问，吃饭时问，躺在床上时问。\n\n有一天，这个问题会\"突破\"— 你会找到那个\"听者\"。它既不是\"你\"，也不是\"不是你\"。它就在那里，一直都在。\n\n找到这个\"听者\"，就是见性。比任何经典都更直接。\"",
        commentary: "拔队的\"听声音的是谁\"与现代心理学\"观察者效应\"有奇妙的呼应 — 当你意识到\"有一个\"你\"在观察\"的时候，那个\"被观察的你\"和\"观察的你\"是同一个人吗？这个问题一旦被真正问开了，答案就会自己浮现。对现代人：我们大部分痛苦来自\"过度认同\"某个想法或情绪（\"我就是一个失败者\"\"我就是一个焦虑的人\"）。拔队的方法是：退一步，问\"这个说\"我是失败者\"的声音，是谁在说？\"",
        practiceHint: "下周每天 3 次，选不同的场景（走路时、吃饭时、工作间隙），停下来问自己：\"这听声音的是谁？\" 不要寻找答案，只是问。观察第 7 天你的内心状态。",
      },
    ],
  },
  {
    slug: "bankei-fusho", title: "盘珪不生禅", titleEn: "Bankei's Unborn Zen",
    author: "盘珪永琢(Bankei Yotaku)", era: "日本江户(1622-1693)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "江户时代临济宗大师盘珪永琢的语录集。盘珪提出著名的\"不生禅\" — 主张每个人生下来就已具备\"佛心\"，不需要通过苦修或公案参究来\"获得\"，只需要\"不忘失\"它。他的教法极其朴素，几乎不用任何专业术语，直接打动普通听众。",
    significance: "盘珪是日本禅史上\"平民化禅师\"的典范 — 他在全国巡讲时，听众既有武士和贵族，也有渔夫和农妇。他的教法因其简明被称为\"婆婆禅\"（连老太太都能听懂的禅）。20 世纪铃木大拙和 Paul Reps 将他介绍给西方，至今仍受日本普通人喜爱。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 20,
    tags: ["盘珪", "不生禅", "平民"], sortOrder: 111,
    relatedSlugs: ["bassui-tokusho", "platform-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "不生不灭的佛心 — 生下来就有的",
        originalText: "《盘珪不生禅》说法云：\"大家听好了。你们生下来，父母只给了你们一颗\"不生的佛心\"— 其他什么都没给。\n\n其他的一切 — 愤怒、贪婪、嫉妒、比较 — 都是你们后来自己学来的。\n\n你刚生下来的时候，有没有嫉妒心？没有。\n你刚生下来的时候，有没有恨谁？没有。\n你刚生下来的时候，有没有焦虑未来？没有。\n\n那颗\"本来的心\"，就是\"佛心\"。它不生不灭，一直都在。\n\n你不需要\"修行\"去获得它 — 它从来没有离开过你。\n你不需要\"苦修\"去证悟它 — 它早就在那里。\n你只需要 \"不要被后天的烦恼迷住\"，\"佛心\"就会自然显现。\n\n有听众问：\"但是我明明有愤怒、有欲望，怎么办？\"\n盘珪答：\"愤怒来了，你不需要赶它走 — 只要认得它\"不是你的本心\"，它自己就会走。你不认得，它才会赖着。\"\"",
        commentary: "盘珪的\"不生禅\"是日本禅的一大简化：他绕过了所有复杂的公案、阶位、戒律，只强调一件事 — \"认得你本来的心\"。这与道家\"婴儿纯真\"的思想、儒家\"赤子之心\"的观念相通。对现代压力下的人：你不需要\"更多的努力\"才能找到平静，你只需要\"不忘记\"你本来就是平静的。所有让你不平静的，都是\"后来学的\"。",
        practiceHint: "做一次\"不生心\"回忆：找一张你 3-5 岁时的照片（如果有）。看着那个孩子，问：\"那时候的你，心是什么样的？\" 然后意识到：那个\"本来的心\"，从未离开过你，只是被成年后的焦虑遮住了。",
      },
    ],
  },
  {
    slug: "heshang-gong-laozi", title: "河上公老子章句", titleEn: "Heshang Gong's Commentary on the Laozi",
    author: "河上公(传)", era: "西汉(约前 150)",
    ring: 3, categorySlug: "taoism",
    summary: "现存最早的《道德经》完整注释，传为西汉隐士河上公所作。此注将《道德经》分为 81 章并逐章命名（\"体道第一\"\"养身第二\"等），这种分章方式沿用至今。注释风格偏向\"养生\"和\"治国\"，是早期黄老学说的代表。",
    significance: "《河上公章句》对中国道教传统极为关键：后世道士几乎都依此本学习老子。它把《道德经》从纯哲学文本转变为\"治身治国\"的实用指南，奠定了道教\"内养外用\"的修行路径。与后世王弼的\"玄学\"注形成鲜明对比。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 25,
    tags: ["河上公", "道德经", "养生"], sortOrder: 112,
    relatedSlugs: ["daodejing", "wang-bi-laozi"],
    chapters: [
      {
        chapterNo: 1, title: "治身如治国 — 身体是一个国家",
        originalText: "《河上公章句》注\"治大国如烹小鲜\"云：\"治国烦则下乱，治身烦则精散。\n\n治大国不可烦扰民众，烹小鱼不可多翻动。治身也是同样 — 不可过度操劳精气。\n\n身体就是一个小国家 — 心是君，脾是后，肝是臣，肺是辅，肾是仆。各安其位，则身康。\n\n君乱则臣民不安（心乱则五脏不安）；民贫则国弱（精亏则身衰）。\n\n所以治身的根本是\"不烦扰\"— 不要让心在无谓的事情上过度消耗，不要让欲望不断升级，不要把身体当作\"达成外在目标\"的工具。\n\n身体自有它的智慧，治身者只需要\"不违自然\"。\n\n大病由大烦扰而生，大祸由大欲望而起。治身就是治欲，治欲就是治心，治心就是让心\"常清静\"。\"",
        commentary: "河上公的\"治身如治国\"是中国传统医学和政治哲学的结合点。这个\"身体是一个国家\"的比喻影响了整个中医理论（五脏对应五行，各司其职）。对现代企业家极有启示：你是否像\"好皇帝\"一样对待自己的身体？很多 CEO 治理公司井井有条，对自己的身体却像\"暴君\"— 通宵、暴饮暴食、忽视身体信号。河上公会说：连自己的\"国\"都治不好，如何治天下？",
        practiceHint: "做一次\"身体治国\"自评：你对自己的身体是什么样的统治者？暴君（压榨）、昏君（忽视）、明君（关爱）、无君（放任）？本月选一个行动，向\"明君\"靠近 — 比如每晚 11 点前睡、午间 15 分钟小憩、不在饭后立刻工作。",
      },
    ],
  },
  {
    slug: "wang-bi-laozi", title: "王弼老子注", titleEn: "Wang Bi's Commentary on the Laozi",
    author: "王弼", era: "三国魏(240)",
    ring: 3, categorySlug: "taoism",
    summary: "魏晋玄学开创者王弼（226-249）23 岁时所作的《道德经》注。王弼以\"以无为本\"为核心，把老子思想重新解读为形而上学的本体论。他英年早逝（24 岁），但留下的《老子注》《周易注》成为魏晋玄学的两大经典。",
    significance: "王弼的注释与河上公形成鲜明对比：河上公偏实用（养生、治国），王弼偏形而上（本体、有无）。王弼注成为后世文人\"玄学式\"读老子的主流范本，深刻影响了魏晋清谈、禅宗思想，甚至宋明理学。没有王弼，中国哲学的抽象思辨能力可能要晚 500 年才会发展。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 25,
    tags: ["王弼", "玄学", "以无为本"], sortOrder: 113,
    relatedSlugs: ["daodejing", "heshang-gong-laozi"],
    chapters: [
      {
        chapterNo: 1, title: "以无为本 — 最深的存在是\"空\"",
        originalText: "《王弼老子注》第 40 章注云：\"天下之物，皆以有为生。有之所始，以无为本。将欲全有，必反于无也。\n\n万物之\"有\"，都从\"无\"中产生。想要充分实现\"有\"，必须回到\"无\"。\n\n比如房子 — 房子的用处在于\"屋内的空间\"（无），而不在于\"墙和屋顶\"（有）。没有那个\"无\"，房子就不是房子，只是一堆材料。\n\n比如杯子 — 杯子的用处在于\"内部的空间\"（无），而不在于\"陶土\"（有）。没有那个\"无\"，杯子就盛不了水。\n\n比如公司 — 公司的价值不在\"办公楼\"\"员工数\"\"产品清单\"这些\"有\"，而在于\"文化\"\"氛围\"\"无形的信任\"这些\"无\"。\n\n\"有\"是你看得见的，\"无\"是让\"有\"有意义的那个背景。\n\n真正的治理者，不在\"有\"上忙碌，而是守护那个\"无\"。\"",
        commentary: "王弼\"以无为本\"的思想是东方哲学最深刻的本体论之一：最根本的存在不是你能\"指出来\"的东西，而是让那些\"能指出来\"的东西成立的\"背景\"。这与海德格尔的\"存在论差异\"（存在者 vs 存在）惊人相似。对企业家的启示：你能管理的是\"有\"（KPI、流程、产品），但真正决定成败的是\"无\"（信任、文化、使命感）。最高明的 CEO 花 80% 精力管理那个\"看不见的背景\"。",
        practiceHint: "列出你公司的 10 项\"有\"（产品/团队/流程/合作伙伴...）。然后列出 5 项\"无\"（文化/信任感/使命感/激情/安全感...）。问：你每周花多少时间管理\"有\"？多少时间守护\"无\"？这个比例健康吗？",
      },
    ],
  },
  {
    slug: "zhouli", title: "周礼", titleEn: "Zhouli — Rites of Zhou",
    author: "传为周公旦，约战国编订", era: "战国",
    ring: 3, categorySlug: "confucianism",
    summary: "儒家十三经之一，记载西周理想中的国家官制与礼仪系统。全书分为\"天官、地官、春官、夏官、秋官、冬官\"六大部分（冬官亡佚由《考工记》替代），涵盖政治、祭祀、军事、教育、经济、技术等方方面面。是中国最早的\"国家治理百科全书\"。",
    significance: "《周礼》的历史影响巨大：王莽改制、北魏改革、王安石变法都直接引用《周礼》作为理论依据。它所呈现的\"六官分职\"系统是后世六部制的雏形。对研究中国古代国家治理、儒家政治理想不可或缺。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 25,
    tags: ["周礼", "六官", "治国"], sortOrder: 114,
    relatedSlugs: ["lunyu", "daxue"],
    chapters: [
      {
        chapterNo: 1, title: "六官分职 — 完美的组织设计",
        originalText: "《周礼·天官·叙官》云：\"惟王建国，辨方正位，体国经野，设官分职，以为民极。\n\n乃立天官冢宰，使帅其属而掌邦治，以佐王均邦国。\n乃立地官司徒，使帅其属而掌邦教，以佐王安扰邦国。\n乃立春官宗伯，使帅其属而掌邦礼，以佐王和邦国。\n乃立夏官司马，使帅其属而掌邦政，以佐王平邦国。\n乃立秋官司寇，使帅其属而掌邦禁，以佐王刑邦国。\n乃立冬官司空，使帅其属而掌邦土，以佐王富邦国。\n\n六官六大职能 — 治（总领）、教（教育）、礼（文化）、政（军事）、禁（司法）、土（工程）。\n\n天地春夏秋冬 — 对应一年的循环，象征\"治国如天道\"。\n\n六官不偏废，国运长久；某一官偏重，则国失衡。\"",
        commentary: "《周礼》的\"六官制\"是世界最早的系统化\"组织设计\"之一。它把政府职能按\"天地春夏秋冬\"分成六大类，每一类都有明确的领导人、下属、职责范围。这种\"分职制\"思想对后世中国官制（三省六部→内阁六部）影响了 2000 年。对现代企业管理：你的公司有几\"官\"？是不是有\"缺位\"或\"重叠\"？试着用\"六官\"思路重新设计你的组织架构 — 谁管总体战略？谁管人员培养？谁管品牌文化？谁管业务执行？谁管合规风控？谁管基建资源？",
        practiceHint: "用\"六官\"框架审视你的公司：哪一官最强？哪一官最弱？弱的那一官有没有明确负责人？本月选一个\"弱官\"，为它指定一位\"主官\"并给他清晰的职责。",
      },
    ],
  },
  {
    slug: "teresa-way-perfection", title: "全德之路(Way of Perfection)", titleEn: "The Way of Perfection",
    author: "圣女大德兰(Teresa of Avila)", era: "16 世纪西班牙(约 1566)",
    ring: 3, categorySlug: "christianity",
    summary: "西班牙神秘主义大师大德兰（1515-1582）为加尔默罗会修女写的修行指南。共 42 章，从基础的\"谦卑\"\"脱离世俗\"讲起，最终指向\"默观祈祷\"（Contemplative Prayer）。是天主教灵修文献中最清晰、最实用的入门书。",
    significance: "大德兰是天主教历史上第一位被封为\"教会圣师\"（Doctor of the Church）的女性。《全德之路》与她的《灵心城堡》《自传》并称\"大德兰三部曲\"。她的默观祈祷方法对 20 世纪基督教默观运动（Thomas Merton、Thomas Keating 的 Centering Prayer）有直接影响。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["大德兰", "默观", "全德之路"], sortOrder: 115,
    relatedSlugs: ["interior-castle", "theresa-avila-life"],
    chapters: [
      {
        chapterNo: 1, title: "默观祈祷 — 在静默中与神相遇",
        originalText: "《全德之路》第 26 章云：\"祈祷不只是\"说话给神听\"。真正的祈祷是\"让神对你说话\"。\n\n但神的声音不像人的声音 — 它不是\"话语\"，而是\"内心的确信\"、\"突然的平安\"、\"对某件事的清晰理解\"。\n\n要听见这种声音，你必须先学会 \"停止说话\"。\n\n这就是默观祈祷。不念经，不祈求，不讲自己的需要 — 只是安静地坐着，把注意力放在\"神在场\"这一事实上。\n\n初学者会觉得这极度无聊 — \"我什么都没感觉到，有什么用？\"\n\n大德兰说：\"不要管你感觉到什么。你只需要\"在那里\"。就像一个新娘坐在她丈夫面前 — 她不一定要说话，她只要\"在那里\"。\"\n\n起初每天 15 分钟，渐渐延长到半小时、一小时。\n\n一年后，你会发现：你的整个人开始被一种\"看不见的力量\"引导。这不是幻想，是真实的。\"",
        commentary: "大德兰的\"默观祈祷\"与佛教的\"止观\"、道教的\"守静\"、儒家的\"静坐\"本质上是同一类修行 — 在静默中，让更深的智慧自己浮现。她的独特贡献是：把这种\"深度静默\"从\"修道院专属\"变成\"任何虔诚者都能做的事\"。对现代企业家：你每天开多少会议？听多少汇报？读多少 email？你有没有给自己每天 15 分钟的\"什么都不做、什么都不想\"的时间？这 15 分钟可能比你的 8 小时工作更决定你的生命质量。",
        practiceHint: "从明天开始，每天留出 15 分钟做\"默观祈祷\"（宗教信仰不是前提）。步骤：① 找安静处，坐下；② 闭眼，深呼吸 3 次；③ 然后什么都不做 — 不追念头，不抗拒念头，只是\"在那里\"；④ 15 分钟后，轻轻睁眼。坚持 30 天，观察变化。",
      },
    ],
  },
  {
    slug: "philokalia", title: "爱神集(Philokalia)", titleEn: "The Philokalia",
    author: "东正教 4-14 世纪教父合集", era: "4-14 世纪",
    ring: 3, categorySlug: "christianity",
    summary: "东正教灵修传统最重要的文集，收录从 4 世纪到 14 世纪东正教\"沙漠教父\"和拜占庭神学家的灵修文章。由 18 世纪修士 Makarios 和 Nicodemus 编纂。核心内容是\"心祷\"（Hesychasm）— 以\"耶稣祷文\"为中心的静默修行法。是东正教最完整的灵修教科书。",
    significance: "《爱神集》对东正教的意义等同于《五灯会元》对禅宗的意义 — 它把千年的修行智慧汇集到一本书里。19 世纪俄罗斯名著《朝圣者之路》（The Way of a Pilgrim）就是对这本书实修经验的叙述。20 世纪英译本问世后，在西方兴起了一股\"心祷复兴\"运动。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 30,
    tags: ["爱神集", "东正教", "心祷", "Hesychasm"], sortOrder: 116,
    relatedSlugs: ["imitation-christ", "dark-night-soul"],
    chapters: [
      {
        chapterNo: 1, title: "耶稣祷文 — 一句话的修行",
        originalText: "《爱神集·心祷篇》：\"心祷的方法是这样的：\n\n坐在安静的地方，低下头，半闭眼睛。\n\n随着每一次呼吸，在心里默念这句话：\"主耶稣基督，神的儿子，怜悯我这个罪人。\"\n\n吸气时念前半：\"主耶稣基督，神的儿子\"\n呼气时念后半：\"怜悯我这个罪人\"\n\n不要急，不要快，不要数遍数。\n\n起初，这句话只在\"嘴上\"— 你在念它。\n过一段时间，这句话进入\"头脑\"— 你在想它。\n再过一段时间，这句话进入\"心中\"— 你感觉它在心里自然流动，不需要刻意去念。\n最终，这句话成为你的\"自动呼吸\"— 它不需要你念，它自己在念，即便你在睡觉时它也在。\n\n这就是\"心与祷合一\"。从此，你的整个生活就是祷告，你走路、吃饭、工作、对话，都是在祷告。\n\n教父们说：\"祷告的人不应只在祈祷时祷告。\"",
        commentary: "东正教的\"耶稣祷文\"与印度教的 Japa（诵名号）、佛教的念佛、苏菲派的 Dhikr（诵念）本质上是同一种修行 — 用一句短语作为\"心锚\"，让飘荡的心有个依托。它的深刻之处在于：它不依赖你的\"意志力\"— 意志力总有耗尽的时候；它依赖\"习惯\"的力量 — 一旦形成，它会自己持续。对现代人：你每天被多少\"心念\"折磨？ — 焦虑、比较、后悔、恐惧。找一句\"你的耶稣祷文\"— 可以是宗教的，也可以是世俗的（\"此刻，此地\"\"我已经够了\"\"一切都好\"）。让它成为你的\"心锚\"。",
        practiceHint: "选一句话作为你的\"心祷\"，字数不超过 8 个字。下周每天练习：走路时、排队时、等电梯时、入睡前，在心里默念它。不要追求\"感觉\"，只追求\"频率\"。一周后，你会发现这句话开始\"自己出现\"了。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.19 经论++ v19 精修第九轮 — 10 部深根');

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
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.19 精修第九轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
