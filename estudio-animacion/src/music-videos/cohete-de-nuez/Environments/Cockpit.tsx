// Interior del cohete de nuez: paredes de cáscara (por dentro), ventana redonda con aro de cartón,
// panel de controles infantiles (botones de colores, palanca, volante de juguete, pantallitas),
// asientos de cartón y cinta adhesiva. Los botones laten con la música (LIGHT_PULSE).
import React from 'react';
import {hash1, mixColor} from '../../../engine/math';
import {beatPulse} from '../MusicSync/songMap';
import {Cam, layerT} from '../Camera/cam2d';

export const CockpitBack: React.FC<{cam: Cam; t: number; view: React.ReactNode; shake: number}> = ({cam, t, view, shake}) => (
  <g transform={layerT({...cam, x: cam.x + shake * Math.sin(t * 61) * 4}, 0.9)}>
    <defs>
      <radialGradient id="ck-wall" cx="0.5" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#c98f52" />
        <stop offset="1" stopColor="#6e4522" />
      </radialGradient>
      <clipPath id="ck-win">
        <circle cx={0} cy={-560} r={300} />
      </clipPath>
    </defs>
    <rect x={-1600} y={-2400} width={3200} height={4000} fill="url(#ck-wall)" />
    {/* nervaduras de la cáscara por dentro */}
    {Array.from({length: 14}, (_, i) => (
      <path key={i} d={`M${-1500 + i * 230},-2400 Q${-1400 + i * 230 + Math.sin(i) * 80},-600 ${-1500 + i * 230},1400`} stroke="#5a3a1a" strokeWidth={10} fill="none" opacity={0.35} />
    ))}
    {/* ventana redonda */}
    <circle cx={0} cy={-560} r={340} fill="#c79a5e" stroke="#3e2412" strokeWidth={10} />
    {Array.from({length: 16}, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 320} cy={-560 + Math.sin(a) * 320} r={7} fill="#7a5428" />;
    })}
    <g clipPath="url(#ck-win)">{view}</g>
    <circle cx={0} cy={-560} r={300} fill="none" stroke="#3e2412" strokeWidth={8} />
    <path d="M-190,-760 A250,250 0 0 1 40,-830" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" fill="none" opacity={0.5} />
    {/* cinta adhesiva sujetando la ventana */}
    {[[-300, -800, -30], [300, -800, 30], [-300, -320, 30], [300, -320, -30]].map(([x, y, r], i) => (
      <rect key={i} x={x - 50} y={y - 14} width={100} height={28} fill="#f6ecc4" opacity={0.8} transform={`rotate(${r} ${x} ${y})`} />
    ))}
  </g>
);

export const CockpitPanel: React.FC<{cam: Cam; t: number; lever: number; wheel: number; shake: number}> = ({cam, t, lever, wheel, shake}) => {
  const bp = beatPulse(t, 7);
  return (
    <g transform={layerT({...cam, x: cam.x + shake * Math.sin(t * 61) * 5}, 1.08)}>
      {/* panel de cartón */}
      <path d="M-760,330 Q0,170 760,330 L760,1300 L-760,1300Z" fill="#d9a466" stroke="#3e2412" strokeWidth={8} />
      <path d="M-700,370 Q0,230 700,370" stroke="#f6e2c0" strokeWidth={10} fill="none" opacity={0.5} />
      {/* botones de colores */}
      {Array.from({length: 9}, (_, i) => {
        const x = -540 + i * 135;
        const y = 420 + Math.abs(i - 4) * -8 + 30;
        const c = ['#ff5d73', '#ffd23f', '#4dd88a', '#5db8ff', '#c38aff', '#ff9a3c', '#ff5d73', '#4dd88a', '#5db8ff'][i];
        const on = i % 3 === (Math.floor(t * 2) % 3) ? 1 : 0.35 + 0.65 * bp * (i % 2);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={34} fill={mixColor('#5a4a3a', c, on)} stroke="#3e2412" strokeWidth={6} />
            <circle cx={x - 10} cy={y - 10} r={9} fill="#ffffff" opacity={0.5} />
            {on > 0.7 && <circle cx={x} cy={y} r={56} fill={c} opacity={0.25} />}
          </g>
        );
      })}
      {/* pantallitas */}
      {[-420, 420].map((x, i) => (
        <g key={i}>
          <rect x={x - 110} y={540} width={220} height={130} rx={18} fill="#12233f" stroke="#3e2412" strokeWidth={6} />
          {Array.from({length: 6}, (_, k) => (
            <rect key={k} x={x - 90 + k * 30} y={650 - (20 + 80 * Math.abs(Math.sin(t * 3 + k + i))) } width={20} height={20 + 80 * Math.abs(Math.sin(t * 3 + k + i))} fill={['#7ff3ff', '#4dd88a'][i]} opacity={0.8} />
          ))}
        </g>
      ))}
      {/* palanca */}
      <g transform={`translate(-180 640) rotate(${(-30 + 60 * lever).toFixed(1)})`}>
        <rect x={-10} y={-150} width={20} height={150} rx={8} fill="#9fb4d8" stroke="#3e2412" strokeWidth={5} />
        <circle cx={0} cy={-156} r={30} fill="#e8463c" stroke="#3e2412" strokeWidth={6} />
      </g>
      {/* volante de juguete */}
      <g transform={`translate(160 660) rotate(${(wheel * 30).toFixed(1)})`}>
        <circle r={120} fill="none" stroke="#e8463c" strokeWidth={26} />
        <circle r={120} fill="none" stroke="#3e2412" strokeWidth={4} />
        <path d="M-110,0 L110,0 M0,-110 L0,110" stroke="#e8463c" strokeWidth={16} />
        <circle r={34} fill="#ffd23f" stroke="#3e2412" strokeWidth={6} />
      </g>
      {/* corrugado del cartón */}
      {Array.from({length: 30}, (_, i) => (
        <line key={i} x1={-760 + i * 52} x2={-760 + i * 52} y1={1180} y2={1300} stroke="#b07a3a" strokeWidth={6} opacity={0.5 + 0.3 * hash1(i)} />
      ))}
    </g>
  );
};
