// PARTÍCULAS SUBMARINAS: "nieve marina" en tres profundidades (parallax) que deriva con la
// corriente, plancton diminuto que brilla y desenfoque de primer plano (bokeh). Sin saturar.
import React from 'react';
import {hash1} from '../../../engine/math';
import {Cam, layerT} from '../Camera/cam';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const OceanParticles: React.FC<{cam: Cam; t: number; current?: number; density?: number; tint?: string; glow?: number}> = ({cam, t, current = 0.3, density = 1, tint = '#e8fbff', glow = 0}) => (
  <g>
    {[
      {d: 0.35, n: 70, r: [1, 2.2], op: 0.35},
      {d: 0.7, n: 45, r: [1.8, 3.4], op: 0.5},
      {d: 1.25, n: 18, r: [5, 12], op: 0.18},
    ].map((L, li) => (
      <g key={li} transform={layerT(cam, L.d)}>
        {Array.from({length: Math.round(L.n * density)}, (_, i) => {
          const sx = 3600 / L.d;
          const sy = 4200 / L.d;
          const x = ((((hash1(i * 3.1 + li * 9) * sx + t * current * 40 * L.d) % sx) + sx) % sx) - sx / 2 + cam.x * L.d;
          const y = ((((hash1(i * 7.3 + li * 5) * sy + t * 6 * (0.5 + hash1(i))) % sy) + sy) % sy) - sy / 2 + cam.y * L.d;
          const r = L.r[0] + hash1(i * 2.7 + li) * (L.r[1] - L.r[0]);
          const tw = 0.6 + 0.4 * Math.sin(t * (0.8 + hash1(i) * 1.5) + i);
          return (
            <g key={i}>
              {glow > 0 && i % 5 === 0 && li < 2 && <circle cx={x} cy={y} r={r * 5} fill="#7ff3ff" opacity={0.12 * glow * tw} />}
              <circle cx={f1(x)} cy={f1(y)} r={r} fill={tint} opacity={L.op * tw} />
            </g>
          );
        })}
      </g>
    ))}
  </g>
);
