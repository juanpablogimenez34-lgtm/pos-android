// COMPONENTES CIENTÍFICOS (gráficos animados, coordenadas de pantalla 1080×1920):
//  · EyeDiagram: ojo compuesto con tres regiones y banda media; tipos de fotorreceptores; luz polarizada.
//  · ArtisticVision: interpretación artística (rotulada como tal) de señales visuales en el arrecife.
//  · SpringDiagram: resorte en forma de silla de montar + cierre (latch) que almacena y libera energía.
//  · SpeedCard: duración (~milisegundos) y velocidad (>20 m/s) del golpe.
//  · ClubOrbit: el mazo girando (representación tridimensional simulada).
//  · ClubSection: sección del mazo — región de impacto mineralizada, región periódica helicoidal,
//    región estriada — con una grieta que se desvía y se frena en las capas en espiral.
//  · Lab: laboratorio estilizado con un compuesto helicoidal y un ensayo de impacto (investigación).
import React from 'react';
import {clamp, easeInOut, hash1, lerp, mixColor} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({x, y, s = 30, c = '#ffffff', w = 800, a = 'middle', children}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={FONT_FAMILY} fontWeight={w} fontSize={s} fill={c}>
    {children}
  </text>
);
const Panel: React.FC<{x: number; y: number; w: number; h: number; k: number; children: React.ReactNode}> = ({x, y, w, h, k, children}) => (
  <g opacity={k} transform={`translate(0 ${f1((1 - k) * 30)})`}>
    <rect x={x} y={y} width={w} height={h} rx={28} fill="rgba(4,14,28,0.82)" stroke="rgba(143,233,255,0.45)" strokeWidth={2} />
    {children}
  </g>
);

export const EyeDiagram: React.FC<{t: number; k: number}> = ({t, k}) => {
  const pol = t * 1.4;
  const colors = ['#8a3aff', '#3a6aff', '#3ac8ff', '#3aff9a', '#d8ff3a', '#ffb03a', '#ff5a3a', '#ff3a8a'];
  return (
    <Panel x={70} y={280} w={940} h={900} k={k}>
      <T x={540} y={350} s={44}>Un ojo, tres regiones</T>
      <g transform="translate(330 720)">
        <ellipse rx={190} ry={250} fill="#1a5a5a" stroke="#bff6ff" strokeWidth={4} />
        <clipPath id="eyed10">
          <ellipse rx={190} ry={250} />
        </clipPath>
        <g clipPath="url(#eyed10)">
          {Array.from({length: 120}, (_, i) => (
            <circle key={i} cx={-190 + (i % 12) * 34 + (Math.floor(i / 12) % 2) * 17} cy={-250 + Math.floor(i / 12) * 50} r={12} fill="none" stroke="#2a8a8a" strokeWidth={2} />
          ))}
          {/* banda media: seis filas */}
          {Array.from({length: 6}, (_, i) => (
            <rect key={`b${i}`} x={-190} y={-45 + i * 15} width={380} height={13} fill={colors[(i + Math.floor(t * 2)) % 8]} opacity={0.75 * clamp(k * 2 - (i * 0.1))} />
          ))}
        </g>
        <ellipse cx={0} cy={-150} rx={30} ry={20} fill="#0a0a14" opacity={0.8} />
        <ellipse cx={0} cy={150} rx={30} ry={20} fill="#0a0a14" opacity={0.8} />
      </g>
      <path d="M520,520 L620,470" stroke="#bff6ff" strokeWidth={2} />
      <T x={630} y={470} s={28} a="start">hemisferio superior</T>
      <path d="M520,720 L620,720" stroke="#ffd27a" strokeWidth={3} />
      <T x={630} y={712} s={30} a="start" c="#ffd27a">banda media</T>
      <T x={630} y={748} s={24} a="start" w={600} c="#ffd27a">6 filas especializadas</T>
      <path d="M520,920 L620,970" stroke="#bff6ff" strokeWidth={2} />
      <T x={630} y={980} s={28} a="start">hemisferio inferior</T>
      {/* espectro de fotorreceptores y polarización */}
      {colors.map((c, i) => (
        <rect key={c} x={140 + i * 50} y={1060 - 40 * (0.5 + 0.5 * Math.sin(t * 2 + i))} width={36} height={40 * (0.5 + 0.5 * Math.sin(t * 2 + i))} fill={c} opacity={0.85} />
      ))}
      <T x={300} y={1110} s={24} w={700}>muchos tipos de fotorreceptores</T>
      <g transform="translate(800 1050)">
        <circle r={46} fill="none" stroke="#bff6ff" strokeWidth={3} />
        <path d={`M${f1(Math.cos(pol) * -40)},${f1(Math.sin(pol) * -40)} L${f1(Math.cos(pol) * 40)},${f1(Math.sin(pol) * 40)}`} stroke="#ffd27a" strokeWidth={6} strokeLinecap="round" />
      </g>
      <T x={800} y={1140} s={24} w={700}>luz polarizada</T>
    </Panel>
  );
};

export const ArtisticVision: React.FC<{t: number; k: number}> = ({t, k}) => (
  <g opacity={k}>
    {Array.from({length: 18}, (_, i) => (
      <path key={i} d={`M-100,${200 + i * 100 + Math.sin(t + i) * 20} Q540,${120 + i * 100 + Math.sin(t * 1.3 + i) * 40} 1180,${200 + i * 100}`} stroke={['#8a3aff', '#3ac8ff', '#3aff9a', '#ffd23f'][i % 4]} strokeWidth={10} fill="none" opacity={0.12} />
    ))}
    <rect x={150} y={1290} width={780} height={70} rx={20} fill="rgba(4,14,28,0.75)" />
    <T x={540} y={1336} s={28} c="#ffd27a">interpretación artística · no es lo que ve el animal</T>
  </g>
);

export const SpringDiagram: React.FC<{t: number; k: number; load: number; release: number}> = ({k, load, release}) => {
  const L = clamp(load) * (1 - clamp(release));
  return (
    <Panel x={80} y={250} w={920} h={560} k={k}>
      <T x={540} y={320} s={40}>Resorte y cierre</T>
      <g transform="translate(360 560)">
        {/* silla de montar (paraboloide hiperbólico) que se comprime */}
        <path d={`M-150,${f1(-20 + 30 * L)} Q0,${f1(-110 + 60 * L)} 150,${f1(-20 + 30 * L)} Q0,${f1(60 - 20 * L)} -150,${f1(-20 + 30 * L)}Z`} fill="#e8566a" stroke="#ffd0d0" strokeWidth={4} opacity={0.9} />
        <path d={`M-120,${f1(-10 + 25 * L)} Q0,${f1(-70 + 45 * L)} 120,${f1(-10 + 25 * L)}`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.6} />
        {/* cierre: placas que bloquean el giro */}
        <g transform={`translate(190 ${f1(-10)}) rotate(${f1(release > 0 ? -60 * clamp(release * 3) : 0)})`}>
          <rect x={-12} y={-50} width={24} height={60} rx={6} fill="#ffd27a" stroke="#8a5a1a" strokeWidth={3} />
        </g>
        <T x={0} y={120} s={26} w={700}>pieza en forma de silla de montar</T>
        <T x={190} y={-80} s={24} w={700} c="#ffd27a">cierre</T>
      </g>
      {/* barra de energía elástica */}
      <rect x={690} y={420} width={60} height={300} rx={12} fill="none" stroke="#bff6ff" strokeWidth={3} />
      <rect x={696} y={714 - 288 * L} width={48} height={288 * L} rx={8} fill="#7ff3ff" />
      <T x={720} y={760} s={22} w={700}>energía</T>
    </Panel>
  );
};

export const SpeedCard: React.FC<{k: number; u: number}> = ({k, u}) => (
  <Panel x={110} y={270} w={860} h={250} k={k}>
    <T x={540} y={350} s={42} c="#ffd27a">milésimas de segundo</T>
    <rect x={200} y={390} width={680} height={22} rx={11} fill="rgba(255,255,255,0.15)" />
    <rect x={200} y={390} width={680 * clamp(u)} height={22} rx={11} fill="#7ff3ff" />
    <T x={540} y={478} s={34}>el mazo supera los 20 m/s</T>
  </Panel>
);

/** Burbujas de cavitación: crecen y colapsan, con anillos de presión y distorsión del agua. */
export const Cavitation: React.FC<{x: number; y: number; t: number; t0: number; k: number; s?: number}> = ({x, y, t, t0, k, s = 1}) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`} opacity={k}>
      {Array.from({length: 9}, (_, i) => {
        const per = 0.9 + hash1(i) * 0.5;
        const ph = (((t - t0) / per + hash1(i * 3)) % 1 + 1) % 1;
        const grow = ph < 0.75 ? easeInOut(ph / 0.75) : 1 - (ph - 0.75) / 0.25;
        const r = 6 + 26 * grow * (0.6 + hash1(i * 5) * 0.6);
        const bx = (hash1(i * 7) - 0.5) * 80;
        const by = (hash1(i * 9) - 0.5) * 60;
        const ring = ph > 0.75 ? (ph - 0.75) / 0.25 : 0;
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r={r} fill="rgba(220,250,255,0.25)" stroke="#e8fbff" strokeWidth={2.5} />
            <circle cx={bx - r * 0.3} cy={by - r * 0.3} r={r * 0.25} fill="#ffffff" opacity={0.7} />
            {ring > 0 && <circle cx={bx} cy={by} r={10 + ring * 90} fill="none" stroke="#bff6ff" strokeWidth={3 * (1 - ring)} opacity={1 - ring} />}
          </g>
        );
      })}
      {/* distorsión del agua alrededor (ondas concéntricas) */}
      {[0, 1, 2].map((i) => {
        const u = (((t - t0) * 0.8 + i / 3) % 1 + 1) % 1;
        return <ellipse key={`w${i}`} rx={60 + u * 220} ry={40 + u * 150} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.25 * (1 - u)} />;
      })}
    </g>
  );
};

/** El mazo girando (representación tridimensional simulada): el apéndice rota sobre su eje largo;
 *  las manchas recorren la superficie y se ocultan por detrás, la luz cenital queda fija y el
 *  contorno se ensancha o estrecha según el ángulo. */
export const ClubOrbit: React.FC<{t: number; k: number; cx?: number; cy?: number}> = ({t, k, cx = 540, cy = 800}) => {
  const roll = t * 1.1;
  const sway = Math.sin(t * 0.5) * 8;
  const R = 120 * (0.86 + 0.14 * Math.abs(Math.cos(roll)));
  const spots = Array.from({length: 26}, (_, i) => ({a: (i / 26) * Math.PI * 2 * 3.0 + hash1(i) * 0.6, x: -100 + hash1(i * 3) * 220, r: 6 + hash1(i * 5) * 7}));
  return (
    <g opacity={k} transform={`translate(${cx} ${cy}) rotate(${f1(-18 + sway)})`}>
      <defs>
        <linearGradient id="clubP10" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb0bc" />
          <stop offset="0.45" stopColor="#e8566a" />
          <stop offset="1" stopColor="#6a1424" />
        </linearGradient>
        <radialGradient id="clubH10" cx="0.4" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#ffe0e6" />
          <stop offset="0.4" stopColor="#f0647a" />
          <stop offset="1" stopColor="#5a0e1c" />
        </radialGradient>
      </defs>
      <ellipse cx={-60} cy={300} rx={300} ry={26} fill="#000" opacity={0.25} />
      {/* própodo (segmento que sostiene el mazo) */}
      <rect x={-460} y={-58} width={360} height={116} rx={56} fill="url(#clubP10)" stroke="#3a0a14" strokeWidth={6} />
      {Array.from({length: 7}, (_, i) => {
        const a = roll + i * 0.9;
        return Math.cos(a) > 0 ? <path key={i} d={`M${-430 + i * 46},${f1(Math.sin(a) * 50)} l30,0`} stroke="#ffd0d8" strokeWidth={4} opacity={0.5 * Math.cos(a)} strokeLinecap="round" /> : null;
      })}
      {/* mazo: talón engrosado del dáctilo */}
      <ellipse cx={0} cy={0} rx={150} ry={R} fill="url(#clubH10)" stroke="#3a0a14" strokeWidth={7} />
      {spots.map((sp, i) => {
        const a = sp.a + roll;
        const z = Math.cos(a);
        if (z < 0.05) return null;
        const xx = sp.x * Math.sqrt(1 - Math.pow(sp.x / 160, 2));
        return <ellipse key={i} cx={xx} cy={Math.sin(a) * R * 0.88} rx={sp.r} ry={sp.r * (0.35 + 0.65 * z)} fill="#4a0a18" opacity={0.35 + 0.55 * z} />;
      })}
      <ellipse cx={-40} cy={-R * 0.55} rx={70} ry={18} fill="#ffffff" opacity={0.35} />
      {/* superficie de impacto (zona frontal más clara) */}
      <path d={`M120,${f1(-R * 0.75)} Q172,0 120,${f1(R * 0.75)}`} stroke="#ffe8d8" strokeWidth={14} fill="none" opacity={0.7} strokeLinecap="round" />
      {/* espina terminal del dáctilo */}
      <path d={`M110,${f1(R * 0.6)} Q190,${f1(R * 0.9)} 200,${f1(R * 1.7)}`} stroke="#3a0a14" strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={`M110,${f1(R * 0.6)} Q190,${f1(R * 0.9)} 200,${f1(R * 1.7)}`} stroke="#ffc0c8" strokeWidth={12} fill="none" strokeLinecap="round" />
      <text x={150} y={-R - 40} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={30} fill="#ffe8d8">superficie de impacto</text>
    </g>
  );
};

export const ClubSection: React.FC<{t: number; k: number; crack: number}> = ({t, k, crack}) => {
  const c = clamp(crack);
  return (
    <Panel x={60} y={240 + Math.sin(t * 0.9) * 8} w={960} h={1000} k={k}>
      <T x={540} y={310} s={40}>Dentro del mazo</T>
      <g transform="translate(400 760)">
        <clipPath id="sec10">
          <path d="M-300,-300 Q0,-360 300,-300 L300,320 L-300,320Z" />
        </clipPath>
        <g clipPath="url(#sec10)">
          <rect x={-300} y={-360} width={600} height={700} fill="#3a2030" />
          {/* región de impacto (mineral) */}
          <path d="M-300,-300 Q0,-360 300,-300 L300,-200 Q0,-260 -300,-200Z" fill="#f4e0c8" />
          {/* región periódica: capas de fibras que rotan (estructura helicoidal) */}
          {Array.from({length: 14}, (_, i) => {
            const y = -190 + i * 30;
            const a = (i * 15 + t * 24) % 180;
            return (
              <g key={i}>
                <rect x={-300} y={y} width={600} height={28} fill={mixColor('#c86a7a', '#8a3a5a', i % 2)} opacity={0.9} />
                {Array.from({length: 14}, (_, j) => (
                  <line key={j} x1={-290 + j * 44} y1={y + 14 - Math.sin((a * Math.PI) / 180) * 11} x2={-290 + j * 44 + Math.cos((a * Math.PI) / 180) * 22} y2={y + 14 + Math.sin((a * Math.PI) / 180) * 11} stroke="#ffd0d8" strokeWidth={2} opacity={0.75} />
                ))}
              </g>
            );
          })}
          {/* región estriada (envoltura) */}
          <rect x={-300} y={240} width={600} height={80} fill="#6a3a50" />
          {Array.from({length: 20}, (_, i) => (
            <line key={i} x1={-300 + i * 30} y1={240} x2={-300 + i * 30} y2={320} stroke="#a86a80" strokeWidth={3} />
          ))}
          {/* grieta que entra y se desvía en espiral, frenándose */}
          <path d={`M10,-330 L0,-210 ${Array.from({length: 8}, (_, i) => `L${f1(Math.sin(i * 1.3) * 40 + i * 8)},${f1(-180 + i * 22)}`).join(' ')}`} stroke="#111" strokeWidth={4} fill="none" strokeDasharray={`${f1(420 * c)} 600`} />
        </g>
      </g>
      <path d="M720,480 L760,480" stroke="#f4e0c8" strokeWidth={3} />
      <T x={770} y={472} s={26} a="start" c="#f4e0c8">región de impacto</T>
      <T x={770} y={504} s={20} a="start" w={600} c="#f4e0c8">mineral muy duro</T>
      <path d="M720,720 L760,720" stroke="#ffd0d8" strokeWidth={3} />
      <T x={770} y={712} s={26} a="start" c="#ffd0d8">región periódica</T>
      <T x={770} y={744} s={20} a="start" w={600} c="#ffd0d8">fibras en espiral</T>
      <path d="M720,1040 L760,1040" stroke="#c88aa0" strokeWidth={3} />
      <T x={770} y={1046} s={26} a="start" c="#c88aa0">región estriada</T>
      <T x={540} y={1200} s={26} w={700} c="#bff6ff">la grieta se desvía y pierde energía</T>
    </Panel>
  );
};

export const Lab: React.FC<{t: number; k: number; hit: number}> = ({t, k, hit}) => {
  const swing = Math.sin(clamp(hit) * Math.PI * 0.5);
  const after = Math.max(0, t - 4.4); // rebote amortiguado del péndulo tras el impacto
  const rebound = hit >= 1 ? -16 * Math.sin(after * 2.4) * Math.exp(-after * 0.3) : 0;
  return (
    <g opacity={k}>
      <defs>
        <linearGradient id="lab10" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2a44" />
          <stop offset="1" stopColor="#0a1426" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#lab10)" />
      {Array.from({length: 3}, (_, r) => (
        <g key={r} transform={`translate(0 ${300 + r * 180})`}>
          <rect x={60} y={120} width={960} height={10} fill="#2a3a5a" />
          {Array.from({length: 6}, (_, i) => (
            <rect key={i} x={110 + i * 160} y={50} width={60} height={70} rx={8} fill="#7ff3ff" opacity={0.12 + 0.06 * hash1(i + r)} stroke="#7ff3ff" strokeOpacity={0.35} />
          ))}
        </g>
      ))}
      <rect x={0} y={1180} width={1080} height={30} fill="#2a3a5a" />
      {/* probeta de compuesto helicoidal (capas giradas) */}
      <g transform="translate(540 1120)">
        {Array.from({length: 10}, (_, i) => (
          <g key={i} transform={`translate(0 ${-i * 12})`}>
            <rect x={-200} y={-10} width={400} height={11} fill={mixColor('#8ab8d8', '#4a7aa8', i % 2)} />
            {Array.from({length: 10}, (_, j) => (
              <line key={j} x1={-190 + j * 40} y1={-5} x2={-190 + j * 40 + Math.cos((i * 18 * Math.PI) / 180) * 18} y2={-5 + Math.sin((i * 18 * Math.PI) / 180) * 4} stroke="#e8f6ff" strokeWidth={1.5} opacity={0.7} />
            ))}
          </g>
        ))}
        {hit > 0.8 && <path d="M0,-120 L-10,-96 L8,-80 L-4,-64" stroke="#111" strokeWidth={3} fill="none" />}
      </g>
      {/* péndulo de impacto */}
      <g transform="translate(540 560)">
        <path d="M-160,0 L160,0" stroke="#5a6a8a" strokeWidth={14} />
        <g transform={`rotate(${f1(lerp(70, 0, swing) + rebound)})`}>
          <path d="M0,0 L0,420" stroke="#9aaacc" strokeWidth={8} />
          <rect x={-40} y={420} width={80} height={60} rx={10} fill="#d8a04a" stroke="#6a4a1a" strokeWidth={4} />
        </g>
      </g>
      <rect x={140} y={1270} width={800} height={80} rx={20} fill="rgba(4,14,28,0.8)" />
      <T x={540} y={1322} s={30} c="#ffd27a">compuestos inspirados · investigación en desarrollo</T>
      <circle cx={540} cy={1000} r={60 * Math.exp(-Math.max(0, hit - 0.95) * 30) * (hit > 0.95 ? 1 : 0)} fill="#ffffff" opacity={0.3} />
      <g opacity={0.5 + 0.5 * Math.sin(t)} />
    </g>
  );
};
