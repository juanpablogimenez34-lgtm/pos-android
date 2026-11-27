// Renderiza fotogramas sueltos de una composición (un solo empaquetado) para inspección visual.
//   node scripts/stills.mjs --comp PumaSheet --dir /tmp/x --views left,front   (prop "view")
//   node scripts/stills.mjs --comp PumaWalkTest --dir /tmp/x --frames 0,10,20
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const comp = arg('comp', 'PumaSheet');
const dir = path.resolve(arg('dir', 'out/stills'));
const views = arg('views', '') ? arg('views').split(',') : [null];
const frames = arg('frames', '0').split(',').map(Number);
const extra = JSON.parse(arg('props', '{}'));
const scale = Number(arg('scale', '1'));
mkdirSync(dir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const be = process.env.REMOTION_BROWSER ?? null;
for (const v of views) {
  const inputProps = v ? {...extra, view: v} : extra;
  const composition = await selectComposition({serveUrl, id: comp, inputProps, browserExecutable: be, chromiumOptions: {gl: 'swangle'}});
  for (const f of frames) {
    const file = path.join(dir, `${v ?? comp}-${String(f).padStart(4, '0')}.png`);
    await renderStill({composition, serveUrl, output: file, frame: f, inputProps, scale, browserExecutable: be, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 240000});
    process.stdout.write(`${path.basename(file)} `);
  }
}
console.log('\nok');
