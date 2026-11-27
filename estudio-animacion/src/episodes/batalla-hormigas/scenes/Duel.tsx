// ESCENA 1 (0–20)    LA BATALLA COMIENZA: la cámara a ras de suelo sigue a la hormiga negra (patas, antenas,
//                    mandíbulas); la roja aparece y cruza la piedra-montaña; ambas detectan el alimento y se acercan
//                    desde lados opuestos; primeros planos de mandíbulas y lento giro de cámara. Sin revelar ganador.
// ESCENA 5 (95–120)  EL ENFRENTAMIENTO INDIVIDUAL: exploración, detección, posturas defensivas, la roja cambia de
//                    dirección, aproximaciones, contacto breve (cámara lenta) y retirada de la roja. SIMULACIÓN.
// ESCENA 6a (120–126) la roja se aleja dejando un rastro químico (representación) → reclutamiento.
import React from 'react';
import {clamp, hash1, lerp, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {AntSide, antPoint, gasterTip, headTip} from '../ant/AntSide';
import {heroAt, XKey} from '../ant/motion';
import {BLACK, RED} from '../ant/species';
import {groundY, SideWorld} from '../world/Macro';
import {BigTitle as Big, Tag, win} from '../components/common';
import {Brand, Keyword, SimBadge} from './ui';
import {FONT_FAMILY} from '../../../engine/fonts';

const ease = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
export const FOOD = {x: 930, y: 0};
// cámara lenta del contacto: τ(t)
export const SLOW = {a: 108, b: 110.5, rate: 0.45};
export const tauOf = (t: number) => (t < SLOW.a ? t : t < SLOW.b ? SLOW.a + (t - SLOW.a) * SLOW.rate : t - (SLOW.b - SLOW.a) * (1 - SLOW.rate));
const TC = SLOW.a + (108.6 - SLOW.a); // instante τ del contacto

export const BLACK_KEYS: XKey[] = [[-2, -1700], [0, -1300], [9, 250], [12, 470], [14.5, 520], [95, 520], [98.5, 640], [103, 650], [104, 640], [105.5, 700], [107, 800], [108.6, 850], [109.1, 835], [110, 810], [112, 780], [118.6, 770], [126, 770]];
export const RED_KEYS: XKey[] = [[3, 3200], [4.5, 3100], [6, 2950], [9.5, 2300], [12.5, 1700], [14.5, 1500], [95, 1480], [98.5, 1340], [102.5, 1320], [103.3, 1400], [104.2, 1430], [105.5, 1350], [107, 1290], [108.6, 1262], [109.1, 1300], [110.2, 1400], [112, 1750], [114, 2300], [116, 2900], [118.6, 3500], [126, 5200]];

export function duelPoses(t: number) {
  const τ = tauOf(t);
  const def = win(τ, 99, 112, 0.8);
  const bite = smoothstep(108.3, 108.55, τ) * (1 - smoothstep(108.7, 109.0, τ));
  const black = heroAt(BLACK, BLACK_KEYS, τ, {
    mand: Math.max(win(τ, 13, 15.2, 0.4), def * (1 - bite * 0.9)),
    stance: def, gaster: def * 0.45 + win(τ, 108.8, 110.6, 0.3) * 0.9, spray: win(τ, 109.0, 110.8, 0.3) * 0.8,
    scan: τ < 99 && Math.abs(τ - 15) < 80 ? 1 : 0.6, seed: 0.2, rim: 0.6, antTarget: win(τ, 96, 99, 0.4) * 0.6,
  });
  const ready = win(τ, 100, 103, 0.5) + win(τ, 106.5, 110.2, 0.4);
  const red = heroAt(RED, RED_KEYS, τ, {
    mand: Math.max(win(τ, 14, 15.5, 0.4), win(τ, 99.5, 110.3, 0.6)), stance: win(τ, 99.5, 110.5, 0.6),
    gaster: ready * 0.95, sting: win(τ, 107.6, 110, 0.3), seed: 0.7, rim: 0.6, antTarget: win(τ, 96, 99, 0.4) * 0.6,
  });
  return {black, red, τ};
}

function duelCam(t: number, b: ReturnType<typeof duelPoses>['black'], r: ReturnType<typeof duelPoses>['red']): Cam {
  const bh = headTip(BLACK, b);
  const rh = headTip(RED, r);
  const midX = (b.x + r.x) / 2;
  const segs: [number, Cam][] = [
    [0, cam(b.x - 60, 1270, 2.0)], // patas a ras de suelo
    [3.0, cam(bh.x - 120, b.y + 20, 2.3)], // antenas y mandíbulas
    [6.4, cam(r.x + 60, r.y - 40, 1.7)], // la roja aparece sobre la piedra-montaña
    [9.6, cam(midX, 1180, 0.78)], // se aproximan desde lados opuestos
    [12.6, cam(bh.x - 60, b.y + 30, 2.5)], // mandíbulas de la negra
    [13.9, cam(rh.x - 40, r.y + 20, 3.4)], // mandíbulas de la roja
    [15.4, cam(midX, 1200, 1.05)], // lento giro alrededor de ambas
  ];
  const segs5: [number, Cam][] = [
    [95, cam(midX, 1240, 1.0)],
    [98.6, cam((bh.x + rh.x) / 2, 1220, 1.4)],
    [102.8, cam(r.x + 40, r.y - 20, 2.6)], // la roja cambia de dirección
    [105.2, cam((bh.x + rh.x) / 2, 1200, 1.45)],
    [108, cam((bh.x + rh.x) / 2 - 60, 1190, 1.8)], // contacto en cámara lenta
    [110.6, cam((b.x + r.x) / 2 + 200, 1220, 0.95)],
    [113, cam(r.x - 200, 1150, 0.7)], // la roja se retira por la piedra
    [116.5, cam(b.x + 80, 1260, 1.5)], // la negra conserva el alimento
    [120, cam(r.x - 300, 1150, 0.62)], // rastro químico
  ];
  const S = t < 95 ? segs : segs5;
  let i = 0;
  while (i < S.length - 1 && t >= S[i + 1][0]) i++;
  // fundido de encuadre de 0,9 s con el tramo anterior
  const c = S[i][1];
  // corte seco cuando el encuadre salta lejos; fundido de 0,9 s en los demás casos
  const jump = i > 0 && Math.abs(S[i][1].x - S[i - 1][1].x) > 1200;
  const k = i > 0 && !jump ? clamp((t - S[i][0]) / 0.9) : 1;
  const p = i > 0 ? S[i - 1][1] : c;
  const e = ease(k);
  let out: Cam = {x: lerp(p.x, c.x, e), y: lerp(p.y, c.y, e), zoom: Math.exp(lerp(Math.log(p.zoom), Math.log(c.zoom), e)), roll: lerp(p.roll, c.roll, e)};
  if (t > 15.4 && t < 20) out = {...out, x: out.x + Math.sin((t - 15.4) * 0.6) * 120, roll: Math.sin((t - 15.4) * 0.5) * 0.04}; // giro lento
  return {...out, x: out.x + Math.sin(t * 0.37) * 5, y: out.y + Math.sin(t * 0.29 + 1) * 4};
}

/** Rastro químico detrás de la roja (representación). */
const Trail: React.FC<{from: number; to: number; t: number; k: number}> = ({from, to, t, k}) =>
  k > 0.01 ? (
    <g opacity={k}>
      {Array.from({length: Math.max(0, Math.floor((to - from) / 70))}, (_, i) => {
        const x = from + i * 70 + 20;
        return <ellipse key={i} cx={x} cy={groundY(x) - 6} rx={18} ry={6} fill="#ff9a5a" opacity={0.35 + 0.25 * Math.sin(t * 3 - i * 0.5)} />;
      })}
      {Array.from({length: 14}, (_, i) => {
        const x = from + hash1(i) * (to - from);
        const ph = ((t * 0.5 + hash1(i * 3)) % 1);
        return <circle key={`p${i}`} cx={x + Math.sin(t + i) * 10} cy={groundY(x) - 20 - ph * 160} r={4 + ph * 6} fill="#ffb07a" opacity={0.5 * (1 - ph)} />;
      })}
    </g>
  ) : null;

const MainTitle: React.FC<{k: number}> = ({k}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 30, right: 30, top: 250, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, opacity: k, transform: `scale(${(0.94 + 0.06 * k).toFixed(3)})`, textShadow: '0 0 30px rgba(0,0,0,0.5), 0 6px 18px rgba(0,0,0,0.9)'}}>
      <div style={{fontSize: 92, lineHeight: 1, color: '#f4f0ea', WebkitTextStroke: '2px #000'}}>HORMIGA NEGRA</div>
      <div style={{fontSize: 60, lineHeight: 1.2, color: '#ffd23f'}}>VS.</div>
      <div style={{fontSize: 92, lineHeight: 1, color: '#ff6a3a'}}>HORMIGA ROJA</div>
    </div>
  ) : null;

export function duelFrame(t: number): SceneOut {
  const {black, red, τ} = duelPoses(t);
  const c = duelCam(t, black, red);
  const slow = t >= SLOW.a && t < SLOW.b;
  const contact = τ > TC - 0.05 && τ < TC + 0.4;
  const bh = headTip(BLACK, black);
  const svg = (
    <SideWorld cam={c} t={t} food={FOOD} warm={1}>
      {t > 119.5 && <Trail from={1300} to={Math.min(red.x - 80, 6000)} t={t} k={smoothstep(119.5, 121, t)} />}
      <AntSide spec={RED} p={red} uid="red" ground={groundY} />
      <AntSide spec={BLACK} p={black} uid="black" ground={groundY} />
      {contact && <circle cx={bh.x} cy={bh.y} r={30 + (τ - TC + 0.05) * 140} fill="none" stroke="#fff4d0" strokeWidth={4} opacity={0.6 * (1 - (τ - TC + 0.05) / 0.45)} />}
      {/* granos que salen despedidos al frenar y al girar */}
      {[103.3, 108.6, 112].map((tt, j) => {
        const dt = τ - tt;
        if (dt < 0 || dt > 1.2) return null;
        const x0 = j === 0 ? 1400 : j === 1 ? 1180 : 1500;
        return Array.from({length: 6}, (_, i) => <circle key={`${j}-${i}`} cx={x0 + (hash1(i + j) - 0.5) * 160 + dt * (hash1(i * 3) - 0.5) * 120} cy={groundY(x0) - 10 - Math.sin(Math.PI * clamp(dt / 1.2)) * (40 + hash1(i) * 60)} r={5 + hash1(i * 5) * 5} fill="#c8a870" />);
      })}
    </SideWorld>
  );
  const overlay = (
    <>
      <Brand />
      <SimBadge k={win(t, 95, 126, 0.6)} />
      <MainTitle k={win(t, 0.5, 5.8, 0.5)} />
      <Keyword k={win(t, 3.4, 6.0, 0.4)} text="MANDÍBULAS" top={1240} />
      <Keyword k={win(t, 7.0, 9.6, 0.4)} text="VENENO" color="#ff9a6a" top={600} />
      <Big k={win(t, 16.8, 19.9, 0.4)} lines={['¿QUIÉN GANARÍA?', 'ELIGE TU FAVORITA']} top={330} size={78} color="#ffd23f" />
      <Tag k={win(t, 6.4, 9.6, 0.4)} text="SOLENOPSIS INVICTA · 5 mm (SIMULACIÓN)" top={250} color="#ffc8a8" />
      <Tag k={win(t, 9.9, 12.6, 0.4)} text="CAMPONOTUS PENNSYLVANICUS · 10 mm (SIMULACIÓN)" top={250} color="#d8f0ff" />
      <Keyword k={win(t, 99.4, 102.4, 0.4)} text="ESTRATEGIA" />
      {slow && <Tag k={win(t, SLOW.a, SLOW.b, 0.3)} text="◉ CÁMARA LENTA" top={250} color="#ffc890" />}
      <Tag k={win(t, 99.6, 104.6, 0.4)} text="POSTURAS DEFENSIVAS" top={430} color="#ffe2a0" />
      <Tag k={win(t, 109, 111.6, 0.3)} text="SECRECIÓN DE ÁCIDO FÓRMICO · REPRESENTACIÓN" top={430} color="#e8f4d8" />
      <Big k={win(t, 113, 119.6, 0.5)} lines={['RESULTADO INDIVIDUAL:', 'VENTAJA DE LA', 'HORMIGA NEGRA']} top={300} size={70} color="#ffd23f" />
      <Tag k={win(t, 120.2, 126, 0.4)} text="RASTRO QUÍMICO · RECLUTAMIENTO (REPRESENTACIÓN)" top={430} color="#ffc8a8" />
    </>
  );
  return {svg, overlay};
}
export const _k = {antPoint, gasterTip, shot};
