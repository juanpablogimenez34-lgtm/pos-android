// SISTEMA DE NATACIÓN del renacuajo: la cola (14 puntos de control) genera una onda progresiva cuya
// amplitud crece hacia la punta; la frecuencia depende del impulso. El cuerpo cabecea levemente en
// contrafase. Aceleración/deceleración mediante el parámetro `effort`.
export type SwimState = {phase: number; amp: number; bodyYaw: number};

export function swimAt(t: number, effort: number, seed = 0): SwimState {
  const freq = 2.2 + 3.6 * effort; // Hz
  return {phase: t * freq * Math.PI * 2 + seed, amp: 0.35 + 0.65 * effort, bodyYaw: Math.sin(t * freq * Math.PI * 2 + seed + Math.PI) * 0.06 * effort};
}
