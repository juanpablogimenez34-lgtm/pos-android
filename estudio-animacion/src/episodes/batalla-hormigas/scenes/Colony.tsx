// ESCENA 4 (70–95)   FUERZA CONTRA VENENO: comparación a la misma escala (10 mm frente a 5 mm), aguijón, señales
//                    químicas ilustradas y una tabla cualitativa (sin estadísticas ni porcentajes inventados).
// ESCENA 6 (120–150) CUANDO LLEGA LA COLONIA: reclutamiento por rastro químico; vista superior; muchas más rojas que
//                    negras; las negras se retiran. Escenario hipotético de la simulación (no comportamiento documentado).
// ESCENA 7 (150–180) ¿QUIÉN ES EL VERDADERO VENCEDOR?: pantalla dividida (individual / colectivo), las colonias
//                    regresan a casa, reto de la próxima batalla y cierre.
import React from 'react';
import {clamp, hash1, lerp, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {cam, SceneOut} from '../../../studio2';
import {AntPose, AntSide, antPoint, gasterTip} from '../ant/AntSide';
import {AntTop, TopPose} from '../ant/AntTop';
import {ColonyMember, heroAt, makeTrail, memberAt, XKey} from '../ant/motion';
import {AntSpec, BLACK, RED, spanOf, V} from '../ant/species';
import {BASE, SideWorld, TopWorld} from '../world/Macro';
import {BigTitle, Tag, Txt, Wash, win} from '../components/common';
import {Brand, Keyword, SimBadge} from './ui';
import {camSeq} from './Nests';
import {duelFrame} from './Duel';

const ease = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const flat = (y: number) => () => y;

// ================================================================== ESCENA 4
const GY = 1250;
const MM = 64; // px por milímetro en esta comparación
function studioPose(spec: AntSpec, cx: number, facing: 1 | -1, t: number, extra: Partial<AntPose> = {}): AntPose {
  const s = (spec.mm * MM) / spanOf(spec);
  const mid = (spec.mand.base.x + spec.mand.len * 0.6 + spec.gaster.c.x - spec.gaster.rx) / 2;
  // entrada caminando (70–72,6 s)
  const off = (1 - ease(clamp((t - 70) / 2.6))) * 620 * -facing;
  const x = cx - mid * s * facing + off;
  return {x, y: GY - spec.ground * s, angle: 0, facing, scale: s, t, dist: Math.abs(off) / s, speed: 0.8, scan: 0.7, detail: 1, rim: 0.7, ...extra};
}
const ROWS: [string, string, string][] = [
  ['TAMAÑO', '10 mm', '5 mm'],
  ['MANDÍBULAS', 'GRANDES, MUERDEN', 'SUJETAN AL PICAR'],
  ['EXOESQUELETO', 'ARMADURA RÍGIDA', 'ARMADURA RÍGIDA'],
  ['MOVILIDAD', 'ZANCADA LARGA', 'PEQUEÑA Y ÁGIL'],
  ['DEFENSA', 'ÁCIDO FÓRMICO', 'VENENO'],
  ['AGUIJÓN', 'NO', 'SÍ'],
  ['EN GRUPO', 'DEFIENDE SU NIDO', 'RESPUESTA EN GRUPO'],
];
export function scene4(t: number): SceneOut {
  const sting = win(t, 77.6, 81.4, 0.4);
  const B = studioPose(BLACK, 350, 1, t, {mand: win(t, 72.4, 76.8, 0.5) * 0.8, seed: 0.2, antTarget: win(t, 81.8, 86.8, 0.5) * 0.7});
  const R = studioPose(RED, 892, -1, t, {mand: sting * 0.6, gaster: sting * 0.9, sting, seed: 0.8, antTarget: win(t, 81.8, 86.8, 0.5) * 0.7});
  const bl = antPoint(BLACK, B, {x: BLACK.mand.base.x + 60, y: -300});
  const rl = antPoint(RED, R, {x: RED.mand.base.x + 60, y: -260});
  const chem = win(t, 81.8, 86.9, 0.5);
  const tableK = win(t, 87.6, 95.2, 0.5);
  const bLen = BLACK.mm * MM;
  const rLen = RED.mm * MM;
  const ruler = (x0: number, n: number, col: string, k: number) => (
    <g opacity={k}>
      <path d={`M${x0} ${GY + 70}L${x0 + n * MM * k} ${GY + 70}`} stroke={col} strokeWidth={6} />
      {Array.from({length: n + 1}, (_, i) => (i * MM <= n * MM * k + 0.1 ? <path key={i} d={`M${x0 + i * MM} ${GY + 70}l0 ${i % 5 === 0 ? -34 : -18}`} stroke={col} strokeWidth={4} /> : null))}
      <Txt x={x0 + (n * MM) / 2} y={GY + 130} s={40} c={col} a="middle" w={900}>{`${n} mm`}</Txt>
    </g>
  );
  const rk = clamp((t - 72.4) / 2);
  const svg = (
    <g>
      <defs>
        <radialGradient id="st4" cx="0.5" cy="0.55" r="0.7"><stop offset="0" stopColor="#5a4a32" /><stop offset="1" stopColor="#1a140c" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#st4)" />
      {Array.from({length: 12}, (_, i) => <path key={i} d={`M0 ${i * 170}L1080 ${i * 170}M${i * 100} 0L${i * 100} 1920`} stroke="#fff1d0" strokeWidth={1} opacity={0.06} />)}
      <rect x={0} y={GY} width={1080} height={700} fill="#2a2014" />
      <path d={`M0 ${GY}L1080 ${GY}`} stroke="#c8a870" strokeWidth={3} opacity={0.6} />
      {ruler(350 - bLen / 2, 10, '#d8f0ff', rk)}
      {ruler(892 - rLen / 2, 5, '#ffc8a8', rk)}
      <AntSide spec={BLACK} p={B} uid="b4" ground={flat(GY)} />
      <AntSide spec={RED} p={R} uid="r4" ground={flat(GY)} />
      {sting > 0.01 && (() => {
        const g = gasterTip(RED, R);
        return <circle cx={g.x} cy={g.y} r={44 + Math.sin(t * 5) * 4} fill="none" stroke="#ffd23f" strokeWidth={4} opacity={sting} />;
      })()}
      {chem > 0.01 && [bl, rl].map((a, j) => Array.from({length: 10}, (_, i) => {
        const u = ((t * 0.45 + i / 10) % 1);
        const to = j === 0 ? rl : bl;
        return <circle key={`${j}-${i}`} cx={lerp(a.x, to.x, u) + Math.sin(u * 9 + i) * 14} cy={lerp(a.y, to.y, u) - Math.sin(u * Math.PI) * 120} r={6 + u * 10} fill={j === 0 ? '#c8e8ff' : '#ffc890'} opacity={chem * 0.55 * Math.sin(u * Math.PI)} />;
      }))}
      {tableK > 0.01 && (
        <g opacity={tableK}>
          <rect x={50} y={320} width={980} height={560} rx={30} fill="#120c06" opacity={0.86} stroke="#ffd23f" strokeOpacity={0.4} strokeWidth={2} />
          <Txt x={540} y={385} s={34} c="#ffd23f" a="middle" w={900}>FUERZA CONTRA VENENO</Txt>
          <Txt x={560} y={440} s={26} c="#d8f0ff" a="middle" w={800}>NEGRA</Txt>
          <Txt x={880} y={440} s={26} c="#ffc8a8" a="middle" w={800}>ROJA</Txt>
          {ROWS.map((r, i) => {
            const k = clamp((t - 88 - i * 0.55) / 0.4);
            return (
              <g key={i} opacity={k}>
                <path d={`M80 ${470 + i * 58}L1000 ${470 + i * 58}`} stroke="#fff" strokeOpacity={0.1} />
                <Txt x={90} y={510 + i * 58} s={24} c="#fff2d8" w={800}>{r[0]}</Txt>
                <Txt x={560} y={510 + i * 58} s={24} c="#d8f0ff" a="middle" w={700}>{r[1]}</Txt>
                <Txt x={880} y={510 + i * 58} s={24} c="#ffc8a8" a="middle" w={700}>{r[2]}</Txt>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
  const overlay = (
    <>
      <Brand />
      <SimBadge k={win(t, 70, 95, 0.6)} />
      <Tag k={win(t, 70.6, 77, 0.4)} text="MISMA ESCALA · 10 mm FRENTE A 5 mm" top={250} color="#ffe2b0" />
      <Keyword k={win(t, 73, 76.4, 0.4)} text="FUERZA" top={560} />
      <Tag k={win(t, 77.8, 81.2, 0.4)} text="AGUIJÓN FUNCIONAL" top={1540} color="#ffc8a8" />
      <Tag k={win(t, 77.8, 81.2, 0.4)} text="NEGRA: SIN AGUIJÓN" top={250} color="#d8f0ff" />
      <Keyword k={win(t, 82.2, 86.4, 0.4)} text="COMUNICACIÓN" top={520} />
      <Tag k={win(t, 82, 86.6, 0.4)} text="SEÑALES QUÍMICAS (REPRESENTACIÓN)" top={250} color="#ffe2b0" />
      <Tag k={win(t, 88, 95, 0.4)} text="TABLA ILUSTRATIVA · SIN DATOS NUMÉRICOS SALVO EL TAMAÑO" top={250} color="#e8e0d0" />
    </>
  );
  return {svg, overlay};
}

// ================================================================== COLONIAS (vista superior)
const NEST_R: V = {x: 2600, y: -3800};
const NEST_B: V = {x: -2800, y: 3600};
const pol = (a: number, r: number): V => ({x: Math.cos(a) * r, y: Math.sin(a) * r});
const DEG = Math.PI / 180;
/** Rastro casi radial: llega desde el lado de su nido sin cruzarse con los de sus compañeras. */
function radialTrail(nest: V, a: number, r: number, seed: number) {
  const an = Math.atan2(nest.y, nest.x);
  let d = an - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const as = a + d * 0.3;
  const R0 = r + 3600 + hash1(seed) * 300;
  return makeTrail([pol(as, R0), pol(a + d * 0.12, r + 1700), pol(a + d * 0.03, r + 700), pol(a, r + 250), pol(a, r)]);
}
// rojas: 42 en cuatro filas sobre 280°; negras: 7 en el sector inferior izquierdo
const RED_ROWS: [number, number][] = [[400, 8], [700, 11], [1000, 12], [1300, 11]];
export const REDS: ColonyMember[] = [];
RED_ROWS.forEach(([r, n], row) => {
  for (let i = 0; i < n; i++) {
    const a = (-185 + ((i + 0.5 + (row % 2) * 0.3) / n) * 270) * DEG;
    const seed = row * 31 + i * 7.7;
    REDS.push({trail: radialTrail(NEST_R, a, r, seed), start: 125.2 + row * 1.4 + hash1(seed) * 3.2, speed: 470 + hash1(seed + 9) * 90, lane: 0, seed: hash1(seed + 3) * 10, stop: 0, mm: 4.6 + hash1(seed + 5) * 0.8});
  }
});
REDS.forEach((m) => (m.stop = m.trail.total));
export const BLACKS: ColonyMember[] = [];
[[700, 3], [1350, 4]].forEach(([r, n], row) => {
  for (let i = 0; i < n; i++) {
    const a = (100 + ((i + 0.5) / n) * 70) * DEG;
    const seed = 400 + row * 17 + i * 5.3;
    BLACKS.push({trail: radialTrail(NEST_B, a, r, seed), start: 121.4 + row * 0.8 + hash1(seed) * 1.6, speed: 400 + hash1(seed + 1) * 50, lane: 0, seed: hash1(seed + 2) * 10, stop: 0, mm: 9.2 + hash1(seed + 4) * 1.6});
  }
});
BLACKS.forEach((m) => (m.stop = m.trail.total));
/** Pose con giro suave de media vuelta antes de retirarse. */
function turning(spec: AntSpec, m: ColonyMember, t: number, rev: number): TopPose {
  const TURN = 0.9;
  if (t < rev) return memberAt(spec, m, t);
  if (t < rev + TURN) {
    const p = memberAt(spec, m, rev);
    const u = ease((t - rev) / TURN);
    return {...p, t, heading: p.heading + Math.PI * u * (hash1(m.seed) > 0.5 ? 1 : -1), dist: p.dist + (u * 260) / p.scale};
  }
  const p = memberAt(spec, m, t, rev + TURN);
  return {...p, dist: p.dist + 260 / p.scale};
}
const RED_PATH = [NEST_R, {x: 1500, y: -2100}, {x: 500, y: -700}, {x: 0, y: 0}];
const BLACK_PATH = [NEST_B, {x: -1700, y: 2000}, {x: -500, y: 500}, {x: 0, y: 0}];
export const FOOD_TOP: V = {x: 0, y: 0};
const BLACK_REV = 142.2;
const RED_HOME = 163.2;

function colony(t: number, detail: number, showBlacks = true, redRev?: number) {
  const fight = win(t, 136, 146, 1);
  return (
    <>
      {showBlacks && BLACKS.map((m, i) => {
        if (t < m.start) return null;
        const p = turning(BLACK, m, t, BLACK_REV + hash1(i * 3) * 1.2);
        if (Math.hypot(p.x, p.y) > 5200) return null;
        return <AntTop key={`b${i}`} spec={BLACK} uid={`b${i}`} p={{...p, detail, mand: win(t, 133, 143, 0.6) * 0.8}} />;
      })}
      {REDS.map((m, i) => {
        if (t < m.start) return null;
        const p = redRev !== undefined ? turning(RED, m, t, redRev + hash1(i * 5) * 2.2) : memberAt(RED, m, t);
        if (Math.hypot(p.x - NEST_R.x, p.y - NEST_R.y) < 300 && t > m.start + 3) return null;
        return <AntTop key={`r${i}`} spec={RED} uid={`r${i}`} p={{...p, detail, mand: 0.3 + fight * 0.6, sting: fight * (i % 3 === 0 ? 0.8 : 0.3)}} />;
      })}
    </>
  );
}
function trailsAt(t: number) {
  return [
    {pts: RED_PATH, col: '#ff8a4a', k: smoothstep(125.6, 129, t) * (1 - smoothstep(172, 176, t) * 0.6)},
    {pts: BLACK_PATH, col: '#9ac8ff', k: smoothstep(126, 129, t) * 0.5},
  ];
}
/** Marcas de feromona que se depositan a lo largo del rastro rojo (representación). */
const Phero: React.FC<{t: number; k: number}> = ({t, k}) =>
  k > 0.01 ? (
    <g>
      {Array.from({length: 40}, (_, i) => {
        const u = i / 40;
        const seg = Math.min(2, Math.floor(u * 3));
        const v = u * 3 - seg;
        const a = RED_PATH[seg];
        const b = RED_PATH[seg + 1];
        const pulse = 0.5 + 0.5 * Math.sin(t * 4 - i * 0.6);
        return <circle key={i} cx={lerp(a.x, b.x, v)} cy={lerp(a.y, b.y, v)} r={16 + pulse * 12} fill="#ffb070" opacity={k * (0.2 + pulse * 0.4)} />;
      })}
    </g>
  ) : null;

export function topColonyFrame(t: number): SceneOut {
  const c = camSeq(t, [
    [126, cam(-500, 600, 0.5)],
    [130.6, cam(150, -300, 0.3)],
    [137.6, cam(0, 60, 0.36)],
    [142.6, cam(-700, 800, 0.34)],
    [146.6, cam(-200, 300, 0.4)],
  ], 1.6);
  const svg = (
    <TopWorld cam={c} t={t} trails={trailsAt(t)} food={FOOD_TOP}>
      <Phero t={t} k={win(t, 126.4, 136, 1)} />
      {colony(t, c.zoom > 0.45 ? 0.6 : 0.35)}
    </TopWorld>
  );
  const overlay = (
    <>
      <Brand />
      <SimBadge k={1} />
      <Tag k={win(t, 126.6, 131.6, 0.4)} text="VISTA SUPERIOR · RECLUTAMIENTO QUÍMICO (REPRESENTACIÓN)" top={250} color="#ffc8a8" />
      <Keyword k={win(t, 133.2, 136.6, 0.4)} text="COLONIA" top={420} />
      <Tag k={win(t, 133.4, 137.6, 0.4)} text={`${REDS.length} ROJAS · ${BLACKS.length} NEGRAS EN ESTA SIMULACIÓN`} top={250} color="#ffe2b0" />
      <BigTitle k={win(t, 138.2, 145.4, 0.5)} lines={['ESCENARIO HIPOTÉTICO', 'EL NÚMERO', 'CAMBIA LA BATALLA']} top={300} size={72} color="#ffd23f" />
      <Tag k={win(t, 145.6, 149.6, 0.4)} text="LAS NEGRAS SE RETIRAN · NO SIEMPRE OCURRE ASÍ" top={250} color="#e8e0d0" />
    </>
  );
  return {svg, overlay};
}
export function scene6(t: number): SceneOut {
  if (t < 125.4) return duelFrame(t);
  const B = topColonyFrame(t);
  if (t >= 126.4) return B;
  const A = duelFrame(t);
  const e = ease((t - 125.4) / 1);
  return {svg: <g>{A.svg}<g opacity={e}>{B.svg}</g></g>, overlay: e < 0.5 ? A.overlay : B.overlay};
}

// ================================================================== ESCENA 7
const LEAF = BASE - 6;
const HERO7: XKey[] = [[148, -1500], [151.5, -1050], [162, -1020], [166, -1020]];
const RED7: XKey[] = [[148, -150], [151, -380], [153, -420], [162, -150], [166, 200]];
// negras que regresan a su nido en la vista superior final
const BLACK_HOME: ColonyMember[] = Array.from({length: 5}, (_, i) => {
  const a = (110 + i * 13) * DEG;
  const seed = 900 + i * 3.3;
  const tr = radialTrail(NEST_B, a, 1500 + (i % 2) * 300, seed);
  return {trail: tr, start: 162.4 - tr.total / 420, speed: 420, lane: 0, seed: hash1(seed) * 10, stop: tr.total, mm: 9.4 + hash1(seed + 1)};
});
export function scene7(t: number): SceneOut {
  const split = 1 - smoothstep(162.2, 163.2, t);
  const sideCam = cam(-860, LEAF - 190, 1.2);
  const black = heroAt(BLACK, HERO7, t, {seed: 0.2, rim: 0.7, mand: 0.4 + 0.3 * Math.sin(t * 1.3), stance: 0.5}, flat(LEAF));
  const red = heroAt(RED, RED7, t, {seed: 0.7, rim: 0.6, gaster: 0.4}, flat(LEAF));
  const topCam = camSeq(t, [[150, cam(0, 120, 0.4)], [163.2, cam(0, 200, 0.26)], [170.4, cam(0, 200, 0.3)]], 2.2);
  const top = (
    <TopWorld cam={topCam} t={t} trails={trailsAt(t)} food={FOOD_TOP}>
      {colony(t, 0.35, false, RED_HOME)}
      {t > 162.4 && BLACK_HOME.map((m, i) => <AntTop key={i} spec={BLACK} uid={`h${i}`} p={{...turning(BLACK, m, t, 162.6 + i * 0.3), detail: 0.35}} />)}
    </TopWorld>
  );
  const question = win(t, 170.4, 176.8, 0.6);
  const end = clamp((t - 176.6) / 0.6);
  const svg = (
    <g>
      {split < 0.999 && <g opacity={1 - split}>{top}</g>}
      {split > 0.001 && (
        <g opacity={split}>
          <defs>
            <clipPath id="h7top"><rect x={0} y={0} width={1080} height={952} /></clipPath>
            <clipPath id="h7bot"><rect x={0} y={968} width={1080} height={952} /></clipPath>
          </defs>
          <g clipPath="url(#h7top)">
            <g transform="translate(0 -440)">
              <SideWorld cam={sideCam} t={t} leafGround warm={1}>
                <AntSide spec={RED} p={red} uid="r7" ground={flat(LEAF)} />
                <AntSide spec={BLACK} p={black} uid="b7" ground={flat(LEAF)} />
              </SideWorld>
            </g>
          </g>
          <g clipPath="url(#h7bot)">
            <g transform="translate(0 480)">{top}</g>
          </g>
          <rect x={0} y={952} width={1080} height={16} fill="#ffd23f" />
          <Txt x={540} y={830} s={34} c="#d8f0ff" a="middle" w={900}>ENFRENTAMIENTO INDIVIDUAL</Txt>
          <Txt x={540} y={882} s={40} c="#ffd23f" a="middle" w={900}>VENTAJA POSIBLE: HORMIGA NEGRA</Txt>
          <Txt x={540} y={1040} s={34} c="#ffc8a8" a="middle" w={900}>ENFRENTAMIENTO COLECTIVO</Txt>
          <Txt x={540} y={1090} s={33} c="#ffd23f" a="middle" w={900}>VENTAJA POSIBLE: HORMIGAS ROJAS,</Txt>
          <Txt x={540} y={1134} s={33} c="#ffd23f" a="middle" w={900}>CON SUPERIORIDAD NUMÉRICA</Txt>
        </g>
      )}
    </g>
  );
  const overlay = (
    <>
      <Wash k={question * 0.55 + end * 0.3} color="#0a0602" />
      {split < 0.5 && <Brand />}
      <SimBadge k={split > 0.5 ? 0 : win(t, 162.6, 170.4, 0.5)} />
      <Tag k={win(t, 163.4, 170, 0.4) * (1 - split)} text="LAS COLONIAS REGRESAN A CASA" top={250} color="#ffe2b0" />
      <BigTitle k={win(t, 164.2, 169.9, 0.5)} lines={['NO EXISTE', 'UN VENCEDOR UNIVERSAL']} top={340} size={62} color="#ffd23f" />
      {question > 0.01 && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 380, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: question}}>
          <div style={{color: '#fff2d8', fontWeight: 900, fontSize: 52, letterSpacing: 2, textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>ELIGE LA PRÓXIMA BATALLA</div>
          {['ESCORPIÓN VS. TARÁNTULA', 'AVISPA VS. MANTIS RELIGIOSA'].map((s, i) => (
            <div key={i} style={{margin: '36px auto 0', width: 820, padding: '26px 0', borderRadius: 30, border: `3px solid ${i ? '#9ae07a' : '#ffb070'}`, background: 'rgba(10,6,2,0.7)', color: i ? '#d8ffc8' : '#ffd8b8', fontWeight: 900, fontSize: 46, transform: `translateX(${((1 - clamp((t - 171 - i * 0.6) / 0.6)) * (i ? 60 : -60)).toFixed(1)}px)`}}>{s}</div>
          ))}
        </div>
      )}
      {end > 0.01 && (
        <div style={{position: 'absolute', left: 40, right: 40, top: 360, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: end}}>
          <div style={{color: '#fff2d8', fontWeight: 900, fontSize: 64, textShadow: '0 4px 16px rgba(0,0,0,0.9)'}}>¿DE QUÉ EQUIPO ERES?</div>
          <div style={{marginTop: 30, fontWeight: 900, fontSize: 54}}>
            <span style={{color: '#d8f0ff'}}>EQUIPO NEGRA</span>
            <span style={{color: '#fff2d8'}}> VS. </span>
            <span style={{color: '#ff9a6a'}}>EQUIPO ROJA</span>
          </div>
          <div style={{marginTop: 70, color: '#ffd23f', fontWeight: 900, fontSize: 50, letterSpacing: 6}}>MUNDO INSÓLITO</div>
          <div style={{marginTop: 8, color: '#fff2d8', fontWeight: 800, fontSize: 34, letterSpacing: 5}}>BATALLAS DE LA NATURALEZA</div>
        </div>
      )}
    </>
  );
  return {svg, overlay};
}
export const _k = {lerp};
