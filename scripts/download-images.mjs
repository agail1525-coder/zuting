#!/usr/bin/env node
/**
 * Download all Unsplash images locally for the ZUTING project.
 * Usage: node scripts/download-images.mjs
 * Requires Node.js 18+ (native fetch).
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'apps', 'web', 'public');

const u = (id) => `https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop&q=80`;

// ── Slug mappings ──────────────────────────────────────
const HOLY_SITE_ENTRIES = [
  // Buddhism
  ['菩提伽耶', 'bodhi-gaya', '1578662996442-48f60103fc96'],
  ['布达拉宫', 'potala-palace', '1555400038-63f5ba517a47'],
  ['吴哥窟', 'angkor-wat', '1567591370504-cba8e7f8a803'],
  ['法隆寺', 'horyuji', '1528360983277-13d401cdc186'],
  ['五台山', 'wutai-mountain', '1533669955142-6a73332af4db'],
  ['仰光大金塔', 'shwedagon-pagoda', '1590709899716-adbb7c5e570e'],
  ['婆罗浮屠', 'borobudur', '1580619305218-8423a532f7f4'],
  ['敦煌莫高窟', 'mogao-caves', '1584967918940-a7d51b064268'],
  // Taoism
  ['武当山', 'wudang-mountain', '1547981609845-4c7e98dcde89'],
  ['青城山', 'qingcheng-mountain', '1516466723877-e4ec1d736c8a'],
  ['龙虎山', 'longhu-mountain', '1504681869696-d977211a5e35'],
  ['茅山', 'mao-mountain', '1532236204992-18baa7b3e7b0'],
  ['崂山', 'lao-mountain', '1506905925346-21bda4d32df4'],
  ['白云观', 'baiyun-temple', '1518509562392-e4f8e5ba3659'],
  // Christianity
  ['梵蒂冈圣彼得大教堂', 'st-peters-basilica', '1548625149-fc4a29cf7092'],
  ['圣家堂', 'sagrada-familia', '1553933899-de0ff81f81b9'],
  ['巴黎圣母院', 'notre-dame-paris', '1499856871958-5b9357976b82'],
  ['圣索菲亚大教堂', 'hagia-sophia', '1543489822-c49534ee4696'],
  ['科隆大教堂', 'cologne-cathedral', '1476362174823-3a23f4aa6e2d'],
  ['威斯敏斯特教堂', 'westminster-abbey', '1501959181438-3e0fdf812ec7'],
  ['耶路撒冷圣墓教堂', 'holy-sepulchre', '1507003211169-0a1dd7228f2d'],
  ['米兰大教堂', 'milan-cathedral', '1520175480-66953d66e926'],
  // Islam
  ['麦加禁寺', 'masjid-al-haram', '1564769625905-50e93615e769'],
  ['麦地那先知寺', 'al-masjid-an-nabawi', '1585036156171-384164a8c696'],
  ['阿尔罕布拉宫', 'alhambra', '1542816645-95d572263cd2'],
  ['蓝色清真寺', 'blue-mosque', '1570913149827-d2ac84ab3f9a'],
  ['圆顶清真寺', 'dome-of-the-rock', '1566478989037-eec170784d0b'],
  ['泰姬陵', 'taj-mahal', '1540959733332-eab44bc4f75b'],
  // Hinduism
  ['瓦拉纳西恒河', 'varanasi-ganges', '1561361513-2d000a50f0dc'],
  ['巴厘岛母庙', 'besakih-temple', '1585123388867-3bfe7d1f27e5'],
  ['科纳克太阳神庙', 'konark-sun-temple', '1570168007204-dfb528c6958f'],
  ['尼泊尔帕斯帕提纳', 'pashupatinath', '1524492412937-b28074a5d7da'],
  ['吴哥窟印度教', 'angkor-hindu', '1609340884849-0e5e5fca2b75'],
  ['阿克萨达姆神庙', 'akshardham', '1548013146216-f9c4e6c02c10'],
  // Judaism
  ['耶路撒冷哭墙', 'western-wall', '1552751753-0fc84ae9e3e9'],
  ['马萨达要塞', 'masada', '1544967082-7f0e50927f25'],
  ['死海古卷洞', 'dead-sea-scrolls', '1558618047-3cdd1f9e0d0e'],
  ['锡安山', 'mount-zion', '1559827291572-1149a24e64cf'],
  // Confucianism
  ['曲阜孔庙', 'qufu-confucius-temple', '1534972195531-d756b9bfa9f2'],
  ['岳麓书院', 'yuelu-academy', '1502823403499-180f3e50e76c'],
  ['白鹿洞书院', 'bailudong-academy', '1546476501-15e7f4f2e4e2'],
  ['北京国子监', 'beijing-guozijian', '1508804185872-d7badad00f7d'],
  // Sikhism
  ['阿姆利则金庙', 'golden-temple', '1587474260584-136574528ed5'],
  ['旁遮普古鲁圣地', 'punjab-gurdwara', '1582655299517-6abf335397e3'],
  ['锡克教圣殿', 'sikh-shrine', '1551718678-77b3f77309aa'],
  // Shinto
  ['伊势神宫', 'ise-grand-shrine', '1493976040374-85c8e12f0c0e'],
  ['严岛神社', 'itsukushima-shrine', '1478436127897-769e1b3f0f36'],
  ['伏见稻荷大社', 'fushimi-inari', '1524413840807-0c3cb6e1c6b3'],
  ['明治神宫', 'meiji-shrine', '1545569341-9eb8b30979d5'],
  // Tibetan Buddhism
  ['拉萨大昭寺', 'jokhang-temple', '1544735716-392fe2489ffa'],
  ['甘丹寺', 'ganden-monastery', '1519451241324-20b4ea2c4220'],
  ['色达喇荣五明佛学院', 'seda-larung-gar', '1488085061387-422e29b40080'],
  ['不丹虎穴寺', 'tigers-nest', '1476514525535-07fb3b4ae5f1'],
  // Indigenous
  ['乌鲁鲁巨石', 'uluru', '1469474968028-56623f02e42e'],
  ['马丘比丘', 'machu-picchu', '1526392060635-9d6bf92b4469'],
  ['巨石阵', 'stonehenge', '1516738901171-8eb4fc13bd20'],
  ['奇琴伊察', 'chichen-itza', '1518638150340-f706e86654de'],
  // Bahai
  ['海法空中花园', 'haifa-gardens', '1558976825-6b1b03e11db4'],
  ['新德里莲花寺', 'lotus-temple', '1565689157206-0fddef7589a2'],
  ['威尔梅特灵曦堂', 'wilmette-temple', '1433086966358-54859d0ed716'],
];

const TEMPLE_ENTRIES = [
  ['鹿野苑', 'sarnath', '1578662996442-48f60103fc96'],
  ['灵鹫山', 'vulture-peak', '1580619305218-8423a532f7f4'],
  ['祇园精舍', 'jetavana', '1590709899716-adbb7c5e570e'],
  ['鹤鸣山', 'heming-mountain', '1547981609845-4c7e98dcde89'],
  ['终南山', 'zhongnan-mountain', '1533669955142-6a73332af4db'],
  ['楼观台', 'louguan-platform', '1584967918940-a7d51b064268'],
  ['伯利恒主诞堂', 'church-nativity', '1548625149-fc4a29cf7092'],
  ['各各他', 'golgotha', '1507003211169-0a1dd7228f2d'],
  ['安提阿', 'antioch', '1553933899-de0ff81f81b9'],
  ['希拉山洞', 'cave-hira', '1564769625905-50e93615e769'],
  ['库巴清真寺', 'quba-mosque', '1585036156171-384164a8c696'],
  ['哈里德瓦尔', 'haridwar', '1561361513-2d000a50f0dc'],
  ['瑞诗凯诗', 'rishikesh', '1585123388867-3bfe7d1f27e5'],
  ['圣殿山', 'temple-mount', '1552751753-0fc84ae9e3e9'],
  ['希伯伦先祖墓', 'cave-patriarchs', '1544967082-7f0e50927f25'],
  ['曲阜阙里', 'qufu-queli', '1534972195531-d756b9bfa9f2'],
  ['洙泗书堂', 'zhusi-academy', '1502823403499-180f3e50e76c'],
  ['卡塔普尔', 'kartarpur', '1587474260584-136574528ed5'],
  ['南德德', 'nanded', '1551718678-77b3f77309aa'],
  ['出云大社', 'izumo-taisha', '1493976040374-85c8e12f0c0e'],
  ['高天原', 'takamagahara', '1478436127897-769e1b3f0f36'],
  ['桑耶寺', 'samye-monastery', '1544735716-392fe2489ffa'],
  ['甘丹寺祖庭', 'ganden-ancestral', '1519451241324-20b4ea2c4220'],
  ['梦时代圣地', 'dreamtime-site', '1469474968028-56623f02e42e'],
  ['太阳神庙库斯科', 'coricancha', '1526392060635-9d6bf92b4469'],
  ['巴格达Ridvan花园', 'ridvan-garden', '1558976825-6b1b03e11db4'],
  ['阿卡监狱城', 'akka-prison', '1565689157206-0fddef7589a2'],
];

const PATRIARCH_ENTRIES = [
  ['释迦牟尼', 'shakyamuni', '1578662996442-48f60103fc96'],
  ['龙树菩萨', 'nagarjuna', '1580619305218-8423a532f7f4'],
  ['六祖慧能', 'huineng', '1544735716-392fe2489ffa'],
  ['老子', 'laozi', '1547981609845-4c7e98dcde89'],
  ['张道陵', 'zhang-daoling', '1533669955142-6a73332af4db'],
  ['王重阳', 'wang-chongyang', '1516466723877-e4ec1d736c8a'],
  ['耶稣基督', 'jesus-christ', '1548625149-fc4a29cf7092'],
  ['使徒保罗', 'apostle-paul', '1553933899-de0ff81f81b9'],
  ['奥古斯丁', 'augustine', '1476362174823-3a23f4aa6e2d'],
  ['先知穆罕默德', 'prophet-muhammad', '1564769625905-50e93615e769'],
  ['阿布·伯克尔', 'abu-bakr', '1585036156171-384164a8c696'],
  ['商羯罗', 'shankaracharya', '1561361513-2d000a50f0dc'],
  ['罗摩努阇', 'ramanuja', '1570168007204-dfb528c6958f'],
  ['亚伯拉罕', 'abraham', '1552751753-0fc84ae9e3e9'],
  ['摩西', 'moses', '1544967082-7f0e50927f25'],
  ['孔子', 'confucius', '1534972195531-d756b9bfa9f2'],
  ['孟子', 'mencius', '1502823403499-180f3e50e76c'],
  ['朱熹', 'zhu-xi', '1546476501-15e7f4f2e4e2'],
  ['古鲁那纳克', 'guru-nanak', '1587474260584-136574528ed5'],
  ['古鲁阿尔詹', 'guru-arjan', '1582655299517-6abf335397e3'],
  ['天照大神', 'amaterasu', '1493976040374-85c8e12f0c0e'],
  ['莲花生大士', 'padmasambhava', '1519451241324-20b4ea2c4220'],
  ['宗喀巴大师', 'tsongkhapa', '1488085061387-422e29b40080'],
  ['阿底峡尊者', 'atisha', '1476514525535-07fb3b4ae5f1'],
  ['梦时代祖灵', 'dreamtime-spirit', '1469474968028-56623f02e42e'],
  ['印加太阳神因蒂', 'inti', '1526392060635-9d6bf92b4469'],
  ['巴哈欧拉', 'bahaullah', '1558976825-6b1b03e11db4'],
  ['巴孛', 'the-bab', '1565689157206-0fddef7589a2'],
];

const ROUTE_ENTRIES = [
  ['sixth-patriarch-huineng', '1544735716-392fe2489ffa',
    ['1533669955142-6a73332af4db', '1580619305218-8423a532f7f4', '1584967918940-a7d51b064268']],
  ['bodhidharma-route', '1578662996442-48f60103fc96',
    ['1547981609845-4c7e98dcde89', '1555400038-63f5ba517a47', '1590709899716-adbb7c5e570e']],
  ['buddha-footsteps-india', '1561361513-2d000a50f0dc',
    ['1585123388867-3bfe7d1f27e5', '1570168007204-dfb528c6958f', '1524492412937-b28074a5d7da']],
  ['wudang-taoist-heritage', '1547981609845-4c7e98dcde89',
    ['1516466723877-e4ec1d736c8a', '1504681869696-d977211a5e35', '1532236204992-18baa7b3e7b0']],
  ['jerusalem-pilgrimage', '1552751753-0fc84ae9e3e9',
    ['1507003211169-0a1dd7228f2d', '1566478989037-eec170784d0b', '1559827291572-1149a24e64cf']],
  ['silk-road-mosques', '1570913149827-d2ac84ab3f9a',
    ['1564769625905-50e93615e769', '1585036156171-384164a8c696', '1542816645-95d572263cd2']],
  ['jerusalem-three-faiths', '1544967082-7f0e50927f25',
    ['1552751753-0fc84ae9e3e9', '1548625149-fc4a29cf7092', '1566478989037-eec170784d0b']],
  ['japan-shinbutsu', '1528360983277-13d401cdc186',
    ['1493976040374-85c8e12f0c0e', '1478436127897-769e1b3f0f36', '1524413840807-0c3cb6e1c6b3']],
  ['ganges-holy-cities', '1524492412937-b28074a5d7da',
    ['1561361513-2d000a50f0dc', '1585123388867-3bfe7d1f27e5', '1540959733332-eab44bc4f75b']],
  ['china-three-teachings', '1534972195531-d756b9bfa9f2',
    ['1547981609845-4c7e98dcde89', '1533669955142-6a73332af4db', '1502823403499-180f3e50e76c']],
];

// ── Build download queue ───────────────────────────────
// Deduplicate by unsplash ID to avoid downloading the same image twice
const downloads = new Map(); // unsplash_id -> [{dir, filename}]

function addTask(category, slug, unsplashId) {
  const dir = join(PUBLIC, 'images', category);
  const filename = `${slug}.jpg`;
  if (!downloads.has(unsplashId)) {
    downloads.set(unsplashId, []);
  }
  downloads.get(unsplashId).push({ dir, filename });
}

for (const [, slug, id] of HOLY_SITE_ENTRIES) addTask('holy-sites', slug, id);
for (const [, slug, id] of TEMPLE_ENTRIES) addTask('temples', slug, id);
for (const [, slug, id] of PATRIARCH_ENTRIES) addTask('patriarchs', slug, id);

for (const [routeSlug, coverId, galleryIds] of ROUTE_ENTRIES) {
  addTask('routes', `${routeSlug}-cover`, coverId);
  galleryIds.forEach((gid, i) => addTask('routes', `${routeSlug}-${i + 1}`, gid));
}

// ── Ensure directories ─────────────────────────────────
const dirs = new Set();
for (const targets of downloads.values()) {
  for (const t of targets) dirs.add(t.dir);
}
for (const d of dirs) {
  await mkdir(d, { recursive: true });
}
console.log(`Created ${dirs.size} directories`);

// ── Download with concurrency limit ────────────────────
const CONCURRENCY = 5;
const uniqueIds = [...downloads.keys()];
let completed = 0;
let failed = 0;
const failures = [];

async function downloadOne(unsplashId) {
  const url = u(unsplashId);
  const targets = downloads.get(unsplashId);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ZUTING-ImageDownloader/1.0' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    // Write to all target locations
    for (const { dir, filename } of targets) {
      await writeFile(join(dir, filename), buf);
    }
    completed++;
    if (completed % 10 === 0 || completed === uniqueIds.length) {
      console.log(`  [${completed}/${uniqueIds.length}] downloaded (${failed} failed)`);
    }
  } catch (err) {
    failed++;
    for (const { dir, filename } of targets) {
      failures.push({ file: join(dir, filename), error: err.message });
    }
  }
}

console.log(`Downloading ${uniqueIds.length} unique images (${HOLY_SITE_ENTRIES.length + TEMPLE_ENTRIES.length + PATRIARCH_ENTRIES.length} entities + route images)...`);

// Process in batches of CONCURRENCY
for (let i = 0; i < uniqueIds.length; i += CONCURRENCY) {
  const batch = uniqueIds.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(id => downloadOne(id)));
}

console.log(`\nDone! ${completed} succeeded, ${failed} failed out of ${uniqueIds.length} unique images.`);
if (failures.length > 0) {
  console.log('\nFailed downloads:');
  for (const f of failures) {
    console.log(`  ${f.file}: ${f.error}`);
  }
}
