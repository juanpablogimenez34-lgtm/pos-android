// ESTUDIO 2.0 · Comprobación de reglas de retención de un episodio (JSON de beats).
//   node scripts/check-retention.mjs src/episodes/ep12-dragon-azul-v2/config/beats.json [maxGap=15]
import {readFileSync} from 'node:fs';

const [file, gapArg = '15'] = process.argv.slice(2);
const maxGap = Number(gapArg);
const plan = JSON.parse(readFileSync(file, 'utf8'));
const warn = [];
const segs = plan.segments;
if (segs[0][0] !== 0) warn.push('La estructura no empieza en 0 s');
for (let i = 1; i < segs.length; i++) if (segs[i][0] !== segs[i - 1][1]) warn.push(`Hueco/solape en ${segs[i - 1][1]} s`);
if (segs[segs.length - 1][1] !== plan.duration) warn.push('La estructura no termina en la duración total');
if (plan.hook.action[0] > 0.05) warn.push('El gancho no empieza con acción en el fotograma 0');
if (plan.hook.promise[1] > 5.5) warn.push('La promesa del gancho termina después de 5,5 s');
const ts = [0, ...plan.beats.map((b) => b.t).sort((a, b) => a - b), plan.duration];
let worst = 0;
for (let i = 1; i < ts.length; i++) {
  const g = ts[i] - ts[i - 1];
  worst = Math.max(worst, g);
  if (g > maxGap) warn.push(`Sin cambio visual entre ${ts[i - 1]} s y ${ts[i]} s (${g.toFixed(1)} s)`);
}
console.log(`beats: ${plan.beats.length} · mayor intervalo sin cambio visual: ${worst.toFixed(1)} s (máx ${maxGap} s)`);
if (warn.length) {
  console.log('AVISOS:\n  ' + warn.join('\n  '));
  process.exit(2);
}
console.log('✔ reglas de retención cumplidas');
