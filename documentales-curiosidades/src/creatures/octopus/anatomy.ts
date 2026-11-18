/**
 * Anatomía simplificada de un pulpo común (Octopus vulgaris) adulto joven.
 * Unidades en metros. Manto ~15 cm, brazos ~70-80 cm.
 *
 * Convención de ejes (espacio local del cuerpo):
 *   +Z = hacia delante (dirección de avance), +Y = arriba, +X = izquierda del animal.
 */
export type ArmSpec = {
  id: string;
  /** +1 brazos izquierdos (L1..L4), -1 derechos (R1..R4). */
  side: 1 | -1;
  /** 0 = par delantero ... 3 = par trasero. */
  pair: number;
  /** Ángulo alrededor del cuerpo, medido desde +Z (rad). */
  angle: number;
  /** Distancia de apoyo en reposo desde el centro (m). */
  reach: number;
  /** Longitud total del brazo (m). */
  length: number;
  /** Fase de la marcha (0..1). */
  phase: number;
  /** Sentido preferido del enrollamiento de la punta. */
  curlSign: 1 | -1;
};

const PAIR_ANGLE = [0.38, 0.98, 1.72, 2.5];
const PAIR_REACH = [0.47, 0.5, 0.45, 0.4];
const PAIR_LENGTH = [0.74, 0.8, 0.78, 0.72];
// Patrón alternado tipo "tetrápodo": brazos vecinos en contrafase,
// con un pequeño desfase para que no parezca mecánico.
const PHASE_L = [0.0, 0.52, 0.06, 0.55];
const PHASE_R = [0.5, 0.02, 0.57, 0.08];

export const ARMS: ArmSpec[] = [
  ...[0, 1, 2, 3].map(
    (p): ArmSpec => ({
      id: `L${p + 1}`,
      side: 1,
      pair: p,
      angle: PAIR_ANGLE[p],
      reach: PAIR_REACH[p],
      length: PAIR_LENGTH[p],
      phase: PHASE_L[p],
      curlSign: p % 2 === 0 ? 1 : -1,
    }),
  ),
  ...[0, 1, 2, 3].map(
    (p): ArmSpec => ({
      id: `R${p + 1}`,
      side: -1,
      pair: p,
      angle: -PAIR_ANGLE[p],
      reach: PAIR_REACH[p],
      length: PAIR_LENGTH[p],
      phase: PHASE_R[p],
      curlSign: p % 2 === 0 ? -1 : 1,
    }),
  ),
];

/** Orden de los brazos alrededor del cuerpo (para la membrana interbraquial). */
export const ARM_RING_ORDER = ['R4', 'R3', 'R2', 'R1', 'L1', 'L2', 'L3', 'L4'].map((id) =>
  ARMS.findIndex((a) => a.id === id),
);

export const BODY = {
  /** Altura del centro de la cabeza sobre el suelo al caminar. */
  rideHeight: 0.15,
  /** Radio del anillo donde nacen los brazos. */
  armRootRadius: 0.05,
  armRootY: -0.045,
  armRootZ: 0.015,
  /** Radio del brazo en la base. */
  armBaseRadius: 0.031,
};

export const SPINE_POINTS = 56;
export const RADIAL_SEGMENTS = 20;
export const SUCKERS_PER_ARM = 30;

/** Radio del brazo en función de u (0 base, 1 punta). */
export const armRadius = (u: number) => BODY.armBaseRadius * Math.pow(1 - 0.94 * u, 1.25) + 0.0011;
