// ESCENAS 5–8.
//  5 (30–40) EL COLAPSO: viaje microscópico al interior de la burbuja que se encoge; el gas comprimido se calienta
//            por un instante («MILES DE GRADOS»), destello diminuto y brevísimo, onda de choque. Aclaración: el
//            calentamiento es microscópico y momentáneo; el agua de alrededor no hierve.
//  6 (40–50) LA CAZA: en el arrecife, el chasquido aturde a un pez pequeño (sin violencia) y el camarón se acerca.
//  7 (50–56) FÍSICA COMO ARMA: plano heroico; la cámara gira suavemente; antenas en movimiento.
//  8 (56–60) OTRA PRESA: detecta otra presa; la cámara se acerca a la pinza y termina en el encuadre del
//            fotograma 0 (bucle).
import {clamp, lerp, mixColor} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {Shrimp, ShrimpPose} from '../character/Shrimp';
import {BigTitle, Info, Label, poseFrom, SciTag, seg, snapOpen, STrack, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {BubbleFX, clawTip, FlashFX, PreyFish, Reef, ShockFX, StirFX} from '../environment/Reef';
import {FEET, FLOOR, HOOK_CAM, HOOK_FISH, shake, snapFX} from './S1_4';

// ---------------- ESCENA 5 (30–40) ----------------
export function scene5(t: number): SceneOut {
  const sx = 0;
  const sy = FLOOR - FEET;
  const pose: ShrimpPose = {...poseFrom([[30, 'SNAPPING']], t), open: 0, alert: 1, swim: 0.3};
  const tip = clawTip(sx, sy, 1, 1, pose.aim ?? 0);
  const bc = {x: tip.x + 48, y: tip.y};
  const T = EV.microCollapse;
  // colapso tipo Rayleigh: lento al principio, vertiginoso al final
  const u = clamp((t - 30) / (T - 30));
  const r = t < T ? 40 * Math.pow(1 - Math.pow(u, 1.6), 0.42) : 0;
  const heat = Math.pow(u, 6) * (t < T ? 1 : 0);
  const flash = t >= T - 0.02 && t < T + 0.12 ? 1 - Math.abs(t - T - 0.03) / 0.09 : 0; // ≈ 3 fotogramas
  const shockU = (t - T) / 2.0;
  let c: Cam;
  if (t < 31.2) c = shot(t, 30, 31.2, cam(bc.x - 40, bc.y - 30, 3.2), cam(bc.x, bc.y, 6.5), 'cine');
  else if (t < T) c = shot(t, 31.2, T - 0.3, cam(bc.x, bc.y, 6.5), cam(bc.x, bc.y, 11), 'inOut');
  else if (t < 37.6) c = shot(t, T, 37.6, cam(bc.x, bc.y, 11), cam(bc.x, bc.y, 7), 'out');
  else c = shot(t, 37.6, 39.8, cam(bc.x, bc.y, 7), cam(bc.x - 120, bc.y - 60, 1.9), 'cine');
  c = shake(breathe(c, t, 0.15), t, T, 0.7);
  const bS = toScreen(c, bc.x, bc.y);
  const rS = r * c.zoom;
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR} dim={0.72} front={false}>
        <Shrimp pose={pose} x={sx} y={sy} tone={0.25} />
        {/* gas comprimido que se calienta un instante (tinte cálido muy contenido, nunca fuego) */}
        {r > 0 && (
          <g>
            <defs>
              <radialGradient id="heatG">
                <stop offset="0" stopColor={mixColor('#9ff4ff', '#ffd8a0', heat)} stopOpacity={0.15 + heat * 0.55} />
                <stop offset="1" stopColor="#9ff4ff" stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle cx={bc.x} cy={bc.y} r={r * 0.85} fill="url(#heatG)" />
          </g>
        )}
        <BubbleFX c={bc} r={r} id="b5" squash={u * 0.25} />
        {/* moléculas del gas (puntos) que se apiñan al encogerse la burbuja */}
        {r > 1 && Array.from({length: 16}, (_, i) => {
          const a = i * 2.4 + t * (1 + heat * 6);
          const d = r * 0.6 * (0.3 + ((i * 37) % 10) / 14);
          return <circle key={i} cx={bc.x + Math.cos(a) * d} cy={bc.y + Math.sin(a) * d} r={0.35} fill="#eaffff" opacity={0.7} />;
        })}
        <ShockFX c={bc} u={shockU} R={260} sw={2 / c.zoom} />
        <StirFX c={bc} u={shockU} R={60} n={20} pr={1.6 / c.zoom} />
        <FlashFX c={bc} k={clamp(flash)} size={0.9} />
      </Reef>
    ),
    overlay: (
      <>
        <Vignette k={0.65} />
        <SciTag k={win(t, 30.1, 37.4, 0.3)} text="VISUALIZACIÓN CIENTÍFICA · ESCALA MICROSCÓPICA" />
        <Label x={bS.x} y={bS.y - rS * 0.95} tx={540} ty={560} text="EL GAS SE COMPRIME" k={win(t, 30.6, 32.8, 0.3)} />
        <BigTitle k={win(t, 32.6, T - 0.1, 0.3)} lines={['MILES DE GRADOS']} top={300} size={88} />
        <Info k={win(t, 32.9, T - 0.1, 0.3)} text="solo por un instante · en un punto microscópico" top={430} size={32} />
        <Label x={bS.x + 10} y={bS.y + 10} tx={760} ty={1260} text="DESTELLO DE LUZ" k={win(t, T + 0.05, 37.4, 0.25)} color="#eaf6ff" />
        <Info k={win(t, 37.0, 39.9, 0.3)} text="El calentamiento es microscópico y momentáneo: el agua de alrededor no hierve." top={330} />
      </>
    ),
  };
}

// ---------------- ESCENA 6 (40–50) ----------------
const TRACK6: STrack = [[40, 'TARGETING'], [40.6, 'CLAW_OPEN'], [EV.snap6, 'SNAPPING'], [42.6, 'TARGETING'], [44.3, 'HUNTING'], [49.4, 'IDLE']];
export function scene6(t: number): SceneOut {
  const base = poseFrom(TRACK6, t);
  const sx = 120 + base.dist;
  const sy = FLOOR - FEET;
  const pose: ShrimpPose = {...base, open: t < EV.snap6 + 0.5 ? snapOpen(t, EV.snap6, 40.6) : base.open, blur: t > EV.snap6 - 0.04 && t < EV.snap6 + 0.14 ? 1 : 0};
  const tip = clawTip(sx, sy, 1, 1, pose.aim ?? 0);
  const col = EV.snap6 + 0.03 * 0.7 + 0.38 * 0.7;
  const stun = seg(t, col + 0.1, col + 1.0);
  const sink = seg(t, col + 0.4, 45.2);
  const fish = {x: lerp(560, 600, sink) + Math.sin(t * 1.3) * 6 * (1 - stun), y: lerp(430, FLOOR - 16, sink * sink) + Math.sin(t * 2) * 6 * (1 - stun)};
  let c: Cam;
  if (t < 42.4) c = shot(t, 40, 41.2, cam(260, 390, 1.35), cam(330, 400, 1.5), 'inOut');
  else if (t < 44.6) c = shot(t, 42.4, 43.2, cam(330, 400, 1.5), cam(fish.x - 40, 450, 2.1), 'cine');
  else if (t < 47.4) c = shot(t, 44.6, 45.4, cam(560, 450, 2.1), cam(sx - 20, 460, 1.9), 'cine');
  else c = shot(t, 47.4, 48.4, cam(sx - 20, 460, 1.9), cam(sx + 150, 390, 1.4), 'cine');
  if (t >= 44.6 && t < 47.4) c = {...c, x: lerp(560, sx - 20, seg(t, 44.6, 45.4))};
  c = shake(breathe(c, t, 0.35), t, col, 1);
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR}>
        <PreyFish x={fish.x} y={fish.y} t={t} scale={0.55} dir={-1} stun={stun} flinch={seg(t, col, col + 0.2) * (1 - stun)} />
        <Shrimp pose={pose} x={sx} y={sy} />
        {snapFX(t, EV.snap6, tip, 1, 1, 0.7, 480)}
      </Reef>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <BigTitle k={win(t, col + 0.6, 44.2, 0.3)} lines={['PRESA ATURDIDA']} top={330} size={72} />
      </>
    ),
  };
}

// ---------------- ESCENA 7 (50–56) ----------------
const TRACK7: STrack = [[50, 'IDLE'], [51.5, 'EXPLORING'], [53.8, 'TARGETING']];
export function scene7(t: number): SceneOut {
  const base = poseFrom(TRACK7, t);
  const sx = 0 + base.dist * 1.25;
  const s = 1.25;
  const sy = FLOOR - FEET * s;
  // giro suave de la cámara: deriva lateral con balanceo + paralaje
  const u = seg(t, 50, 56);
  const pose: ShrimpPose = {...base, aim: -0.22 + Math.sin(t * 0.9) * 0.04, open: 0.25 + 0.1 * Math.sin(t * 1.3), antenna: -0.4 + Math.sin(t * 1.1) * 0.12};
  let c: Cam = cam(lerp(-120, 160, u), lerp(400, 360, u), lerp(1.5, 1.7, u), lerp(-0.05, 0.05, u));
  c = breathe(c, t, 0.4);
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR}>
        <Shrimp pose={pose} x={sx} y={sy} scale={s} />
      </Reef>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <BigTitle k={win(t, 51.0, 55.6, 0.3)} lines={['UNOS POCOS', 'CENTÍMETROS']} top={260} size={70} />
      </>
    ),
  };
}

// ---------------- ESCENA 8 (56–60) ----------------
const TRACK8: STrack = [[56, 'IDLE'], [56.5, 'TARGETING'], [EV.clawOpen8, 'CLAW_OPEN']];
export function scene8(t: number): SceneOut {
  const sx = 0;
  const sy = FLOOR - FEET;
  const base = poseFrom(TRACK8, t);
  const pose: ShrimpPose = {...base, open: snapOpen(t, 99, EV.clawOpen8)};
  const fx = lerp(1100, HOOK_FISH.x, seg(t, 56, 58.6)) + Math.sin(t * 1.4) * 6;
  const fy = HOOK_FISH.y + Math.sin(t * 2.1) * 4 - 40 * (1 - seg(t, 56, 58.6));
  let c: Cam = shot(t, 56, 59.4, cam(60, 380, 1.4), HOOK_CAM, 'cine');
  c = breathe(c, t, 0.35);
  return {
    svg: (
      <Reef cam={c} t={t} floorY={FLOOR}>
        <PreyFish x={fx} y={fy} t={t} scale={0.55} dir={-1} />
        <Shrimp pose={pose} x={sx} y={sy} />
      </Reef>
    ),
    overlay: <Vignette k={0.55} />,
  };
}
