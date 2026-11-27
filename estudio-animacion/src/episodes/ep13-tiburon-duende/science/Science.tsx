// GRÁFICOS CIENTÍFICOS del episodio (pantalla 1080×1920). Son RECREACIONES EDUCATIVAS:
//  · DepthScale     — escala de profundidad ilustrativa con zonas y franja de hábitat frecuente.
//  · ElectroField   — visualización de un campo eléctrico débil (invisible en la realidad).
//  · JawSideOverlay — vista lateral anatómica: posición retraída vs proyectada.
//  · SizeChart      — comparación de tamaño con una persona.
//  · Lineage        — línea temporal del linaje (sin afirmar que la especie no haya cambiado).
//  · ChannelEnd     — logotipo y lema del cierre.
import React from 'react';
import {clamp, easeInOut, hash1, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {HumanSilhouette} from '../character/DeepPrey';
import {GoblinShark, sharkPose} from '../character/GoblinShark';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode; it?: boolean; op?: number}> = ({x, y, s = 28, c = '#ffffff', w = 800, a = 'middle', children, it, op = 1}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={FONT_FAMILY} fontWeight={w} fontSize={s} fill={c} fontStyle={it ? 'italic' : 'normal'} opacity={op} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.6)" strokeWidth={4}>
    {children}
  </text>
);

/** Escala de profundidad (izquierda). `m` = profundidad actual en metros (ilustrativa). */
export const DepthScale: React.FC<{m: number; k: number}> = ({m, k}) => {
  if (k < 0.01) return null;
  const y0 = 300;
  const y1 = 1240;
  const max = 1200;
  const Y = (v: number) => lerp(y0, y1, v / max);
  return (
    <g opacity={k}>
      <rect x={60} y={y0 - 50} width={300} height={y1 - y0 + 110} rx={22} fill="rgba(2,10,24,0.6)" />
      <line x1={120} y1={y0} x2={120} y2={y1} stroke="#bfe8ff" strokeWidth={4} />
      {[0, 200, 400, 600, 800, 1000, 1200].map((v) => (
        <g key={v}>
          <line x1={110} y1={Y(v)} x2={130} y2={Y(v)} stroke="#bfe8ff" strokeWidth={3} />
          <T x={140} y={Y(v) + 9} s={24} a="start" w={700}>{`${v.toLocaleString('es')} m`}</T>
        </g>
      ))}
      <rect x={232} y={Y(0)} width={14} height={Y(200) - Y(0)} fill="#5ad8ff" opacity={0.7} />
      <rect x={232} y={Y(200)} width={14} height={Y(1000) - Y(200)} fill="#3a5aa8" opacity={0.8} />
      <rect x={232} y={Y(1000)} width={14} height={Y(1200) - Y(1000)} fill="#1a1a4a" opacity={0.9} />
      <T x={256} y={Y(80)} s={18} a="start" w={700} c="#9ff4ff">iluminada</T>
      <T x={256} y={Y(560)} s={18} a="start" w={700} c="#a8b8ff">crepuscular</T>
      {/* franja de hábitat frecuente (aproximada) */}
      <rect x={96} y={Y(250)} width={8} height={Y(950) - Y(250)} rx={4} fill="#ff9ab0" opacity={0.9} />
      <T x={210} y={y1 + 40} s={18} w={700} c="#ff9ab0">rosa: hábitat frecuente (aprox.)</T>
      <circle cx={120} cy={Y(Math.min(max, m))} r={12} fill="#ffd23f" stroke="#3a2a00" strokeWidth={3} />
      <T x={210} y={y0 - 16} s={18} w={600} c="#bfe8ff" it>escala ilustrativa</T>
    </g>
  );
};

/** Campo eléctrico débil de una presa: líneas equipotenciales discontinuas que laten (recreación). */
export const ElectroField: React.FC<{x: number; y: number; t: number; k: number; r?: number}> = ({x, y, t, k, r = 1}) =>
  k > 0.01 ? (
    <g opacity={k}>
      {[0, 1, 2, 3, 4].map((i) => {
        const ph = ((t * 0.5 + i / 5) % 1 + 1) % 1;
        return <ellipse key={i} cx={x} cy={y} rx={(40 + ph * 260) * r} ry={(26 + ph * 170) * r} fill="none" stroke="#7ff3ff" strokeWidth={3} strokeDasharray="10 12" opacity={0.7 * (1 - ph)} />;
      })}
      {Array.from({length: 10}, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <path key={`l${i}`} d={`M${f1(x + Math.cos(a) * 30 * r)},${f1(y + Math.sin(a) * 20 * r)} Q${f1(x + Math.cos(a + 0.4) * 140 * r)},${f1(y + Math.sin(a + 0.4) * 100 * r)} ${f1(x + Math.cos(a) * 240 * r)},${f1(y + Math.sin(a) * 160 * r)}`} stroke="#7ff3ff" strokeWidth={1.5} fill="none" opacity={0.25} />;
      })}
    </g>
  ) : null;

/** Rótulo de recreación (aclara que el campo no es visible). */
export const RecreationTag: React.FC<{k: number; text: string; y?: number}> = ({k, text, y = 1268}) =>
  k > 0.01 ? (
    <g opacity={k}>
      <rect x={170} y={y - 34} width={740} height={50} rx={16} fill="rgba(2,10,24,0.7)" stroke="rgba(127,243,255,0.5)" />
      <T x={540} y={y} s={24} w={700} c="#9ff4ff">{text}</T>
    </g>
  ) : null;

/** Comparación de tamaño: persona (~1,75 m) y silueta del tiburón (adultos frecuentes ~3–4 m). */
export const SizeChart: React.FC<{k: number; t: number}> = ({k, t}) => {
  if (k < 0.01) return null;
  const pxm = 250 / 1.75; // píxeles por metro (persona de 1,75 m = 250 px)
  const base = 1100;
  const sharkL = 3.5 * pxm; // tiburón de 3,5 m a la MISMA escala
  const g = easeInOut(clamp(k * 1.4));
  return (
    <g opacity={k}>
      <rect x={60} y={560} width={960} height={640} rx={28} fill="rgba(2,10,24,0.78)" stroke="rgba(191,232,255,0.4)" strokeWidth={2} />
      <T x={540} y={630} s={34}>Tamaño aproximado</T>
      <line x1={110} y1={base} x2={970} y2={base} stroke="#bfe8ff" strokeWidth={2} opacity={0.5} />
      <HumanSilhouette x={190} y={base} h={250} />
      <T x={190} y={base + 44} s={22} w={700}>persona ~1,75 m</T>
      <g opacity={g}>
        <GoblinShark uid="size" p={sharkPose({x: 330 + sharkL / 2, y: base - 80, scale: sharkL / 670, t, beat: t * 2, exposure: 0.95, rim: 0.5})} />
      </g>
      <T x={300 + sharkL * 0.5} y={base + 44} s={22} w={700} c="#ffb8c8">tiburón duende adulto ~3–4 m (aprox.)</T>
    </g>
  );
};

/** Línea temporal del linaje (simplificada). */
export const Lineage: React.FC<{u: number; t: number; k: number}> = ({u, t, k}) => {
  if (k < 0.01) return null;
  const y = 860;
  const marks = [
    {x: 160, label: 'Cretácico', sub: 'más de 100 M de años', note: 'fósiles de su familia'},
    {x: 470, label: 'Paleógeno', sub: '66–23 M de años', note: 'parientes extintos'},
    {x: 900, label: 'Hoy', sub: 'Mitsukurina owstoni', note: 'única especie viva de su familia'},
  ];
  return (
    <g opacity={k}>
      <rect x={50} y={480} width={980} height={720} rx={28} fill="rgba(2,10,24,0.78)" stroke="rgba(191,232,255,0.4)" strokeWidth={2} />
      <T x={540} y={550} s={36}>Un linaje antiguo</T>
      <line x1={120} y1={y} x2={lerp(120, 960, clamp(u))} y2={y} stroke="#bfe8ff" strokeWidth={5} strokeLinecap="round" />
      {marks.map((m, i) => {
        const on = clamp((u - i * 0.33) * 4);
        return (
          <g key={m.label} opacity={on}>
            <circle cx={m.x} cy={y} r={14} fill={i === 2 ? '#ff9ab0' : '#9ff4ff'} />
            <path transform={`translate(${m.x} ${y - 110}) scale(${0.9 + i * 0.1})`} d={`M-70,0 Q-30,-22 30,-14 L60,-24 Q70,-14 58,-8 Q20,${f1(16 + Math.sin(t + i) * 2)} -70,0 L-92,-16 L-88,10Z`} fill={i === 2 ? '#d8a0ac' : '#6a8aa8'} opacity={i === 2 ? 0.95 : 0.55} />
            <T x={m.x} y={y + 54} s={26}>{m.label}</T>
            <T x={m.x} y={y + 86} s={20} w={600} c="#bfe8ff" it={i === 2}>{m.sub}</T>
            <T x={m.x} y={y + 116} s={18} w={600} c="#ffd27a">{m.note}</T>
          </g>
        );
      })}
      <T x={540} y={1150} s={22} w={700} c="#ffb8c8" op={clamp((u - 0.8) * 5)}>la especie actual no es idéntica a sus antepasados</T>
    </g>
  );
};

/** Logotipo final. */
export const ChannelEnd: React.FC<{k: number; t: number; tagline: number}> = ({k, t, tagline}) =>
  k > 0.01 ? (
    <g opacity={k} transform={`translate(540 760) scale(${f1(0.92 + 0.08 * k)})`}>
      <circle r={120} fill="rgba(4,14,40,0.88)" stroke="#9ff4ff" strokeWidth={6} />
      <path d={`M-80,10 Q-40,${f1(-30 + Math.sin(t * 2) * 6)} 0,10 T80,10`} stroke="#9ff4ff" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M-80,46 Q-40,${f1(6 + Math.sin(t * 2 + 1) * 6)} 0,46 T80,46`} stroke="#2a6cf0" strokeWidth={10} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-46} r={22} fill="#ffd23f" />
      <T x={0} y={200} s={64} w={900}>MUNDO INSÓLITO</T>
      <T x={0} y={256} s={34} w={700} c="#9ff4ff">D O C U M E N T A L E S</T>
      <T x={0} y={360} s={40} w={900} c="#ffd23f" op={tagline}>DESCUBRE LO QUE PARECE IMPOSIBLE</T>
    </g>
  ) : null;

export const _h = hash1;
