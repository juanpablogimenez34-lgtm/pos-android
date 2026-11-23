// ESCENA 3 (30–45 s) · LA BATERÍA VIVIENTE: la anguila se mantiene suspendida y su cuerpo se vuelve
// "transparente" (corte anatómico ilustrado): órgano principal, órgano de Hunter y órgano de Sachs.
// Un panel muestra los electrocitos en serie: la activación coordinada suma los pequeños voltajes.
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Track} from '../character/states';
import {Brand, Callout, eelAt, ElectrocytePanel, pathOf, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {RiverBack, RiverFront} from '../environment/River';

const PATH = pathOf([{x: -1400, y: 330}, {x: -800, y: 300}, {x: -200, y: 320}, {x: 400, y: 290}, {x: 1000, y: 310}, {x: 1600, y: 290}]);
const TRACK: Track = [[30, 'IDLE_HOVER']];

export function scene03(t: number): SceneOut {
  const e = eelAt(PATH, 1850, TRACK, 30, t);
  const sp = e.spine;
  const cx = (sp[0].x + sp[27].x) / 2;
  let c: Cam = shot(t, 30, 32.5, cam(sp[2].x, sp[2].y - 20, 2.2), cam(cx, sp[12].y + 60, 0.98), 'cine');
  if (t >= 32.5) c = cam(cx + (t - 32.5) * 2, sp[12].y + 60, 0.98);
  c = breathe(c, t, 0.2);
  const organs = seg(t, EV.organs, EV.organs + 1.6);
  const pulse = t > EV.electrocytes ? ((t - EV.electrocytes) / 2.2) % 1 : undefined;
  const P = (i: number, dy = 0) => toScreen(c, sp[i].x, sp[i].y + dy);
  const a = P(9);
  const b = P(14, 26);
  const d = P(24);
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={0.3}>
        <ElectricEel uid="e3" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, organs, organPulse: pulse}} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.3} />
        <Vignette />
        <Callout k={win(t, 32.6, 37.8)} x={a.x} y={a.y} tx={140} ty={a.y - 330} text="órgano principal" />
        <Callout k={win(t, 33.6, 37.8)} x={b.x} y={b.y} tx={300} ty={b.y + 260} text="órgano de Hunter" />
        <Callout k={win(t, 34.6, 37.8)} x={d.x} y={d.y} tx={Math.min(900, d.x + 20)} ty={d.y - 300} text="órgano de Sachs" align="right" />
        <ElectrocytePanel t={t} k={win(t, 38.0, 44.8, 0.5)} t0={EV.electrocytes} top={420} />
        <Brand />
      </>
    ),
  };
}
