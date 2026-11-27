// ESCENARIOS (coordenadas de mundo; parallax con layerT).
//  · ForestScene: bosque australiano: eucaliptos de corteza clara, helechos, troncos caídos, rocas, hojarasca,
//    rayos de luz cálidos, niebla suave y partículas; capas lejana/media/suelo/primer plano.
//  · RiverWorld: SISTEMA DE AGUA. Línea del agua en y = 0 con ondulaciones; cielo y bosque arriba con su
//    reflejo verdoso; bajo el agua, degradado turquesa→azul petróleo, rayos filtrados, partículas, fondo de
//    piedras redondeadas, plantas acuáticas, larvas y pequeños crustáceos. Anillos de ondas (eventos), estela del
//    personaje, burbujas y nubes de sedimento. Modo atardecer (`sunset`).
//  · BurrowCutaway: corte ilustrativo del terreno con el túnel, raíces y la cámara de nidificación (luz cálida).
//  · SciPanel: fondo de visualización científica (azul petróleo con retícula suave).
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {Cam, layerT, toScreen} from '../../../studio2';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

const Eucalypt: React.FC<{x: number; h: number; c: string; bark: string; t: number; i: number}> = ({x, h, c, bark, t, i}) => (
  <g>
    <path d={`M${x - h * 0.03},0 L${x - h * 0.015},${-h} L${x + h * 0.015},${-h} L${x + h * 0.035},0Z`} fill={bark} />
    {Array.from({length: 4}, (_, k) => <path key={k} d={`M${x - h * 0.02 + k * h * 0.012},${-h * 0.1 - k * h * 0.2} l${h * 0.004},${-h * 0.15}`} stroke={c} strokeWidth={h * 0.006} opacity={0.4} />)}
    <path d={`M${x},${-h * 0.75} l${-h * 0.18},${-h * 0.12} M${x},${-h * 0.62} l${h * 0.16},${-h * 0.1}`} stroke={bark} strokeWidth={h * 0.012} />
    {Array.from({length: 6}, (_, k) => {
      const cx = x + (hash1(i * 7 + k) - 0.5) * h * 0.5;
      const cy = -h * (0.8 + hash1(i * 3 + k) * 0.25);
      return <ellipse key={`f${k}`} cx={cx + Math.sin(t * 0.4 + k + i) * 4} cy={cy} rx={h * 0.13} ry={h * 0.07} fill={c} opacity={0.92} />;
    })}
  </g>
);
const Fern: React.FC<{x: number; y: number; s: number; c: string; t: number; i: number}> = ({x, y, s, c, t, i}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
    {Array.from({length: 7}, (_, k) => {
      const a = -Math.PI / 2 + (k - 3) * 0.38 + Math.sin(t * 0.7 + i + k) * 0.04;
      const L = 120 - Math.abs(k - 3) * 12;
      const ex = Math.cos(a) * L;
      const ey = Math.sin(a) * L;
      return (
        <g key={k}>
          <path d={`M0,0 Q${f1(ex * 0.5)},${f1(ey * 0.6 - 10)} ${f1(ex)},${f1(ey)}`} stroke={c} strokeWidth={3} fill="none" />
          {Array.from({length: 8}, (_, j) => {
            const u = (j + 1) / 9;
            const px = ex * u;
            const py = ey * u - Math.sin(u * Math.PI) * 10;
            return <path key={j} d={`M${f1(px)},${f1(py)} l${f1(-ey * 0.12 * (1 - u))},${f1(ex * 0.12 * (1 - u))} M${f1(px)},${f1(py)} l${f1(ey * 0.12 * (1 - u))},${f1(-ex * 0.12 * (1 - u))}`} stroke={c} strokeWidth={3} />;
          })}
        </g>
      );
    })}
  </g>
);

export const ForestScene: React.FC<{cam: Cam; t: number; children?: React.ReactNode; warm?: number}> = ({cam, t, children, warm = 0.6}) => {
  const gy = toScreen(cam, cam.x, 0).y;
  return (
    <g>
      <defs>
        <linearGradient id="fsSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e3a2c" />
          <stop offset="0.6" stopColor={mixColor('#6a8a5a', '#e8c890', warm * 0.35)} />
          <stop offset="1" stopColor="#3a4a2a" />
        </linearGradient>
        <linearGradient id="fsRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe8b0" stopOpacity={0.4} />
          <stop offset="1" stopColor="#ffe8b0" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="fsGround" gradientUnits="userSpaceOnUse" x1="0" y1={gy - 20} x2="0" y2={gy + 900}>
          <stop offset="0" stopColor="#5a4a2e" />
          <stop offset="1" stopColor="#2a2214" />
        </linearGradient>
      </defs>
      <rect x={-40} y={-40} width={1160} height={2000} fill="url(#fsSky)" />
      <g transform={layerT(cam, 0.3)} opacity={0.55}>
        {Array.from({length: 16}, (_, i) => <Eucalypt key={i} x={cam.x * 0.3 + (i - 8) * 260 + hash1(i) * 80} h={1300 + hash1(i * 3) * 500} c="#4a6a4a" bark="#a8a898" t={t} i={i} />)}
      </g>
      <rect x={-40} y={gy - 600} width={1160} height={500} fill="#cfe0d0" opacity={0.12} />
      <g transform={layerT(cam, 0.6)} opacity={0.85}>
        {Array.from({length: 12}, (_, i) => <Eucalypt key={i} x={cam.x * 0.6 + (i - 6) * 380 + hash1(i * 5) * 120} h={1700 + hash1(i * 7) * 500} c="#3a5a36" bark="#c8c4b0" t={t} i={i + 20} />)}
        {Array.from({length: 14}, (_, i) => <Fern key={`f${i}`} x={cam.x * 0.6 + (i - 7) * 300 + hash1(i * 9) * 100} y={0} s={1.2} c="#3a6a32" t={t} i={i} />)}
      </g>
      {Array.from({length: 5}, (_, i) => {
        const x0 = 160 + i * 210 + Math.sin(t * 0.25 + i) * 30;
        return <path key={`r${i}`} d={`M${f1(x0)},-40 l${f1(-220)},${f1(gy + 300)} l140,0Z`} fill="url(#fsRay)" opacity={(0.5 + 0.3 * Math.sin(t * 0.5 + i)) * warm} />;
      })}
      <g transform={layerT(cam, 1)}>
        <rect x={cam.x - 4000} y={-6} width={8000} height={3000} fill="url(#fsGround)" />
        <path d={`M${cam.x - 700},-10 L${cam.x - 120},-60 L${cam.x - 100},-10Z`} fill="none" />
        <rect x={cam.x - 900} y={-60} width={700} height={70} rx={35} fill="#5a4a34" stroke="#3a2e1e" strokeWidth={4} transform={`rotate(-4 ${cam.x - 550} -25)`} />
        {Array.from({length: 50}, (_, i) => <ellipse key={i} cx={Math.floor(cam.x / 2000) * 2000 + (hash1(i * 11) - 0.5) * 4000} cy={10 + hash1(i * 13) * 600} rx={10 + hash1(i) * 10} ry={4} fill={i % 3 ? '#8a6a3a' : '#a88a4a'} opacity={0.6} transform={`rotate(${hash1(i * 3) * 180})`} />)}
        {children}
      </g>
      <g transform={layerT(cam, 1.3)} opacity={0.9}>
        {Array.from({length: 5}, (_, i) => <Fern key={i} x={cam.x * 1.3 + (i - 2) * 520 + hash1(i * 17) * 160} y={360} s={2.4} c="#2a4a24" t={t} i={i + 40} />)}
      </g>
      {Array.from({length: 24}, (_, i) => <circle key={`p${i}`} cx={(hash1(i * 19) * 1200 + t * 10) % 1160 - 40} cy={(hash1(i * 23) * 1920 - t * 14 + 1920 * 4) % 1920} r={1.6 + hash1(i) * 2} fill="#fff4d0" opacity={0.4} />)}
    </g>
  );
};

export type Ripple = {x: number; t0: number; s?: number};
export const RiverWorld: React.FC<{cam: Cam; t: number; children?: React.ReactNode; floorY?: number; ripples?: Ripple[]; sunset?: number; bank?: {x0: number; x1: number} | null; sediment?: {x: number; t0: number}[]; bubbles?: V[]; tint?: number}> = ({cam, t, children, floorY = 900, ripples = [], sunset = 0, bank = null, sediment = [], bubbles = [], tint = 0.36}) => {
  const sy = toScreen(cam, cam.x, 0).y;
  const pts: V[] = [];
  for (let i = 0; i <= 30; i++) {
    const sx = -40 + (i / 30) * 1160;
    const wx = cam.x + (sx - 540) / cam.zoom;
    pts.push({x: sx, y: toScreen(cam, wx, Math.sin(wx * 0.008 + t * 1.6) * 4 + Math.sin(wx * 0.021 - t * 2.3) * 2).y});
  }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
  const below = `${line} L1120,2100 L-40,2100Z`;
  const sk0 = mixColor('#5a8ab0', '#e8945a', sunset);
  const sk1 = mixColor('#cfe4e0', '#f8d090', sunset);
  const wTop = mixColor('#3a8a7a', '#8a7a4a', sunset * 0.5);
  const wBot = mixColor('#0e3a3a', '#1a2a2a', sunset * 0.4);
  return (
    <g>
      <defs>
        <linearGradient id="rwSky" gradientUnits="userSpaceOnUse" x1="0" y1={sy - 1500} x2="0" y2={sy}>
          <stop offset="0" stopColor={sk0} />
          <stop offset="1" stopColor={sk1} />
        </linearGradient>
        <linearGradient id="rwWater" gradientUnits="userSpaceOnUse" x1="0" y1={sy} x2="0" y2={sy + 1400 * cam.zoom}>
          <stop offset="0" stopColor={wTop} />
          <stop offset="0.5" stopColor="#1a5a56" />
          <stop offset="1" stopColor={wBot} />
        </linearGradient>
        <linearGradient id="rwRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8fff0" stopOpacity={0.3} />
          <stop offset="1" stopColor="#e8fff0" stopOpacity={0} />
        </linearGradient>
        <clipPath id="rwBelow">
          <path d={below} />
        </clipPath>
      </defs>
      <rect x={-40} y={-40} width={1160} height={Math.max(0, sy + 60)} fill="url(#rwSky)" />
      {sunset > 0.01 && <circle cx={760} cy={Math.min(sy - 160, 700)} r={170} fill="#ffd890" opacity={0.5 * sunset} />}
      {/* bosque de ribera lejano y su reflejo */}
      <g transform={layerT(cam, 0.35)}>
        {Array.from({length: 18}, (_, i) => <Eucalypt key={i} x={cam.x * 0.35 + (i - 9) * 240 + hash1(i * 2) * 90} h={700 + hash1(i * 4) * 400} c={mixColor('#3a5a3a', '#4a3a2a', sunset * 0.6)} bark={mixColor('#a8a898', '#c89060', sunset * 0.5)} t={t} i={i} />)}
      </g>
      <rect x={-40} y={sy - 4} width={1160} height={2200} fill="url(#rwWater)" />
      <g clipPath="url(#rwBelow)">
        {/* reflejo verdoso de la vegetación en la superficie */}
        <rect x={-40} y={sy} width={1160} height={90 * cam.zoom} fill={mixColor('#2a5a3a', '#8a6a3a', sunset)} opacity={0.35} />
        {Array.from({length: 7}, (_, i) => {
          const x0 = 60 + i * 160 + Math.sin(t * 0.3 + i) * 30;
          return <path key={`r${i}`} d={`M${f1(x0)},${f1(sy)} l${f1(-120)},1600 l${f1(80 + hash1(i) * 50)},0Z`} fill="url(#rwRay)" opacity={0.5 + 0.4 * Math.sin(t * 0.8 + i)} />;
        })}
      </g>
      {/* orilla (tierra y piedras húmedas) */}
      {bank && (
        <g transform={layerT(cam, 1)}>
          <path d={`M${bank.x0},${-10} Q${bank.x0 + 200},${-60} ${bank.x0 + 500},${-70} L${bank.x1},${-90} L${bank.x1},${floorY + 600} L${bank.x0 - 200},${floorY + 600}Z`} fill="#5a4630" />
          <path d={`M${bank.x0},${-10} Q${bank.x0 + 200},${-60} ${bank.x0 + 500},${-70} L${bank.x1},${-90}`} stroke="#3a2e1e" strokeWidth={6} fill="none" />
          {Array.from({length: 10}, (_, i) => <ellipse key={i} cx={bank.x0 + 80 + i * 90} cy={-40 - i * 4 + (i % 2) * 14} rx={50 + hash1(i) * 30} ry={24} fill={i % 2 ? '#7a7466' : '#8a8474'} stroke="#4a463c" strokeWidth={3} />)}
          {Array.from({length: 6}, (_, i) => <path key={`rt${i}`} d={`M${bank.x0 + 100 + i * 140},${30} q${-30},${60} ${10},${140}`} stroke="#4a3a24" strokeWidth={6} fill="none" />)}
          {Array.from({length: 6}, (_, i) => <Fern key={`f${i}`} x={bank.x0 + 300 + i * 160} y={-80} s={1.0} c="#3a6a32" t={t} i={i} />)}
        </g>
      )}
      <g transform={layerT(cam, 1)}>
        {/* fondo del río */}
        <path d={`M${cam.x - 3000},${floorY + 1600} L${cam.x - 3000},${floorY} ${Array.from({length: 40}, (_, i) => `L${f1(cam.x - 3000 + i * 160)},${f1(floorY - 20 - hash1(i * 3) * 40)}`).join(' ')} L${cam.x + 3400},${floorY} L${cam.x + 3400},${floorY + 1600}Z`} fill="#4a4a3a" />
        {Array.from({length: 26}, (_, i) => {
          const x = Math.floor(cam.x / 1600) * 1600 + (hash1(i * 7) - 0.5) * 3600;
          const r = 30 + hash1(i * 9) * 60;
          return <ellipse key={`s${i}`} cx={x} cy={floorY - r * 0.4} rx={r} ry={r * 0.6} fill={['#6a6a5a', '#7a7666', '#5a5a4c'][i % 3]} stroke="#3a3a30" strokeWidth={2.5} />;
        })}
        {Array.from({length: 14}, (_, i) => {
          const x = Math.floor(cam.x / 1600) * 1600 + (hash1(i * 13) - 0.5) * 3600;
          return <path key={`pl${i}`} d={`M${x},${floorY} q${Math.sin(t * 0.9 + i) * 20},-120 ${Math.sin(t * 1.1 + i) * 34},-260`} stroke="#4a7a3a" strokeWidth={8} fill="none" strokeLinecap="round" />;
        })}
        {/* larvas y pequeños crustáceos entre las piedras */}
        {Array.from({length: 10}, (_, i) => {
          const x = Math.floor(cam.x / 1600) * 1600 + (hash1(i * 17) - 0.5) * 3000;
          return <path key={`lv${i}`} d={`M${x},${floorY - 6} q8,${-4 + Math.sin(t * 3 + i) * 3} 16,0 q8,4 16,0`} stroke="#c8a870" strokeWidth={4} fill="none" strokeLinecap="round" />;
        })}
        {sediment.map((s, i) => {
          const k = clamp((t - s.t0) / 2.4);
          if (k <= 0 || k >= 1) return null;
          return <g key={`sd${i}`} opacity={0.55 * (1 - k)}>{Array.from({length: 8}, (_, j) => <circle key={j} cx={s.x + Math.cos(j * 0.8) * (20 + k * 120)} cy={floorY - 20 - k * (30 + (j % 3) * 30)} r={10 + k * 16} fill="#8a7a5a" />)}</g>;
        })}
        {children}
        {bubbles.map((b, i) => <circle key={`b${i}`} cx={b.x} cy={b.y} r={4 + (i % 3) * 2} fill="none" stroke="#dff8ff" strokeWidth={2} opacity={0.7} />)}
      </g>
      {/* agua sobre lo sumergido + partículas */}
      <g clipPath="url(#rwBelow)">
        <rect x={-40} y={sy - 10} width={1160} height={2200} fill="#1a5a5a" opacity={tint} />
        {Array.from({length: 30}, (_, i) => <circle key={`pt${i}`} cx={(hash1(i * 7) * 1200 + t * 12) % 1160 - 40} cy={sy + ((hash1(i * 9) * 1800 + t * 8) % 1800)} r={1.5 + hash1(i) * 2} fill="#e8fff4" opacity={0.35} />)}
      </g>
      {/* línea del agua, brillos y anillos de ondas */}
      <path d={line} stroke="#e8fff8" strokeWidth={3} fill="none" opacity={0.8} />
      {ripples.map((r, i) => {
        const k = (t - r.t0) / 2.6;
        if (k <= 0 || k >= 1) return null;
        const c = toScreen(cam, r.x, 0);
        const rad = (40 + k * 420) * (r.s ?? 1) * cam.zoom;
        return (
          <g key={`rp${i}`} opacity={1 - k}>
            <ellipse cx={c.x} cy={c.y} rx={rad} ry={rad * 0.16} fill="none" stroke="#f4fffc" strokeWidth={3} />
            <ellipse cx={c.x} cy={c.y} rx={rad * 0.6} ry={rad * 0.1} fill="none" stroke="#f4fffc" strokeWidth={2} />
          </g>
        );
      })}
      {Array.from({length: 12}, (_, i) => {
        const x = (hash1(i * 4) * 1160 + t * 20) % 1160 - 40;
        const k = Math.max(0, Math.sin(t * 2.4 + i * 2));
        return <rect key={`g${i}`} x={x} y={sy + 4 + hash1(i * 6) * 30} width={20 + hash1(i) * 30} height={2.4} fill={sunset > 0.3 ? '#ffe0a0' : '#f4fffc'} opacity={0.6 * k} />;
      })}
    </g>
  );
};

/** Corte ilustrativo del terreno: túnel desde la orilla hasta la cámara del nido (en el origen). */
export const BurrowCutaway: React.FC<{cam: Cam; t: number; children?: React.ReactNode; glow?: number}> = ({cam, t, children, glow = 1}) => (
  <g>
    <defs>
      <linearGradient id="bcSoil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6a4a2a" />
        <stop offset="1" stopColor="#3a2614" />
      </linearGradient>
      <radialGradient id="bcGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffcf8a" stopOpacity={0.55} />
        <stop offset="1" stopColor="#ffcf8a" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-40} y={-40} width={1160} height={2000} fill="url(#bcSoil)" />
    <g transform={layerT(cam, 1)}>
      {/* superficie con hierba y la orilla */}
      <rect x={-3000} y={-2600} width={6000} height={1400} fill="#5a8a6a" />
      <path d={`M-3000,-1200 ${Array.from({length: 60}, (_, i) => `L${-3000 + i * 100},${-1200 - (i % 2) * 20}`).join(' ')} L3000,-1200`} stroke="#3a6a2a" strokeWidth={14} fill="none" />
      {/* estratos y piedras del suelo */}
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M-3000,${-1000 + i * 260} Q0,${-1060 + i * 260} 3000,${-990 + i * 260}`} stroke="#4a3220" strokeWidth={6} fill="none" opacity={0.5} />)}
      {Array.from({length: 24}, (_, i) => <ellipse key={`st${i}`} cx={(hash1(i * 3) - 0.5) * 4000} cy={-1100 + hash1(i * 5) * 1700} rx={20 + hash1(i) * 30} ry={14} fill="#7a6650" opacity={0.6} />)}
      {/* raíces */}
      {Array.from({length: 9}, (_, i) => <path key={`r${i}`} d={`M${-1600 + i * 400},-1200 q${40 + Math.sin(i) * 60},300 ${-20},${600 + hash1(i) * 300} q-30,120 20,260`} stroke="#8a6a44" strokeWidth={8 - (i % 3)} fill="none" />)}
      {/* túnel desde la entrada (arriba a la izquierda) hasta la cámara */}
      <path d="M-1800,-1220 C-1300,-1000 -900,-400 -380,-80 C-200,20 -60,30 0,20" stroke="#24160c" strokeWidth={150} strokeLinecap="round" fill="none" />
      <ellipse cx={30} cy={10} rx={300} ry={160} fill="#24160c" />
      <ellipse cx={30} cy={20} rx={300} ry={160} fill="url(#bcGlow)" opacity={glow} />
      {/* material vegetal del nido */}
      {Array.from({length: 26}, (_, i) => <path key={`n${i}`} d={`M${-220 + hash1(i * 7) * 480},${110 + hash1(i * 9) * 50} q20,-12 40,0`} stroke={i % 2 ? '#8a7a3a' : '#6a8a3a'} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      {children}
    </g>
    {Array.from({length: 14}, (_, i) => <circle key={`d${i}`} cx={(hash1(i * 19) * 1160 + Math.sin(t * 0.3 + i) * 20) % 1160} cy={(hash1(i * 23) * 1900 + t * 6) % 1920} r={1.5} fill="#ffe0b0" opacity={0.3} />)}
  </g>
);

export const SciPanel: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs>
      <radialGradient id="spBg" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0" stopColor="#14404a" />
        <stop offset="1" stopColor="#061a20" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#spBg)" />
    {Array.from({length: 23}, (_, i) => <line key={`v${i}`} x1={i * 48} y1={0} x2={i * 48} y2={1920} stroke="#1e5560" strokeWidth={1} opacity={0.5} />)}
    {Array.from({length: 41}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 48 + ((t * 6) % 48)} x2={1080} y2={i * 48 + ((t * 6) % 48)} stroke="#1e5560" strokeWidth={1} opacity={0.35} />)}
  </g>
);
