"""Second-pass 60→300 replacement for strings missed by v1.
Preserves: 祖庭 terminology, historical numbers (e.g., 360 idols at Kaaba), booking-lead-time.
"""
from pathlib import Path
ROOT = Path(r"E:\ZUTING")

EDITS = [
    ("apps/web/src/lib/i18n/th.json", [
        ('"home.howItWorks.step1Desc": "ค้นหา 12 ศาสนา 60 สถานที่ศักดิ์สิทธิ์ทั่วโลก หาจุดหมายที่สะท้อนจิตวิญญาณของคุณ",',
         '"home.howItWorks.step1Desc": "ค้นหา 12 ประเพณีวัฒนธรรม 300+ สถานที่ศักดิ์สิทธิ์ทั่วโลก หาจุดหมายที่สะท้อนจิตวิญญาณของคุณ",'),
        ('"home.aiChatDesc": "เสี่ยวหงรู้วัฒนธรรมและประวัติศาสตร์ของ 12 ศาสนา 60 สถานที่ศักดิ์สิทธิ์ และ 27 วัดบรรพบุรุษทั่วโลก ถามเกี่ยวกับเส้นทางแสวงบุญ การปฏิบัติ หรือวัฒนธรรมทางศาสนา",',
         '"home.aiChatDesc": "เสี่ยวหงรู้วัฒนธรรมและประวัติศาสตร์ของ 12 ประเพณีวัฒนธรรม 300+ สถานที่ศักดิ์สิทธิ์ และ 27 วัดบรรพบุรุษทั่วโลก ถามเกี่ยวกับเส้นทางการเดินทางทางวัฒนธรรม การปฏิบัติ หรือวัฒนธรรม",'),
    ]),
    ("apps/web/src/lib/i18n/en.json", [
        ('"chat.welcomeFull": "🙏 Hello! I\'m Xiaohong, your wise cultural travel assistant.\\n\\nI\'m well-versed in 12 major cultural traditions, 60 heritage sites, and 27 ancestral temples around the world. Whether you want to learn about cultural journey routes, spiritual practices, or cultural wisdom, feel free to ask.\\n\\nHow can I help you today?",',
         '"chat.welcomeFull": "🙏 Hello! I\'m Xiaohong, your wise cultural travel assistant.\\n\\nI\'m well-versed in 12 major cultural traditions, 300+ heritage sites, and 27 ancestral temples around the world. Whether you want to learn about cultural journey routes, spiritual practices, or cultural wisdom, feel free to ask.\\n\\nHow can I help you today?",'),
        ('"home.aiChatDesc": "XiaoHong knows the culture and history of 12 cultural traditions, 60 heritage sites, and 27 ancestral temples worldwide. Ask about cultural journey routes, practices, or cultural wisdom.",',
         '"home.aiChatDesc": "XiaoHong knows the culture and history of 12 cultural traditions, 300+ heritage sites, and 27 ancestral temples worldwide. Ask about cultural journey routes, practices, or cultural wisdom.",'),
    ]),
    ("apps/web/src/lib/i18n/ar.json", [
        ('"about.feature.map.desc": "خريطة تفاعلية لأكثر من 60 موقعاً",',
         '"about.feature.map.desc": "خريطة تفاعلية لأكثر من 300 موقعاً",'),
        ('"chat.welcomeFull": "🙏 مرحبًا! أنا شياوهونغ، مساعدك الذكي لرحلات الحج.\\n\\nأنا على دراية بـ 12 ديانة كبرى و60 موقعًا مقدسًا و27 معبدًا أصليًا حول العالم. سواء أردت معرفة طرق الحج أو أساليب التأمل أو الثقافة الدينية، لا تتردد في السؤال.\\n\\nكيف يمكنني مساعدتك اليوم؟",',
         '"chat.welcomeFull": "🙏 مرحبًا! أنا شياوهونغ، مساعدك الذكي للسفر الثقافي.\\n\\nأنا على دراية بـ 12 تقليدًا ثقافيًا كبرى و300+ موقعًا مقدسًا و27 معبدًا أصليًا حول العالم. سواء أردت معرفة طرق السفر الثقافي أو أساليب التأمل أو التراث الثقافي، لا تتردد في السؤال.\\n\\nكيف يمكنني مساعدتك اليوم؟",'),
        ('"home.howItWorks.step1Desc": "تصفح 12 ديانة، 60 موقعاً مقدساً عالمياً، واعثر على وجهات تتردد مع روحك.",',
         '"home.howItWorks.step1Desc": "تصفح 12 تقليدًا ثقافيًا، 300+ موقعاً مقدساً عالمياً، واعثر على وجهات تتردد مع روحك.",'),
        ('"home.aiChatDesc": "شياوهونغ يعرف ثقافة وتاريخ 12 ديانة، 60 موقعاً مقدساً، و27 معبداً أسلافياً حول العالم. اسأل عن مسارات الحج أو الممارسات أو الثقافة الدينية.",',
         '"home.aiChatDesc": "شياوهونغ يعرف ثقافة وتاريخ 12 تقليدًا ثقافيًا، 300+ موقعاً مقدساً، و27 معبداً أسلافياً حول العالم. اسأل عن مسارات السفر الثقافي أو الممارسات أو التراث الثقافي.",'),
    ]),
    ("apps/web/src/app/map/page.tsx", [
        ('description: "在交互式世界地图上探索全球60个圣地与27座祖庭，横跨12大文化传统",',
         'description: "在交互式世界地图上探索全球300+圣地与27座祖庭，横跨12大文化传统",'),
    ]),
    ("apps/web/src/app/layout.tsx", [
        ('"加入我们，探索世界。Joinus是全球领先的文化旅行平台，精选12大文化传统、60+圣地目的地、专业路线规划、AI旅行顾问。Join us, explore the world — the leading cultural travel platform with curated routes, 60+ destinations, and AI trip planning.",',
         '"加入我们，探索世界。Joinus是全球领先的文化旅行平台，精选12大文化传统、300+圣地目的地、专业路线规划、AI旅行顾问。Join us, explore the world — the leading cultural travel platform with curated routes, 300+ destinations, and AI trip planning.",'),
        ('"加入我们，探索世界。全球领先的文化旅行平台，精选路线、60+圣地目的地、AI旅行顾问。Join us, explore the world.",',
         '"加入我们，探索世界。全球领先的文化旅行平台，精选路线、300+圣地目的地、AI旅行顾问。Join us, explore the world.",'),
    ]),
    ("apps/web/src/app/terms/page.tsx", [
        ('<li>全球60个文化圣地的信息查询与导览。</li>',
         '<li>全球300+文化圣地的信息查询与导览。</li>'),
    ]),
    ("apps/web/src/app/team-culture/page.tsx", [
        ('"把团建升级为团队文化打造：6大文化主题包，60座祖庭圣地，12大文化传统深度共修，让文化之旅成为组织最深的纪念。"',
         '"把团建升级为团队文化打造：6大文化主题包，300+座祖庭圣地，12大文化传统深度共修，让文化之旅成为组织最深的纪念。"'),
    ]),
    ("apps/mobile/app/team-culture.tsx", [
        ("{ n: '02', icon: '🗺️', title: '文化探访定制', sub: '12 文化传统 × 60 圣地匹配 → 专属方案书' }",
         "{ n: '02', icon: '🗺️', title: '文化探访定制', sub: '12 文化传统 × 300+ 圣地匹配 → 专属方案书' }"),
    ]),
    ("apps/mobile/app/about.tsx", [
        ("{ icon: 'location-outline' as const, label: '60+圣地', desc: '覆盖全球文化圣地与文化探访目的地' }",
         "{ icon: 'location-outline' as const, label: '300+圣地', desc: '覆盖全球文化圣地与文化探访目的地' }"),
    ]),
    ("apps/mobile/src/lib/i18n/ar.json", [
        ('"home.heroSubtitle": "استكشف أكثر من 60 موقعاً ثقافياً مقدساً حول العالم · سفر عميق",',
         '"home.heroSubtitle": "استكشف أكثر من 300 موقعاً ثقافياً مقدساً حول العالم · سفر عميق",'),
    ]),
    ("apps/h5/src/lib/i18n/th.json", [
        ('"home.howItWorks.step1Desc": "ค้นหา 12 ศาสนา 60 สถานที่ศักดิ์สิทธิ์ทั่วโลก หาจุดหมายที่สะท้อนจิตวิญญาณของคุณ",',
         '"home.howItWorks.step1Desc": "ค้นหา 12 ประเพณีวัฒนธรรม 300+ สถานที่ศักดิ์สิทธิ์ทั่วโลก หาจุดหมายที่สะท้อนจิตวิญญาณของคุณ",'),
        ('"home.aiChatDesc": "เสี่ยวหงรู้วัฒนธรรมและประวัติศาสตร์ของ 12 ศาสนา 60 สถานที่ศักดิ์สิทธิ์ และ 27 วัดบรรพบุรุษทั่วโลก ถามเกี่ยวกับเส้นทางแสวงบุญ การปฏิบัติ หรือวัฒนธรรมทางศาสนา",',
         '"home.aiChatDesc": "เสี่ยวหงรู้วัฒนธรรมและประวัติศาสตร์ของ 12 ประเพณีวัฒนธรรม 300+ สถานที่ศักดิ์สิทธิ์ และ 27 วัดบรรพบุรุษทั่วโลก ถามเกี่ยวกับเส้นทางการเดินทางทางวัฒนธรรม การปฏิบัติ หรือวัฒนธรรม",'),
    ]),
    ("apps/h5/src/lib/i18n/ar.json", [
        ('"about.feature.map.desc": "خريطة تفاعلية لأكثر من 60 موقعاً",',
         '"about.feature.map.desc": "خريطة تفاعلية لأكثر من 300 موقعاً",'),
        ('"chat.welcomeFull": "🙏 مرحبًا! أنا شياوهونغ، مساعدك الذكي لرحلات الحج.\\n\\nأنا على دراية بـ 12 ديانة كبرى و60 موقعًا مقدسًا و27 معبدًا أصليًا حول العالم. سواء أردت معرفة طرق الحج أو أساليب التأمل أو الثقافة الدينية، لا تتردد في السؤال.\\n\\nكيف يمكنني مساعدتك اليوم؟",',
         '"chat.welcomeFull": "🙏 مرحبًا! أنا شياوهونغ، مساعدك الذكي للسفر الثقافي.\\n\\nأنا على دراية بـ 12 تقليدًا ثقافيًا كبرى و300+ موقعًا مقدسًا و27 معبدًا أصليًا حول العالم. سواء أردت معرفة طرق السفر الثقافي أو أساليب التأمل أو التراث الثقافي، لا تتردد في السؤال.\\n\\nكيف يمكنني مساعدتك اليوم؟",'),
        ('"home.howItWorks.step1Desc": "تصفح 12 ديانة، 60 موقعاً مقدساً عالمياً، واعثر على وجهات تتردد مع روحك.",',
         '"home.howItWorks.step1Desc": "تصفح 12 تقليدًا ثقافيًا، 300+ موقعاً مقدساً عالمياً، واعثر على وجهات تتردد مع روحك.",'),
        ('"home.aiChatDesc": "شياوهونغ يعرف ثقافة وتاريخ 12 ديانة، 60 موقعاً مقدساً، و27 معبداً أسلافياً حول العالم. اسأل عن مسارات الحج أو الممارسات أو الثقافة الدينية.",',
         '"home.aiChatDesc": "شياوهونغ يعرف ثقافة وتاريخ 12 تقليدًا ثقافيًا، 300+ موقعاً مقدساً، و27 معبداً أسلافياً حول العالم. اسأل عن مسارات السفر الثقافي أو الممارسات أو التراث الثقافي.",'),
    ]),
    ("apps/miniprogram/src/lib/i18n/zh-CN.json", [
        ('"home.highlight.sites": "60+圣地",',
         '"home.highlight.sites": "300+圣地",'),
    ]),
    ("apps/miniprogram/src/lib/i18n/hi.json", [
        ('"home.trustLine": "12 परंपराएँ · 60+ स्थल · विशेषज्ञ मार्ग · AI यात्रा सलाहकार",',
         '"home.trustLine": "12 परंपराएँ · 300+ स्थल · विशेषज्ञ मार्ग · AI यात्रा सलाहकार",'),
        ('"home.highlight.sites": "60+ स्थल",',
         '"home.highlight.sites": "300+ स्थल",'),
    ]),
    ("apps/miniprogram/src/lib/i18n/ar.json", [
        ('"home.heroSubtitle": "استكشف 60+ موقعاً ثقافياً مقدساً حول العالم",',
         '"home.heroSubtitle": "استكشف 300+ موقعاً ثقافياً مقدساً حول العالم",'),
        ('"home.trustLine": "12 تقليداً · 60+ موقعاً · مسارات متخصصة · مستشار سفر AI",',
         '"home.trustLine": "12 تقليداً · 300+ موقعاً · مسارات متخصصة · مستشار سفر AI",'),
        ('"home.highlight.sites": "60+ موقع",',
         '"home.highlight.sites": "300+ موقع",'),
    ]),
    ("apps/miniprogram/src/pages/team-culture/index.tsx", [
        ("{ n: '02', icon: '🗺️', title: '文化探访定制', sub: '12 文化传统 × 60 圣地匹配' }",
         "{ n: '02', icon: '🗺️', title: '文化探访定制', sub: '12 文化传统 × 300+ 圣地匹配' }"),
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
        src = p.read_text(encoding="utf-8")
        new = src
        file_edits = 0
        for old, repl in pairs:
            if old in new:
                new = new.replace(old, repl, 1)
                file_edits += 1
            else:
                skipped.append((rel, f"NOT FOUND: {old[:60]!r}"))
        if file_edits > 0:
            p.write_text(new, encoding="utf-8")
            total_files += 1
            total_edits += file_edits
            print(f"[{file_edits}] {rel}")
    print(f"\n=== {total_edits} edits across {total_files} files ===")
    if skipped:
        print(f"\n=== SKIPPED ({len(skipped)}) ===")
        for rel, reason in skipped:
            print(f"  {rel}: {reason}")

if __name__ == "__main__":
    main()
