"""
五大信仰扩展数据库 — 印度教 / 锡克教 / 神道教 / 原住民灵性 / 巴哈伊教
Massively expanded data for integration with religions.py V5.0

Export:
  EXTRA_{RELIGION}_SITES      — 圣地 (8-tuple)
  EXTRA_{RELIGION}_TEMPLES    — 祖庭 (6-tuple)
  EXTRA_{RELIGION}_PATRIARCHS — 祖师 (7-tuple)
  EXTRA_{RELIGION}_TEACHINGS  — 祖训 (5-tuple)

Religion keys: HINDUISM, SIKHISM, SHINTO, INDIGENOUS, BAHAI
"""

# ╔══════════════════════════════════════════════════════════════╗
# ║                    一、印 度 教  HINDUISM                    ║
# ╚══════════════════════════════════════════════════════════════╝

# ── 圣地 ──
# (圣地名, 宗教, 国家, 音效类型, 搜索词English,
#  教义原文, 教义出处, 教义中文)

EXTRA_HINDUISM_SITES = [
    # ── 七大圣城 Sapta Puri ──
    ("瓦拉纳西", "印度教", "印度", "om_chant",
     "Varanasi Kashi Ghat Ganges India",
     "Aham Brahmāsmi — I am Brahman",
     "《布利哈德奥义书》Brihadaranyaka Upanishad 1.4.10",
     "我即是梵——个体灵魂与宇宙至上实在本质相同"),

    ("阿约提亚", "印度教", "印度", "temple_bell",
     "Ayodhya Ram Mandir India",
     "Dharmo rakshati rakshitah — 法护护法者",
     "《摩奴法典》Manusmriti 8.15",
     "守护正法者，正法亦守护他"),

    ("马图拉", "印度教", "印度", "sitar_raga",
     "Mathura Krishna birthplace India",
     "Yadā yadā hi dharmasya glānir bhavati — 当正法衰微之时",
     "《薄伽梵歌》Bhagavad Gita 4.7",
     "每当正法衰落、非法兴盛之时，我便降世"),

    ("哈里德瓦", "印度教", "印度", "om_chant",
     "Haridwar Har Ki Pauri Ganga Aarti India",
     "Gangā Gangeti yo brūyāt — 诵念恒河之名者",
     "《梵天往世书》Brahma Purana",
     "仅念诵恒河之名，便可洗涤三世罪业"),

    ("坎奇普拉姆", "印度教", "印度", "temple_bell",
     "Kanchipuram temples Tamil Nadu India",
     "Ekam sat viprā bahudhā vadanti — 真理唯一，智者以不同名字称呼它",
     "《梨俱吠陀》Rig Veda 1.164.46",
     "真理只有一个，智者以不同方式表达"),

    ("乌贾因", "印度教", "印度", "om_chant",
     "Ujjain Mahakaleshwar Jyotirlinga India",
     "Kālo'smi lokakshayakrit — 我是时间，世界的毁灭者",
     "《薄伽梵歌》Bhagavad Gita 11.32",
     "我是时间——万物的毁灭者与再生者"),

    ("德瓦尔卡", "印度教", "印度", "temple_bell",
     "Dwarka Dwarkadhish temple Gujarat India",
     "Sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja",
     "《薄伽梵歌》Bhagavad Gita 18.66",
     "放下一切执着，唯独归依于我，我将使你脱离一切罪恶"),

    # ── 恒河圣地与大壶节 ──
    ("阿拉哈巴德", "印度教", "印度", "om_chant",
     "Prayagraj Triveni Sangam Kumbh Mela India",
     "Tīrtha-snāna mahā-puṇyam — 圣水浴获大功德",
     "《摩诃婆罗多》Mahabharata 3.82",
     "在圣河交汇处沐浴，获得无量功德"),

    ("瑞诗凯诗", "印度教", "印度", "sitar_raga",
     "Rishikesh yoga capital India Ganges",
     "Yogaś citta-vṛtti-nirodhaḥ — 瑜伽即控制心念的波动",
     "《瑜伽经》Yoga Sutras 1.2",
     "瑜伽是止息心念的波动——回归内在的宁静"),

    # ── 喜马拉雅与南印度 ──
    ("冈仁波齐", "印度教", "中国", "om_chant",
     "Mount Kailash Tibet sacred peak",
     "Oṁ Namaḥ Śivāya — 礼敬湿婆",
     "《耶柔吠陀》Yajur Veda",
     "向湿婆大神致敬——这是印度教最神圣的五字真言"),

    ("阿玛尔纳特洞穴", "印度教", "印度", "temple_bell",
     "Amarnath Cave ice lingam Kashmir India",
     "Śivaṁ śāntam advaitam — 湿婆是寂静的、不二的",
     "《蛙氏奥义书》Mandukya Upanishad 7",
     "湿婆即是至上的宁静——超越一切对立的不二实在"),

    ("坎亚库马里", "印度教", "印度", "sitar_raga",
     "Kanyakumari southernmost tip India sunrise sunset",
     "Tat tvam asi — 你就是那个(至上)",
     "《歌者奥义书》Chandogya Upanishad 6.8.7",
     "你就是那个至上的存在——这是吠檀多最核心的教导"),

    ("蒂鲁帕蒂", "印度教", "印度", "temple_bell",
     "Tirupati Tirumala Venkateswara temple India",
     "Śrī Venkateśāya namaḥ — 礼敬文卡特希瓦拉",
     "印度教祈祷文",
     "向毗湿奴化身文卡特希瓦拉致敬——印度最受尊崇的神庙"),

    ("巴德里纳特", "印度教", "印度", "om_chant",
     "Badrinath temple Char Dham Uttarakhand India",
     "Nārāyaṇaṁ namaskṛtya — 向那罗延致敬",
     "《摩诃婆罗多》开篇祈祷",
     "向那罗延(毗湿奴)致敬——在喜马拉雅冰川之间感受永恒"),

    ("普里贾甘纳特", "印度教", "印度", "sitar_raga",
     "Puri Jagannath temple Odisha Rath Yatra India",
     "Jagannāthāya namaḥ — 礼敬世界之主",
     "印度教祈祷文",
     "向世界之主贾甘纳特致敬——每年战车节吸引百万信众"),

    ("拉梅什瓦拉姆", "印度教", "印度", "temple_bell",
     "Rameswaram temple Tamil Nadu India",
     "Rāma Rāma Rāmeti — 念诵罗摩之名",
     "《毗湿奴千名颂》Vishnu Sahasranama",
     "反复诵念罗摩之名——等同于念诵毗湿奴一千圣名"),
]


# ── 祖庭 ──
# (祖庭名, 宗教, 国家, 创建年代, 历史意义, 搜索词English)

EXTRA_HINDUISM_TEMPLES = [
    # ── 四大道场 Char Dham ──
    ("巴德里纳特神庙", "印度教", "印度", "约8世纪(商羯罗建)",
     "四大道场之北，毗湿奴圣地，海拔3133米喜马拉雅高处",
     "Badrinath Temple Char Dham Uttarakhand India"),

    ("德瓦尔卡神庙", "印度教", "印度", "约公元前1500年(传说)",
     "四大道场之西，传说为克里希纳建立的王国遗址",
     "Dwarkadhish Temple Gujarat India Krishna"),

    ("普里贾甘纳特神庙", "印度教", "印度", "12世纪",
     "四大道场之东，每年举行盛大战车节(Rath Yatra)",
     "Jagannath Temple Puri Odisha India"),

    ("拉梅什瓦拉姆神庙", "印度教", "印度", "12世纪",
     "四大道场之南，传说罗摩在此建立湿婆林伽后渡海救妻",
     "Ramanathaswamy Temple Rameswaram India corridor"),

    # ── 重要神庙 ──
    ("蒂鲁帕蒂文卡特希瓦拉神庙", "印度教", "印度", "约3世纪",
     "世界最富有的印度教神庙，每日接待数万朝圣者",
     "Tirumala Venkateswara Temple Tirupati India"),

    ("瓦拉纳西金庙", "印度教", "印度", "约公元前1000年(多次重建)",
     "湿婆十二大林伽之一，印度教最神圣的湿婆庙",
     "Kashi Vishwanath Temple Varanasi India golden"),

    ("索姆纳特神庙", "印度教", "印度", "约公元前3世纪(多次重建)",
     "湿婆十二大林伽之首，历经17次破坏和重建",
     "Somnath Temple Gujarat India Jyotirlinga"),

    ("马杜赖米纳克什神庙", "印度教", "印度", "约6世纪(现存12-17世纪)",
     "南印度达罗毗荼建筑杰作，供奉湿婆与帕尔瓦蒂",
     "Meenakshi Amman Temple Madurai Tamil Nadu India"),

    ("布里哈迪什瓦拉神庙", "印度教", "印度", "1010年",
     "朱罗王朝杰作，世界遗产，65米高花岗岩塔无影奇观",
     "Brihadeshwara Temple Thanjavur Chola UNESCO India"),

    ("科纳克太阳神庙", "印度教", "印度", "1255年",
     "东恒伽王朝建造的巨大战车形太阳神庙，世界遗产",
     "Konark Sun Temple Odisha India UNESCO chariot"),

    ("阿克萨达姆神庙", "印度教", "印度", "2005年",
     "新德里现代印度教巨型神庙，展示万年印度教文明",
     "Akshardham Temple New Delhi India modern Hindu"),

    # ── 商羯罗四大道院 Char Math ──
    ("斯林盖里道院", "印度教", "印度", "约820年",
     "商羯罗在南方建立的第一座吠檀多道院",
     "Sringeri Sharada Peetham Karnataka India Shankara"),

    ("德瓦尔卡道院", "印度教", "印度", "约820年",
     "商羯罗在西方建立的道院，传承不二论教学",
     "Dwarka Peetham Gujarat India Shankaracharya"),

    ("普里道院", "印度教", "印度", "约820年",
     "商羯罗在东方建立的道院，临近贾甘纳特神庙",
     "Govardhan Peetham Puri Odisha India Shankara"),

    ("乔希道院", "印度教", "印度", "约820年",
     "商羯罗在北方(巴德里纳特附近)建立的道院",
     "Jyotir Math Joshimath Uttarakhand India Shankara"),

    # ── 海外印度教圣地 ──
    ("吴哥窟", "印度教", "柬埔寨", "12世纪",
     "原为毗湿奴神庙，世界最大宗教建筑群，后转为佛寺",
     "Angkor Wat Cambodia Hindu Vishnu temple UNESCO"),

    ("百沙基母庙", "印度教", "印尼", "约14世纪",
     "巴厘岛最大最神圣的印度教神庙群，阿贡火山山腰",
     "Besakih Mother Temple Bali Indonesia Hindu"),

    ("帕舒帕蒂纳特神庙", "印度教", "尼泊尔", "约5世纪",
     "尼泊尔最重要的湿婆庙，恒河支流旁的火葬圣地",
     "Pashupatinath Temple Kathmandu Nepal Shiva cremation"),

    ("普兰巴南神庙群", "印度教", "印尼", "约850年",
     "爪哇岛最大印度教建筑群，供奉梵天、毗湿奴、湿婆三主神",
     "Prambanan Temple Java Indonesia Hindu UNESCO"),

    ("斯里兰甘纳塔神庙", "印度教", "印度", "约10世纪(现存)",
     "世界最大运营中的印度教神庙，占地63公顷，七层围墙",
     "Sri Ranganathaswamy Temple Srirangam India largest"),
]


# ── 祖师 ──
# (祖师名, 宗教, 时代, 尊号, 核心贡献, 名言, 搜索词English)

EXTRA_HINDUISM_PATRIARCHS = [
    # ── 古代圣人 Rishis ──
    ("毗耶娑", "印度教", "远古(传说公元前3000年)", "广博仙人·吠陀编纂者",
     "编纂四部吠陀，著《摩诃婆罗多》和十八部往世书",
     "Dharma存在于细微之处——不能仅凭推理判断何为正法",
     "Vyasa Ved Vedas Mahabharata author sage"),

    ("瓦尔米基", "印度教", "远古(传说)", "最初的诗人(Adi Kavi)",
     "著《罗摩衍那》史诗，开创梵文诗歌韵律体裁",
     "Mā niṣāda pratiṣṭhāṁ tvam — 猎人啊，你不得安宁(因你射杀了情侣鸟)",
     "Valmiki Ramayana author first poet sage India"),

    ("帕坦伽利", "印度教", "约公元前2世纪", "瑜伽之祖",
     "著《瑜伽经》，系统整理瑜伽八支修行体系",
     "Yogaś citta-vṛtti-nirodhaḥ — 瑜伽是止息心念波动",
     "Patanjali Yoga Sutras author sage India"),

    ("摩奴", "印度教", "远古(传说)", "人类始祖·法典编纂者",
     "传说为人类始祖，《摩奴法典》以其名流传",
     "Ācāraḥ paramo dharmaḥ — 正确的行为是最高的法",
     "Manu Manusmriti lawgiver Hindu mythology"),

    # ── 吠檀多三大阿阇梨 ──
    ("商羯罗", "印度教", "788-820年", "阿底·商羯罗阿阇梨·世界导师",
     "创不二论(Advaita)吠檀多，建四大道院，32岁统一印度教各派",
     "Brahma satyam jagan mithyā — 梵是真实的，世界是虚幻的",
     "Adi Shankara Advaita Vedanta philosopher India"),

    ("罗摩努阇", "印度教", "1017-1137年", "阿阇梨·有限不二论导师",
     "创有限不二论(Vishishtadvaita)，强调对毗湿奴的虔爱是解脱之道",
     "Prapatti(完全归依)是所有解脱之道中最崇高的",
     "Ramanuja Vishishtadvaita Vedanta philosopher Srirangam"),

    ("摩陀婆", "印度教", "1238-1317年", "阿阇梨·二元论导师",
     "创二元论(Dvaita)吠檀多，强调神与灵魂永恒有别",
     "个体灵魂与至上神之间的差别是永恒真实的",
     "Madhvacharya Dvaita Vedanta philosopher Udupi"),

    # ── 虔信运动 Bhakti Saints ──
    ("迦比尔", "印度教", "1398-1518年", "圣者·织工诗人",
     "超越印度教与伊斯兰教界限的神秘诗人，倡无形象之神",
     "不要到庙宇或清真寺中寻找我——我就在你的呼吸之间",
     "Kabir Das poet saint mystic weaver Varanasi India"),

    ("苏尔达斯", "印度教", "1478-1583年", "盲眼诗人·克里希纳歌者",
     "虽双目失明，以优美印地语诗歌歌颂克里希纳的童年神迹",
     "主啊，无论你是否垂怜我，我对你的爱不会改变",
     "Surdas blind poet Krishna bhakti Hindi India"),

    ("图西达斯", "印度教", "1532-1623年", "罗摩虔信者",
     "以阿瓦德语著《罗摩功行录》，北印度最受尊崇的宗教诗作",
     "Siyā Rām，Siyā Rām，Siyā Rām — 悉多和罗摩",
     "Tulsidas Ramcharitmanas poet saint Varanasi India"),

    ("弥拉拜", "印度教", "1498-1546年", "克里希纳的虔爱公主",
     "拉贾斯坦公主，放弃王室生活全心虔爱克里希纳，留下大量虔爱诗歌",
     "我的暗色之主(克里希纳)，除你之外世间别无依靠",
     "Mirabai princess devotee Krishna poet Rajasthan India"),

    ("柴坦尼亚", "印度教", "1486-1534年", "金色化身·爱之主",
     "发起大规模唱诵运动(Kirtan)，被信徒视为克里希纳的化身",
     "Hare Krishna Hare Rama——通过圣名唱诵即可达到解脱",
     "Chaitanya Mahaprabhu Krishna bhakti Kirtan Bengal India"),

    ("拉维达斯", "印度教", "约1450-1520年", "圣者·制革匠诗人",
     "出身贱民阶层却成为最受尊敬的虔信圣者，倡导社会平等",
     "如果心是纯洁的，恒河之水就在你家门口",
     "Ravidas Raidas saint poet Dalit Varanasi India"),

    # ── 近现代圣人 ──
    ("罗摩克里希纳", "印度教", "1836-1886年", "至上天鹅(Paramahamsa)",
     "亲证多种宗教修行均通向同一真理，倡宗教和谐",
     "不同的宗教只不过是通向同一个神的不同道路",
     "Ramakrishna Paramahamsa Dakshineswar Kolkata India"),

    ("辨喜", "印度教", "1863-1902年", "斯瓦米·维韦卡南达",
     "1893年芝加哥世界宗教大会上向西方介绍印度教，创罗摩克里希纳传教会",
     "起来，觉醒吧，不达目标永不停止",
     "Swami Vivekananda Chicago Parliament Religions India"),

    ("圣雄甘地", "印度教", "1869-1948年", "圣雄(Mahatma)·国父",
     "以非暴力不合作运动领导印度独立，将印度教伦理融入政治",
     "成为你想在世界上看到的改变",
     "Mahatma Gandhi nonviolence India independence"),

    ("室利·阿罗频多", "印度教", "1872-1950年", "圣哲·整体瑜伽创始人",
     "革命者转为灵修导师，创整体瑜伽体系，著《神圣人生论》",
     "人类只是一个过渡存在——进化的目标是超心智的降临",
     "Sri Aurobindo integral yoga Pondicherry India"),

    ("拉马纳·马哈希", "印度教", "1879-1950年", "薄伽梵·大圣",
     "以\"我是谁\"的自我探询法教导世人，蒂鲁瓦纳马莱圣者",
     "你的本性就是幸福本身——问'我是谁?'然后回到源头",
     "Ramana Maharshi Arunachala self-inquiry Tiruvannamalai India"),

    ("帕拉宏撒·尤迦南达", "印度教", "1893-1952年", "帕拉宏撒·瑜伽行者",
     "著《一个瑜伽行者的自传》将克利亚瑜伽传播到西方",
     "与宇宙合一的狂喜，胜过一切世间快乐的总和",
     "Paramahansa Yogananda Autobiography Yogi Kriya Yoga"),

    ("安纳德玛依·玛", "印度教", "1896-1982年", "至乐之母",
     "20世纪最著名的女性圣者之一，被甘地和泰戈尔尊敬",
     "世间万物本质上都是至上的喜乐",
     "Anandamayi Ma Hindu woman saint mystic Bengal India"),

    ("A.C.巴克提韦丹塔", "印度教", "1896-1977年", "斯瓦米·帕布帕德",
     "69岁赴美创立国际奎师那知觉协会(ISKCON)，将哈瑞奎师那运动传遍全球",
     "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare",
     "Prabhupada ISKCON Hare Krishna movement founder"),

    ("尼姆·卡洛里·巴巴", "印度教", "约1900-1973年", "摩诃拉吉·哈奴曼虔信者",
     "以无条件之爱闻名的圣者，对苹果公司乔布斯等西方寻道者影响深远",
     "爱所有人，服务所有人，记住神",
     "Neem Karoli Baba Maharaj-ji Ram Dass guru India"),

    ("萨蒂亚·赛巴巴", "印度教", "1926-2011年", "赛巴巴·至真之主",
     "20世纪最具影响力的印度灵性导师之一，建大量慈善机构",
     "爱的手永远在你头顶——感受它",
     "Sathya Sai Baba spiritual leader Puttaparthi India"),
]


# ── 祖训 ──
# (祖训名, 宗教, 出自祖师, 训诫原文, 白话解读)

EXTRA_HINDUISM_TEACHINGS = [
    # ── 薄伽梵歌 ──
    ("无执行动", "印度教", "克里希纳(薄伽梵歌)",
     "Karmaṇy evādhikāras te mā phaleṣu kadācana — 你只有行动的权利，没有享受果实的权利",
     "全力做好该做的事，但不执着于结果——这是无私行动瑜伽的核心"),

    ("灵魂不灭", "印度教", "克里希纳(薄伽梵歌)",
     "Nainaṁ chindanti śastrāṇi, nainaṁ dahati pāvakaḥ — 武器无法伤害灵魂，火焰无法焚烧它",
     "灵魂是永恒不灭的——如同更换旧衣服，灵魂只是更换身体"),

    ("瑜伽之道", "印度教", "克里希纳(薄伽梵歌)",
     "Yogasthaḥ kuru karmāṇi — 安住于瑜伽中行动",
     "在内在平衡中行动——成败等视，这就是瑜伽的真义"),

    ("虔爱至上", "印度教", "克里希纳(薄伽梵歌)",
     "Man-manā bhava mad-bhakto — 心念着我，成为我的虔信者",
     "以至诚的爱和虔敬归向神，即使最微小的供养神也接受"),

    ("三种品性", "印度教", "克里希纳(薄伽梵歌)",
     "Sattvaṁ rajas tama iti guṇāḥ — 善良、激情、愚昧三种品性",
     "万物受三种品性支配——超越三品性，灵魂才能获得自由"),

    # ── 奥义书 ──
    ("梵我一如", "印度教", "奥义书传统",
     "Tat tvam asi — 你就是那个(至上)",
     "个体灵魂与宇宙至上实在本质相同——认识自我即认识真理"),

    ("真理祈祷", "印度教", "奥义书传统",
     "Asato mā sad gamaya, tamaso mā jyotir gamaya — 从虚幻引我向真实，从黑暗引我向光明",
     "从不实引向真实，从黑暗引向光明，从死亡引向永生"),

    ("内在之光", "印度教", "奥义书传统",
     "Ayam ātmā brahma — 这个灵魂即是梵",
     "存在于每个生命内在的灵魂，就是宇宙至上的实在"),

    # ── 吠陀与经典 ──
    ("加耶特里咒", "印度教", "毗湿瓦弥多罗仙人",
     "Oṁ bhūr bhuvaḥ svaḥ, tat savitur vareṇyaṁ — 那至高太阳神的光辉",
     "我们冥想那至高的光辉——愿它启迪我们的心智(印度教最神圣的咒语)"),

    ("瑜伽八支", "印度教", "帕坦伽利",
     "Yama, Niyama, Āsana, Prāṇāyāma, Pratyāhāra, Dhāraṇā, Dhyāna, Samādhi",
     "戒律、自律、体式、呼吸控制、收摄感官、专注、冥想、三摩地——瑜伽修行的八个阶段"),

    # ── 虔信圣者 ──
    ("织工之歌", "印度教", "迦比尔",
     "Jaise til mein tel hai, jyon chakmak mein aag — 如同芝麻中藏着油，燧石中藏着火",
     "神就在你内心之中——不需要到外面去寻找，只需向内看"),

    ("罗摩圣名", "印度教", "图西达斯",
     "Rām nām mani dīp dhar, jīhvā dehri dvār — 将罗摩之名如明珠置于舌尖",
     "持续念诵罗摩之名——如同点亮心中的明灯，照亮人生之路"),

    ("辨喜觉醒", "印度教", "辨喜(维韦卡南达)",
     "Uttiṣṭhata jāgrata prāpya varān nibodhata — 起来，觉醒吧，直到达到目标",
     "起来行动吧！觉醒的灵魂永不停歇——直到证悟真理"),

    ("自我探询", "印度教", "拉马纳·马哈希",
     "Nān Yār? — 我是谁?",
     "不断追问'我是谁?'——一切念头的源头就是自我，找到它就找到了解脱"),

    ("非暴力真理", "印度教", "圣雄甘地",
     "Ahimsā paramo dharmaḥ — 非暴力是最高的法",
     "非暴力不仅是不伤害身体，更是不伤害任何生命的思想、言语和行为"),
]


# ╔══════════════════════════════════════════════════════════════╗
# ║                    二、锡 克 教  SIKHISM                     ║
# ╚══════════════════════════════════════════════════════════════╝

EXTRA_SIKHISM_SITES = [
    ("阿姆利则", "锡克教", "印度", "tabla_drum",
     "Amritsar Golden Temple Harmandir Sahib India",
     "Ik Onkar Sat Naam — 唯一的神，真理之名",
     "《穆尔曼陀》Mul Mantar, Guru Granth Sahib 开篇",
     "唯一的创造者，真理是他的名号——超越一切界限"),

    ("阿南德普尔萨希布", "锡克教", "印度", "harmonium",
     "Anandpur Sahib Punjab India Khalsa birthplace",
     "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh",
     "卡尔萨宣誓词 Khalsa declaration",
     "卡尔萨属于神圣的主，胜利属于神圣的主"),

    ("帕坦萨希布", "锡克教", "巴基斯坦", "tabla_drum",
     "Panja Sahib Hasan Abdal Pakistan Sikh shrine",
     "Jin prem kiyo tin hī prabh pāyo — 谁有真爱，谁就找到神",
     "《古鲁·格兰特·萨希卜》Guru Granth Sahib",
     "只有真正懂得爱的人，才能找到至高的主"),

    ("塔兰·塔兰", "锡克教", "印度", "harmonium",
     "Tarn Taran Sahib Punjab India Sikh gurdwara pool",
     "Nānak nām jahāz hai, charhe so utre pār",
     "古鲁那纳克圣训",
     "那纳克说: 神的名号如同大船，登上者即可渡过苦海"),

    ("昌迪加尔", "锡克教", "印度", "tabla_drum",
     "Chandigarh Punjab Sikh heritage India",
     "Hukam rajāī chalnā Nānak likhiā nāl — 顺从神的旨意而行",
     "《嘉布吉》Japji Sahib 最后一节",
     "接受并顺从神的旨意——这是锡克教徒的最高修行"),

    ("卡塔普尔走廊", "锡克教", "巴基斯坦", "harmonium",
     "Kartarpur Corridor Gurdwara Pakistan India border",
     "Na ko Hindu na Musalman — 没有印度教徒也没有穆斯林",
     "古鲁那纳克首次宣示",
     "没有印度教徒也没有穆斯林——在神面前所有人都是平等的"),

    ("哈扎尔萨希布", "锡克教", "印度", "tabla_drum",
     "Hazur Sahib Nanded Maharashtra India Guru Gobind Singh",
     "Āgiyā bhaī Akāl kī tabī chalāyo Panth — 永恒之主下令，于是创建了道路",
     "古鲁戈宾德·辛格最后遗训",
     "永恒之主下令创建了卡尔萨——此后圣典即为永恒导师"),

    ("邦拉·萨希布谒师所", "锡克教", "印度", "harmonium",
     "Bangla Sahib Gurdwara New Delhi India",
     "Dukh dārū sukh rog bhaiā — 痛苦是药，欢乐是病",
     "古鲁那纳克 《古鲁·格兰特·萨希卜》",
     "苦难是灵魂的良药，安逸反而是疾病——在困难中成长"),
]


EXTRA_SIKHISM_TEMPLES = [
    ("哈曼迪尔·萨希布(金庙)", "锡克教", "印度", "1604年",
     "第五代古鲁阿尔詹设计建造，锡克教最神圣的谒师所，四门向四方开放象征欢迎所有人",
     "Harmandir Sahib Golden Temple Amritsar Punjab India"),

    ("阿卡尔·塔赫特", "锡克教", "印度", "1609年",
     "第六代古鲁哈尔戈宾德建立的最高权力宝座，锡克教五大塔赫特之首",
     "Akal Takht Amritsar supreme seat Sikh authority India"),

    ("阿南德普尔萨希布谒师所", "锡克教", "印度", "1665年",
     "第九代古鲁特格·巴哈杜尔建立，卡尔萨在此诞生(1699年)",
     "Anandpur Sahib Gurdwara Punjab Khalsa birthplace India"),

    ("帕坦·萨希布谒师所", "锡克教", "巴基斯坦", "16世纪",
     "传说古鲁那纳克以手掌挡住巨石留下手印，著名朝圣地",
     "Panja Sahib Gurdwara Hasan Abdal Pakistan"),

    ("哈扎尔·萨希布谒师所", "锡克教", "印度", "1708年",
     "第十代古鲁戈宾德·辛格圆寂之地，五大塔赫特之一",
     "Hazur Sahib Nanded Maharashtra Guru Gobind Singh India"),

    ("希斯甘杰谒师所", "锡克教", "印度", "1783年",
     "第九代古鲁特格·巴哈杜尔殉道之地，德里最重要的锡克教圣地",
     "Sis Ganj Gurdwara Chandni Chowk Delhi martyrdom India"),

    ("邦拉·萨希布谒师所", "锡克教", "印度", "1783年",
     "第八代古鲁哈尔·克里香曾在此居住并治愈病人，以圣水池著名",
     "Bangla Sahib Gurdwara New Delhi sarovar India"),

    ("达姆达马·萨希布", "锡克教", "印度", "1706年",
     "古鲁戈宾德·辛格在此编纂《古鲁·格兰特·萨希卜》最终版，五大塔赫特之一",
     "Damdama Sahib Talwandi Sabo Bathinda Punjab India"),

    ("卡塔普尔·萨希布谒师所", "锡克教", "巴基斯坦", "1522年",
     "古鲁那纳克最后十八年生活讲道之地，2019年走廊开通",
     "Kartarpur Sahib Gurdwara Pakistan Guru Nanak"),

    ("塔兰·塔兰·萨希布", "锡克教", "印度", "1590年",
     "第五代古鲁阿尔詹建造，拥有锡克教最大的圣水池",
     "Tarn Taran Sahib Gurdwara Punjab largest sarovar India"),
]


EXTRA_SIKHISM_PATRIARCHS = [
    ("古鲁那纳克", "锡克教", "1469-1539年", "第一代古鲁·创始人",
     "创立锡克教，倡一神论、众生平等、无私服务，四次远游传道",
     "Na ko Hindu na Musalman — 没有印度教徒也没有穆斯林(在神面前人人平等)",
     "Guru Nanak Dev founder Sikhism painting portrait"),

    ("古鲁安加德", "锡克教", "1504-1552年", "第二代古鲁",
     "发明并推广古尔穆奇文字(Gurmukhi)，用于记录古鲁教导",
     "以文字记录真理，使神的话语流传千古",
     "Guru Angad Dev second Guru Gurmukhi script Sikh"),

    ("古鲁阿马尔达斯", "锡克教", "1479-1574年", "第三代古鲁",
     "建立Langar(共食)制度，废除妇女蒙面制和寡妇自焚习俗",
     "在Langar中，国王与乞丐坐在同一行平等用餐",
     "Guru Amar Das third Guru Langar equality Sikh"),

    ("古鲁拉姆达斯", "锡克教", "1534-1581年", "第四代古鲁",
     "建立阿姆利则圣城，开挖圣水池(后建金庙)",
     "在甘露之池中沐浴的人，灵魂得到净化",
     "Guru Ram Das fourth Guru Amritsar founder Sikh"),

    ("古鲁阿尔詹", "锡克教", "1563-1606年", "第五代古鲁·首位殉道者",
     "编纂锡克教圣典《古鲁·格兰特·萨希卜》，建造金庙，因拒绝改教被莫卧儿帝国处死",
     "Terā kīā mīṭhā lāgai — 你(神)所做的一切对我而言都是甜蜜的",
     "Guru Arjan Dev fifth Guru Adi Granth martyr Sikh"),

    ("古鲁哈尔戈宾德", "锡克教", "1595-1644年", "第六代古鲁·武士圣人",
     "建立锡克教武装传统，建阿卡尔·塔赫特(最高宗教权力宝座)",
     "在一手持念珠的同时，另一手持剑",
     "Guru Hargobind sixth Guru Miri Piri warrior saint Sikh"),

    ("古鲁哈尔拉伊", "锡克教", "1630-1661年", "第七代古鲁",
     "以慈悲和医术著称，维护锡克教和平时期的发展",
     "以慈悲之心治愈身体与灵魂的疾病",
     "Guru Har Rai seventh Guru compassion healer Sikh"),

    ("古鲁哈尔·克里香", "锡克教", "1656-1664年", "第八代古鲁·少年古鲁",
     "五岁继位，以神迹治愈德里天花疫情，八岁圆寂",
     "不分种姓高低，他治愈所有求助之人",
     "Guru Har Krishan eighth Guru child healer Delhi Sikh"),

    ("古鲁特格·巴哈杜尔", "锡克教", "1621-1675年", "第九代古鲁·人类之盾",
     "为保护克什米尔印度教徒的信仰自由，在德里被莫卧儿帝国斩首殉道",
     "为他人的信仰自由而献出生命——这是最高的勇气",
     "Guru Tegh Bahadur ninth Guru martyr Delhi Sikh"),

    ("古鲁戈宾德·辛格", "锡克教", "1666-1708年", "第十代古鲁·卡尔萨之父",
     "1699年创立卡尔萨(纯净者)圣战士团体，宣布圣典为永恒导师",
     "当一切和平手段都已用尽，拿起剑是正当的——这是正义之道",
     "Guru Gobind Singh tenth Guru Khalsa founder warrior Sikh"),

    ("班达·辛格·巴哈杜尔", "锡克教", "1670-1716年", "锡克教第一位军事领袖",
     "第十代古鲁的弟子，建立了首个锡克教独立政权",
     "以正义之剑守护无辜者的生命与尊严",
     "Banda Singh Bahadur Sikh warrior commander military"),

    ("摩诃拉贾·兰季特·辛格", "锡克教", "1780-1839年", "旁遮普之狮",
     "建立锡克帝国(1799-1849)，以包容治国，用黄金装饰金庙",
     "一个国家的强大不在于军队，而在于人民的团结与正义",
     "Maharaja Ranjit Singh Sikh Empire Punjab Lion"),
]


EXTRA_SIKHISM_TEACHINGS = [
    ("穆尔曼陀", "锡克教", "古鲁那纳克",
     "Ik Onkar, Sat Naam, Kartā Purakh, Nirbhau, Nirvair — 唯一神，真名，创造者，无畏，无恨",
     "锡克教信仰根基：只有一位创造者，他的名字是真理，他无所畏惧、不恨任何人"),

    ("三大支柱", "锡克教", "古鲁那纳克",
     "Kirat Karo, Naam Japo, Vand Chhako — 诚实劳动，冥想神名，与人分享",
     "诚实劳作、冥想神名、与人分享——锡克教徒日常生活的三根支柱"),

    ("五K标志", "锡克教", "古鲁戈宾德·辛格",
     "Kesh(未剪之发), Kangha(梳子), Kara(钢手镯), Kachera(短裤), Kirpan(短剑)",
     "五种以K开头的标志物是卡尔萨成员的身份象征——代表纪律、信仰与勇气"),

    ("Langar共食", "锡克教", "古鲁阿马尔达斯",
     "不论种姓、信仰、贫富、性别，所有人坐在一起平等用餐",
     "通过共同进餐打破社会等级——平等不是口号，是每天实践的行动"),

    ("殉道精神", "锡克教", "古鲁特格·巴哈杜尔",
     "Tilak janjoo rākhā Prabh tākā — 他保护了印度教徒的信仰标志",
     "为他人的信仰自由献出生命——比自己的解脱更崇高"),

    ("Sewa无私服务", "锡克教", "锡克教传统",
     "Sewa是最高的修行——无私地服务他人，不求任何回报",
     "真正的灵修不在冥想室中，而在服务他人的行动中"),

    ("Chardi Kala永远乐观", "锡克教", "锡克教传统",
     "Nānak nām chardi kalā, terē bhānē sarbat dā bhalā",
     "那纳克之名赐予永远乐观的精神——愿你的旨意带来所有人的福祉"),

    ("Hukamnama神谕", "锡克教", "古鲁阿尔詹",
     "每日随机翻开圣典一页，即为当日神的指引",
     "神的旨意通过圣典传达——接受并遵循，无论看到什么信息"),

    ("真理高于一切", "锡克教", "古鲁那纳克",
     "Sach kaho, sun leho sabhai — 我说真话，所有人听着",
     "真理高于一切——但比真理更高的是真实地生活"),

    ("万物归一", "锡克教", "古鲁那纳克",
     "Ek Pita ekas ke hum bārak — 我们都是同一位父亲的孩子",
     "无论种姓、宗教、国籍——所有人都是同一位创造者的孩子"),
]


# ╔══════════════════════════════════════════════════════════════╗
# ║                    三、神 道 教  SHINTO                      ║
# ╚══════════════════════════════════════════════════════════════╝

EXTRA_SHINTO_SITES = [
    ("伊势神宫", "神道教", "日本", "shakuhachi",
     "Ise Grand Shrine Naiku Geku Mie Japan",
     "清き明き直き心 — 清净、光明、正直之心",
     "神道教核心教义",
     "保持心灵的清净、光明和正直——这是神道的根本"),

    ("出云大社", "神道教", "日本", "koto_pluck",
     "Izumo Taisha Grand Shrine Shimane Japan",
     "八雲立つ 出雲八重垣 妻ごみに 八重垣作る その八重垣を",
     "须佐之男·《古事记》",
     "层层云雾升起于出云——这首和歌被誉为日本诗歌的起源"),

    ("春日大社", "神道教", "日本", "shakuhachi",
     "Kasuga Grand Shrine Nara deer lanterns Japan",
     "万物に宿る神の力を敬い、自然と共に生きる",
     "神道传统教诲",
     "敬畏万物中蕴含的神力，与自然和谐共生"),

    ("严岛神社", "神道教", "日本", "koto_pluck",
     "Itsukushima Shrine floating torii Miyajima Japan",
     "海と山の間に神が宿る — 神灵栖息在海与山之间",
     "神道自然崇拜",
     "神灵栖息在海与山之间——水上�的居是海陆交界的神圣门户"),

    ("伏见稻荷大社", "神道教", "日本", "taiko_drum",
     "Fushimi Inari thousand torii gates Kyoto Japan",
     "五穀豊穣を祈り、勤勉に働くことが神への奉仕",
     "稲荷信仰",
     "祈求五谷丰登、勤劳工作本身就是对神的奉献"),

    ("明治神宫", "神道教", "日本", "shakuhachi",
     "Meiji Jingu Shrine forest Harajuku Tokyo Japan",
     "敬神崇祖、報本反始 — 敬神尊祖、报本返始",
     "明治天皇圣训",
     "敬畏神灵、尊敬祖先——饮水思源，回归本心"),

    ("热田神宫", "神道教", "日本", "taiko_drum",
     "Atsuta Shrine Nagoya sacred sword Japan",
     "草薙剣に宿る国護りの力 — 草薙剑中蕴含的守国之力",
     "三神器传说",
     "草薙剑是三大神器之一——象征勇武与守护国家的力量"),

    ("大神神社", "神道教", "日本", "shakuhachi",
     "Omiwa Shrine Nara oldest shrine Mount Miwa Japan",
     "三輪山そのものが御神体 — 三轮山本身就是神体",
     "大神神社传统",
     "没有神殿，山本身就是神——日本最古老的神道信仰形式"),

    ("太宰府天满宫", "神道教", "日本", "koto_pluck",
     "Dazaifu Tenmangu Shrine Fukuoka plum blossom Japan",
     "東風吹かば匂ひおこせよ梅の花 — 东风若吹，梅花啊请将芬芳送来",
     "菅原道真和歌",
     "东风若吹来，请把芬芳送到我身边——即使远离故乡，真心不变"),

    ("住吉大社", "神道教", "日本", "taiko_drum",
     "Sumiyoshi Taisha Osaka oldest shrine sea god Japan",
     "海の安全と旅の無事を祈る — 祈求海上安全与旅途平安",
     "住吉信仰",
     "祈求航海安全与旅途平安——住吉大神守护所有远行者"),

    ("八坂神社", "神道教", "日本", "taiko_drum",
     "Yasaka Shrine Gion Kyoto festival Japan",
     "祇園精舎の鐘の声 — 祇园精舍的钟声",
     "《平家物语》冒头",
     "祇园精舍的钟声，传递着诸行无常的道理"),
]


EXTRA_SHINTO_TEMPLES = [
    ("伊势神宫内宫", "神道教", "日本", "约公元前4年(传说)",
     "供奉天照大神，日本神道教最高圣所，每20年式年迁宫",
     "Ise Naiku Inner Shrine Amaterasu Japan"),

    ("伊势神宫外宫", "神道教", "日本", "约478年(传说)",
     "供奉丰受大神(食物之神)，与内宫并为神宫两大核心",
     "Ise Geku Outer Shrine Toyouke Japan"),

    ("出云大社", "神道教", "日本", "远古(神话时代)",
     "供奉大国主神，日本最古老神社之一，农历十月全国神灵集会之所",
     "Izumo Taisha Grand Shrine Okuninushi Shimane Japan"),

    ("春日大社", "神道教", "日本", "768年",
     "藤原氏家族神社，以三千石灯笼和鹿群著名，世界遗产",
     "Kasuga Grand Shrine Nara lanterns deer UNESCO Japan"),

    ("严岛神社", "神道教", "日本", "593年(传说)",
     "海上浮鸟居闻名世界，日本三景之一，世界遗产",
     "Itsukushima Shrine Miyajima floating torii UNESCO Japan"),

    ("伏见稻荷大社", "神道教", "日本", "711年",
     "稻荷神总本社，万座朱红鸟居隧道闻名全球",
     "Fushimi Inari Taisha thousand torii Kyoto Japan"),

    ("明治神宫", "神道教", "日本", "1920年",
     "供奉明治天皇与昭宪皇太后，东京都心70万棵树的森林",
     "Meiji Jingu Shrine forest Harajuku Tokyo Japan"),

    ("热田神宫", "神道教", "日本", "约113年(传说)",
     "供奉三神器之一草薙剑，名古屋最重要的神社",
     "Atsuta Jingu Shrine sacred sword Nagoya Japan"),

    ("大神神社", "神道教", "日本", "远古(有记录以来最古老)",
     "无正殿，以三轮山为神体的原始神道信仰形式，日本最古老神社",
     "Omiwa Shrine Mount Miwa oldest Nara Japan"),

    ("太宰府天满宫", "神道教", "日本", "905年",
     "供奉学问之神菅原道真，全日本天满宫总本社",
     "Dazaifu Tenmangu Shrine Fukuoka learning plum Japan"),

    ("住吉大社", "神道教", "日本", "211年(传说)",
     "航海之神总本社，大阪最古老的神社，住吉造建筑样式原型",
     "Sumiyoshi Taisha Osaka sea god oldest Japan"),

    ("八坂神社", "神道教", "日本", "656年",
     "祇园祭(日本三大祭)的主神社，供奉素戋呜尊",
     "Yasaka Shrine Gion Festival Kyoto Japan"),

    ("宇佐神宫", "神道教", "日本", "725年",
     "全日本约四万座八幡宫的总本社，武神信仰中心",
     "Usa Jingu Shrine Hachiman Oita Japan"),

    ("�的场神社(高千穗)", "神道教", "日本", "远古",
     "天�的降临传说之地，日本神话中天照大神之孙降临地上的圣地",
     "Takachiho Shrine Amano Iwato Miyazaki Japan mythology"),

    ("�的罗之宫(金刀比罗宫)", "神道教", "日本", "远古",
     "海上守护神社，需攀登1368级石阶，日本最著名的参拜阶梯",
     "Kotohiragu Shrine Kagawa 1368 steps Japan"),
]


EXTRA_SHINTO_PATRIARCHS = [
    ("天照大神", "神道教", "神话时代", "太阳女神·皇祖神",
     "神道教最高神，日本皇室祖神，太阳的化身，统治高天原",
     "この豊葦原瑞穂国は、汝知らすべき国なり — 这丰葦原瑞穗之国，是你应当统治的国度",
     "Amaterasu Sun Goddess Japanese mythology painting"),

    ("须佐之男", "神道教", "神话时代", "暴风之神·英雄神",
     "天照大神之弟，斩杀八岐大蛇拯救奇稻田姫，勇武与破坏的象征",
     "八雲立つ出雲八重垣 — 层云升起于出云(日本最古老的和歌)",
     "Susanoo storm god Yamata no Orochi Japanese mythology"),

    ("大国主神", "神道教", "神话时代", "国土之主·结缘之神",
     "让国于天照大神后退居出云，成为结缘之神和国土守护者",
     "眼に見えない世界で国を護る — 在看不见的世界中守护国土",
     "Okuninushi Great Land Master Izumo Japan mythology"),

    ("圣德太子", "神道教", "574-622年", "厩户皇子·日本文明之父",
     "制定十七条宪法、推行冠位十二阶，融合神道佛教儒学",
     "以和為貴、無忤為宗 — 以和为贵，不相违背",
     "Prince Shotoku Seventeen Article Constitution Japan"),

    ("天武天皇", "神道教", "631-686年", "天武帝·神道国教化推动者",
     "下令编纂《古事记》《日本书纪》，整备伊势神宫式年迁宫制度",
     "通过记录神话与历史，确立了日本的文化根基",
     "Emperor Tenmu Kojiki Nihon Shoki Japan history"),

    ("本居宣长", "神道教", "1730-1801年", "国学四大人之一·古事记研究者",
     "以44年心血著《古事记传》，复兴纯粹神道，提出\"物之哀\"美学",
     "もののあはれを知る心 — 懂得物之哀的心(感受万物的情感之美)",
     "Motoori Norinaga Kokugaku Kojiki-den scholar Japan"),

    ("平田笃胤", "神道教", "1776-1843年", "国学四大人之一·复古神道大成者",
     "将本居宣长的国学思想发展为系统的复古神道体系",
     "死後の世界は神々の国——魂は永遠に生き続ける",
     "Hirata Atsutane Kokugaku Shinto scholar Japan"),

    ("贺茂真渊", "神道教", "1697-1769年", "国学四大人之一·万叶集研究者",
     "研究《万叶集》，提倡回归古代日本的\"高き直き心\"(高尚正直之心)",
     "高き直き心こそ、古の大和心なり — 高尚正直之心，才是古代大和之心",
     "Kamo no Mabuchi Kokugaku Manyoshu scholar Japan"),

    ("�的田春满", "神道教", "1669-1736年", "国学四大人之一·国学开祖",
     "开创国学(日本古典研究)运动，主张从古典文献中发掘日本固有精神",
     "古典に還りて、日本の本質を知る — 回归古典，认识日本的本质",
     "Kada no Azumamaro Kokugaku founder Fushimi Japan"),

    ("菅原道真", "神道教", "845-903年", "天神·学问之神",
     "平安时代杰出学者政治家，死后被奉为学问之神(天神)",
     "東風吹かば匂ひおこせよ梅の花 — 东风若吹，梅花啊请将芬芳送来",
     "Sugawara no Michizane Tenjin god of learning Japan"),

    ("藤原不比等", "神道教", "659-720年", "律令制度建设者",
     "主持编纂《大宝律令》，确立春日大社为藤原氏家族神社",
     "神道と国家の制度を一つに結ぶ — 将神道与国家制度统一",
     "Fujiwara no Fuhito Nara period Japan Kasuga"),

    ("出口王仁三郎", "神道教", "1871-1948年", "大本教教祖",
     "创立大本教(新神道运动)，倡世界和平与万教归一",
     "万教同根——すべての宗教は同じ根から生まれた",
     "Deguchi Onisaburo Omoto-kyo new Shinto movement Japan"),

    ("黑住宗忠", "神道教", "1780-1850年", "黑住教开祖",
     "创立黑住教，教导天照大神之心即在每个人心中",
     "天照大御神の心は、すべての人の心の中にある",
     "Kurozumi Munetada Kurozumikyo Shinto sect founder Japan"),

    ("中山美伎", "神道教", "1798-1887年", "天理教教祖·女性宗教领袖",
     "创立天理教，教导\"欢乐生活\"的人生观和互助精神",
     "陽気ぐらし — 欢乐生活(人类被创造出来就是为了快乐地生活)",
     "Nakayama Miki Tenrikyo founder woman religious leader Japan"),
]


EXTRA_SHINTO_TEACHINGS = [
    ("清明正直", "神道教", "天照大神(神话传统)",
     "清き明き直き心 — 清净、光明、正直之心",
     "保持心灵的清净、光明、正直——这是神道修养的根本"),

    ("万物有灵", "神道教", "神道传统",
     "森羅万象に神が宿る — 万物之中皆有神灵",
     "山川草木、日月星辰都有神灵——敬畏自然就是敬畏神"),

    ("以和为贵", "神道教", "圣德太子",
     "和を以て貴しと為す — 以和为贵",
     "和谐是最高价值——人与人、人与自然之间都应追求和谐"),

    ("祓与禊", "神道教", "神道传统",
     "禊祓いによって心身を清める — 通过祓禊净化身心",
     "通过净化仪式洗去污秽——外在的洁净带来内心的纯净"),

    ("�的摩知(感恩)", "神道教", "神道传统",
     "感謝の心をもって、すべてのものに接する — 以感恩之心对待一切",
     "以感恩之心对待一切事物——祭祀的本质是对自然的感恩"),

    ("物之哀", "神道教", "本居宣长",
     "もののあはれ — 感知万物的微妙情感之美",
     "对万物无常之美的深切感受——樱花落下的瞬间最为动人"),

    ("式年迁宫", "神道教", "伊势神宫传统",
     "二十年ごとに社殿を建て替える — 每二十年重建一次社殿",
     "万物循环更新——在破坏与重建中传承永恒的技艺与精神"),

    ("产灵(Musubi)", "神道教", "神道传统",
     "ムスビの力 — 万物生成、结合、创造的力量",
     "产灵是宇宙中最根本的创造力——万物的生成与连结皆源于此"),

    ("诚(Makoto)", "神道教", "神道传统",
     "真心を尽くして神に仕える — 以真诚之心侍奉神灵",
     "诚是神道伦理的核心——真心诚意地面对自己、他人和神灵"),

    ("自然回归", "神道教", "神道传统",
     "自然に還り、自然と共に生きる — 回归自然，与自然共生",
     "人不是自然的主人而是一部分——回归自然就是回归神灵的怀抱"),
]


# ╔══════════════════════════════════════════════════════════════╗
# ║                 四、原住民灵性  INDIGENOUS                    ║
# ╚══════════════════════════════════════════════════════════════╝

EXTRA_INDIGENOUS_SITES = [
    # ── 澳洲原住民 ──
    ("乌鲁鲁", "原住民灵性", "澳大利亚", "didgeridoo",
     "Uluru Ayers Rock sacred Aboriginal Australia",
     "We are all visitors to this time, this place — 我们都是这个时空的过客",
     "澳洲原住民谚语",
     "我们都是这片时空的过客——我们只是来学习、成长和爱的"),

    ("卡塔丘塔", "原住民灵性", "澳大利亚", "didgeridoo",
     "Kata Tjuta Olgas sacred rocks Northern Territory Australia",
     "The land is not ours; we belong to the land",
     "澳洲原住民传统教导",
     "土地不属于我们——我们属于土地"),

    ("卡卡杜", "原住民灵性", "澳大利亚", "didgeridoo",
     "Kakadu National Park rock art Aboriginal Australia",
     "This rock art tells the stories of the Dreamtime ancestors",
     "卡卡杜岩画传承",
     "这些岩画讲述着梦境时代祖灵创造世界的故事"),

    # ── 北美原住民 ──
    ("魔鬼塔(熊之居所)", "原住民灵性", "美国", "native_drum",
     "Devils Tower Bear Lodge Wyoming Native American sacred",
     "Mitakuye Oyasin — All my relations — 万物皆我亲人",
     "拉科塔苏族祈祷词",
     "万物皆我亲人——天地万物与我有着不可分割的联系"),

    ("黑山(帕哈萨帕)", "原住民灵性", "美国", "native_drum",
     "Black Hills Paha Sapa Lakota sacred South Dakota",
     "The Black Hills is the heart of everything that is",
     "拉科塔苏族传统",
     "黑山是万物的心脏——拉科塔人最神圣的土地"),

    ("塞多纳", "原住民灵性", "美国", "native_drum",
     "Sedona vortex red rocks Arizona spiritual sacred",
     "The earth has its own energy — honor it",
     "纳瓦霍传统",
     "大地有自己的能量——以敬畏之心对待它"),

    ("查科峡谷", "原住民灵性", "美国", "rain_stick",
     "Chaco Canyon ancient Pueblo New Mexico astronomy",
     "We are the People of the Sun — we follow its path",
     "普韦布洛人传统",
     "我们是太阳的子民——追随它的轨迹生活"),

    # ── 中南美洲 ──
    ("马丘比丘", "原住民灵性", "秘鲁", "rain_stick",
     "Machu Picchu Inca sacred city Peru Andes",
     "Ama sua, ama llulla, ama quella — 不偷窃、不说谎、不懒惰",
     "印加帝国三大诫律",
     "不偷窃、不说谎、不懒惰——简洁有力的人生准则"),

    ("的的喀喀湖", "原住民灵性", "秘鲁", "rain_stick",
     "Lake Titicaca Inca creation myth Peru Bolivia Andes",
     "From these waters, Viracocha created the sun, moon and stars",
     "印加创世神话",
     "维拉科查从这片湖水中创造了太阳、月亮和星辰"),

    ("奇琴伊察", "原住民灵性", "墨西哥", "native_drum",
     "Chichen Itza pyramid Kukulkan Maya equinox Mexico",
     "In Lak'ech Ala K'in — 我是另一个你，你是另一个我",
     "玛雅传统问候语",
     "我是另一个你——你我之间没有分别，万物一体"),

    ("特奥蒂瓦坎", "原住民灵性", "墨西哥", "native_drum",
     "Teotihuacan Sun Moon Pyramid Mexico ancient city",
     "This is where the gods were born — 这是众神诞生之地",
     "阿兹特克传说",
     "这是众神诞生之地——在此处，神灵自我牺牲创造了第五太阳"),

    # ── 非洲 ──
    ("伊费", "原住民灵性", "尼日利亚", "native_drum",
     "Ife sacred city Yoruba Nigeria Orishas creation",
     "Orí ẹni ni ó pín ire fún ni — 每个人的命运由自己的内在之头决定",
     "约鲁巴谚语",
     "你的命运由你内在的灵魂决定——向内寻找力量"),

    ("大津巴布韦遗址", "原住民灵性", "津巴布韦", "native_drum",
     "Great Zimbabwe ruins Shona sacred stone city Africa",
     "The stones speak of our ancestors' greatness",
     "绍纳人传统",
     "这些石头诉说着祖先的伟大——我们的根深植于这片土地"),

    # ── 太平洋与新西兰 ──
    ("汤加里罗", "原住民灵性", "新西兰", "native_drum",
     "Tongariro sacred mountain Maori New Zealand volcano",
     "Ko au te awa, ko te awa ko au — 我是河流，河流即是我",
     "毛利人谚语",
     "我就是河流，河流就是我——人与自然合为一体"),

    ("复活节岛", "原住民灵性", "智利", "native_drum",
     "Easter Island Rapa Nui Moai statues sacred Polynesia",
     "The Moai face inland to protect the living",
     "拉帕努伊传统",
     "摩艾石像面朝内陆——祖先的灵魂永远守护着活着的人"),
]


EXTRA_INDIGENOUS_TEMPLES = [
    # ── 澳洲 ──
    ("乌鲁鲁-卡塔丘塔", "原住民灵性", "澳大利亚", "远古(约6万年)",
     "澳洲原住民最神圣的梦境时代圣地，阿南古人世代守护",
     "Uluru Kata Tjuta Dreamtime Aboriginal sacred Australia"),

    ("卡卡杜岩画群", "原住民灵性", "澳大利亚", "约4万年前",
     "世界最古老的连续岩画艺术，记录梦境时代的创世故事",
     "Kakadu rock art Aboriginal Australia oldest UNESCO"),

    # ── 北美 ──
    ("查科峡谷", "原住民灵性", "美国", "约850-1250年",
     "古普韦布洛人天文观测与宗教仪式中心，精确对齐至日点",
     "Chaco Canyon Pueblo Bonito New Mexico astronomy UNESCO"),

    ("卡霍基亚土丘群", "原住民灵性", "美国", "约600-1400年",
     "北美最大的前哥伦布时期城市遗址，僧侣土丘高30米",
     "Cahokia Mounds Illinois largest pre-Columbian city North America"),

    ("梅萨维德崖居", "原住民灵性", "美国", "约550-1300年",
     "古普韦布洛人建造的悬崖住宅群，展现与自然融合的建筑智慧",
     "Mesa Verde cliff dwellings Colorado Pueblo UNESCO"),

    # ── 中南美洲 ──
    ("太阳神庙(科里坎查)", "原住民灵性", "秘鲁", "约1438年",
     "印加帝国最神圣的太阳神殿，墙壁曾覆满黄金",
     "Coricancha Qoricancha Temple Sun Cusco Inca Peru"),

    ("帕恰卡马克", "原住民灵性", "秘鲁", "约200-1533年",
     "前印加时代至印加帝国的重要神谕中心和朝圣地",
     "Pachacamac oracle temple Lima Peru Inca pre-Inca"),

    ("奇琴伊察金字塔", "原住民灵性", "墨西哥", "约600-1200年",
     "玛雅-托尔特克文明杰作，春分秋分时羽蛇光影奇观",
     "Chichen Itza Kukulkan pyramid Maya Mexico equinox UNESCO"),

    ("特奥蒂瓦坎", "原住民灵性", "墨西哥", "约100BC-550AD",
     "美洲最大古代城市之一，太阳金字塔和月亮金字塔的神圣之城",
     "Teotihuacan Pyramid Sun Moon Mexico ancient city UNESCO"),

    ("蒂卡尔", "原住民灵性", "危地马拉", "约600BC-900AD",
     "古典期玛雅最大城邦之一，金字塔高达70米耸立于丛林之上",
     "Tikal Maya pyramid Guatemala jungle UNESCO"),

    # ── 非洲 ──
    ("大津巴布韦石城", "原住民灵性", "津巴布韦", "约1100-1450年",
     "撒哈拉以南非洲最大石头建筑群，绍纳人王国的精神中心",
     "Great Zimbabwe stone ruins Shona sacred Africa"),

    ("伊费圣城", "原住民灵性", "尼日利亚", "约11世纪",
     "约鲁巴人视为创世之地，奥里沙(神灵)信仰的发源地",
     "Ife sacred city Yoruba Orishas Nigeria creation"),

    # ── 太平洋 ──
    ("复活节岛摩艾群", "原住民灵性", "智利", "约1250-1500年",
     "拉帕努伊人建造的巨型石像群，祖先崇拜的最壮观表现",
     "Easter Island Moai statues Rapa Nui Chile Polynesia"),
]


EXTRA_INDIGENOUS_PATRIARCHS = [
    # ── 澳洲原住民 ──
    ("梦境时代祖灵", "原住民灵性", "远古(约6万年)", "创世祖灵·梦时代行者",
     "澳洲原住民相信祖灵在梦境时代(Dreamtime)创造了大地、动物和人类",
     "我们不拥有土地，土地拥有我们——我们是大地的守护者",
     "Aboriginal Dreamtime ancestors Australia creation spirit"),

    ("大卫·乌奈庞", "原住民灵性", "1872-1967年", "澳洲原住民权利先驱",
     "第一位出版著作的澳洲原住民作家，终身为原住民权利抗争",
     "我的人民在这片土地上生活了几万年——我们的权利与大地一样古老",
     "David Unaipon Aboriginal author activist Australia"),

    # ── 北美原住民 ──
    ("疯马(Crazy Horse)", "原住民灵性", "约1840-1877年", "拉科塔苏族战士圣者",
     "小大角战役击败卡斯特将军，至死捍卫拉科塔人的土地和生活方式",
     "My lands are where my dead lie buried — 我的土地就在我的先人安葬之处",
     "Crazy Horse Lakota Sioux warrior leader Little Bighorn"),

    ("坐牛(Sitting Bull)", "原住民灵性", "约1831-1890年", "亨克帕帕拉科塔首领·圣者",
     "拉科塔苏族伟大的精神领袖和战争首领，领导对美国政府的抵抗",
     "Let us put our minds together and see what life we can make for our children",
     "Sitting Bull Hunkpapa Lakota Sioux chief holy man"),

    ("黑麋鹿(Black Elk)", "原住民灵性", "1863-1950年", "奥格拉拉·拉科塔圣者",
     "拉科塔族著名的巫医和远见者，《黑麋鹿如是说》记录其灵性异象",
     "一切事物都是圆的——鸟巢是圆的、太阳和月亮是圆的、生命是一个圆",
     "Black Elk Oglala Lakota holy man vision Native American"),

    ("西雅图酋长", "原住民灵性", "约1786-1866年", "苏夸米什族酋长",
     "以致美国总统的演说闻名，表达原住民对大地的深厚情感",
     "这大地不属于人类，人类属于大地——万物相互联系，如同血脉联系一家人",
     "Chief Seattle Suquamish Duwamish speech Native American"),

    # ── 中南美洲 ──
    ("帕查库特克", "原住民灵性", "1418-1471年", "印加帝国缔造者·世界改变者",
     "将印加从一个小王国扩展为南美最大帝国，建造马丘比丘",
     "Ama sua, ama llulla, ama quella — 不偷窃、不说谎、不懒惰",
     "Pachacuti Inca emperor Machu Picchu builder Peru"),

    ("里戈贝塔·门楚", "原住民灵性", "1959年-", "基切玛雅人权斗士",
     "1992年诺贝尔和平奖得主，终身为危地马拉原住民权利奋斗",
     "和平不仅是没有战争——真正的和平是正义与尊严",
     "Rigoberta Menchu Nobel Peace Prize Maya Guatemala indigenous"),

    # ── 非洲 ──
    ("奥都杜瓦", "原住民灵性", "神话时代", "约鲁巴创世始祖·伊费开国者",
     "约鲁巴神话中受最高神奥洛杜马雷之命从天界降临创造大地的始祖",
     "Ile-Ife是世界的起源——一切生命从这里开始",
     "Oduduwa Yoruba ancestor Ife creation Nigeria mythology"),

    ("沙卡祖鲁", "原住民灵性", "约1787-1828年", "祖鲁帝国建立者·非洲拿破仑",
     "将分散的祖鲁部落统一为强大帝国，革新军事战术",
     "只有团结才有力量——一根木棍容易折断，一捆则牢不可破",
     "Shaka Zulu king empire builder South Africa warrior"),

    # ── 太平洋 ──
    ("毛利祖先库佩", "原住民灵性", "约10世纪", "毛利人发现者·大航海者",
     "传说中首位发现新西兰(奥特亚罗瓦)的波利尼西亚航海者",
     "Kia kaha — 保持坚强",
     "Kupe Maori navigator discoverer New Zealand Aotearoa"),
]


EXTRA_INDIGENOUS_TEACHINGS = [
    ("梦境时代", "原住民灵性", "澳洲原住民传统",
     "Tjukurpa/Dreamtime — 祖灵在梦境时代创造了世界的法则与歌线",
     "大地上的每条路线都是祖灵歌唱出来的——沿着歌线行走就是重走创世之路"),

    ("万物相关", "原住民灵性", "拉科塔苏族传统",
     "Mitakuye Oyasin — All my relations — 万物皆我亲人",
     "人、动物、植物、石头、河流——万物有灵且互相关联如同一家人"),

    ("大地母亲", "原住民灵性", "北美原住民传统",
     "大地不属于我们，我们属于大地",
     "人类是大地的孩子，不是主人——与自然和谐共处是最高智慧"),

    ("七代法则", "原住民灵性", "易洛魁联盟传统",
     "In every deliberation, consider the impact on the seventh generation",
     "每个决定都要考虑对后七代人的影响——为子孙后代负责"),

    ("神圣之环", "原住民灵性", "黑麋鹿(拉科塔)",
     "Everything tries to be round — the life of a man is a circle",
     "一切事物都试图成为圆的——鸟巢、太阳、月亮、生命的循环都是圆"),

    ("印加三戒", "原住民灵性", "帕查库特克(印加)",
     "Ama sua, ama llulla, ama quella — 不偷窃、不说谎、不懒惰",
     "简洁有力的三条人生准则——印加帝国的道德基石"),

    ("In Lak'ech", "原住民灵性", "玛雅传统",
     "In Lak'ech Ala K'in — 我是另一个你，你是另一个我",
     "你我之间没有分别——伤害你即伤害我自己，爱你即爱我自己"),

    ("乌班图(Ubuntu)", "原住民灵性", "非洲班图传统",
     "Ubuntu — I am because we are — 因为我们存在，所以我存在",
     "个人的人性通过与他人的关系而成就——我的存在因你而完整"),

    ("行走之歌(Songlines)", "原住民灵性", "澳洲原住民传统",
     "祖灵歌唱世界使之存在——每条道路都有对应的歌",
     "沿着歌线行走就是在重述创世故事——歌声维系着土地的灵魂"),

    ("感恩仪式", "原住民灵性", "切罗基传统",
     "Give thanks for unknown blessings already on their way",
     "为尚未到来的恩赐提前感恩——感恩之心吸引更多的祝福"),

    ("Hozho(和谐之美)", "原住民灵性", "纳瓦霍传统",
     "Walk in beauty — Hózhó — 行走在美与和谐之中",
     "行走在美之中——在身前、身后、头上、脚下都创造和谐与美"),
]


# ╔══════════════════════════════════════════════════════════════╗
# ║                   五、巴 哈 伊 教  BAHAI                     ║
# ╚══════════════════════════════════════════════════════════════╝

EXTRA_BAHAI_SITES = [
    ("海法空中花园", "巴哈伊教", "以色列", "harp_melody",
     "Bahai Gardens Haifa Shrine Bab Israel terraces",
     "So powerful is the light of unity that it can illuminate the whole earth",
     "巴哈欧拉 Baha'u'llah",
     "团结之光如此强大，足以照亮整个大地"),

    ("巴吉宅邸", "巴哈伊教", "以色列", "unity_chant",
     "Bahji Mansion Shrine Bahaullah Acre Israel",
     "The earth is but one country, and mankind its citizens",
     "巴哈欧拉《光辉语录》Gleanings",
     "大地只是一个国家，人类都是其公民"),

    ("阿卡古城", "巴哈伊教", "以色列", "harp_melody",
     "Akka Acre prison city Bahaullah Israel",
     "My calamity is My providence, outwardly it is fire, inwardly it is light",
     "巴哈欧拉《隐言经》Hidden Words",
     "我的苦难是我的天恩——外表是火焰，内在是光明"),

    ("新德里莲花寺", "巴哈伊教", "印度", "unity_chant",
     "Lotus Temple New Delhi Bahai House Worship India",
     "Religion should be the cause of love and affection",
     "巴哈欧拉",
     "宗教应当是爱与友情的源泉——而非仇恨与纷争的借口"),

    ("威尔梅特灵曦堂", "巴哈伊教", "美国", "harp_melody",
     "Wilmette House Worship Illinois Bahai temple USA",
     "Ye are the fruits of one tree, and the leaves of one branch",
     "巴哈欧拉",
     "你们是同一棵树上的果实，同一枝条上的叶子"),

    ("萨摩亚灵曦堂", "巴哈伊教", "萨摩亚", "unity_chant",
     "Samoa Bahai House of Worship Pacific",
     "The best beloved of all things in My sight is Justice",
     "巴哈欧拉《隐言经》Hidden Words",
     "在我看来，万物中最可爱的是正义"),

    ("坎帕拉灵曦堂", "巴哈伊教", "乌干达", "unity_chant",
     "Kampala Bahai House Worship Uganda Africa",
     "Regard man as a mine rich in gems of inestimable value",
     "巴哈欧拉",
     "将人视为一座富含无价宝石的矿山——教育能使它发光"),

    ("圣地亚哥灵曦堂", "巴哈伊教", "智利", "harp_melody",
     "Santiago Bahai Temple Chile South America translucent",
     "Be generous in prosperity, and thankful in adversity",
     "巴哈欧拉",
     "顺境中慷慨，逆境中感恩——这是巴哈伊生活的态度"),
]


EXTRA_BAHAI_TEMPLES = [
    ("巴布陵寝(海法)", "巴哈伊教", "以色列", "1909年(陵寝)/1953年(上层结构)",
     "巴布(巴哈伊教先驱)安葬之地，被19级梯田花园环绕，世界遗产",
     "Shrine of Bab Haifa terraces gardens Israel Bahai UNESCO"),

    ("巴吉宅邸(巴哈欧拉陵寝)", "巴哈伊教", "以色列", "1892年",
     "巴哈欧拉最后居住和安葬之地，巴哈伊教最神圣的朝圣目的地",
     "Bahji Shrine Bahaullah Acre Israel Bahai holiest"),

    ("威尔梅特灵曦堂", "巴哈伊教", "美国", "1953年",
     "北美唯一的巴哈伊灵曦堂，九面穹顶建筑，对所有信仰开放",
     "Wilmette Mashriqu'l-Adhkar Illinois USA Bahai temple"),

    ("新德里莲花寺", "巴哈伊教", "印度", "1986年",
     "莲花造型建筑杰作，每年接待数百万参观者，新德里地标",
     "Lotus Temple New Delhi India Bahai architecture landmark"),

    ("阿什哈巴德灵曦堂(已毁)", "巴哈伊教", "土库曼斯坦", "1908年",
     "世界第一座巴哈伊灵曦堂，1948年地震后被苏联拆除",
     "Ashgabat Mashriqu'l-Adhkar first Bahai temple Turkmenistan"),

    ("坎帕拉灵曦堂", "巴哈伊教", "乌干达", "1961年",
     "非洲唯一的巴哈伊灵曦堂，位于基科亚山丘上",
     "Kampala Bahai temple Kikaya Hill Uganda Africa"),

    ("悉尼灵曦堂", "巴哈伊教", "澳大利亚", "1961年",
     "澳大利亚唯一的巴哈伊灵曦堂，位于英格赛德",
     "Sydney Bahai House Worship Ingleside Australia"),

    ("法兰克福灵曦堂(欧洲)", "巴哈伊教", "德国", "1964年",
     "欧洲唯一的巴哈伊灵曦堂，位于兰根海因附近",
     "Frankfurt Bahai temple Langenhain Germany Europe"),

    ("巴拿马灵曦堂", "巴哈伊教", "巴拿马", "1972年",
     "拉丁美洲第一座巴哈伊灵曦堂，位于巴拿马城郊外山丘",
     "Panama City Bahai temple Central America"),

    ("圣地亚哥灵曦堂", "巴哈伊教", "智利", "2016年",
     "南美洲灵曦堂，半透明大理石薄片构成的九翼建筑，日夜发光",
     "Santiago Bahai temple Chile translucent South America"),

    ("萨摩亚灵曦堂", "巴哈伊教", "萨摩亚", "1984年",
     "太平洋岛屿唯一的巴哈伊灵曦堂，阿皮亚市中心",
     "Apia Bahai temple Samoa Pacific Islands"),
]


EXTRA_BAHAI_PATRIARCHS = [
    ("巴布", "巴哈伊教", "1819-1850年", "大门·先驱者",
     "巴比教创始人，宣告\"应许者\"即将来临，1850年在大不里士被公开处决殉道",
     "当黎明来临时，你们要准备好迎接新的一天——我只是那道黎明之光",
     "The Bab Bahai forerunner Gate martyr Tabriz Iran"),

    ("巴哈欧拉", "巴哈伊教", "1817-1892年", "上帝的荣耀·巴哈伊教创始人",
     "出身波斯贵族，宣告自己为巴布预言的\"上帝将显圣之人\"，经历40年流放和囚禁，写下大量圣典",
     "大地只是一个国家，人类都是其公民——团结之光足以照亮全球",
     "Bahaullah founder Bahai Faith Glory God prophet"),

    ("阿博都巴哈", "巴哈伊教", "1844-1921年", "圣约之中心·巴哈伊教诠释者",
     "巴哈欧拉长子，被父亲指定为信仰的诠释者和领导者，1911-1913年周游欧美传道",
     "世界和平不仅是可能的，而且是不可避免的——这是人类进化的下一步",
     "Abdul-Baha son Bahaullah Centre Covenant Bahai"),

    ("守基·阿芬第", "巴哈伊教", "1897-1957年", "巴哈伊教圣护",
     "阿博都巴哈之孙，领导巴哈伊教36年，翻译圣典，建立全球行政体系",
     "这个信仰的目标不是创造一个新的宗教——而是促成人类文明的大一统",
     "Shoghi Effendi Guardian Bahai Faith administrator translator"),

    ("塔希蕾", "巴哈伊教", "约1814-1852年", "纯洁者·巴比教女英雄",
     "巴比教十八活字母之一，才华横溢的女诗人，公开摘去面纱挑战传统，殉道而死",
     "你可以杀死我，但你无法阻止妇女解放的潮流",
     "Tahirih Qurratu'l-Ayn Babi heroine poetess martyr"),

    ("穆拉·侯赛因", "巴哈伊教", "1813-1849年", "首信者·信仰之门的第一门徒",
     "巴布的第一位信徒，十八活字母之首，在塔巴尔西堡战役中英勇殉道",
     "有福的人啊，你是我信仰的第一位信徒——如同穆罕默德之于阿里",
     "Mulla Husayn first believer Bab Letters Living Bahai"),

    ("巴哈伊世界正义院", "巴哈伊教", "1963年至今", "最高立法与行政机构",
     "巴哈欧拉授权建立的全球管理机构，由全世界巴哈伊选举产生，指导全球巴哈伊社区",
     "协商是照亮道路的明灯——通过集体智慧做出最好的决定",
     "Universal House Justice Bahai supreme governing Haifa"),

    ("汉德·考斯(Hand of Cause)", "巴哈伊教", "20世纪", "圣道之手·传教先驱",
     "守基·阿芬第任命的一批杰出巴哈伊领袖，负责在全球传播和保护信仰",
     "将信仰的种子播撒到世界的每一个角落",
     "Hands Cause God Bahai appointed leaders worldwide"),
]


EXTRA_BAHAI_TEACHINGS = [
    ("人类一体", "巴哈伊教", "巴哈欧拉",
     "The earth is but one country, and mankind its citizens",
     "消除一切偏见——种族、国籍、宗教、性别，人类本是一家"),

    ("独立探究真理", "巴哈伊教", "巴哈欧拉",
     "让你的目光拥抱整个世界，而非局限于自身",
     "每个人都应独立探索真理，不盲从传统、父母或权威"),

    ("宗教同源", "巴哈伊教", "巴哈欧拉",
     "All the Prophets of God are as one soul — 所有上帝的先知如同一个灵魂",
     "所有宗教来自同一个源头——佛陀、耶稣、穆罕默德传递的是同一真理的不同章节"),

    ("科学与宗教和谐", "巴哈伊教", "阿博都巴哈",
     "Religion without science is superstition; science without religion is materialism",
     "没有科学的宗教是迷信，没有宗教的科学是唯物主义——两翼齐飞才能高飞"),

    ("男女平等", "巴哈伊教", "阿博都巴哈",
     "The world of humanity is possessed of two wings: the male and the female",
     "人类有两只翅膀：男与女——只有两翼平等有力，这只鸟才能高飞"),

    ("消除偏见", "巴哈伊教", "巴哈欧拉",
     "Close your eyes to racial differences, and welcome all with the light of oneness",
     "闭上对种族差异的眼睛——以一体之光欢迎所有人"),

    ("义务教育", "巴哈伊教", "巴哈欧拉",
     "Regard man as a mine rich in gems of inestimable value; education alone can reveal its treasures",
     "将人视为一座宝石矿——只有教育才能挖掘出其中无价的宝藏"),

    ("世界共同语", "巴哈伊教", "巴哈欧拉",
     "应当选定一种辅助语言，在全世界学校中教授",
     "为促进全人类相互理解，应选择或创造一种世界共同辅助语言"),

    ("正义至上", "巴哈伊教", "巴哈欧拉",
     "The best beloved of all things in My sight is Justice",
     "在我看来万物中最可爱的是正义——用你自己的眼睛看，用你自己的心判断"),

    ("协商精神", "巴哈伊教", "巴哈欧拉",
     "Consultation bestows greater awareness — 协商赋予更深的觉知",
     "协商是集体智慧的源泉——在真诚的讨论中，真理从各种观点中浮现"),

    ("服务精神", "巴哈伊教", "阿博都巴哈",
     "Service to humanity is service to God — 服务人类即服务上帝",
     "对人类的服务就是对上帝最好的崇拜——在行动中实践信仰"),
]


# ══════════════════════════════════════════════════════════════
#  汇总导出
# ══════════════════════════════════════════════════════════════

ALL_EXTRA_SITES = (
    EXTRA_HINDUISM_SITES
    + EXTRA_SIKHISM_SITES
    + EXTRA_SHINTO_SITES
    + EXTRA_INDIGENOUS_SITES
    + EXTRA_BAHAI_SITES
)

ALL_EXTRA_TEMPLES = (
    EXTRA_HINDUISM_TEMPLES
    + EXTRA_SIKHISM_TEMPLES
    + EXTRA_SHINTO_TEMPLES
    + EXTRA_INDIGENOUS_TEMPLES
    + EXTRA_BAHAI_TEMPLES
)

ALL_EXTRA_PATRIARCHS = (
    EXTRA_HINDUISM_PATRIARCHS
    + EXTRA_SIKHISM_PATRIARCHS
    + EXTRA_SHINTO_PATRIARCHS
    + EXTRA_INDIGENOUS_PATRIARCHS
    + EXTRA_BAHAI_PATRIARCHS
)

ALL_EXTRA_TEACHINGS = (
    EXTRA_HINDUISM_TEACHINGS
    + EXTRA_SIKHISM_TEACHINGS
    + EXTRA_SHINTO_TEACHINGS
    + EXTRA_INDIGENOUS_TEACHINGS
    + EXTRA_BAHAI_TEACHINGS
)


if __name__ == "__main__":
    print("=== 五大信仰扩展数据统计 ===")
    for name, sites, temples, patriarchs, teachings in [
        ("印度教", EXTRA_HINDUISM_SITES, EXTRA_HINDUISM_TEMPLES,
         EXTRA_HINDUISM_PATRIARCHS, EXTRA_HINDUISM_TEACHINGS),
        ("锡克教", EXTRA_SIKHISM_SITES, EXTRA_SIKHISM_TEMPLES,
         EXTRA_SIKHISM_PATRIARCHS, EXTRA_SIKHISM_TEACHINGS),
        ("神道教", EXTRA_SHINTO_SITES, EXTRA_SHINTO_TEMPLES,
         EXTRA_SHINTO_PATRIARCHS, EXTRA_SHINTO_TEACHINGS),
        ("原住民灵性", EXTRA_INDIGENOUS_SITES, EXTRA_INDIGENOUS_TEMPLES,
         EXTRA_INDIGENOUS_PATRIARCHS, EXTRA_INDIGENOUS_TEACHINGS),
        ("巴哈伊教", EXTRA_BAHAI_SITES, EXTRA_BAHAI_TEMPLES,
         EXTRA_BAHAI_PATRIARCHS, EXTRA_BAHAI_TEACHINGS),
    ]:
        print(f"\n{name}:")
        print(f"  圣地: {len(sites)}")
        print(f"  祖庭: {len(temples)}")
        print(f"  祖师: {len(patriarchs)}")
        print(f"  祖训: {len(teachings)}")

    print(f"\n=== 总计 ===")
    print(f"圣地: {len(ALL_EXTRA_SITES)}")
    print(f"祖庭: {len(ALL_EXTRA_TEMPLES)}")
    print(f"祖师: {len(ALL_EXTRA_PATRIARCHS)}")
    print(f"祖训: {len(ALL_EXTRA_TEACHINGS)}")
    print(f"总条目: {len(ALL_EXTRA_SITES) + len(ALL_EXTRA_TEMPLES) + len(ALL_EXTRA_PATRIARCHS) + len(ALL_EXTRA_TEACHINGS)}")
