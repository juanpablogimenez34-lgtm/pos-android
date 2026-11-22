// PEZ REMO GIGANTE — PERSONAJE CINEMATOGRÁFICO v2 (reutilizable).
// Geometría: rig 3D del personaje premium (trayectoria + seguimiento del líder + 12 controles + spline
// continua + proyección), reutilizado sin modificarlo; garantiza longitud aproximadamente constante,
// cero cortes entre segmentos y giros que recorren el cuerpo.
// Aspecto (nuevo):
//  · piel SIN ESCAMAS (como el animal real): plata de guanina con estrías longitudinales iridiscentes,
//    microtextura de tubérculos y volumen calculado con iluminación real (filtro de relieve);
//  · rayas oscuras oblicuas y onduladas + manchas irregulares (patrón típico de Regalecus);
//  · línea lateral baja; luz cáustica que recorre el cuerpo; oscuridad/niebla a lo largo; contraluz;
//  · aleta dorsal roja: membrana translúcida + radios segmentados con halo; cresta delicada;
//  · pélvicas: radios largos terminados en un ensanchamiento con forma de remo; pectoral pequeña.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {taper} from '../../ep15-pez-remo-personaje/character/rig';
import {finGeometryV2 as finV2, FinMotionV2 as FinMotion} from './DorsalFinV2';
import {affine} from '../../ep16-pez-remo-premium/OarfishHead';
import {depthAt, f1, Proj, project, Rig, V2, vadd, vmul} from '../../ep16-pez-remo-premium/OarfishRig';
import {GlowFilter, SoftFilter, VolumeFilter} from './filters';
import {CrestV2, HeadV2} from './OarfishV2Head';

export type LookV2 = {exposure: number; sweep: number; fog: number; rim: number; crest: number; mouth: number; fin: FinMotion; opacity: number; caustics: number};
export const lookV2 = (o: Partial<LookV2> = {}): LookV2 => ({exposure: 1, sweep: 1.3, fog: 0, rim: 0.75, crest: 1, mouth: 0.15, fin: {waves: 9, speed: 3.6, amp: 0.22}, opacity: 1, caustics: 1, ...o});

const RAMP0 = ['#0e1736', '#1a2a5e', '#2f4888', '#5d76b4', '#9eb0d8', '#c9d3e6', '#d8dde9', '#c8c6e2', '#dcdff0', '#eef2f8'];
// 24 bandas interpoladas: sombreado suave sin franjas visibles
const RAMP = Array.from({length: 24}, (_, i) => {
  const g = (i / 23) * (RAMP0.length - 1);
  const j = Math.min(RAMP0.length - 2, Math.floor(g));
  return mixColor(RAMP0[j], RAMP0[j + 1], g - j);
});
/** Perfil de altura v2: en la nuca coincide con la altura de la cabeza (sin escalón). */
const depthV2 = (u: number) => (u < 0.06 ? 126 + (depthAt(0.06) - 126) * (u / 0.06) : depthAt(u));
const L2 = (a: V2, b: V2, k: number): V2 => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k});

export const OarfishV2: React.FC<{rig: Rig; pr: Proj; look: LookV2; uid: string}> = ({rig, pr, look, uid}) => {
  const fr = rig.frames;
  const n = fr.length;
  const t = rig.params.t;
  const top: V2[] = [];
  const bot: V2[] = [];
  const mid: V2[] = [];
  const kz: number[] = [];
  for (let i = 0; i < n; i++) {
    const h = depthV2(fr[i].u) * 0.5;
    top.push(project(vadd(fr[i].p, vmul(fr[i].d, h)), pr));
    bot.push(project(vadd(fr[i].p, vmul(fr[i].d, -h)), pr));
    const m = project(fr[i].p, pr);
    mid.push(m);
    kz.push(m.k);
  }
  const P = (u: number, v: number): V2 => {
    const g = clamp(u) * (n - 1);
    const j = Math.min(n - 2, Math.floor(g));
    const s = g - j;
    return L2(L2(top[j], bot[j], (v + 1) / 2), L2(top[j + 1], bot[j + 1], (v + 1) / 2), s);
  };
  const curve = (v: number, u0 = 0, u1 = 1, m = 80) => Array.from({length: m + 1}, (_, i) => P(u0 + ((u1 - u0) * i) / m, v)).map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  const band = (v0: number, v1: number) => {
    const A = Array.from({length: n}, (_, i) => L2(top[i], bot[i], (v0 + 1) / 2));
    const B = Array.from({length: n}, (_, i) => L2(top[i], bot[i], (v1 + 1) / 2));
    return `M${A.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${B.reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  };
  const tl = Math.hypot(mid[n - 1].x - mid[n - 4].x, mid[n - 1].y - mid[n - 4].y) || 1;
  const tip = {x: mid[n - 1].x + ((mid[n - 1].x - mid[n - 4].x) / tl) * 26 * kz[n - 1], y: mid[n - 1].y + ((mid[n - 1].y - mid[n - 4].y) / tl) * 26 * kz[n - 1]};
  const body = `M${top.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} Q${f1(tip.x)},${f1(tip.y)} ${f1(bot[n - 1].x)},${f1(bot[n - 1].y)} L${bot.slice().reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  // luz por barrido y niebla por distancia (degradados a lo largo del cuerpo)
  const lightAt = (u: number) => look.exposure * clamp((look.sweep - u * 0.9) / 0.2);
  const fogAt = (i: number) => clamp(look.fog + Math.max(0, 1 / kz[i] - 1) * 0.5);
  const sk = Array.from({length: 11}, (_, s) => s / 10);
  // rayas oblicuas onduladas (dorso y flancos altos) y manchas irregulares
  let streaks = '';
  for (let i = 0; i < 95; i++) {
    const u = 0.015 + Math.pow(hash1(i * 3.3), 1.1) * 0.86;
    const v = -0.72 + hash1(i * 5.9) * 0.9;
    const L = 0.004 + hash1(i * 2.7) * 0.006;
    const a = P(u, v);
    const b = P(u + L * 0.5 + 0.002, v + 0.08 + hash1(i) * 0.04);
    const c = P(u + L, v + 0.24 + hash1(i * 9) * 0.1);
    streaks += `M${f1(a.x)},${f1(a.y)} Q${f1(b.x)},${f1(b.y)} ${f1(c.x)},${f1(c.y)} `;
  }
  let blobs = '';
  for (let i = 0; i < 140; i++) {
    const u = 0.02 + Math.pow(hash1(i * 4.1), 1.15) * 0.88;
    const v = -0.6 + hash1(i * 6.3) * 0.8;
    const c = P(u, v);
    const kk = kz[Math.round(u * (n - 1))];
    const s = (1.4 + hash1(i * 8.7) * 3.2) * (1 - u * 0.55) * kk;
    blobs += 'M' + Array.from({length: 7}, (_, q) => {
      const w = (q / 7) * Math.PI * 2;
      const rr = s * (0.55 + 0.65 * hash1(i * 17 + q));
      return `${f1(c.x + Math.cos(w) * rr * 1.6)},${f1(c.y + Math.sin(w) * rr)}`;
    }).join(' L') + 'Z ';
  }
  // estrías de guanina (iridiscencia longitudinal que se desliza muy despacio)
  const guanine = Array.from({length: 16}, (_, i) => ({v: -0.85 + i * 0.105 + (hash1(i) - 0.5) * 0.04, c: ['#b9d4ff', '#d7c8ff', '#ffffff', '#9fe6ff'][i % 4], dash: `${f1(60 + hash1(i * 3) * 160)} ${f1(30 + hash1(i * 5) * 90)}`, off: -t * (14 + i * 2), o: 0.1 + 0.18 * hash1(i * 7)}));
  // aleta dorsal (geometría 3D proyectada del rig premium)
  const fin = finV2(rig, pr, look.fin);
  const membrane = `M${f1(fin.bases[0].x)},${f1(fin.bases[0].y)} ${fin.tips.map((p) => `L${f1(p.x)},${f1(p.y)}`).join(' ')} ${fin.bases.slice().reverse().map((p) => `L${f1(p.x)},${f1(p.y)}`).join(' ')}Z`;
  let rays = '';
  for (let i = 0; i < fin.bases.length; i++) rays += `M${f1(fin.bases[i].x)},${f1(fin.bases[i].y)} Q${f1(fin.ctrls[i].x)},${f1(fin.ctrls[i].y)} ${f1(fin.tips[i].x)},${f1(fin.tips[i].y)} `;
  const edge = fin.tips.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  // pélvicas: radios largos con remo terminal (hoja con radios, no óvalo)
  const pelvic = [0, 1].map((sd) => {
    const pts = Array.from({length: 24}, (_, i) => {
      const u = (i / 23) * 0.32;
      const f = fr[Math.round(u * (n - 1))];
      const drop = depthAt(f.u) * 0.5 + 14 + i * (5 + sd * 1.3) + Math.sin(t * 1.2 - i * 0.33 + sd) * 7 * (i / 23);
      return project(vadd(vadd(f.p, vmul(f.d, -drop)), vmul(f.l, (sd ? -1 : 1) * 6)), pr);
    });
    const e = pts[23];
    const pdir = {x: pts[23].x - pts[21].x, y: pts[23].y - pts[21].y};
    const pl = Math.hypot(pdir.x, pdir.y) || 1;
    const ux = pdir.x / pl;
    const uy = pdir.y / pl;
    const kk = kz[25];
    const W = 7 * kk;
    const Lp = 34 * kk;
    const leaf = `M${f1(e.x)},${f1(e.y)} Q${f1(e.x + ux * Lp * 0.5 - uy * W)},${f1(e.y + uy * Lp * 0.5 + ux * W)} ${f1(e.x + ux * Lp)},${f1(e.y + uy * Lp)} Q${f1(e.x + ux * Lp * 0.5 + uy * W)},${f1(e.y + uy * Lp * 0.5 - ux * W)} ${f1(e.x)},${f1(e.y)}Z`;
    return {pts, leaf, sd};
  });
  const head0 = fr[0];
  const headT = affine(vadd(head0.p, vmul(head0.h, -42)), head0.h, vmul(head0.d, -1), pr, 1.0);
  const L0 = lightAt(0);
  const headFilter = L0 < 0.98 ? `brightness(${(0.1 + 0.9 * L0).toFixed(3)})` : undefined;
  const relief = 20 * kz[10];
  // bandas de luz cáustica que recorren el cuerpo (espacio de pantalla, recortadas a la silueta)
  const cx0 = Math.min(...mid.map((m) => m.x));
  const cx1 = Math.max(...mid.map((m) => m.x));
  const cy0 = Math.min(...top.map((m) => m.y)) - 40;
  const cy1 = Math.max(...bot.map((m) => m.y)) + 40;
  return (
    <g opacity={look.opacity}>
      <defs>
        <VolumeFilter id={`bv-${uid}`} relief={relief} />
        <GlowFilter id={`fg-${uid}`} radius={2.2 * kz[5]} strength={0.8} />
        <SoftFilter id={`sf-${uid}`} radius={14 * kz[10]} />
        <SoftFilter id={`gl-${uid}`} radius={1.6 * kz[6]} />
        <linearGradient id={`dk-${uid}`} gradientUnits="userSpaceOnUse" x1={f1(mid[0].x)} y1={f1(mid[0].y)} x2={f1(mid[n - 1].x)} y2={f1(mid[n - 1].y)}>
          {sk.map((u, i) => (
            <stop key={i} offset={u.toFixed(2)} stopColor="#020713" stopOpacity={(0.93 * (1 - lightAt(u))).toFixed(3)} />
          ))}
        </linearGradient>
        <linearGradient id={`fo-${uid}`} gradientUnits="userSpaceOnUse" x1={f1(mid[0].x)} y1={f1(mid[0].y)} x2={f1(mid[n - 1].x)} y2={f1(mid[n - 1].y)}>
          {sk.map((u, i) => (
            <stop key={i} offset={u.toFixed(2)} stopColor="#0a2238" stopOpacity={fogAt(Math.round(u * (n - 1))).toFixed(3)} />
          ))}
        </linearGradient>
        <linearGradient id={`mb-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6e0a1a" stopOpacity={0.85} />
          <stop offset="0.35" stopColor="#b5142a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ff6676" stopOpacity={0.16} />
        </linearGradient>
        <clipPath id={`cl-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* pélvicas y pectoral lejana */}
      {pelvic.map((pv) => (
        <g key={pv.sd} opacity={pv.sd ? 0.55 : 0.95}>
          <path d={taper(pv.pts, 3.4 * kz[2], 1.1 * kz[22])} fill={pv.sd ? '#7a0c1c' : '#d4223a'} />
          <path d={pv.leaf} fill={pv.sd ? '#8a1022' : '#e0283f'} opacity={0.9} />
        </g>
      ))}
      {/* aleta dorsal: membrana translúcida + radios segmentados con halo */}
      <path d={membrane} fill={`url(#mb-${uid})`} />
      <g filter={`url(#fg-${uid})`}>
        <path d={rays} stroke="#d9203a" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <path d={rays} stroke="#5a0614" strokeWidth={1.6} fill="none" opacity={0.35} strokeDasharray="9 1.2" />
        <path d={rays} stroke="#ffb4bc" strokeWidth={0.5} fill="none" opacity={0.45 * lightAt(0.3)} />
      </g>
      <path d={edge} stroke="#ffb8c0" strokeWidth={1.2} fill="none" opacity={0.5 * lightAt(0.3) + 0.1} />
      <path d={membrane} fill={`url(#dk-${uid})`} />
      <path d={membrane} fill={`url(#fo-${uid})`} />
      {/* cuerpo: bandas deformables iluminadas con relieve real */}
      <g filter={`url(#bv-${uid})`}>
        {RAMP.map((c, b) => (
          <path key={b} d={band(-1.05 + b * (2.1 / 24), -1.05 + (b + 1) * (2.1 / 24) + 0.012)} fill={c} clipPath={`url(#cl-${uid})`} />
        ))}
      </g>
      <g clipPath={`url(#cl-${uid})`}>
        {guanine.map((g, i) => (
          <path key={i} d={curve(g.v, 0.005, 0.97)} stroke={g.c} strokeWidth={2.2 * kz[8]} fill="none" opacity={g.o * (0.4 + 0.6 * lightAt(0.4))} strokeDasharray={g.dash} strokeDashoffset={f1(g.off)} />
        ))}
        <path d={streaks} stroke="#121a38" strokeWidth={1.7 * kz[8]} fill="none" strokeLinecap="round" opacity={0.42} />
        <path d={blobs} fill="#141c3a" opacity={0.5} />
        <path d={curve(0.45, 0.04, 0.96)} stroke="#e6f0ff" strokeWidth={0.9} fill="none" opacity={0.3} strokeDasharray="2 3" />
        {/* luz cáustica que recorre el cuerpo */}
        {look.caustics > 0.01 && (
          <g filter={`url(#sf-${uid})`} opacity={0.5 * look.caustics * lightAt(0.5)}>
            {Array.from({length: 5}, (_, i) => {
              const x = cx0 + (((t * 120 + i * 430) % (cx1 - cx0 + 900)) - 300);
              return <path key={i} d={`M${f1(x)},${f1(cy0)} L${f1(x + 90)},${f1(cy0)} L${f1(x - 60)},${f1(cy1)} L${f1(x - 150)},${f1(cy1)}Z`} fill="#ffffff" />;
            })}
          </g>
        )}
        {/* plata especular: banda oscura de reflejo y dos líneas de brillo nítidas (metal pulido) */}
        <path d={band(-0.02, 0.22)} fill="#1a2650" opacity={0.28} />
        <path d={curve(-0.5, 0.0, 0.93)} stroke="#ffffff" strokeWidth={3.2 * kz[6]} fill="none" opacity={0.75 * lightAt(0.3)} strokeLinecap="round" filter={`url(#gl-${uid})`} />
        <path d={curve(0.32, 0.01, 0.9)} stroke="#f4f8ff" strokeWidth={2 * kz[6]} fill="none" opacity={0.55 * lightAt(0.3)} strokeLinecap="round" />
        <path d={band(-1.05, -0.8)} fill="#000818" opacity={0.3} />
        <path d={body} fill={`url(#dk-${uid})`} />
        <path d={body} fill={`url(#fo-${uid})`} />
      </g>
      {/* contraluz y borde suave */}
      <path d={curve(-1, 0, 0.98)} stroke="#9fe8ff" strokeWidth={9 * kz[5]} fill="none" opacity={0.12 * look.rim} strokeLinecap="round" />
      <path d={curve(-1, 0, 0.98)} stroke="#bfefff" strokeWidth={1.8} fill="none" opacity={0.6 * look.rim} strokeLinecap="round" />
      <path d={`${curve(-1, 0.03, 1)} ${curve(1, 0.03, 1)}`} fill="none" stroke="#070d20" strokeWidth={1.2} opacity={0.5} />
      {/* cabeza y cresta */}
      <g transform={headT} style={{filter: headFilter}}>
        <path d={`M38,30 q-20,${f1(6 + Math.sin(t * 3) * 3)} -30,${f1(18 + Math.sin(t * 3) * 3)} q14,0 28,-10Z`} fill="#c42136" opacity={0.75} />
        <HeadV2 uid={uid} mouth={look.mouth} light={L0} relief={18} />
        <CrestV2 uid={uid} t={t} light={L0} k={look.crest} />
      </g>
    </g>
  );
};
