// GRÁFICOS CIENTÍFICOS (pantalla 1080×1920):
//  · OrientationInset — esquema lateral: flota boca abajo bajo la superficie, burbuja de aire.
//  · StingerPipeline  — cómo conserva las células urticantes: ingiere nematocistos SIN disparar →
//                       pasan por las ramas del sistema digestivo → se almacenan en los cnidosacos
//                       de las puntas de las ceratas. (Proceso biológico, no magia ni electricidad.)
//  · CerataCutaway    — corte de una cerata: rama de la glándula digestiva y cnidosaco con nematocistos.
//  · WarningCard      — advertencia elegante (picadura dolorosa; observar sin tocar).
//  · ChannelLogo      — logotipo de Mundo Insólito Documentales (solo en el cierre).
import React from 'react';
import {clamp, easeInOut, hash1, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode; it?: boolean}> = ({x, y, s = 30, c = '#ffffff', w = 800, a = 'middle', children, it}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={FONT_FAMILY} fontWeight={w} fontSize={s} fill={c} fontStyle={it ? 'italic' : 'normal'}>
    {children}
  </text>
);
const Panel: React.FC<{x: number; y: number; w: number; h: number; k: number; children: React.ReactNode}> = ({x, y, w, h, k, children}) =>
  k > 0.01 ? (
    <g opacity={k} transform={`translate(0 ${f1((1 - k) * 30)})`}>
      <rect x={x} y={y} width={w} height={h} rx={30} fill="rgba(3,12,34,0.84)" stroke="rgba(140,200,255,0.5)" strokeWidth={2} />
      {children}
    </g>
  ) : null;

/** Mini dragón esquemático (para los diagramas). */
const MiniDragon: React.FC<{x: number; y: number; s: number; flip?: boolean; t: number}> = ({x, y, s, flip, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s} ${flip ? -s : s})`}>
    {[-1, 1].map((sd) =>
      [60, 20, -20].map((cx, i) => (
        <g key={`${sd}${i}`}>
          {Array.from({length: 5}, (_, j) => {
            const a = (sd > 0 ? -Math.PI / 2 : Math.PI / 2) + (j - 2) * 0.28 + Math.sin(t * 2 + j + i) * 0.05;
            return <path key={j} d={`M${cx},0 l${f1(Math.cos(a) * 40)},${f1(Math.sin(a) * 22)}`} stroke="#2a6cf0" strokeWidth={5} strokeLinecap="round" />;
          })}
        </g>
      )),
    )}
    <path d="M110,0 Q90,-12 40,-12 Q-40,-10 -120,0 Q-40,10 40,12 Q90,12 110,0Z" fill="#c8d6ea" stroke="#06103a" strokeWidth={3} />
    <path d="M110,0 Q90,-6 40,-6 Q-40,-5 -120,0" fill="none" stroke="#2a6cf0" strokeWidth={5} />
  </g>
);

export const OrientationInset: React.FC<{t: number; k: number; bubble: number}> = ({t, k, bubble}) => (
  <Panel x={560} y={250} w={460} h={420} k={k}>
    <T x={790} y={305} s={30}>flota boca abajo</T>
    <path d={`M590,${f1(380 + Math.sin(t * 2) * 5)} Q700,${f1(368 + Math.sin(t * 2 + 1) * 6)} 790,380 T990,380`} stroke="#9ff4ff" strokeWidth={4} fill="none" />
    <T x={980} y={362} s={20} a="end" w={600} c="#9ff4ff">superficie</T>
    <MiniDragon x={790} y={402} s={1.3} flip t={t} />
    <T x={600} y={480} s={20} a="start" w={700} c="#7cc4ff">pie azul ↑ hacia el cielo</T>
    <T x={600} y={512} s={20} a="start" w={700} c="#c8d6ea">dorso plateado ↓ hacia el fondo</T>
    {bubble > 0.01 && (
      <g opacity={bubble}>
        <ellipse cx={810} cy={402} rx={26} ry={9} fill="#ffffff" />
        <path d="M810,412 L800,580" stroke="#ffffff" strokeWidth={2} />
        <T x={790} y={612} s={24} c="#ffffff">burbuja de aire en el estómago</T>
      </g>
    )}
  </Panel>
);

export const StingerPipeline: React.FC<{t: number; k: number; u: number}> = ({t, k, u}) => {
  // ruta esquemática: boca → estómago → ramas digestivas → puntas de las ceratas
  const path = [
    {x: 840, y: 760},
    {x: 640, y: 760},
    {x: 470, y: 760},
    {x: 360, y: 640},
    {x: 300, y: 520},
  ];
  const at = (q: number) => {
    const f = clamp(q) * (path.length - 1);
    const i = Math.min(path.length - 2, Math.floor(f));
    const kk = f - i;
    return {x: lerp(path[i].x, path[i + 1].x, kk), y: lerp(path[i].y, path[i + 1].y, kk)};
  };
  const step = u < 0.33 ? 1 : u < 0.66 ? 2 : 3;
  const stored = clamp((u - 0.66) / 0.34);
  return (
    <Panel x={60} y={240} w={960} h={900} k={k}>
      <T x={540} y={305} s={38}>Defensas prestadas</T>
      {/* esquema del cuerpo */}
      <path d="M900,760 Q860,720 640,720 L420,720 Q300,730 200,760 Q300,790 420,800 L640,800 Q860,800 900,760Z" fill="#1a3a8a" stroke="#7cc4ff" strokeWidth={3} />
      <path d="M470,760 Q420,700 360,640 Q330,600 300,520" stroke="#c88a4a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M470,760 Q420,820 360,880 Q330,920 300,1000" stroke="#c88a4a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* ceratas con cnidosacos */}
      {[[300, 520, -1], [300, 1000, 1]].map(([x, y, sd], i) => (
        <g key={i}>
          <path d={`M${x + 20},${y + sd * 0} L${x - 30},${y + sd * 80} L${x + 60},${y + sd * 60}Z`} fill="#2a6cf0" stroke="#7cc4ff" strokeWidth={3} transform={`rotate(${sd * 180 + 180} ${x} ${y})`} />
          <circle cx={x} cy={y} r={30} fill="#0a1650" stroke="#9ff4ff" strokeWidth={3} />
          {Array.from({length: 9}, (_, j) => (
            <ellipse key={j} cx={x - 14 + (j % 3) * 14} cy={y - 12 + Math.floor(j / 3) * 12} rx={5} ry={3} fill="#ffe08a" opacity={clamp(stored * 9 - j)} />
          ))}
        </g>
      ))}
      {/* tentáculo de la presa en la boca */}
      <path d={`M1000,${f1(700 + Math.sin(t * 2) * 10)} Q940,740 900,760`} stroke="#4a6aff" strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* nematocistos (cápsula con filamento enrollado, SIN disparar) viajando */}
      {Array.from({length: 6}, (_, i) => {
        const q = clamp(u * 1.4 - i * 0.07);
        const p = at(q);
        const p2 = {x: p.x, y: 760 + (760 - p.y)};
        return (
          <g key={i} opacity={q > 0 && q < 1 ? 1 : 0}>
            {[p, p2].map((pp, j) => (
              <g key={j} transform={`translate(${f1(pp.x)} ${f1(pp.y)})`}>
                <ellipse rx={12} ry={7} fill="#ffe08a" stroke="#8a5a1a" strokeWidth={2} />
                <path d="M-6,0 q3,-4 6,0 t6,0" stroke="#8a5a1a" strokeWidth={1.5} fill="none" />
              </g>
            ))}
          </g>
        );
      })}
      {/* paso actual */}
      <g>
        <circle cx={140} cy={1050} r={26} fill="#ffd23f" />
        <T x={140} y={1061} s={30} c="#06103a">{String(step)}</T>
        <T x={190} y={1043} s={28} a="start">{step === 1 ? 'Ingiere tentáculos con nematocistos' : step === 2 ? 'Viajan por las ramas de su' : 'Se almacenan en cnidosacos,'}</T>
        <T x={190} y={1080} s={28} a="start" c="#bff6ff">{step === 1 ? 'sin dispararlos' : step === 2 ? 'sistema digestivo' : 'en las puntas de las ceratas'}</T>
      </g>
      <T x={540} y={390} s={24} w={700} c="#ffe08a">nematocisto: cápsula con un filamento enrollado</T>
    </Panel>
  );
};

export const CerataCutaway: React.FC<{t: number; k: number; u: number}> = ({t, k, u}) => {
  const grow = easeInOut(clamp(u * 1.5));
  return (
    <Panel x={80} y={240} w={920} h={980} k={k}>
      <T x={540} y={305} s={38}>Dentro de una cerata</T>
      <g transform="translate(400 1120)">
        <path d="M-90,0 Q-110,-380 -40,-700 Q0,-780 40,-700 Q110,-380 90,0Z" fill="#2a6cf0" stroke="#bfe0ff" strokeWidth={5} opacity={0.9} />
        <path d="M-60,0 Q-70,-360 -20,-660 Q0,-700 20,-660 Q70,-360 60,0Z" fill="#7cc4ff" opacity={0.25} />
        {/* rama de la glándula digestiva */}
        <path d={`M0,0 L0,${f1(-560 * grow)}`} stroke="#c88a4a" strokeWidth={22} strokeLinecap="round" />
        {Array.from({length: 7}, (_, i) => {
          const y = -70 - i * 70;
          if (-y > 560 * grow) return null;
          const sd = i % 2 ? 1 : -1;
          return <path key={i} d={`M0,${y} q${sd * 30},-14 ${sd * 48},-40`} stroke="#c88a4a" strokeWidth={10} strokeLinecap="round" fill="none" />;
        })}
        {/* cnidosaco en la punta */}
        <ellipse cx={0} cy={-680} rx={30} ry={40} fill="#0a1650" stroke="#9ff4ff" strokeWidth={4} />
        {Array.from({length: 10}, (_, i) => (
          <ellipse key={i} cx={-12 + (i % 3) * 12} cy={-700 + Math.floor(i / 3) * 14} rx={5} ry={3} fill="#ffe08a" opacity={clamp(u * 3 - 1 - i * 0.1) * (0.7 + 0.3 * Math.sin(t * 3 + i))} />
        ))}
      </g>
      <path d="M440,440 L620,420" stroke="#9ff4ff" strokeWidth={3} />
      <T x={630} y={414} s={28} a="start" c="#9ff4ff">cnidosaco</T>
      <T x={630} y={448} s={22} a="start" w={600} c="#9ff4ff">nematocistos almacenados</T>
      <path d="M420,800 L620,780" stroke="#e8b070" strokeWidth={3} />
      <T x={630} y={774} s={28} a="start" c="#e8b070">rama digestiva</T>
      <T x={630} y={808} s={22} a="start" w={600} c="#e8b070">glándula digestiva</T>
      <T x={630} y={1000} s={28} a="start" c="#bfe0ff">cerata</T>
      <T x={630} y={1034} s={22} a="start" w={600} c="#bfe0ff">no sirve para volar</T>
    </Panel>
  );
};

/** Triángulo de advertencia con signo de exclamación (dibujado, sin emojis). */
const WarnIcon: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0,-44 L48,40 L-48,40Z" fill="#ffd23f" stroke="#3a2a00" strokeWidth={5} strokeLinejoin="round" />
    <rect x={-5} y={-18} width={10} height={36} rx={4} fill="#3a2a00" />
    <circle cx={0} cy={28} r={6} fill="#3a2a00" />
  </g>
);

export const WarningCard: React.FC<{k: number; mode: 'sting' | 'beach'}> = ({k, mode}) => (
  <Panel x={110} y={250} w={860} h={250} k={k}>
    <WarnIcon x={220} y={372} s={1.2} />
    {mode === 'sting' ? (
      <>
        <T x={300} y={350} s={42} a="start" c="#ffd23f">PRECAUCIÓN</T>
        <T x={300} y={400} s={30} a="start">puede causar una</T>
        <T x={300} y={440} s={30} a="start">picadura dolorosa</T>
      </>
    ) : (
      <>
        <T x={300} y={350} s={40} a="start" c="#ffd23f">EN LA PLAYA</T>
        <T x={300} y={400} s={30} a="start">obsérvalo · no lo toques</T>
        <T x={300} y={440} s={26} a="start" w={700} c="#bff6ff">ni con las manos desnudas</T>
      </>
    )}
  </Panel>
);

export const ChannelLogo: React.FC<{k: number; t: number}> = ({k, t}) =>
  k > 0.01 ? (
    <g opacity={k} transform={`translate(540 760) scale(${f1(0.9 + 0.1 * k)})`}>
      <circle r={120} fill="rgba(4,14,40,0.85)" stroke="#9ff4ff" strokeWidth={6} />
      <path d={`M-80,10 Q-40,${f1(-30 + Math.sin(t * 2) * 6)} 0,10 T80,10`} stroke="#9ff4ff" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M-80,46 Q-40,${f1(6 + Math.sin(t * 2 + 1) * 6)} 0,46 T80,46`} stroke="#2a6cf0" strokeWidth={10} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-46} r={22} fill="#ffd23f" />
      <T x={0} y={200} s={64} w={900}>MUNDO INSÓLITO</T>
      <T x={0} y={256} s={34} w={700} c="#9ff4ff">D O C U M E N T A L E S</T>
    </g>
  ) : null;

export const _hash = hash1;
