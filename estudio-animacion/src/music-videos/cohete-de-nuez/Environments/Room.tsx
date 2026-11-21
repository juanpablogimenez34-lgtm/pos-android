// Habitación infantil luminosa (capas de parallax): pared con dibujos de estrellas, ventana con
// cielo (de día o de noche), estante con juguetes espaciales, móvil de planetas, mesa de
// manualidades con cartones, papeles de colores, cinta, tijeras infantiles y la nuez decorativa,
// y alfombra redonda donde está el cohete.
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../Camera/cam2d';

export type RoomState = {night: number; materials: number; nutOnTable: number; t: number; tidy: number; zumiStar: number};

const Star: React.FC<{x: number; y: number; r: number; c: string; rot?: number; sw?: number}> = ({x, y, r, c, rot = 0, sw = 3}) => (
  <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 20})`} d="M0,-20 L6,-6 L21,-6 L9,3 L13,18 L0,9 L-13,18 L-9,3 L-21,-6 L-6,-6Z" fill={c} stroke="#5a3a6a" strokeWidth={sw} strokeLinejoin="round" />
);

export const RoomBack: React.FC<{cam: Cam; s: RoomState}> = ({cam, s}) => {
  const n = s.night;
  const wall = mixColor('#ffe9c9', '#3a3a78', n * 0.75);
  const sky = mixColor('#7ec8ff', '#141a4a', n);
  return (
    <g>
      {/* pared */}
      <g transform={layerT(cam, 0.85)}>
        <rect x={-2600} y={-2600} width={5200} height={2700} fill={wall} />
        {/* papel pintado de lunares suaves */}
        {Array.from({length: 120}, (_, i) => (
          <circle key={i} cx={-2400 + (i % 12) * 420 + ((Math.floor(i / 12) % 2) * 210)} cy={-2400 + Math.floor(i / 12) * 240} r={14} fill={mixColor(wall, '#ffffff', 0.35)} />
        ))}
        {/* ventana con cielo */}
        <g transform="translate(-420 -1150)">
          <rect x={-230} y={-280} width={460} height={540} rx={30} fill={sky} />
          {n < 0.7 &&
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${-120 + i * 130 + Math.sin(s.t * 0.2 + i) * 20} ${-150 + i * 90})`} opacity={1 - n}>
                <ellipse cx={0} cy={0} rx={70} ry={30} fill="#ffffff" />
                <ellipse cx={-30} cy={-16} rx={40} ry={28} fill="#ffffff" />
                <ellipse cx={30} cy={-12} rx={36} ry={24} fill="#ffffff" />
              </g>
            ))}
          {n > 0.1 &&
            Array.from({length: 26}, (_, i) => (
              <circle key={i} cx={-210 + hash1(i * 3) * 420} cy={-260 + hash1(i * 7) * 500} r={2 + hash1(i) * 3} fill="#ffffff" opacity={n * (0.5 + 0.5 * Math.sin(s.t * 3 + i))} />
            ))}
          {n > 0.1 && <circle cx={120} cy={-160} r={46} fill="#fff4c4" opacity={n} />}
          {/* Zumi como estrella sonriente en su imaginación */}
          {s.zumiStar > 0.01 && (
            <g transform={`translate(-60 -60) scale(${(0.6 + 0.4 * s.zumiStar).toFixed(3)})`} opacity={s.zumiStar}>
              <circle r={70} fill="#c6f6e2" opacity={0.25} />
              <Star x={0} y={0} r={52} c="#9ff0cf" rot={Math.sin(s.t) * 8} />
              <circle cx={-12} cy={-6} r={6} fill="#1f4a3c" />
              <circle cx={12} cy={-6} r={6} fill="#1f4a3c" />
              <path d="M-12,10 Q0,20 12,10" stroke="#1f4a3c" strokeWidth={4} fill="none" strokeLinecap="round" />
            </g>
          )}
          <rect x={-230} y={-280} width={460} height={540} rx={30} fill="none" stroke="#ffffff" strokeWidth={34} />
          <path d="M0,-280 L0,260 M-230,-10 L230,-10" stroke="#ffffff" strokeWidth={18} />
          <rect x={-260} y={250} width={520} height={34} rx={10} fill="#f2d7b0" stroke="#c9a77a" strokeWidth={4} />
          {/* cortinas */}
          <path d="M-300,-320 Q-250,0 -320,300 L-250,300 Q-200,0 -240,-320Z" fill="#ff9ad5" />
          <path d="M300,-320 Q250,0 320,300 L250,300 Q200,0 240,-320Z" fill="#ff9ad5" />
        </g>
        {/* dibujos de estrellas y cohetes infantiles pegados en la pared */}
        <g transform="translate(260 -1350) rotate(-4)">
          <rect x={-120} y={-90} width={240} height={180} fill="#ffffff" stroke="#e0d0b0" strokeWidth={4} />
          <Star x={-50} y={-10} r={34} c="#ffd23f" />
          <Star x={50} y={20} r={26} c="#ff7ab0" rot={12} />
          <circle cx={60} cy={-50} r={14} fill="#7ec8ff" />
        </g>
        <g transform="translate(620 -1180) rotate(5)">
          <rect x={-100} y={-120} width={200} height={240} fill="#fffdf0" stroke="#e0d0b0" strokeWidth={4} />
          <path d="M0,-90 Q30,-40 30,40 L-30,40 Q-30,-40 0,-90Z" fill="#ff9a3c" stroke="#7a4a2a" strokeWidth={4} />
          <circle cx={0} cy={-20} r={12} fill="#7ec8ff" stroke="#7a4a2a" strokeWidth={3} />
          <path d="M-20,40 L-10,80 L0,50 L10,80 L20,40" fill="#ffd23f" />
        </g>
        {/* estante con juguetes espaciales */}
        <g transform="translate(700 -800)">
          <rect x={-200} y={0} width={400} height={20} rx={6} fill="#c98a5a" />
          <circle cx={-120} cy={-46} r={44} fill="#5db8ff" stroke="#2a5a8a" strokeWidth={5} />
          <ellipse cx={-120} cy={-46} rx={70} ry={14} fill="none" stroke="#ffd23f" strokeWidth={7} />
          <rect x={-10} y={-90} width={40} height={90} rx={18} fill="#e8463c" stroke="#7a2a2a" strokeWidth={4} />
          <path d="M-10,-90 L10,-120 L30,-90Z" fill="#ffd23f" stroke="#7a2a2a" strokeWidth={4} />
          <rect x={80} y={-60} width={70} height={60} rx={10} fill="#c38aff" stroke="#5a3a8a" strokeWidth={4} />
          <circle cx={115} cy={-30} r={14} fill="#ffffff" />
        </g>
      </g>
      {/* móvil de planetas colgado del techo (balanceo suave) */}
      <g transform={layerT(cam, 0.92)}>
        <g transform={`translate(200 -1700) rotate(${(Math.sin(s.t * 0.8) * 6).toFixed(2)})`}>
          <path d="M0,0 L0,160 M-160,160 L160,160 M-160,160 L-160,260 M0,160 L0,300 M160,160 L160,230" stroke="#8a7a6a" strokeWidth={4} />
          <circle cx={-160} cy={290} r={30} fill="#ff9a3c" stroke="#8a4a1a" strokeWidth={4} />
          <circle cx={0} cy={340} r={42} fill="#7ec8ff" stroke="#2a5a8a" strokeWidth={4} />
          <ellipse cx={0} cy={340} rx={66} ry={12} fill="none" stroke="#ffd23f" strokeWidth={6} />
          <Star x={160} y={260} r={30} c="#ffd23f" rot={Math.sin(s.t) * 10} />
        </g>
      </g>
    </g>
  );
};

/** Suelo, alfombra y mesa de manualidades (plano de los personajes). */
export const RoomFloor: React.FC<{cam: Cam; s: RoomState}> = ({cam, s}) => {
  const n = s.night;
  const floor = mixColor('#e8b980', '#5a4a7a', n * 0.6);
  const m = s.materials * (1 - s.tidy);
  return (
    <g transform={layerT(cam, 1)}>
      <rect x={-3000} y={0} width={6000} height={1600} fill={floor} />
      {Array.from({length: 14}, (_, i) => (
        <line key={i} x1={-3000} x2={3000} y1={40 + i * 70} y2={40 + i * 70} stroke={mixColor(floor, '#8a5a2a', 0.25)} strokeWidth={4} />
      ))}
      <rect x={-3000} y={-30} width={6000} height={34} fill={mixColor('#ffffff', '#4a4a8a', n * 0.6)} />
      {/* alfombra redonda */}
      <ellipse cx={-230} cy={70} rx={430} ry={110} fill={mixColor('#8ad7c8', '#3a5a7a', n * 0.5)} />
      <ellipse cx={-230} cy={70} rx={340} ry={82} fill="none" stroke="#ffffff" strokeWidth={10} strokeDasharray="30 20" opacity={0.7} />
      <ellipse cx={-230} cy={70} rx={220} ry={50} fill={mixColor('#ffd23f', '#8a7a4a', n * 0.5)} opacity={0.6} />
      {/* mesa de manualidades */}
      <g transform="translate(420 0)">
        <rect x={-260} y={-270} width={520} height={30} rx={10} fill="#ff9a3c" stroke="#8a4a1a" strokeWidth={5} />
        <rect x={-230} y={-240} width={24} height={240} fill="#c9702a" />
        <rect x={206} y={-240} width={24} height={240} fill="#c9702a" />
        {m > 0.01 && (
          <g opacity={m}>
            <rect x={-220} y={-330} width={130} height={60} rx={4} fill="#c79a5e" stroke="#7a5428" strokeWidth={4} transform="rotate(-6 -155 -300)" />
            <rect x={-80} y={-300} width={110} height={30} fill="#ff9ad5" stroke="#b0457e" strokeWidth={3} />
            <rect x={-70} y={-318} width={110} height={20} fill="#7ec8ff" stroke="#2a5a8a" strokeWidth={3} />
            <rect x={-60} y={-332} width={110} height={16} fill="#ffd23f" stroke="#c98a1a" strokeWidth={3} />
            <circle cx={90} cy={-290} r={22} fill="#f2e2a8" stroke="#8a7a4a" strokeWidth={4} />
            <circle cx={90} cy={-290} r={10} fill="#ffffff" />
            <g transform="translate(170 -284) rotate(-20)">
              <circle cx={-10} cy={4} r={9} fill="none" stroke="#e8463c" strokeWidth={5} />
              <circle cx={10} cy={4} r={9} fill="none" stroke="#e8463c" strokeWidth={5} />
              <path d="M-4,-2 L6,-34 M4,-2 L-2,-34" stroke="#b8c4d0" strokeWidth={5} strokeLinecap="round" />
            </g>
            {/* plano del cohete dibujado */}
            <g transform="translate(-140 -268)">
              <rect x={-60} y={-4} width={120} height={8} fill="#ffffff" />
            </g>
          </g>
        )}
        {s.nutOnTable > 0.01 && (
          <g opacity={s.nutOnTable} transform="translate(30 -330)">
            <ellipse cx={0} cy={0} rx={44} ry={58} fill="#a8743e" stroke="#3e2412" strokeWidth={5} />
            <path d="M0,-58 Q-6,0 0,58" stroke="#6e4522" strokeWidth={6} fill="none" />
          </g>
        )}
      </g>
    </g>
  );
};
