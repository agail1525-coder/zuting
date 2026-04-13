"""resize-images.py — 把 holy-sites-images 下的大图压缩到 max-width 1200 JPEG q=80"""
import os, sys
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), 'data', 'holy-sites-images')
MAX_W = 1200
Q = 82

def main():
    files = sorted(os.listdir(SRC))
    total_before = 0
    total_after = 0
    n = 0
    for f in files:
        p = os.path.join(SRC, f)
        if not os.path.isfile(p): continue
        try:
            size_before = os.path.getsize(p)
            total_before += size_before
            img = Image.open(p)
            w, h = img.size
            if w > MAX_W:
                ratio = MAX_W / w
                img = img.resize((MAX_W, int(h * ratio)), Image.LANCZOS)
            if img.mode in ('RGBA', 'P', 'LA'):
                bg = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P': img = img.convert('RGBA')
                if img.mode == 'RGBA':
                    bg.paste(img, mask=img.split()[-1])
                else:
                    bg.paste(img.convert('RGB'))
                img = bg
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            # 重命名为 .jpg 统一
            new_name = os.path.splitext(f)[0] + '.jpg'
            new_path = os.path.join(SRC, new_name)
            img.save(new_path, 'JPEG', quality=Q, optimize=True, progressive=True)
            if new_name != f:
                os.remove(p)
            size_after = os.path.getsize(new_path)
            total_after += size_after
            n += 1
            if n % 50 == 0:
                print(f'  {n}: before={total_before//1024//1024}MB after={total_after//1024//1024}MB')
        except Exception as e:
            print(f'  ✗ {f}: {e}')
    print(f'\n✓ 处理 {n} 张')
    print(f'  压缩前 {total_before//1024//1024} MB')
    print(f'  压缩后 {total_after//1024//1024} MB')
    print(f'  节省  {(total_before-total_after)//1024//1024} MB ({(1-total_after/max(1,total_before))*100:.1f}%)')

if __name__ == '__main__':
    main()
