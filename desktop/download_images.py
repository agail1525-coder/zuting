"""
按圣地名从 Bing 搜索并下载对应图片
自动读取 religions.py 中的 HOLY_SITES
"""

import urllib.request
import urllib.parse
import re
import time
from pathlib import Path

BG_DIR = Path(__file__).parent / "backgrounds"
BG_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


def search_bing_image(query, retries=2):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&qft=+filterui:imagesize-wallpaper&form=IRFLTR&first=1"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
            urls = re.findall(r'murl&quot;:&quot;(https?://[^&]+?)&quot;', html)
            if not urls:
                urls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            for u in urls:
                if any(s in u.lower() for s in ["logo", "icon", "avatar", "thumb", ".gif"]):
                    continue
                return u
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2)
    return None


def download_file(url, save_path, timeout=20):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            if len(data) < 8000:
                return False
            with open(save_path, "wb") as f:
                f.write(data)
            return True
    except Exception:
        return False


def main():
    from religions import HOLY_SITES

    print(f"准备下载 {len(HOLY_SITES)} 个圣地图片\n")
    success = skip = fail = 0

    for site_name, religion, country, sound, search_query, *_ in HOLY_SITES:
        save_path = BG_DIR / f"{site_name}.jpg"
        if save_path.exists() and save_path.stat().st_size > 8000:
            print(f"  [{religion}] {site_name} — 已存在，跳过")
            skip += 1
            continue

        print(f"  [{religion}] {site_name} ...", end=" ")
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

    total = len(list(BG_DIR.glob("*.jpg"))) + len(list(BG_DIR.glob("*.png")))
    print(f"\n完成！成功 {success} / 跳过 {skip} / 失败 {fail} / 总计 {total} 张")


if __name__ == "__main__":
    main()
