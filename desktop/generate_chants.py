"""
用 edge-tts 生成真实宗教经文吟诵音频（原语言 + 低语速）
替代之前合成的假音效，听起来像真正的诵经/吟唱
"""

import asyncio
import os
from pathlib import Path

SOUNDS_DIR = Path(__file__).parent / "sounds"
SOUNDS_DIR.mkdir(exist_ok=True)

# 12种宗教的吟诵内容，用原语言 + 合适的TTS声音
# (文件名, TTS声音, 语速, 音调, 吟诵内容)
CHANTS = [
    # ── 佛教: 般若心经 (中文低沉男声诵经)
    ("chant_heart_sutra", "zh-CN-YunjianNeural", "-30%", "-3Hz",
     "揭谛揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。"
     "色不异空，空不异色，色即是空，空即是色。"
     "观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。"),

    # ── 道教: 清静经 (中文古风男声)
    ("chant_qingjing", "zh-CN-YunjianNeural", "-35%", "-2Hz",
     "大道无形，生育天地。大道无情，运行日月。大道无名，长养万物。"
     "吾不知其名，强名曰道。"
     "清者浊之源，动者静之基。人能常清静，天地悉皆归。"),

    # ── 基督教: 主祷文+赞美诗 (英文庄严女声)
    ("chant_hallelujah", "en-US-EmmaNeural", "-25%", "+0Hz",
     "Our Father, who art in heaven, hallowed be thy name. "
     "Thy kingdom come, thy will be done, on earth as it is in heaven. "
     "Amazing grace, how sweet the sound, that saved a wretch like me. "
     "Hallelujah, Hallelujah, praise the Lord Almighty."),

    # ── 伊斯兰教: 宣礼词 (阿拉伯语男声)
    ("chant_adhan_full", "ar-SA-HamedNeural", "-30%", "-2Hz",
     "الله أكبر الله أكبر. "
     "أشهد أن لا إله إلا الله. "
     "أشهد أن محمدا رسول الله. "
     "حي على الصلاة. حي على الفلاح. "
     "الله أكبر الله أكبر. لا إله إلا الله."),

    # ── 印度教: Om Namah Shivaya (印地语女声)
    ("chant_om_namah", "hi-IN-SwaraNeural", "-30%", "-1Hz",
     "ॐ नमः शिवाय। ॐ नमः शिवाय। ॐ नमः शिवाय। "
     "सर्वे भवन्तु सुखिनः। सर्वे सन्तु निरामयाः। "
     "लोकाः समस्ताः सुखिनो भवन्तु।"),

    # ── 犹太教: Shema Yisrael (希伯来语男声)
    ("chant_shema", "he-IL-AvriNeural", "-25%", "-1Hz",
     "שמע ישראל יהוה אלהינו יהוה אחד. "
     "ברוך שם כבוד מלכותו לעולם ועד. "
     "ואהבת את יהוה אלהיך בכל לבבך ובכל נפשך ובכל מאדך."),

    # ── 儒教: 大学之道 (中文庄重男声)
    ("chant_daxue", "zh-CN-YunjianNeural", "-30%", "+0Hz",
     "大学之道，在明明德，在亲民，在止于至善。"
     "知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。"
     "物有本末，事有终始，知所先后，则近道矣。"),

    # ── 锡克教: Waheguru (印地语男声)
    ("chant_waheguru", "hi-IN-MadhurNeural", "-25%", "-1Hz",
     "वाहेगुरु वाहेगुरु वाहेगुरु जी का खालसा। "
     "वाहेगुरु जी की फतेह। "
     "इक ओंकार सत नाम करता पुरख निरभउ निरवैर। "
     "वाहेगुरु वाहेगुरु वाहेगुरु।"),

    # ── 神道教: 祝词 (日语女声)
    ("chant_norito", "ja-JP-NanamiNeural", "-30%", "-1Hz",
     "掛けまくも畏き、天照大御神の大前に、慎み敬いも白さく。"
     "高天原に神留まり坐す、皇親神漏岐、神漏美の命以ちて。"
     "清き明き直き心を以て、まことの道に違うことなく。"),

    # ── 藏传佛教: 六字真言 (中文低沉男声)
    ("chant_om_mani", "zh-CN-YunjianNeural", "-40%", "-5Hz",
     "嗡嘛呢叭咪吽。嗡嘛呢叭咪吽。嗡嘛呢叭咪吽。"
     "嗡嘛呢叭咪吽。嗡嘛呢叭咪吽。嗡嘛呢叭咪吽。"
     "嗡阿吽，班杂咕噜贝玛悉地吽。"),

    # ── 原住民灵性: 大地祈祷 (英语低沉男声)
    ("chant_tribal_prayer", "en-US-AndrewNeural", "-30%", "-3Hz",
     "We are all connected to the earth, the sky, and each other. "
     "The earth does not belong to us. We belong to the earth. "
     "We are all visitors to this time, this place. "
     "We are just passing through. Our purpose here is to observe, to learn, to grow, to love. "
     "And then we return home."),

    # ── 巴哈伊教: 团结祈祷 (英语温暖女声)
    ("chant_unity_prayer", "en-US-EmmaNeural", "-25%", "+0Hz",
     "O my God, unite the hearts of Thy servants, "
     "and reveal to them Thy great purpose. "
     "The earth is but one country, and mankind its citizens. "
     "So powerful is the light of unity, "
     "that it can illuminate the whole earth."),
]


async def generate_one(name, voice, rate, pitch, text):
    """生成一条吟诵音频"""
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
    print("生成12种宗教经文吟诵音频（edge-tts原语言）...\n")

    success = fail = 0
    for name, voice, rate, pitch, text in CHANTS:
        ok = await generate_one(name, voice, rate, pitch, text)
        if ok:
            success += 1
        else:
            fail += 1

    # 删除旧的WAV合成文件（同名的）
    for name, *_ in CHANTS:
        wav = SOUNDS_DIR / f"{name}.wav"
        if wav.exists():
            wav.unlink()
            print(f"  删除旧合成: {name}.wav")

    print(f"\n完成！成功 {success} / 失败 {fail}")
    print(f"音频文件: {len(list(SOUNDS_DIR.glob('*.mp3')))} MP3 + {len(list(SOUNDS_DIR.glob('*.wav')))} WAV")


if __name__ == "__main__":
    asyncio.run(main())
