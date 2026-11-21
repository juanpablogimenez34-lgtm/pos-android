// Sección ilustrada del suelo (120–150 s): corte por el centro de la roseta con el rizoma,
// las raíces, arena y turba húmedas, agua en los poros y pocos nutrientes (esquemático).
import React from 'react';
import {clamp, hash1, mixColor, smoothPath, Vec} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {project, V3, View} from '../anatomy/proj';
import {f1, Item} from '../anatomy/render';

const P = (view: View, p: V3) => project(view, p);

export function soilItems(view: View, t: number, k: number, scarceK: number): Item[] {
  if (k <= 0.01) return [];
  const X = 1500;
  const D = 1000;
  const c = [P(view, [-X, 0, 0]), P(view, [X, 0, 0]), P(view, [X, -D, 0]), P(view, [-X, -D, 0])];
  const els: React.ReactNode[] = [];
  const top = c[0];
  const bot = c[3];
  els.push(
    <defs key="d">
      <linearGradient id="soil-g" gradientUnits="userSpaceOnUse" x1={f1(top.x)} y1={f1(top.y)} x2={f1(bot.x)} y2={f1(bot.y)}>
        <stop offset="0" stopColor="#3b2a1a" />
        <stop offset="0.18" stopColor="#4d3a24" />
        <stop offset="0.45" stopColor="#8d7a55" />
        <stop offset="1" stopColor="#6c6a5c" />
      </linearGradient>
      <clipPath id="soil-c">
        <path d={'M' + c.map((p) => `${f1(p.x)},${f1(p.y)}`).join('L') + 'Z'} />
      </clipPath>
    </defs>,
  );
  els.push(<path key="bg" d={'M' + c.map((p) => `${f1(p.x)},${f1(p.y)}`).join('L') + 'Z'} fill="url(#soil-g)" />);
  const inner: React.ReactNode[] = [];
  // granos de arena y fibras de turba
  for (let i = 0; i < 260; i++) {
    const x = (hash1(i * 1.3) * 2 - 1) * X;
    const y = -hash1(i * 2.9) * D;
    const q = P(view, [x, y, 0]);
    const deep = -y / D;
    inner.push(<circle key={`g${i}`} cx={f1(q.x)} cy={f1(q.y)} r={1.5 + hash1(i * 5.7) * 3.5} fill={deep < 0.25 ? '#2a1c10' : mixColor('#c9b98c', '#8a8676', deep)} opacity={0.7} />);
  }
  // agua en los poros (suelo húmedo)
  for (let i = 0; i < 70; i++) {
    const x = (hash1(i * 4.1) * 2 - 1) * X;
    const y = -(0.2 + hash1(i * 3.3) * 0.8) * D;
    const q = P(view, [x, y, 0]);
    inner.push(<circle key={`w${i}`} cx={f1(q.x)} cy={f1(q.y)} r={4 + hash1(i) * 4} fill="#9fd3f0" opacity={0.5} />);
  }
  // rizoma y raíces
  const rz = P(view, [0, -95, 0]);
  const roots: React.ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const a = -1.0 + (2 * i) / 8;
    const L = 380 + hash1(i * 3.7) * 300;
    const pts: Vec[] = [];
    for (let s = 0; s <= 8; s++) {
      const u = s / 8;
      pts.push(P(view, [Math.sin(a) * L * 0.45 * u + Math.sin(u * 7 + i) * 18, -150 - L * u, 0]));
    }
    roots.push(<path key={`r${i}`} d={smoothPath(pts)} stroke="#2a1d14" strokeWidth={3.2 - (i % 3) * 0.6} fill="none" strokeLinecap="round" />);
    // pelos radicales
    for (let h = 2; h < 8; h += 2) {
      const p = pts[h];
      roots.push(<path key={`rh${i}${h}`} d={`M${f1(p.x)},${f1(p.y)}l${f1(8 + h)},${f1(4)}M${f1(p.x)},${f1(p.y)}l${f1(-8 - h)},${f1(5)}`} stroke="#3a2a1d" strokeWidth={1} opacity={0.7} />);
    }
  }
  inner.push(<g key="roots">{roots}</g>);
  inner.push(
    <g key="rz">
      <ellipse cx={f1(rz.x)} cy={f1(rz.y)} rx={46} ry={78} fill="#efe6d0" stroke="#9c8e6c" strokeWidth={2} />
      <ellipse cx={f1(rz.x - 12)} cy={f1(rz.y - 22)} rx={12} ry={30} fill="#ffffff" opacity={0.5} />
    </g>,
  );
  // nutrientes escasos (N, P): pocos puntos marcados, frente a mucha agua y arena
  if (scarceK > 0.01) {
    const spots: [number, number, string][] = [[-900, -380, 'N'], [700, -620, 'P'], [-300, -820, 'N'], [1150, -260, 'P']];
    spots.forEach(([x, y, l], i) => {
      const q = P(view, [x, y, 0]);
      const pulseK = 0.75 + 0.25 * Math.sin(t * 3 + i);
      inner.push(
        <g key={`n${i}`} opacity={scarceK}>
          <circle cx={f1(q.x)} cy={f1(q.y)} r={26 * pulseK} fill={l === 'N' ? '#7fd0ff' : '#ffb86b'} opacity={0.9} />
          <text x={f1(q.x)} y={f1(q.y + 10)} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize={28} fill="#0b1a2a">
            {l}
          </text>
        </g>,
      );
    });
  }
  els.push(
    <g key="in" clipPath="url(#soil-c)">
      {inner}
    </g>,
  );
  // línea del suelo (borde del corte)
  els.push(<path key="edge" d={`M${f1(c[0].x)},${f1(c[0].y)}L${f1(c[1].x)},${f1(c[1].y)}`} stroke="#6f8a3a" strokeWidth={10} />);
  return [{z: -8000, key: 'soil', node: <g key="soil" opacity={clamp(k)}>{els}</g>}];
}
