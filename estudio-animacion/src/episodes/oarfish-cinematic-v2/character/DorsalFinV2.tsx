// GEOMETRÍA DE LA ALETA DORSAL v2 (propia de esta versión): ~220 radios construidos en 3D sobre el
// rig y proyectados. Onda progresiva cabeza → cola con DESFASE por radio (inclinación) y una
// modulación de longitud suave (±7 %), más ondas cortas: rizado fino y natural, sin "montañas".
// Los radios de la nuca crecen poco a poco (la cresta domina esa zona).
import {clamp, hash1} from '../../../engine/math';
import {depthAt, Proj, project, Rig, V2, vadd, vmul} from '../../ep16-pez-remo-premium/OarfishRig';

export type FinMotionV2 = {waves: number; speed: number; amp: number};

export function finGeometryV2(rig: Rig, pr: Proj, m: FinMotionV2) {
  const fr = rig.frames;
  const n = 220;
  const t = rig.params.t;
  const bases: V2[] = [];
  const ctrls: V2[] = [];
  const tips: V2[] = [];
  for (let i = 0; i < n; i++) {
    const g = (0.003 + (i / (n - 1)) * 0.978) * (fr.length - 1);
    const j = Math.min(fr.length - 2, Math.floor(g));
    const s = g - j;
    const A = fr[j];
    const B = fr[j + 1];
    const p = vadd(vmul(A.p, 1 - s), vmul(B.p, s));
    const d = vadd(vmul(A.d, 1 - s), vmul(B.d, s));
    const h = vadd(vmul(A.h, 1 - s), vmul(B.h, s));
    const u = A.u + (B.u - A.u) * s;
    const base = vadd(p, vmul(d, depthAt(u) * 0.5 * 0.96));
    const ph = 2 * Math.PI * m.waves * u - m.speed * t;
    const a = 0.7 + Math.sin(ph + hash1(i * 1.3) * 0.15) * m.amp;
    const nape = clamp((u - 0.003) / 0.05) ** 1.5 * 0.85 + 0.15;
    const L = (112 * (1 - 0.78 * Math.pow(u, 1.05)) + 12) * (0.93 + 0.07 * Math.cos(ph)) * (0.96 + 0.08 * hash1(i * 4.1)) * nape;
    const dir = vadd(vmul(d, Math.cos(a)), vmul(h, -Math.sin(a)));
    bases.push(project(base, pr));
    ctrls.push(project(vadd(vadd(base, vmul(dir, L * 0.58)), vmul(h, -L * 0.18)), pr));
    tips.push(project(vadd(base, vmul(dir, L)), pr));
  }
  return {bases, ctrls, tips};
}
