// Cálculo PURO de la pose del pulpo en el instante t.
// Entrada: tiempo, trayectoria, parámetros de estado, suelo. Salida: geometría.
// No hay estado entre fotogramas: el fotograma 300 se calcula igual sin haber
// calculado el 299, lo que permite renderizar por segmentos y en paralelo.

import {clamp, easeInOut, fbm1, lerp, lerpAngle, noise1, smoothstep, TAU, Vec} from '../../engine/math';
import {OctopusRig} from './rig';
import {StateParams} from './states';

export type MotionSample = {
  x: number; // corona de brazos (mundo)
  y: number;
  rot: number; // rotación del cuerpo (rad)
  scale: number;
  facing: number; // 1 = 3/4 mirando a la derecha, -1 izquierda, 0 de frente
};

export type Gaze = {x: number; y: number} | 'camera' | 'forward';

export type OctopusInput = {
  t: number;
  rig: OctopusRig;
  state: StateParams;
  motion: (t: number) => MotionSample;
  ground?: (x: number) => number; // y del sustrato en x (mundo)
  gaze?: Gaze;
  blinks?: number[]; // instantes de parpadeo adicionales
  segments: number;
  seed?: number;
  /** Brazos dirigidos a un objetivo (manipular objetos, sondear grietas). */
  reach?: {arm: number; target: Vec; weight: number}[];
  /** Instantes de corte de plano: los apoyos de la marcha no se buscan al otro lado. */
  cuts?: number[];
};

export type ArmPose = {
  index: number;
  pts: Vec[];
  widths: number[];
  normals: Vec[];
  z: number; // profundidad (-1 detrás … 1 delante)
  side: number; // lado de las ventosas
};

export type EyePose = {
  local: Vec; // posición en coordenadas del cuerpo
  r: number;
  pupil: Vec; // desplazamiento de la pupila
  pupilScale: number;
  lid: number; // 0 abierto … 1 cerrado
  behind: boolean; // se dibuja por detrás de la cabeza
  visible: number;
};

export type OctopusPose = {
  t: number;
  body: {x: number; y: number; rot: number; scale: number};
  facing: number;
  arms: ArmPose[];
  web: Vec[];
  mantle: {outline: Vec[]; axis: Vec[]; halfW: number[]; dir: number};
  head: {cx: number; cy: number; w: number; h: number};
  eyes: [EyePose, EyePose];
  siphon: {x: number; y: number; ang: number; len: number; open: number; visible: number};
  breathe: number;
  state: StateParams;
  toWorld: (p: Vec) => Vec;
};

const rotV = (p: Vec, a: number): Vec => ({x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a)});

function fabrik(chain: Vec[], lens: number[], target: Vec, iters = 8) {
  const n = chain.length - 1;
  const root = {...chain[0]};
  const pts = chain.map((p) => ({...p}));
  for (let it = 0; it < iters; it++) {
    pts[n] = {...target};
    for (let i = n - 1; i >= 0; i--) {
      const dx = pts[i].x - pts[i + 1].x;
      const dy = pts[i].y - pts[i + 1].y;
      const d = Math.hypot(dx, dy) || 1;
      pts[i] = {x: pts[i + 1].x + (dx / d) * lens[i], y: pts[i + 1].y + (dy / d) * lens[i]};
    }
    pts[0] = root;
    for (let i = 1; i <= n; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      const d = Math.hypot(dx, dy) || 1;
      pts[i] = {x: pts[i - 1].x + (dx / d) * lens[i - 1], y: pts[i - 1].y + (dy / d) * lens[i - 1]};
    }
  }
  return pts;
}

/** Parpadeos: lista explícita + parpadeos pseudoaleatorios deterministas. */
function blinkAmount(t: number, extra: number[] = [], seed = 0) {
  let b = 0;
  const tri = (tb: number) => clamp(1 - Math.abs(t - tb) / 0.1);
  for (const tb of extra) b = Math.max(b, tri(tb));
  const period = 3.6;
  const k = Math.floor(t / period);
  for (let j = k - 1; j <= k + 1; j++) {
    const tb = j * period + 0.6 + ((Math.sin((j + seed) * 91.7) * 43758.5) % 1 + 1) % 1 * 2.2;
    b = Math.max(b, tri(tb));
  }
  return b;
}

export function computeOctopusPose(input: OctopusInput): OctopusPose {
  const {t, rig, state: s, motion, ground, segments: N, seed = 1} = input;
  const m = motion(t);
  const dtv = 1 / 30;
  const mPrev = motion(t - dtv);
  const vx = (m.x - mPrev.x) / dtv;
  const sc = m.scale;
  const facing = clamp(m.facing, -1, 1);
  const fs = facing >= 0 ? 1 : -1;
  const fa = Math.abs(facing);

  // ---- Cuerpo ---------------------------------------------------------------
  const gaitBob = Math.sin((t / rig.gaitPeriod) * TAU * 2) * s.bob * s.gait;
  const idleBob = Math.sin(t * 1.3 + seed) * s.bob * (1 - s.gait);
  const crown = {x: m.x, y: m.y + gaitBob + idleBob};
  const lean = clamp(vx * 0.0009, -0.16, 0.16) * (1 - s.streamline);
  const rot = m.rot + lean + fbm1(t * 0.3, seed + 4) * 0.03;
  const toWorld = (p: Vec): Vec => {
    const r = rotV({x: p.x * sc, y: p.y * sc}, rot);
    return {x: crown.x + r.x, y: crown.y + r.y};
  };
  const breathe = Math.sin(t * TAU * s.breathRate);

  // ---- Brazos ---------------------------------------------------------------
  const L = rig.armLength * sc * (0.7 + 0.3 * s.reach);
  const segLen = L / N;
  const arms: ArmPose[] = [];
  // orientación del manto (local); en natación el manto va delante y los brazos detrás
  const sway = Math.sin(t * 0.5 + seed) * 0.05 + fbm1(t * 0.4, seed + 9) * 0.04;
  const dir = -Math.PI / 2 - 0.95 * facing * (1 - s.streamline * 0.2) + sway;
  const contactY = (x: number, z: number) => (ground ? ground(x) : crown.y + 1e4) + z * 16 * sc;

  for (let i = 0; i < 8; i++) {
    const alpha = ((i + 0.5) / 8) * TAU;
    const z = Math.sin(alpha);
    const cx = Math.cos(alpha);
    const side = cx >= 0 ? 1 : -1;
    const flat = 1 - s.flatten * 0.35;
    const baseLocal = {x: cx * rig.crownRx * (0.6 + 0.4 * s.spread), y: z * rig.crownRy - 6};
    const base = toWorld(baseLocal);
    // dirección de reposo proyectada desde el plano del suelo
    let phi = Math.atan2(z * rig.tilt + rig.drop * flat * (1 - 0.85 * s.gait), cx);
    phi = lerpAngle(Math.PI / 2, phi, clamp(s.spread, 0, 1.2));
    phi += rot * 0.6;
    // natación: brazos alineados detrás del manto
    const trail = dir + rot + Math.PI + z * 0.12 + cx * 0.18;
    phi = lerpAngle(phi, trail, s.streamline);

    const ph = i * 1.37 + seed;
    const ext = 1 + 0.06 * Math.sin(t * 0.7 + i * 2.1) * s.armAmp;
    // --- pose libre (onda de curvatura viajera + ruido individual) ---
    const wave: Vec[] = [base];
    const ang: number[] = [];
    let th = phi;
    let px = base.x;
    let py = base.y;
    for (let k = 1; k <= N; k++) {
      const u = k / N;
      const kappa =
        s.armAmp * Math.sin(TAU * s.armFreq * t - TAU * s.armWaveK * u + ph) * (0.35 + u * 1.1) +
        noise1(t * 0.45 + u * 1.7 + i * 3.3, seed + i) * s.armAmp * 0.7 -
        side * s.curl * Math.pow(u, 3) * 5.5;
      th += (kappa * 2.2) / N;
      th = lerpAngle(th, Math.PI / 2, s.droop * u * 0.12);
      ang.push(th);
      px += Math.cos(th) * segLen * ext;
      py += Math.sin(th) * segLen * ext;
      wave.push({x: px, y: py});
    }

    let pts = wave;
    // --- sistema de pasos: apoyos plantados en el sustrato ---
    if (s.gait > 0.001 && ground) {
      const T = rig.gaitPeriod;
      const duty = rig.gaitDuty;
      const off = rig.gaitOffsets[i % rig.gaitOffsets.length];
      const c = t / T + off;
      const n = Math.floor(c);
      const f = c - n;
      const reach = rig.armLength * sc * rig.footReach;
      const plant = (cycle: number) => {
        let tp = (cycle + duty * 0.5 - off) * T;
        for (const cut of input.cuts ?? []) {
          if (tp < cut && t >= cut) tp = cut;
          else if (tp >= cut && t < cut) tp = cut - 0.001;
        }
        const mp = motion(tp);
        const fx = mp.x + cx * reach * (0.85 + 0.15 * Math.abs(cx));
        return {x: fx, y: contactY(fx, z)};
      };
      const p0 = plant(n);
      let target: Vec;
      if (f < duty) {
        target = p0;
      } else {
        const p1 = plant(n + 1);
        const u = easeInOut((f - duty) / (1 - duty));
        const stride = Math.min(1, Math.abs(p1.x - p0.x) / (reach * 0.25 + 1));
        target = {x: lerp(p0.x, p1.x, u), y: lerp(p0.y, p1.y, u) - Math.sin(Math.PI * u) * rig.stepLift * sc * stride};
      }
      const kIK = Math.round(N * 0.6);
      const sub = fabrik(wave.slice(0, kIK + 1), new Array(kIK).fill(segLen * ext), target, 7);
      // parte distal: conserva la curvatura relativa de la pose libre
      const angIK = Math.atan2(sub[kIK].y - sub[kIK - 1].y, sub[kIK].x - sub[kIK - 1].x);
      const delta = angIK - ang[kIK - 1];
      const full = [...sub];
      let qx = sub[kIK].x;
      let qy = sub[kIK].y;
      for (let k = kIK + 1; k <= N; k++) {
        const a2 = ang[k - 1] + delta;
        qx += Math.cos(a2) * segLen * ext;
        qy += Math.sin(a2) * segLen * ext;
        full.push({x: qx, y: qy});
      }
      const g = clamp(s.gait);
      pts = wave.map((p, k) => ({x: lerp(p.x, full[k].x, g), y: lerp(p.y, full[k].y, g)}));
    }

    // --- brazo dirigido a un objetivo (IK de toda la cadena) ---
    const rc = input.reach?.find((r) => r.arm === i);
    if (rc && rc.weight > 0.001) {
      const ik = fabrik(pts, new Array(N).fill(segLen * ext), rc.target, 10);
      const w = clamp(rc.weight);
      pts = pts.map((p, k) => ({x: lerp(p.x, ik[k].x, w), y: lerp(p.y, ik[k].y, w)}));
    }

    // --- anchos y contacto con el sustrato ---
    const depthScale = 1 + z * 0.07;
    const widths = pts.map((_, k) => {
      const u = k / N;
      return (rig.armBaseWidth * Math.pow(1 - u, 0.9) + rig.armTipWidth) * sc * depthScale * (1 + 0.08 * (1 - s.reach));
    });
    if (ground) {
      pts = pts.map((p, k) => {
        if (k === 0) return p;
        const gy = contactY(p.x, z) - widths[k] * 0.55;
        return p.y > gy ? {x: p.x, y: gy} : p;
      });
    }
    const normals = pts.map((p, k) => {
      const a = pts[Math.max(0, k - 1)];
      const b = pts[Math.min(N, k + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      return {x: (-dy / d) * side, y: (dx / d) * side};
    });
    arms.push({index: i, pts, widths, normals, z, side});
  }

  // membrana interbraquial: une la base de los brazos (en orden angular)
  const webU = Math.max(2, Math.round(N * 0.17));
  const web = arms.map((a) => a.pts[webU]);

  // ---- Manto -----------------------------------------------------------------
  const flatK = 1 - s.flatten * 0.3;
  const neck = {x: -16 * facing, y: -rig.headOffsetY * flatK - 26};
  const Lm = rig.mantleLength * (1 + breathe * s.breath * 0.4) * (1 - s.flatten * 0.15);
  const Wm = rig.mantleWidth * (1 + breathe * s.breath) * (1 + s.flatten * 0.12);
  const bend = Math.sin(t * 0.6 + seed) * 0.08 + facing * 0.1;
  const axis: Vec[] = [];
  const halfW: number[] = [];
  const leftE: Vec[] = [];
  const rightE: Vec[] = [];
  const M = 14;
  const ux = Math.cos(dir);
  const uy = Math.sin(dir);
  for (let k = 0; k <= M; k++) {
    const u = k / M;
    const off = Math.sin(Math.PI * u) * bend * Lm;
    const c = {x: neck.x + ux * u * Lm - uy * off, y: neck.y + uy * u * Lm + ux * off};
    const hw = Wm * Math.pow(Math.max(0, Math.sin(Math.PI * (0.16 + 0.84 * u))), 0.62);
    axis.push(c);
    halfW.push(hw);
    leftE.push({x: c.x - uy * hw * 1.06, y: c.y + ux * hw * 1.06});
    rightE.push({x: c.x + uy * hw * 0.94, y: c.y - ux * hw * 0.94});
  }
  const outline = [...leftE, ...rightE.slice(0, -1).reverse()];

  // ---- Cabeza y ojos -----------------------------------------------------------
  const head = {cx: 10 * facing, cy: -rig.headOffsetY * flatK, w: rig.headW * (1 - 0.08 * fa), h: rig.headH};
  const eyeY = head.cy - head.h * 0.42;
  const nearLocal = {x: lerp(-head.w * 0.62, head.w * 0.42 * fs, fa), y: lerp(eyeY + 4, eyeY, fa)};
  const farLocal = {x: lerp(head.w * 0.62, head.w * 0.9 * fs, fa), y: lerp(eyeY + 4, eyeY - 6, fa)};
  // frontal: los ojos quedan a izquierda y derecha; de 3/4 el lejano se oculta tras la cabeza
  const nearEye = facing >= 0 ? nearLocal : {x: -nearLocal.x, y: nearLocal.y};
  const farEye = facing >= 0 ? farLocal : {x: -farLocal.x, y: farLocal.y};
  const blink = blinkAmount(t, input.blinks, seed);
  const lid = clamp(Math.max(1 - s.eyeOpen - s.alert * 0.15, blink));
  const pupilScale = lerp(0.75, 1.35, s.pupil) * (1 - s.alert * 0.12);
  const gaze = input.gaze ?? 'forward';
  const pupilFor = (eyeLocal: Vec): Vec => {
    const maxOff = rig.eyeRadius * 0.28;
    if (gaze === 'camera') return {x: 0, y: 1};
    if (gaze === 'forward') return {x: maxOff * 0.7 * (fa > 0.2 ? fs : 0), y: 0};
    const ew = toWorld(eyeLocal);
    const dx = gaze.x - ew.x;
    const dy = gaze.y - ew.y;
    const d = Math.hypot(dx, dy) || 1;
    const k = maxOff * smoothstep(0, 220, d);
    return {x: (dx / d) * k, y: (dy / d) * k * 0.7};
  };
  const eyes: [EyePose, EyePose] = [
    {local: nearEye, r: rig.eyeRadius, pupil: pupilFor(nearEye), pupilScale, lid, behind: false, visible: 1},
    {
      local: farEye,
      r: rig.eyeRadius * lerp(1, 0.62, fa),
      pupil: pupilFor(farEye),
      pupilScale,
      lid,
      behind: fa > 0.55,
      visible: lerp(1, 0.85, fa),
    },
  ];

  // ---- Sifón -----------------------------------------------------------------------
  const siphon = {
    x: lerp(0, head.w * 0.55 * fs, fa),
    y: head.cy + head.h * 0.45,
    ang: lerp(Math.PI / 2, fs > 0 ? 0.55 : Math.PI - 0.55, fa),
    len: 26 * (1 + breathe * s.breath * 2),
    open: 0.5 + 0.5 * breathe,
    visible: smoothstep(0.25, 0.6, fa),
  };

  return {
    t,
    body: {x: crown.x, y: crown.y, rot, scale: sc},
    facing,
    arms,
    web,
    mantle: {outline, axis, halfW, dir},
    head,
    eyes,
    siphon,
    breathe,
    state: s,
    toWorld,
  };
}
