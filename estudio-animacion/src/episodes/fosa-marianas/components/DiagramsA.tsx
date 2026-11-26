// ILUSTRACIONES CIENTÍFICAS (pantalla 1920×1080, fuera de la franja de subtítulos y del contador):
// panel base, Everest frente al abismo Challenger, mapa del Pacífico occidental, absorción de la luz,
// reacción de bioluminiscencia, comparación de tamaño (ser humano / calamar gigante) y nieve marina.
import React from 'react';
import {clamp, hash1, lerp, smoothPath, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';

const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
export const ease = (k: number) => k * k * (3 - 2 * k);

export const T: React.FC<{x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; w?: number; op?: number; children: React.ReactNode; it?: boolean}> = ({x, y, s = 24, c = '#eaf6ff', a = 'start', w = 700, op = 1, children, it}) => (
  <text x={x} y={y} fontFamily={FONT_FAMILY} fontWeight={w} fontSize={s} fill={c} textAnchor={a} opacity={op} fontStyle={it ? 'italic' : undefined} style={{paintOrder: 'stroke'}} stroke="#020a14" strokeWidth={4} strokeLinejoin="round">{children}</text>
);
/** Panel de vidrio oscuro con título; aparece y desaparece con k. */
export const Panel: React.FC<{k: number; x?: number; y?: number; w?: number; h?: number; title: string; sub?: string; children: React.ReactNode}> = ({k, x = 150, y = 110, w = 1380, h = 700, title, sub, children}) => {
  if (k <= 0.01) return null;
  const e = ease(clamp(k));
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: e, pointerEvents: 'none'}}>
      <g transform={`translate(0 ${f1((1 - e) * 30)})`}>
        <defs>
          <linearGradient id="panelg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#06182a" stopOpacity={0.92} />
            <stop offset="1" stopColor="#020a14" stopOpacity={0.92} />
          </linearGradient>
        </defs>
        <rect x={x} y={y} width={w} height={h} rx={28} fill="url(#panelg)" stroke="#7ad8ff" strokeOpacity={0.35} strokeWidth={2} />
        <T x={x + 40} y={y + 58} s={34} w={900} c="#ffd23f">{title}</T>
        {sub && <T x={x + 40} y={y + 92} s={20} w={600} c="#9fd8f0">{sub}</T>}
        {children}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ 1 · Everest frente al abismo Challenger
export const EverestCompare: React.FC<{k: number; t: number}> = ({k, t}) => {
  const x0 = 260;
  const x1 = 1420;
  const sea = 230;
  const px = 520 / 11000; // px por metro
  const bottom = sea + 10935 * px;
  const rise = ease(smoothstep(0.15, 0.6, k));
  const evH = 8849 * px;
  const evBase = bottom;
  const evTop = evBase - evH * rise;
  const cx = 840;
  const mountain = `M${cx - 260} ${f1(evBase)}L${cx - 150} ${f1(evBase - evH * 0.45 * rise)}L${cx - 90} ${f1(evBase - evH * 0.62 * rise)}L${cx - 40} ${f1(evBase - evH * 0.8 * rise)}L${cx} ${f1(evTop)}L${cx + 30} ${f1(evBase - evH * 0.88 * rise)}L${cx + 80} ${f1(evBase - evH * 0.7 * rise)}L${cx + 150} ${f1(evBase - evH * 0.5 * rise)}L${cx + 270} ${f1(evBase)}Z`;
  const snow = `M${cx - 40} ${f1(evBase - evH * 0.8 * rise)}L${cx} ${f1(evTop)}L${cx + 30} ${f1(evBase - evH * 0.88 * rise)}L${cx + 12} ${f1(evBase - evH * 0.84 * rise)}L${cx - 8} ${f1(evBase - evH * 0.9 * rise)}L${cx - 22} ${f1(evBase - evH * 0.82 * rise)}Z`;
  const gap = smoothstep(0.55, 0.8, k);
  return (
    <Panel k={k} title="EL EVEREST CABRÍA DENTRO DE LA FOSA" sub="Comparación ilustrada a escala vertical">
      <defs>
        <linearGradient id="ev-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a7ab0" />
          <stop offset="0.35" stopColor="#0a3a6a" />
          <stop offset="1" stopColor="#020610" />
        </linearGradient>
      </defs>
      <rect x={x0} y={sea} width={x1 - x0} height={bottom - sea} fill="url(#ev-sea)" />
      <path d={`M${x0} ${sea}${Array.from({length: 30}, (_, i) => `L${f1(x0 + (i / 29) * (x1 - x0))} ${f1(sea + Math.sin(i * 0.9 + t * 2) * 4)}`).join('')}`} stroke="#bff4ff" strokeWidth={3} fill="none" />
      {/* paredes de la fosa */}
      <path d={`M${x0} ${sea + 120}L${x0 + 260} ${f1(bottom - 40)}L${x0 + 340} ${f1(bottom)}L${x1 - 300} ${f1(bottom)}L${x1 - 200} ${f1(bottom - 60)}L${x1} ${sea + 160}L${x1} ${f1(bottom + 30)}L${x0} ${f1(bottom + 30)}Z`} fill="#1a1622" opacity={0.85} />
      <path d={mountain} fill="#6a6a78" stroke="#c8c8d8" strokeWidth={2} />
      <path d={snow} fill="#f4f8ff" />
      {/* cotas */}
      <line x1={x1 + 30} y1={sea} x2={x1 + 30} y2={bottom} stroke="#ffd23f" strokeWidth={3} />
      <T x={x1 + 40} y={sea + 8} s={20} c="#ffd23f">0 m</T>
      <T x={x1 + 40} y={bottom + 6} s={20} c="#ffd23f">≈ 10.935 m</T>
      <T x={cx} y={f1(evTop - 16)} s={22} a="middle" op={rise}>Everest · 8.849 m</T>
      {gap > 0.01 && (
        <g opacity={gap}>
          <line x1={cx + 60} y1={sea} x2={cx + 60} y2={f1(evTop)} stroke="#9ff0ff" strokeWidth={2.5} strokeDasharray="8 6" />
          <T x={cx + 76} y={f1((sea + evTop) / 2 + 8)} s={24} c="#9ff0ff">≈ 2.000 m de agua por encima de la cumbre</T>
        </g>
      )}
    </Panel>
  );
};

// ------------------------------------------------------------------ 2 · mapa del Pacífico occidental (ilustración original simplificada)
export const PacificMap: React.FC<{k: number; t: number}> = ({k, t}) => {
  const draw = smoothstep(0.2, 0.6, k);
  // proyección simple: lon 120–155 E → x 220–1480 ; lat 5–36 N → y 800–150
  const P = (lon: number, lat: number) => ({x: 220 + ((lon - 120) / 35) * 1260, y: 800 - ((lat - 5) / 31) * 650});
  const pth = (pts: [number, number][]) => smoothPath(pts.map(([a, b]) => P(a, b)), true);
  const japan = pth([[130.5, 31.2], [131.8, 33.8], [135, 34], [137, 34.6], [139.8, 35.0], [140.8, 36], [139.5, 36], [136.5, 35.6], [133, 34.6], [130.2, 33.6]]);
  const luzon = pth([[120.2, 14.5], [121.3, 13.8], [122.3, 14.2], [122.1, 16.5], [122.2, 18.4], [121.0, 18.6], [120.4, 16.4], [119.9, 15.6]]);
  const taiwan = pth([[120.1, 23.0], [120.8, 22.0], [121.6, 23.6], [121.9, 25.1], [121.2, 25.2], [120.3, 24.0]]);
  const mindanao = pth([[122, 7.2], [124, 6.4], [126.3, 7.0], [126.4, 8.9], [125.2, 9.6], [123.5, 8.6], [122.1, 8.0]]);
  const visayas = pth([[122.5, 10.5], [124.5, 10.0], [125.6, 11.3], [124.5, 12.6], [123, 12.2]]);
  const isl: [string, number, number][] = [['Guam', 144.8, 13.45], ['Rota', 145.2, 14.15], ['Tinian', 145.6, 15.0], ['Saipán', 145.75, 15.2], ['Anatahan', 145.67, 16.35], ['Pagan', 145.77, 18.1], ['Agrihan', 145.67, 18.77], ['Maug', 145.22, 20.03]];
  // eje de la fosa (aprox.): arco al este y al sur de las islas
  const trench: [number, number][] = [[142.0, 10.9], [142.6, 11.35], [143.8, 11.6], [145.8, 12.4], [147.0, 13.8], [147.7, 16.0], [147.6, 18.5], [146.8, 21], [145.8, 23.5], [143.9, 26.5], [142.8, 29.5]];
  const tPts = trench.map(([a, b]) => P(a, b));
  const tLen = tPts.length;
  const shown = Math.max(2, Math.round(tLen * draw));
  const cd = P(142.59, 11.37);
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <Panel k={k} title="FOSA DE LAS MARIANAS · PACÍFICO OCCIDENTAL" sub="Mapa ilustrado simplificado (posiciones aproximadas)">
      <defs>
        <radialGradient id="map-sea" cx="0.6" cy="0.5" r="0.8">
          <stop offset="0" stopColor="#0e4a78" />
          <stop offset="1" stopColor="#041a30" />
        </radialGradient>
      </defs>
      <rect x={200} y={140} width={1300} height={660} rx={18} fill="url(#map-sea)" />
      {/* retícula */}
      {[125, 130, 135, 140, 145, 150].map((lo) => <line key={lo} x1={P(lo, 5).x} y1={145} x2={P(lo, 5).x} y2={795} stroke="#4a8ab8" strokeOpacity={0.18} strokeWidth={1} />)}
      {[10, 15, 20, 25, 30, 35].map((la) => <line key={la} x1={205} y1={P(120, la).y} x2={1495} y2={P(120, la).y} stroke="#4a8ab8" strokeOpacity={0.18} strokeWidth={1} />)}
      {[japan, luzon, taiwan, mindanao, visayas].map((d, i) => <path key={i} d={d} fill="#5a8a6a" stroke="#9ac8a0" strokeWidth={1.5} />)}
      <T x={P(136, 35.4).x} y={P(136, 35.4).y - 18} s={20} a="middle" c="#c8e8c8">JAPÓN</T>
      <T x={P(121.2, 16).x - 20} y={P(121.2, 16).y} s={20} a="end" c="#c8e8c8">FILIPINAS</T>
      {/* fosa (se dibuja progresivamente) */}
      <path d={smoothPath(tPts.slice(0, shown))} stroke="#02040c" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={smoothPath(tPts.slice(0, shown))} stroke="#ff5a6a" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="14 8" />
      {isl.map(([n, lo, la], i) => {
        const q = P(lo, la);
        return <g key={n} opacity={smoothstep(0.1 + i * 0.03, 0.3 + i * 0.03, k)}><circle cx={q.x} cy={q.y} r={n === 'Guam' ? 9 : 6} fill="#8ac89a" stroke="#d8f0d8" strokeWidth={1.5} />{(n === 'Guam' || n === 'Saipán' || n === 'Pagan') && <T x={q.x - 14} y={q.y + 7} s={18} a="end" c="#d8f0d8">{n}</T>}</g>;
      })}
      <T x={P(145.4, 21.5).x - 16} y={P(145.4, 21.5).y} s={22} a="end" c="#ffffff" op={draw}>ISLAS MARIANAS</T>
      <T x={P(147.9, 18).x + 22} y={P(147.9, 18).y} s={22} c="#ff8a96" op={draw}>FOSA DE LAS MARIANAS</T>
      {/* abismo Challenger */}
      <g opacity={smoothstep(0.55, 0.75, k)}>
        <circle cx={cd.x} cy={cd.y} r={12 + pulse * 14} fill="none" stroke="#ffd23f" strokeWidth={2.5} opacity={1 - pulse * 0.6} />
        <circle cx={cd.x} cy={cd.y} r={7} fill="#ffd23f" />
        <T x={cd.x - 16} y={cd.y + 42} s={22} a="end" c="#ffd23f">ABISMO CHALLENGER</T>
        <T x={cd.x - 16} y={cd.y + 68} s={17} a="end" c="#ffe8a0">≈ 11° 22′ N · 142° 35′ E</T>
      </g>
      <T x={P(152, 30).x} y={P(152, 30).y} s={26} a="middle" c="#7ab8e0" w={600} it>Océano Pacífico</T>
      <T x={P(150.5, 6.5).x} y={P(150.5, 6.5).y} s={16} a="middle" c="#7ab8e0">longitud de la fosa ≈ 2.550 km</T>
    </Panel>
  );
};

// ------------------------------------------------------------------ 3 · absorción de la luz por colores
export const LightColors: React.FC<{k: number}> = ({k}) => {
  const cols: [string, string, number][] = [['rojo', '#ff4a4a', 0.12], ['naranja', '#ff9a3a', 0.25], ['amarillo', '#ffe04a', 0.42], ['verde', '#5ae07a', 0.7], ['azul', '#4aa8ff', 1]];
  return (
    <Panel k={k} x={180} y={140} w={760} h={560} title="EL AGUA ABSORBE LA LUZ" sub="Esquema cualitativo: los colores se apagan en orden">
      {cols.map(([n, c, reach], i) => {
        const x = 260 + i * 130;
        const grow = ease(smoothstep(0.1 + i * 0.08, 0.5 + i * 0.08, k));
        return (
          <g key={n}>
            <defs>
              <linearGradient id={`lc${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={c} />
                <stop offset="1" stopColor={c} stopOpacity={0} />
              </linearGradient>
            </defs>
            <rect x={x} y={270} width={70} height={f1(360 * reach * grow)} rx={8} fill={`url(#lc${i})`} />
            <T x={x + 35} y={255} s={18} a="middle" c={c}>{n}</T>
          </g>
        );
      })}
      <T x={220} y={290} s={16} c="#9fd8f0">superficie</T>
      <T x={220} y={660} s={16} c="#9fd8f0">más profundo ↓</T>
    </Panel>
  );
};

// ------------------------------------------------------------------ 4 · reacción de bioluminiscencia
export const Biolum: React.FC<{k: number; t: number}> = ({k, t}) => {
  const a = smoothstep(0.1, 0.35, k);
  const b = smoothstep(0.35, 0.6, k);
  const c = smoothstep(0.6, 0.85, k);
  const photons = Array.from({length: 10}, (_, i) => {
    const ph = ((t * 0.8 + i / 10) % 1);
    const ang = (i / 10) * Math.PI * 2;
    return <circle key={i} cx={f1(1110 + Math.cos(ang) * ph * 120)} cy={f1(390 + Math.sin(ang) * ph * 120)} r={5} fill="#7ff0ff" opacity={(1 - ph) * b} />;
  });
  const uses: [string, string][] = [['atraer presas', ''], ['comunicarse', ''], ['defenderse', ''], ['camuflarse (contrailuminación)', '']];
  return (
    <Panel k={k} title="¿CÓMO SE PRODUCE LA BIOLUMINISCENCIA?" sub="Esquema científico simplificado">
      <g opacity={a}>
        <circle cx={360} cy={390} r={70} fill="#2a4a6a" stroke="#9fd8f0" strokeWidth={2} />
        <T x={360} y={398} s={22} a="middle">luciferina</T>
        <T x={500} y={398} s={40} a="middle" c="#9fd8f0">+</T>
        <circle cx={620} cy={390} r={50} fill="#1a3a5a" stroke="#9fd8f0" strokeWidth={2} />
        <T x={620} y={398} s={24} a="middle">O₂</T>
      </g>
      <g opacity={b}>
        <path d="M700 390L960 390" stroke="#ffd23f" strokeWidth={5} />
        <path d="M960 390l-20 -12l0 24Z" fill="#ffd23f" />
        <T x={830} y={370} s={22} a="middle" c="#ffd23f">luciferasa (enzima)</T>
        <circle cx={1110} cy={390} r={60} fill="#1a3a3a" stroke="#7ff0ff" strokeWidth={2} />
        <T x={1110} y={398} s={20} a="middle">oxiluciferina</T>
        {photons}
        <T x={1110} y={500} s={26} a="middle" c="#7ff0ff">+ LUZ</T>
      </g>
      <g opacity={c}>
        {uses.map(([u, ic], i) => (
          <g key={u}>
            <rect x={240 + i * 300} y={600} width={270} height={120} rx={18} fill="#0a2238" stroke="#7ad8ff" strokeOpacity={0.4} />
            <circle cx={375 + i * 300} cy={640} r={12 + 4 * Math.sin(t * 3 + i)} fill="#7ff0ff" opacity={0.85} />{ic}
            <T x={375 + i * 300} y={692} s={i === 3 ? 16 : 20} a="middle">{u}</T>
          </g>
        ))}
      </g>
    </Panel>
  );
};

// ------------------------------------------------------------------ 5 · comparación de tamaño (representación ilustrada)
export const SizeCompare: React.FC<{k: number; t: number}> = ({k, t}) => {
  const g = smoothstep(0.15, 0.55, k);
  const px = 95; // px por metro
  const base = 690;
  const human = 1.75 * px;
  const squidL = 12 * px * g;
  return (
    <Panel k={k} title="REPRESENTACIÓN ILUSTRADA DE TAMAÑO" sub="Calamar gigante: hasta unos 12 m de longitud total (hembras grandes, incluidos los tentáculos)">
      <line x1={220} y1={base} x2={1460} y2={base} stroke="#4a7a9a" strokeWidth={2} />
      {Array.from({length: 13}, (_, i) => <g key={i}><line x1={240 + i * px} y1={base} x2={240 + i * px} y2={base + 12} stroke="#9fd8f0" strokeWidth={2} /><T x={240 + i * px} y={base + 36} s={16} a="middle" c="#9fd8f0">{i} m</T></g>)}
      {/* persona */}
      <g transform={`translate(270 ${base})`}>
        <circle cx={0} cy={-human + 14} r={14} fill="#e8d4b8" />
        <path d={`M-16 ${-human + 32}L16 ${-human + 32}L20 ${-human * 0.45}L10 ${-human * 0.45}L8 0L-8 0L-10 ${-human * 0.45}L-20 ${-human * 0.45}Z`} fill="#e8d4b8" />
        <T x={0} y={-human - 12} s={18} a="middle">1,75 m</T>
      </g>
      {/* silueta del calamar gigante */}
      <g transform={`translate(${f1(360 + squidL)} ${base - 120})`} opacity={g}>
        <path d={`M0 0C-60 -40 -${f1(squidL * 0.28)} -46 -${f1(squidL * 0.36)} -20L-${f1(squidL * 0.4)} 0L-${f1(squidL * 0.36)} 20C-${f1(squidL * 0.28)} 46 -60 40 0 0Z`} fill="#b84a3a" opacity={0.9} />
        <path d={`M-${f1(squidL * 0.06)} -18L0 -50L${f1(-squidL * 0.02)} 0Z`} fill="#a83a2a" />
        {Array.from({length: 8}, (_, i) => <path key={i} d={`M-${f1(squidL * 0.38)} ${(i - 3.5) * 4}q-${f1(squidL * 0.1)} ${f1((i - 3.5) * 8 + Math.sin(t + i) * 6)} -${f1(squidL * 0.22)} ${f1((i - 3.5) * 10)}`} stroke="#a83a2a" strokeWidth={5} fill="none" />)}
        {[-1, 1].map((sg) => <path key={sg} d={`M-${f1(squidL * 0.38)} 0q-${f1(squidL * 0.3)} ${f1(sg * 30 + Math.sin(t * 0.7) * 10)} -${f1(squidL * 0.6)} ${f1(sg * 14)}`} stroke="#b84a3a" strokeWidth={3} fill="none" />)}
      </g>
      <T x={840} y={base - 230} s={22} a="middle" op={g}>calamar gigante (Architeuthis dux)</T>
    </Panel>
  );
};

// ------------------------------------------------------------------ 6 · nieve marina
export const SnowDiagram: React.FC<{k: number; t: number}> = ({k, t}) => {
  const items: [number, string][] = [[0.15, 'fitoplancton y zooplancton en la superficie'], [0.35, 'restos, excrementos y mucosidad se agregan en "copos"'], [0.55, 'los copos se hunden lentamente: días o semanas'], [0.75, 'alimento para la vida profunda']];
  return (
    <Panel k={k} x={150} y={120} w={1200} h={690} title="LA NIEVE MARINA" sub="Animación científica simplificada">
      <defs>
        <linearGradient id="sn-col" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a7ab0" />
          <stop offset="1" stopColor="#020610" />
        </linearGradient>
      </defs>
      <rect x={220} y={200} width={380} height={560} rx={14} fill="url(#sn-col)" />
      <rect x={220} y={740} width={380} height={20} fill="#4a4048" />
      {Array.from({length: 46}, (_, i) => {
        const x = 240 + hash1(i * 3) * 340;
        const y = 210 + ((hash1(i * 7) * 540 + t * (12 + hash1(i) * 10)) % 530);
        const r = 2 + hash1(i * 5) * 4;
        return <path key={i} d={`M${f1(x)} ${f1(y)}l${f1(r)} ${f1(-r * 0.6)}l${f1(r * 0.8)} ${f1(r)}l${f1(-r)} ${f1(r * 0.7)}Z`} fill="#e8f4ff" opacity={0.7} />;
      })}
      {Array.from({length: 10}, (_, i) => <circle key={`p${i}`} cx={250 + i * 34} cy={220 + Math.sin(t * 2 + i) * 4} r={4} fill="#5aff9a" opacity={0.7} />)}
      {items.map(([at, txt], i) => (
        <g key={i} opacity={smoothstep(at, at + 0.12, k)}>
          <circle cx={650} cy={250 + i * 140} r={10} fill="#ffd23f" />
          <T x={680} y={258 + i * 140} s={26}>{txt}</T>
        </g>
      ))}
    </Panel>
  );
};
export const _k = {lerp};
