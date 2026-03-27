"""
道教 & 儒家 — 大规模扩展数据库
Massively expanded data for Taoism (道教) and Confucianism (儒家)

导出:
  EXTRA_TAOISM_SITES, EXTRA_TAOISM_TEMPLES, EXTRA_TAOISM_PATRIARCHS, EXTRA_TAOISM_TEACHINGS
  EXTRA_CONFUCIANISM_SITES, EXTRA_CONFUCIANISM_TEMPLES, EXTRA_CONFUCIANISM_PATRIARCHS, EXTRA_CONFUCIANISM_TEACHINGS
"""

# ══════════════════════════════════════════════════════════════
#  道教 (Taoism) — 圣地 Holy Sites
# ══════════════════════════════════════════════════════════════
# (圣地名, 宗教, 国家, 音效类型, 搜索词English, 教义原文, 教义出处, 教义中文)

EXTRA_TAOISM_SITES = [
    # ── 四大道教名山 ──
    ("三清山", "道教", "中国", "wind_chimes",
     "Mount Sanqing Jiangxi Taoist sacred mountain",
     "一生二，二生三，三生万物",
     "《道德经》第四十二章",
     "道生万物，从一到无穷的化生过程"),

    ("齐云山", "道教", "中国", "bamboo_flute",
     "Mount Qiyun Anhui Taoist mountain China",
     "天下柔弱莫过于水，而攻坚强者莫之能胜",
     "《道德经》第七十八章",
     "天下没有比水更柔弱的，却没有什么能胜过它"),

    ("华山", "道教", "中国", "wind_chimes",
     "Mount Hua Shaanxi sacred Taoist peak China",
     "重为轻根，静为躁君",
     "《道德经》第二十六章",
     "稳重是轻浮的根本，宁静是躁动的主宰"),

    ("终南山", "道教", "中国", "bamboo_flute",
     "Mount Zhongnan Shaanxi hermit Taoist sacred",
     "见素抱朴，少私寡欲",
     "《道德经》第十九章",
     "保持纯朴本真，减少私心欲望"),

    # ── 洞天福地 ──
    ("王屋山", "道教", "中国", "guqin_pluck",
     "Mount Wangwu Henan Taoist cave heaven",
     "天下之至柔，驰骋天下之至坚",
     "《道德经》第四十三章",
     "天下最柔弱的东西，能穿行于最坚硬之中"),

    ("罗浮山", "道教", "中国", "bamboo_flute",
     "Mount Luofu Guangdong Taoist grotto heaven",
     "我命在我不在天，还丹成金亿万年",
     "《抱朴子·内篇》",
     "性命由自己做主，修炼得道则可长生"),

    ("老君山", "道教", "中国", "wind_chimes",
     "Mount Laojun Henan Luoyang Taoist Laozi",
     "大方无隅，大器晚成，大音希声，大象无形",
     "《道德经》第四十一章",
     "最大的方没有棱角，大才晚成，最大的声音听不到"),

    ("泰山", "道教", "中国", "guqin_pluck",
     "Mount Tai Shandong sacred Taoist Confucian",
     "有物混成，先天地生。寂兮寥兮，独立不改",
     "《道德经》第二十五章",
     "有一个混沌之物先于天地而生，寂静无声，独立永恒"),

    ("衡山", "道教", "中国", "bamboo_flute",
     "Mount Heng Hunan sacred Taoist Nanyue",
     "曲则全，枉则直，洼则盈",
     "《道德经》第二十二章",
     "弯曲才能保全，屈枉才能伸直，低洼才能充盈"),

    ("嵩山", "道教", "中国", "wind_chimes",
     "Mount Song Henan Shaolin Taoist sacred peak",
     "飘风不终朝，骤雨不终日",
     "《道德经》第二十三章",
     "狂风刮不了一早晨，暴雨下不了一整天"),

    # ── 海外道教圣地 ──
    ("蓬莱阁", "道教", "中国", "wind_chimes",
     "Penglai Pavilion Shandong immortal island Taoism",
     "至人无己，神人无功，圣人无名",
     "《庄子·逍遥游》",
     "最高境界之人忘掉自我，不居功，不求名"),

    ("紫金山", "道教", "中国", "bamboo_flute",
     "Purple Mountain Nanjing Taoist temple",
     "为学日益，为道日损。损之又损，以至于无为",
     "《道德经》第四十八章",
     "做学问日渐增加，修道则日渐减少，减之又减直至无为"),

    ("函谷关", "道教", "中国", "guqin_pluck",
     "Hangu Pass Henan Laozi Tao Te Ching origin",
     "天地不仁，以万物为刍狗；圣人不仁，以百姓为刍狗",
     "《道德经》第五章",
     "天地没有偏爱，对万物一视同仁；圣人没有偏私，对百姓一视同仁"),

    ("鼎湖山", "道教", "中国", "bamboo_flute",
     "Mount Dinghu Guangdong Taoist Buddhism sacred",
     "归根曰静，静曰复命，复命曰常",
     "《道德经》第十六章",
     "返回根本叫做静，静叫做回归本性，回归本性才是永恒"),

    ("太姥山", "道教", "中国", "wind_chimes",
     "Mount Taimu Fujian Taoist sacred hermit",
     "祸兮福之所倚，福兮祸之所伏",
     "《道德经》第五十八章",
     "灾祸中隐含着幸福，幸福中潜伏着灾祸"),

    ("千山", "道教", "中国", "bamboo_flute",
     "Mount Qian Liaoning Taoist Buddhist sacred",
     "知人者智，自知者明；胜人者有力，自胜者强",
     "《道德经》第三十三章",
     "了解别人是聪明，了解自己才是明智；战胜别人是有力，战胜自己才是真强"),
]


# ══════════════════════════════════════════════════════════════
#  道教 (Taoism) — 祖庭 Temples
# ══════════════════════════════════════════════════════════════
# (祖庭名, 宗教, 国家, 创建年代, 历史意义, 搜索词English)

EXTRA_TAOISM_TEMPLES = [
    # ── 正一道系统 ──
    ("龙虎山天师府", "道教", "中国", "东汉",
     "正一道祖庭，历代天师世居之地，道教第一府",
     "Longhu Mountain Celestial Master Mansion Jiangxi"),

    ("鹤鸣山天师洞", "道教", "中国", "东汉142年",
     "张道陵创立天师道之地，道教第一座治所",
     "Heming Mountain Taoist origin Sichuan"),

    ("青城山天师洞", "道教", "中国", "东汉",
     "张道陵在此修道传教，天师道重要道场",
     "Qingcheng Mountain Taoist cave Sichuan Chengdu"),

    ("正一观", "道教", "中国", "东汉",
     "龙虎山正一祖庭核心建筑，天师道传承之所",
     "Zhengyi Temple Longhu Mountain Taoism"),

    # ── 全真道系统 ──
    ("重阳宫", "道教", "中国", "1167年",
     "全真道创始人王重阳修道成仙之地，全真祖庭",
     "Chongyang Palace Quanzhen Taoism Shaanxi Huxian"),

    ("北京白云观", "道教", "中国", "唐开元29年(741)",
     "全真龙门派祖庭，丘处机弟子赵道坚所建，明清扩建",
     "White Cloud Temple Beijing Quanzhen Longmen"),

    ("烟霞洞", "道教", "中国", "1167年",
     "王重阳在此创全真道，度化全真七子之地",
     "Yanxia Cave Quanzhen Taoism origin Shaanxi"),

    ("长春观", "道教", "中国", "元代",
     "纪念丘处机(长春子)的全真道观，湖北武汉道教名胜",
     "Changchun Temple Wuhan Qiu Chuji Taoism"),

    ("太清宫", "道教", "中国", "西汉",
     "传说老子诞生之地，历代帝王拜谒的道教圣地",
     "Taiqing Palace Bozhou Anhui Laozi birthplace"),

    ("崂山太清宫", "道教", "中国", "西汉建元元年(前140)",
     "中国沿海最大道观，道教全真龙门派重要道场",
     "Laoshan Taiqing Palace Qingdao Shandong Taoism"),

    # ── 上清派 / 茅山系统 ──
    ("茅山元符万宁宫", "道教", "中国", "南朝梁",
     "上清派祖庭，陶弘景修道之地，茅山道教核心宫观",
     "Maoshan Yuanfu Wanning Palace Jiangsu Taoism"),

    ("华阳洞", "道教", "中国", "南朝",
     "陶弘景隐修著述之所，茅山第八洞天",
     "Huayang Cave Maoshan Tao Hongjing Jiangsu"),

    # ── 灵宝派 ──
    ("阁皂山", "道教", "中国", "东汉",
     "灵宝派祖庭，葛玄葛洪炼丹之地，与龙虎山茅山并称三大符箓派",
     "Gezao Mountain Lingbao Taoism Jiangxi"),

    # ── 武当山系统 ──
    ("武当山紫霄宫", "道教", "中国", "北宋宣和年间(1119-1125)",
     "武当山最大宫观，明代张三丰修炼太极之地",
     "Wudang Purple Cloud Palace Hubei Taoism"),

    ("武当山金殿", "道教", "中国", "明永乐14年(1416)",
     "武当山最高处铜铸鎏金殿，供奉真武大帝",
     "Wudang Golden Hall summit Hubei copper"),

    ("武当山南岩宫", "道教", "中国", "元代",
     "悬崖绝壁上的道观，武当山三十六岩中最美",
     "Wudang Nanyan Palace cliff temple Hubei"),

    ("遇真宫", "道教", "中国", "明永乐10年(1412)",
     "明成祖敕建纪念张三丰，武当山重要宫观",
     "Wudang Yuzhen Palace Zhang Sanfeng memorial"),

    # ── 其他重要道观 ──
    ("楼观台", "道教", "中国", "周朝",
     "尹喜迎接老子之地，老子在此著《道德经》，道教最早宫观",
     "Louguantai Laozi Tao Te Ching Shaanxi"),

    ("泰山岱庙", "道教", "中国", "汉代",
     "历代帝王封禅之地，供奉东岳大帝",
     "Dai Temple Mount Tai Shandong imperial sacrifice"),

    ("华山玉泉院", "道教", "中国", "北宋",
     "陈抟老祖隐修之地，道教华山派祖庭",
     "Yuquan Temple Mount Hua Shaanxi Chen Tuan"),

    ("罗浮山冲虚观", "道教", "中国", "东晋(327年)",
     "葛洪在此炼丹著《抱朴子》，岭南道教祖庭",
     "Chongxu Temple Mount Luofu Ge Hong Guangdong"),

    ("成都青羊宫", "道教", "中国", "周朝",
     "传说老子在此讲授道德经，成都最古老道观",
     "Qingyang Palace Chengdu Sichuan Laozi Taoism"),

    ("王屋山阳台宫", "道教", "中国", "唐代",
     "道教第一洞天，司马承祯修道之地",
     "Yangtai Palace Wangwu Mountain Henan first cave heaven"),

    ("玄妙观", "道教", "中国", "西晋(276年)",
     "苏州最古老道观，供奉三清，历史逾1700年",
     "Xuanmiao Temple Suzhou Jiangsu oldest Taoist"),

    ("三清山三清宫", "道教", "中国", "东晋(364年)",
     "供奉玉清元始天尊等三清，江南第一仙峰道场",
     "Sanqing Palace Mount Sanqing Jiangxi Taoism"),

    ("紫金庵", "道教", "中国", "唐代",
     "紫金山道教名观，东南道教文化重镇",
     "Zijin Temple Purple Mountain Nanjing Taoism"),

    ("大上清宫", "道教", "中国", "东汉",
     "龙虎山最大宫观，正一道核心道场，规模宏大",
     "Grand Shangqing Palace Longhu Mountain Jiangxi"),

    ("函谷关道德经碑", "道教", "中国", "春秋",
     "老子西出函谷关著道德经之地，设有老子圣像",
     "Hangu Pass Tao Te Ching stele Henan Laozi"),

    ("抱朴道院", "道教", "中国", "东晋",
     "杭州葛岭上的道观，纪念葛洪在此炼丹",
     "Baopu Daoyuan Hangzhou Ge Hong alchemy"),

    ("通明殿", "道教", "中国", "元代",
     "齐云山核心建筑，供奉真武大帝",
     "Tongming Hall Mount Qiyun Anhui Taoism"),
]


# ══════════════════════════════════════════════════════════════
#  道教 (Taoism) — 祖师 Patriarchs
# ══════════════════════════════════════════════════════════════
# (祖师名, 宗教, 时代, 尊号, 核心贡献, 名言, 搜索词English)

EXTRA_TAOISM_PATRIARCHS = [
    # ── 道家始祖 ──
    ("庄子", "道教", "约前369-前286年", "南华真人",
     "著《庄子》(南华经)，发展道家哲学为逍遥自在之学",
     "天地与我并生，万物与我为一",
     "Zhuangzi Chuang Tzu Taoist philosopher butterfly"),

    ("列子", "道教", "约前450-前375年", "冲虚真人",
     "著《列子》(冲虚经)，阐发道家虚无自然之旨",
     "天地无全功，圣人无全能，万物无全用",
     "Liezi Lieh Tzu Taoist philosopher wind riding"),

    ("关尹子", "道教", "春秋", "尹喜·文始真人",
     "函谷关令尹喜迎老子，请著道德经，被尊为文始派祖师",
     "勿以我心揆彼，当以彼心揆彼",
     "Yin Xi Guanyin Taoist gate keeper Hangu Pass"),

    # ── 天师道 ──
    ("张衡", "道教", "?-179年", "嗣师·第二代天师",
     "继承张道陵天师之位，传播天师道教义",
     "以忠孝诚信为本，助国佑民",
     "Zhang Heng second Celestial Master Taoism"),

    ("张鲁", "道教", "?-216年", "系师·第三代天师",
     "建立政教合一的汉中政权，实行'义舍'制度惠及百姓",
     "置义舍于路旁，行人取食随意",
     "Zhang Lu third Celestial Master Hanzhong theocracy"),

    ("寇谦之", "道教", "365-448年", "天师·国师",
     "改革北天师道，清整道教戒律，使道教成为北魏国教",
     "除去伪法，专以礼度为首",
     "Kou Qianzhi Northern Celestial Master reform"),

    ("张继先", "道教", "1092-1127年", "虚靖天师·第三十代天师",
     "正一道中兴名师，神宵雷法大成者，徽宗赐号'虚靖先生'",
     "心如明镜，万象毕照而不留",
     "Zhang Jixian 30th Celestial Master Zhengyi"),

    ("张宇初", "道教", "1361-1410年", "第四十三代天师",
     "著《道门十规》系统整顿道教规制，被誉为道教改革家",
     "道门规范，上以承先圣之遗范，下以为后世之程式",
     "Zhang Yuchu 43rd Celestial Master Dao rules"),

    # ── 上清派 ──
    ("魏华存", "道教", "252-334年", "紫虚元君·南岳魏夫人",
     "上清派开创祖师，传《黄庭经》《大洞真经》",
     "存思守一，精神内守，病安从来",
     "Wei Huacun Lady Wei Shangqing Taoism founder"),

    ("陶弘景", "道教", "456-536年", "山中宰相·华阳隐居",
     "整理道经编纂《真诰》，开创茅山宗，精通医药本草",
     "山中何所有？岭上多白云。只可自怡悦，不堪持赠君",
     "Tao Hongjing Maoshan Taoism pharmacologist"),

    # ── 灵宝派 / 道教炼丹 ──
    ("葛洪", "道教", "284-364年", "抱朴子·葛仙翁",
     "著《抱朴子》系统论述道教炼丹与修仙理论",
     "不学而求知，犹愿鱼而无网焉",
     "Ge Hong Baopuzi alchemy Taoist master"),

    ("葛巢甫", "道教", "约4世纪末", "灵宝祖师",
     "整理灵宝经典，正式创立灵宝派",
     "斋戒诵经，功德无量",
     "Ge Chaofu Lingbao Taoism scripture compiler"),

    ("葛玄", "道教", "164-244年", "太极仙翁·葛仙公",
     "传灵宝经法，为灵宝派远祖，后世称葛仙公",
     "内修金丹，外行符箓，济世利人",
     "Ge Xuan Lingbao ancestor immortal Taoism"),

    # ── 全真道 ──
    ("丘处机", "道教", "1148-1227年", "长春真人·全真龙门派祖师",
     "远赴西域面见成吉思汗进言止杀，创全真龙门派",
     "处机一言止杀，济人利物",
     "Qiu Chuji Changchun Genghis Khan Quanzhen Longmen"),

    ("马钰", "道教", "1123-1183年", "丹阳真人·全真遇仙派祖师",
     "全真七子之首，王重阳首座弟子，创遇仙派",
     "修行在于澄心遣欲，不在于形骸之苦",
     "Ma Yu Danyang Quanzhen Seven Masters first"),

    ("谭处端", "道教", "1123-1185年", "长真真人·全真南无派祖师",
     "全真七子之一，善书法，创南无派",
     "心如止水，身若浮云",
     "Tan Chuduan Changzhen Quanzhen Nanwu"),

    ("刘处玄", "道教", "1147-1203年", "长生真人·全真随山派祖师",
     "全真七子之一，创随山派，著《仙乐集》",
     "清净自守，安分随缘",
     "Liu Chuxuan Changsheng Quanzhen Suishan"),

    ("王处一", "道教", "1142-1217年", "玉阳真人·全真嵛山派祖师",
     "全真七子之一，修道嵛山九年，创嵛山派",
     "道在方寸之间，不假外求",
     "Wang Chuyi Yuyang Quanzhen Yushan mountain"),

    ("郝大通", "道教", "1140-1212年", "广宁真人·全真华山派祖师",
     "全真七子之一，精通易学，创华山派",
     "一阳来复，万象更新",
     "Hao Datong Guangning Quanzhen Huashan Yijing"),

    ("孙不二", "道教", "1119-1182年", "清静散人·全真清静派祖师",
     "全真七子唯一女性，创清静派，著《孙不二元君法语》",
     "修道无男女之分，要在心性",
     "Sun Bu'er Qingjing only woman Quanzhen Seven"),

    # ── 武当派 / 内丹 ──
    ("张三丰", "道教", "约1247-?", "通微显化真人·武当祖师",
     "创武当太极拳，融内丹修炼与武术，被尊为武当派开山祖师",
     "太极者，无极而生，阴阳之母也",
     "Zhang Sanfeng Wudang Tai Chi founder immortal"),

    # ── 钟吕金丹派 ──
    ("钟离权", "道教", "约2世纪(传说)", "正阳真人·汉钟离",
     "内丹道祖师，传吕洞宾丹法，八仙之一",
     "大道无形，生育天地；大道无情，运行日月",
     "Zhongli Quan Han Zhongli Eight Immortals alchemy"),

    ("吕洞宾", "道教", "约798-?", "纯阳真人·吕祖",
     "道教全真五祖之一，八仙之一，传播内丹之学",
     "一粒金丹吞入腹，始知我命不由天",
     "Lu Dongbin Chunyang Eight Immortals sword"),

    ("刘海蟾", "道教", "约10世纪", "海蟾真人",
     "道教全真五祖之一，传南宗丹法，善接引度化",
     "悟道修真，超凡入圣",
     "Liu Haichan toad immortal Quanzhen five patriarchs"),

    # ── 其他重要道士 ──
    ("陈抟", "道教", "871-989年", "希夷先生·陈抟老祖",
     "著太极图说，精通易学与睡功，被誉为道教'睡仙'",
     "开张天岸马，奇逸人中龙",
     "Chen Tuan Xiyi sleeping immortal Mount Hua"),

    ("司马承祯", "道教", "647-735年", "白云子·贞一先生",
     "上清派第十二代宗师，著《坐忘论》《天隐子》，唐代道教领袖",
     "静则生明，明则通神",
     "Sima Chengzhen Shangqing Tang dynasty Taoism"),

    ("成玄英", "道教", "约601-690年", "西华法师",
     "唐代重玄学代表，注疏《庄子》《道德经》，道教哲学大成者",
     "有无双遣，空有不住",
     "Cheng Xuanying Chongxuan Taoism Tang philosopher"),

    ("杜光庭", "道教", "850-933年", "广成先生",
     "五代道教大师，著《道德真经广圣义》，编撰大量道教典籍",
     "道无所不在，德无所不容",
     "Du Guangting Tang Five Dynasties Taoism scholar"),

    ("白玉蟾", "道教", "1194-1229年", "紫清真人·海琼子",
     "道教南宗五祖之一，创立内丹南宗清修派，善诗文书画",
     "自从踏破烟霞路，始信天台石桥危",
     "Bai Yuchan Southern Neidan Taoism poet"),

    ("张伯端", "道教", "987-1082年", "紫阳真人",
     "著《悟真篇》为道教内丹南宗开山之作",
     "不识本来真面目，只缘身在此山中",
     "Zhang Boduan Wuzhen Pian Southern Neidan"),

    ("魏伯阳", "道教", "约100-170年", "云牙子",
     "著《周易参同契》，被誉为'万古丹经王'，丹道理论奠基人",
     "性命双修，形神俱妙",
     "Wei Boyang Cantong Qi alchemy classic Taoism"),

    ("孙思邈", "道教", "581-682年", "药王·孙真人",
     "著《千金方》，融道教养生与医学实践，被尊为药王",
     "人命至重，有贵千金，一方济之，德逾于此",
     "Sun Simiao medicine king Taoist physician Tang"),

    ("黄大仙", "道教", "约328-?", "赤松仙子·黄初平",
     "东晋道士，以叱石成羊著称，香港黄大仙庙享祀至今",
     "赤松子者，神农时雨师也",
     "Wong Tai Sin Huang Chuping Taoist immortal HK"),

    ("陆修静", "道教", "406-477年", "简寂先生",
     "改革道教斋醮仪式，首次分类整理道教经典为三洞体系",
     "斋直达性，醮以通神",
     "Lu Xiujing Taoist ritual reform Three Caverns"),

    ("张角", "道教", "?-184年", "天公将军·太平道首领",
     "创太平道，发动黄巾起义，以符水治病传教",
     "苍天已死，黄天当立，岁在甲子，天下大吉",
     "Zhang Jue Yellow Turban Rebellion Taiping Taoism"),

    ("林灵素", "道教", "1076-1120年", "通真达灵先生",
     "北宋末道士，助宋徽宗推行道教，影响两宋道教发展",
     "以神道设教，化导天下",
     "Lin Lingsu Song dynasty Taoism imperial advisor"),

    ("许逊", "道教", "239-374年", "许真君·旌阳祖师",
     "净明道祖师，传说举家飞升，斩蛟除害惠及江西百姓",
     "忠孝净明，四者毕备",
     "Xu Xun Jingming Taoism Jiangxi immortal ascension"),

    ("萨守坚", "道教", "宋代", "萨真人·西河萨祖",
     "道教雷法大师，与天师道系统并列的神霄派重要传人",
     "雷霆号令，行善去恶",
     "Sa Shoujian thunder ritual Shenxiao Taoism Song"),

    ("张道禄", "道教", "约10世纪", "第四代天师传人",
     "天师道延续发展的关键人物，维护正一道法统",
     "正一之道，以正治邪",
     "Zhang Daolu Celestial Master lineage Taoism"),

    ("彭祖", "道教", "传说上古", "彭祖·长寿之祖",
     "传说活八百岁，道教养生长寿的象征，导引术先驱",
     "导引行气，吐故纳新",
     "Peng Zu longevity ancestor Taoist health practice"),

    ("陈景元", "道教", "1025-1094年", "碧虚子",
     "北宋道教学者，注释《道德经》《庄子》，提倡道教回归老庄",
     "道不远人，人自远之",
     "Chen Jingyuan Song dynasty Taoist scholar Laozi"),

    ("李道纯", "道教", "1219-1296年", "清庵·莹蟾子",
     "元代道教理论家，提出中和思想融合南北丹法",
     "守中致和，性命双修",
     "Li Daochun Yuan Taoism Neidan middle harmony"),

    ("闵一得", "道教", "1758-1836年", "懒云子",
     "清代全真龙门第十一代律师，著《古书隐楼藏书》保存大量丹道文献",
     "参同悟真，不出此道",
     "Min Yide Qing Longmen Taoism literature preservation"),
]


# ══════════════════════════════════════════════════════════════
#  道教 (Taoism) — 祖训 Teachings
# ══════════════════════════════════════════════════════════════
# (祖训名, 宗教, 出自祖师, 训诫原文, 白话解读)

EXTRA_TAOISM_TEACHINGS = [
    ("无为而治", "道教", "老子",
     "无为而无不为。取天下常以无事，及其有事，不足以取天下",
     "不妄为就没有做不成的事。治理天下要顺其自然，若强行干预反而会失败"),

    ("知足常乐", "道教", "老子",
     "知足不辱，知止不殆，可以长久",
     "知道满足就不会受辱，知道适可而止就不会有危险，这样才能长久"),

    ("柔弱胜刚强", "道教", "老子",
     "天下莫柔弱于水，而攻坚强者莫之能胜，以其无以易之",
     "水是天下最柔弱的，却能攻破最坚硬之物，因为没有什么能改变它的本性"),

    ("齐物论", "道教", "庄子",
     "天地一指也，万物一马也",
     "从道的角度看，天地万物本质上是同一的，没有高低贵贱之分"),

    ("逍遥游", "道教", "庄子",
     "若夫乘天地之正，而御六气之辩，以游无穷者，彼且恶乎待哉",
     "如果能顺应天地自然之理，驾驭阴阳变化，遨游于无穷之中，还需要依赖什么呢"),

    ("养生主", "道教", "庄子",
     "吾生也有涯，而知也无涯。以有涯随无涯，殆已",
     "生命是有限的，而知识是无穷的。用有限的生命追逐无穷的知识，是危险的"),

    ("坐忘心斋", "道教", "庄子",
     "堕肢体，黜聪明，离形去知，同于大通，此谓坐忘",
     "忘掉形体和智巧，超越感官与思维的束缚，与大道融为一体，这就是坐忘"),

    ("抱朴归真", "道教", "葛洪",
     "抱朴子曰：仙可学致，不死可得",
     "修仙是可以通过学习达到的，长生不死是可以实现的——关键在于修炼"),

    ("内丹心法", "道教", "张伯端",
     "学仙须是学天仙，惟有金丹最的端",
     "修仙就要修最高的天仙，只有金丹大道才是最正确的途径"),

    ("三教合一", "道教", "王重阳",
     "心中端正莫生邪，三教搜来做一家",
     "保持内心端正不生邪念，三教精华融会贯通归为一体"),

    ("一言止杀", "道教", "丘处机",
     "天道好生，愿陛下戒杀。恤民保众，使天下免涂炭",
     "天道爱护生命，希望皇帝戒杀。爱护百姓保全众生，让天下免于战火之苦"),

    ("阴符奥义", "道教", "传说黄帝",
     "天性人也，人心机也。立天之道以定人也",
     "天赋予人本性，人心产生机巧。确立天道是为了安定人心"),

    ("清静经要", "道教", "老君(传说)",
     "人能常清静，天地悉皆归",
     "人如果能常保清净宁静之心，天地万物的奥秘都会向你展现"),

    ("太平之道", "道教", "张角(太平道)",
     "致太平之道，以善为本",
     "达到天下太平的方法，以善良作为根本"),

    ("雷法正一", "道教", "张继先",
     "心合于道，道合于天，天人合一，号令雷霆",
     "心与道合一，道与天合一，达到天人合一之境，才能号令雷霆之力"),

    ("净明忠孝", "道教", "许逊",
     "忠孝净明，四字括尽千经万论",
     "忠、孝、净、明四个字就概括了所有经论的精华"),

    ("性命双修", "道教", "白玉蟾",
     "性者神也，命者气也。性命双修，形神俱妙",
     "性是精神，命是气息。修道要性命双修，使形体和精神都达到妙境"),

    ("参同契旨", "道教", "魏伯阳",
     "大易情性，各如其度。黄老用究，较而可御",
     "易道讲性情各循其度，黄老之道深究后可驾驭——丹道与易道本为一理"),
]


# ══════════════════════════════════════════════════════════════
#  儒家 (Confucianism) — 圣地 Holy Sites
# ══════════════════════════════════════════════════════════════
# (圣地名, 宗教, 国家, 音效类型, 搜索词English, 教义原文, 教义出处, 教义中文)

EXTRA_CONFUCIANISM_SITES = [
    ("尼山", "儒家", "中国", "jade_chime",
     "Nishan birthplace Confucius Qufu Shandong",
     "学而时习之，不亦说乎",
     "《论语·学而》",
     "学了之后经常温习践行，不是很快乐吗"),

    ("泰山", "儒家", "中国", "jade_chime",
     "Mount Tai Shandong Confucius sacred mountain",
     "登泰山而小天下",
     "《孟子·尽心上》",
     "登上泰山就觉得天下都变小了——境界越高视野越广"),

    ("杏坛", "儒家", "中国", "guqin_pluck",
     "Xingtan Apricot Altar Confucius teaching Qufu",
     "有教无类",
     "《论语·卫灵公》",
     "教育不分贵贱贫富，人人都有受教育的权利"),

    ("洙泗之滨", "儒家", "中国", "guqin_pluck",
     "Zhu Si River Qufu Confucius study lecture",
     "逝者如斯夫，不舍昼夜",
     "《论语·子罕》",
     "时光如流水一般，日夜不停地流逝"),

    ("邹城", "儒家", "中国", "jade_chime",
     "Zoucheng Mencius hometown Shandong Confucian",
     "民为贵，社稷次之，君为轻",
     "《孟子·尽心下》",
     "百姓最重要，国家次之，君主最轻——人民至上"),

    ("南京夫子庙", "儒家", "中国", "guqin_pluck",
     "Nanjing Confucius Temple Fuzimiao Qinhuai",
     "温故而知新，可以为师矣",
     "《论语·为政》",
     "温习旧知识而领悟新道理，这样就可以当老师了"),

    ("北京国子监", "儒家", "中国", "jade_chime",
     "Beijing Imperial Academy Guozijian Confucius",
     "大学之道，在明明德，在亲民，在止于至善",
     "《大学》",
     "大学的宗旨在于彰明美德，在于亲近百姓，在于达到至善"),

    ("台北孔庙", "儒家", "中国", "jade_chime",
     "Taipei Confucius Temple Taiwan ceremony",
     "三人行，必有我师焉",
     "《论语·述而》",
     "三人同行，其中必有值得我学习的人"),

    ("韩国成均馆", "儒家", "韩国", "guqin_pluck",
     "Seonggyungwan Seoul Korea Confucian academy",
     "不患人之不己知，患不知人也",
     "《论语·学而》",
     "不怕别人不了解自己，只怕自己不了解别人"),

    ("越南文庙", "儒家", "越南", "jade_chime",
     "Temple of Literature Hanoi Vietnam Confucius",
     "知之者不如好之者，好之者不如乐之者",
     "《论语·雍也》",
     "知道不如喜好，喜好不如以之为乐"),

    ("足利学校", "儒家", "日本", "guqin_pluck",
     "Ashikaga School Japan oldest Confucian academy",
     "学而不思则罔，思而不学则殆",
     "《论语·为政》",
     "只学习不思考就会迷惑，只思考不学习就会陷入空想"),

    ("长崎孔子庙", "儒家", "日本", "jade_chime",
     "Nagasaki Confucius Shrine Japan Chinese temple",
     "见贤思齐焉，见不贤而内自省也",
     "《论语·里仁》",
     "看到贤人就要想着向他看齐，看到不好的就要反省自己"),

    ("多久孔子庙", "儒家", "日本", "guqin_pluck",
     "Taku Confucius Temple Saga Japan Edo period",
     "德不孤，必有邻",
     "《论语·里仁》",
     "有道德的人不会孤单，一定会有志同道合的伙伴"),
]


# ══════════════════════════════════════════════════════════════
#  儒家 (Confucianism) — 祖庭 Temples
# ══════════════════════════════════════════════════════════════
# (祖庭名, 宗教, 国家, 创建年代, 历史意义, 搜索词English)

EXTRA_CONFUCIANISM_TEMPLES = [
    # ── 三孔 ──
    ("曲阜孔庙", "儒家", "中国", "公元前478年",
     "孔子逝世次年鲁哀公改故宅为庙，中国最大的孔庙，儒学第一圣地",
     "Qufu Confucius Temple Kong Miao Shandong"),

    ("孔林", "儒家", "中国", "公元前479年",
     "孔子及其后裔的家族墓地，世界上延续时间最长的家族墓地",
     "Kong Lin Cemetery of Confucius Qufu family"),

    ("孔府", "儒家", "中国", "宋代",
     "孔子嫡系后裔衍圣公世袭官邸，中国现存最大贵族府第",
     "Kong Fu Confucius Family Mansion Qufu Shandong"),

    # ── 孟庙孟府 ──
    ("邹城孟庙", "儒家", "中国", "北宋1037年",
     "祭祀亚圣孟子的庙宇，又称亚圣庙",
     "Mencius Temple Zoucheng Shandong Yasheng"),

    ("孟府", "儒家", "中国", "北宋",
     "孟子嫡系后裔世袭翰林博士官邸",
     "Mencius Family Mansion Zoucheng Shandong"),

    # ── 四大书院 ──
    ("岳麓书院", "儒家", "中国", "北宋开宝9年(976)",
     "四大书院之首，朱熹张栻在此会讲，千年学府至今办学",
     "Yuelu Academy Changsha Hunan oldest university"),

    ("白鹿洞书院", "儒家", "中国", "南唐升元4年(940)",
     "朱熹亲定学规《白鹿洞书院揭示》，成为后世书院教育的范本",
     "White Deer Grotto Academy Jiujiang Zhu Xi"),

    ("嵩阳书院", "儒家", "中国", "北魏太和8年(484)",
     "程颢程颐在此讲学，理学(洛学)重要发源地",
     "Songyang Academy Dengfeng Henan Cheng brothers"),

    ("应天书院", "儒家", "中国", "北宋大中祥符2年(1009)",
     "范仲淹在此执教兴学，培养大批人才",
     "Yingtian Academy Shangqiu Henan Fan Zhongyan"),

    # ── 各地重要孔庙/文庙 ──
    ("北京孔庙", "儒家", "中国", "元大德6年(1302)",
     "元明清三代国家最高学府国子监旁的祭孔庙宇",
     "Beijing Confucius Temple Imperial Academy Yuan"),

    ("南京夫子庙", "儒家", "中国", "东晋咸康3年(337)",
     "中国最大的传统古街市，秦淮河畔的儒学文化中心",
     "Nanjing Fuzimiao Confucius Temple Qinhuai River"),

    ("台南孔庙", "儒家", "中国", "明永历19年(1665)",
     "台湾第一座孔庙，被称为'全台首学'",
     "Tainan Confucius Temple Taiwan first academy"),

    ("韩国成均馆", "儒家", "韩国", "高丽1398年",
     "朝鲜王朝最高学府，至今举行释奠大祭",
     "Seonggyungwan University Seoul Confucian Korea"),

    ("越南文庙国子监", "儒家", "越南", "1070年",
     "河内文庙，越南第一所大学，供奉孔子及儒学先贤",
     "Temple of Literature Hanoi Vietnam 1070 Confucius"),

    ("日本汤岛圣堂", "儒家", "日本", "1690年",
     "德川幕府官方儒学学校，林罗山创建的儒学中心",
     "Yushima Seido Tokyo Japan Confucian shrine Edo"),

    ("长崎孔子庙", "儒家", "日本", "1893年",
     "日本唯一由华人建造的正统中国式孔庙",
     "Nagasaki Confucius Shrine Japan Chinese community"),

    # ── 理学/心学重要遗迹 ──
    ("稷下学宫遗址", "儒家", "中国", "战国(约前374年)",
     "齐国首都临淄的官办学术中心，百家争鸣的策源地",
     "Jixia Academy Linzi Shandong Warring States debate"),

    ("阳明洞", "儒家", "中国", "明正德3年(1508)",
     "王阳明龙场悟道之地，心学诞生的圣地",
     "Yangming Cave Xiuwen Guiyang Wang Yangming"),

    ("濂溪书堂", "儒家", "中国", "北宋",
     "周敦颐故居讲学之所，理学开山鼻祖修学之地",
     "Lianxi Academy Zhou Dunyi Neo-Confucianism origin"),

    ("鹅湖书院", "儒家", "中国", "南宋淳熙2年(1175)",
     "朱熹与陆九渊在此辩论理学与心学之分——著名的鹅湖之会",
     "Ehu Academy Shangrao Zhu Xi Lu Jiuyuan debate"),

    ("武夷精舍", "儒家", "中国", "南宋淳熙10年(1183)",
     "朱熹在武夷山创建的书院，在此完成《四书集注》",
     "Wuyi Academy Zhu Xi Four Books Fujian"),

    ("朱熹故里婺源", "儒家", "中国", "南宋",
     "朱熹祖籍地，保留朱氏宗祠与理学文化遗迹",
     "Wuyuan Zhu Xi ancestral home Jiangxi"),

    ("象山书院", "儒家", "中国", "南宋",
     "陆九渊(象山先生)讲学之地，心学重要发源地",
     "Xiangshan Academy Lu Jiuyuan mind philosophy"),
]


# ══════════════════════════════════════════════════════════════
#  儒家 (Confucianism) — 祖师 Patriarchs
# ══════════════════════════════════════════════════════════════
# (祖师名, 宗教, 时代, 尊号, 核心贡献, 名言, 搜索词English)

EXTRA_CONFUCIANISM_PATRIARCHS = [
    # ── 上古圣王 ──
    ("尧", "儒家", "传说上古", "帝尧·放勋",
     "儒家推崇的圣王典范，禅让帝位于舜，以仁德治天下",
     "允恭克让，光被四表",
     "Emperor Yao sage king Confucian abdication virtue"),

    ("舜", "儒家", "传说上古", "帝舜·重华",
     "以大孝闻名，受尧禅让，设官分职创制度",
     "舜其大孝也与！德为圣人，尊为天子",
     "Emperor Shun filial piety sage king Confucian"),

    ("大禹", "儒家", "传说上古", "夏禹·文命",
     "治水安民十三年三过家门不入，建立夏朝",
     "禹拜昌言，思日孜孜",
     "Yu the Great flood control Xia dynasty Confucian"),

    ("周公", "儒家", "约前1100年", "周公旦·元圣",
     "制礼作乐奠定周代礼制，儒家礼教思想的源头",
     "一沐三捉发，一饭三吐哺，犹恐失天下之贤",
     "Duke of Zhou ritual music Zhou dynasty Confucian"),

    # ── 先秦儒家 ──
    ("颜回", "儒家", "前521-前481年", "复圣·颜子",
     "孔子最得意弟子，以好学安贫乐道著称",
     "一箪食，一瓢饮，在陋巷，人不堪其忧，回也不改其乐",
     "Yan Hui Confucius best student poverty virtue"),

    ("曾子", "儒家", "前505-前435年", "宗圣·曾参",
     "孔子晚年弟子，传授《大学》《孝经》，以孝道闻名",
     "吾日三省吾身——为人谋而不忠乎？与朋友交而不信乎？传不习乎？",
     "Zengzi Zeng Shen Great Learning filial Confucian"),

    ("子思", "儒家", "前483-前402年", "述圣·孔伋",
     "孔子之孙，著《中庸》，传承儒学道统于孟子",
     "中也者，天下之大本也；和也者，天下之达道也",
     "Zisi Confucius grandson Doctrine of the Mean"),

    ("子路", "儒家", "前542-前480年", "仲由·季路",
     "孔子弟子中以勇著称，任卫国蒲邑大夫，以身殉义",
     "食其食者不避其难",
     "Zilu Zhong You Confucius student courage loyalty"),

    ("子贡", "儒家", "前520-前456年", "端木赐",
     "孔子弟子中善辩善商，出使诸国，被称为'瑚琏之器'",
     "君子之过也，如日月之食焉。过也，人皆见之；更也，人皆仰之",
     "Zigong Duanmu Ci Confucius diplomat merchant"),

    ("荀子", "儒家", "约前313-前238年", "荀卿·孙卿",
     "提出性恶论与礼法并重思想，培养韩非李斯等法家人才",
     "锲而舍之，朽木不折；锲而不舍，金石可镂",
     "Xunzi human nature evil ritual Confucian"),

    # ── 汉代 ──
    ("董仲舒", "儒家", "前179-前104年", "广川先生",
     "向汉武帝建议'罢黜百家，独尊儒术'，确立儒学正统地位",
     "正其义不谋其利，明其道不计其功",
     "Dong Zhongshu Han dynasty Confucianism state ideology"),

    ("郑玄", "儒家", "127-200年", "郑康成",
     "遍注群经，融合今古文经学，汉代经学集大成者",
     "凡学之道，严师为难。师严然后道尊",
     "Zheng Xuan Han dynasty Confucian classics scholar"),

    # ── 唐代 ──
    ("韩愈", "儒家", "768-824年", "韩文公·昌黎先生",
     "倡导古文运动，排斥佛老，重建儒学道统",
     "师者，所以传道授业解惑也",
     "Han Yu Tang dynasty Confucian revival prose master"),

    # ── 宋明理学 ──
    ("周敦颐", "儒家", "1017-1073年", "濂溪先生",
     "理学开山鼻祖，著《太极图说》《通书》，以莲花喻君子",
     "出淤泥而不染，濯清涟而不妖",
     "Zhou Dunyi Lianxi Neo-Confucianism Taiji lotus"),

    ("程颢", "儒家", "1032-1085年", "明道先生",
     "与弟程颐并称'二程'，创洛学，提出'天理'概念",
     "仁者以天地万物为一体，莫非己也",
     "Cheng Hao Mingdao Neo-Confucianism heavenly principle"),

    ("程颐", "儒家", "1033-1107年", "伊川先生",
     "与兄程颢并称'二程'，强调格物穷理，朱熹理学的直接渊源",
     "涵养须用敬，进学则在致知",
     "Cheng Yi Yichuan Neo-Confucianism investigation things"),

    ("张载", "儒家", "1020-1077年", "横渠先生",
     "关学创始人，著《正蒙》《西铭》，提出气本论",
     "为天地立心，为生民立命，为往圣继绝学，为万世开太平",
     "Zhang Zai Hengqu four sentences Neo-Confucianism"),

    ("陆九渊", "儒家", "1139-1193年", "象山先生",
     "心学创始人，主张'心即理'，与朱熹理学分庭抗礼",
     "宇宙便是吾心，吾心便是宇宙",
     "Lu Jiuyuan Xiangshan mind philosophy Confucian"),

    ("王阳明", "儒家", "1472-1529年", "阳明先生·王守仁",
     "心学集大成者，提出致良知、知行合一，龙场悟道",
     "知是行之始，行是知之成。知行合一",
     "Wang Yangming Confucian mind philosophy unity"),

    ("邵雍", "儒家", "1011-1077年", "康节先生",
     "北宋理学家，著《皇极经世》，创先天易学",
     "心安身自安，身安室自宽",
     "Shao Yong Kangjie Neo-Confucianism numerology Yijing"),

    ("朱熹", "儒家", "1130-1200年", "紫阳先生·晦庵",
     "理学集大成者，注释《四书》为科举标准读物",
     "问渠那得清如许，为有源头活水来",
     "Zhu Xi Ziyang Neo-Confucianism Four Books"),

    # ── 明代 ──
    ("王夫之", "儒家", "1619-1692年", "船山先生",
     "明末清初三大思想家之一，著《读通鉴论》批判专制",
     "六经责我开生面，七尺从天乞活埋",
     "Wang Fuzhi Chuanshan Ming-Qing Confucian thinker"),

    # ── 清代 ──
    ("黄宗羲", "儒家", "1610-1695年", "梨洲先生",
     "著《明夷待访录》批判君主专制，被誉为'中国的卢梭'",
     "天下为主，君为客",
     "Huang Zongxi Lizhou democracy Confucian thinker"),

    ("顾炎武", "儒家", "1613-1682年", "亭林先生",
     "倡'经世致用'实学，著《日知录》《天下郡国利病书》",
     "天下兴亡，匹夫有责",
     "Gu Yanwu Tinglin practical learning Confucian"),

    ("曾国藩", "儒家", "1811-1872年", "文正公·涤生",
     "晚清儒学实践者，以理学修身治军，被誉为'半个圣人'",
     "士人读书，第一要有志，第二要有识，第三要有恒",
     "Zeng Guofan Qing Confucian statesman self-cultivation"),

    # ── 补充先秦弟子 ──
    ("子夏", "儒家", "前507-?", "卜商·子夏",
     "孔子晚年弟子，善文学，开西河讲学之风，影响战国学术",
     "博学而笃志，切问而近思，仁在其中矣",
     "Zixia Bu Shang Confucius student Western River"),

    ("有若", "儒家", "前518-?", "有子",
     "孔子弟子，论语开篇'有子曰'传孝悌为仁之本",
     "孝弟也者，其为仁之本与",
     "You Ruo Youzi Confucius student filial piety"),

    ("宰予", "儒家", "前522-前458年", "宰我·子我",
     "孔子弟子，善言辞，曾与孔子辩论三年之丧",
     "朽木不可雕也",
     "Zai Yu Confucius student rhetoric debate"),

    ("冉雍", "儒家", "前522-?", "仲弓",
     "孔子弟子，以德行著称，孔子称其可以南面(当诸侯)",
     "出门如见大宾，使民如承大祭",
     "Ran Yong Zhonggong Confucius student virtue"),

    ("范仲淹", "儒家", "989-1052年", "文正公",
     "北宋名臣，推动庆历新政，兴办教育，以天下为己任",
     "先天下之忧而忧，后天下之乐而乐",
     "Fan Zhongyan Song Confucian statesman worry first"),
]


# ══════════════════════════════════════════════════════════════
#  儒家 (Confucianism) — 祖训 Teachings
# ══════════════════════════════════════════════════════════════
# (祖训名, 宗教, 出自祖师, 训诫原文, 白话解读)

EXTRA_CONFUCIANISM_TEACHINGS = [
    ("克己复礼", "儒家", "孔子",
     "克己复礼为仁。一日克己复礼，天下归仁焉",
     "克制自己的私欲回归礼义就是仁。一旦做到克己复礼，天下就会归于仁了"),

    ("中庸之道", "儒家", "子思",
     "喜怒哀乐之未发谓之中，发而皆中节谓之和。中也者，天下之大本也",
     "情感未发时的平和叫做中，表达得恰到好处叫做和。中是天下的根本"),

    ("浩然之气", "儒家", "孟子",
     "我善养吾浩然之气。其为气也，至大至刚，以直养而无害，则塞于天地之间",
     "我善于培养浩然正气。这种气极其浩大刚正，以正直培养不加损害，就能充塞天地间"),

    ("性善之论", "儒家", "孟子",
     "恻隐之心，仁之端也；羞恶之心，义之端也；辞让之心，礼之端也；是非之心，智之端也",
     "同情心是仁的开端，羞耻心是义的开端，谦让心是礼的开端，是非心是智的开端"),

    ("劝学篇", "儒家", "荀子",
     "学不可以已。青，取之于蓝而青于蓝；冰，水为之而寒于水",
     "学习不能停止。青色出于蓝色却比蓝更深，冰由水凝结却比水更冷——后来者可以超越前人"),

    ("大同理想", "儒家", "孔子(礼记)",
     "大道之行也，天下为公。选贤与能，讲信修睦",
     "大道实行的时代，天下是公共的。选拔贤能的人，讲求诚信修好睦邻"),

    ("修齐治平", "儒家", "曾子(大学)",
     "古之欲明明德于天下者，先治其国。欲治其国者，先齐其家。欲齐其家者，先修其身",
     "要在天下彰明美德，先治理好国家；要治好国家，先管好家庭；要管好家庭，先修养自身"),

    ("正心诚意", "儒家", "曾子(大学)",
     "欲正其心者，先诚其意。欲诚其意者，先致其知。致知在格物",
     "要端正内心先要诚实意念，要诚实意念先要获得知识，获得知识在于探究事物的道理"),

    ("春秋大义", "儒家", "董仲舒",
     "天之生民，非为王也；而天立王，以为民也。故其德足以安乐民者，天予之",
     "上天生养百姓不是为了君王，而立君王是为了百姓。德行足以安乐百姓的，上天就把天下给他"),

    ("师道尊严", "儒家", "韩愈",
     "古之学者必有师。师者，所以传道受业解惑也",
     "古时候的学者一定有老师。老师是用来传授道理、教授学业、解答疑惑的"),

    ("太极阴阳", "儒家", "周敦颐",
     "无极而太极。太极动而生阳，动极而静，静而生阴",
     "无极产生太极，太极运动产生阳，动到极点就静，静而产生阴——万物由此化生"),

    ("横渠四句", "儒家", "张载",
     "为天地立心，为生民立命，为往圣继绝学，为万世开太平",
     "为天地确立精神价值，为百姓安身立命，为前圣延续绝学，为万代开创太平"),

    ("格物穷理", "儒家", "程颐",
     "物皆有理，须是一一穷致其理",
     "万事万物都有其道理，必须一一深入探究到底"),

    ("致良知", "儒家", "王阳明",
     "尔那一点良知，是尔自家的准则。尔意念着处，他是便知是，非便知非",
     "你心中那一点良知就是你的准则。你的意念所到之处，对的它知道是对的，错的它知道是错的"),

    ("知行合一", "儒家", "王阳明",
     "知之真切笃实处即是行，行之明觉精察处即是知",
     "真切深入的知就是行，明白觉察的行就是知——知和行是一回事"),

    ("天下兴亡", "儒家", "顾炎武",
     "保天下者，匹夫之贱与有责焉耳矣",
     "保卫天下，即使是普通百姓也有责任——每个人都要承担社会责任"),

    ("经世致用", "儒家", "顾炎武",
     "文之不可绝于天地间者，曰明道也，纪政事也，察民隐也，乐道人之善也",
     "文章不可在世间断绝的原因是：它阐明道理、记录政事、关心民间疾苦、乐于称道别人的善行"),

    ("天下为主", "儒家", "黄宗羲",
     "古者以天下为主，君为客。凡君之所毕世而经营者，为天下也",
     "古时候天下是主人，君王是客人。君王一生所经营的一切，都是为了天下"),
]
