// SHORT 3 — LOS ENORMES OJOS DEL CALAMAR GIGANTE (67 s) · SHORT 4 — CÓMO CAZA EL CACHALOTE EN LA OSCURIDAD (69 s)
// · SHORT 5 — CALAMAR GIGANTE CONTRA CALAMAR COLOSAL (64 s, pantalla dividida).
import {ColossalSquid} from '../animals/ColossalSquid';
import {GiantSquid, SquidPose} from '../animals/GiantSquid';
import {Human} from '../animals/Machines';
import {SpermWhale} from '../animals/SpermWhale';
import {breathe, cam, Cam, shot, toScreen} from '../camera/camera';
import {DepthGauge, Label, Notice, SpeciesCard, Title, win} from '../components/UI';
import {EchoWaves, Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {FONT} from '../utils/fonts';
import {clamp, lerp} from '../utils/math';
import {along, phase} from '../utils/motion';
import {f1} from '../utils/spline';
import {cuts, SceneFn} from '../scenes/common';
import {ClipHalf, half, VV} from './common';

// ---------------------------------------------------------------- SHORT 3
const sq = (t: number, extra: Partial<SquidPose> = {}): SquidPose => ({t, pulse: 0.2 + 0.1 * Math.sin(t), wave: 0.5, spread: 0.2, rim: 0.45, tone: 0.1, look: {x: 300 + Math.sin(t * 0.6) * 260, y: -80 + Math.sin(t * 0.8) * 120}, fin: t * 2, ...extra});
const eyeShot = (a: number, b: number, from: Cam, to: Cam, o: {hook?: boolean; ball?: boolean; ask?: boolean} = {}): SceneFn => (t) => {
  const c = breathe(shot(t, a, b, from, to, 'cine'), t, 0.12);
  const k = o.ball ? win(t, 15.6, 21.4, 0.5) : 0;
  return {
    depth: 700,
    svg: (
      <Ocean cam={c} t={t} depth={700} snow={0.6}>
        <Glow id={`e3${a}`} x={-26} y={-18} r={300} color="#4a8ad8" k={0.35} />
        <GiantSquid uid={`e3${a}`} pose={sq(t)} x={0} y={0} scale={1} />
        {k > 0.01 && (
          <g opacity={k} transform="translate(-30 60)">
            <circle r={28 * (22 / 27)} fill="#f4f4f0" stroke="#2a2a2a" strokeWidth={1.2} />
            {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={Math.cos((i / 5) * Math.PI * 2) * 14} cy={Math.sin((i / 5) * Math.PI * 2) * 14} r={4.5} fill="#2a2a2a" />)}
            <circle r={6} fill="#2a2a2a" />
          </g>
        )}
      </Ocean>
    ),
    overlay: (
      <>
        {o.hook && <Title k={win(t, 0.3, 4.4, 0.4)} lines={['UNO DE LOS OJOS', 'MÁS GRANDES', 'DEL REINO ANIMAL']} size={80} top={250} />}
        {o.ball && <Title k={k} lines={['≈ 27 cm']} size={110} top={260} color="#ffd76a" />}
        {o.ball && <Title k={k} lines={['más que un balón de fútbol (≈ 22 cm)']} size={36} top={400} />}
        {o.ask && <Title k={win(t, 22.6, 27, 0.4)} lines={['¿POR QUÉ', 'TAN GRANDES?']} size={90} top={280} />}
      </>
    ),
    grade: {vignette: 0.9},
  };
};
/** Calamar en vertical (manto arriba, brazos abajo) — encaja en 9:16. */
const vertSquid = (camF: (t: number) => Cam, o: {card?: boolean; sepia?: boolean; flee?: boolean; scale?: boolean; fade?: boolean} = {}): SceneFn => (t) => {
  const c = camF(t);
  const jet = o.flee ? clamp((t - 38.8) / 0.6) : 0;
  const y = o.flee ? -jet * (t - 38.8) * 420 : 0;
  const UPM = 99;
  const pose = o.scale ? sq(t, {pulse: 0.05, spread: 0.02, wave: 0.15, curl: 0.05, tentacles: [{tip: {x: 700, y: 6}, ext: 1}, {tip: {x: 700, y: -6}, ext: 1}]}) : sq(t, {jet: jet * 0.9, pulse: jet * (0.5 + 0.5 * Math.sin(t * 6)), siphon: 1});
  const top = toScreen(c, VV, 0, -540);
  const bot = toScreen(c, VV, 0, 700);
  return {
    depth: 700,
    svg: (
      <Ocean cam={c} t={t} depth={700} snow={0.9} specks={0.3}>
        <Glow id={`v3${o.card ? 1 : o.scale ? 2 : 0}`} x={0} y={-200} r={900} color="#2a6aa8" k={0.35 * (o.fade ? 1 - clamp((t - 53) / 5) : 1)} />
        <g opacity={o.fade ? 1 - clamp((t - 53.5) / 5) : 1}>
          <GiantSquid uid={`v3${o.card ? 'c' : o.sepia ? 's' : o.flee ? 'f' : o.scale ? 'k' : 'd'}`} pose={pose} x={0} y={y} scale={1} angle={Math.PI / 2} />
        </g>
        {o.scale && <Human x={260} y={420} h={1.75 * UPM} t={t} label="1,75 m" />}
      </Ocean>
    ),
    overlay: (
      <>
        {o.card && <SpeciesCard k={win(t, 4.8, 9.4, 0.5)} name="Calamar gigante" sci="Architeuthis dux" info="Cientos de metros de profundidad" />}
        {o.sepia && (
          <>
            <div style={{position: 'absolute', inset: 30, border: '6px double rgba(90,60,20,0.85)', borderRadius: 8, opacity: win(t, 9.8, 14.8, 0.4), boxShadow: 'inset 0 0 160px rgba(60,35,10,0.9)'}} />
            <Title k={win(t, 10, 14.6, 0.4)} lines={['LA LEYENDA', 'DEL KRAKEN']} size={76} top={260} color="#f2dfb8" />
          </>
        )}
        {o.flee && <Title k={win(t, 38.9, 43, 0.4)} lines={['¡A ESCAPAR!']} size={84} top={300} color="#9ff0ff" />}
        {o.scale && win(t, 44, 52.2, 0.5) > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: win(t, 44, 52.2, 0.5)}}>
            <path d={`M${f1(top.x - 230)},${f1(top.y)} L${f1(top.x - 230)},${f1(bot.y)} M${f1(top.x - 250)},${f1(top.y)} l40,0 M${f1(top.x - 250)},${f1(bot.y)} l40,0`} stroke="#ffd76a" strokeWidth={5} />
            <text x={top.x - 270} y={(top.y + bot.y) / 2} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#ffd76a" stroke="rgba(0,0,0,0.75)" strokeWidth={6} paintOrder="stroke">12–13 m</text>
          </svg>
        )}
      </>
    ),
    grade: o.sepia ? {vignette: 0.9, tint: '#6a4418', tintK: 0.9 * win(t, 9.8, 14.8, 0.5)} : {vignette: 0.8},
  };
};
const hyp3: SceneFn = (t) => {
  const c = breathe(cam(100, -100, 0.56), t, 0.5);
  const wx = lerp(1300, 200, clamp((t - 27) / 11));
  const head = {x: wx - 40, y: -1000};
  return {
    depth: 900,
    svg: (
      <Ocean cam={c} t={t} depth={900} snow={1} specks={2.4} stir={[head, {x: wx + 400, y: -990}, {x: wx + 800, y: -980}]} stirR={420}>
        <SpermWhale uid="h3w" pose={{t, phase: t * 1.3, amp: 0.8, tone: 0.9, rim: 0.3}} x={wx} y={-1000} scale={0.8} dir={-1} />
        <GiantSquid uid="h3s" pose={sq(t, {look: {x: 0, y: -900}})} x={-60} y={760} scale={1.0} angle={-Math.PI / 2} />
        <path d="M-60,300 L-60,-860" stroke="#ffd76a" strokeWidth={8} strokeDasharray="24 20" opacity={0.6 * win(t, 30, 38, 0.6)} />
      </Ocean>
    ),
    overlay: (
      <>
        <Notice k={win(t, 27.6, 38, 0.4)} text="HIPÓTESIS · ILUSTRACIÓN" />
        <Title k={win(t, 29, 38, 0.5)} lines={['DETECTAR EL BRILLO', 'DE UN DEPREDADOR']} size={60} top={820} color="#9ff0ff" />
      </>
    ),
    grade: {vignette: 0.85},
  };
};
export const short3Scene: SceneFn = cuts([
  [0, eyeShot(0, 4.6, cam(-26, -18, 6), cam(-26, -18, 7.5), {hook: true})],
  [4.4, vertSquid((t) => breathe(shot(t, 4.4, 9.6, cam(0, 300, 0.7), cam(0, 100, 0.85), 'inOut'), t, 0.4), {card: true})],
  [9.6, vertSquid((t) => breathe(cam(0, 0, 0.8), t, 0.4), {sepia: true})],
  [15.2, eyeShot(15.2, 21.6, cam(-26, 0, 3.6), cam(-26, 10, 4.4), {ball: true})],
  [21.6, eyeShot(21.6, 27.2, cam(-26, -18, 5.5), cam(-20, -18, 4.6), {ask: true})],
  [27.2, hyp3],
  [38.6, vertSquid((t) => breathe(cam(0, 0 - clamp((t - 38.8) / 0.6) * (t - 38.8) * 420, 0.7), t, 0.4), {flee: true})],
  [43.4, vertSquid((t) => breathe(cam(0, 80, 0.62), t, 0.3), {scale: true})],
  [52.4, vertSquid((t) => breathe(shot(t, 52.4, 67, cam(0, -100, 1.0), cam(0, 200, 0.6), 'inOut'), t, 0.4), {fade: true})],
], 0.5);

// ---------------------------------------------------------------- SHORT 4
const WS = 0.8;
function clicks(a: number, buzz: number, b: number) {
  const out: number[] = [];
  let x = a;
  while (x < buzz) {
    out.push(x);
    x += 0.7;
  }
  let dt = 0.3;
  while (x < b) {
    out.push(x);
    x += dt;
    dt = Math.max(0.045, dt * 0.85);
  }
  return out;
}
export const SHORT4_CLICKS = [...clicks(0.6, 5.6, 5.7), ...clicks(17.2, 34.0, 38.6)];
const darkHook: SceneFn = (t) => {
  const c = breathe(cam(0, 0, 0.7), t, 0.4);
  return {
    depth: 1000,
    svg: (
      <Ocean cam={c} t={t} depth={1000} snow={1} specks={0.6}>
        <g opacity={0.25}><SpermWhale uid="h4w" pose={{t, phase: t, amp: 0.6, tone: 0.95}} x={-300} y={200} scale={WS} /></g>
        <EchoWaves t={t} origin={{x: -290, y: 168}} dir={1} clicks={SHORT4_CLICKS} speed={1400} maxR={1400} />
      </Ocean>
    ),
    overlay: <Title k={win(t, 0.3, 5.8, 0.4)} lines={['¿CAZAR EN', 'COMPLETA', 'OSCURIDAD?']} size={90} top={300} />,
    grade: {vignette: 0.85},
  };
};
const surface4: SceneFn = (t) => {
  const c = breathe(shot(t, 5.8, 13.4, cam(0, -380, 0.7), cam(120, -360, 0.8), 'inOut'), t, 0.4);
  const x = lerp(-200, 300, clamp((t - 6) / 7));
  return {
    depth: 12,
    svg: (
      <Ocean cam={c} t={t} depth={12} surfaceY={-560} snow={0.6} warp={1} schools={0.3}>
        <SpermWhale uid="s4w" pose={{t, phase: phase(t, () => 0.35), amp: 0.5, flip: 0.4, blow: clamp((t - 8) / 2.6) * (t < 10.8 ? 1 : 0), rim: 0.6}} x={x} y={-470} scale={WS} />
      </Ocean>
    ),
    overlay: <SpeciesCard k={win(t, 6.5, 12.8, 0.5)} name="Cachalote" sci="Physeter macrocephalus" info="Mayor depredador con dientes" />,
    grade: {vignette: 0.6},
  };
};
const dive4: SceneFn = (t) => {
  const u = clamp((t - 13.2) / 4.2);
  const depth = lerp(15, 1000, u);
  const p = along([[13.2, 0, -400], [17.4, 200, 1300]], t);
  const c = breathe(cam(p.x, p.y, 0.55), t, 0.4);
  return {
    depth,
    svg: (
      <Ocean cam={c} t={t} depth={depth} surfaceY={-700} snow={1.2}>
        <SpermWhale uid="d4w" pose={{t, phase: phase(t, () => 0.7, 13.2), amp: 1.1, fv: clamp(1 - Math.abs(u - 0.2) * 4), rim: 0.5, tone: u * 0.5}} x={p.x} y={p.y} scale={WS} angle={1.25} />
      </Ocean>
    ),
    overlay: (
      <>
        <DepthGauge k={1} depth={depth} compact />
        <Title k={win(t, 13.6, 17.2, 0.4)} lines={['UNA HORA', 'O MÁS']} size={86} top={300} />
      </>
    ),
    grade: {vignette: 0.75},
  };
};
const echo4 = (o: {loud?: boolean; buzz?: boolean}): SceneFn => (t) => {
  const x = lerp(-500, 0, clamp((t - 17) / 21));
  const target = {x: lerp(1100, 700, clamp((t - 17) / 21)), y: 500 + Math.sin(t * 0.6) * 30};
  const c = breathe(cam(x + 60, 200, 0.56), t, 0.4);
  const mouth = {x: x + 4 * WS, y: -32};
  return {
    depth: 1000,
    svg: (
      <Ocean cam={c} t={t} depth={1000} snow={0.9} specks={0.5}>
        <SpermWhale uid="e4w" pose={{t, phase: phase(t, () => 0.5, 17), amp: 0.8, rim: 0.55, tone: 0.3}} x={x} y={0} scale={WS} />
        <EchoWaves t={t} origin={mouth} dir={1} clicks={SHORT4_CLICKS} target={target} speed={1500} maxR={1800} spread={0.7} />
        <g opacity={0.4}><GiantSquid uid="e4s" pose={{t, pulse: 0.2, spread: 0.3, wave: 0.6, tone: 0.7}} x={target.x} y={target.y} scale={0.45} dir={-1} /></g>
      </Ocean>
    ),
    overlay: (
      <>
        <Notice k={win(t, 17.2, 38.6, 0.4)} text="ONDAS SONORAS: ILUSTRACIÓN" />
        {o.loud && <Title k={win(t, 23.2, 27.8, 0.4)} lines={['DE LOS SONIDOS', 'MÁS POTENTES', 'DEL REINO ANIMAL']} size={64} top={300} color="#9fe8ff" />}
        {o.loud && <Title k={win(t, 28.6, 33, 0.4)} lines={['ECOLOCALIZACIÓN']} size={76} top={300} color="#ffd890" />}
        {o.buzz && <Title k={win(t, 34.2, 38.6, 0.4)} lines={['CLICS MÁS RÁPIDOS:', '«ZUMBIDO»']} size={68} top={300} color="#ffd890" />}
      </>
    ),
    grade: {vignette: 0.85},
  };
};
const evidence4: SceneFn = (t) => {
  const c = breathe(cam(-330, -40, 1.6), t, 0.2);
  return {
    depth: 1000,
    svg: (
      <Ocean cam={c} t={t} depth={1000} snow={0.6}>
        <Glow id="ev4" x={-300} y={-200} r={600} color="#4a7ab0" k={0.45} />
        <SpermWhale uid="v4w" pose={{t, phase: t * 0.6, amp: 0.3, rim: 0.7}} x={0} y={0} scale={WS} />
        {[[-220, -70, 16], [-300, -40, 11], [-260, -100, 9], [-380, -60, 13], [-340, -110, 8]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#c8ccd2" strokeWidth={2.5} opacity={0.8} />)}
      </Ocean>
    ),
    overlay: (
      <>
        <Title k={win(t, 39.3, 46.4, 0.4)} lines={['PICOS DE CALAMAR', 'EN SU ESTÓMAGO']} size={66} top={300} color="#ffd76a" />
        <Label x={toScreen(c, VV, -300, -60).x} y={toScreen(c, VV, -300, -60).y} tx={620} ty={1180} text="Cicatrices de ventosas" k={win(t, 40.5, 46.4, 0.4)} />
      </>
    ),
    grade: {vignette: 0.85},
  };
};
const encounter4: SceneFn = (t) => {
  const flee = clamp((t - 50) / 1);
  const w = along([[46.6, -1300, -300], [52, -300, -100], [59, 900, 300]], t);
  const s = along([[46.6, 300, 200], [50, 260, 180], [55, 700, 700], [59, 1100, 1200]], t);
  const head = {x: w.x + 10, y: w.y - 40};
  const c = breathe(cam((w.x + 100 + s.x) / 2, (w.y + s.y) / 2, 0.42), t, 0.5);
  return {
    depth: 900,
    svg: (
      <Ocean cam={c} t={t} depth={900} snow={1.1} specks={2} stir={[head, {x: s.x, y: s.y}]} stirR={380}>
        <EchoWaves t={t} origin={head} dir={1} clicks={SHORT4_CLICKS.map((x) => x + 30).filter((x) => x < 56)} target={s} speed={1700} maxR={1700} k={0.6} />
        <GiantSquid uid="x4s" pose={{t, pulse: Math.max(flee * (0.5 + 0.5 * Math.sin(t * 7)), 0.15), jet: flee * 0.9, siphon: 1, spread: lerp(0.9, 0.05, flee), wave: 0.9, look: head, rim: 0.5, tone: 0.25}} x={s.x} y={s.y} scale={0.7} dir={-1} angle={-0.6 * flee} />
        <SpermWhale uid="x4w" pose={{t, phase: phase(t, () => 0.7, 46.6), amp: 1, rim: 0.5, tone: 0.3}} x={w.x} y={w.y} scale={WS} angle={Math.atan2(w.vy, w.vx) * 0.6} />
      </Ocean>
    ),
    overlay: (
      <>
        <Notice k={win(t, 47, 58.6, 0.4)} text="RECONSTRUCCIÓN ILUSTRATIVA" />
        <Title k={win(t, 55.2, 58.4, 0.4)} lines={['LOS CALAMARES:', 'BASE DE SU DIETA']} size={64} top={300} />
      </>
    ),
    grade: {vignette: 0.85},
  };
};
export const short4Scene: SceneFn = cuts([
  [0, darkHook],
  [5.8, surface4],
  [13.2, dive4],
  [17.2, echo4({})],
  [23, echo4({loud: true})],
  [34, echo4({buzz: true})],
  [38.8, evidence4],
  [46.6, encounter4],
  [58.8, (t) => ({...encounter4(t), overlay: null})],
], 0.5);

// ---------------------------------------------------------------- SHORT 5 (pantalla dividida)
const gPose = (t: number, extra: Partial<SquidPose> = {}): SquidPose => ({t, pulse: 0.15, spread: 0.1, wave: 0.4, curl: 0.2, rim: 0.45, tone: 0.1, fin: t * 2, ...extra});
const cPose = (t: number, hooks = 0.4) => ({t, spread: 0.35, drift: 0.5, hooks, rim: 0.5, tone: 0.1});
const split = (camG: (t: number) => Cam, camC: (t: number) => Cam, o: {hook?: boolean; giant?: boolean; colossal?: boolean; macro?: boolean; where?: boolean; eyes?: boolean; verdict?: boolean; fade?: boolean} = {}): SceneFn => (t) => {
  const cg = half(camG(t), -1);
  const cc = half(camC(t), 1);
  const fade = o.fade ? 1 - clamp((t - 56) / 6) : 1;
  return {
    depth: 1000,
    svg: (
      <g>
        <ClipHalf side={-1} id="cpG">
          <Ocean cam={cg} t={t} depth={700} snow={0.8}>
            <Glow id="s5g" x={0} y={-200} r={900} color="#2a6aa8" k={0.4 * fade} />
            <g opacity={fade}>
              <GiantSquid uid="s5G" pose={o.giant || o.verdict ? gPose(t, {tentacles: [{tip: {x: 700, y: 6}, ext: 1}, {tip: {x: 700, y: -6}, ext: 1}], wave: 0.2}) : gPose(t, o.macro ? {spread: 0.5, wave: 0.6} : {})} x={0} y={0} scale={1} />
            </g>
          </Ocean>
        </ClipHalf>
        <ClipHalf side={1} id="cpC">
          <Ocean cam={cc} t={t} depth={1600} snow={0.8} tint="#7ad8e8" tintK={o.where ? 0.45 : 0.3} surfaceY={o.where ? -500 : undefined} ice={o.where}>
            <Glow id="s5c" x={-100} y={-200} r={900} color="#3a8ab8" k={0.4 * fade} />
            <g opacity={fade}><ColossalSquid uid="s5C" pose={cPose(t, o.macro ? 0.5 + 0.5 * Math.sin(t * 1.6) : 0.4)} x={0} y={o.where ? 200 : 0} scale={1} /></g>
          </Ocean>
        </ClipHalf>
      </g>
    ),
    overlay: (
      <>
        <div style={{position: 'absolute', left: 50, top: 70, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#ffb08a', textShadow: '0 3px 10px rgba(0,0,0,0.9)'}}>CALAMAR GIGANTE</div>
        <div style={{position: 'absolute', left: 50, top: 990, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#ffd76a', textShadow: '0 3px 10px rgba(0,0,0,0.9)'}}>CALAMAR COLOSAL</div>
        {o.hook && <Title k={win(t, 0.3, 6.2, 0.4)} lines={['¿CUÁL ES', 'MÁS GRANDE?']} size={92} top={780} />}
        {o.giant && <Title k={win(t, 7, 14.6, 0.4)} lines={['LARGO Y ESBELTO · 12–13 m']} size={46} top={160} />}
        {o.colossal && <Title k={win(t, 15.4, 23.4, 0.4)} lines={['ROBUSTO · ≈ 500 kg']} size={58} top={1080} color="#ffd76a" />}
        {o.macro && <Title k={win(t, 24, 32.6, 0.4)} lines={['VENTOSAS DENTADAS']} size={50} top={160} />}
        {o.macro && <Title k={win(t, 26.5, 32.6, 0.4)} lines={['+ GANCHOS GIRATORIOS']} size={50} top={1080} color="#ffd76a" />}
        {o.where && <Title k={win(t, 33.3, 39.4, 0.4)} lines={['OCÉANOS DE TODO EL MUNDO']} size={46} top={160} />}
        {o.where && <Title k={win(t, 34.6, 39.4, 0.4)} lines={['ANTÁRTIDA']} size={58} top={1080} color="#dff6ff" />}
        {o.eyes && <Title k={win(t, 40, 50, 0.4)} lines={['OJOS ENORMES · PRESAS DEL CACHALOTE']} size={40} top={880} />}
        {o.verdict && (
          <>
            <Title k={win(t, 50.6, 55.6, 0.4)} lines={['MÁS LARGO']} size={80} top={170} color="#ffb08a" />
            <Title k={win(t, 51.6, 55.6, 0.4)} lines={['MÁS PESADO']} size={80} top={1090} color="#ffd76a" />
          </>
        )}
      </>
    ),
    grade: {vignette: 0.75},
  };
};
export const short5Scene: SceneFn = cuts([
  [0, split((t) => breathe(cam(-100, 0, 0.6), t, 0.3), (t) => breathe(cam(-60, 0, 0.72), t, 0.3), {hook: true})],
  [6.6, split((t) => breathe(shot(t, 6.6, 15, cam(60, 0, 0.5), cam(80, 0, 0.55), 'inOut'), t, 0.3), (t) => breathe(cam(-60, 0, 0.6), t, 0.3), {giant: true})],
  [15, split((t) => breathe(cam(-100, 0, 0.55), t, 0.3), (t) => breathe(shot(t, 15, 23.6, cam(-120, 0, 0.75), cam(-80, 0, 0.95), 'inOut'), t, 0.3), {colossal: true})],
  [23.6, split((t) => breathe(cam(180, 30, 2.4), t, 0.15), (t) => breathe(cam(180, 40, 2.4), t, 0.15), {macro: true})],
  [33, split((t) => breathe(cam(-100, 0, 0.55), t, 0.3), (t) => breathe(cam(-60, -100, 0.55), t, 0.3), {where: true})],
  [39.8, split((t) => breathe(shot(t, 39.8, 50.4, cam(-26, -18, 3), cam(-26, -18, 2.2), 'inOut'), t, 0.15), (t) => breathe(shot(t, 39.8, 50.4, cam(-30, -20, 2.6), cam(-30, -20, 2), 'inOut'), t, 0.15), {eyes: true})],
  [50.4, split((t) => breathe(cam(80, 0, 0.5), t, 0.3), (t) => breathe(cam(-60, 0, 0.66), t, 0.3), {verdict: true})],
  [55.8, split((t) => breathe(cam(80, 0, 0.5), t, 0.3), (t) => breathe(cam(-60, 0, 0.66), t, 0.3), {fade: true})],
], 0.5);
