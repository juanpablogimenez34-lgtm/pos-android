// MOTORES DE ARTRÓPODOS (vista superior en 3/4, cuerpo hacia +x).
//  · Scorpion: prosoma, mesosoma de 7 segmentos, cola (metasoma) de 5 segmentos + telson con aguijón,
//    OCHO patas articuladas (fémur, tibia, tarso) con marcha alterna en tetrápodo, DOS pedipalpos con pinzas
//    de dedo móvil que se abren y cierran por separado. La cola se arquea sobre el dorso (`tail` 0…1).
//  · Spider: cefalotórax, abdomen, OCHO patas de 4 artejos con marcha alterna, pedipalpos y quelíceros con
//    colmillos; postura defensiva (`rear`) que alza las patas delanteras. Vista ventral opcional (viuda negra
//    colgada en su tela, con la marca roja del abdomen).
//  · Centipede: cuerpo de segmentos que sigue una trayectoria (cada segmento sigue al anterior), UN par de
//    patas por segmento con onda metacrónica, antenas animadas y forcípulas (primer par de patas modificado).
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const P = (pts: V[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ');

/** Pata de varios artejos: ángulos relativos acumulados desde la base. */
function leg(base: V, dir: number, lens: number[], bends: number[]): V[] {
  const pts = [base];
  let a = dir;
  let p = base;
  lens.forEach((l, i) => {
    a += bends[i];
    p = {x: p.x + Math.cos(a) * l, y: p.y + Math.sin(a) * l};
    pts.push(p);
  });
  return pts;
}

// --------------------------------------------------------------------- ESCORPIÓN
export type ScorpionSpec = {
  size: number; // longitud del prosoma+mesosoma (u)
  body: string;
  dark: string;
  tailColor?: string;
  telson?: string;
  tailThick: number; // grosor relativo de la cola (Androctonus ≈ 1.6)
  tailLen: number; // longitud relativa de la cola
  clawW: number; // anchura de la pinza (delgada ≈ 0.5)
  legLen: number;
  stripes?: boolean; // bandas dorsales (Centruroides)
};
export type ScorpionPose = {t: number; walk: number; tail?: number; clawL?: number; clawR?: number; sting?: number; lift?: number};

export const Scorpion: React.FC<{spec: ScorpionSpec; pose: ScorpionPose; x: number; y: number; scale?: number; angle?: number; tone?: number}> = ({spec, pose, x, y, scale = 1, angle = 0, tone = 0}) => {
  const C = (c: string) => mixColor(c, '#060504', tone * 0.8);
  const S = spec.size;
  const tail = clamp(pose.tail ?? 0.6);
  const ph = pose.walk * Math.PI * 2;
  // cuerpo: prosoma (frente, +x) y mesosoma
  const pros = {x: S * 0.32, y: 0};
  const meso = Array.from({length: 7}, (_, i) => ({x: S * 0.12 - i * S * 0.1, y: 0, w: S * (0.2 - Math.abs(i - 2.5) * 0.012)}));
  // patas: 4 pares, bases a lo largo del prosoma
  const legs: React.ReactNode[] = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let k = 0; k < 4; k++) {
      const group = (k + (side > 0 ? 1 : 0)) % 2; // tetrápodo alterno
      const swing = Math.sin(ph + group * Math.PI);
      const lift = Math.max(0, Math.cos(ph + group * Math.PI)) * 0.25;
      const base = {x: S * (0.36 - k * 0.075), y: side * S * 0.1};
      const dir = side * (Math.PI / 2) + side * (k - 1.5) * 0.42 + swing * 0.22 * side;
      const L = spec.legLen * S * (0.36 + k * 0.035);
      const pts = leg(base, dir, [L * 0.42, L * 0.38, L * 0.3], [side * -0.55 - lift * side, side * 0.85, side * 0.35]);
      legs.push(<path key={`l${side}${k}`} d={P(pts)} stroke={C(spec.dark)} strokeWidth={S * 0.04} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
      legs.push(<path key={`m${side}${k}`} d={P(pts)} stroke={C(spec.body)} strokeWidth={S * 0.026} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
    }
  }
  // pedipalpos con pinzas
  const claw = (side: number, open: number) => {
    const base = {x: S * 0.42, y: side * S * 0.07};
    const pts = leg(base, side * 0.6 - 0.1 * side, [S * 0.22, S * 0.2], [0, -side * 1.15]);
    const end = pts[2];
    const a = Math.atan2(end.y - pts[1].y, end.x - pts[1].x);
    const hw = S * 0.06 * spec.clawW * 2;
    const hand = S * 0.22;
    const op = 0.08 + clamp(open) * 0.45;
    return (
      <g key={`c${side}`}>
        <path d={P(pts)} stroke={C(spec.dark)} strokeWidth={S * 0.05 * (0.6 + spec.clawW * 0.4)} strokeLinecap="round" fill="none" />
        <path d={P(pts)} stroke={C(spec.body)} strokeWidth={S * 0.034 * (0.6 + spec.clawW * 0.4)} strokeLinecap="round" fill="none" />
        <g transform={`translate(${f1(end.x)} ${f1(end.y)}) rotate(${f1((a * 180) / Math.PI)})`}>
          <ellipse cx={hand * 0.45} cy={0} rx={hand * 0.55} ry={hw} fill={C(spec.body)} stroke={C(spec.dark)} strokeWidth={1.5} />
          {/* dedo fijo y dedo móvil */}
          <path d={`M${f1(hand * 0.9)},${f1(-hw * 0.4)} q${f1(hand * 0.4)},${f1(-hw * 0.2)} ${f1(hand * 0.75)},${f1(hw * 0.2)}`} stroke={C(spec.dark)} strokeWidth={hw * 0.55} strokeLinecap="round" fill="none" />
          <g transform={`translate(${f1(hand * 0.9)} ${f1(hw * 0.35)}) rotate(${f1(side * op * 57)})`}>
            <path d={`M0,0 q${f1(hand * 0.4)},${f1(hw * 0.2)} ${f1(hand * 0.72)},${f1(-hw * 0.25)}`} stroke={C(spec.body)} strokeWidth={hw * 0.5} strokeLinecap="round" fill="none" />
          </g>
        </g>
      </g>
    );
  };
  // cola: 5 segmentos que se arquean hacia delante sobre el dorso (en vista superior se acortan y suben)
  const segs: {p: V; w: number}[] = [];
  let a = Math.PI;
  let p = {x: meso[6].x - S * 0.05, y: 0};
  const sl = S * 0.15 * spec.tailLen;
  for (let i = 0; i < 6; i++) {
    const rise = tail * (0.45 + i * 0.52) + (pose.sting ?? 0) * (i > 3 ? 0.5 : 0);
    const fore = Math.cos(Math.min(Math.PI, rise));
    const step = sl * (i === 5 ? 0.9 : 1);
    p = {x: p.x + Math.cos(a) * step * fore, y: p.y - Math.sin(Math.min(Math.PI, rise)) * step * 0.75 + Math.sin(pose.t * 1.3 + i) * 1.5};
    segs.push({p, w: S * 0.055 * spec.tailThick * (1 - i * 0.06)});
    a += Math.sin(pose.t * 0.9) * 0.03;
  }
  const tailC = spec.tailColor ?? spec.body;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale)})`}>
      <ellipse cx={0} cy={S * 0.05} rx={S * 0.55} ry={S * 0.28} fill="#000" opacity={0.18} />
      {legs}
      {/* mesosoma segmentado */}
      <path d={`M${f1(S * 0.2)},${f1(-S * 0.17)} Q${f1(-S * 0.25)},${f1(-S * 0.26)} ${f1(meso[6].x - S * 0.06)},${f1(-S * 0.08)} L${f1(meso[6].x - S * 0.06)},${f1(S * 0.08)} Q${f1(-S * 0.25)},${f1(S * 0.26)} ${f1(S * 0.2)},${f1(S * 0.17)}Z`} fill={C(spec.body)} stroke={C(spec.dark)} strokeWidth={1.6} />
      {meso.slice(0, 6).map((m, i) => <path key={`s${i}`} d={`M${f1(m.x - S * 0.05)},${f1(-m.w * 1.05)} Q${f1(m.x - S * 0.07)},0 ${f1(m.x - S * 0.05)},${f1(m.w * 1.05)}`} stroke={C(spec.dark)} strokeWidth={1.6} fill="none" opacity={0.75} />)}
      <path d={`M${f1(S * 0.15)},0 L${f1(meso[6].x)},0`} stroke={C(spec.dark)} strokeWidth={1.2} opacity={0.4} />
      {spec.stripes && <path d={`M${f1(meso[0].x)},${f1(-S * 0.06)} L${f1(meso[6].x)},${f1(-S * 0.06)} M${f1(meso[0].x)},${f1(S * 0.06)} L${f1(meso[6].x)},${f1(S * 0.06)}`} stroke={C(spec.dark)} strokeWidth={S * 0.03} opacity={0.7} />}
      {/* prosoma con ojos medianos */}
      <path d={`M${f1(pros.x + S * 0.14)},${f1(-S * 0.12)} L${f1(pros.x + S * 0.16)},${f1(S * 0.12)} L${f1(pros.x - S * 0.12)},${f1(S * 0.2)} L${f1(pros.x - S * 0.14)},${f1(-S * 0.2)}Z`} fill={C(spec.body)} stroke={C(spec.dark)} strokeWidth={1.6} />
      <circle cx={pros.x + S * 0.02} cy={-S * 0.02} r={S * 0.018} fill="#0a0806" />
      <circle cx={pros.x + S * 0.02} cy={S * 0.02} r={S * 0.018} fill="#0a0806" />
      {claw(-1, pose.clawL ?? 0.3)}
      {claw(1, pose.clawR ?? 0.3)}
      {/* cola y aguijón (se dibuja encima: está levantada) */}
      {segs.map((sg, i) => {
        const prev = i ? segs[i - 1].p : {x: meso[6].x - S * 0.05, y: 0};
        return i < 5 ? <path key={`t${i}`} d={`M${f1(prev.x)},${f1(prev.y)} L${f1(sg.p.x)},${f1(sg.p.y)}`} stroke={C(i > 2 && spec.tailColor ? tailC : spec.body)} strokeWidth={sg.w * 2} strokeLinecap="round" /> : null;
      })}
      {segs.slice(0, 5).map((sg, i) => <circle key={`k${i}`} cx={sg.p.x} cy={sg.p.y} r={sg.w * 0.95} fill="none" stroke={C(spec.dark)} strokeWidth={1.2} opacity={0.6} />)}
      {(() => {
        const t0 = segs[4].p;
        const t1 = segs[5].p;
        const aa = Math.atan2(t1.y - t0.y, t1.x - t0.x);
        return (
          <g transform={`translate(${f1(t0.x)} ${f1(t0.y)}) rotate(${f1((aa * 180) / Math.PI)})`}>
            <ellipse cx={sl * 0.35} cy={0} rx={sl * 0.4} ry={segs[4].w * 1.05} fill={C(spec.telson ?? tailC)} stroke={C(spec.dark)} strokeWidth={1.4} />
            <path d={`M${f1(sl * 0.7)},${f1(-segs[4].w * 0.4)} Q${f1(sl * 1.05)},${f1(-segs[4].w * 0.6)} ${f1(sl * 1.1)},${f1(segs[4].w * 0.9)}`} stroke={C('#2a1a0e')} strokeWidth={segs[4].w * 0.5} strokeLinecap="round" fill="none" />
          </g>
        );
      })()}
    </g>
  );
};

// --------------------------------------------------------------------- ARAÑA
export type SpiderSpec = {
  size: number; // longitud del cuerpo
  body: string;
  dark: string;
  abdomen: string;
  abdomenR: number; // tamaño relativo del abdomen
  legLen: number;
  hairy?: boolean;
  gloss?: number;
  mark?: 'hourglass' | null;
  bigChelicerae?: boolean;
  legBands?: string;
};
export type SpiderPose = {t: number; walk: number; rear?: number; ventral?: boolean; fangs?: number; twitch?: number};

export const Spider: React.FC<{spec: SpiderSpec; pose: SpiderPose; x: number; y: number; scale?: number; angle?: number; tone?: number}> = ({spec, pose, x, y, scale = 1, angle = 0, tone = 0}) => {
  const C = (c: string) => mixColor(c, '#050404', tone * 0.8);
  const S = spec.size;
  const rear = clamp(pose.rear ?? 0);
  const ph = pose.walk * Math.PI * 2;
  const legs: React.ReactNode[] = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let k = 0; k < 4; k++) {
      const group = (k + (side > 0 ? 1 : 0)) % 2;
      const swing = Math.sin(ph + group * Math.PI);
      const lift = Math.max(0, Math.cos(ph + group * Math.PI));
      const front = k < 2 ? rear * (k === 0 ? 1 : 0.7) : 0;
      const base = {x: S * (0.2 - k * 0.07), y: side * S * 0.08};
      const dir = side * (Math.PI / 2) + side * (k - 1.5) * 0.55 - (k < 2 ? 1 : 0) * side * 0.15 + swing * 0.2 * side - front * side * 0.9;
      const L = S * spec.legLen * (k === 0 || k === 3 ? 1 : 0.88);
      const lens = [L * 0.3, L * 0.34, L * 0.22, L * 0.14].map((l) => l * (1 - front * 0.35));
      const pts = leg(base, dir, lens, [side * -0.5 - lift * 0.12 * side, side * 0.9 - front * side * 0.6, side * 0.25, side * 0.1]);
      const w = S * 0.045 * (1 - front * 0.1);
      legs.push(<path key={`a${side}${k}`} d={P(pts)} stroke={C(spec.dark)} strokeWidth={w * 1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
      legs.push(<path key={`b${side}${k}`} d={P(pts)} stroke={C(spec.body)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
      if (spec.legBands && front > 0.3) pts.slice(1, 4).forEach((q, j) => legs.push(<circle key={`bd${side}${k}${j}`} cx={q.x} cy={q.y} r={w * 0.9} fill={C(spec.legBands!)} />));
      if (spec.hairy) pts.slice(1).forEach((q, j) => legs.push(<path key={`h${side}${k}${j}`} d={`M${f1(q.x)},${f1(q.y)} l${f1(side * 4)},${f1(-5)} M${f1(q.x)},${f1(q.y)} l${f1(-side * 3)},${f1(-6)}`} stroke={C(spec.dark)} strokeWidth={1} opacity={0.7} />));
    }
  }
  const ab = S * 0.34 * spec.abdomenR;
  const gloss = spec.gloss ?? 0.3;
  const fang = clamp(pose.fangs ?? rear);
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((angle * 180) / Math.PI)}) scale(${f1(scale)})`}>
      <ellipse cx={-S * 0.15} cy={S * 0.06} rx={S * 0.6} ry={S * 0.35} fill="#000" opacity={pose.ventral ? 0 : 0.18} />
      {legs}
      {/* abdomen */}
      <ellipse cx={-S * 0.2 - ab * 0.7} cy={0} rx={ab * 1.05} ry={ab * 0.85} fill={C(spec.abdomen)} stroke={C(spec.dark)} strokeWidth={1.5} />
      <ellipse cx={-S * 0.2 - ab * 0.85} cy={-ab * 0.35} rx={ab * 0.45} ry={ab * 0.18} fill="#ffffff" opacity={gloss * (1 - tone)} />
      {pose.ventral && spec.mark === 'hourglass' && (
        <path d={`M${f1(-S * 0.2 - ab * 0.4)},${f1(-ab * 0.28)} L${f1(-S * 0.2 - ab * 0.7)},0 L${f1(-S * 0.2 - ab * 0.4)},${f1(ab * 0.28)} L${f1(-S * 0.2 - ab * 1.0)},${f1(ab * 0.28)} L${f1(-S * 0.2 - ab * 0.7)},0 L${f1(-S * 0.2 - ab * 1.0)},${f1(-ab * 0.28)}Z`} fill="#d81e1e" />
      )}
      {spec.hairy && Array.from({length: 18}, (_, i) => <path key={`ah${i}`} d={`M${f1(-S * 0.2 - ab * 0.7 + (hash1(i) - 0.5) * ab * 1.6)},${f1((hash1(i * 3) - 0.5) * ab * 1.4)} l${f1(-4)},${f1(-3)}`} stroke={C(spec.dark)} strokeWidth={1} />)}
      {/* cefalotórax */}
      <ellipse cx={S * 0.08} cy={0} rx={S * 0.18} ry={S * 0.14} fill={C(spec.body)} stroke={C(spec.dark)} strokeWidth={1.5} />
      <ellipse cx={S * 0.05} cy={-S * 0.05} rx={S * 0.08} ry={S * 0.03} fill="#ffffff" opacity={gloss * 0.6 * (1 - tone)} />
      {/* ojos */}
      {[-1, 1].map((s) => <circle key={`e${s}`} cx={S * 0.22} cy={s * S * 0.03} r={S * 0.018} fill="#050404" />)}
      {/* quelíceros y colmillos */}
      {[-1, 1].map((s) => (
        <g key={`q${s}`}>
          <ellipse cx={S * 0.27} cy={s * S * 0.04} rx={S * (spec.bigChelicerae ? 0.07 : 0.045)} ry={S * (spec.bigChelicerae ? 0.045 : 0.03)} fill={C(spec.body)} stroke={C(spec.dark)} strokeWidth={1.2} />
          {fang > 0.1 && <path d={`M${f1(S * 0.33)},${f1(s * S * 0.04)} q${f1(S * 0.05 * fang)},${f1(s * S * 0.01)} ${f1(S * 0.04 * fang)},${f1(s * -S * 0.04 * fang)}`} stroke="#1a1410" strokeWidth={S * 0.014} strokeLinecap="round" fill="none" />}
        </g>
      ))}
      {/* pedipalpos */}
      {[-1, 1].map((s) => <path key={`p${s}`} d={P(leg({x: S * 0.24, y: s * S * 0.07}, s * 0.5, [S * 0.1, S * 0.08], [0, -s * 0.6 + Math.sin(pose.t * 3 + s) * 0.15]))} stroke={C(spec.body)} strokeWidth={S * 0.03} strokeLinecap="round" fill="none" />)}
    </g>
  );
};

// --------------------------------------------------------------------- CIEMPIÉS
export type CentipedeSpec = {segments: number; segLen: number; width: number; body: string; dark: string; legs: string; head: string};
export type CentipedePose = {t: number; path: (s: number) => V; gait: number};

export const Centipede: React.FC<{spec: CentipedeSpec; pose: CentipedePose; tone?: number}> = ({spec, pose, tone = 0}) => {
  const C = (c: string) => mixColor(c, '#050403', tone * 0.8);
  const n = spec.segments;
  const pts = Array.from({length: n + 1}, (_, i) => pose.path(i * spec.segLen));
  const items: React.ReactNode[] = [];
  // patas (un par por segmento) con onda metacrónica
  pts.slice(1, n).forEach((q, i) => {
    const prev = pts[i];
    const a = Math.atan2(prev.y - q.y, prev.x - q.x);
    for (const side of [-1, 1]) {
      const ph = pose.gait * Math.PI * 2 - i * 0.55 + (side > 0 ? Math.PI : 0);
      const sw = Math.sin(ph) * 0.45;
      const lift = Math.max(0, Math.cos(ph));
      const la = a + side * (Math.PI / 2) + side * 0.25 - sw * side;
      const L1 = spec.width * 1.4;
      const k = {x: q.x + Math.cos(la) * L1, y: q.y + Math.sin(la) * L1 - lift * 2};
      const f = {x: k.x + Math.cos(la + side * 0.6) * L1 * 0.8 - Math.cos(a) * L1 * 0.4, y: k.y + Math.sin(la + side * 0.6) * L1 * 0.8 - Math.sin(a) * L1 * 0.4};
      items.push(<path key={`l${i}${side}`} d={P([q, k, f])} stroke={C(spec.legs)} strokeWidth={spec.width * 0.22} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
    }
  });
  const head = pts[0];
  const ha = Math.atan2(pts[0].y - pts[1].y, pts[0].x - pts[1].x);
  return (
    <g>
      <path d={P(pts)} stroke="#000" strokeWidth={spec.width * 2.4} strokeLinecap="round" fill="none" opacity={0.18} transform="translate(0 8)" />
      {items}
      {/* segmentos (terguitos) */}
      {pts.slice(1).map((q, i) => {
        const p0 = pts[i];
        const a = Math.atan2(p0.y - q.y, p0.x - q.x);
        const m = {x: (p0.x + q.x) / 2, y: (p0.y + q.y) / 2};
        const w = spec.width * (i > n - 3 ? 0.8 : 1);
        return (
          <g key={`s${i}`} transform={`translate(${f1(m.x)} ${f1(m.y)}) rotate(${f1((a * 180) / Math.PI)})`}>
            <rect x={-spec.segLen * 0.55} y={-w} width={spec.segLen * 1.1} height={w * 2} rx={w * 0.5} fill={C(spec.body)} stroke={C(spec.dark)} strokeWidth={1.5} />
            <rect x={-spec.segLen * 0.55} y={-w} width={spec.segLen * 0.25} height={w * 2} rx={w * 0.3} fill={C(spec.dark)} opacity={0.7} />
            <ellipse cx={0} cy={-w * 0.45} rx={spec.segLen * 0.35} ry={w * 0.18} fill="#ffffff" opacity={0.15 * (1 - tone)} />
          </g>
        );
      })}
      {/* patas terminales largas */}
      {[-1, 1].map((s) => {
        const e = pts[n];
        const p = pts[n - 1];
        const a = Math.atan2(e.y - p.y, e.x - p.x);
        return <path key={`u${s}`} d={P([e, {x: e.x + Math.cos(a + s * 0.35) * spec.width * 3, y: e.y + Math.sin(a + s * 0.35) * spec.width * 3}])} stroke={C(spec.legs)} strokeWidth={spec.width * 0.3} strokeLinecap="round" />;
      })}
      {/* cabeza, forcípulas y antenas */}
      <g transform={`translate(${f1(head.x)} ${f1(head.y)}) rotate(${f1((ha * 180) / Math.PI)})`}>
        {[-1, 1].map((s) => <path key={`f${s}`} d={`M${f1(spec.width * 0.3)},${f1(s * spec.width * 0.7)} q${f1(spec.width * 1.2)},${f1(s * spec.width * 0.6)} ${f1(spec.width * 1.4)},${f1(-s * spec.width * 0.2)}`} stroke={C('#2a1208')} strokeWidth={spec.width * 0.32} strokeLinecap="round" fill="none" />)}
        <ellipse cx={spec.width * 0.4} cy={0} rx={spec.width * 1.1} ry={spec.width * 1.05} fill={C(spec.head)} stroke={C(spec.dark)} strokeWidth={1.5} />
        {[-1, 1].map((s) => {
          const w = Math.sin(pose.t * 4 + s) * 0.25;
          return <path key={`a${s}`} d={`M${f1(spec.width * 1.2)},${f1(s * spec.width * 0.4)} q${f1(spec.width * 2)},${f1(s * spec.width * (1 + w))} ${f1(spec.width * 4)},${f1(s * spec.width * (2.4 + w * 2))}`} stroke={C(spec.legs)} strokeWidth={spec.width * 0.16} strokeLinecap="round" fill="none" />;
        })}
      </g>
    </g>
  );
};

export const _l = lerp;
