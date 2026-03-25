"""
生成14+12类宗教/自然环境音效（纯Python，零外部依赖）
V5.0: 新增12种宗教咒语/吟唱合成音效
"""

import struct
import wave
import math
import random
from pathlib import Path

SOUNDS_DIR = Path(__file__).parent / "sounds"
SOUNDS_DIR.mkdir(exist_ok=True)
SR = 44100
DUR = 12


def _wav(name, samples):
    path = SOUNDS_DIR / name
    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        for s in samples:
            wf.writeframes(struct.pack("<h", int(max(-1, min(1, s)) * 30000)))
    print(f"  {name}")


def _sine(f, t, phase=0):
    return math.sin(2 * math.pi * f * t + phase)


# ── 1. 颂钵 singing_bowl ──
def gen_singing_bowl():
    n = SR * DUR
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        d = math.exp(-t * 0.25)
        v = _sine(220, t) + 0.6 * _sine(440, t) + 0.3 * _sine(660, t)
        vib = 1 + 0.002 * _sine(5, t)
        out[i] = v * d * vib * 0.2
    # 二击
    for i in range(n):
        t = i / SR
        if t > 5.5:
            t2 = t - 5.5
            out[i] += (_sine(233, t2) + 0.5 * _sine(466, t2)) * math.exp(-t2 * 0.3) * 0.15
    _wav("singing_bowl.wav", out)


# ── 2. 晨钟 temple_bell ──
def gen_temple_bell():
    n = SR * DUR
    out = [0.0] * n
    for strike_t in [0, 5.5]:
        for i in range(n):
            t = i / SR - strike_t
            if t < 0:
                continue
            d = math.exp(-t * 0.18) * min(1, t * 25)
            v = _sine(82, t) + 0.45 * _sine(164, t) + 0.2 * _sine(246, t) + 0.1 * _sine(328, t)
            out[i] += v * d * 0.2
    _wav("temple_bell.wav", out)


# ── 3. 古琴 guqin_pluck ──
def gen_guqin():
    n = SR * DUR
    out = [0.0] * n
    notes = [(131, 0.5), (147, 2.8), (165, 5.2), (196, 7.3), (220, 9.5)]
    for freq, t0 in notes:
        period = int(SR / freq)
        buf = [(random.random() - 0.5) * 0.35 for _ in range(period)]
        idx = int(t0 * SR)
        pos = 0
        while idx < n:
            buf[pos] = (buf[pos] + buf[(pos + 1) % period]) / 2 * 0.9985
            out[idx] += buf[pos]
            pos = (pos + 1) % period
            idx += 1
    _wav("guqin_pluck.wav", out)


# ── 4. 竹笛 bamboo_flute ──
def gen_bamboo_flute():
    n = SR * DUR
    out = [0.0] * n
    # 简单旋律 (宫商角徵羽)
    melody = [(523, 0, 2), (587, 2.2, 1.8), (659, 4.2, 2), (784, 6.5, 1.5),
              (659, 8.2, 1.5), (523, 10, 1.8)]
    for freq, t0, dur in melody:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = math.sin(math.pi * t / dur)  # 包络
            breath = 1 + 0.01 * _sine(5.5, t)  # 气息颤音
            v = _sine(freq * breath, t) + 0.3 * _sine(freq * 2 * breath, t)
            # 轻微噪音（气息感）
            v += (random.random() - 0.5) * 0.05 * env
            out[idx] += v * env * 0.2
    _wav("bamboo_flute.wav", out)


# ── 5. 管风琴 pipe_organ ──
def gen_pipe_organ():
    n = SR * DUR
    out = [0.0] * n
    # C大调和弦进行
    chords = [
        ([262, 330, 392], 0, 3),      # C
        ([262, 349, 440], 3.2, 2.8),   # F
        ([294, 370, 440], 6.2, 2.8),   # Dm
        ([262, 330, 392], 9.2, 2.5),   # C
    ]
    for freqs, t0, dur in chords:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 3) * min(1, (dur - t) * 3)  # attack+release
            v = 0
            for f in freqs:
                # 管风琴音色：基频 + 多泛音
                v += _sine(f, t) + 0.5 * _sine(f * 2, t) + 0.25 * _sine(f * 3, t) + 0.12 * _sine(f * 4, t)
            out[idx] += v * env * 0.08
    _wav("pipe_organ.wav", out)


# ── 6. 唱诗合声 choir_hymn ──
def gen_choir():
    n = SR * DUR
    out = [0.0] * n
    # 柔和的合声
    chords = [
        ([262, 330, 392, 523], 0, 3.5),
        ([220, 277, 330, 440], 3.8, 3.2),
        ([247, 311, 370, 494], 7.2, 3),
        ([262, 330, 392, 523], 10.5, 1.3),
    ]
    for freqs, t0, dur in chords:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 2) * min(1, (dur - t) * 2)
            v = 0
            for f in freqs:
                vib = 1 + 0.003 * _sine(5 + random.random(), t)
                v += _sine(f * vib, t) * 0.4
            out[idx] += v * env * 0.12
    _wav("choir_hymn.wav", out)


# ── 7. 宣礼吟唱 adhan_call ──
def gen_adhan():
    n = SR * DUR
    out = [0.0] * n
    # 阿拉伯音阶旋律线
    notes = [(220, 0, 2.5), (247, 2.7, 2), (262, 5, 1.8), (294, 7, 2),
             (262, 9.2, 1.5), (220, 11, 0.8)]
    for freq, t0, dur in notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 4) * min(1, (dur - t) * 3)
            # 微分音装饰
            ornament = 1 + 0.008 * _sine(6, t) + 0.003 * _sine(3.5, t)
            v = _sine(freq * ornament, t) + 0.4 * _sine(freq * 2 * ornament, t)
            out[idx] += v * env * 0.2
    _wav("adhan_call.wav", out)


# ── 8. 西塔琴 sitar_drone ──
def gen_sitar():
    n = SR * DUR
    out = [0.0] * n
    # 持续低音 drone
    for i in range(n):
        t = i / SR
        drone = _sine(130.81, t) + 0.5 * _sine(196, t) + 0.3 * _sine(261.6, t)
        # Sitar 特有的 buzz
        buzz = 0.15 * math.copysign(abs(_sine(130.81, t)) ** 0.5, _sine(130.81, t))
        env = min(1, t * 2) * min(1, (DUR - t) * 2)
        out[i] = (drone * 0.15 + buzz) * env

    # 上方旋律点缀
    ornaments = [(392, 2, 0.8), (440, 4, 0.6), (494, 6.5, 0.7), (440, 8.5, 0.9), (392, 10, 0.8)]
    for freq, t0, dur in ornaments:
        period = int(SR / freq)
        buf = [(random.random() - 0.5) * 0.2 for _ in range(period)]
        idx = int(t0 * SR)
        pos = 0
        while idx < n and idx < int((t0 + dur + 2) * SR):
            buf[pos] = (buf[pos] + buf[(pos + 1) % period]) / 2 * 0.999
            out[idx] += buf[pos]
            pos = (pos + 1) % period
            idx += 1
    _wav("sitar_drone.wav", out)


# ── 9. 羊角号 shofar_horn ──
def gen_shofar():
    n = SR * DUR
    out = [0.0] * n
    # Tekiah (长音)
    for i in range(int(4 * SR)):
        t = i / SR
        env = min(1, t * 5) * min(1, (4 - t) * 2)
        freq = 180 + 10 * _sine(0.5, t)  # 轻微滑音
        v = _sine(freq, t) + 0.6 * _sine(freq * 2, t) + 0.3 * _sine(freq * 3, t)
        v += (random.random() - 0.5) * 0.08 * env  # 气息噪
        out[i] = v * env * 0.2

    # Shevarim (三短音)
    for j, t0 in enumerate([5, 6.2, 7.4]):
        for i in range(int(0.8 * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 8) * min(1, (0.8 - t) * 5)
            v = _sine(190, t) + 0.5 * _sine(380, t)
            out[idx] += v * env * 0.18

    # Tekiah Gedolah (终长音)
    for i in range(int(3.5 * SR)):
        idx = int(8.5 * SR) + i
        if idx >= n:
            break
        t = i / SR
        env = min(1, t * 4) * min(1, (3.5 - t) * 1.5)
        freq = 175 + 15 * t / 3.5  # 上滑
        v = _sine(freq, t) + 0.5 * _sine(freq * 2, t) + 0.2 * _sine(freq * 3, t)
        out[idx] += v * env * 0.22

    _wav("shofar_horn.wav", out)


# ── 10. 太鼓 taiko_drum ──
def gen_taiko():
    n = SR * DUR
    out = [0.0] * n
    # 节奏: DON ... DON DON ... DON ... DON DON DON
    hits = [0.5, 3, 3.8, 6, 8, 8.7, 9.4]
    for t0 in hits:
        for i in range(int(1.5 * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            d = math.exp(-t * 4)
            # 低频体鸣
            v = _sine(60, t) * d + 0.5 * _sine(120, t) * math.exp(-t * 6)
            # 打击噪声
            v += (random.random() - 0.5) * 0.3 * math.exp(-t * 15)
            out[idx] += v * 0.3
    _wav("taiko_drum.wav", out)


# ── 11. 迪吉里杜管 didgeridoo ──
def gen_didgeridoo():
    n = SR * DUR
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = min(1, t * 2) * min(1, (DUR - t) * 2)
        freq = 65 + 3 * _sine(0.2, t)  # 缓慢音高波动
        # 基频 + 泛音 + 嗡鸣
        v = _sine(freq, t) + 0.4 * _sine(freq * 2, t) + 0.2 * _sine(freq * 3, t)
        # 喉音效果
        throat = 0.3 * _sine(freq * 1.5, t) * (0.5 + 0.5 * _sine(2.5, t))
        # 呼吸节奏
        breath = 0.8 + 0.2 * _sine(0.4, t)
        out[i] = (v + throat) * env * breath * 0.18
    _wav("didgeridoo.wav", out)


# ── 12. 山泉 mountain_stream ──
def gen_stream():
    n = SR * DUR
    out = [0.0] * n
    p1 = p2 = 0.0
    for i in range(n):
        t = i / SR
        noise = (random.random() - 0.5) * 0.5
        f = noise * 0.05 + p1 * 0.65 + p2 * 0.3
        p2, p1 = p1, f
        vol = 0.4 + 0.15 * _sine(0.15, t)
        out[i] = f * vol
    for _ in range(20):
        t0 = random.uniform(0.3, DUR - 0.5)
        freq = random.uniform(300, 800)
        for j in range(int(0.08 * SR)):
            idx = int(t0 * SR) + j
            if idx >= n:
                break
            out[idx] += _sine(freq, j / SR) * math.exp(-j / SR * 40) * 0.1
    _wav("mountain_stream.wav", out)


# ── 13. 风铃 wind_chimes ──
def gen_chimes():
    n = SR * DUR
    out = [0.0] * n
    hits = sorted([random.uniform(0.5, DUR - 1) for _ in range(10)])
    for ht in hits:
        freq = random.choice([1200, 1500, 1800, 2100, 2400, 800, 1000])
        amp = random.uniform(0.15, 0.3)
        dur = random.uniform(1.5, 3.0)
        for i in range(int(dur * SR)):
            idx = int(ht * SR) + i
            if idx >= n:
                break
            t = i / SR
            d = math.exp(-t * 2.5)
            out[idx] += (_sine(freq, t) + 0.3 * _sine(freq * 2.01, t)) * d * amp
    prev = 0
    for i in range(n):
        w = (random.random() - 0.5) * 0.03
        out[i] += w * 0.3 + prev * 0.01
        prev = w
    _wav("wind_chimes.wav", out)


# ── 14. 海浪 ocean_waves ──
def gen_ocean():
    n = SR * DUR
    out = [0.0] * n
    prev = 0.0
    for i in range(n):
        t = i / SR
        noise = (random.random() - 0.5)
        filt = noise * 0.08 + prev * 0.92
        prev = filt
        # 海浪起伏周期 ~6秒
        wave_env = 0.3 + 0.5 * max(0, _sine(1 / 6, t)) ** 2
        out[i] = filt * wave_env
    # 轻微泡沫声
    for _ in range(30):
        t0 = random.uniform(0, DUR)
        for j in range(int(0.02 * SR)):
            idx = int(t0 * SR) + j
            if idx < n:
                out[idx] += (random.random() - 0.5) * 0.04 * math.exp(-j / SR * 50)
    _wav("ocean_waves.wav", out)



# ══════════════════════════════════════════════════════
#  V5.0 新增: 12种宗教咒语/吟唱合成 (15秒)
# ══════════════════════════════════════════════════════

CHANT_DUR = 15


def _chant_melody(notes, timbre_fn, vol=0.2):
    """通用咒语旋律生成器"""
    n = SR * CHANT_DUR
    out = [0.0] * n
    for freq, t0, dur in notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 4) * min(1, (dur - t) * 3)
            out[idx] += timbre_fn(freq, t) * env * vol
    return out


# 佛教 — 般若心经吟唱 (低沉诵经声 + 木鱼节拍)
def gen_chant_heart_sutra():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 诵经基音 (低沉男声共振)
    chant_notes = [(130, 0, 3.5), (138, 3.8, 3), (130, 7, 3.5), (146, 10.8, 3)]
    for freq, t0, dur in chant_notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 3) * min(1, (dur - t) * 2)
            vib = 1 + 0.004 * _sine(5, t)
            v = _sine(freq * vib, t) + 0.5 * _sine(freq * 2 * vib, t) + 0.25 * _sine(freq * 3, t)
            # 鼻音共振
            v += 0.3 * _sine(freq * 1.5, t) * (0.6 + 0.4 * _sine(3, t))
            out[idx] += v * env * 0.15
    # 木鱼
    for t0 in [1.5, 3.0, 4.5, 6.0, 7.5, 9.0, 10.5, 12.0, 13.5]:
        for i in range(int(0.08 * SR)):
            idx = int(t0 * SR) + i
            if idx < n:
                t = i / SR
                out[idx] += _sine(800, t) * math.exp(-t * 40) * 0.12
    _wav("chant_heart_sutra.wav", out)


# 道教 — 清静经吟诵 (古琴伴奏 + 吟诵)
def gen_chant_qingjing():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 吟诵旋律 (五声音阶: 宫商角徵羽)
    notes = [(262, 0, 2.5), (294, 2.8, 2), (330, 5, 2.5), (392, 7.8, 2),
             (330, 10, 2), (262, 12.2, 2.5)]
    for freq, t0, dur in notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 3) * min(1, (dur - t) * 2.5)
            vib = 1 + 0.005 * _sine(4.5, t)
            v = _sine(freq * vib, t) + 0.35 * _sine(freq * 2 * vib, t)
            out[idx] += v * env * 0.18
    # 古琴点缀
    for freq, t0 in [(196, 1), (262, 4), (196, 8), (262, 11.5)]:
        period = int(SR / freq)
        buf = [(random.random() - 0.5) * 0.15 for _ in range(period)]
        idx = int(t0 * SR)
        pos = 0
        while idx < n and idx < int((t0 + 3) * SR):
            buf[pos] = (buf[pos] + buf[(pos + 1) % period]) / 2 * 0.998
            out[idx] += buf[pos]
            pos = (pos + 1) % period
            idx += 1
    _wav("chant_qingjing.wav", out)


# 基督教 — 哈利路亚合唱
def gen_chant_hallelujah():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 四声部合唱
    phrases = [
        ([262, 330, 392, 523], 0, 3.5),     # Hal-le-
        ([294, 370, 440, 587], 3.8, 3),      # -lu-
        ([330, 392, 494, 659], 7, 3.5),      # -jah
        ([262, 330, 392, 523], 10.8, 3.5),   # Hal-le-lu-jah
    ]
    for freqs, t0, dur in phrases:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 2.5) * min(1, (dur - t) * 2)
            v = 0
            for f in freqs:
                vib = 1 + 0.003 * _sine(5 + random.random() * 0.5, t)
                v += _sine(f * vib, t) + 0.3 * _sine(f * 2 * vib, t)
            out[idx] += v * env * 0.06
    _wav("chant_hallelujah.wav", out)


# 伊斯兰教 — 宣礼词 (Adhan 完整版)
def gen_chant_adhan_full():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 阿拉伯音阶 maqam hijaz
    notes = [(220, 0, 3), (233, 3.2, 2.5), (277, 6, 2.5), (294, 8.8, 2.5),
             (262, 11.5, 2), (220, 13.5, 1.3)]
    for freq, t0, dur in notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 5) * min(1, (dur - t) * 3)
            ornament = 1 + 0.01 * _sine(6, t) + 0.005 * _sine(3, t)
            v = _sine(freq * ornament, t) + 0.5 * _sine(freq * 2 * ornament, t)
            v += 0.2 * _sine(freq * 3, t) * (0.5 + 0.5 * _sine(4, t))
            out[idx] += v * env * 0.2
    _wav("chant_adhan_full.wav", out)


# 印度教 — Om Namah Shivaya
def gen_chant_om_namah():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 持续Om低音
    for i in range(n):
        t = i / SR
        env = min(1, t * 2) * min(1, (CHANT_DUR - t) * 2)
        om = _sine(110, t) + 0.6 * _sine(220, t) + 0.3 * _sine(330, t)
        vib = 1 + 0.003 * _sine(4, t)
        out[i] += om * vib * env * 0.08
    # 旋律音 (印度调式)
    notes = [(262, 1, 2), (294, 3.5, 1.5), (330, 5.5, 2), (349, 8, 1.5),
             (330, 10, 2), (262, 12.5, 2)]
    for freq, t0, dur in notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 4) * min(1, (dur - t) * 3)
            gamak = 1 + 0.008 * _sine(5.5, t)  # 印度式装饰音
            v = _sine(freq * gamak, t) + 0.4 * _sine(freq * 2, t)
            out[idx] += v * env * 0.15
    _wav("chant_om_namah.wav", out)


# 犹太教 — Shema Yisrael
def gen_chant_shema():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 庄严的吟唱 (小调)
    notes = [(220, 0, 3), (196, 3.3, 2.5), (175, 6, 2), (196, 8.2, 2.5),
             (220, 11, 2), (196, 13.2, 1.5)]
    for freq, t0, dur in notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 3) * min(1, (dur - t) * 2.5)
            v = _sine(freq, t) + 0.5 * _sine(freq * 2, t) + 0.2 * _sine(freq * 3, t)
            out[idx] += v * env * 0.18
    _wav("chant_shema.wav", out)


# 儒教 — 大学之道 (编钟+雅乐)
def gen_chant_daxue():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 编钟音 (高频金属音色)
    bell_notes = [(523, 0.5, 2), (587, 3, 1.8), (659, 5.5, 2), (523, 8, 1.5),
                  (659, 10, 2), (523, 12.5, 2)]
    for freq, t0, dur in bell_notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            d = math.exp(-t * 1.5) * min(1, t * 20)
            v = _sine(freq, t) + 0.6 * _sine(freq * 2.01, t) + 0.3 * _sine(freq * 3.02, t)
            out[idx] += v * d * 0.12
    # 底层丝竹吟诵
    for i in range(n):
        t = i / SR
        env = min(1, t * 1.5) * min(1, (CHANT_DUR - t) * 1.5)
        v = _sine(196, t) + 0.4 * _sine(262, t)
        out[i] += v * env * 0.06
    _wav("chant_daxue.wav", out)


# 锡克教 — Waheguru 吟唱
def gen_chant_waheguru():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 反复吟唱 Waheguru (循环4次)
    for cycle in range(4):
        t_base = cycle * 3.5
        notes = [(262, t_base, 0.8), (294, t_base + 0.9, 0.8),
                 (330, t_base + 1.8, 1), (262, t_base + 2.9, 0.5)]
        for freq, t0, dur in notes:
            for i in range(int(dur * SR)):
                idx = int(t0 * SR) + i
                if idx >= n:
                    break
                t = i / SR
                env = min(1, t * 5) * min(1, (dur - t) * 4)
                v = _sine(freq, t) + 0.4 * _sine(freq * 2, t) + 0.15 * _sine(freq * 3, t)
                out[idx] += v * env * 0.18
    # Tabla节拍
    for beat in [i * 0.875 for i in range(16)]:
        for i in range(int(0.06 * SR)):
            idx = int(beat * SR) + i
            if idx < n:
                t = i / SR
                out[idx] += _sine(200, t) * math.exp(-t * 30) * 0.08
    _wav("chant_waheguru.wav", out)


# 神道教 — 祝词 (雅乐+笙)
def gen_chant_norito():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 笙的持续和音
    sho_chords = [
        ([523, 659, 784], 0, 4),
        ([494, 622, 740], 4.5, 3.5),
        ([523, 659, 784], 8.5, 3.5),
        ([440, 554, 659], 12.5, 2.3),
    ]
    for freqs, t0, dur in sho_chords:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 2) * min(1, (dur - t) * 2)
            v = sum(_sine(f, t) + 0.3 * _sine(f * 2, t) for f in freqs)
            out[idx] += v * env * 0.04
    # 太鼓低音节拍
    for t0 in [2, 6, 10]:
        for i in range(int(0.5 * SR)):
            idx = int(t0 * SR) + i
            if idx < n:
                t = i / SR
                out[idx] += _sine(80, t) * math.exp(-t * 5) * 0.2
    _wav("chant_norito.wav", out)


# 藏传佛教 — 六字真言 Om Mani Padme Hum
def gen_chant_om_mani():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 深沉的多声道诵经 (藏传特色：极低音)
    syllables = [
        (82, 0, 2.2),      # Om
        (87, 2.5, 2),       # Ma
        (92, 4.8, 1.8),     # Ni
        (87, 6.8, 2),       # Pad
        (82, 9, 2),         # Me
        (73, 11.2, 3.5),    # Hum (最长最低)
    ]
    for freq, t0, dur in syllables:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 3) * min(1, (dur - t) * 2)
            # 多泛音共振 (藏传特色喉音)
            v = _sine(freq, t) + 0.7 * _sine(freq * 2, t) + 0.5 * _sine(freq * 3, t)
            v += 0.3 * _sine(freq * 4, t) + 0.15 * _sine(freq * 5, t)
            throat = 0.2 * _sine(freq * 1.5, t) * (0.5 + 0.5 * _sine(3, t))
            out[idx] += (v + throat) * env * 0.1
    # 法号 (低沉长号)
    for i in range(n):
        t = i / SR
        env = min(1, t * 0.5) * min(1, (CHANT_DUR - t) * 0.5)
        out[i] += _sine(55, t) * env * 0.04
    _wav("chant_om_mani.wav", out)


# 原住民灵性 — 部落祈祷鼓
def gen_chant_tribal_prayer():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 心跳节奏鼓
    for beat in range(30):
        t0 = beat * 0.5
        is_accent = beat % 4 == 0
        amp = 0.35 if is_accent else 0.2
        for i in range(int(0.3 * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            d = math.exp(-t * 8)
            v = _sine(80, t) * d + 0.4 * _sine(160, t) * math.exp(-t * 12)
            v += (random.random() - 0.5) * 0.15 * math.exp(-t * 20)
            out[idx] += v * amp
    # 吟唱旋律
    chant_notes = [(220, 0.5, 2), (196, 3, 2), (175, 5.5, 2.5), (196, 8.5, 2),
                   (220, 11, 2), (196, 13.5, 1)]
    for freq, t0, dur in chant_notes:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 3) * min(1, (dur - t) * 2)
            v = _sine(freq, t) + 0.3 * _sine(freq * 2, t)
            out[idx] += v * env * 0.12
    _wav("chant_tribal_prayer.wav", out)


# 巴哈伊教 — 团结祈祷歌 (多声部和声)
def gen_chant_unity_prayer():
    n = SR * CHANT_DUR
    out = [0.0] * n
    # 温暖的多声部合唱
    phrases = [
        ([262, 330, 392], 0, 3.5),
        ([294, 370, 440], 3.8, 3),
        ([330, 392, 494], 7, 3.5),
        ([262, 349, 440], 10.8, 2),
        ([262, 330, 392], 13, 1.8),
    ]
    for freqs, t0, dur in phrases:
        for i in range(int(dur * SR)):
            idx = int(t0 * SR) + i
            if idx >= n:
                break
            t = i / SR
            env = min(1, t * 2) * min(1, (dur - t) * 2)
            v = 0
            for f in freqs:
                vib = 1 + 0.002 * _sine(5, t)
                v += _sine(f * vib, t) + 0.25 * _sine(f * 2, t)
            out[idx] += v * env * 0.08
    _wav("chant_unity_prayer.wav", out)


def main():
    print("生成14+12类宗教/自然环境音效...\n")
    print("── 14类环境音效 ──")
    gen_singing_bowl()
    gen_temple_bell()
    gen_guqin()
    gen_bamboo_flute()
    gen_pipe_organ()
    gen_choir()
    gen_adhan()
    gen_sitar()
    gen_shofar()
    gen_taiko()
    gen_didgeridoo()
    gen_stream()
    gen_chimes()
    gen_ocean()

    print("\n── 12类宗教咒语/吟唱 ──")
    gen_chant_heart_sutra()
    gen_chant_qingjing()
    gen_chant_hallelujah()
    gen_chant_adhan_full()
    gen_chant_om_namah()
    gen_chant_shema()
    gen_chant_daxue()
    gen_chant_waheguru()
    gen_chant_norito()
    gen_chant_om_mani()
    gen_chant_tribal_prayer()
    gen_chant_unity_prayer()

    print(f"\n完成！{len(list(SOUNDS_DIR.glob('*.wav')))} 个音效")


if __name__ == "__main__":
    main()
