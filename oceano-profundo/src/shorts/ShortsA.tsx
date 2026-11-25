// SHORT 1 — EL PEZ QUE UTILIZA UNA LUZ PARA CAZAR (71 s) · SHORT 2 — LOS DIENTES DEL PEZ VÍBORA (65 s).
// Encuadres pensados para 9:16: el animal llena el ancho, la cámara se mueve en vertical, rótulos arriba.
import {anglerPose, Anglerfish, AnglerGlow} from '../animals/Anglerfish';
import {AttachedMale, Lanternfish, MaleAngler} from '../animals/SmallFish';
import {schoolPositions} from '../animals/Fauna';
import {Viperfish, VIPER_L, viperPoint} from '../animals/Viperfish';
import {breathe, cam, Cam, jolt, shot, toScreen} from '../camera/camera';
import {Label, SizeBar, SpeciesCard, Title, win} from '../components/UI';
import {Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {clamp, hash1, lerp} from '../utils/math';
import {along, phase} from '../utils/motion';
import {f1} from '../utils/spline';
import {cuts, SceneFn} from '../scenes/common';
import {VV} from './common';

// ---------------------------------------------------------------- SHORT 1
const A_STRIKE = 31.4;
function angler(t: number, scale = 1.6) {
  const jawK = t >= A_STRIKE && t < A_STRIKE + 0.7 ? Math.sin(clamp((t - A_STRIKE) / 0.7) * Math.PI) : 0;
  const disp = win(t, 35.6, 41, 0.8) * 0.55;
  return anglerPose({t, x: Math.sin(t * 0.21) * 20, y: Math.sin(t * 0.33) * 14, scale, facing: 1, pitch: Math.sin(t * 0.25) * 0.05, yaw: 0, jaw: Math.max(0.08, jawK, disp), lureSway: 1, lureJig: t > 27 && t < A_STRIKE ? 0.9 : 0.3, glow: 1, finRate: 1.4, gulp: clamp((t - A_STRIKE - 0.6) / 1.2) * (1 - clamp((t - 44) / 3) * 0.6) + win(t, 40, 44, 0.8) * 0.4});
}
const aShot = (a: number, b: number, from: Cam, to: Cam, o: {dark?: boolean; prey?: boolean; labels?: boolean; card?: boolean; bacteria?: boolean; male?: boolean; hand?: boolean; fade?: boolean} = {}): SceneFn => (t) => {
  const p = angler(t, o.hand ? 0.85 : 1.6);
  const e = p.escaWorld;
  let c = breathe(shot(t, a, b, from, to, 'cine'), t, 0.3);
  c = jolt(c, t, A_STRIKE, 1.2, 0.5);
  const pm = along([[26.5, 600, -700], [29.8, e.x + 160, e.y - 60], [A_STRIKE - 0.1, e.x + 26, e.y + 6]], t);
  const preyPos = t < A_STRIKE ? pm : {x: lerp(pm.x, p.mouthWorld.x, clamp((t - A_STRIKE) / 0.18)), y: lerp(pm.y, p.mouthWorld.y, clamp((t - A_STRIKE) / 0.18)), vx: -1, vy: 0, speed: 0, heading: Math.PI};
  const fill = o.dark ? 0.05 : o.fade ? 1 - clamp((t - 56.6) / 4) : 1;
  const sc = (q: {x: number; y: number}) => toScreen(c, VV, q.x, q.y);
  const fem = {x: p.p.x, y: p.p.y};
  const belly = p.toWorld({x: 10, y: 98});
  const mm = along([[44.5, belly.x + 500, belly.y + 500], [48, belly.x + 120, belly.y + 120], [49.6, belly.x + 30, belly.y + 26]], t);
  return {
    depth: 1500,
    svg: (
      <Ocean cam={c} t={t} depth={1500} snow={0.8} specks={0.4} spot={{x: 0, y: 0, r: 500, k: fill}}>
        {o.hand && (
          <g opacity={win(t, 52.4, 56.4, 0.6)} transform="translate(30 120) scale(1.4)">
            <path d="M-120,200 L-130,40 Q-140,-20 -110,-30 Q-90,-30 -88,10 L-80,-150 Q-78,-190 -52,-190 Q-28,-188 -30,-150 L-26,-40 L-12,-190 Q-8,-228 18,-226 Q42,-222 40,-186 L30,-40 L52,-170 Q58,-204 84,-200 Q108,-194 102,-160 L80,-30 L110,-120 Q122,-150 146,-142 Q166,-132 158,-104 L120,60 Q100,160 60,200Z" fill="#e8c8a8" stroke="#a88868" strokeWidth={4} />
          </g>
        )}
        <Glow id={`s1f${a}`} x={fem.x + 60} y={fem.y - 140} r={460} color="#3a7ab8" k={fill * 0.45} />
        <g opacity={o.dark ? 0.12 : 1}><Anglerfish id={`s1a${a}`} pose={p} light={0.2 + fill * 0.85} /></g>
        {o.male && (t >= 49.6 ? (
          <g transform={`translate(${f1(p.p.x)} ${f1(p.p.y)}) rotate(${f1((p.p.pitch * 180) / Math.PI)}) scale(1.6 1.6)`}><AttachedMale t={t} fuse={clamp((t - 49.6) / 3)} /></g>
        ) : (
          <MaleAngler x={mm.x} y={mm.y} scale={1.6} angle={Math.atan2(mm.vy, mm.vx)} t={t} />
        ))}
        {o.prey && t < A_STRIKE + 0.3 && <g opacity={1 - clamp((t - A_STRIKE - 0.12) / 0.1)}><Lanternfish x={preyPos.x} y={preyPos.y} scale={1.3} angle={preyPos.heading} t={t} /></g>}
        {o.bacteria && (
          <g style={{mixBlendMode: 'screen'}}>
            {Array.from({length: 40}, (_, i) => {
              const ang = hash1(i * 3) * Math.PI * 2;
              const r = Math.sqrt(hash1(i * 7)) * 8;
              return <ellipse key={i} cx={f1(e.x + Math.cos(ang + t * 0.3) * r)} cy={f1(e.y + Math.sin(ang + t * 0.3) * r)} rx={0.9} ry={0.5} fill="#eaffff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))} />;
            })}
          </g>
        )}
        <AnglerGlow id={`s1a${a}`} pose={p} zoom={c.zoom} />
      </Ocean>
    ),
    overlay: (
      <>
        {o.dark && <Title k={win(t, 0.3, 4.6, 0.4)} lines={['¿UNA LUZ EN LA', 'OSCURIDAD TOTAL?']} size={84} top={300} />}
        {o.card && <SpeciesCard k={win(t, 5, 9.8, 0.5)} name="Pez pescador abisal" sci="Linophryne arborifera" info="Zona de medianoche" />}
        {o.bacteria && <Label x={sc(e).x} y={sc(e).y} tx={sc(e).x - 100} ty={sc(e).y - 330} text="Bacterias luminosas" k={win(t, 21.6, 26, 0.4)} />}
        {o.labels && (
          <>
            <Label x={sc(p.toWorld({x: 90, y: 6})).x} y={sc(p.toWorld({x: 90, y: 6})).y} tx={640} ty={sc(p.toWorld({x: 90, y: 6})).y - 380} text="Dientes hacia adentro" k={win(t, 35.6, 40.4, 0.4)} color="#ffd76a" />
            <Label x={sc(p.toWorld({x: -10, y: 60})).x} y={sc(p.toWorld({x: -10, y: 60})).y} tx={600} ty={sc(p.toWorld({x: -10, y: 60})).y + 330} text="Estómago expandible" k={win(t, 40.2, 44, 0.4)} />
          </>
        )}
        {o.male && <Label x={sc(belly).x} y={sc(belly).y} tx={620} ty={sc(belly).y + 300} text={t < 49.6 ? 'Macho diminuto' : 'Fusionado para siempre'} k={win(t, 45, 51.8, 0.4)} />}
        {o.hand && <Title k={win(t, 52.4, 56.2, 0.5)} lines={['CABE EN LA PALMA', 'DE UNA MANO']} size={70} top={300} />}
        {o.fade && <Title k={win(t, 56.6, 60.8, 0.5)} lines={['LA LUZ NO SIEMPRE', 'SIGNIFICA SEGURIDAD']} size={64} top={300} color="#9fe8ff" />}
      </>
    ),
    grade: {vignette: 0.85},
  };
};
export const short1Scene: SceneFn = cuts([
  [0, aShot(0, 4.8, cam(180, -110, 2.6), cam(150, -80, 2.1), {dark: true})],
  [4.6, aShot(4.6, 10, cam(140, -40, 1.5), cam(40, 0, 1.75), {card: true})],
  [10, aShot(10, 15.2, cam(150, -100, 2.4), cam(120, -140, 2.0))],
  [15.2, aShot(15.2, 21.2, cam(100, -50, 1.6), cam(60, -20, 1.5))],
  [21.2, aShot(21.2, 26.4, cam(160, -100, 5.0), cam(164, -104, 7.0), {bacteria: true})],
  [26.4, aShot(26.4, 35, cam(260, -250, 1.3), cam(170, -90, 1.9), {prey: true})],
  [35, aShot(35, 44.4, cam(120, 10, 2.2), cam(40, 20, 1.8), {labels: true})],
  [44.4, aShot(44.4, 52.2, cam(100, 120, 1.6), cam(40, 140, 2.2), {male: true})],
  [52.2, aShot(52.2, 56.4, cam(40, 40, 1.4), cam(20, 30, 1.2), {hand: true})],
  [56.4, aShot(56.4, 71, cam(60, 0, 1.5), cam(0, 100, 1.0), {fade: true})],
], 0.5);

// ---------------------------------------------------------------- SHORT 2
const V_STRIKE = 26.0;
const VPATH: [number, number, number][] = [[0, 0, 0], [5, 150, -150], [9, 380, -380], [14, 520, -460], [19, 640, -500], [V_STRIKE, 900, -560], [31, 960, -600], [42, 1200, -700], [49, 1400, -900], [65, 1900, -1200]];
function viper(t: number) {
  const m = along(VPATH, t);
  const jaw = t > V_STRIKE - 0.35 && t < V_STRIKE + 0.35 ? Math.sin(clamp((t - V_STRIKE + 0.35) / 0.7) * Math.PI) : win(t, 19.6, 24.4, 0.8);
  return {x: m.x, y: m.y, ang: Math.atan2(m.vy, Math.abs(m.vx) + 1) * 0.7, pose: {t, phase: phase(t, (x) => 0.9 + clamp(along(VPATH, x).speed / 200, 0, 1.5)), amp: 0.8, jaw, glow: 0.9, rim: 0.5, tone: 0.1}};
}
const vShot = (camF: (t: number, v: ReturnType<typeof viper>) => Cam, o: {hook?: boolean; card?: boolean; size?: boolean; fang?: boolean; arc?: boolean; school?: boolean; photos?: boolean} = {}): SceneFn => (t) => {
  const v = viper(t);
  let c = camF(t, v);
  c = jolt(c, t, V_STRIKE, 1, 0.4);
  const S = 1.1;
  const W = (lx: number, ly: number) => {
    const ca = Math.cos(v.ang);
    const sa = Math.sin(v.ang);
    return toScreen(c, VV, v.x + (lx * ca - ly * sa) * S, v.y + (lx * sa + ly * ca) * S);
  };
  const school = o.school ? schoolPositions(12, t, {x: 900, y: -560}, 220, 4, clamp((t - V_STRIKE + 1) / 0.8), {x: v.x, y: v.y}) : [];
  const tail = W(-VIPER_L, 0);
  const snout = W(0, 0);
  const belly = W(-0.45 * VIPER_L, 0.07 * VIPER_L);
  const lure = viperPoint(v.pose, 0.19, -1);
  return {
    depth: 1100,
    svg: (
      <Ocean cam={c} t={t} depth={1100} snow={0.9} specks={0.5}>
        <Glow id={`v2g${o.card ? 1 : 0}${o.arc ? 1 : 0}`} x={v.x - 150} y={v.y - 200} r={700} color="#2a6aa8" k={0.4} />
        {school.map((s, i) => (i === 0 && t > V_STRIKE - 0.05 ? null : <Lanternfish key={i} x={s.p.x} y={s.p.y} scale={1.1} angle={s.a + Math.PI} t={t + i} />))}
        <Viperfish uid={`v2${o.hook ? 'h' : o.card ? 'c' : o.fang ? 'f' : o.arc ? 'a' : o.school ? 's' : o.photos ? 'p' : 'x'}`} pose={v.pose} x={v.x} y={v.y} scale={S} angle={v.ang} />
      </Ocean>
    ),
    overlay: (
      <>
        {o.hook && <Title k={win(t, 0.3, 4.6, 0.4)} lines={['COLMILLOS QUE NO', 'CABEN EN SU BOCA']} size={82} top={300} color="#ffd76a" />}
        {o.card && <SpeciesCard k={win(t, 5.2, 9, 0.5)} name="Pez víbora" sci="Chauliodus sloani" info="Zona de medianoche" />}
        {o.size && <SizeBar k={win(t, 9.6, 14, 0.5)} x={Math.min(tail.x, snout.x)} y={Math.max(tail.y, snout.y) + 140} len={Math.abs(snout.x - tail.x)} text="hasta ≈ 30 cm" />}
        {o.fang && <Label x={W(30, -40).x} y={W(30, -40).y} tx={560} ty={W(30, -40).y - 380} text="Sobresalen por fuera" k={win(t, 14.6, 19, 0.4)} color="#ffd76a" />}
        {o.arc && <Title k={win(t, 19.8, 24.6, 0.4)} lines={['APERTURA EXTREMA']} size={70} top={300} color="#ffd76a" />}
        {o.school && <Title k={win(t, 26.6, 31, 0.4)} lines={['UNA JAULA', 'DE COLMILLOS']} size={70} top={300} />}
        {o.photos && (
          <>
            <Label x={belly.x} y={belly.y} tx={Math.min(520, belly.x + 120)} ty={belly.y - 480} text="Fotóforos ventrales" k={win(t, 31.8, 41.4, 0.4)} />
            <Label x={toScreen(c, VV, v.x + lure.x * S, v.y + lure.y * S).x} y={toScreen(c, VV, v.x + lure.x * S, v.y + lure.y * S).y - 120} tx={700} ty={460} text="Señuelo dorsal" k={win(t, 36.5, 41.4, 0.4)} color="#9ff0ff" />
          </>
        )}
      </>
    ),
    grade: {vignette: 0.85},
  };
};
/** Migración vertical (diagrama a pantalla completa). */
const vMigration: SceneFn = (t) => {
  const u = (t - 42) / 7.4;
  const night = u < 0.5;
  const y = night ? lerp(1500, 700, clamp(u / 0.4)) : lerp(700, 1500, clamp((u - 0.5) / 0.4));
  return {
    depth: night ? 400 : 1100,
    svg: (
      <g>
        <defs>
          <linearGradient id="v2mig" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night ? '#0e2a4a' : '#2a8ac0'} />
            <stop offset="0.4" stopColor="#0a2a48" />
            <stop offset="1" stopColor="#020a16" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#v2mig)" />
        <path d="M0,260 L1080,260" stroke="#bfe8ff" strokeWidth={3} opacity={0.6} />
        {night ? <circle cx={860} cy={170} r={44} fill="#e8eef8" /> : <circle cx={860} cy={170} r={56} fill="#ffe08a" />}
        <g transform={`translate(560 ${f1(y)})`}>
          <Viperfish uid="v2mg" pose={{t, phase: t * 6, amp: 0.8, glow: 0.9}} x={180} y={0} scale={0.75} angle={night ? -0.7 : 0.7} />
        </g>
      </g>
    ),
    overlay: <Title k={win(t, 42.3, 49, 0.4)} lines={night ? ['DE NOCHE:', 'SUBE A COMER'] : ['DE DÍA:', 'VUELVE A LA OSCURIDAD']} size={70} top={380} />,
    grade: {vignette: 0.5},
  };
};
export const short2Scene: SceneFn = cuts([
  [0, vShot((t, v) => breathe(cam(v.x + 10, v.y - 10, 4.0 - t * 0.15), t, 0.15), {hook: true})],
  [4.8, vShot((t, v) => breathe(cam(v.x - 280, v.y + 90, 1.25), t, 0.3), {card: true})],
  [9.2, vShot((t, v) => breathe(cam(v.x - 300, v.y + 40, 1.2), t, 0.3), {size: true})],
  [14.4, vShot((t, v) => breathe(cam(v.x - 20, v.y, 3.2), t, 0.2), {fang: true})],
  [19.4, vShot((t, v) => breathe(cam(v.x - 40, v.y + 20, 2.8), t, 0.2), {arc: true})],
  [25.2, vShot((t, v) => breathe(shot(t, 25.2, 31.2, cam(800, -560, 1.2), cam(v.x + 40, v.y, 1.9), 'cine'), t, 0.3), {school: true})],
  [31.2, vShot((t, v) => breathe(shot(t, 31.2, 42, cam(v.x - 260, v.y + 60, 1.7), cam(v.x - 150, v.y - 40, 1.5), 'inOut'), t, 0.3), {photos: true})],
  [42, vMigration],
  [49.4, vShot((t, v) => breathe(shot(t, 49.4, 65, cam(v.x - 200, v.y, 1.5), cam(v.x - 500, v.y + 100, 0.9), 'inOut'), t, 0.4))],
], 0.5);
