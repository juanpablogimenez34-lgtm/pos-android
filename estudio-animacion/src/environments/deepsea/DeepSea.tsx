// Escenario de océano profundo (pelágico: sin fondo ni rocas, porque Linophryne vive
// en mitad de la columna de agua). Luz con función narrativa: el sol se apaga en el
// descenso y después solo existe la luz biológica.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {useCamera, worldToScreen} from '../../engine/camera';
import {clamp, hash1, mixColor, rng, smoothstep} from '../../engine/math';
import {useQuality} from '../../engine/quality';
import {useTime} from '../../engine/useTime';

export const DEEP = {
  surfaceTop: '#2a8fbf',
  surfaceBot: '#0d4f7a',
  twilightTop: '#08304f',
  twilightBot: '#041a30',
  abyssTop: '#020a16',
  abyssBot: '#01040a',
  glow: '#7ff0ff',
};

/** Colores del agua según la profundidad normalizada (0 superficie … 1 medianoche). */
export function waterColors(d: number) {
  const k1 = smoothstep(0, 0.45, d);
  const k2 = smoothstep(0.35, 1, d);
  const top = mixColor(mixColor(DEEP.surfaceTop, DEEP.twilightTop, k1), DEEP.abyssTop, k2);
  const bot = mixColor(mixColor(DEEP.surfaceBot, DEEP.twilightBot, k1), DEEP.abyssBot, k2);
  return {top, bot};
}

export const DeepBackground: React.FC<{depth: number}> = ({depth}) => {
  const {top, bot} = waterColors(depth);
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${top} 0%, ${bot} 100%)`}} />;
};

/**
 * Capa del descenso (0–20 s), en coordenadas de pantalla: rayos de sol, siluetas que
 * suben al bajar la cámara (ballena, banco de peces, medusas, sifonóforo).
 */
export const DescentLayers: React.FC<{start: number}> = ({start}) => {
  const t = useTime() - start;
  const {width, height} = useVideoConfig();
  const descent = t * 160; // px de "descenso"
  const sun = 1 - smoothstep(3, 10, t);
  const rays = useMemo(() => {
    const r = rng(5);
    return Array.from({length: 7}, (_, i) => ({x: 80 + i * 150 + r() * 60, w: 40 + r() * 70, o: 0.08 + r() * 0.1, ph: r() * 6}));
  }, []);
  const yAt = (y0: number, speed: number) => y0 - descent * speed;
  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="d-ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9fbff" stopOpacity={1} />
            <stop offset="1" stopColor="#e9fbff" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="d-jelly" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#bdf3ff" stopOpacity={0.5} />
            <stop offset="1" stopColor="#bdf3ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {sun > 0.01 &&
          rays.map((r, i) => (
            <path
              key={i}
              d={`M${r.x},-40 l${r.w * 0.4},0 l${r.w * 1.8 + 120},${height * 0.9} l${-r.w * 1.8},0Z`}
              fill="url(#d-ray)"
              opacity={r.o * sun * (0.7 + 0.3 * Math.sin(t * 0.8 + r.ph))}
            />
          ))}
        {/* ballena lejana cerca de la superficie (silueta) */}
        <g transform={`translate(${200 + t * 25} ${yAt(500, 0.55)}) scale(1.4)`} opacity={0.35 * sun}>
          <path d="M0,0 C60,-30 200,-34 300,-8 C330,0 360,-10 380,-26 L392,-6 L380,10 C360,0 330,8 300,10 C200,30 60,28 0,0Z" fill="#06263d" />
          <path d="M120,14 L150,44 L160,16Z" fill="#06263d" />
        </g>
        {/* banco de peces (siluetas) */}
        {Array.from({length: 22}, (_, i) => {
          const fx = 520 + hash1(i) * 420 - t * 30 + Math.sin(t + i) * 8;
          const fy = yAt(1250 + hash1(i + 7) * 260, 0.8);
          return <path key={i} d={`M${fx},${fy} c8,-5 22,-5 28,0 c-6,5 -20,5 -28,0Z M${fx + 27},${fy} l9,-5 l0,10Z`} fill="#062033" opacity={0.6 * (1 - smoothstep(6, 11, t))} />;
        })}
        {/* medusas de la zona de penumbra (contornos tenues) */}
        {[0, 1, 2].map((i) => {
          const jx = 200 + i * 330 + Math.sin(t * 0.5 + i) * 20;
          const jy = yAt(2100 + i * 380, 0.9);
          const pulse = 1 + 0.08 * Math.sin(t * 2 + i);
          return (
            <g key={i} transform={`translate(${jx} ${jy}) scale(${pulse} ${2 - pulse})`} opacity={0.7 * smoothstep(6, 9, t) * (1 - smoothstep(14, 17, t))}>
              <ellipse cx={0} cy={0} rx={46} ry={32} fill="url(#d-jelly)" />
              <path d="M-40,0 Q0,-44 40,0" stroke="#bdf3ff" strokeOpacity={0.45} strokeWidth={2} fill="none" />
              {[-28, -12, 4, 20, 34].map((tx, k) => (
                <path key={k} d={`M${tx},4 q${Math.sin(t * 2 + k) * 10},40 ${Math.sin(t + k) * 6},90`} stroke="#bdf3ff" strokeOpacity={0.25} strokeWidth={1.4} fill="none" />
              ))}
            </g>
          );
        })}
        {/* sifonóforo: cadena tenue con pequeños destellos */}
        <g opacity={smoothstep(10, 13, t) * (1 - smoothstep(17, 19.5, t))}>
          {Array.from({length: 16}, (_, k) => {
            const sx = 760 - k * 34 + Math.sin(t * 0.7 + k * 0.4) * 14;
            const sy = yAt(3200 + k * 20, 0.95);
            return <circle key={k} cx={sx} cy={sy} r={5 - k * 0.15} fill="#8fe6ff" opacity={0.25 + 0.25 * Math.sin(t * 3 + k)} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export type Light = {x: number; y: number; r: number; k: number};

/**
 * Nieve marina en canvas: copos que caen lentamente, con parallax por profundidad.
 * Los copos cercanos a la luz biológica se iluminan (la luz tiene función narrativa).
 */
/** `climb`: desplazamiento vertical acumulado de la cámara (px), para que el descenso sea continuo. */
export const MarineSnow: React.FC<{density: number; climb?: number; light?: Light; ambient?: number; seed?: number}> = ({density, climb = 0, light, ambient = 0.25, seed = 4}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const t = useTime();
  const cam = useCamera();
  const q = useQuality();
  const {width, height} = useVideoConfig();
  const flakes = useMemo(() => {
    const r = rng(seed);
    const n = Math.round(q.particles * 1.4);
    return Array.from({length: n}, () => ({x: r() * 2000 - 400, y: r() * 3000, d: 0.4 + r() * 0.9, s: 0.7 + r() * 2.2, vy: 6 + r() * 12, ph: r() * 10, shape: r()}));
  }, [seed, q.particles]);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, width, height);
    const visible = Math.floor(flakes.length * clamp(density));
    const span = height + 120;
    for (let i = 0; i < visible; i++) {
      const f = flakes[i];
      const wy = f.y + f.vy * t + Math.sin(t * 0.3 + f.ph) * 6 - climb * f.d;
      const wx = f.x + Math.sin(t * 0.2 + f.ph) * 20;
      const s = worldToScreen(cam, f.d, {x: wx, y: wy});
      const sx = ((((s.x + 60) % (width + 120)) + width + 120) % (width + 120)) - 60;
      const sy = ((((s.y + 60) % span) + span) % span) - 60;
      let lit = ambient;
      if (light && light.k > 0) {
        const d = Math.hypot(sx - light.x, sy - light.y);
        lit += light.k * clamp(1 - d / light.r) ** 1.5 * 1.6;
      }
      const a = clamp(lit) * (0.35 + 0.4 * f.d);
      g.fillStyle = `rgba(200,240,255,${a.toFixed(3)})`;
      const r = f.s * s.scale;
      if (f.shape < 0.7) {
        g.beginPath();
        g.arc(sx, sy, r, 0, Math.PI * 2);
        g.fill();
      } else {
        g.fillRect(sx - r, sy - r * 0.4, r * 2.2, r * 0.9);
      }
    }
  }, [t, cam, flakes, density, climb, light, ambient, width, height]);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

/**
 * Oscuridad: velo casi negro con un "agujero" de luz alrededor de la esca.
 * Un único gradiente CSS (coste prácticamente nulo).
 */
export const Darkness: React.FC<{light?: Light; amount: number}> = ({light, amount}) => {
  if (amount <= 0.001) return null;
  const a = clamp(amount);
  if (!light || light.k <= 0.001) return <AbsoluteFill style={{background: `rgba(1,2,6,${a})`}} />;
  const r = Math.max(10, light.r);
  const inner = a * (1 - clamp(light.k));
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${light.x.toFixed(1)}px ${light.y.toFixed(1)}px, rgba(1,2,6,${inner.toFixed(3)}) 0px, rgba(1,2,6,${(a * 0.55 + inner * 0.45).toFixed(3)}) ${(r * 0.55).toFixed(0)}px, rgba(1,2,6,${a.toFixed(3)}) ${r.toFixed(0)}px)`,
      }}
    />
  );
};

/**
 * Máscara de visibilidad (inversa de Darkness): lo que está fuera del alcance de la luz
 * desaparece en la negrura. Se aplica a la capa de los animales, de modo que la vida
 * luminosa lejana queda DETRÁS y los cuerpos la tapan donde son visibles.
 */
export function lightMask(light: Light | undefined, amount: number): React.CSSProperties {
  const a = clamp(amount);
  if (!light || light.k <= 0.001) return {opacity: 1 - a};
  const r = Math.max(10, light.r);
  const inner = a * (1 - clamp(light.k));
  const g = `radial-gradient(circle at ${light.x.toFixed(1)}px ${light.y.toFixed(1)}px, rgba(0,0,0,${(1 - inner).toFixed(3)}) 0px, rgba(0,0,0,${(1 - (a * 0.55 + inner * 0.45)).toFixed(3)}) ${(r * 0.55).toFixed(0)}px, rgba(0,0,0,${(1 - a).toFixed(3)}) ${r.toFixed(0)}px)`;
  return {WebkitMaskImage: g, maskImage: g};
}

/** Vida bioluminiscente lejana (coordenadas de mundo; se dibuja en la capa de luz). */
export const DeepLife: React.FC<{intensity: number}> = ({intensity}) => {
  const t = useTime();
  const jellies = useMemo(() => {
    const r = rng(17);
    return Array.from({length: 6}, () => ({x: -1400 + r() * 2800, y: -1200 + r() * 2400, s: 0.5 + r() * 0.8, ph: r() * 10}));
  }, []);
  const sparks = useMemo(() => {
    const r = rng(19);
    return Array.from({length: 40}, () => ({x: -1500 + r() * 3000, y: -1500 + r() * 3000, ph: r() * 40, per: 5 + r() * 9}));
  }, []);
  if (intensity <= 0.01) return null;
  return (
    <g opacity={intensity}>
      <defs>
        <radialGradient id="dl-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9ff3ff" stopOpacity={0.8} />
          <stop offset="1" stopColor="#3aa8ff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {jellies.map((j, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.3 + j.ph);
        const x = j.x + Math.sin(t * 0.1 + j.ph) * 40;
        const y = j.y - t * 4 + Math.cos(t * 0.13 + j.ph) * 30;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${j.s})`} opacity={0.35 + 0.45 * pulse}>
            <circle r={60} fill="url(#dl-glow)" opacity={0.35} />
            <path d="M-26,0 Q0,-30 26,0" stroke="#aaf5ff" strokeOpacity={0.6} strokeWidth={2} fill="none" />
            {[-16, -5, 6, 17].map((tx, k) => (
              <path key={k} d={`M${tx},2 q${Math.sin(t * 1.5 + k) * 6},26 ${Math.sin(t + k) * 4},54`} stroke="#aaf5ff" strokeOpacity={0.3} strokeWidth={1} fill="none" />
            ))}
          </g>
        );
      })}
      {sparks.map((s, i) => {
        const ph = ((t + s.ph) % s.per) / s.per;
        const k = ph < 0.08 ? Math.sin((ph / 0.08) * Math.PI) : 0;
        return k > 0.01 ? <circle key={i} cx={s.x} cy={s.y} r={6 + 10 * k} fill="url(#dl-glow)" opacity={k} /> : null;
      })}
    </g>
  );
};

/** Banco lejano de peces con fotóforos (solo se ven sus puntos de luz). */
export const PhotophoreSchool: React.FC<{x: number; y: number; t: number; opacity: number; speed?: number}> = ({x, y, t, opacity, speed = 30}) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      {Array.from({length: 14}, (_, i) => {
        const fx = x + t * speed + hash1(i) * 360 + Math.sin(t + i) * 10;
        const fy = y + hash1(i + 3) * 180 + Math.sin(t * 0.8 + i * 2) * 8;
        return (
          <g key={i}>
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={fx - k * 6} cy={fy + 3} r={1.6} fill="#9ff0ff" opacity={0.7} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** Indicador de profundidad del descenso. */
export const DepthGauge: React.FC<{meters: number; opacity: number}> = ({meters, opacity}) => {
  const {height} = useVideoConfig();
  if (opacity <= 0.01) return null;
  const zone = meters < 200 ? 'ZONA FÓTICA' : meters < 1000 ? 'ZONA DE PENUMBRA' : 'ZONA DE MEDIANOCHE';
  const marks = [0, 200, 400, 600, 800, 1000];
  const top = height * 0.22;
  const h = height * 0.42;
  const y = top + (clamp(meters / 1000) * h);
  return (
    <div style={{position: 'absolute', right: 60, top, height: h, width: 230, opacity, fontFamily: 'Montserrat'}}>
      <svg width={230} height={h + 40} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <line x1={200} y1={0} x2={200} y2={h} stroke="#bff6ff" strokeOpacity={0.4} strokeWidth={2} />
        {marks.map((m) => (
          <g key={m}>
            <line x1={188} y1={(m / 1000) * h} x2={212} y2={(m / 1000) * h} stroke="#bff6ff" strokeOpacity={0.5} strokeWidth={2} />
            <text x={180} y={(m / 1000) * h + 8} textAnchor="end" fill="#bff6ff" opacity={0.55} fontSize={22} fontWeight={600}>
              {m} m
            </text>
          </g>
        ))}
        <path d={`M214,${y} l18,-10 l0,20Z`} fill="#7ff0ff" />
      </svg>
      <div style={{position: 'absolute', right: 250, top: y - 34, textAlign: 'right', color: '#eafffb', fontWeight: 900, fontSize: 40, textShadow: '0 2px 10px rgba(0,0,0,0.7)', whiteSpace: 'nowrap'}}>
        −{Math.round(meters).toLocaleString('es')} m
      </div>
      <div style={{position: 'absolute', right: 250, top: y + 14, textAlign: 'right', color: '#7ff0ff', fontWeight: 800, fontSize: 20, letterSpacing: 2, whiteSpace: 'nowrap'}}>{zone}</div>
    </div>
  );
};

