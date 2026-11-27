// Utilidades compartidas por las 10 escenas: entorno según la profundidad, cámara, sumergible con focos,
// oscuridad con el "agujero" de luz de los focos, nieve marina continua y fichas de especie verificadas.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {Camera, ParallaxLayer} from '../../../engine/camera';
import {cam as mkCam, shot as mkShot} from '../../../studio2/camera';
import {depthAt} from '../data/depth';
import {Beam, FarLife, SunRays, WaterBG} from '../environment/Ocean';
import {lampWorld, Submersible, SubPose} from '../characters/Submersible';
import {Species} from '../hud/HUD';
import {Frame, VH, VW} from '../components/HShell';

export const cam = (x: number, y: number, zoom: number, roll = 0): Camera => mkCam(x, y, zoom, roll);
export const shot = (t: number, a: number, b: number, from: Camera, to: Camera) => mkShot(t, a, b, from, to);
/** Respiración de cámara submarina (muy leve). */
export const bc = (c: Camera, t: number, k = 1): Camera => ({...c, x: c.x + Math.sin(t * 0.37) * 7 * k, y: c.y + Math.sin(t * 0.29 + 1) * 6 * k, roll: c.roll});
export const win = (t: number, a: number, b: number, r = 0.5) => clamp((t - a) / r) * clamp((b - t) / r);
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/** Mundo → pantalla (sin giro; las cámaras del episodio no usan roll). */
export const scr = (c: Camera, p: {x: number; y: number}) => ({x: VW / 2 + (p.x - c.x) * c.zoom, y: VH / 2 + (p.y - c.y) * c.zoom});
/** Desplazamiento vertical acumulado del descenso (nieve marina y paredes). */
export const climbAt = (t: number) => depthAt(t) * 0.9;
/** Oscuridad según la profundidad (sin luz solar a partir de ~1.000 m). */
export const darkOf = (d: number) => clamp(smoothstep(250, 1100, d) * 0.88 + smoothstep(1100, 3000, d) * 0.06);
export const snowOf = (d: number) => lerp(0.35, 0.85, smoothstep(100, 2000, d));

/** Fondo de agua + rayos de sol + vida lejana (todo depende de la profundidad). */
export const Env: React.FC<{d: number; t: number; lift?: number; far?: boolean; rays?: number}> = ({d, t, lift = 0, far = true, rays = 1}) => (
  <g>
    <WaterBG d={d} lift={lift} />
    <SunRays d={d} t={t} k={rays} />
    {far && <FarLife d={d} t={t} />}
  </g>
);
/** Sumergible en el mundo (capa de profundidad 1). */
export const Sub: React.FC<{p: SubPose}> = ({p}) => (
  <ParallaxLayer depth={1}><Submersible p={p} uid="mi01" /></ParallaxLayer>
);
/** Conos de luz de los focos (capa luminosa, por encima de la oscuridad). */
export const SubBeams: React.FC<{p: SubPose; k: number; len?: number}> = ({p, k, len = 900}) => {
  if (k <= 0.01) return null;
  const L = lampWorld(p);
  return (
    <ParallaxLayer depth={1}>
      {L.map((l, i) => <Beam key={i} id={`beam${i}`} x={l.x} y={l.y} ang={l.a} len={len * p.s * (i < 2 ? 1.25 : 0.8)} spread={i < 2 ? 0.28 : 0.35} k={k * (i < 2 ? 0.55 : 0.4)} />)}
    </ParallaxLayer>
  );
};
/** Luz para la capa de oscuridad: centrada donde apuntan los focos (pantalla). */
export function subLight(c: Camera, p: SubPose, k: number, reach = 420, r = 560) {
  const L = lampWorld(p)[0];
  const tgt = {x: L.x + Math.cos(L.a) * reach * p.s * 2, y: L.y + Math.sin(L.a) * reach * p.s * 2};
  const s = scr(c, {x: (L.x + tgt.x) / 2, y: (L.y + tgt.y) / 2});
  return {x: s.x, y: s.y, r: r * Math.max(0.6, c.zoom), k};
}
export const focusLight = (c: Camera, p: {x: number; y: number}, r = 520, k = 0.9) => {
  const s = scr(c, p);
  return {x: s.x, y: s.y, r: r * Math.max(0.6, c.zoom), k};
};
export const frame = (f: Frame) => f;
export const W = VW;
export const H = VH;

// ------------------------------------------------------------------ fichas de especie (rangos documentados)
export const SP: Record<string, Species> = {
  dolphin: {common: 'Delfín tornillo', sci: 'Stenella longirostris', range: 'superficie y aguas someras', fact: 'Frecuente alrededor de Guam y las Marianas; respira en superficie.'},
  tuna: {common: 'Atún aleta amarilla', sci: 'Thunnus albacares', range: 'sobre todo 0–250 m', fact: 'Nadador oceánico veloz del Pacífico tropical.'},
  shark: {common: 'Tiburón gris de arrecife', sci: 'Carcharhinus amblyrhynchos', range: '0–≈280 m', fact: 'Presente en arrecifes de Guam y las Marianas.'},
  lantern: {common: 'Pez linterna', sci: 'familia Myctophidae', range: 'de día ≈ 300–1.500 m · de noche cerca de la superficie', fact: 'Fotóforos: órganos que producen luz.'},
  barreleye: {common: 'Pez de cabeza transparente', sci: 'Macropinna microstoma', range: 'habitualmente ≈ 600–800 m', fact: 'Ojos tubulares dentro de un escudo transparente.', note: 'Pacífico Norte: ejemplo de la zona crepuscular, no documentado en la fosa.'},
  atolla: {common: 'Medusa corona', sci: 'Atolla wyvillei', range: 'hasta ≈ 5.000 m (rango publicado amplio)', fact: 'Emite destellos azules en "rueda" al ser molestada.'},
  angler: {common: 'Rape abisal', sci: 'Linophryne arborifera', range: '≈ 200–1.000 m', fact: 'Señuelo con bacterias luminosas y barbilla ramificada.', note: 'Reconstrucción: ejemplo de la fauna bioluminiscente profunda.'},
  dragon: {common: 'Pez dragón negro del Pacífico', sci: 'Idiacanthus antrostomus', range: 'registros hasta ≈ 2.160 m', fact: 'Dientes en colmillo, barbilla y fotóforos luminosos.', note: 'Pacífico oriental: ejemplo de zona oceánica equivalente.'},
  squid: {common: 'Calamar gigante', sci: 'Architeuthis dux', range: '≈ 300–1.000 m (estimado)', fact: 'Fotografiado vivo por primera vez a ≈ 900 m (2004, islas Ogasawara).', note: 'Reconstrucción: no habita a la profundidad del contador.'},
  whale: {common: 'Cachalote', sci: 'Physeter macrocephalus', range: 'habitualmente 400–1.200 m · registros ≈ 2.000 m', fact: 'Ecolocalización con clics muy potentes.', note: 'Reconstrucción: su inmersión no llega a esta profundidad.'},
  gulper: {common: 'Pez pelícano', sci: 'Eurypharynx pelecanoides', range: '≈ 500–3.000 m', fact: 'Mandíbula enorme y extensible; cola con órgano luminoso.'},
  dumbo: {common: 'Pulpo dumbo', sci: 'género Grimpoteuthis', range: 'aguas profundas; observado hasta ≈ 6.957 m', fact: 'Nada con dos aletas y una membrana entre los brazos.'},
  cucumber: {common: 'Pepino de mar abisal', sci: 'Psychropotes longicauda', range: 'típico ≈ 2.000–5.000 m', fact: 'Se alimenta de materia orgánica del sedimento.'},
  xeno: {common: 'Xenofióforos', sci: 'foraminíferos (protistas)', range: 'fondos profundos; también en la fosa', fact: 'Cada uno es una sola célula gigante.'},
  amphipod: {common: 'Anfípodo hadal', sci: 'Hirondellea gigas', range: 'zona hadal; capturado a ≈ 10.900 m', fact: 'Enzimas que digieren celulosa de restos vegetales.'},
  snail: {common: 'Pez caracol de las Marianas', sci: 'Pseudoliparis swirei', range: '≈ 6.900–8.000 m (filmado a ≈ 8.178 m)', fact: 'Descrito en 2017; cuerpo blando y translúcido.'},
  microbes: {common: 'Microorganismos piezófilos', sci: 'bacterias y arqueas', range: 'sedimentos hadales', fact: 'Crecen mejor bajo presiones muy altas.'},
};
