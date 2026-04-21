"""Third-pass 60→300 for final stragglers."""
from pathlib import Path
ROOT = Path(r"E:\ZUTING")

EDITS = [
    ("apps/miniprogram/src/lib/i18n/th.json", [
        ('"home.trustLine": "12 ศาสนา · 60+ สถานที่ · เส้นทางผู้เชี่ยวชาญ · ที่ปรึกษาการเดินทาง AI",',
         '"home.trustLine": "12 ประเพณีวัฒนธรรม · 300+ สถานที่ · เส้นทางผู้เชี่ยวชาญ · ที่ปรึกษาการเดินทาง AI",'),
        ('"home.highlight.sites": "60+ สถานที่",',
         '"home.highlight.sites": "300+ สถานที่",'),
    ]),
    ("apps/miniprogram/src/lib/i18n/hi.json", [
        ('"home.heroSubtitle": "दुनिया भर के 60+ सांस्कृतिक पवित्र स्थलों का अन्वेषण करें",',
         '"home.heroSubtitle": "दुनिया भर के 300+ सांस्कृतिक पवित्र स्थलों का अन्वेषण करें",'),
    ]),
    ("apps/web/src/lib/i18n/th.json", [
        ('"chat.welcomeFull": "🙏 สวัสดีค่ะ! ฉันคือเสี่ยวหง ผู้ช่วยการแสวงบุญอัจฉริยะของคุณ\\n\\nฉันมีความรู้เกี่ยวกับ 12 ศาสนาหลัก 60 สถานที่ศักดิ์สิทธิ์ และ 27 วัดต้นกำเนิดทั่วโลก ไม่ว่าคุณต้องการเรียนรู้เรื่องเส้นทางแสวงบุญ วิธีปฏิบัติธรรม หรือวัฒนธรรมทางศาสนา สอบถามได้เลย\\n\\nวันนี้ให้ช่วยอะไรคะ?",',
         '"chat.welcomeFull": "🙏 สวัสดีค่ะ! ฉันคือเสี่ยวหง ผู้ช่วยการเดินทางทางวัฒนธรรมอัจฉริยะของคุณ\\n\\nฉันมีความรู้เกี่ยวกับ 12 ประเพณีวัฒนธรรมหลัก 300+ สถานที่ศักดิ์สิทธิ์ และ 27 วัดต้นกำเนิดทั่วโลก ไม่ว่าคุณต้องการเรียนรู้เรื่องเส้นทางการเดินทางทางวัฒนธรรม วิธีปฏิบัติธรรม หรือวัฒนธรรม สอบถามได้เลย\\n\\nวันนี้ให้ช่วยอะไรคะ?",'),
    ]),
    ("apps/web/src/lib/i18n/en.json", [
        ('"home.howItWorks.step1Desc": "Browse 12 cultural traditions, 60 global heritage sites, find destinations that resonate with your soul.",',
         '"home.howItWorks.step1Desc": "Browse 12 cultural traditions, 300+ global heritage sites, find destinations that resonate with your soul.",'),
    ]),
    ("apps/mobile/app/about.tsx", [
        ("{ value: '60+', label: '文化圣地' }",
         "{ value: '300+', label: '文化圣地' }"),
    ]),
    ("apps/h5/src/lib/i18n/th.json", [
        ('"chat.welcomeFull": "🙏 สวัสดีค่ะ! ฉันคือเสี่ยวหง ผู้ช่วยการแสวงบุญอัจฉริยะของคุณ\\n\\nฉันมีความรู้เกี่ยวกับ 12 ศาสนาหลัก 60 สถานที่ศักดิ์สิทธิ์ และ 27 วัดต้นกำเนิดทั่วโลก ไม่ว่าคุณต้องการเรียนรู้เรื่องเส้นทางแสวงบุญ วิธีปฏิบัติธรรม หรือวัฒนธรรมทางศาสนา สอบถามได้เลย\\n\\nวันนี้ให้ช่วยอะไรคะ?",',
         '"chat.welcomeFull": "🙏 สวัสดีค่ะ! ฉันคือเสี่ยวหง ผู้ช่วยการเดินทางทางวัฒนธรรมอัจฉริยะของคุณ\\n\\nฉันมีความรู้เกี่ยวกับ 12 ประเพณีวัฒนธรรมหลัก 300+ สถานที่ศักดิ์สิทธิ์ และ 27 วัดต้นกำเนิดทั่วโลก ไม่ว่าคุณต้องการเรียนรู้เรื่องเส้นทางการเดินทางทางวัฒนธรรม วิธีปฏิบัติธรรม หรือวัฒนธรรม สอบถามได้เลย\\n\\nวันนี้ให้ช่วยอะไรคะ?",'),
    ]),
    ("apps/h5/src/lib/i18n/en.json", [
        ('"home.howItWorks.step1Desc": "Browse 12 faiths, 60 global holy sites, find destinations that resonate with your soul.",',
         '"home.howItWorks.step1Desc": "Browse 12 cultural traditions, 300+ global holy sites, find destinations that resonate with your soul.",'),
    ]),
    ("apps/web/src/app/about/client.tsx", [
        ('{ icon: "🕌", value: "60+", labelKey: "about.stats.holySites" }',
         '{ icon: "🕌", value: "300+", labelKey: "about.stats.holySites" }'),
    ]),
    ("apps/web/src/app/team-culture/TeamCultureLanding.tsx", [
        ('{ num: "60+", labelKey: "teamCulture.trustSites" }',
         '{ num: "300+", labelKey: "teamCulture.trustSites" }'),
    ]),
]

def main():
    n_files = 0
    n_edits = 0
    skipped = []
    for rel, pairs in EDITS:
        p = ROOT / rel
        if not p.exists():
            skipped.append((rel, "NOT FOUND"))
            continue
        src = p.read_text(encoding="utf-8")
        new = src
        fe = 0
        for old, repl in pairs:
            if old in new:
                new = new.replace(old, repl, 1)
                fe += 1
            else:
                skipped.append((rel, f"pattern not found: {old[:50]!r}"))
        if fe:
            p.write_text(new, encoding="utf-8")
            n_files += 1
            n_edits += fe
            print(f"[{fe}] {rel}")
    print(f"\n=== {n_edits} edits across {n_files} files ===")
    for rel, r in skipped:
        print(f"  SKIP {rel}: {r}")

if __name__ == "__main__":
    main()
