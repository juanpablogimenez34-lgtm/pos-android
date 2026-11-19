// Daphnias (44–58 s): flotan, avanzan a impulsos con las antenas, cambian de dirección y
// derivan con la corriente. La n.º 0 se acerca a la boca del ajolote y es capturada por succión.
import {clamp, fbm1, hash1, lerp, smoothstep} from '../../../engine/math';
import {DaphniaPose} from '../Characters/Daphnia';
import {EV} from '../Timeline/timeline';
import {V3} from './proj';

const BASE: V3 = [-2560, 110, 210];
export const daphniaVisible = (t: number) => t > 44 && t < 59;

/** `mouth` = posición del hocico del ajolote en el instante t (mundo). */
export function daphniaAt(t: number, mouth: V3): DaphniaPose[] {
  const out: DaphniaPose[] = [];
  for (let i = 0; i < 7; i++) {
    const per = 0.7 + hash1(i * 3.1) * 0.6;
    const ph = t / per + hash1(i);
    const k = Math.floor(ph);
    const u = ph - k;
    // impulso: avance rápido al principio de cada golpe de antenas y luego deriva
    const hopDir = hash1(k * 7.3 + i * 13) * Math.PI * 2;
    const push = 1 - Math.pow(1 - clamp(u / 0.35), 3);
    const drift: V3 = [fbm1(t * 0.25, i * 5) * 120 + t * 4, fbm1(t * 0.3, i * 7 + 1) * 70 - (u * 6), fbm1(t * 0.2, i * 9 + 2) * 80];
    const hop: V3 = [Math.cos(hopDir) * 14 * push, Math.sin(hopDir) * 10 * push + 8 * push, 0];
    const ring = (i / 7) * Math.PI * 2;
    let p: V3 = [BASE[0] + Math.cos(ring) * 90 + drift[0] + hop[0], BASE[1] + Math.sin(ring) * 50 + drift[1] + hop[1], BASE[2] + drift[2]];
    let opacity = 1;
    let angle = -0.3 + Math.sin(hopDir) * 0.4;
    // huida tras la captura
    const flee = smoothstep(EV.feed, EV.feed + 1.2, t);
    if (i > 0 && flee > 0) {
      const away = Math.atan2(p[1] - mouth[1], p[0] - mouth[0]);
      p = [p[0] + Math.cos(away) * 160 * flee, p[1] + Math.sin(away) * 110 * flee, p[2]];
    }
    if (i === 0) {
      // presa: se acerca a la cabeza y la succión la arrastra hacia la boca
      const ap = smoothstep(47.6, 49.9, t);
      const target: V3 = [mouth[0] - 40, mouth[1] + 6, mouth[2]];
      p = [lerp(p[0], target[0], ap), lerp(p[1], target[1], ap), lerp(p[2], target[2], ap)];
      const suck = smoothstep(EV.feed - 0.12, EV.feed + 0.06, t);
      p = [lerp(p[0], mouth[0] + 6, suck), lerp(p[1], mouth[1], suck), lerp(p[2], mouth[2], suck)];
      opacity = 1 - smoothstep(EV.feed + 0.02, EV.feed + 0.1, t);
      angle = lerp(angle, 0, ap);
    }
    out.push({pos: p, angle, stroke: u < 0.35 ? u / 0.35 : 1 - (u - 0.35) / 0.65, size: 1.15, opacity});
  }
  return out;
}
