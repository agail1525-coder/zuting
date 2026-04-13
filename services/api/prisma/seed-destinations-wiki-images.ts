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
    if (img) {
      result[s.name] = img;
      newHits++;
    }
    if (attempts % 20 === 0) {
      console.log(`  尝试 ${attempts}, 新增 ${newHits}`);
      fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
      fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
    }
    await sleep(120);
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
