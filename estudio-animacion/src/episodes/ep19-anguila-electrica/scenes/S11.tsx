// ESCENA 11 (150–165 s) · EL SECRETO DE SU PODER: al mismo tiempo, el animal completo, sus órganos
// eléctricos, la activación de los electrocitos y el impulso eléctrico (traza de osciloscopio).
import {AbsoluteFill} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, SceneOut} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Track} from '../character/states';
import {Brand, eelAt, ElectrocytePanel, pathOf, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {RiverBack, RiverFront} from '../environment/River';

const f1 = (n: number) => n.toFixed(1);
const PATH = pathOf([{x: -1400, y: 120}, {x: -800, y: 150}, {x: -200, y: 110}, {x: 400, y: 150}, {x: 1000, y: 120}, {x: 1600, y: 150}]);
const TRACK: Track = [[150, 'IDLE_HOVER']];

export function scene11(t: number): SceneOut {
  const e = eelAt(PATH, 1900, TRACK, 150, t);
  const sp = e.spine;
  const cx = (sp[0].x + sp[27].x) / 2;
  const c = breathe(cam(cx, sp[12].y - 40, 0.98), t, 0.2);
  const pulse = ((t - EV.power) / 2.2) % 1;
  const k = win(t, 150.6, 164.6, 0.6);
  // traza de osciloscopio: tren de pulsos que se desplaza
  const W = 880;
  let d = '';
  for (let i = 0; i <= 220; i++) {
    const x = (i / 220) * W;
    const ph = (x / W) * 6 - t * 1.2;
    const local = ph - Math.floor(ph);
    const spike = local < 0.06 ? Math.sin((local / 0.06) * Math.PI) : 0;
    d += `${i ? 'L' : 'M'}${f1(100 + x)},${f1(1290 - spike * 120 + Math.sin(i * 0.7 + t * 9) * 2)} `;
  }
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={0.3} light={0.85}>
        <ElectricEel uid="e11" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, organs: seg(t, 150.3, 151.6), organPulse: pulse}} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.3} />
        <Vignette />
        <ElectrocytePanel t={t} k={k} t0={EV.power} top={330} />
        {k > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <rect x={70} y={1150} width={940} height={190} rx={22} fill="rgba(4,20,18,0.72)" stroke="#f6e070" strokeWidth={2} strokeOpacity={0.5} />
              <path d={d} stroke="#f6e070" strokeWidth={3} fill="none" />
            </svg>
            <div style={{position: 'absolute', left: 100, top: 1160, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 24, color: '#f6e070', letterSpacing: 2}}>IMPULSO ELÉCTRICO · ESQUEMA</div>
          </AbsoluteFill>
        )}
        <Brand />
      </>
    ),
  };
}
