"""
ZuTing v4.0 — 一键构建脚本
用法: python build.py
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

APP_DIR = Path(__file__).parent
DIST_DIR = APP_DIR / "dist"
BUILD_DIR = APP_DIR / "build"
ICON_FILE = APP_DIR / "zuting.ico"
SPEC_FILE = APP_DIR / "zuting.spec"


def step(n, msg):
    print(f"\n{'='*60}")
    print(f"  Step {n}: {msg}")
    print(f"{'='*60}")


def main():
    print("=" * 60)
    print("  全球祖庭之旅 v4.0 — EXE 构建")
    print("  JOINUS.COM — 加入我们，探索世界")
    print("=" * 60)

    # Step 1: 清理旧构建
    step(1, "清理旧构建")
    for d in [DIST_DIR, BUILD_DIR]:
        if d.exists():
            print(f"  删除 {d}")
            shutil.rmtree(d, ignore_errors=True)
    print("  清理完成")

    # Step 2: 生成图标
    step(2, "生成应用图标")
    if not ICON_FILE.exists():
        print("  正在生成 zuting.ico ...")
        subprocess.run([sys.executable, str(APP_DIR / "generate_icon.py")], check=True)
    else:
        print(f"  图标已存在: {ICON_FILE}")

    # Step 3: PyInstaller 打包
    step(3, "PyInstaller 打包")
    if not SPEC_FILE.exists():
        print(f"  错误: 找不到 {SPEC_FILE}")
        sys.exit(1)

    result = subprocess.run(
        [sys.executable, "-m", "PyInstaller", str(SPEC_FILE), "--noconfirm"],
        cwd=str(APP_DIR),
    )
    if result.returncode != 0:
        print("  PyInstaller 打包失败!")
        sys.exit(1)
    print("  打包完成")

    # Step 4: 复制额外资源
    step(4, "复制额外资源")
    dist_app = DIST_DIR / "ZuTing"
    if not dist_app.exists():
        print(f"  错误: 找不到 {dist_app}")
        sys.exit(1)

    # 复制图标到输出目录
    if ICON_FILE.exists():
        shutil.copy2(ICON_FILE, dist_app / "zuting.ico")
        print(f"  复制 zuting.ico → dist/ZuTing/")

    # 确保 backgrounds 和 sounds 存在
    for res_dir in ["backgrounds", "sounds"]:
        src = APP_DIR / res_dir
        dst = dist_app / res_dir
        if src.exists() and not dst.exists():
            shutil.copytree(src, dst)
            print(f"  复制 {res_dir}/ → dist/ZuTing/")

    # Step 5: 构建信息
    step(5, "构建完成")
    exe_path = dist_app / "ZuTing.exe"
    if exe_path.exists():
        size_mb = exe_path.stat().st_size / (1024 * 1024)
        print(f"  EXE: {exe_path}")
        print(f"  大小: {size_mb:.1f} MB")

    # 统计 dist 目录大小
    total = sum(f.stat().st_size for f in dist_app.rglob("*") if f.is_file())
    print(f"  总大小: {total / (1024 * 1024):.1f} MB")
    print(f"\n  下一步:")
    print(f"    1. 测试: dist\\ZuTing\\ZuTing.exe")
    print(f"    2. 安装包: 用 Inno Setup 编译 installer.iss")
    print(f"       ISCC installer.iss")


if __name__ == "__main__":
    main()
