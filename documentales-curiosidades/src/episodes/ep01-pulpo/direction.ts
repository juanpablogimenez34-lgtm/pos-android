import { Cue } from '../../core/overlays/Subtitles';
import { Shot } from '../../core/camera/shots';
import { noise1, smoothstep } from '../../core/math/noise';
import type { OctopusBehavior } from '../../creatures/octopus/Octopus';

/**
 * DIRECCIÓN DE LA DEMO (15 s)
 * ---------------------------------------------------------------
 *  0.0 – 4.2  APERTURA     Grúa descendente desde detrás: el arrecife y el pulpo avanzando.
 *  4.2 – 8.4  TRAVELLING   Cámara baja, lateral, acompaña la marcha de los 8 brazos.
 *  8.4 – 15   PRIMER PLANO El pulpo corona la roca, se detiene, explora hacia cámara y se
 *             camufla; la cámara se eleva en un plano de revelación con el arrecife.
 */

/** Ventana suave: sube en [a,b], baja en [c,d]. */
const pulse = (t: number, a: number, b: number, c: number, d: number) =>
  smoothstep(a, b, t) * (1 - smoothstep(c, d, t));

/** Velocidad del pulpo (m/s): avanza, frena al trepar, se detiene arriba y sigue. */
export const octopusSpeed = (t: number) => {
  const base = 0.215;
  const climb = 1 - 0.3 * pulse(t, 6.8, 7.6, 8.4, 8.9);
  const stop = 1 - 0.93 * pulse(t, 8.6, 9.1, 10.3, 10.9);
  const start = smoothstep(-0.4, 0.8, t);
  return base * climb * stop * start;
};

export const octopusBehavior = (t: number): OctopusBehavior => {
  const camo = 0.92 * smoothstep(7.0, 9.6, t) * (1 - 0.35 * smoothstep(12.8, 14.8, t));
  const explore = [0, 0, 0, 0, 0, 0, 0, 0];
  explore[0] = 0.95 * pulse(t, 8.9, 9.5, 10.3, 10.9); // L1
  explore[4] = 0.8 * pulse(t, 9.15, 9.8, 10.2, 10.8); // R1
  explore[1] = 0.55 * pulse(t, 2.6, 3.2, 3.8, 4.4); // L2 tantea durante la marcha
  explore[5] = 0.5 * pulse(t, 12.4, 12.9, 13.4, 13.9); // R2
  return {
    camo,
    papillae: 0.3 + 0.7 * camo,
    wave: 0.85 * pulse(t, 10.2, 10.7, 11.8, 12.4),
    explore,
    gaze: noise1(t * 0.35, 7) * 0.35,
  };
};

export const DEMO_SHOTS: Shot[] = [
  {
    name: 'APERTURA · grúa',
    start: 0,
    end: 4.2,
    from: { azimuth: 155, elevation: 40, distance: 3.6, fov: 34, target: [0, 0, 0.3] },
    to: { azimuth: 125, elevation: 20, distance: 1.9, fov: 32, target: [0, 0, 0.15] },
    ease: 'out',
    handheld: 0.4,
    lag: 0.9,
  },
  {
    name: 'TRAVELLING · lateral bajo',
    start: 4.2,
    end: 8.4,
    // Continúa exactamente donde terminó la grúa (sin corte).
    from: { azimuth: 125, elevation: 20, distance: 1.9, fov: 32, target: [0, 0, 0.15] },
    to: { azimuth: 72, elevation: 7, distance: 1.05, fov: 29, target: [0, -0.02, 0.1] },
    ease: 'inOut',
    handheld: 0.4,
    lag: 0.9,
  },
  {
    name: 'PRIMER PLANO · ojos y brazos',
    start: 8.4,
    end: 12.0,
    from: { azimuth: 34, elevation: 16, distance: 1.0, fov: 30, target: [0, 0.0, 0.12] },
    to: { azimuth: 16, elevation: 11, distance: 0.82, fov: 29, target: [0, 0.01, 0.1] },
    ease: 'linear',
    handheld: 0.45,
    lag: 0.6,
  },
  {
    name: 'REVELACIÓN · grúa ascendente',
    start: 12.0,
    end: 15.01,
    from: { azimuth: 16, elevation: 11, distance: 0.82, fov: 29, target: [0, 0.01, 0.1] },
    to: { azimuth: -55, elevation: 38, distance: 3.3, fov: 34, target: [0, 0, 0.2] },
    ease: 'inOut',
    handheld: 0.45,
    lag: 0.6,
  },
];

/** Subtítulos provisionales (la narración real llega en la etapa de audio). */
export const DEMO_CUES: Cue[] = [
  { start: 4.5, end: 8.2, text: 'Sobre el fondo rocoso, un pulpo avanza usando sus ocho brazos.' },
  { start: 8.6, end: 11.9, text: 'Cada brazo se mueve por su cuenta… y su piel cambia de color en segundos.' },
  { start: 12.2, end: 14.8, text: 'Pero su mayor secreto late dentro: tres corazones.' },
];
