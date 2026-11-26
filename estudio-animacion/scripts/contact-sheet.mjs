// Hoja de contacto: renderiza fotogramas sueltos (un solo bundle) y los une en
// una cuadrícula para revisar escenas sin renderizar el video completo.
//   node scripts/contact-sheet.mjs <composición> <salida.png> <seg1,seg2,...> [escala] [calidad]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';

const [comp = 'Ep01Full', out = 'out/sheet.png', times = '0,5,10', scaleArg = '0.35', quality = 'final'] = process.argv.slice(2);
const scale = Number(scaleArg);
const secs = times.split(',').map(Number);
const tmp = path.resolve(`out/.sheet-${process.pid}`);
rmSync(tmp, {recursive: true, force: true});
mkdirSync(tmp, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {quality, showSubtitles: true, ...(process.env.PROPS ? JSON.parse(process.env.PROPS) : {})}; // PROPS='{"n":0}' opcional
const composition = await selectComposition({serveUrl, id: comp, inputProps, logLevel: 'error', browserExecutable: process.env.REMOTION_BROWSER ?? null});
const files = [];
for (const [i, s] of secs.entries()) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const file = path.join(tmp, `${String(i).padStart(3, '0')}.png`);
  await renderStill({composition: {...composition, props: {...composition.props, ...inputProps}}, serveUrl, output: file, frame, scale, inputProps: {...composition.props, ...inputProps}, logLevel: 'error', browserExecutable: process.env.REMOTION_BROWSER ?? null});
  files.push(file);
  process.stdout.write(`${s}s `);
}
const cols = Math.min(6, files.length);
// unión con Python/Pillow (el ffmpeg que trae Remotion no incluye el filtro "tile")
const py = `from PIL import Image\nimport sys\nfs=sys.argv[3:]\ncols=int(sys.argv[2])\nims=[Image.open(f) for f in fs]\nw,h=ims[0].size\nrows=(len(ims)+cols-1)//cols\no=Image.new('RGB',(cols*w+(cols-1)*4,rows*h+(rows-1)*4))\nfor i,im in enumerate(ims): o.paste(im,((i%cols)*(w+4),(i//cols)*(h+4)))\no.save(sys.argv[1])`;
execFileSync('python3', ['-c', py, out, String(cols), ...files], {stdio: 'inherit'});
rmSync(tmp, {recursive: true, force: true});
console.log(`\n✔ ${out}`);
