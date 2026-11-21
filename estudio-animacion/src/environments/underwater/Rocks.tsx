import React, {useMemo} from 'react';
import {fbm1, mixColor, profileAt, rng, smoothPath, Vec} from '../../engine/math';
import {useStyle} from '../../engine/style';
import {makeRock} from './geometry';
import {fog, UW} from './palette';

const ENCRUST = [UW.coralViolet, UW.sponge, UW.coralPink, UW.emerald];

type RockProps = {
  id: string;
  x: number;
  y: number; // base de la roca
  w: number;
  h: number;
  seed: number;
  fogAmt?: number; // 0 cerca … 1 lejos
  flip?: boolean;
  details?: boolean;
  darken?: number; // 0–1, para siluetas de primer plano
};

/** Roca ilustrada: degradado de volumen, luz cenital dorada, borde turquesa, poros, grietas e incrustaciones. */
export const Rock: React.FC<RockProps> = React.memo(({id, x, y, w, h, seed, fogAmt = 0, flip, details = true, darken = 0}) => {
  const g = useMemo(() => makeRock(seed, w, h), [seed, w, h]);
  const {refined} = useStyle();
  const dk = (c: string) => mixColor(c, '#03060f', darken);
  const lit = dk(fog(UW.rockLit, fogAmt));
  const mid = dk(fog(UW.rockMid, fogAmt));
  const dark = dk(fog(UW.rockDark, fogAmt * 0.85));
  const shadow = dk(fog(UW.rockShadow, fogAmt * 0.8));
  return (
    <g transform={`translate(${x} ${y - h * 0.3}) scale(${flip ? -1 : 1} 1)`}>
      <defs>
        <linearGradient id={`${id}-b`} x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor={lit} />
          <stop offset="0.35" stopColor={mid} />
          <stop offset="0.8" stopColor={dark} />
          <stop offset="1" stopColor={shadow} />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={UW.goldSoft} stopOpacity={0.42 * (1 - fogAmt)} />
          <stop offset="0.3" stopColor={UW.gold} stopOpacity={0} />
        </linearGradient>
      </defs>
      {refined && fogAmt < 0.6 && (
        // oclusión ambiental: la roca "pesa" sobre el sustrato
        <ellipse cx={0} cy={h * 0.31} rx={w * 0.6} ry={h * 0.11} fill="#05040f" opacity={0.4 * (1 - fogAmt)} />
      )}
      <path d={g.path} fill={`url(#${id}-b)`} />
      <path d={g.path} fill={`url(#${id}-l)`} />
      {details && (
        <>
          {g.pores.map((p, i) => (
            <ellipse
              key={i}
              cx={p.x}
              cy={p.y}
              rx={p.rx}
              ry={p.ry}
              transform={`rotate(${p.rot} ${p.x} ${p.y})`}
              fill={shadow}
              opacity={p.o * (1 - fogAmt * 0.7)}
            />
          ))}
          {g.cracks.map((d, i) => (
            <path key={i} d={d} stroke={shadow} strokeWidth={2.2} fill="none" opacity={0.55 * (1 - fogAmt)} strokeLinecap="round" />
          ))}
          {g.encrust.map((e, i) => (
            <g key={i} opacity={1 - fogAmt * 0.6}>
              <ellipse cx={e.x} cy={e.y} rx={e.r * 1.4} ry={e.r} fill={fog(ENCRUST[e.kind], fogAmt * 0.9)} />
              <ellipse cx={e.x - e.r * 0.3} cy={e.y - e.r * 0.35} rx={e.r * 0.6} ry={e.r * 0.35} fill="#ffffff" opacity={0.18} />
            </g>
          ))}
        </>
      )}
      <path d={g.topEdge} stroke={fog(UW.turquoise, fogAmt)} strokeWidth={2.5} fill="none" opacity={0.35 * (1 - fogAmt * 0.6)} strokeLinecap="round" />
    </g>
  );
});

/** Plataforma rocosa por la que camina el protagonista. La silueta sale del MISMO
 * perfil que usa la física de los brazos, así los apoyos coinciden con lo dibujado. */
export const RockShelf: React.FC<{id: string; profile: [number, number][]; bottom: number; seed?: number}> = React.memo(
  ({id, profile, bottom, seed = 7}) => {
    const geo = useMemo(() => {
      const x0 = profile[0][0];
      const x1 = profile[profile.length - 1][0];
      const top: Vec[] = [];
      for (let x = x0; x <= x1; x += 18) {
        top.push({x, y: profileAt(profile, x) + fbm1(x * 0.03, seed, 2) * 6});
      }
      const body = smoothPath(top) + `L${x1},${bottom}L${x0},${bottom}Z`;
      // franja superior iluminada (superficie horizontal de la roca vista desde arriba)
      const band = smoothPath(top) + 'L' + [...top].reverse().map((p) => `${p.x},${p.y + 46 + fbm1(p.x * 0.02, seed + 3) * 18}`).join('L') + 'Z';
      const r = rng(seed);
      const pores = Array.from({length: Math.round((x1 - x0) / 9)}, () => {
        const x = x0 + r() * (x1 - x0);
        const y = profileAt(profile, x) + 60 + r() * (bottom - profileAt(profile, x) - 80);
        return {x, y, rx: 3 + r() * 14, ry: 2 + r() * 6, o: 0.15 + r() * 0.3};
      });
      const ledges = Array.from({length: Math.round((x1 - x0) / 140)}, (_, i) => {
        const x = x0 + (i + r()) * 140;
        const y = profileAt(profile, x) + 120 + r() * 260;
        const len = 80 + r() * 160;
        return smoothPath([
          {x, y},
          {x: x + len * 0.5, y: y - 8 - r() * 10},
          {x: x + len, y: y + r() * 8},
        ]);
      });
      const fuzz = Array.from({length: Math.round((x1 - x0) / 7)}, () => {
        const x = x0 + r() * (x1 - x0);
        const y = profileAt(profile, x) + 2;
        const h = 6 + r() * 16;
        return {x, y, h, lean: (r() - 0.5) * 8, c: r() < 0.7 ? 0 : r() < 0.5 ? 1 : 2};
      });
      return {body, band, pores, ledges, fuzz};
    }, [profile, bottom, seed]);
    const fuzzCol = [UW.olive, UW.emerald, UW.coralPink];
    return (
      <g>
        <defs>
          <linearGradient id={`${id}-face`} gradientUnits="userSpaceOnUse" x1="0" y1={profile[0][1]} x2="0" y2={bottom}>
            <stop offset="0" stopColor={UW.rockMid} />
            <stop offset="0.35" stopColor={UW.rockDark} />
            <stop offset="1" stopColor={UW.rockShadow} />
          </linearGradient>
          <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fb8a6" />
            <stop offset="0.5" stopColor={UW.rockLit} />
            <stop offset="1" stopColor={UW.rockMid} />
          </linearGradient>
        </defs>
        <path d={geo.body} fill={`url(#${id}-face)`} />
        {geo.pores.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={UW.rockShadow} opacity={p.o} />
        ))}
        {geo.ledges.map((d, i) => (
          <g key={i}>
            <path d={d} stroke={UW.rockLit} strokeOpacity={0.35} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d={d} transform="translate(0 6)" stroke={UW.rockShadow} strokeOpacity={0.6} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <path d={geo.band} fill={`url(#${id}-band)`} />
        {geo.fuzz.map((f, i) => (
          <path
            key={i}
            d={`M${f.x},${f.y}q${f.lean * 0.5},${-f.h * 0.6} ${f.lean},${-f.h}`}
            stroke={fuzzCol[f.c]}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
            opacity={0.75}
          />
        ))}
      </g>
    );
  },
);

/** Gran formación con cueva. La boca oscura queda DETRÁS del protagonista. */
export const CaveFormation: React.FC<{id: string; mouth: {x: number; y: number; rx: number; ry: number}; seed?: number}> =
  React.memo(({id, mouth, seed = 31}) => {
    const geo = useMemo(() => {
      const r = rng(seed);
      const {x, y, rx, ry} = mouth;
      // masa rocosa grande alrededor de la boca
      const mass: Vec[] = [];
      const n = 34;
      for (let i = 0; i < n; i++) {
        const a = Math.PI + (i / (n - 1)) * Math.PI; // semicírculo superior
        const rad = 1 + fbm1(i * 0.5, seed, 3) * 0.22;
        mass.push({x: x + Math.cos(a) * rx * 2.6 * rad - rx * 0.6, y: y + 40 + Math.sin(a) * ry * 4.2 * rad});
      }
      const massPath = smoothPath(mass) + `L${x + rx * 2.2},${y + 160}L${x - rx * 3.4},${y + 160}Z`;
      // boca irregular
      const mouthPts: Vec[] = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const k = 1 + fbm1(i * 0.7, seed + 5, 2) * 0.16;
        let py = y + Math.sin(a) * ry * k;
        if (py > y + ry * 0.55) py = y + ry * 0.55 + (py - y - ry * 0.55) * 0.2;
        mouthPts.push({x: x + Math.cos(a) * rx * k, y: py});
      }
      const facets = Array.from({length: 14}, () => {
        const a = Math.PI * (1.05 + r() * 0.9);
        const d = 1.15 + r() * 1.6;
        const px = x - rx * 0.4 + Math.cos(a) * rx * d * 1.8;
        const py = y + Math.sin(a) * ry * d * 1.6;
        const s = 30 + r() * 70;
        return {d: smoothPath([{x: px - s, y: py + s * 0.2}, {x: px, y: py - s * 0.25}, {x: px + s, y: py + s * 0.15}]), w: 3 + r() * 4};
      });
      const pores = Array.from({length: 70}, () => {
        const a = Math.PI * (1.02 + r() * 0.96);
        const d = Math.sqrt(r());
        return {
          x: x - rx * 0.6 + Math.cos(a) * rx * 2.4 * d,
          y: y + 40 + Math.sin(a) * ry * 3.9 * d,
          rx: 3 + r() * 16,
          ry: 2 + r() * 7,
          o: 0.15 + r() * 0.35,
        };
      });
      const tops = mass.filter((_, i) => i > 3 && i < n - 3);
      const growth = Array.from({length: 40}, () => {
        const p = tops[Math.floor(r() * tops.length)];
        return {x: p.x + (r() - 0.5) * 20, y: p.y + 6 + r() * 10, h: 8 + r() * 26, lean: (r() - 0.5) * 14, c: Math.floor(r() * 4)};
      });
      return {massPath, mouthPath: smoothPath(mouthPts, true), facets, pores, growth};
    }, [mouth, seed]);
    const {x, y, rx, ry} = mouth;
    return (
      <g>
        <defs>
          <linearGradient id={`${id}-m`} x1="0.3" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor={UW.rockLit} />
            <stop offset="0.18" stopColor={UW.rockMid} />
            <stop offset="0.75" stopColor={UW.rockDark} />
            <stop offset="1" stopColor={UW.rockShadow} />
          </linearGradient>
          <linearGradient id={`${id}-ml`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={UW.goldSoft} stopOpacity={0.3} />
            <stop offset="0.16" stopColor={UW.gold} stopOpacity={0} />
          </linearGradient>
          <radialGradient id={`${id}-in`} cx="0.55" cy="0.55" r="0.6">
            <stop offset="0" stopColor="#020309" />
            <stop offset="0.6" stopColor="#070a1c" />
            <stop offset="1" stopColor={UW.violetDeep} />
          </radialGradient>
        </defs>
        <path d={geo.massPath} fill={`url(#${id}-m)`} />
        <path d={geo.massPath} fill={`url(#${id}-ml)`} />
        <clipPath id={`${id}-clip`}>
          <path d={geo.massPath} />
        </clipPath>
        <g clipPath={`url(#${id}-clip)`}>
          {geo.pores.map((p, i) => (
            <ellipse key={`p${i}`} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={UW.rockShadow} opacity={p.o} />
          ))}
          {geo.facets.map((f, i) => (
            <g key={i}>
              <path d={f.d} stroke={UW.rockLit} strokeOpacity={0.35} strokeWidth={f.w * 0.6} fill="none" strokeLinecap="round" />
              <path d={f.d} transform="translate(0 7)" stroke={UW.rockShadow} strokeOpacity={0.5} strokeWidth={f.w} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
        {geo.growth.map((g, i) =>
          g.c < 2 ? (
            <path key={`g${i}`} d={`M${g.x},${g.y}q${g.lean * 0.5},${-g.h * 0.6} ${g.lean},${-g.h}`} stroke={g.c ? UW.emerald : UW.olive} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
          ) : (
            <ellipse key={`g${i}`} cx={g.x} cy={g.y} rx={g.h * 0.35} ry={g.h * 0.22} fill={g.c === 2 ? UW.coralViolet : UW.sponge} opacity={0.9} />
          ),
        )}
        {/* sombra del dintel que cae sobre la boca */}
        <ellipse cx={x} cy={y - ry * 0.25} rx={rx * 1.35} ry={ry * 1.25} fill={UW.rockShadow} opacity={0.55} />
        <path d={geo.mouthPath} fill={`url(#${id}-in)`} />
        <path d={geo.mouthPath} fill="none" stroke={UW.turquoise} strokeOpacity={0.18} strokeWidth={3} />
      </g>
    );
  });

/** Oscuridad del interior de la cueva que se dibuja ENCIMA del protagonista. */
export const CaveShadow: React.FC<{id: string; mouth: {x: number; y: number; rx: number; ry: number}}> = ({id, mouth}) => (
  <g>
    <defs>
      <radialGradient id={`${id}-sh`} cx="0.45" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#010207" stopOpacity={0.97} />
        <stop offset="0.55" stopColor="#030616" stopOpacity={0.9} />
        <stop offset="1" stopColor="#050a20" stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={mouth.x - mouth.rx * 0.1} cy={mouth.y - mouth.ry * 0.1} rx={mouth.rx * 1.25} ry={mouth.ry * 1.3} fill={`url(#${id}-sh)`} />
  </g>
);

/** Oscuridad (0–1) en un punto, coherente con CaveShadow (para destellos de ojos). */
export function caveDarknessAt(mouth: {x: number; y: number; rx: number; ry: number}, p: Vec) {
  const dx = (p.x - (mouth.x - mouth.rx * 0.1)) / (mouth.rx * 1.25);
  const dy = (p.y - (mouth.y - mouth.ry * 0.1)) / (mouth.ry * 1.3);
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d >= 1) return 0;
  if (d < 0.55) return 0.97 - (d / 0.55) * 0.12;
  return 0.85 * (1 - (d - 0.55) / 0.45);
}
