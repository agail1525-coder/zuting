"""
生成五系修炼吟诵背景音乐 (edge-tts)
每系一首核心偈语，用低沉庄严的声音吟诵
"""

import asyncio
from pathlib import Path

SOUNDS_DIR = Path(__file__).parent / "sounds"
SOUNDS_DIR.mkdir(exist_ok=True)

# 五系修炼吟诵: (文件名, TTS声音, 语速, 音调, 吟诵内容)
SEAL_CHANTS = [
    # 初印系 (1-10) — 暖金色，入世发愿，低沉坚定
    ("seal_chant_chuyin", "zh-CN-YunjianNeural", "-35%", "-4Hz",
     "一愿起众生，一灯照百魂，此身非我有，誓度亿中人。"
     "金刚誓愿立，千劫不为移，肉身承大用，尘世即道基。"
     "事业不载愿，千力化虚尘，愿志若为体，万法皆成轮。"),

    # 中印系 (11-20) — 翠绿色，应世度人，温暖悲悯
    ("seal_chant_zhongyin", "zh-CN-YunjianNeural", "-30%", "-2Hz",
     "教非传知识，育乃启灵根，一语若照心，胜造百丈门。"
     "宗不隔愿海，道本归灯心，万法虽异路，归源即愿轮。"
     "此灯非我有，代代愿心燃，传灯如传命，此誓永不迁。"),

    # 印果印 (21-23) — 莲粉色，成果显现，喜悦庄严
    ("seal_chant_yinguoyin", "zh-CN-XiaoxiaoNeural", "-30%", "-1Hz",
     "愿生即愿果，起行即到家，觉照无前后，印成本来花。"
     "若问何为佛，他笑即吾灯，众心生愿处，即是我归声。"),

    # 成道印 (24-26) — 明黄色，顿超觉悟，空灵深远
    ("seal_chant_chengdaoyin", "zh-CN-YunjianNeural", "-40%", "-5Hz",
     "不假方便道，愿即性中成，念念皆顿觉，法界印吾灯。"
     "不起而已行，无言而法周，心如虚空界，灯在众生头。"),

    # 归源印 (27-30) — 深紫色，归于寂照，极致宁静
    ("seal_chant_guiyuanyin", "zh-CN-YunjianNeural", "-45%", "-6Hz",
     "发愿为归空，不愿亦是灯，性空而不灭，归源更圆成。"
     "无人燃愿灯，灯火却常明，忘我而成我，空中自性生。"
     "寂非灭光体，照乃无为心，愿若真圆处，即是佛图腾。"),
]


async def generate_one(name, voice, rate, pitch, text):
    import edge_tts
    path = SOUNDS_DIR / f"{name}.mp3"
    if path.exists() and path.stat().st_size > 5000:
        print(f"  {name} — 已存在，跳过")
        return True
    print(f"  {name} ({voice}) ...", end=" ")
    try:
        comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await comm.save(str(path))
        kb = path.stat().st_size // 1024
        print(f"OK ({kb}KB)")
        return True
    except Exception as e:
        print(f"失败: {e}")
        return False


async def main():
    print("生成五系修炼吟诵背景音乐...\n")
    ok = fail = 0
    for name, voice, rate, pitch, text in SEAL_CHANTS:
        if await generate_one(name, voice, rate, pitch, text):
            ok += 1
        else:
            fail += 1
    print(f"\n完成！成功 {ok} / 失败 {fail}")


if __name__ == "__main__":
    asyncio.run(main())
