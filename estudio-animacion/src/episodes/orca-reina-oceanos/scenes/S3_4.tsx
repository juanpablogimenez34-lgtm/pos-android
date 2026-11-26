// ESCENA 3 (45–70) UNA INTELIGENCIA EXTRAORDINARIA: grupo nadando en formación; una orca emite clics (VISUALIZACIÓN
//                  CIENTÍFICA, el sonido no es visible) que alcanzan un cardumen y vuelven como ecos; esquema de la
//                  ecolocalización (labios fónicos → melón → clics; ecos → mandíbula inferior → oído); llamadas entre
//                  integrantes que cambian la formación; dialectos familiares que pasan de madre a cría.
// ESCENA 4 (70–95) UNA MÁQUINA DE NATACIÓN: seguimiento lateral en aguas profundas; músculos dorsales y ventrales
//                  dibujados SOBRE el cuerpo (se deforman con él), flechas de la cola que sube y baja, aletas
//                  pectorales que gobiernan; sube, respira por el espiráculo (vías respiratorias: espiráculo → tráquea
//                  → pulmones; sin branquias) y vuelve a sumergirse.
import React from 'react';
import {clamp, lerp, smoothPath, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ClickFlash, ClickWaves} from '../../ep23-cachalote/environment/Ocean';
import {Orca, orcaPoint, OrcaPose, spine, uv} from '../character/Orca';
import {Key, pathAt, swim} from '../character/motion';
import {Brand, Card, Tag, Txt, win} from '../components/common';
import {Blow, Bubbles, Sea} from '../environment/Sea';

const bc = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 6 * k, y: c.y + Math.sin(t * 0.29 + 1) * 5 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});

// ---------------------------------------------------------------- ESCENA 3
const LEAD: Key[] = [[44, -900, 900], [56, 300, 860], [64, 900, 820], [71, 1500, 880]];
const POD: {dx: number; dy: number; kind: 'male' | 'female' | 'calf'; s: number}[] = [
  {dx: -520, dy: -220, kind: 'female', s: 0.66}, {dx: -700, dy: 230, kind: 'male', s: 0.8}, {dx: -330, dy: 170, kind: 'calf', s: 0.42}, {dx: -980, dy: -40, kind: 'female', s: 0.64},
];
const CLICKS = Array.from({length: 18}, (_, i) => 51.8 + i * 0.36);
const FISH = {x: 1200, y: 700};
export function scene3(t: number): SceneOut {
  const lead = swim(LEAD, t, {kind: 'female', scale: 0.7, seed: 5});
  // la formación cambia tras las llamadas (58,8–62): los integrantes se acercan y se alinean
  const regroup = smoothstep(59, 62.5, t);
  const pod = POD.map((m, i) => {
    const k: Key[] = LEAD.map(([tt, x, y]) => [tt, x + lerp(m.dx, m.dx * 0.6 - 60, regroup), y + lerp(m.dy, m.dy * 0.45, regroup) + Math.sin(tt * 0.5 + i) * 20]);
    return swim(k, t, {kind: m.kind, scale: m.s, seed: 10 + i, extra: m.kind === 'calf' ? {age: 0.7} : {}});
  });
  const melon = orcaPoint(lead, 0.06, 0.55);
  const echo = win(t, 51.4, 58.4, 0.5);
  const diag = win(t, 53.4, 58.3, 0.5);
  const calls = win(t, 58.6, 62.4, 0.4);
  const dialect = win(t, 62.6, 69.4, 0.5);
  const c = bc(t < 51 ? shot(t, 45, 51, cam(lead.x - 500, 860, 0.62), cam(lead.x - 200, 840, 0.7)) : t < 58.5 ? shot(t, 51, 53, cam(lead.x - 200, 840, 0.7), cam((lead.x + FISH.x) / 2, 780, 0.68)) : shot(t, 58.5, 61, cam((lead.x + FISH.x) / 2, 780, 0.68), cam(lead.x - 350, 860, 0.62)), t, 0.4);
  // arcos de llamadas entre integrantes (colores distintos por individuo)
  const callArcs = calls > 0.01 ? pod.slice(0, 3).map((p, i) => {
    const a = orcaPoint(p, 0.06, 0.5);
    const r = ((t - 58.6 - i * 0.4) % 1.2) * 300;
    return r > 0 ? <circle key={i} cx={a.x} cy={a.y} r={r} fill="none" stroke={['#ffd23f', '#ff9ac8', '#9affc8'][i]} strokeWidth={5} opacity={calls * (1 - r / 360)} /> : null;
  }) : null;
  const s0 = toScreen(c, melon.x, melon.y);
  return {
    svg: (
      <g>
        <Sea cam={c} t={t} mood="day" floor={2000} rocks kelp schools={[{c: FISH, n: 34, r: 150, seed: 21, dir: -1, scatter: smoothstep(57, 60, t) * 0.4, threat: lead, depth: 1}]}>
          {pod.map((p, i) => <Orca key={i} pose={p} uid={`p3${i}`} />)}
          <Orca pose={lead} uid="l3" />
          {echo > 0.01 && <g><ClickWaves t={t} origin={melon} dir={Math.atan2(FISH.y - melon.y, FISH.x - melon.x)} clicks={CLICKS} speed={900} maxR={900} targets={[FISH]} k={echo} /><ClickFlash t={t} origin={melon} clicks={CLICKS} k={echo} /></g>}
          {callArcs}
          {dialect > 0.01 && (
            <g opacity={dialect}>
              {[lead, ...pod].slice(0, 4).map((p, i) => {
                const a = orcaPoint(p, 0.2, 1.6);
                return <path key={i} d={`M${a.x - 50} ${a.y}${Array.from({length: 8}, (_, k) => `L${a.x - 50 + k * 14} ${a.y - (k % 2 ? 1 : -1) * (10 + ((k * 7) % 3) * 8)}`).join('')}`} stroke="#ffd23f" strokeWidth={5} fill="none" strokeLinejoin="round" />;
              })}
            </g>
          )}
        </Sea>
        <Card k={diag} title="ECOLOCALIZACIÓN" y={1080} h={560}>
          {/* cabeza en corte: labios fónicos → melón → clics; ecos → mandíbula → oído */}
          <path d="M170 1380C200 1250 380 1190 560 1210C700 1225 820 1280 860 1340C820 1400 700 1440 560 1450C380 1460 220 1440 170 1380Z" fill="#132a38" stroke="#7ad8ff" strokeWidth={3} />
          <ellipse cx={760} cy={1300} rx={80} ry={52} fill="#f2c860" opacity={0.85} />
          <circle cx={640} cy={1268} r={14} fill="#ff8a6a" />
          <path d="M320 1420C440 1440 620 1430 800 1400" stroke="#9ff0ff" strokeWidth={10} opacity={0.6} fill="none" />
          <circle cx={360} cy={1360} r={18} fill="#9ff0ff" />
          {[0, 1, 2].map((i) => <path key={i} d={`M${880 + i * 34} 1250Q${910 + i * 34} 1300 ${880 + i * 34} 1350`} stroke="#9ff0ff" strokeWidth={6} fill="none" opacity={0.5 + 0.5 * Math.sin(t * 6 - i)} />)}
          <Txt x={640} y={1178} a="middle" s={26} c="#ffb090">labios fónicos</Txt>
          <Txt x={760} y={1500} a="middle" s={26} c="#f2c860">melón (enfoca los clics)</Txt>
          <Txt x={360} y={1540} a="middle" s={26} c="#9ff0ff">mandíbula → oído (ecos)</Txt>
          <Txt x={540} y={1600} a="middle" s={24} c="#c8e8f8" w={700}>visualización científica: el sonido no es visible</Txt>
        </Card>
        {echo > 0.01 && <circle cx={s0.x} cy={s0.y} r={8} fill="#9ff0ff" opacity={echo} />}
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 51.8, 53.4, 0.3)} text="CLICS (CIAN) · ECOS (ÁMBAR)" color="#9ff0ff" />
        <Tag k={calls} text="LLAMADAS ENTRE INTEGRANTES" color="#ffd23f" />
        <Tag k={dialect} text="DIALECTOS FAMILIARES · SE TRANSMITEN ENTRE GENERACIONES" color="#ffd23f" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 4
const SW4: Key[] = [[69, -1400, 2200], [74, -600, 2150], [80, 400, 1950], [86, 1500, 800], [89, 2050, 40], [90.5, 2350, 30], [93, 2900, 480], [96, 3500, 900]];
/** Superpone una región del cuerpo definida en (u, v): sigue la deformación del animal. */
const BodyRegion: React.FC<{P: OrcaPose; pts: [number, number][]; fill: string; op: number; stroke?: string}> = ({P, pts, fill, op, stroke}) => {
  const S = spine(P);
  const tr = `translate(${P.x} ${P.y}) rotate(${(P.angle * 180) / Math.PI}) scale(${P.facing * P.scale} ${P.scale})`;
  return <path d={smoothPath(pts.map(([u, v]) => uv(S, u, v, P.kind)), true)} transform={tr} fill={fill} opacity={op} stroke={stroke} strokeWidth={stroke ? 3 / P.scale : 0} />;
};
const BodyLine: React.FC<{P: OrcaPose; pts: [number, number][]; stroke: string; w: number; op: number}> = ({P, pts, stroke, w, op}) => {
  const S = spine(P);
  const tr = `translate(${P.x} ${P.y}) rotate(${(P.angle * 180) / Math.PI}) scale(${P.facing * P.scale} ${P.scale})`;
  return <path d={smoothPath(pts.map(([u, v]) => uv(S, u, v, P.kind)))} transform={tr} stroke={stroke} strokeWidth={w / P.scale} fill="none" opacity={op} strokeLinecap="round" />;
};
export function scene4(t: number): SceneOut {
  const P = swim(SW4, t, {kind: 'male', scale: 0.85, seed: 7, under: 1});
  const surf = P.y < 80;
  P.under = surf ? 0.4 : 1;
  P.blow = win(t, 88.8, 90.4, 0.25);
  if (surf) P.angle *= 0.4;
  const muscles = win(t, 74.2, 79.6, 0.5);
  const pecs = win(t, 79.8, 85.6, 0.5);
  const resp = win(t, 86.2, 93.2, 0.5);
  const mid = orcaPoint(P, 0.45, 0);
  const tail = orcaPoint(P, 0.97, 0);
  const pec = orcaPoint(P, 0.25, -1.4);
  let c = cam(mid.x, mid.y, 0.6);
  if (t > 74 && t < 79.7) c = shot(win(t, 74, 79.7, 0.8), 0, 1, cam(mid.x, mid.y, 0.6), cam(lerp(mid.x, tail.x, 0.45), lerp(mid.y, tail.y, 0.45), 0.85));
  if (t > 79.7 && t < 85.8) c = shot(win(t, 79.7, 85.8, 0.8), 0, 1, cam(mid.x, mid.y, 0.6), cam(pec.x, pec.y - 60, 1.15));
  if (t > 86) c = shot(t, 86, 88.4, cam(mid.x, mid.y, 0.6), cam(mid.x, 60, 0.62));
  if (t > 90.6) c = cam(mid.x, lerp(60, mid.y, smoothstep(90.6, 93, t)), 0.62);
  c = bc(c, t, 0.4);
  const blowAt = orcaPoint(P, 0.13, 1);
  const pp = pathAt(SW4, t);
  const speedTxt = Math.hypot(pp.vx, pp.vy);
  void speedTxt;
  return {
    svg: (
      <Sea cam={c} t={t} mood="deep" floor={3300} rocks depthDark={0.8}>
        <Bubbles t={t} src={tail} n={10} seed={9} k={0.6} />
        <Orca pose={P} uid="o4" />
        {muscles > 0.01 && (
          <g>
            <BodyRegion P={P} pts={[[0.26, 0.55], [0.4, 0.82], [0.6, 0.78], [0.78, 0.72], [0.9, 0.4], [0.8, 0.2], [0.6, 0.25], [0.4, 0.25]]} fill="#ff5a4a" op={muscles * 0.55} stroke="#ffc0b0" />
            <BodyRegion P={P} pts={[[0.3, -0.2], [0.45, -0.25], [0.62, -0.3], [0.8, -0.22], [0.9, -0.38], [0.78, -0.65], [0.6, -0.72], [0.4, -0.65]]} fill="#ff8a4a" op={muscles * 0.5} stroke="#ffd0b0" />
          </g>
        )}
        {resp > 0.01 && (
          <g>
            <BodyLine P={P} pts={[[0.13, 1], [0.15, 0.6], [0.2, 0.2], [0.26, 0.0]]} stroke="#9ff0ff" w={14} op={resp} />
            <BodyRegion P={P} pts={[[0.24, 0.35], [0.32, 0.5], [0.42, 0.45], [0.44, 0.1], [0.36, -0.1], [0.26, 0.0]]} fill="#7ad8ff" op={resp * 0.7} stroke="#e0f8ff" />
          </g>
        )}
        <Blow x={blowAt.x} y={blowAt.y} t={t} t0={89.0} s={0.9} />
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={muscles} text="MÚSCULOS DORSALES Y VENTRALES → COLA ARRIBA Y ABAJO ↕" color="#ffb0a0" />
        <Tag k={pecs} text="ALETAS PECTORALES: CONTROLAN LA DIRECCIÓN" color="#bfeaff" />
        <Tag k={resp} text="RESPIRA POR EL ESPIRÁCULO → PULMONES (SIN BRANQUIAS)" color="#9ff0ff" />
        {muscles > 0.01 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><g opacity={muscles}>{[0, 1].map((i) => { const s = toScreen(c, tail.x, tail.y); const d = i ? 1 : -1; return <path key={i} d={`M${s.x + 60} ${s.y + d * 40}l0 ${d * 120}m-22 -30l22 30l22 -30`} stroke="#ffd23f" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(P.phase - 3.2 + (i ? Math.PI : 0)))} />; })}</g></svg>}
      </>
    ),
  };
}
export const _k = {clamp, React};
