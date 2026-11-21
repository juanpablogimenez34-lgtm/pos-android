// ESTUDIO 2.0 · EXPORTACIÓN DE SUBTÍTULOS (.srt) a partir de los mismos bloques que se dibujan.
import {SubtitleCue} from '../engine/types';

const ts = (s: number) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${p(h)}:${p(m)}:${p(sec)},${p(r, 3)}`;
};
export const cuesToSrt = (cues: SubtitleCue[]) => cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');
