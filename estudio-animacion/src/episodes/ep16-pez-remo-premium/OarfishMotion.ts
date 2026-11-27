// MOVIMIENTO DEL PERSONAJE (coreografía de la demostración y utilidades reutilizables).
// A natación lenta · B giro 3D (la cabeza cambia de orientación y el cuerpo sigue su trayectoria)
// C ascenso/descenso · D aparición desde la oscuridad · E alimentación (boca y cabeza, presas).
import {clamp, easeInOut} from '../../engine/math';
import {Key} from './OarfishRig';
import {FinMotion} from './OarfishDorsalFin';

/** Trayectoria de la cabeza [t, x, y, z] (z > 0 lejos de cámara; y < 0 arriba). */
export const DEMO_KEYS: Key[] = [
  [-30, -2280, 40, 520], // historia: venía nadando en línea recta (el cuerpo ya está extendido)
  [0, -120, 40, 520], // A/D: silueta lejana en la oscuridad
  [3, 80, 30, 380],
  [6, 270, 10, 120], // se acerca a cámara
  [10, 560, -10, 0], // plano lateral
  [11, 670, -90, -60], // B+C: gira hacia cámara y asciende
  [12, 670, -260, -190],
  [13, 570, -400, -150], // ya nada hacia la izquierda, por encima de su propio cuerpo
  [15, 390, -500, 150], // se aleja hacia el océano profundo
];

const ramp = (t: number, a: number, b: number) => easeInOut(clamp((t - a) / (b - a)));

/** Apariencia en el tiempo: exposición, barrido de luz, niebla, contraluz, cresta, opacidad. */
export function demoLook(t: number) {
  const exposure = 0.08 + 0.92 * ramp(t, 3, 5.6);
  const sweep = 1.25 * ramp(t, 3.1, 6.2);
  const fog = 0.55 * (1 - ramp(t, 2.4, 5.5)) + 0.6 * ramp(t, 13.2, 15);
  const rim = 0.45 + 0.35 * ramp(t, 3, 5);
  const crest = 0.25 + 0.75 * ramp(t, 3.4, 5.4);
  const opacity = 1 - 0.85 * ramp(t, 13.8, 15);
  return {exposure, sweep, fog, rim, crest, opacity};
}

/** E · Alimentación: dos mordiscos en [a, b] (apertura y cierre de boca). */
export function feedingMouth(t: number, a = 7.8, b = 9.8) {
  if (t < a || t > b) return 0.2;
  const u = (t - a) / (b - a);
  return 0.2 + 0.75 * Math.pow(Math.abs(Math.sin(u * Math.PI * 2)), 1.4);
}

/** Aleta dorsal: onda continua; algo más intensa durante el giro. */
export const demoFin = (t: number): FinMotion => ({waves: 6, speed: 3.4 + 0.8 * ramp(t, 10, 11) * (1 - ramp(t, 13, 14)), amp: 0.3 + 0.06 * ramp(t, 10, 11)});
