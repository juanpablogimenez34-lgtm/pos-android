// TIBURÓN DUENDE (Mitsukurina owstoni) — modelo 2.5D por componentes, vista lateral (hocico hacia +x).
// Anatomía representada (~660 u de longitud a escala 1):
//  · hocico (rostro) largo, estrecho y aplanado, que sobresale por delante y por encima de la boca;
//  · ojo pequeño detrás de la base del hocico; cinco hendiduras branquiales;
//  · mandíbulas PROTRUSIBLES: la superior (palatocuadrado) y la inferior (cartílago de Meckel) son
//    piezas independientes que AVANZAN y bajan respecto al cráneo (el cráneo no se mueve); la
//    inferior además rota para abrir la boca; una membrana rosada une las mandíbulas al cráneo;
//  · dientes largos y finos (anteriores) en ambas mandíbulas;
//  · cuerpo alargado y blando, piel gris rosada con brillo translúcido;
//  · aletas pectorales pequeñas y redondeadas, dos dorsales bajas y similares, pélvicas y anal
//    redondeadas (la anal grande y cerca de la cola), cola larga con el lóbulo superior bajo y sin
//    lóbulo inferior marcado; márgenes de las aletas azulados.
// Animación: ondulación del cuerpo, batido de cola (escorzo 2.5D del lóbulo), aletas que se ajustan,
// giro 3D simulado (yaw), inclinación (pitch), protrusión y apertura de mandíbulas, luz de borde.
import React from 'react';
import {clamp, lerp, mixColor} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
type V = {x: number; y: number};

export const SHARK = {
  back: '#9a7482',
  mid: '#cf9aa6',
  belly: '#f0ccd0',
  outline: '#2e1820',
  finEdge: '#7a8ab8',
  gum: '#e87a8a',
  tooth: '#f6f2ea',
  eye: '#0a0d18',
};

export type SharkPose = {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  t: number;
  yaw: number; // −1…1: giro hacia/desde la cámara (escorzo)
  pitch: number; // inclinación (rad)
  beat: number; // fase del batido de cola
  swim: number; // amplitud de natación 0…1
  jaw: number; // protrusión de las mandíbulas 0…1
  open: number; // apertura de la boca 0…1
  light: string; // color de la luz de borde
  rim: number; // intensidad de la luz de borde
  exposure: number; // 0 silueta en la oscuridad … 1 iluminado
  opacity: number;
  xray: number; // 0…1 vista anatómica (mandíbulas resaltadas)
};

export const sharkPose = (o: Partial<SharkPose> = {}): SharkPose => ({
  x: 0,
  y: 0,
  scale: 1,
  facing: 1,
  t: 0,
  yaw: 0,
  pitch: 0,
  beat: 0,
  swim: 1,
  jaw: 0,
  open: 0,
  light: '#7fd8ff',
  rim: 0.6,
  exposure: 1,
  opacity: 1,
  xray: 0,
  ...o,
});

const XS = [215, 175, 125, 65, 5, -55, -115, -165, -205, -245, -285, -330];
const HT = [22, 40, 50, 54, 52, 46, 37, 27, 18, 12, 8, 3];
const HB = [24, 40, 47, 49, 47, 42, 34, 24, 15, 10, 6, 3];

/** Columna con la ondulación (crece hacia la cola). */
export function sharkSpine(p: SharkPose): V[] {
  return XS.map((x, i) => {
    const u = i / (XS.length - 1);
    const y = p.swim * 9 * Math.sin(p.beat - u * 2.6) * u * u + p.swim * 2 * Math.sin(p.beat * 0.5);
    return {x, y};
  });
}

/** Geometría de las mandíbulas según protrusión y apertura (coordenadas locales). */
export function jawGeom(p: SharkPose) {
  const dx = 52 * p.jaw;
  const dy = 16 * p.jaw;
  const hingeU = {x: 150 + dx, y: 20 + dy};
  const hingeL = {x: 150 + dx, y: 26 + dy};
  const aU = -0.12 * p.open; // la superior se eleva un poco
  const aL = 0.75 * p.open; // la inferior rota hacia abajo
  const rotA = (pt: V, c: V, a: number) => ({x: c.x + (pt.x - c.x) * Math.cos(a) - (pt.y - c.y) * Math.sin(a), y: c.y + (pt.x - c.x) * Math.sin(a) + (pt.y - c.y) * Math.cos(a)});
  const U = [{x: 0, y: 0}, {x: 30, y: -3}, {x: 56, y: 2}, {x: 60, y: 8}, {x: 30, y: 9}, {x: 0, y: 8}].map((q) => rotA({x: hingeU.x + q.x, y: hingeU.y + q.y}, hingeU, aU));
  const Lw = [{x: 0, y: 0}, {x: 30, y: 2}, {x: 54, y: 2}, {x: 56, y: 9}, {x: 28, y: 14}, {x: 0, y: 11}].map((q) => rotA({x: hingeL.x + q.x, y: hingeL.y + q.y}, hingeL, aL));
  const teethU = Array.from({length: 8}, (_, i) => {
    const k = 0.15 + i * 0.1;
    const b = rotA({x: hingeU.x + 8 + k * 50, y: hingeU.y + 8}, hingeU, aU);
    const tip = rotA({x: hingeU.x + 4 + k * 50, y: hingeU.y + 8 + 13 + (i > 4 ? 4 : 0)}, hingeU, aU);
    return {b, tip};
  });
  const teethL = Array.from({length: 8}, (_, i) => {
    const k = 0.15 + i * 0.1;
    const b = rotA({x: hingeL.x + 6 + k * 48, y: hingeL.y + 2}, hingeL, aL);
    const tip = rotA({x: hingeL.x + 3 + k * 48, y: hingeL.y + 2 - 13 - (i > 4 ? 4 : 0)}, hingeL, aL);
    return {b, tip};
  });
  return {U, L: Lw, teethU, teethL, hingeU, hingeL, mouth: rotA({x: hingeL.x + 50, y: hingeL.y + 4}, hingeL, aL * 0.5)};
}

const poly = (pts: V[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ') + 'Z';

export const GoblinShark: React.FC<{p: SharkPose; uid: string}> = ({p, uid}) => {
  const S = sharkSpine(p);
  const top = S.map((s, i) => ({x: s.x, y: s.y - HT[i]}));
  const bot = S.map((s, i) => ({x: s.x, y: s.y + HB[i]}));
  const tail = S[S.length - 1];
  const tailBeat = Math.sin(p.beat - 2.6);
  // cuerpo: contorno suave (dorso → cola → vientre)
  const body =
    `M${f1(top[0].x)},${f1(top[0].y)} ` +
    top
      .slice(1)
      .map((q, i) => `Q${f1((top[i].x + q.x) / 2 + 4)},${f1(Math.min(top[i].y, q.y) - 2)} ${f1(q.x)},${f1(q.y)}`)
      .join(' ') +
    ` L${f1(tail.x - 6)},${f1(tail.y)} ` +
    bot
      .slice()
      .reverse()
      .map((q) => `L${f1(q.x)},${f1(q.y)}`)
      .join(' ') +
    ` Q${f1(232)},${f1(S[0].y + 18)} ${f1(top[0].x + 8)},${f1(top[0].y + 6)}Z`;
  const at = (i: number) => S[Math.max(0, Math.min(S.length - 1, i))];
  const yawK = Math.max(0.32, Math.cos(p.yaw * 1.2));
  const tone = clamp(p.exposure);
  const dk = (c: string) => mixColor('#0a0e1c', c, 0.12 + 0.88 * tone);
  const J = jawGeom(p);
  const flap = Math.sin(p.t * 1.4) * 0.12;
  // aleta genérica: base a–b y punta c (con curva)
  const fin = (a: V, b: V, c: V, bulge = 0.5) => {
    const nx = -(c.y - a.y);
    const ny = c.x - a.x;
    const l = Math.hypot(nx, ny) || 1;
    const out = 10 * bulge;
    const P1 = {x: lerp(a.x, c.x, 0.45) - (nx / l) * out, y: lerp(a.y, c.y, 0.45) - (ny / l) * out};
    const T1 = {x: lerp(a.x, c.x, 0.82), y: lerp(a.y, c.y, 0.82)};
    const T2 = {x: lerp(c.x, b.x, 0.22), y: lerp(c.y, b.y, 0.22)};
    const P2 = {x: lerp(c.x, b.x, 0.6), y: lerp(c.y, b.y, 0.6)};
    return `M${f1(a.x)},${f1(a.y)} Q${f1(P1.x)},${f1(P1.y)} ${f1(T1.x)},${f1(T1.y)} Q${f1(c.x)},${f1(c.y)} ${f1(T2.x)},${f1(T2.y)} Q${f1(P2.x)},${f1(P2.y)} ${f1(b.x)},${f1(b.y)}Z`;
  };
  const rot = (pt: V, c: V, a: number) => ({x: c.x + (pt.x - c.x) * Math.cos(a) - (pt.y - c.y) * Math.sin(a), y: c.y + (pt.x - c.x) * Math.sin(a) + (pt.y - c.y) * Math.cos(a)});
  // aletas pegadas a la columna (se mueven con la ondulación)
  const pecBase = at(3);
  const pecA = {x: 100, y: pecBase.y + 38};
  const pecB = {x: 72, y: pecBase.y + 42};
  const pecC = rot({x: 48, y: pecBase.y + 72}, pecA, flap);
  const pelv = at(6);
  const anal = at(8);
  const d1 = at(5);
  const d2 = at(7);
  // cola: el lóbulo se acorta al batir (escorzo) y oscila
  const cs = 1 - 0.35 * Math.abs(tailBeat) * p.swim;
  const cy = tail.y + tailBeat * 6 * p.swim;
  const tb9 = at(9);
  const caudal = `M${f1(-238)},${f1(tb9.y - 13)} Q${f1(-290)},${f1(cy - 26)} ${f1(-238 - 140 * cs)},${f1(cy - 40)} Q${f1(-238 - 150 * cs)},${f1(cy - 30)} ${f1(-238 - 132 * cs)},${f1(cy - 22)} Q${f1(-238 - 96 * cs)},${f1(cy - 4)} ${f1(-238 - 62 * cs)},${f1(cy + 26)} Q${f1(-238 - 44 * cs)},${f1(cy + 36)} ${f1(-238 - 28 * cs)},${f1(cy + 22)} Q${f1(-232)},${f1(tb9.y + 14)} ${f1(-226)},${f1(tb9.y + 9)}Z`;
  const T = `translate(${f1(p.x)} ${f1(p.y)}) scale(${(p.scale * p.facing * yawK).toFixed(4)} ${p.scale.toFixed(4)}) rotate(${f1((p.pitch * 180) / Math.PI)})`;
  const membrane = `M${f1(132)},${f1(22)} L${f1(J.hingeU.x + 6)},${f1(J.hingeU.y)} L${f1(J.hingeL.x + 4)},${f1(J.hingeL.y + 12)} L${f1(130)},${f1(36)}Z`;
  return (
    <g opacity={p.opacity}>
      <defs>
        <linearGradient id={`gb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dk(SHARK.back)} />
          <stop offset="0.5" stopColor={dk(SHARK.mid)} />
          <stop offset="1" stopColor={dk(SHARK.belly)} />
        </linearGradient>
        <linearGradient id={`gf-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dk(SHARK.mid)} />
          <stop offset="1" stopColor={dk(SHARK.finEdge)} />
        </linearGradient>
        <linearGradient id={`gr-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={dk('#b8909c')} />
          <stop offset="1" stopColor={dk('#e0b4bc')} />
        </linearGradient>
      </defs>
      <g transform={T}>
        {/* aleta pectoral del lado lejano (detrás) */}
        <path d={fin({x: pecA.x - 6, y: pecA.y - 4}, {x: pecB.x - 6, y: pecB.y - 4}, rot({x: 58, y: pecBase.y + 74}, pecA, -flap))} fill={dk('#8a6a78')} opacity={0.7 * (1 - Math.abs(p.yaw) * 0.3)} />
        {/* cola */}
        <path d={caudal} fill={`url(#gf-${uid})`} stroke={SHARK.outline} strokeWidth={3} strokeLinejoin="round" />
        {/* aletas dorsales, pélvica y anal */}
        <path d={fin({x: -46, y: d1.y - 44}, {x: -112, y: d1.y - 37}, {x: -106, y: d1.y - 74}, 1)} fill={`url(#gf-${uid})`} stroke={SHARK.outline} strokeWidth={3} />
        <path d={fin({x: -124, y: d2.y - 33}, {x: -180, y: d2.y - 24}, {x: -174, y: d2.y - 58}, 1)} fill={`url(#gf-${uid})`} stroke={SHARK.outline} strokeWidth={3} />
        <path d={fin({x: -72, y: pelv.y + 32}, {x: -116, y: pelv.y + 30}, rot({x: -122, y: pelv.y + 58}, {x: -72, y: pelv.y + 32}, flap * 0.5), -1)} fill={`url(#gf-${uid})`} stroke={SHARK.outline} strokeWidth={3} />
        <path d={fin({x: -162, y: anal.y + 20}, {x: -228, y: anal.y + 11}, {x: -222, y: anal.y + 50}, -1.2)} fill={`url(#gf-${uid})`} stroke={SHARK.outline} strokeWidth={3} />
        {/* membrana bucal (visible al proyectar) */}
        {p.jaw > 0.02 && <path d={membrane} fill={dk('#d88a96')} stroke={SHARK.outline} strokeWidth={2} opacity={0.95} />}
        {/* mandíbula inferior (detrás del cuerpo cuando está retraída) */}
        <g>
          <path d={poly(J.L)} fill={dk(p.xray > 0.01 ? mixColor(SHARK.gum, '#ffd23f', p.xray) : SHARK.gum)} stroke={SHARK.outline} strokeWidth={2.5} />
          {J.teethL.map((tt, i) => (
            <path key={`l${i}`} d={`M${f1(tt.b.x - 1.6)},${f1(tt.b.y)} L${f1(tt.tip.x)},${f1(tt.tip.y)} L${f1(tt.b.x + 1.6)},${f1(tt.b.y)}Z`} fill={dk(SHARK.tooth)} opacity={0.35 + 0.65 * Math.max(p.open, p.jaw * 0.6)} />
          ))}
        </g>
        {/* hocico largo y aplanado (detrás del contorno de la cabeza: sin costuras) */}
        <path d={`M140,${f1(S[1].y - 42)} Q240,${f1(S[0].y - 50)} 326,${f1(S[0].y - 36)} Q340,${f1(S[0].y - 30)} 328,${f1(S[0].y - 22)} Q262,${f1(S[0].y - 13)} 196,${f1(S[0].y - 4)} L150,${f1(S[1].y - 6)} Z`} fill={`url(#gr-${uid})`} stroke={SHARK.outline} strokeWidth={3.5} strokeLinejoin="round" />
        {/* cuerpo */}
        <path d={body} fill={`url(#gb-${uid})`} stroke={SHARK.outline} strokeWidth={4} strokeLinejoin="round" />
        {/* brillo translúcido de la piel (vasos capilares sugeridos) y luz de borde */}
        <path d={top.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y + 4)}`).join(' ')} stroke={p.light} strokeWidth={5} fill="none" opacity={p.rim * (0.4 + 0.6 * tone)} strokeLinecap="round" />
        <path d={S.slice(1, 8).map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y - 10)}`).join(' ')} stroke="#ffffff" strokeWidth={9} fill="none" opacity={0.12 * tone} strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <path key={`v${i}`} d={`M${f1(40 - i * 50)},${f1(at(4 + i).y + 4)} q20,8 44,2`} stroke="#b8606e" strokeWidth={2} fill="none" opacity={0.25 * tone} />
        ))}
        {/* hendiduras branquiales */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`g${i}`} d={`M${f1(118 - i * 9)},${f1(at(2).y - 12)} q-6,20 ${f1(-2)},${f1(40 - i * 2)}`} stroke={dk('#7a4a58')} strokeWidth={2.5} fill="none" />
        ))}
        {/* aleta pectoral cercana */}
        <path d={fin(pecA, pecB, pecC, 0.55)} fill={`url(#gf-${uid})`} stroke={SHARK.outline} strokeWidth={3} />
        {/* mandíbula superior (bajo el hocico) */}
        <g>
          <path d={poly(J.U)} fill={dk(p.xray > 0.01 ? mixColor(SHARK.gum, '#7ff3ff', p.xray) : SHARK.gum)} stroke={SHARK.outline} strokeWidth={2.5} />
          {J.teethU.map((tt, i) => (
            <path key={`u${i}`} d={`M${f1(tt.b.x - 1.6)},${f1(tt.b.y)} L${f1(tt.tip.x)},${f1(tt.tip.y)} L${f1(tt.b.x + 1.6)},${f1(tt.b.y)}Z`} fill={dk(SHARK.tooth)} opacity={0.35 + 0.65 * Math.max(p.open, p.jaw * 0.6)} />
          ))}
        </g>
        {/* labio inferior del cráneo que tapa las mandíbulas retraídas */}
        <path d={`M120,${f1(S[2].y + 30)} Q170,${f1(S[1].y + 34 + 6 * p.jaw)} 214,${f1(S[0].y + 18)}`} stroke={SHARK.outline} strokeWidth={3} fill="none" opacity={0.8 - 0.5 * p.jaw} />
        {/* poros (ampollas de Lorenzini) del hocico */}
        {Array.from({length: 22}, (_, i) => (
          <circle key={`a${i}`} cx={190 + (i % 11) * 12} cy={S[0].y - 36 + Math.floor(i / 11) * 9 + (i % 3)} r={1.6} fill={dk('#6a3a48')} opacity={0.7} />
        ))}
        <path d={`M200,${f1(S[0].y - 44)} Q262,${f1(S[0].y - 48)} 322,${f1(S[0].y - 39)}`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.3 * tone} />
        {/* ojo pequeño */}
        <ellipse cx={164} cy={S[1].y - 14} rx={8} ry={6.5} fill={SHARK.eye} stroke={dk('#5a3a48')} strokeWidth={2} />
        <circle cx={166} cy={S[1].y - 16} r={2.2} fill={p.light} opacity={0.9} />
        {/* resaltado anatómico de las mandíbulas */}
        {p.xray > 0.01 && (
          <g opacity={p.xray}>
            <path d={poly(J.U)} fill="none" stroke="#7ff3ff" strokeWidth={4} />
            <path d={poly(J.L)} fill="none" stroke="#ffd23f" strokeWidth={4} />
          </g>
        )}
      </g>
    </g>
  );
};

/** Punto local del modelo → coordenadas del padre. */
export function sharkPoint(p: SharkPose, lx: number, ly: number): V {
  const yawK = Math.max(0.32, Math.cos(p.yaw * 1.2));
  const c = Math.cos(p.pitch);
  const s = Math.sin(p.pitch);
  const rx = lx * c - ly * s;
  const ry = lx * s + ly * c;
  return {x: p.x + rx * p.scale * p.facing * yawK, y: p.y + ry * p.scale};
}
export const SHARK_ANCHORS = {snoutTip: [330, -31], snout: [262, -32], eye: [164, -14], mouth: [205, 30], gills: [104, 6], pectoral: [70, 62], dorsal: [-80, -70], tail: [-320, -20], teeth: [190, 26]} as const;
