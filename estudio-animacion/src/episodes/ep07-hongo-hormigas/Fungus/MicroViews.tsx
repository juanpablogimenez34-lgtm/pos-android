// Visualizaciones científicas ESQUEMÁTICAS del hongo, claramente distintas de los planos
// naturales (marco circular de "microscopio", paleta azul y rótulo "esquema · no a escala"):
//  27–45 s  esporas (ascosporas alargadas y septadas) → adhesión a la cutícula → germinación
//           → penetración con un apresorio
//  52–65 s  dentro del hospedador: células del hongo en la hemolinfa que se multiplican y, más
//           tarde, redes de células entre las fibras musculares (según algunos estudios)
// También: indicador de la etapa del hongo y el salto temporal "DÍAS DESPUÉS".
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {easeOut, hash1, lerp, smoothstep} from '../../../engine/math';
import {useTime} from '../../../engine/useTime';
import {EV, FUNGUS_LABEL, FUNGUS_STAGES, fungusStage} from '../Timeline/timeline';

const win = (t: number, a: number, b: number, r = 0.6) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));
const INK = '#bff3ff';

/** Ascospora: cilindro alargado, ligeramente curvo, con septos. */
const Spore: React.FC<{x: number; y: number; a: number; s: number; op?: number}> = ({x, y, a, s, op = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} opacity={op}>
    <path d="M-60,-6 Q0,-12 60,-6 Q66,0 60,6 Q0,12 -60,6 Q-66,0 -60,-6Z" fill="#e9e2c4" stroke="#8a7c52" strokeWidth={1.5} />
    {[-40, -20, 0, 20, 40].map((v) => (
      <path key={v} d={`M${v},${-9 + Math.abs(v) * 0.04} L${v},${9 - Math.abs(v) * 0.04}`} stroke="#8a7c52" strokeWidth={1.2} />
    ))}
  </g>
);

const Frame: React.FC<{k: number; title: string; sub: string; children: React.ReactNode}> = ({k, title, sub, children}) => {
  const {width, height} = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.42;
  const R = 440 * (0.85 + 0.15 * easeOut(k));
  return (
    <AbsoluteFill style={{opacity: easeOut(k), pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'rgba(3,12,18,0.72)'}} />
      <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="mv-c">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
          <radialGradient id="mv-bg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#1d3a44" />
            <stop offset="1" stopColor="#0a1a20" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R + 10} fill="#08141a" stroke={INK} strokeWidth={4} />
        <g clipPath="url(#mv-c)">
          <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="url(#mv-bg)" />
          <g transform={`translate(${cx - 440} ${cy - 440})`}>{children}</g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: FONT_FAMILY}}>
        <div style={{fontWeight: 900, fontSize: 40, color: '#ffffff', letterSpacing: 2}}>{title}</div>
        <div style={{fontWeight: 600, fontSize: 24, color: INK, marginTop: 4}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

/** 27–45 s: esporas, adhesión, germinación y penetración de la cutícula. */
export const SporeView: React.FC = () => {
  const t = useTime();
  const k = win(t, EV.micro1, 45.6, 1.0);
  if (k <= 0.01) return null;
  const cutY = 560; // superficie de la cutícula (en coordenadas locales 0–880)
  const drift = (i: number) => ({x: 120 + ((i * 190 + t * (14 + i * 3)) % 700), y: 160 + hash1(i * 3) * 300 + Math.sin(t * 0.6 + i) * 18, a: -20 + hash1(i * 5) * 40 + Math.sin(t * 0.4 + i) * 6});
  const touch = smoothstep(38.6, EV.sporeTouch, t); // la espora 0 se posa (no "apunta": cae y se adhiere)
  const germ = smoothstep(EV.sporeTouch + 0.6, 43.4, t);
  const pen = smoothstep(43, 45.2, t);
  const s0 = {x: lerp(330, 440, touch), y: lerp(330, cutY - 14, touch), a: lerp(12, 0, touch)};
  const sporesK = smoothstep(33.8, 35, t);
  return (
    <Frame k={k} title="ESCALA MICROSCÓPICA" sub="esquema · no a escala">
      {/* cutícula de la hormiga en sección: placas con pequeños pelos */}
      <rect x={0} y={cutY} width={880} height={60} fill="#3b2a1e" />
      <rect x={0} y={cutY + 60} width={880} height={300} fill="#5a3f30" opacity={0.6} />
      {Array.from({length: 22}, (_, i) => (
        <path key={i} d={`M${i * 42 + 10},${cutY} l${8 + hash1(i) * 6},${-26 - hash1(i * 3) * 18}`} stroke="#6b5240" strokeWidth={3} strokeLinecap="round" />
      ))}
      <text x={40} y={cutY + 40} fill={INK} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={26}>
        cutícula
      </text>
      <text x={40} y={cutY + 120} fill={INK} fontFamily={FONT_FAMILY} fontWeight={600} fontSize={22} opacity={0.8}>
        interior del cuerpo
      </text>
      {/* esporas que flotan a la deriva */}
      {[1, 2, 3, 4].map((i) => {
        const d = drift(i);
        return <Spore key={i} x={d.x} y={d.y} a={d.a} s={0.9} op={sporesK * 0.85} />;
      })}
      <Spore x={s0.x} y={s0.y} a={s0.a} s={1.1} op={sporesK} />
      {/* germinación: tubo germinativo que se curva hacia la cutícula y forma un apresorio */}
      {germ > 0.01 && (
        <g>
          <path d={`M${s0.x + 50},${s0.y + 6} Q${s0.x + 80},${s0.y + 14} ${s0.x + 70 + 20 * germ},${cutY - 4}`} stroke="#e9e2c4" strokeWidth={8} fill="none" strokeLinecap="round" opacity={germ} />
          <circle cx={s0.x + 70 + 20 * germ} cy={cutY - 6} r={12 * germ} fill="#e9e2c4" stroke="#8a7c52" strokeWidth={1.5} />
        </g>
      )}
      {pen > 0.01 && <path d={`M${s0.x + 90},${cutY} L${s0.x + 92},${cutY + 60 + 140 * pen}`} stroke="#e9e2c4" strokeWidth={7} strokeLinecap="round" opacity={pen} />}
      {sporesK > 0.3 && (
        <text x={440} y={120} textAnchor="middle" fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={28} opacity={sporesK * (1 - touch * 0.6)}>
          esporas del hongo
        </text>
      )}
      {germ > 0.1 && (
        <text x={s0.x + 120} y={cutY - 70} fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={26} opacity={germ}>
          germinación
        </text>
      )}
      {pen > 0.1 && (
        <text x={s0.x + 120} y={cutY + 180} fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={26} opacity={pen}>
          atraviesa la cutícula
        </text>
      )}
    </Frame>
  );
};

/** 52–65 s: crecimiento interno (esquemático). */
export const InternalView: React.FC = () => {
  const t = useTime();
  const k = win(t, EV.micro2, EV.micro2Out + 0.6, 1.0);
  if (k <= 0.01) return null;
  const grow = smoothstep(53.5, 58.5, t);
  const net = smoothstep(58.5, 64.5, t);
  // silueta esquemática de la hormiga (perfil) dentro del círculo
  const body = 'M120,470 C120,420 200,400 250,420 C290,380 360,390 380,430 C420,400 520,400 560,440 C600,420 640,430 650,450 C720,410 800,430 800,480 C800,540 720,560 650,520 C620,540 580,540 560,520 C520,560 420,560 380,530 C350,560 290,560 250,530 C200,560 120,530 120,470Z';
  const cells = Array.from({length: Math.round(16 + grow * 70)}, (_, i) => {
    const u = hash1(i * 3.7);
    const v = hash1(i * 5.1);
    return {x: 170 + u * 600, y: 430 + (v - 0.5) * 90 + Math.sin(t * 0.8 + i) * 3, a: hash1(i * 7.3) * 180};
  });
  return (
    <Frame k={k} title="DENTRO DEL HOSPEDADOR" sub="esquema · el mecanismo exacto todavía no se comprende del todo">
      <path d={body} fill="#3a2b22" stroke={INK} strokeWidth={3} opacity={0.95} />
      {/* fibras musculares (bandas estriadas) en la cabeza y el mesosoma */}
      {[[200, 445], [200, 485], [400, 455], [400, 495]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y - 9} width={130} height={18} rx={9} fill="#a8545a" opacity={0.85} />
          {Array.from({length: 10}, (_, j) => (
            <line key={j} x1={x + 8 + j * 12} y1={y - 8} x2={x + 8 + j * 12} y2={y + 8} stroke="#6e2c32" strokeWidth={2} />
          ))}
        </g>
      ))}
      {/* células del hongo en la hemolinfa */}
      {cells.map((c, i) => (
        <ellipse key={i} cx={c.x} cy={c.y} rx={7} ry={4.5} transform={`rotate(${c.a} ${c.x} ${c.y})`} fill="#e9e2c4" opacity={0.9} />
      ))}
      {/* redes entre las fibras musculares (según algunos estudios) */}
      {net > 0.01 &&
        [[200, 445], [200, 485], [400, 455], [400, 495]].map(([x, y], i) => (
          <path key={`n${i}`} d={`M${x},${y - 12} C${x + 40},${y - 22} ${x + 80},${y - 2} ${x + 130 * net},${y - 14} M${x},${y + 12} C${x + 50},${y + 22} ${x + 90},${y + 4} ${x + 130 * net},${y + 13}`} stroke="#f4eed4" strokeWidth={3} fill="none" opacity={net} />
        ))}
      <text x={440} y={330} textAnchor="middle" fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={28}>
        {net > 0.3 ? 'redes de células entre las fibras musculares' : 'células del hongo que se multiplican'}
      </text>
      <text x={440} y={640} textAnchor="middle" fill={INK} fontFamily={FONT_FAMILY} fontWeight={600} fontSize={22}>
        fibras musculares · células del hongo
      </text>
    </Frame>
  );
};

/** Indicador de la etapa del hongo (abajo a la izquierda). */
export const FungusStage: React.FC = () => {
  const t = useTime();
  const st = fungusStage(t);
  if (!st || (t > EV.micro1 && t < 45.6) || (t > EV.micro2 && t < EV.micro2Out + 0.6)) return null;
  const i = FUNGUS_STAGES.indexOf(st);
  return (
    <div style={{position: 'absolute', left: 50, top: 230, fontFamily: FONT_FAMILY, background: 'rgba(4,14,18,0.72)', border: `2px solid ${INK}66`, borderRadius: 16, padding: '10px 16px'}}>
      <div style={{fontSize: 18, fontWeight: 700, color: INK, letterSpacing: 2}}>CICLO DEL HONGO</div>
      <div style={{display: 'flex', gap: 6, margin: '8px 0'}}>
        {FUNGUS_STAGES.map((_, j) => (
          <div key={j} style={{width: 22, height: 8, borderRadius: 4, background: j <= i ? INK : 'rgba(191,243,255,0.18)'}} />
        ))}
      </div>
      <div style={{fontSize: 22, fontWeight: 800, color: '#ffffff'}}>{FUNGUS_LABEL[st]}</div>
    </div>
  );
};

/** 120,4–128 s: salto temporal explícito. */
export const DaysCard: React.FC = () => {
  const t = useTime();
  const k = win(t, EV.days, 128, 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: easeOut(k)}}>
      <div style={{display: 'inline-block', background: 'rgba(4,14,10,0.8)', border: '2px solid #c9f27a', borderRadius: 22, padding: '20px 40px'}}>
        <div style={{fontSize: 62, fontWeight: 900, color: '#ffffff', letterSpacing: 4}}>DÍAS DESPUÉS</div>
        <div style={{fontSize: 24, fontWeight: 600, color: '#c9f27a', marginTop: 6}}>a partir de aquí, crecimiento acelerado</div>
      </div>
    </div>
  );
};

export const AcceleratedTag: React.FC = () => {
  const t = useTime();
  const k = win(t, 128.2, 158, 0.5);
  if (k <= 0.01) return null;
  return (
    <div style={{position: 'absolute', right: 50, top: 236, fontFamily: FONT_FAMILY, opacity: k, background: 'rgba(30,22,4,0.78)', border: '2px solid #ffd27a', borderRadius: 14, padding: '8px 16px', color: '#ffd27a', fontWeight: 800, fontSize: 22}}>
      ● CRECIMIENTO ACELERADO
    </div>
  );
};

