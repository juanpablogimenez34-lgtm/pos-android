// ESCENA 5 (95–121)  LA CAZA EN EQUIPO: mar polar; una foca descansa en un témpano; bajo el agua aparecen varias
//                    orcas que cambian de formación (en línea) y nadan juntas hacia el hielo justo bajo la superficie;
//                    SU desplazamiento levanta una ola visible que viaja con ellas, barre el témpano y lo inclina;
//                    la foca se desliza hacia el borde (sin violencia). Técnica de algunas poblaciones antárticas.
// ESCENA 6 (121–150) EL ENCUENTRO CON EL TIBURÓN BLANCO: el tiburón nada moviendo la cola de lado a lado; comparación
//                    ilustrada (cola horizontal que sube y baja frente a cola vertical que se mueve de lado; pulmones
//                    frente a branquias); aparece una orca, aproximación y encuentro cinematográfico sin heridas;
//                    esquema del hígado rico en grasas; aviso: no todas las orcas lo hacen.
// ESCENA 7 (150–180) LA FAMILIA DEL OCÉANO: grupo familiar al atardecer; la cría junto a su madre; llamadas; un adulto
//                    salta; la cámara vuelve a la profundidad; el grupo desaparece entre los rayos; orca hacia el horizonte.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {Orca, orcaPoint, OrcaPose} from '../character/Orca';
import {breach, Key, swim} from '../character/motion';
import {BigTitle, Brand, Card, Tag, Txt, Wash, win} from '../components/common';
import {GreatWhite, Seal} from '../environment/Critters';
import {Blow, Bubbles, IceFloe, Sea, Splash, waveY} from '../environment/Sea';

const bc = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 6 * k, y: c.y + Math.sin(t * 0.29 + 1) * 5 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});

// ---------------------------------------------------------------- ESCENA 5
const FLOE_X = 1500;
/** Frente de la ola: viaja con el grupo (que nada justo bajo la superficie) y crece con su velocidad. */
const waveFront = (t: number) => lerp(-900, FLOE_X + 300, smoothstep(103.6, 109.4, t));
const waveAmp = (t: number) => 125 * smoothstep(103.4, 105.6, t) * (1 - smoothstep(110.4, 113.5, t));
export function scene5(t: number): SceneOut {
  const extra = (wx: number, tt: number) => {
    const d = (wx - (waveFront(tt) + 80)) / 160;
    return -waveAmp(tt) * Math.exp(-d * d) + waveAmp(tt) * 0.35 * Math.exp(-((d + 1.6) * (d + 1.6)));
  };
  // las orcas: primero dispersas en profundidad, luego en línea justo bajo la superficie
  const line = smoothstep(101, 104, t);
  const orcas = [0, 1, 2, 3].map((i) => {
    const spread: Key[] = [[94, -1500 - i * 240, 700 + i * 160], [101, -700 - i * 200, 640 + i * 150], [104, waveFront(104) - 260 - i * 30, 150 + i * 60], [109.4, waveFront(109.4) - 260 - i * 30, 120 + i * 60], [114, FLOE_X + 700 - i * 120, 500 + i * 120], [122, FLOE_X + 1400, 800]];
    const k: Key[] = spread.map(([tt, x, y]) => [tt, x, y]);
    return swim(k, t, {kind: i === 0 ? 'male' : 'female', scale: i === 0 ? 0.72 : 0.62, seed: 30 + i});
  });
  // el témpano reacciona cuando le llega la ola
  const hit = clamp(1 - Math.abs(waveFront(t) - FLOE_X) / 360) * (waveAmp(t) / 125);
  const tilt = -hit * 0.38 + Math.sin(t * 2.2) * 0.02 * smoothstep(108, 112, t);
  const heave = hit * 70;
  const slide = smoothstep(108.2, 110.4, t) * 120;
  let c: Cam;
  if (t < 99) c = shot(t, 95, 99, cam(FLOE_X - 300, -160, 0.55), cam(FLOE_X - 500, -60, 0.6));
  else if (t < 104.2) c = shot(t, 99, 101, cam(FLOE_X - 500, -60, 0.6), cam(orcas[0].x, 520, 0.5));
  else if (t < 111) c = shot(t, 104.2, 106, cam(orcas[0].x, 520, 0.5), cam(lerp(waveFront(t), FLOE_X, 0.5), -40, 0.5));
  else c = shot(t, 111, 114, cam(FLOE_X, -40, 0.5), cam(FLOE_X - 200, 260, 0.52));
  c = bc(c, t, 0.4);
  const wy = waveY(FLOE_X, t) + extra(FLOE_X, t);
  return {
    svg: (
      <Sea cam={c} t={t} mood="polar" ice extraWave={extra}
        front={
          <g>
            {[-600, 300, 2300, 2900].map((x, i) => <IceFloe key={i} x={x} w={180 + i * 30} t={t} seed={i + 40} tilt={Math.sin(t * 0.8 + i) * 0.04} />)}
            <g transform={`translate(0 ${wy - waveY(FLOE_X, t) * 0.6})`}>
              <IceFloe x={FLOE_X} w={520} t={t} seed={7} tilt={tilt} heave={heave}>
                <Seal x={-40} y={-16} s={1.1} alert={smoothstep(103, 105, t)} slide={slide} />
              </IceFloe>
            </g>
            {waveAmp(t) > 4 && <path d={`M${waveFront(t) - 120} ${-waveAmp(t) * 0.9}q60 -18 140 0`} stroke="#ffffff" strokeWidth={8} fill="none" opacity={0.8} />}
          </g>
        }>
        {orcas.map((o, i) => <Orca key={i} pose={o} uid={`h5${i}`} />)}
        {orcas.map((o, i) => <Bubbles key={`b${i}`} t={t} src={orcaPoint(o, 0.95, 0)} n={8} seed={i * 5} k={line * 0.8} />)}
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 99.4, 103.6, 0.5)} text="CAMBIAN DE FORMACIÓN: EN LÍNEA" color="#bfeaff" />
        <Tag k={win(t, 104, 108.4, 0.5)} text="SU NADO COORDINADO LEVANTA UNA OLA" color="#ffe2a0" />
        <Tag k={win(t, 111.6, 120.4, 0.5)} text="ALGUNAS POBLACIONES DE ORCAS ANTÁRTICAS" color="#bfeaff" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 6
const SHARK: Key[] = [[120, -900, 900], [130, 300, 860], [138, 900, 820], [146, 1700, 700], [151, 2600, 560]];
const ORCA6: Key[] = [[120, -2400, 1300], [130, -900, 1250], [136, 300, 1100], [140, 900, 980], [146, 1500, 1060], [151, 2200, 1200]];
export function scene6(t: number): SceneOut {
  const sp = (() => {
    const k = SHARK;
    const n = k.length;
    let i = 0;
    while (i < n - 2 && t > k[i + 1][0]) i++;
    const u = clamp((t - k[i][0]) / (k[i + 1][0] - k[i][0]));
    const e = u * u * (3 - 2 * u);
    return {x: lerp(k[i][1], k[i + 1][1], e), y: lerp(k[i][2], k[i + 1][2], e)};
  })();
  const flee = smoothstep(141, 144, t);
  const shark = {x: sp.x + flee * (t - 141) * 120, y: sp.y - flee * 60, angle: -0.04 - flee * 0.1, scale: 0.78, facing: 1 as const, phase: t * (5 + flee * 6), amp: 0.7 + flee * 0.5, liver: win(t, 135.2, 141.8, 0.5)};
  const orca = swim(ORCA6, t, {kind: 'male', scale: 0.85, seed: 41});
  orca.eye = {x: 0.8, y: -0.3};
  const comp = win(t, 125.6, 130.1, 0.5);
  const mid = {x: (shark.x + orca.x) / 2, y: (shark.y + orca.y) / 2};
  const c = bc(t < 125 ? shot(t, 121, 125, cam(sp.x - 500, 880, 0.6), cam(sp.x - 300, 860, 0.62)) : t < 135 ? shot(t, 130, 134, cam(sp.x - 300, 860, 0.62), cam(mid.x - 200, mid.y, 0.5)) : shot(t, 135, 140, cam(mid.x - 200, mid.y, 0.5), cam(shark.x - 380, shark.y + 40, 0.62)), t, 0.4);
  return {
    svg: (
      <g>
        <Sea cam={c} t={t} mood="day" depthDark={0.9} floor={2400} rocks schools={[{c: {x: 1600, y: 1500}, n: 22, r: 160, seed: 61, dir: 1}]}>
          <Orca pose={orca} uid="o6" />
          <GreatWhite p={shark} uid="gw" />
        </Sea>
        <Card k={comp} title="DOS FORMAS DE NADAR" y={1060} h={620}>
          {/* vista cenital esquemática: cola de la orca (horizontal, sube y baja) frente a cola del tiburón (vertical, de lado a lado) */}
          <g transform="translate(300 1340)">
            <path d="M0 -150C40 -120 50 -20 40 60C30 110 10 150 0 170C-10 150 -30 110 -40 60C-50 -20 -40 -120 0 -150Z" fill="#1a2028" stroke="#9fe0ff" strokeWidth={3} />
            <path d={`M-70 ${185 + Math.sin(t * 5) * 0}L70 185`} stroke="#1a2028" strokeWidth={22} strokeLinecap="round" />
            <path d={`M0 ${120}l0 ${Math.sin(t * 5) * 10}`} stroke="#fff" />
            <path d="M110 140l0 -60m-14 16l14 -16l14 16M110 210l0 60m-14 -16l14 16l14 -16" stroke="#ffd23f" strokeWidth={7} fill="none" opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 5))} />
            <Txt x={0} y={300} a="middle" s={30} c="#9fe0ff">ORCA</Txt>
            <Txt x={0} y={336} a="middle" s={22} c="#eef8ff" w={700}>cola horizontal ↕ · pulmones</Txt>
          </g>
          <g transform="translate(780 1340)">
            <path d={`M0 -150C40 -120 46 -20 34 60C${26 + Math.sin(t * 5) * 14} 110 ${10 + Math.sin(t * 5) * 30} 150 ${Math.sin(t * 5) * 44} 175C${-10 + Math.sin(t * 5) * 30} 150 -26 110 -34 60C-46 -20 -40 -120 0 -150Z`} fill="#56687a" stroke="#9fe0ff" strokeWidth={3} />
            <path d={`M${Math.sin(t * 5) * 44} 175l0 40`} stroke="#56687a" strokeWidth={20} strokeLinecap="round" />
            <path d="M-120 200l-60 0m16 -14l-16 14l16 14M120 200l60 0m-16 -14l16 14l-16 14" stroke="#ffd23f" strokeWidth={7} fill="none" />
            <Txt x={0} y={300} a="middle" s={30} c="#9fe0ff">TIBURÓN BLANCO</Txt>
            <Txt x={0} y={336} a="middle" s={22} c="#eef8ff" w={700}>cola vertical ↔ · branquias</Txt>
          </g>
        </Card>
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 135.6, 141.8, 0.5)} text="HÍGADO DEL TIBURÓN: MUY RICO EN GRASAS" color="#ffc858" />
        <Tag k={win(t, 142.4, 149.4, 0.5)} text="NO TODAS LAS ORCAS CAZAN TIBURONES" color="#ffb0a0" />
        <Tag k={win(t, 130.4, 134.8, 0.5)} text="CASOS DOCUMENTADOS EN ALGUNAS POBLACIONES" color="#bfeaff" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 7
const MOM7: Key[] = [[149, -1300, 560], [160, 0, 480], [170, 1100, 600], [181, 2200, 800]];
const BULL7: Key[] = [[149, -1700, 820], [165, 0, 760], [181, 1800, 900]];
const AUNT7: Key[] = [[149, -1900, 380], [165, -300, 420], [181, 1500, 640]];
const BR7 = 160.4;
export function scene7(t: number): SceneOut {
  const mom = swim(MOM7, t, {kind: 'female', scale: 0.7, seed: 51});
  const calfK: Key[] = MOM7.map(([tt, x, y]) => [tt, x + 60, y + 120 + Math.sin(tt) * 10]);
  const calf = swim(calfK, t, {kind: 'calf', scale: 0.4, seed: 52, extra: {age: 0.6}});
  calf.phase = t * 4.6;
  const bull = swim(BULL7, t, {kind: 'male', scale: 0.82, seed: 53});
  const b = breach(t, BR7, 700, {scale: 0.68, kind: 'female', slow: 2.0, depth: 600});
  const auntBase = swim(AUNT7, t, {kind: 'female', scale: 0.68, seed: 54});
  const breaching = t >= BR7 && t < b.tEnd;
  const aunt: OrcaPose = breaching ? {...auntBase, x: b.x, y: b.y, angle: b.angle, facing: b.facing as 1 | -1, arch: b.arch, amp: b.amp, under: b.air ? 0 : 1} : auntBase;
  if (t >= b.tEnd) aunt.x = lerp(b.x, auntBase.x, smoothstep(b.tEnd, b.tEnd + 3, t));
  const calls = win(t, 154.6, 160, 0.5);
  const fade = smoothstep(167.6, 170.6, t);
  const finalK = smoothstep(170.2, 171.8, t);
  const hero = swim([[170, 300, 900], [181, 1400, 820]], t, {kind: 'male', scale: lerp(1.1, 0.7, smoothstep(172, 180, t)), seed: 60});
  let c: Cam = t < 160 ? shot(t, 150, 158, cam(mom.x - 300, 520, 0.55), cam(mom.x + 100, 420, 0.62)) : t < 167 ? shot(t, 160, 162, cam(mom.x + 100, 420, 0.62), cam(900, -80, 0.55)) : shot(t, 167, 171, cam(900, -80, 0.55), cam(1100, 1500, 0.6));
  if (finalK > 0) c = shot(finalK, 0, 1, c, cam(hero.x + 120, hero.y, 0.85));
  c = bc(c, t, 0.4);
  const end = smoothstep(174.4, 176, t);
  const blow = orcaPoint(mom, 0.13, 1);
  return {
    svg: (
      <Sea cam={c} t={t} mood="sunset" coast floor={2600} kelp rocks
        front={<g><Splash x={700} t={t} t0={b.tExit} size={0.9} slow={1.5} /><Splash x={b.xEntry} t={t} t0={b.tEntry} size={1.1} slow={1.5} /></g>}>
        <g opacity={1 - fade}>
          <Orca pose={bull} uid="b7" />
          <Orca pose={mom} uid="m7" />
          <Orca pose={calf} uid="c7" />
          {calls > 0.01 && [mom, calf, bull].map((p, i) => {
            const a = orcaPoint(p, 0.06, 0.5);
            const r = ((t - 154.6 - i * 0.35) % 1.3) * 260;
            return r > 0 ? <circle key={i} cx={a.x} cy={a.y} r={r} fill="none" stroke={['#ffd23f', '#9affc8', '#ff9ac8'][i]} strokeWidth={5} opacity={calls * (1 - r / 340)} /> : null;
          })}
        </g>
        <g opacity={breaching ? 1 : 1 - fade}>
          <Orca pose={aunt} uid="a7" />
        </g>
        <Blow x={blow.x} y={blow.y} t={t} t0={999} />
        {finalK > 0 && <g opacity={finalK}><Orca pose={hero} uid="h7" /></g>}
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={calls} text="SE LLAMAN Y SE MANTIENEN CERCA" color="#ffd23f" />
        <Tag k={win(t, b.tExit - 0.3, b.tEntry + 0.5, 0.3)} text="◉ CÁMARA LENTA" top={250} color="#ffc890" />
        <Wash k={end * 0.5} color="#020a18" />
        <BigTitle k={end} lines={['LA REINA DE LOS', 'OCÉANOS']} top={560} size={118} color="#ffffff" />
        <Tag k={smoothstep(175.8, 177, t)} text="MUNDO INSÓLITO" top={860} color="#bfeaff" />
        <Wash k={smoothstep(179.3, 180, t)} color="#000" />
      </>
    ),
  };
}
export const _k = {React};
