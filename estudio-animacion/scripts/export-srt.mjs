// ESTUDIO 2.0 · Exporta subtítulos .srt con los MISMOS bloques que se dibujan en el video
// (máx. 2 líneas, reparto proporcional dentro del tramo medido de cada frase; igual que
// src/engine/cues.ts → cuesFromTiming).
//   node scripts/export-srt.mjs <narration-timing.json> <salida.srt> [maxChars=28] [limiteSeg]
import {readFileSync, writeFileSync} from 'node:fs';

const [src, out, maxArg = '28', limitArg] = process.argv.slice(2);
const maxChars = Number(maxArg);
const limit = limitArg ? Number(limitArg) : Infinity;
const {timing} = JSON.parse(readFileSync(src, 'utf8'));
const cues = [];
for (const line of timing) {
  const rows = [];
  let cur = '';
  for (const w of line.text.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      rows.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) rows.push(cur);
  const blocks = [];
  for (let i = 0; i < rows.length; i += 2) blocks.push(rows.slice(i, i + 2).join('\n'));
  const chars = blocks.reduce((a, b) => a + b.length, 0);
  let t = line.start;
  const dur = line.end - line.start;
  blocks.forEach((b, i) => {
    const d = (b.length / chars) * dur;
    const last = i === blocks.length - 1;
    cues.push({start: t, end: last ? line.end + 0.25 : t + d, text: b});
    t += d;
  });
}
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(Math.floor((ms % 60000) / 1000))},${p(ms % 1000, 3)}`;
};
const sel = cues.filter((c) => c.start < limit).map((c) => ({...c, end: Math.min(c.end, limit)}));
writeFileSync(out, sel.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n'));
console.log(`✔ ${sel.length} subtítulos → ${out}`);
