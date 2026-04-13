/**
 * seed-destinations-wiki-images.ts — 两用脚本
 *
 * 模式 A (本地 fetch): NODE_ENV=development 或传 --fetch 参数
 *   本地机器从 Wikipedia REST API 拉取每站点真实图片,写入 prisma/data/wiki-images.json
 *
 * 模式 B (生产 seed): 默认模式
 *   直接从 prisma/data/wiki-images.json 读取预拉结果,更新数据库
 *   生产服务器无法访问 en.wikipedia.org (GFW),必须走这条路径
 *
 * 工作流:
 *   1. 开发机(可访问维基):  npx tsx prisma/seed-destinations-wiki-images.ts --fetch
 *      → 生成 prisma/data/wiki-images.json
 *   2. git add prisma/data/wiki-images.json && push
 *   3. 部署后自动运行无参模式 → 从 JSON 填图
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const JSON_PATH = path.join(__dirname, 'data', 'wiki-images.json');
const FETCH_MODE = process.argv.includes('--fetch');

// 手工维护的 Wikipedia 标题别名 (针对 nameEn 无法直接匹配的站点)
const ALIASES: Record<string, string[]> = {
  '浙江宁波天童寺': ['Tiantong_Temple'],
  '海法空中花园': ['Bahá%27í_World_Centre', 'Shrine_of_the_Báb', 'Terraces_(Baháʼí)'],
  '温哥华罗斯街锡克庙': ['Ross_Street_Gurdwara_Sahib'],
  '湖南沩山密印寺': ['Miyin_Temple'],
  '特拉维夫大会堂': ['Great_Synagogue_of_Tel_Aviv'],
  '玻利维亚萨玛帕塔': ['El_Fuerte_de_Samaipata'],
  '瓦拉纳西恒河': ['Varanasi', 'Dashashwamedh_Ghat'],
  '甘南郎木寺': ['Langmu_Monastery', 'Langmusi'],
  '白马寺': ['White_Horse_Temple'],
  '直贡梯寺': ['Drigung_Monastery'],
  '石清水八幡宫': ['Iwashimizu_Shrine'],
  '石鼓书院': ['Shigu_Academy'],
  '福建福州鼓山涌泉寺': ['Yongquan_Temple'],
  '科尔多瓦主教座堂(原大清真寺)': ['Mosque%E2%80%93Cathedral_of_C%C3%B3rdoba'],
  '科帕卡瓦纳': ['Copacabana,_Bolivia'],
  '科罗拉多四角地': ['Four_Corners_Monument'],
  '穆罕默德·阿里清真寺': ['Mosque_of_Muhammad_Ali'],
  '米纳克希神庙': ['Meenakshi_Temple'],
  '索玛纳特神庙': ['Somnath_temple'],
  '紫阳书院': ['Ziyang_Academy'],
  '塔兰塔兰萨希卜': ['Darbar_Sahib_Tarn_Taran'],
  '鹿岛神宫': ['Kashima_Shrine'],
  '贵船神社': ['Kifune_Shrine'],
  '加尔各答卡莉庙': ['Kalighat_Kali_Temple'],
  '蒙古甘丹寺': ['Gandantegchinlen_Monastery'],
  '蒂卡尔': ['Tikal'],
  '特奥蒂瓦坎': ['Teotihuacan'],
  '帕伦克': ['Palenque'],
  '乌斯马尔': ['Uxmal'],
  '埃洛拉凯拉撒石窟': ['Kailasa_Temple,_Ellora'],
  '普兰巴南神庙': ['Prambanan'],
  '莫斯科救世主大教堂': ['Cathedral_of_Christ_the_Saviour'],
  '滴血救世主大教堂': ['Church_of_the_Savior_on_Blood'],
  '蒙特塞拉特修道院': ['Montserrat_(monastery)'],
  '都柏林圣帕特里克大教堂': ["Saint_Patrick%27s_Cathedral,_Dublin"],
  '布宜诺斯艾利斯大教堂': ['Buenos_Aires_Metropolitan_Cathedral'],
  '巴西利亚大教堂': ['Cathedral_of_Brasília'],
  '瓜达卢佩圣母大教堂': ['Basilica_of_Our_Lady_of_Guadalupe'],
  '卢尔德圣母文化探访地': ['Sanctuary_of_Our_Lady_of_Lourdes'],
  '法蒂玛圣母文化探访地': ['Sanctuary_of_Our_Lady_of_Fátima'],
  '柏林新会堂': ['New_Synagogue,_Berlin'],
  '布达佩斯大犹太会堂': ['Dohány_Street_Synagogue'],
  '布拉格老新犹太会堂': ['Old_New_Synagogue'],
  '威尼斯犹太区': ['Venetian_Ghetto'],
  '阿姆斯特丹葡萄牙会堂': ['Portuguese_Synagogue_(Amsterdam)'],
  '布尔萨绿色清真寺': ['Green_Mosque_(Bursa)'],
  '西安化觉巷清真大寺': ['Great_Mosque_of_Xi%27an'],
  '艾提尕尔清真寺': ['Id_Kah_Mosque'],
  '马来西亚国家清真寺': ['National_Mosque_of_Malaysia'],
  '奥马尔·阿里·赛义夫丁清真寺': ['Omar_Ali_Saifuddien_Mosque'],
  '伊斯蒂赫拉尔清真寺': ['Istiqlal_Mosque,_Jakarta'],
  '毛里求斯大盆地': ['Ganga_Talao'],
  '卡鲁因清真寺': ['University_of_al-Qarawiyyin'],
  '伊本·图伦清真寺': ['Mosque_of_Ibn_Tulun'],
  '马图拉': ['Mathura'],
  '沃林达文': ['Vrindavan'],
  '阿约提亚': ['Ayodhya'],
  '拉梅什瓦拉姆神庙': ['Ramanathaswamy_Temple'],
  '蒂鲁马拉文卡塔什瓦拉神庙': ['Venkateswara_Temple,_Tirumala'],
  '普里贾格纳神庙': ['Jagannath_Temple,_Puri'],
  '维鲁帕克沙神庙': ['Virupaksha_Temple,_Hampi'],
  '吴哥窟印度文化': ['Angkor_Wat'],
  '博达哈大佛塔': ['Boudhanath'],
  '斯瓦扬布纳特': ['Swayambhunath'],
  '不丹普那卡宗': ['Punakha_Dzong'],
  '萨迦寺': ['Sakya_Monastery'],
  '楚布寺': ['Tsurphu_Monastery'],
  '云南松赞林寺': ['Songtsen_Gampo_Monastery'],
  '德格印经院': ['Parkhang'],
  '熊野三山': ['Kumano_Sanzan'],
  '宗像大社': ['Munakata_Taisha'],
  '住吉大社': ['Sumiyoshi-taisha'],
  '热田神宫': ['Atsuta_Shrine'],
  '冰川神社': ['Hikawa_Shrine'],
  '大神神社': ['%C5%8Cmiwa_Shrine'],
  '三岛大社': ['Mishima_Taisha'],
  '宫崎神宫': ['Miyazaki_Shrine'],
  '宇佐神宫': ['Usa_Jingū'],
  '香取神宫': ['Katori_Shrine'],
  '靖国神社': ['Yasukuni_Shrine'],
  '普拉巴萨加斯雅': ['Prabhasa_Kshetra'],
  '金汤桥清真寺': ['Jintang_Mosque'],
  '提瓦纳库': ['Tiwanaku'],
  '马丘比丘': ['Machu_Picchu'],
  '因加皮尔卡': ['Ingapirca'],
  '大津巴布韦': ['Great_Zimbabwe'],
  '纳米布红岩': ['Sossusvlei'],

  // 第二波: Ring4 别名 (120+ 条)
  '三山五岳南岳衡山': ['Mount_Heng_(Hunan)', 'Heng_Shan_(Hunan)'],
  '乌干达灵曦堂': ['Baháʼí_House_of_Worship_(Kampala)', 'Kampala_Baháʼí_Temple'],
  '乌贾因': ['Mahakaleshwar_Jyotirlinga', 'Ujjain'],
  '五台山儒家讲堂': ['Mount_Wutai'],
  '仙台大崎八幡宫': ['Ōsaki_Hachiman-gū'],
  '以色列巴哈欧拉尘世陵': ['Mansion_of_Bahj%C3%AD', 'Shrine_of_Baháʼu%27lláh'],
  '以色列莫迪因马卡比墓': ['Modi%27in-Maccabim-Re%27ut'],
  '以色列贝特谢安古会堂遗址': ['Beit_She%27an'],
  '伊势神宫外宫': ['Ise_Grand_Shrine'],
  '伊斯坦布尔苏菲道场': ['Galata_Mevlevi_Museum', 'Galata_Mevlevihanesi'],
  '伊斯法罕伊玛目清真寺': ['Shah_Mosque'],
  '伊朗设拉子巴孛家': ['House_of_the_B%C3%A1b'],
  '伦敦巴哈伊中心': ['Baháʼí_Faith_in_the_United_Kingdom'],
  '伦敦索霍路锡克庙': ['Sri_Guru_Singh_Sabha'],
  '佩特拉修道院': ['Ad_Deir', 'Petra'],
  '刚果民主共和国灵曦堂': ['Baháʼí_House_of_Worship_(Democratic_Republic_of_the_Congo)'],
  '加德满都玛哈伽加塔': ['Boudhanath'],
  '加拿大巴哈伊国家中心': ['Baháʼí_Faith_in_Canada'],
  '北极圈萨米鼓圣地': ['Sieidi', 'Sami_religion'],
  '北石窟寺': ['North_Grottoes'],
  '南石窟寺': ['South_Grottoes'],
  '南非圣乔治大教堂': ['St_George%27s_Cathedral,_Cape_Town'],
  '卡卡杜国家公园岩画': ['Kakadu_National_Park'],
  '印度浦那巴哈伊中心': ['Pune'],
  '台北行天宫': ['Xingtian_Temple'],
  '台湾台北指南宫': ['Zhinan_Temple'],
  '哥伦比亚诺里港地方灵曦堂': ['Local_Baháʼí_House_of_Worship'],
  '圣乔治教堂(拉利贝拉)': ['Church_of_Saint_George,_Lalibela'],
  '坎奇普拉姆凯拉撒那塔': ['Kailasanathar_Temple,_Kanchipuram'],
  '塔兰塔兰萨希卜': ['Darbar_Sahib_Tarn_Taran'],
  '塞内加尔圣木林': ['Casamance'],
  '塞拉热窝老犹太会堂': ['Old_Synagogue_(Sarajevo)'],
  '塞浦路斯巴哈伊中心': ['Baháʼí_Faith_in_Cyprus'],
  '大马士革倭马亚清真寺': ['Umayyad_Mosque'],
  '大马士革圣母升天大教堂': ['Mariamite_Cathedral_of_Damascus'],
  '奈良若草山麓手向山八幡宫': ['Tamukeyama_Hachiman-gū'],
  '威尔梅特灵曦堂': ['Baháʼí_House_of_Worship_(Wilmette,_Illinois)'],
  '孟买阿夫加尼萨希卜': ['Gurdwara_Guru_Nanak_Darbar'],
  '宗迪亚拉古鲁德瓦拉': ['Jandiala'],
  '尼泊尔帕斯帕提纳': ['Pashupatinath_Temple'],
  '岛根县须佐神社': ['Susa_Shrine'],
  '崆峒山': ['Mount_Kongtong'],
  '巍宝山': ['Mount_Weibao'],
  '巴哈伊国家纪念花园': ['Baháʼí_World_Centre'],
  '巴布亚新几内亚灵曦堂': ['Baháʼí_House_of_Worship_(Papua_New_Guinea)'],
  '巴拿马灵曦堂': ['Baháʼí_House_of_Worship_(Panama)'],
  '巴林锡克文化中心': ['Sikhism_in_Bahrain', 'Bahrain'],
  '巴格达圣居': ['House_of_Baháʼu%27lláh'],
  '开普敦圣乔治座堂': ['St_George%27s_Cathedral,_Cape_Town'],
  '开普敦犹太会堂': ['Great_Synagogue_of_Cape_Town'],
  '德里达姆达玛·萨希卜': ['Gurudwara_Damdama_Sahib'],
  '悉尼圣玛丽大教堂': ['St_Mary%27s_Cathedral,_Sydney'],
  '悉尼灵曦堂': ['Baháʼí_House_of_Worship_(Sydney)', 'Sydney_Baháʼí_House_of_Worship'],
  '拉宾纪念广场会堂': ['Rabin_Square'],
  '拜特谢阿林犹太陵墓': ['Beit_She%27arim_National_Park'],
  '括苍山': ['Mount_Kuocang'],
  '撒马尔罕雷吉斯坦': ['Registan'],
  '新加坡中央锡克庙': ['Central_Sikh_Temple'],
  '新加坡玉皇殿': ['Taoism_in_Singapore'],
  '旧金山天后古庙': ['Tin_How_Temple'],
  '普里贾格纳特庙': ['Jagannath_Temple,_Puri'],
  '曼谷锡克庙': ['Gurdwara_Siri_Guru_Singh_Sabha'],
  '杜克巴杰尼古鲁德瓦拉': ['Dukh_Bhanjani_Beri'],
  '柬埔寨巴淡邦地方灵曦堂': ['Battambang'],
  '武夷山': ['Wuyi_Mountains'],
  '武夷山桃源洞': ['Wuyi_Mountains'],
  '死海古卷洞': ['Qumran_Caves', 'Dead_Sea_Scrolls'],
  '江西云居山真如寺': ['Zhenru_Temple'],
  '江西洞山普利寺': ['Mount_Dongshan_(Jiangxi)'],
  '沃尔姆斯犹太会堂': ['Worms_Synagogue'],
  '法兰克福灵曦堂': ['Baháʼí_House_of_Worship_(Langenhain)', 'Langenhain'],
  '波克拉里扬经学院': ['Po-i-Kalyan'],
  '波波克赖姆圣母像': ['Rock-Hewn_Churches,_Lalibela'],
  '温哥华罗斯街锡克庙': ['Ross_Street_Gurdwara_Sahib', 'Khalsa_Diwan_Society'],
  '特拉维夫大会堂': ['Great_Synagogue_of_Tel_Aviv'],
  '甘南郎木寺': ['Langmusi', 'Langmu_Monastery'],
  '福建福州鼓山涌泉寺': ['Yongquan_Temple,_Fuzhou'],
  '科尔多瓦主教座堂(原大清真寺)': ['Mosque%E2%80%93Cathedral_of_C%C3%B3rdoba'],
  '紫阳书院': ['Zhu_Xi'],
  '纽约华尔街附近关帝庙': ['Mahayana_Temple_of_New_York'],
  '纽约曼哈顿锡克文化中心': ['Sikhism_in_New_York_City'],
  '纽约爱玛努尔会堂': ['Temple_Emanu-El_of_New_York'],
  '维也纳圣斯蒂芬大教堂': ['St._Stephen%27s_Cathedral,_Vienna'],
  '肯尼亚马赛马拉圣地': ['Maasai_Mara'],
  '芝加哥锡克文化中心': ['Palatine,_Illinois'],
  '芬兰萨米驯鹿圣湖': ['Lake_Inari'],
  '茶山书院': ['Dasan_(philosopher)'],
  '菩提伽耶玛哈菩提寺': ['Mahabodhi_Temple'],
  '萨拉斯瓦蒂神庙班斯迪': ['Basar,_Telangana'],
  '萨摩亚灵曦堂': ['Baháʼí_House_of_Worship_(Samoa)'],
  '蓝色清真寺': ['Sultan_Ahmed_Mosque', 'Blue_Mosque,_Istanbul'],
  '藏北纳木错扎西寺': ['Namtso'],
  '西藏乃琼寺': ['Nechung_Monastery'],
  '西藏山南昌珠寺': ['Tradruk_Temple'],
  '西西里锡拉库萨犹太区': ['Ortygia', 'Syracuse,_Sicily'],
  '越南河内白马寺': ['Bạch_Mã_Temple'],
  '越南顺化国子监': ['Hu%E1%BA%BF'],
  '达摩面壁洞少林寺': ['Shaolin_Monastery'],
  '迪拜锡克庙': ['Guru_Nanak_Darbar_Dubai'],
  '都柏林圣帕特里克大教堂': ['St_Patrick%27s_Cathedral,_Dublin'],
  '采法特古城': ['Safed'],
  '里约救世基督像': ['Christ_the_Redeemer_(statue)'],
  '里约热内卢救世基督像': ['Christ_the_Redeemer_(statue)'],
  '阿巴斯陵': ['Shrine_of_%60Abdu%27l-Bah%C3%A1'],
  '阿帕雷西达圣母大殿': ['Basilica_of_the_National_Shrine_of_Our_Lady_of_Aparecida'],
  '阿德里安堡圣地': ['Edirne'],
  '阿联酋巴哈伊中心': ['Baháʼí_Faith_in_the_United_Arab_Emirates'],
  '青海塔公寺': ['Tagong_Monastery', 'Tagong_Temple'],
  '青海夏琼寺': ['Jakhyung_Monastery'],
  '青海果洛查朗寺': ['Golog_Tibetan_Autonomous_Prefecture'],
  '青海玉树新寨嘛呢石经城': ['Gyanak_Mani'],
  '青海瞿昙寺': ['Qutan_Temple', 'Gönlung_Jampa_Ling'],
  '青海瞿昙寺藏经楼': ['Qutan_Temple'],
  '韶关云门寺': ['Yunmen_Monastery'],
  '马杜赖米娜克希神庙': ['Meenakshi_Temple'],
  '马来西亚鹤山观': ['Hor_San_Koon'],
  '马耳他巴哈伊国家中心': ['Baháʼí_Faith_in_Malta'],
  '鹿儿岛雾岛神宫': ['Kirishima-jingū'],
  '黄大仙祠': ['Wong_Tai_Sin_Temple_(Hong_Kong)'],
  '黄梅五祖寺': ['Wuzu_Temple'],
  '黄梅四祖寺': ['Sizu_Temple'],
  '龙冈书院': ['Wang_Yangming'],
};

async function wikiImage(title: string, lang: 'en' | 'zh'): Promise<string | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'zuting-destination-bot/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const img = data.originalimage?.source || data.thumbnail?.source;
    if (!img || typeof img !== 'string') return null;
    if (!img.includes('upload.wikimedia.org')) return null;
    return img;
  } catch {
    return null;
  }
}

// MediaWiki search + pageimages: 用关键词搜索并拿首个命中页面的主图
// 这是业界最佳实践(比逐个尝试 REST summary 更鲁棒,能处理拼写变体/消歧义)
async function wikiSearchImage(term: string, lang: 'en' | 'zh'): Promise<string | null> {
  try {
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json` +
      `&prop=pageimages&piprop=original|thumbnail&pithumbsize=1200` +
      `&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=3&gsrnamespace=0` +
      `&origin=*`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'zuting-destination-bot/1.0' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    // 取首个有主图的页面 (按 search index 排序)
    const arr = Object.values(pages) as any[];
    arr.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
    for (const p of arr) {
      const img = p.original?.source || p.thumbnail?.source;
      if (img && typeof img === 'string' && img.includes('upload.wikimedia.org')) return img;
    }
    return null;
  } catch {
    return null;
  }
}

// Commons 图片搜索: 最后防线,任何关键词都能在 Commons 找到相关图片
async function commonsSearchImage(term: string): Promise<string | null> {
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
      `&prop=imageinfo&iiprop=url&iiurlwidth=1200` +
      `&generator=search&gsrsearch=${encodeURIComponent(term)}+filetype:bitmap` +
      `&gsrlimit=5&gsrnamespace=6&origin=*`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'zuting-destination-bot/1.0' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    const arr = Object.values(pages) as any[];
    arr.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
    for (const p of arr) {
      const info = p.imageinfo?.[0];
      const img = info?.thumburl || info?.url;
      if (img && typeof img === 'string' && img.includes('upload.wikimedia.org')) return img;
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchRemoteSites(): Promise<Array<{ name: string; nameEn: string | null }>> {
  const BASE = process.env.FETCH_REMOTE || 'https://zuting.fszyl.top/api/holy-sites';
  const sites: Array<{ name: string; nameEn: string | null }> = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${BASE}?limit=100&page=${page}`);
    if (!res.ok) break;
    const data: any = await res.json();
    const items: any[] = data.items || [];
    if (items.length === 0) break;
    for (const it of items) sites.push({ name: it.name, nameEn: it.nameEn });
    if (items.length < 100) break;
  }
  const seen = new Set<string>();
  return sites.filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)));
}

async function fetchAndSave() {
  console.log('🌐 [FETCH] 从 Wikipedia 拉取真实图\n');

  const useRemote = process.argv.includes('--remote');
  const sites = useRemote
    ? await fetchRemoteSites()
    : await prisma.holySite.findMany({ select: { name: true, nameEn: true }, orderBy: { name: 'asc' } });
  console.log(`待处理 (${useRemote ? '远程' : '本地'}): ${sites.length} 站点`);

  // 加载现有 JSON,避免重复拉取
  let existing: Record<string, string> = {};
  if (fs.existsSync(JSON_PATH)) {
    existing = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
    console.log(`已缓存: ${Object.keys(existing).length} 条`);
  }

  const result = { ...existing };
  let newHits = 0;
  let attempts = 0;

  for (const s of sites) {
    if (result[s.name]) continue;
    attempts++;
    let img: string | null = null;
    // 1. 别名优先 (手工维护)
    const aliases = ALIASES[s.name];
    if (aliases) {
      for (const a of aliases) {
        img = await wikiImage(a, 'en');
        if (img) break;
        await sleep(100);
      }
    }
    // 2. nameEn 回退
    if (!img && s.nameEn) img = await wikiImage(s.nameEn, 'en');
    // 3. 中文维基
    if (!img) img = await wikiImage(s.name, 'zh');
    // 4. EN 搜索 + pageimages (处理标题拼写变体/消歧义)
    if (!img && s.nameEn) img = await wikiSearchImage(s.nameEn, 'en');
    // 5. ZH 搜索
    if (!img) img = await wikiSearchImage(s.name, 'zh');
    // 6. Commons 图片搜索 (最后防线)
    if (!img && s.nameEn) img = await commonsSearchImage(s.nameEn);
    if (!img) img = await commonsSearchImage(s.name);
    if (img) {
      result[s.name] = img;
      newHits++;
    }
    if (attempts % 20 === 0) {
      console.log(`  尝试 ${attempts}, 新增 ${newHits}`);
      fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
      fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
    }
    await sleep(1500);
  }

  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
  console.log(`\n✓ 总缓存: ${Object.keys(result).length} 条, 本次新增 ${newHits}`);
  console.log(`📄 ${JSON_PATH}`);
}

async function applyFromJson() {
  console.log('🖼  [SEED] 从 wiki-images.json 更新图片\n');
  if (!fs.existsSync(JSON_PATH)) {
    console.warn(`⚠ JSON 未找到: ${JSON_PATH}`);
    console.warn('  请在本地运行 "npx tsx prisma/seed-destinations-wiki-images.ts --fetch" 生成');
    return;
  }
  const map: Record<string, string> = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  console.log(`JSON 条目: ${Object.keys(map).length}`);

  const sites = await prisma.holySite.findMany({ select: { id: true, name: true, imageUrl: true } });
  let updated = 0;
  let skipped = 0;
  for (const s of sites) {
    const wikiImg = map[s.name];
    if (!wikiImg) { skipped++; continue; }
    if (s.imageUrl === wikiImg) { skipped++; continue; }
    await prisma.holySite.update({ where: { id: s.id }, data: { imageUrl: wikiImg } });
    updated++;
  }
  console.log(`✓ 更新: ${updated}`);
  console.log(`⏭ 跳过 (无 wiki 或已同步): ${skipped}`);
}

async function main() {
  if (FETCH_MODE) await fetchAndSave();
  else await applyFromJson();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
