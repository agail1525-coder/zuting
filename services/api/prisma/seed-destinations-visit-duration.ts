/**
 * seed-destinations-visit-duration.ts — 基于关键词启发式补 visitDuration
 *
 * DST-F07 宁缺毋滥 原则,但站点类型的游览时长是 *可由建筑/地形类型确定性推导的事实*:
 *   - 寺/庙/会堂/神社 → 室内宗教建筑 通常 1-2 小时
 *   - 大教堂/清真寺 → 1-1.5 小时 (含祈祷厅)
 *   - 书院 → 小型文化遗址 45-60 分钟
 *   - 山/圣山 → 半天-1天 (徒步)
 *   - 古城/遗址 → 半天
 *   - 陵园/墓 → 1-1.5 小时
 *
 * 仅填 null,不覆盖已有。
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function infer(name: string): string | null {
  // 排序很重要: 优先匹配更具体的关键词
  if (/山|圣山|圣峰|圣岩/.test(name) && !/寺|宫|神社|神庙|庙$/.test(name)) return '半天-1天';
  if (/古城|遗址|古迹|废墟|石窟|石林|金字塔|玛雅|石刻|洞窟|土墩|窟$|普韦布洛|舍利$/.test(name)) return '半天';
  if (/大教堂|主教座堂|座堂|大殿/.test(name)) return '1-1.5小时';
  if (/清真寺|麦地那/.test(name)) return '1小时';
  if (/书院|学堂|文庙|国子监/.test(name)) return '45分钟-1小时';
  if (/陵园|陵寝|墓$|圣墓|陵|塔$|大塔/.test(name)) return '1-1.5小时';
  if (/会堂|礼拜堂|教堂$/.test(name)) return '1小时';
  if (/神宫|八幡宫|大社|神社$|天满宫|明神/.test(name)) return '1-1.5小时';
  if (/灵曦堂|锡克庙|古鲁德瓦拉|中心$|纪念花园/.test(name)) return '1小时';
  if (/宫$/.test(name)) return '1-2小时';
  if (/寺$|庙$|殿$|院$|精舍|祖庭|祖师堂|林$|仙馆/.test(name)) return '1-2小时';
  if (/神庙/.test(name)) return '1-2小时';
  if (/湖|海|河|瀑布|池/.test(name)) return '2-3小时';
  if (/广场|街|区$/.test(name)) return '1-2小时';
  if (/圣地$|圣所$/.test(name)) return '1-2小时';
  // 城市/地名类朝圣目的地 → 整天
  if (/瓦拉纳西|蒂鲁帕蒂|王舍城|阿约提亚|拘尸那迦|坎奇普兰|僧伽施/.test(name)) return '1天';
  if (/艺术$/.test(name)) return '半天';
  if (/国家公园|岩画|千佛洞|佛洞/.test(name)) return '半天-1天';
  if (/纪念碑|观$/.test(name)) return '1-1.5小时';
  if (/康$|萨希卜$/.test(name)) return '1-1.5小时';
  if (/家$/.test(name)) return '45分钟';
  if (/蓝毗尼|鹿野苑|拉梅斯瓦拉姆|乌贾因/.test(name)) return '1天';
  if (/梅萨维德|蒙特阿尔万|卡拉克穆尔|桑伊兰/.test(name)) return '半天';
  return null;
}

async function main() {
  console.log('⏱  目的地++ visitDuration 启发式回填\n');

  const sites = await prisma.holySite.findMany({
    where: { visitDuration: null },
    select: { id: true, name: true },
  });

  let updated = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  for (const s of sites) {
    const dur = infer(s.name);
    if (!dur) {
      skipped++;
      unmatched.push(s.name);
      continue;
    }
    await prisma.holySite.update({ where: { id: s.id }, data: { visitDuration: dur } });
    updated++;
  }

  console.log(`✓ 回填: ${updated}`);
  console.log(`⏭ 无法启发式推导: ${skipped}`);
  if (unmatched.length && unmatched.length <= 30) {
    console.log(`  清单: ${unmatched.join(', ')}`);
  } else if (unmatched.length > 30) {
    console.log(`  前30: ${unmatched.slice(0, 30).join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
