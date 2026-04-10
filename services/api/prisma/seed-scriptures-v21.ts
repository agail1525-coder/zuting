/**
 * M38.21 经论++ v21 — 精修第十一轮：10 部继续补齐薄弱分类
 * 本轮(10部, 287 → 297):
 *   BUDDHIST-MADHYAMAKA +1 (十二门论 龙树) 3→4
 *   BUDDHIST-YOGACARA +1 (摄大乘论 无著) 3→4
 *   BUDDHIST-HUAYAN +1 (华严经·入法界品节要) 3→4
 *   BUDDHIST-TIANTAI +1 (天台小止观 智顗) 4→5
 *   ZEN-CAODONG +1 (宏智禅师广录·默照铭) 4→5
 *   TIBETAN +1 (无垢光七宝藏 龙钦巴) 13→14
 *   JUDAISM +1 (光明篇 卡巴拉 Zohar) 16→17
 *   ISLAM +1 (吉拉尼·神秘启示) 18→19
 *   CHRISTIANITY +1 (十字若望·心灵暗夜) 27→28
 *   CONFUCIANISM +1 (吕坤·呻吟语) 26→27
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
    slug: "shi-er-men-lun", title: "十二门论", titleEn: "Twelve Gate Treatise",
    author: "龙树菩萨 / 鸠摩罗什译", era: "印度公元二世纪 / 后秦译",
    ring: 2, categorySlug: "buddhist-madhyamaka",
    summary: "龙树菩萨中观学派代表作之一，与《中论》《百论》并称\"三论\"。全书以十二道\"门\"层层破斥一切对\"有\"\"无\"\"生\"\"灭\"的执着，直指诸法实相——空性。鸠摩罗什于后秦弘始年间译出，是汉传三论宗的根本经典。",
    significance: "《十二门论》是中观学在汉地流传的奠基文本之一。它的特点是比《中论》更简洁、比《百论》更系统，以\"破\"为核心方法而不立自宗，展示了中观最彻底的无所得立场。吉藏大师创立三论宗即以此论为根本依据。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 28,
    tags: ["龙树", "中观", "三论", "空性"], sortOrder: 127,
    relatedSlugs: ["zhong-lun", "mulamadhyamaka"],
    chapters: [
      {
        chapterNo: 1, title: "观因缘门 — 一切法皆从缘生故无自性",
        originalText: "《十二门论·观因缘门第一》：\"众缘所生法，是即无自性。若无自性者，云何有是法？\n\n众缘所生法有二种：一者内，二者外。众缘亦有二种：一者内，二者外。\n\n外因缘者，如泥团、转绳、陶师等和合故，有瓶生。又如缕、绳、机、杼、织师等和合故，有叠生。又如治地、筑基、梁、椽、泥、草、人功等和合故，有舍生。又如酪器、钻摇、人功等和合故，有酥生。又如种子、地、水、火、风、虚空、时节、人功等和合故，有芽生。当知外缘等法皆亦如是。\n\n内因缘者，所谓无明、行、识、名色、六入、触、受、爱、取、有、生、老死，各各先因而后生。如是内外诸法皆从众缘生。从众缘生故，即非是无因，亦非馀缘生，亦非自作，亦非他作，亦非共作，亦非无因作，是故说无自性。\n\n若法无自性，则无有相。若无有相，则无可取。若无可取，则是无生。若是无生，则是无灭。若无生无灭，即是实相。\"",
        commentary: "龙树在此门中以\"一切法皆从众缘生\"作为破执的第一刀。瓶子来自泥团+陶师+转绳的和合，布来自线+织机+织工的和合——没有哪一样东西是\"自己就是自己\"的。这叫\"无自性\"。人也一样：你的\"自我\"来自基因+家庭+教育+经历+此刻的感官输入的和合，离开这些因缘，\"你\"根本无从定位。这不是否认你存在，而是拆掉\"有一个独立不变的我\"的幻觉。现代人常被\"我必须成为某种样子\"的执着折磨——龙树会说：\"某种样子\"本来就是众缘临时和合的现象，拿它当绝对命令就是自讨苦吃。",
        practiceHint: "做\"缘起拆解\"练习：拿一件让你焦虑的事（例如\"我必须升职\"），列出支撑这个念头的所有\"缘\"——父母期待、同辈比较、经济压力、自我形象等。当你看清它由众多可变的缘拼成，而非\"天经地义\"时，焦虑会松动一层。",
      },
    ],
  },
  {
    slug: "she-dacheng-lun", title: "摄大乘论", titleEn: "Mahayana-samgraha",
    author: "无著菩萨 / 玄奘译", era: "印度公元四世纪 / 唐译",
    ring: 2, categorySlug: "buddhist-yogacara",
    summary: "无著菩萨代表作，瑜伽行派（唯识宗）的纲领性论典。全论以\"十殊胜\"统摄大乘佛法：所知依（阿赖耶识）、所知相（三自性）、入所知相（唯识观）、彼入因果（六度）、彼修差别（十地）、增上戒学、增上心学、增上慧学、彼果断、彼果智。玄奘译本是汉传唯识学的根本文本。",
    significance: "《摄大乘论》系统建立了\"阿赖耶识缘起\"的思想框架，是唯识学派最完整的教义纲要。它既是解释《解深密经》《瑜伽师地论》的钥匙，又直接催生了汉传法相宗（唐代玄奘-窥基师徒）和日本法相宗。对理解\"种子熏习\"\"转依\"等核心概念不可绕过。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 30,
    tags: ["无著", "唯识", "阿赖耶识", "瑜伽行"], sortOrder: 128,
    relatedSlugs: ["cheng-weishi-lun", "jieshenmi-jing"],
    chapters: [
      {
        chapterNo: 1, title: "所知依品 — 阿赖耶识是一切法的所依",
        originalText: "《摄大乘论·所知依品第二》：\"此中最初且说所知依即阿赖耶识。世尊何处说阿赖耶识名阿赖耶识？谓薄伽梵于《阿毘达磨大乘经》伽他中说：\n\n\"无始时来界，一切法等依，\n由此有诸趣，及涅槃证得。\"\n\n即于此中复说颂曰：\n\"由摄藏诸法，一切种子识，\n故名阿赖耶，胜者我开示。\"\n\n如是且引阿笈摩证。复何缘故此识亦复说名阿陀那识？执受一切有色根故，一切自体取所依故。所以者何？有色诸根由此执受，无有失坏，尽寿随转。又于相续正结生时，取彼生故，执受自体，是故此识亦复说名阿陀那识。\n\n此亦名心，如世尊说：\"心、意、识三。\"此中意有二种：第一与作等无间缘所依止性，无间灭识能与意识作生依止；第二染污意，与四烦恼恒共相应：一者萨迦耶见，二者我慢，三者我爱，四者无明。此即是识杂染所依。\"",
        commentary: "无著在此建立了唯识学最核心的命题：一切现象的根本依据不是外在的\"物质世界\"，而是每个众生内在的\"阿赖耶识\"（储藏识）。它像一个永不关闭的数据库，把你每一次起心动念都作为\"种子\"保存下来，这些种子又在未来条件成熟时\"现行\"为新的经验。你今天看到的世界，是昨天种子的投影；你今天种下的念头，是明天现实的原料。这不是唯心论的\"世界是我想出来的\"，而是更精细的\"你的世界是你的业力轨迹\"。对现代人：如果你发现自己反复遇到同一种困境（总遇到同类型的坏老板、同类型的失败恋爱），不要只怪环境——那可能是你阿赖耶识里某类种子在反复现行，需要的是\"转依\"（根本转变内在模式），不是换环境。",
        practiceHint: "做一周\"种子观察\"：每晚睡前回忆白天最强烈的一次情绪（愤怒/嫉妒/恐惧/贪爱），想象它是一颗正在被存入内心数据库的\"种子\"。问自己：\"我愿意让这颗种子在未来生出同样的果吗？\"这个觉察本身就是在转依。",
      },
    ],
  },
  {
    slug: "huayan-ru-fajie", title: "华严经·入法界品节要", titleEn: "Gandavyuha: Entry into the Dharma Realm",
    author: "《大方广佛华严经》 / 实叉难陀译", era: "印度四世纪结集 / 唐译",
    ring: 2, categorySlug: "buddhist-huayan",
    summary: "《华严经》最长也最动人的一品，记述善财童子（Sudhana）在文殊菩萨指引下，发菩提心后南行参访 53 位善知识（包括比丘、比丘尼、国王、长者、医师、外道、童女乃至妓女）的故事。每位善知识传授一门\"解脱法门\"，最后在普贤菩萨处圆满入法界。",
    significance: "《入法界品》是整部《华严经》的高潮，也是佛教\"行愿合一\"\"师遍天下\"精神的极致展示。它打破了\"只有出家众才能为师\"的观念——善财的老师中有商人、有女人、有外道仙人——彰显\"一切众生皆是我师\"的大乘精神。对汉传华严宗和禅宗（\"一花一世界\"的想象力来源之一）均影响深远。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 30,
    tags: ["华严", "善财", "五十三参", "法界"], sortOrder: 129,
    relatedSlugs: ["huayan-jing", "puxian-xingyuan"],
    chapters: [
      {
        chapterNo: 1, title: "善财发心 — 发阿耨多罗三藐三菩提心",
        originalText: "《华严经·入法界品》：\"尔时，文殊师利菩萨如象王回观善财童子，作如是言：\"善哉！善哉！善男子！汝已发阿耨多罗三藐三菩提心，复欲亲近诸善知识问菩萨行、修菩萨道。\n\n善男子！亲近供养诸善知识，是具一切智最初因缘。是故于此勿生疲厌。\"\n\n善财白言：\"圣者！愿为我说：菩萨云何学菩萨行？云何修菩萨行？云何趣菩萨行？云何行菩萨行？云何净菩萨行？云何入菩萨行？云何成就菩萨行？云何随顺菩萨行？云何忆念菩萨行？云何增广菩萨行？云何令普贤行速得圆满？\"\n\n文殊告言：\"善男子！于此南方有一国土，名为胜乐；其国有山，名曰妙峯。于彼山中有一比丘，名曰德云。汝可往问：菩萨云何学菩萨行？云何修菩萨行？乃至云何令普贤行速得圆满？德云比丘当为汝说。\"\n\n尔时，善财童子闻是语已，欢喜踊跃，头顶礼足，绕无数匝，殷勤瞻仰，悲泣流泪，辞退南行。\"",
        commentary: "善财童子的故事是佛教里最动人的\"学习者典范\"。他不是等待开悟的被动者，而是\"主动南行参访\"的行者——发心之后立刻出发，每参访一位善知识就继续向下一位走。文殊并没有把所有答案一次性给他，而是指出\"下一个老师在哪里\"。这是一种深刻的教育智慧：真正的成长不是有一个全知的导师，而是在无数个不同的善知识那里各学一门，最后自己综合成完整的道路。对现代人：如果你还在等\"那个完美的导师\"出现，善财会告诉你——不存在。每个你愿意谦卑学习的人都可能是你的善知识，包括比你小的、学历比你低的、看起来和\"智慧\"毫无关系的人。",
        practiceHint: "做\"五十三参\"缩微版：列出你过去一年真正学到东西的 5 位\"非正式老师\"（可能是同事、客户、长辈、孩子、陌生人）。写一句每个人教你的最重要一课。然后问自己：\"下一位老师在哪里？我准备好南行了吗？\"",
      },
    ],
  },
  {
    slug: "tiantai-xiao-zhiguan", title: "天台小止观（修习止观坐禅法要）", titleEn: "The Essentials of Buddhist Meditation",
    author: "天台智顗", era: "隋(约 594)",
    ring: 2, categorySlug: "buddhist-tiantai",
    summary: "天台宗开宗祖师智顗（538-597）为其兄陈针所撰的禅修入门书，是《摩诃止观》的精简版。全书从\"具缘\"\"诃欲\"\"弃盖\"\"调和\"\"方便\"\"正修\"\"善根发\"\"觉魔事\"\"治病\"\"证果\"十章，系统讲述止观禅修的全过程，是汉传佛教止观法门最清晰实用的入门经典。",
    significance: "《小止观》是东亚佛教禅修史上最早的\"实用禅修手册\"之一，远早于南传的《清净道论》传入汉地。它对日本天台宗、日本禅宗（包括道元）、以及后世所有强调\"止观双运\"的法门都有奠基作用。近代南怀瑾、圣严法师等都极力推荐此书作为禅修入门。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 30,
    tags: ["智顗", "天台", "止观", "禅修"], sortOrder: 130,
    relatedSlugs: ["mohe-zhiguan", "tiantai-sijiao"],
    chapters: [
      {
        chapterNo: 1, title: "调和第四 — 调身、调息、调心",
        originalText: "《修习止观坐禅法要·调和第四》：\"夫行者初学坐禅，欲修十方三世佛法者，应当先发大誓愿，度脱一切众生，愿求无上佛道。其心坚固，犹如金刚。精进勇猛，不惜身命。\n\n一者调食：夫食之为法，本欲资身进道。食若过饱，则气急身满，百脉不通，令心闭塞，坐念不安。若食过少，则身羸心悬，意虑不固。此二皆非得定之道。\n\n二者调睡眠：夫眠是无明惑覆，不可纵之。若其眠寐过多，非唯废修圣法，亦复丧失功夫，而能令心暗昧，善根沉没。当觉悟无常，调伏睡眠，令神气清白，念心明净。\n\n三者调身，四者调息，五者调心：此三应合用，不得别说。但有初中后方法不同，是则入住出相有异也。\n\n初入禅调三事者：行者初欲入禅调身者，行人欲入三昧，调身之宜。若在定外，行住进止，动静运为，悉须详审。若作粗犷，则气息随粗，以气粗故则心散难录，兼复坐时烦愦，心不恬怡。\n\n身虽在定外，亦须用意逆作方便。后入禅时，须善安身得所。初至绳床，即须先安坐处，每令安稳，久久无妨。次当正脚：若半跏坐，以左脚置右脚上，牵来近身，令左脚指与右髀齐，右脚指与左髀齐。若欲全跏，即正右脚置左脚上。次解宽衣带周正，不令坐时脱落。次当安手：以左手掌置右手上，重累手相对，顿置左脚上，牵来近身，当心而安。次当正身：先当挺动其身，并诸支节，作七八反，如似按摩法。勿令手足差异，如是已则端直，令脊骨勿曲勿耸。次正头颈，令鼻与脐相对，不偏不斜，不低不昂，平面正住。次当口吐浊气：吐气之法，开口放气，不可令粗急，以之绵绵，恣气而出，想身分中百脉不通处，放息随气而出。\"",
        commentary: "智顗的伟大之处在于，他把禅修从\"玄妙境界\"拉回到\"吃饭睡觉坐姿呼吸\"这些最日常的事上。他说：你连吃饭都不会调（不是吃太饱就是吃太少），你连睡眠都不能自主（不是困得不行就是失眠），你连坐姿都不正（不是东倒就是西歪），还谈什么证入三昧？这种彻底的现实主义是东亚禅修传统最扎实的底色。对现代人的启示：如果你抱怨\"我静不下心来\"，智顗不会直接教你方法，而是先问你——你今天吃得对吗？睡得够吗？坐姿正吗？呼吸匀吗？这些都不调，静心是空中楼阁。",
        practiceHint: "做七天\"五调\"实验：每天记录五件事的状态——食（过饱/过少/适中）、眠（不足/过多/适中）、身（坐姿端正多少分钟）、息（有没有注意呼吸）、心（最散乱时几次）。不追求完美，只要\"看见\"。一周后你会惊讶地发现，光是\"看见\"就已经改变了很多。",
      },
    ],
  },
  {
    slug: "hongzhi-mozhao-ming", title: "宏智禅师广录·默照铭", titleEn: "Hongzhi's Inscription on Silent Illumination",
    author: "宏智正觉", era: "南宋(1091-1157)",
    ring: 1, categorySlug: "zen-caodong",
    summary: "曹洞宗中兴之祖宏智正觉禅师的代表作集，其中《默照铭》是\"默照禅\"的宣言书。\"默\"是寂默止息一切思量，\"照\"是灵明不昧觉照当下；默与照不二，即是曹洞宗\"只管打坐\"的精髓。后来日本道元禅师入宋参学带回此法，形成日本曹洞宗的根本。",
    significance: "\"默照禅\"是宏智对同时代大慧宗杲\"看话禅\"的对应与补充。大慧以参\"无\"字公案为主，宏智以\"默然静照\"为主，两家并立形成南宋禅宗的两大主流。《默照铭》诗体凝练，是曹洞禅美学和实修的双重高峰。对日本曹洞宗（道元《普劝坐禅仪》直接呼应默照思想）影响尤为巨大。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 22,
    tags: ["宏智", "默照", "曹洞", "只管打坐"], sortOrder: 131,
    relatedSlugs: ["dogen-bendowa", "caodong-wuwei"],
    chapters: [
      {
        chapterNo: 1, title: "默照铭 — 默默忘言，昭昭现前",
        originalText: "《宏智禅师广录·默照铭》：\"默默忘言，昭昭现前。\n鉴时廓尔，体处灵然。\n灵然独照，照中还妙。\n露月星河，雪松云峤。\n晦而弥明，隐而愈显。\n鹤梦烟寒，水含秋远。\n浩劫空空，相与雷同。\n妙存默处，功忘照中。\n妙存何存？惺惺破昏。\n默照之道，离微之根。\n彻见离微，金梭玉机。\n正偏宛转，明暗因依。\n依无能所，底时回互。\n饮善见药，挝涂毒鼓。\n回互底时，杀活在我。\n门里出身，枝头结果。\n默唯至言，照唯普应。\n应不堕功，言不涉听。\n万象森罗，放光说法。\n彼彼证明，各各问答。\n问答证明，恰恰相应。\n照中失默，便见侵凌。\n证明问答，相应恰恰。\n默中失照，浑成剩法。\n默照理圆，莲开梦觉。\n百川赴海，千峰向岳。\n如鹅择乳，如蜂采华。\n默照至得，输我宗家。\n宗家默照，透顶透底。\n舜若多身，母陀罗臂。\n始终一揆，变态万差。\n和氏献璞，相如指瑕。\n当机有准，大用不勤。\n寰中天子，塞外将军。\n吾家底事，中规中矩。\n传去诸方，不要赚举。\"",
        commentary: "\"默默忘言，昭昭现前\"——这十个字是整个曹洞禅的总纲。\"默\"不是发呆，不是空白，不是压制念头；\"默\"是所有的追求、解释、比较都自然地停下来。\"照\"不是集中注意力，不是努力观察，不是刻意觉察；\"照\"是在\"默\"的同时自然存在的那种\"明白\"——就像月亮不需要努力就照亮大地。现代人做禅修常常陷入两个极端：一是\"死水默\"（坐到昏沉睡着），二是\"造作照\"（一直用力观察反而紧张）。宏智说：真正的默是活的，真正的照是自然的，两者本来就是一回事，不是两件事。对职场中人：最累的不是工作本身，而是\"一边做一边不停评价和纠结\"。如果你能学会在做事时\"默默忘言\"——停止内心的碎碎念——\"昭昭现前\"的专注和效率会自己出现。",
        practiceHint: "做每天 10 分钟\"默照坐\"：不选公案、不念佛号、不数呼吸。只是安静地坐，让所有的念头自然来自然去，不跟、不拒、不评价。坐到一半你可能会烦躁（\"这有什么用？\"）——烦躁也让它来让它走。坚持七天后观察：你白天工作时的杂念是不是少了一些？",
      },
    ],
  },
  {
    slug: "longchenpa-seven-treasuries", title: "无垢光七宝藏", titleEn: "Longchenpa's Seven Treasuries",
    author: "龙钦巴尊者（无垢光）", era: "西藏(1308-1364)",
    ring: 3, categorySlug: "tibetan",
    summary: "宁玛派最伟大的学者龙钦巴（Longchenpa, 1308-1364）的巅峰之作，系统建立大圆满（Dzogchen）见地的完整教义体系。七宝藏包括：《如意宝藏论》《句义宝藏论》《宗派宝藏论》《胜乘宝藏论》《实相宝藏论》《法界宝藏论》《窍诀宝藏论》。被誉为\"藏传佛教最深奥的哲学著作\"之一。",
    significance: "龙钦巴被宁玛派尊为\"第二佛\"，地位等同于宗喀巴之于格鲁派。他第一次把大圆满的口耳传承系统化为完整的哲学体系，使\"本初清净\"\"任运自成\"等概念获得严格的教理证立。现代西方大圆满研究（Herbert Guenther、Longchen Rabjam Foundation 等）几乎全部以七宝藏为根本文本。",
    difficulty: 5, oxStageMin: 7, oxStageMax: 10, readingMins: 30,
    tags: ["龙钦巴", "大圆满", "宁玛", "七宝藏"], sortOrder: 132,
    relatedSlugs: ["dzogchen-tantras", "padmasambhava"],
    chapters: [
      {
        chapterNo: 1, title: "本初清净 — 心性本自圆满，无须造作",
        originalText: "《法界宝藏论》（Chos-dbyings mdzod）：\"法界广大，超越能所。\n本初以来，不生不灭，不增不减，不垢不净。\n\n此心之本性，非有非无，非一非多。\n说有则堕常，说无则堕断。\n说一则落一边，说多则落多边。\n言语道断，心行处灭。\n\n然而此心之\"光明\"从未中断。\n如日轮虽被云覆，光明未减；\n如水虽被尘染，湿性不失。\n烦恼生起时，心性清净不动；\n分别造作时，心性任运自成。\n\n所谓\"修道\"，不是要\"获得\"什么，\n而是要\"认出\"本来就有的。\n所谓\"证悟\"，不是变成佛，\n而是认出\"你从未不是佛\"。\n\n初学者听到这话会生两种误解：\n一种说：\"既然本来是佛，那就不用修了。\"\n——这是懒惰的借口，不是大圆满的见地。\n另一种说：\"我要努力修成佛。\"\n——这是轮回的延续，不是解脱之道。\n\n真正的大圆满是：\n在\"不修\"和\"努力修\"之间找到第三种可能——\n\"让本具的光明自然现前\"。\n\n这就像：你不能\"造一朵花\"，也不能\"不管\"它——\n你要做的是\"给它水、光、土\"，让它自己开。\n\n心性的花，早就在那里。\n你要做的只是停止遮蔽它的迷惑，\n让它自然绽放。\"",
        commentary: "龙钦巴的\"本初清净\"见地是大乘佛教最激进的命题之一：你不是\"将来会成佛\"，你是\"本来就是佛，只是自己不知道\"。这听起来像是虚无主义的借口（\"反正我是佛，就不修了\"），但龙钦巴立刻堵住了这条退路——\"懒惰不是大圆满\"。真正的大圆满修行是一种精妙的平衡：既不能\"造作努力\"（因为那会强化\"我还不是佛\"的妄见），也不能\"放任不管\"（因为迷惑还在遮蔽本性）。答案是\"任运自成\"——让本具的觉性在不造作的情况下自然显现。对现代人：你不需要\"成为更好的自己\"，因为\"更好的自己\"早就在里面。你需要做的是停止用\"不够好\"\"应该更努力\"\"我还差得远\"这些念头遮蔽它。",
        practiceHint: "做\"认出\"练习：每天花 5 分钟坐下，不做任何事，只是问自己：\"在所有的念头之前，那个\"知道念头\"的\"觉性\"在哪里？\" 不用找答案，只是带着这个问题休息在当下。慢慢地你会\"认出\"——它一直都在，从未离开过。",
      },
    ],
  },
  {
    slug: "zohar", title: "光明篇（佐哈尔）", titleEn: "Zohar (Book of Splendor)",
    author: "摩西·德莱昂（托名拉比西蒙·巴·约海）", era: "西班牙 13 世纪",
    ring: 3, categorySlug: "judaism",
    summary: "卡巴拉（犹太神秘主义）最核心的经典，托名二世纪拉比西蒙·巴·约海（Shimon bar Yochai），实际由 13 世纪西班牙卡巴拉学者摩西·德莱昂（Moses de León）编纂。以对《妥拉》五经的神秘注释为骨架，展开关于\"上帝十道光辉\"（Sefirot）、\"四世界\"、\"灵魂流转\"、\"神圣婚姻\"等深邃教义。",
    significance: "《光明篇》是继《圣经》《塔木德》之后犹太教最重要的经典，被哈西德派（18世纪起）奉为与塔木德同等地位的经典。它对基督教神秘主义（文艺复兴时期的 Christian Kabbalah）、炼金术、塔罗牌、荣格分析心理学（\"集体无意识\"）都有深远影响。现代以色列 Kabbalah Centre 的全球复兴也以此书为核心。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 30,
    tags: ["卡巴拉", "光明篇", "Sefirot", "犹太神秘主义"], sortOrder: 133,
    relatedSlugs: ["torah", "sefer-yetzirah"],
    chapters: [
      {
        chapterNo: 1, title: "十道光辉 — 从无限到现实的十个层次",
        originalText: "《光明篇·开篇》（节译意译）：\"在一切之前，有 Ein Sof（无限者），无形、无名、无可言说。\n\n从 Ein Sof 流出第一道光辉 Keter（王冠）——纯粹的意志，尚未成为\"任何东西\"。\n\n从 Keter 分出两道光：右边的 Chokhmah（智慧）——\"闪现的洞见\"；左边的 Binah（理解）——\"展开的认识\"。这是最初的\"男女二元\"。\n\n Chokhmah 与 Binah 结合，生出下面的七道光辉：\n\n Chesed（慈爱）——无限的给予\n Gevurah（力量/审判）——限制与公义\n Tiferet（美丽/和谐）——慈爱与审判的平衡，即\"心\"\n Netzach（永恒/胜利）——持续的力量\n Hod（荣耀/顺服）——接受的美\n Yesod（根基）——汇聚一切，传递给最下一层\n Malkhut（王国）——现实世界，神性在物质中的显现\n\n这十道光辉（Sefirot）不是十个不同的上帝，而是唯一的 Ein Sof 在不同层次的显现。\n\n宇宙的问题是：Gevurah（审判）曾经失控，产生了\"破碎的器皿\"（Shevirat ha-Kelim），光洒落进黑暗，成为\"神圣火花\"散落在物质世界。\n\n人的使命叫 Tikkun Olam（修补世界）——通过善行、学习、祈祷，把散落的火花收集起来，让它们回归 Ein Sof。\n\n每一次你做一件善事，宇宙就恢复一点；\n每一次你说一句真话，散落的光就回家一束；\n每一次你爱一个人，破碎的器皿就修补一片。\n\n这就是人为什么存在：你是修补者。\"",
        commentary: "《光明篇》的\"十道光辉\"是西方神秘主义最精密的神圣几何学之一。它回答了一个古老问题：\"如果上帝是无限的（Ein Sof），宇宙怎么可能存在？\" 答案是\"流溢\"（emanation）——无限者不是\"创造\"世界，而是\"收缩自己\"（Tzimtzum）为世界腾出空间，然后让十道光辉层层流出，直到物质现实。最激励现代人的是\"Tikkun Olam\"（修补世界）的思想：你不是被动地等待救赎，你是主动的\"修补者\"。每一次你做一件小小的善事——帮助一个陌生人、说一句诚实的话、原谅一个伤害你的人——你都在收集散落的神圣火花，让宇宙更完整一点。这个思想在 20 世纪被犹太复兴运动（从 Abraham Joshua Heschel 到 Michael Lerner）改造成当代社会正义和环境运动的神学基础。",
        practiceHint: "做\"七天火花收集\"：每天晚上写下你白天做的一件\"收集火花\"的行为——一次真诚的感谢、一次不求回报的帮助、一次诚实的道歉、一次保护环境的小举动。七天后看这张清单：你是宇宙的修补者，这不是比喻，是事实。",
      },
    ],
  },
  {
    slug: "jilani-ghunyat", title: "吉拉尼·神秘启示（Al-Ghunya li-Talibi Tariq al-Haqq）", titleEn: "Sufficient Provision for Seekers of the Path of Truth",
    author: "阿卜杜·卡迪尔·吉拉尼", era: "巴格达(1077-1166)",
    ring: 3, categorySlug: "islam",
    summary: "苏菲派卡迪里教团（Qadiriyya）创始人阿卜杜·卡迪尔·吉拉尼（Abd al-Qadir al-Jilani）的代表作，是苏菲修行者的实用指南。全书分为信仰、仪式、伦理、灵修四大部分，既符合正统伊斯兰教法（Sharia）的严格要求，又系统展示了苏菲内修道路（Tariqa）的次第，是\"法与道合一\"的典范。",
    significance: "吉拉尼在苏菲教团史上被尊为\"诸圣之王\"（Sultan al-Awliya），卡迪里教团是全球分布最广的苏菲教团之一（从摩洛哥到印度尼西亚）。《神秘启示》在整个伊斯兰世界被视为继《圣训》《古兰经注》之后最重要的修行指南之一，在南亚、中亚、东南亚的穆斯林社区中影响巨大。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 28,
    tags: ["吉拉尼", "苏菲", "卡迪里", "法道合一"], sortOrder: 134,
    relatedSlugs: ["ihya-ulum", "mathnawi"],
    chapters: [
      {
        chapterNo: 1, title: "真信者的心 — 七层净化",
        originalText: "《神秘启示》（意译）：\"心有七层，如七重天。\n\n第一层是\"肉欲的心\"（Qalb al-Nafs）——被欲望、愤怒、嫉妒占据。大多数人一生只活在这一层，从不知道还有其他的层。\n\n第二层是\"责备的心\"（Qalb al-Lawwama）——开始意识到自己的错误，感到羞愧和悔恨。这是觉醒的第一步。\n\n第三层是\"受启发的心\"（Qalb al-Mulhama）——开始接收到真主的指引，知道什么是善什么是恶，但还没有力量完全遵行。\n\n第四层是\"宁静的心\"（Qalb al-Mutma'inna）——已经能够安住于真主的命令，欲望不再牵动心灵。古兰经说：\"哦，宁静的灵魂！喜悦地回到你主那里去。\"\n\n第五层是\"满足的心\"（Qalb al-Radiya）——接受真主赐予的一切，无论是富贵还是贫困，是健康还是疾病。不是麻木，是深深的信任。\n\n第六层是\"被满足的心\"（Qalb al-Mardiyya）——真主对这颗心满意，让它成为他的\"密友\"（Wali）。\n\n第七层是\"完美的心\"（Qalb al-Kamila）——完全消融在真主之中，只剩下\"真主通过他看见，真主通过他听见，真主通过他行动\"（圣训 Hadith Qudsi）。\n\n从第一层到第七层的路径叫\"内修之道\"（Tariqa），它必须建立在\"外行之法\"（Sharia）之上。\n\n没有 Sharia 的 Tariqa 是空中楼阁；\n没有 Tariqa 的 Sharia 是空洞仪式。\n\n真正的苏菲既不抛弃法律也不停留于法律，\n而是在严格遵守法律的同时，让心一层层地被净化，\n直到它完全属于真主。\"",
        commentary: "吉拉尼对\"七层心\"的系统描述是苏菲修行论的经典模型。它的精妙之处在于拒绝了两个极端：一是\"只要内心好就不用守教规\"的放纵派（现代称之为\"新纪元灵修\"），二是\"只要守教规就够了\"的形式派。吉拉尼说：这两者都错了，真正的修行是\"法与道合一\"——外面严格遵守教规为灵魂提供结构，内里通过冥想、念诵、净化逐层上升。这对所有宗教的修行者都是一个深刻的提醒：不要把\"纪律\"和\"自由\"对立起来，真正深入的自由只能在严格的纪律中生长。对现代人：如果你向往\"灵性\"但觉得\"戒律太束缚\"，吉拉尼会温柔地指出——没有戒律的灵性只是情绪波动，不是真正的上升。",
        practiceHint: "做\"七层心自检\"：问自己此刻主要活在哪一层？诚实作答（大多数人是 1-2 层）。然后选一个\"外在纪律\"（比如每天固定时间祈祷、或固定时间不看手机、或每天做一件利他的事），坚持一个月，观察你的心是否开始向上移动一层。",
      },
    ],
  },
  {
    slug: "john-cross-dark-night", title: "十字若望·心灵暗夜", titleEn: "Dark Night of the Soul",
    author: "十字若望", era: "西班牙(约 1578-1585)",
    ring: 3, categorySlug: "christianity",
    summary: "加尔默罗会神秘主义大师十字若望（San Juan de la Cruz, 1542-1591）的代表作。以一首神秘诗为骨架，展开对灵修路上\"感官的暗夜\"和\"灵魂的暗夜\"两个阶段的深刻分析。所谓\"暗夜\"不是痛苦本身，而是上帝为了让灵魂脱离一切次要安慰、直接与他结合所作的彻底净化。",
    significance: "十字若望与大德兰（Teresa of Avila）共同领导 16 世纪西班牙加尔默罗会改革运动，被天主教会尊为\"神秘神学博士\"（Doctor Mysticus）。《心灵暗夜》被公认为西方神秘主义文学的最高峰之一，对 20 世纪基督教灵修复兴（Thomas Merton、Henri Nouwen）和心理学（荣格分析心理学对\"黑夜\"概念的吸收）都有深远影响。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 28,
    tags: ["十字若望", "暗夜", "加尔默罗", "神秘主义"], sortOrder: 135,
    relatedSlugs: ["theresa-avila-life", "ascent-mount-carmel"],
    chapters: [
      {
        chapterNo: 1, title: "感官的暗夜 — 当上帝收走一切安慰",
        originalText: "《心灵暗夜·卷一》：\"当灵魂开始认真追求上帝时，起初会经验到极大的甜蜜——祈祷时感到温暖，读经时眼泪涌出，参加弥撒时心被感动，仿佛置身天堂门口。\n\n这是\"初学者的恩典\"——上帝像慈母喂婴儿一样，把最容易吞下的奶给他，让他有动力继续走下去。\n\n但如果上帝只给这些，灵魂永远是婴儿。\n\n所以在某个时刻——通常是你最不希望的时刻——一切安慰突然被收走。\n\n祈祷时感到空虚，像对着墙说话\n读经时字句干燥，仿佛读电话簿\n参加弥撒时心不在焉，甚至厌烦\n以前让你热泪盈眶的事，现在毫无触动\n\n你开始怀疑：\"我是不是退步了？是不是上帝抛弃我了？是不是我犯了什么大罪？\"\n\n不，恰恰相反。\n\n这是上帝的\"更深的恩典\"——他把\"感官层面的安慰\"收走，是为了让你学会\"不为了感觉好而爱他\"。\n\n一个只在\"感到甜蜜\"时祈祷的人，爱的不是上帝，爱的是\"祈祷带来的好感觉\"。\n\n上帝要你学会：即使没有任何感觉，即使一切都是干燥的、空虚的、令人厌倦的，你仍然为了他本身而祈祷。\n\n这个过程叫\"感官的暗夜\"（Noche del Sentido）。\n\n它非常难熬，但它的终点是一种新的、更深的爱——一种不依赖\"感觉良好\"的爱。\n\n就像婚姻：初恋的\"蝴蝶飞舞\"不会持续一辈子，如果一个人只在\"感到蝴蝶\"时才爱配偶，这段婚姻很快就会破裂。\n\n真正的爱是在\"没有蝴蝶\"的那些年里，依然选择忠诚和温柔。\n\n灵魂对上帝的爱也是一样。\"",
        commentary: "十字若望的\"感官暗夜\"是西方灵修史上对\"初学者热情冷却\"现象最深刻的诊断。几乎所有认真追求灵性成长的人都会经历这个阶段——起初的热情慢慢消退，祈祷或冥想变得干燥无味，甚至开始怀疑自己是否真的在成长。大多数人在这个点上放弃。十字若望说：这恰恰是你即将进入更深层次的信号，不要放弃！这个洞见对所有修行传统都通用——佛教称之为\"禅病\"（法喜过后的枯燥期），瑜伽称之为\"第二阶段\"（honeymoon is over）。对现代人：如果你的冥想/祈祷/修行在一段时间的\"感觉良好\"后进入了\"什么也没有\"的阶段，十字若望会告诉你——继续坚持，不是因为你能感到什么，而是因为这条路本身是真的。",
        practiceHint: "做\"不求感觉\"的修行：选一个修行（祈祷、冥想、读经），坚持做一个月，但刻意放弃\"评价今天感觉如何\"的习惯。无论是\"感觉好\"还是\"毫无感觉\"，都只是做。一个月后观察：你是不是开始学会\"为了事情本身\"而做，而不是\"为了感觉\"？",
      },
    ],
  },
  {
    slug: "lvkun-shenyinyu", title: "呻吟语", titleEn: "Groanings",
    author: "吕坤", era: "明(1593)",
    ring: 3, categorySlug: "confucianism",
    summary: "明代理学家吕坤（1536-1618）历时 30 年写成的语录体著作，共分\"性命\"\"存心\"\"伦理\"\"谈道\"\"修身\"\"问学\"等 17 门。\"呻吟\"指病中之声，吕坤自谦说这书是他\"病中呻吟的话\"——意思是这些思考不是悠闲的哲学，而是在人生苦难中挣扎出来的真切体悟。",
    significance: "《呻吟语》被称为\"明代第一奇书\"，与《菜根谭》《围炉夜话》并称明清三大处世经典，但比前两者更深刻。吕坤是实学派代表，既反对心学的空谈，也反对理学的教条，主张\"躬行实践\"。鲁迅、梁漱溟、南怀瑾都极为推崇此书，称其\"字字是血，句句是泪\"。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["吕坤", "呻吟语", "实学", "处世"], sortOrder: 136,
    relatedSlugs: ["caigentan", "jinsilu"],
    chapters: [
      {
        chapterNo: 1, title: "存心 — 深沉厚重是第一等资质",
        originalText: "《呻吟语·存心》选：\"深沉厚重是第一等资质，磊落豪雄是第二等资质，聪明才辩是第三等资质。\n\n天下之大事必作于细，天下之难事必作于易。轻诺必寡信，多易必多难。是以圣人犹难之，故终无难。\n\n大事难事看担当，逆境顺境看襟度，临喜临怒看涵养，群行群止看识见。\n\n千古圣贤只是治心，更无别法。心治而身治、家治、国治、天下治。心乱而万事乱。\n\n静中真味，淡中真趣，平中真景，拙中真巧，愚中真聪明，钝中真伶俐，此谓之真。凡浓艳处、奇特处、新鲜处、机巧处、伶俐处、灵动处，皆是假的。\n\n日日行，不怕千万里；常常做，不怕千万事。\n\n自处超然，处人蔼然；无事澄然，有事斩然；得意淡然，失意泰然。\n\n一怒便能动人，一惑便能误事。常持此二者，可以无大过。\n\n容人之过，是一个\"恕\"字；责己之过，是一个\"严\"字。世上只有此两种人：严于责人、恕于责己者，是小人；严于责己、恕于责人者，是君子。\n\n大凡聪明之人，极是误事。何以故？惟聪明生意见，意见一生，便不能忍耐，不能虚心，不能受教，不能从善。故聪明二字害事最大。\n\n无屋可居，无食可啖，无衣可蔽，饥寒切肌，皆人生必经之苦。不经此苦者，即经他苦；此生不经，来生必经。天地无有不打磨人之物，生人无有不经磨之命。\"",
        commentary: "吕坤这段\"深沉厚重是第一等资质\"是中国式处世哲学最精辟的排序。他把\"聪明才辩\"放在第三等，这对今天崇拜\"高智商\"\"急思维\"\"快反应\"的时代是一记闷雷。为什么深沉厚重是第一？因为聪明让人\"看得见\"，豪雄让人\"敢出手\"，但只有深沉厚重让人\"靠得住\"——靠得住的人才能承担大事，承担不住的人聪明只会坏事。吕坤本人就是个反例式的证明：他一生被政敌攻击、被朝廷冷落、被卷入党争，如果他只是聪明豪雄，早就身败名裂；正是\"深沉厚重\"让他在一次次挫折后仍然保持清明和担当。对现代职场：你身边一定有那种\"特别聪明但没人敢托付大事\"的人，也有那种\"看起来慢但你愿意把命都交给他\"的人——后者就是吕坤说的第一等资质。",
        practiceHint: "做一周\"慢半拍\"练习：无论别人说什么，你都不急于回应，先在心里默数三秒再开口。观察这个简单的改变对你的决策质量、人际关系带来的变化。你会发现——\"慢半拍\"不是反应迟钝，是深沉厚重的起点。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.21 经论++ v21 精修第十一轮 — 10 部继续补齐薄弱分类');

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
  console.log(`\n📜 M38.21 精修第十一轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
