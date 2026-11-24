// Renderiza los cinco Shorts verticales (1080×1920) con el mismo motor por segmentos y normalización de sonoridad.
//   node scripts/render-shorts.mjs [--quality premium] [--only 1,3]
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const quality = arg('quality', 'premium');
const only = arg('only', '1,2,3,4,5').split(',').map(Number);
const names = {1: 'pez-pescador-luz', 2: 'dientes-pez-vibora', 3: 'ojos-calamar-gigante', 4: 'cachalote-caza-oscuridad', 5: 'gigante-vs-colosal'};
for (const n of only) {
  const dur = JSON.parse(readFileSync(`src/shorts/data/short${n}.json`, 'utf8')).durationSec;
  console.log(`\n=== Short ${n} (${dur} s) ===`);
  execFileSync('node', ['scripts/render.mjs', '--comp', `Short${n}`, '--quality', quality, '--scale', quality === 'premium' ? '1' : '0.5', '--crf', '20', '--seg', '30', '--frames', String(dur * 30), '--out', `out/short-${n}-${names[n]}-1080x1920.mp4`], {stdio: 'inherit'});
}
