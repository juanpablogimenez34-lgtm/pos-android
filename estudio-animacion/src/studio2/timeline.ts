// ESTUDIO 2.0 · LÍNEA DE TIEMPO NARRATIVA. Un documental se define como DATOS:
//  · segmentos de la estructura de retención (gancho → misterio → revelaciones → cierre),
//  · "beats" visuales (cambios significativos: acción, descubrimiento, perspectiva, comparación…),
//  · gancho de 5 s en tres tiempos.
// `validateEpisode` comprueba las reglas del estudio (cobertura 0–180 s, gancho, cambio visual cada
// 8–15 s como máximo) y devuelve avisos legibles; `scripts/check-retention.mjs` lo ejecuta en CLI.
export type SegmentKind = 'hook' | 'mystery' | 'reveal1' | 'demo' | 'surprise2' | 'deep' | 'fact' | 'finalReveal' | 'close';
export type Segment = {kind: SegmentKind; start: number; end: number; title: string};
export type BeatKind = 'action' | 'discovery' | 'perspective' | 'comparison' | 'science' | 'anatomy' | 'scale' | 'transition';
export type Beat = {t: number; kind: BeatKind; note: string};
export type HookPlan = {action: [number, number]; question: [number, number]; promise: [number, number]};
export type EpisodePlan = {id: string; title: string; duration: number; fps: number; segments: Segment[]; beats: Beat[]; hook: HookPlan};

/** Plantilla de la estructura 2.0 (180 s): se puede reutilizar tal cual en cada documental. */
export const STRUCTURE_180: Omit<Segment, 'title'>[] = [
  {kind: 'hook', start: 0, end: 5},
  {kind: 'mystery', start: 5, end: 20},
  {kind: 'reveal1', start: 20, end: 45},
  {kind: 'demo', start: 45, end: 70},
  {kind: 'surprise2', start: 70, end: 95},
  {kind: 'deep', start: 95, end: 120},
  {kind: 'fact', start: 120, end: 145},
  {kind: 'finalReveal', start: 145, end: 165},
  {kind: 'close', start: 165, end: 180},
];

export const segmentAt = (plan: EpisodePlan, t: number) => plan.segments.find((s) => t >= s.start && t < s.end) ?? plan.segments[plan.segments.length - 1];

export function validateEpisode(plan: EpisodePlan, maxGap = 15): string[] {
  const w: string[] = [];
  const segs = [...plan.segments].sort((a, b) => a.start - b.start);
  if (segs[0]?.start !== 0) w.push('La estructura no empieza en 0 s');
  segs.forEach((s, i) => {
    if (i && Math.abs(s.start - segs[i - 1].end) > 1e-6) w.push(`Hueco o solape entre ${segs[i - 1].kind} y ${s.kind}`);
  });
  if (Math.abs(segs[segs.length - 1].end - plan.duration) > 1e-6) w.push('La estructura no termina en la duración total');
  const h = plan.hook;
  if (h.action[0] > 0.05) w.push('El gancho debe mostrar acción desde el primer fotograma');
  if (h.promise[1] > 5.5) w.push('La promesa del gancho termina después de 5 s');
  const ts = [0, ...plan.beats.map((b) => b.t).sort((a, b) => a - b), plan.duration];
  for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > maxGap) w.push(`Sin cambio visual entre ${ts[i - 1].toFixed(1)} s y ${ts[i].toFixed(1)} s (> ${maxGap} s)`);
  return w;
}
