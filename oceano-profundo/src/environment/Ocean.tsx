// ENTORNO OCEÁNICO por profundidad (en metros): el color del agua, la luz y la visibilidad cambian con la zona.
// Capas: fondo (pantalla) → rayos → bruma y siluetas lejanas (d 0,35) → fondo marino lejano (d 0,6) →
// plano principal (d 1: animales, fondo, hielo, superficie) → nieve marina y plancton → primer plano desenfocado.
// La oscuridad nunca es negro puro: el agua conserva un azul profundo y los animales llevan luz de contorno.
import React from 'react';
import {Cam, layerT, visible, VP} from '../camera/camera';
import {AquaWarp, BioSpecks, GodRays, MarineSnow} from '../effects/Effects';
import {useView} from '../utils/context';
import {clamp, hash1, lerp, mixColor} from '../utils/math';
import {f1} from '../utils/spline';

type V = {x: number; y: number};
/** Paleta del agua según profundidad (arriba / abajo del cuadro). */
const WATER: [number, string, string][] = [
  [0, '#5cc4e4', '#1b77a4'],
  [60, '#2f97c6', '#125f8c'],
  [200, '#17669a', '#0a3a62'],
  [500, '#0d4372', '#06223f'],
  [1000, '#08284a', '#031327'],
  [2000, '#061e3a', '#020c1c'],
  [4500, '#05182e', '#010812'],
];
export function waterAt(depth: number): [string, string] {
  for (let i = 1; i < WATER.length; i++) {
    if (depth <= WATER[i][0]) {
      const u = (depth - WATER[i - 1][0]) / (WATER[i][0] - WATER[i - 1][0]);
      return [mixColor(WATER[i - 1][1], WATER[i][1], u), mixColor(WATER[i - 1][2], WATER[i][2], u)];
    }
  }
  return [WATER[WATER.length - 1][1], WATER[WATER.length - 1][2]];
}
/** Intensidad de la luz solar (0–1) con la profundidad (caída aproximadamente exponencial). */
export const sunAt = (depth: number) => clamp(Math.exp(-depth / 110));

export type FloorKind = 'abyss' | 'antarctic' | 'slope';
export type OceanProps = {
  cam: Cam;
  t: number;
  depth: number;
  children?: React.ReactNode;
  floor?: {y: number; kind: FloorKind};
  surfaceY?: number; // superficie vista desde abajo (coordenada del mundo)
  ice?: boolean; // témpanos en la superficie (aguas antárticas)
  snow?: number;
  specks?: number; // plancton bioluminiscente
  stir?: V[];
  stirR?: number;
  current?: number;
  tint?: string; // tinte del agua (p. ej. cian frío antártico)
  tintK?: number;
  spot?: {x: number; y: number; r: number; k: number}; // luz suave sobre la acción (relleno documental)
  schools?: number; // siluetas de cardúmenes lejanos
  warp?: number;
  front?: React.ReactNode; // elementos de primer plano (d 1,4)
};

export const Ocean: React.FC<OceanProps> = ({cam, t, depth, children, floor, surfaceY, ice, snow = 1, specks = 0, stir, stirR = 300, current = 6, tint, tintK = 0, spot, schools = 0, warp = 0, front}) => {
  const {w, h, q} = useView();
  const vp: VP = {w, h};
  let [top, bot] = waterAt(depth);
  if (tint) {
    top = mixColor(top, tint, tintK);
    bot = mixColor(bot, tint, tintK * 0.7);
  }
  const sun = sunAt(depth);
  const box = visible(cam, vp, 1, 400);
  const bgId = `ocW${Math.round(depth)}${tint ? 't' : ''}`;
  return (
    <g>
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
        <radialGradient id="ocSpot">
          <stop offset="0" stopColor="#9fd8ff" stopOpacity={0.28} />
          <stop offset="0.6" stopColor="#4a8ad8" stopOpacity={0.08} />
          <stop offset="1" stopColor="#4a8ad8" stopOpacity={0} />
        </radialGradient>
        <filter id="ocFar" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={8 * q.blur + 1} /></filter>
        <filter id="ocNear" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={18 * q.blur + 2} /></filter>
      </defs>
      <AquaWarp t={t} k={warp} id="ocWarp">
        <rect width={w} height={h} fill={`url(#${bgId})`} />
        <GodRays t={t} k={sun * 0.9} cam={cam} />
      </AquaWarp>
      {/* siluetas de cardúmenes lejanos */}
      {schools > 0.01 && (
        <g transform={layerT(cam, vp, 0.35)} filter="url(#ocFar)" opacity={schools * (0.25 + sun * 0.5)}>
          {Array.from({length: 40}, (_, i) => {
            const cx = cam.x * 0.35 + ((hash1(i * 3) * 3000 + t * 30) % 3000) - 1500;
            const cy = cam.y * 0.35 + (hash1(i * 7) - 0.5) * 500 + Math.sin(t * 0.5 + i) * 20;
            return <path key={i} d={`M${f1(cx)},${f1(cy)} q16,-6 30,0 q-14,6 -30,0z M${f1(cx)},${f1(cy)} l-9,-5 l0,10z`} fill={mixColor(bot, '#000', 0.4)} />;
          })}
        </g>
      )}
      {/* fondo marino lejano */}
      {floor && (
        <g transform={layerT(cam, vp, 0.6)} filter="url(#ocFar)" opacity={0.85}>
          <path d={`M${f1(cam.x * 0.6 - 3000)},${f1(floor.y * 0.6 + 1400)} ${Array.from({length: 32}, (_, i) => `L${f1(cam.x * 0.6 - 3000 + i * 200)},${f1(floor.y * 0.6 - 30 - hash1(i * 5 + 3) * 140 - (i % 7 === 3 ? 160 : 0))}`).join(' ')} L${f1(cam.x * 0.6 + 3400)},${f1(floor.y * 0.6 + 1400)}Z`} fill={mixColor(bot, floor.kind === 'antarctic' ? '#3a5a6a' : '#2a2a30', 0.35)} />
        </g>
      )}
      <g transform={layerT(cam, vp, 1)}>
        {spot && spot.k > 0.01 && <ellipse cx={spot.x} cy={spot.y} rx={spot.r} ry={spot.r * 0.8} fill="url(#ocSpot)" opacity={spot.k} />}
        {surfaceY !== undefined && <Surface t={t} y={surfaceY} x0={box.x0} x1={box.x1} ice={ice} />}
        {floor && <Seafloor t={t} y={floor.y} kind={floor.kind} x0={box.x0} x1={box.x1} />}
        {children}
      </g>
      <MarineSnow cam={cam} t={t} density={snow} current={current} color={mixColor('#e8f4f8', top, 0.25)} seed={Math.round(depth / 100) + 1} />
      {specks > 0 && <BioSpecks cam={cam} t={t} n={Math.round(60 * specks)} stir={stir} stirR={stirR} />}
      {front && <g transform={layerT(cam, vp, 1.4)} filter="url(#ocNear)">{front}</g>}
    </g>
  );
};

/** Superficie vista desde abajo: lámina brillante ondulante, ventana de Snell y témpanos opcionales. */
const Surface: React.FC<{t: number; y: number; x0: number; x1: number; ice?: boolean}> = ({t, y, x0, x1, ice}) => {
  const xs: number[] = [];
  for (let x = Math.floor(x0 / 60) * 60; x <= x1 + 60; x += 60) xs.push(x);
  const wy = (x: number) => y + Math.sin(x * 0.006 + t * 1.2) * 10 + Math.sin(x * 0.017 - t * 1.9) * 4;
  return (
    <g>
      <rect x={x0} y={y - 3000} width={x1 - x0} height={3000} fill="#7ec8e8" opacity={0.8} />
      <path d={`M${x0},${y - 3000} ${xs.map((x) => `L${x},${f1(wy(x))}`).join(' ')} L${x1},${y - 3000}Z`} fill="#bfe8f8" opacity={0.55} />
      {xs.map((x, i) => (i % 2 ? <path key={i} d={`M${x},${f1(wy(x) + 6)} q30,${f1(8 + Math.sin(t * 2 + i) * 4)} 60,0`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.5} /> : null))}
      {ice &&
        Array.from({length: 18}, (_, i) => {
          const cx = Math.floor(x0 / 700) * 700 + i * 380 + hash1(i * 5) * 160;
          const ww = 180 + hash1(i * 3) * 260;
          return <path key={`ic${i}`} d={`M${f1(cx - ww / 2)},${f1(y - 4)} q${f1(ww * 0.1)},${f1(30 + hash1(i) * 50)} ${f1(ww * 0.5)},${f1(40 + hash1(i * 9) * 40)} q${f1(ww * 0.35)},-10 ${f1(ww * 0.5)},-${f1(40 + hash1(i * 9) * 40)}Z`} fill="#dff4ff" stroke="#9cc8de" strokeWidth={3} opacity={0.95} />;
        })}
      <rect x={x0} y={y} width={x1 - x0} height={600} fill="#bfeaff" opacity={0.12} />
    </g>
  );
};

/** Fondo marino: llanura abisal (sedimento, rocas, esponjas de cristal, plumas de mar, holoturias) o talud antártico. */
const Seafloor: React.FC<{t: number; y: number; kind: FloorKind; x0: number; x1: number}> = ({t, y, kind, x0, x1}) => {
  const sand = kind === 'antarctic' ? ['#4a5a62', '#26323a'] : ['#3a3c44', '#1c1e26'];
  const step = 120;
  const xs: number[] = [];
  for (let x = Math.floor(x0 / step) * step - step; x <= x1 + step; x += step) xs.push(x);
  const gy = (x: number) => y + Math.sin(x * 0.002) * 26 + Math.sin(x * 0.0071) * 9;
  const items = xs.filter((x) => Math.abs(hash1(x * 0.37)) > 0.55);
  return (
    <g>
      <defs>
        <linearGradient id={`sf${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sand[0]} />
          <stop offset="1" stopColor={sand[1]} />
        </linearGradient>
      </defs>
      <path d={`M${xs[0]},${y + 3000} ${xs.map((x) => `L${x},${f1(gy(x))}`).join(' ')} L${xs[xs.length - 1]},${y + 3000}Z`} fill={`url(#sf${kind})`} />
      {/* textura de sedimento */}
      {xs.map((x, i) => (
        <g key={`sd${x}`} opacity={0.5}>
          <ellipse cx={x + hash1(x) * 80} cy={gy(x) + 30 + hash1(x * 3) * 120} rx={4 + hash1(x * 5) * 10} ry={2 + hash1(x * 7) * 3} fill="#5a5c66" />
          {i % 3 === 0 && <path d={`M${x},${f1(gy(x) + 70)} q40,-8 80,0`} stroke="#4a4c56" strokeWidth={3} fill="none" />}
        </g>
      ))}
      {items.map((x) => {
        const k = Math.floor(hash1(x * 1.3) * 5);
        const g = gy(x);
        if (k === 0)
          return <path key={`it${x}`} d={`M${x - 60},${f1(g + 8)} Q${x - 40},${f1(g - 70)} ${x + 10},${f1(g - 80)} Q${x + 70},${f1(g - 50)} ${x + 80},${f1(g + 8)}Z`} fill="#2e3038" stroke="#16181e" strokeWidth={3} />;
        if (k === 1)
          // esponja de cristal (Euplectella): tubo reticulado pálido
          return (
            <g key={`it${x}`} opacity={0.85}>
              <path d={`M${x - 14},${f1(g)} Q${x - 22},${f1(g - 90)} ${x - 10},${f1(g - 150)} L${x + 10},${f1(g - 150)} Q${x + 22},${f1(g - 90)} ${x + 14},${f1(g)}Z`} fill="#c8d8dc" fillOpacity={0.35} stroke="#dfeef2" strokeWidth={2} />
              {Array.from({length: 6}, (_, j) => <path key={j} d={`M${x - 16},${f1(g - 20 - j * 22)} L${x + 16},${f1(g - 32 - j * 22)} M${x + 16},${f1(g - 20 - j * 22)} L${x - 16},${f1(g - 32 - j * 22)}`} stroke="#dfeef2" strokeWidth={1} opacity={0.6} />)}
            </g>
          );
        if (k === 2)
          // pluma de mar: eje con pínulas que se mecen
          return (
            <g key={`it${x}`} transform={`rotate(${f1(Math.sin(t * 0.6 + x) * 6)} ${x} ${f1(g)})`}>
              <path d={`M${x},${f1(g)} L${x},${f1(g - 120)}`} stroke="#e8a070" strokeWidth={4} />
              {Array.from({length: 8}, (_, j) => <path key={j} d={`M${x},${f1(g - 50 - j * 9)} q-14,-6 -18,-14 M${x},${f1(g - 50 - j * 9)} q14,-6 18,-14`} stroke="#f0b888" strokeWidth={2.5} fill="none" />)}
            </g>
          );
        if (k === 3)
          // holoturia
          return <ellipse key={`it${x}`} cx={x} cy={f1(g - 8)} rx={36} ry={12} fill="#a85a68" opacity={0.85} />;
        // ofiura (estrella frágil)
        return (
          <g key={`it${x}`} opacity={0.8}>
            {Array.from({length: 5}, (_, j) => {
              const a = (j / 5) * Math.PI * 2 + Math.sin(t * 0.5 + x) * 0.1;
              return <path key={j} d={`M${x},${f1(g - 3)} q${f1(Math.cos(a) * 20)},${f1(Math.sin(a) * 6)} ${f1(Math.cos(a + 0.4) * 38)},${f1(Math.sin(a + 0.4) * 10 - 2)}`} stroke="#d8a888" strokeWidth={3} fill="none" />;
            })}
          </g>
        );
      })}
      {kind === 'antarctic' && <rect x={x0} y={y - 2000} width={x1 - x0} height={2000} fill="#9fe0ff" opacity={0.03} />}
    </g>
  );
};

export const depthLerp = (a: number, b: number, u: number) => lerp(a, b, clamp(u));
