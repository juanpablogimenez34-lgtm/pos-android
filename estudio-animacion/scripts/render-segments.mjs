// Render por segmentos: divide la composición en tramos independientes (posible
// porque cada fotograma es una función pura del tiempo), los renderiza uno a uno
// y los une sin recomprimir con ffmpeg (el que trae Remotion).
// Útil en máquinas con poca memoria o para reintentar sólo un tramo fallido.
//   node scripts/render-segments.mjs [composición] [segundosPorTramo] [salida.mp4]
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync, existsSync} from 'node:fs';

const [comp = 'Ep01Demo', segSecArg = '5', out = 'out/ep01-demo-segmentos.mp4'] = process.argv.slice(2);
const fps = 30;
const totalFrames = comp === 'Ep01Demo' ? 450 : Number(process.env.FRAMES ?? 450);
const seg = Math.round(Number(segSecArg) * fps);
mkdirSync('out/segments', {recursive: true});
const parts = [];
for (let start = 0; start < totalFrames; start += seg) {
  const end = Math.min(totalFrames - 1, start + seg - 1);
  const file = `out/segments/${comp}-${String(start).padStart(5, '0')}.mp4`;
  parts.push(file);
  if (existsSync(file) && !process.env.FORCE) {
    console.log(`= ${file} ya existe (FORCE=1 para rehacer)`);
    continue;
  }
  console.log(`> tramo ${start}-${end}`);
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', comp, file, `--frames=${start}-${end}`, '--codec=h264', '--crf=20'], {
    stdio: 'inherit',
  });
}
writeFileSync('out/segments/list.txt', parts.map((p) => `file '${p.replace('out/segments/', '')}'`).join('\n'));
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', 'out/segments/list.txt', '-c', 'copy', out], {stdio: 'inherit'});
console.log(`✔ ${out}`);
