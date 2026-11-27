// ILUSTRACIONES DE LAS LEYENDAS (claramente rotuladas como tales):
//  · LegendNight  — antiguo velero de noche; marineros observan una larga silueta ondulante en el mar.
//  · JapanCoast   — costa estilizada en estilo de grabado tradicional (original): montañas, pinos,
//                   casas, olas lineales, un pez remo junto a la superficie y ondas sísmicas SIMBÓLICAS.
//  · MythVsEvidence — panel que separa la creencia popular de la evidencia científica, con un gráfico
//                   ILUSTRATIVO sin datos reales.
import React from 'react';
import {clamp, hash1, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Oarfish, oarPose} from './Oarfish';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode; op?: number; it?: boolean}> = ({x, y, s = 28, c = '#ffffff', w = 800, a = 'middle', children, op = 1, it}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={FONT_FAMILY} fontWeight={w} fontSize={s} fill={c} opacity={op} fontStyle={it ? 'italic' : 'normal'} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.55)" strokeWidth={4}>
    {children}
  </text>
);

const wave = (x0: number, x1: number, y: number, t: number, amp: number, k: number, ph = 0) => {
  const n = 40;
  return Array.from({length: n + 1}, (_, i) => {
    const x = lerp(x0, x1, i / n);
    return `${i ? 'L' : 'M'}${f1(x)},${f1(y + Math.sin(x * k + t + ph) * amp + Math.sin(x * k * 2.3 - t * 1.4) * amp * 0.35)}`;
  }).join(' ');
};

/** Escena nocturna de la leyenda (coordenadas de pantalla). */
export const LegendNight: React.FC<{t: number; k?: number}> = ({t, k = 1}) => {
  const sea = 1080;
  const roll = Math.sin(t * 0.8) * 3;
  const shipX = 300 + Math.sin(t * 0.2) * 10;
  return (
    <g opacity={k}>
      <defs>
        <linearGradient id="ep14night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02060f" />
          <stop offset="0.55" stopColor="#0b2240" />
          <stop offset="1" stopColor="#123a5a" />
        </linearGradient>
        <radialGradient id="ep14moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4f0d8" stopOpacity={0.9} />
          <stop offset="0.2" stopColor="#f4f0d8" stopOpacity={0.35} />
          <stop offset="1" stopColor="#f4f0d8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ep14night)" />
      {Array.from({length: 60}, (_, i) => (
        <circle key={i} cx={hash1(i * 3) * 1080} cy={hash1(i * 7) * 900} r={0.8 + hash1(i) * 1.8} fill="#ffffff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))} />
      ))}
      <circle cx={820} cy={380} r={320} fill="url(#ep14moon)" />
      <circle cx={820} cy={380} r={56} fill="#f4f0d8" />
      {/* nubes */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={((i * 420 + t * 12) % 1500) - 200} cy={300 + i * 120} rx={260} ry={34} fill="#1a2a44" opacity={0.7} />
      ))}
      {/* mar */}
      <rect x={0} y={sea} width={1080} height={900} fill="#0a2038" />
      <path d={`${wave(0, 1080, sea, t, 8, 0.012)} L1080,1920 L0,1920Z`} fill="#0d2a48" />
      {Array.from({length: 7}, (_, i) => (
        <path key={i} d={wave(0, 1080, sea + 60 + i * 90, t * (1 + i * 0.1), 6 + i, 0.01, i)} stroke="#2a5a80" strokeWidth={2} fill="none" opacity={0.6} />
      ))}
      {/* reflejo de la luna */}
      {Array.from({length: 12}, (_, i) => (
        <rect key={`r${i}`} x={780 + Math.sin(t * 2 + i) * 30} y={sea + 30 + i * 60} width={90 - i * 4} height={4} fill="#f4f0d8" opacity={0.35 - i * 0.02} />
      ))}
      {/* la "serpiente": un pez remo junto a la superficie, jorobas en silueta (representación) */}
      <g opacity={0.95}>
        <Oarfish uid="leg" p={oarPose({x: 880, y: sea + 70, scale: 0.42, t, sCurve: 120, sPhase: 1.2, light: 0.25, tint: '#9ab0c8', fade: 0.5, finSpeed: 2.4})} />
      </g>
      {/* velero */}
      <g transform={`translate(${f1(shipX)} ${f1(sea - 6)}) rotate(${f1(roll)})`}>
        <path d="M-200,0 L200,0 L160,70 L-150,70Z" fill="#1a1410" stroke="#3a2a1a" strokeWidth={3} />
        <path d="M-200,0 L-230,-30 L-180,-6Z" fill="#1a1410" />
        {[-90, 30, 130].map((mx, i) => (
          <g key={i}>
            <line x1={mx} y1={0} x2={mx} y2={-360 + i * 40} stroke="#2a1e14" strokeWidth={7} />
            <path d={`M${mx - 90 + i * 10},${-330 + i * 40} Q${mx + 4},${f1(-300 + i * 40 + Math.sin(t + i) * 6)} ${mx + 80 - i * 10},${-330 + i * 40} L${mx + 74 - i * 10},${-170 + i * 30} Q${mx},${f1(-150 + i * 30 + Math.sin(t + i) * 6)} ${mx - 84 + i * 10},${-170 + i * 30}Z`} fill="#c8b890" opacity={0.85} />
          </g>
        ))}
        {/* farol y marineros */}
        <circle cx={150} cy={-20} r={40} fill="#e8b86d" opacity={0.25 + 0.05 * Math.sin(t * 5)} />
        <circle cx={150} cy={-20} r={7} fill="#ffd27a" />
        {[100, 125, 170].map((sx, i) => (
          <g key={`m${i}`} transform={`translate(${sx} -16)`}>
            <circle cx={0} cy={-26} r={6} fill="#0a0806" />
            <path d="M-6,-20 L6,-20 L5,0 L-5,0Z" fill="#0a0806" />
            {i === 2 && <path d="M4,-18 L18,-26" stroke="#0a0806" strokeWidth={3} />}
          </g>
        ))}
      </g>
    </g>
  );
};

/** Costa estilizada (grabado original, no copia de obras existentes). */
export const JapanCoast: React.FC<{t: number; quake: number; k?: number}> = ({t, quake, k = 1}) => {
  const sea = 1020;
  return (
    <g opacity={k}>
      <rect width={1080} height={1920} fill="#efe3c6" />
      {Array.from({length: 120}, (_, i) => (
        <circle key={i} cx={hash1(i * 3) * 1080} cy={hash1(i * 5) * 1920} r={1 + hash1(i) * 2} fill="#c8b48a" opacity={0.35} />
      ))}
      {/* sol rojo y montañas a tinta */}
      <circle cx={850} cy={560} r={80} fill="#d63847" opacity={0.85} />
      <path d="M-40,760 L180,420 L300,560 L470,330 L700,700 L860,520 L1120,780 L1120,900 L-40,900Z" fill="#5a6a78" opacity={0.55} />
      <path d="M-40,840 L240,560 L420,760 L640,520 L900,820 L1120,700 L1120,960 L-40,960Z" fill="#3a4a58" opacity={0.75} />
      <path d="M440,345 L470,330 L500,350" stroke="#ffffff" strokeWidth={10} fill="none" opacity={0.8} />
      {/* costa con pinos y casas */}
      <path d="M-20,960 Q200,930 420,970 Q520,990 560,1020 L-20,1020Z" fill="#6a5a3a" />
      {[60, 150, 250].map((px, i) => (
        <g key={i} transform={`translate(${px} ${950 - i * 4})`}>
          <line x1={0} y1={0} x2={6 + Math.sin(t + i) * 2} y2={-90} stroke="#3a2a1a" strokeWidth={6} />
          {[0, 1, 2].map((j) => (
            <ellipse key={j} cx={6 + j * 8 - 8} cy={-90 + j * 22} rx={42 - j * 6} ry={12} fill="#2a4a3a" />
          ))}
        </g>
      ))}
      {[330, 400].map((hx, i) => (
        <g key={`h${i}`} transform={`translate(${hx} 975)`}>
          <rect x={-26} y={-30} width={52} height={30} fill="#d8c8a0" stroke="#3a2a1a" strokeWidth={2} />
          <path d="M-34,-30 L0,-52 L34,-30Z" fill="#4a3a2a" />
        </g>
      ))}
      {/* mar con olas lineales */}
      <rect x={0} y={sea} width={1080} height={900} fill="#2a5a7a" />
      {Array.from({length: 10}, (_, i) => (
        <path key={i} d={wave(-20, 1100, sea + 20 + i * 70, t * 0.8 + i, 10, 0.016, i * 0.7)} stroke="#e8f0f0" strokeWidth={3} fill="none" opacity={0.65 - i * 0.04} />
      ))}
      {/* ondas sísmicas SIMBÓLICAS bajo la costa */}
      {quake > 0.01 &&
        [0, 1, 2, 3].map((i) => {
          const ph = ((t * 0.35 + i / 4) % 1 + 1) % 1;
          return <path key={`q${i}`} d={`M${f1(200 - ph * 400)},1560 Q200,${f1(1560 - 380 * ph - 60)} ${f1(200 + ph * 400)},1560`} stroke="#d63847" strokeWidth={5} fill="none" strokeDasharray="16 14" opacity={quake * (1 - ph)} />;
        })}
      {/* pez remo junto a la superficie, en estilo de tinta */}
      <Oarfish uid="jp" p={oarPose({x: 1000, y: sea + 120, scale: 0.36, t, sCurve: 60, light: 0.95, tint: '#efe3c6', finSpeed: 2.6})} />
      <rect x={0} y={0} width={1080} height={1920} fill="none" stroke="#3a2a1a" strokeWidth={18} />
    </g>
  );
};

/** Mito frente a evidencia: gráfico ILUSTRATIVO sin datos reales. */
export const MythVsEvidence: React.FC<{t: number; u: number; k: number}> = ({t, u, k}) => {
  if (k < 0.01) return null;
  const sight = [0.12, 0.31, 0.47, 0.66, 0.83];
  const quake = [0.22, 0.39, 0.58, 0.74, 0.93];
  const X = (v: number) => lerp(150, 930, v);
  return (
    <g opacity={k}>
      <rect x={60} y={300} width={460} height={420} rx={26} fill="rgba(80,40,30,0.55)" stroke="rgba(232,184,109,0.6)" strokeWidth={2} />
      <T x={290} y={360} s={34} c="#e8b86d">MITO</T>
      <T x={290} y={420} s={22} w={700}>«si aparece, anuncia</T>
      <T x={290} y={452} s={22} w={700}>un terremoto»</T>
      <g transform="translate(290 590)">
        <path d="M-120,0 Q-60,-26 0,-6 Q60,10 120,-4" stroke="#dce7ec" strokeWidth={10} fill="none" strokeLinecap="round" />
        {[0, 1, 2].map((i) => (
          <circle key={i} r={40 + i * 30 + (t * 20) % 30} fill="none" stroke="#d63847" strokeWidth={3} strokeDasharray="10 8" opacity={0.6 - i * 0.15} />
        ))}
      </g>
      <rect x={560} y={300} width={460} height={420} rx={26} fill="rgba(10,40,70,0.65)" stroke="rgba(59,203,214,0.6)" strokeWidth={2} />
      <T x={790} y={360} s={34} c="#3bcbd6">EVIDENCIA</T>
      <T x={790} y={420} s={22} w={700}>estudios con registros:</T>
      <T x={790} y={452} s={22} w={700}>sin relación sólida</T>
      <path d="M750,560 L782,592 L840,524" stroke="#3bcbd6" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* gráfico ilustrativo */}
      <rect x={60} y={760} width={960} height={420} rx={26} fill="rgba(2,10,24,0.72)" stroke="rgba(191,232,255,0.35)" strokeWidth={2} />
      <line x1={140} y1={1080} x2={940} y2={1080} stroke="#bfe8ff" strokeWidth={3} />
      <T x={540} y={1130} s={20} w={700} c="#bfe8ff">tiempo →</T>
      <T x={150} y={850} s={22} a="start" c="#dce7ec">apariciones del pez</T>
      <T x={150} y={990} s={22} a="start" c="#ff8a96">sismos</T>
      {sight.map((v, i) => (
        <g key={`s${i}`} opacity={clamp(u * 6 - i)} transform={`translate(${f1(X(v))} 900)`}>
          <path d="M-26,0 Q-10,-8 10,-2 Q20,0 26,-3" stroke="#dce7ec" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {quake.map((v, i) => (
        <g key={`q${i}`} opacity={clamp(u * 6 - i - 0.5)}>
          <circle cx={X(v)} cy={1030} r={12} fill="none" stroke="#ff8a96" strokeWidth={3} />
          <circle cx={X(v)} cy={1030} r={22} fill="none" stroke="#ff8a96" strokeWidth={2} opacity={0.5} />
        </g>
      ))}
      <T x={540} y={1166} s={18} w={700} c="#e8b86d" it>gráfico ilustrativo · no representa datos reales</T>
    </g>
  );
};
