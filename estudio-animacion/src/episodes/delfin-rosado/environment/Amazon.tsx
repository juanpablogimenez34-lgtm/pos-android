// ESCENARIO AMAZÓNICO: río y bosque inundado (várzea / igapó). Superficie del agua en y = 0 (mundo).
//  · Por encima del agua: cielo cálido, muro de selva en capas (dosel lejano, medio y cercano), troncos que salen
//    del agua, reflejos, ondas y hojas flotantes.
//  · Bajo el agua: agua marrón verdosa (ámbar cerca de la superficie, más oscura en el fondo), rayos dorados que
//    atraviesan el dosel, troncos gigantes con raíces tabulares, raíces enredadas y aéreas, ramas sumergidas,
//    sedimento en suspensión, fondo de lodo con hojarasca y raíces desenfocadas en primer plano.
//  · `murk` 0…1: turbidez (reduce la visibilidad con bruma marrón entre capas).
// Peces de agua dulce: carácidos plateados de cola roja (cardumen) y cíclidos; reaccionan y se dispersan.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const FLOOR = 1500;
export const PAL = {emerald: '#1f6a4a', jungle: '#2e5a24', amber: '#8a6a2a', gold: '#f0c060', teal: '#1a4a4a', pink: '#d79ea0', pearl: '#cfd4d6'};

/** Árboles del bosque inundado: posición, grosor y raíces (memorizados a nivel de módulo). */
export const TREES = Array.from({length: 14}, (_, i) => ({x: -3400 + i * 540 + (hash1(i * 13) - 0.5) * 200, w: 55 + hash1(i * 7) * 75, lean: (hash1(i * 3) - 0.5) * 0.08, roots: 3 + Math.floor(hash1(i * 5) * 4), seed: i}));

/** Tronco con raíces tabulares y textura de corteza (mundo, plano d=1). */
export const Trunk: React.FC<{x: number; w: number; lean: number; roots: number; seed: number; t: number; under: string; above: string; murk: number}> = ({x, w, lean, roots, seed, t, under, above, murk}) => {
  const top = -2400;
  const bot = FLOOR + 40;
  const xb = x + lean * 1800;
  const bark = mixColor(under, '#000', 0.25);
  return (
    <g>
      {/* parte aérea (encima del agua) */}
      <path d={`M${f1(x - w / 2 + lean * top)},${top} L${f1(x + w / 2 + lean * top)},${top} L${f1(x + w / 2)},0 L${f1(x - w / 2)},0Z`} fill={above} />
      {/* parte sumergida, se ensancha hacia las raíces */}
      <path d={`M${f1(x - w / 2)},0 L${f1(x + w / 2)},0 L${f1(xb + w * 0.62)},${FLOOR - 260} Q${f1(xb + w * 1.6)},${FLOOR - 40} ${f1(xb + w * 2.1)},${bot} L${f1(xb - w * 2.1)},${bot} Q${f1(xb - w * 1.6)},${FLOOR - 40} ${f1(xb - w * 0.62)},${FLOOR - 260}Z`} fill={under} />
      {/* corteza: estrías verticales */}
      {Array.from({length: 5}, (_, k) => {
        const o = (k / 4 - 0.5) * w * 0.8;
        return <path key={k} d={`M${f1(x + o)},20 Q${f1(x + o + Math.sin(seed + k) * 8)},${FLOOR * 0.5} ${f1(xb + o * 1.3)},${FLOOR - 200}`} stroke={bark} strokeWidth={3 + hash1(seed * 7 + k) * 3} fill="none" opacity={0.6} />;
      })}
      {/* raíces tabulares y zancos */}
      {Array.from({length: roots}, (_, k) => {
        const s = k % 2 ? 1 : -1;
        const r0 = FLOOR - 200 - hash1(seed * 11 + k) * 500;
        const reach = w * (1.4 + hash1(seed * 3 + k) * 2.2);
        return <path key={`r${k}`} d={`M${f1(xb + s * w * 0.3)},${f1(r0)} C${f1(xb + s * reach * 0.4)},${f1(r0 + 80)} ${f1(xb + s * reach * 0.8)},${f1(r0 + 260)} ${f1(xb + s * reach)},${bot}`} stroke={under} strokeWidth={10 + hash1(seed + k) * 16} fill="none" strokeLinecap="round" />;
      })}
      {/* raíces aéreas finas que cuelgan hasta el agua y entran en ella */}
      {Array.from({length: 3}, (_, k) => {
        const ox = (hash1(seed * 17 + k) - 0.5) * w * 3;
        const sw = Math.sin(t * 0.6 + seed + k) * 10;
        return <path key={`a${k}`} d={`M${f1(x + ox * 0.3)},-900 Q${f1(x + ox)},-200 ${f1(x + ox + sw)},${f1(500 + hash1(seed + k * 3) * 500)}`} stroke={under} strokeWidth={3} fill="none" opacity={0.75 - murk * 0.3} />;
      })}
    </g>
  );
};

export type AmazonProps = {cam: Cam; t: number; children?: React.ReactNode; murk?: number; rays?: number; front?: boolean; fishFront?: React.ReactNode};

export const Amazon: React.FC<AmazonProps> = ({cam, t, children, murk = 0, rays = 1, front = true}) => {
  const m = clamp(murk);
  const surfS = toScreen(cam, 0, 0).y; // línea de flotación en pantalla
  const waterTop = mixColor('#b0a650', '#6a5a2a', m);
  const waterMid = mixColor('#5a7036', '#3e3e20', m);
  const waterBot = mixColor('#29381c', '#1c1c10', m);
  const fogC = mixColor('#6a6a34', '#4a4228', m);
  const visible = (x: number, pad = 600) => Math.abs(x - cam.x) < 1080 / cam.zoom / 2 + pad;
  return (
    <g>
      <defs>
        <linearGradient id="amSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8c8d0" />
          <stop offset="0.6" stopColor="#f0e0a8" />
          <stop offset="1" stopColor="#f6d890" />
        </linearGradient>
        <linearGradient id={`amW${Math.round(m * 100)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={waterTop} />
          <stop offset="0.35" stopColor={waterMid} />
          <stop offset="1" stopColor={waterBot} />
        </linearGradient>
        <linearGradient id="amRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe8a0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffe8a0" stopOpacity={0} />
        </linearGradient>
        <filter id="amB1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={6} /></filter>
        <filter id="amB2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={16} /></filter>
        <filter id="amRays" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation={20} /></filter>
      </defs>
      {/* agua (todo el cuadro) y cielo por encima de la línea de flotación */}
      <rect width={1080} height={1920} fill={`url(#amW${Math.round(m * 100)})`} />
      {surfS > 0 && <rect width={1080} height={Math.min(1920, surfS)} fill="url(#amSky)" />}
      {/* ---------- POR ENCIMA DEL AGUA: selva en capas ---------- */}
      {surfS > 0 && (
        <g>
          <g transform={layerT(cam, 0.3)} filter="url(#amB1)">
            <path d={`M${f1(cam.x * 0.3 - 3000)},0 ${Array.from({length: 60}, (_, i) => `L${f1(cam.x * 0.3 - 3000 + i * 100)},${f1(-260 - hash1(i * 3) * 220 - Math.sin(i * 0.7) * 60)}`).join(' ')} L${f1(cam.x * 0.3 + 3000)},0Z`} fill="#5a7a5a" opacity={0.85} />
          </g>
          <g transform={layerT(cam, 0.55)}>
            {Array.from({length: 40}, (_, i) => {
              const x = cam.x * 0.55 - 2400 + i * 120 + hash1(i * 7) * 60;
              const h = 380 + hash1(i * 9) * 360;
              const r = 90 + hash1(i * 5) * 80;
              return (
                <g key={i}>
                  <rect x={x - 8} y={-h * 0.6} width={16} height={h * 0.6} fill="#3a3020" />
                  <circle cx={x} cy={-h * 0.6} r={r} fill={['#2e5a24', '#3a6a2a', '#1f4a2a'][i % 3]} />
                  <circle cx={x + r * 0.5} cy={-h * 0.6 - r * 0.3} r={r * 0.7} fill={['#3a6a2a', '#4a7a32', '#2e5a24'][i % 3]} />
                  <circle cx={x - r * 0.4} cy={-h * 0.6 + Math.sin(t * 0.5 + i) * 3} r={r * 0.6} fill="#5a8a3a" opacity={0.6} />
                </g>
              );
            })}
          </g>
        </g>
      )}
      {/* ---------- BAJO EL AGUA ---------- */}
      {/* rayos dorados que atraviesan el dosel (interrumpidos por la sombra de las hojas) */}
      <g filter="url(#amRays)" opacity={rays * (0.75 - m * 0.55)} style={{mixBlendMode: 'screen'}}>
        {Array.from({length: 7}, (_, i) => {
          const x0 = 60 + i * 170 + Math.sin(t * 0.18 + i * 1.7) * 50 - ((cam.x * 0.1) % 170);
          const ww = 30 + hash1(i * 3) * 60;
          const fl = 0.4 + 0.4 * Math.max(0, Math.sin(t * 0.5 + i * 2.1));
          const y0 = Math.max(0, surfS);
          return <path key={i} d={`M${f1(x0)},${f1(y0)} L${f1(x0 + ww)},${f1(y0)} L${f1(x0 + ww * 2 + 220)},1920 L${f1(x0 + 200)},1920Z`} fill="url(#amRay)" opacity={fl} />;
        })}
      </g>
      {/* troncos lejanos (siluetas en la bruma) */}
      <g transform={layerT(cam, 0.45)} filter="url(#amB2)" opacity={0.45 - m * 0.25}>
        {TREES.map((tr, i) => {
          const x = tr.x * 0.9 + 140;
          return <path key={i} d={`M${f1(x - tr.w * 0.35)},0 L${f1(x + tr.w * 0.35)},0 L${f1(x + tr.w * 0.9)},${FLOOR * 0.45 + 200} L${f1(x - tr.w * 0.9)},${FLOOR * 0.45 + 200}Z`} fill={mixColor(waterMid, '#0a120a', 0.3)} />;
        })}
      </g>
      {/* bruma intermedia */}
      <rect width={1080} height={1920} y={Math.max(0, surfS)} fill={fogC} opacity={0.18 + m * 0.35} />
      {/* troncos medios */}
      <g transform={layerT(cam, 0.72)} filter="url(#amB1)" opacity={0.6 - m * 0.35}>
        {TREES.filter((_, i) => i % 2).map((tr, i) => (
          <Trunk key={i} x={tr.x * 0.95 + 260} w={tr.w * 0.8} lean={tr.lean} roots={tr.roots} seed={tr.seed + 40} t={t} under={mixColor('#3a3020', fogC, 0.35)} above="#3a3020" murk={m} />
        ))}
      </g>
      <rect width={1080} height={1920} y={Math.max(0, surfS)} fill={fogC} opacity={m * 0.35} />
      {/* plano principal: troncos detallados, raíces, fondo y animales */}
      <g transform={layerT(cam, 1)}>
        {/* fondo de lodo con hojarasca */}
        <path d={`M${f1(cam.x - 3000)},${FLOOR + 3000} L${f1(cam.x - 3000)},${FLOOR} ${Array.from({length: 61}, (_, i) => {
          const x = Math.floor(cam.x / 100) * 100 - 3000 + i * 100;
          return `L${x},${f1(FLOOR + Math.sin(x * 0.004) * 18)}`;
        }).join(' ')} L${f1(cam.x + 3000)},${FLOOR + 3000}Z`} fill={mixColor('#3a2e1a', '#241c10', m)} />
        {Array.from({length: 40}, (_, i) => {
          const x = Math.floor(cam.x / 1600) * 1600 - 2400 + hash1(i * 31) * 4800;
          return <ellipse key={`lf${i}`} cx={x} cy={FLOOR + 10 + hash1(i * 7) * 60} rx={14 + hash1(i) * 10} ry={5} fill={['#6a4a1a', '#8a5a20', '#4a3a18'][i % 3]} opacity={0.8} transform={`rotate(${f1(hash1(i * 3) * 60 - 30)} ${f1(x)} ${f1(FLOOR + 10)})`} />;
        })}
        {TREES.filter((tr) => visible(tr.x, 900)).map((tr, i) => (
          <Trunk key={i} x={tr.x} w={tr.w} lean={tr.lean} roots={tr.roots} seed={tr.seed} t={t} under={mixColor('#4a3a22', fogC, 0.15 + m * 0.4)} above="#4a3a22" murk={m} />
        ))}
        {/* ramas sumergidas cruzadas entre troncos */}
        {TREES.slice(0, -1).filter((tr) => visible(tr.x, 900)).map((tr, i) => {
          if (hash1(tr.seed * 19) < 0.45) return null;
          const nx = TREES[tr.seed + 1].x;
          const y0 = 300 + hash1(tr.seed * 23) * 800;
          return <path key={`br${i}`} d={`M${f1(tr.x)},${f1(y0)} Q${f1((tr.x + nx) / 2)},${f1(y0 + 120 + Math.sin(t * 0.3 + i) * 6)} ${f1(nx)},${f1(y0 + 260)}`} stroke={mixColor('#4a3a22', fogC, 0.2 + m * 0.4)} strokeWidth={12} fill="none" strokeLinecap="round" />;
        })}
        {children}
        {/* línea de flotación vista desde abajo: lámina dorada ondulante con hojas flotantes */}
        {surfS > -200 && (
          <g>
            <path d={`M${f1(cam.x - 1600)},-300 L${f1(cam.x - 1600)},0 ${Array.from({length: 33}, (_, i) => {
              const x = Math.floor(cam.x / 100) * 100 - 1600 + i * 100;
              return `L${x},${f1(Math.sin(x * 0.01 + t * 1.4) * 5)}`;
            }).join(' ')} L${f1(cam.x + 1700)},-300Z`} fill="#c8b870" opacity={surfS > 0 ? 0 : 0.0} />
            <rect x={cam.x - 1600} y={-2} width={3300} height={18} fill="#f0d890" opacity={0.35} />
            {Array.from({length: 24}, (_, i) => {
              const x = Math.floor(cam.x / 2000) * 2000 - 2000 + ((hash1(i * 13) * 5000 + t * 14) % 5000);
              return <ellipse key={`fl${i}`} cx={x} cy={2} rx={18 + hash1(i) * 14} ry={5} fill={['#3a5a20', '#5a6a20', '#7a5a20'][i % 3]} opacity={0.9} />;
            })}
          </g>
        )}
      </g>
      {/* superficie vista desde arriba: reflejos y ondas (cuando la cámara está encima del agua) */}
      {surfS > 0 && surfS < 1920 && (
        <g>
          <rect x={0} y={surfS} width={1080} height={70 * cam.zoom} fill="#d8c070" opacity={0.18} />
          {Array.from({length: 18}, (_, i) => {
            const yy = surfS + 8 + i * 14 * cam.zoom;
            const xx = (hash1(i * 5) * 1080 + t * 30 * (i % 2 ? 1 : -1)) % 1080;
            return <path key={`rw${i}`} d={`M${f1(xx)},${f1(yy)} l${f1(80 + hash1(i) * 120)},0`} stroke="#f6e0a0" strokeWidth={2} opacity={0.35} />;
          })}
        </g>
      )}
      {/* sedimento en suspensión */}
      <g transform={layerT(cam, 1.15)} opacity={0.75}>
        {Array.from({length: 70}, (_, i) => {
          const x = cam.x * 1.15 + ((hash1(i * 7) * 2600 + t * 10 * (0.4 + hash1(i))) % 2600) - 1300;
          const y = cam.y * 1.15 + ((hash1(i * 11) * 3600 + Math.sin(t * 0.4 + i) * 20 + 3600 * 4) % 3600) - 1800;
          if (y < 0) return null;
          return <circle key={i} cx={f1(x)} cy={f1(y)} r={(1.4 + hash1(i * 3) * 2.6) / Math.pow(cam.zoom, 0.2)} fill={i % 3 ? '#e8d8a0' : '#c8b878'} opacity={0.5} />;
        })}
      </g>
      {/* primer plano desenfocado (raíces cercanas) */}
      {front && (
        <g transform={layerT(cam, 1.45)} filter="url(#amB2)" opacity={0.75}>
          {[-1, 1].map((s) => (
            <path key={s} d={`M${f1(cam.x * 1.45 + s * 640 / Math.pow(cam.zoom, 1.45))},${f1(cam.y * 1.45 - 1400)} C${f1(cam.x * 1.45 + s * 520)},${f1(cam.y * 1.45 - 200)} ${f1(cam.x * 1.45 + s * 700)},${f1(cam.y * 1.45 + 600)} ${f1(cam.x * 1.45 + s * 560)},${f1(cam.y * 1.45 + 1600)}`} stroke="#1a1408" strokeWidth={70} fill="none" />
          ))}
        </g>
      )}
      {/* turbidez: velo final */}
      {m > 0.01 && <rect width={1080} height={1920} y={Math.max(0, surfS)} fill={mixColor('#5a5230', '#3a3420', m)} opacity={m * 0.38} />}
    </g>
  );
};

/** Pez de agua dulce: carácido (plateado, banda oscura, cola roja) o cíclido (alto, con ocelo). */
export const FreshFish: React.FC<{x: number; y: number; s?: number; t: number; dir?: 1 | -1; kind?: 'characin' | 'cichlid'; flee?: number; opacity?: number; tilt?: number}> = ({x, y, s = 1, t, dir = 1, kind = 'characin', flee = 0, opacity = 1, tilt = 0}) => {
  const beat = Math.sin(t * (10 + flee * 14)) * (0.25 + flee * 0.25);
  if (kind === 'cichlid')
    return (
      <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(tilt * 57.3)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={opacity}>
        <path d={`M-40,0 L${f1(-62)},${f1(-16 + beat * 14)} L${f1(-60)},${f1(16 + beat * 14)}Z`} fill="#8a6a3a" />
        <path d="M36,2 Q30,-30 -8,-30 Q-38,-24 -42,0 Q-38,22 -8,26 Q30,26 36,2Z" fill="#a88a4a" stroke="#4a3a1a" strokeWidth={1.6} />
        <path d="M-6,-30 Q-20,-44 -40,-26" fill="#8a6a3a" />
        <circle cx={-30} cy={-4} r={7} fill="#2a1a0a" stroke="#f0a040" strokeWidth={2.4} />
        <circle cx={22} cy={-6} r={5} fill="#f0e0c0" />
        <circle cx={23} cy={-6} r={2.8} fill="#1a1008" />
        {[0, 1, 2].map((k) => <path key={k} d={`M${4 - k * 12},-24 l-4,46`} stroke="#5a4020" strokeWidth={3} opacity={0.35} />)}
      </g>
    );
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(tilt * 57.3)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={opacity}>
      <path d={`M-26,0 L${f1(-42)},${f1(-10 + beat * 10)} L${f1(-40)},${f1(10 + beat * 10)}Z`} fill="#d84a30" />
      <path d="M30,0 Q22,-12 -2,-11 Q-22,-8 -28,0 Q-22,7 -2,10 Q22,11 30,0Z" fill="#c8d4d0" stroke="#4a5a5a" strokeWidth={1.2} />
      <path d="M24,-2 Q0,-3 -26,0" stroke="#2a3a3a" strokeWidth={3} opacity={0.6} />
      <path d="M-2,-11 l-8,-7 l-4,8z" fill="#d84a30" opacity={0.8} />
      <circle cx={20} cy={-3} r={3.6} fill="#f0f0e0" />
      <circle cx={21} cy={-3} r={2} fill="#101010" />
    </g>
  );
};

/** Posiciones de un cardumen (determinista) con reacción de huida desde `threat`. */
export function school(n: number, t: number, c: V, r: number, seed: number, scare = 0, threat: V = c) {
  return Array.from({length: n}, (_, i) => {
    const ph = hash1(seed * 31 + i) * Math.PI * 2;
    const rr = r * (0.3 + hash1(seed * 17 + i) * 0.7);
    const b = {x: c.x + Math.cos(ph + t * 0.35) * rr, y: c.y + Math.sin(ph * 1.3 + t * 0.3) * rr * 0.45};
    const dx = b.x - threat.x;
    const dy = b.y - threat.y;
    const d = Math.hypot(dx, dy) || 1;
    const push = clamp(scare) * 320 * (1 - clamp(d / (r * 3)));
    const vx = -Math.sin(ph + t * 0.35);
    return {x: b.x + (dx / d) * push, y: b.y + (dy / d) * push * 0.6, dir: (scare > 0.2 ? (dx > 0 ? 1 : -1) : vx > 0 ? 1 : -1) as 1 | -1};
  });
}
export const lerpV = (a: V, b: V, u: number): V => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u)});
