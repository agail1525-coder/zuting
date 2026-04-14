"""Generate Mobile icon.png/splash.png/favicon.png + resize miniprogram logos.

Inputs:
  apps/web/public/logo.png       (white text, 3869x425 RGBA — for dark bg)
  apps/web/public/logo-dark.png  (dark-blue text, 3869x425 RGBA — for light bg)

Outputs:
  apps/mobile/assets/icon.png            (1024x1024, square — logo-dark on white)
  apps/mobile/assets/splash.png          (1284x2778, #3264ff bg + centered white logo)
  apps/mobile/assets/favicon.png         (48x48)
  apps/mobile/assets/adaptive-icon.png   (1024x1024, transparent bg w/ dark logo)
  apps/miniprogram/src/assets/logo.png       (≤800w, white)
  apps/miniprogram/src/assets/logo-dark.png  (≤800w, dark)
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_WHITE = ROOT / "apps/web/public/logo.png"        # white text
SRC_DARK  = ROOT / "apps/web/public/logo-dark.png"   # dark-blue text
PRIMARY = (0x32, 0x64, 0xFF, 0xFF)                   # #3264ff

def fit(img, max_w, max_h):
    w, h = img.size
    r = min(max_w / w, max_h / h)
    return img.resize((int(w * r), int(h * r)), Image.LANCZOS)

def make_square(bg_color, logo, size, logo_frac=0.7):
    canvas = Image.new("RGBA", (size, size), bg_color)
    lg = fit(logo, int(size * logo_frac), int(size * logo_frac))
    x = (size - lg.width) // 2
    y = (size - lg.height) // 2
    canvas.paste(lg, (x, y), lg)
    return canvas

def main():
    white = Image.open(SRC_WHITE).convert("RGBA")
    dark  = Image.open(SRC_DARK).convert("RGBA")

    # Mobile icon: square, white bg + dark logo
    icon = make_square((255, 255, 255, 255), dark, 1024, logo_frac=0.8)
    icon.save(ROOT / "apps/mobile/assets/icon.png")

    # Mobile adaptive-icon (Android): transparent bg + dark logo
    adap = make_square((0, 0, 0, 0), dark, 1024, logo_frac=0.65)
    adap.save(ROOT / "apps/mobile/assets/adaptive-icon.png")

    # Favicon
    fav = make_square((255, 255, 255, 255), dark, 48, logo_frac=0.85)
    fav.save(ROOT / "apps/mobile/assets/favicon.png")

    # Splash: blue bg + centered white logo
    splash = Image.new("RGBA", (1284, 2778), PRIMARY)
    lg = fit(white, 800, 200)
    splash.paste(lg, ((1284 - lg.width) // 2, (2778 - lg.height) // 2), lg)
    splash.save(ROOT / "apps/mobile/assets/splash.png")

    # Miniprogram: resize logos to ≤800w to save package size
    for name, src in [("logo.png", white), ("logo-dark.png", dark)]:
        small = fit(src, 800, 800)
        out = ROOT / f"apps/miniprogram/src/assets/{name}"
        small.save(out, optimize=True)
        print(f"  {out.name}: {small.size} -> {out.stat().st_size} bytes")

    print("done.")

if __name__ == "__main__":
    main()
