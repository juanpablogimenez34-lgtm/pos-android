// ESCENAS 5 y 6 (60–90 s) · EL SEXTO SENTIDO y LA PRESA ESCONDIDA.
//  5: agua muy turbia; la anguila explora (cabeceo de búsqueda) y emite señales débiles (campo
//     dipolar visualizado). Un pez se oculta entre raíces; hacia el final el campo se deforma junto a él.
//  6: montaje alterno presa / depredador: el pez inmóvil tiembla; la anguila cambia de orientación,
//     intensifica las señales y se aproxima con sigilo.
import {lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {ElectricEel} from '../character/ElectricEel';
import {Prey} from '../character/Prey';
import {integrate, Track} from '../character/states';
import {Brand, eelAt, headPoint, pathOf, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {FieldLines, VisualTag} from '../effects/Electric';
import {HangingRoots, RiverBack, RiverFront, Trunk, Weed} from '../environment/River';

export const HIDE = {x: 760, y: 470};
// recorrido: entra desde la izquierda, curva y gira hacia el escondite
export const PATH56 = pathOf([{x: -2400, y: 120}, {x: -1800, y: 200}, {x: -1200, y: 140}, {x: -700, y: 260}, {x: -250, y: 220}, {x: 150, y: 330}, {x: 420, y: 420}, {x: 600, y: 455}, {x: 700, y: 468}]);
// Cámara lenta narrativa del ataque (escena 7): el tiempo de la acción avanza a 0,35× entre 96,5 y 98,5 s.
const SLOW = [EV.attack, EV.attack + 2] as const;
export const tm = (t: number) => (t < SLOW[0] ? t : t < SLOW[1] ? SLOW[0] + (t - SLOW[0]) * 0.35 : t - (SLOW[1] - SLOW[0]) * 0.65);
/** Una sola pista para las escenas 5, 6 y 7 (continuidad de posición entre escenas). */
export const TRACK56: Track = [[60, 'SEARCHING'], [EV.locate, 'ELECTROLOCATION'], [71.5, 'SEARCHING'], [78.5, 'ELECTROLOCATION'], [85, 'STALKING'], [EV.attack, 'HIGH_VOLTAGE_ATTACK'], [tm(EV.capture) - 0.35, 'PREY_CAPTURE'], [tm(EV.capture) + 0.9, 'SLOW_SWIM']];
export const OVR56 = {STALKING: {speed: 22}};
// la cabeza queda a ~200 unidades del escondite en el instante del ataque
export const S0_56 = PATH56.total - 200 - integrate(TRACK56, 60, EV.attack, OVR56).dist;
export const eel56 = (t: number) => eelAt(PATH56, S0_56, TRACK56, 60, tm(t), OVR56);

export const HideSet: React.FC<{t: number}> = ({t}) => (
  <g>
    <Trunk x={1100} y={560} len={620} ang={-2.3} w={64} c="#241e14" />
    <HangingRoots x={820} top={-900} len={1350} t={t} seed={21} c="#1c2a1a" w={1.8} />
    <Weed x={700} base={560} h={300} t={t} seed={23} c="#2a4e24" />
    <Weed x={880} base={560} h={340} t={t} seed={25} c="#24461f" />
  </g>
);

export const HidePrey: React.FC<{t: number; k?: number}> = ({t}) => (
  <Prey uid="ph" p={{x: HIDE.x + Math.sin(t * 0.7) * 3, y: HIDE.y + Math.sin(t * 1.1) * 2, t, s: 1.7, dir: -1, swim: 0.15, hide: 1, hue: 'red'}} />
);

export function scene05(t: number): SceneOut {
  const e = eel56(t);
  const sp = e.spine;
  const mid = sp[7];
  let c: Cam = shot(t, 60, 64, cam(mid.x - 100, mid.y - 40, 0.95), cam(mid.x + 60, mid.y - 20, 1.15), 'inOut');
  if (t >= 64) c = cam(mid.x + 60 + 160 * seg(t, 67, 73), mid.y - 30, lerp(1.15, 1.05, seg(t, 64, 75)));
  c = breathe(c, t, 0.3);
  const field = e.p.field;
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={1} light={0.75}>
        <HideSet t={t} />
        <HidePrey t={t} />
        <ElectricEel uid="e5" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth, eye: Math.sin(t * 0.8)}} />
        <FieldLines spine={sp} k={field * win(t, 60.5, 75, 0.6)} t={t} target={HIDE} pull={seg(t, 69, 73)} />
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={1} />
        <Vignette />
        <VisualTag k={win(t, 63.2, 74.6, 0.4)} text="VISUALIZACIÓN · SEÑALES ELÉCTRICAS DÉBILES (ELECTROLOCALIZACIÓN)" />
        <Brand />
      </>
    ),
  };
}

export function scene06(t: number): SceneOut {
  const e = eel56(t);
  const sp = e.spine;
  const hd = headPoint(sp);
  // montaje alterno: presa (75–78, 81.5–85) / depredador (78–81.5) / plano conjunto (85–90)
  const onPrey = (t < 78) || (t >= 81.5 && t < 85);
  let c: Cam;
  if (onPrey) c = cam(HIDE.x + 20, HIDE.y - 20, t < 78 ? 3.4 : 3.8);
  else if (t < 81.5) c = cam(hd.x - 80, hd.y - 40, 1.7);
  else c = shot(t, 85, 90, cam((hd.x + HIDE.x) / 2, (hd.y + HIDE.y) / 2 - 80, 1.25), cam((hd.x + HIDE.x) / 2 + 40, (hd.y + HIDE.y) / 2 - 40, 1.6), 'inOut');
  c = breathe(c, t, onPrey ? 0.15 : 0.3);
  const ping = (t - EV.ping) % 1.2;
  return {
    svg: (
      <RiverBack cam={c} t={t} murk={0.95} light={0.75}>
        <HideSet t={t} />
        <HidePrey t={t} />
        <ElectricEel uid="e6" spine={sp} look={{t, finPhase: e.finPhase, finAmp: e.p.finAmp, mouth: e.p.mouth, eye: 1}} />
        <FieldLines spine={sp} k={e.p.field * win(t, 75.2, 90, 0.4)} t={t} target={HIDE} pull={0.6 + 0.4 * seg(t, 79, 84)} />
        {t > EV.ping && [0, 0.4, 0.8].map((d, i) => {
          const a = ping - d * 0.5;
          if (a < 0 || a > 0.9) return null;
          return <circle key={i} cx={HIDE.x} cy={HIDE.y} r={30 + a * 160} fill="none" stroke="#5ff0e0" strokeWidth={3} opacity={0.6 * (1 - a / 0.9)} />;
        })}
      </RiverBack>
    ),
    overlay: (
      <>
        <RiverFront cam={c} t={t} murk={0.95} />
        <Vignette />
        <VisualTag k={win(t, 78.2, 89.6, 0.4)} text="VISUALIZACIÓN · SEÑALES ELÉCTRICAS DÉBILES (ELECTROLOCALIZACIÓN)" />
        <Brand />
      </>
    ),
  };
}
