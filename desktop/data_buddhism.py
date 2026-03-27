"""
佛教 + 藏传佛教 扩展数据库
Buddhism & Tibetan Buddhism Expanded Data

包含: 圣地、祖庭、祖师、祖训 — 历史准确数据
导出: EXTRA_BUDDHISM_SITES, EXTRA_BUDDHISM_TEMPLES, EXTRA_BUDDHISM_PATRIARCHS, EXTRA_BUDDHISM_TEACHINGS
      EXTRA_TIBETAN_SITES, EXTRA_TIBETAN_TEMPLES, EXTRA_TIBETAN_PATRIARCHS, EXTRA_TIBETAN_TEACHINGS
"""

# ══════════════════════════════════════════════════════════════
#  佛教 — 圣地 (Holy Sites)
# ══════════════════════════════════════════════════════════════
# (圣地名, 宗教, 国家, 音效类型, 搜索词English, 教义原文, 教义出处, 教义中文)

EXTRA_BUDDHISM_SITES = [
    # ──── 印度四大圣地 (补充) ────
    ("蓝毗尼", "佛教", "尼泊尔", "singing_bowl",
     "Lumbini Nepal Buddha birthplace garden",
     "天上天下，唯我独尊",
     "《长阿含经》",
     "佛陀诞生时宣告：觉醒者来到世间，为度一切众生"),

    ("鹿野苑", "佛教", "印度", "singing_bowl",
     "Sarnath Deer Park India first sermon",
     "此是苦，此是苦集，此是苦灭，此是灭苦之道",
     "《转法轮经》",
     "四圣谛：苦的真相、苦的原因、苦的止息、灭苦的道路"),

    ("拘尸那迦", "佛教", "印度", "singing_bowl",
     "Kushinagar India Buddha parinirvana stupa",
     "诸行无常，是生灭法；生灭灭已，寂灭为乐",
     "《大般涅槃经》",
     "一切有为法都是无常的，止息生灭才是真正的安乐"),

    ("王舍城灵鹫山", "佛教", "印度", "singing_bowl",
     "Vulture Peak Rajgir India Buddha preaching",
     "舍利弗，色不异空，空不异色",
     "《心经》",
     "物质与空性不二，这是般若智慧的核心"),

    ("舍卫城祇园精舍", "佛教", "印度", "singing_bowl",
     "Jetavana Sravasti India Buddhist monastery ruins",
     "若以色见我，以音声求我，是人行邪道，不能见如来",
     "《金刚经》",
     "不能通过外在形象来认识真理"),

    ("那烂陀寺遗址", "佛教", "印度", "singing_bowl",
     "Nalanda University ruins Bihar India Buddhism",
     "若人欲了知，三世一切佛，应观法界性，一切唯心造",
     "《华严经》",
     "要了解三世诸佛的智慧，应观察一切都是心的造作"),

    # ──── 东南亚 ────
    ("佛牙寺", "佛教", "斯里兰卡", "singing_bowl",
     "Temple of Sacred Tooth Relic Kandy Sri Lanka",
     "以戒为师，以法为洲",
     "《大般涅槃经》",
     "佛陀遗训：以戒律为老师，以佛法为依靠"),

    ("玉佛寺", "佛教", "泰国", "singing_bowl",
     "Wat Phra Kaew Grand Palace Bangkok Thailand",
     "不以暴力胜暴力，以慈悲胜一切",
     "《法句经》",
     "真正的胜利不是以暴制暴，而是以慈悲感化"),

    ("佛统大塔", "佛教", "泰国", "singing_bowl",
     "Phra Pathom Chedi Nakhon Pathom Thailand",
     "诸法因缘生，诸法因缘灭",
     "《杂阿含经》",
     "一切事物因缘和合而生，因缘离散而灭"),

    # ──── 东亚 ────
    ("高野山", "佛教", "日本", "temple_bell",
     "Mount Koya Koyasan Japan Shingon Buddhism",
     "即身成佛",
     "空海《即身成佛义》",
     "此身即可成佛——不必等来世，当下修行即觉悟"),

    ("比叡山延历寺", "佛教", "日本", "temple_bell",
     "Mount Hiei Enryakuji Temple Kyoto Japan",
     "一念三千",
     "最澄·天台宗",
     "一个念头中含摄三千世界——心含万法"),

    ("通度寺", "佛教", "韩国", "temple_bell",
     "Tongdosa Temple Yangsan South Korea",
     "一切众生悉有佛性",
     "《大般涅槃经》",
     "所有生命都具有成佛的潜能"),

    ("海印寺", "佛教", "韩国", "temple_bell",
     "Haeinsa Temple Tripitaka Koreana South Korea",
     "如实知自心",
     "《大日经》",
     "如实了知自己的心，即是成佛之道"),

    # ──── 中国 ────
    ("少林寺", "佛教", "中国", "temple_bell",
     "Shaolin Temple Songshan Henan China Zen",
     "不立文字，直指人心，见性成佛",
     "禅宗宗旨",
     "不依赖文字经典，直接指向心的本性"),

    ("南华寺", "佛教", "中国", "temple_bell",
     "Nanhua Temple Shaoguan Guangdong China Huineng",
     "何期自性本自清净，何期自性本自具足",
     "《六祖坛经》",
     "没想到自性本来清净，本来具足一切"),

    ("灵隐寺", "佛教", "中国", "temple_bell",
     "Lingyin Temple Hangzhou China Buddhist",
     "直指人心，见性成佛",
     "禅宗",
     "直接指向人的本心，见到自性即成佛"),

    ("白马寺", "佛教", "中国", "temple_bell",
     "White Horse Temple Luoyang China first Buddhist temple",
     "深入经藏，智慧如海",
     "《华严经·净行品》",
     "深入研习佛经，智慧就如大海般深广"),

    ("法门寺", "佛教", "中国", "temple_bell",
     "Famen Temple Xian China Buddha finger relic",
     "信为道源功德母，长养一切诸善根",
     "《华严经》",
     "信心是修道的根源，是一切善根的母亲"),

    # ──── 其他 ────
    ("不丹虎穴寺", "佛教", "不丹", "singing_bowl",
     "Tigers Nest Paro Taktsang Bhutan monastery cliff",
     "心无挂碍，无挂碍故，无有恐怖",
     "《心经》",
     "心中没有牵挂障碍，因此没有恐惧"),

    ("斯瓦扬布纳特", "佛教", "尼泊尔", "singing_bowl",
     "Swayambhunath Monkey Temple Kathmandu Nepal stupa",
     "慈悲没有敌人，智慧不起烦恼",
     "寂天《入菩提行论》",
     "以慈悲心对待一切，以智慧超越烦恼"),

    ("蒲甘万塔之城", "佛教", "缅甸", "singing_bowl",
     "Bagan Myanmar thousands pagodas temples sunrise",
     "布施是解脱贪执的最好修行",
     "《增支部》",
     "慷慨布施能帮助我们放下贪婪的执着"),
]


# ══════════════════════════════════════════════════════════════
#  佛教 — 祖庭 (Ancestral Temples)
# ══════════════════════════════════════════════════════════════
# (祖庭名, 宗教, 国家, 创建年代, 历史意义, 搜索词English)

EXTRA_BUDDHISM_TEMPLES = [
    # ──── 禅宗六祖祖庭 ────
    ("少林寺", "佛教", "中国", "495年",
     "北魏孝文帝敕建，达摩面壁九年之地，禅宗初祖庭",
     "Shaolin Temple Songshan Dengfeng Henan Bodhidharma"),

    ("二祖寺(太平寺)", "佛教", "中国", "约550年",
     "二祖慧可弘法安心之地，立雪断臂求法处",
     "Erzu Temple Anhui Taihu Second Patriarch Huike"),

    ("三祖寺(乾元寺)", "佛教", "中国", "505年",
     "三祖僧璨著《信心铭》之地，天柱山下禅宗祖庭",
     "Sanzu Temple Tianzhu Mountain Anhui Sengcan"),

    ("四祖寺(正觉寺)", "佛教", "中国", "624年",
     "四祖道信开创农禅并重之地，定居传法三十年",
     "Sizu Temple Huangmei Hubei Daoxin Fourth Patriarch"),

    ("五祖寺(东山寺)", "佛教", "中国", "654年",
     "五祖弘忍创东山法门之地，慧能得法处",
     "Wuzu Temple Dongshan Huangmei Hubei Hongren"),

    ("南华寺", "佛教", "中国", "502年",
     "六祖慧能弘法三十七年之地，曹溪祖庭，真身供奉",
     "Nanhua Temple Shaoguan Guangdong Huineng Sixth Patriarch"),

    ("光孝寺", "佛教", "中国", "约前116年",
     "六祖慧能剃度受戒之地，'风动幡动仁者心动'公案处",
     "Guangxiao Temple Guangzhou Huineng ordination"),

    # ──── 禅宗五家祖庭 ────
    ("临济寺", "佛教", "中国", "约854年",
     "临济义玄创临济宗之地，'临济喝'闻名天下",
     "Linji Temple Zhengding Hebei Linji Yixuan Rinzai"),

    ("洞山普利禅院", "佛教", "中国", "约870年",
     "洞山良价创曹洞宗之地，倡五位偏正之说",
     "Dongshan Temple Yifeng Jiangxi Caodong Soto Zen"),

    ("沩山密印寺", "佛教", "中国", "807年",
     "沩山灵佑创沩仰宗之地，裴休丞相护法",
     "Miyin Temple Weishan Hunan Guiyang school"),

    ("云门山大觉禅寺", "佛教", "中国", "923年",
     "云门文偃创云门宗之地，以'云门一字关'著称",
     "Yunmen Temple Ruyuan Guangdong Yunmen Wenyan"),

    ("清凉院(崇寿院)", "佛教", "中国", "约940年",
     "法眼文益创法眼宗之地，主张'一切现成'",
     "Qingliang Temple Nanjing Fayan Wenyi Fayan school"),

    # ──── 天台宗 ────
    ("国清寺", "佛教", "中国", "598年",
     "天台宗祖庭，智者大师创立天台教观之地",
     "Guoqing Temple Tiantai Zhejiang Zhiyi Tiantai Buddhism"),

    ("玉泉寺", "佛教", "中国", "593年",
     "智者大师晚年驻锡讲经之地，天台宗重要祖庭",
     "Yuquan Temple Dangyang Hubei Zhiyi Tiantai"),

    # ──── 华严宗 ────
    ("华严寺(至相寺)", "佛教", "中国", "约600年",
     "华严宗二祖智俨、三祖法藏弘法之地",
     "Zhixiang Temple Xian Shaanxi Huayan Buddhism Fazang"),

    ("草堂寺", "佛教", "中国", "401年",
     "鸠摩罗什译经之地，三论宗祖庭",
     "Caotang Temple Xian Shaanxi Kumarajiva translation"),

    # ──── 净土宗 ────
    ("东林寺", "佛教", "中国", "386年",
     "净土宗初祖慧远大师创立白莲社之地，净土祖庭",
     "Donglin Temple Lushan Jiangxi Huiyuan Pure Land"),

    ("香积寺", "佛教", "中国", "706年",
     "净土宗二祖善导大师塔院所在地",
     "Xiangji Temple Xian Shaanxi Shandao Pure Land"),

    ("玄中寺", "佛教", "中国", "约472年",
     "净土宗重要祖庭，昙鸾大师弘扬念佛法门",
     "Xuanzhong Temple Jiaocheng Shanxi Pure Land Tanluan"),

    # ──── 律宗 ────
    ("净业寺", "佛教", "中国", "约600年",
     "律宗祖庭，道宣律师创南山律宗之地",
     "Jingye Temple Zhongnan Mountain Shaanxi Daoxuan Vinaya"),

    # ──── 唯识宗(法相宗) ────
    ("大慈恩寺", "佛教", "中国", "648年",
     "玄奘法师主持译经之地，大雁塔所在，法相唯识宗祖庭",
     "Dacien Temple Big Wild Goose Pagoda Xian Xuanzang"),

    # ──── 密宗(唐密) ────
    ("大兴善寺", "佛教", "中国", "约265年",
     "善无畏、不空三藏译经弘法之地，唐密祖庭",
     "Daxingshan Temple Xian Shaanxi Tantric Buddhism"),

    ("青龙寺", "佛教", "中国", "582年",
     "惠果阿阇梨传法空海之地，唐密东传日本的起点",
     "Qinglong Temple Xian Shaanxi Huiguo Kukai Shingon"),

    # ──── 四大名山 ────
    ("五台山大显通寺", "佛教", "中国", "68年(传)",
     "文殊菩萨道场，中国佛教四大名山之首",
     "Wutaishan Mount Wutai Shanxi Manjushri Bodhisattva"),

    ("峨眉山万年寺", "佛教", "中国", "399年",
     "普贤菩萨道场，中国佛教四大名山之一",
     "Emeishan Mount Emei Sichuan Samantabhadra Bodhisattva"),

    ("普陀山普济禅寺", "佛教", "中国", "1080年",
     "观音菩萨道场，中国佛教四大名山之一",
     "Putuoshan Mount Putuo Zhejiang Avalokitesvara Guanyin"),

    ("九华山化城寺", "佛教", "中国", "756年",
     "地藏菩萨道场，金乔觉修行之地",
     "Jiuhuashan Mount Jiuhua Anhui Ksitigarbha Bodhisattva"),

    # ──── 其他重要寺院 ────
    ("白马寺", "佛教", "中国", "68年",
     "中国第一座官办佛寺，摄摩腾、竺法兰传法之地",
     "White Horse Temple Luoyang Henan first Chinese Buddhist temple"),

    ("灵隐寺", "佛教", "中国", "326年",
     "慧理法师开山，东南佛国之首，济公修行处",
     "Lingyin Temple Hangzhou Zhejiang Feilai Peak"),

    ("法门寺", "佛教", "中国", "约200年(东汉)",
     "供奉释迦牟尼佛真身指骨舍利之地",
     "Famen Temple Fufeng Shaanxi Buddha finger relic"),

    ("栖霞寺", "佛教", "中国", "489年",
     "三论宗重要祖庭，千佛岩石窟闻名",
     "Qixia Temple Nanjing Jiangsu Sanlun Buddhism"),

    ("天宁寺", "佛教", "中国", "齐梁",
     "江南第一丛林，拥有中国最高佛塔",
     "Tianning Temple Changzhou Jiangsu tallest pagoda"),

    # ──── 海外祖庭 ────
    ("法隆寺", "佛教", "日本", "607年",
     "圣德太子创建，世界最古老木结构建筑群",
     "Horyuji Temple Nara Japan oldest wooden Buddhist"),

    ("东大寺", "佛教", "日本", "752年",
     "奈良大佛所在地，华严宗大本山",
     "Todaiji Temple Nara Japan Great Buddha Kegon"),

    ("佛国寺", "佛教", "韩国", "528年",
     "新罗时代创建，韩国佛教建筑代表，世界文化遗产",
     "Bulguksa Temple Gyeongju South Korea Silla"),

    ("仰光大金塔(瑞光大金塔)", "佛教", "缅甸", "约前600年(传)",
     "缅甸最神圣佛塔，传供奉佛陀八根头发",
     "Shwedagon Pagoda Yangon Myanmar golden stupa"),

    ("婆罗浮屠", "佛教", "印尼", "约800年",
     "世界最大佛教遗迹，大乘佛教建筑杰作",
     "Borobudur Temple Java Indonesia Mahayana Buddhist"),

    ("吴哥窟", "佛教", "柬埔寨", "约1150年",
     "世界最大宗教建筑，由印度教转为佛教",
     "Angkor Wat Cambodia Khmer temple Buddhist"),

    ("菩提伽耶摩诃菩提寺", "佛教", "印度", "约前3世纪(阿育王)",
     "佛陀成道处，菩提树下证悟之地，世界佛教朝圣中心",
     "Mahabodhi Temple Bodh Gaya India Bodhi tree enlightenment"),

    ("那烂陀寺", "佛教", "印度", "约5世纪",
     "古代世界最大佛教大学，玄奘曾在此求学",
     "Nalanda University Bihar India ancient Buddhist learning"),
]


# ══════════════════════════════════════════════════════════════
#  佛教 — 祖师 (Patriarchs)
# ══════════════════════════════════════════════════════════════
# (祖师名, 宗教, 时代, 尊号, 核心贡献, 名言, 搜索词English)

EXTRA_BUDDHISM_PATRIARCHS = [
    # ──── 印度佛教 ────
    ("迦叶尊者", "佛教", "公元前6世纪", "头陀第一·付法初祖",
     "佛陀十大弟子之首，灵山会上拈花微笑，禅宗西天第一祖",
     "佛陀拈花，迦叶微笑——不立文字，以心传心",
     "Mahakasyapa Buddha disciple Zen first patriarch"),

    ("阿难尊者", "佛教", "公元前6世纪", "多闻第一·侍者",
     "佛陀侍者二十五年，结集经藏'如是我闻'，禅宗西天第二祖",
     "如是我闻，一时佛在舍卫国祇树给孤独园",
     "Ananda Buddha attendant Buddhist sutras recitation"),

    ("提婆菩萨", "佛教", "公元3世纪", "龙树四大弟子之一",
     "龙树高足，著《百论》破斥外道邪见",
     "一切法空，诸见亦空",
     "Aryadeva Catuhsataka Madhyamaka Buddhist philosopher"),

    ("无著菩萨", "佛教", "公元4世纪", "唯识开创者",
     "创立瑜伽行派(唯识学)，著《摄大乘论》《瑜伽师地论》",
     "三界唯心，万法唯识",
     "Asanga Yogacara Buddhist philosopher Mahayana"),

    ("世亲菩萨", "佛教", "公元4世纪", "千部论主",
     "无著之弟，由小乘转大乘，著《唯识三十颂》《俱舍论》",
     "识所变现，非有非无",
     "Vasubandhu Buddhist philosopher Consciousness-only"),

    ("马鸣菩萨", "佛教", "公元1-2世纪", "大乘文学先驱",
     "著《大乘起信论》《佛所行赞》，以文学弘扬大乘佛法",
     "一心开二门：心真如门与心生灭门",
     "Ashvaghosha Buddhacarita Awakening of Faith Mahayana"),

    ("鸠摩罗什", "佛教", "344-413年", "三藏法师",
     "龟兹高僧入中原，译《金刚经》《法华经》《维摩诘经》等",
     "若我所译经典无误，愿焚身之后，舌不焦烂",
     "Kumarajiva translator Buddhist sutras Chinese"),

    ("菩提达摩", "佛教", "?-536年", "禅宗初祖·壁观婆罗门",
     "自印度来华，嵩山少林面壁九年，开创中国禅宗",
     "不立文字，教外别传，直指人心，见性成佛",
     "Bodhidharma Shaolin Zen Buddhism first patriarch China"),

    # ──── 禅宗二至五祖 ────
    ("慧可", "佛教", "487-593年", "禅宗二祖",
     "立雪断臂求法于达摩，得安心法门，传灯续焰",
     "觅心了不可得",
     "Huike Second Patriarch Zen Buddhism arm cutting"),

    ("僧璨", "佛教", "?-606年", "禅宗三祖",
     "著《信心铭》，中国禅宗第一部理论著作",
     "至道无难，唯嫌拣择；但莫憎爱，洞然明白",
     "Sengcan Third Patriarch Xinxinming Faith in Mind"),

    ("道信", "佛教", "580-651年", "禅宗四祖",
     "开创禅农并重之制，建立禅宗第一个固定道场",
     "百千法门，同归方寸；河沙妙德，总在心源",
     "Daoxin Fourth Patriarch Zen agriculture meditation"),

    ("弘忍", "佛教", "601-674年", "禅宗五祖",
     "创东山法门，门下出慧能与神秀南北二宗",
     "不识本心，学法无益",
     "Hongren Fifth Patriarch East Mountain Dharma Gate"),

    # ──── 六祖门下及后续大师 ────
    ("南岳怀让", "佛教", "677-744年", "六祖法嗣·南岳大师",
     "六祖门下二大弟子之一，传法马祖道一",
     "说似一物即不中",
     "Nanyue Huairang Sixth Patriarch disciple Zen"),

    ("青原行思", "佛教", "671-740年", "六祖法嗣·青原大师",
     "六祖门下另一大弟子，开曹洞、云门、法眼三宗之源",
     "见山是山，见水是水；见山不是山，见水不是水；见山只是山，见水只是水",
     "Qingyuan Xingsi Zen master three stages"),

    ("马祖道一", "佛教", "709-788年", "马大师·洪州宗",
     "创洪州禅法，'平常心是道'，弟子一百三十九人",
     "平常心是道",
     "Mazu Daoyi Zen master Hongzhou school"),

    ("百丈怀海", "佛教", "720-814年", "百丈大智禅师",
     "制定《百丈清规》，确立禅宗丛林制度，'一日不作一日不食'",
     "一日不作，一日不食",
     "Baizhang Huaihai Zen monastic rules Qinggui"),

    ("黄檗希运", "佛教", "?-850年", "断际禅师",
     "马祖再传弟子，临济义玄之师，著《传心法要》",
     "不着佛求，不着法求，不着僧求，当作如是求",
     "Huangbo Xiyun Zen master Chuanxin Fayao"),

    ("临济义玄", "佛教", "?-866年", "临济大师",
     "创临济宗，棒喝交施，'四料简'接引学人",
     "随处作主，立处皆真",
     "Linji Yixuan Rinzai Zen school founder shout"),

    ("洞山良价", "佛教", "807-869年", "洞山大师",
     "创曹洞宗，倡'偏正五位'，主张默照禅",
     "向你道：渠今正是我，我今不是渠",
     "Dongshan Liangjie Caodong Soto Zen founder"),

    ("曹山本寂", "佛教", "840-901年", "曹山大师",
     "与洞山良价同创曹洞宗，发展五位君臣之说",
     "从缘荐得，相应然后方知",
     "Caoshan Benji Caodong Soto Zen co-founder"),

    ("沩山灵佑", "佛教", "771-853年", "沩山大师",
     "创沩仰宗，百丈弟子，以圆相接机",
     "生生若能不退，佛阶决定可期",
     "Guishan Lingyou Guiyang Zen school founder"),

    ("仰山慧寂", "佛教", "807-883年", "仰山大师",
     "与沩山灵佑同创沩仰宗，善用圆相说法",
     "我这里针芥相投，有什么不可",
     "Yangshan Huiji Guiyang Zen school co-founder"),

    ("云门文偃", "佛教", "864-949年", "云门大师",
     "创云门宗，以'云门一字关'著称，语句简洁锐利",
     "日日是好日",
     "Yunmen Wenyan Yunmen Zen school founder"),

    ("法眼文益", "佛教", "885-958年", "法眼大师",
     "创法眼宗，主张'一切现成'，会通华严与禅",
     "不知最亲切",
     "Fayan Wenyi Fayan Zen school founder"),

    ("赵州从谂", "佛教", "778-897年", "赵州古佛",
     "禅宗著名公案大师，'赵州茶'闻名天下",
     "吃茶去",
     "Zhaozhou Congshen Zhao Zhou tea Zen koan"),

    ("南泉普愿", "佛教", "748-835年", "南泉大师",
     "马祖法嗣，'斩猫'公案著称，境界超越言诠",
     "道不属知，不属不知",
     "Nanquan Puyuan Zen master cat koan"),

    ("德山宣鉴", "佛教", "782-865年", "德山大师",
     "初为经师，后入禅门，以棒打接引学人",
     "道得也三十棒，道不得也三十棒",
     "Deshan Xuanjian Zen master thirty blows"),

    ("雪窦重显", "佛教", "980-1052年", "雪窦大师",
     "云门宗中兴祖师，著《颂古百则》(后成《碧岩录》基础)",
     "春有百花秋有月，夏有凉风冬有雪",
     "Xuedou Chongxian Zen Blue Cliff Record verse"),

    ("圆悟克勤", "佛教", "1063-1135年", "佛果禅师",
     "著《碧岩录》，宋代禅宗最重要著作，影响深远",
     "万法归一，一归何处",
     "Yuanwu Keqin Blue Cliff Record Biyanlu Zen"),

    ("大慧宗杲", "佛教", "1089-1163年", "大慧禅师",
     "倡话头禅(看话禅)，反对默照禅，力主参'无'字",
     "只这一念，本自具足",
     "Dahui Zonggao Huatou Zen kanhua meditation"),

    # ──── 天台宗 ────
    ("智者大师(智顗)", "佛教", "538-597年", "天台大师·智者",
     "创立天台宗，著《摩诃止观》《法华玄义》，判教五时八教",
     "一念三千，止观双修",
     "Zhiyi Tiantai Buddhism founder Mohe Zhiguan"),

    ("湛然", "佛教", "711-782年", "荆溪大师",
     "天台宗中兴之祖(九祖)，提出'无情有性'说",
     "万法是真如，由不变故；真如是万法，由随缘故",
     "Zhanran Tiantai Buddhism ninth patriarch"),

    # ──── 华严宗 ────
    ("杜顺", "佛教", "557-640年", "帝心尊者·华严初祖",
     "华严宗初祖，著《华严五教止观》《法界观门》",
     "理事无碍，事事无碍",
     "Dushun Huayan Buddhism first patriarch"),

    ("法藏", "佛教", "643-712年", "贤首国师·华严三祖",
     "华严宗实际创建者，著《华严五教章》，以金狮子喻法界",
     "一即一切，一切即一",
     "Fazang Huayan Buddhism Xianshou third patriarch"),

    # ──── 净土宗 ────
    ("慧远大师", "佛教", "334-416年", "庐山大师·净土初祖",
     "创白莲社，倡念佛三昧，净土宗开山祖师",
     "念佛三昧者，一切三昧中王",
     "Huiyuan Donglin Temple Lushan Pure Land founder"),

    ("善导大师", "佛教", "613-681年", "光明善导·净土二祖",
     "净土宗集大成者，倡专修念佛，著《观经四帖疏》",
     "南无阿弥陀佛——一心专念，定得往生",
     "Shandao Pure Land Buddhism Nianfo Amitabha"),

    ("印光大师", "佛教", "1862-1940年", "净土宗十三祖",
     "民国四大高僧之一，以书信弘法，倡'敦伦尽分'",
     "敦伦尽分，闲邪存诚，老实念佛，求生净土",
     "Yinguang Pure Land master Republican era monk"),

    # ──── 律宗 ────
    ("道宣律师", "佛教", "596-667年", "南山律师·律宗开祖",
     "创南山律宗，著《四分律删繁补阙行事钞》，确立中国律学",
     "以戒为基，由戒生定，由定生慧",
     "Daoxuan Nanshan Vinaya school founder Tang dynasty"),

    ("鉴真大师", "佛教", "688-763年", "过海大师",
     "六次东渡日本，传律宗、建唐招提寺，中日文化交流先驱",
     "为大事故不惜身命",
     "Jianzhen Ganjin Toshodaiji Japan Vinaya master"),

    # ──── 唯识宗(法相宗) ────
    ("玄奘法师", "佛教", "602-664年", "三藏法师·大遍觉",
     "西行取经十七年，译经七十五部，创法相唯识宗",
     "宁可就西而死，岂能归东而生",
     "Xuanzang Journey West Faxiang Yogacara translator"),

    ("窥基大师", "佛教", "632-682年", "慈恩大师·百本疏主",
     "玄奘高足，法相唯识宗实际创建者，著百余部疏论",
     "万法唯识，识外无境",
     "Kuiji Dacien Temple Faxiang Yogacara Xuanzang disciple"),

    # ──── 唐密(中国密宗) ────
    ("善无畏", "佛教", "637-735年", "三藏法师·密宗初祖",
     "印度高僧入唐，译《大日经》，开元三大士之一",
     "大日如来遍照法界，一切众生皆具佛德",
     "Subhakarasimha Tang Esoteric Buddhism Mahavairocana"),

    ("不空金刚", "佛教", "705-774年", "三藏法师·大广智",
     "开元三大士之一，译密教经典百余部，影响唐代密宗至深",
     "即身成佛，不历僧祇",
     "Amoghavajra Tang Esoteric Buddhism translator"),

    ("一行禅师(张遂)", "佛教", "683-727年", "一行阿阇梨",
     "天文学家兼密宗大师，与善无畏共译《大日经》",
     "缘起之法不可思议",
     "Yixing monk astronomer Tang dynasty Esoteric Buddhism"),

    # ──── 近现代高僧 ────
    ("虚云老和尚", "佛教", "1840-1959年", "禅宗泰斗·虚云大师",
     "一身兼祧禅宗五家法脉，中兴六大祖庭，世寿一百二十岁",
     "修行在个人，好坏看发心。动静都是禅，一心不外驰",
     "Xuyun Chan master Revival Zen five schools 120 years"),

    ("太虚大师", "佛教", "1890-1947年", "革新僧伽·人间佛教",
     "倡'人间佛教'，推动佛教教育改革与国际交流",
     "仰止唯佛陀，完成在人格；人成即佛成，是名真现实",
     "Taixu Humanistic Buddhism reform modern monk"),

    ("弘一法师(李叔同)", "佛教", "1880-1942年", "弘一律师",
     "才艺全能转入佛门，振兴南山律宗，著《四分律比丘戒相表记》",
     "华枝春满，天心月圆",
     "Hongyi Master Li Shutong Vinaya calligraphy"),

    ("星云大师", "佛教", "1927-2023年", "佛光山开山祖师",
     "创佛光山，推动人间佛教全球化，建寺百余座",
     "给人信心，给人欢喜，给人希望，给人方便",
     "Hsing Yun Fo Guang Shan Humanistic Buddhism global"),

    ("圣严法师", "佛教", "1931-2009年", "法鼓山创办人",
     "创法鼓山，倡'心灵环保'，推动禅修与佛学教育",
     "面对它，接受它，处理它，放下它",
     "Sheng Yen Dharma Drum Mountain Chan Buddhism Taiwan"),
]


# ══════════════════════════════════════════════════════════════
#  佛教 — 祖训 (Ancestral Teachings)
# ══════════════════════════════════════════════════════════════
# (祖训名, 宗教, 出自祖师, 训诫原文, 白话解读)

EXTRA_BUDDHISM_TEACHINGS = [
    # ──── 佛陀核心教导 ────
    ("四圣谛", "佛教", "释迦牟尼",
     "此是苦圣谛，此是苦集圣谛，此是苦灭圣谛，此是苦灭道迹圣谛",
     "生命有苦，苦有原因，苦可以终止，有终止苦的道路——佛法的根本纲领"),

    ("八正道", "佛教", "释迦牟尼",
     "正见、正思维、正语、正业、正命、正精进、正念、正定",
     "八种正确的修行方法，是离苦得乐的实践道路"),

    ("缘起法", "佛教", "释迦牟尼",
     "此有故彼有，此生故彼生；此无故彼无，此灭故彼灭",
     "万事万物相互依存而生——没有任何事物可以独立存在"),

    ("三法印", "佛教", "释迦牟尼",
     "诸行无常，诸法无我，涅槃寂静",
     "一切无常、一切无我、涅槃寂静——佛法真理的三个标志"),

    ("不执两端", "佛教", "释迦牟尼",
     "如来离于二边，说于中道",
     "不执着于苦行也不执着于享乐——中道是佛陀教法的核心"),

    ("四无量心", "佛教", "释迦牟尼",
     "慈悲喜舍——愿一切众生得乐、离苦、不失安乐、住平等舍",
     "慈爱、悲悯、随喜、平等——四种无限广大的心量"),

    # ──── 般若系 ────
    ("心经要义", "佛教", "观自在菩萨(般若系)",
     "色不异空，空不异色；色即是空，空即是色",
     "物质与空性不是两回事——现象即是本质，本质即是现象"),

    ("金刚般若", "佛教", "释迦牟尼",
     "一切有为法，如梦幻泡影，如露亦如电，应作如是观",
     "世间万物如梦如幻——以这样的智慧观照，不执着于任何事物"),

    # ──── 禅宗核心 ────
    ("信心铭", "佛教", "僧璨(三祖)",
     "至道无难，唯嫌拣择。但莫憎爱，洞然明白",
     "最高的真理并不难，只怕分别取舍。放下喜恶之心，真理自然清晰"),

    ("安心法门", "佛教", "菩提达摩",
     "外息诸缘，内心无喘，心如墙壁，可以入道",
     "外在放下一切纷扰，内心止息妄念，心如墙壁般安定——这样才能入道"),

    ("坛经无念", "佛教", "六祖慧能",
     "无念为宗，无相为体，无住为本",
     "以无念为宗旨，以无相为本体，以无住为根本——这是禅宗的核心修行"),

    ("平常心是道", "佛教", "马祖道一",
     "道不用修，但莫污染。何为污染？但有生死心，造作趋向，皆是污染",
     "道不需要刻意修，只要不让妄念污染。平平常常的心，就是真实的道"),

    ("百丈清规", "佛教", "百丈怀海",
     "一日不作，一日不食",
     "不劳动就不吃饭——禅宗自食其力的丛林精神"),

    ("临济四料简", "佛教", "临济义玄",
     "有时夺人不夺境，有时夺境不夺人，有时人境俱夺，有时人境俱不夺",
     "临济接引学人的四种方法——或破执于人，或破执于境，灵活运用"),

    ("日日是好日", "佛教", "云门文偃",
     "十五日以前不问汝，十五日以后道将一句来。日日是好日",
     "不纠结过去，不忧虑未来——每一天都是美好的日子"),

    ("赵州茶", "佛教", "赵州从谂",
     "吃茶去",
     "无论你懂不懂禅，先去喝杯茶——道在日常生活中，无需远求"),

    # ──── 净土宗 ────
    ("念佛往生", "佛教", "善导大师",
     "一心专念弥陀名号，行住坐卧，不问时节久近，念念不舍者，是名正定之业",
     "一心一意称念阿弥陀佛的名号，无论何时何地都不间断——这就是往生净土的正业"),

    ("净土切要", "佛教", "印光大师",
     "真为生死，发菩提心，以深信愿，持佛名号",
     "真正为了了脱生死而发菩提心，以深切的信愿来持念佛号——净土修行的根本"),

    # ──── 天台·华严 ────
    ("止观双修", "佛教", "智者大师(智顗)",
     "止乃伏结之初门，观是断惑之正要。止则爱养心识之善资，观则策发神解之妙术",
     "止是平息妄念的入门，观是断除迷惑的关键——止观必须同时修习"),

    ("一即一切", "佛教", "法藏(华严三祖)",
     "一即一切，一切即一；一中含多，多中含一",
     "一包含一切，一切包含于一——华严法界圆融无碍的境界"),

    # ──── 唯识·律 ────
    ("唯识要旨", "佛教", "玄奘法师",
     "三界唯心，万法唯识",
     "三界(欲界色界无色界)都是心识所变现——了知这个道理，才能转识成智"),

    ("以戒为师", "佛教", "释迦牟尼(道宣律师传持)",
     "汝等比丘，于我灭后，当尊重珍敬波罗提木叉，如暗遇明，贫人得宝",
     "佛陀遗训：我灭度后你们要尊重戒律——戒律如同黑暗中的光明、贫人得到的宝藏"),

    # ──── 近现代 ────
    ("人间佛教", "佛教", "太虚大师",
     "仰止唯佛陀，完成在人格；人成即佛成，是名真现实",
     "以成佛为目标，但要在做人中完成——做好人就是成佛的基础"),

    ("心灵环保", "佛教", "圣严法师",
     "面对它，接受它，处理它，放下它",
     "遇到问题四步法：勇敢面对、坦然接受、积极处理、彻底放下"),

    ("虚云禅要", "佛教", "虚云老和尚",
     "修行在个人，好坏看发心",
     "修行全在自己，关键看你的发心是否真切——不在形式而在用心"),
]


# ══════════════════════════════════════════════════════════════
#  藏传佛教 — 圣地 (Holy Sites)
# ══════════════════════════════════════════════════════════════

EXTRA_TIBETAN_SITES = [
    ("大昭寺", "藏传佛教", "中国", "singing_bowl",
     "Jokhang Temple Lhasa Tibet sacred Buddhist",
     "嗡嘛呢叭咪吽",
     "六字大明咒",
     "观世音菩萨心咒——慈悲的力量化解一切苦难"),

    ("扎什伦布寺", "藏传佛教", "中国", "tibetan_horn",
     "Tashilhunpo Monastery Shigatse Tibet Panchen Lama",
     "若不修心，虽居静处亦无用；若能修心，在闹市中亦自在",
     "宗喀巴《菩提道次第广论》",
     "修行的关键在于修心，不在于外在环境"),

    ("塔尔寺", "藏传佛教", "中国", "tibetan_horn",
     "Kumbum Monastery Xining Qinghai Tsongkhapa birthplace",
     "暇满人身极难得，既得能办人生利",
     "宗喀巴《菩提道次第广论》",
     "得到人身非常难得，应当珍惜，精进修行"),

    ("甘丹寺", "藏传佛教", "中国", "tibetan_horn",
     "Ganden Monastery Lhasa Tibet Gelug school",
     "发菩提心，为利众生愿成佛",
     "宗喀巴",
     "发起觉悟之心——为了利益一切众生而发愿成佛"),

    ("色拉寺", "藏传佛教", "中国", "tibetan_horn",
     "Sera Monastery Lhasa Tibet debating monks",
     "闻思修三慧，戒定慧三学",
     "藏传佛教修学次第",
     "听闻、思维、实修三种智慧，配合戒律、禅定、智慧三学"),

    ("哲蚌寺", "藏传佛教", "中国", "tibetan_horn",
     "Drepung Monastery Lhasa Tibet largest Gelug",
     "依止善知识，是修行之根本",
     "《菩提道次第广论》",
     "亲近善良有智慧的老师，是一切修行的根本"),

    ("拉卜楞寺", "藏传佛教", "中国", "tibetan_horn",
     "Labrang Monastery Xiahe Gansu Tibetan Buddhism",
     "般若为母，方便为父；悲智双运，福慧双修",
     "藏传佛教要旨",
     "智慧如母亲，方便如父亲——悲悯与智慧要同时修持"),

    ("桑耶寺", "藏传佛教", "中国", "tibetan_horn",
     "Samye Monastery Tibet first Buddhist monastery",
     "嗡阿吽 班杂 咕噜 贝玛 悉地吽",
     "莲花生大士心咒",
     "莲师心咒——祈请莲花生大士加持护佑"),

    ("冈仁波齐", "藏传佛教", "中国", "tibetan_horn",
     "Mount Kailash Tibet sacred pilgrimage kora",
     "山非山，水非水，万法唯心所现",
     "密续教义",
     "外在的山水都是心识的显现——超越对事物的执着"),

    ("菩提迦耶金刚座", "藏传佛教", "印度", "singing_bowl",
     "Bodh Gaya Vajrasana India Tibetan Buddhist pilgrimage",
     "佛说一切法，为治一切心；若无一切心，何用一切法",
     "《楞严经》",
     "佛说种种法门都是为了对治种种妄心"),

    ("蓝毗尼(藏传朝圣)", "藏传佛教", "尼泊尔", "singing_bowl",
     "Lumbini Nepal Tibetan Buddhist pilgrimage Buddha birth",
     "一切有情曾为我母",
     "藏传佛教七因果教授",
     "一切众生在无始轮回中都曾经做过我的母亲——由此生起大悲心"),

    ("斯瓦扬布纳特", "藏传佛教", "尼泊尔", "singing_bowl",
     "Swayambhunath stupa Kathmandu Nepal Tibetan Buddhist",
     "自性光明，本来清净",
     "大圆满教法",
     "心的本性就是光明清净的——只需认出它，不需创造它"),
]


# ══════════════════════════════════════════════════════════════
#  藏传佛教 — 祖庭 (Ancestral Temples)
# ══════════════════════════════════════════════════════════════

EXTRA_TIBETAN_TEMPLES = [
    ("大昭寺", "藏传佛教", "中国", "647年",
     "松赞干布建造，供奉释迦牟尼十二岁等身像，藏传佛教最神圣寺院",
     "Jokhang Temple Lhasa Tibet Songtsen Gampo sacred"),

    ("扎什伦布寺", "藏传佛教", "中国", "1447年",
     "一世达赖根敦朱巴创建，历代班禅驻锡地",
     "Tashilhunpo Monastery Shigatse Tibet Panchen Lama seat"),

    ("塔尔寺", "藏传佛教", "中国", "1583年",
     "宗喀巴诞生地所建寺院，格鲁派六大寺之一",
     "Kumbum Monastery Xining Qinghai Tsongkhapa birthplace temple"),

    ("甘丹寺", "藏传佛教", "中国", "1409年",
     "宗喀巴亲建，格鲁派(黄教)第一座寺院，格鲁派祖庭",
     "Ganden Monastery Lhasa Tibet Tsongkhapa Gelug founding"),

    ("色拉寺", "藏传佛教", "中国", "1419年",
     "宗喀巴弟子释迦也失创建，格鲁派六大寺之一，以辩经闻名",
     "Sera Monastery Lhasa Tibet Gelug debating monks"),

    ("哲蚌寺", "藏传佛教", "中国", "1416年",
     "宗喀巴弟子绛央却杰创建，曾为世界最大寺院(万人僧众)",
     "Drepung Monastery Lhasa Tibet largest Gelug monastery"),

    ("拉卜楞寺", "藏传佛教", "中国", "1709年",
     "第一世嘉木样活佛创建，安多地区最大格鲁派寺院",
     "Labrang Monastery Xiahe Gansu Amdo Tibetan Buddhism"),

    ("桑耶寺", "藏传佛教", "中国", "779年",
     "莲花生大士、寂护共建，西藏第一座佛法僧三宝俱全寺院",
     "Samye Monastery Tibet first complete Buddhist monastery Padmasambhava"),

    ("托林寺", "藏传佛教", "中国", "996年",
     "古格王国益西沃创建，阿底峡尊者驻锡地，后弘期佛教中心",
     "Tholing Monastery Ngari Tibet Guge Kingdom Atisha"),

    ("萨迦寺", "藏传佛教", "中国", "1073年",
     "款·贡却杰布创建，萨迦派(花教)祖庭",
     "Sakya Monastery Tibet Sakya school founding temple"),

    ("楚布寺", "藏传佛教", "中国", "1189年",
     "第一世噶玛巴杜松虔巴创建，噶举派(白教)主寺",
     "Tsurphu Monastery Tibet Karmapa Kagyu school"),

    ("敏珠林寺", "藏传佛教", "中国", "1676年",
     "德达林巴创建，宁玛派(红教)六大母寺之一",
     "Mindrolling Monastery Tibet Nyingma school major temple"),

    ("白居寺", "藏传佛教", "中国", "1427年",
     "集萨迦、格鲁、噶举三派于一寺，建有著名十万佛塔",
     "Palcho Monastery Gyantse Tibet multi-school Kumbum stupa"),

    ("噶举传承寺(达拉岗布寺)", "藏传佛教", "中国", "1121年",
     "冈波巴创建，噶举派重要祖庭",
     "Daklha Gampo Monastery Tibet Gampopa Kagyu school"),

    ("锡金隆德寺", "藏传佛教", "印度", "1966年",
     "第十六世噶玛巴在印度重建的噶举派主寺",
     "Rumtek Monastery Sikkim India Karmapa Kagyu exile"),

    ("菩提道场(达兰萨拉)", "藏传佛教", "印度", "1960年",
     "达赖喇嘛在印度的驻锡地，藏传佛教海外中心",
     "Dharamsala India Dalai Lama Tibetan Buddhist center exile"),
]


# ══════════════════════════════════════════════════════════════
#  藏传佛教 — 祖师 (Patriarchs)
# ══════════════════════════════════════════════════════════════

EXTRA_TIBETAN_PATRIARCHS = [
    ("莲花生大士", "藏传佛教", "8世纪", "咕噜仁波切·第二佛",
     "应赤松德赞之邀入藏，降伏苯教神灵，建桑耶寺，奠定藏传佛教基础",
     "我从未离去，对有信心者我就在门前",
     "Padmasambhava Guru Rinpoche Tibetan Buddhism founder"),

    ("寂护(静命)", "藏传佛教", "725-788年", "堪布菩萨·中观自续派",
     "印度高僧入藏，与莲花生共建桑耶寺，任第一任堪布",
     "缘起性空，性空缘起",
     "Shantarakshita Samye Monastery first abbot Madhyamaka"),

    ("宗喀巴大师", "藏传佛教", "1357-1419年", "文殊化身·格鲁派开祖",
     "创格鲁派(黄教)，著《菩提道次第广论》《密宗道次第广论》",
     "暇满人身极难得，既得能办人生利；若未思维利他心，后世安得更殊胜",
     "Tsongkhapa Gelug school founder Lamrim Chenmo"),

    ("阿底峡尊者", "藏传佛教", "982-1054年", "吉祥燃灯智",
     "印度超戒寺大学者入藏，著《菩提道灯论》，复兴后弘期佛教",
     "若不以菩提心摄持，一切善根皆成轮回之因",
     "Atisha Dipamkara Shrijnana Bodh Gaya Vikramashila"),

    ("米拉日巴", "藏传佛教", "1040-1123年", "棉衣行者·大瑜伽士",
     "噶举派最著名修行者，苦行精进，以道歌传法，即身成佛",
     "不要执着于此生的成败——修行人的财富是内心的证悟",
     "Milarepa Tibetan yogi cave meditation Kagyu songs"),

    ("冈波巴", "藏传佛教", "1079-1153年", "达波拉杰·医师成就者",
     "米拉日巴首要弟子，创达波噶举派，著《解脱庄严宝论》",
     "心的本性如虚空，无生无灭，不垢不净",
     "Gampopa Dagpo Kagyu Jewel Ornament Liberation"),

    ("龙钦巴(无垢光)", "藏传佛教", "1308-1364年", "龙钦绕降·遍知者",
     "宁玛派最伟大学者之一，集大圆满教法之大成",
     "法性本来清净，如虚空无有边际",
     "Longchenpa Longchen Rabjam Nyingma Dzogchen master"),

    ("萨迦班智达", "藏传佛教", "1182-1251年", "萨迦大学者",
     "萨迦派第四祖，通达五明，与蒙古谈判维护西藏和平",
     "智慧如灯，能破无明之暗",
     "Sakya Pandita Sakya school scholar diplomat Mongolia"),

    ("八思巴", "藏传佛教", "1235-1280年", "帝师·法王",
     "萨迦派第五祖，忽必烈国师，创八思巴文字",
     "以法治国，以慈化民",
     "Drogon Chogyal Phagpa Sakya Kublai Khan imperial preceptor"),

    ("根敦朱巴(一世达赖)", "藏传佛教", "1391-1474年", "达赖喇嘛一世",
     "宗喀巴弟子，创建扎什伦布寺，后被追认为一世达赖喇嘛",
     "菩提心是一切修行的根本",
     "Gendun Drup First Dalai Lama Tashilhunpo founder"),

    ("克珠杰(一世班禅)", "藏传佛教", "1385-1438年", "班禅喇嘛一世",
     "宗喀巴弟子，后被追认为一世班禅喇嘛，格鲁派重要传承者",
     "修行之要，在于调伏自心",
     "Khedrup Je First Panchen Lama Tsongkhapa disciple Gelug"),

    ("蒋扬钦哲旺波", "藏传佛教", "1820-1892年", "利美运动先驱",
     "发起利美(不分教派)运动，融合藏传各派精华",
     "一切教派如同条条大路通向同一山顶",
     "Jamyang Khyentse Wangpo Rime movement non-sectarian Tibet"),

    ("蒋贡康楚", "藏传佛教", "1813-1899年", "知识之海·利美大师",
     "编纂《五宝藏》，保存藏传佛教各派珍贵法本",
     "佛法如大海，唯信能入，唯智能度",
     "Jamgon Kongtrul Five Treasuries Rime encyclopedist"),

    ("玛尔巴译师", "藏传佛教", "1012-1097年", "大译师·噶举初祖",
     "三赴印度求法于那洛巴，将密法带回西藏，噶举派创始人",
     "不经苦行，难证菩提",
     "Marpa Lotsawa translator Naropa Kagyu school founder"),

    ("那洛巴", "藏传佛教", "1016-1100年", "那烂陀大班智达",
     "印度大成就者，那洛六法创始人，玛尔巴之师",
     "苦行是净化业障的大火",
     "Naropa Nalanda Six Yogas Indian Mahasiddha Kagyu lineage"),

    ("帝洛巴", "藏传佛教", "988-1069年", "大手印成就者",
     "那洛巴之师，噶举派传承源头，印度八十四大成就者之一",
     "不作意，不寻思，不分别，不修整，安住本然",
     "Tilopa Mahamudra Indian Mahasiddha Kagyu lineage root"),
]


# ══════════════════════════════════════════════════════════════
#  藏传佛教 — 祖训 (Ancestral Teachings)
# ══════════════════════════════════════════════════════════════

EXTRA_TIBETAN_TEACHINGS = [
    ("菩提道次第", "藏传佛教", "宗喀巴大师",
     "暇满难得、死殁无常、业果不虚、轮回过患——以此四种思维转心向法",
     "人身难得、死亡无常、因果不虚、轮回是苦——这四种思维能让心转向修行"),

    ("三主要道", "藏传佛教", "宗喀巴大师",
     "出离心、菩提心、空性正见——此三为一切佛法之要",
     "厌离轮回之心、利益众生之心、了悟空性之见——修行的三个核心"),

    ("修心八颂", "藏传佛教", "朗日塘巴(噶当派)",
     "愿我于一切有情，视之尤胜如意宝；愿成就彼究竟利，恒常心怀珍爱情",
     "愿我把一切众生看得比如意宝还珍贵，永远怀着珍爱之心为他们谋求究竟利益"),

    ("入菩萨行", "藏传佛教", "寂天菩萨",
     "所有世间乐，悉从利他生；一切世间苦，咸由自利起",
     "世间所有的快乐都来自利他，所有的痛苦都来自自私——这是菩提心的核心"),

    ("大圆满见", "藏传佛教", "龙钦巴",
     "心之本性，本来清净，如虚空般无际；不需修整，不需造作，任运自在",
     "心的本来面目就是清净光明的——不需要刻意修造，只需安住于本然状态"),

    ("大手印精要", "藏传佛教", "冈波巴",
     "不修不整不散乱",
     "不刻意修、不刻意整治、也不散乱——安住于心的自然状态，这就是大手印"),

    ("六字大明咒义", "藏传佛教", "观世音菩萨传承",
     "嗡嘛呢叭咪吽——六字总摄一切佛法，对治六道轮回之苦",
     "六字真言包含了佛法的一切精华——以大悲心对治六道众生的苦难"),

    ("莲师遗教", "藏传佛教", "莲花生大士",
     "当你的心与法融为一体时，一切显现都是法身的游舞",
     "心与佛法合一之时，所见一切都是觉悟的展现——万法皆为修行的助缘"),

    ("米拉道歌", "藏传佛教", "米拉日巴",
     "此身即坛城，此心即本尊；烦恼即菩提，轮回即涅槃",
     "身体就是修行的坛城，心就是本尊——烦恼的本质就是觉悟，轮回与涅槃不二"),

    ("依止善知识", "藏传佛教", "阿底峡尊者",
     "未得菩提前，需要依师故；当依善知识，了知依师法",
     "在证得菩提之前，都需要依靠善知识的引导——正确依止上师是修行的根本"),

    ("利美精神", "藏传佛教", "蒋扬钦哲旺波",
     "一切教派之法，皆是佛陀教言，不应偏执一宗而排斥他派",
     "所有教派的法门都是佛陀的教导——不应偏执于某一宗派而排斥其他传承"),

    ("那洛六法要义", "藏传佛教", "那洛巴",
     "拙火、幻身、光明、迁识、梦瑜伽、中阴——六法为即身成佛之捷径",
     "内热瑜伽、幻身术、净光修法、迁识法、梦中修行、中阴导引——快速成就的六种修法"),

    ("空悲双运", "藏传佛教", "宗喀巴大师",
     "证悟空性而不舍大悲，生起大悲而不离空性——空悲双运乃大乘精髓",
     "了悟空性的同时不丢失悲悯心，生起悲悯的同时不离开空性智慧——这是大乘佛法的核心"),

    ("觉囊他空见", "藏传佛教", "笃补巴·喜饶坚赞",
     "世俗谛空，胜义谛不空——如来藏光明自性本具",
     "世俗层面是空的，但究竟真理不是空无——佛性的光明本性本来具足"),
]
