// SISTEMA DE COREOGRAFÍA (determinista, en tiempo GLOBAL de 0 a 140 s).
// Trayectorias Catmull-Rom (motor de la orca) en el dominio τ ("tiempo de acción"), con dos remapeos de cámara
// lenta: la repetición de la maniobra evasiva (52–57 s) y el contacto decisivo (109,5–111,5 s).
// Escalas FIJAS en los 4 episodios (1 m = 100 px): orca de 7 m (escala 0,7 sobre L = 1000) y tiburón de 5 m
// (escala 0,5 sobre SL = 1000). La orientación (facing) es continua: en los giros el cuerpo se escorza en vez de
// voltearse de golpe. Los cuerpos se mantienen separados (verificado con check.ts) salvo en el contacto.
// Estados: RESTING, SWIMMING, EXPLORING, TARGET_DETECTED, TRACKING, APPROACHING, CIRCLING, ACCELERATING,
// ATTACKING, DODGING, DEFENDING, CONTACT, RECOVERING, RETREATING, SURFACING.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {Key, pathAt, phaseOf} from '../../orca-reina-oceanos/character/motion';
import {OrcaPose} from '../../orca-reina-oceanos/character/Orca';
import {SharkPose} from '../../tiburon-blanco/character/WhiteShark';

export const ORCA_SCALE = 0.7; // 7 m
export const SHARK_SCALE = 0.5; // 5 m
export const SURFACE = 0;
export const FLOOR = 2100;

/** Remapeo de tiempo: τ(t). */
export const REPLAY = {a: 52, b: 57, from: 47.0, rate: 0.75};
export const SLOW = {a: 109.5, b: 111.5, rate: 0.4};
export function tauOf(t: number) {
  if (t >= REPLAY.a && t < REPLAY.b) return REPLAY.from + (t - REPLAY.a) * REPLAY.rate;
  if (t < SLOW.a) return t;
  if (t < SLOW.b) return SLOW.a + (t - SLOW.a) * SLOW.rate;
  return t - (SLOW.b - SLOW.a) * (1 - SLOW.rate);
}
export const isSlow = (t: number) => (t >= REPLAY.a && t < REPLAY.b) || (t >= SLOW.a && t < SLOW.b);
export const TAU_CONTACT = 110.3;

// ------------------------------------------------------------------ trayectorias (τ, x, y del hocico)
export const SHARK_KEYS: Key[] = [
  // EP1 — presentación, pasada y detección
  [-1, -400, 955], [0, -200, 950], [3, 200, 940], [8, 700, 920], [12, 1100, 900], [14.5, 1300, 860], [16, 1250, 820], [19, 800, 800], [22, 450, 800],
  [23.5, 330, 790], [25, 280, 750], [26.2, 330, 700], [28, 550, 690], [30, 700, 720], [31.2, 780, 760], [32.3, 760, 800], [33.5, 620, 820], [35, 380, 830],
  // EP2 — aceleración, pasa por debajo, rodeo profundo y ataque desde abajo; la orca esquiva
  [36, 150, 900], [37, -100, 1150], [38.2, -500, 1300], [39.6, -950, 1320], [41, -1250, 1450], [42.3, -1200, 1650], [43.6, -900, 1730], [45, -560, 1720],
  [46.3, -430, 1480], [47.4, -380, 1200], [48.5, -330, 900], [49.5, -270, 650], [50.6, -150, 470], [52, 150, 400], [53.5, 700, 380], [55, 1050, 400],
  [56, 1150, 450], [57, 1080, 500], [58.5, 800, 520], [60, 450, 560], [62, 0, 600], [65, -500, 650], [70, -1000, 720],
  // EP3 — rodeo a distancia mientras la orca ecolocaliza; pasa por debajo; cambio de dirección; aproximación final
  [72, -1300, 800], [73.5, -1450, 950], [75, -1450, 1080], [77, -1300, 1260], [79, -1000, 1350], [82, -700, 1360], [85, -100, 1380], [88, 500, 1350],
  [90, 850, 1250], [92, 1000, 1100], [93.5, 1150, 980], [95, 1180, 880], [96.5, 1120, 840], [98, 1050, 835], [100, 950, 830], [103, 620, 815],
  [105, 420, 808], [107, 240, 803], [109.5, 60, 800], [TAU_CONTACT, 0, 800],
  // EP4 — contacto, desvío, recuperación y retirada
  [110.8, -150, 760], [111.4, -380, 700], [112.2, -620, 650], [113.3, -850, 615], [116, -1300, 640], [119, -1700, 700], [122, -2600, 760], [128, -4400, 820], [140, -8000, 900],
];
export const ORCA_KEYS: Key[] = [
  [-1, 800, 700], [0, 520, 700], [1.5, 200, 690], [3, -150, 670], [8, -600, 670], [12, -1100, 700], [14.5, -1300, 760], [16, -1250, 820], [19, -900, 860], [22, -650, 880],
  [26, -450, 880], [30, -250, 860], [33, -150, 850], [35, -100, 850],
  [37, -60, 850], [39, -20, 848], [42, 20, 850], [46.8, 60, 850], [47.6, 330, 830], [48.4, 620, 800], [49.4, 900, 790], [50.5, 1150, 800],
  [52, 1400, 830], [54, 1650, 900], [55.5, 1800, 980], [56.5, 1820, 1050], [57.5, 1700, 1080], [59, 1450, 1050], [62, 1050, 1000], [65, 700, 950],
  [67.5, 450, 1100], [70, 250, 1250],
  [71, 120, 1200], [72, 60, 1080], [73, -80, 980], [76, -200, 960], [79, -280, 950], [82, -320, 950], [84, -340, 940], [85.5, -330, 930], [87, -250, 920],
  [90, -100, 900], [92, 0, 900], [94, 250, 1050], [96, 500, 1300], [97.5, 700, 1480], [98.5, 820, 1560], [99.3, 790, 1530], [100, 700, 1450],
  [103, 560, 1250], [105, 460, 1100], [107, 350, 1030], [109.5, 230, 915], [TAU_CONTACT, 200, 878],
  [111.5, 185, 890], [113, 120, 915], [116, -80, 935], [119, -220, 950], [122.8, -300, 900], [125, -420, 640], [127, -560, 390], [128.8, -680, 130],
  [130, -760, 10], [133, -1000, 0], [138.8, -1600, 20], [142, -2000, 30],
];

// ------------------------------------------------------------------ orientación continua y cabeceo
function heading(keys: Key[], τ: number, maxPitch: number) {
  const p = pathAt(keys, τ);
  // orientación suavizada: media de la dirección horizontal en una ventana de ±0,35 s
  let acc = 0;
  for (let k = -3; k <= 3; k++) acc += Math.tanh(pathAt(keys, τ + k * 0.12).vx / 40);
  let f = acc / 7;
  // histéresis: al flotar casi quieto conserva el último lado (sin escorzo); el escorzo solo aparece en giros reales
  const slowMove = Math.hypot(p.vx, p.vy) < 160;
  if (slowMove && Math.abs(f) < 0.9) {
    let last = 0;
    for (let b = 0.25; b <= 8 && last === 0; b += 0.25) {
      const v = pathAt(keys, τ - b).vx;
      if (Math.abs(v) > 50) last = Math.sign(v);
    }
    f = last || (f >= 0 ? 1 : -1);
  }
  const s = f >= 0 ? 1 : -1;
  f = s * Math.max(0.22, Math.abs(f));
  const pitch = clamp(Math.atan2(p.vy, Math.abs(p.vx) + 40), -maxPitch, maxPitch);
  return {p, f, s, pitch, sp: Math.hypot(p.vx, p.vy)};
}
/** Mirada local (−1…1) hacia un punto del mundo. */
function gaze(x: number, y: number, angle: number, s: number, tx: number, ty: number) {
  const dx = tx - x;
  const dy = ty - y;
  const c = Math.cos(-angle);
  const n = Math.sin(-angle);
  const lx = (dx * c - dy * n) * s;
  const ly = dx * n + dy * c;
  const l = Math.hypot(lx, ly) || 1;
  return {x: lx / l, y: ly / l};
}

export function sharkAt(t: number): SharkPose {
  const τ = tauOf(t);
  const h = heading(SHARK_KEYS, τ, 1.25);
  const o = pathAt(ORCA_KEYS, τ);
  let angle = h.s > 0 ? h.pitch : -h.pitch;
  // contacto: el golpe lo desvía y lo hace girar; luego se recupera (amortiguado)
  const dc = τ - TAU_CONTACT;
  let amp = clamp(0.5 + h.sp * 0.0018, 0.45, 1.6);
  if (dc > 0) {
    // el golpe bajo el vientre lo hace cabecear (cola hacia arriba, lejos de la orca) y se amortigua
    angle += 0.5 * h.s * Math.exp(-dc * 1.3) * smoothstep(0, 0.35, dc);
    amp *= 1 - 0.6 * Math.exp(-dc * 1.2);
  }
  const strike = smoothstep(47.6, 48.2, τ) * (1 - smoothstep(49.2, 49.8, τ));
  const show = smoothstep(5.4, 5.9, τ) * (1 - smoothstep(7.4, 7.9, τ));
  const jaw = Math.max(strike, show, (smoothstep(108.8, 109.4, τ) * (1 - smoothstep(110.2, 110.6, τ))) * 0.6);
  return {
    x: h.p.x, y: h.p.y, angle, scale: SHARK_SCALE, facing: h.f as 1, t: τ, phase: phaseOf(SHARK_KEYS, τ, 0.38, 0.0017, 2), amp,
    jaw, protrude: jaw * 0.9, look: gaze(h.p.x, h.p.y, angle, h.s, o.x, o.y), rim: 0.45, pecs: clamp(-h.p.vy / 400, -1, 1),
  };
}
export function orcaAt(t: number): OrcaPose {
  const τ = tauOf(t);
  const h = heading(ORCA_KEYS, τ, 1.1);
  const s = pathAt(SHARK_KEYS, τ);
  const angle = h.s > 0 ? h.pitch : -h.pitch;
  const jaw = smoothstep(8.4, 8.9, τ) * (1 - smoothstep(10.2, 10.7, τ)) * 0.8;
  const blow = smoothstep(129.6, 130, τ) * (1 - smoothstep(131, 131.6, τ));
  const g = gaze(h.p.x, h.p.y, angle, h.s, s.x, s.y);
  return {
    x: h.p.x, y: h.p.y, angle, scale: ORCA_SCALE, facing: h.f as 1, kind: 'male', t: τ, phase: phaseOf(ORCA_KEYS, τ, 0.4, 0.0011, 1),
    amp: clamp(0.35 + h.sp * 0.0016, 0.3, 1.45), flipN: clamp(-h.p.vy * 0.0007, -0.45, 0.45) + Math.sin(τ * 0.9) * 0.08, flipF: clamp(-h.p.vy * 0.0006, -0.4, 0.4) + 0.1,
    eye: {x: g.x, y: clamp(g.y, -0.8, 0.8)}, under: h.p.y < 30 ? 0.4 : 1, jaw, blow,
  };
}
/** Estado de la coreografía (para los rótulos de depuración y la documentación). */
export function stateOf(t: number): {orca: string; shark: string} {
  const τ = tauOf(t);
  if (τ < 3) return {orca: 'EXPLORING', shark: 'SWIMMING'};
  if (τ < 22) return {orca: 'SWIMMING', shark: 'SWIMMING'};
  if (τ < 30) return {orca: 'APPROACHING', shark: 'TARGET_DETECTED'};
  if (τ < 35) return {orca: 'TRACKING', shark: 'TRACKING'};
  if (τ < 46) return {orca: 'DEFENDING', shark: 'ACCELERATING'};
  if (τ < 50) return {orca: 'DODGING', shark: 'ATTACKING'};
  if (τ < 70) return {orca: 'CIRCLING', shark: 'CIRCLING'};
  if (τ < 82) return {orca: 'EXPLORING', shark: 'CIRCLING'};
  if (τ < 100) return {orca: 'APPROACHING', shark: 'TRACKING'};
  if (τ < TAU_CONTACT - 0.8) return {orca: 'ACCELERATING', shark: 'ACCELERATING'};
  if (τ < TAU_CONTACT + 1.5) return {orca: 'CONTACT', shark: 'CONTACT'};
  if (τ < 113.3) return {orca: 'RESTING', shark: 'RECOVERING'};
  if (τ < 122.8) return {orca: 'DEFENDING', shark: 'RETREATING'};
  return {orca: 'SURFACING', shark: 'RETREATING'};
}
export const _k = {lerp};
