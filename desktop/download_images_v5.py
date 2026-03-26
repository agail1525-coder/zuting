"""
V5.0 图片下载器 — 下载祖庭 + 祖师图片
(圣地图片沿用已有的 download_images.py)
"""

import urllib.request
import urllib.parse
import re
import ssl
import time
from pathlib import Path

BG_DIR = Path(__file__).parent / "backgrounds"
TEMPLES_DIR = BG_DIR / "temples"
PATRIARCHS_DIR = BG_DIR / "patriarchs"
TEMPLES_DIR.mkdir(parents=True, exist_ok=True)
PATRIARCHS_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

# SSL workaround
_ctx = ssl.create_default_context()
_ctx.check_hostname = False
_ctx.verify_mode = ssl.CERT_NONE


def search_bing_image(query, retries=2):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&qft=+filterui:imagesize-wallpaper&form=IRFLTR&first=1"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15, context=_ctx) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
            urls = re.findall(r'murl&quot;:&quot;(https?://[^&]+?)&quot;', html)
            if not urls:
                urls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            for u in urls:
                if any(s in u.lower() for s in ["logo", "icon", "avatar", "thumb", ".gif"]):
                    continue
                return u
        except Exception:
            if attempt < retries - 1:
                time.sleep(2)
    return None


def download_file(url, save_path, timeout=20):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=_ctx) as resp:
            data = resp.read()
            if len(data) < 5000:
                return False
            with open(save_path, "wb") as f:
                f.write(data)
            return True
    except Exception:
        return False


def download_batch(items, save_dir, label):
    print(f"\n{'='*50}")
    print(f"  下载 {label}: {len(items)} 张")
    print(f"{'='*50}\n")
    success = skip = fail = 0

    for name, search_query in items:
        # 清理文件名
        safe_name = name.replace("/", "_").replace("\\", "_").replace(" ", "_")
        save_path = save_dir / f"{safe_name}.jpg"
        if save_path.exists() and save_path.stat().st_size > 5000:
            print(f"  {name} — 已存在，跳过")
            skip += 1
            continue

        print(f"  {name} ...", end=" ")
        img_url = search_bing_image(search_query)
        if not img_url:
            print("未找到")
            fail += 1
            continue

        if download_file(img_url, str(save_path)):
            kb = save_path.stat().st_size // 1024
            print(f"OK ({kb}KB)")
            success += 1
        else:
            print("失败")
            fail += 1

        time.sleep(0.8)

    print(f"\n{label}: 成功{success} / 跳过{skip} / 失败{fail}")
    return success, skip, fail


def main():
    from religions import ANCESTRAL_TEMPLES, PATRIARCHS

    # 祖庭图片
    temple_items = [(t[0], t[5]) for t in ANCESTRAL_TEMPLES]
    s1, k1, f1 = download_batch(temple_items, TEMPLES_DIR, "祖庭图片")

    # 祖师图片
    patriarch_items = [(p[0], p[6]) for p in PATRIARCHS]
    s2, k2, f2 = download_batch(patriarch_items, PATRIARCHS_DIR, "祖师画像")

    total_t = len(list(TEMPLES_DIR.glob("*.jpg")))
    total_p = len(list(PATRIARCHS_DIR.glob("*.jpg")))
    print(f"\n{'='*50}")
    print(f"  全部完成！祖庭 {total_t} 张 | 祖师 {total_p} 张")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
