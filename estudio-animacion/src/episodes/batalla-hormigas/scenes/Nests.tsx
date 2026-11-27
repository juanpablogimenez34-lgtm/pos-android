// ESCENA 2 (20–45) EL PODER DE LA HORMIGA NEGRA: nido de carpinteras en madera (galerías, serrín, reina y capullos),
//                  obreras mayores y menores, anatomía de los músculos mandibulares y defensa con ácido fórmico.
// ESCENA 3 (45–70) EL ARMA DE LA HORMIGA ROJA: montículo, descenso por los túneles, cámaras de cría (reina, huevos,
//                  larvas, pupas desnudas), anatomía del aguijón (veneno, nunca fuego), antena con maza y cintura
//                  de dos segmentos, comunicación con las antenas y respuesta en grupo ante una amenaza.
import React from 'react';
import {clamp, hash1, lerp, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut} from '../../../studio2';
import {AntPose, AntSide, antPoint, gasterTip, headTip} from '../ant/AntSide';
import {BroodPile, QUEEN_BLACK, QUEEN_RED} from '../ant/Brood';
import {heroAt, XKey} from '../ant/motion';
import {AntSpec, BLACK, RED, scaleFor, spanOf, V} from '../ant/species';
import {FireMound, MOUND, WoodNest} from '../world/Macro';
import {Card, Tag, Txt, win} from '../components/common';
import {Brand, Keyword} from './ui';

const ease = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
/** Encadena encuadres con fundidos de `blend` s. */
export function camSeq(t: number, S: [number, Cam][], blend = 1): Cam {
  let i = 0;
  while (i < S.length - 1 && t >= S[i + 1][0]) i++;
  const c = S[i][1];
  const p = i > 0 ? S[i - 1][1] : c;
  const e = ease(i > 0 ? clamp((t - S[i][0]) / blend) : 1);
  return {x: lerp(p.x, c.x, e), y: lerp(p.y, c.y, e), zoom: Math.exp(lerp(Math.log(p.zoom), Math.log(c.zoom), e)), roll: lerp(p.roll, c.roll, e)};
}
/** Claves de ida y vuelta entre a y b, con pausas de exploración en los extremos. */
export function patrol(a: number, b: number, t0: number, t1: number, v: number, phase = 0, pause = 0.8): XKey[] {
  const k: XKey[] = [];
  const L = Math.abs(b - a);
  let t = t0 - phase * (L / v + pause);
  let x = a;
  k.push([t - 1, a]);
  while (t < t1 + 2) {
    k.push([t, x]);
    k.push([t + pause, x]);
    t += pause + L / v;
    x = x === a ? b : a;
  }
  k.push([t, x]);
  return k;
}
const flat = (y: number) => () => y;
/** Hormiga en una galería plana. */
function walker(spec: AntSpec, keys: XKey[], t: number, floor: number, mm: number, extra: Partial<AntPose> = {}) {
  return heroAt(spec, keys, t, {detail: mm > 0.5 ? 1 : 0.6, ...extra}, flat(floor), mm);
}
/** Hormiga grande en pantalla (tarjetas de anatomía). */
function cardPose(spec: AntSpec, cx: number, groundY: number, len: number, t: number, extra: Partial<AntPose> = {}): AntPose {
  const s = len / spanOf(spec);
  const mid = (spec.mand.base.x + spec.mand.len * 0.6 + spec.gaster.c.x - spec.gaster.rx) / 2;
  return {x: cx - mid * s, y: groundY - spec.ground * s, angle: 0, facing: 1, scale: s, t, dist: 0, speed: 0.5, scan: 0, detail: 1, rim: 0.7, ...extra};
}
const Callout: React.FC<{from: V; to: V; text: string; k: number; c?: string; a?: 'start' | 'middle' | 'end'}> = ({from, to, text, k, c = '#ffe9a8', a = 'start'}) => (
  <g opacity={k}>
    <circle cx={from.x} cy={from.y} r={9} fill={c} />
    <path d={`M${from.x} ${from.y}L${lerp(from.x, to.x, k)} ${lerp(from.y, to.y, k)}`} stroke={c} strokeWidth={3} />
    <Txt x={to.x + (a === 'start' ? 10 : a === 'end' ? -10 : 0)} y={to.y + 10} s={28} c={c} a={a}>{text}</Txt>
  </g>
);

// ================================================================== ESCENA 2
const G = [{y: 700, h: 160, a: -2400, b: 2600}, {y: 1150, h: 170, a: -2000, b: 3000}, {y: 1600, h: 150, a: -2600, b: 2200}];
const floorOf = (i: number) => G[i].y + G[i].h / 2 - 8;
const NEST = 0.3; // escala del nido (las mayores caben de pie en las galerías)
const NEST_ANTS = [
  {g: 0, a: -1800, b: 1400, v: 520, ph: 0.1, mm: 1, s: 0.1},
  {g: 0, a: -600, b: 2350, v: 430, ph: 0.6, mm: 0.62, s: 0.5},
  {g: 1, a: 1300, b: 2900, v: 480, ph: 0.3, mm: 1.12, s: 0.9},
  {g: 1, a: 1500, b: 2800, v: 560, ph: 0.8, mm: 0.58, s: 1.4},
  {g: 1, a: -1900, b: -900, v: 400, ph: 0.45, mm: 0.66, s: 2.2},
  {g: 2, a: -900, b: 1900, v: 500, ph: 0.2, mm: 0.95, s: 2.7},
  {g: 2, a: -1000, b: 1200, v: 420, ph: 0.7, mm: 0.6, s: 3.3},
];
// protagonista del nido (obrera mayor): sale hacia la entrada empujando serrín y luego se defiende
const HERO2: XKey[] = [[18, -400], [20, -200], [26.5, 1500], [29, 2300], [31, 2480], [33.4, 2480], [35.2, 1900], [36.2, 1700], [45, 1700]];
const HERO_FLOOR = floorOf(0);
// mayor y menor juntas (comparación) en la galería central
const MAJOR: XKey[] = [[30, -1500], [36.2, -80], [40, -80], [46, 800]];
const MINOR: XKey[] = [[30, -1700], [36.4, 430], [40, 430], [46, 1500]];

export function scene2(t: number): SceneOut {
  const hero = walker(BLACK, HERO2, t, HERO_FLOOR, NEST * 1.15, {
    mand: win(t, 29.6, 33.6, 0.4) * 0.5 + win(t, 39.6, 45, 0.5),
    stance: win(t, 39.6, 45, 0.6), gaster: win(t, 40.6, 45, 0.5) * 1.7, spray: win(t, 41.4, 44.6, 0.4),
    seed: 0.3, rim: 0.7, detail: 1,
  });
  const major = walker(BLACK, MAJOR, t, floorOf(1), NEST * 1.15, {seed: 1.1, mand: win(t, 36.5, 39.6, 0.4) * 0.5, detail: 1, rim: 0.6});
  const minor = walker(BLACK, MINOR, t, floorOf(1), NEST * 0.55, {seed: 2.3, detail: 1, rim: 0.6});
  const hh = headTip(BLACK, hero);
  const c = camSeq(t, [
    [20, cam(200, 1150, 0.55)], // corte del nido completo
    [23.2, cam(-1500, 1520, 1.0)], // reina y capullos
    [28.6, cam(2380, 980, 1.25)], // entrada y serrín
    [35.8, cam(160, floorOf(1) - 90, 1.75)], // mayor y menor
    [39.6, cam(hero.x - 20, HERO_FLOOR - 100, 2.9)], // defensa
  ], 1.1);
  const cc = {...c, x: c.x + Math.sin(t * 0.33) * 6, y: c.y + Math.sin(t * 0.27) * 5};
  // serrín: granos que caen desde la entrada hacia el montón
  const frass = Array.from({length: 26}, (_, i) => {
    const ph = (t * 0.35 + hash1(i * 3.1)) % 1;
    return <ellipse key={i} cx={2680 + hash1(i) * 60 + ph * 40} cy={780 + ph * ph * 1300} rx={7 + hash1(i * 5) * 6} ry={4} fill={i % 3 ? '#d8b878' : '#5a3a1a'} opacity={t > 29 ? 0.95 : 0.6} />;
  });
  const carrying = t > 29.5 && t < 33.4;
  const queen = walker(QUEEN_BLACK, [[0, -1950], [60, -1950]], t, floorOf(2), NEST, {seed: 4, detail: 1, rim: 0.5, scan: 0.4});
  const nurse = walker(BLACK, patrol(-1650, -1150, 18, 46, 160, 0.3, 1.6), t, floorOf(2), NEST * 0.6, {seed: 5, mand: 0.3});
  const svg = (
    <>
      <WoodNest cam={cc} t={t}>
        {frass}
        <BroodPile x={-1500} y={floorOf(2) - 4} t={t} cocoon s={0.65} />
        <AntSide spec={QUEEN_BLACK} p={queen} uid="qb" ground={flat(floorOf(2))} />
        <AntSide spec={BLACK} p={nurse} uid="nurse" ground={flat(floorOf(2))} />
        {NEST_ANTS.map((m, i) => (
          <AntSide key={i} spec={BLACK} uid={`n${i}`} ground={flat(floorOf(m.g))} p={walker(BLACK, patrol(m.a, m.b, 18, 46, m.v, m.ph), t, floorOf(m.g), NEST * m.mm, {seed: m.s, detail: cc.zoom > 0.9 ? 1 : 0.5})} />
        ))}
        <AntSide spec={BLACK} p={major} uid="major" ground={flat(floorOf(1))} />
        <AntSide spec={BLACK} p={minor} uid="minor" ground={flat(floorOf(1))} />
        <AntSide spec={BLACK} p={hero} uid="hero2" ground={flat(HERO_FLOOR)} />
        {carrying && <ellipse cx={hh.x + 14} cy={hh.y + 6} rx={16} ry={10} fill="#e0c088" stroke="#8a6a3a" strokeWidth={2} />}
      </WoodNest>
      <MandibleCard t={t} k={win(t, 23.8, 28.6, 0.5)} />
    </>
  );
  const overlay = (
    <>
      <Brand />
      <Keyword k={win(t, 21, 23.4, 0.4)} text="FUERZA" />
      <Tag k={win(t, 20.6, 23.4, 0.4)} text="NIDO EN MADERA · CORTE ILUSTRADO" top={250} color="#ffe2b0" />
      <Tag k={win(t, 29.4, 35.6, 0.4)} text="EXCAVA MADERA, NO LA COME" top={260} color="#ffd23f" />
      <Tag k={win(t, 30.4, 35.6, 0.4)} text="SERRÍN EXPULSADO DEL NIDO" top={330} color="#ffe9c8" />
      <Tag k={win(t, 36.3, 39.6, 0.4)} text="OBRERA MAYOR · OBRERA MENOR" top={300} color="#ffe9c8" />
      <Keyword k={win(t, 40.2, 42.6, 0.4)} text="MANDÍBULAS" />
      <Tag k={win(t, 40, 44.8, 0.4)} text="SIN AGUIJÓN · MORDISCO + ÁCIDO FÓRMICO" top={300} color="#e8f4d8" />
    </>
  );
  return {svg, overlay};
}

/** Tarjeta: mandíbulas y músculos mandibulares (ilustración). */
const MandibleCard: React.FC<{t: number; k: number}> = ({t, k}) => {
  if (k < 0.01) return null;
  const P = cardPose(BLACK, 540, 1210, 680, t, {mand: 0.5 + 0.5 * Math.sin(t * 3), scan: 0.3});
  const head = antPoint(BLACK, P, {x: 300, y: -20});
  const tip = headTip(BLACK, P);
  return (
    <Card k={k} title="MANDÍBULAS Y MÚSCULOS" y={480} h={900}>
      <AntSide spec={BLACK} p={P} uid="cardB" ground={flat(1210)} />
      <ellipse cx={head.x} cy={head.y} rx={68 * (P.scale / 0.66)} ry={58 * (P.scale / 0.66)} fill="#d8503a" opacity={0.55 + 0.15 * Math.sin(t * 3)} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M${head.x - 50} ${head.y - 34 + i * 13}Q${head.x} ${head.y - 44 + i * 15} ${head.x + 48} ${head.y - 20 + i * 8}`} stroke="#ffb090" strokeWidth={3} fill="none" opacity={0.7} />)}
      <Callout from={head} to={{x: 300, y: 640}} text="MÚSCULOS MANDIBULARES" k={clamp(k * 1.4 - 0.2)} a="middle" />
      <Callout from={tip} to={{x: 800, y: 1300}} text="MANDÍBULAS" k={clamp(k * 1.4 - 0.3)} a="middle" />
      <Txt x={540} y={1340} s={26} c="#cfe6f0" a="middle" w={600}>Ilustración simplificada</Txt>
    </Card>
  );
};

// ================================================================== ESCENA 3
const R3 = 0.62; // escala de las rojas en el montículo
const SURFACE = [
  {a: -1700, b: -300, v: 300, ph: 0.2, mm: 1, s: 0.4},
  {a: 300, b: 1900, v: 340, ph: 0.6, mm: 0.85, s: 1.3},
  {a: -1200, b: 900, v: 280, ph: 0.9, mm: 1.1, s: 2.1},
  {a: -2200, b: -900, v: 320, ph: 0.4, mm: 0.9, s: 3.2},
  {a: 700, b: 2300, v: 360, ph: 0.1, mm: 1, s: 4.4},
];
// cámara de cría (-200, 2100) con suelo elíptico
const CH = {x: -200, y: 2100, rx: 460, ry: 230};
const chFloor = (x: number) => CH.y + CH.ry * Math.sqrt(Math.max(0, 1 - ((x - CH.x) / CH.rx) ** 2)) * 0.82;
const CH2 = {x: 300, y: 2000, rx: 300, ry: 170};
const ch2Floor = (x: number) => CH2.y + CH2.ry * Math.sqrt(Math.max(0, 1 - ((x - CH2.x) / CH2.rx) ** 2)) * 0.82;
export function scene3(t: number): SceneOut {
  const c = camSeq(t, [
    [45, cam(0, 650, 0.5)], // el montículo
    [49.6, cam(-200, 1500, 0.55)], // descenso por los túneles
    [60.6, cam(-380, 2150, 1.5)], // comunicación con las antenas
    [64.4, cam(40, 2120, 1.05)], // cría, reina y respuesta en grupo
  ], 1.6);
  const cc = {...c, x: c.x + Math.sin(t * 0.31) * 6, y: c.y + Math.sin(t * 0.23) * 5};
  // amenaza: una partícula extraña cae en la cámara a 63,5 s; las obreras levantan el gáster
  const alarm = smoothstep(63.6, 64.6, t);
  const ants = [
    {k: [[44, -480], [61, -480], [62, -430], [70, -430]] as XKey[], mm: 1, s: 0.3},
    {k: [[44, -100], [61, -100], [62, -170], [70, -170]] as XKey[], mm: 1.05, s: 1.6},
    {k: patrol(-420, -170, 44, 71, 120, 0.4, 1.4), mm: 0.8, s: 2.4},
    {k: [[44, -560], [63.8, -560], [65, -380], [70, -380]] as XKey[], mm: 0.95, s: 3.6},
  ];
  const poses = ants.map((a) => {
    const p = heroAt(RED, a.k, t, {seed: a.s, detail: 1, rim: 0.5, mand: alarm * 0.9, stance: alarm, gaster: alarm * 0.8, antTarget: win(t, 61, 63.5, 0.4) * 0.8}, chFloor, R3 * a.mm);
    return p;
  });
  const chem = win(t, 60.9, 64.2, 0.5);
  const a0 = headTip(RED, poses[0]);
  const a1 = headTip(RED, poses[1]);
  const queen = heroAt(QUEEN_RED, [[0, 450], [80, 450]], t, {seed: 5, detail: 1, rim: 0.4}, ch2Floor, R3 * 0.9);
  const svg = (
    <>
      <FireMound cam={cc} t={t} brood={<BroodPile x={150} y={ch2Floor(150) - 2} t={t} cocoon={false} s={0.42} />}>
        {SURFACE.map((m, i) => (
          <AntSide key={i} spec={RED} uid={`s${i}`} ground={MOUND} p={heroAt(RED, patrol(m.a, m.b, 40, 72, m.v, m.ph), t, {seed: m.s, detail: 0.6}, MOUND, R3 * m.mm)} />
        ))}
        <AntSide spec={QUEEN_RED} p={queen} uid="qr" ground={ch2Floor} />
        {poses.map((p, i) => <AntSide key={i} spec={RED} p={p} uid={`c${i}`} ground={chFloor} />)}
        {chem > 0.01 && Array.from({length: 12}, (_, i) => {
          const u = ((t * 0.8 + i / 12) % 1);
          const x = lerp(a0.x, a1.x, u);
          const y = lerp(a0.y, a1.y, u) - 40 - Math.sin(u * Math.PI) * 50;
          return <circle key={i} cx={x} cy={y} r={7} fill="#ffcf70" opacity={chem * 0.8 * Math.sin(u * Math.PI)} />;
        })}
        {t > 63.4 && <ellipse cx={-700} cy={Math.min(chFloor(-700) - 30, 1700 + (t - 63.4) * 900)} rx={34} ry={26} fill="#6a6a58" stroke="#2a2a20" strokeWidth={3} />}
        {alarm > 0.01 && [-560, -480, -100].map((x, i) => <circle key={i} cx={x - 40} cy={chFloor(x) - 140} r={40 + ((t * 2 + i * 0.3) % 1) * 110} fill="none" stroke="#ffb070" strokeWidth={4} opacity={alarm * 0.5 * (1 - ((t * 2 + i * 0.3) % 1))} />)}
      </FireMound>
      <StingCard t={t} k={win(t, 50.5, 55.4, 0.5)} />
      <MorphCard t={t} k={win(t, 55.6, 60.6, 0.5)} />
    </>
  );
  const overlay = (
    <>
      <Brand />
      <Tag k={win(t, 45.4, 49.8, 0.4)} text="MONTÍCULO Y TÚNELES · CORTE ILUSTRADO" top={250} color="#ffe2b0" />
      <Keyword k={win(t, 51, 54, 0.4)} text="VENENO" color="#ff9a6a" top={395} />
      <Tag k={win(t, 61, 64.4, 0.4)} text="ANTENAS Y SEÑALES QUÍMICAS (REPRESENTACIÓN)" top={250} color="#ffe2b0" />
      <Keyword k={win(t, 61.4, 63.8, 0.4)} text="COMUNICACIÓN" />
      <Tag k={win(t, 64.6, 69.4, 0.4)} text="CRÍA: HUEVOS, LARVAS Y PUPAS · REINA" top={250} color="#ffe9c8" />
      <Keyword k={win(t, 66.2, 69.4, 0.4)} text="COLONIA" />
    </>
  );
  return {svg, overlay};
}

const StingCard: React.FC<{t: number; k: number}> = ({t, k}) => {
  if (k < 0.01) return null;
  const P = cardPose(RED, 560, 1200, 740, t, {sting: 0.5 + 0.5 * smoothstep(51.5, 52.5, t), gaster: 0, scan: 0.3, mand: 0.6});
  const g = antPoint(RED, P, RED.gaster.c);
  const gland = antPoint(RED, P, {x: -520, y: 10});
  const res = antPoint(RED, P, {x: -600, y: 40});
  const tip = gasterTip(RED, P);
  const s = P.scale;
  return (
    <Card k={k} title="EL AGUIJÓN" y={480} h={900}>
      <AntSide spec={RED} p={P} uid="cardS" ground={flat(1200)} />
      <ellipse cx={g.x} cy={g.y} rx={RED.gaster.rx * s * 0.9} ry={RED.gaster.ry * s * 0.85} fill="#f4e0c8" opacity={0.28} />
      <ellipse cx={gland.x} cy={gland.y} rx={58 * s} ry={34 * s} fill="#ffe070" opacity={0.85} />
      <ellipse cx={res.x} cy={res.y} rx={46 * s} ry={40 * s} fill="#c8f0a0" opacity={0.85} stroke="#5a8a3a" strokeWidth={2} />
      <path d={`M${gland.x} ${gland.y}Q${res.x} ${res.y - 30} ${res.x} ${res.y}L${tip.x} ${tip.y}`} stroke="#8ad070" strokeWidth={4} fill="none" />
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.9 + i / 3) % 1);
        return <circle key={i} cx={lerp(res.x, tip.x, u)} cy={lerp(res.y, tip.y, u)} r={6} fill="#e8ffd0" opacity={Math.sin(u * Math.PI)} />;
      })}
      <Callout from={gland} to={{x: 330, y: 700}} text="GLÁNDULA DE VENENO" k={clamp(k * 1.4 - 0.2)} a="middle" />
      <Callout from={res} to={{x: 300, y: 1290}} text="RESERVORIO" k={clamp(k * 1.4 - 0.25)} a="middle" />
      <Callout from={tip} to={{x: 170, y: 1080}} text="AGUIJÓN" k={clamp(k * 1.4 - 0.3)} a="middle" />
      <Txt x={760} y={700} s={30} c="#ffd23f" a="middle" w={900}>VENENO, NO ES FUEGO</Txt>
      <Txt x={540} y={1340} s={26} c="#cfe6f0" a="middle" w={600}>Ilustración simplificada</Txt>
    </Card>
  );
};
const MorphCard: React.FC<{t: number; k: number}> = ({t, k}) => {
  if (k < 0.01) return null;
  const P = cardPose(RED, 500, 1180, 660, t, {scan: 0, mand: 0.2});
  // punta de la antena cercana (misma geometría que el dibujo con exploración 0)
  const sc = RED.ant.scape;
  const elbowL = {x: RED.ant.base.x + Math.cos(-0.8) * sc, y: RED.ant.base.y + Math.sin(-0.8) * sc};
  const fl = RED.ant.seg * RED.ant.n;
  const club = antPoint(RED, P, {x: elbowL.x + Math.cos(0.4) * fl * 0.92, y: elbowL.y + Math.sin(0.4) * fl * 0.92});
  const w1 = antPoint(RED, P, RED.waist[0].c);
  const w2 = antPoint(RED, P, RED.waist[1].c);
  return (
    <Card k={k} title="ANTENAS Y CINTURA" y={480} h={900}>
      <AntSide spec={RED} p={P} uid="cardM" ground={flat(1180)} />
      <circle cx={club.x} cy={club.y} r={46} fill="none" stroke="#ffd23f" strokeWidth={4} />
      <circle cx={(w1.x + w2.x) / 2} cy={(w1.y + w2.y) / 2} r={70} fill="none" stroke="#ffd23f" strokeWidth={4} />
      <Callout from={club} to={{x: 760, y: 640}} text="ANTENA CON MAZA" k={clamp(k * 1.4 - 0.2)} a="middle" />
      <Callout from={{x: (w1.x + w2.x) / 2, y: (w1.y + w2.y) / 2 - 70}} to={{x: 380, y: 760}} text="CINTURA DE DOS SEGMENTOS" k={clamp(k * 1.4 - 0.3)} a="middle" />
      <Txt x={540} y={1340} s={26} c="#cfe6f0" a="middle" w={600}>Ilustración simplificada</Txt>
    </Card>
  );
};
export const _k = {scaleFor, BLACK};
