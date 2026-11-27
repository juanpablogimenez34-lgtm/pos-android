// MÁQUINA DE ESTADOS DE LA ANGUILA ELÉCTRICA (determinista por fotograma).
// Cada estado define parámetros de movimiento; una pista [instante, estado] los encadena y los
// mezcla con una transición suave. La distancia recorrida y la fase de la aleta anal se INTEGRAN en
// el tiempo, así que los cambios de velocidad o de sentido (avanzar ↔ retroceder) son continuos.
//
// Locomoción de pez cuchillo (Gymnotiformes): el cuerpo se mantiene relativamente recto y la
// propulsión la produce la larga aleta anal: ondas hacia la cola → avanza; ondas hacia la cabeza →
// retrocede. Por eso la ondulación del cuerpo es pequeña comparada con la de una serpiente.
export type EelState =
  | 'IDLE_HOVER'
  | 'SLOW_SWIM'
  | 'FAST_SWIM'
  | 'SEARCHING'
  | 'ELECTROLOCATION'
  | 'STALKING'
  | 'HIGH_VOLTAGE_ATTACK'
  | 'PREY_CAPTURE'
  | 'SURFACE_BREATHING'
  | 'DEFENSIVE_DISPLAY'
  | 'RETREAT'
  | 'RESTING';

export type EelParams = {
  speed: number; // unidades de mundo por segundo a lo largo de la trayectoria (negativo = retrocede)
  fin: number; // frecuencia de la onda de la aleta anal (Hz; negativo = ondas hacia la cabeza)
  finAmp: number; // amplitud de la onda de la aleta (0…1)
  bodyAmp: number; // ondulación lateral del cuerpo (unidades)
  headYaw: number; // amplitud del balanceo de la cabeza (rad)
  mouth: number; // apertura de la boca (0…1)
  field: number; // señales débiles de electrolocalización (0…1, visualización)
  volt: number; // descarga de alto voltaje (0…1, visualización)
  arch: number; // curvatura defensiva (0…1)
};

export const PRESETS: Record<EelState, EelParams> = {
  IDLE_HOVER: {speed: 4, fin: 1.2, finAmp: 0.45, bodyAmp: 2, headYaw: 0.03, mouth: 0.05, field: 0.15, volt: 0, arch: 0},
  SLOW_SWIM: {speed: 70, fin: 2.2, finAmp: 0.7, bodyAmp: 5, headYaw: 0.03, mouth: 0.05, field: 0.2, volt: 0, arch: 0},
  FAST_SWIM: {speed: 190, fin: 3.6, finAmp: 1, bodyAmp: 12, headYaw: 0.05, mouth: 0.1, field: 0.2, volt: 0, arch: 0},
  SEARCHING: {speed: 28, fin: 1.6, finAmp: 0.6, bodyAmp: 4, headYaw: 0.14, mouth: 0.05, field: 0.65, volt: 0, arch: 0},
  ELECTROLOCATION: {speed: 14, fin: 1.4, finAmp: 0.55, bodyAmp: 3, headYaw: 0.08, mouth: 0.05, field: 1, volt: 0, arch: 0},
  STALKING: {speed: 34, fin: 1.8, finAmp: 0.6, bodyAmp: 2.5, headYaw: 0.02, mouth: 0.08, field: 0.7, volt: 0, arch: 0},
  HIGH_VOLTAGE_ATTACK: {speed: 60, fin: 2.6, finAmp: 0.8, bodyAmp: 4, headYaw: 0.01, mouth: 0.35, field: 0, volt: 1, arch: 0.15},
  PREY_CAPTURE: {speed: 150, fin: 3.2, finAmp: 0.9, bodyAmp: 8, headYaw: 0.02, mouth: 1, field: 0, volt: 0.3, arch: 0},
  SURFACE_BREATHING: {speed: 45, fin: 2.0, finAmp: 0.7, bodyAmp: 4, headYaw: 0.02, mouth: 0.6, field: 0.1, volt: 0, arch: 0},
  DEFENSIVE_DISPLAY: {speed: 0, fin: 1.0, finAmp: 0.6, bodyAmp: 3, headYaw: 0.04, mouth: 0.25, field: 0.3, volt: 0, arch: 1},
  RETREAT: {speed: -60, fin: -2.4, finAmp: 0.8, bodyAmp: 3, headYaw: 0.03, mouth: 0.05, field: 0.2, volt: 0, arch: 0},
  RESTING: {speed: 0, fin: 0.7, finAmp: 0.35, bodyAmp: 1.2, headYaw: 0.015, mouth: 0.04, field: 0.1, volt: 0, arch: 0},
};

export type Track = [number, EelState][];
const BLEND = 0.8; // segundos de transición entre estados

const mix = (a: EelParams, b: EelParams, u: number): EelParams => {
  const o = {} as EelParams;
  (Object.keys(a) as (keyof EelParams)[]).forEach((k) => (o[k] = a[k] + (b[k] - a[k]) * u));
  return o;
};

export function paramsAt(track: Track, t: number, override?: Partial<Record<EelState, Partial<EelParams>>>): EelParams & {state: EelState} {
  const P = (s: EelState) => ({...PRESETS[s], ...(override?.[s] ?? {})});
  let i = 0;
  while (i < track.length - 1 && track[i + 1][0] <= t) i++;
  const [t0, s0] = track[i];
  const prev = i > 0 ? track[i - 1][1] : s0;
  const u = Math.min(1, Math.max(0, (t - t0) / BLEND));
  const e = u * u * (3 - 2 * u);
  return {...mix(P(prev), P(s0), e), state: s0};
}

/** Integra distancia y fase de la aleta desde t0 hasta t (paso de un fotograma). */
export function integrate(track: Track, t0: number, t: number, override?: Partial<Record<EelState, Partial<EelParams>>>) {
  const dt = 1 / 30;
  let dist = 0;
  let fin = 0;
  for (let x = t0; x < t; x += dt) {
    const h = Math.min(dt, t - x);
    const p = paramsAt(track, x + h / 2, override);
    dist += p.speed * h;
    fin += p.fin * h;
  }
  return {dist, finPhase: fin * Math.PI * 2};
}
