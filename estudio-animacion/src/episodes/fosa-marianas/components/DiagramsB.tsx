// ILUSTRACIONES CIENTÍFICAS (2): presión, subducción, xenofióforos (estructura y escala), microorganismos
// piezófilos, adaptaciones del pez caracol, expediciones humanas y la columna oceánica completa.
import React from 'react';
import {clamp, hash1, lerp, smoothPath, smoothstep} from '../../../engine/math';
import {ease, Panel, T} from './DiagramsA';
import {fmt} from '../data/depth';

const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

// ------------------------------------------------------------------ presión (≈ 1 atm por cada 10 m)
export const PressureColumn: React.FC<{k: number; t: number; d: number; final?: boolean}> = ({k, t, d, final}) => {
  const top = 220;
  const h = 520;
  const y = (m: number) => top + (m / 11000) * h;
  const marks = [0, 10, 1000, 4000, 7000, 10935];
  const g = smoothstep(0.1, 0.5, k);
  const cur = y(Math.min(d, 10935) * g);
  return (
    <Panel k={k} x={150} y={120} w={1300} h={690} title={final ? 'PRESIÓN EN EL ABISMO CHALLENGER' : 'LA PRESIÓN AUMENTA CON LA PROFUNDIDAD'} sub="≈ 1 atmósfera más por cada 10 m de agua (valores aproximados)">
      <defs>
        <linearGradient id="pc-col" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a7ab0" />
          <stop offset="1" stopColor="#020610" />
        </linearGradient>
      </defs>
      <rect x={260} y={top} width={120} height={h} rx={12} fill="url(#pc-col)" stroke="#7ad8ff" strokeOpacity={0.4} />
      {marks.map((m, i) => (
        <g key={m} opacity={smoothstep(0.1 + i * 0.07, 0.25 + i * 0.07, k)}>
          <line x1={380} y1={y(m)} x2={420} y2={y(m)} stroke="#9fd8f0" strokeWidth={2} />
          <T x={430} y={y(m) + 8} s={22}>{fmt(m)} m</T>
          <T x={620} y={y(m) + 8} s={22} c="#ffd23f">≈ {fmt(1 + m / 10)} atm</T>
        </g>
      ))}
      <path d={`M250 ${f1(cur)}l-20 -10l0 20Z`} fill="#ffd23f" />
      {/* cubo comprimido por flechas */}
      <g transform="translate(1060 470)" opacity={smoothstep(0.5, 0.7, k)}>
        <rect x={-70} y={-70} width={140} height={140} rx={10} fill="#0e3a5a" stroke="#9fd8f0" strokeWidth={2} />
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2;
          const p = 6 * Math.sin(t * 3);
          return <path key={i} d={`M${f1(Math.cos(a) * (150 + p))} ${f1(Math.sin(a) * (150 + p))}L${f1(Math.cos(a) * 92)} ${f1(Math.sin(a) * 92)}`} stroke="#ffd23f" strokeWidth={8} strokeLinecap="round" />;
        })}
        <T x={0} y={8} s={20} a="middle">1 cm²</T>
        <T x={0} y={210} s={24} a="middle" c="#ffd23f">{final ? 'a ≈ 10.935 m: más de una tonelada' : 'cada 10 m: +1 atm'}</T>
        {final && <T x={0} y={240} s={24} a="middle" c="#ffd23f">sobre cada centímetro cuadrado</T>}
      </g>
    </Panel>
  );
};

// ------------------------------------------------------------------ subducción
export const Subduction: React.FC<{k: number; t: number}> = ({k, t}) => {
  const move = (t * 18) % 80;
  const sink = smoothstep(0.15, 0.6, k);
  return (
    <Panel k={k} title="¿CÓMO SE FORMA UNA FOSA OCEÁNICA?" sub="Subducción: la placa del Pacífico se hunde bajo la placa de las Marianas (esquema)">
      <defs>
        <linearGradient id="sb-mantle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a3a1a" />
          <stop offset="1" stopColor="#3a0a04" />
        </linearGradient>
      </defs>
      <rect x={200} y={300} width={1280} height={480} fill="url(#sb-mantle)" rx={10} />
      <rect x={200} y={210} width={1280} height={110} fill="#0e4a78" />
      {/* placa de las Marianas (cabalgante) con arco volcánico */}
      <path d="M200 320L880 320L960 360L940 420L200 420Z" fill="#6a5a4a" stroke="#c8b8a0" strokeWidth={2} />
      {[420, 560, 700].map((x, i) => <path key={x} d={`M${x - 50} 320L${x} ${250 - i * 6}L${x + 50} 320Z`} fill="#7a6a5a" stroke="#c8b8a0" strokeWidth={1.5} />)}
      {[420, 560, 700].map((x, i) => <path key={`m${x}`} d={`M${x} 330Q${x + 20 + Math.sin(t * 2 + i) * 6} 400 ${x + 60} 480`} stroke="#ff8a3a" strokeWidth={4} fill="none" opacity={0.7 * sink} />)}
      {/* placa del Pacífico que se hunde */}
      <path d={`M1480 330L980 330C930 340 900 370 ${f1(lerp(900, 860, sink))} ${f1(lerp(420, 470, sink))}L${f1(lerp(780, 680, sink))} ${f1(lerp(560, 760, sink))}L${f1(lerp(860, 770, sink))} ${f1(lerp(580, 780, sink))}L${f1(lerp(950, 930, sink))} ${f1(lerp(430, 470, sink))}C980 410 1010 395 1040 395L1480 395Z`} fill="#4a4a5a" stroke="#a8a8c8" strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${f1(1460 - i * 100 - move)} 362l-30 0l10 -8M${f1(1460 - i * 100 - move)} 362l-30 0l10 8`} stroke="#ffd23f" strokeWidth={3} fill="none" opacity={smoothstep(0.1, 0.3, k)} />)}
      {/* fosa */}
      <path d="M955 320Q975 345 990 330" stroke="#000" strokeWidth={6} fill="none" />
      <T x={975} y={295} s={22} a="middle" c="#ff8a96">FOSA</T>
      <T x={560} y={200} s={22} a="middle" c="#e8d8c0">arco de islas volcánicas (Marianas)</T>
      <T x={1260} y={380} s={20} a="middle">placa del Pacífico (más antigua y densa)</T>
      <T x={520} y={400} s={20} a="middle">placa de las Marianas</T>
      <T x={1100} y={700} s={22} a="middle" c="#ffb890" op={sink}>manto</T>
      <T x={700} y={650} s={18} a="middle" c="#ffb890" op={sink}>la placa se hunde ↘</T>
    </Panel>
  );
};

// ------------------------------------------------------------------ xenofióforo: célula gigante (estructura y escala)
export const XenoCard: React.FC<{k: number; t: number}> = ({k, t}) => {
  const zoom = smoothstep(0.3, 0.6, k);
  return (
    <Panel k={k} title="XENOFIÓFOROS: UNA SOLA CÉLULA" sub="Foraminíferos gigantes (no son animales) · representación microscópica ilustrada">
      {/* izquierda: testa aglutinada sobre el sedimento con escala */}
      <rect x={220} y={640} width={520} height={60} fill="#5a5048" rx={6} />
      <g transform="translate(470 560)">
        {Array.from({length: 46}, (_, i) => {
          const a = hash1(i) * Math.PI;
          const r = 30 + hash1(i * 3) * 80;
          return <circle key={i} cx={f1(Math.cos(a + Math.PI) * r * 1.1)} cy={f1(-Math.sin(a) * r * 0.9 + 70)} r={6 + hash1(i * 5) * 12} fill={i % 3 ? '#c8b89a' : '#a8987a'} stroke="#6a5a48" strokeWidth={1} />;
        })}
      </g>
      <line x1={340} y1={725} x2={600} y2={725} stroke="#ffd23f" strokeWidth={3} />
      <T x={470} y={760} s={20} a="middle" c="#ffd23f">≈ 10 cm (algunos más grandes)</T>
      <T x={470} y={300} s={22} a="middle">caparazón de granos de sedimento</T>
      <T x={470} y={330} s={22} a="middle">pegados por la propia célula</T>
      {/* derecha: ampliación */}
      <g opacity={zoom}>
        <circle cx={1120} cy={500} r={250} fill="#0a1e2e" stroke="#7ad8ff" strokeWidth={3} />
        <path d="M600 520L870 500" stroke="#7ad8ff" strokeWidth={2} strokeDasharray="8 6" />
        {Array.from({length: 18}, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          return <circle key={i} cx={f1(1120 + Math.cos(a) * 210)} cy={f1(500 + Math.sin(a) * 210)} r={22 + hash1(i) * 12} fill="#b8a88a" opacity={0.85} />;
        })}
        {/* granelar: citoplasma ramificado con núcleos */}
        {Array.from({length: 7}, (_, i) => {
          const a0 = (i / 7) * Math.PI * 2 + t * 0.05;
          const pts = [{x: 1120, y: 500}, {x: 1120 + Math.cos(a0 + 0.3) * 80, y: 500 + Math.sin(a0 + 0.3) * 80}, {x: 1120 + Math.cos(a0) * 170, y: 500 + Math.sin(a0) * 170}];
          return <path key={i} d={smoothPath(pts)} stroke="#e8a0c8" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.75} />;
        })}
        {Array.from({length: 14}, (_, i) => <circle key={`n${i}`} cx={f1(1120 + Math.cos(i * 2.4) * (40 + i * 9))} cy={f1(500 + Math.sin(i * 2.4) * (40 + i * 9))} r={5} fill="#7a2a5a" />)}
        {Array.from({length: 10}, (_, i) => <ellipse key={`s${i}`} cx={f1(1120 + Math.cos(i * 1.7 + 1) * (60 + i * 10))} cy={f1(500 + Math.sin(i * 1.7 + 1) * (60 + i * 10))} rx={9} ry={6} fill="#3a3028" />)}
        <T x={1120} y={800} s={20} a="middle" c="#e8a0c8">citoplasma ramificado (granelar) con muchos núcleos</T>
        <T x={1120} y={828} s={18} a="middle" c="#c8b8a0">gránulos oscuros: desechos (estercomas)</T>
      </g>
    </Panel>
  );
};

// ------------------------------------------------------------------ microorganismos piezófilos
export const MicrobeCard: React.FC<{k: number; t: number; part: number}> = ({k, t, part}) => {
  const cells = Array.from({length: 16}, (_, i) => {
    const x = 330 + hash1(i * 3) * 520;
    const y = 300 + hash1(i * 7) * 380;
    const rod = i % 3 !== 0;
    const a = hash1(i * 5) * Math.PI;
    const wob = Math.sin(t * 2 + i) * 3;
    return (
      <g key={i} transform={`translate(${f1(x + wob)} ${f1(y)}) rotate(${f1(a * 57.3 + Math.sin(t * 0.5 + i) * 8)})`}>
        {rod ? <rect x={-22} y={-8} width={44} height={16} rx={8} fill="#7ad89a" stroke="#c8ffd8" strokeWidth={1.5} opacity={0.9} /> : <circle r={11} fill="#d8a0f0" stroke="#f0d8ff" strokeWidth={1.5} opacity={0.9} />}
        {rod && <path d={`M22 0q10 ${f1(Math.sin(t * 6 + i) * 6)} 22 0t20 0`} stroke="#c8ffd8" strokeWidth={1.2} fill="none" />}
      </g>
    );
  });
  const grains = Array.from({length: 12}, (_, i) => {
    const x = 300 + hash1(i * 11) * 580;
    const y = 290 + hash1(i * 13) * 420;
    const r = 30 + hash1(i * 17) * 40;
    return <path key={i} d={smoothPath(Array.from({length: 7}, (_, j) => ({x: x + Math.cos((j / 7) * 6.28) * r * (0.7 + hash1(i * 7 + j) * 0.5), y: y + Math.sin((j / 7) * 6.28) * r * (0.6 + hash1(i * 5 + j) * 0.5)})), true)} fill="#4a4038" stroke="#7a6a58" strokeWidth={1.5} />;
  });
  const mem = smoothstep(0.05, 0.3, part);
  return (
    <Panel k={k} title="MICROORGANISMOS PIEZÓFILOS" sub="Bacterias y arqueas que crecen mejor a alta presión · ilustración microscópica (no a escala)">
      <rect x={270} y={250} width={640} height={490} rx={16} fill="#0e1a16" />
      {grains}
      {cells}
      <T x={590} y={775} s={18} a="middle" c="#9fe8b8">sedimento con bacterias (bastones) y arqueas (esferas)</T>
      {/* membrana: más ácidos grasos insaturados (colas dobladas) */}
      <g opacity={mem}>
        <rect x={980} y={250} width={500} height={240} rx={16} fill="#0a1e2e" />
        <T x={1230} y={290} s={20} a="middle" c="#ffd23f">membrana más fluida</T>
        {Array.from({length: 12}, (_, i) => {
          const x = 1010 + i * 38;
          const bent = i % 2 === 0;
          return (
            <g key={i}>
              <circle cx={x} cy={330} r={9} fill="#7ad8ff" />
              <path d={bent ? `M${x - 3} 340L${x - 3} 370L${x + 8} 390L${x + 8} 410` : `M${x - 3} 340L${x - 3} 410`} stroke="#e8e8c8" strokeWidth={2.5} fill="none" />
              <path d={`M${x + 3} 340L${x + 3} 410`} stroke="#e8e8c8" strokeWidth={2.5} />
            </g>
          );
        })}
        <T x={1230} y={460} s={17} a="middle" c="#c8e8f8">colas dobladas = grasas insaturadas</T>
      </g>
      <g opacity={smoothstep(0.35, 0.6, part)}>
        <rect x={980} y={510} width={500} height={230} rx={16} fill="#0a1e2e" />
        <T x={1230} y={550} s={20} a="middle" c="#ffd23f">proteínas adaptadas a la presión</T>
        <path d={smoothPath(Array.from({length: 9}, (_, i) => ({x: 1100 + Math.cos(i * 1.4) * 60 + i * 12, y: 640 + Math.sin(i * 1.9) * 40})), true)} fill="#c86a8a" opacity={0.8} />
        {Array.from({length: 8}, (_, i) => <circle key={i} cx={f1(1300 + Math.cos(i * 0.8 + t) * 70)} cy={f1(640 + Math.sin(i * 0.8 + t) * 50)} r={8} fill="#9ff0ff" opacity={0.8} />)}
        <T x={1230} y={720} s={16} a="middle" c="#c8e8f8">siguen funcionando donde otras se deformarían</T>
      </g>
    </Panel>
  );
};

// ------------------------------------------------------------------ adaptaciones del pez caracol
export const SnailCard: React.FC<{k: number; t: number}> = ({k, t}) => {
  const items: string[] = ['cuerpo blando y gelatinoso, sin escamas', 'cráneo no completamente osificado', 'sin vejiga natatoria llena de gas', 'óxido de trimetilamina (TMAO): estabiliza las proteínas'];
  return (
    <Panel k={k} x={150} y={120} w={1300} h={680} title="ADAPTACIONES A LA PRESIÓN" sub="Pez caracol de las Marianas (Pseudoliparis swirei) · esquema">
      {items.map((s, i) => (
        <g key={i} opacity={smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k)}>
          <rect x={210} y={230 + i * 120} width={640} height={92} rx={16} fill="#0a2238" stroke="#7ad8ff" strokeOpacity={0.35} />
          <circle cx={258} cy={276 + i * 120} r={16} fill="#ffd23f" />
          <T x={258} y={284 + i * 120} s={20} a="middle" c="#06182a" w={900}>{i + 1}</T>
          <T x={292} y={284 + i * 120} s={24}>{s}</T>
        </g>
      ))}
      <g opacity={smoothstep(0.6, 0.8, k)}>
        <path d={smoothPath(Array.from({length: 10}, (_, i) => ({x: 1110 + Math.cos(i * 1.3) * 90 + i * 6, y: 450 + Math.sin(i * 1.7) * 70})), true)} fill="#c86a8a" opacity={0.85} />
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + t * 0.4;
          return <g key={i}><circle cx={f1(1140 + Math.cos(a) * 170)} cy={f1(460 + Math.sin(a) * 140)} r={14} fill="#5ad8ff" /><T x={f1(1140 + Math.cos(a) * 170)} y={f1(466 + Math.sin(a) * 140)} s={10} a="middle" c="#04121e" w={900}>TMAO</T></g>;
        })}
        <T x={1140} y={680} s={20} a="middle" c="#c8e8f8">las moléculas de TMAO ayudan a mantener</T>
        <T x={1140} y={708} s={20} a="middle" c="#c8e8f8">la forma de las proteínas bajo presión</T>
      </g>
    </Panel>
  );
};

// ------------------------------------------------------------------ expediciones humanas (ilustraciones originales)
const Bathyscaphe: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-150 -40C-150 -80 -110 -90 -60 -90L90 -90C140 -90 160 -70 160 -40C160 -10 140 0 90 0L-60 0C-110 0 -150 -10 -150 -40Z" fill="#5a6a7a" stroke="#c8d8e8" strokeWidth={2} />
    <path d="M-40 -90L-40 -120L20 -120L30 -90Z" fill="#4a5a6a" stroke="#c8d8e8" strokeWidth={2} />
    <circle cx={10} cy={40} r={36} fill="#8a9aa8" stroke="#e8f0f8" strokeWidth={2} />
    <circle cx={30} cy={36} r={8} fill="#bff0ff" />
    <path d="M-10 0L-10 8M30 0L30 8" stroke="#c8d8e8" strokeWidth={4} />
  </g>
);
const VerticalSub: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-28 -150C-28 -170 28 -170 28 -150L34 70C34 90 -34 90 -34 70Z" fill="#c8a02a" stroke="#f0e0a0" strokeWidth={2} />
    <circle cx={0} cy={60} r={30} fill="#7a8a98" stroke="#e8f0f8" strokeWidth={2} />
    <circle cx={10} cy={56} r={7} fill="#bff0ff" />
    <rect x={-50} y={-60} width={100} height={10} rx={4} fill="#4a4a4a" />
  </g>
);
const ModernSub: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-120 -60C-120 -80 -100 -86 -70 -86L90 -86C120 -86 130 -70 130 -50L130 30C130 46 116 52 96 52L-90 52C-112 52 -120 44 -120 26Z" fill="#e8ecf0" stroke="#7a8a98" strokeWidth={2} />
    <rect x={-120} y={0} width={250} height={16} fill="#2a6a9a" />
    <circle cx={86} cy={-10} r={40} fill="#8a98a4" stroke="#2a323a" strokeWidth={2} />
    <circle cx={110} cy={-8} r={10} fill="#bff0ff" />
  </g>
);
export const Expeditions: React.FC<{k: number; t: number}> = ({k}) => {
  const items: {year: string; name: string; who: string; node: React.ReactNode}[] = [
    {year: '1960', name: 'Batiscafo Trieste', who: 'Jacques Piccard y Don Walsh', node: <Bathyscaphe x={410} y={430} />},
    {year: '2012', name: 'Deepsea Challenger', who: 'James Cameron, en solitario', node: <VerticalSub x={840} y={440} />},
    {year: '2019 →', name: 'Sumergibles modernos', who: 'varias inmersiones tripuladas', node: <ModernSub x={1250} y={440} />},
  ];
  return (
    <Panel k={k} title="LLEGAR AL FONDO" sub="Ilustraciones originales inspiradas en vehículos reales (no son réplicas exactas)">
      {items.map((it, i) => {
        const x = 410 + i * 420;
        const a = smoothstep(0.1 + i * 0.2, 0.3 + i * 0.2, k);
        return (
          <g key={i} opacity={a} transform={`translate(0 ${f1((1 - a) * 20)})`}>
            {it.node}
            <T x={x} y={620} s={44} a="middle" c="#ffd23f" w={900}>{it.year}</T>
            <T x={x} y={665} s={26} a="middle">{it.name}</T>
            <T x={x} y={700} s={20} a="middle" c="#9fd8f0">{it.who}</T>
          </g>
        );
      })}
    </Panel>
  );
};

// ------------------------------------------------------------------ columna oceánica completa recorrida
const COL: [number, string, string][] = [[0, 'delfines · atunes · tiburones', '#3cc8e8'], [200, 'peces linterna · pez de cabeza transparente', '#2a6aa8'], [1000, 'rape abisal · pez dragón · medusas', '#3a3a8a'], [3000, 'pez pelícano · pulpo dumbo', '#3a3a7a'], [4000, 'pepinos de mar · xenofióforos', '#5a3a7a'], [6000, 'anfípodos hadales', '#7a2a3a'], [7000, 'pez caracol de las Marianas (hasta ≈ 8.000 m)', '#7a2a3a'], [8200, 'anfípodos y microorganismos', '#6a1a2a']];
export const FinalColumn: React.FC<{k: number; t: number}> = ({k, t}) => {
  const top = 160;
  const h = 640;
  const y = (m: number) => top + (m / 11000) * h;
  const g = smoothstep(0.1, 0.5, k);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: ease(clamp(k)), pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="fc-col" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3ab8e0" />
          <stop offset="0.1" stopColor="#0e4a7a" />
          <stop offset="0.35" stopColor="#04102a" />
          <stop offset="1" stopColor="#000003" />
        </linearGradient>
      </defs>
      <rect x={300} y={top} width={180} height={h} rx={10} fill="url(#fc-col)" stroke="#7ad8ff" strokeOpacity={0.5} />
      <path d={`M300 ${f1(y(10935))}L480 ${f1(y(10935))}`} stroke="#ffd23f" strokeWidth={3} />
      {COL.map(([m, txt, c], i) => (
        <g key={m} opacity={smoothstep(0.08 + i * 0.06, 0.2 + i * 0.06, k)}>
          <line x1={480} y1={y(m)} x2={540} y2={y(m)} stroke={c} strokeWidth={3} />
          <T x={550} y={y(m) + 8} s={22} c="#ffffff">{fmt(m)} m</T>
          <T x={700} y={y(m) + 8} s={22} c="#bfe8ff" w={600}>{txt}</T>
        </g>
      ))}
      <T x={550} y={y(10935) + 8} s={24} c="#ffd23f" w={900}>≈ 10.935 m · abismo Challenger</T>
      <circle cx={390} cy={f1(lerp(top, y(10935) - 8, g))} r={6 + Math.sin(t * 4) * 2} fill="#fff6d0" />
      <circle cx={390} cy={f1(lerp(top, y(10935) - 8, g))} r={18} fill="#fff6d0" opacity={0.25} />
    </svg>
  );
};
export const _k = {clamp};
