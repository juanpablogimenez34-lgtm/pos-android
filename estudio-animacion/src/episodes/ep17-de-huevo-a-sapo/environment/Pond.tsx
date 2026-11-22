// AMBIENTE A — ESTANQUE SUBACUÁTICO (vista lateral, coordenadas de mundo: fondo en y = 300,
// superficie en y = −900). Paleta esmeralda, turquesa, azul profundo, oliva y dorado suave.
// Capas con parallax: agua con luz cenital → rayos desenfocados → plantas lejanas (bruma) →
// plantas y piedras medias → fondo de arena con sedimento, piedras con musgo, raíces y plantas
// cercanas (elodea, algas filamentosas) → burbujas y partículas → primer plano desenfocado.
// Todo se mueve: las plantas oscilan, las partículas derivan, las burbujas suben, la luz respira.
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';
import {SoftFilter} from '../../oarfish-cinematic-v2/character/filters';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const POND = {floor: 300, surface: -900};

/** Tallo de elodea con verticilos de hojas que se mecen. */
export const Elodea: React.FC<{x: number; base: number; h: number; t: number; seed: number; c: string; leaf?: number}> = ({x, base, h, t, seed, c, leaf = 1}) => {
  const n = Math.max(6, Math.round(h / 28));
  const pts = Array.from({length: n + 1}, (_, i) => {
    const u = i / n;
    return {x: x + Math.sin(t * 0.7 + seed + u * 2.2) * 26 * u * u + Math.sin(seed) * 30 * u, y: base - u * h};
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  let leaves = '';
  for (let i = 1; i <= n; i++) {
    const p = pts[i];
    const u = i / n;
    const L = (16 + 8 * hash1(seed * 7 + i)) * leaf * (1 - u * 0.35);
    for (let j = 0; j < 3; j++) {
      const a = -Math.PI / 2 + (j - 1) * 1.1 + Math.sin(t * 1.1 + i + seed) * 0.15 + (i % 2) * 0.5;
      const tip = {x: p.x + Math.cos(a) * L, y: p.y + Math.sin(a) * L * 0.8};
      const nx = -Math.sin(a) * L * 0.18;
      const ny = Math.cos(a) * L * 0.18;
      leaves += `M${f1(p.x)},${f1(p.y)} Q${f1((p.x + tip.x) / 2 + nx)},${f1((p.y + tip.y) / 2 + ny)} ${f1(tip.x)},${f1(tip.y)} Q${f1((p.x + tip.x) / 2 - nx)},${f1((p.y + tip.y) / 2 - ny)} ${f1(p.x)},${f1(p.y)}Z `;
    }
  }
  return (
    <g>
      <path d={d} stroke={mixColor(c, '#000', 0.25)} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={leaves} fill={c} />
      <path d={leaves} fill="none" stroke={mixColor(c, '#e8ffb0', 0.35)} strokeWidth={0.8} opacity={0.5} />
    </g>
  );
};

/** Algas filamentosas (cintas largas y finas). */
const Ribbon: React.FC<{x: number; base: number; h: number; t: number; seed: number; c: string}> = ({x, base, h, t, seed, c}) => (
  <g>
    {[0, 1, 2, 3].map((k) => {
      const pts = Array.from({length: 12}, (_, i) => {
        const u = i / 11;
        return {x: x + k * 7 + Math.sin(t * 0.9 + seed + u * 3 + k) * 22 * u, y: base - u * h * (0.75 + 0.25 * hash1(seed + k))};
      });
      return <path key={k} d={pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ')} stroke={mixColor(c, '#000', k * 0.08)} strokeWidth={7 - k} fill="none" strokeLinecap="round" opacity={0.9} />;
    })}
  </g>
);

/** Piedra irregular con volumen y musgo. */
export const Stone: React.FC<{x: number; y: number; w: number; h: number; seed: number; c?: string; moss?: number}> = ({x, y, w, h, seed, c = '#5a6a5a', moss = 0.6}) => {
  const pts = Array.from({length: 12}, (_, i) => {
    const a = Math.PI + (i / 11) * Math.PI;
    const r = 0.82 + 0.3 * hash1(seed * 13 + i);
    return {x: x + Math.cos(a) * w * 0.5 * r, y: y + Math.sin(a) * h * r};
  });
  const d = `M${pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
  return (
    <g>
      <path d={d} fill={c} />
      <path d={d} fill="url(#pondStoneShade)" />
      {moss > 0 &&
        Array.from({length: 14}, (_, i) => {
          const k = hash1(seed * 3 + i);
          const px = x - w * 0.42 + k * w * 0.84;
          const py = y - h * (0.75 + 0.2 * Math.sin(k * 3)) * (1 - Math.abs(k - 0.5) * 1.2);
          return <ellipse key={i} cx={px} cy={py} rx={8 + hash1(i + seed) * 12} ry={4 + hash1(i * 2 + seed) * 4} fill="#5a8a3a" opacity={0.75 * moss} />;
        })}
    </g>
  );
};

export const PondBack: React.FC<{cam: Cam; t: number; children?: React.ReactNode; light?: number}> = ({cam, t, children, light = 1}) => (
  <g>
    <defs>
      <linearGradient id="pondWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4fb8a0" />
        <stop offset="0.35" stopColor="#1f7a6e" />
        <stop offset="0.75" stopColor="#0d4a4e" />
        <stop offset="1" stopColor="#06282e" />
      </linearGradient>
      <radialGradient id="pondSun" cx="0.72" cy="-0.05" r="0.9">
        <stop offset="0" stopColor="#f4f0b0" stopOpacity={0.55} />
        <stop offset="0.5" stopColor="#c8e8a0" stopOpacity={0.12} />
        <stop offset="1" stopColor="#c8e8a0" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="pondRay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f8f4c0" stopOpacity={0.55} />
        <stop offset="1" stopColor="#f8f4c0" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="pondSand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8a7a50" />
        <stop offset="1" stopColor="#3a3420" />
      </linearGradient>
      <linearGradient id="pondStoneShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e8f0c0" stopOpacity={0.18} />
        <stop offset="1" stopColor="#000" stopOpacity={0.45} />
      </linearGradient>
      <SoftFilter id="pondSoft" radius={22} />
      <SoftFilter id="pondFar" radius={6} />
    </defs>
    <rect width={1080} height={1920} fill="url(#pondWater)" />
    <rect width={1080} height={1920} fill="url(#pondSun)" opacity={light} />
    {/* rayos de luz atravesando el agua */}
    <g transform={layerT(cam, 0.15)} filter="url(#pondSoft)" opacity={0.8 * light}>
      {Array.from({length: 8}, (_, i) => {
        const x = cam.x * 0.15 - 700 + i * 220 + Math.sin(t * 0.3 + i * 1.3) * 30;
        const w = 50 + hash1(i * 5) * 80;
        return <path key={i} d={`M${f1(x + 260)},-1400 L${f1(x + 260 + w)},-1400 L${f1(x - 200 + w * 1.8)},900 L${f1(x - 340)},900Z`} fill="url(#pondRay)" opacity={0.3 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.6 + i * 2))} />;
      })}
    </g>
    {/* plantas lejanas en bruma */}
    <g transform={layerT(cam, 0.4)} filter="url(#pondFar)" opacity={0.5}>
      {Array.from({length: 14}, (_, i) => (
        <Elodea key={i} x={cam.x * 0.4 - 1400 + i * 210 + hash1(i) * 60} base={POND.floor * 0.4 + 260} h={380 + hash1(i * 3) * 300} t={t} seed={i * 1.7} c="#1e5a4a" leaf={1.2} />
      ))}
    </g>
    {/* capa media: plantas, piedras y fondo */}
    <g transform={layerT(cam, 0.7)} opacity={0.85}>
      <rect x={cam.x * 0.7 - 2400} y={POND.floor * 0.7 + 120} width={4800} height={1400} fill="#24402e" />
      {Array.from({length: 10}, (_, i) => (
        <Stone key={`s${i}`} x={cam.x * 0.7 - 1200 + i * 290 + hash1(i * 9) * 80} y={POND.floor * 0.7 + 130} w={120 + hash1(i) * 120} h={50 + hash1(i * 2) * 50} seed={i + 30} c="#3a5244" moss={0.4} />
      ))}
      {Array.from({length: 12}, (_, i) =>
        i % 3 === 0 ? (
          <Ribbon key={`r${i}`} x={cam.x * 0.7 - 1300 + i * 240} base={POND.floor * 0.7 + 130} h={260 + hash1(i * 4) * 160} t={t} seed={i} c="#3a7a3a" />
        ) : (
          <Elodea key={`e${i}`} x={cam.x * 0.7 - 1300 + i * 240 + 60} base={POND.floor * 0.7 + 130} h={300 + hash1(i * 5) * 260} t={t} seed={i * 2.3} c="#2e6e44" />
        ),
      )}
    </g>
    {/* partículas lejanas */}
    <g transform={layerT(cam, 0.6)} opacity={0.6}>
      {Array.from({length: 60}, (_, i) => (
        <circle key={i} cx={cam.x * 0.6 + ((hash1(i * 3) * 2400 + t * 8) % 2400) - 1200} cy={cam.y * 0.6 + ((hash1(i * 7) * 2800 + Math.sin(t + i) * 20) % 2800) - 1400} r={0.8 + hash1(i) * 1.5} fill="#e8f4c8" opacity={0.4} />
      ))}
    </g>
    {/* plano del personaje */}
    <g transform={layerT(cam, 1)}>
      <path d={`M-3000,${POND.floor} ${Array.from({length: 30}, (_, i) => `Q${-2900 + i * 200},${POND.floor - 14 + Math.sin(i * 1.7) * 10} ${-2800 + i * 200},${POND.floor}`).join(' ')} L3000,2200 L-3000,2200Z`} fill="url(#pondSand)" />
      {Array.from({length: 70}, (_, i) => (
        <ellipse key={`g${i}`} cx={-1500 + hash1(i * 3) * 3000} cy={POND.floor + 10 + hash1(i * 5) * 120} rx={2 + hash1(i) * 5} ry={1.5 + hash1(i * 2) * 2} fill={i % 3 ? '#a89868' : '#4a4028'} opacity={0.7} />
      ))}
      {/* raíces que bajan desde la orilla */}
      {[0, 1, 2].map((i) => (
        <path key={`root${i}`} d={`M${-900 + i * 70},-900 C${-880 + i * 60},${-500 + i * 40} ${-760 + i * 50 + Math.sin(t * 0.4 + i) * 8},${-300 + i * 60} ${-700 + i * 80},${POND.floor - 20}`} stroke="#3a2a1a" strokeWidth={14 - i * 3} fill="none" strokeLinecap="round" opacity={0.85} />
      ))}
      <Stone x={-420} y={POND.floor + 6} w={260} h={110} seed={3} />
      <Stone x={520} y={POND.floor + 6} w={200} h={90} seed={7} c="#566656" />
      <Stone x={1250} y={POND.floor + 6} w={300} h={120} seed={11} c="#4e5e4e" />
      {children}
    </g>
  </g>
);

/** Capas delanteras del estanque: burbujas, partículas cercanas y vegetación desenfocada. */
export const PondFront: React.FC<{cam: Cam; t: number}> = ({cam, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <SoftFilter id="pondFg" radius={10} />
    </defs>
    <g transform={layerT(cam, 1.05)}>
      {Array.from({length: 14}, (_, i) => {
        const per = 4 + hash1(i) * 3;
        const ph = ((t / per + hash1(i * 3)) % 1 + 1) % 1;
        const x = cam.x * 1.05 - 500 + hash1(i * 7) * 1000 + Math.sin(t * 2 + i) * 8;
        const y = POND.floor - ph * 1300;
        const r = 2 + hash1(i * 5) * 5;
        return (
          <g key={i} opacity={1 - ph * 0.7}>
            <circle cx={x} cy={y} r={r} fill="none" stroke="#e8fff0" strokeWidth={1.2} />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.3} fill="#ffffff" opacity={0.7} />
          </g>
        );
      })}
    </g>
    <g transform={layerT(cam, 1.5)} filter="url(#pondFg)" opacity={0.8 * Math.max(0, Math.min(1, (2.6 - cam.zoom) / 0.8))}>
      <Elodea x={cam.x * 1.5 - 620} base={POND.floor * 1.5 + 520} h={900} t={t} seed={41} c="#0e3424" leaf={1.6} />
      <Elodea x={cam.x * 1.5 + 640} base={POND.floor * 1.5 + 520} h={760} t={t} seed={43} c="#0c2e20" leaf={1.5} />
      {Array.from({length: 10}, (_, i) => (
        <circle key={i} cx={cam.x * 1.5 + ((hash1(i * 13) * 1800 + t * 20) % 1800) - 900} cy={cam.y * 1.5 + ((hash1(i * 17) * 2200 - t * 12) % 2200 + 2200) % 2200 - 1100} r={6 + hash1(i) * 9} fill="#e8f8d8" opacity={0.15} />
      ))}
    </g>
  </svg>
);
