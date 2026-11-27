// HOJA DE MODELO: renderiza todas las vistas del MISMO modelo (un solo empaquetado) y las une con rótulos.
//   node scripts/model-sheet.mjs entregas/character-model-sheet.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const out = process.argv[2] ?? 'entregas/character-model-sheet.png';
const views = [
  ['left', 'Lateral izquierda'], ['right', 'Lateral derecha'], ['top', 'Superior (dorsal)'], ['bottom', 'Inferior (ventral)'],
  ['front', 'Frontal'], ['back', 'Posterior'], ['threeQuarter', 'Tres cuartos'], ['juvenile', 'Cría (gris) — misma malla'],
  ['head', 'Cabeza: melón, rostro, ojo'], ['eye', 'Ojo'], ['mouth', 'Boca: mandíbula y dientes'], ['flipper', 'Aleta pectoral'], ['skin', 'Piel: moteado y cicatrices'],
];
const tmp = path.resolve('out/.sheet');
mkdirSync(tmp, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const files = [];
for (const [v] of views) {
  const inputProps = {view: v};
  const composition = await selectComposition({serveUrl, id: 'SheetView', inputProps, browserExecutable: process.env.REMOTION_BROWSER ?? null, chromiumOptions: {gl: 'swangle'}});
  const file = path.join(tmp, `${v}.png`);
  await renderStill({composition, serveUrl, output: file, inputProps, browserExecutable: process.env.REMOTION_BROWSER ?? null, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 180000});
  files.push(file);
  process.stdout.write(`${v} `);
}
const py = `
from PIL import Image, ImageDraw, ImageFont
import sys, json
files = json.loads(sys.argv[2]); labels = json.loads(sys.argv[3])
cols = 4; cell = 600; pad = 14; head = 120
rows = (len(files) + cols - 1) // cols
W = cols * cell + (cols + 1) * pad; H = head + rows * (cell + 56) + pad
o = Image.new('RGB', (W, H), (16, 20, 24)); d = ImageDraw.Draw(o)
try:
    fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 44); fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 26)
except Exception:
    fb = fs = ImageFont.load_default()
d.text((pad, 24), 'Inia geoffrensis — hoja de modelo (Mundo Insólito Studio 3.0)', fill=(240, 236, 230), font=fb)
d.text((pad, 80), 'Mismo modelo 3D procedural en todas las vistas · macho adulto 2,30 m · malla continua, esqueleto y texturas procedurales', fill=(170, 180, 186), font=fs)
for i, (f, l) in enumerate(zip(files, labels)):
    x = pad + (i % cols) * (cell + pad); y = head + (i // cols) * (cell + 56)
    o.paste(Image.open(f).resize((cell, cell)), (x, y))
    d.text((x + 6, y + cell + 10), l, fill=(226, 220, 212), font=fs)
o.save(sys.argv[1])
`;
execFileSync('python3', ['-c', py, out, JSON.stringify(files), JSON.stringify(views.map((v) => v[1]))], {stdio: 'inherit'});
console.log(`\n✔ ${out}`);
