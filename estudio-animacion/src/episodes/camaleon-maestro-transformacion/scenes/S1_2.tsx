// ESCENA 1 (0–20)  EL MISTERIO: la cámara avanza entre hojas hasta un ojo que se mueve solo; se descubre el
//                  cuerpo; cambio de color progresivo; una mosca; captura con la lengua en cámara lenta; título.
// ESCENA 2 (20–45) EL NACIMIENTO: corte del suelo con la puesta enterrada; pasan los meses; un huevo se abre y
//                  la cría sale, abre los ojos y explora; trepa por una ramita; paso del tiempo hasta el adulto.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {Chameleon, chamToWorld, CHAM_ANCHORS, ChamPose} from '../character/Chameleon';
import {Branch, lookAt, makeWalk, poseOn, restFeet, scanEye, strike} from '../character/motion';
import {colorTrack} from '../character/skin';
import {BigTitle, Brand, Forest, seg, Tag, win} from '../components/common';
import {flyPath, Fly} from '../environment/Critters';
import {BranchArt, Grade, LeafCluster, LightRays, TropicalLeaf} from '../environment/Forest';

const breatheCam = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 5 * k, y: c.y + Math.sin(t * 0.29 + 1) * 4 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});

// ---------------------------------------------------------------- ESCENA 1
const B1: Branch = {pts: [{x: -700, y: 1290}, {x: 300, y: 1210}, {x: 1100, y: 1130}, {x: 1900, y: 1090}], r: 26};
const X1 = 120;
const S1 = 1.3;
const FLY_T = {x: 860, y: 860};
const ST1 = 11.0; // inicio del ataque (detección)
export function scene1(t: number): SceneOut {
  const st = strike(t, ST1, 4);
  const feet = restFeet(B1, X1, S1, 1);
  const color = colorTrack([[0, 'rest'], [7.6, 'turquoise', 2.5], [10.2, 'excited', 2.2]], t);
  const P = poseOn(B1, X1, feet, {scale: S1, facing: 1, t, color, tail: {curl: 0.85, base: 0.7}});
  const eyeW = chamToWorld(P, CHAM_ANCHORS.EYE_C);
  // mosca: deambula y se acerca; tras la captura viaja pegada a la punta de la lengua
  const fp = t < st.tHit ? (t < 9 ? flyPath(t, {x: 1300 - (t - 6) * 60, y: 700}, 90, 3) : {x: lerp(flyPath(t, {x: 1120, y: 760}, 70, 3).x, FLY_T.x, smoothstep(10, 12.6, t)), y: lerp(flyPath(t, {x: 1120, y: 760}, 70, 3).y, FLY_T.y, smoothstep(10, 12.6, t))}) : FLY_T;
  const target = t < 12.6 ? fp : FLY_T;
  P.eyeN = t < 10.2 ? scanEye(t, 2) : lookAt(eyeW, target, 1, P.angle);
  P.eyeF = t < 10.7 ? scanEye(t + 7, 9) : {yaw: 0.9, pitch: 0.15};
  P.headPitch = -0.08 * st.lean;
  P.x += st.lean * 10;
  P.jaw = st.jaw;
  if (st.ext > 0) P.tongue = {ext: st.ext, target: FLY_T, bulge: st.bulge, prey: st.caught ? <Fly x={0} y={0} t={t} s={1.3} still /> : undefined};
  P.blink = t > 5 && t < 5.2 ? Math.sin(((t - 5) / 0.2) * Math.PI) : 0;
  // cámara: ojo entre las hojas → cuerpo completo → encuadre del ataque
  const cEye = cam(eyeW.x + 10, eyeW.y + 10, 3.4);
  const cBody = cam(X1 + 330, 990, 1.0);
  const cStrike = cam(X1 + 440, 980, 1.12);
  let c = t < 3.2 ? shot(t, 0, 3.2, cam(eyeW.x + 160, eyeW.y + 30, 4.2), cEye) : t < 8 ? shot(t, 3.2, 8, cEye, cBody) : shot(t, 9.5, 12.5, cBody, cStrike);
  c = breatheCam(c, t, 0.5);
  const slow = win(t, 13.1, 15.4, 0.3);
  // hojas en primer plano que se apartan al principio
  const part = smoothstep(0.4, 3.0, t);
  const curtain = (
    <g>
      <LeafCluster x={eyeW.x - 120 - part * 520} y={eyeW.y + 60} t={t} light="day" n={5} size={420} seed={71} dark={0.45} spread={1.6} base={-0.2} />
      <LeafCluster x={eyeW.x + 160 + part * 560} y={eyeW.y - 40} t={t} light="day" n={5} size={420} seed={73} dark={0.45} spread={1.6} base={Math.PI + 0.2} />
    </g>
  );
  const main = (
    <g>
      <BranchArt b={B1} light="day" seed={5} />
      <Chameleon pose={P} uid="s1" />
      {t < st.tHit && <Fly x={fp.x} y={fp.y} t={t} s={1.3} ang={Math.sin(t * 3) * 0.3} />}
      {t < 3.6 && curtain}
    </g>
  );
  return {
    svg: <Forest cam={c} t={t} light="day" L={{seed: 3, span: [-1600, 3000]}} main={main} />,
    overlay: (
      <>
        <Brand />
        <Tag k={slow} text="◉ CÁMARA LENTA" top={240} color="#ff8a6a" />
        <BigTitle k={win(t, 15.6, 19.6, 0.5)} lines={['EL EXTRAORDINARIO', 'CAMALEÓN PANTERA']} top={300} size={92} />
        <Tag k={win(t, 16.2, 19.6, 0.5)} text="Furcifer pardalis · Madagascar" top={480} color="#c8f0d8" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 2: corte del suelo con huevos
const EGGS = Array.from({length: 17}, (_, i) => ({x: 420 + (i % 6) * 46 + (Math.floor(i / 6) % 2) * 22 + (hash1(i) - 0.5) * 10, y: 1280 - Math.floor(i / 6) * 34 + (hash1(i * 3) - 0.5) * 8, r: hash1(i * 7) * 0.5}));
const HATCH_EGG = 7;
const Soil: React.FC<{t: number}> = ({t}) => {
  const roots: string[] = [];
  for (let i = 0; i < 14; i++) {
    const x = hash1(i * 3.7) * 1080;
    let d = `M${x} 760`;
    let px = x;
    let py = 760;
    for (let k = 0; k < 6; k++) {
      const nx = px + (hash1(i * 13 + k) - 0.5) * 140;
      const ny = py + 60 + hash1(i * 7 + k) * 90;
      d += `Q${(px + nx) / 2 + 30} ${(py + ny) / 2} ${nx} ${ny}`;
      px = nx;
      py = ny;
    }
    roots.push(d);
  }
  return (
    <g>
      <defs>
        <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3e26" />
          <stop offset="0.5" stopColor="#3e2a18" />
          <stop offset="1" stopColor="#24180e" />
        </linearGradient>
        <radialGradient id="nest" cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#7a5a3a" />
          <stop offset="1" stopColor="#3a2818" />
        </radialGradient>
      </defs>
      <linearGradient id="floorsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f4a36" /><stop offset="1" stopColor="#6a8a4a" /></linearGradient>
      <rect x={-400} y={-600} width={1900} height={1360} fill="url(#floorsky)" />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M${-300 + i * 260} 700 L${-270 + i * 260} -600 L${-200 + i * 260 + (i % 2) * 40} -600 L${-170 + i * 260 + (i % 2) * 40} 700Z`} fill="#2e2418" opacity={0.75} />)}
      {Array.from({length: 9}, (_, i) => <ellipse key={`b${i}`} cx={-300 + i * 200} cy={640} rx={140} ry={60} fill={i % 2 ? '#2f5a2a' : '#3e6a30'} />)}
      <rect x={-400} y={740} width={1900} height={1500} fill="url(#soil)" />
      {Array.from({length: 6}, (_, i) => (
        <path key={i} d={`M-400 ${900 + i * 190}Q300 ${880 + i * 190 + Math.sin(i) * 40} 1500 ${910 + i * 190}`} stroke="#6a4c30" strokeWidth={3} opacity={0.35} fill="none" />
      ))}
      <path d={roots.join('')} stroke="#8a6a44" strokeWidth={4} fill="none" opacity={0.55} />
      {Array.from({length: 60}, (_, i) => (
        <ellipse key={i} cx={hash1(i * 5.1) * 1500 - 200} cy={780 + hash1(i * 2.9) * 1100} rx={6 + hash1(i) * 14} ry={4 + hash1(i * 4) * 9} fill={i % 3 ? '#7a6248' : '#9a8466'} opacity={0.7} />
      ))}
      {/* túnel excavado por la hembra y cámara de la puesta */}
      <path d="M380 760 C420 900 360 1020 420 1120 C470 1200 760 1180 760 1290 C760 1350 380 1360 380 1290 C380 1220 340 1100 300 980 C280 900 300 820 320 760Z" fill="url(#nest)" stroke="#2a1a0e" strokeWidth={3} />
      {/* superficie: hojarasca */}
      <rect x={-400} y={690} width={1900} height={70} fill="#4e3a22" />
      {Array.from({length: 40}, (_, i) => (
        <ellipse key={i} cx={hash1(i * 7.7) * 1500 - 200} cy={700 + hash1(i * 3.1) * 40} rx={26} ry={8} transform={`rotate(${hash1(i) * 60 - 30} ${hash1(i * 7.7) * 1500 - 200} ${700 + hash1(i * 3.1) * 40})`} fill={i % 2 ? '#8a6a30' : '#a07a3a'} opacity={0.9} />
      ))}
      <Grade light="golden" />
      {t < 0 ? null : null}
    </g>
  );
};
const Egg: React.FC<{x: number; y: number; crack: number; i: number}> = ({x, y, crack, i}) => (
  <g>
    <ellipse cx={x} cy={y} rx={21} ry={27} fill="#efe6cf" stroke="#a89878" strokeWidth={1.6} />
    <ellipse cx={x - 7} cy={y - 9} rx={7} ry={10} fill="#ffffff" opacity={0.55} />
    <path d={`M${x - 14} ${y + 10}q8 4 16 -2`} stroke="#c8b898" strokeWidth={1.2} fill="none" opacity={0.6} />
    {crack > 0 && (
      <path d={`M${x - 16} ${y - 4}l6 -5l5 6l6 -7l5 5l6 -4`} stroke="#3a2a18" strokeWidth={1.8} fill="none" strokeDasharray={60} strokeDashoffset={60 * (1 - crack)} />
    )}
    {i < 0 ? null : null}
  </g>
);
const B2: Branch = {pts: [{x: -400, y: 1240}, {x: 300, y: 1180}, {x: 900, y: 1080}, {x: 1500, y: 1020}], r: 7};
const BA: Branch = {pts: [{x: -700, y: 1290}, {x: 300, y: 1210}, {x: 1100, y: 1140}, {x: 1900, y: 1100}], r: 26};
export function scene2(t: number): SceneOut {
  if (t < 35.6) {
    // bajo tierra
    const c = breatheCam(shot(t, 20, 27, cam(540, 1000, 0.95), cam(560, 1240, 1.9)), t, 0.4);
    const c2 = t > 29.5 ? shot(t, 29.5, 33, c, cam(EGGS[HATCH_EGG].x + 20, EGGS[HATCH_EGG].y - 30, 3.2)) : c;
    const months = seg(t, 26.2, 29.8);
    const crack = seg(t, 28.6, 31.2);
    const emerge = seg(t, 30.8, 34.6);
    const e = EGGS[HATCH_EGG];
    // la cría: emerge girando desde dentro del huevo
    const hatch: ChamPose = {
      ...poseOn({pts: [{x: e.x - 200, y: e.y + 60}, {x: e.x + 200, y: e.y + 40}], r: 3}, e.x - 26, restFeet({pts: [{x: e.x - 200, y: e.y + 60}, {x: e.x + 200, y: e.y + 40}], r: 3}, e.x - 26, 0.16, 1), {scale: 0.16, facing: 1, t, color: {from: 'hatchling', to: 'hatchling', k: 1}, age: 0, tail: {curl: 1.2, base: 1.1}}),
    };
    hatch.y = lerp(e.y + 18, e.y - 18, emerge);
    hatch.angle = lerp(-0.9, -0.15, emerge);
    hatch.blink = 1 - smoothstep(32.6, 33.4, t);
    hatch.eyeN = scanEye(t, 4);
    hatch.feet = Object.fromEntries(Object.entries(hatch.feet).map(([k, f]) => [k, {p: {x: f.p.x + Math.sin(t * 5 + k.length) * 3 * emerge, y: f.p.y - 10 + Math.sin(t * 4 + (k === 'FN' ? 0 : 2)) * 4 * emerge}, grip: 0.5 + 0.5 * Math.sin(t * 6)}])) as ChamPose['feet'];
    const view = (
      <g transform={`translate(540 960) scale(${c2.zoom}) translate(${-c2.x} ${-c2.y})`}>
        <Soil t={t} />
        {EGGS.map((g, i) => (i === HATCH_EGG ? null : <Egg key={i} x={g.x} y={g.y} crack={0} i={i} />))}
        {emerge < 1 && <Egg x={e.x} y={e.y} crack={crack} i={HATCH_EGG} />}
        {emerge > 0 && (
          <g>
            <defs>
              <clipPath id="eggopen">
                <rect x={e.x - 90} y={e.y - 140} width={180} height={140 - 4 + emerge * 30} />
              </clipPath>
            </defs>
            <g clipPath={emerge < 0.7 ? 'url(#eggopen)' : undefined}>
              <Chameleon pose={hatch} uid="hatch" detail={0.8} />
            </g>
            {/* mitades de la cáscara */}
            <path d={`M${e.x - 21} ${e.y + 2} A21 25 0 0 0 ${e.x + 21} ${e.y + 2} L${e.x + 14} ${e.y - 2} L${e.x + 6} ${e.y + 4} L${e.x - 2} ${e.y - 3} L${e.x - 10} ${e.y + 3}Z`} fill="#efe6cf" stroke="#a89878" strokeWidth={1.4} />
          </g>
        )}
      </g>
    );
    return {
      svg: view,
      overlay: (
        <>
          <Brand />
          <Tag k={win(t, 21.5, 26, 0.5)} text="PUESTA ENTERRADA EN UN TÚNEL" top={330} color="#ffe2a0" />
          {months > 0.01 && months < 0.999 && <MonthDial k={months} />}
          <Tag k={win(t, 33.2, 35.4, 0.4)} text="LA CRÍA ABRE LOS OJOS" top={330} color="#c8f0d8" />
        </>
      ),
    };
  }
  // sobre el suelo: la cría explora y trepa por una ramita; paso del tiempo hasta el adulto
  const grow = smoothstep(41, 45, t);
  const walk = makeWalk(B2, 0.36, 1, 260, 35.6, 46, (tt) => 34 * smoothstep(36, 37, tt) * (1 - smoothstep(40.5, 41.2, tt)));
  const w = walk.at(t);
  const pc = poseOn(B2, w.x, w.feet, {scale: 0.36, facing: 1, t, color: {from: 'hatchling', to: 'hatchling', k: 1}, age: 0.05, rock: Math.sin(w.phase * Math.PI * 4) * 3, tail: {curl: 0.9}});
  pc.eyeN = scanEye(t, 5);
  pc.eyeF = scanEye(t + 3, 6);
  const pa = poseOn(BA, 160, restFeet(BA, 160, 1.1, 1), {scale: 1.1, facing: 1, t, color: colorTrack([[0, 'juvenile'], [42.5, 'rest', 2.5]], t), age: 1, tail: {curl: 0.8, base: 0.7}});
  pa.eyeN = scanEye(t, 8);
  pa.eyeF = scanEye(t + 1, 11);
  // crecimiento intermedio (juvenil)
  const mid = grow > 0.05 && grow < 0.95;
  const pj = poseOn(BA, 230, restFeet(BA, 230, lerp(0.36, 1.1, grow), 1), {scale: lerp(0.36, 1.1, grow), facing: 1, t, color: {from: 'hatchling', to: 'juvenile', k: grow}, age: grow});
  const c = breatheCam(t < 41 ? shot(t, 35.6, 41, cam(380, 1060, 2.2), cam(w.x + 90, 1040, 2.0)) : shot(t, 41, 45, cam(w.x + 90, 1040, 2.0), cam(520, 980, 1.05)), t, 0.4);
  const main = (
    <g>
      {grow < 0.5 && <BranchArt b={B2} light="golden" seed={9} twigs={false} flowers={false} />}
      {grow > 0.02 && <g opacity={grow}><BranchArt b={BA} light="golden" seed={10} /></g>}
      {grow < 0.08 && <Chameleon pose={pc} uid="cria" />}
      {mid && <g opacity={win(grow, 0.05, 0.95, 0.15)}><Chameleon pose={pj} uid="juv" /></g>}
      {grow > 0.9 && <g opacity={smoothstep(0.9, 1, grow)}><Chameleon pose={pa} uid="adulto2" /></g>}
      {/* hojarasca y brotes junto a la ramita */}
      {grow < 0.5 && [0, 1, 2, 3].map((i) => <TropicalLeaf key={i} x={150 + i * 230} y={1300 - i * 40} len={140} ang={-1.2 - hash1(i) * 0.8} t={t} light="golden" seed={i + 30} />)}
    </g>
  );
  return {
    svg: <Forest cam={c} t={t} light="golden" L={{seed: 7, span: [-1600, 2600]}} main={main} />,
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 36.5, 40.5, 0.5)} text="SIN CUIDADO DE LOS PADRES" top={330} color="#ffe2a0" />
        <Tag k={win(t, 41.2, 44.8, 0.4)} text="◷ PASAN LOS MESES" top={330} color="#c8f0d8" />
      </>
    ),
  };
}
/** Indicador del paso de los meses (lunas que se suceden). */
const MonthDial: React.FC<{k: number}> = ({k}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <g transform="translate(540 470)">
      <circle r={86} fill="#0a1410" opacity={0.75} stroke="#ffe2a0" strokeWidth={3} />
      {Array.from({length: 12}, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const on = i / 12 < k;
        return <circle key={i} cx={Math.cos(a) * 66} cy={Math.sin(a) * 66} r={8} fill={on ? '#ffe2a0' : '#3a4a40'} />;
      })}
      <path d={`M0 0L${Math.cos(k * Math.PI * 2 - Math.PI / 2) * 50} ${Math.sin(k * Math.PI * 2 - Math.PI / 2) * 50}`} stroke="#ffe2a0" strokeWidth={5} strokeLinecap="round" />
      <text y={140} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={34} fill="#fffbea" style={{paintOrder: 'stroke'}} stroke="#000" strokeWidth={5}>MESES BAJO TIERRA</text>
    </g>
  </svg>
);
export const _k = {clamp, mixColor, LightRays, Grade};
