// TARJETAS CIENTÍFICAS (formato vertical, zona segura entre y ≈ 330 y 1.430 para no tapar subtítulos):
// tamaño, contrasombreado, dientes, intercambiador de calor, migración Sudáfrica–Australia, café del tiburón
// blanco, hígado y estado de conservación. Ilustraciones simplificadas; posiciones de mapa aproximadas.
import React from 'react';
import {clamp, hash1, lerp, smoothPath, smoothstep} from '../../../engine/math';
import {Card, Txt} from './common';

const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);
const sharkSil = (x: number, y: number, len: number, col: string) => {
  const s = len / 1000;
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 0C-60 -60 -300 -130 -500 -120L-560 -260L-620 -110C-760 -90 -880 -40 -960 -10L-1080 -190L-1040 0L-1080 170L-960 10C-800 40 -560 90 -420 100L-480 220L-330 100C-200 90 -60 50 0 0Z" fill={col} />;
};

export const SizeCard: React.FC<{k: number; t: number}> = ({k}) => {
  const g = smoothstep(0.15, 0.55, k);
  const px = 140;
  const base = 1020;
  return (
    <Card k={k} title="MÁS DE 6 METROS" h={820}>
      <line x1={110} y1={base} x2={1000} y2={base} stroke="#4a7a9a" strokeWidth={2} />
      {Array.from({length: 7}, (_, i) => <g key={i}><line x1={120 + i * px} y1={base} x2={120 + i * px} y2={base + 14} stroke="#9fd8f0" strokeWidth={2} /><Txt x={120 + i * px} y={base + 46} s={24} a="middle" c="#9fd8f0">{i} m</Txt></g>)}
      <g transform={`translate(170 ${base})`}>
        <circle cx={0} cy={-1.75 * px + 18} r={18} fill="#e8d4b8" />
        <path d={`M-20 ${-1.75 * px + 40}L20 ${-1.75 * px + 40}L24 ${-1.75 * px * 0.45}L12 ${-1.75 * px * 0.45}L10 0L-10 0L-12 ${-1.75 * px * 0.45}L-24 ${-1.75 * px * 0.45}Z`} fill="#e8d4b8" />
        <Txt x={0} y={-1.75 * px - 16} s={24} a="middle">1,75 m</Txt>
      </g>
      <g opacity={g}>{sharkSil(120 + 6 * px * g, base - 400, 6 * px * g * 0.92, '#8a9aa6')}</g>
      <Txt x={540} y={500} s={30} a="middle" op={g}>las hembras suelen ser más grandes</Txt>
      <Txt x={540} y={1130} s={22} a="middle" c="#9fd8f0">representación ilustrada</Txt>
    </Card>
  );
};

export const ShadeCard: React.FC<{k: number; t: number}> = ({k, t}) => (
  <Card k={k} title="CONTRASOMBREADO" h={900}>
    <rect x={110} y={430} width={400} height={640} rx={22} fill="#0a2238" />
    <rect x={570} y={430} width={400} height={640} rx={22} fill="#8ad0f0" />
    <Txt x={310} y={470} s={24} a="middle" c="#9fd8f0">visto desde arriba</Txt>
    <Txt x={770} y={470} s={24} a="middle" c="#04203a">visto desde abajo</Txt>
    <g transform={`translate(310 ${780 + Math.sin(t) * 10}) rotate(90)`}><ellipse rx={180} ry={46} fill="#1e2e3e" opacity={0.9} /><path d="M-60 -40L-120 -100L-130 -40Z" fill="#1e2e3e" /></g>
    <g transform={`translate(770 ${780 + Math.sin(t + 1) * 10})`}><ellipse rx={180} ry={40} fill="#d8e8f0" opacity={0.92} /></g>
    <Txt x={310} y={1040} s={22} a="middle">lomo gris ≈ aguas oscuras</Txt>
    <Txt x={770} y={1040} s={22} a="middle" c="#04203a">vientre blanco ≈ luz</Txt>
  </Card>
);

export const TeethCard: React.FC<{k: number; t: number}> = ({k, t}) => {
  const mv = (t * 0.25) % 1;
  return (
    <Card k={k} title="DIENTES QUE SE REEMPLAZAN" h={900}>
      {[0, 1, 2, 3].map((r) => (
        <g key={r} opacity={1 - r * 0.2}>
          {Array.from({length: 7}, (_, i) => {
            const x = 170 + i * 70;
            const y = 560 + r * 90 - mv * 90 * (r > 0 ? 1 : 0);
            return <path key={i} d={`M${x - 26} ${f1(y)}L${x} ${f1(y - 70 + r * 8)}L${x + 26} ${f1(y)}Z`} fill="#f4f0e4" stroke="#a8a090" strokeWidth={2} />;
          })}
        </g>
      ))}
      <path d="M720 900L720 560" stroke="#ffd23f" strokeWidth={6} />
      <path d="M720 545l-14 24l28 0Z" fill="#ffd23f" />
      <Txt x={740} y={740} s={24}>las filas de</Txt>
      <Txt x={740} y={772} s={24}>reserva avanzan</Txt>
      {/* diente aserrado ampliado */}
      <g transform="translate(540 1110)">
        <path d={`M-90 0L0 -180L90 0Z`} fill="#f4f0e4" stroke="#a8a090" strokeWidth={3} />
        {Array.from({length: 12}, (_, i) => {
          const u = (i + 0.5) / 12;
          return <g key={i}><path d={`M${f1(-90 + u * 90)} ${f1(-u * 180)}l-8 4l4 6Z`} fill="#c8c0b0" /><path d={`M${f1(90 - u * 90)} ${f1(-u * 180)}l8 4l-4 6Z`} fill="#c8c0b0" /></g>;
        })}
      </g>
      <Txt x={540} y={1160} s={24} a="middle" c="#ffd23f">bordes aserrados</Txt>
    </Card>
  );
};

export const HeatCard: React.FC<{k: number; t: number}> = ({k, t}) => (
  <Card k={k} title="UN INTERCAMBIADOR DE CALOR" h={860}>
    <Txt x={540} y={460} s={26} a="middle" c="#9fd8f0">red de vasos sanguíneos (rete mirabile)</Txt>
    <rect x={160} y={560} width={760} height={60} rx={30} fill="#3a7ad8" />
    <rect x={160} y={700} width={760} height={60} rx={30} fill="#d84a3a" />
    {Array.from({length: 6}, (_, i) => {
      const ph = ((t * 0.5 + i / 6) % 1);
      return <circle key={i} cx={160 + ph * 760} cy={590} r={10} fill="#bfe0ff" />;
    })}
    {Array.from({length: 6}, (_, i) => {
      const ph = ((t * 0.5 + i / 6) % 1);
      return <circle key={`v${i}`} cx={920 - ph * 760} cy={730} r={10} fill="#ffd0a0" />;
    })}
    {Array.from({length: 7}, (_, i) => <path key={`a${i}`} d={`M${220 + i * 110} 690L${220 + i * 110} 630`} stroke="#ffd23f" strokeWidth={4} />)}
    {Array.from({length: 7}, (_, i) => <path key={`h${i}`} d={`M${220 + i * 110} 624l-8 14l16 0Z`} fill="#ffd23f" />)}
    <Txt x={180} y={540} s={22} c="#bfe0ff">sangre fría que entra desde las branquias →</Txt>
    <Txt x={900} y={800} s={22} a="end" c="#ffd0a0">← sangre caliente que sale de los músculos</Txt>
    <Txt x={540} y={900} s={26} a="middle">el calor pasa de una a otra</Txt>
    <Txt x={540} y={936} s={26} a="middle">y se queda dentro del cuerpo</Txt>
    <Txt x={540} y={1120} s={20} a="middle" c="#9fd8f0">esquema simplificado</Txt>
  </Card>
);

/** Mapa simplificado: viaje de una hembra marcada entre Sudáfrica y Australia (2003–2004). */
export const MigrationMap: React.FC<{k: number; t: number}> = ({k, t}) => {
  const P = (lon: number, lat: number) => ({x: 120 + ((lon - 8) / 150) * 840, y: 460 + (-lat / 46) * 540});
  const af = smoothPath([[12, -5], [40, -11], [40, -25], [33, -30], [25, -34.5], [18.5, -34.3], [17, -28], [12, -17]].map(([a, b]) => P(a, b)), true);
  const au = smoothPath([[114, -22], [122, -17], [136, -12], [145, -15], [153, -25], [150, -37], [140, -38], [130, -32], [117, -35], [113, -27]].map(([a, b]) => P(a, b)), true);
  const path: [number, number][] = [[20, -35.5], [40, -40], [70, -42], [100, -39], [115, -34.5]];
  const go = smoothstep(0.15, 0.55, k);
  const back = smoothstep(0.55, 0.9, k);
  const pts = path.map(([a, b]) => P(a, b));
  const n1 = Math.max(2, Math.round(pts.length * go));
  const rpts = [...pts].reverse().map((q) => ({x: q.x, y: q.y + 40}));
  const n2 = Math.max(2, Math.round(rpts.length * back));
  return (
    <Card k={k} title="UN VIAJE ENORME" h={760}>
      <rect x={100} y={430} width={880} height={600} rx={18} fill="#0a3a60" />
      <path d={af} fill="#5a8a6a" stroke="#9ac8a0" strokeWidth={2} />
      <path d={au} fill="#5a8a6a" stroke="#9ac8a0" strokeWidth={2} />
      <Txt x={P(26, -20).x} y={P(26, -20).y} s={24} a="middle" c="#d8f0d8">ÁFRICA</Txt>
      <Txt x={P(134, -26).x} y={P(134, -26).y} s={24} a="middle" c="#d8f0d8">AUSTRALIA</Txt>
      <Txt x={P(80, -20).x} y={P(80, -20).y} s={24} a="middle" c="#7ab8e0" w={600}>océano Índico</Txt>
      <path d={smoothPath(pts.slice(0, n1))} stroke="#ffd23f" strokeWidth={5} fill="none" strokeDasharray="14 8" />
      {back > 0.01 && <path d={smoothPath(rpts.slice(0, n2))} stroke="#ff9a6a" strokeWidth={5} fill="none" strokeDasharray="14 8" />}
      <circle cx={P(20, -35.5).x} cy={P(20, -35.5).y} r={10 + Math.sin(t * 3) * 3} fill="#ffd23f" />
      <Txt x={540} y={1080} s={24} a="middle" c="#ffe8a0">ida y vuelta en menos de un año (2003–2004)</Txt>
      <Txt x={540} y={1112} s={20} a="middle" c="#9fd8f0">mapa simplificado · ruta aproximada</Txt>
    </Card>
  );
};

/** Pacífico Norte: zona de mar abierto apodada «café del tiburón blanco». */
export const CafeMap: React.FC<{k: number; t: number}> = ({k, t}) => {
  const P = (lon: number, lat: number) => ({x: 110 + ((lon + 165) / 55) * 860, y: 1000 - ((lat - 15) / 25) * 520});
  const coast = smoothPath([[-124, 40], [-122, 37.5], [-120.5, 34.5], [-117, 32.5], [-114, 29], [-110, 24], [-109, 23], [-110, 40]].map(([a, b]) => P(a, b)), true);
  const haw: [number, number][] = [[-155.5, 19.6], [-157, 20.9], [-158, 21.5], [-159.5, 22.1]];
  const cafe = P(-137, 23);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2);
  return (
    <Card k={k} title="EL «CAFÉ» DEL TIBURÓN BLANCO" h={760}>
      <rect x={100} y={430} width={880} height={600} rx={18} fill="#0a3a60" />
      <path d={coast} fill="#5a8a6a" stroke="#9ac8a0" strokeWidth={2} />
      {haw.map(([a, b], i) => <circle key={i} cx={P(a, b).x} cy={P(a, b).y} r={8 - i} fill="#8ac89a" />)}
      <Txt x={P(-157, 19).x} y={P(-157, 19).y + 36} s={22} a="middle" c="#d8f0d8">Hawái</Txt>
      <Txt x={P(-117, 36).x - 20} y={P(-117, 36).y} s={22} a="end" c="#d8f0d8">California</Txt>
      <ellipse cx={cafe.x} cy={cafe.y} rx={120 + pulse * 10} ry={80 + pulse * 6} fill="#ffd23f" opacity={0.18 + 0.12 * pulse} stroke="#ffd23f" strokeWidth={3} />
      <Txt x={cafe.x} y={cafe.y + 8} s={22} a="middle" c="#ffe8a0">mar abierto</Txt>
      {Array.from({length: 4}, (_, i) => {
        const ph = ((t * 0.3 + i / 4) % 1);
        const a = P(-121, 36);
        return <circle key={i} cx={lerp(a.x, cafe.x, ph)} cy={lerp(a.y, cafe.y, ph)} r={6} fill="#ffffff" opacity={0.8 * (1 - ph)} />;
      })}
      <Txt x={540} y={1080} s={22} a="middle" c="#9fd8f0">Pacífico Norte · posiciones aproximadas</Txt>
    </Card>
  );
};

export const LiverCard: React.FC<{k: number}> = ({k}) => (
  <Card k={k} title="UN HÍGADO MUY RICO EN GRASAS" h={640}>
    {sharkSil(940, 760, 780, '#5a6a78')}
    <ellipse cx={560} cy={790} rx={180} ry={44} fill="#e8a838" stroke="#fff4c8" strokeWidth={3} />
    <Txt x={560} y={900} s={26} a="middle" c="#ffd890">hígado: reserva de energía</Txt>
    <Txt x={540} y={1010} s={20} a="middle" c="#9fd8f0">esquema · sin escala</Txt>
  </Card>
);

export const StatusCard: React.FC<{k: number}> = ({k}) => {
  const items: [string, string][] = [['madurez de las hembras', '≈ 30 años o más'], ['esperanza de vida', '≈ 70 años'], ['crías', 'pocas, nacen vivas'], ['estado (UICN)', 'VULNERABLE']];
  return (
    <Card k={k} title="CRECE DESPACIO" h={760}>
      {items.map(([a, b], i) => (
        <g key={i} opacity={smoothstep(0.1 + i * 0.15, 0.25 + i * 0.15, k)}>
          <rect x={130} y={450 + i * 150} width={820} height={120} rx={20} fill={i === 3 ? '#4a1a1a' : '#0a2238'} stroke={i === 3 ? '#ff8a6a' : '#7ad8ff'} strokeOpacity={0.5} />
          <Txt x={170} y={500 + i * 150} s={24} c="#9fd8f0">{a}</Txt>
          <Txt x={170} y={545 + i * 150} s={36} w={900} c={i === 3 ? '#ffb8a0' : '#ffffff'}>{b}</Txt>
        </g>
      ))}
    </Card>
  );
};
export const _k = {clamp, hash1};
