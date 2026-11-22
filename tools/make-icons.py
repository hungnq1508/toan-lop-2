"""Tạo biểu tượng ứng dụng (cú Tròn + số 2) ở các kích thước PNG cho PWA/iPad.
Chạy: python3 tools/make-icons.py   (cần Pillow)"""
from PIL import Image, ImageDraw

def owl(size, maskable=False, rounded=True):
    S = 4  # vẽ lớn rồi thu nhỏ cho mịn
    W = size * S
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    bg = (255, 183, 3, 255)
    if rounded and not maskable:
        d.rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * 0.22), fill=bg)
    else:
        d.rectangle([0, 0, W, W], fill=bg)
    k = 0.78 if maskable else 1.0       # vùng an toàn cho biểu tượng maskable
    o = W * (1 - k) / 2
    def P(x, y): return (o + x * W * k, o + y * W * k)
    def box(x0, y0, x1, y1): return [P(x0, y0), P(x1, y1)]
    # tai
    d.polygon([P(.28, .26), P(.24, .1), P(.4, .2)], fill=(194, 65, 12))
    d.polygon([P(.72, .26), P(.76, .1), P(.6, .2)], fill=(194, 65, 12))
    # thân, bụng
    d.ellipse(box(.18, .16, .82, .94), fill=(234, 88, 12))
    d.ellipse(box(.32, .5, .68, .9), fill=(254, 215, 170))
    # mắt
    for cx in (.39, .61):
        d.ellipse(box(cx - .12, .27, cx + .12, .51), fill='white')
        d.ellipse(box(cx - .055, .33, cx + .055, .45), fill=(30, 41, 59))
        d.ellipse(box(cx - .01, .345, cx + .025, .38), fill='white')
    # mỏ
    d.polygon([P(.46, .52), P(.54, .52), P(.5, .6)], fill=(250, 204, 21))
    # số 2 trên bụng
    try:
        from PIL import ImageFont
        font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf', int(W * k * .26))
    except Exception:
        font = None
    if font:
        d.text(P(.5, .76), '2', fill=(194, 65, 12), font=font, anchor='mm')
    return img.resize((size, size), Image.LANCZOS)

out = 'assets/icons/'
owl(180, rounded=False).convert('RGB').save(out + 'apple-touch-icon.png')
owl(192).save(out + 'icon-192.png')
owl(512).save(out + 'icon-512.png')
owl(512, maskable=True).save(out + 'icon-512-maskable.png')
print('ok')
