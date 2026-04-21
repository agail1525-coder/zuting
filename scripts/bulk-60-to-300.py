"""Bulk replace numeric '60' → '300' in site-count copy across web/h5/mobile/mini i18n files + hardcoded components.

Preserves:
 - 祖庭 / 走祖庭 / 把祖庭 terminology (user directive — keep ALL)
 - AGING age: '60+' (culture-life pillar, unrelated)
 - 'N+ days ahead' / 'N+' in booking-lead-time contexts
 - '3+' / other unrelated numbers

Strategy: exact-string find/replace list per file, skip files on no-match.
"""
from pathlib import Path

ROOT = Path(r"E:\ZUTING")

# Each tuple: (relative_path, [(old, new), ...])
# Rule: old must be the CURRENT line content (grep-verified), new is the same with 60→300.
EDITS = [
    # --- web i18n ---
    ("apps/web/src/lib/i18n/th.json", [
        ('"about.cta.desc": "สำรวจ 60+ สถานที่ศักดิ์สิทธิ์ทั่วโลก วางแผนเส้นทางเฉพาะ",',
         '"about.cta.desc": "สำรวจ 300+ สถานที่ศักดิ์สิทธิ์ทั่วโลก วางแผนเส้นทางเฉพาะ",'),
        ('"about.feature.map.desc": "แผนที่อินเทอร์แอคทีฟ 60+ สถานที่",',
         '"about.feature.map.desc": "แผนที่อินเทอร์แอคทีฟ 300+ สถานที่",'),
        ('"about.milestone.launch": "เปิดตัว — 12 ศาสนา, 60+ สถานที่, 7 ภาษา",',
         '"about.milestone.launch": "เปิดตัว — 12 ประเพณีวัฒนธรรม, 300+ สถานที่, 7 ภาษา",'),
        ('"login.benefit2Title": "บันทึก 60+ สถานที่",',
         '"login.benefit2Title": "บันทึก 300+ สถานที่",'),
        ('"chat.feature.sites": "60+ Holy Sites",',
         '"chat.feature.sites": "300+ Holy Sites",'),
    ]),
    ("apps/web/src/lib/i18n/ko.json", [
        ('"about.cta.desc": "전 세계 60+ 성지 탐색, 맞춤 경로 계획",',
         '"about.cta.desc": "전 세계 300+ 성지 탐색, 맞춤 경로 계획",'),
        ('"about.feature.map.desc": "60+ 성지 인터랙티브 지도",',
         '"about.feature.map.desc": "300+ 성지 인터랙티브 지도",'),
        ('"about.milestone.launch": "플랫폼 출시 — 12 신앙, 60+ 성지, 7개 언어",',
         '"about.milestone.launch": "플랫폼 출시 — 12 문화 전통, 300+ 성지, 7개 언어",'),
        ('"login.benefit2Title": "60+ 성지 저장",',
         '"login.benefit2Title": "300+ 성지 저장",'),
        ('"chat.feature.sites": "60+ 성지",',
         '"chat.feature.sites": "300+ 성지",'),
    ]),
    ("apps/web/src/lib/i18n/ja.json", [
        ('"about.feature.map.desc": "60+聖地のインタラクティブ地図",',
         '"about.feature.map.desc": "300+聖地のインタラクティブ地図",'),
        ('"about.milestone.launch": "プラットフォーム公開 — 12信仰, 60+聖地, 7言語",',
         '"about.milestone.launch": "プラットフォーム公開 — 12文化伝統, 300+聖地, 7言語",'),
        ('"login.benefit2Title": "60+の聖地を保存",',
         '"login.benefit2Title": "300+の聖地を保存",'),
        ('"chat.feature.sites": "60+聖地",',
         '"chat.feature.sites": "300+聖地",'),
    ]),
    ("apps/web/src/lib/i18n/hi.json", [
        ('"about.cta.desc": "विश्व भर के 60+ पवित्र स्थलों का अन्वेषण करें",',
         '"about.cta.desc": "विश्व भर के 300+ पवित्र स्थलों का अन्वेषण करें",'),
        ('"about.feature.map.desc": "60+ पवित्र स्थलों का इंटरैक्टिव मानचित्र",',
         '"about.feature.map.desc": "300+ पवित्र स्थलों का इंटरैक्टिव मानचित्र",'),
        ('"about.milestone.launch": "प्लेटफ़ॉर्म लॉन्च — 12 धर्म, 60+ पवित्र स्थल, 7 भाषाएँ",',
         '"about.milestone.launch": "प्लेटफ़ॉर्म लॉन्च — 12 सांस्कृतिक परंपराएं, 300+ पवित्र स्थल, 7 भाषाएँ",'),
        ('"login.benefit2Title": "60+ पवित्र स्थल सहेजें",',
         '"login.benefit2Title": "300+ पवित्र स्थल सहेजें",'),
        ('"chat.feature.sites": "60+ Holy Sites",',
         '"chat.feature.sites": "300+ Holy Sites",'),
    ]),
    ("apps/web/src/lib/i18n/en.json", [
        ('"about.cta.desc": "Explore 60+ heritage sites worldwide, plan your exclusive route",',
         '"about.cta.desc": "Explore 300+ heritage sites worldwide, plan your exclusive route",'),
        ('"about.feature.map.desc": "Interactive map of 60+ heritage sites",',
         '"about.feature.map.desc": "Interactive map of 300+ heritage sites",'),
        ('"about.milestone.launch": "Platform launch — 12 cultural traditions, 60+ heritage sites, 7 languages",',
         '"about.milestone.launch": "Platform launch — 12 cultural traditions, 300+ heritage sites, 7 languages",'),
        ('"trips.empty.rec1.desc": "Discover 60+ heritage sites worldwide",',
         '"trips.empty.rec1.desc": "Discover 300+ heritage sites worldwide",'),
        ('"home.heroSubtitle": "Explore 60+ cultural heritage sites worldwide, experience a journey of ancient wisdom",',
         '"home.heroSubtitle": "Explore 300+ cultural heritage sites worldwide, experience a journey of ancient wisdom",'),
        ('"login.benefit2Title": "Save 60+ Heritage Sites",',
         '"login.benefit2Title": "Save 300+ Heritage Sites",'),
        ('"chat.feature.sites": "60+ Heritage Sites",',
         '"chat.feature.sites": "300+ Heritage Sites",'),
    ]),
    ("apps/web/src/lib/i18n/ar.json", [
        ('"about.cta.desc": "استكشف 60+ موقعًا مقدسًا حول العالم",',
         '"about.cta.desc": "استكشف 300+ موقعًا مقدسًا حول العالم",'),
        ('"about.milestone.launch": "إطلاق المنصة — 12 ديانة، 60+ موقع مقدس، 7 لغات",',
         '"about.milestone.launch": "إطلاق المنصة — 12 تقليدًا ثقافيًا، 300+ موقع مقدس، 7 لغات",'),
        ('"login.benefit2Title": "احفظ 60+ موقعاً مقدساً",',
         '"login.benefit2Title": "احفظ 300+ موقعاً مقدساً",'),
        ('"chat.feature.sites": "60+ Holy Sites",',
         '"chat.feature.sites": "300+ Holy Sites",'),
    ]),
    # --- mobile i18n ---
    ("apps/mobile/src/lib/i18n/zh-CN.json", [
        ('"home.highlight.sites": "60+圣地",',
         '"home.highlight.sites": "300+圣地",'),
    ]),
    ("apps/mobile/src/lib/i18n/en.json", [
        ('"home.heroSubtitle": "Explore 60+ cultural holy sites worldwide · Immersive travel",',
         '"home.heroSubtitle": "Explore 300+ cultural holy sites worldwide · Immersive travel",'),
        ('"home.trustBadge": "12 Traditions · 60+ Holy Sites · Expert Routes · AI Travel Advisor",',
         '"home.trustBadge": "12 Traditions · 300+ Holy Sites · Expert Routes · AI Travel Advisor",'),
        ('"home.highlight.sites": "60+ Sites",',
         '"home.highlight.sites": "300+ Sites",'),
    ]),
    ("apps/mobile/src/lib/i18n/th.json", [
        ('"home.trustBadge": "12 ศาสนา · 60+ สถานที่ศักดิ์สิทธิ์ · เส้นทางมืออาชีพ · ที่ปรึกษาท่องเที่ยว AI",',
         '"home.trustBadge": "12 ประเพณีวัฒนธรรม · 300+ สถานที่ศักดิ์สิทธิ์ · เส้นทางมืออาชีพ · ที่ปรึกษาท่องเที่ยว AI",'),
        ('"home.highlight.sites": "60+ สถานที่",',
         '"home.highlight.sites": "300+ สถานที่",'),
    ]),
    ("apps/mobile/src/lib/i18n/hi.json", [
        ('"home.heroSubtitle": "दुनिया भर के 60+ सांस्कृतिक तीर्थस्थलों की खोज करें · गहन यात्रा",',
         '"home.heroSubtitle": "दुनिया भर के 300+ सांस्कृतिक तीर्थस्थलों की खोज करें · गहन यात्रा",'),
        ('"home.trustBadge": "12 परंपराएं · 60+ तीर्थस्थल · विशेषज्ञ मार्ग · AI यात्रा सलाहकार",',
         '"home.trustBadge": "12 परंपराएं · 300+ तीर्थस्थल · विशेषज्ञ मार्ग · AI यात्रा सलाहकार",'),
        ('"home.highlight.sites": "60+ स्थल",',
         '"home.highlight.sites": "300+ स्थल",'),
    ]),
    ("apps/mobile/src/lib/i18n/ar.json", [
        ('"home.trustBadge": "12 تقليداً · 60+ موقع مقدس · مسارات متخصصة · مستشار سفر AI",',
         '"home.trustBadge": "12 تقليداً · 300+ موقع مقدس · مسارات متخصصة · مستشار سفر AI",'),
        ('"home.highlight.sites": "60+ موقع",',
         '"home.highlight.sites": "300+ موقع",'),
    ]),
    # --- h5 i18n ---
    ("apps/h5/src/lib/i18n/zh-CN.json", [
        ('"about.cta.desc": "探索全球60+圣地，规划专属朝圣路线",',
         '"about.cta.desc": "探索全球300+圣地，规划专属文化探访路线",'),
        ('"about.feature.map.desc": "交互式地图探索60+圣地",',
         '"about.feature.map.desc": "交互式地图探索300+圣地",'),
        ('"about.milestone.launch": "平台上线，12大文化传统、60+圣地、7语言支持",',
         '"about.milestone.launch": "平台上线，12大文化传统、300+圣地、7语言支持",'),
        ('"trips.empty.rec1.desc": "发现全球60+宗教圣地",',
         '"trips.empty.rec1.desc": "发现全球300+文化圣地",'),
        ('"login.benefit2Title": "收藏全球60+圣地",',
         '"login.benefit2Title": "收藏全球300+圣地",'),
    ]),
    ("apps/h5/src/lib/i18n/th.json", [
        ('"about.cta.desc": "สำรวจ 60+ สถานที่ศักดิ์สิทธิ์ทั่วโลก วางแผนเส้นทางเฉพาะ",',
         '"about.cta.desc": "สำรวจ 300+ สถานที่ศักดิ์สิทธิ์ทั่วโลก วางแผนเส้นทางเฉพาะ",'),
        ('"about.feature.map.desc": "แผนที่อินเทอร์แอคทีฟ 60+ สถานที่",',
         '"about.feature.map.desc": "แผนที่อินเทอร์แอคทีฟ 300+ สถานที่",'),
        ('"about.milestone.launch": "เปิดตัว — 12 ศาสนา, 60+ สถานที่, 7 ภาษา",',
         '"about.milestone.launch": "เปิดตัว — 12 ประเพณีวัฒนธรรม, 300+ สถานที่, 7 ภาษา",'),
        ('"login.benefit2Title": "บันทึก 60+ สถานที่",',
         '"login.benefit2Title": "บันทึก 300+ สถานที่",'),
        ('"chat.feature.sites": "60+ Holy Sites",',
         '"chat.feature.sites": "300+ Holy Sites",'),
    ]),
    ("apps/h5/src/lib/i18n/ko.json", [
        ('"about.cta.desc": "전 세계 60+ 성지 탐색, 맞춤 경로 계획",',
         '"about.cta.desc": "전 세계 300+ 성지 탐색, 맞춤 경로 계획",'),
        ('"about.feature.map.desc": "60+ 성지 인터랙티브 지도",',
         '"about.feature.map.desc": "300+ 성지 인터랙티브 지도",'),
        ('"about.milestone.launch": "플랫폼 출시 — 12 신앙, 60+ 성지, 7개 언어",',
         '"about.milestone.launch": "플랫폼 출시 — 12 문화 전통, 300+ 성지, 7개 언어",'),
        ('"login.benefit2Title": "60+ 성지 저장",',
         '"login.benefit2Title": "300+ 성지 저장",'),
        ('"chat.feature.sites": "60+ 성지",',
         '"chat.feature.sites": "300+ 성지",'),
    ]),
    ("apps/h5/src/lib/i18n/ja.json", [
        ('"about.feature.map.desc": "60+聖地のインタラクティブ地図",',
         '"about.feature.map.desc": "300+聖地のインタラクティブ地図",'),
        ('"about.milestone.launch": "プラットフォーム公開 — 12信仰, 60+聖地, 7言語",',
         '"about.milestone.launch": "プラットフォーム公開 — 12文化伝統, 300+聖地, 7言語",'),
        ('"login.benefit2Title": "60+の聖地を保存",',
         '"login.benefit2Title": "300+の聖地を保存",'),
        ('"chat.feature.sites": "60+聖地",',
         '"chat.feature.sites": "300+聖地",'),
    ]),
    ("apps/h5/src/lib/i18n/hi.json", [
        ('"about.cta.desc": "विश्व भर के 60+ पवित्र स्थलों का अन्वेषण करें",',
         '"about.cta.desc": "विश्व भर के 300+ पवित्र स्थलों का अन्वेषण करें",'),
        ('"about.feature.map.desc": "60+ पवित्र स्थलों का इंटरैक्टिव मानचित्र",',
         '"about.feature.map.desc": "300+ पवित्र स्थलों का इंटरैक्टिव मानचित्र",'),
        ('"about.milestone.launch": "प्लेटफ़ॉर्म लॉन्च — 12 धर्म, 60+ पवित्र स्थल, 7 भाषाएँ",',
         '"about.milestone.launch": "प्लेटफ़ॉर्म लॉन्च — 12 सांस्कृतिक परंपराएं, 300+ पवित्र स्थल, 7 भाषाएँ",'),
        ('"login.benefit2Title": "60+ पवित्र स्थल सहेजें",',
         '"login.benefit2Title": "300+ पवित्र स्थल सहेजें",'),
        ('"chat.feature.sites": "60+ Holy Sites",',
         '"chat.feature.sites": "300+ Holy Sites",'),
    ]),
    ("apps/h5/src/lib/i18n/en.json", [
        ('"about.cta.desc": "Explore 60+ sacred sites worldwide, plan your exclusive route",',
         '"about.cta.desc": "Explore 300+ sacred sites worldwide, plan your exclusive route",'),
        ('"about.feature.map.desc": "Interactive map of 60+ holy sites",',
         '"about.feature.map.desc": "Interactive map of 300+ holy sites",'),
        ('"about.milestone.launch": "Platform launch — 12 faiths, 60+ sacred sites, 7 languages",',
         '"about.milestone.launch": "Platform launch — 12 cultural traditions, 300+ sacred sites, 7 languages",'),
        ('"trips.empty.rec1.desc": "Discover 60+ sacred sites worldwide",',
         '"trips.empty.rec1.desc": "Discover 300+ sacred sites worldwide",'),
        ('"chat.welcomeFull": "\U0001f64f Hello! I\'m Xiaohong, your wise pilgrimage travel assistant.\\n\\nI\'m well-versed in 12 major faiths, 60 holy sites, and 27 ancestral temples around the world. Whether you want to learn about pilgrimage routes, spiritual practices, or religious culture, feel free to ask.\\n\\nHow can I help you today?",',
         '"chat.welcomeFull": "\U0001f64f Hello! I\'m Xiaohong, your wise cultural travel assistant.\\n\\nI\'m well-versed in 12 major cultural traditions, 300+ holy sites, and 27 ancestral temples around the world. Whether you want to learn about cultural routes, spiritual practices, or cultural heritage, feel free to ask.\\n\\nHow can I help you today?",'),
        ('"home.aiChatDesc": "XiaoHong knows the culture and history of 12 faiths, 60 holy sites, and 27 ancestral temples worldwide. Ask about pilgrimage routes, practices, or religious culture.",',
         '"home.aiChatDesc": "XiaoHong knows the culture and history of 12 cultural traditions, 300+ holy sites, and 27 ancestral temples worldwide. Ask about cultural routes, practices, or heritage.",'),
        ('"home.heroSubtitle": "Explore 60+ cultural sacred sites worldwide, experience a journey of ancient wisdom",',
         '"home.heroSubtitle": "Explore 300+ cultural sacred sites worldwide, experience a journey of ancient wisdom",'),
        ('"login.benefit2Title": "Save 60+ Sacred Sites",',
         '"login.benefit2Title": "Save 300+ Sacred Sites",'),
        ('"chat.feature.sites": "60+ Holy Sites",',
         '"chat.feature.sites": "300+ Holy Sites",'),
    ]),
    ("apps/h5/src/lib/i18n/ar.json", [
        ('"about.cta.desc": "استكشف 60+ موقعًا مقدسًا حول العالم",',
         '"about.cta.desc": "استكشف 300+ موقعًا مقدسًا حول العالم",'),
        ('"about.milestone.launch": "إطلاق المنصة — 12 ديانة، 60+ موقع مقدس، 7 لغات",',
         '"about.milestone.launch": "إطلاق المنصة — 12 تقليدًا ثقافيًا، 300+ موقع مقدس، 7 لغات",'),
        ('"login.benefit2Title": "احفظ 60+ موقعاً مقدساً",',
         '"login.benefit2Title": "احفظ 300+ موقعاً مقدساً",'),
        ('"chat.feature.sites": "60+ Holy Sites",',
         '"chat.feature.sites": "300+ Holy Sites",'),
    ]),
    # --- miniprogram i18n ---
    ("apps/miniprogram/src/lib/i18n/en.json", [
        ('"home.heroSubtitle": "Explore 60+ Cultural Holy Sites Worldwide",',
         '"home.heroSubtitle": "Explore 300+ Cultural Holy Sites Worldwide",'),
        ('"home.trustLine": "12 Traditions · 60+ Sites · Expert Routes · AI Travel Advisor",',
         '"home.trustLine": "12 Traditions · 300+ Sites · Expert Routes · AI Travel Advisor",'),
        ('"home.highlight.sites": "60+ Sites",',
         '"home.highlight.sites": "300+ Sites",'),
    ]),
    # --- hard-coded TSX components ---
    ("apps/web/src/components/SiteGate.tsx", [
        ('探索全球60+文化圣地，体验千年智慧之旅',
         '探索全球300+文化圣地，体验千年智慧之旅'),
        ('60+文化圣地',
         '300+文化圣地'),
    ]),
    ("apps/web/src/components/JsonLd.tsx", [
        ('"全球文化之旅旅行平台，涵盖12大文化传统、60圣地、27祖庭、28祖师、39祖训、30印。"',
         '"全球文化之旅旅行平台，涵盖12大文化传统、300+圣地、27祖庭、28祖师、39祖训、30印。"'),
    ]),
    ("apps/web/src/components/OnboardingModal.tsx", [
        (': "Explore 12 cultural traditions, 60 holy sites, 27 ancestral temples. Begin your cultural journey."',
         ': "Explore 12 cultural traditions, 300+ holy sites, 27 ancestral temples. Begin your cultural journey."'),
    ]),
    ("apps/h5/src/pages/Home.tsx", [
        ('{ n: "60+", l: t("home.statSites") }',
         '{ n: "300+", l: t("home.statSites") }'),
    ]),
    ("apps/h5/src/pages/MapPage.tsx", [
        ('count: "60+"',
         'count: "300+"'),
    ]),
    ("apps/h5/src/pages/About.tsx", [
        ('{ key: "holySites", count: "60+", icon: "🏛️" }',
         '{ key: "holySites", count: "300+", icon: "🏛️" }'),
    ]),
    ("apps/miniprogram/src/pages/about/index.tsx", [
        ("{ number: '60+', label: t('about.statSites') }",
         "{ number: '300+', label: t('about.statSites') }"),
    ]),
]


def main():
    total_files = 0
    total_edits = 0
    skipped = []
    for rel, pairs in EDITS:
        p = ROOT / rel
        if not p.exists():
            skipped.append((rel, "FILE NOT FOUND"))
            continue
        try:
            src = p.read_text(encoding="utf-8")
        except Exception as e:
            skipped.append((rel, f"READ ERROR {e}"))
            continue
        new = src
        file_edits = 0
        for old, repl in pairs:
            if old in new:
                new = new.replace(old, repl, 1)
                file_edits += 1
            else:
                skipped.append((rel, f"PATTERN NOT FOUND: {old[:80]!r}"))
        if file_edits > 0:
            p.write_text(new, encoding="utf-8")
            total_files += 1
            total_edits += file_edits
            print(f"[{file_edits}] {rel}")
    print(f"\n=== SUMMARY: {total_edits} edits across {total_files} files ===")
    if skipped:
        print(f"\n=== SKIPPED ({len(skipped)}) ===")
        for rel, reason in skipped:
            print(f"  {rel}: {reason}")


if __name__ == "__main__":
    main()
