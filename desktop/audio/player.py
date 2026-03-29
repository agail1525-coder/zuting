"""
修行桌面助手 v3.0 — 音频播放器 (pygame)
"""

import time
import logging
from pathlib import Path

import config
from religions import CHANT_SOUNDS

log = logging.getLogger(__name__)

_ambient_ch = None
_chant_ch = None


def _ensure_mixer():
    try:
        import pygame
        if not pygame.mixer.get_init():
            pygame.mixer.init(44100, -16, 2, 2048)
        return True
    except Exception:
        log.debug("pygame mixer 初始化失败", exc_info=True)
        return False


def play_seal_chant(series):
    global _chant_ch
    chant_name = config.SEAL_SERIES_CHANTS.get(series)
    if not chant_name:
        return
    f = config.SOUNDS_DIR / f"{chant_name}.mp3"
    if not f.exists():
        return
    if not _ensure_mixer():
        return
    try:
        import pygame
        snd = pygame.mixer.Sound(str(f))
        snd.set_volume(config.get("chant_volume", 0.45))
        _chant_ch = snd.play(loops=-1)
    except Exception:
        log.debug("播放系列吟诵失败", exc_info=True)


def play_ambient(name):
    global _ambient_ch
    f = config.SOUNDS_DIR / f"{name}.wav"
    if not f.exists():
        return
    if not _ensure_mixer():
        return
    try:
        import pygame
        snd = pygame.mixer.Sound(str(f))
        snd.set_volume(config.get("ambient_volume", 0.15))
        _ambient_ch = snd.play(loops=-1)
    except Exception:
        log.debug("播放环境音失败", exc_info=True)


def play_chant(religion):
    global _chant_ch
    chant_info = CHANT_SOUNDS.get(religion)
    if not chant_info:
        return
    f = config.SOUNDS_DIR / f"{chant_info['sound']}.mp3"
    if not f.exists():
        f = config.SOUNDS_DIR / f"{chant_info['sound']}.wav"
    if not f.exists():
        return
    if not _ensure_mixer():
        return
    try:
        import pygame
        snd = pygame.mixer.Sound(str(f))
        snd.set_volume(config.get("chant_volume", 0.55))
        _chant_ch = snd.play(loops=-1)
    except Exception:
        log.debug("播放宗教吟诵失败", exc_info=True)


def play_sound_blocking(path, volume=0.85):
    if not _ensure_mixer():
        return
    try:
        import pygame
        snd = pygame.mixer.Sound(path)
        snd.set_volume(volume)
        ch = snd.play()
        while ch and ch.get_busy():
            time.sleep(0.1)
    except Exception:
        log.debug("播放音频失败", exc_info=True)


def stop_all():
    global _ambient_ch, _chant_ch
    for ch in [_ambient_ch, _chant_ch]:
        if ch:
            try:
                ch.fadeout(1500)
            except Exception:
                pass
    _ambient_ch = None
    _chant_ch = None
