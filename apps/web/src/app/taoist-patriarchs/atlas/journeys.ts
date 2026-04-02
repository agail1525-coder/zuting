// ═══════════════════════════════════════════════════════════════════════════
// 道教先贤大图谱 — 29位先贤坐标 + 3位核心先贤人生轨迹数据
// Grand Taoism Patriarch Atlas — Geographic & Journey Data
// ═══════════════════════════════════════════════════════════════════════════

import type { PatriarchMapData } from "@/components/atlas";

export const SCHOOL_COLORS: Record<string, string> = {
  道家: "#10B981",
  天师道: "#059669",
  全真道: "#34D399",
  正一道: "#6EE7B7",
  上清派: "#A7F3D0",
  灵宝派: "#D1FAE5",
  净明道: "#10B981",
  太平道: "#10B981",
};

export const PATRIARCH_JOURNEYS: PatriarchMapData[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 1 — 3位核心先贤（完整人生轨迹）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── 1. 老子 (~571-471BC) ─────────────────────────────────────────────
  {
    name: "老子",
    nameEn: "Laozi",
    school: "道家",
    primaryLat: 34.05,
    primaryLng: 115.65,
    journeyWaypoints: [
      {
        lat: 34.05, lng: 115.65, year: -571, type: "birth",
        event: "降世于楚国苦县厉乡曲仁里（今河南鹿邑），姓李名耳，字聃。传说母怀孕八十一年，生而白发，故号老子",
        eventEn: "Born in Ku County, Chu State (modern Luyi, Henan). Surname Li, given name Er. Legend says his mother carried him 81 years; born white-haired.",
      },
      {
        lat: 34.76, lng: 112.45, year: -540, type: "teaching",
        event: "任东周洛阳守藏室之史（国家图书馆馆长），博览天下典籍，通晓礼乐制度。孔子曾专程赴洛阳向其问礼",
        eventEn: "Served as Keeper of the Archives at the Zhou court in Luoyang. Master of all classical texts. Confucius traveled to consult him on rites.",
      },
      {
        lat: 34.52, lng: 110.30, year: -500, type: "pilgrimage",
        event: "见周室衰微，骑青牛西出函谷关。关令尹喜见紫气东来，知圣人将至，恳请著书。遂写《道德经》五千言，上篇论道，下篇论德",
        eventEn: "Seeing Zhou's decline, rode a water buffalo westward through Hangu Pass. Guardian Yin Xi saw purple qi, asked him to write. Composed the Tao Te Ching, 5,000 characters.",
      },
      {
        lat: 35.00, lng: 105.00, year: -480, type: "death",
        event: "出关后不知所终，传说化胡西去，或隐于流沙之西。司马迁叹「老子，隐君子也」。其道化为万世不灭之玄学根基",
        eventEn: "After passing through the gate, his fate is unknown. Legend says he went west into the desert. Sima Qian wrote: 'Laozi was a hidden sage.' His Tao became eternal philosophy.",
      },
    ],
  },

  // ── 2. 张道陵 (34-156) ──────────────────────────────────────────────
  {
    name: "张道陵",
    nameEn: "Zhang Daoling",
    school: "天师道",
    primaryLat: 30.55,
    primaryLng: 103.38,
    journeyWaypoints: [
      {
        lat: 34.70, lng: 116.60, year: 34, type: "birth",
        event: "降世于沛国丰县（今江苏丰县），为西汉留侯张良八世孙。少通五经，曾举孝廉，官拜江州令，后弃官入道",
        eventEn: "Born in Feng County, Pei State (modern Jiangsu). 8th-gen descendant of Zhang Liang. Mastered Five Classics, served as official, then renounced office for Tao.",
      },
      {
        lat: 30.55, lng: 103.38, year: 126, type: "pilgrimage",
        event: "年逾九旬入蜀，修道于鹤鸣山（今四川大邑），传说太上老君亲降授以「正一盟威之道」、三天正法及雌雄剑、都功印等法物",
        eventEn: "At over 90, entered Shu and practiced on Heming Mountain (Dayi, Sichuan). Legend: Taishang Laojun descended and bestowed the Way of Orthodox Unity.",
      },
      {
        lat: 30.55, lng: 103.38, year: 142, type: "founding",
        event: "在鹤鸣山正式创立天师道（五斗米道），设二十四治（教区），收信众缴五斗米入教。建立道教最早的教团组织与科仪体系",
        eventEn: "Formally founded Tianshi Dao (Five Pecks of Rice) at Heming Mountain. Established 24 parishes, tithing system, and the earliest Taoist liturgical organization.",
      },
      {
        lat: 30.90, lng: 103.57, year: 145, type: "teaching",
        event: "移驻青城山传道弘法，以符箓、斋醮、存思为修行法门。青城山自此成为道教四大名山之首，天师道祖庭圣地",
        eventEn: "Moved to Qingcheng Mountain to teach. Practiced talismans, rituals, and meditation. Qingcheng became the foremost of Taoism's Four Sacred Mountains.",
      },
      {
        lat: 33.07, lng: 107.03, year: 156, type: "death",
        event: "飞升于汉中（一说云台山），享年一百二十三岁。传衣钵与子张衡、孙张鲁，世称「三张」，天师之位代代相传至今六十五代",
        eventEn: "Ascended at Hanzhong (or Yuntai Mountain), aged 123. Passed lineage to son Zhang Heng and grandson Zhang Lu. Tianshi lineage continues to the 65th generation.",
      },
    ],
  },

  // ── 3. 丘处机 (1148-1227) ──────────────────────────────────────────
  {
    name: "丘处机",
    nameEn: "Qiu Chuji",
    school: "全真道",
    primaryLat: 39.90,
    primaryLng: 116.36,
    journeyWaypoints: [
      {
        lat: 37.31, lng: 120.85, year: 1148, type: "birth",
        event: "降世于登州栖霞（今山东栖霞市），幼失父母，少年即立志修道。十九岁入昆嵛山拜王重阳为师，为全真七子之一",
        eventEn: "Born in Qixia, Dengzhou (modern Shandong). Orphaned young, resolved to cultivate the Tao. At 19, joined Wang Chongyang on Kunyu Mountain as one of the Seven Perfected.",
      },
      {
        lat: 34.00, lng: 108.90, year: 1174, type: "dharma",
        event: "在终南山磻溪洞穴苦修六年，又在龙门洞修炼七年。忍饥寒、断世缘，终大悟全真心性之法，创龙门派",
        eventEn: "Practiced austerities in Panxi cave on Zhongnan Mountain for 6 years, then 7 years in Longmen cave. Through hunger and cold, attained enlightenment and founded the Longmen lineage.",
      },
      {
        lat: 47.92, lng: 106.92, year: 1222, type: "pilgrimage",
        event: "年逾七旬应成吉思汗之召，率十八弟子自山东西行万里至大雪山（今阿富汗兴都库什山），历时三年。以「敬天爱民」「清心寡欲」之道劝谏大汗止杀，获赐「神仙」称号",
        eventEn: "At over 70, summoned by Genghis Khan. Led 18 disciples 10,000 li westward to the Hindu Kush over 3 years. Advised the Khan to stop killing; earned the title 'Divine Immortal.'",
      },
      {
        lat: 39.90, lng: 116.36, year: 1224, type: "founding",
        event: "返回燕京（北京），主持天长观（今白云观），获蒙古朝廷赐掌管天下道教事务之权。白云观成为全真道第一丛林、龙门派祖庭",
        eventEn: "Returned to Beijing, presided over Tianchang Temple (now White Cloud Temple). Granted authority over all Taoist affairs. Baiyun Temple became Quanzhen's premier monastery.",
      },
      {
        lat: 39.90, lng: 116.36, year: 1227, type: "death",
        event: "飞升于北京长春宫（白云观），世称「长春真人」。一生以道济世，万里西行止杀，全真龙门派由此大兴，传承至今不绝",
        eventEn: "Ascended at Changchun Palace (Baiyun Temple), Beijing. Known as 'Perfected Changchun.' His westward journey to stop killing made Longmen Quanzhen flourish to this day.",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tier 2 — 其他先贤（坐标数据）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    name: "庄子", nameEn: "Zhuangzi", school: "道家",
    primaryLat: 34.42, primaryLng: 115.65, journeyWaypoints: [],
  },
  {
    name: "列子", nameEn: "Liezi", school: "道家",
    primaryLat: 34.76, primaryLng: 112.45, journeyWaypoints: [],
  },
  {
    name: "张鲁", nameEn: "Zhang Lu", school: "天师道",
    primaryLat: 33.07, primaryLng: 107.03, journeyWaypoints: [],
  },
  {
    name: "葛洪", nameEn: "Ge Hong", school: "道家",
    primaryLat: 22.27, primaryLng: 114.18, journeyWaypoints: [],
  },
  {
    name: "陶弘景", nameEn: "Tao Hongjing", school: "上清派",
    primaryLat: 32.06, primaryLng: 118.79, journeyWaypoints: [],
  },
  {
    name: "寇谦之", nameEn: "Kou Qianzhi", school: "天师道",
    primaryLat: 34.76, primaryLng: 112.45, journeyWaypoints: [],
  },
  {
    name: "陆修静", nameEn: "Lu Xiujing", school: "灵宝派",
    primaryLat: 28.68, primaryLng: 115.89, journeyWaypoints: [],
  },
  {
    name: "司马承祯", nameEn: "Sima Chengzhen", school: "上清派",
    primaryLat: 34.97, primaryLng: 112.07, journeyWaypoints: [],
  },
  {
    name: "吕洞宾", nameEn: "Lu Dongbin", school: "全真道",
    primaryLat: 34.87, primaryLng: 110.42, journeyWaypoints: [],
  },
  {
    name: "钟离权", nameEn: "Zhongli Quan", school: "全真道",
    primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [],
  },
  {
    name: "王重阳", nameEn: "Wang Chongyang", school: "全真道",
    primaryLat: 34.26, primaryLng: 108.94, journeyWaypoints: [],
  },
  {
    name: "马钰", nameEn: "Ma Yu", school: "全真道",
    primaryLat: 37.53, primaryLng: 122.11, journeyWaypoints: [],
  },
  {
    name: "谭处端", nameEn: "Tan Chuduan", school: "全真道",
    primaryLat: 37.53, primaryLng: 122.11, journeyWaypoints: [],
  },
  {
    name: "刘处玄", nameEn: "Liu Chuxuan", school: "全真道",
    primaryLat: 37.38, primaryLng: 121.64, journeyWaypoints: [],
  },
  {
    name: "王处一", nameEn: "Wang Chuyi", school: "全真道",
    primaryLat: 37.31, primaryLng: 122.41, journeyWaypoints: [],
  },
  {
    name: "郝大通", nameEn: "Hao Datong", school: "全真道",
    primaryLat: 37.53, primaryLng: 122.11, journeyWaypoints: [],
  },
  {
    name: "孙不二", nameEn: "Sun Bu'er", school: "全真道",
    primaryLat: 37.53, primaryLng: 122.11, journeyWaypoints: [],
  },
  {
    name: "张伯端", nameEn: "Zhang Boduan", school: "全真道",
    primaryLat: 28.00, primaryLng: 120.65, journeyWaypoints: [],
  },
  {
    name: "白玉蟾", nameEn: "Bai Yuchan", school: "全真道",
    primaryLat: 19.90, primaryLng: 110.35, journeyWaypoints: [],
  },
  {
    name: "陈抟", nameEn: "Chen Tuan", school: "道家",
    primaryLat: 34.40, primaryLng: 110.09, journeyWaypoints: [],
  },
  {
    name: "张三丰", nameEn: "Zhang Sanfeng", school: "全真道",
    primaryLat: 32.40, primaryLng: 111.00, journeyWaypoints: [],
  },
  {
    name: "萨守坚", nameEn: "Sa Shoujian", school: "正一道",
    primaryLat: 26.06, primaryLng: 119.30, journeyWaypoints: [],
  },
  {
    name: "林灵素", nameEn: "Lin Lingsu", school: "正一道",
    primaryLat: 28.00, primaryLng: 120.65, journeyWaypoints: [],
  },
  {
    name: "张宇初", nameEn: "Zhang Yuchu", school: "正一道",
    primaryLat: 28.10, primaryLng: 116.97, journeyWaypoints: [],
  },
  {
    name: "张继先", nameEn: "Zhang Jixian", school: "正一道",
    primaryLat: 28.10, primaryLng: 116.97, journeyWaypoints: [],
  },
  {
    name: "魏伯阳", nameEn: "Wei Boyang", school: "道家",
    primaryLat: 30.25, primaryLng: 120.17, journeyWaypoints: [],
  },
];
