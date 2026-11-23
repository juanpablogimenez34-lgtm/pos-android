// ESCENA 6 (75–90 s) · LA DEFENSA EN ACCIÓN: primer plano de la cabeza del depredador. La mucosidad
// le llena la boca y asoma por la abertura branquial; un esquema muestra el flujo de agua
// (boca → branquias) que se entorpece. El pez suelta, sacude la cabeza, expulsa mucosidad y se aleja;
// el mixino aprovecha para escapar. (No se afirma que el depredador muera.)
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {predMouth} from '../character/Predator';
import {Callout, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {DeepFront} from '../environment/Deep';
import {BITE, hag56, pred56, World56} from './S05';

const f1 = (n: number) => n.toFixed(1);

export function scene06(t: number): SceneOut {
  const p = pred56(t);
  const m = predMouth(p);
  const gillW = {x: p.x + Math.cos(p.angle ?? 0) * 85 * (p.scale ?? 1), y: p.y + Math.sin(p.angle ?? 0) * 85 * (p.scale ?? 1)};
  const head = {x: (m.x + gillW.x) / 2, y: (m.y + gillW.y) / 2};
  let c: Cam = shot(t, 75, 77, cam(BITE.x - 220, BITE.y - 170, 1.9), cam(head.x, head.y, 2.7), 'cine');
  if (t >= 77) c = cam(head.x, head.y, 2.7);
  if (t >= EV.predShake + 1) c = shot(t, EV.predShake + 1, 86.5, cam(pred56(EV.predShake + 1).x + 200, pred56(EV.predShake + 1).y + 60, 2.7), cam(BITE.x + 200, BITE.y - 200, 1.3), 'cine');
  if (t >= 86.5) {
    const sp = hag56(t);
    c = shot(t, 86.5, 90, cam(BITE.x + 200, BITE.y - 200, 1.3), cam(sp[0].x - 150, sp[0].y - 120, 1.5), 'inOut');
  }
  c = breathe(c, t, 0.25);
  // esquema del flujo de agua por las branquias (pantalla)
  const ms = toScreen(c, m.x, m.y);
  const gs = toScreen(c, gillW.x, gillW.y);
  const clog = seg(t, EV.gillClog, EV.gillClog + 2.5);
  const diag = win(t, 75.6, EV.predShake, 0.5);
  const arrows = Array.from({length: 4}, (_, i) => {
    const ph = ((t * (1.2 - 0.9 * clog) + i / 4) % 1);
    const x = ms.x + (gs.x - ms.x) * ph;
    const y = ms.y + (gs.y - ms.y) * ph - Math.sin(ph * Math.PI) * 40;
    return {x, y, o: Math.sin(ph * Math.PI)};
  });
  return {
    svg: <World56 t={t} c={c} />,
    overlay: (
      <>
        <DeepFront cam={c} t={t} />
        <Vignette />
        {diag > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: diag}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <path d={`M${f1(ms.x)},${f1(ms.y)} Q${f1((ms.x + gs.x) / 2)},${f1((ms.y + gs.y) / 2 - 40)} ${f1(gs.x)},${f1(gs.y)}`} stroke={clog > 0.5 ? '#f0a070' : '#7ee8ff'} strokeWidth={4} strokeDasharray="14 10" fill="none" opacity={0.7} />
              {arrows.map((a, i) => (
                <g key={i} transform={`translate(${f1(a.x)} ${f1(a.y)})`} opacity={a.o * (1 - 0.6 * clog)}>
                  <path d="M-14,-10 L10,0 L-14,10Z" fill={clog > 0.5 ? '#f0a070' : '#7ee8ff'} transform={`rotate(${f1((Math.atan2(gs.y - ms.y, gs.x - ms.x) * 180) / Math.PI)})`} />
                </g>
              ))}
              {clog > 0.3 && <circle cx={gs.x} cy={gs.y} r={34} fill="none" stroke="#f0a070" strokeWidth={4} opacity={clamp((clog - 0.3) * 2)} />}
            </svg>
          </AbsoluteFill>
        )}
        <Callout k={win(t, 75.8, EV.gillClog + 0.3, 0.4)} x={ms.x} y={ms.y} tx={160} ty={1180} text="entrada de agua" />
        <Callout k={win(t, EV.gillClog + 0.4, EV.predShake + 0.6, 0.4)} x={gs.x} y={gs.y} tx={900} ty={420} text="branquias obstruidas" align="right" />
        <Callout k={win(t, EV.hagEscape + 0.5, 88.6, 0.4)} x={toScreen(c, hag56(t)[0].x, hag56(t)[0].y).x} y={toScreen(c, hag56(t)[0].x, hag56(t)[0].y).y} tx={600} ty={440} text="el mixino escapa" />
      </>
    ),
  };
}
