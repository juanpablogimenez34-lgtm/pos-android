// Tardígrado (filo Tardigrada), ilustración científica genérica de un eutardígrado
// de musgo: cabeza + 4 segmentos del tronco, cutícula semitransparente, cuatro pares
// de patas lobópodas con garras (el 4.º par, terminal, orientado hacia atrás),
// aparato bucal con tubo y bulbo faríngeo, manchas oculares, intestino visible y
// células de reserva en la cavidad corporal.
//
// Estado de "tonel" (anhidrobiosis): el cuerpo se acorta, retrae cabeza y patas y la
// cutícula se arruga. NO se representa como muerte: el animal permanece entero.
//
// La pose es una función pura: la marcha depende de la distancia recorrida (las
// garras quedan fijas en el sustrato durante el apoyo) y no de estado acumulado.

import React, {useMemo} from 'react';
import {clamp, lerp, mixColor, rng, smoothPath, TAU, Vec} from '../../engine/math';

export type TardiParams = {
  t: number;
  x: number;
  y: number; // línea del sustrato bajo las patas (mundo)
  scale: number;
  facing: 1 | -1;
  slope: number; // inclinación del sustrato (rad)
  dist: number; // distancia recorrida (mundo) → fase de la marcha
  activity: number; // 0 inmóvil … 1 activo (movimientos de búsqueda, flexión)
  tun: number; // 0 activo … 1 tonel
  look: number; // −1…1 cabeza baja/alta
};

const SEG_X = [100, 52, 2, -48, -94]; // cabeza → extremo posterior
const SEG_R = [36, 46, 49, 47, 40];
const GROUND = 92; // distancia del centro del cuerpo a la línea de apoyo (local)
const STRIDE = 70; // longitud de paso (local)
const DUTY = 0.62;

export type LegPose = {base: Vec; knee: Vec; foot: Vec; far: boolean; pair: number; claw: number};
export type TardiPose = {
  p: TardiParams;
  centers: Vec[];
  radii: number[];
  outline: Vec[];
  legs: LegPose[];
  toWorld: (v: Vec) => Vec;
  headWorld: Vec;
  centerWorld: Vec;
};

export function tardiPose(p: TardiParams): TardiPose {
  const {t} = p;
  const tun = clamp(p.tun);
  const act = clamp(p.activity) * (1 - tun);
  const s = p.scale;
  const toWorld = (v: Vec): Vec => {
    const c = Math.cos(p.slope);
    const sn = Math.sin(p.slope);
    const lx = v.x * s * p.facing;
    const ly = (v.y - GROUND) * s;
    return {x: p.x + lx * c - ly * sn, y: p.y + lx * sn + ly * c};
  };
  const phase = p.dist / (STRIDE * s);
  const bob = Math.sin(phase * TAU * 2) * 2 * act;
  // cuerpo: los segmentos se acercan en el tonel; flexión suave al caminar/buscar
  const centers: Vec[] = SEG_X.map((x, k) => {
    const shrink = 1 - 0.5 * tun;
    const flex = Math.sin(t * 0.9 + k * 0.8) * 5 * act + Math.sin(phase * TAU + k) * 2 * act;
    const head = k === 0 ? p.look * 10 * (1 - tun) + Math.sin(t * 0.7) * 4 * act : 0;
    return {x: x * shrink + (k === 0 ? -14 * tun : 0), y: bob + flex - head + 6 * tun};
  });
  const radii = SEG_R.map((r, k) => r * (1 + 0.1 * tun) * (k === 0 ? 1 - 0.2 * tun : 1));
  // contorno: crestas por segmento y constricciones entre ellos
  const top: Vec[] = [];
  const bot: Vec[] = [];
  for (let k = 0; k < centers.length; k++) {
    top.push({x: centers[k].x, y: centers[k].y - radii[k]});
    bot.push({x: centers[k].x, y: centers[k].y + radii[k] * 0.92});
    if (k < centers.length - 1) {
      const mx = (centers[k].x + centers[k + 1].x) / 2;
      const my = (centers[k].y + centers[k + 1].y) / 2;
      const mr = ((radii[k] + radii[k + 1]) / 2) * lerp(0.9, 0.96, tun);
      top.push({x: mx, y: my - mr});
      bot.push({x: mx, y: my + mr * 0.9});
    }
  }
  const head = centers[0];
  const rear = centers[centers.length - 1];
  const outline: Vec[] = [
    {x: head.x + radii[0] * 0.98, y: head.y - 4},
    ...top,
    {x: rear.x - radii[4] * 0.95, y: rear.y + 2},
    ...[...bot].reverse(),
    {x: head.x + radii[0] * 0.8, y: head.y + radii[0] * 0.55},
  ];
  // patas: 4 pares (segmentos 1–4), lado cercano y lado lejano
  const legs: LegPose[] = [];
  for (let pair = 0; pair < 4; pair++) {
    for (const far of [true, false]) {
      const k = pair + 1;
      const c = centers[k];
      const r = radii[k];
      const off = (3 - pair) * 0.25 + (far ? 0.5 : 0);
      const ph = (((phase + off) % 1) + 1) % 1;
      const ext = 1 - tun;
      const base = {x: c.x + (far ? 6 : 0), y: c.y + r * 0.62};
      const restX = pair === 3 ? c.x - 34 : c.x + 4;
      let fx: number;
      let lift = 0;
      if (ph < DUTY) {
        fx = restX + (0.5 - ph / DUTY) * STRIDE * DUTY;
      } else {
        const u = (ph - DUTY) / (1 - DUTY);
        fx = restX + (-0.5 + u) * STRIDE * DUTY;
        lift = Math.sin(Math.PI * u) * 16;
      }
      // en reposo: pequeños movimientos de "agarre"
      const idle = Math.sin(t * 1.6 + pair * 1.3 + (far ? 2 : 0)) * 3 * clamp(p.activity) * (1 - tun);
      const groundY = GROUND - (far ? 6 : 0) - lift * Math.min(1, act * 3 + 0.2) + idle;
      const footFull = {x: fx + (far ? 6 : 0), y: groundY};
      const foot = {x: lerp(base.x, footFull.x, ext), y: lerp(base.y + 2, footFull.y, ext)};
      const knee = {x: (base.x + foot.x) / 2 + (pair === 3 ? -8 : 7) * ext, y: (base.y + foot.y) / 2 - 2};
      legs.push({base, knee, foot, far, pair, claw: ext});
    }
  }
  return {p, centers, radii, outline, legs, toWorld, headWorld: toWorld({x: head.x + radii[0], y: head.y}), centerWorld: toWorld(centers[2])};
}

const CUT = {base: '#e6cf9f', edge: '#b88b52', dry: '#8f6a3c', dryEdge: '#5e4122', claw: '#4e3218', gut: '#6f9a3a'};

const Leg: React.FC<{leg: LegPose; fill: string; edge: string}> = ({leg, fill, edge}) => {
  const {base, knee, foot, claw} = leg;
  const dx = foot.x - base.x;
  const dy = foot.y - base.y;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d;
  const ny = dx / d;
  const w0 = 12;
  const w1 = 8;
  const pts = [
    {x: base.x + nx * w0, y: base.y + ny * w0},
    {x: knee.x + nx * (w0 + w1) * 0.55, y: knee.y + ny * (w0 + w1) * 0.55},
    {x: foot.x + nx * w1, y: foot.y + ny * w1},
    {x: foot.x + dx / d * 6, y: foot.y + dy / d * 6},
    {x: foot.x - nx * w1, y: foot.y - ny * w1},
    {x: knee.x - nx * (w0 + w1) * 0.5, y: knee.y - ny * (w0 + w1) * 0.5},
    {x: base.x - nx * w0, y: base.y - ny * w0},
  ];
  return (
    <g>
      <path d={smoothPath(pts, true)} fill={fill} stroke={edge} strokeOpacity={0.6} strokeWidth={1.4} />
      {/* pliegues telescópicos */}
      <path d={`M${(base.x + knee.x) / 2 - nx * 9},${(base.y + knee.y) / 2 - ny * 9} q${nx * 9},${ny * 9 + 3} ${nx * 18},${ny * 18}`} stroke={edge} strokeOpacity={0.35} strokeWidth={1.2} fill="none" />
      {claw > 0.15 &&
        [-1, 1].map((sgn) => (
          <g key={sgn} opacity={clamp((claw - 0.15) / 0.4)}>
            <path
              d={`M${foot.x + sgn * 3},${foot.y + 4} q${6 + sgn * 2},${6} ${12 + sgn * 3},${2} q-3,1 -8,-2Z`}
              fill={CUT.claw}
            />
            <path d={`M${foot.x + sgn * 2},${foot.y + 5} q${3},${6} ${8},${6}`} stroke={CUT.claw} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          </g>
        ))}
    </g>
  );
};

export const Tardigrade: React.FC<{id: string; pose: TardiPose; dryness?: number; light?: number}> = ({id, pose, dryness = 0, light = 1}) => {
  const {p, centers, radii, outline, legs} = pose;
  const tun = clamp(p.tun);
  const dry = Math.max(clamp(dryness) * 0.6, tun);
  const base = mixColor(CUT.base, CUT.dry, dry);
  const edge = mixColor(CUT.edge, CUT.dryEdge, dry);
  const cells = useMemo(() => {
    const r = rng(303);
    return Array.from({length: 26}, () => ({k: 1 + r() * 3, v: (r() - 0.5) * 1.2, rad: 3 + r() * 4, ph: r() * 10}));
  }, []);
  const grains = useMemo(() => {
    const r = rng(304);
    return Array.from({length: 60}, () => ({k: r() * 4, v: (r() - 0.5) * 1.7, rad: 0.8 + r() * 1.6}));
  }, []);
  const at = (k: number, v: number): Vec => {
    const i = Math.min(3, Math.floor(k));
    const f = k - i;
    const c = {x: lerp(centers[i].x, centers[i + 1].x, f), y: lerp(centers[i].y, centers[i + 1].y, f)};
    const r = lerp(radii[i], radii[i + 1], f);
    return {x: c.x, y: c.y + v * r * 0.8};
  };
  const body = smoothPath(outline, true);
  const c = Math.cos(p.slope);
  const sn = Math.sin(p.slope);
  const tf = `matrix(${(c * p.scale * p.facing).toFixed(4)} ${(sn * p.scale * p.facing).toFixed(4)} ${(-sn * p.scale).toFixed(4)} ${(c * p.scale).toFixed(4)} ${p.x.toFixed(2)} ${p.y.toFixed(2)}) translate(0 ${-GROUND})`;
  const far = legs.filter((l) => l.far);
  const near = legs.filter((l) => !l.far);
  const gut = [at(0.6, 0.05), at(1.5, 0.15), at(2.5, 0.12), at(3.4, 0.05), at(3.4, 0.3), at(2.5, 0.45), at(1.5, 0.45), at(0.6, 0.3)];
  const h = centers[0];
  const hr = radii[0];
  return (
    <g transform={tf}>
      <defs>
        <radialGradient id={`${id}-cut`} gradientUnits="userSpaceOnUse" cx={h.x - 60} cy={h.y - 50} r={230}>
          <stop offset="0" stopColor={mixColor(base, '#ffffff', 0.35)} stopOpacity={0.95} />
          <stop offset="0.55" stopColor={base} stopOpacity={0.88} />
          <stop offset="1" stopColor={edge} stopOpacity={0.95} />
        </radialGradient>
      </defs>
      {/* sombra de contacto */}
      <ellipse cx={0} cy={GROUND + 6} rx={140 * (1 - 0.4 * tun)} ry={10} fill="#0a1408" opacity={0.25 * light} />
      {far.map((l, i) => (
        <Leg key={`f${i}`} leg={l} fill={mixColor(base, '#3a2a14', 0.35)} edge={edge} />
      ))}
      <path d={body} fill={`url(#${id}-cut)`} stroke={edge} strokeWidth={1.8} />
      {/* interior visible a través de la cutícula */}
      <g opacity={0.75 * (1 - tun * 0.6)}>
        <path d={smoothPath(gut, true)} fill={CUT.gut} opacity={0.55} />
        {cells.map((cl, i) => {
          const q = at(cl.k + Math.sin(p.t * 0.3 + cl.ph) * 0.05, cl.v * 0.8);
          return <circle key={i} cx={q.x} cy={q.y} r={cl.rad} fill="#fbecc6" stroke="#c9a36a" strokeOpacity={0.6} strokeWidth={0.8} opacity={0.75} />;
        })}
        {/* aparato bucal: bulbo faríngeo con placoides + tubo bucal */}
        <ellipse cx={h.x - 4} cy={h.y + 2} rx={13} ry={11} fill="#d9b880" stroke="#8a6234" strokeWidth={1.4} />
        {[-4, 0, 4].map((dy, i) => (
          <rect key={i} x={h.x - 8} y={h.y + dy} width={8} height={2} rx={1} fill="#6e4a22" />
        ))}
        <line x1={h.x + 8} y1={h.y + 2} x2={h.x + hr * 0.95} y2={h.y - 2} stroke="#8a6234" strokeWidth={2.2} strokeLinecap="round" />
      </g>
      {/* surcos entre segmentos */}
      {centers.slice(0, -1).map((cc, i) => {
        const nx = (cc.x + centers[i + 1].x) / 2;
        const ny = (cc.y + centers[i + 1].y) / 2;
        const rr = (radii[i] + radii[i + 1]) / 2;
        return <path key={`s${i}`} d={`M${nx + 4},${ny - rr * 0.92} q${-9},${rr * 0.9} 0,${rr * 1.75}`} stroke={edge} strokeOpacity={0.55} strokeWidth={2.4} fill="none" strokeLinecap="round" />;
      })}
      {grains.map((g, i) => {
        const q = at(g.k, g.v);
        return <circle key={`g${i}`} cx={q.x} cy={q.y} r={g.rad} fill={edge} opacity={0.35} />;
      })}
      {/* arrugas de la cutícula en el tonel */}
      {tun > 0.05 &&
        centers.slice(1).map((cc, i) => (
          <path key={`w${i}`} d={`M${cc.x - 14},${cc.y - radii[i + 1] * 0.8} q${6},${radii[i + 1] * 0.8} 0,${radii[i + 1] * 1.6}`} stroke={CUT.dryEdge} strokeOpacity={0.5 * tun} strokeWidth={2.2} fill="none" />
        ))}
      {/* manchas oculares */}
      <circle cx={h.x + hr * 0.45} cy={h.y - hr * 0.42} r={3.6} fill="#2a1608" opacity={1 - tun * 0.7} />
      <circle cx={h.x + hr * 0.3} cy={h.y - hr * 0.48} r={2.6} fill="#2a1608" opacity={0.6 - tun * 0.4} />
      {/* luz de contorno */}
      <path d={smoothPath(outline.slice(0, 10))} stroke="#fffbe8" strokeOpacity={0.45 * light} strokeWidth={2.4} fill="none" />
      {near.map((l, i) => (
        <Leg key={`n${i}`} leg={l} fill={base} edge={edge} />
      ))}
    </g>
  );
};
