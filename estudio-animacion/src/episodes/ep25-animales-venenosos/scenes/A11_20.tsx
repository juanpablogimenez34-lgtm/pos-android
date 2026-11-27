// ANIMALES 11–20 (araña errante, animales marinos, monstruo de Gila, ornitorrinco, ciempiés).
import {clamp, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {OceanFront, SurfaceWorld} from '../../ep23-cachalote/environment/Ocean';
import {Centipede, Spider} from '../character/Arthropods';
import {BlueRingedOctopus} from '../character/BlueRinged';
import {GilaMonster, Platypus} from '../character/Land';
import {BoxJelly, ConeSnail, Lionfish, Stingray, Stonefish} from '../character/Marine';
import * as S from '../character/species';
import {AnimalTitle, Inset, Note, seg, Vignette, win} from '../components/common';
import {ANIMALS} from '../data/timeline';
import {LandScene, SeaScene} from '../environment/Habitats';
import {AOpts} from './A01_10';

const T = (u: number, i: number, o: AOpts) => (o.titles === false ? null : <AnimalTitle u={u} n={ANIMALS[i].n} name={ANIMALS[i].name} sci={ANIMALS[i].sci} />);

// 11 · ARAÑA ERRANTE BRASILEÑA — camina sobre una hoja, detecta una amenaza y alza las patas delanteras
export function a11(u: number, o: AOpts = {}): SceneOut {
  const x = -260 + seg(u, 0, 3.2) * 380;
  const rear = seg(u, 3.6, 4.4);
  let c: Cam = cam(x - 60, -140, 1.1);
  if (u >= 3.2) c = shot(u, 3.2, 4.6, cam(x - 60, -140, 1.1), cam(x + 40, -150, 1.7), 'inOut');
  if (u >= 5.4) c = shot(u, 5.4, 6.4, cam(x + 40, -150, 1.7), cam(x + 70, -160, 2.4), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="tropicalSA">
        <path d={`M-700,-120 Q-200,${-260 + Math.sin(u) * 6} 500,-150 Q-100,${-20 + Math.sin(u) * 6} -700,-120Z`} fill="#3a7a32" stroke="#1e4a1a" strokeWidth={4} />
        <path d="M-680,-122 Q-100,-170 480,-150" stroke="#8ac070" strokeWidth={4} fill="none" opacity={0.6} />
        <Spider spec={S.WANDERING} pose={{t: u, walk: Math.min(u, 3.4) * 1.7, rear}} x={x} y={-150} scale={1.3} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 10, o)}
        <Note k={win(u, 5.2, 7.8, 0.3)} text="Caza activamente, sin red de captura" top={1290} />
      </>
    ),
  };
}

// 12 · AVISPA DE MAR — la cámara atraviesa la superficie; la campana se contrae y los tentáculos ondulan
export function a12(u: number, o: AOpts = {}): SceneOut {
  const jelly = {x: 40 + u * 10, y: 700 - u * 22};
  const pulse = u * 0.9;
  const cell = win(u, 5.4, 7.9, 0.3);
  if (u < 1.6 && o.titles !== false) {
    // cruce de la superficie
    const c = breathe(shot(u, 0, 1.6, cam(0, -280, 0.55), cam(20, 520, 0.6), 'inOut'), u, 0.15);
    return {
      svg: (
        <SurfaceWorld cam={c} t={u}>
          <BoxJelly x={jelly.x} y={jelly.y} t={u} s={1.2} pulse={pulse} />
        </SurfaceWorld>
      ),
      overlay: <Vignette k={0.5} />,
    };
  }
  let c: Cam = cam(jelly.x, jelly.y + 160, 0.9);
  if (u >= 4.8) c = shot(u, 4.8, 6, cam(jelly.x, jelly.y + 160, 0.9), cam(jelly.x - 40, jelly.y + 420, 1.6), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <SeaScene cam={c} t={u} kind="openWater">
        <BoxJelly x={jelly.x} y={jelly.y} t={u} s={1.2} pulse={pulse} drift={{x: Math.sin(u * 0.5) * 0.3, y: -0.2}} />
      </SeaScene>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={u} />
        <Vignette k={0.6} />
        {T(u, 11, o)}
        <Inset k={cell} label="cnidocitos: cápsulas urticantes (esquema)">
          <path d="M-220,0 Q0,-30 220,0" stroke="#e8f4ff" strokeWidth={30} fill="none" opacity={0.5} />
          {Array.from({length: 7}, (_, i) => (
            <g key={i} transform={`translate(${-150 + i * 50} ${-8})`}>
              <ellipse cx={0} cy={0} rx={12} ry={18} fill="#f4f8ff" stroke="#8ab0d0" strokeWidth={2} />
              <path d={`M0,-6 q6,8 0,14 q-6,6 0,12`} stroke="#5a7a9a" strokeWidth={2} fill="none" />
              {i === 3 && <path d={`M0,-18 q${10 * cell},-40 ${-6 * cell},-90`} stroke="#5a7a9a" strokeWidth={2.5} fill="none" />}
            </g>
          ))}
        </Inset>
      </>
    ),
  };
}

// 13 · PULPO DE ANILLOS AZULES — camina sobre una roca y muestra progresivamente sus anillos
export function a13(u: number, o: AOpts = {}): SceneOut {
  const rings = lerp(0.15, 1, seg(u, 3.6, 5.6));
  const x = -200 + seg(u, 0, 3.6) * 300;
  const floor = 480;
  const motion = (tt: number) => ({x: -200 + seg(tt, 0, 3.6) * 300, y: floor - 70, rot: 0, scale: 0.85, facing: 1});
  let c: Cam = cam(x, floor - 160, 1.0);
  if (u >= 3.6) c = shot(u, 3.6, 5.2, cam(x, floor - 160, 1.0), cam(x + 20, floor - 140, 1.6), 'inOut');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <SeaScene cam={c} t={u} kind="rockReef" floorY={floor}>
        <BlueRingedOctopus t={u} id="a13" timeline={[{t: 0, state: 'CRAWLING'}, {t: 3.6, state: 'THREATENED'}]} motion={motion} ground={() => floor - 10} rings={rings} />
      </SeaScene>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={u} />
        <Vignette k={0.6} />
        {T(u, 12, o)}
        <Note k={win(u, 5.4, 7.8, 0.3)} text="Anillos de advertencia (pigmento iridiscente, no luz)" top={1290} />
      </>
    ),
  };
}

// 14 · PEZ PIEDRA — una roca aparentemente normal… que respira y eriza las espinas
export function a14(u: number, o: AOpts = {}): SceneOut {
  const floor = 520;
  const reveal = seg(u, 2.0, 3.4);
  const spines = seg(u, 4.6, 5.6);
  let c: Cam = cam(60, floor - 100, 1.3);
  if (u >= 3.2) c = shot(u, 3.2, 4.4, cam(60, floor - 100, 1.3), cam(40, floor - 120, 1.6), 'inOut');
  if (u >= 5.4) c = shot(u, 5.4, 6.4, cam(40, floor - 120, 1.6), cam(10, floor - 170, 2.2), 'cine');
  c = breathe(c, u, 0.15);
  return {
    svg: (
      <SeaScene cam={c} t={u} kind="rockReef" floorY={floor}>
        <Stonefish x={40} y={floor - 50} t={u} s={1.0} spines={spines} reveal={0.45 + 0.55 * reveal} />
      </SeaScene>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={u} />
        <Vignette k={0.6} />
        {T(u, 13, o)}
        <Note k={win(u, 5.6, 7.8, 0.3)} text="13 espinas dorsales robustas que pueden inyectar veneno (Australian Museum)" top={1290} />
      </>
    ),
  };
}

// 15 · CARACOL CONO GEOGRÁFICO — emerge de la concha y avanza; esquema del diente en forma de arpón
export function a15(u: number, o: AOpts = {}): SceneOut {
  const floor = 520;
  const out = seg(u, 0.4, 2.2);
  const x = -80 + seg(u, 2, 5) * 140;
  let c: Cam = cam(x, floor - 80, 1.5);
  if (u >= 4.6) c = shot(u, 4.6, 5.6, cam(x, floor - 80, 1.5), cam(x + 60, floor - 60, 1.9), 'cine');
  c = breathe(c, u, 0.18);
  return {
    svg: (
      <SeaScene cam={c} t={u} kind="sandFloor" floorY={floor}>
        <ConeSnail x={x} y={floor - 20} t={u} s={1.0} out={out} proboscis={seg(u, 3.8, 5)} crawl={u * 0.6} />
      </SeaScene>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={u} />
        <Vignette k={0.6} />
        {T(u, 14, o)}
        <Inset k={win(u, 5.2, 7.9, 0.3)} label="diente de rádula en forma de arpón (esquema)">
          <path d="M-170,30 L120,-10" stroke="#e8dcc0" strokeWidth={14} strokeLinecap="round" />
          <path d="M120,-10 L170,-18 L118,10Z" fill="#f4ecd8" />
          <path d="M90,-6 l20,-16 M60,-2 l18,-14" stroke="#c8b890" strokeWidth={4} />
          <path d="M-170,30 L80,-4" stroke="#b8a070" strokeWidth={3} strokeDasharray="10 8" />
        </Inset>
      </>
    ),
  };
}

// 16 · PEZ LEÓN — nada despacio entre corales, despliega las aletas y gira
export function a16(u: number, o: AOpts = {}): SceneOut {
  const floor = 620;
  const turn = seg(u, 3.4, 4.8);
  const dir: 1 | -1 = turn > 0.5 ? -1 : 1;
  const x = turn < 0.5 ? -200 + u * 60 : -200 + 3.4 * 60 - (u - 4.8) * 40;
  const y = 300 + Math.sin(u * 0.7) * 20;
  const squash = Math.abs(Math.cos(turn * Math.PI));
  let c: Cam = cam(x, y - 40, 1.45);
  if (u >= 5.2) c = shot(u, 5.2, 6.4, cam(x, y - 40, 1.45), cam(x + 10, y - 90, 2.0), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <SeaScene cam={c} t={u} kind="coralReef" floorY={floor}>
        <g transform={`translate(${x} ${y}) scale(${Math.max(0.12, squash)} 1) translate(${-x} ${-y})`}>
          <Lionfish x={x} y={y} t={u} s={1.05} dir={dir} spread={0.55 + 0.4 * seg(u, 1.6, 3)} />
        </g>
      </SeaScene>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={u} />
        <Vignette k={0.6} />
        {T(u, 15, o)}
        <Note k={win(u, 5.4, 7.8, 0.3)} text="Venenosas: espinas dorsales, pélvicas y anales; las pectorales no (Australian Museum)" top={1290} />
      </>
    ),
  };
}

// 17 · RAYA — emerge de la arena y nada con ondulaciones de las aletas; arena dispersa
export function a17(u: number, o: AOpts = {}): SceneOut {
  const floor = 520;
  const sand = 1 - seg(u, 0.8, 2.4);
  const lift = seg(u, 2.0, 3.6);
  const x = -60 + seg(u, 2.4, 7.5) * 500;
  const y = floor - 10 - lift * 160;
  let c: Cam = cam(0, floor - 60, 1.2);
  if (u >= 2.4) c = shot(u, 2.4, 4.6, cam(0, floor - 60, 1.2), cam(x - 60, y - 40, 0.95), 'inOut');
  if (u >= 5.4) c = cam(x - 60 + (u - 5.4) * 20, y - 40, 0.95 + (u - 5.4) * 0.12);
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <SeaScene cam={c} t={u} kind="sandFloor" floorY={floor}>
        {sand < 0.98 && Array.from({length: 18}, (_, i) => {
          const k = clamp((u - 0.8) / 2.2);
          return <circle key={i} cx={-60 + Math.cos(i * 1.3) * (120 + k * 220)} cy={floor - 10 - k * (60 + (i % 4) * 30)} r={10 + (i % 5) * 4} fill="#d8c8a0" opacity={0.5 * (1 - k)} />;
        })}
        <g transform={`translate(${x} ${y}) scale(1 0.5) translate(${-x} ${-y})`}>
          <Stingray x={x} y={y} t={u} s={1.0} swim={lift} sand={sand} />
        </g>
      </SeaScene>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={u} />
        <Vignette k={0.6} />
        {T(u, 16, o)}
        <Note k={win(u, 5.4, 7.8, 0.3)} text="El aguijón de la cola se usa sobre todo para defenderse" top={1290} />
      </>
    ),
  };
}

// 18 · MONSTRUO DE GILA — camina despacio entre rocas, saca la lengua y gira la cabeza
export function a18(u: number, o: AOpts = {}): SceneOut {
  const x = -260 + u * 55;
  const look = win(u, 3.6, 5.6, 0.5) * 0.25;
  let c: Cam = cam(x - 80, -60, 1.2);
  if (u >= 4.8) c = shot(u, 4.8, 6, cam(x - 80, -60, 1.2), cam(x + 70, -50, 2.0), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="desertNA">
        <path d="M-1000,40 Q-900,-150 -650,-120 Q-560,-40 -540,40Z M500,40 Q600,-170 820,-130 Q900,-40 920,40Z" fill="#b08458" stroke="#7a5a3a" strokeWidth={4} />
        <GilaMonster x={x} y={-10} t={u} walk={u * 0.8 * (1 - look * 2)} s={0.85} tongue={Math.max(0, Math.sin(u * 2.2)) > 0.6 ? 1 : 0} look={look} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        {T(u, 17, o)}
        <Note k={win(u, 5.2, 7.8, 0.3)} text="Uno de los pocos lagartos venenosos: el veneno llega con la mordedura" top={1290} />
      </>
    ),
  };
}

// 19 · ORNITORRINCO MACHO — nada bajo el agua, sale a una roca; acercamiento al espolón
export function a19(u: number, o: AOpts = {}): SceneOut {
  const swim = u < 4.4;
  const x = swim ? -500 + u * 140 : 116 + (u - 4.4) * 30;
  const y = swim ? 360 - seg(u, 3.0, 4.4) * 300 : -40;
  const c = breathe(swim ? cam(x + 40, 260 - seg(u, 3.0, 4.4) * 240, 0.85) : shot(u, 4.4, 5.6, cam(x + 40, 20, 0.85), cam(x - 40, -20, 1.5), 'cine'), u, 0.2);
  return {
    svg: (
      <SurfaceWorld cam={c} t={u} tint={0.32} light={0.9}>
        {/* orilla del río, piedras y plantas acuáticas */}
        <path d="M40,60 Q60,-20 200,-30 Q420,-50 560,10 Q640,80 600,260 Q300,330 60,260 Q10,160 40,60Z" fill="#7a7462" stroke="#3a3a30" strokeWidth={4} />
        <path d="M90,-4 Q260,-36 520,0" stroke="#a8a08a" strokeWidth={8} fill="none" opacity={0.6} />
        {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={-800 + i * 180} cy={560 + (i % 3) * 30} rx={70} ry={30} fill={i % 2 ? '#6a6a5c' : '#7a786a'} />)}
        {Array.from({length: 10}, (_, i) => <path key={`p${i}`} d={`M${-900 + i * 140},600 q${Math.sin(u + i) * 20},-120 ${Math.sin(u * 1.3 + i) * 30},-240`} stroke="#4a7a3a" strokeWidth={8} fill="none" strokeLinecap="round" />)}
        <Platypus x={x} y={y} t={u} s={1.1} mode={swim ? 'swim' : 'walk'} walk={u * 0.8} angle={swim ? -seg(u, 3.0, 4.4) * 0.5 : 0} spur={win(u, 5.4, 7.8, 0.3)} wet={swim ? 1 : 0.6} />
      </SurfaceWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        {T(u, 18, o)}
        <Inset k={win(u, 5.6, 7.9, 0.3)} label="espolón del tobillo (~12 mm) unido a una glándula (esquema)">
          <path d="M-200,-40 Q-40,-80 60,-20 L120,60 L-40,90 Q-180,60 -200,-40Z" fill="#6a4a30" />
          <path d="M60,-10 L150,-90 L120,10Z" fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={3} />
          <path d="M-120,-30 Q-20,-60 80,-40" stroke="#ffd870" strokeWidth={4} strokeDasharray="10 8" fill="none" />
          <ellipse cx={-130} cy={-30} rx={34} ry={22} fill="#e8b860" opacity={0.8} />
        </Inset>
      </>
    ),
  };
}

// 20 · CIEMPIÉS GIGANTE — se desplaza entre hojas y ramas; onda coordinada de patas; forcípulas
export function a20(u: number, o: AOpts = {}): SceneOut {
  const head = -200 + u * 70;
  const path = (s: number) => {
    const xx = head - s * 0.95;
    return {x: xx, y: -30 + Math.sin(xx * 0.006 + 1.2) * 70};
  };
  const h = path(0);
  let c: Cam = cam(h.x - 160, -30, 1.4);
  if (u >= 5) c = shot(u, 5, 6.2, cam(h.x - 160, -30, 1.4), cam(h.x + 20, h.y, 2.6), 'cine');
  c = breathe(c, u, 0.2);
  return {
    svg: (
      <LandScene cam={c} t={u} kind="forestFloorSA">
        <path d="M-900,-60 L700,40" stroke="#5a3a20" strokeWidth={26} strokeLinecap="round" />
        <path d="M-200,-10 L-80,-90" stroke="#5a3a20" strokeWidth={12} strokeLinecap="round" />
        <Centipede spec={S.GIANT_CENTIPEDE} pose={{t: u, gait: u * 2.2, path}} />
      </LandScene>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {T(u, 19, o)}
        <Inset k={win(u, 5.6, 7.9, 0.3)} label="forcípulas: primer par de patas modificado (esquema)">
          <ellipse cx={20} cy={0} rx={90} ry={80} fill="#6a2414" />
          {[-1, 1].map((sd) => <path key={sd} d={`M60,${sd * 40} q90,${sd * 40} 110,${-sd * 20}`} stroke="#2a1208" strokeWidth={22} strokeLinecap="round" fill="none" />)}
          <path d="M-60,-50 q-60,-40 -120,-120 M-60,50 q-60,40 -120,120" stroke="#e8c060" strokeWidth={8} fill="none" />
        </Inset>
      </>
    ),
  };
}
