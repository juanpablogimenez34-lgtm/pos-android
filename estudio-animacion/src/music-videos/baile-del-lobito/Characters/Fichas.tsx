// FICHAS DEFINITIVAS: Lobi (perfil, frente, estados y expresiones), Mila y Toto.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts} from '../../../engine/fonts';
import {useTime} from '../../../engine/useTime';
import {bClap, bHop, bIdle, bLaugh, bStumble, bSurprise} from '../Animations/bunnyStates';
import {face, idle, jump, laugh, lookUp, playBow, run, sleep, tired, walk} from '../Animations/lobiStates';
import {Bunny, bunnyPose, MILA, TOTO} from './Bunny';
import {Lobi, lobiPose} from './Lobi';

const Label: React.FC<{x: number; y: number; s: string; size?: number}> = ({x, y, s, size = 24}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={size} fill="#2c2846">
    {s}
  </text>
);
const Card: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; id: string}> = ({x, y, w, h, children, id}) => (
  <g>
    <defs>
      <clipPath id={`fc${id}`}>
        <rect x={x} y={y} width={w} height={h} rx={26} />
      </clipPath>
    </defs>
    <rect x={x} y={y} width={w} height={h} rx={26} fill="#ffffff" opacity={0.7} />
    <g clipPath={`url(#fc${id})`}>{children}</g>
  </g>
);

export const LobitoFichas: React.FC = () => {
  ensureFonts();
  const t = useTime() + 0.3;
  const P = (o: Parameters<typeof lobiPose>[0]) => lobiPose({t, ...o});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#e9f7e4, #fff3d8)'}}>
      <svg width={1080} height={1920}>
        <Label x={540} y={64} s="EL BAILE DEL LOBITO · fichas" size={42} />
        <Card x={20} y={90} w={1040} h={430} id="a">
          <Lobi uid="fa" p={P({x: 330, y: 470, scale: 1.45, ...idle(t, {smile: 0.9})})} />
          <Lobi uid="fb" p={P({x: 820, y: 470, scale: 1.3, yaw: Math.PI / 2, ...idle(t, {smile: 0.9}), face: face(t, {smile: 0.9, look: {x: 0, y: 0}})})} />
          <Label x={330} y={510} s="Lobi · perfil 3/4" />
          <Label x={820} y={510} s="Lobi · frente (paso del giro)" />
        </Card>
        {(
          [
            ['caminar', walk(t, 0.35)],
            ['correr (suspensión)', run(t, 0.8)],
            ['saltar', jump(t, 0.56)],
            ['postura juguetona', playBow(t, 1)],
          ] as const
        ).map(([name, st], i) => (
          <Card key={name} x={20 + i * 262} y={540} w={250} h={260} id={`s${i}`}>
            <Lobi uid={`fs${i}`} p={P({x: 140 + i * 262, y: 740, scale: 0.62, ...st})} />
            <Label x={145 + i * 262} y={785} s={name} size={20} />
          </Card>
        ))}
        {(
          [
            ['alegre', idle(t, {smile: 1, cheeks: 0.8})],
            ['risa', laugh(t, 1)],
            ['mira al cielo', lookUp(t, 1)],
            ['cansado', tired(t, 1)],
          ] as const
        ).map(([name, st], i) => (
          <Card key={name} x={20 + i * 262} y={820} w={250} h={280} id={`e${i}`}>
            <Lobi uid={`fe${i}`} p={P({x: -70 + i * 262, y: 1300, scale: 1.75, ...st})} />
            <Label x={145 + i * 262} y={1088} s={name} size={20} />
          </Card>
        ))}
        <Card x={20} y={1120} w={1040} h={250} id="z">
          <Lobi uid="fz" p={P({x: 300, y: 1330, scale: 1.1, ...sleep(t)})} />
          <Label x={300} y={1360} s="dormido y enroscado" size={20} />
          <Lobi uid="fz2" p={P({x: 760, y: 1330, scale: 0.8, ...jump(t, 0.12)})} />
          <Label x={760} y={1360} s="flexión previa al salto" size={20} />
        </Card>
        <Card x={20} y={1390} w={1040} h={510} id="b">
          <Bunny uid="m1" L={MILA} p={bunnyPose({t, x: 120, y: 1650, scale: 1.05, ...bIdle(t, 4, {smile: 0.9})})} />
          <Bunny uid="m2" L={MILA} p={bunnyPose({t, x: 300, y: 1650, scale: 1.0, ...bClap(t, (t * 2) % 1, 4)})} />
          <Bunny uid="m3" L={MILA} p={bunnyPose({t, x: 470, y: 1650, scale: 0.95, ...bHop(t, 0.5, 50, 4)})} />
          <Bunny uid="m4" L={MILA} p={bunnyPose({t, x: 640, y: 1650, scale: 1.0, ...bLaugh(t, 4)})} />
          <Label x={380} y={1688} s="Mila: reposo · aplauso · salto · risa" size={20} />
          <Bunny uid="t1" L={TOTO} p={bunnyPose({t, x: 120, y: 1858, scale: 0.92, ...bIdle(t, 7, {smile: 0.9})})} />
          <Bunny uid="t2" L={TOTO} p={bunnyPose({t, x: 300, y: 1858, scale: 0.9, ...bSurprise(t, 0.2, 7)})} />
          <Bunny uid="t3" L={TOTO} p={bunnyPose({t, x: 470, y: 1858, scale: 0.9, ...bStumble(t, 0.5, 7)})} />
          <Bunny uid="t4" L={TOTO} p={bunnyPose({t, x: 640, y: 1858, scale: 0.9, ...bLaugh(t, 7)})} />
          <Label x={380} y={1888} s="Toto: reposo · sorpresa · tropiezo · risa" size={20} />
        </Card>
      </svg>
    </AbsoluteFill>
  );
};
