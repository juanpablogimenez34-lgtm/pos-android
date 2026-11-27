// ESCENA 8 (105–120 s) · EL MOVIMIENTO IMPOSIBLE: entre raíces, la anguila avanza, se detiene,
// RETROCEDE invirtiendo las ondas de la aleta anal (el cuerpo sigue casi recto) y vuelve a avanzar.
// Primer plano de la aleta con el sentido de las ondas.
import {AbsoluteFill} from 'remotion';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Track} from '../character/states';
import {Brand, Callout, eelAt, pathOf, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {HangingRoots, RiverBack, RiverFront} from '../environment/River';

const f1 = (n: number) => n.toFixed(1);
const PATH = pathOf([{x: -2200, y: 300}, {x: -1600, y: 260}, {x: -1000, y: 320}, {x: -400, y: 280}, {x: 200, y: 330}, {x: 800, y: 290}, {x: 1400, y: 320}, {x: 2000, y: 290}]);
const TRACK: Track = [[105, 'SLOW_SWIM'], [108.8, 'IDLE_HOVER'], [EV.retreat, 'RETREAT'], [113.4, 'IDLE_HOVER'], [EV.forward, 'SLOW_SWIM']];

export function scene08(t: number): SceneOut {
  const e = eelAt(PATH, 1700, TRACK, 105, t, {SLOW_SWIM: {speed: 90}});
  const sp = e.spine;
  const fin = sp[15];
  let c: Cam = shot(t, 105, 107, cam(sp[10].x, sp[10].y - 40, 1.0), cam(fin.x, fin.y + 40, 2.2), 'cine');
  if (t >= 107) c = cam(fin.x, fin.y + 40, 2.2);
  if (t >= 115.5) c = shot(t, 115.5, 118, cam(fin.x, fin.y + 40, 2.2), cam(sp[8].x + 100, sp[8].y - 50, 1.05), 'cine');
  c = breathe(c, t, 0.2);
  const fs = toScreen(c, fin.x, fin.y + 60);
  const fwd = e.p.fin >= 0;
  const arrowK = win(t, 106.8, 115.6, 0.4) * Math.min(1, Math.abs(e.p.fin) / 1.2);
  const dir = fwd ? -1 : 1; // en pantalla: hacia la cola (izquierda) = avanza
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={0.5}>
        {[-1300, -500, 300, 1100, 1900].map((x, i) => <HangingRoots key={x} x={x} top={-1400} len={1500 + (i % 2) * 300} t={t} seed={30 + i * 3} c="#1c2a1c" w={1.8} />)}
        <ElectricEel uid="e8" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth}} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.5} />
        <Vignette />
        {arrowK > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: arrowK}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              {[0, 1, 2].map((i) => {
                const ph = ((t * 1.2 + i / 3) % 1);
                const x = fs.x + dir * (ph - 0.5) * 520;
                return <path key={i} d={`M${f1(x)},${f1(fs.y + 150)} l${f1(-dir * 26)},-18 l0,36Z`} fill={fwd ? '#5ff0e0' : '#f6e070'} opacity={Math.sin(ph * Math.PI)} />;
              })}
              <path d={`M${f1(fs.x - 260)},${f1(fs.y + 150)} L${f1(fs.x + 260)},${f1(fs.y + 150)}`} stroke={fwd ? '#5ff0e0' : '#f6e070'} strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />
            </svg>
          </AbsoluteFill>
        )}
        <Callout k={win(t, 107.2, EV.retreat - 0.2, 0.4)} x={fs.x} y={fs.y} tx={160} ty={620} text="ondas hacia la cola → avanza" />
        <Callout k={win(t, EV.retreat + 0.4, 113.6, 0.4)} x={fs.x} y={fs.y} tx={160} ty={620} text="ondas hacia la cabeza → retrocede" />
        <Callout k={win(t, EV.forward + 0.3, 116.8, 0.4) * seg(t, EV.forward, EV.forward + 0.5)} x={fs.x} y={fs.y} tx={160} ty={620} text="avanza de nuevo" />
        <Brand />
      </>
    ),
  };
}
