import {SceneScript, SubtitleCue} from './types';

/**
 * Genera subtítulos provisionales a partir del guion: parte cada frase en líneas
 * de ≤ maxChars, agrupa de a 2 líneas y reparte el tiempo de la escena en
 * proporción al número de caracteres, respetando las pausas indicadas.
 * Cuando exista la locución real, reemplazar por tiempos medidos sobre el audio.
 */
export function autoCues(scene: SceneScript, maxChars = 34, lead = 0.3): SubtitleCue[] {
  type Chunk = {text: string; pause: number};
  const chunks: Chunk[] = [];
  for (const line of scene.narration) {
    const words = line.text.split(/\s+/);
    const rows: string[] = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > maxChars && cur) {
        rows.push(cur);
        cur = w;
      } else cur = (cur + ' ' + w).trim();
    }
    if (cur) rows.push(cur);
    for (let i = 0; i < rows.length; i += 2) {
      const last = i + 2 >= rows.length;
      chunks.push({text: rows.slice(i, i + 2).join('\n'), pause: last ? line.pauseAfter ?? 0.25 : 0.05});
    }
  }
  const total = scene.end - scene.start - lead;
  const pauses = chunks.reduce((a, c) => a + c.pause, 0);
  const chars = chunks.reduce((a, c) => a + c.text.length, 0);
  const perChar = Math.max(0, total - pauses) / chars;
  let t = scene.start + lead;
  return chunks.map((c) => {
    const dur = c.text.length * perChar;
    const cue = {start: t, end: t + dur, text: c.text};
    t += dur + c.pause;
    return cue;
  });
}

/** Palabras por segundo del guion (control de ritmo: locución natural ≈ 2.2–2.7). */
export function wordsPerSecond(scene: SceneScript) {
  const words = scene.narration.reduce((a, l) => a + l.text.split(/\s+/).length, 0);
  const pauses = scene.narration.reduce((a, l) => a + (l.pauseAfter ?? 0.25), 0);
  return words / (scene.end - scene.start - pauses);
}
