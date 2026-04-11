/** M38.31 经论++ v31 精修第二十一轮 — 儒家经典深化 10 部 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
interface ChapterDef { chapterNo: number; title: string; subtitle?: string; originalText: string; commentary?: string; practiceHint?: string; }
interface NewScriptureDef { slug: string; title: string; titleEn?: string; author?: string; era?: string; ring: number; categorySlug: string; summary: string; significance?: string; difficulty: number; oxStageMin: number; oxStageMax: number; readingMins?: number; tags: string[]; sortOrder: number; relatedSlugs?: string[]; chapters: ChapterDef[]; }

const NEW_SCRIPTURES: NewScriptureDef[] = [
  { slug: 'zhouyi-jing', title: '周易·系辞传', titleEn: 'Yijing Xici', author: '孔子(传)', era: '春秋', ring: 3, categorySlug: 'confucianism', summary: '十翼之一,阐发易理最为系统之篇,"形而上者谓之道,形而下者谓之器"出处。', significance: '儒家宇宙论与形上学根基,宋明理学心性论之源。', difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 60, tags: ['易经', '十翼', '系辞', '道器'], sortOrder: 500,
    chapters: [{ chapterNo: 1, title: '形而上者谓之道', originalText: '形而上者谓之道,形而下者谓之器,化而裁之谓之变,推而行之谓之通,举而错之天下之民谓之事业。', commentary: '道器不二,变通为事业。企业家既要有形上之道(愿景),又要有形下之器(产品)。', practiceHint: '今日用一句话写下公司的"道"(使命),对照"器"(产品)是否一致。' }] },
  { slug: 'zhu-xi-jinsilu', title: '近思录', titleEn: 'Reflections on Things at Hand', author: '朱熹·吕祖谦 编', era: '南宋淳熙二年(1175)', ring: 3, categorySlug: 'confucianism', summary: '朱熹与吕祖谦合编周敦颐、二程、张载四子语录,十四卷,为宋代理学入门圣典。', significance: '理学教科书,朱子学的基础读本,东亚儒学必读。', difficulty: 4, oxStageMin: 4, oxStageMax: 9, readingMins: 80, tags: ['理学', '朱熹', '周张二程', '近思'], sortOrder: 501,
    chapters: [{ chapterNo: 1, title: '道体卷一', originalText: '伊川先生曰:今之学者有三弊:一溺于文章,二牵于训诂,三惑于异端。苟无此三者,则将何归?必趋于道矣。', commentary: '程颐指学者三大病。企业学习亦有三病:溺于口号/牵于流程/惑于外求。', practiceHint: '今日反省本月读的3本书,是否只停留在术,未触及道?' }] },
  { slug: 'lu-jiuyuan-xiangshan-yulu', title: '象山语录', titleEn: 'Xiangshan Recorded Sayings', author: '陆九渊', era: '南宋 (1139-1193)', ring: 3, categorySlug: 'confucianism', summary: '陆九渊门人记录的象山先生论学语录,为心学前驱,"宇宙便是吾心,吾心即是宇宙"出处。', significance: '心学开山,阳明心学前源,与朱子理学"鹅湖之辩"主角。', difficulty: 4, oxStageMin: 5, oxStageMax: 10, readingMins: 70, tags: ['心学', '陆九渊', '象山', '本心'], sortOrder: 502,
    chapters: [{ chapterNo: 1, title: '宇宙便是吾心', originalText: '宇宙内事是己分内事,己分内事是宇宙内事。宇宙便是吾心,吾心即是宇宙。东海有圣人出焉,此心同也,此理同也。', commentary: '心外无物,物外无心。企业家的格局就是心的格局,心大则天地大。', practiceHint: '今日面对一个"外部问题"时,反问:我心中哪一念与它相应?' }] },
  { slug: 'wang-yangming-daxue-wen', title: '大学问', titleEn: 'Inquiry on the Great Learning', author: '王阳明', era: '明嘉靖六年(1527)', ring: 3, categorySlug: 'confucianism', summary: '王阳明晚年为弟子讲《大学》宗旨的定论之作,提出"万物一体之仁"总纲。', significance: '阳明晚年思想结晶,揭示心学最高境界,为心学绝笔。', difficulty: 5, oxStageMin: 7, oxStageMax: 10, readingMins: 40, tags: ['心学', '王阳明', '万物一体', '致良知'], sortOrder: 503, relatedSlugs: ['chuanxi-lu'],
    chapters: [{ chapterNo: 1, title: '大人者以天地万物为一体', originalText: '大人者,以天地万物为一体者也。其视天下犹一家,中国犹一人焉。若夫间形骸而分尔我者,小人矣。大人之能以天地万物为一体也,非意之也,其心之仁本若是。', commentary: '大人之仁本与万物一体,非后天意识所加。企业家若视员工客户为"一家",自然生出真实慈悲。', practiceHint: '今日视员工如家人,开会前花1分钟问候某位同事最近家庭状况。' }] },
  { slug: 'zhang-zai-zhengmeng', title: '正蒙', titleEn: 'Zhang Zai Correcting Ignorance', author: '张载', era: '北宋 (1020-1077)', ring: 3, categorySlug: 'confucianism', summary: '张载横渠先生论天道性命之书,以"气一元论"立说,《西铭》《东铭》为其篇。', significance: '关学奠基之作,"民胞物与""为天地立心"四句出处。', difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 60, tags: ['关学', '张载', '气一元论', '西铭'], sortOrder: 504,
    chapters: [{ chapterNo: 1, title: '西铭·乾称父', originalText: '乾称父,坤称母。予兹藐焉,乃混然中处。故天地之塞,吾其体;天地之帅,吾其性。民吾同胞,物吾与也。大君者,吾父母宗子;其大臣,宗子之家相也。', commentary: '以乾坤为父母,众人为同胞,万物为伙伴。企业即"家",经营即"事亲"。', practiceHint: '今日写一句公司的"家训",强调团队互为兄弟姐妹。' }] },
  { slug: 'zhou-dunyi-tongshu', title: '通书', titleEn: 'Penetrating the Book of Changes', author: '周敦颐', era: '北宋 (1017-1073)', ring: 3, categorySlug: 'confucianism', summary: '周敦颐阐发易理与诚论之作,四十章,与《太极图说》并为濂学根本文献。', significance: '宋代理学开山之作,为二程兄弟师承之源。', difficulty: 4, oxStageMin: 5, oxStageMax: 10, readingMins: 50, tags: ['濂学', '周敦颐', '诚', '太极'], sortOrder: 505,
    chapters: [{ chapterNo: 1, title: '诚上第一', originalText: '诚者,圣人之本。"大哉乾元,万物资始",诚之源也。"乾道变化,各正性命",诚斯立焉。纯粹至善者也。', commentary: '诚为圣人根本,万物因"诚"而立。企业若无诚信,一切战略皆为空谈。', practiceHint: '本周执行一次"诚实审计":有哪句对客户/员工的话是半真半假?' }] },
  { slug: 'cheng-hao-ding-xing-shu', title: '定性书', titleEn: 'Letter on Stabilizing the Nature', author: '程颢', era: '北宋 (1032-1085)', ring: 3, categorySlug: 'confucianism', summary: '程颢答张载论如何使心性安定之书,短短千字,为宋明理学修养论核心文献。', significance: '程门心性论代表作,朱熹推为"二程最粹者"。', difficulty: 4, oxStageMin: 6, oxStageMax: 10, readingMins: 20, tags: ['理学', '程颢', '定性', '廓然大公'], sortOrder: 506,
    chapters: [{ chapterNo: 1, title: '廓然大公', originalText: '所谓定者,动亦定,静亦定,无将迎,无内外。苟以外物为外,牵己而从之,是以己性为有内外也。夫天地之常,以其心普万物而无心;圣人之常,以其情顺万事而无情。故君子之学,莫若廓然而大公,物来而顺应。', commentary: '真正的定不是死寂,而是廓然大公、物来顺应。企业家的定力在于对外物不将不迎,不住不执。', practiceHint: '今日下一个决策时,不看任何群聊意见,直接凭本心判断一次。' }] },
  { slug: 'huang-zongxi-mingyi-daifang-lu', title: '明夷待访录', titleEn: 'Waiting for the Dawn', author: '黄宗羲', era: '清康熙二年(1663)', ring: 3, categorySlug: 'confucianism', summary: '黄宗羲反思明亡的政治哲学专著,21篇,批判君主专制,被誉为"中国卢梭"。', significance: '中国近代民本思想先声,梁启超誉为"中国人权宣言"。', difficulty: 4, oxStageMin: 7, oxStageMax: 10, readingMins: 60, tags: ['黄宗羲', '民本', '政治哲学', '明夷'], sortOrder: 507,
    chapters: [{ chapterNo: 1, title: '原君', originalText: '古者以天下为主,君为客,凡君之所毕世而经营者,为天下也。今也以君为主,天下为客,凡天下之无地而得安宁者,为君也。', commentary: '古之君为天下服务,今之君以天下服务于己。企业主亦然:以客户/员工为主,还是以自己为主?', practiceHint: '今日决策时问:这个选择是为"我"还是为"天下"(客户/员工/社会)?' }] },
  { slug: 'gu-yanwu-rizhi-lu', title: '日知录', titleEn: 'Record of Daily Knowledge', author: '顾炎武', era: '清康熙九年(1670)', ring: 3, categorySlug: 'confucianism', summary: '顾炎武毕生读书笔记,32卷,考据精博,涉及经史、政治、军事、科技,为实学代表。', significance: '清代考据学开山,"天下兴亡,匹夫有责"原句出处(卷十三·正始)。', difficulty: 4, oxStageMin: 6, oxStageMax: 10, readingMins: 90, tags: ['顾炎武', '实学', '日知', '经世'], sortOrder: 508,
    chapters: [{ chapterNo: 1, title: '正始·天下兴亡', originalText: '有亡国,有亡天下。亡国与亡天下奚辨?曰:易姓改号,谓之亡国;仁义充塞,而至于率兽食人,人将相食,谓之亡天下。......保天下者,匹夫之贱,与有责焉耳矣。', commentary: '国与天下不同:国是政权,天下是文明。企业亦有"公司"与"事业"之别:公司可换,事业不可亡。', practiceHint: '写下一句:我的企业哪怕换人换业务,最不能丢的"事业魂"是什么?' }] },
  { slug: 'dai-zhen-mengzi-ziyi', title: '孟子字义疏证', titleEn: 'Evidential Study of Meanings in the Mencius', author: '戴震', era: '清乾隆三十二年(1767)', ring: 3, categorySlug: 'confucianism', summary: '戴震考证《孟子》字义以破宋儒"理"之虚说,主张"理存乎欲",开清代新儒学先声。', significance: '清代思想转向代表作,为近代以欲代理思潮先驱。', difficulty: 5, oxStageMin: 7, oxStageMax: 10, readingMins: 70, tags: ['戴震', '考据', '理欲', '字义'], sortOrder: 509,
    chapters: [{ chapterNo: 1, title: '理者情之不爽失', originalText: '理也者,情之不爽失也;未有情不得而理得者也。凡有所施于人,反躬而静思之:人以此施于我,能受之乎?凡有所责于人,反躬而静思之:人以此责于我,能尽之乎?', commentary: '理不在情之外,而在情之中。通情达理才是真理,脱离人情的"理"是伪理。', practiceHint: '今日批评下属前,先反问:这句话换到我身上,我能接受吗?' }] },
];

async function main() {
  console.log('🌱 M38.31 经论++ v31 精修第二十一轮 — 儒家经典深化\n');
  let s=0,c=0;
  for (const def of NEW_SCRIPTURES) {
    const cat = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
    if (!cat) { console.warn('  ⚠', def.categorySlug); continue; }
    const sc = await prisma.scripture.upsert({
      where: { slug: def.slug },
      create: { slug:def.slug,title:def.title,titleEn:def.titleEn,author:def.author,era:def.era,ring:def.ring,categoryId:cat.id,tradition:cat.tradition,summary:def.summary,significance:def.significance,difficulty:def.difficulty,oxStageMin:def.oxStageMin,oxStageMax:def.oxStageMax,readingMins:def.readingMins,tags:def.tags,sortOrder:def.sortOrder,isPublished:true },
      update: { title:def.title,titleEn:def.titleEn,author:def.author,era:def.era,ring:def.ring,categoryId:cat.id,tradition:cat.tradition,summary:def.summary,significance:def.significance,difficulty:def.difficulty,oxStageMin:def.oxStageMin,oxStageMax:def.oxStageMax,readingMins:def.readingMins,tags:def.tags,sortOrder:def.sortOrder },
    });
    s++;
    for (const ch of def.chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: sc.id, chapterNo: ch.chapterNo } },
        create: { scriptureId:sc.id,chapterNo:ch.chapterNo,title:ch.title,subtitle:ch.subtitle,originalText:ch.originalText,commentary:ch.commentary,practiceHint:ch.practiceHint },
        update: { title:ch.title,subtitle:ch.subtitle,originalText:ch.originalText,commentary:ch.commentary,practiceHint:ch.practiceHint },
      });
      c++;
    }
    await prisma.scripture.update({ where: { slug: def.slug }, data: { chapterCount: def.chapters.length } });
  }
  console.log(`  ✓ ${s} 经论 ${c} 章节`);
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const rel = await prisma.scripture.findMany({ where: { slug: { in: def.relatedSlugs } }, select: { id: true } });
    if (rel.length) await prisma.scripture.update({ where: { slug: def.slug }, data: { relatedIds: rel.map(r => r.id) } });
  }
  console.log(`📜 v31 完成. 总数:`, await prisma.scripture.count(), '/', await prisma.scriptureChapter.count());
}
main().catch(e => { console.error('❌', e); process.exit(1); }).finally(() => prisma.$disconnect());
