// FICHA DE CONTROL (interna): el camaleón en reposo con varias paletas, marcha y ataque con la lengua.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Chameleon} from '../character/Chameleon';
import {Branch, makeWalk, poseOn, restFeet, strike} from '../character/motion';

const B = (y: number): Branch => ({pts: [{x: -100, y}, {x: 1200, y: y - 30}], r: 16});
const BranchView: React.FC<{b: Branch}> = ({b}) => <path d={`M${b.pts[0].x} ${b.pts[0].y}L${b.pts[1].x} ${b.pts[1].y}`} stroke="#6a4a2c" strokeWidth={b.r * 2} strokeLinecap="round" />;
export const CamaleonFicha: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const rows: React.ReactNode[] = [];
  const names = [['rest', 'excited'], ['turquoise', 'blue'], ['display', 'dark']] as const;
  names.forEach(([a, c], i) => {
    const b = B(330 + i * 300);
    const p = poseOn(b, 120, restFeet(b, 120, 1, 1), {scale: 1, facing: 1, t, color: {from: a, to: c, k: (Math.sin(t) + 1) / 2}});
    rows.push(<g key={i}><BranchView b={b} /><Chameleon pose={p} uid={`r${i}`} /></g>);
  });
  const b = B(1250);
  const w = makeWalk(b, 1, 1, 80, 0, 20, () => 22);
  const s = w.at(t);
  const p = poseOn(b, s.x, s.feet, {scale: 1, facing: 1, t, color: {from: 'rest', to: 'rest', k: 1}, rock: Math.sin(s.phase * Math.PI * 4) * 4});
  const b2 = B(1650);
  const st = strike(t % 5, 0, 3);
  const p2 = poseOn(b2, 60, restFeet(b2, 60, 1, 1), {scale: 1, facing: 1, t, color: {from: 'excited', to: 'excited', k: 1}});
  p2.jaw = st.jaw;
  p2.tongue = {ext: st.ext, target: {x: 640, y: 1460}, bulge: st.bulge};
  return (
    <AbsoluteFill style={{background: '#cfe0c0'}}>
      <svg width={1080} height={1920}>
        {rows}
        <BranchView b={b} />
        <Chameleon pose={p} uid="w" />
        <BranchView b={b2} />
        <Chameleon pose={p2} uid="s" />
        <circle cx={640} cy={1460} r={6} fill="#222" />
      </svg>
    </AbsoluteFill>
  );
};
