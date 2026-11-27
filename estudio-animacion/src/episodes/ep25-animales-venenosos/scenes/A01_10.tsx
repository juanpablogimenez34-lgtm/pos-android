// ANIMALES 01–10 (serpientes, escorpiones, arañas). Cada función recibe u = tiempo local (0…8 s).
// Cámara por animal: 0–2 s revelación en su hábitat · 2–5 s comportamiento · 5–8 s primer plano de su rasgo.
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {Scorpion, Spider} from '../character/Arthropods';
import {Snake} from '../character/Snake';
import * as S from '../character/species';
import {AnimalTitle, Inset, Note, seg, Vignette, win} from '../components/common';
import {ANIMALS} from '../data/timeline';
import {LandScene, WebRefuge} from '../environment/Habitats';

export type AOpts = {titles?: boolean};
const T = (u: number, i: number, o: AOpts) => (o.titles === false ? null : <AnimalTitle u={u} n={ANIMALS[i].n} name={ANIMALS[i].name} sci={ANIMALS[i].sci} />);
const flick = (u: number, every = 1.3, len = 0.45) => {
  const k = (u % every) / len;
  return k < 1 ? Math.sin(k * Math.PI) : 0;
};

// 01 · COBRA REAL — se desplaza entre las hojas, se alza y despliega la capucha; la cámara sube con la cabeza
export function a01(u: number, o: AOpts = {}): SceneOut {
  const s = 0.55;
  const crawl = seg(u, 0, 2.6);
  const x = -700 + crawl * 640;
  const raise = seg(u, 2.2, 4.0);
  const hood = seg(u, 3.4, 4.6);
  const pose = {t: u, travel: u * 2.2 * (1 - raise * 0.85), amp: 0.7 * (1 - raise * 0.6), raise, hood, tongue: flick(u, 1.4), look: Math.sin(u * 0.8) * 0.08};
  const headY = -S.KING_COBRA.len * 0.3 * raise * s * 0.9;
  let c: Cam = cam(x - 60, -20, 1.9);
  if (u >= 2) c = shot(u, 2, 4.6, cam(x - 60, -20, 1.9), cam(x + 30, headY + 60, 1.7), 'cine');
  if (u >= 4.6) c = shot(u, 4.6, 6, cam(x + 30, headY + 60, 1.7), cam(x + 30, headY + 30, 2.8), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="asiaForest">
        <Snake uid="a01" spec={S.KING_COBRA} pose={pose} x={x} y={0} scale={s} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 0, o)}
      </>
    ),
  };
}

// 02 · MAMBA NEGRA — entre rocas y ramas, alza la cabeza y muestra el interior oscuro de la boca
export function a02(u: number, o: AOpts = {}): SceneOut {
  const s = 0.6;
  const x = -500 + seg(u, 0, 3) * 700;
  const raise = seg(u, 2.6, 4.2) * 0.7;
  const jaw = win(u, 5.0, 7.0, 0.35);
  const pose = {t: u, travel: u * 3, amp: 0.75 * (1 - raise), raise, jaw, tongue: u < 4.8 ? flick(u, 1.1) : 0};
  const head = {x: x + 30, y: -S.BLACK_MAMBA.len * 0.3 * raise * s * 0.9};
  let c: Cam = cam(x - 200, -40, 1.2);
  if (u >= 1.8) c = shot(u, 1.8, 4.4, cam(x - 200, -40, 1.2), cam(head.x - 40, head.y + 60, 1.8), 'inOut');
  if (u >= 4.6) c = shot(u, 4.6, 5.4, cam(head.x - 40, head.y + 60, 1.8), cam(head.x + 30, head.y, 3.2), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="savanna">
        <path d="M-900,10 Q-700,-140 -420,-120 Q-300,-60 -280,10Z M300,10 Q380,-110 560,-90 Q680,-40 700,10Z" fill="#8a7458" stroke="#5a4a34" strokeWidth={4} />
        <path d="M-200,-30 L260,-160" stroke="#6a5030" strokeWidth={14} strokeLinecap="round" />
        <Snake uid="a02" spec={S.BLACK_MAMBA} pose={pose} x={x} y={0} scale={s} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        {T(u, 1, o)}
        <Note k={win(u, 5.2, 7.8, 0.3)} text="El nombre viene del interior oscuro de la boca" top={1290} />
      </>
    ),
  };
}

// 03 · TAIPÁN DEL INTERIOR — sale de una grieta, explora con la lengua y avanza por terreno seco
export function a03(u: number, o: AOpts = {}): SceneOut {
  const s = 0.6;
  const out = seg(u, 0.3, 4.5);
  const x = -300 + out * 760;
  const pose = {t: u, travel: u * 2.4, amp: 0.55, tongue: flick(u, 1.0, 0.5), look: Math.sin(u * 1.2) * 0.15};
  let c: Cam = cam(-200, -60, 1.8);
  if (u >= 2.4) c = shot(u, 2.4, 5, cam(-200, -60, 1.8), cam(x - 160, -30, 1.4), 'inOut');
  if (u >= 5.2) c = shot(u, 5.2, 6.4, cam(x - 160, -30, 1.4), cam(x + 40, -20, 3.0), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="aridAU">
        <path d="M-1200,20 L-1180,-90 L-700,-140 L-420,-60 L-360,20Z" fill="#8a4a2a" />
        <Snake uid="a03" spec={S.INLAND_TAIPAN} pose={pose} x={x} y={0} scale={s} />
        {/* roca con la grieta (tapa la parte del cuerpo que aún no ha salido) */}
        <path d="M-900,40 L-880,-200 L-520,-260 L-330,-170 L-300,40Z" fill="#a85a32" stroke="#6a3418" strokeWidth={5} />
        <path d="M-330,-150 L-360,-60 L-330,30" stroke="#3a1a0a" strokeWidth={10} fill="none" />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        {T(u, 2, o)}
        <Note k={win(u, 5.4, 7.8, 0.3)} text="Veneno muy potente, pero es tímida: potencia no es igual a peligrosidad" top={1290} />
      </>
    ),
  };
}

// 04 · VÍBORA DE GABÓN — primero las hojas; después se revela; respira despacio; movimiento defensivo breve
export function a04(u: number, o: AOpts = {}): SceneOut {
  const s = 0.75;
  const reveal = seg(u, 1.6, 3.2);
  const strike = win(u, 5.2, 6.0, 0.25);
  const jaw = win(u, 5.4, 7.0, 0.3);
  const pose = {t: u, travel: 0.5, amp: 0.05, coil: 1, raise: 0.18 + strike * 0.25, strike, jaw, tongue: u > 3 && u < 5 ? flick(u, 1.6) : 0, look: -0.15};
  let c: Cam = cam(-60, -40, 1.6);
  if (u >= 2.6) c = shot(u, 2.6, 4.6, cam(-60, -40, 1.6), cam(20, -50, 1.25), 'inOut');
  if (u >= 5.6) c = shot(u, 5.6, 6.6, cam(20, -50, 1.25), cam(90, -70, 2.6), 'cine');
  c = breathe(c, u, 0.15);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="leafLitter" fgK={1 - reveal * 0.6}>
        <Snake uid="a04" spec={S.GABOON_VIPER} pose={{...pose, breathe: 0.5 + 0.5 * Math.sin(u * 1.4)}} x={0} y={0} scale={s * (1 + 0.012 * Math.sin(u * 1.4))} tone={0.1 * (1 - reveal)} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 3, o)}
        <Inset k={win(u, 6.0, 7.9, 0.3)} label="colmillos largos y plegables (esquema)">
          <path d="M-150,-40 Q0,-110 150,-40 L150,0 L-150,0Z" fill="#d8c8a8" />
          <path d="M40,-20 q30,90 -10,150" stroke="#f4efe4" strokeWidth={14} strokeLinecap="round" fill="none" />
          <path d="M40,-20 q30,90 -10,150" stroke="#c8b898" strokeWidth={3} fill="none" />
          <path d="M-60,-10 q20,40 0,60" stroke="#e8e0d0" strokeWidth={6} fill="none" />
        </Inset>
      </>
    ),
  };
}

// 05 · CASCABEL DIAMANTE OCCIDENTAL — enroscada, alza la cabeza y hace vibrar el cascabel
export function a05(u: number, o: AOpts = {}): SceneOut {
  const s = 0.8;
  const coil = seg(u, 0, 1.8);
  const pose = {t: u, travel: u * 1.5 * (1 - coil), amp: 0.5 * (1 - coil), coil, raise: seg(u, 1.2, 2.6) * 0.5, rattle: seg(u, 1.8, 2.2), tongue: flick(u, 1.5)};
  const rattleW = {x: -S.WD_RATTLESNAKE.len * 0.14 * s, y: 0};
  let c: Cam = cam(-80, -60, 0.95);
  if (u >= 2.4) c = shot(u, 2.4, 4.4, cam(-80, -60, 0.95), cam(-20, -110, 1.5), 'inOut');
  if (u >= 5) c = shot(u, 5, 6, cam(-20, -110, 1.5), cam(rattleW.x - 30, rattleW.y + 10, 2.4), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="desertNA">
        <Snake uid="a05" spec={S.WD_RATTLESNAKE} pose={pose} x={0} y={0} scale={s} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        {T(u, 4, o)}
        <Note k={win(u, 5.2, 7.8, 0.3)} text="Cascabel: anillos de queratina que suenan al vibrar" top={1290} />
      </>
    ),
  };
}

// 06 · ESCORPIÓN AMARILLO — vista macro: camina por la arena, mueve las pinzas y alza la cola
export function a06(u: number, o: AOpts = {}): SceneOut {
  const walking = 1 - seg(u, 3.2, 3.8);
  const x = -380 + Math.min(u, 3.5) * 120;
  const pose = {t: u, walk: Math.min(u, 3.5) * 1.6 + (u > 3.5 ? 0 : 0), tail: lerp(0.55, 1, seg(u, 3.6, 4.6)), clawL: 0.3 + 0.4 * Math.max(0, Math.sin(u * 2.1)), clawR: 0.3 + 0.4 * Math.max(0, Math.sin(u * 2.1 + 1.6)), sting: win(u, 5.4, 6.6, 0.3) * 0.6};
  let c: Cam = cam(x - 40, -10, 2.0);
  if (u >= 3.4) c = shot(u, 3.4, 4.8, cam(x - 40, -10, 2.0), cam(x - 140, -110, 2.6), 'cine');
  c = breathe(c, u, 0.18 * (0.4 + walking));
  return {
    svg: (
      <LandScene cam={c} t={u} kind="rockDesert">
        <Scorpion spec={S.DEATHSTALKER} pose={pose} x={x} y={20} scale={1.4} angle={-0.05} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 5, o)}
        <Inset k={win(u, 5.6, 7.9, 0.3)} label="aguijón (telson) con glándulas de veneno (esquema)">
          <ellipse cx={-30} cy={0} rx={110} ry={60} fill="#d8c070" stroke="#6a5a28" strokeWidth={4} />
          <ellipse cx={-40} cy={0} rx={60} ry={30} fill="#c8a050" opacity={0.6} />
          <path d="M70,-30 Q160,-40 170,40" stroke="#3a2a14" strokeWidth={18} strokeLinecap="round" fill="none" />
        </Inset>
      </>
    ),
  };
}

// 07 · ESCORPIÓN DE COLA GRUESA — sale de debajo de una roca, camina y adopta postura defensiva
export function a07(u: number, o: AOpts = {}): SceneOut {
  const x = -260 + seg(u, 0.2, 3.6) * 360;
  const defend = seg(u, 3.8, 4.8);
  const pose = {t: u, walk: Math.min(u, 3.6) * 1.4, tail: lerp(0.5, 1, defend), clawL: lerp(0.25, 0.85, defend), clawR: lerp(0.25, 0.8, defend)};
  let c: Cam = cam(-100, -30, 1.5);
  if (u >= 3.6) c = shot(u, 3.6, 5.2, cam(-100, -30, 1.5), cam(x + 10, -60, 2.2), 'inOut');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="rockDesert">
        <Scorpion spec={S.FAT_TAIL} pose={pose} x={x} y={20} scale={1.45} />
        <path d="M-700,60 L-640,-170 L-420,-210 L-260,-120 L-240,60Z" fill="#b08a58" stroke="#6a5030" strokeWidth={5} />
        <path d="M-640,-160 L-420,-200" stroke="#e8d0a0" strokeWidth={6} opacity={0.4} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 6, o)}
        <Note k={win(u, 5.2, 7.8, 0.3)} text="Su cola es mucho más gruesa que la del escorpión amarillo" top={1290} />
      </>
    ),
  };
}

// 08 · ESCORPIÓN DE ARIZONA — trepa por una corteza rugosa y mueve las pinzas por separado
export function a08(u: number, o: AOpts = {}): SceneOut {
  const y = -140 - u * 70;
  const pose = {t: u, walk: u * 1.5, tail: 0.45 + 0.1 * Math.sin(u), clawL: 0.25 + 0.5 * Math.max(0, Math.sin(u * 2.4)), clawR: 0.25 + 0.5 * Math.max(0, Math.sin(u * 1.7 + 2))};
  let c: Cam = cam(0, y - 40, 1.3);
  if (u >= 4.5) c = shot(u, 4.5, 6, cam(0, y - 40, 1.3), cam(20, y - 140, 2.3), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="logsAZ">
        <rect x={-420} y={-2400} width={840} height={2440} rx={60} fill="#6a5040" />
        {Array.from({length: 40}, (_, i) => <path key={i} d={`M${-380 + (i % 8) * 100},${-2300 + Math.floor(i / 8) * 480} q30,120 -10,260 q-20,80 10,180`} stroke="#4a3426" strokeWidth={10} fill="none" opacity={0.7} />)}
        {Array.from({length: 30}, (_, i) => <ellipse key={`k${i}`} cx={-350 + ((i * 137) % 700)} cy={-2200 + ((i * 331) % 2300)} rx={14} ry={8} fill="#8a6a50" opacity={0.6} />)}
        <Scorpion spec={S.BARK_SCORPION} pose={pose} x={0} y={y} scale={1.5} angle={-Math.PI / 2} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 7, o)}
        <Note k={win(u, 5.2, 7.8, 0.3)} text="De día se refugia en grietas y bajo la corteza" top={1290} />
      </>
    ),
  };
}

// 09 · VIUDA NEGRA — en su tela irregular; un insecto la hace vibrar y ella acude
export function a09(u: number, o: AOpts = {}): SceneOut {
  const fly = {x: 260, y: 120};
  const go = seg(u, 3.2, 5.6);
  const sp = {x: lerp(-180, fly.x - 110, go), y: lerp(-120, fly.y - 30, go)};
  const vibe = u > 2.6 ? 0.6 + 0.4 * Math.sin(u * 30) : 0;
  let c: Cam = cam(-60, -40, 1.1);
  if (u >= 2.4) c = shot(u, 2.4, 3.4, cam(-60, -40, 1.1), cam(60, 20, 1.0), 'inOut');
  if (u >= 5.2) c = shot(u, 5.2, 6.4, cam(60, 20, 1.0), cam(sp.x - 20, sp.y, 2.0), 'cine');
  c = breathe(c, u, 0.15);
  const flyIn = seg(u, 1.8, 2.6);
  return {
    svg: (
      <WebRefuge cam={c} t={u} spider={sp} vibe={vibe * 0.6}>
        <g transform={`translate(${lerp(700, fly.x, flyIn)} ${lerp(-500, fly.y, flyIn)})`}>
          <ellipse cx={0} cy={0} rx={22} ry={12} fill="#3a4a3a" />
          <ellipse cx={-6} cy={-14} rx={16} ry={8} fill="#cfe0f0" opacity={0.6} transform={`rotate(${Math.sin(u * 60) * 20 * vibe})`} />
          <circle cx={16} cy={0} r={8} fill="#6a2a2a" />
        </g>
        <Spider spec={S.BLACK_WIDOW} pose={{t: u, walk: go * 3, ventral: true, twitch: vibe}} x={sp.x} y={sp.y} scale={1.6} angle={Math.atan2(fly.y - sp.y, fly.x - sp.x)} />
      </WebRefuge>
    ),
    overlay: (
      <>
        <Vignette k={0.7} />
        {T(u, 8, o)}
        <Note k={win(u, 5.4, 7.8, 0.3)} text="La marca roja en forma de reloj de arena está en la parte inferior del abdomen" top={1290} />
      </>
    ),
  };
}

// 10 · ARAÑA DE EMBUDO DE SÍDNEY — sale de su refugio de seda y se alza en postura defensiva
export function a10(u: number, o: AOpts = {}): SceneOut {
  const out = seg(u, 0.4, 2.8);
  const rear = seg(u, 3.6, 4.6);
  const x = lerp(-260, 40, out);
  let c: Cam = cam(-200, -60, 1.3);
  if (u >= 2.2) c = shot(u, 2.2, 3.6, cam(-200, -60, 1.3), cam(x, -40, 1.5), 'inOut');
  if (u >= 5) c = shot(u, 5, 6, cam(x, -40, 1.5), cam(x + 50, -50, 2.6), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="humidAU">
        <path d="M-700,40 L-680,-160 L-300,-180 L-260,40Z" fill="#3a2a1a" />
        {/* refugio en embudo de seda */}
        <path d="M-300,-40 Q-200,-120 -120,-90 Q-60,-40 -120,10 Q-200,40 -300,20Z" fill="#e8e4dc" opacity={0.75} />
        {Array.from({length: 12}, (_, i) => <path key={i} d={`M-300,${-40 + i * 5} Q${-200 + i * 4},${-110 + i * 8} -120,${-90 + i * 9}`} stroke="#ffffff" strokeWidth={1.2} fill="none" opacity={0.5} />)}
        <Spider spec={S.FUNNEL_WEB} pose={{t: u, walk: out * 3, rear, fangs: rear}} x={x} y={-20} scale={1.5} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 9, o)}
        <Note k={win(u, 5.2, 7.8, 0.3)} text="Desde la llegada del antiveneno no se han registrado muertes (Australian Museum)" top={1290} />
      </>
    ),
  };
}

export const _c = clamp;
