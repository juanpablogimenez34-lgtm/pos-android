// FICHA Y RIG — LOBI, el cachorro de lobo.
// Pelaje gris azulado, hocico crema, pecho blanco, ojos grandes color miel, nariz negra pequeña,
// orejas triangulares, cola grande y esponjosa, CUATRO patas (sin manos humanas) con almohadillas
// visibles al levantarlas, cejas expresivas y sonrisa infantil.
// Partes separadas: cabeza, hocico, mandíbula, ojos, párpados, orejas, cuello, torso, cuatro patas
// con articulaciones (IK; las traseras con corvejón), cola encadenada. Tres dibujos coherentes:
// perfil 3/4 (con giro sobre sí mismo), frente (paso intermedio del giro) y acostado enroscado.
import React from 'react';
import {clamp, lerp, mixColor} from '../../../engine/math';
import {add, Capsule, f1, furCircle, ik, rot, smooth, Sphere, V, Vec} from '../Rigging/core';
import {AnimalMouth, Eye, Face, FACE} from '../Rigging/face';

export const LOBI_COLORS = {fur: '#7f93b5', dark: '#56688c', light: '#b4c3dc', cream: '#f4e3c3', chest: '#fbf8f2', eye: '#d9962a', nose: '#1e1a26', outline: '#2c2846', inner: '#f2a7b6', pad: '#5b3a4c'};
const C = LOBI_COLORS;

export type Ear = {a: number; fold: number}; // a: giro (+ hacia atrás) · fold: punta doblada
export type LobiPose = {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  yaw: number; // giro sobre sí mismo (rad); 0 = perfil
  opacity: number;
  t: number;
  bodyY: number; // hundimiento del cuerpo (+ abajo)
  pitch: number; // inclinación del torso (+ nariz abajo)
  stretch: number; // −0.2 encogido … 0.2 estirado (columna)
  breathe: number; // 0–1 respiración
  head: {pitch: number; tilt: number; turn: number}; // turn: −1…1 (hacia cámara)
  ears: {near: Ear; far: Ear};
  tail: {lift: number; wag: number; curl: number}; // lift: ángulo base · wag: −1…1 · curl
  paws: {FN: Vec; FF: Vec; HN: Vec; HF: Vec}; // objetivos de las patas (coords. locales; suelo y=0)
  face: Face;
  lie: number; // 0 de pie · 1 acostado y enroscado
};

/** Posición de reposo de cada pata (suelo). */
export const PAW0 = {FN: V(52, 0), FF: V(36, 0), HN: V(-48, 0), HF: V(-64, 0)};
export const lobiPose = (o: Partial<LobiPose> = {}): LobiPose => ({
  x: 0,
  y: 0,
  scale: 1,
  facing: 1,
  yaw: 0,
  opacity: 1,
  t: 0,
  bodyY: 0,
  pitch: 0,
  stretch: 0,
  breathe: 0,
  head: {pitch: 0, tilt: 0, turn: 0},
  ears: {near: {a: 0, fold: 0}, far: {a: 0, fold: 0}},
  tail: {lift: 0, wag: 0, curl: 0.3},
  paws: {...PAW0},
  face: FACE,
  lie: 0,
  ...o,
});

// ---------------------------------------------------------------- piezas
const Paw: React.FC<{p: Vec; lift: number; color: string; far?: boolean}> = ({p, lift, color, far}) => {
  const up = clamp(lift / 18);
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(-50 * up)})`}>
      <ellipse cx={5} cy={-6} rx={18} ry={11} fill={color} stroke={C.outline} strokeWidth={3} />
      {!far && up < 0.5 && <path d="M8,-1 l0,-6 M14,-2 l0,-5" stroke={C.outline} strokeWidth={2} strokeLinecap="round" opacity={0.6} />}
      {up > 0.35 && (
        <g opacity={clamp((up - 0.35) / 0.3)}>
          <ellipse cx={4} cy={-2} rx={8} ry={5} fill={C.pad} />
          {[-6, 1, 8, 14].map((x, i) => (
            <circle key={i} cx={x} cy={-9 + Math.abs(x - 4) * 0.15} r={2.8} fill={C.pad} />
          ))}
        </g>
      )}
    </g>
  );
};

/** Ángulo y punta de una oreja triangular. */
const EarShape: React.FC<{base: Vec; a: number; fold: number; s: number; color: string; inner: string}> = ({base, a, fold, s, color, inner}) => {
  const tip = rot(add(base, V(6 * s, -44 * s)), a, base);
  const tipF = lerpPt(tip, rot(tip, 0.9 * fold, lerpPt(base, tip, 0.55)), 1);
  const l = rot(add(base, V(-17 * s, 4 * s)), a, base);
  const r = rot(add(base, V(19 * s, 2 * s)), a, base);
  const mid = (k: number) => lerpPt(lerpPt(l, r, 0.5), tipF, k);
  return (
    <g>
      <path d={`M${f1(l.x)},${f1(l.y)} Q${f1(lerpPt(l, tipF, 0.5).x - 3)},${f1(lerpPt(l, tipF, 0.5).y)} ${f1(tipF.x)},${f1(tipF.y)} Q${f1(lerpPt(r, tipF, 0.5).x + 3)},${f1(lerpPt(r, tipF, 0.5).y)} ${f1(r.x)},${f1(r.y)}Z`} fill={color} stroke={C.outline} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={`M${f1(lerpPt(l, r, 0.22).x)},${f1(lerpPt(l, r, 0.22).y)} Q${f1(mid(0.5).x - 2)},${f1(mid(0.5).y)} ${f1(mid(0.85).x)},${f1(mid(0.85).y)} Q${f1(mid(0.5).x + 4)},${f1(mid(0.5).y)} ${f1(lerpPt(l, r, 0.78).x)},${f1(lerpPt(l, r, 0.78).y)}Z`} fill={inner} />
      <path d={`M${f1(mid(0.1).x)},${f1(mid(0.1).y)} l-3,-8 M${f1(mid(0.15).x + 5)},${f1(mid(0.15).y)} l1,-9`} stroke="#ffffff" strokeWidth={2} opacity={0.7} strokeLinecap="round" />
    </g>
  );
};
const lerpPt = (a: Vec, b: Vec, k: number) => V(lerp(a.x, b.x, k), lerp(a.y, b.y, k));

/** Cola esponjosa encadenada (balanceo con retraso por segmento). */
const Tail: React.FC<{base: Vec; p: LobiPose; uid: string}> = ({base, p, uid}) => {
  // ángulo con y hacia arriba: π = hacia atrás; restar lo levanta
  const P: Vec[] = [base];
  let a = Math.PI - 0.75 - p.tail.lift;
  for (let i = 1; i <= 8; i++) {
    a -= p.tail.curl * 0.1 + p.tail.wag * 0.12 * (0.4 + i / 8);
    const prev = P[i - 1];
    P.push(V(prev.x + Math.cos(a) * 15, prev.y - Math.sin(a) * 15));
  }
  const rr = (i: number) => 13 + Math.sin((i / 8) * Math.PI) * 13 - (i / 8) * 4;
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}tl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.fur} />
          <stop offset="0.75" stopColor={C.dark} />
          <stop offset="1" stopColor={C.light} />
        </linearGradient>
      </defs>
      {P.map((q, i) => (
        <path key={`o${i}`} d={furCircle(q, rr(i) + 3, 12, 0.18, i)} fill={C.outline} />
      ))}
      {P.map((q, i) => (
        <path key={`f${i}`} d={furCircle(q, rr(i), 12, 0.16, i)} fill={i > 6 ? C.light : i > 4 ? mixColor(C.fur, C.dark, 0.4) : C.fur} />
      ))}
      {P.slice(2).map((q, i) => (
        <path key={`s${i}`} d={`M${f1(q.x - 8)},${f1(q.y - 4)} q6,-6 14,-2`} stroke="#ffffff" strokeWidth={2.5} opacity={0.25} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- cabeza (perfil 3/4)
const Head: React.FC<{c: Vec; p: LobiPose; uid: string}> = ({c, p, uid}) => {
  const h = p.head;
  const turn = h.turn;
  const F = p.face;
  const R = 50;
  const tx = 8 * turn;
  const muz = V(c.x + 40 - 14 * turn, c.y + 16);
  const jawOpen = clamp(F.jaw);
  return (
    <g transform={`rotate(${f1(((h.pitch + h.tilt * 0.5) * 180) / Math.PI)} ${f1(c.x - 20)} ${f1(c.y + 30)})`}>
      {/* oreja lejana */}
      <EarShape base={V(c.x + 18 + tx, c.y - 36)} a={0.18 + p.ears.far.a} fold={p.ears.far.fold} s={0.92} color={C.dark} inner={mixColor(C.inner, C.dark, 0.35)} />
      {/* cabeza con mechones en las mejillas */}
      <path d={furCircle(V(c.x, c.y + 2), R + 3, 26, 0.09, 2, 0.15, 2.9)} fill={C.outline} />
      <circle cx={c.x} cy={c.y} r={R + 3} fill={C.outline} />
      <path d={furCircle(V(c.x, c.y + 2), R, 26, 0.09, 2, 0.15, 2.9)} fill={`url(#${uid}fur)`} />
      <circle cx={c.x} cy={c.y} r={R} fill={`url(#${uid}fur)`} />
      {/* máscara clara alrededor de los ojos y mejilla crema */}
      <ellipse cx={c.x + 22 + tx} cy={c.y + 4} rx={30} ry={24} fill={C.light} opacity={0.55} />
      <path d={furCircle(V(c.x + 8 + tx, c.y + 30), 22, 14, 0.18, 5, 0.2, 2.9)} fill={C.chest} />
      {/* mandíbula (pieza separada que baja) */}
      <g transform={`rotate(${f1(jawOpen * 26)} ${f1(muz.x - 26)} ${f1(muz.y + 4)})`}>
        <ellipse cx={muz.x - 2} cy={muz.y + 18} rx={26} ry={11} fill={C.cream} stroke={C.outline} strokeWidth={3} />
      </g>
      {/* hocico */}
      <ellipse cx={muz.x} cy={muz.y} rx={32} ry={21} fill={C.cream} stroke={C.outline} strokeWidth={3.5} />
      <ellipse cx={muz.x - 6} cy={muz.y - 9} rx={18} ry={7} fill="#ffffff" opacity={0.45} />
      <AnimalMouth c={V(muz.x + 14, muz.y + 12)} w={24} f={F} outline={C.outline} />
      {/* nariz negra pequeña */}
      <path d={`M${f1(muz.x + 22)},${f1(muz.y - 10)} q10,-3 14,4 q-2,8 -9,8 q-7,-2 -5,-12Z`} fill={C.nose} />
      <ellipse cx={muz.x + 28} cy={muz.y - 8} rx={3.5} ry={2} fill="#ffffff" opacity={0.7} />
      {/* mejillas */}
      <ellipse cx={c.x + 6 + tx} cy={c.y + 16} rx={10} ry={6} fill="#ff9aa8" opacity={0.15 + 0.45 * F.cheeks} />
      {/* ojos: el cercano más grande, el lejano más estrecho (vista 3/4) */}
      <Eye c={V(c.x + 10 + tx, c.y - 10)} rx={13} ry={16} iris={C.eye} f={F} brow={F.browL} lid={C.fur} outline={C.outline} side={-1} uid={`${uid}a`} />
      <Eye c={V(c.x + 40 + tx * 0.7, c.y - 12)} rx={9.5} ry={14.5} iris={C.eye} f={F} brow={F.browR} lid={C.light} outline={C.outline} side={1} uid={`${uid}b`} />
      {/* oreja cercana */}
      <EarShape base={V(c.x - 14 + tx * 0.6, c.y - 38)} a={-0.12 + p.ears.near.a} fold={p.ears.near.fold} s={1} color={C.fur} inner={C.inner} />
      {/* mechón de la frente y luz de contorno */}
      <path d={`M${f1(c.x - 6)},${f1(c.y - R + 2)} q8,-14 18,-6 q-2,-12 12,-6`} fill={C.fur} stroke={C.outline} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M${f1(c.x - R * 0.75)},${f1(c.y - R * 0.55)} A${R},${R} 0 0 1 ${f1(c.x - R * 0.05)},${f1(c.y - R * 0.98)}`} stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.35} strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- vista de perfil
const Side: React.FC<{p: LobiPose; uid: string}> = ({p, uid}) => {
  const by = p.bodyY - p.breathe * 1.5;
  const center = V(0, -100 + by);
  const st = 1 + p.stretch;
  const chest = rot(V(36 * st, -102 + by), p.pitch, center);
  const hip = rot(V(-44 * st, -100 + by), p.pitch, center);
  const br = 1 + p.breathe * 0.03;
  const shN = add(chest, V(8, 12));
  const shF = add(chest, V(-4, 10));
  const hpN = add(hip, V(-4, 6));
  const hpF = add(hip, V(-16, 4));
  const leg = (o: Vec, paw: Vec, front: boolean) => {
    if (front) {
      const r = ik(o, add(paw, V(0, -8)), 48, 50, 1); // codo hacia atrás
      return {pts: [o, r.joint, r.end], paw: r.end};
    }
    const hock = add(paw, V(-10, -30));
    const r = ik(o, hock, 46, 44, -1); // rodilla hacia delante
    return {pts: [o, r.joint, r.end, add(paw, V(0, -8))], paw: add(paw, V(0, -8))};
  };
  const FN = leg(shN, p.paws.FN, true);
  const FF = leg(shF, p.paws.FF, true);
  const HN = leg(hpN, p.paws.HN, false);
  const HF = leg(hpF, p.paws.HF, false);
  const farC = mixColor(C.fur, C.dark, 0.55);
  // pata con volumen continuo: contornos primero y rellenos después (sin "tubos" en las juntas),
  // con muslo/hombro musculoso en la raíz
  const drawLeg = (L: {pts: Vec[]; paw: Vec}, color: string, w: number, lift: number, far: boolean, hind: boolean) => {
    const ws = L.pts.map((_, i) => w * (1 - i * 0.16));
    const root = L.pts[0];
    const dir = Math.atan2(L.pts[1].y - root.y, L.pts[1].x - root.x);
    return (
      <g>
        {L.pts.slice(0, -1).map((a2, i) => (
          <path key={`o${i}`} d={`M${f1(a2.x)},${f1(a2.y)}L${f1(L.pts[i + 1].x)},${f1(L.pts[i + 1].y)}`} stroke={C.outline} strokeWidth={ws[i] + 6} strokeLinecap="round" />
        ))}
        <ellipse cx={root.x} cy={root.y} rx={(hind ? 30 : 21) + 3} ry={(hind ? 38 : 29) + 3} fill={C.outline} transform={`rotate(${f1((dir * 180) / Math.PI - 90)} ${f1(root.x)} ${f1(root.y)})`} />
        {L.pts.slice(0, -1).map((a2, i) => (
          <path key={`f${i}`} d={`M${f1(a2.x)},${f1(a2.y)}L${f1(L.pts[i + 1].x)},${f1(L.pts[i + 1].y)}`} stroke={color} strokeWidth={ws[i]} strokeLinecap="round" />
        ))}
        <ellipse cx={root.x} cy={root.y} rx={hind ? 30 : 21} ry={hind ? 38 : 29} fill={far ? color : `url(#${uid}fur)`} transform={`rotate(${f1((dir * 180) / Math.PI - 90)} ${f1(root.x)} ${f1(root.y)})`} />
        {!far && <path d={`M${f1(root.x - 10)},${f1(root.y - (hind ? 28 : 18))} q-12,16 -6,34`} stroke="#ffffff" strokeWidth={4} opacity={0.22} fill="none" strokeLinecap="round" />}
        {!far && L.pts.slice(1, -1).map((a2, i) => <path key={`t${i}`} d={`M${f1(a2.x - 6)},${f1(a2.y)} q4,-6 10,-2`} stroke={C.dark} strokeWidth={2.5} fill="none" opacity={0.5} />)}
        <Paw p={add(L.paw, V(0, 8))} lift={lift} color={far ? mixColor(color, C.dark, 0.2) : C.light} far={far} />
      </g>
    );
  };
  const lift = (v: Vec) => -v.y;
  const neck = add(chest, V(26, -26));
  const headC = rot(add(neck, V(46, -50)), p.head.pitch * 0.35, neck);
  // contorno del torso (columna flexible)
  const top = [add(hip, V(-34, -6)), add(hip, V(0, -42)), lerpPt(add(hip, V(0, -44)), add(chest, V(0, -46)), 0.5), add(chest, V(-4, -46)), add(chest, V(34, -22))];
  const bot = [add(chest, V(40, 14)), add(chest, V(14, 44)), lerpPt(add(chest, V(0, 40)), add(hip, V(0, 38)), 0.5), add(hip, V(4, 40)), add(hip, V(-36, 14))];
  const body = smooth([...top, ...bot], true);
  return (
    <g>
      {drawLeg(HF, farC, 24, lift(p.paws.HF), true, true)}
      {drawLeg(FF, farC, 22, lift(p.paws.FF), true, false)}
      <Tail base={add(hip, V(-34, -12))} p={p} uid={uid} />
      <g transform={`translate(${f1(center.x)} ${f1(center.y)}) scale(1 ${f1(br)}) translate(${f1(-center.x)} ${f1(-center.y)})`}>
        <path d={body} fill={C.outline} transform={`translate(0 0)`} stroke={C.outline} strokeWidth={7} strokeLinejoin="round" />
        <path d={body} fill={`url(#${uid}fur)`} />
        {/* lomo más oscuro y vientre claro */}
        <path d={smooth([add(hip, V(-26, -20)), add(hip, V(4, -40)), add(chest, V(-6, -44)), add(chest, V(10, -36))])} stroke={C.dark} strokeWidth={14} fill="none" opacity={0.45} strokeLinecap="round" />
        <path d={smooth([add(chest, V(4, 36)), lerpPt(add(chest, V(0, 36)), add(hip, V(0, 34)), 0.5), add(hip, V(6, 30))])} stroke={C.light} strokeWidth={12} fill="none" opacity={0.6} strokeLinecap="round" />
        {/* mechones del pelaje */}
        {[0.2, 0.4, 0.6, 0.8].map((k, i) => {
          const q = lerpPt(add(hip, V(0, -30)), add(chest, V(0, -30)), k);
          return <path key={i} d={`M${f1(q.x - 8)},${f1(q.y + 6)} q6,-8 14,-3`} stroke={C.dark} strokeWidth={2.5} fill="none" opacity={0.5} strokeLinecap="round" />;
        })}
        {/* pecho blanco esponjoso */}
        <path d={furCircle(add(chest, V(24, 6)), 24, 16, 0.2, 3, -1.3, 1.9)} fill={C.chest} stroke={C.outline} strokeWidth={2.5} />
        <path d={`M${f1(chest.x - 30)},${f1(chest.y - 40)} A60,50 0 0 1 ${f1(chest.x + 20)},${f1(chest.y - 40)}`} stroke="#ffffff" strokeWidth={4} opacity={0.3} fill="none" strokeLinecap="round" />
      </g>
      {drawLeg(HN, C.fur, 26, lift(p.paws.HN), false, true)}
      {/* cuello */}
      <path d={`M${f1(chest.x + 6)},${f1(chest.y - 20)} Q${f1(neck.x + 10)},${f1(neck.y - 20)} ${f1(headC.x - 10)},${f1(headC.y + 20)} L${f1(headC.x + 12)},${f1(headC.y + 36)} Q${f1(neck.x + 34)},${f1(neck.y + 18)} ${f1(chest.x + 38)},${f1(chest.y + 8)}Z`} fill={C.fur} stroke={C.outline} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={furCircle(add(neck, V(22, 8)), 18, 12, 0.22, 7, -0.8, 2.2)} fill={C.chest} />
      {drawLeg(FN, C.fur, 24, lift(p.paws.FN), false, false)}
      <Head c={headC} p={p} uid={uid} />
    </g>
  );
};

// ---------------------------------------------------------------- vista de frente (giro)
const Front: React.FC<{p: LobiPose; uid: string; back?: boolean}> = ({p, uid, back = false}) => {
  const by = p.bodyY;
  const F = p.face;
  const hc = V(0, -178 + by);
  const tailX = Math.sin(p.t * 9) * 30 * (0.4 + 0.6 * Math.abs(p.tail.wag));
  return (
    <g>
      {!back && (
        <g>
          <path d={smooth([V(0, -90 + by), V(tailX * 0.8, -130 + by), V(tailX * 2.2, -175 + by)])} stroke={C.outline} strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d={smooth([V(0, -90 + by), V(tailX * 0.8, -130 + by), V(tailX * 2.2, -175 + by)])} stroke={C.fur} strokeWidth={40} fill="none" strokeLinecap="round" />
          <circle cx={tailX * 2.2} cy={-175 + by} r={20} fill={C.light} />
        </g>
      )}
      <ellipse cx={0} cy={-96 + by} rx={58} ry={50} fill={`url(#${uid}fur)`} stroke={C.outline} strokeWidth={4} />
      {[-26, 26].map((x, i) => {
        const paw = i === 0 ? p.paws.FF : p.paws.FN;
        const lift = -paw.y;
        return (
          <g key={x}>
            <Capsule a={V(x, -100 + by)} b={V(x * 1.05, -14 - lift)} w={24} color={C.fur} outline={C.outline} />
            <Paw p={V(x * 1.05 - 4, -lift)} lift={lift} color={C.light} />
          </g>
        );
      })}
      <path d={furCircle(V(0, -112 + by), 30, 16, 0.2, 2)} fill={C.chest} />
      <EarShape base={V(-30, hc.y - 36)} a={-0.35 - p.ears.far.a} fold={p.ears.far.fold} s={1} color={C.fur} inner={C.inner} />
      <EarShape base={V(30, hc.y - 36)} a={0.35 + p.ears.near.a} fold={-p.ears.near.fold} s={1} color={C.fur} inner={C.inner} />
      <circle cx={hc.x} cy={hc.y} r={53} fill={C.outline} />
      <path d={furCircle(hc, 51, 28, 0.08, 4, 0.3, 2.85)} fill={`url(#${uid}fur)`} />
      <circle cx={hc.x} cy={hc.y} r={50} fill={`url(#${uid}fur)`} />
      {back ? (
        <g>
          <path d={`M-30,${f1(hc.y + 10)} q30,22 60,0`} stroke={C.dark} strokeWidth={10} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d={furCircle(V(tailX * 0.6, -100 + by), 26, 12, 0.22, 5)} fill={C.fur} stroke={C.outline} strokeWidth={3} />
          <path d={furCircle(V(tailX, -140 + by), 22, 12, 0.22, 6)} fill={C.light} stroke={C.outline} strokeWidth={3} />
        </g>
      ) : (
      <g>
      <ellipse cx={0} cy={hc.y + 22} rx={30} ry={22} fill={C.cream} stroke={C.outline} strokeWidth={3} />
      <Eye c={V(-22, hc.y - 8)} rx={12} ry={15} iris={C.eye} f={F} brow={F.browL} lid={C.fur} outline={C.outline} side={-1} uid={`${uid}fa`} />
      <Eye c={V(22, hc.y - 8)} rx={12} ry={15} iris={C.eye} f={F} brow={F.browR} lid={C.fur} outline={C.outline} side={1} uid={`${uid}fb`} />
      <path d={`M-8,${f1(hc.y + 10)} q8,-4 16,0 q-2,8 -8,9 q-6,-1 -8,-9Z`} fill={C.nose} />
      <AnimalMouth c={V(0, hc.y + 26)} w={22} f={F} outline={C.outline} />
      </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- acostado y enroscado
const Curl: React.FC<{p: LobiPose; uid: string}> = ({p, uid}) => {
  const br = 1 + 0.045 * Math.sin(p.t * 1.6) * (0.5 + 0.5 * p.breathe);
  const F = {...p.face, mode: p.face.mode === 'normal' ? ('closed' as const) : p.face.mode};
  return (
    <g>
      <ellipse cx={0} cy={-4} rx={140} ry={20} fill="#1a1030" opacity={0.25} />
      <g transform={`translate(0 -10) scale(1 ${f1(br)}) translate(0 10)`}>
        <ellipse cx={-10} cy={-48} rx={110} ry={50} fill={C.outline} />
        <ellipse cx={-10} cy={-48} rx={106} ry={46} fill={`url(#${uid}fur)`} />
        <path d={smooth([V(-100, -60), V(-40, -92), V(30, -88)])} stroke={C.dark} strokeWidth={14} opacity={0.4} fill="none" strokeLinecap="round" />
      </g>
      {/* patas delanteras dobladas bajo la cabeza */}
      <Capsule a={V(40, -24)} b={V(112, -14)} w={22} color={C.fur} outline={C.outline} />
      <ellipse cx={118} cy={-14} rx={16} ry={10} fill={C.light} stroke={C.outline} strokeWidth={3} />
      {/* cabeza apoyada */}
      <g transform="translate(78 -40) rotate(14)">
        <EarShape base={V(-6, -36)} a={0.6 + p.ears.far.a} fold={0.3} s={0.9} color={C.dark} inner={mixColor(C.inner, C.dark, 0.3)} />
        <circle cx={0} cy={0} r={45} fill={C.outline} />
        <circle cx={0} cy={0} r={42} fill={`url(#${uid}fur)`} />
        <ellipse cx={34} cy={14} rx={26} ry={17} fill={C.cream} stroke={C.outline} strokeWidth={3} />
        <path d="M54,4 q8,-2 11,3 q-2,6 -7,6 q-5,-2 -4,-9Z" fill={C.nose} />
        <Eye c={V(12, -6)} rx={11} ry={13} iris={C.eye} f={F} brow={-0.1} lid={C.fur} outline={C.outline} side={-1} uid={`${uid}ca`} />
        <AnimalMouth c={V(46, 22)} w={16} f={{...F, jaw: 0, smile: 0.5}} outline={C.outline} />
        <EarShape base={V(-22, -30)} a={0.9 + p.ears.near.a} fold={0.4} s={0.95} color={C.fur} inner={C.inner} />
      </g>
      {/* la cola cubre parte del cuerpo */}
      <path d={smooth([V(-120, -40), V(-110, 4), V(-30, 14), V(60, 6), V(100, -8)])} stroke={C.outline} strokeWidth={50} fill="none" strokeLinecap="round" />
      <path d={smooth([V(-120, -40), V(-110, 4), V(-30, 14), V(60, 6), V(100, -8)])} stroke={C.fur} strokeWidth={43} fill="none" strokeLinecap="round" />
      <path d={smooth([V(40, 10), V(70, 4), V(100, -8)])} stroke={C.light} strokeWidth={36} fill="none" strokeLinecap="round" />
      <path d={smooth([V(-100, -10), V(-40, 10), V(20, 8)])} stroke="#ffffff" strokeWidth={4} opacity={0.25} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Lobi: React.FC<{p: LobiPose; uid?: string}> = ({p, uid = 'lobi'}) => {
  const cy = Math.cos(p.yaw);
  const front = Math.abs(cy) < 0.32 && p.lie < 0.5;
  const sx = p.lie >= 0.5 ? 1 : front ? 1 : Math.sign(cy) * Math.max(0.32, Math.abs(cy));
  const air = Math.max(0, -Math.min(p.paws.FN.y, p.paws.FF.y, p.paws.HN.y, p.paws.HF.y)) * (p.lie > 0.5 ? 0 : 1);
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) scale(${(p.scale * p.facing).toFixed(3)} ${p.scale.toFixed(3)})`} opacity={p.opacity}>
      <defs>
        <Sphere id={`${uid}fur`} base={C.fur} />
      </defs>
      {p.lie < 0.5 && <ellipse cx={0} cy={2} rx={110 * (1 - Math.min(0.5, air / 300))} ry={16 * (1 - Math.min(0.5, air / 300))} fill="#1a1030" opacity={0.22 * (1 - Math.min(0.6, air / 200))} />}
      <g transform={`scale(${sx.toFixed(3)} 1)`}>{p.lie >= 0.5 ? <Curl p={p} uid={uid} /> : front ? <Front p={p} uid={uid} back={Math.sin(p.yaw) * p.facing < 0} /> : <Side p={p} uid={uid} />}</g>
    </g>
  );
};
