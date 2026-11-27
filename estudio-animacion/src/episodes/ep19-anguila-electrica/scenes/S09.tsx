// ESCENA 9 (120–135 s) · NECESITA RESPIRAR AIRE: la anguila asciende; la cámara la sigue en vertical
// hasta la superficie, donde asoma la boca y toma aire (ondas y reflejos); luego vuelve a bajar
// soltando unas burbujas.
import {clamp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {paramsAt, Track} from '../character/states';
import {Brand, pathOf, seg, Vignette} from '../components/common';
import {EEL, EV} from '../data/timeline';
import {bodyOnPath} from '../../ep18-mixino/motion/path';
import {RiverBack, RiverFront, SURF, Weed} from '../environment/River';

const PATH = pathOf([{x: -1300, y: 420}, {x: -900, y: 330}, {x: -560, y: 0}, {x: -330, y: -600}, {x: -200, y: -1100}, {x: -150, y: SURF + 140}, {x: -40, y: SURF + 18}, {x: 70, y: SURF + 140}, {x: 120, y: -1100}, {x: 250, y: -600}, {x: 480, y: -100}, {x: 800, y: 250}, {x: 1200, y: 380}]);
const TOP = (() => {
  let best = 0;
  let by = Infinity;
  PATH.pts.forEach((p, i) => {
    if (p.y < by) {
      by = p.y;
      best = PATH.cum[i];
    }
  });
  return best;
})();
const TRACK: Track = [[120, 'SLOW_SWIM'], [127.6, 'SURFACE_BREATHING'], [130.4, 'SLOW_SWIM']];
const S_START = 1150;

/** Posición de la cabeza en la trayectoria: llega arriba a los 129,2 s, se detiene un instante y baja. */
const sHead = (t: number) => {
  if (t < 128.4) return S_START + (TOP - 60 - S_START) * Math.pow(seg(t, 120, 128.4), 0.9);
  if (t < 130.2) return TOP - 60 + 120 * seg(t, 128.4, 130.2);
  return TOP + 60 + (t - 130.2) * 170;
};

export function scene09(t: number): SceneOut {
  const p = paramsAt(TRACK, t);
  const sp = bodyOnPath(PATH, sHead(t), EEL.len, EEL.n, {amp: p.bodyAmp, waves: 1.1, phase: t * 3.2});
  const head = sp[0];
  const camY = Math.max(SURF + 330, Math.min(head.y - 40, 200));
  let c: Cam = cam(head.x + 40, camY, 1.15 + 0.35 * seg(t, 126, 128.6) - 0.3 * seg(t, 130.5, 133));
  c = breathe(c, t, 0.25);
  const gulp = clamp(1 - Math.abs(t - EV.surface) / 0.8);
  const fin = t * 2 * Math.PI * 2;
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={0.3} light={1.1}>
        <Weed x={-1000} base={560} h={380} t={t} seed={41} c="#2e5a2a" />
        <Weed x={700} base={560} h={340} t={t} seed={43} c="#2a5226" />
        <ElectricEel uid="e9" spine={sp} look={{t, finPhase: fin, finAmp: p.finAmp, mouth: Math.max(p.mouth * 0.3, gulp)}} />
        {/* ondas en la superficie al tomar aire */}
        {[0, 0.5, 1.0].map((d, i) => {
          const a = t - EV.surface - d;
          if (a < 0 || a > 2.5) return null;
          return <ellipse key={i} cx={-20} cy={SURF} rx={20 + a * 140} ry={4 + a * 10} fill="none" stroke="#f4fff4" strokeWidth={2.4} opacity={0.8 * (1 - a / 2.5)} />;
        })}
        {/* burbujas al descender */}
        {t > 130.4 && Array.from({length: 12}, (_, i) => {
          const a = t - 130.4 - i * 0.18;
          if (a < 0 || a > 2.2) return null;
          const p0 = sp[2];
          return <circle key={`b${i}`} cx={p0.x + Math.sin(i * 2 + t * 3) * 10} cy={p0.y - a * 260} r={3 + (i % 3) * 2} fill="none" stroke="#eaffff" strokeWidth={1.4} opacity={0.8 * (1 - a / 2.2)} />;
        })}
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.3} />
        <Vignette />
        <Brand />
      </>
    ),
  };
}
