// ESCENAS 7 y 8 (90–120 s) · EL NUDO.
//  7: cubierto de grumos de su propia mucosidad, el mixino curva la cola y la pasa por un lazo: el
//     nudo (proyección de un nudo trébol, con cruces por encima y por debajo) se forma y se aprieta.
//  8: el cuerpo se desliza hacia atrás a través del nudo, de modo que el nudo recorre el cuerpo hacia
//     la cabeza y arrastra los grumos de mucosidad, que se desprenden al final; el nudo se deshace.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {SlimeCloud, SlimeDefs} from '../character/Slime';
import {Callout, seg, Vignette, win} from '../components/common';
import {EV, HAG} from '../data/timeline';
import {DeepBack, DeepFront} from '../environment/Deep';
import {bodyOnPath, knotPath, Spine} from '../motion/path';

const f1 = (n: number) => n.toFixed(1);
const KC = {x: 0, y: 330};
const ROT = 0.35;
const LEAD = 1000;

/** Estado del nudo en el tiempo t: tamaño k y posición de la cabeza en la trayectoria. */
function knotState(t: number) {
  const k = t < EV.knotStart ? 0.02 : t < EV.unknot ? 0.02 + 0.98 * seg(t, EV.knotStart, EV.knotDone) : 1 - seg(t, EV.unknot, EV.unknot + 1.6) * 0.98;
  const kp = knotPath(KC.x, KC.y, HAG.knotScale, k, ROT, LEAD, HAG.knotR);
  const L = HAG.knotLen;
  const s0 = kp.a + L - 40; // nudo junto a la cola
  const s1 = kp.b + 90; // nudo junto a la cabeza
  const slide = seg(t, EV.slideStart, EV.slideEnd);
  let sHead = s0 + (s1 - s0) * slide;
  if (t > EV.unknot) sHead = s1 + (t - EV.unknot) * 0; // sigue igual mientras se deshace
  if (t > EV.unknot + 1.6) sHead += (t - EV.unknot - 1.6) * 260; // se aleja nadando
  // onda suave del cuerpo fuera del nudo
  return {kp, sHead, k, slide};
}

/** Grumos de mucosidad pegados al cuerpo (fracciones de cuerpo); el nudo los empuja hacia la cabeza. */
const CLUMPS = Array.from({length: 9}, (_, i) => ({u: 0.05 + i * 0.035 + hash1(i) * 0.015, r: 10 + hash1(i * 3) * 10}));

export function knotWorld(t: number) {
  const st = knotState(t);
  const L = HAG.knotLen;
  const sp: Spine = bodyOnPath(st.kp.path, st.sHead, L, HAG.knotN, {amp: 5, waves: 1, phase: t * 3});
  // frente del nudo (hacia la cabeza), en fracción de cuerpo
  const front = clamp((st.sHead - st.kp.b) / L);
  return {sp, st, front};
}

export const KnotScene: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const {sp, front} = knotWorld(t);
  const released = t > EV.unknot + 0.4;
  return (
    <DeepBack cam={c} t={t}>
      <SlimeDefs />
      <Hagfish uid="hk" spine={sp} look={{t, width: HAG.knotW, shadow: 12, barbels: 0.7, slimeCoat: 0.8}} />
      {/* grumos pegados: los que alcanza el nudo se acumulan en su frente */}
      {!released &&
        CLUMPS.map((cl, i) => {
          const u = Math.min(cl.u, Math.max(0.01, front - 0.02 - i * 0.004));
          const p = sp[Math.round(u * (sp.length - 1))];
          const pushed = cl.u > front - 0.02;
          return (
            <g key={i} opacity={0.9}>
              <ellipse cx={p.x + Math.sin(i * 2) * 8} cy={p.y - 14 - (pushed ? i * 3 : 0)} rx={cl.r * (pushed ? 1.3 : 1)} ry={cl.r * 0.7} fill="#dff2ea" opacity={0.42} />
              <path d={`M${f1(p.x - cl.r)},${f1(p.y - 10)} q${f1(cl.r)},${f1(-cl.r * 0.8)} ${f1(cl.r * 2)},0`} stroke="#f4fffa" strokeWidth={1.2} fill="none" opacity={0.5} />
            </g>
          );
        })}
      <SlimeCloud t={t} b={{t0: EV.unknot + 0.4, sources: [{x: sp[3].x, y: sp[3].y - 10}, {x: sp[8].x, y: sp[8].y}], dir: -2.0, spread: 1.6, size: 200, seed: 41, life: 6}} />
    </DeepBack>
  );
};

export function scene07(t: number): SceneOut {
  const {sp} = knotWorld(t);
  let c: Cam = shot(t, 90, 93, cam(KC.x + 200, KC.y - 40, 1.0), cam(KC.x + 60, KC.y, 1.55), 'cine');
  if (t >= 93) c = shot(t, 93, 105, cam(KC.x + 60, KC.y, 1.55), cam(KC.x + 20, KC.y - 10, 1.9, 0.03), 'inOut');
  c = breathe(c, t, 0.25);
  const ks = toScreen(c, KC.x, KC.y);
  const tail = toScreen(c, sp[sp.length - 1].x, sp[sp.length - 1].y);
  return {
    svg: <KnotScene t={t} c={c} />,
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 93.4, 96.6)} x={tail.x} y={tail.y} tx={150} ty={480} text="la cola forma un lazo" />
        <Callout k={win(t, 98.2, 104.6)} x={ks.x} y={ks.y} tx={620} ty={470} text="nudo" />
      </>
    ),
  };
}

export function scene08(t: number): SceneOut {
  const {sp, front} = knotWorld(t);
  const L = sp.length - 1;
  const kf = sp[Math.round(clamp(front + 0.12) * L)];
  let c: Cam = shot(t, 105, 107, cam(KC.x + 20, KC.y - 10, 1.9, 0.03), cam(kf.x, kf.y - 20, 2.1), 'cine');
  if (t >= 107) c = cam(kf.x, kf.y - 20, 2.1);
  if (t >= EV.unknot) c = shot(t, EV.unknot, 120, cam(kf.x, kf.y - 20, 2.1), cam(sp[10].x + 120, sp[10].y - 60, 1.4), 'inOut');
  c = breathe(c, t, 0.25);
  const fs = toScreen(c, sp[Math.round(clamp(front) * L)].x, sp[Math.round(clamp(front) * L)].y);
  return {
    svg: <KnotScene t={t} c={c} />,
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        <Callout k={win(t, 106.4, 112)} x={fs.x} y={fs.y} tx={150} ty={480} text="el nudo avanza hacia la cabeza" />
        <Callout k={win(t, 112.6, 117.6)} x={fs.x} y={fs.y - 20} tx={560} ty={1180} text="arrastra la mucosidad" />
      </>
    ),
  };
}
