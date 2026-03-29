"""
生成 ZuTing 应用图标 (多尺寸 ICO)
深色背景 + 金色佛教符号 + 祖庭文字
"""

from PIL import Image, ImageDraw, ImageFont
import sys


def generate_icon(output_path="zuting.ico"):
    sizes = [16, 32, 48, 64, 128, 256]
    images = []

    for size in sizes:
        img = Image.new("RGBA", (size, size), (15, 23, 42, 255))
        draw = ImageDraw.Draw(img)

        # 深色渐变背景
        for y in range(size):
            r = int(15 + (2 - 15) * y / size)
            g = int(23 + (6 - 23) * y / size)
            b = int(42 + (23 - 42) * y / size)
            draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

        # 金色边框
        gold = (212, 168, 85, 255)
        border = max(1, size // 32)
        draw.rectangle([0, 0, size - 1, size - 1], outline=gold, width=border)

        # 中心金色圆
        cx, cy = size // 2, size // 2
        radius = int(size * 0.35)
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
                     outline=gold, width=max(1, size // 24))

        # 中心点
        dot_r = max(1, size // 12)
        draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=gold)

        # 尝试添加文字 (大尺寸)
        if size >= 48:
            try:
                font_size = max(8, size // 6)
                try:
                    fnt = ImageFont.truetype("msyh.ttc", font_size)
                except Exception:
                    try:
                        fnt = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", font_size)
                    except Exception:
                        fnt = ImageFont.load_default()
                text = "祖庭"
                bb = draw.textbbox((0, 0), text, font=fnt)
                tw = bb[2] - bb[0]
                th = bb[3] - bb[1]
                draw.text(((size - tw) // 2, size - th - max(2, size // 10)),
                          text, fill=gold, font=fnt)
            except Exception:
                pass

        images.append(img.convert("RGBA"))

    # 保存为 ICO
    images[0].save(output_path, format="ICO",
                   sizes=[(s, s) for s in sizes],
                   append_images=images[1:])
    print(f"图标已生成: {output_path} ({len(sizes)} 尺寸)")
    return output_path


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "zuting.ico"
    generate_icon(out)
