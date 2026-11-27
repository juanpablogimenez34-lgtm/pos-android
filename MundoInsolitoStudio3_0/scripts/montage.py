# Une imágenes en una cuadrícula: python3 scripts/montage.py salida.png cols ancho img1 img2 ...
import sys
from PIL import Image
out, cols, cw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); fs = sys.argv[4:]
ims = [Image.open(f) for f in fs]
ch = int(cw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
o = Image.new('RGB', (cols * cw, rows * ch), (20, 20, 20))
for i, im in enumerate(ims): o.paste(im.convert('RGB').resize((cw, ch)), ((i % cols) * cw, (i // cols) * ch))
o.save(out)
