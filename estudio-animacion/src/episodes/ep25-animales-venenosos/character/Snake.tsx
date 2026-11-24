// MOTOR DE SERPIENTES (2.5D, cámara elevada 3/4).
// El suelo se proyecta: un punto (gx, gz) del terreno va a (gx, gz·0,42) en pantalla y la altura h resta
// en y. Así la ondulación LATERAL (en gz) se lee como una curva en pantalla y la parte anterior puede
// alzarse. Columna de N puntos: la porción delantera se eleva (`raise`) formando una «S»; el resto
// serpentea sobre el suelo o se enrolla en espiral (`coil`). Escamas/dibujos se colocan sobre la normal
// local y se deforman con el cuerpo. Cabeza articulada: mandíbula que se abre (interior de la boca según
// especie), colmillos plegables en víboras, lengua bífida que entra y sale, capucha cervical (cobras),
// cuernos nasales (víbora de Gabón) y cascabel segmentado que vibra.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline} from '../../../lifecycle/stages';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const N = 64;
const Y = 0.42; // proyección del plano del suelo

export type SnakeSpec = {
  len: number; // longitud del cuerpo (u)
  width: number; // semiancho máximo
  base: string;
  dark: string;
  belly: string;
  pattern: 'bands' | 'chevrons' | 'diamonds' | 'gaboon' | 'plain' | 'speckle';
  patA: string;
  patB?: string;
  head: 'cobra' | 'mamba' | 'taipan' | 'viper';
  mouth: string; // color del interior de la boca
  hood?: boolean;
  rattle?: boolean;
  horns?: boolean;
  fangs?: 'front' | 'long';
  headDark?: string;
};

export type SnakePose = {
  t: number;
  travel: number; // fase de la onda de reptación (avanza con el tiempo)
  amp?: number; // amplitud lateral 0…1
  raise?: number; // 0…1 parte anterior alzada
  coil?: number; // 0…1 enrollada
  hood?: number; // 0…1 capucha desplegada
  jaw?: number; // 0…1 boca abierta
  tongue?: number; // 0…1 lengua fuera
  look?: number; // giro de la cabeza (rad)
  rattle?: number; // 0…1 vibración del cascabel
  breathe?: number; // 0…1 respiración (víbora en reposo)
  strike?: number; // 0…1 avance defensivo breve de la cabeza
};

/** Centro del cuerpo en coordenadas locales (cabeza en s = 0). La serpiente avanza hacia +x. */
export function snakeSpine(spec: SnakeSpec, p: SnakePose) {
  const L = spec.len;
  const raise = clamp(p.raise ?? 0);
  const coil = clamp(p.coil ?? 0);
  const amp = (p.amp ?? 0.6) * L * 0.06;
  const rLen = raise * 0.3 * L; // longitud alzada
  const pts: V[] = [];
  const hs: number[] = [];
  for (let i = 0; i < N; i++) {
    const s = i / (N - 1);
    const d = s * L; // distancia desde la cabeza
    // sobre el suelo: serpentina (gx hacia atrás, gz lateral)
    let gx = -d;
    let gz = Math.sin(p.travel - d / (L * 0.28) * Math.PI) * amp * clamp(d / (L * 0.12));
    // enrollada: espiral alrededor de un punto detrás de la cabeza
    if (coil > 0) {
      const a = d / (L * 0.11) + 0.6;
      const r = L * 0.13 * (0.35 + 0.65 * (1 - s));
      const cx = -L * 0.14;
      const sx = cx + Math.cos(a) * r;
      const sz = Math.sin(a) * r * 1.3;
      gx = lerp(gx, sx, coil);
      gz = lerp(gz, sz, coil);
    }
    let h = 0;
    if (d < rLen) {
      // porción alzada: «S» vertical; la cabeza queda arriba mirando hacia delante
      const u = 1 - d / rLen;
      h = rLen * (0.92 * Math.sin((u * Math.PI) / 2)) * (1 + (p.strike ?? 0) * 0.12);
      gx = -rLen * 0.18 * Math.sin(u * Math.PI) + (p.strike ?? 0) * u * L * 0.08;
      gz = 0;
    } else if (raise > 0) {
      gx += rLen * 0.82;
    }
    pts.push({x: gx, y: gz * Y - h});
    hs.push(h);
  }
  return {pts, hs};
}

const widthAt = (spec: SnakeSpec, s: number, hood: number) => {
  const neck = s < 0.06 ? 0.55 + 0.45 * (s / 0.06) : 1;
  const tail = s > 0.78 ? Math.pow(1 - (s - 0.78) / 0.22, 0.9) * 0.9 + 0.1 : 1;
  const body = 0.75 + 0.25 * Math.sin(Math.PI * Math.min(1, s * 1.4));
  let w = spec.width * neck * tail * body;
  if (spec.hood && hood > 0 && s > 0.02 && s < 0.2) {
    const k = Math.sin(((s - 0.02) / 0.18) * Math.PI);
    w += spec.width * 2.1 * hood * k;
  }
  return Math.max(1.2, w);
};

export const Snake: React.FC<{spec: SnakeSpec; pose: SnakePose; uid: string; x: number; y: number; scale?: number; dir?: 1 | -1; tone?: number; reveal?: number}> = ({spec, pose, uid, x, y, scale = 1, dir = 1, tone = 0, reveal = 1}) => {
  const C = (c: string) => mixColor(c, '#06080a', tone * 0.8);
  const {pts, hs} = snakeSpine(spec, pose);
  const hood = clamp(pose.hood ?? 0);
  const nor = pts.map((q, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    return {x: -dy / l, y: dx / l};
  });
  const ws = pts.map((_, i) => widthAt(spec, i / (N - 1), hood));
  const L1 = pts.map((q, i) => ({x: q.x + nor[i].x * ws[i], y: q.y + nor[i].y * ws[i]}));
  const R1 = pts.map((q, i) => ({x: q.x - nor[i].x * ws[i], y: q.y - nor[i].y * ws[i]}));
  const body = closedSpline([...L1.slice(2), ...[...R1.slice(2)].reverse()], 0.9);
  // sombra de contacto en el suelo (solo la parte apoyada)
  const shadow = pts.map((q, i) => ({x: q.x, y: q.y + hs[i] + ws[i] * 0.6}));
  // cabeza
  const h0 = pts[1];
  const h1 = pts[4];
  const ang = Math.atan2(h0.y - h1.y, h0.x - h1.x) + (pose.look ?? 0);
  const HL = spec.width * (spec.head === 'viper' ? (spec.horns ? 2.4 : 2.9) : spec.head === 'mamba' ? 3.3 : 2.9);
  const HW = spec.width * (spec.head === 'viper' ? (spec.horns ? 1.25 : 1.55) : spec.head === 'taipan' ? 1.3 : 1.15);
  const jaw = clamp(pose.jaw ?? 0);
  const gid = `${uid}-g`;
  const patN = Math.round(spec.len / (spec.width * 2.6));
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(scale * dir)} ${f1(scale)})`} opacity={reveal}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C(mixColor(spec.base, '#ffffff', 0.12))} />
          <stop offset="0.55" stopColor={C(spec.base)} />
          <stop offset="1" stopColor={C(spec.dark)} />
        </linearGradient>
        <clipPath id={`${uid}-c`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={shadow.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke="#000" strokeWidth={spec.width * 1.6} strokeLinecap="round" fill="none" opacity={0.22} />
      <path d={body} fill={`url(#${gid})`} stroke={C(spec.dark)} strokeWidth={2} />
      <g clipPath={`url(#${uid}-c)`}>
        {/* vientre (escamas ventrales) visible en la parte alzada */}
        {pts.map((q, i) => (hs[i] > 2 && i % 2 === 0 ? <path key={`v${i}`} d={`M${f1(L1[i].x)},${f1(L1[i].y)} L${f1(R1[i].x)},${f1(R1[i].y)}`} stroke={C(spec.belly)} strokeWidth={ws[i] * 0.5} opacity={0.55} /> : null))}
        {/* dibujos de la especie, colocados sobre la normal local */}
        {Array.from({length: patN}, (_, k) => {
          const s = 0.07 + (k / patN) * 0.9;
          const i = Math.min(N - 2, Math.round(s * (N - 1)));
          const q = pts[i];
          const n = nor[i];
          const w = ws[i];
          const tx = -n.y;
          const ty = n.x;
          if (spec.pattern === 'bands' || spec.pattern === 'chevrons') {
            const c = spec.pattern === 'chevrons' ? w * 0.5 : 0;
            return <path key={k} d={`M${f1(q.x + n.x * w - tx * c)},${f1(q.y + n.y * w - ty * c)} L${f1(q.x)},${f1(q.y)} L${f1(q.x - n.x * w - tx * c)},${f1(q.y - n.y * w - ty * c)}`} stroke={C(spec.patA)} strokeWidth={w * 0.35} fill="none" opacity={0.85} />;
          }
          if (spec.pattern === 'diamonds') {
            const a = w * 1.1;
            return (
              <g key={k}>
                <path d={`M${f1(q.x + tx * a)},${f1(q.y + ty * a)} L${f1(q.x + n.x * w * 0.85)},${f1(q.y + n.y * w * 0.85)} L${f1(q.x - tx * a)},${f1(q.y - ty * a)} L${f1(q.x - n.x * w * 0.85)},${f1(q.y - n.y * w * 0.85)}Z`} fill={C(spec.patA)} stroke={C(spec.patB ?? '#e8dcc0')} strokeWidth={w * 0.12} opacity={0.9} />
              </g>
            );
          }
          if (spec.pattern === 'gaboon') {
            const a = w * 1.05;
            return (
              <g key={k} opacity={0.92}>
                <path d={`M${f1(q.x + tx * a)},${f1(q.y + ty * a)} L${f1(q.x + n.x * w * 0.4)},${f1(q.y + n.y * w * 0.4)} L${f1(q.x - tx * a)},${f1(q.y - ty * a)} L${f1(q.x - n.x * w * 0.4)},${f1(q.y - n.y * w * 0.4)}Z`} fill={C(spec.patA)} />
                <path d={`M${f1(q.x + n.x * w * 0.5 + tx * a * 0.5)},${f1(q.y + n.y * w * 0.5 + ty * a * 0.5)} l${f1(n.x * w * 0.5)},${f1(n.y * w * 0.5)} l${f1(-tx * a)},${f1(-ty * a)}Z`} fill={C(spec.patB ?? '#3a2a1a')} />
                <path d={`M${f1(q.x - n.x * w * 0.5 + tx * a * 0.5)},${f1(q.y - n.y * w * 0.5 + ty * a * 0.5)} l${f1(-n.x * w * 0.5)},${f1(-n.y * w * 0.5)} l${f1(-tx * a)},${f1(-ty * a)}Z`} fill={C(spec.patB ?? '#3a2a1a')} />
              </g>
            );
          }
          if (spec.pattern === 'speckle') {
            return <circle key={k} cx={q.x + n.x * w * (hash1(k) - 0.5)} cy={q.y + n.y * w * (hash1(k) - 0.5)} r={w * 0.18} fill={C(spec.patA)} opacity={0.6} />;
          }
          return null;
        })}
        {/* escamas: retícula fina que acompaña la deformación */}
        {pts.map((q, i) => (i % 2 === 1 ? <path key={`e${i}`} d={`M${f1(L1[i].x)},${f1(L1[i].y)} Q${f1(q.x + (pts[i - 1].x - q.x) * 0.6)},${f1(q.y + (pts[i - 1].y - q.y) * 0.6)} ${f1(R1[i].x)},${f1(R1[i].y)}`} stroke={C(spec.dark)} strokeWidth={0.8} fill="none" opacity={0.35} /> : null))}
        {/* brillo dorsal */}
        <path d={pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x - nor[i].x * ws[i] * 0.4)},${f1(q.y - nor[i].y * ws[i] * 0.4)}`).join(' ')} stroke="#ffffff" strokeWidth={spec.width * 0.3} fill="none" opacity={0.14 * (1 - tone)} />
        {/* marcas de la capucha (cobra real: bandas en chevron) */}
        {spec.hood && hood > 0.05 && [0.06, 0.09, 0.12].map((s, k) => {
          const i = Math.round(s * (N - 1));
          return <path key={`h${k}`} d={`M${f1(L1[i].x)},${f1(L1[i].y)} Q${f1(pts[i].x + 6)},${f1(pts[i].y)} ${f1(R1[i].x)},${f1(R1[i].y)}`} stroke={C('#f0e0a0')} strokeWidth={3} fill="none" opacity={0.6 * hood} />;
        })}
      </g>
      {spec.rattle && <Rattle pts={pts} ws={ws} buzz={pose.rattle ?? 0} t={pose.t} C={C} />}
      <SnakeHead at={pts[0]} ang={ang} HL={HL} HW={HW} spec={spec} jaw={jaw} tongue={pose.tongue ?? 0} t={pose.t} C={C} />
    </g>
  );
};

const Rattle: React.FC<{pts: V[]; ws: number[]; buzz: number; t: number; C: (c: string) => string}> = ({pts, ws, buzz, t, C}) => {
  const e = pts[N - 1];
  const p = pts[N - 4];
  const a = Math.atan2(e.y - p.y, e.x - p.x);
  const j = buzz * Math.sin(t * 2 * Math.PI * 55) * 4;
  return (
    <g transform={`translate(${f1(e.x)} ${f1(e.y - Math.abs(j) * 0.3)}) rotate(${f1((a * 180) / Math.PI + j * 3)})`}>
      {Array.from({length: 7}, (_, i) => <ellipse key={i} cx={i * ws[N - 6] * 0.9} cy={0} rx={ws[N - 6] * 0.62} ry={ws[N - 6] * (1 - i * 0.07)} fill={C(i % 2 ? '#c8b088' : '#a89068')} stroke={C('#5a4a30')} strokeWidth={1.2} />)}
    </g>
  );
};

const SnakeHead: React.FC<{at: V; ang: number; HL: number; HW: number; spec: SnakeSpec; jaw: number; tongue: number; t: number; C: (c: string) => string}> = ({at, ang, HL, HW, spec, jaw, tongue, t, C}) => {
  const tri = spec.head === 'viper';
  const top = tri
    ? `M0,${f1(-HW * 0.55)} C${f1(-HL * 0.35)},${f1(-HW * 1.05)} ${f1(-HL * 0.7)},${f1(-HW * 0.95)} ${f1(-HL * 0.95)},${f1(-HW * 0.25)} L${f1(-HL)},0 L${f1(-HL * 0.95)},${f1(HW * 0.25)} C${f1(-HL * 0.7)},${f1(HW * 0.95)} ${f1(-HL * 0.35)},${f1(HW * 1.05)} 0,${f1(HW * 0.55)}Z`
    : `M0,${f1(-HW * 0.6)} C${f1(-HL * 0.5)},${f1(-HW * 0.85)} ${f1(-HL * 0.85)},${f1(-HW * 0.7)} ${f1(-HL)},${f1(-HW * 0.25)} Q${f1(-HL * 1.06)},0 ${f1(-HL)},${f1(HW * 0.25)} C${f1(-HL * 0.85)},${f1(HW * 0.7)} ${f1(-HL * 0.5)},${f1(HW * 0.85)} 0,${f1(HW * 0.6)}Z`;
  // la cabeza mira hacia +x: hocico en x = 0, nuca en x = −HL
  const jawA = jaw * 0.9;
  const tl = tongue * HL * 0.9 * (0.75 + 0.25 * Math.sin(t * 30));
  const fork = HW * 0.22;
  const headC = C(spec.headDark ?? spec.base);
  return (
    <g transform={`translate(${f1(at.x)} ${f1(at.y)}) rotate(${f1((ang * 180) / Math.PI)}) translate(${f1(HL * 0.92)} 0)`}>
      {/* lengua bífida */}
      {tongue > 0.02 && <path d={`M${f1(-HL * 0.05)},${f1(HW * 0.1)} L${f1(tl * 0.8)},${f1(HW * 0.1)} l${f1(tl * 0.22)},${f1(-fork)} M${f1(tl * 0.8)},${f1(HW * 0.1)} l${f1(tl * 0.22)},${f1(fork)}`} stroke="#2a0e14" strokeWidth={HW * 0.12} strokeLinecap="round" fill="none" />}
      {/* mandíbula inferior */}
      <g transform={`translate(${f1(-HL * 0.85)} ${f1(HW * 0.2)}) rotate(${f1((jawA * 180) / Math.PI * 0.55)})`}>
        <path d={`M0,0 L${f1(HL * 0.82)},${f1(-HW * 0.05)} Q${f1(HL * 0.86)},${f1(HW * 0.25)} ${f1(HL * 0.7)},${f1(HW * 0.35)} L0,${f1(HW * 0.4)}Z`} fill={C(spec.belly)} stroke={C(spec.dark)} strokeWidth={1.5} />
        {jaw > 0.1 && <path d={`M${f1(HL * 0.05)},${f1(-HW * 0.02)} L${f1(HL * 0.8)},${f1(-HW * 0.06)} L${f1(HL * 0.6)},${f1(HW * 0.18)} L${f1(HL * 0.05)},${f1(HW * 0.2)}Z`} fill={C(spec.mouth)} />}
      </g>
      {/* interior de la boca (visible al abrir) */}
      {jaw > 0.1 && <path d={`M${f1(-HL * 0.85)},${f1(HW * 0.2)} L${f1(-HL * 0.05)},${f1(HW * 0.15)} L${f1(-HL * 0.4)},${f1(HW * 0.2 + jaw * HW * 1.1)}Z`} fill={C(spec.mouth)} />}
      {/* cabeza (hocico en x = 0) */}
      <path d={top} fill={headC} stroke={C(spec.dark)} strokeWidth={1.8} transform={`translate(${f1(-HL)} 0) scale(-1 1)`} />
      {/* colmillos (víboras: largos y plegables; elápidos: cortos fijos delanteros) */}
      {jaw > 0.15 && spec.fangs && (
        <path d={`M${f1(-HL * 0.12)},${f1(HW * 0.22)} q${f1(HL * 0.02)},${f1(HW * (spec.fangs === 'long' ? 0.9 : 0.35) * jaw)} ${f1(-HL * 0.06)},${f1(HW * (spec.fangs === 'long' ? 1.0 : 0.4) * jaw)}`} stroke="#f4efe4" strokeWidth={HW * 0.1} strokeLinecap="round" fill="none" />
      )}
      {/* escamas cefálicas, ojo, narina, labio */}
      <path d={`M${f1(-HL * 0.95)},${f1(-HW * 0.1)} Q${f1(-HL * 0.5)},${f1(-HW * 0.45)} ${f1(-HL * 0.08)},${f1(-HW * 0.15)}`} stroke={C(spec.dark)} strokeWidth={1} fill="none" opacity={0.5} />
      <path d={`M${f1(-HL * 0.95)},${f1(HW * 0.22)} L${f1(-HL * 0.05)},${f1(HW * 0.18)}`} stroke={C(spec.belly)} strokeWidth={HW * 0.12} opacity={0.8} />
      <circle cx={-HL * 0.32} cy={-HW * 0.18} r={HW * 0.2} fill="#0c0806" />
      <circle cx={-HL * 0.3} cy={-HW * 0.24} r={HW * 0.06} fill="#ffffff" opacity={0.7} />
      {tri && <path d={`M${f1(-HL * 0.5)},${f1(-HW * 0.35)} L${f1(-HL * 0.2)},${f1(-HW * 0.25)}`} stroke={C(spec.dark)} strokeWidth={HW * 0.08} />}
      <circle cx={-HL * 0.1} cy={-HW * 0.12} r={HW * 0.06} fill="#0c0806" />
      {spec.horns && [0, 1].map((i) => <path key={i} d={`M${f1(-HL * 0.06 - i * 6)},${f1(-HW * 0.3)} l${f1(4)},${f1(-HW * 0.45)} l${f1(4)},${f1(HW * 0.4)}Z`} fill={C(spec.patB ?? '#d8c8a8')} />)}
    </g>
  );
};
