# -*- mode: python ; coding: utf-8 -*-
"""
ZuTing v4.0 — PyInstaller spec (--onedir 模式)
构建命令: pyinstaller zuting.spec
"""

import os
import sys
from pathlib import Path

block_cipher = None

# 应用根目录
APP_DIR = os.path.dirname(os.path.abspath(SPEC))

# customtkinter 路径 (需要捆绑主题文件)
import customtkinter
ctk_path = os.path.dirname(customtkinter.__file__)

a = Analysis(
    ['zuting_app.py'],
    pathex=[APP_DIR],
    binaries=[],
    datas=[
        # 资源目录
        ('backgrounds', 'backgrounds'),
        ('sounds', 'sounds'),
        # 数据文件 (可选，运行时会自动创建)
        # customtkinter 主题
        (ctk_path, 'customtkinter'),
    ],
    hiddenimports=[
        # 应用模块
        'config',
        'religions',
        'data_provider',
        'api_client',
        'xiaohong_agent',
        'core',
        'core.state',
        'core.scheduler',
        'audio',
        'audio.player',
        'audio.tts',
        'compose',
        'compose.base',
        'compose.site_card',
        'compose.patriarch_card',
        'compose.temple_card',
        'compose.seal_card',
        'compose.tour_card',
        'ui',
        'ui.panel',
        'ui.popup',
        'ui.tray',
        # 第三方
        'PIL',
        'PIL.Image',
        'PIL.ImageDraw',
        'PIL.ImageFont',
        'PIL.ImageTk',
        'PIL.ImageEnhance',
        'pygame',
        'pygame.mixer',
        'edge_tts',
        'pystray',
        'pystray._win32',
        'httpx',
        'httpx._transports',
        'customtkinter',
        'tkinter',
        'tkinter.ttk',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib', 'numpy', 'scipy', 'pandas',
        'pytest', 'unittest', 'doctest',
        'notebook', 'jupyter',
        'cv2', 'torch', 'tensorflow',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# 过滤掉 None 的 datas
a.datas = [(d, s, t) for d, s, t in a.datas if d is not None]

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ZuTing',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,  # 不用 UPX，避免杀毒误报
    console=False,  # 无控制台窗口
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='zuting.ico',
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='ZuTing',
)
