// EMBARCACIONES HISTÓRICAS ORIGINALES (línea de flotación en y = 0, proa hacia +x). Todas cabecean y se
// balancean con las olas; las velas se hinchan con el viento (curvas de Bézier animadas), las banderas
// ondean, la estela hace espuma y el vapor echa humo. Son ilustraciones genéricas de cada época, no
// reproducciones de barcos concretos.
//  · Galleon17   barco de madera del siglo XVII (castillo de popa alto, tres palos, velas cuadras)
//  · Brig18      velero del siglo XVIII (dos palos, foques, casco más fino)
//  · Steamer19   vapor del siglo XIX (chimenea con humo, ruedas de paletas y aparejo auxiliar)
//  · Trawler20   pesquero de motor del siglo XX (puente, mástil y redes)
//  · Research21  buque científico moderno (casco blanco y rojo, grúa en A, antenas, sonda)
import React from 'react';
import {hash1} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
type ShipProps = {x: number; t: number; s?: number; dir?: 1 | -1; wind?: number; k?: number};

const Bob: React.FC<ShipProps & {children: React.ReactNode; len: number}> = ({x, t, s = 1, dir = 1, k = 1, children, len}) => {
  const heave = Math.sin(t * 0.9 + x * 0.001) * 8;
  const roll = Math.sin(t * 0.7 + 1 + x * 0.002) * 2.2;
  return (
    <g transform={`translate(${f1(x)} ${f1(heave)}) rotate(${f1(roll)}) scale(${f1(s * dir)} ${f1(s)})`} opacity={k}>
      {/* estela y espuma en la línea de flotación */}
      {Array.from({length: 7}, (_, i) => (
        <ellipse key={i} cx={-len * 0.5 - i * 60 - ((t * 60) % 60)} cy={6} rx={50 + i * 12} ry={6} fill="#ffffff" opacity={0.35 * (1 - i / 7)} />
      ))}
      <ellipse cx={len * 0.48} cy={4} rx={40} ry={7} fill="#ffffff" opacity={0.5} />
      {children}
    </g>
  );
};

/** Vela cuadra: ancho w, alto h, hinchada por `wind`. */
const SquareSail: React.FC<{x: number; y: number; w: number; h: number; t: number; wind: number; ph?: number; c?: string}> = ({x, y, w, h, t, wind, ph = 0, c = '#efe4c8'}) => {
  const b = (18 + 10 * Math.sin(t * 1.3 + ph)) * wind;
  return (
    <g>
      <path d={`M${f1(x - w / 2)},${f1(y)} L${f1(x + w / 2)},${f1(y)} Q${f1(x + w / 2 + b)},${f1(y + h / 2)} ${f1(x + w / 2 - 4)},${f1(y + h)} L${f1(x - w / 2 + 4)},${f1(y + h)} Q${f1(x - w / 2 + b)},${f1(y + h / 2)} ${f1(x - w / 2)},${f1(y)}Z`} fill={c} stroke="#8a7a5a" strokeWidth={2} />
      <path d={`M${f1(x - w / 2 + 6)},${f1(y + h * 0.33)} Q${f1(x + b * 0.6)},${f1(y + h * 0.36)} ${f1(x + w / 2 - 6)},${f1(y + h * 0.33)}`} stroke="#b8a882" strokeWidth={1.5} fill="none" />
      <path d={`M${f1(x - w / 2 + 6)},${f1(y + h * 0.66)} Q${f1(x + b * 0.6)},${f1(y + h * 0.69)} ${f1(x + w / 2 - 6)},${f1(y + h * 0.66)}`} stroke="#b8a882" strokeWidth={1.5} fill="none" />
    </g>
  );
};
const Flag: React.FC<{x: number; y: number; t: number; c: string; w?: number}> = ({x, y, t, c, w = 50}) => {
  const a = Math.sin(t * 4) * 6;
  return <path d={`M${f1(x)},${f1(y)} q${f1(w / 2)},${f1(-6 + a)} ${f1(w)},${f1(a * 0.5)} l0,22 q${f1(-w / 2)},${f1(6 - a)} ${f1(-w)},${f1(-a * 0.3)}Z`} fill={c} />;
};

export const Galleon17: React.FC<ShipProps> = (p) => {
  const {t, wind = 1} = p;
  return (
    <Bob {...p} len={700}>
      <path d="M-380,-40 L-340,-150 L-250,-150 L-230,-100 L250,-100 L330,-140 L360,-130 L320,-30 Q300,40 200,50 L-260,50 Q-350,40 -380,-40Z" fill="#6a4426" stroke="#2e1a0c" strokeWidth={4} />
      <path d="M-370,-60 L320,-60" stroke="#c89a50" strokeWidth={6} />
      {Array.from({length: 7}, (_, i) => <rect key={i} x={-220 + i * 70} y={-50} width={22} height={18} fill="#2a1608" />)}
      <path d="M-340,-150 L-320,-210 L-240,-210 L-250,-150Z" fill="#7a5030" stroke="#2e1a0c" strokeWidth={3} />
      {[-200, 20, 220].map((mx, i) => <rect key={i} x={mx - 6} y={-600 + i * 40} width={12} height={500 - i * 40} fill="#4a2e18" />)}
      <SquareSail x={-200} y={-520} w={190} h={150} t={t} wind={wind} />
      <SquareSail x={-200} y={-350} w={230} h={180} t={t} wind={wind} ph={1} />
      <SquareSail x={20} y={-560} w={210} h={170} t={t} wind={wind} ph={2} />
      <SquareSail x={20} y={-370} w={250} h={200} t={t} wind={wind} ph={3} />
      <SquareSail x={220} y={-460} w={170} h={140} t={t} wind={wind} ph={4} />
      <path d="M320,-140 L470,-210" stroke="#4a2e18" strokeWidth={8} />
      <path d="M-200,-600 L-200,-640 M20,-560 L20,-600" stroke="#4a2e18" strokeWidth={6} />
      <Flag x={-200} y={-640} t={t} c="#b03a2a" />
      <Flag x={20} y={-600} t={t + 1} c="#e8d8a8" />
      {Array.from({length: 6}, (_, i) => <path key={`l${i}`} d={`M${f1(-330 + i * 120)},-100 L${f1(-200 + (i > 2 ? 220 : 0))},-560`} stroke="#3a2a1a" strokeWidth={1.5} opacity={0.6} />)}
    </Bob>
  );
};

export const Brig18: React.FC<ShipProps> = (p) => {
  const {t, wind = 1} = p;
  return (
    <Bob {...p} len={620}>
      <path d="M-320,-60 L-300,-110 L280,-90 L340,-110 Q320,20 220,40 L-240,40 Q-300,20 -320,-60Z" fill="#2e2a26" stroke="#141210" strokeWidth={4} />
      <path d="M-310,-70 L320,-70" stroke="#e8d8a8" strokeWidth={10} />
      {Array.from({length: 8}, (_, i) => <rect key={i} x={-240 + i * 62} y={-76} width={18} height={12} fill="#141210" />)}
      {[-120, 120].map((mx, i) => <rect key={i} x={mx - 6} y={-640} width={12} height={540} fill="#4a3a28" />)}
      <SquareSail x={-120} y={-600} w={170} h={130} t={t} wind={wind} c="#f4ecd8" />
      <SquareSail x={-120} y={-450} w={210} h={160} t={t} wind={wind} ph={1} c="#f4ecd8" />
      <SquareSail x={-120} y={-270} w={240} h={150} t={t} wind={wind} ph={2} c="#f4ecd8" />
      <SquareSail x={120} y={-600} w={160} h={130} t={t} wind={wind} ph={3} c="#f4ecd8" />
      <SquareSail x={120} y={-450} w={200} h={160} t={t} wind={wind} ph={4} c="#f4ecd8" />
      <SquareSail x={120} y={-270} w={230} h={150} t={t} wind={wind} ph={5} c="#f4ecd8" />
      <path d="M340,-110 L520,-170" stroke="#4a3a28" strokeWidth={7} />
      <path d={`M130,-600 L500,-170 Q${f1(380 + 20 * Math.sin(t * 1.3) * wind)},-330 130,-600Z`} fill="#f4ecd8" stroke="#8a7a5a" strokeWidth={2} />
      <Flag x={-120} y={-660} t={t} c="#2a4a8a" />
    </Bob>
  );
};

export const Steamer19: React.FC<ShipProps> = (p) => {
  const {t, wind = 1} = p;
  return (
    <Bob {...p} len={760}>
      {/* humo */}
      {Array.from({length: 14}, (_, i) => {
        const u = ((t * 0.35 + i / 14) % 1);
        return <circle key={`s${i}`} cx={20 - u * 520 + Math.sin(i * 3 + t) * 20} cy={-430 - u * 260} r={30 + u * 90} fill="#3a3a3a" opacity={0.45 * (1 - u)} />;
      })}
      <path d="M-380,-50 L-360,-110 L360,-110 L400,-130 Q380,20 260,40 L-280,40 Q-350,20 -380,-50Z" fill="#1e2226" stroke="#0a0c0e" strokeWidth={4} />
      <path d="M-370,-60 L380,-60" stroke="#a83a2a" strokeWidth={10} />
      <rect x={-200} y={-200} width={360} height={90} fill="#d8ccb0" stroke="#5a5040" strokeWidth={3} />
      {Array.from({length: 9}, (_, i) => <circle key={i} cx={-180 + i * 40} cy={-150} r={9} fill="#2a2a2a" />)}
      <rect x={-20} y={-420} width={70} height={220} fill="#1a1a1a" />
      <rect x={-20} y={-380} width={70} height={22} fill="#a83a2a" />
      {/* rueda de paletas que gira */}
      <circle cx={30} cy={-60} r={110} fill="#2e2a26" stroke="#0a0a0a" strokeWidth={4} />
      {Array.from({length: 10}, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + t * 2.4;
        return <path key={`p${i}`} d={`M30,-60 L${f1(30 + Math.cos(a) * 104)},${f1(-60 + Math.sin(a) * 104)}`} stroke="#6a5a48" strokeWidth={6} />;
      })}
      <path d="M-80,-60 A110,110 0 0 1 140,-60Z" fill="#3a3632" />
      {[-280, 280].map((mx, i) => <rect key={`m${i}`} x={mx - 5} y={-520} width={10} height={410} fill="#3a2e22" />)}
      <SquareSail x={-280} y={-480} w={150} h={120} t={t} wind={wind * 0.6} c="#e0d6bc" />
      <Flag x={280} y={-540} t={t} c="#2a5a3a" />
    </Bob>
  );
};

export const Trawler20: React.FC<ShipProps> = (p) => {
  const {t} = p;
  return (
    <Bob {...p} len={560}>
      {Array.from({length: 8}, (_, i) => {
        const u = ((t * 0.4 + i / 8) % 1);
        return <circle key={`s${i}`} cx={-40 - u * 260} cy={-330 - u * 160} r={16 + u * 50} fill="#6a6a6a" opacity={0.35 * (1 - u)} />;
      })}
      <path d="M-280,-40 L-270,-110 L250,-110 L300,-150 Q290,10 200,40 L-220,40 Q-270,20 -280,-40Z" fill="#2a4a6a" stroke="#0c1a2a" strokeWidth={4} />
      <path d="M-270,-60 L290,-60" stroke="#e8e8e0" strokeWidth={8} />
      <rect x={60} y={-260} width={170} height={150} fill="#f0ece0" stroke="#5a5a50" strokeWidth={3} />
      {Array.from({length: 4}, (_, i) => <rect key={i} x={74 + i * 38} y={-240} width={26} height={30} fill="#2a3a4a" />)}
      <rect x={-50} y={-330} width={40} height={220} fill="#3a3a3a" />
      <path d="M-200,-110 L-200,-420 M-200,-400 L-60,-130 M-200,-400 L-280,-110" stroke="#4a4a4a" strokeWidth={8} />
      <path d={`M-260,-110 Q-320,${f1(60 + Math.sin(t) * 10)} -420,${f1(160 + Math.sin(t * 0.8) * 16)}`} stroke="#c8b888" strokeWidth={4} fill="none" strokeDasharray="10 6" />
    </Bob>
  );
};

export const Research21: React.FC<ShipProps> = (p) => {
  const {t} = p;
  return (
    <Bob {...p} len={820}>
      <path d="M-400,-50 L-390,-130 L330,-130 L420,-170 Q410,10 300,40 L-330,40 Q-390,20 -400,-50Z" fill="#f2f2ee" stroke="#5a5a5a" strokeWidth={4} />
      <path d="M-395,-40 L415,-40 Q405,15 300,40 L-330,40 Q-390,20 -395,-40Z" fill="#b8322a" />
      <rect x={-80} y={-300} width={340} height={170} fill="#f6f6f2" stroke="#6a6a6a" strokeWidth={3} />
      <rect x={-20} y={-380} width={220} height={80} fill="#f6f6f2" stroke="#6a6a6a" strokeWidth={3} />
      {Array.from({length: 6}, (_, i) => <rect key={i} x={-4 + i * 34} y={-366} width={24} height={30} fill="#2a4a6a" />)}
      {Array.from({length: 8}, (_, i) => <rect key={`w${i}`} x={-64 + i * 40} y={-270} width={26} height={22} fill="#2a4a6a" />)}
      <path d="M90,-380 L90,-500 M60,-470 L120,-470 M70,-440 L110,-440" stroke="#4a4a4a" strokeWidth={6} />
      <circle cx={90} cy={-510} r={14} fill="#e8e8e8" stroke="#6a6a6a" strokeWidth={3} />
      <path d={`M90,-470 l${f1(Math.cos(t * 2) * 36)},${f1(Math.sin(t * 2) * 6)}`} stroke="#3a3a3a" strokeWidth={5} />
      {/* grúa en A en la popa y cable con instrumento */}
      <path d="M-380,-130 L-340,-330 L-300,-130" stroke="#e8a030" strokeWidth={12} fill="none" />
      <path d={`M-340,-330 L${f1(-430 + Math.sin(t * 0.8) * 10)},-120 L${f1(-430 + Math.sin(t * 0.8) * 12)},200`} stroke="#3a3a3a" strokeWidth={3} fill="none" />
      <rect x={-446 + Math.sin(t * 0.8) * 12} y={200} width={32} height={50} rx={6} fill="#e8a030" />
      <text x={-220} y={-80} fill="#ffffff" fontSize={34} fontWeight={800} fontFamily="sans-serif" opacity={0.9}>INVESTIGACIÓN</text>
    </Bob>
  );
};

export const _h = hash1;
