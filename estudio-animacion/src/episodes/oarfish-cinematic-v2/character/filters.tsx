// FILTROS SVG del personaje cinematográfico (iluminación real calculada sobre la silueta):
//  · volume  — convierte el contorno en un relieve suave (desenfoque del canal alfa = mapa de altura),
//              añade microtextura (ruido fractal fino: tubérculos de la piel) y lo ilumina con luz
//              difusa + especular desde la misma dirección que los rayos del escenario. El volumen
//              se adapta automáticamente a cualquier deformación del cuerpo.
//  · glow    — halo suave para radios de aleta y filamentos (dispersión de la luz en la membrana).
//  · soft    — desenfoque para profundidad de campo simulada (partículas cercanas, siluetas lejanas).
// Las unidades del desenfoque están en unidades de mundo (escalan con la cámara).
import React from 'react';

export type LightDir = {azimuth: number; elevation: number};
export const KEY_LIGHT: LightDir = {azimuth: 300, elevation: 52}; // desde arriba a la derecha

/** Volumen suave sin bandas: sombra interior en el borde inferior y luz interior en el superior,
 *  calculadas a partir del alfa desenfocado y desplazado (dirección de la luz clave: arriba-derecha).
 *  No usa derivadas del mapa de altura, así que no aparecen contornos de cuantización. */
export const VolumeFilter: React.FC<{id: string; relief: number; light?: LightDir; micro?: number; spec?: number}> = ({id, relief, spec = 1}) => {
  const d = relief * 0.9;
  return (
    <filter id={id} x="-8%" y="-40%" width="116%" height="180%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={relief} result="blur" />
      <feOffset in="blur" dx={-d * 0.35} dy={-d} result="up" />
      <feOffset in="blur" dx={d * 0.3} dy={d * 0.9} result="down" />
      <feComposite in="SourceAlpha" in2="up" operator="out" result="shadowMask" />
      <feComposite in="SourceAlpha" in2="down" operator="out" result="lightMask" />
      <feFlood floodColor="#030a1c" floodOpacity={0.78} result="dark" />
      <feComposite in="dark" in2="shadowMask" operator="in" result="shadow" />
      <feFlood floodColor="#f2f8ff" floodOpacity={0.55 * spec} result="lite" />
      <feComposite in="lite" in2="lightMask" operator="in" result="light" />
      <feGaussianBlur in="blur" stdDeviation={relief * 0.5} result="blur2" />
      <feOffset in="blur2" dx={d * 0.25} dy={d * 0.5} result="core" />
      <feComposite in="SourceAlpha" in2="core" operator="out" result="rimMask" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="shadow" />
        <feMergeNode in="light" />
      </feMerge>
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
  );
};

export const GlowFilter: React.FC<{id: string; radius: number; strength?: number}> = ({id, radius, strength = 0.9}) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation={radius} result="b" />
    <feComposite in="b" in2="SourceGraphic" operator="arithmetic" k1={0} k2={strength} k3={1} k4={0} />
  </filter>
);

export const SoftFilter: React.FC<{id: string; radius: number}> = ({id, radius}) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={radius} />
  </filter>
);
