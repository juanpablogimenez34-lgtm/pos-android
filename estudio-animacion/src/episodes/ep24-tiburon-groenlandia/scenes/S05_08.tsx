// ESCENAS 5–8.
//  5 (60–75)   EL SECRETO DE SU LENTITUD: plano lateral lento → cola → branquias → esquema de crecimiento.
//  6 (75–90)   MÁS DE UN SIGLO PARA MADURAR: tres tamaños (ilustrativo) → crecimiento → barra de ~150 años.
//  7 (90–105)  ¿CÓMO CONSIGUE ALIMENTO? (recreación): fondo marino, peces, restos; aproximación lenta y bocado.
//  8 (105–120) EL MISTERIO DE SUS OJOS: ojo con el copépodo → esquema del parásito → sigue nadando.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {DeepOcean, OceanFront} from '../../ep23-cachalote/environment/Ocean';
import {GreenlandShark, SL} from '../character/GreenlandShark';
import {Callout, Note, poseFrom, seg, STrack, Tag, toWorld, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {MaturityBar} from '../environment/Lab';
import {Carcass, ColdFish, Seabed} from '../environment/World';


// ---------------- ESCENA 5 ----------------
const TR5: STrack = [[60, 'SLOW_SWIM']];
export function scene05(t: number): SceneOut {
  const s = 0.9;
  const P = {x: -300 + (t - 60) * 34, y: 200 + Math.sin(t * 0.25) * 30, a: -0.02 + Math.sin(t * 0.2) * 0.04};
  const pose = poseFrom(TR5, t, {age: 0.8, tone: 0.2, rim: 0.75}, 1.7);
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, P.x, P.y, P.a, s);
  const mid = W(-0.45 * SL);
  const tail = W(-0.95 * SL);
  const gills = W(-0.18 * SL, 0.01 * SL);
  let c: Cam = cam(mid.x, mid.y + 30, 0.78);
  if (t >= 65) c = shot(t, 65, 66.2, cam(mid.x, mid.y + 30, 0.78), cam(tail.x, tail.y, 1.8), 'cine');
  if (t >= 66.2) c = cam(tail.x, tail.y, 1.8);
  if (t >= 67.6) c = shot(t, 67.6, 68.6, cam(tail.x, tail.y, 1.8), cam(gills.x, gills.y, 2.4), 'cine');
  if (t >= 68.6) c = cam(gills.x, gills.y, 2.4);
  if (t >= 70) c = shot(t, 70, 71.2, cam(gills.x, gills.y, 2.4), cam(mid.x, mid.y + 260, 0.62), 'cine');
  c = breathe(c, t, 0.18);
  const gS = toScreen(c, gills.x, gills.y);
  const tS = toScreen(c, tail.x, tail.y);
  const gk = win(t, 71.4, 74.8, 0.4);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.7} glow={0.3} violet={0.15}>
        <ColdFish t={t} cx={P.x + 700} cy={P.y - 300} n={8} s={0.5} tone={0.3} />
        <GreenlandShark uid="s5" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.6} />
        <Callout k={win(t, 66.3, 67.5)} x={tS.x} y={tS.y} tx={140} ty={560} text="la cola oscila de lado a lado" />
        <Callout k={win(t, 68.7, 69.9)} x={gS.x} y={gS.y} tx={140} ty={560} text="cinco aberturas branquiales" />
        {gk > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: gk}}>
            <rect x={90} y={300} width={900} height={400} rx={20} fill="rgba(6,18,26,0.78)" stroke="#7ad8e0" strokeWidth={2} />
            <line x1={150} y1={640} x2={940} y2={640} stroke="#cfe8ff" strokeWidth={2} />
            <line x1={150} y1={640} x2={150} y2={360} stroke="#cfe8ff" strokeWidth={2} />
            <path d={Array.from({length: Math.max(2, Math.round(30 * clamp((t - 71.4) / 1.6)))}, (_, i) => `${i ? 'L' : 'M'}${f1(150 + i * 27)},${f1(640 - 250 * (1 - Math.exp(-i / 6)))}`).join(' ')} stroke="#9ab4bc" strokeWidth={4} fill="none" strokeDasharray="10 8" />
            <path d={Array.from({length: Math.max(2, Math.round(30 * clamp((t - 72) / 1.6)))}, (_, i) => `${i ? 'L' : 'M'}${f1(150 + i * 27)},${f1(640 - 250 * (1 - Math.exp(-i / 26)))}`).join(' ')} stroke="#7affd8" strokeWidth={5} fill="none" />
            <text x={540} y={345} textAnchor="middle" fill="#eaf6ff" fontSize={28} fontWeight={900} fontFamily={FONT_FAMILY}>CRECIMIENTO MUY LENTO (esquema)</text>
            <text x={930} y={455} textAnchor="end" fill="#9ab4bc" fontSize={22} fontWeight={700} fontFamily={FONT_FAMILY}>otros tiburones</text>
            <text x={930} y={560} textAnchor="end" fill="#7affd8" fontSize={22} fontWeight={800} fontFamily={FONT_FAMILY}>tiburón de Groenlandia</text>
            <text x={540} y={680} textAnchor="middle" fill="#cfe8ff" fontSize={20} fontWeight={700} fontFamily={FONT_FAMILY}>tiempo →</text>
          </svg>
        )}
        <Note k={gk} text="Hipótesis: ritmo lento y longevidad podrían estar relacionados (aún se investiga)" top={1290} />
      </>
    ),
  };
}
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

// ---------------- ESCENA 6 ----------------
const TR6: STrack = [[75, 'JUVENILE_EXPLORATION'], [EV.growth[0], 'AGE_TRANSITION'], [EV.growth[1], 'SLOW_SWIM']];
export function scene06(t: number): SceneOut {
  if (t < EV.growth[0]) {
    const c = breathe(cam(520 + (t - 75) * 20 - 260, 300, 0.62), t, 0.2);
    const sizes = [
      {age: 0, s: 0.12, y: -120, x: 520, l: 'recién nacido'},
      {age: 0.32, s: 0.36, y: 220, x: 640, l: 'juvenil'},
      {age: 0.85, s: 0.92, y: 640, x: 760, l: 'adulto'},
    ];
    return {
      svg: (
        <DeepOcean cam={c} t={t} depth={0.6} glow={0.15} violet={0.12}>
          {sizes.map((z, i) => (
            <GreenlandShark key={i} uid={`s6-${i}`} pose={poseFrom([[75, i === 0 ? 'NEWBORN_SWIM' : i === 1 ? 'JUVENILE_EXPLORATION' : 'SLOW_SWIM']], t, {age: z.age, rim: 0.7}, i * 1.3)} x={z.x + (t - 75) * 20} y={z.y} scale={z.s} />
          ))}
        </DeepOcean>
      ),
      overlay: (
        <>
          <OceanFront cam={c} t={t} />
          <Vignette k={0.6} />
          {sizes.map((z, i) => {
            const p = toScreen(c, z.x + (t - 75) * 20 - 0.5 * SL * z.s, z.y - 0.14 * SL * z.s - 30);
            return <div key={i} style={{position: 'absolute', left: p.x - 150, top: p.y - 30, width: 300, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 26, color: '#ffd8a8', opacity: win(t, 75.5 + i * 0.4, 79.8, 0.3), textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{z.l}</div>;
          })}
          <Tag k={win(t, 75.3, 79.8, 0.4)} text="TAMAÑOS ILUSTRATIVOS" />
        </>
      ),
    };
  }
  const g = seg(t, EV.growth[0], EV.growth[1]);
  const s = lerp(0.36, 0.9, g);
  const P = {x: -200 + (t - 80) * 40, y: 1000, a: 0.02};
  const pose = poseFrom(TR6, t, {age: lerp(0.32, 0.9, g), rim: 0.75, tone: 0.15}, 2.6);
  const mid = toWorld({x: -0.42 * SL, y: 0}, P.x, P.y, P.a, s);
  const c = breathe(cam(mid.x + 40, mid.y - (t > EV.maturity ? 260 : 0) * seg(t, EV.maturity - 0.5, EV.maturity + 0.5), lerp(1.3, 0.66, g)), t, 0.2);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.62} glow={0.15} violet={0.12}>
        <GreenlandShark uid="s6g" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.6} />
        {t >= EV.maturity && <MaturityBar t={t} t0={EV.maturity} />}
        <Note k={win(t, 80.2, 85.2, 0.4)} text="Crecimiento ilustrativo: no es una medición de cada etapa" top={1290} />
      </>
    ),
  };
}

// ---------------- ESCENA 7 ----------------
const TR7: STrack = [[90, 'SEABED_EXPLORATION'], [95, 'FOOD_DETECTION'], [99.5, 'PREY_APPROACH'], [EV.feed, 'FEEDING']];
export function scene07(t: number): SceneOut {
  const s = 0.85;
  const floor = 640;
  const food = {x: 1500, y: floor + 10};
  const u = seg(t, 99.5, 103.5);
  const turn = seg(t, 95, 98);
  const P = {
    x: lerp(-700 + (t - 90) * 70, food.x - 120, u),
    y: lerp(420, food.y - 120, u) + Math.sin(t * 0.3) * 10 * (1 - u),
    a: lerp(0, 0.12, turn) + u * 0.12,
  };
  const pose = poseFrom(TR7, t, {age: 0.85, tone: 0.25, rim: 0.6}, 3.1);
  const mid = toWorld({x: -0.4 * SL, y: 0}, P.x, P.y, P.a, s);
  let c: Cam = cam(mid.x + 180, 420, 0.6);
  if (t >= 95) c = shot(t, 95, 99, cam(mid.x + 180, 420, 0.6), cam((P.x + food.x) / 2 + 120, 470, 0.55), 'cine');
  if (t >= 99) c = cam(lerp((P.x + food.x) / 2 + 120, food.x - 300, seg(t, 99, 104)), lerp(470, 520, seg(t, 99, 104)), lerp(0.55, 0.8, seg(t, 99, 104)));
  c = breathe(c, t, 0.2);
  const eaten = seg(t, EV.feed + 0.2, 105);
  const fS = toScreen(c, food.x, food.y);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.82} glow={0.3} violet={0.18}>
        <Seabed t={t} x0={-2400} x1={3600} y={floor} />
        <Carcass x={food.x} y={food.y} s={0.9} eaten={eaten} />
        <ColdFish t={t} cx={600} cy={260} n={11} s={0.55} tone={0.2} />
        <ColdFish t={t + 4} cx={1900} cy={330} n={6} s={0.5} tone={0.2} dir={-1} />
        <GreenlandShark uid="s7" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.65} />
        <Callout k={win(t, 96.4, 101.4)} x={fS.x} y={fS.y - 40} tx={560} ty={560} text="restos de un pez muerto" align="right" />
        <Tag k={win(t, 90.3, 104.8, 0.4)} text="RECREACIÓN ANIMADA" />
      </>
    ),
  };
}

// ---------------- ESCENA 8 ----------------
const TR8: STrack = [[105, 'SLOW_SWIM'], [115, 'FINAL_RETREAT']];
export function scene08(t: number): SceneOut {
  const s = 0.9;
  const P = {x: -100 + (t - 105) * 36, y: 200 + Math.sin(t * 0.3) * 20, a: -0.02};
  const pose = poseFrom(TR8, t, {age: 0.95, tone: lerp(0.2, 0.5, seg(t, 115, 120)), rim: 0.7, parasite: true}, 0.4);
  const eye = toWorld({x: -48, y: -20}, P.x, P.y, P.a, s);
  const mid = toWorld({x: -0.45 * SL, y: 0}, P.x, P.y, P.a, s);
  let c: Cam = cam(eye.x - 30, eye.y + 30, 4.2);
  if (t >= 114.6) c = shot(t, 114.6, 116.4, cam(eye.x - 30, eye.y + 30, 4.2), cam(mid.x, mid.y, 0.7), 'cine');
  c = breathe(c, t, 0.15);
  const pk = win(t, 110.4, 114.8, 0.4);
  const eS = toScreen(c, eye.x, eye.y);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.85} glow={0.3} violet={0.2}>
        <GreenlandShark uid="s8" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.6} />
        <Callout k={win(t, 106, 110.2)} x={eS.x - 60} y={eS.y + 60} tx={140} ty={560} text="copépodo adherido al ojo" />
        {pk > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: pk}}>
            <rect x={150} y={280} width={780} height={560} rx={24} fill="rgba(8,20,28,0.85)" stroke="#e8e2c8" strokeWidth={2} />
            <g transform="translate(540 560) scale(1.6)">
              <ellipse cx={0} cy={-60} rx={26} ry={16} fill="#ece4c0" />
              <path d="M0,-46 C10,0 -8,40 6,90" stroke="#e8e2c8" strokeWidth={10} fill="none" strokeLinecap="round" />
              <ellipse cx={-14} cy={108} rx={10} ry={30} fill="#e4dab0" />
              <ellipse cx={22} cy={104} rx={10} ry={30} fill="#ece4c0" />
              <path d="M-20,-70 l-14,-14 M20,-70 l14,-14" stroke="#e8e2c8" strokeWidth={5} strokeLinecap="round" />
            </g>
            <text x={540} y={340} textAnchor="middle" fill="#ffd8a8" fontSize={30} fontWeight={900} fontFamily={FONT_FAMILY}>Ommatokoita elongata</text>
            <text x={540} y={800} textAnchor="middle" fill="#cfe8ff" fontSize={22} fontWeight={700} fontFamily={FONT_FAMILY}>copépodo parásito · esquema, no a escala</text>
          </svg>
        )}
        <Note k={win(t, 115.2, 119.8, 0.4)} text="No todos los tiburones de Groenlandia lo tienen" top={1290} />
        <Wash k={0.2 * seg(t, 117, 120)} />
      </>
    ),
  };
}
