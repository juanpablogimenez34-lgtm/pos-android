// ESTADOS DE LOBI: IDLE, WALK, RUN, JUMP, SPIN, PLAY_BOW, DANCE, LAUGH, LOOK_UP, TIRED, YAWN,
// LIE_DOWN y SLEEP. Cada estado devuelve una pose parcial; las patas usan objetivos en el suelo
// (contactos reales: en apoyo la pata queda fija respecto al suelo mientras el cuerpo avanza).
// Ninguna pata atraviesa el suelo (y ≤ 0) y las cuatro tienen fases distintas.
import {clamp, easeInOut, lerp} from '../../../engine/math';
import {LobiPose, PAW0} from '../Characters/Lobi';
import {Face, FACE} from '../Rigging/face';
import {V, Vec} from '../Rigging/core';

export type LP = Partial<LobiPose>;
type PawKey = 'FN' | 'FF' | 'HN' | 'HF';
const KEYS: PawKey[] = ['FN', 'FF', 'HN', 'HF'];

export const blink = (t: number, seed = 0) => {
  const per = 3.1 + (seed % 5) * 0.35;
  const ph = (t + seed * 0.91) % per;
  return ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0;
};
export const face = (t: number, o: Partial<Face> = {}, seed = 0): Face => ({...FACE, blink: o.mode && o.mode !== 'normal' ? 0 : blink(t, seed), ...o});

/** Animación secundaria común: respiración, orejas que tiemblan, cola que se mueve. */
export function secondary(t: number, energy = 0.5): LP {
  const twitch = Math.max(0, Math.sin(t * 0.9) - 0.93) * 12;
  return {
    breathe: 0.5 + 0.5 * Math.sin(t * (2.2 + energy)),
    ears: {near: {a: 0.05 * Math.sin(t * 1.7) + twitch * 0.1, fold: 0.05 * Math.sin(t * 2.3)}, far: {a: 0.05 * Math.sin(t * 1.9 + 1), fold: 0.04 * Math.sin(t * 2.1)}},
    tail: {lift: 0.1 + 0.25 * energy, wag: Math.sin(t * (3 + 6 * energy)) * (0.3 + 0.7 * energy), curl: 0.3},
  };
}

const pawsAt = (o: Partial<Record<PawKey, Vec>>): LobiPose['paws'] => ({FN: o.FN ?? PAW0.FN, FF: o.FF ?? PAW0.FF, HN: o.HN ?? PAW0.HN, HF: o.HF ?? PAW0.HF});

// ---------------------------------------------------------------- IDLE
export function idle(t: number, mood: Partial<Face> = {}): LP {
  return {
    ...secondary(t, 0.35),
    head: {pitch: 0.05 * Math.sin(t * 0.7), tilt: 0.06 * Math.sin(t * 0.5 + 1), turn: 0.15 * Math.sin(t * 0.4)},
    face: face(t, {look: {x: 0.4 * Math.sin(t * 0.6), y: 0.1}, ...mood}),
    paws: pawsAt({}),
  };
}

// ---------------------------------------------------------------- MARCHA Y CARRERA
type Gait = {period: number; duty: number; stride: number; lift: number; off: Record<PawKey, number>};
export const WALK: Gait = {period: 0.9, duty: 0.64, stride: 46, lift: 16, off: {HN: 0, FN: 0.25, HF: 0.5, FF: 0.75}};
export const RUN: Gait = {period: 0.42, duty: 0.34, stride: 96, lift: 30, off: {HN: 0, HF: 0.09, FN: 0.47, FF: 0.56}};
/** Avance en el mundo por cada ciclo (las patas en apoyo quedan fijas). */
export const advance = (g: Gait) => g.stride / g.duty;

function pawCycle(g: Gait, k: PawKey, cyc: number): Vec {
  const ph = (((cyc + g.off[k]) % 1) + 1) % 1;
  const base = PAW0[k];
  if (ph < g.duty) return V(base.x + g.stride * (0.5 - ph / g.duty), 0);
  const u = (ph - g.duty) / (1 - g.duty);
  const e = easeInOut(u);
  const front = k[0] === 'F';
  // arco natural: las delanteras se elevan y avanzan; las traseras se pliegan hacia atrás
  return V(base.x + g.stride * (-0.5 + e) + (front ? 8 : -6) * Math.sin(u * Math.PI), -g.lift * Math.sin(u * Math.PI) * (front ? 1 : 0.85));
}

/** WALK: `cyc` = ciclos recorridos (tiempo / periodo). */
export function walk(t: number, cyc: number, mood: Partial<Face> = {}): LP {
  const paws = pawsAt(Object.fromEntries(KEYS.map((k) => [k, pawCycle(WALK, k, cyc)])) as Record<PawKey, Vec>);
  const ph = cyc * Math.PI * 4;
  return {
    ...secondary(t, 0.55),
    paws,
    bodyY: 2 + 2.5 * Math.cos(ph),
    pitch: 0.02 * Math.sin(ph),
    head: {pitch: 0.04 * Math.sin(ph + 0.6), tilt: 0.03 * Math.sin(cyc * Math.PI * 2), turn: 0.1},
    tail: {lift: 0.3, wag: Math.sin(cyc * Math.PI * 2 - 0.8) * 0.6, curl: 0.35},
    face: face(t, {mode: 'normal', smile: 0.8, ...mood}),
  };
}

/** RUN: galope con impulso (traseras), suspensión (todas en el aire) y aterrizaje (delanteras). */
export function run(t: number, cyc: number, mood: Partial<Face> = {}): LP {
  const paws = pawsAt(Object.fromEntries(KEYS.map((k) => [k, pawCycle(RUN, k, cyc)])) as Record<PawKey, Vec>);
  const ph = ((cyc % 1) + 1) % 1;
  // suspensión entre ~0.65 y 0.95 (después del apoyo delantero)
  const susp = ph > 0.66 && ph < 0.98 ? Math.sin(((ph - 0.66) / 0.32) * Math.PI) : 0;
  const lift = susp * 26;
  Object.keys(paws).forEach((k) => {
    const v = paws[k as PawKey];
    paws[k as PawKey] = V(v.x, Math.min(0, v.y - (v.y < 0 ? lift : 0)));
  });
  const gather = Math.sin(ph * Math.PI * 2);
  return {
    ...secondary(t, 1),
    paws,
    bodyY: -lift + 4 * Math.cos(ph * Math.PI * 2) + 4,
    stretch: 0.11 * gather,
    pitch: -0.1 * Math.cos(ph * Math.PI * 2),
    head: {pitch: 0.08 * Math.sin(ph * Math.PI * 2 + 1), tilt: 0, turn: 0.1},
    ears: {near: {a: 0.45, fold: 0.15}, far: {a: 0.45, fold: 0.12}},
    tail: {lift: -0.15 + 0.15 * Math.sin(ph * Math.PI * 2), wag: 0.3 * Math.sin(ph * Math.PI * 2 - 1.2), curl: 0.1},
    face: face(t, {mode: 'normal', jaw: 0.35, smile: 1, ...mood}),
  };
}

// ---------------------------------------------------------------- SALTO (u: 0…1 en `dur`)
/** Devuelve la pose y el avance horizontal relativo (0…1). Altura máxima `h`. */
export function jump(t: number, u: number, h = 120): LP & {travel: number} {
  const crouchK = u < 0.24 ? easeInOut(u / 0.24) : u < 0.32 ? 1 - (u - 0.24) / 0.08 : 0;
  const fl = clamp((u - 0.3) / 0.52); // vuelo
  const air = fl > 0 && fl < 1 ? Math.sin(fl * Math.PI) : 0;
  const landK = u > 0.82 ? Math.sin(clamp((u - 0.82) / 0.18) * Math.PI) : 0;
  const y = -h * air;
  const paws: LobiPose['paws'] = {...PAW0};
  if (u < 0.3) {
    // flexión previa: patas fijas, cuerpo baja
  } else if (u < 0.82) {
    const k = fl;
    paws.FN = V(lerp(70, 92, k), y + lerp(-46, -10, k * k));
    paws.FF = V(lerp(58, 80, k), y + lerp(-52, -14, k * k));
    paws.HN = V(lerp(-96, -56, k * k), y + lerp(-10, -36, k));
    paws.HF = V(lerp(-110, -70, k * k), y + lerp(-6, -32, k));
  } else {
    paws.FN = V(64, 0);
    paws.FF = V(48, 0);
    paws.HN = V(-44, Math.min(0, -18 * (1 - clamp((u - 0.82) / 0.1))));
    paws.HF = V(-60, Math.min(0, -16 * (1 - clamp((u - 0.84) / 0.1))));
  }
  return {
    ...secondary(t, 0.9),
    paws,
    bodyY: 22 * crouchK + 18 * landK + y,
    pitch: u < 0.3 ? 0.12 * crouchK : u < 0.82 ? lerp(-0.28, 0.24, fl) : 0.12 * landK,
    stretch: u < 0.3 ? -0.1 * crouchK : u < 0.82 ? 0.14 * Math.sin(fl * Math.PI) : -0.08 * landK,
    head: {pitch: u < 0.3 ? 0.2 * crouchK : lerp(-0.25, 0.1, fl), tilt: 0, turn: 0.1},
    ears: {near: {a: u > 0.3 && u < 0.82 ? 0.6 : 0.1, fold: 0.2}, far: {a: u > 0.3 && u < 0.82 ? 0.6 : 0.1, fold: 0.15}},
    tail: {lift: u > 0.3 && u < 0.82 ? 0.5 : 0.2, wag: 0.4 * Math.sin(t * 10), curl: 0.2},
    face: face(t, u < 0.3 ? {mode: 'half', browL: -0.5, browR: -0.5, smile: 0.4} : u < 0.82 ? {mode: 'wide', jaw: 0.5, smile: 1, sparkle: 0.6} : {mode: 'happy', jaw: 0.3, smile: 1}),
    travel: u < 0.3 ? 0 : u < 0.82 ? easeInOut(fl) : 1,
  };
}

// ---------------------------------------------------------------- GIRO (u: 0…1)
export function spin(t: number, u: number): LP {
  const ant = u < 0.18 ? Math.sin((u / 0.18) * Math.PI * 0.5) : 0;
  const k = clamp((u - 0.18) / 0.62);
  const yaw = easeInOut(k) * Math.PI * 2 + (u < 0.18 ? -0.25 * ant : 0);
  const hop = Math.sin(k * Math.PI) * 34;
  const rec = u > 0.8 ? Math.sin(((u - 0.8) / 0.2) * Math.PI) : 0;
  const pawUp = k > 0 && k < 1 ? hop : 0;
  return {
    ...secondary(t, 0.9),
    yaw,
    bodyY: 14 * ant - hop + 10 * rec,
    paws: {FN: V(PAW0.FN.x, -pawUp - 10 * Math.sin(k * Math.PI)), FF: V(PAW0.FF.x, -pawUp), HN: V(PAW0.HN.x, -pawUp * 0.6), HF: V(PAW0.HF.x, -pawUp * 0.6)},
    head: {pitch: -0.1 * Math.sin(k * Math.PI), tilt: 0.1 * Math.sin(k * Math.PI * 2), turn: 0},
    tail: {lift: 0.6, wag: Math.sin(t * 14), curl: 0.6 * Math.sin(k * Math.PI)},
    ears: {near: {a: 0.3 * Math.sin(k * Math.PI), fold: 0.2}, far: {a: 0.3 * Math.sin(k * Math.PI), fold: 0.2}},
    face: face(t, k > 0 && k < 1 ? {mode: 'happy', jaw: 0.4, smile: 1, cheeks: 1} : {mode: 'normal', smile: 0.9}),
  };
}

// ---------------------------------------------------------------- POSTURA JUGUETONA
export function playBow(t: number, k = 1): LP {
  const e = easeInOut(clamp(k));
  return {
    ...secondary(t, 1),
    paws: {FN: V(lerp(PAW0.FN.x, 96, e), 0), FF: V(lerp(PAW0.FF.x, 82, e), 0), HN: PAW0.HN, HF: PAW0.HF},
    pitch: 0.32 * e,
    bodyY: 6 * e,
    head: {pitch: -0.42 * e, tilt: 0.12 * Math.sin(t * 5) * e, turn: 0.3 * e},
    ears: {near: {a: -0.15 * e, fold: 0}, far: {a: -0.15 * e, fold: 0}},
    tail: {lift: 0.7 * e + 0.2, wag: Math.sin(t * 16) * (0.4 + 0.6 * e), curl: 0.3},
    face: face(t, {mode: e > 0.5 ? 'wide' : 'normal', jaw: 0.4 * e, smile: 1, sparkle: 0.8 * e, browL: 0.6 * e, browR: 0.6 * e}),
  };
}

// ---------------------------------------------------------------- RISA
export function laugh(t: number, k = 1): LP {
  const j = 0.45 + 0.3 * Math.abs(Math.sin(t * 9));
  return {
    ...secondary(t, 1),
    head: {pitch: -0.15 * k + 0.05 * Math.sin(t * 9), tilt: 0.12 * Math.sin(t * 4.5) * k, turn: 0.35 * k},
    bodyY: 3 * Math.abs(Math.sin(t * 9)),
    ears: {near: {a: 0.25 * k, fold: 0.1}, far: {a: 0.25 * k, fold: 0.1}},
    tail: {lift: 0.6, wag: Math.sin(t * 18), curl: 0.3},
    face: face(t, {mode: 'happy', jaw: j * k, smile: 1, cheeks: 1, sparkle: 1}),
    paws: {...PAW0, FN: V(PAW0.FN.x + 4, -Math.max(0, Math.sin(t * 4.5)) * 10 * k)},
  };
}

// ---------------------------------------------------------------- MIRAR ARRIBA
export function lookUp(t: number, k = 1): LP {
  const e = easeInOut(clamp(k));
  return {
    ...secondary(t, 0.3),
    head: {pitch: -0.62 * e, tilt: 0.08 * Math.sin(t * 0.8) * e, turn: 0.25 * e},
    pitch: -0.06 * e,
    ears: {near: {a: 0.1, fold: 0}, far: {a: 0.1, fold: 0}},
    face: face(t, {look: {x: 0.3, y: -1 * e}, mode: 'wide', jaw: 0.15 * e, smile: 0.7, sparkle: e}),
  };
}

// ---------------------------------------------------------------- CANSANCIO, BOSTEZO Y SUEÑO
export function tired(t: number, k = 1): LP {
  const e = easeInOut(clamp(k));
  return {
    breathe: 0.5 + 0.5 * Math.sin(t * 1.4),
    bodyY: 10 * e,
    pitch: 0.06 * e,
    head: {pitch: 0.3 * e + 0.04 * Math.sin(t * 0.7), tilt: 0.08 * e, turn: 0},
    ears: {near: {a: 0.55 * e, fold: 0.4 * e}, far: {a: 0.55 * e, fold: 0.35 * e}},
    tail: {lift: -0.45 * e, wag: 0.1 * Math.sin(t * 1.5), curl: 0.1},
    face: face(t, {mode: e > 0.4 ? 'half' : 'normal', smile: 0.4, look: {x: 0, y: 0.4}}, 3),
    paws: {...PAW0},
  };
}
/** Bostezo: u 0…1 (abre la boca, cierra los ojos, estira el cuello). */
export function yawn(t: number, u: number): LP {
  const k = Math.sin(clamp(u) * Math.PI);
  return {
    ...tired(t, 1),
    head: {pitch: -0.35 * k + 0.25 * (1 - k), tilt: 0.12 * k, turn: 0.2},
    face: face(t, {mode: k > 0.3 ? 'closed' : 'half', jaw: 1.0 * k, smile: 0.2}),
    ears: {near: {a: 0.7 * k + 0.3, fold: 0.2}, far: {a: 0.7 * k + 0.3, fold: 0.2}},
    stretch: 0.06 * k,
  };
}
/** Se acuesta: u 0…1 (las patas quedan en el suelo y se pliegan; a partir de 0,6 se enrosca). */
export function lieDown(t: number, u: number): LP {
  const e = easeInOut(clamp(u / 0.6));
  return {...tired(t, 1), bodyY: 10 + 52 * e, pitch: 0.05, head: {pitch: 0.45 * e, tilt: 0.1, turn: 0}, lie: u >= 0.6 ? 1 : 0, face: face(t, {mode: e > 0.6 ? 'closed' : 'half', smile: 0.4})};
}
export function sleep(t: number): LP {
  return {lie: 1, breathe: 0.5 + 0.5 * Math.sin(t * 1.6), face: face(t, {mode: 'closed', smile: 0.5}), ears: {near: {a: 0.05 * Math.sin(t * 0.5), fold: 0}, far: {a: 0, fold: 0}}};
}

// ---------------------------------------------------------------- BAILE (ocho tiempos)
/** Coreografía de 8 tiempos del estribillo. `beat` = pulso dentro de la frase (0…8, decimal). */
export function dance8(t: number, beat: number): LP & {dx: number} {
  const b = ((beat % 8) + 8) % 8;
  const i = Math.floor(b);
  const ph = b - i;
  const hit = Math.exp(-ph * 6);
  const e = easeInOut(ph);
  const base: LP = {...secondary(t, 1), face: face(t, {mode: 'happy', jaw: 0.3, smile: 1, cheeks: 0.8})};
  const still = {...PAW0};
  switch (i) {
    case 0: {
      // PASO 1: patas delanteras alternas (dos golpes dentro del pulso)
      const half = ph < 0.5 ? 0 : 1;
      const u = (ph % 0.5) / 0.5;
      return {...base, dx: 0, paws: {...still, FN: V(PAW0.FN.x + 6, -26 * Math.sin(u * Math.PI) * (half === 0 ? 1 : 0)), FF: V(PAW0.FF.x + 6, -26 * Math.sin(u * Math.PI) * (half === 1 ? 1 : 0))}, bodyY: -4 * hit, head: {pitch: -0.1, tilt: (half === 0 ? 0.12 : -0.12) * Math.sin(u * Math.PI), turn: 0.3}};
    }
    case 1: // PASO 2: desplaza el cuerpo a la derecha
      return {...base, dx: 40 * e, pitch: -0.05, bodyY: 4 * Math.sin(ph * Math.PI), paws: {...still, FN: V(PAW0.FN.x + 10 * Math.sin(ph * Math.PI), -8 * Math.sin(ph * Math.PI))}, head: {pitch: 0, tilt: 0.15 * e, turn: 0.3}};
    case 2: // PASO 3: a la izquierda
      return {...base, dx: 40 - 80 * e, pitch: 0.05, bodyY: 4 * Math.sin(ph * Math.PI), paws: {...still, HN: V(PAW0.HN.x - 10 * Math.sin(ph * Math.PI), -8 * Math.sin(ph * Math.PI))}, head: {pitch: 0, tilt: 0.15 - 0.3 * e, turn: 0.3}};
    case 3: {
      // PASO 4: pequeño salto (con flexión previa)
      const h = ph < 0.15 ? 0 : Math.sin(((ph - 0.15) / 0.85) * Math.PI) * 42;
      return {...base, dx: -40 + 40 * e, bodyY: -h + (ph < 0.15 ? 12 * Math.sin((ph / 0.15) * Math.PI) : 0), paws: {FN: V(PAW0.FN.x + 8, -h), FF: V(PAW0.FF.x + 8, -h), HN: V(PAW0.HN.x, -h * 0.7), HF: V(PAW0.HF.x, -h * 0.7)}, head: {pitch: -0.15, tilt: 0, turn: 0.3}};
    }
    case 4: // PASO 5: mueve la cola
      return {...base, dx: 0, tail: {lift: 0.8, wag: Math.sin(ph * Math.PI * 6), curl: 0.4}, pitch: 0.04 * Math.sin(ph * Math.PI * 6), head: {pitch: 0, tilt: 0, turn: 0.2}, paws: still};
    case 5: // PASO 6: gira la cabeza (hacia la cámara y vuelve)
      return {...base, dx: 0, head: {pitch: -0.1, tilt: 0.3 * Math.sin(ph * Math.PI * 2), turn: 1 * Math.sin(ph * Math.PI)}, paws: still};
    case 6: // PASO 7: vuelta completa
      return {...base, ...spin(t, ph), dx: 0};
    default: // PASO 8: postura alegre final
      return {...base, ...playBow(t, Math.min(1, ph * 2.5)), dx: 0};
  }
}
