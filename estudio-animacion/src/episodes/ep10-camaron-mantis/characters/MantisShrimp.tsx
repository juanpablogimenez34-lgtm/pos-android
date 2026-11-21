// CAMARÓN MANTIS PAVO REAL (Odontodactylus scyllarus) — vista lateral, mira a la derecha.
// Anatomía (estomatópodo "golpeador"): caparazón verde brillante; tres segmentos torácicos libres;
// seis segmentos abdominales con borde posterior claro; telson con espinas y urópodos azules y
// anaranjados; dos ojos compuestos sobre pedúnculos móviles con BANDA MEDIA y pseudopupila; anténulas
// con tres flagelos; antenas con escama antenal anaranjada; apéndices raptoriales (2.º maxilípedo)
// rojos con mazo moteado plegado bajo la cabeza; tres pares de patas marchadoras; pleópodos bajo el
// abdomen. Siempre la misma anatomía y paleta; el tamaño solo cambia con la cámara.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {add, angleKeys, chain, deg, f1, mix, polar, rad, smooth, V, Vec} from '../rig/joints';

export const MANTIS = {
  shell: '#2fae6a',
  shellDark: '#16683e',
  shellLight: '#8fe8a8',
  belly: '#c8d878',
  edge: '#ffd65a',
  red: '#e2403a',
  pink: '#f27a86',
  club: '#e8566a',
  spot: '#5a1020',
  leg: '#f08a3a',
  scale: '#ff7a3a',
  uropodBlue: '#3a7ae8',
  uropodOrange: '#ff8a3a',
  eye: '#5ad0a0',
  eyeBand: '#1a3a5a',
  outline: '#0e2a1c',
};
const C = MANTIS;

export type EyePose = {pitch: number; yaw: number}; // pitch: inclinación del pedúnculo (rad) · yaw: giro (−1…1)
export type MantisPose = {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  t: number;
  opacity: number;
  bodyY: number; // altura del cuerpo sobre el suelo (+ más bajo)
  pitch: number; // inclinación del cuerpo (+ cabeza abajo)
  curl: number; // flexión del abdomen (+ hacia abajo)
  yaw: number; // giro del cuerpo (escala horizontal)
  eyeN: EyePose; // ojo cercano
  eyeF: EyePose; // ojo lejano
  antennae: number; // −1 atrás · 0 · 1 adelante
  raptor: {cock: number; strike: number; hold: number}; // carga, golpe, sujetar presa
  walk: number; // ciclos de marcha recorridos
  walking: number; // 0 quieto · 1 caminando
  pleopods: number; // batido de los pleópodos (fase)
  fan: number; // apertura del abanico caudal (0–1)
  shine: number; // brillo especular (iluminación variable)
  light: string; // color de la luz ambiente
};

export const mantisPose = (o: Partial<MantisPose> = {}): MantisPose => ({
  x: 0,
  y: 0,
  scale: 1,
  facing: 1,
  t: 0,
  opacity: 1,
  bodyY: 0,
  pitch: 0,
  curl: 0,
  yaw: 0,
  eyeN: {pitch: 0, yaw: 0},
  eyeF: {pitch: 0, yaw: 0},
  antennae: 0,
  raptor: {cock: 0, strike: 0, hold: 0},
  walk: 0,
  walking: 0,
  pleopods: 0,
  fan: 0.5,
  shine: 0.6,
  light: '#bfe8ff',
  ...o,
});

// ---------------------------------------------------------------- columna
const NSEG = 12; // 0 cabeza … 11 telson
const SEG_X = [150, 108, 64, 50, 36, 20, -8, -36, -64, -92, -120, -150, -205]; // bordes (13)
const SEG_H = [34, 38, 30, 32, 34, 37, 39, 39, 38, 35, 31, 24]; // altura dorsal de cada segmento

function spine(p: MantisPose) {
  const base = -46 + p.bodyY;
  return SEG_X.map((x, i) => {
    const u = clamp((20 - x) / 225); // 0 en el tórax, 1 en la cola
    const ub = clamp((150 - x) / 355); // 0 cabeza → 1 telson
    const y = base - (x > 20 ? (x - 20) * 0.06 : 0) - 10 * Math.sin(ub * Math.PI) + p.curl * 70 * u * u;
    const pt = V(x, y);
    // inclinación de todo el cuerpo alrededor del tórax
    const c = V(30, base);
    const s = Math.sin(p.pitch);
    const co = Math.cos(p.pitch);
    return V(c.x + (pt.x - c.x) * co - (pt.y - c.y) * s, c.y + (pt.x - c.x) * s + (pt.y - c.y) * co);
  });
}

// ---------------------------------------------------------------- piezas
const Eye: React.FC<{base: Vec; e: EyePose; far: boolean; t: number; light: string}> = ({base, e, far, t, light}) => {
  const stalkA = rad(-70) + e.pitch;
  const tip = add(base, polar(stalkA, far ? 20 : 25));
  const rx = far ? 12 : 15;
  const ry = far ? 15 : 19;
  const tilt = deg(stalkA + Math.PI / 2) + e.yaw * 25;
  const pp = clamp(e.yaw, -1, 1) * rx * 0.55; // pseudopupila: se desplaza al girar el ojo
  return (
    <g>
      <path d={`M${f1(base.x)},${f1(base.y)} L${f1(tip.x)},${f1(tip.y)}`} stroke={C.outline} strokeWidth={far ? 8 : 10} strokeLinecap="round" />
      <path d={`M${f1(base.x)},${f1(base.y)} L${f1(tip.x)},${f1(tip.y)}`} stroke={far ? mixColor(C.leg, '#000', 0.3) : C.leg} strokeWidth={far ? 5 : 7} strokeLinecap="round" />
      <g transform={`translate(${f1(tip.x)} ${f1(tip.y)}) rotate(${f1(tilt)})`}>
        <ellipse rx={rx + 2} ry={ry + 2} fill={C.outline} />
        <ellipse rx={rx} ry={ry} fill={far ? mixColor(C.eye, '#000', 0.25) : C.eye} />
        <ellipse rx={rx} ry={ry * 0.5} cy={-ry * 0.5} fill={mixColor(C.eye, '#bff6d0', 0.35)} opacity={0.6} />
        {/* banda media (seis filas de omatidios especializados) */}
        {Array.from({length: 6}, (_, i) => (
          <path key={i} d={`M${f1(-rx * 0.95)},${f1(-3 + i * 1.3)} L${f1(rx * 0.95)},${f1(-3 + i * 1.3)}`} stroke={i % 2 ? C.eyeBand : '#2a6a8a'} strokeWidth={1.1} />
        ))}
        <ellipse cx={pp} cy={-ry * 0.45} rx={rx * 0.22} ry={ry * 0.16} fill="#0a0a14" opacity={0.8} />
        <ellipse cx={pp} cy={ry * 0.45} rx={rx * 0.22} ry={ry * 0.16} fill="#0a0a14" opacity={0.8} />
        <ellipse cx={-rx * 0.35} cy={-ry * 0.55} rx={rx * 0.25} ry={ry * 0.14} fill={light} opacity={0.75} />
      </g>
      {!far && <circle cx={tip.x} cy={tip.y} r={ry * 2.2} fill={C.eye} opacity={0.04 + 0.03 * Math.sin(t * 2)} />}
    </g>
  );
};

/** Apéndice raptorial (mero, própodo y dáctilo con mazo). Ángulos clave: plegado, cargado, golpe. */
function raptorPts(o: Vec, r: MantisPose['raptor']) {
  // [mero, própodo, dáctilo] en grados absolutos
  const folded = [62, 196, 105];
  const cocked = [82, 212, 112];
  const struck = [12, 4, 70];
  const holding = [40, 150, 80];
  let a = folded;
  if (r.cock > 0) a = angleKeys(r.cock, [[0, folded], [1, cocked]]);
  if (r.strike > 0) a = angleKeys(r.strike, [[0, r.cock > 0 ? cocked : folded], [1, struck]]);
  if (r.hold > 0) a = angleKeys(r.hold, [[0, a], [1, holding]]);
  return chain(o, [
    {a: rad(a[0]), l: 40},
    {a: rad(a[1]), l: 38},
    {a: rad(a[2]), l: 24},
  ]);
}

const Raptor: React.FC<{o: Vec; r: MantisPose['raptor']; far: boolean}> = ({o, r, far}) => {
  const [A, B, Cc, D] = raptorPts(o, r);
  const dk = (c: string) => (far ? mixColor(c, '#000000', 0.35) : c);
  const clubDir = Math.atan2(D.y - Cc.y, D.x - Cc.x);
  return (
    <g>
      <path d={`M${f1(A.x)},${f1(A.y)} L${f1(B.x)},${f1(B.y)}`} stroke={C.outline} strokeWidth={17} strokeLinecap="round" />
      <path d={`M${f1(A.x)},${f1(A.y)} L${f1(B.x)},${f1(B.y)}`} stroke={dk(C.red)} strokeWidth={13} strokeLinecap="round" />
      <path d={`M${f1(B.x)},${f1(B.y)} L${f1(Cc.x)},${f1(Cc.y)}`} stroke={C.outline} strokeWidth={15} strokeLinecap="round" />
      <path d={`M${f1(B.x)},${f1(B.y)} L${f1(Cc.x)},${f1(Cc.y)}`} stroke={dk(C.pink)} strokeWidth={11} strokeLinecap="round" />
      {/* mazo (talón del dáctilo) moteado, con espina terminal */}
      <g transform={`translate(${f1(Cc.x)} ${f1(Cc.y)}) rotate(${f1(deg(clubDir))})`}>
        <ellipse cx={8} cy={0} rx={15} ry={11} fill={C.outline} />
        <ellipse cx={8} cy={0} rx={13} ry={9} fill={dk(C.club)} />
        {!far && [[2, -3], [9, 3], [14, -2], [6, 5], [16, 4]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6} fill={C.spot} />)}
        {!far && <ellipse cx={3} cy={-4} rx={5} ry={2.5} fill="#ffffff" opacity={0.45} />}
        <path d="M18,0 Q30,4 36,14" stroke={C.outline} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M18,0 Q30,4 36,14" stroke={dk('#ffd0d0')} strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
      {!far && <path d={`M${f1(mix(A, B, 0.2).x)},${f1(mix(A, B, 0.2).y - 3)} L${f1(mix(A, B, 0.8).x)},${f1(mix(A, B, 0.8).y - 3)}`} stroke="#ffffff" strokeWidth={2.5} opacity={0.35} strokeLinecap="round" />}
    </g>
  );
};

export function clubTip(p: MantisPose): Vec {
  const S = spine(p);
  const o = add(S[1], V(10, 18));
  const pts = raptorPts(o, p.raptor);
  const local = add(pts[3], V(6, 0));
  const sx = p.scale * p.facing * Math.max(0.25, Math.abs(Math.cos(p.yaw))) * Math.sign(Math.cos(p.yaw) || 1);
  return V(p.x + local.x * sx, p.y + local.y * p.scale);
}

export const MantisShrimp: React.FC<{p: MantisPose; uid: string}> = ({p, uid}) => {
  const S = spine(p);
  const t = p.t;
  const cy = Math.cos(p.yaw);
  const sx = Math.sign(cy || 1) * Math.max(0.25, Math.abs(cy));
  // normales de la columna (hacia arriba)
  const nrm = S.map((pt, i) => {
    const a = S[Math.max(0, i - 1)];
    const b = S[Math.min(S.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    return V(dy / l, -dx / l); // hacia arriba si la columna va hacia −x
  });
  const up = (i: number, h: number) => add(S[i], V(nrm[i].x * -h, nrm[i].y * -h));
  const low = (i: number, h: number) => add(S[i], V(nrm[i].x * h, nrm[i].y * h));
  // ---------- patas marchadoras (3 pares) con apoyos fijos en el suelo
  const legs = [0, 1, 2].map((i) => {
    const hip = add(S[3 + i], V(-4, 12));
    const ph = p.walk + i * 0.33;
    const f = ((ph % 1) + 1) % 1;
    const stance = f < 0.6;
    const u = stance ? f / 0.6 : (f - 0.6) / 0.4;
    const stride = 26 * p.walking;
    const fx = hip.x - 10 + (stance ? stride * (0.5 - u) : stride * (-0.5 + u));
    const fy = -2 - (stance ? 0 : Math.sin(u * Math.PI) * 10 * p.walking);
    const knee = V((hip.x + fx) / 2 + 14, (hip.y + fy) / 2 - 6);
    return {hip, knee, foot: V(fx, fy)};
  });
  const legsFar = [0, 1, 2].map((i) => {
    const hip = add(S[3 + i], V(-12, 10));
    const ph = p.walk + i * 0.33 + 0.5;
    const f = ((ph % 1) + 1) % 1;
    const stance = f < 0.6;
    const u = stance ? f / 0.6 : (f - 0.6) / 0.4;
    const stride = 26 * p.walking;
    const fx = hip.x - 16 + (stance ? stride * (0.5 - u) : stride * (-0.5 + u));
    const fy = -4 - (stance ? 0 : Math.sin(u * Math.PI) * 10 * p.walking);
    const knee = V((hip.x + fx) / 2 + 12, (hip.y + fy) / 2 - 5);
    return {hip, knee, foot: V(fx, fy)};
  });
  const legPath = (l: {hip: Vec; knee: Vec; foot: Vec}) => `M${f1(l.hip.x)},${f1(l.hip.y)} L${f1(l.knee.x)},${f1(l.knee.y)} L${f1(l.foot.x)},${f1(l.foot.y)}`;
  // ---------- antenas
  const head = S[0];
  const ant = p.antennae;
  const antennule = (k: number, far: boolean) => {
    const b = add(head, V(-2, -20 + k * 2));
    const pts: Vec[] = [b];
    let a = rad(-55 - 25 * ant) + Math.sin(t * 1.1 + k) * 0.08;
    for (let i = 0; i < 10; i++) {
      a += 0.06 + Math.sin(t * 1.6 + k * 1.3 + i * 0.4) * 0.05;
      pts.push(add(pts[pts.length - 1], polar(a - rad(20 * k), 13)));
    }
    return <path key={`an${k}${far}`} d={smooth(pts)} stroke={far ? '#7a4a2a' : '#c87a3a'} strokeWidth={far ? 1.6 : 2.2} fill="none" strokeLinecap="round" />;
  };
  const scaleA = rad(-20 - 20 * ant) + Math.sin(t * 0.9) * 0.1;
  const scaleBase = add(head, V(-6, -6));
  const tail = S[NSEG];
  const id = `${uid}g`;
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${(p.scale * p.facing * sx).toFixed(3)} ${p.scale.toFixed(3)})`} opacity={p.opacity}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor(C.shellLight, p.light, 0.25)} />
          <stop offset="0.35" stopColor={C.shell} />
          <stop offset="0.8" stopColor={C.shellDark} />
          <stop offset="1" stopColor={C.belly} />
        </linearGradient>
      </defs>
      <ellipse cx={-20} cy={4} rx={190} ry={14} fill="#06121a" opacity={0.28 * clamp(1 - p.bodyY / -80)} />
      {/* patas y apéndice lejanos */}
      {legsFar.map((l, i) => (
        <path key={`lf${i}`} d={legPath(l)} stroke={mixColor(C.leg, '#000', 0.4)} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <Raptor o={add(S[1], V(2, 14))} r={p.raptor} far />
      <Eye base={add(head, V(-6, -22))} e={p.eyeF} far t={t} light={p.light} />
      {[0, 1].map((k) => antennule(k, true))}
      {/* abanico caudal: urópodos */}
      <g transform={`translate(${f1(tail.x)} ${f1(tail.y)})`}>
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`rotate(${f1(sd * (18 + 22 * p.fan) + Math.sin(t * 1.5) * 3)} 30 0)`}>
            <path d="M30,0 Q0,-14 -26,-6 Q-30,4 -22,10 Q4,12 30,4Z" fill={sd > 0 ? C.uropodBlue : C.uropodOrange} stroke={C.outline} strokeWidth={2.5} />
            <path d="M24,2 L-20,2" stroke="#ffffff" strokeWidth={1.5} opacity={0.4} />
          </g>
        ))}
      </g>
      {/* pleópodos (bajo el abdomen) */}
      {[6, 7, 8, 9, 10].map((i) => {
        const b = low(i, 8);
        const a = rad(100) + Math.sin(p.pleopods * Math.PI * 2 + i * 0.9) * 0.35;
        const e = add(b, polar(a, 14));
        return <path key={`pl${i}`} d={`M${f1(b.x)},${f1(b.y)} L${f1(e.x)},${f1(e.y)}`} stroke={C.pink} strokeWidth={6} strokeLinecap="round" opacity={0.85} />;
      })}
      {/* segmentos del cuerpo (de la cola a la cabeza, para que se solapen como placas) */}
      {Array.from({length: NSEG}, (_, k) => NSEG - 1 - k).map((i) => {
        const h0 = SEG_H[i];
        const a0 = up(i, h0);
        const a1 = up(i + 1, h0 * 0.94);
        const b1 = low(i + 1, h0 * 0.55);
        const b0 = low(i, h0 * 0.55);
        const isTelson = i === NSEG - 1;
        const isHead = i === 0;
        const d = isHead
          ? smooth([b1, a1, add(a1, V(30, -6)), add(a0, V(-6, 0)), add(a0, V(8, 8)), add(b0, V(10, -4)), add(b0, V(-8, 4))], true)
          : isTelson
            ? smooth([a0, add(mix(a0, a1, 0.5), V(0, -4)), add(mix(a1, b1, 0.5), V(-6, 0)), b0], true)
            : `M${f1(a0.x + 2)},${f1(a0.y + 3)} Q${f1(mix(a0, a1, 0.5).x)},${f1(mix(a0, a1, 0.5).y - 9)} ${f1(a1.x - 3)},${f1(a1.y + 2)} Q${f1(a1.x - 7)},${f1(mix(a1, b1, 0.5).y)} ${f1(b1.x)},${f1(b1.y)} Q${f1(mix(b0, b1, 0.5).x)},${f1(mix(b0, b1, 0.5).y + 4)} ${f1(b0.x)},${f1(b0.y)} Q${f1(a0.x + 4)},${f1(mix(a0, b0, 0.5).y)} ${f1(a0.x + 2)},${f1(a0.y + 3)}Z`;
        return (
          <g key={`s${i}`}>
            <path d={d} fill={isTelson ? mixColor(C.shell, C.uropodOrange, 0.35) : `url(#${id})`} stroke={C.outline} strokeWidth={3} strokeLinejoin="round" />
            {/* borde posterior claro de cada placa y brillo especular */}
            {!isHead && !isTelson && <path d={`M${f1(a0.x)},${f1(a0.y + 2)} L${f1(b0.x)},${f1(b0.y - 3)}`} stroke={C.edge} strokeWidth={3} opacity={0.75} />}
            <path d={`M${f1(mix(a0, a1, 0.15).x)},${f1(mix(a0, a1, 0.15).y + 5)} Q${f1(mix(a0, a1, 0.5).x)},${f1(mix(a0, a1, 0.5).y + 1)} ${f1(mix(a0, a1, 0.85).x)},${f1(mix(a0, a1, 0.85).y + 5)}`} stroke={p.light} strokeWidth={isHead ? 5 : 3.5} fill="none" opacity={(0.35 + 0.45 * p.shine) * (0.6 + 0.4 * Math.sin(t * 0.8 + i * 0.7))} strokeLinecap="round" />
            {isTelson && [0.2, 0.4, 0.6, 0.8].map((u) => {
              const q = mix(a1, b1, u);
              return <path key={u} d={`M${f1(q.x)},${f1(q.y)} l-12,${f1((u - 0.5) * 8)}`} stroke={C.uropodOrange} strokeWidth={3} strokeLinecap="round" />;
            })}
            {i >= 3 && i <= 10 && <path d={`M${f1(mix(a0, b0, 0.62).x - 2)},${f1(mix(a0, b0, 0.62).y)} L${f1(mix(a1, b1, 0.62).x + 2)},${f1(mix(a1, b1, 0.62).y)}`} stroke={C.belly} strokeWidth={3} opacity={0.45} />}
            {i >= 6 && i <= 10 && <circle cx={mix(a0, b0, 0.5).x - 10} cy={mix(a0, b0, 0.5).y} r={2.4} fill={C.edge} opacity={0.6} />}
          </g>
        );
      })}
      {/* rostro y detalles del caparazón */}
      <path d={`M${f1(head.x + 8)},${f1(head.y - 14)} l12,-2 l-10,8Z`} fill={C.shellDark} stroke={C.outline} strokeWidth={2} />
      <path d={smooth([add(S[1], V(-30, -16)), add(S[1], V(0, -24)), add(S[0], V(-4, -22))])} stroke={C.shellDark} strokeWidth={2.5} fill="none" opacity={0.6} />
      {/* escama antenal anaranjada y antena */}
      <g transform={`translate(${f1(scaleBase.x)} ${f1(scaleBase.y)}) rotate(${f1(deg(scaleA))})`}>
        <path d="M0,0 Q20,-14 46,-8 Q52,0 44,6 Q20,8 0,0Z" fill={C.scale} stroke={C.outline} strokeWidth={2.5} />
        {Array.from({length: 7}, (_, i) => (
          <path key={i} d={`M${12 + i * 5},${-6 - Math.sin(i) * 2} l2,-5`} stroke="#ffd0a0" strokeWidth={1.4} />
        ))}
      </g>
      <path d={smooth([scaleBase, add(scaleBase, polar(scaleA - 0.3, 40)), add(scaleBase, polar(scaleA - 0.1 + Math.sin(t * 1.3) * 0.1, 90)), add(scaleBase, polar(scaleA + 0.15 + Math.sin(t * 1.1) * 0.15, 140))])} stroke="#e8a060" strokeWidth={1.8} fill="none" />
      {/* patas cercanas */}
      {legs.map((l, i) => (
        <g key={`ln${i}`}>
          <path d={legPath(l)} stroke={C.outline} strokeWidth={6.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={legPath(l)} stroke={C.leg} strokeWidth={3.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <Raptor o={add(S[1], V(10, 18))} r={p.raptor} far={false} />
      {[0, 1].map((k) => antennule(k, false))}
      <Eye base={add(head, V(2, -20))} e={p.eyeN} far={false} t={t} light={p.light} />
      {/* textura del caparazón: puntos y vetas */}
      {Array.from({length: 18}, (_, i) => {
        const s = 1 + Math.floor(hash1(i * 3.1) * 9);
        const q = mix(up(s, SEG_H[s] * 0.6), low(s, SEG_H[s] * 0.2), hash1(i * 5.3));
        return <circle key={`d${i}`} cx={q.x + (hash1(i) - 0.5) * 14} cy={q.y} r={1.4} fill={C.shellLight} opacity={0.5} />;
      })}
    </g>
  );
};
export const _lerp = lerp;
