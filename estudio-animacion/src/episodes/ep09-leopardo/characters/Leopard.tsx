// EL LEOPARDO (vista lateral 3/4) — también sirve para los cachorros (pose.cub = 1).
// Anatomía: tronco largo y musculoso con lomo ligeramente hundido tras la cruz, pecho profundo,
// vientre recogido; cabeza proporcionalmente pequeña y ancha, orejas redondeadas con dorso negro y
// mancha blanca, ojos almendrados de iris dorado y pupila redonda, hocico con almohadillas de bigotes;
// patas robustas (hombro y muslo con volumen muscular), traseras con corvejón; cola larga con punta
// clara por debajo. Pelaje dorado con ROSETAS (anillos rotos con centro algo más oscuro), no manchas
// macizas de guepardo; manchas macizas solo en cabeza, patas y vientre.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {add, f1, ik, LeopardPose, mix, PawKey, rot, ROSETTES, smooth, V, Vec} from '../animation/LeopardRig';

const BASE = {fur: '#d9a24a', back: '#a86c26', belly: '#f4e3c0', spot: '#2a1a0c', rosetteIn: '#b07a34', nose: '#b8746a', eye: '#d8b23a', outline: '#3a2410', inner: '#e8b8a0'};

function palette(p: LeopardPose) {
  const night = p.night;
  const cub = p.cub;
  const n = (c: string) => mixColor(mixColor(c, '#c9b49a', cub * 0.35), '#1c2648', night * 0.55);
  return {fur: n(BASE.fur), back: n(BASE.back), belly: n(BASE.belly), spot: mixColor(BASE.spot, '#3a3040', cub * 0.3), rin: n(BASE.rosetteIn), nose: n(BASE.nose), eye: BASE.eye, outline: BASE.outline, inner: n(BASE.inner), far: mixColor(n(BASE.fur), '#2a1a10', 0.38)};
}

/** Manchas macizas sobre un segmento (patas, cola). */
const SegSpots: React.FC<{a: Vec; b: Vec; w: number; n: number; seed: number; c: string; scale?: number}> = ({a, b, w, n, seed, c, scale = 1}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const u = (i + 0.5) / n;
      const side = (hash1(seed + i * 3.3) - 0.5) * w * 0.6;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      const p = {x: a.x + dx * u + (-dy / l) * side, y: a.y + dy * u + (dx / l) * side};
      return <ellipse key={i} cx={p.x} cy={p.y} rx={(2.2 + hash1(seed + i) * 2) * scale} ry={(1.8 + hash1(seed * 2 + i) * 1.6) * scale} fill={c} opacity={0.85} />;
    })}
  </g>
);

export const Leopard: React.FC<{p: LeopardPose; uid: string}> = ({p, uid}) => {
  const P = palette(p);
  const cub = p.cub;
  const headK = 1 + 0.38 * cub; // cabeza relativamente mayor en los cachorros
  const legK = 1 - 0.18 * cub;
  const st = 1 + p.stretch;
  const by = p.bodyY - p.breathe * 1.2;
  const center = V(0, -112 * legK + by);
  const shoulder = rot(V(80 * st, -104 * legK + by), p.pitch, center);
  const hip = rot(V(-84 * st, -106 * legK + by), p.pitch, center);
  const br = 1 + 0.025 * p.breathe;
  // ---------- contorno del tronco (columna flexible)
  const dip = 6 + 10 * p.neck; // el lomo se hunde tras la cruz al acechar
  const T = (u: number) => mix(add(hip, V(-6, -34)), add(shoulder, V(-4, -40 + 4 * p.neck)), u);
  const B = (u: number) => mix(add(hip, V(14, 34)), add(shoulder, V(16, 40)), u);
  const backPts = [add(hip, V(-40, -2)), add(hip, V(-22, -32)), add(T(0.45), V(0, dip * 0.4)), add(T(0.7), V(0, dip)), add(shoulder, V(-8, -42)), add(shoulder, V(26, -26)), add(shoulder, V(38, 2))];
  const bellyPts = [add(shoulder, V(28, 34)), add(shoulder, V(4, 44)), add(B(0.55), V(0, 4)), add(B(0.2), V(0, -6)), add(hip, V(4, 30)), add(hip, V(-30, 22))];
  const torso = smooth([...backPts, ...bellyPts], true);
  // ---------- patas
  const L1F = 50 * legK;
  const L2F = 48 * legK;
  const front = (o: Vec, pawT: Vec) => {
    const target = add(pawT, V(0, -9 * legK));
    const r = ik(o, target, L1F, L2F, 1);
    return {pts: [o, r.joint, r.end], paw: r.end, lift: -pawT.y};
  };
  const hind = (o: Vec, pawT: Vec) => {
    const target = add(pawT, V(0, -9 * legK));
    const hock = add(target, V(-15 * legK, -32 * legK));
    const r = ik(o, hock, 52 * legK, 48 * legK, -1);
    return {pts: [o, r.joint, r.end, target], paw: target, lift: -pawT.y};
  };
  const legs: Record<PawKey, ReturnType<typeof front>> = {
    FN: front(add(shoulder, V(8, 14)), p.paws.FN),
    FF: front(add(shoulder, V(-6, 12)), p.paws.FF),
    HN: hind(add(hip, V(-4, 10)), p.paws.HN),
    HF: hind(add(hip, V(-18, 8)), p.paws.HF),
  };
  const drawLeg = (k: PawKey, far: boolean) => {
    const L = legs[k];
    const isHind = k[0] === 'H';
    const col = far ? P.far : P.fur;
    const ws = isHind ? [30, 20, 15] : [26, 19, 16];
    const root = L.pts[0];
    const dir = Math.atan2(L.pts[1].y - root.y, L.pts[1].x - root.x);
    const mus = (isHind ? [27, 42] : [20, 36]).map((v) => v * legK * (1 + 0.06 * p.muscle));
    return (
      <g key={k}>
        {L.pts.slice(0, -1).map((a, i) => (
          <path key={`o${i}`} d={`M${f1(a.x)},${f1(a.y)}L${f1(L.pts[i + 1].x)},${f1(L.pts[i + 1].y)}`} stroke={P.outline} strokeWidth={ws[i] * legK + 5} strokeLinecap="round" opacity={0.9} />
        ))}
        {L.pts.slice(0, -1).map((a, i) => (
          <path key={`f${i}`} d={`M${f1(a.x)},${f1(a.y)}L${f1(L.pts[i + 1].x)},${f1(L.pts[i + 1].y)}`} stroke={col} strokeWidth={ws[i] * legK} strokeLinecap="round" />
        ))}
        <ellipse cx={root.x} cy={root.y} rx={mus[0]} ry={mus[1]} fill={far ? col : `url(#${uid}leg)`} stroke={P.outline} strokeWidth={1.5} strokeOpacity={0.35} transform={`rotate(${f1((dir * 180) / Math.PI - 90)} ${f1(root.x)} ${f1(root.y)})`} />
        {!far && Array.from({length: isHind ? 6 : 4}, (_, i) => {
          const a2 = hash1(i * 3.7 + (isHind ? 1 : 2)) * Math.PI * 2;
          const rr = Math.sqrt(hash1(i * 5.1)) * 0.65;
          return <ellipse key={`m${i}`} cx={root.x + Math.cos(a2) * mus[0] * rr} cy={root.y + Math.sin(a2) * mus[1] * rr} rx={4.5 * legK} ry={3.5 * legK} fill="none" stroke={P.spot} strokeWidth={2.4} strokeDasharray="5 3" />;
        })}
        {/* relieve muscular */}
        {!far && <path d={`M${f1(root.x - 8)},${f1(root.y - mus[1] * 0.6)} q-10,${f1(mus[1] * 0.5)} -2,${f1(mus[1] * 1.0)}`} stroke={P.back} strokeWidth={3} fill="none" opacity={0.25 + 0.35 * p.muscle} strokeLinecap="round" />}
        {!far && <path d={`M${f1(root.x + 6)},${f1(root.y - mus[1] * 0.7)} q12,${f1(mus[1] * 0.4)} 4,${f1(mus[1] * 0.9)}`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.18 + 0.1 * p.muscle} strokeLinecap="round" />}
        {L.pts.slice(0, -1).map((a, i) => (
          <SegSpots key={`s${i}`} a={a} b={L.pts[i + 1]} w={ws[i] * legK} n={i === 0 ? 4 : 3} seed={i * 7 + k.charCodeAt(1)} c={P.spot} scale={legK} />
        ))}
        {/* zarpa */}
        <g transform={`translate(${f1(L.paw.x)} ${f1(L.paw.y + 9 * legK)}) rotate(${f1(-35 * clamp(L.lift / 25))})`}>
          <ellipse cx={5} cy={-5} rx={17 * legK} ry={9.5 * legK} fill={far ? col : mixColor(P.fur, P.belly, 0.25)} stroke={P.outline} strokeWidth={2.5} />
          {!far && [0, 6, 12].map((x) => <path key={x} d={`M${f1(x + 4)},-1 l0,-6`} stroke={P.outline} strokeWidth={1.4} opacity={0.6} />)}
        </g>
      </g>
    );
  };
  // ---------- cola encadenada (movimiento propio, retraso por segmento)
  const tailPts: Vec[] = [add(hip, V(-38, -18))];
  let a = Math.PI + 0.32 - p.tail.base; // hacia atrás y abajo
  const nT = 16;
  const segL = 17 * (1 - 0.3 * cub);
  for (let i = 1; i <= nT; i++) {
    const u = i / nT;
    a += Math.sin(p.t * p.tail.speed * 2 - u * 3.2) * p.tail.amp * 0.08 - (u > 0.55 ? p.tail.curl * 0.2 : 0) + 0.02;
    const prev = tailPts[i - 1];
    tailPts.push(V(prev.x + Math.cos(a) * segL, Math.min(-6, prev.y - Math.sin(a) * segL)));
  }
  // ángulo π+0.75 = atrás y abajo (y de SVG hacia abajo); restar curvatura levanta la punta
  const tw = (i: number) => (16 - 7 * (i / nT)) * (1 - 0.2 * cub);
  // ---------- cuello y cabeza
  const neckBase = add(shoulder, V(22, -22));
  const headC = add(shoulder, V(lerp(62, 82, p.neck), lerp(-62, -16, p.neck) + 0 * headK));
  const H = p.head;
  const hr = 36 * headK;
  const eyeC = add(headC, V(13 * headK + 6 * H.turn, -8 * headK));
  const eye2 = add(headC, V(34 * headK + 4 * H.turn, -9 * headK));
  const muz = add(headC, V(34 * headK, 12 * headK));
  const blink = clamp(p.eye.blink);
  // rosetas mapeadas al tronco
  const rosettes = ROSETTES.map((r, i) => {
    const pt = mix(T(r.u), B(r.u), r.v);
    return {...r, x: pt.x, y: pt.y, i};
  });
  const id = `${uid}t`;
  return (
    <g transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1((p.rot * 180) / Math.PI)}) scale(${(p.scale * p.facing).toFixed(3)} ${p.scale.toFixed(3)})`} opacity={p.opacity}>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.back} />
          <stop offset="0.35" stopColor={P.fur} />
          <stop offset="0.75" stopColor={mixColor(P.fur, P.belly, 0.55)} />
          <stop offset="1" stopColor={P.belly} />
        </linearGradient>
        <radialGradient id={`${uid}leg`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor={mixColor(P.fur, '#ffffff', 0.18)} />
          <stop offset="0.7" stopColor={P.fur} />
          <stop offset="1" stopColor={P.back} />
        </radialGradient>
        <radialGradient id={`${uid}h`} cx="0.45" cy="0.3" r="0.8">
          <stop offset="0" stopColor={mixColor(P.fur, '#ffffff', 0.15)} />
          <stop offset="0.7" stopColor={P.fur} />
          <stop offset="1" stopColor={P.back} />
        </radialGradient>
        <clipPath id={id}>
          <path d={torso} />
        </clipPath>
      </defs>
      {/* sombra de contacto */}
      <ellipse cx={0} cy={4} rx={150 * (1 - 0.4 * cub)} ry={16} fill="#1a1008" opacity={0.25 * clamp(1 - Math.max(0, -Math.min(p.paws.FN.y, p.paws.HN.y)) / 160)} />
      {drawLeg('HF', true)}
      {drawLeg('FF', true)}
      {/* cola */}
      <g>
        <path d={smooth(tailPts)} stroke={P.outline} strokeWidth={tw(0) + 5} fill="none" strokeLinecap="round" />
        {tailPts.slice(0, -1).map((q, i) => (
          <path key={i} d={`M${f1(q.x)},${f1(q.y)}L${f1(tailPts[i + 1].x)},${f1(tailPts[i + 1].y)}`} stroke={i > nT - 3 ? mixColor(P.fur, P.belly, 0.6) : P.fur} strokeWidth={tw(i)} strokeLinecap="round" />
        ))}
        {tailPts.slice(1, -1).map((q, i) => (i % 2 === 0 ? <ellipse key={`s${i}`} cx={q.x} cy={q.y - tw(i) * 0.15} rx={tw(i) * 0.32} ry={tw(i) * 0.26} fill={P.spot} opacity={0.85} /> : null))}
        <circle cx={tailPts[nT].x} cy={tailPts[nT].y} r={tw(nT) * 0.55} fill={P.spot} />
      </g>
      {/* tronco */}
      <g transform={`translate(${f1(center.x)} ${f1(center.y)}) scale(1 ${f1(br)}) translate(${f1(-center.x)} ${f1(-center.y)})`}>
        <path d={torso} fill={P.outline} stroke={P.outline} strokeWidth={6} strokeLinejoin="round" />
        <path d={torso} fill={`url(#${uid}g)`} />
        <g clipPath={`url(#${id})`}>
          {rosettes.map((r) =>
            r.v > 0.78 ? (
              <ellipse key={r.i} cx={r.x} cy={r.y} rx={r.r * 0.45} ry={r.r * 0.35} fill={P.spot} opacity={0.75} />
            ) : (
              <g key={r.i} transform={`translate(${f1(r.x)} ${f1(r.y)}) rotate(${f1(r.rot)})`}>
                <ellipse rx={r.r} ry={r.r * 0.8} fill={P.rin} opacity={0.75} />
                <ellipse rx={r.r} ry={r.r * 0.8} fill="none" stroke={P.spot} strokeWidth={3.4} strokeDasharray={`${f1(r.r * r.gap)} ${f1(r.r * 0.55)}`} strokeLinecap="round" />
              </g>
            ),
          )}
          {/* relieve muscular del costado y luz de contorno en el lomo */}
          <path d={smooth([add(shoulder, V(-10, -20)), add(shoulder, V(-26, 10)), add(shoulder, V(-14, 34))])} stroke={P.back} strokeWidth={5} fill="none" opacity={0.25 + 0.3 * p.muscle} />
          <path d={smooth([add(hip, V(14, -20)), add(hip, V(30, 6)), add(hip, V(18, 28))])} stroke={P.back} strokeWidth={5} fill="none" opacity={0.25 + 0.3 * p.muscle} />
          <path d={smooth(backPts.slice(1, 5))} stroke={p.rim} strokeWidth={6} fill="none" opacity={p.rimK} transform="translate(0 4)" />
        </g>
      </g>
      {drawLeg('HN', false)}
      {/* cuello */}
      <path d={smooth([add(shoulder, V(-8, -38)), add(neckBase, V(12, -18)), add(headC, V(-14, -20 * headK)), add(headC, V(-6, 22 * headK)), add(neckBase, V(26, 26)), add(shoulder, V(34, 12))], true)} fill={P.outline} stroke={P.outline} strokeWidth={5} />
      <path d={smooth([add(shoulder, V(-8, -38)), add(neckBase, V(12, -18)), add(headC, V(-14, -20 * headK)), add(headC, V(-6, 22 * headK)), add(neckBase, V(26, 26)), add(shoulder, V(34, 12))], true)} fill={P.fur} />
      <path d={smooth([add(neckBase, V(26, 24)), add(headC, V(4, 26 * headK))])} stroke={P.belly} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
      {[0.25, 0.5, 0.75].map((u, i) => {
        const q = mix(add(shoulder, V(0, -30)), add(headC, V(-10, -12)), u);
        return <ellipse key={i} cx={q.x} cy={q.y + (i % 2) * 8} rx={3.4} ry={2.6} fill={P.spot} opacity={0.8} />;
      })}
      {drawLeg('FN', false)}
      {/* cabeza */}
      <g transform={`rotate(${f1(((H.pitch + H.tilt * 0.5) * 180) / Math.PI)} ${f1(headC.x - 16 * headK)} ${f1(headC.y + 16 * headK)})`}>
        {/* oreja lejana */}
        <g transform={`rotate(${f1(-p.ears * 14)} ${f1(headC.x + 8 * headK)} ${f1(headC.y - 26 * headK)})`}>
          <ellipse cx={headC.x + 10 * headK} cy={headC.y - 32 * headK} rx={9 * headK} ry={11 * headK} fill={P.spot} />
        </g>
        <ellipse cx={headC.x} cy={headC.y} rx={hr + 3} ry={hr * 0.86 + 3} fill={P.outline} />
        <ellipse cx={headC.x} cy={headC.y} rx={hr} ry={hr * 0.86} fill={`url(#${uid}h)`} />
        {/* hocico y mentón claros */}
        <ellipse cx={muz.x} cy={muz.y} rx={22 * headK} ry={16 * headK} fill={P.outline} />
        <ellipse cx={muz.x} cy={muz.y} rx={20 * headK} ry={14.5 * headK} fill={mixColor(P.fur, P.belly, 0.6)} />
        <ellipse cx={muz.x + 2} cy={muz.y + 9 * headK + p.jaw * 6} rx={14 * headK} ry={6 * headK} fill={P.belly} stroke={P.outline} strokeWidth={1.5} />
        {/* almohadillas de bigotes y bigotes */}
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={muz.x + 2 + (i % 2) * 6} cy={muz.y + 2 + Math.floor(i / 2) * 4} r={1.2} fill={P.spot} />
        ))}
        {[-6, 0, 6].map((d, i) => (
          <path key={`w${i}`} d={`M${f1(muz.x + 6)},${f1(muz.y + 3 + d * 0.4)} q${f1(26 * headK)},${f1(d - 4)} ${f1(48 * headK)},${f1(d * 2.2)}`} stroke="#fff6e0" strokeWidth={1.2} fill="none" opacity={0.8} />
        ))}
        {/* nariz */}
        <path d={`M${f1(muz.x + 12 * headK)},${f1(muz.y - 10 * headK)} q${f1(9 * headK)},${f1(-1)} ${f1(10 * headK)},${f1(4 * headK)} q${f1(-3 * headK)},${f1(6 * headK)} ${f1(-9 * headK)},${f1(5 * headK)}Z`} fill={P.nose} stroke={P.outline} strokeWidth={1.8} />
        <path d={`M${f1(muz.x + 16 * headK)},${f1(muz.y - 1 * headK)} q-2,${f1(6 * headK)} -10,${f1(8 * headK)}`} stroke={P.outline} strokeWidth={1.8} fill="none" />
        {/* manchas de la frente y las mejillas */}
        {Array.from({length: 9}, (_, i) => (
          <ellipse key={`f${i}`} cx={headC.x - 18 * headK + (i % 3) * 10 * headK + hash1(i) * 4} cy={headC.y - 22 * headK + Math.floor(i / 3) * 8 * headK} rx={2.4 * headK} ry={2 * headK} fill={P.spot} opacity={0.85} />
        ))}
        <path d={`M${f1(headC.x - 4 * headK)},${f1(headC.y + 8 * headK)} q${f1(8 * headK)},${f1(8 * headK)} ${f1(20 * headK)},${f1(6 * headK)}`} stroke={P.spot} strokeWidth={2.4} fill="none" opacity={0.85} />
        {/* ojo lejano (vista 3/4) */}
        <ellipse cx={eye2.x} cy={eye2.y} rx={5 * headK} ry={4.5 * headK * (1 - 0.9 * blink)} fill={P.eye} stroke={P.outline} strokeWidth={2} />
        {/* ojo cercano: almendrado, iris dorado, pupila redonda, brillo */}
        <g>
          <path d={`M${f1(eyeC.x - 11 * headK)},${f1(eyeC.y + 1)} Q${f1(eyeC.x)},${f1(eyeC.y - 10 * headK * (1 - blink))} ${f1(eyeC.x + 11 * headK)},${f1(eyeC.y - 1)} Q${f1(eyeC.x)},${f1(eyeC.y + 8 * headK * (1 - blink))} ${f1(eyeC.x - 11 * headK)},${f1(eyeC.y + 1)}Z`} fill={p.eye.shine > 0.05 ? mixColor(P.eye, '#c8ff9a', p.eye.shine) : P.eye} stroke={P.outline} strokeWidth={2.6} />
          {blink < 0.85 && <circle cx={eyeC.x + p.eye.look.x * 3} cy={eyeC.y + p.eye.look.y * 2} r={(2 + 4.5 * p.eye.pupil) * headK * (1 - blink)} fill="#140c06" />}
          {blink < 0.85 && <circle cx={eyeC.x - 3 * headK} cy={eyeC.y - 3 * headK} r={1.8 * headK} fill="#ffffff" />}
          {p.eye.shine > 0.05 && <circle cx={eyeC.x} cy={eyeC.y} r={13 * headK} fill="#d8ff9a" opacity={0.35 * p.eye.shine} />}
          <path d={`M${f1(eyeC.x - 12 * headK)},${f1(eyeC.y + 2)} l${f1(-6 * headK)},${f1(4 * headK)}`} stroke={P.outline} strokeWidth={2.4} />
        </g>
        {/* oreja cercana: redondeada, dorso negro con mancha blanca */}
        <g transform={`rotate(${f1(-p.ears * 16)} ${f1(headC.x - 12 * headK)} ${f1(headC.y - 24 * headK)})`}>
          <ellipse cx={headC.x - 14 * headK} cy={headC.y - 32 * headK} rx={11 * headK} ry={13 * headK} fill={P.outline} />
          <ellipse cx={headC.x - 14 * headK} cy={headC.y - 32 * headK} rx={9 * headK} ry={11 * headK} fill={P.spot} />
          <ellipse cx={headC.x - 14 * headK} cy={headC.y - 30 * headK} rx={4 * headK} ry={5 * headK} fill="#fff6e0" opacity={0.85} />
        </g>
        <path d={`M${f1(headC.x - hr * 0.7)},${f1(headC.y - hr * 0.5)} A${f1(hr)},${f1(hr * 0.86)} 0 0 1 ${f1(headC.x + hr * 0.2)},${f1(headC.y - hr * 0.84)}`} stroke={p.rim} strokeWidth={4} fill="none" opacity={p.rimK} strokeLinecap="round" />
      </g>
    </g>
  );
};
