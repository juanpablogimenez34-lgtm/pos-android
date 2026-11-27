// PEZ REMO GIGANTE — PERSONAJE PREMIUM 2.5D (componente reutilizable).
// Recibe un rig 3D ya construido (OarfishRig) y una proyección; dibuja, de atrás hacia delante:
//   pectoral lejana → pélvicas (3D, siguen el cuerpo) → aleta dorsal 3D → piel en bandas deformables
//   → irisación → escamas → manchas → línea lateral y brillos → luz/niebla a lo largo → contraluz
//   → cabeza (lateral o frontal según el giro) con cresta y pectoral cercana.
// Exposición con barrido (la luz puede revelar primero la cabeza), niebla por distancia y opacidad.
import React from 'react';
import {clamp, hash1} from '../../engine/math';
import {taper} from '../ep15-pez-remo-personaje/character/rig';
import {finGeometry, FinMotion, OarfishDorsalFin} from './OarfishDorsalFin';
import {headPlacement, OarfishHead} from './OarfishHead';
import {AlongGradient, IridescentGradient, MAT, shade, SKIN_RAMP} from './OarfishMaterials';
import {depthAt, f1, Proj, project, Rig, V2, vadd, vmul} from './OarfishRig';

export type Look = {
  exposure: number; // 0 silueta … 1 iluminado
  sweep: number; // 0…1.2: avance de la luz desde la cabeza hacia la cola
  fog: number; // niebla base (0…1)
  rim: number; // contraluz azul
  crest: number; // visibilidad de la cresta
  mouth: number;
  fin: FinMotion;
  opacity: number;
};

export const defaultLook = (o: Partial<Look> = {}): Look => ({exposure: 1, sweep: 1.2, fog: 0, rim: 0.7, crest: 1, mouth: 0.2, fin: {waves: 6, speed: 3.4, amp: 0.3}, opacity: 1, ...o});

const lerp2 = (a: V2, b: V2, k: number): V2 => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k});

export const OarfishCharacter: React.FC<{rig: Rig; pr: Proj; look: Look; uid: string}> = ({rig, pr, look, uid}) => {
  const fr = rig.frames;
  const n = fr.length;
  const t = rig.params.t;
  const top: V2[] = [];
  const bot: V2[] = [];
  const mid: V2[] = [];
  const kz: number[] = [];
  for (let i = 0; i < n; i++) {
    const h = depthAt(fr[i].u) * 0.5;
    top.push(project(vadd(fr[i].p, vmul(fr[i].d, h)), pr));
    bot.push(project(vadd(fr[i].p, vmul(fr[i].d, -h)), pr));
    const m = project(fr[i].p, pr);
    mid.push(m);
    kz.push(m.k);
  }
  // punto de piel (u a lo largo, v de −1 dorso a 1 vientre)
  const P = (u: number, v: number): V2 => {
    const g = clamp(u) * (n - 1);
    const j = Math.min(n - 2, Math.floor(g));
    const s = g - j;
    const a = lerp2(top[j], bot[j], (v + 1) / 2);
    const b = lerp2(top[j + 1], bot[j + 1], (v + 1) / 2);
    return lerp2(a, b, s);
  };
  const curve = (v: number, u0 = 0, u1 = 1, m = 70) => Array.from({length: m + 1}, (_, i) => P(u0 + ((u1 - u0) * i) / m, v)).map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  const band = (v0: number, v1: number) => {
    const A = Array.from({length: n}, (_, i) => lerp2(top[i], bot[i], (v0 + 1) / 2));
    const B = Array.from({length: n}, (_, i) => lerp2(top[i], bot[i], (v1 + 1) / 2));
    return `M${A.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${B.reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  };
  const tailTip = mid[n - 1];
  const tailDir = {x: mid[n - 1].x - mid[n - 4].x, y: mid[n - 1].y - mid[n - 4].y};
  const tl = Math.hypot(tailDir.x, tailDir.y) || 1;
  const tip = {x: tailTip.x + (tailDir.x / tl) * 22 * kz[n - 1], y: tailTip.y + (tailDir.y / tl) * 22 * kz[n - 1]};
  const body = `M${top.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${f1(tip.x)},${f1(tip.y)} L${bot.slice().reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  // luz por barrido y niebla por distancia, a lo largo del cuerpo
  const lightAt = (u: number) => look.exposure * clamp((look.sweep - u * 0.9) / 0.18);
  const fogAt = (i: number) => clamp(look.fog + Math.max(0, (1 / kz[i] - 1)) * 0.45);
  const head2 = mid[0];
  const stops = Array.from({length: 11}, (_, s) => s / 10);
  const darkStops: [number, string, number][] = stops.map((u) => [u, '#020814', 0.92 * (1 - lightAt(u))]);
  const fogStops: [number, string, number][] = stops.map((u) => [u, MAT.water, fogAt(Math.round(u * (n - 1)))]);
  // escamas: arcos que se solapan hacia la cola, construidos sobre la piel deformada
  const rows = [-0.62, -0.31, 0, 0.31, 0.62];
  const scaleD = rows.map((v, r) => {
    let d = '';
    const m = 112;
    for (let j = 0; j < m; j++) {
      const u = (j + (r % 2) * 0.5) / m;
      if (u > 0.96) break;
      const a = P(u, v - 0.16);
      const b = P(u, v + 0.16);
      const c = P(u + 0.006, v);
      d += `M${f1(a.x)},${f1(a.y)} Q${f1(c.x)},${f1(c.y)} ${f1(b.x)},${f1(b.y)} `;
    }
    return d;
  });
  // manchas: polígonos orientados según la tangente local proyectada
  let spots = '';
  for (let i = 0; i < 220; i++) {
    const u = 0.02 + Math.pow(hash1(i * 3.7), 1.15) * 0.9;
    const v = -0.5 + hash1(i * 5.3) * 0.75;
    const c = P(u, v);
    const a = P(u + 0.004, v);
    const tx = a.x - c.x;
    const ty = a.y - c.y;
    const l = Math.hypot(tx, ty) || 1;
    const nx = -ty / l;
    const ny = tx / l;
    const k = kz[Math.round(u * (n - 1))];
    const sz = (1.8 + hash1(i * 9.1) * 3.6) * (1 - u * 0.6) * k;
    const rx = sz * (1.2 + 2.2 * hash1(i * 2.2)) * Math.min(1, l / (0.004 * 1750 * k * 0.9) + 0.2);
    const ry = sz * (0.4 + 0.4 * hash1(i * 6.6));
    spots += 'M' + Array.from({length: 8}, (_, q) => {
      const w = (q / 8) * Math.PI * 2;
      return `${f1(c.x + (tx / l) * rx * Math.cos(w) + nx * ry * Math.sin(w))},${f1(c.y + (ty / l) * rx * Math.cos(w) + ny * ry * Math.sin(w))}`;
    }).join(' L') + 'Z ';
  }
  // pélvicas 3D: radios largos que salen bajo la garganta y siguen el cuerpo
  const pelvic = [0, 1].map((side) =>
    Array.from({length: 22}, (_, i) => {
      const u = (i / 21) * 0.3;
      const j = Math.round(u * (n - 1));
      const f = fr[j];
      const drop = depthAt(f.u) * 0.5 + 18 + i * (5.2 + side * 1.4) + Math.sin(t * 1.3 - i * 0.35 + side) * 6 * (i / 21);
      return project(vadd(vadd(f.p, vmul(f.d, -drop)), vmul(f.l, (side ? -1 : 1) * 6)), pr);
    }),
  );
  const fin = finGeometry(rig, pr, look.fin);
  const hp = headPlacement(fr[0], pr);
  const L0 = lightAt(0);
  const headFilter = L0 < 0.98 ? `brightness(${(0.12 + 0.88 * L0).toFixed(3)})` : undefined;
  const shift = (t * 70) % 620;
  return (
    <g opacity={look.opacity}>
      <defs>
        <AlongGradient id={`dk-${uid}`} from={head2} to={tailTip} stops={darkStops} />
        <AlongGradient id={`fg-${uid}`} from={head2} to={tailTip} stops={fogStops} />
        <IridescentGradient id={`ir-${uid}`} shift={shift} />
        <clipPath id={`cl-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      <g style={{filter: headFilter}}>
        <OarfishHead hp={hp} t={t} mouth={look.mouth} uid={`${uid}b`} light={L0} crestK={look.crest} part="back" />
      </g>
      {pelvic.map((pts, s) => (
        <g key={s} opacity={s ? 0.6 : 1}>
          <path d={taper(pts, 4 * kz[2], 1.2 * kz[20])} fill={s ? MAT.redDeep : MAT.red} />
          <ellipse cx={pts[21].x} cy={pts[21].y} rx={15 * kz[20]} ry={5 * kz[20]} fill={MAT.red} opacity={0.85} />
        </g>
      ))}
      <OarfishDorsalFin g={fin} uid={uid} light={lightAt(0.3)} shadeFill={`url(#dk-${uid})`} />
      {/* piel en bandas deformables */}
      <g clipPath={`url(#cl-${uid})`}>
        {SKIN_RAMP.map((c, b) => (
          <path key={b} d={band(-1.05 + b * 0.21, -1.05 + (b + 1) * 0.21 + 0.02)} fill={shade(c, 1)} />
        ))}
        <path d={body} fill={`url(#ir-${uid})`} style={{mixBlendMode: 'screen'}} opacity={0.9} />
        {scaleD.map((d, i) => (
          <g key={i}>
            <path d={d} stroke="#0c1838" strokeWidth={1.3} fill="none" opacity={0.26} transform="translate(1.2 1)" />
            <path d={d} stroke="#ffffff" strokeWidth={1.1} fill="none" opacity={0.34} />
          </g>
        ))}
        <path d={spots} fill={MAT.spot} opacity={0.62} />
        <path d={curve(0.05, 0.01, 0.96)} stroke="#e8f4ff" strokeWidth={1.7} fill="none" opacity={0.55} />
        <path d={curve(-0.42, 0, 0.9)} stroke="#ffffff" strokeWidth={12} fill="none" opacity={0.16} strokeLinecap="round" />
        <path d={curve(-0.38, 0, 0.9)} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" strokeDasharray="70 260" strokeDashoffset={f1(-t * 220)} />
        <path d={band(-1.05, -0.78)} fill="#000a20" opacity={0.35} />
        <path d={band(0.82, 1.05)} fill="#000a20" opacity={0.22} />
        <path d={body} fill={`url(#dk-${uid})`} />
        <path d={body} fill={`url(#fg-${uid})`} />
      </g>
      {/* contraluz azul: hace legible la silueta incluso en la oscuridad */}
      <path d={curve(-1, 0, 0.98)} stroke={MAT.rim} strokeWidth={10} fill="none" opacity={0.15 * look.rim} strokeLinecap="round" />
      <path d={curve(-1, 0, 0.98)} stroke={MAT.rim} strokeWidth={2.5} fill="none" opacity={0.65 * look.rim} strokeLinecap="round" />
      <path d={curve(1, 0.02, 0.98)} stroke="#e8f0ff" strokeWidth={1.8} fill="none" opacity={0.35 * look.rim} />
      <path d={`${curve(-1, 0.02, 1)} ${curve(1, 0.02, 1)}`} fill="none" stroke="#0a1430" strokeWidth={1.5} opacity={0.55} />
      <g style={{filter: headFilter}}>
        <OarfishHead hp={hp} t={t} mouth={look.mouth} uid={uid} light={L0} crestK={look.crest} part="front" />
      </g>
    </g>
  );
};
