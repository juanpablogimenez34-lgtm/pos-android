// LABORATORIO Y GRÁFICOS CIENTÍFICOS (espacio de pantalla, 1080×1920).
//  · Lab: laboratorio ilustrado con un espectrómetro (línea de haz con luces), monitor que dibuja la curva
//    de calibración, viales con muestras del núcleo del cristalino, pipeta y luces de estado animadas.
//  · LensDiagram: ojo → cristalino → núcleo (proteínas formadas antes del nacimiento, metabólicamente
//    inertes) → datación por radiocarbono. Sin «anillos» de crecimiento.
//  · AgeEstimate: ilustración del ejemplar (≈ 5 m), cifra 392 y barra de incertidumbre (±120 años).
//  · MaturityBar: línea de tiempo de ~150 años (estimación) con generaciones humanas.
import React from 'react';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const T: React.FC<{x: number; y: number; s: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode; o?: number}> = ({x, y, s, c = '#eaf6ff', w = 800, a = 'middle', children, o = 1}) => (
  <text x={x} y={y} textAnchor={a} fill={c} fontSize={s} fontWeight={w} fontFamily={FONT_FAMILY} opacity={o} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.55)" strokeWidth={s * 0.12}>
    {children}
  </text>
);

export const Lab: React.FC<{t: number; t0: number; pan?: number}> = ({t, t0, pan = 0}) => {
  const u = clamp((t - t0) / 5);
  const ox = -pan * 120;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="labW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c3440" />
          <stop offset="0.6" stopColor="#2a4a58" />
          <stop offset="1" stopColor="#16262e" />
        </linearGradient>
        <radialGradient id="labL" cx="0.5" cy="0.2" r="0.7">
          <stop offset="0" stopColor="#bfe8f0" stopOpacity={0.35} />
          <stop offset="1" stopColor="#bfe8f0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#labW)" />
      <rect width={1080} height={1920} fill="url(#labL)" />
      <g transform={`translate(${f1(ox)} 0)`}>
        {/* estanterías y luces de techo */}
        {[0, 1, 2].map((i) => <rect key={i} x={80 + i * 340} y={260} width={260} height={10} fill="#cfe8f0" opacity={0.5} />)}
        {Array.from({length: 9}, (_, i) => <rect key={`b${i}`} x={110 + i * 100} y={420} width={40} height={90} rx={6} fill={i % 3 ? '#4a7a8a' : '#8ab8c4'} opacity={0.7} />)}
        <rect x={60} y={510} width={1000} height={14} fill="#8aa8b4" />
        {/* espectrómetro (línea de haz) */}
        <rect x={80} y={760} width={980} height={220} rx={20} fill="#3a5866" stroke="#9ac4d0" strokeWidth={3} />
        <rect x={140} y={820} width={860} height={40} rx={20} fill="#1e3640" stroke="#7ab0bc" strokeWidth={3} />
        {Array.from({length: 18}, (_, i) => {
          const on = (Math.floor(t * 6) + i) % 6 === 0;
          return <circle key={`l${i}`} cx={170 + i * 46} cy={910} r={8} fill={on ? '#7affd8' : '#2a5a5a'} />;
        })}
        <rect x={140 + ((t * 300) % 820)} y={826} width={60} height={28} rx={14} fill="#9fffe8" opacity={0.55} />
        <T x={570} y={1010} s={24} c="#cfeef4">espectrómetro de masas con acelerador (radiocarbono)</T>
        {/* mesa con viales */}
        <rect x={60} y={1290} width={1000} height={26} fill="#9ab4bc" />
        {Array.from({length: 6}, (_, i) => (
          <g key={`v${i}`}>
            <rect x={130 + i * 70} y={1190} width={36} height={100} rx={10} fill="#d8eef4" opacity={0.55} stroke="#eaf6ff" strokeWidth={2} />
            <rect x={134 + i * 70} y={1250} width={28} height={36} rx={8} fill="#f0e4c0" opacity={0.85} />
          </g>
        ))}
        {/* pipeta que baja y sube */}
        <g transform={`translate(${f1(320 + Math.sin(t * 0.8) * 80)} ${f1(1060 + Math.max(0, Math.sin(t * 1.6)) * 60)})`}>
          <rect x={-10} y={-120} width={20} height={120} rx={8} fill="#e8eef0" />
          <path d="M-6,0 L0,60 L6,0Z" fill="#e8eef0" />
        </g>
        {/* monitor con la curva */}
        <rect x={580} y={1040} width={420} height={240} rx={12} fill="#0c1a20" stroke="#7ab0bc" strokeWidth={4} />
        <path d={Array.from({length: 40}, (_, i) => {
          const x = 600 + i * 9.6;
          const k = i / 39;
          const y = 1250 - (k < 0.75 ? 30 + k * 40 : 60 + (k - 0.75) * 600 * Math.exp(-(k - 0.85) * (k - 0.85) * 120));
          return `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`;
        }).slice(0, Math.max(2, Math.round(40 * u))).join(' ')} stroke="#7affd8" strokeWidth={4} fill="none" />
        <T x={790} y={1072} s={20} c="#9ad8e0" w={700}>calibración ¹⁴C (esquema)</T>
      </g>
    </svg>
  );
};

export const LensDiagram: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const a = clamp((t - t0) / 1.2);
  const b = clamp((t - t0 - 1.4) / 1.2);
  const c = clamp((t - t0 - 2.8) / 1.2);
  const pulse = 1 + 0.06 * Math.sin(t * 4);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect width={1080} height={1920} fill="#0a1c24" opacity={0.86 * a} />
      <g opacity={a} transform="translate(540 820)">
        <circle r={300} fill="#e8eef0" stroke="#9ab4bc" strokeWidth={6} />
        <circle r={300} fill="none" stroke="#c87a6a" strokeWidth={10} opacity={0.4} />
        <path d="M300,-60 Q340,0 300,60" fill="#7a9aa4" />
        <ellipse cx={210} cy={0} rx={70} ry={130} fill="#cfe0e8" stroke="#6a8a94" strokeWidth={4} opacity={0.95} />
        <g opacity={b}>
          <ellipse cx={210} cy={0} rx={70} ry={130} fill="#f4e8c0" stroke="#c8a860" strokeWidth={5} />
          <ellipse cx={210} cy={0} rx={22 * pulse} ry={40 * pulse} fill="#e8a040" />
        </g>
      </g>
      <g opacity={b}>
        <path d="M770,820 L880,560" stroke="#ffd870" strokeWidth={3} />
        <T x={880} y={530} s={30} c="#ffd870" a="end">cristalino</T>
      </g>
      <g opacity={c}>
        <path d="M750,830 L760,1240" stroke="#ffb060" strokeWidth={3} />
        <T x={540} y={1280} s={30} c="#ffb060">núcleo del cristalino</T>
        <T x={540} y={1326} s={24} c="#eaf6ff" w={700}>proteínas formadas antes del nacimiento,</T>
        <T x={540} y={1360} s={24} c="#eaf6ff" w={700}>que no se renuevan</T>
        <T x={540} y={1430} s={26} c="#7affd8">→ datación por radiocarbono (¹⁴C)</T>
      </g>
      <T x={540} y={1690} s={22} c="#cfe8ff" w={700} o={a * 0.85}>Esquema simplificado · no son anillos de crecimiento</T>
    </svg>
  );
};

export const AgeEstimate: React.FC<{t: number; tNum: number; tRange: number; shark?: React.ReactNode}> = ({t, tNum, tRange}) => {
  const n = Math.round(lerp(0, 392, clamp((t - tNum) / 2.2) ** 0.6));
  const r = clamp((t - tRange) / 1.6);
  const x0 = 140;
  const x1 = 940;
  const X = (age: number) => x0 + ((age - 0) / 600) * (x1 - x0);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {t >= tNum && (
        <g>
          <T x={540} y={560} s={190} c="#ffd870" w={900}>{n}</T>
          <T x={540} y={640} s={44} c="#eaf6ff" w={900}>AÑOS ESTIMADOS</T>
        </g>
      )}
      {r > 0.01 && (
        <g opacity={r}>
          <line x1={x0} y1={760} x2={x1} y2={760} stroke="#cfe8ff" strokeWidth={3} opacity={0.6} />
          {[0, 100, 200, 300, 400, 500, 600].map((a) => (
            <g key={a}>
              <line x1={X(a)} y1={748} x2={X(a)} y2={772} stroke="#cfe8ff" strokeWidth={2} />
              <T x={X(a)} y={806} s={22} c="#cfe8ff" w={700}>{a}</T>
            </g>
          ))}
          <rect x={X(392 - 120 * r)} y={738} width={X(392 + 120 * r) - X(392 - 120 * r)} height={44} rx={22} fill="#ffd870" opacity={0.35} />
          <circle cx={X(392)} cy={760} r={14} fill="#ffd870" />
          <T x={540} y={880} s={34} c="#ffd870">Margen de incertidumbre: ±120 años</T>
          <T x={540} y={926} s={24} c="#eaf6ff" w={700}>(entre unos 272 y 512 años)</T>
          <T x={540} y={980} s={22} c="#cfe8ff" w={700}>Estimación, no una edad medida directamente</T>
        </g>
      )}
    </svg>
  );
};

export const MaturityBar: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const u = clamp((t - t0) / 2.6);
  const x0 = 120;
  const x1 = 960;
  const xs = x0 + (x1 - x0) * u;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: clamp((t - t0) / 0.5)}}>
      <rect x={70} y={300} width={940} height={330} rx={22} fill="rgba(6,18,26,0.78)" stroke="#7ad8e0" strokeWidth={2} />
      <line x1={x0} y1={470} x2={x1} y2={470} stroke="#4a6a74" strokeWidth={10} strokeLinecap="round" />
      <line x1={x0} y1={470} x2={xs} y2={470} stroke="#7ad8e0" strokeWidth={10} strokeLinecap="round" />
      {[0, 50, 100, 150].map((a) => {
        const x = x0 + ((x1 - x0) * a) / 150;
        return (
          <g key={a}>
            <line x1={x} y1={452} x2={x} y2={488} stroke="#cfe8ff" strokeWidth={3} />
            <T x={x} y={530} s={24} c="#cfe8ff" w={700}>{`${a} años`}</T>
          </g>
        );
      })}
      {Array.from({length: 6}, (_, i) => {
        const x = x0 + ((x1 - x0) * (i * 25 + 12)) / 150;
        const k = clamp((xs - x) / 40);
        return (
          <g key={`h${i}`} opacity={k} transform={`translate(${f1(x)} 410)`}>
            <circle cy={-22} r={9} fill="#ffd8a8" />
            <rect x={-7} y={-12} width={14} height={26} rx={6} fill="#ffd8a8" />
          </g>
        );
      })}
      <T x={540} y={360} s={34} c="#ffd870">MADUREZ DE LAS HEMBRAS: ~150 AÑOS</T>
      <T x={540} y={590} s={22} c="#eaf6ff" w={700}>Estimación científica (Nielsen et al. 2016) · cada figura ≈ una generación humana</T>
    </svg>
  );
};
