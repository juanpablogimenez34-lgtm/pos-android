// Subtítulos a partir de los tiempos REALES de la voz: cada frase se divide en bloques de ≤ 2 líneas y el tiempo
// se reparte en proporción al número de caracteres (sincronía con la locución medida).
export type TimedLine = {id: string; text: string; start: number; end: number; scene?: number};
export type Cue = {start: number; end: number; lines: string[]};

export function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
export function cuesFrom(timing: TimedLine[], max: number, maxLines = 2): Cue[] {
  const out: Cue[] = [];
  for (const l of timing) {
    const lines = wrap(l.text, max);
    // evitar bloques finales de una sola palabra suelta: reequilibrar
    const blocks: string[][] = [];
    for (let i = 0; i < lines.length; i += maxLines) blocks.push(lines.slice(i, i + maxLines));
    if (blocks.length > 1 && blocks[blocks.length - 1].join(' ').split(' ').length < 2) {
      const last = blocks.pop()!;
      blocks[blocks.length - 1] = wrap(blocks[blocks.length - 1].join(' ') + ' ' + last.join(' '), max + 6).slice(0, maxLines);
    }
    const total = blocks.reduce((a, b) => a + b.join(' ').length, 0);
    let t = l.start;
    blocks.forEach((b, i) => {
      const d = ((l.end - l.start) * b.join(' ').length) / total;
      out.push({start: t, end: i === blocks.length - 1 ? l.end + 0.25 : t + d, lines: b});
      t += d;
    });
  }
  return out;
}
export const speechIntervals = (timing: TimedLine[]) => timing.map((l) => [l.start, l.end] as [number, number]);
/** SRT con el formato estándar hh:mm:ss,mmm. */
export function toSrt(cues: Cue[]): string {
  const ts = (s: number) => {
    const ms = Math.round(s * 1000);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
  };
  return cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(Math.min(c.end, cues[i + 1]?.start ?? c.end))}\n${c.lines.join('\n')}\n`).join('\n');
}
