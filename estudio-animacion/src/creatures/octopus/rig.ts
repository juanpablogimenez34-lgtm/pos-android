// Definición anatómica del personaje (unidades de mundo a escala 1).
// Cambiar estos datos permite crear otras especies de pulpo sin tocar el código.

export type OctopusSkin = {
  base: string;
  shadow: string;
  highlight: string;
  spotDark: string;
  spotLight: string;
  underside: string;
  sucker: string;
  suckerRim: string;
  rim: string; // luz de contorno (agua)
  camoBase: string;
  camoShadow: string;
  camoHighlight: string;
  camoSpotDark: string;
  camoSpotLight: string;
  pale: string;
  dark: string;
  iris: string;
  irisEdge: string;
};

export type OctopusRig = {
  armLength: number;
  armBaseWidth: number; // semiancho en la base
  armTipWidth: number;
  crownRx: number;
  crownRy: number;
  headOffsetY: number;
  headW: number;
  headH: number;
  mantleLength: number;
  mantleWidth: number;
  eyeRadius: number;
  tilt: number; // inclinación de cámara sobre el plano del suelo (proyección)
  drop: number; // componente vertical inicial de los brazos
  gaitPeriod: number;
  gaitDuty: number;
  stepLift: number;
  footReach: number; // fracción de la longitud del brazo
  gaitOffsets: number[];
  skin: OctopusSkin;
};

/** Pulpo común (Octopus vulgaris): manto ovalado, brazos 3–4 veces más largos que el
 * manto, ojos prominentes con pupila horizontal, papilas sobre los ojos, membrana
 * interbraquial en la base de los brazos y dos filas de ventosas por brazo. */
export const OCTOPUS_VULGARIS: OctopusRig = {
  armLength: 360,
  armBaseWidth: 17,
  armTipWidth: 1.4,
  crownRx: 40,
  crownRy: 13,
  headOffsetY: 64,
  headW: 56,
  headH: 44,
  mantleLength: 172,
  mantleWidth: 54,
  eyeRadius: 19,
  tilt: 0.38,
  drop: 0.42,
  gaitPeriod: 1.2,
  gaitDuty: 0.62,
  stepLift: 42,
  footReach: 0.6,
  gaitOffsets: [0, 0.5, 0.25, 0.75, 0.125, 0.625, 0.375, 0.875],
  skin: {
    base: '#c2603f',
    shadow: '#5a2131',
    highlight: '#f3ad74',
    spotDark: '#6e2622',
    spotLight: '#f7d2a2',
    underside: '#f0c3a8',
    sucker: '#f7dcc8',
    suckerRim: '#b36450',
    rim: '#7fe9e0',
    camoBase: '#4c6c6c',
    camoShadow: '#1d2b3c',
    camoHighlight: '#8fb5a4',
    camoSpotDark: '#1a2833',
    camoSpotLight: '#a3c7b4',
    pale: '#ead6c6',
    dark: '#4a1422',
    iris: '#e2bd5c',
    irisEdge: '#7d5a1c',
  },
};
