/**
 * Lenguaje de cámara declarativo.
 * Cada plano define un encuadre inicial y final RELATIVO al sujeto:
 *   azimuth   0° = delante del animal mirándolo de frente, 90° = a su izquierda, 180° = detrás
 *   elevation ángulo sobre la horizontal
 *   distance  metros al punto de interés
 *   fov       apertura vertical (más bajo = teleobjetivo, más "cine")
 */
export type ShotFrame = {
  azimuth: number;
  elevation: number;
  distance: number;
  fov: number;
  /** Punto de interés relativo al sujeto (x izquierda, y arriba, z delante). */
  target?: [number, number, number];
  /** Inclinación lateral (dutch angle), grados. */
  roll?: number;
};

export type Shot = {
  name: string;
  start: number;
  end: number;
  from: ShotFrame;
  to: ShotFrame;
  ease?: 'inOut' | 'out' | 'linear';
  /** Intensidad de cámara en mano (0 = trípode / grúa, 1 = hombro). */
  handheld?: number;
  /** Retardo del seguimiento (s): la cámara "persigue" al sujeto con inercia. */
  lag?: number;
};
