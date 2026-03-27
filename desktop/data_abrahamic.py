"""
亚伯拉罕三大宗教扩展数据库
基督教 (Christianity) + 伊斯兰教 (Islam) + 犹太教 (Judaism)
大规模扩展: 圣地/祖庭/祖师/祖训

数据格式与 religions.py 完全一致:
- Holy Sites: 8-tuple (圣地名, 宗教, 国家, 音效类型, 搜索词English, 教义原文, 教义出处, 教义中文)
- Temples:    6-tuple (祖庭名, 宗教, 国家, 创建年代, 历史意义, 搜索词English)
- Patriarchs: 7-tuple (祖师名, 宗教, 时代, 尊号, 核心贡献, 名言, 搜索词English)
- Teachings:  5-tuple (祖训名, 宗教, 出自祖师, 训诫原文, 白话解读)
"""


# ██████████████████████████████████████████████████████
#  基督教 (Christianity) — 大规模扩展
# ██████████████████████████████████████████████████████

# ── 基督教圣地 (15) ─────────────────────────────────────
# 音效: "pipe_organ", "choir_hymn", "church_bell"

EXTRA_CHRISTIANITY_SITES = [
    # 圣地 — 耶稣生平
    ("伯利恒主诞堂", "基督教", "巴勒斯坦", "choir_hymn",
     "Church of Nativity Bethlehem manger star",
     "For unto you is born this day in the city of David a Saviour",
     "Luke 2:11",
     "今天在大卫的城里，为你们生了救主"),

    ("变容山大殿", "基督教", "以色列", "choir_hymn",
     "Mount Tabor Church Transfiguration Israel",
     "This is my beloved Son, in whom I am well pleased",
     "Matthew 17:5",
     "这是我的爱子，我所喜悦的"),

    ("加利利海畔", "基督教", "以色列", "church_bell",
     "Sea of Galilee Capernaum Jesus Israel",
     "Come, follow me, and I will make you fishers of men",
     "Matthew 4:19",
     "来跟从我，我要叫你们得人如得鱼"),

    ("橄榄山升天堂", "基督教", "以色列", "choir_hymn",
     "Mount of Olives Ascension Chapel Jerusalem",
     "You will receive power when the Holy Spirit comes on you",
     "Acts 1:8",
     "圣灵降临在你们身上，你们就必得着能力"),

    ("拔摩岛圣约翰洞", "基督教", "希腊", "pipe_organ",
     "Cave Apocalypse Patmos Greece St John",
     "I am the Alpha and the Omega, the First and the Last",
     "Revelation 1:11",
     "我是阿拉法，我是俄梅戛，我是首先的，我是末后的"),

    # 欧洲大教堂
    ("沙特尔大教堂", "基督教", "法国", "pipe_organ",
     "Chartres Cathedral France Gothic stained glass",
     "I am the light of the world",
     "John 8:12",
     "我是世界的光，跟从我的就不在黑暗里走"),

    ("圣地亚哥大教堂", "基督教", "西班牙", "pipe_organ",
     "Santiago de Compostela Cathedral Spain pilgrimage",
     "Blessed are those who hunger and thirst for righteousness",
     "Matthew 5:6",
     "饥渴慕义的人有福了，因为他们必得饱足"),

    ("亚琛大教堂", "基督教", "德国", "pipe_organ",
     "Aachen Cathedral Germany Charlemagne Palatine",
     "Where two or three gather in my name, there am I with them",
     "Matthew 18:20",
     "无论在哪里，有两三个人奉我的名聚会，那里就有我在"),

    # 东正教圣地
    ("阿索斯圣山", "基督教", "希腊", "choir_hymn",
     "Mount Athos Greece Orthodox monasteries",
     "Pray without ceasing",
     "1 Thessalonians 5:17",
     "不住地祷告"),

    ("圣凯瑟琳修道院", "基督教", "埃及", "choir_hymn",
     "Saint Catherine Monastery Sinai Egypt Orthodox",
     "I AM WHO I AM",
     "Exodus 3:14",
     "我是自有永有的"),

    # 非洲与美洲
    ("拉利贝拉岩石教堂", "基督教", "埃塞俄比亚", "choir_hymn",
     "Lalibela Rock Hewn Churches Ethiopia Orthodox",
     "The Lord is my shepherd; I shall not want",
     "Psalm 23:1",
     "耶和华是我的牧者，我必不至缺乏"),

    ("瓜达卢佩圣母堂", "基督教", "墨西哥", "church_bell",
     "Basilica Guadalupe Mexico City Virgin Mary",
     "My soul magnifies the Lord",
     "Luke 1:46",
     "我心尊主为大"),

    # 近现代朝圣地
    ("露德圣母朝圣地", "基督教", "法国", "choir_hymn",
     "Lourdes Grotto Sanctuary France pilgrimage",
     "Blessed are the pure in heart, for they will see God",
     "Matthew 5:8",
     "清心的人有福了，因为他们必得见神"),

    ("法蒂玛圣母堂", "基督教", "葡萄牙", "church_bell",
     "Fatima Sanctuary Portugal Our Lady pilgrimage",
     "With God all things are possible",
     "Matthew 19:26",
     "在神凡事都能"),

    ("坎特伯雷大教堂", "基督教", "英国", "pipe_organ",
     "Canterbury Cathedral England Anglican mother church",
     "Ask, and it will be given to you; seek, and you will find",
     "Matthew 7:7",
     "你们祈求，就给你们；寻找，就寻见"),
]


# ── 基督教祖庭 (25) ─────────────────────────────────────

EXTRA_CHRISTIANITY_TEMPLES = [
    # 圣地原址
    ("圣墓教堂", "基督教", "以色列", "公元335年",
     "耶稣受难、安葬与复活之地，由君士坦丁大帝下令建造",
     "Church Holy Sepulchre Jerusalem Constantine"),

    ("主诞堂", "基督教", "巴勒斯坦", "公元326年",
     "耶稣降生之马槽所在地，基督教现存最古老教堂之一",
     "Church Nativity Bethlehem oldest church"),

    ("加利利海会堂遗址", "基督教", "以色列", "公元1世纪",
     "迦百农彼得之家，耶稣传道中心，多个神迹发生地",
     "Capernaum Synagogue Sea Galilee ruins"),

    ("最后晚餐楼", "基督教", "以色列", "公元1世纪",
     "耶稣与十二门徒最后晚餐之地，圣餐礼的起源",
     "Cenacle Upper Room Last Supper Jerusalem"),

    # 早期教会
    ("安提阿洞穴教堂", "基督教", "土耳其", "公元1世纪",
     "门徒首次被称为基督徒之地，使徒保罗宣教基地",
     "Antakya Cave Church Antioch first Christians"),

    ("圣索菲亚大教堂", "基督教", "土耳其", "公元537年",
     "拜占庭建筑巅峰，东正教精神中心近千年，现为博物馆",
     "Hagia Sophia Istanbul Byzantine dome"),

    ("亚美尼亚埃奇米阿津大教堂", "基督教", "亚美尼亚", "公元303年",
     "世界最早基督教国家的母堂，亚美尼亚使徒教会总部",
     "Etchmiadzin Cathedral Armenia oldest church"),

    ("圣彼得大教堂", "基督教", "意大利", "1626年(重建)",
     "天主教会总部，建于使徒彼得墓地之上，文艺复兴建筑杰作",
     "St Peters Basilica Vatican Rome Renaissance"),

    # 欧洲大教堂
    ("巴黎圣母院", "基督教", "法国", "1163-1345年",
     "法国哥特式建筑经典，巴黎精神地标，2019年火灾后修复",
     "Notre Dame Paris Gothic Cathedral France"),

    ("科隆大教堂", "基督教", "德国", "1248-1880年",
     "德国最大哥特式教堂，传存东方三博士遗骸，建造跨越六百年",
     "Cologne Cathedral Germany Gothic twin spires"),

    ("威斯敏斯特教堂", "基督教", "英国", "1065年",
     "英国君主加冕之地，牛顿、达尔文等伟人安葬于此",
     "Westminster Abbey London coronation church"),

    ("圣家堂", "基督教", "西班牙", "1882年至今",
     "高迪未完成的杰作，融合自然主义与哥特风格的新艺术教堂",
     "Sagrada Familia Barcelona Gaudi unfinished"),

    ("米兰大教堂", "基督教", "意大利", "1386-1965年",
     "世界最大哥特式教堂之一，135座尖塔，3400余座雕像",
     "Milan Cathedral Duomo Italy Gothic marble"),

    ("坎特伯雷大教堂", "基督教", "英国", "公元597年",
     "英格兰教会母堂，托马斯·贝克特殉道之地，朝圣中心",
     "Canterbury Cathedral England Anglican pilgrimage"),

    ("亚琛大教堂", "基督教", "德国", "公元805年",
     "查理曼大帝宫廷教堂，神圣罗马帝国皇帝加冕地",
     "Aachen Cathedral Charlemagne Palatine Chapel"),

    # 东正教
    ("基辅圣索菲亚大教堂", "基督教", "乌克兰", "1037年",
     "基辅罗斯基督教化的标志，拥有11世纪珍贵马赛克壁画",
     "Saint Sophia Cathedral Kyiv Ukraine mosaic"),

    ("莫斯科圣瓦西里大教堂", "基督教", "俄罗斯", "1555-1561年",
     "伊凡雷帝为纪念喀山胜利而建，九座洋葱穹顶色彩斑斓",
     "St Basils Cathedral Moscow Red Square onion domes"),

    ("圣凯瑟琳修道院", "基督教", "埃及", "公元565年",
     "位于西奈山脚，世界最古老持续运作修道院，保存珍贵手稿",
     "Saint Catherine Monastery Sinai Egypt oldest"),

    ("拉利贝拉岩石教堂群", "基督教", "埃塞俄比亚", "12-13世纪",
     "拉利贝拉国王下令从岩石中凿出11座教堂，被称为非洲的耶路撒冷",
     "Lalibela Rock Hewn Churches Ethiopia Africa Jerusalem"),

    # 新教
    ("维滕贝格城堡教堂", "基督教", "德国", "1503年",
     "马丁·路德1517年张贴九十五条论纲之地，宗教改革起点",
     "Wittenberg Castle Church Luther 95 Theses Reformation"),

    ("日内瓦圣彼得大教堂", "基督教", "瑞士", "12世纪",
     "加尔文宣讲改革宗神学之地，改革宗运动的精神中心",
     "St Pierre Cathedral Geneva Calvin Reformed"),

    # 早期修道院
    ("克吕尼修道院", "基督教", "法国", "910年",
     "中世纪修道院改革运动发源地，鼎盛时管辖上千座修道院",
     "Cluny Abbey France Benedictine monastic reform"),

    ("阿西西圣方济各大殿", "基督教", "意大利", "1228年",
     "方济各会创立者安葬之地，乔托壁画描绘圣者生平",
     "Basilica San Francesco Assisi Italy Giotto fresco"),

    # 圣殿山关联
    ("耶路撒冷圣殿山", "基督教", "以色列", "公元前957年",
     "所罗门圣殿原址，耶稣洁净圣殿之地，三大宗教共同圣地",
     "Temple Mount Jerusalem Dome Rock holy site"),

    # 最早基督教国家
    ("格加尔德修道院", "基督教", "亚美尼亚", "4世纪",
     "岩洞修道院，传存刺穿耶稣的圣矛(朗基努斯之矛)",
     "Geghard Monastery Armenia Holy Lance cave"),
]


# ── 基督教祖师 (30) ─────────────────────────────────────

EXTRA_CHRISTIANITY_PATRIARCHS = [
    # ════ 十二使徒与早期领袖 ════
    ("使徒彼得", "基督教", "约公元1-64年", "磐石·首席使徒",
     "十二使徒之首，耶稣亲选教会领袖，罗马教会奠基者，传统上为首任教宗",
     "你是彼得，我要把我的教会建造在这磐石上",
     "Saint Peter Apostle keys painting icon"),

    ("使徒约翰", "基督教", "约公元6-100年", "爱的使徒",
     "十二使徒之一，著约翰福音、约翰书信与启示录，传扬神就是爱",
     "亲爱的弟兄啊，我们应当彼此相爱，因为爱是从神来的",
     "Saint John Apostle Evangelist eagle painting"),

    ("使徒雅各", "基督教", "约公元前3-公元44年", "大雅各·雷子",
     "十二使徒之一，最早殉道的使徒，西班牙圣地亚哥朝圣路纪念他",
     "信心若没有行为就是死的",
     "Saint James Greater Apostle Santiago painting"),

    ("使徒安德烈", "基督教", "约公元前5-公元60年", "首召使徒",
     "彼得的兄弟，最早跟随耶稣的门徒之一，希腊与俄罗斯的主保圣人",
     "我们遇见弥赛亚了",
     "Saint Andrew Apostle X cross Scotland patron"),

    ("使徒多马", "基督教", "约公元前1世纪-公元72年", "怀疑使徒·印度宣教者",
     "赴印度传教开创叙利亚-马拉巴教会，因求证复活被称疑惑多马",
     "我的主！我的神！",
     "Saint Thomas Apostle Doubting India missionary"),

    ("使徒马太", "基督教", "公元1世纪", "税吏使徒·福音书作者",
     "原为税吏，蒙召跟随耶稣后写下马太福音，记录耶稣言行",
     "来跟从我",
     "Saint Matthew Apostle tax collector Gospel writer"),

    ("使徒巴多罗买", "基督教", "公元1世纪", "无诡诈的以色列人",
     "十二使徒之一，传说在亚美尼亚传教殉道，亚美尼亚教会奠基者之一",
     "看哪，这是个真以色列人，他心里是没有诡诈的",
     "Saint Bartholomew Apostle Armenia missionary"),

    # ════ 教父时代 ════
    ("耶柔米", "基督教", "约347-420年", "圣经博士",
     "将圣经翻译为拉丁文武加大译本，成为西方教会标准圣经一千年",
     "不认识圣经，就是不认识基督",
     "Saint Jerome Vulgate Latin Bible translator painting"),

    ("安波罗修", "基督教", "约340-397年", "米兰主教·教会博士",
     "米兰大主教，引导奥古斯丁皈依，确立教会独立于国家的原则",
     "当你在罗马，就按罗马人的方式行事",
     "Saint Ambrose Milan Bishop Church Father painting"),

    ("大巴西略", "基督教", "330-379年", "该撒利亚大主教·教会博士",
     "卡帕多西亚教父之一，确立修道院生活准则，捍卫三一论正统",
     "好树不能结坏果子，坏树不能结好果子",
     "Saint Basil Great Cappadocian Church Father icon"),

    ("金口约翰", "基督教", "约349-407年", "金口·君士坦丁堡大主教",
     "教会史上最伟大讲道家之一，以雄辩口才著称，著有大量释经讲章",
     "光荣不在于从不跌倒，而在于每次跌倒后都能站起来",
     "Saint John Chrysostom Golden Mouth preacher icon"),

    ("亚他那修", "基督教", "约296-373年", "正统信仰护卫者",
     "坚决抵抗阿里乌异端，捍卫尼西亚信经的基督神性教义，五次被流放",
     "神成为人，是为了使人成为神",
     "Saint Athanasius Alexandria Nicene Creed defender"),

    # ════ 修道传统 ════
    ("圣安东尼", "基督教", "约251-356年", "沙漠教父·修道之祖",
     "基督教修道运动创始人，隐居埃及沙漠，开创独修苦行传统",
     "鱼离了水就死；修士离了独处就散心",
     "Saint Anthony Great Desert Father Egypt hermit"),

    ("圣本笃", "基督教", "约480-547年", "西方修道之父",
     "创立本笃会，著《圣本笃会规》，奠定西方修道院制度",
     "祈祷与劳动(Ora et Labora)",
     "Saint Benedict Nursia Rule monastery Western monasticism"),

    ("阿西西的方济各", "基督教", "1181-1226年", "贫穷的小弟兄",
     "创立方济各会，倡贫穷简朴生活，热爱自然万物，与动物说话",
     "主啊，使我作你和平之子。在有仇恨的地方，让我播下爱",
     "Saint Francis Assisi animals peace prayer"),

    # ════ 中世纪神学家 ════
    ("托马斯·阿奎那", "基督教", "1225-1274年", "天使博士",
     "经院哲学集大成者，著《神学大全》融合亚里士多德与基督教神学",
     "信仰与理性不相矛盾——真理只有一个",
     "Thomas Aquinas Summa Theologica Dominican friar"),

    ("希尔德加德·冯·宾根", "基督教", "1098-1179年", "莱茵河的女先知",
     "中世纪博学修女，神学家、作曲家、草药学家，教会博士",
     "圣灵是生命的生命力，万物运动之因",
     "Hildegard Bingen mystic abbess composer medieval"),

    # ════ 宗教改革 ════
    ("马丁·路德", "基督教", "1483-1546年", "宗教改革之父",
     "1517年张贴九十五条论纲，发起宗教改革，翻译德语圣经，创立路德宗",
     "这是我的立场，我别无选择，求神帮助我",
     "Martin Luther Reformation 95 Theses Wittenberg"),

    ("约翰·加尔文", "基督教", "1509-1564年", "日内瓦改革家",
     "系统化改革宗神学，著《基督教要义》，建立日内瓦神权政体模式",
     "人心是制造偶像的工厂",
     "John Calvin Geneva Reformed theology Institutes"),

    ("慈运理", "基督教", "1484-1531年", "苏黎世改革家",
     "瑞士宗教改革领袖，在苏黎世推行政教改革，强调圣经唯一权威",
     "为了真理，我们什么都能忍受",
     "Huldrych Zwingli Zurich Swiss Reformation"),

    ("威廉·廷代尔", "基督教", "约1494-1536年", "英语圣经之父",
     "首位将希腊文新约翻译为英语的学者，为翻译圣经付出生命",
     "我要让耕田的男孩比教宗更懂圣经",
     "William Tyndale English Bible translator martyr"),

    # ════ 近现代 ════
    ("约翰·卫斯理", "基督教", "1703-1791年", "循道宗创始人",
     "创立卫理公会运动，推动英国福音复兴，强调成圣与社会关怀",
     "全世界是我的牧区",
     "John Wesley Methodist founder revival preacher"),

    ("索伦·克尔凯郭尔", "基督教", "1813-1855年", "存在主义之父",
     "丹麦哲学家神学家，批判形式化基督教，强调个人信仰的跳跃",
     "生命只能向后理解，但必须向前活",
     "Soren Kierkegaard existentialist philosopher Copenhagen"),

    ("迪特里希·潘霍华", "基督教", "1906-1945年", "殉道神学家",
     "德国神学家，反抗纳粹政权，参与暗杀希特勒计划，被处死于集中营",
     "面对邪恶沉默不语，本身就是邪恶",
     "Dietrich Bonhoeffer martyr theologian Nazi resistance"),

    ("特蕾莎修女", "基督教", "1910-1997年", "加尔各答的圣人",
     "创立仁爱传教修女会，毕生服务印度最贫穷者，获诺贝尔和平奖",
     "我们做不了伟大的事，只能以伟大的爱做小事",
     "Mother Teresa Calcutta Nobel Peace charity saint"),

    ("马丁·路德·金", "基督教", "1929-1968年", "民权运动领袖",
     "美国民权运动领袖，以非暴力抗争推动种族平等，被暗杀于孟菲斯",
     "我有一个梦想——一切人生而平等",
     "Martin Luther King Jr civil rights dream speech"),

    ("C.S.路易斯", "基督教", "1898-1963年", "信仰辩护者",
     "英国文学家与护教学家，著《纳尼亚传奇》《返璞归真》等",
     "你从未与一个凡人交谈过——每个人都是不朽的灵魂",
     "CS Lewis Narnia Mere Christianity Oxford apologist"),

    ("卡尔·巴特", "基督教", "1886-1968年", "20世纪最伟大神学家",
     "新正统神学代表，著《教会教义学》，以神的话语为神学核心",
     "勇敢一点——这事已经成了！",
     "Karl Barth Church Dogmatics neo-orthodox theologian"),

    ("德斯蒙德·图图", "基督教", "1931-2021年", "彩虹之国的大主教",
     "南非圣公会大主教，反种族隔离运动领袖，获诺贝尔和平奖",
     "没有宽恕就没有未来",
     "Desmond Tutu Archbishop South Africa reconciliation"),

    ("若望保禄二世", "基督教", "1920-2005年", "旅行教宗",
     "在位27年到访129个国家，推动东欧共产主义和平转型与宗教对话",
     "不要害怕！敞开大门迎接基督",
     "Pope John Paul II Vatican pilgrim world peace"),
]


# ── 基督教祖训 (12) ─────────────────────────────────────

EXTRA_CHRISTIANITY_TEACHINGS = [
    ("登山宝训", "基督教", "耶稣基督",
     "虚心的人有福了，因为天国是他们的。哀恸的人有福了，因为他们必得安慰",
     "八福是基督伦理的核心——真正的幸福不在于拥有，而在于内心的品质"),

    ("爱仇敌", "基督教", "耶稣基督",
     "要爱你们的仇敌，为那逼迫你们的祷告",
     "超越以眼还眼的公义——以爱化解仇恨是天国的律法"),

    ("十字架之道", "基督教", "使徒保罗",
     "我已经与基督同钉十字架，现在活着的不再是我，乃是基督在我里面活着",
     "信仰的核心是向旧我死去——与基督同死同复活，活出新生命"),

    ("因信称义", "基督教", "马丁·路德",
     "义人必因信得生——人得救不是靠行为，乃是靠信心",
     "人在上帝面前被称为义，唯独通过信心，不是靠自己的努力"),

    ("主祷文", "基督教", "耶稣基督",
     "我们在天上的父，愿人都尊你的名为圣。愿你的国降临，愿你的旨意行在地上如同行在天上",
     "耶稣亲授的祈祷范式——承认神为父，求神国实现在人间"),

    ("道成肉身", "基督教", "使徒约翰",
     "太初有道，道与神同在，道就是神。道成了肉身，住在我们中间",
     "超越的上帝进入人间——神不是遥远的概念，而是与人同住的真实存在"),

    ("好撒玛利亚人", "基督教", "耶稣基督",
     "你去照样行吧——凡怜悯人的就是你的邻舍",
     "邻舍不分民族宗教——看见需要就伸出援手，这就是爱的实践"),

    ("上帝之城", "基督教", "奥古斯丁",
     "地上之城以自爱建立，天上之城以爱神建立",
     "人类社会的根本选择——以自我为中心还是以上帝为中心"),

    ("五个唯独", "基督教", "宗教改革传统",
     "唯独圣经、唯独恩典、唯独信心、唯独基督、唯独神的荣耀",
     "新教信仰的五大核心原则——一切回到源头，去除人为添加"),

    ("和平祷词", "基督教", "阿西西的方济各",
     "主啊，使我作你和平之子。在有仇恨的地方让我播下爱，在有伤害的地方让我播下宽恕",
     "不是求被安慰乃是去安慰——基督徒的使命是成为和平的使者"),

    ("廉价恩典批判", "基督教", "潘霍华",
     "廉价的恩典是教会的死敌。我们今天所要争取的是重价的恩典",
     "恩典不是免费的通行证——真正的恩典要求门徒付出跟随的代价"),

    ("行公义好怜悯", "基督教", "先知弥迦",
     "世人哪，耶和华已指示你何为善：行公义，好怜悯，存谦卑的心与你的神同行",
     "信仰的三个维度——对社会公正、对他人慈悲、对上帝谦卑"),
]


# ██████████████████████████████████████████████████████
#  伊斯兰教 (Islam) — 大规模扩展
# ██████████████████████████████████████████████████████

# ── 伊斯兰教圣地 (12) ───────────────────────────────────
# 音效: "adhan_call", "quran_recite"

EXTRA_ISLAM_SITES = [
    ("大马士革倭马亚大清真寺", "伊斯兰教", "叙利亚", "adhan_call",
     "Umayyad Mosque Damascus Syria oldest mosque",
     "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا",
     "《古兰经》3:103",
     "你们当全体坚持真主的绳索，不要分裂"),

    ("科尔多瓦大清真寺", "伊斯兰教", "西班牙", "adhan_call",
     "Cordoba Mezquita Great Mosque Spain arches",
     "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ",
     "《古兰经》49:13",
     "众人啊！我确已从一男一女创造你们，并使你们成为许多民族和宗族，以便你们互相认识"),

    ("爱资哈尔清真寺", "伊斯兰教", "埃及", "quran_recite",
     "Al Azhar Mosque Cairo Egypt university oldest",
     "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
     "《古兰经》96:1",
     "你应当奉你的创造主的名义而宣读"),

    ("费萨尔清真寺", "伊斯兰教", "巴基斯坦", "adhan_call",
     "Faisal Mosque Islamabad Pakistan modern",
     "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
     "《古兰经》2:153",
     "真主确实是与坚忍者同在的"),

    ("哈桑二世清真寺", "伊斯兰教", "摩洛哥", "adhan_call",
     "Hassan II Mosque Casablanca Morocco ocean",
     "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا",
     "《古兰经》25:63",
     "至仁主的仆人是谦虚地行走在大地上的人"),

    ("西安大清真寺", "伊斯兰教", "中国", "adhan_call",
     "Great Mosque Xian China ancient Islamic",
     "لَا إِكْرَاهَ فِي الدِّينِ",
     "《古兰经》2:256",
     "宗教无强迫"),

    ("苏丹艾哈迈德清真寺", "伊斯兰教", "土耳其", "adhan_call",
     "Sultan Ahmed Mosque Istanbul Blue six minarets",
     "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
     "《古兰经》94:5",
     "与困难相伴的确是容易"),

    ("卡鲁因清真寺", "伊斯兰教", "摩洛哥", "quran_recite",
     "Al Qarawiyyin Mosque Fez Morocco oldest university",
     "هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
     "《古兰经》39:9",
     "有知识的人和无知识的人相等吗"),

    ("鲁米陵墓绿穹", "伊斯兰教", "土耳其", "quran_recite",
     "Rumi Tomb Green Dome Konya Turkey Mevlana",
     "Come, come, whoever you are — wanderer, worshipper, lover of leaving",
     "鲁米",
     "来吧来吧，无论你是谁——浪人、朝拜者、离别的恋人，都来吧"),

    ("泉州清净寺", "伊斯兰教", "中国", "adhan_call",
     "Qingjing Mosque Quanzhou China ancient Song dynasty",
     "وَلِكُلِّ أُمَّةٍ جَعَلْنَا مَنسَكًا",
     "《古兰经》22:34",
     "我为每个民族制定了功修仪式"),

    ("广州怀圣寺", "伊斯兰教", "中国", "adhan_call",
     "Huaisheng Mosque Guangzhou China lighthouse minaret",
     "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا",
     "《古兰经》3:200",
     "信道的人们啊！你们当坚忍，当互勉坚忍"),

    ("巴德夏希清真寺", "伊斯兰教", "巴基斯坦", "adhan_call",
     "Badshahi Mosque Lahore Pakistan Mughal red",
     "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
     "《古兰经》65:3",
     "谁托靠真主，真主将使他满足"),
]


# ── 伊斯兰教祖庭 (20) ───────────────────────────────────

EXTRA_ISLAM_TEMPLES = [
    # 三大圣寺
    ("麦加禁寺", "伊斯兰教", "沙特", "远古(重建于公元630年)",
     "伊斯兰教第一圣寺，天房(卡巴)所在地，全球穆斯林朝觐中心",
     "Masjid al-Haram Mecca Kaaba Grand Mosque"),

    ("麦地那先知寺", "伊斯兰教", "沙特", "公元622年",
     "先知穆罕默德亲建并安葬之地，伊斯兰第二圣寺",
     "Al-Masjid an-Nabawi Medina Prophet Mosque green dome"),

    ("耶路撒冷阿克萨清真寺", "伊斯兰教", "以色列", "公元705年",
     "先知夜行登霄之地，伊斯兰第三圣寺，位于圣殿山上",
     "Al-Aqsa Mosque Jerusalem Temple Mount Isra Miraj"),

    # 倭马亚与阿拔斯
    ("大马士革倭马亚大清真寺", "伊斯兰教", "叙利亚", "公元715年",
     "倭马亚王朝最伟大建筑，保存施洗约翰头颅圣物，清真寺建筑典范",
     "Umayyad Mosque Damascus Syria oldest standing mosque"),

    ("科尔多瓦大清真寺", "伊斯兰教", "西班牙", "公元784年",
     "安达卢西亚伊斯兰文明巅峰，856根圆柱红白拱门举世无双",
     "Mezquita Cordoba Spain 856 columns arches"),

    ("阿尔罕布拉宫", "伊斯兰教", "西班牙", "1238-1358年",
     "格拉纳达纳斯里德王朝宫殿，伊斯兰建筑艺术与几何图案的极致",
     "Alhambra Palace Granada Spain Nasrid Islamic art"),

    # 奥斯曼帝国
    ("苏莱曼尼耶清真寺", "伊斯兰教", "土耳其", "1550-1557年",
     "建筑大师锡南为苏莱曼大帝所建，奥斯曼建筑最高成就",
     "Suleymaniye Mosque Istanbul Sinan Ottoman masterpiece"),

    ("苏丹艾哈迈德清真寺", "伊斯兰教", "土耳其", "1609-1616年",
     "六座宣礼塔独一无二，蓝色伊兹尼克瓷砖覆盖内壁，又称蓝色清真寺",
     "Sultan Ahmed Blue Mosque Istanbul six minarets"),

    # 莫卧儿帝国
    ("泰姬陵", "伊斯兰教", "印度", "1632-1653年",
     "莫卧儿皇帝沙贾汗为爱妻所建陵墓，伊斯兰建筑与爱情的永恒象征",
     "Taj Mahal Agra India Shah Jahan Mumtaz Mughal"),

    ("巴德夏希清真寺", "伊斯兰教", "巴基斯坦", "1671-1673年",
     "莫卧儿帝国第六代皇帝奥朗则布所建，拉合尔地标",
     "Badshahi Mosque Lahore Pakistan Mughal Aurangzeb"),

    # 北非与西非
    ("爱资哈尔清真寺", "伊斯兰教", "埃及", "公元970年",
     "法蒂玛王朝所建，附设世界最古老大学之一，逊尼派最高学术权威",
     "Al-Azhar Mosque Cairo Egypt Fatimid university"),

    ("卡鲁因清真寺", "伊斯兰教", "摩洛哥", "公元859年",
     "法蒂玛·菲赫里创建的世界最古老持续运作大学，伊斯兰学术圣地",
     "Al-Qarawiyyin Fez Morocco oldest university Fatima Fihri"),

    ("哈桑二世清真寺", "伊斯兰教", "摩洛哥", "1986-1993年",
     "世界最高宣礼塔(210米)，部分建于大西洋上，可容纳10万人",
     "Hassan II Mosque Casablanca Morocco tallest minaret ocean"),

    # 南亚与东南亚
    ("费萨尔清真寺", "伊斯兰教", "巴基斯坦", "1976-1986年",
     "沙特费萨尔国王资助，帐篷造型现代设计，南亚最大清真寺之一",
     "Faisal Mosque Islamabad Pakistan modern tent design"),

    # 中国伊斯兰
    ("西安大清真寺", "伊斯兰教", "中国", "公元742年(唐天宝元年)",
     "中国最早的清真寺之一，中国传统建筑风格与伊斯兰信仰完美融合",
     "Great Mosque Xian China Tang Dynasty Chinese architecture"),

    ("泉州清净寺", "伊斯兰教", "中国", "公元1009年(北宋)",
     "中国现存最古老的阿拉伯风格清真寺，海上丝绸之路见证",
     "Qingjing Mosque Quanzhou Song Dynasty Maritime Silk Road"),

    ("广州怀圣寺", "伊斯兰教", "中国", "公元627年(传说)",
     "传为先知弟子宛葛素所建，光塔(邦克楼)是广州古老地标",
     "Huaisheng Mosque Guangzhou Lighthouse Minaret oldest"),

    # 苏菲圣地
    ("鲁米陵墓(梅夫拉纳博物馆)", "伊斯兰教", "土耳其", "1274年",
     "苏菲大师鲁米安葬之地，梅夫拉纳旋转苦行僧团发源地",
     "Rumi Mevlana Museum Green Dome Konya Turkey Sufi"),

    ("尼扎木丁圣陵", "伊斯兰教", "印度", "1325年",
     "苏菲圣人尼扎目丁·奥利亚陵墓，德里最重要的苏菲朝圣地",
     "Nizamuddin Dargah Delhi India Sufi shrine Chishti"),

    ("数据达尔巴尔圣陵", "伊斯兰教", "巴基斯坦", "11世纪",
     "拉合尔苏菲圣人阿里·胡吉维利陵墓，南亚苏菲传统重要圣地",
     "Data Darbar Lahore Pakistan Ali Hujwiri Sufi shrine"),
]


# ── 伊斯兰教祖师 (22) ───────────────────────────────────

EXTRA_ISLAM_PATRIARCHS = [
    # ════ 先知 ════
    ("易卜拉欣(亚伯拉罕)", "伊斯兰教", "约公元前2000年", "安拉的挚友(Khalilullah)",
     "三大一神教共同先祖，顺从真主命令献子，重建天房卡巴",
     "我已转向天地的创造者，我不是以物配主的人",
     "Ibrahim Abraham Islam Kaaba Quran patriarch"),

    ("穆萨(摩西)", "伊斯兰教", "约公元前1400年", "与安拉交谈的先知(Kalimullah)",
     "带领以色列人脱离法老暴政，在西奈山领受律法",
     "主啊！求你展开我的胸襟，求你使我的事变为容易",
     "Musa Moses Islam prophet Torah Pharaoh"),

    ("尔撒(耶稣)", "伊斯兰教", "公元前4-约公元30年", "安拉的灵(Ruhullah)",
     "伊斯兰教尊为伟大先知之一，童贞女马利亚之子，行神迹治病救人",
     "我确实是安拉的仆人，他赐给我经典，使我成为先知",
     "Isa Jesus Islam prophet Quran Maryam"),

    # ════ 四大哈里发 ════
    ("阿布·伯克尔", "伊斯兰教", "573-634年", "诚信者(As-Siddiq)·第一任正统哈里发",
     "先知最亲密伙伴，稳定了先知归真后的穆斯林社区，编纂古兰经",
     "如果穆罕默德是你的主人他已归真，但如果你崇拜真主则真主永活",
     "Abu Bakr Siddiq first Caliph Rashidun Islamic"),

    ("欧麦尔·本·赫塔卜", "伊斯兰教", "584-644年", "公正者(Al-Faruq)·第二任正统哈里发",
     "伊斯兰帝国扩张至波斯和拜占庭，建立行政和司法制度",
     "要在被审判之前先审判自己",
     "Umar ibn Khattab second Caliph Rashidun justice"),

    ("奥斯曼·本·阿凡", "伊斯兰教", "576-656年", "两道光的拥有者(Dhun-Nurayn)·第三任正统哈里发",
     "统一编定古兰经标准本(奥斯曼古兰经)，使经典免于分歧",
     "真主不会因为流泪而惩罚你，但会因为舌头而惩罚或怜悯你",
     "Uthman ibn Affan third Caliph Quran compilation"),

    ("阿里·本·阿比·塔利卜", "伊斯兰教", "601-661年", "安拉的狮子·第四任正统哈里发",
     "先知堂弟和女婿，什叶派尊为首任伊玛目，以智慧和勇武著称",
     "人分两种：要么是你信仰上的兄弟，要么是你人类中的同伴",
     "Ali ibn Abi Talib fourth Caliph Shia first Imam"),

    # ════ 圣训学家 ════
    ("伊玛目布哈里", "伊斯兰教", "810-870年", "圣训之王",
     "编纂《布哈里圣训实录》，从60万条圣训中精选7275条，最权威圣训集",
     "求知是每个穆斯林的义务",
     "Imam Bukhari Sahih Hadith scholar Bukhara"),

    ("伊玛目穆斯林", "伊斯兰教", "815-875年", "圣训大师",
     "编纂《穆斯林圣训实录》，与布哈里并称两大最权威圣训集",
     "信仰有七十多个分支，最高是认主独一，最低是清除路上的障碍",
     "Imam Muslim Sahih Hadith Nishapur scholar"),

    ("伊玛目提尔密济", "伊斯兰教", "824-892年", "圣训博学者",
     "编纂《提尔密济圣训集》，六大圣训集之一，善于区分圣训等级",
     "最完美的信士是品德最好的人，你们中最好的是对妻子最好的",
     "Imam Tirmidhi Jami Hadith Sunan scholar Termez"),

    # ════ 四大伊玛目(法学家) ════
    ("阿布·哈尼法", "伊斯兰教", "699-767年", "最大伊玛目(Al-Imam al-Azam)",
     "哈乃斐学派创始人，以类比推理(齐亚斯)和个人判断(拉伊)著称",
     "当你不知道时说不知道，这本身就是知识",
     "Abu Hanifa Hanafi school Islamic jurisprudence Kufa"),

    ("伊玛目马利克", "伊斯兰教", "711-795年", "迁士之城的伊玛目",
     "马利基学派创始人，著《穆瓦塔》，以麦地那人实践为法律依据",
     "知识不在于多记，而在于心中的光",
     "Imam Malik Maliki school Muwatta Medina jurisprudence"),

    ("伊玛目沙斐仪", "伊斯兰教", "767-820年", "伊斯兰法理学之父",
     "沙斐仪学派创始人，系统化伊斯兰法学方法论(乌苏尔·菲格赫)",
     "知识多了就不会傲慢，就像河流满了就不会泛滥",
     "Imam Shafii Islamic jurisprudence Usul al-Fiqh Cairo"),

    ("伊玛目罕百里", "伊斯兰教", "780-855年", "圣训的伊玛目",
     "罕百里学派创始人，坚持圣训至上，抵制理性主义穆尔台齐赖派",
     "人们最需要的是知识，而知识比食物更必要",
     "Imam Ahmad Hanbali school Hadith Baghdad Mutazila"),

    # ════ 苏菲大师 ════
    ("鲁米(贾拉鲁丁)", "伊斯兰教", "1207-1273年", "梅夫拉纳(我们的导师)",
     "苏菲派最伟大诗人，著《玛斯纳维》被誉为波斯语古兰经，创旋转苦行僧舞",
     "你不是一滴水在海洋里，你是整个海洋在一滴水中",
     "Rumi Mevlana Sufi poet Masnavi whirling dervish Konya"),

    ("安萨里(伊玛目)", "伊斯兰教", "1058-1111年", "伊斯兰教的凭证(Hujjat al-Islam)",
     "著《宗教科学的复兴》调和理性与信仰，被誉为伊斯兰思想最伟大综合者",
     "知识无行动是疯狂，行动无知识是空虚",
     "Al-Ghazali Ihya Ulum al-Din Islamic philosophy Sufi"),

    ("哈拉智(曼苏尔)", "伊斯兰教", "858-922年", "殉道苏菲",
     "苏菲神秘主义者，因宣称与真主合一(我即真理)被处死",
     "Ana al-Haqq——我即真理",
     "Mansur al-Hallaj Sufi martyr Ana al-Haqq mystic"),

    ("伊本·阿拉比", "伊斯兰教", "1165-1240年", "最伟大的导师(Al-Sheikh al-Akbar)",
     "苏菲哲学集大成者，著《麦加启示》，提出存在一体论(瓦赫达·乌朱德)",
     "我的心已能接受每一种形式：它是羚羊的草地，也是修士的修院",
     "Ibn Arabi Sufi philosophy Wahdat al-Wujud Andalusia"),

    ("拉比娅·阿达维耶", "伊斯兰教", "约717-801年", "苏菲之母",
     "女苏菲圣人，将无私之爱引入苏菲传统，不为天堂不畏地狱只为爱主",
     "主啊，如果我因畏惧火狱而拜你，就让我入火狱；如果因贪图天堂而拜你，就禁我入天堂",
     "Rabia al-Adawiyya Basra female Sufi saint mystic"),

    # ════ 哲学家 ════
    ("伊本·西那(阿维森纳)", "伊斯兰教", "980-1037年", "诸学之王",
     "波斯医学家哲学家，著《医典》为欧洲医学教材六百年，《治愈》综合哲学",
     "医学之路：运动是健康的柱石",
     "Ibn Sina Avicenna Canon Medicine Islamic philosophy Persia"),

    ("伊本·鲁世德(阿威罗伊)", "伊斯兰教", "1126-1198年", "注释者",
     "安达卢西亚哲学家法学家，亚里士多德注释深刻影响欧洲经院哲学",
     "无知导致恐惧，恐惧导致仇恨，仇恨导致暴力——这是等式",
     "Ibn Rushd Averroes Aristotle commentator Cordoba philosophy"),

    ("伊本·赫勒敦", "伊斯兰教", "1332-1406年", "社会学之父",
     "著《历史绪论》开创历史哲学与社会学，提出文明周期论",
     "人是社会存在——独居无法满足其需要",
     "Ibn Khaldun Muqaddimah sociology historian Tunis"),
]


# ── 伊斯兰教祖训 (12) ───────────────────────────────────

EXTRA_ISLAM_TEACHINGS = [
    ("清真言", "伊斯兰教", "先知穆罕默德",
     "Lā ilāha illā Allāh, Muḥammadur rasūlu Allāh——万物非主唯有真主，穆罕默德是主的使者",
     "伊斯兰信仰的根基——进入伊斯兰的钥匙，每日诵念无数次"),

    ("五功", "伊斯兰教", "先知穆罕默德",
     "伊斯兰建立在五根柱石上：作证、礼拜、天课、斋戒、朝觐",
     "信仰不只是内心认可——通过五种具体行为将信仰融入日常生活"),

    ("奉至仁至慈之名", "伊斯兰教", "《古兰经》",
     "Bismillah ir-Rahman ir-Rahim——奉至仁至慈的真主之名",
     "穆斯林做任何事的开端语——提醒自己一切行为都在真主的仁慈之下"),

    ("宗教无强迫", "伊斯兰教", "《古兰经》",
     "Lā ikrāha fī al-dīn——宗教无强迫，正邪已分明",
     "信仰必须出于自愿——真正的信仰不能通过强迫获得"),

    ("知识至上", "伊斯兰教", "先知穆罕默德",
     "求知，即使远在中国。求知是每个穆斯林男女的义务",
     "知识没有国界——为求知而行万里路是信仰的一部分"),

    ("中道原则", "伊斯兰教", "《古兰经》",
     "我这样使你们成为中正的民族——你们可以做世人的见证",
     "伊斯兰的核心精神是中庸——不走极端，在信仰与生活之间寻求平衡"),

    ("万物皆有定数", "伊斯兰教", "《古兰经》",
     "إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ——我创造万物确是依定量的",
     "一切发生皆有安拉的旨意——接受命运的考验并积极应对"),

    ("安拉至近", "伊斯兰教", "《古兰经》",
     "我比他的颈静脉更接近他",
     "真主不在遥远的天上——他比你最亲近的血管还要近，无处不在"),

    ("善行的重要", "伊斯兰教", "先知穆罕默德",
     "你们中最优秀的人是品德最好的人",
     "信仰的果实是品德——真正虔诚的标志不是仪式而是善良的行为"),

    ("大吉哈德", "伊斯兰教", "先知穆罕默德",
     "最伟大的吉哈德是与自己灵魂的斗争",
     "真正的圣战是内心的战斗——克服私欲、贪婪和嫉妒比任何外在战斗都难"),

    ("苏菲之爱", "伊斯兰教", "鲁米",
     "爱是一座桥梁——让你从理性的此岸到达真理的彼岸",
     "苏菲传统教导：爱是通向真主的最直接道路——超越教条走向本心"),

    ("存在一体", "伊斯兰教", "伊本·阿拉比",
     "宇宙是真主的镜子——万物都是他的名字和属性的显化",
     "一切存在本质上是一体的——分别只是表象，合一才是真相"),
]


# ██████████████████████████████████████████████████████
#  犹太教 (Judaism) — 大规模扩展
# ██████████████████████████████████████████████████████

# ── 犹太教圣地 (12) ─────────────────────────────────────
# 音效: "shofar_horn", "hebrew_chant"

EXTRA_JUDAISM_SITES = [
    ("希伯伦先祖墓", "犹太教", "以色列", "shofar_horn",
     "Cave of Patriarchs Hebron Machpelah Israel",
     "V'erastich li l'olam — I will betroth you to me forever",
     "《何西阿书》2:19",
     "我必聘你永远归我为妻"),

    ("采法特古城", "犹太教", "以色列", "hebrew_chant",
     "Safed Tzfat Kabbalah mystical city Israel",
     "Or zarua la'tzadik — Light is sown for the righteous",
     "《诗篇》97:11",
     "散布亮光是为义人"),

    ("雅法门耶路撒冷老城", "犹太教", "以色列", "shofar_horn",
     "Jaffa Gate Old City Jerusalem Jewish Quarter",
     "Pray for the peace of Jerusalem",
     "《诗篇》122:6",
     "你们要为耶路撒冷求平安"),

    ("加利利提比利亚", "犹太教", "以色列", "hebrew_chant",
     "Tiberias Sea Galilee Israel holy city Talmud",
     "Torah tziva lanu Moshe — Moses commanded us the Torah",
     "《申命记》33:4",
     "摩西将律法传给我们，作为雅各会众的产业"),

    ("拉结墓", "犹太教", "以色列", "shofar_horn",
     "Rachel Tomb Bethlehem Israel matriarch",
     "A voice is heard in Ramah — Rachel weeping for her children",
     "《耶利米书》31:15",
     "在拉玛听见号咷痛哭的声音——拉结哭她儿女"),

    ("橄榄山犹太墓地", "犹太教", "以色列", "shofar_horn",
     "Mount Olives Jewish Cemetery Jerusalem oldest",
     "Your dead shall live; their bodies shall rise",
     "《以赛亚书》26:19",
     "死人要复活，尸首要兴起"),

    ("布拉格老犹太区", "犹太教", "捷克", "hebrew_chant",
     "Prague Jewish Quarter Josefov Old Cemetery",
     "Remember us for life, O King who delights in life",
     "犹太新年祈祷词",
     "喜悦生命的君王啊，请记念我们于生命册上"),

    ("耶路撒冷犹太区", "犹太教", "以色列", "shofar_horn",
     "Jewish Quarter Old City Jerusalem Hurva Synagogue",
     "If I forget you, O Jerusalem, let my right hand wither",
     "《诗篇》137:5",
     "耶路撒冷啊，我若忘记你，情愿我的右手忘记技巧"),

    ("伯尔谢巴", "犹太教", "以色列", "shofar_horn",
     "Beersheba Negev Israel Abraham well covenant",
     "Abraham planted a tamarisk tree in Beersheba and called on the name of the LORD",
     "《创世记》21:33",
     "亚伯拉罕在别是巴栽了一棵垂丝柳树，又在那里求告耶和华"),

    ("以色列博物馆死海卷轴", "犹太教", "以色列", "hebrew_chant",
     "Israel Museum Shrine Book Dead Sea Scrolls Jerusalem",
     "The grass withers, the flower fades, but the word of our God will stand forever",
     "《以赛亚书》40:8",
     "草必枯干，花必凋残，惟有我们神的话必永远立定"),

    ("克拉科夫犹太区", "犹太教", "波兰", "hebrew_chant",
     "Krakow Kazimierz Jewish Quarter Poland synagogue",
     "Lo alecha ham'lacha ligmor, v'lo ata ben chorin l'hibatel mimena",
     "《密西拿·先贤篇》2:16",
     "你不必完成全部工作，但你也无权放弃它"),

    ("突尼斯格里巴犹太会堂", "犹太教", "突尼斯", "hebrew_chant",
     "El Ghriba Synagogue Djerba Tunisia oldest Africa",
     "How good and pleasant it is when brothers dwell in unity",
     "《诗篇》133:1",
     "看哪，弟兄和睦同居是何等的善，何等的美"),
]


# ── 犹太教祖庭 (15) ─────────────────────────────────────

EXTRA_JUDAISM_TEMPLES = [
    # 耶路撒冷
    ("圣殿山(第一圣殿遗址)", "犹太教", "以色列", "公元前957年",
     "所罗门王建造的第一圣殿，安放约柜的至圣所，犹太教最神圣之地",
     "Temple Mount First Temple Solomon Ark Covenant Jerusalem"),

    ("西墙(哭墙)", "犹太教", "以色列", "公元前19年",
     "第二圣殿西侧挡土墙遗址，犹太教最重要祈祷场所，希律王时期建造",
     "Western Wall Wailing Wall Kotel Jerusalem Herod"),

    ("大卫城遗址", "犹太教", "以色列", "公元前1000年",
     "大卫王定都耶路撒冷之地，以色列统一王国起点",
     "City of David Jerusalem archaeological site ancient"),

    # 古代会堂
    ("布拉格老新犹太会堂", "犹太教", "捷克", "1270年",
     "欧洲现存最古老仍在使用的犹太会堂，哥特式建筑，传说藏有泥人傀儡",
     "Old New Synagogue Prague Czech Altneuschul Gothic Golem"),

    ("布达佩斯烟草街会堂", "犹太教", "匈牙利", "1854-1859年",
     "世界最大犹太会堂之一，可容纳3000人，摩尔复兴建筑风格",
     "Dohany Street Synagogue Budapest Hungary largest Moorish"),

    ("威尼斯犹太区会堂", "犹太教", "意大利", "1516年",
     "世界上第一个犹太隔离区(Ghetto)所在地，五座历史犹太会堂",
     "Venice Ghetto Synagogue Italy first ghetto Scuola"),

    ("亚历山大以利亚胡会堂", "犹太教", "埃及", "1354年(重建)",
     "曾是中东最大犹太会堂，见证亚历山大犹太社区两千年历史",
     "Eliyahu Hanavi Synagogue Alexandria Egypt largest"),

    # 学术中心
    ("雅夫内学院遗址", "犹太教", "以色列", "公元70年",
     "圣殿被毁后约哈南·本·扎凯建立的学院，犹太教拉比传统转型之地",
     "Yavne Academy Israel Yochanan ben Zakkai Sanhedrin"),

    ("苏拉学院遗址", "犹太教", "伊拉克", "公元219年",
     "巴比伦塔木德编纂中心，与蓬贝迪塔学院并为犹太学术双峰",
     "Sura Academy Babylonia Talmud Jewish Iraq Rav"),

    ("蓬贝迪塔学院遗址", "犹太教", "伊拉克", "约公元259年",
     "巴比伦另一大学术中心，与苏拉学院共同完成巴比伦塔木德",
     "Pumbedita Academy Babylonia Talmud Jewish Iraq"),

    # 历史遗址
    ("马萨达要塞", "犹太教", "以色列", "约公元前37年",
     "犹太人反抗罗马的最后堡垒，960名犹太人宁死不降，以色列精神象征",
     "Masada Fortress Dead Sea Israel Jewish resistance Herod"),

    ("库姆兰(死海卷轴洞穴)", "犹太教", "以色列", "约公元前2世纪",
     "1947年发现死海卷轴之地，保存了最古老的希伯来圣经手稿",
     "Qumran Dead Sea Scrolls caves Israel ancient manuscripts"),

    # 采法特神秘主义中心
    ("采法特阿里犹太会堂", "犹太教", "以色列", "16世纪",
     "卡巴拉神秘主义中心，以撒·卢里亚(阿里)与约瑟夫·卡罗在此创作",
     "Ha-ARI Synagogue Safed Tzfat Kabbalah Isaac Luria"),

    # 大屠杀纪念
    ("奥斯维辛-比克瑙", "犹太教", "波兰", "1940-1945年",
     "纳粹大屠杀最大灭绝营，超过110万犹太人在此遇难，永远的警醒",
     "Auschwitz-Birkenau Poland Holocaust memorial museum"),

    # 现代
    ("耶路撒冷大犹太会堂", "犹太教", "以色列", "1982年",
     "以色列最大犹太会堂，融合古代圣殿元素与现代建筑",
     "Great Synagogue Jerusalem Israel modern Ashkenazi"),
]


# ── 犹太教祖师 (22) ─────────────────────────────────────

EXTRA_JUDAISM_PATRIARCHS = [
    # ════ 族长与先知 ════
    ("亚伯拉罕", "犹太教", "约公元前2000年", "信心之父·万国之父",
     "犹太民族始祖，三大一神教共同先祖，离开本族之地顺从神的呼召",
     "你要离开本地、本族、父家，往我所要指示你的地去",
     "Abraham patriarch covenant promised land painting"),

    ("以撒", "犹太教", "约公元前1900年", "应许之子",
     "亚伯拉罕之子，神应许之约的承继者，被献祭又蒙拯救",
     "神必自己预备作燔祭的羊羔",
     "Isaac patriarch sacrifice Moriah binding painting"),

    ("雅各(以色列)", "犹太教", "约公元前1800年", "以色列·与神角力者",
     "十二支派之父，与天使摔跤后改名以色列，意为与神角力的人",
     "你的名不要再叫雅各，要叫以色列，因为你与神与人较力都得了胜",
     "Jacob Israel twelve tribes patriarch wrestling angel"),

    ("约书亚", "犹太教", "约公元前1400年", "摩西的继承者",
     "带领以色列人渡过约旦河进入应许之地，攻克耶利哥城",
     "你当刚强壮胆，不要惧怕也不要惊惶，因为你无论往哪里去耶和华你的神必与你同在",
     "Joshua Jericho promised land Israel leader conquest"),

    ("大卫", "犹太教", "约公元前1040-970年", "合神心意的王·甜蜜歌者",
     "以色列最伟大的国王，统一以色列定都耶路撒冷，著诗篇，弥赛亚先祖",
     "耶和华是我的牧者，我必不至缺乏",
     "King David Jerusalem Psalms harp Israel painting"),

    ("所罗门", "犹太教", "约公元前990-931年", "智慧之王",
     "大卫之子，建造第一圣殿，以智慧闻名天下，著箴言书与传道书",
     "敬畏耶和华是智慧的开端",
     "King Solomon Temple wisdom Proverbs Israel painting"),

    # ════ 先知 ════
    ("以利亚", "犹太教", "公元前9世纪", "先知之首·迦密山英雄",
     "在迦密山战胜巴力先知捍卫一神信仰，乘火车升天未经死亡",
     "耶和华是神！耶和华是神！",
     "Elijah prophet Carmel fire chariot heaven painting"),

    ("以赛亚", "犹太教", "公元前8世纪", "福音先知",
     "犹太教最伟大先知之一，预言弥赛亚和平国度，社会公义的呐喊者",
     "他们要将刀打成犁头，把枪打成镰刀——国与国不再学习战事",
     "Isaiah prophet swords plowshares peace vision painting"),

    ("耶利米", "犹太教", "约公元前650-570年", "流泪的先知",
     "在耶路撒冷陷落前警告百姓悔改，预言新约时代，目睹圣殿被毁",
     "我要将我的律法放在他们里面，写在他们心上",
     "Jeremiah weeping prophet Jerusalem fall Babylon"),

    ("以西结", "犹太教", "公元前6世纪", "异象先知",
     "巴比伦流亡中的先知，异象中见枯骨复生，预言圣殿重建",
     "枯骨啊，要听耶和华的话——我必使气息进入你们里面，你们就要活了",
     "Ezekiel prophet dry bones vision Babylon exile"),

    ("但以理", "犹太教", "公元前6世纪", "巴比伦的义人",
     "巴比伦宫廷中持守信仰的典范，解梦预言四大帝国，入狮子坑蒙救",
     "我的神差遣使者封住狮子的口，叫狮子不伤我",
     "Daniel prophet lions den Babylon dreams interpretation"),

    # ════ 拉比时代 ════
    ("希勒尔", "犹太教", "公元前110-公元10年", "温柔的拉比",
     "犹太教最重要拉比之一，创立温和释经传统(希勒尔学派)",
     "己所不欲勿施于人——这就是全部律法，其余都是注释",
     "Hillel Elder rabbi Golden Rule Torah Jewish sage"),

    ("拉比阿基巴", "犹太教", "约公元50-135年", "拉比中的拉比",
     "口传律法的核心编者之一，四十岁才开始学习却成为最伟大拉比",
     "爱人如己——这是律法中最大的原则",
     "Rabbi Akiva Akiba Torah scholar martyr Bar Kokhba"),

    ("犹大·哈纳西", "犹太教", "约公元135-217年", "拉比(Ha-Nasi)",
     "编纂密西拿(口传律法法典)，使口传律法免于失传，拉比犹太教奠基",
     "哪条路是正确的?能给选择者带来荣耀的，也能给世人带来荣耀的",
     "Judah ha-Nasi Mishnah compiler rabbi prince Sanhedrin"),

    # ════ 中世纪 ════
    ("迈蒙尼德(拉姆班)", "犹太教", "1138-1204年", "鹰·第二摩西",
     "犹太哲学最伟大思想家，著《迷途指津》调和信仰与理性，医学家",
     "给人鱼不如教人渔——慈善的最高层次是帮助人自立",
     "Maimonides Rambam Mishneh Torah Guide Perplexed Cordoba"),

    ("拉什(所罗门·伊兹哈基)", "犹太教", "1040-1105年", "经典注释之王",
     "圣经与塔木德最权威注释者，至今每个犹太学生都学他的注释",
     "圣经的简明含义——这就是我要解释的",
     "Rashi Solomon Itzhaki Torah Talmud commentary Troyes France"),

    ("纳赫曼尼德斯(兰班)", "犹太教", "1194-1270年", "吉罗纳的拉比",
     "圣经注释家与卡巴拉学者，1263年巴塞罗那辩论中为犹太教辩护",
     "信仰是隐藏在创造奇迹中——万物运行本身就是神迹",
     "Nahmanides Ramban Barcelona Disputation Kabbalah Girona"),

    # ════ 卡巴拉与哈西德 ════
    ("以撒·卢里亚(阿里)", "犹太教", "1534-1572年", "神圣之狮·阿里",
     "卢里亚卡巴拉创始人，提出宇宙收缩(齐姆楚姆)与光之碎片修复理论",
     "每个灵魂都有独特使命——修复属于自己的那部分世界",
     "Isaac Luria Ha-ARI Kabbalah Safed mysticism Tzimtzum"),

    ("巴尔·谢姆·托夫", "犹太教", "约1698-1760年", "善名的主人·贝什特",
     "哈西德运动创始人，强调喜乐祷告和日常生活中的神圣体验",
     "每个人所在的地方——那里就是通向天堂之路",
     "Baal Shem Tov Besht Hasidic founder joy prayer Ukraine"),

    ("纳赫曼·布拉茨拉夫", "犹太教", "1772-1810年", "故事拉比",
     "巴尔谢姆托夫曾孙，以寓言故事传道，强调信念与创造性祷告",
     "全世界是一座非常狭窄的桥——最重要的是完全不要害怕",
     "Rebbe Nachman Breslov stories faith narrow bridge Uman"),

    # ════ 近现代 ════
    ("西奥多·赫茨尔", "犹太教", "1860-1904年", "犹太国之父",
     "政治犹太复国主义创始人，著《犹太国》，推动建立以色列国",
     "如果你愿意，这就不是梦想",
     "Theodor Herzl Zionism Jewish State Basel Congress"),

    ("亚伯拉罕·约书亚·赫舍尔", "犹太教", "1907-1972年", "神圣的不安者",
     "犹太神学家，将哈西德灵性与社会正义结合，与马丁路德金并肩游行",
     "当我在塞尔玛游行时，我的双腿在祈祷",
     "Abraham Heschel rabbi theologian civil rights Selma march"),
]


# ── 犹太教祖训 (12) ─────────────────────────────────────

EXTRA_JUDAISM_TEACHINGS = [
    ("十诫", "犹太教", "摩西",
     "除我以外你不可有别的神；当孝敬父母；不可杀人；不可偷盗；不可作假见证",
     "十条根本律法奠定了人类道德与社会秩序的基石——神与人之间、人与人之间的根本规范"),

    ("Shema(以色列颂)", "犹太教", "摩西",
     "Shema Yisrael, Adonai Eloheinu, Adonai Echad——以色列啊你要听，耶和华我们的神是独一的主",
     "犹太信仰最核心的宣告——每日早晚诵念，是犹太人最后的遗言"),

    ("Tikkun Olam(修复世界)", "犹太教", "以撒·卢里亚",
     "世界在创造时就碎裂了——我们的使命是收集散落的神圣火花，修复世界",
     "每个人的每个善行都是在修复宇宙——人是上帝的合作者而非旁观者"),

    ("己所不欲(希勒尔金律)", "犹太教", "希勒尔",
     "己所不欲勿施于人——这就是全部律法的精髓，其余都是注释，去学吧",
     "一位外邦人请希勒尔在单脚站立时间教完全部律法——这就是回答"),

    ("正义正义你要追求", "犹太教", "摩西",
     "Tzedek, tzedek tirdof——正义，正义，你要追求",
     "重复两次正义是为了强调——不仅要追求结果的公正，过程也必须公正"),

    ("爱人如己", "犹太教", "摩西(利未记)",
     "V'ahavta l'reacha kamocha——你要爱邻舍如同自己",
     "拉比阿基巴称这是律法中最大的原则——爱的范围不限于同族人"),

    ("慈善八层", "犹太教", "迈蒙尼德",
     "慈善最高层次是帮助人自立——给他工作、借他钱做生意、与他合伙",
     "施舍有八个层次——最高不是给鱼，而是教人如何捕鱼，让他永远不需要施舍"),

    ("圣化日常", "犹太教", "犹太传统",
     "当你吃喝时感恩祝福，安息日停下工作，每个行为都可以圣化",
     "犹太教不是出世的宗教——通过祝福、安息、洁食等将日常生活变为神圣行为"),

    ("论学之道", "犹太教", "犹大·哈纳西",
     "不要看瓶子而要看里面的东西——新瓶可能装旧酒，旧瓶可能装新酒",
     "不要以貌取人——真正的智慧可能藏在最不起眼的容器中"),

    ("选择生命", "犹太教", "摩西(申命记)",
     "我将生死、祸福摆在你面前——所以你要选择生命，使你和你的后裔都得存活",
     "自由意志是上帝赐给人类的最大礼物——每个人都有权也有责任选择生命"),

    ("世代相传", "犹太教", "犹太传统",
     "V'shinantam l'vanecha——你要殷勤教训你的儿女",
     "信仰不是一代人的事——通过教育把智慧从父母传给孩子是最神圣的责任"),

    ("窄桥勇行", "犹太教", "纳赫曼·布拉茨拉夫",
     "Kol ha'olam kulo gesher tzar me'od, v'ha'ikar lo l'fached klal",
     "全世界是一座非常狭窄的桥——最重要的是完全不要害怕，勇敢走过去"),
]


# ══════════════════════════════════════════════════════
#  数据统计
# ══════════════════════════════════════════════════════
# 基督教: 15圣地 + 25祖庭 + 30祖师 + 12祖训 = 82条
# 伊斯兰教: 12圣地 + 20祖庭 + 22祖师 + 12祖训 = 66条
# 犹太教: 12圣地 + 15祖庭 + 22祖师 + 12祖训 = 61条
# 总计: 209条扩展数据
