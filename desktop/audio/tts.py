"""
修行桌面助手 v3.0 — TTS 语音合成 (edge-tts)
"""

import os
import asyncio
import threading
import logging
import tempfile
from pathlib import Path

import config
from religions import CHANT_SOUNDS
from audio.player import play_sound_blocking

log = logging.getLogger(__name__)

AUDIO_DIR = Path(tempfile.gettempdir()) / "health_reminder_audio"
AUDIO_DIR.mkdir(exist_ok=True)

_voice_counter = 0


def _tts_generate(text, voice, rate="-5%", pitch="+0Hz"):
    h = hash(f"{text}_{voice}") & 0xFFFFFFFF
    p = str(AUDIO_DIR / f"r_{h}.mp3")
    if not os.path.exists(p):
        try:
            import edge_tts
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(
                edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(p)
            )
            loop.close()
        except Exception:
            log.debug("TTS生成失败", exc_info=True)
            return None
    return p


def play_voice(text, religion=None):
    if not config.get("voice_enabled"):
        return
    global _voice_counter

    def _w():
        global _voice_counter
        voice = config.VOICE_MALE if _voice_counter % 2 == 0 else config.VOICE_FEMALE
        pitch = "-2Hz" if voice == config.VOICE_MALE else "+5Hz"
        _voice_counter += 1

        p = _tts_generate(text, voice, rate="-5%", pitch=pitch)
        if p:
            play_sound_blocking(p, volume=config.get("voice_volume", 0.85))

        if religion and religion in config.LOCAL_VOICES:
            local_voice, label = config.LOCAL_VOICES[religion]
            if local_voice.startswith("zh-CN"):
                return
            chant = CHANT_SOUNDS.get(religion)
            if chant:
                local_text = chant.get("text", "")
                if local_text:
                    import time
                    time.sleep(0.5)
                    p2 = _tts_generate(local_text, local_voice, rate="-10%", pitch="-1Hz")
                    if p2:
                        play_sound_blocking(p2, volume=0.8)

    threading.Thread(target=_w, daemon=True).start()
