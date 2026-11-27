// GANCHO (0–10 s) y CIERRE (170–180 s): montajes que reutilizan las escenas de los animales sin títulos.
//  Gancho: cobra alzándose (0–1) → pulpo de anillos azules (1–3) → escorpión con la cola en alto (3–5) →
//  avispa de mar en aguas oscuras (5–7) → montaje rápido (viuda negra, pez león, Gila, cascabel) y revelación
//  del ornitorrinco (9–10). Texto «20 ANIMALES VENENOSOS».
//  Cierre: cobra, escorpión, araña (170–173) → pulpo, medusa, pez león (173–176) → ornitorrinco (176–178) →
//  «¿CUÁL TE SORPRENDIÓ MÁS?» y la marca del canal.
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {SceneOut} from '../../../studio2';
import {BigTitle, Note, seg, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {a01, a05, a06, a09, a10} from './A01_10';
import {a12, a13, a16, a18, a19} from './A11_20';

const NT = {titles: false};
type Cut = [number, number, (u: number) => SceneOut, number];
function montage(t: number, cuts: Cut[]): SceneOut {
  const c = cuts.find(([a, b]) => t >= a && t < b) ?? cuts[cuts.length - 1];
  return c[2](c[3] + (t - c[0]));
}

const INTRO: Cut[] = [
  [0, 1, (u) => a01(u, NT), 3.6],
  [1, 3, (u) => a13(u, NT), 4.2],
  [3, 5, (u) => a06(u, NT), 3.4],
  [5, 7, (u) => a12(u, NT), 2.2],
  [7, 7.5, (u) => a09(u, NT), 4.2],
  [7.5, 8.0, (u) => a16(u, NT), 2.0],
  [8.0, 8.5, (u) => a18(u, NT), 2.2],
  [8.5, 9.0, (u) => a05(u, NT), 3.0],
  [9.0, 10, (u) => a19(u, NT), 2.0],
];
export function intro(t: number): SceneOut {
  const m = montage(t, INTRO);
  return {
    svg: m.svg,
    overlay: (
      <>
        {m.overlay}
        <BigTitle k={win(t, EV.title, 9.6, 0.3)} lines={['20 ANIMALES', 'VENENOSOS']} top={300} size={96} />
        <Note k={win(t, 4.2, 9.6, 0.4)} text="No es un ranking de peligrosidad" top={1290} />
      </>
    ),
  };
}

const OUTRO: Cut[] = [
  [170, 171, (u) => a01(u, NT), 5.0],
  [171, 172, (u) => a06(u, NT), 4.6],
  [172, 173, (u) => a10(u, NT), 4.4],
  [173, 174, (u) => a13(u, NT), 5.2],
  [174, 175, (u) => a12(u, NT), 3.4],
  [175, 176, (u) => a16(u, NT), 2.6],
  [176, 180, (u) => a19(u, NT), 1.0],
];
export function outro(t: number): SceneOut {
  const m = montage(t, OUTRO);
  return {
    svg: m.svg,
    overlay: (
      <>
        {m.overlay}
        <Vignette k={0.5} />
        <Wash k={0.55 * seg(t, 177.6, 178.6)} />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿CUÁL TE', 'SORPRENDIÓ MÁS?']} top={330} size={88} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#eaf4ff', textShadow: '0 2px 8px rgba(0,0,0,0.7)', opacity: 0.85 * clamp((t - EV.endText - 0.6) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
