// ESCENA 04 — EL PEZ VÍBORA (155–225 s), Chauliodus sloani.
//  155–161 en la oscuridad se desliza una hilera de luces; revelación + rótulo.
//  161–168 travelling lateral: cuerpo ondulante; colmillos que no caben en la boca.
//  168–177 caza en un banco de peces linterna: embestida, la mandíbula se abre y los colmillos «enjaulan» a la presa.
//  177–182 primer plano: apertura extrema de la mandíbula (arco de ángulo).
//  182–195 fotóforos ventrales y señuelo dorsal.
//  195–201 contrailuminación: vista desde abajo; la silueta se disimula al encender los fotóforos.
//  201–210 migración vertical diaria (diagrama día/noche).
//  210–225 vuelve a acechar y se pierde en la oscuridad.
import {Lanternfish} from '../animals/SmallFish';
import {schoolPositions} from '../animals/Fauna';
import {Viperfish, ViperPose, VIPER_L, viperPoint} from '../animals/Viperfish';
import {breathe, cam, Cam, jolt, shot, toScreen} from '../camera/camera';
import {Label, SpeciesCard, Title, win} from '../components/UI';
import {Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {FONT} from '../utils/fonts';
import {clamp, lerp} from '../utils/math';
import {along, phase} from '../utils/motion';
import {f1} from '../utils/spline';
import {cuts, SceneFn} from './common';

const VP = {w: 1920, h: 1080};
const DEPTH = 1100;
const STRIKE = 169.6;
const SC = 1.1;

/** Trayectoria del pez víbora en toda la escena (inercia y aceleración en la embestida). */
const PATH: [number, number, number][] = [
  [155, -1500, 60], [161, -700, 20], [166, 0, -10], [168.6, 420, 10], [STRIKE, 760, 30], [171, 860, 40], [177, 900, 30], [182, 960, 20], [195, 1300, 0], [210, 1700, -40], [225, 2600, -120],
];
function viper(t: number): {pose: ViperPose; x: number; y: number; ang: number} {
  const m = along(PATH, t);
  const speedK = clamp(m.speed / 160, 0.2, 2.2);
  const jaw = t > STRIKE - 0.35 && t < STRIKE + 0.35 ? Math.sin(clamp((t - STRIKE + 0.35) / 0.7) * Math.PI) : win(t, 177.2, 181.8, 0.8) * 1.0;
  return {
    pose: {t, phase: phase(t, (x) => 0.9 + clamp(along(PATH, x).speed / 200, 0, 1.6), 155), amp: 0.6 + speedK * 0.25, jaw, glow: 0.85, gulp: clamp((t - STRIKE - 0.5) / 1.5) * 0.8 * (1 - clamp((t - 190) / 10)), rim: 0.45, tone: 0.1},
    x: m.x,
    y: m.y,
    ang: Math.atan2(m.vy, Math.abs(m.vx) + 1) * 0.6,
  };
}

const swim = (keys: (t: number, v: ReturnType<typeof viper>) => Cam, opts: {card?: boolean; fangs?: boolean; dark?: number; jawArc?: boolean; photos?: boolean; school?: boolean} = {}): SceneFn => (t) => {
  const v = viper(t);
  let c = keys(t, v);
  c = jolt(c, t, STRIKE, 1, 0.4);
  const sc = (lx: number, ly: number) => {
    const ca = Math.cos(v.ang);
    const sa = Math.sin(v.ang);
    return toScreen(c, VP, v.x + (lx * ca - ly * sa) * SC, v.y + (lx * sa + ly * ca) * SC);
  };
  const fang = sc(30, -40);
  const mouth = sc(0, 10);
  const lure = sc(-0.19 * VIPER_L + 60, -170);
  const belly = sc(-0.45 * VIPER_L, 0.07 * VIPER_L);
  const school = opts.school ? schoolPositions(14, t, {x: 900, y: 20}, 260, 4, clamp((t - STRIKE + 1.2) / 0.8), {x: v.x, y: v.y}) : [];
  const dark = opts.dark ?? 0;
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} snow={0.8} specks={0.5}>
        <Glow id={`vpf${opts.card ? 1 : 0}`} x={v.x - 200} y={v.y - 160} r={700} color="#2a6aa8" k={0.35 * (1 - dark)} />
        {school.map((s, i) => (i === 0 && t > STRIKE - 0.05 ? null : <Lanternfish key={i} x={s.p.x} y={s.p.y} scale={1.1} angle={s.a + Math.PI} t={t + i} />))}
        {/* presa sujeta entre los colmillos (silueta, sin detalle gráfico) */}
        {t > STRIKE && t < 176.8 && (
          <g opacity={0.8 * (1 - clamp((t - 176) / 0.8))}>
            <Lanternfish x={mouth.x === mouth.x ? v.x + 18 * SC : 0} y={v.y + 8 * SC} scale={0.9} angle={Math.PI * 0.5} t={t} wag={0.2} />
          </g>
        )}
        <g opacity={1 - dark * 0.92}>
          <Viperfish uid={`vp${opts.card ? 'a' : opts.fangs ? 'b' : opts.jawArc ? 'c' : 'd'}`} pose={v.pose} x={v.x} y={v.y} scale={SC} angle={v.ang} />
        </g>
        {dark > 0.01 && (
          <g style={{mixBlendMode: 'screen'}} opacity={dark}>
            {Array.from({length: 26}, (_, i) => {
              const q = viperPoint(v.pose, 0.12 + i * 0.028, 1);
              return <circle key={i} cx={v.x + q.x * SC} cy={v.y + (q.y - 4) * SC} r={3} fill="#7ae4ff" />;
            })}
          </g>
        )}
      </Ocean>
    ),
    overlay: (
      <>
        {opts.card && <SpeciesCard k={win(t, 157, 163, 0.6)} name="Pez víbora" sci="Chauliodus sloani" info="Hasta unos 30 cm · zona de medianoche" />}
        {opts.fangs && <Label x={fang.x} y={fang.y} tx={fang.x - 120} ty={fang.y - 220} text="Colmillos más largos que la boca" k={win(t, 163.4, 168.2, 0.4)} color="#ffd76a" />}
        {opts.jawArc && (() => {
          const k = win(t, 177.6, 181.8, 0.4);
          if (k < 0.01) return null;
          const hinge = sc(-0.11 * VIPER_L, 0.03 * VIPER_L);
          const r = 170;
          const a0 = -0.45;
          const a1 = 1.15;
          return (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: k}}>
              <path d={`M${f1(hinge.x + r * Math.cos(a0))},${f1(hinge.y + r * Math.sin(a0))} A${r},${r} 0 0 1 ${f1(hinge.x + r * Math.cos(a1))},${f1(hinge.y + r * Math.sin(a1))}`} stroke="#ffd76a" strokeWidth={4} fill="none" strokeDasharray="12 8" />
              <text x={hinge.x + r + 20} y={hinge.y + 60} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffd76a" stroke="rgba(0,0,0,0.7)" strokeWidth={5} paintOrder="stroke">Apertura extrema</text>
            </svg>
          );
        })()}
        {opts.photos && (
          <>
            <Label x={belly.x} y={belly.y} tx={belly.x - 160} ty={belly.y + 170} text="Fotóforos ventrales" k={win(t, 182.6, 188.2, 0.4)} />
            <Label x={lure.x} y={lure.y} tx={lure.x + 200} ty={lure.y - 120} text="Señuelo en la aleta dorsal" k={win(t, 189, 195, 0.4)} color="#9ff0ff" />
          </>
        )}
        {opts.school && <Title k={win(t, 171.3, 176.4, 0.4)} lines={['UNA JAULA DE COLMILLOS']} size={46} top={110} color="#ffd76a" />}
      </>
    ),
    grade: {vignette: 0.85},
  };
};

/** Contrailuminación: vista desde abajo, contra el débil resplandor de la superficie. */
const counter: SceneFn = (t) => {
  const on = clamp((t - 197.5) / 1.5);
  const x = lerp(-800, 800, clamp((t - 195) / 7));
  return {
    depth: 600,
    svg: (
      <g>
        <defs>
          <radialGradient id="cntG" cx="0.5" cy="0" r="0.9">
            <stop offset="0" stopColor="#3a7aa8" />
            <stop offset="1" stopColor="#06182a" />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#cntG)" />
        <g transform={`translate(${960 + x} 540) scale(1.4)`}>
          {/* silueta vista desde abajo (vientre): oscura sin luz; con fotóforos se iguala al resplandor del fondo */}
          {[0, 1].map((k) => (
            <path key={k} d="M60,0 Q40,-22 -40,-26 Q-300,-30 -520,-8 L-600,-30 L-590,0 L-600,30 L-520,8 Q-300,30 -40,26 Q40,22 60,0Z M-120,-24 l-40,-50 l-30,46z M-120,24 l-40,50 l-30,-46z" fill={k === 0 ? '#05080c' : '#2a5a82'} opacity={k === 0 ? 1 - on * 0.85 : on * 0.6} />
          ))}
          {Array.from({length: 28}, (_, i) => [-1, 1].map((sd) => <circle key={`${i}${sd}`} cx={20 - i * 19} cy={sd * (14 - i * 0.25)} r={4.5} fill="#7ae4ff" opacity={on * 0.9} />))}
        </g>
      </g>
    ),
    overlay: (
      <>
        <Title k={win(t, 195.6, 201.4, 0.4)} lines={[on < 0.5 ? 'VISTO DESDE ABAJO: SILUETA OSCURA' : 'CON FOTÓFOROS: SILUETA DISIMULADA']} size={44} top={120} color={on < 0.5 ? '#ffffff' : '#9ff0ff'} />
        <Title k={win(t, 195.6, 201.4, 0.4) * 0.8} lines={['CONTRAILUMINACIÓN']} size={34} top={190} color="#ffd76a" />
      </>
    ),
    grade: {vignette: 0.6},
  };
};

/** Migración vertical diaria (diagrama). */
const migration: SceneFn = (t) => {
  const u = (t - 201.9) / 8.5;
  const night = u < 0.5;
  const y = night ? lerp(760, 380, clamp(u / 0.4)) : lerp(380, 760, clamp((u - 0.5) / 0.4));
  return {
    depth: night ? 400 : 1100,
    svg: (
      <g>
        <defs>
          <linearGradient id="migG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night ? '#0e2a4a' : '#2a8ac0'} />
            <stop offset="0.4" stopColor="#0a2a48" />
            <stop offset="1" stopColor="#020a16" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#migG)" />
        <path d="M0,140 L1920,140" stroke="#bfe8ff" strokeWidth={3} opacity={0.6} />
        {night ? <circle cx={1560} cy={80} r={34} fill="#e8eef8" /> : <circle cx={1560} cy={80} r={44} fill="#ffe08a" />}
        {[[300, 'Aguas menos profundas'], [800, 'Zona de medianoche']].map(([yy, s]) => <text key={s as string} x={120} y={yy as number} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#9fc8e0">{s}</text>)}
        <g transform={`translate(960 ${f1(y)})`}>
          <Viperfish uid="vmig" pose={{t, phase: t * 6, amp: 0.8, glow: 0.9}} x={150} y={0} scale={0.7} angle={night ? -0.5 : 0.5} />
        </g>
        <path d={`M760,${night ? 760 : 380} L760,${night ? 400 : 740}`} stroke="#ffd76a" strokeWidth={6} markerEnd="url(#migA)" opacity={0.8} />
        <defs>
          <marker id="migA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#ffd76a" /></marker>
        </defs>
      </g>
    ),
    overlay: <Title k={win(t, 202.1, 210.3, 0.4)} lines={[night ? 'DE NOCHE: SUBE A ALIMENTARSE' : 'DE DÍA: REGRESA A LA OSCURIDAD']} size={48} top={190} />,
    grade: {vignette: 0.5},
  };
};

export const scene04: SceneFn = cuts([
  [155, swim((t, v) => breathe(shot(t, 155, 161, cam(v.x + 120, v.y, 1.1), cam(v.x + 80, v.y - 20, 0.95), 'inOut'), t, 0.4), {card: true})],
  [161, swim((t, v) => breathe(cam(v.x + lerp(-120, 40, clamp((t - 161) / 7)), v.y - 10, lerp(1.05, 1.9, clamp((t - 162) / 5))), t, 0.3), {fangs: true})],
  [168.2, swim((t, v) => breathe(shot(t, 168.2, 176.8, cam(700, 0, 0.9), cam(v.x + 60, v.y, 1.45), 'cine'), t, 0.4), {school: true})],
  [176.8, swim((t, v) => breathe(cam(v.x - 40, v.y + 10, 2.3), t, 0.2), {jawArc: true})],
  [182.0, swim((t, v) => breathe(shot(t, 182, 195.2, cam(v.x - 260, v.y + 40, 1.6), cam(v.x - 120, v.y - 60, 1.35), 'inOut'), t, 0.3), {photos: true})],
  [195.2, counter],
  [201.6, migration],
  [210.6, swim((t, v) => breathe(shot(t, 210.6, 225, cam(v.x - 100, v.y, 1.2), cam(v.x - 400, v.y, 0.8), 'inOut'), t, 0.4), {dark: 0})],
], 0.6);
