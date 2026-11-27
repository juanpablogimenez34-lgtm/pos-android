// ORNITORRINCO (Ornithorhynchus anatinus) — rig 2.5D en SVG con articulaciones independientes.
// Coordenadas locales (vista lateral): punta del pico hacia +x, el cuello en el origen, el cuerpo hacia −x.
// Longitud de referencia L = 600 u (≈ 50 cm de un macho adulto: 12 u/cm).
// Anatomía: cuerpo alargado y algo aplanado, cuello corto, cabeza pequeña y aplanada sin orejas externas;
// PICO ancho, plano y carnoso, gris oscuro, con narinas cerca de la punta y escudo frontal en la base; ojos
// pequeños en un surco (párpados que se cierran al sumergirse); pelaje pardo oscuro denso con vientre más
// claro; PATAS DELANTERAS con cinco dedos, garras y membrana amplia que se despliega al remar y se recoge al
// caminar; PATAS TRASERAS más pequeñas, parcialmente palmeadas (timón), con ESPOLÓN en el tobillo en machos;
// COLA ancha, plana, peluda y de punta redondeada (reserva de grasa; no propulsa).
// Movimiento:
//  · Caminata: extremidades extendidas hacia los lados; fases de apoyo con el pie FIJO al suelo (sin patinar:
//    el pie retrocede en coordenadas locales exactamente lo que avanza el cuerpo) y fase de vuelo con
//    elevación; balanceo del tronco y cabeceo.
//  · Natación: remadas ALTERNADAS de las patas delanteras (impulso con la membrana abierta, recuperación con la
//    membrana recogida); patas traseras y cola como timón; leve cabeceo del cuerpo.
//  · Crecimiento: `baby` 1 (recién nacido: rosado, sin pelo, ojos cerrados, pico corto y blando, patas
//    diminutas) … 0 (adulto). Las proporciones cambian de forma gradual, no solo la escala.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const P = (pts: V[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');
export const PL = 600;

export type PlatypusPose = {
  t: number;
  mode: 'walk' | 'swim' | 'rest' | 'dig';
  walkDist?: number; // distancia recorrida (u locales) — sincroniza los apoyos de la caminata
  swimPhase?: number; // fase de las remadas (ciclos)
  baby?: number; // 1 recién nacido … 0 adulto
  male?: boolean;
  eyes?: number; // 1 abiertos … 0 cerrados
  wet?: number; // brillo húmedo
  bill?: number; // movimiento del pico al buscar (0…1)
  head?: number; // giro/cabeceo de la cabeza (rad)
  curl?: number; // 0…1 enroscado (descanso, incubación)
  tone?: number;
  spurHi?: number; // realce del espolón
};

const C0 = {fur: '#4e3220', furDark: '#2e1c10', furLight: '#8a6444', belly: '#b89a74', bill: '#3c3a3a', billLight: '#6a6662', claw: '#d8ccb8', web: '#3a2e28', pink: '#e8a49a', pinkDark: '#c07a72'};

/** Pie/mano con 5 dedos, garras y membrana (spread 0 recogida … 1 desplegada). Dibuja en coordenadas locales del pie. */
const Foot: React.FC<{len: number; spread: number; col: string; webCol: string; claw: string; hind?: boolean; baby: number}> = ({len, spread, col, webCol, claw, hind, baby}) => {
  const n = 5;
  const fan = 0.35 + spread * 0.55;
  const tips: V[] = Array.from({length: n}, (_, i) => {
    const a = (i / (n - 1) - 0.5) * fan * 2;
    const l = len * (0.75 + 0.25 * Math.sin((i / (n - 1)) * Math.PI));
    return {x: Math.cos(a) * l, y: Math.sin(a) * l * 0.6};
  });
  const webExt = hind ? 0.55 : 1.0 + spread * 0.25; // la membrana delantera supera las garras al nadar
  const webPts = tips.map((p) => ({x: p.x * webExt * (0.8 + 0.2 * spread), y: p.y * webExt}));
  return (
    <g>
      {baby < 0.8 && <path d={closedSpline([{x: 0, y: -len * 0.12}, ...webPts, {x: 0, y: len * 0.12}], 0.7)} fill={webCol} stroke={mixColor(webCol, '#d8c8b8', 0.35)} strokeWidth={1.5} opacity={0.9} />}
      {tips.map((p, i) => (
        <g key={i}>
          <path d={`M0,0 L${f1(p.x)},${f1(p.y)}`} stroke={col} strokeWidth={len * 0.14} strokeLinecap="round" />
          {baby < 0.7 && <path d={`M${f1(p.x)},${f1(p.y)} l${f1(len * 0.18)},${f1(p.y * 0.05 + len * 0.04)}`} stroke={claw} strokeWidth={len * 0.06} strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
};

export const Platypus: React.FC<{pose: PlatypusPose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; angle?: number; view?: 'side' | 'top' | 'front'; opacity?: number}> = ({pose, uid, x, y, scale = 1, dir = 1, angle = 0, view = 'side', opacity = 1}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`} opacity={opacity}>
    {view === 'side' ? <Side pose={pose} uid={uid} /> : view === 'top' ? <Top pose={pose} uid={uid} /> : <Front pose={pose} uid={uid} />}
  </g>
);

function palette(pose: PlatypusPose) {
  const b = clamp(pose.baby ?? 0);
  const tone = clamp(pose.tone ?? 0);
  const furK = clamp((0.78 - b) / 0.45); // el pelaje aparece al crecer
  const mk = (adult: string, baby: string) => mixColor(mixColor(baby, adult, furK), '#05070a', tone * 0.75);
  return {
    b,
    furK,
    fur: mk(C0.fur, C0.pink),
    furDark: mk(C0.furDark, C0.pinkDark),
    furLight: mk(C0.furLight, '#f2c4bc'),
    belly: mk(C0.belly, '#f0c0b4'),
    bill: mk(C0.bill, '#c89a90'),
    billLight: mk(C0.billLight, '#e8bcb0'),
    claw: mk(C0.claw, '#f0d8d0'),
    web: mk(C0.web, '#d89088'),
  };
}

const Side: React.FC<{pose: PlatypusPose; uid: string}> = ({pose, uid}) => {
  const c = palette(pose);
  const b = c.b;
  const curl = clamp(pose.curl ?? 0);
  const swim = pose.mode === 'swim';
  const walk = pose.mode === 'walk';
  const t = pose.t;
  // proporciones según la edad: cría más rechoncha, pico corto, patas cortas
  const bodyL = PL * lerp(0.6, 0.62, b);
  const H = PL * lerp(0.14, 0.17, b);
  const billL = PL * lerp(0.2, 0.09, b);
  const billW = PL * lerp(0.034, 0.028, b);
  const legK = lerp(1, 0.55, b);
  // cuerpo: balanceo al caminar, cabeceo al nadar
  const D = PL * 0.28; // avance por ciclo de marcha
  const wph = ((pose.walkDist ?? 0) / D) % 1;
  const sph = (pose.swimPhase ?? 0) * Math.PI * 2;
  const bob = walk ? Math.sin(wph * Math.PI * 4) * 4 : swim ? Math.sin(sph) * 3 : Math.sin(t * 1.4) * 1.5;
  const arch = curl * 0.6;
  // perfil del cuerpo (aplanado arriba, vientre redondeado)
  const top: V[] = [];
  const bot: V[] = [];
  const NS = 16;
  for (let i = 0; i <= NS; i++) {
    const u = i / NS;
    const xx = -u * bodyL;
    const yy = bob * Math.sin(u * Math.PI) - Math.sin(u * Math.PI) * arch * H * 1.2;
    const ht = H * (u < 0.15 ? 0.55 + 0.45 * Math.sin((u / 0.15) * Math.PI * 0.5) : 1 - Math.pow((u - 0.15) / 0.85, 2) * 0.45);
    top.push({x: xx, y: yy - ht * 0.95});
    bot.push({x: xx, y: yy + ht * (u < 0.2 ? 0.7 : 0.85) * (1 + b * 0.15)});
  }
  const body = closedSpline([{x: 12, y: -H * 0.35}, ...top, {x: -bodyL - 12, y: bob * 0.2}, ...[...bot].reverse(), {x: 14, y: H * 0.3}], 0.85);
  // cola ancha y plana, peluda (vista lateral: perfil fino con borde redondeado)
  const tailA = (swim ? Math.sin(sph * 0.5) * 0.06 : walk ? Math.sin(wph * Math.PI * 2) * 0.05 : 0) + curl * 0.9;
  // cabeza + pico
  const headA = (pose.head ?? 0) + (pose.bill ?? 0) * Math.sin(t * 9) * 0.06 + (walk ? Math.sin(wph * Math.PI * 4) * 0.03 : 0) - curl * 0.5;
  const eyes = clamp(pose.eyes ?? 1) * (b > 0.6 ? 0 : 1);
  const wet = clamp(pose.wet ?? 0);
  // extremidades
  const shoulder = {x: -bodyL * 0.16, y: H * 0.45};
  const hip = {x: -bodyL * 0.82, y: H * 0.45};
  const fore = (far: boolean): React.ReactNode => {
    const off = far ? 0.5 : 0;
    let ang: number;
    let spread: number;
    let foot: V;
    let elbow: V;
    if (swim) {
      // remada: impulso (membrana abierta, el brazo barre hacia atrás) y recuperación (recogida, hacia delante)
      const p = ((pose.swimPhase ?? 0) + off) % 1;
      const power = p < 0.55;
      const k = power ? p / 0.55 : (p - 0.55) / 0.45;
      ang = power ? lerp(-0.9, 1.4, k) : lerp(1.4, -0.9, k);
      spread = power ? 1 : 0.15;
      const r = PL * 0.065 * legK;
      elbow = {x: shoulder.x + Math.cos(Math.PI / 2 + ang * 0.6) * r * 0.9, y: shoulder.y + Math.sin(Math.PI / 2 + ang * 0.6) * r * 0.9 - (power ? 0 : 8)};
      foot = {x: elbow.x + Math.cos(Math.PI / 2 + ang) * r, y: elbow.y + Math.sin(Math.PI / 2 + ang) * r * (power ? 1 : 0.6)};
    } else if (walk) {
      const p = (wph + off) % 1;
      const duty = 0.65;
      const S = D * duty;
      const stance = p < duty;
      const fx = stance ? shoulder.x + S / 2 - (p / duty) * S : shoulder.x - S / 2 + ((p - duty) / (1 - duty)) * S;
      const lift = stance ? 0 : Math.sin(((p - duty) / (1 - duty)) * Math.PI) * 14;
      foot = {x: fx + PL * 0.03, y: H * 1.0 * legK + H * 0.3 - lift - bob * 0.0};
      elbow = {x: (shoulder.x + foot.x) / 2 + PL * 0.03, y: (shoulder.y + foot.y) / 2 + 2};
      ang = 0;
      spread = 0.1;
    } else {
      foot = {x: shoulder.x + PL * 0.05, y: H * (1 - curl * 0.5) * legK + H * 0.25};
      elbow = {x: shoulder.x + PL * 0.06, y: (shoulder.y + foot.y) / 2};
      ang = 0;
      spread = pose.mode === 'dig' ? 0.1 : 0.2;
      if (pose.mode === 'dig') {
        const p = (t * 2.2 + off) % 1;
        foot = {x: shoulder.x + PL * 0.1 * Math.cos(p * Math.PI * 2), y: H + PL * 0.03 * Math.sin(p * Math.PI * 2)};
      }
    }
    const fl = PL * (swim ? 0.12 : 0.085) * legK;
    const fa = Math.atan2(foot.y - elbow.y, foot.x - elbow.x);
    return (
      <g opacity={far ? 0.75 : 1}>
        <path d={P([shoulder, elbow, foot])} stroke={far ? c.furDark : c.fur} strokeWidth={PL * 0.045 * legK} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <g transform={`translate(${f1(foot.x)} ${f1(foot.y)}) rotate(${f1(swim ? (fa * 180) / Math.PI : 6)}) ${swim ? '' : 'scale(1 0.5)'}`}>
          <Foot len={fl} spread={spread} col={far ? c.furDark : c.fur} webCol={swim ? mixColor(c.web, '#8a7a70', 0.25) : c.web} claw={c.claw} baby={b} />
        </g>
      </g>
    );
  };
  const hind = (far: boolean): React.ReactNode => {
    const off = far ? 0 : 0.5;
    let foot: V;
    let knee: V;
    if (walk) {
      const p = (wph + off) % 1;
      const duty = 0.65;
      const S = D * duty;
      const stance = p < duty;
      const fx = stance ? hip.x + S / 2 - (p / duty) * S : hip.x - S / 2 + ((p - duty) / (1 - duty)) * S;
      const lift = stance ? 0 : Math.sin(((p - duty) / (1 - duty)) * Math.PI) * 12;
      foot = {x: fx, y: H * 0.95 * legK + H * 0.3 - lift};
      knee = {x: (hip.x + foot.x) / 2 - PL * 0.03, y: (hip.y + foot.y) / 2};
    } else if (swim) {
      const s = Math.sin(sph + (far ? 1 : 0)) * 0.15;
      foot = {x: hip.x - PL * 0.11, y: hip.y + PL * 0.02 + s * 20};
      knee = {x: hip.x - PL * 0.05, y: hip.y + PL * 0.04};
    } else {
      foot = {x: hip.x - PL * 0.03, y: H * (1 - curl * 0.5) * legK + H * 0.25};
      knee = {x: hip.x - PL * 0.04, y: (hip.y + foot.y) / 2};
    }
    const fa = Math.atan2(foot.y - knee.y, foot.x - knee.x);
    return (
      <g opacity={far ? 0.75 : 1}>
        <path d={P([hip, knee, foot])} stroke={far ? c.furDark : c.fur} strokeWidth={PL * 0.04 * legK} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <g transform={`translate(${f1(foot.x)} ${f1(foot.y)}) rotate(${f1(swim ? (fa * 180) / Math.PI + 160 : 186)}) ${swim ? '' : 'scale(1 0.5)'}`}>
          <Foot len={PL * 0.075 * legK} spread={swim ? 0.7 : 0.25} col={far ? c.furDark : c.fur} webCol={c.web} claw={c.claw} hind baby={b} />
        </g>
        {/* espolón en el tobillo (solo machos, solo patas traseras) */}
        {pose.male && b < 0.3 && !far && (
          <g>
            <path d={`M${f1(foot.x + 4)},${f1(foot.y - 8)} l${f1(-6)},${f1(-16)} l${f1(9)},${f1(10)}Z`} fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={1.2} />
            {(pose.spurHi ?? 0) > 0.01 && <circle cx={foot.x + 1} cy={foot.y - 14} r={16} fill="none" stroke="#ffd870" strokeWidth={3} opacity={pose.spurHi} />}
          </g>
        )}
      </g>
    );
  };
  const gid = `${uid}-g`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={-H} x2="0" y2={H}>
          <stop offset="0" stopColor={c.furDark} />
          <stop offset="0.45" stopColor={c.fur} />
          <stop offset="0.8" stopColor={c.furLight} />
          <stop offset="1" stopColor={c.belly} />
        </linearGradient>
        <linearGradient id={`${gid}b`} gradientUnits="userSpaceOnUse" x1="0" y1={-billW} x2="0" y2={billW}>
          <stop offset="0" stopColor={c.billLight} />
          <stop offset="0.5" stopColor={c.bill} />
          <stop offset="1" stopColor={mixColor(c.bill, '#000', 0.3)} />
        </linearGradient>
        <clipPath id={`${uid}-c`}>
          <path d={body} />
        </clipPath>
      </defs>
      {!swim && <ellipse cx={-bodyL * 0.45} cy={H * 1.0 * legK + H * 0.32} rx={bodyL * 0.6} ry={H * 0.16} fill="#000" opacity={0.22} />}
      {fore(true)}
      {hind(true)}
      {/* cola */}
      <g transform={`translate(${f1(-bodyL + 6)} ${f1(bob * 0.2)}) rotate(${f1((tailA * 180) / Math.PI)})`}>
        <path d={`M0,${f1(-H * 0.42)} Q${f1(-PL * 0.12)},${f1(-H * 0.5)} ${f1(-PL * 0.2 * lerp(1, 0.6, b))},${f1(-H * 0.12)} Q${f1(-PL * 0.22 * lerp(1, 0.6, b))},${f1(H * 0.12)} ${f1(-PL * 0.18 * lerp(1, 0.6, b))},${f1(H * 0.22)} Q${f1(-PL * 0.1)},${f1(H * 0.4)} 0,${f1(H * 0.35)}Z`} fill={c.furDark} stroke={mixColor(c.furDark, '#000', 0.4)} strokeWidth={2} />
        {c.furK > 0.2 && Array.from({length: 10}, (_, i) => <path key={i} d={`M${f1(-10 - i * 9)},${f1(-H * 0.3 + (i % 3) * H * 0.18)} l-8,2`} stroke={c.fur} strokeWidth={2} opacity={0.6 * c.furK} />)}
      </g>
      {/* cuerpo */}
      <path d={body} fill={`url(#${gid})`} stroke={mixColor(c.furDark, '#000', 0.4)} strokeWidth={2} />
      <g clipPath={`url(#${uid}-c)`}>
        {/* textura de pelaje denso (trazos cortos que siguen el cuerpo) */}
        {c.furK > 0.05 && Array.from({length: 70}, (_, i) => {
          const u = hash1(i * 3.1);
          const yy = (hash1(i * 5.7) - 0.6) * H * 1.6;
          return <path key={i} d={`M${f1(-u * bodyL)},${f1(yy)} q-6,${f1(-1 + hash1(i) * 2)} -12,${f1(1.5)}`} stroke={hash1(i * 9) > 0.5 ? c.furDark : c.furLight} strokeWidth={1.8} fill="none" opacity={0.55 * c.furK} />;
        })}
        {/* piel de la cría (pliegues suaves) */}
        {b > 0.5 && Array.from({length: 6}, (_, i) => <path key={`p${i}`} d={`M${f1(-bodyL * (0.2 + i * 0.12))},${f1(-H * 0.6)} q-6,${f1(H * 0.6)} 0,${f1(H * 1.2)}`} stroke={c.furDark} strokeWidth={1.4} fill="none" opacity={0.25 * b} />)}
        {/* brillo húmedo */}
        <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 8)}`).join(' ')} stroke="#e8f4ff" strokeWidth={6} fill="none" opacity={0.08 + wet * 0.35} />
        {wet > 0.2 && Array.from({length: 8}, (_, i) => <circle key={`w${i}`} cx={-hash1(i * 13) * bodyL} cy={-H * 0.5 + hash1(i * 7) * H * 0.4} r={2.4} fill="#f4fbff" opacity={wet * 0.7} />)}
      </g>
      {/* cabeza y pico */}
      <g transform={`translate(${f1(8)} ${f1(-H * 0.1 + bob * 0.3)}) rotate(${f1((headA * 180) / Math.PI)})`}>
        {/* cabeza pequeña y aplanada */}
        <path d={`M${f1(-PL * 0.06)},${f1(-H * 0.6)} Q${f1(PL * 0.03)},${f1(-H * 0.65)} ${f1(PL * 0.07)},${f1(-H * 0.32)} L${f1(PL * 0.07)},${f1(H * 0.25)} Q${f1(PL * 0.02)},${f1(H * 0.5)} ${f1(-PL * 0.06)},${f1(H * 0.45)}Z`} fill={c.fur} />
        {/* escudo frontal del pico (pliegue de piel en la base) */}
        <path d={`M${f1(PL * 0.06)},${f1(-H * 0.42)} Q${f1(PL * 0.09)},0 ${f1(PL * 0.06)},${f1(H * 0.3)} L${f1(PL * 0.075)},${f1(H * 0.3)} Q${f1(PL * 0.105)},0 ${f1(PL * 0.075)},${f1(-H * 0.42)}Z`} fill={c.bill} />
        {/* pico ancho y plano: mandíbula superior e inferior (se mueven al buscar alimento) */}
        <g transform={`translate(${f1(PL * 0.07)} 0)`}>
          <path d={`M0,${f1(-billW * 1.0)} Q${f1(billL * 0.6)},${f1(-billW * 1.25)} ${f1(billL * 0.95)},${f1(-billW * 0.55)} Q${f1(billL * 1.08)},0 ${f1(billL * 0.95)},${f1(billW * 0.35)} L0,${f1(billW * 0.3)}Z`} fill={`url(#${gid}b)`} stroke={mixColor(c.bill, '#000', 0.4)} strokeWidth={1.6} />
          <g transform={`rotate(${f1(((pose.bill ?? 0) * 0.12 * (0.5 + 0.5 * Math.sin(t * 7)) * 180) / Math.PI)})`}>
            <path d={`M0,${f1(billW * 0.3)} L${f1(billL * 0.92)},${f1(billW * 0.4)} Q${f1(billL * 0.9)},${f1(billW * 0.8)} ${f1(billL * 0.6)},${f1(billW * 0.85)} L0,${f1(billW * 0.75)}Z`} fill={mixColor(c.bill, '#000', 0.15)} stroke={mixColor(c.bill, '#000', 0.4)} strokeWidth={1.4} />
          </g>
          {/* textura carnosa, narinas cerca de la punta */}
          {Array.from({length: 14}, (_, i) => <circle key={i} cx={billL * (0.15 + hash1(i * 3) * 0.75)} cy={-billW * (0.1 + hash1(i * 5) * 0.7)} r={1.4} fill={c.billLight} opacity={0.5} />)}
          <ellipse cx={billL * 0.78} cy={-billW * 0.85} rx={billW * 0.18} ry={billW * 0.08} fill="#141414" />
          <path d={`M${f1(billL * 0.1)},${f1(-billW * 0.95)} Q${f1(billL * 0.5)},${f1(-billW * 1.15)} ${f1(billL * 0.85)},${f1(-billW * 0.65)}`} stroke="#ffffff" strokeWidth={2} fill="none" opacity={0.12 + wet * 0.25} />
        </g>
        {/* ojo pequeño en el surco (sin orejas externas) */}
        <path d={`M${f1(PL * 0.0)},${f1(-H * 0.28)} q${f1(PL * 0.03)},${f1(-H * 0.06)} ${f1(PL * 0.055)},0`} stroke={c.furDark} strokeWidth={3} fill="none" />
        <ellipse cx={PL * 0.028} cy={-H * 0.26} rx={PL * 0.009 * lerp(1, 0.8, b)} ry={PL * 0.009 * eyes + 0.6} fill="#0a0806" />
        {eyes > 0.5 && <circle cx={PL * 0.031} cy={-H * 0.275} r={1.4} fill="#ffffff" opacity={0.7} />}
      </g>
      {hind(false)}
      {fore(false)}
    </g>
  );
};

/** Vista superior (nadando visto desde arriba o desde abajo): remadas laterales alternas con membranas. */
const Top: React.FC<{pose: PlatypusPose; uid: string}> = ({pose, uid}) => {
  const c = palette(pose);
  const sph = (pose.swimPhase ?? 0) * Math.PI * 2;
  const bodyL = PL * 0.6;
  const W = PL * 0.12;
  const yaw = Math.sin(sph * 0.5) * 3;
  const body = closedSpline([{x: 14, y: -W * 0.4}, {x: -bodyL * 0.2, y: -W}, {x: -bodyL * 0.6, y: -W * 0.95 + yaw * 0.3}, {x: -bodyL, y: -W * 0.55 + yaw}, {x: -bodyL - 10, y: yaw}, {x: -bodyL, y: W * 0.55 + yaw}, {x: -bodyL * 0.6, y: W * 0.95 + yaw * 0.3}, {x: -bodyL * 0.2, y: W}, {x: 14, y: W * 0.4}], 0.85);
  const arm = (side: number) => {
    const p = ((pose.swimPhase ?? 0) + (side > 0 ? 0.5 : 0)) % 1;
    const power = p < 0.55;
    const k = power ? p / 0.55 : (p - 0.55) / 0.45;
    const a = power ? lerp(-0.6, 0.9, k) : lerp(0.9, -0.6, k);
    const sh = {x: -bodyL * 0.15, y: side * W * 0.8};
    const tip = {x: sh.x - Math.sin(a) * PL * 0.12, y: sh.y + side * Math.cos(a) * PL * 0.1};
    return (
      <g key={side}>
        <path d={P([sh, tip])} stroke={c.fur} strokeWidth={PL * 0.04} strokeLinecap="round" />
        <g transform={`translate(${f1(tip.x)} ${f1(tip.y)}) rotate(${f1(side * 90 + a * 30 * side)})`}>
          <Foot len={PL * 0.07} spread={power ? 1 : 0.15} col={c.fur} webCol={c.web} claw={c.claw} baby={c.b} />
        </g>
      </g>
    );
  };
  return (
    <g>
      {[-1, 1].map((s) => <path key={`h${s}`} d={`M${f1(-bodyL * 0.85)},${f1(s * W * 0.7)} l${f1(-PL * 0.08)},${f1(s * PL * 0.04)}`} stroke={c.furDark} strokeWidth={PL * 0.03} strokeLinecap="round" />)}
      {arm(-1)}
      {arm(1)}
      {/* cola ancha y plana vista desde arriba */}
      <path d={`M${f1(-bodyL + 10)},${f1(-W * 0.5 + yaw)} Q${f1(-bodyL - PL * 0.12)},${f1(-W * 0.7 + yaw)} ${f1(-bodyL - PL * 0.2)},${f1(yaw * 1.4)} Q${f1(-bodyL - PL * 0.12)},${f1(W * 0.7 + yaw)} ${f1(-bodyL + 10)},${f1(W * 0.5 + yaw)}Z`} fill={c.furDark} />
      <path d={body} fill={c.fur} stroke={mixColor(c.furDark, '#000', 0.4)} strokeWidth={2} />
      {c.furK > 0.05 && Array.from({length: 40}, (_, i) => <path key={i} d={`M${f1(-hash1(i * 3) * bodyL)},${f1((hash1(i * 5) - 0.5) * W * 1.6)} l-10,0`} stroke={c.furDark} strokeWidth={1.8} opacity={0.5 * c.furK} />)}
      <path d={`M${f1(-bodyL * 0.1)},0 L${f1(-bodyL * 0.8)},0`} stroke={c.furLight} strokeWidth={10} opacity={0.15} />
      {/* pico ancho visto desde arriba, narinas */}
      <path d={`M10,${f1(-W * 0.45)} Q${f1(PL * 0.2)},${f1(-W * 0.62)} ${f1(PL * 0.24)},0 Q${f1(PL * 0.2)},${f1(W * 0.62)} 10,${f1(W * 0.45)}Z`} fill={c.bill} stroke={mixColor(c.bill, '#000', 0.4)} strokeWidth={1.6} />
      <circle cx={PL * 0.2} cy={-W * 0.12} r={3} fill="#111" />
      <circle cx={PL * 0.2} cy={W * 0.12} r={3} fill="#111" />
      <ellipse cx={-4} cy={-W * 0.55} rx={4} ry={2.6 * clamp(pose.eyes ?? 1) + 0.4} fill="#0a0806" />
      <ellipse cx={-4} cy={W * 0.55} rx={4} ry={2.6 * clamp(pose.eyes ?? 1) + 0.4} fill="#0a0806" />
      <circle cx={0} cy={0} r={0} id={uid} />
    </g>
  );
};

/** Vista frontal (gancho): pico ancho con narinas, cabeza y ojos en los surcos, pelaje húmedo. */
const Front: React.FC<{pose: PlatypusPose; uid: string}> = ({pose, uid}) => {
  const c = palette(pose);
  const eyes = clamp(pose.eyes ?? 1);
  const wet = clamp(pose.wet ?? 0);
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-fb`} cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor={c.billLight} />
          <stop offset="1" stopColor={c.bill} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={70} rx={120} ry={90} fill={c.fur} />
      {Array.from({length: 40}, (_, i) => <path key={i} d={`M${f1((hash1(i * 3) - 0.5) * 260)},${f1(10 + hash1(i * 5) * 140)} l${f1((hash1(i) - 0.5) * 6)},10`} stroke={i % 2 ? c.furDark : c.furLight} strokeWidth={2} opacity={0.6} />)}
      <ellipse cx={0} cy={-14} rx={92} ry={46} fill={c.fur} />
      {/* ojos pequeños en los surcos laterales */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${s * 62},-38 q${s * 16},-6 ${s * 30},2`} stroke={c.furDark} strokeWidth={4} fill="none" />
          <ellipse cx={s * 74} cy={-34} rx={6} ry={6 * eyes + 0.6} fill="#0a0806" />
          {eyes > 0.5 && <circle cx={s * 72} cy={-36} r={1.6} fill="#fff" opacity={0.7} />}
        </g>
      ))}
      {/* pico ancho, plano y carnoso (escorzo frontal) */}
      <path d="M-150,14 Q-158,-14 -80,-24 Q0,-30 80,-24 Q158,-14 150,14 Q140,38 0,42 Q-140,38 -150,14Z" fill={`url(#${uid}-fb)`} stroke={mixColor(c.bill, '#000', 0.4)} strokeWidth={2} />
      <path d="M-136,20 Q0,36 136,20" stroke={mixColor(c.bill, '#000', 0.45)} strokeWidth={3} fill="none" />
      {Array.from({length: 24}, (_, i) => <circle key={`b${i}`} cx={(hash1(i * 7) - 0.5) * 200} cy={-30 + hash1(i * 9) * 60} r={1.6} fill={c.billLight} opacity={0.5} />)}
      <ellipse cx={-14} cy={-12} rx={7} ry={3.5} fill="#141414" />
      <ellipse cx={14} cy={-12} rx={7} ry={3.5} fill="#141414" />
      <path d="M-80,-30 Q0,-44 80,-30" stroke="#fff" strokeWidth={3} fill="none" opacity={0.15 + wet * 0.35} />
      {wet > 0.2 && Array.from({length: 10}, (_, i) => <circle key={`d${i}`} cx={(hash1(i * 11) - 0.5) * 220} cy={-20 + hash1(i * 13) * 120} r={3} fill="#f4fbff" opacity={wet * 0.75} />)}
    </g>
  );
};

/** Huevo coriáceo pequeño que eclosiona (hatch 0 entero … 1 abierto); la cría asoma. */
export const Egg: React.FC<{x: number; y: number; s?: number; t: number; hatch?: number; wobble?: number}> = ({x, y, s = 1, t, hatch = 0, wobble = 0}) => {
  const h = clamp(hatch);
  const w = Math.sin(t * 9) * wobble * 6;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(w)}) scale(${f1(s)})`}>
      <ellipse cx={0} cy={6} rx={40} ry={10} fill="#000" opacity={0.2} />
      <path d={`M-30,0 Q-32,-44 0,-52 Q32,-44 30,0 Q26,26 0,28 Q-26,26 -30,0Z`} fill="#f2e8d4" stroke="#c8b898" strokeWidth={2} />
      {/* cáscara blanda: pliegues y textura mate */}
      <path d="M-18,-30 q8,6 4,16 M10,-36 q-4,10 4,18" stroke="#d8c8a8" strokeWidth={1.6} fill="none" opacity={0.7} />
      <ellipse cx={-10} cy={-30} rx={8} ry={12} fill="#ffffff" opacity={0.35} />
      {h > 0.05 && (
        <g>
          <path d={`M${f1(-14 * h)},${f1(-48 + 4 * h)} q${f1(8 * h)},${f1(10 * h)} ${f1(26 * h)},${f1(2 * h)}`} stroke="#a89878" strokeWidth={2} fill="none" />
          {h > 0.4 && <path d={`M-20,-40 Q0,${f1(-40 - 30 * (h - 0.4))} 22,-40 Q12,-28 0,-30 Q-12,-28 -20,-40Z`} fill="#3a2a1e" opacity={0.6} />}
        </g>
      )}
    </g>
  );
};
