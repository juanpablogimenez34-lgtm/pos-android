// 04 Viaje espacial (estribillo 1) · 05 La Luna de queso · 06 Encuentro con Zumi ·
// 07 Segundo estribillo (montaje) · regreso hacia la Tierra. Los cambios de plano caen en
// compases reales de la canción (múltiplos de BAR desde el inicio de cada sección).
import React from 'react';
import {clamp, easeInOut, lerp, smoothstep} from '../../../engine/math';
import {bipP, lunaP, nicoP, zumiP} from '../Animation/cast';
import {clap, dance, expr, float, L, point, wave} from '../Animation/moves';
import {Cam, layerT, pulsed} from '../Camera/cam2d';
import {Bip} from '../Characters/Bip';
import {Luna} from '../Characters/Luna';
import {Nico} from '../Characters/Nico';
import {Zumi} from '../Characters/Zumi';
import {Flash, HeartTrail} from '../Effects/Fx';
import {CockpitBack, CockpitPanel} from '../Environments/Cockpit';
import {CheeseMoon, Clouds, Comets, Earth, Planet, SpaceBack, Sparkles, ToySatellite, ZumiShip} from '../Environments/Space';
import {BAR, beatPulse} from '../MusicSync/songMap';
import {BUILT, NutRocket} from '../Rocket/NutRocket';
import {SceneId, SEC} from '../Timeline/timeline';
import {CrewMood, RocketCrew} from './crew';

const Rocket: React.FC<{t: number; x: number; y: number; rot: number; s: number; mood: CrewMood; id: string; engine?: number}> = ({t, x, y, rot, s, mood, id, engine = 1}) => (
  <NutRocket id={id} p={{x, y, scale: s, rot, build: BUILT, vibrate: 0, engine, glow: 0.15, t}} windowContent={<RocketCrew t={t} mood={mood} uid={`${id}c`} />} />
);

const ZumiInShip: React.FC<{t: number; waveK: number; invite: number}> = ({t, waveK, invite}) => (
  <Zumi
    id="zin"
    p={zumiP(t, {x: 0, y: 70, scale: 0.55, expr: expr(t, 9, {mouth: 'grin'}), ...(waveK > 0 ? wave(t, 1) : {}), ...(invite > 0 ? {armR: L(-1.6 + 0.6 * Math.sin(t * 7), 1.4 + 0.5 * Math.sin(t * 7))} : {}), bob: Math.sin(t * 3) * 4})}
  />
);

/** Cabina con vista al exterior configurable (planos interiores del viaje). */
const Interior: React.FC<{t: number; cam: Cam; view: React.ReactNode; mode: 'pilot' | 'float' | 'dance' | 'moon' | 'kiss' | 'zumi' | 'flip'; local: number}> = ({t, cam, view, mode, local}) => {
  const nico = (() => {
    if (mode === 'dance') return nicoP(t, {x: 0, y: 330, scale: 1.7, helmet: 1, expr: expr(t, 1, {mouth: 'grin'}, 0.9), ...dance(t, 'twist')}, {}, 1);
    if (mode === 'moon') return nicoP(t, {x: 0, y: 330, scale: 1.7, helmet: 1, ...point(1), headTurn: 0.5, expr: expr(t, 1, {mouth: 'open', look: {x: 0.6, y: -0.8}, brow: 0.6})});
    if (mode === 'kiss') return nicoP(t, {x: 0, y: 330, scale: 1.7, helmet: 1, armR: L(-2.2, 1.8 - 0.8 * smoothstep(0.6, 1.2, local)), expr: expr(t, 1, {mouth: local < 0.8 ? 'o' : 'grin', look: {x: 0, y: -0.9}})});
    if (mode === 'zumi') return nicoP(t, {x: 0, y: 330, scale: 1.7, helmet: 1, expr: expr(t, 1, local < 1.6 ? {mouth: 'o', brow: 1, look: {x: 0, y: -1}} : {mouth: 'grin', look: {x: 0, y: -1}}), ...(local > 2.2 ? wave(t, 1) : {armL: L(0.8, -1.2), armR: L(-0.8, 1.2)})}, {}, 0.8);
    return nicoP(t, {x: 0, y: 330, scale: 1.7, helmet: 1, armL: L(0.75, -1.25), armR: L(-0.75, 1.25), lean: Math.sin(t * 1.5) * 0.06, expr: expr(t, 1, {mouth: 'grin', brow: 0.3}, 0.6)});
  })();
  const lunaFloat = mode === 'float' || mode === 'flip';
  const luna = lunaP(
    t,
    {
      x: lunaFloat ? 340 + Math.sin(t * 0.8) * 60 : 380,
      y: lunaFloat ? 200 + Math.sin(t * 1.3) * 30 : 320,
      scale: 1.25,
      helmet: 1,
      facing: -1,
      expr: expr(t, 4, mode === 'zumi' && local < 1.6 ? {mouth: 'o', brow: 1} : {mouth: 'grin'}, mode === 'dance' ? 0.8 : 0.3),
      ...(lunaFloat ? float(t, 2) : {}),
      ...(mode === 'flip' ? {lean: Math.PI * 2 * easeInOut(clamp((local - 0.5) / 2.4))} : {}),
      ...(mode === 'dance' ? dance(t, 'sway') : {}),
      ...(mode === 'moon' ? {headTurn: 0.6, expr: expr(t, 4, {mouth: 'o', look: {x: -0.4, y: -1}, brow: 1})} : {}),
      ...(mode === 'kiss' ? {armR: L(-2.1, 1.7 - 0.8 * smoothstep(0.5, 1.1, local)), expr: expr(t, 4, {mouth: local < 0.7 ? 'o' : 'grin', look: {x: 0, y: -1}})} : {}),
      ...(mode === 'zumi' && local > 2.2 ? wave(t, 1) : {}),
    },
    {},
    mode === 'zumi' && local < 1.6 ? 1 : 0,
  );
  const bip = bipP(
    t,
    {
      x: -380 + (mode === 'float' ? Math.sin(t * 0.7) * 40 : 0),
      y: mode === 'float' ? 220 + Math.sin(t * 1.1) * 30 : 320,
      scale: 1.25,
      helmet: 1,
      ...(mode === 'float' ? {lean: t * 0.6} : {}),
      ...(mode === 'dance' || mode === 'flip' ? (mode === 'flip' ? clap(t) : dance(t, 'arms')) : {}),
      ...(mode === 'moon' ? {armR: L(-1.6, 0.4), armL: L(1.6, -0.4)} : {}),
      ...(mode === 'kiss' ? {armR: L(-2.0, 1.6)} : {}),
      ...(mode === 'zumi' && local > 2.2 ? wave(t, 1) : {}),
    },
    {face: mode === 'moon' ? 'focus' : mode === 'kiss' ? 'love' : mode === 'zumi' ? (local < 1.6 ? 'wow' : 'happy') : mode === 'dance' ? 'wink' : 'happy'},
    {prop: mode === 'moon' ? 'camera' : 'none'},
  );
  return (
    <g>
      <CockpitBack cam={cam} t={t} view={view} shake={0} />
      <g transform={layerT(cam, 1)}>
        <Bip id="ib" p={bip} />
        <Luna id="il" p={luna} />
        <Nico id="in" p={nico} />
      </g>
      <CockpitPanel cam={cam} t={t} lever={1} wheel={mode === 'pilot' ? Math.sin(t * 1.4) * 0.6 : Math.sin(t * 0.5) * 0.2} shake={0} />
    </g>
  );
};

/** Vista por la ventana de la cabina (coordenadas de la ventana: centro 0,−560, radio 300). */
const WindowView: React.FC<{t: number; kind: 'stars' | 'moon' | 'earth' | 'zumi'; local: number}> = ({t, kind, local}) => (
  <g>
    <rect x={-400} y={-900} width={800} height={700} fill="#20145a" />
    {Array.from({length: 40}, (_, i) => (
      <circle key={i} cx={-380 + ((i * 97 + t * 40) % 760)} cy={-880 + ((i * 53) % 660)} r={2 + (i % 3)} fill="#ffffff" opacity={0.7} />
    ))}
    {kind === 'moon' && <CheeseMoon x={60 - local * 30} y={-560} r={230} t={t} />}
    {kind === 'earth' && <Earth x={0} y={-520} r={200} t={t} />}
    {kind === 'zumi' && <ZumiShip x={lerp(380, 20, smoothstep(0, 1.2, local))} y={-560 + Math.sin(t * 2) * 12} s={1.2} rot={Math.sin(t * 1.5) * 0.08} t={t} inside={<ZumiInShip t={t} waveK={local > 0.8 && local < 2.2 ? 1 : 0} invite={local > 2.4 ? 1 : 0} />} />}
  </g>
);

export const SpaceScenes: React.FC<{t: number; id: SceneId}> = ({t, id}) => {
  const c1 = SEC.c1.start;
  const B = BAR;
  // ============================ 04 · VIAJE (estribillo 1)
  if (id === 'flight') {
    const s0 = c1 + 2 * B; // fin del despegue (cuenta regresiva)
    const lt = t - s0;
    // 1) atravesando nubes (3 compases)
    if (t < s0 + 3 * B) {
      const cam = pulsed({x: 0, y: -lt * 300, zoom: 0.8, roll: 0}, t, 0.6);
      return (
        <g>
          <SpaceBack cam={cam} t={t} sky={1 - 0.5 * smoothstep(0, 3 * B, lt)} />
          <Clouds cam={cam} t={t} scroll={lt * 700} op={1} />
          <g transform={layerT(cam, 1)}>
            <Rocket t={t} x={Math.sin(t * 0.8) * 60} y={-lt * 300 + 300} rot={Math.sin(t * 0.8) * 0.06} s={1.1} mood="look" id="f1" />
          </g>
        </g>
      );
    }
    // 2) la cámara se aleja y aparece la Tierra (3 compases)
    if (t < s0 + 6 * B) {
      const u = (t - (s0 + 3 * B)) / (3 * B);
      const cam = pulsed({x: 0, y: 0, zoom: lerp(1.1, 0.55, easeInOut(u)), roll: 0}, t, 0.5);
      return (
        <g>
          <SpaceBack cam={cam} t={t} sky={0.5 * (1 - smoothstep(0, 0.6, u))} />
          <g transform={layerT(cam, 0.6)}>
            <Earth x={0} y={lerp(1600, 1150, u)} r={900} t={t} />
          </g>
          <g transform={layerT(cam, 1)}>
            <Rocket t={t} x={lerp(-60, 40, u)} y={lerp(200, -300, u)} rot={0.05} s={1} mood="look" id="f2" />
          </g>
        </g>
      );
    }
    // 3) secuencia espacial: alterna exterior e interior cada 2 compases
    const seg = Math.floor((t - (s0 + 6 * B)) / (2 * B));
    const local = (t - (s0 + 6 * B)) - seg * 2 * B;
    const brk = t >= SEC.brk.start;
    if (!brk && seg % 2 === 1) {
      const modes = ['pilot', 'float', 'dance', 'float'] as const;
      return <Interior t={t} cam={pulsed({x: 0, y: 120, zoom: 0.72, roll: 0}, t, 0.5)} view={<WindowView t={t} kind="stars" local={local} />} mode={modes[Math.floor(seg / 2) % 4]} local={local} />;
    }
    const cam = pulsed({x: t * 120, y: 0, zoom: brk ? lerp(0.9, 2.2, smoothstep(SEC.brk.start, SEC.brk.end, t)) : 0.9, roll: Math.sin(t * 0.3) * 0.04}, t, 0.7);
    const rx = t * 120 + Math.sin(t * 0.9) * 180;
    const ry = Math.sin(t * 0.7) * 220;
    return (
      <g>
        <SpaceBack cam={cam} t={t} sky={0} />
        <g transform={layerT(cam, 0.35)}>
          <Planet x={(t * 120) * 0.35 + 700 - (local * 60)} y={-600} r={260} c1="#ff9a3c" c2="#ffd23f" ring="#ffe9a8" t={t} />
          <Planet x={(t * 120) * 0.35 - 900 + local * 30} y={700} r={160} c1="#7ec8ff" c2="#c6f6ff" t={t} />
        </g>
        <g transform={layerT(cam, 0.7)}>
          <ToySatellite x={t * 120 * 0.7 + 400 - local * 90} y={500} t={t} />
        </g>
        <Comets t={t} n={3} />
        <g transform={layerT(cam, 1)}>
          <Rocket t={t} x={rx} y={ry} rot={0.25 + Math.sin(t * 0.9) * 0.15} s={0.85} mood={seg % 4 === 2 ? 'dance' : 'pilot'} id="f3" />
        </g>
        <Sparkles t={t} n={30} k={0.5} />
      </g>
    );
  }
  // ============================ 05 · LA LUNA DE QUESO
  if (id === 'moon') {
    const s = SEC.v2.start;
    const lt = t - s;
    if (lt < 2 * B) {
      const cam = pulsed({x: lerp(-200, 200, lt / (2 * B)), y: 0, zoom: 0.75, roll: 0}, t, 0.3);
      return (
        <g>
          <SpaceBack cam={cam} t={t} sky={0} hue={0.3} />
          <g transform={layerT(cam, 0.6)}>
            <CheeseMoon x={420} y={-180} r={560} t={t} />
          </g>
          <g transform={layerT(cam, 1)}>
            <Rocket t={t} x={lerp(-700, 600, lt / (2 * B))} y={420 - lt * 30} rot={1.2} s={0.8} mood="look" id="m1" />
          </g>
        </g>
      );
    }
    const k = lt - 2 * B;
    if (k < 2.6 * B) {
      // Luna mira por la ventana, Nico señala, Bip toma una fotografía imaginaria (destello)
      const sub = k < B ? 'moon' : k < 1.7 * B ? 'moon' : 'moon';
      const flashT = 2 * B + 1.8 * B;
      return (
        <g>
          <Interior t={t} cam={{x: lerp(200, -120, smoothstep(0, 2.4 * B, k)), y: lerp(160, 260, smoothstep(0, 2.4 * B, k)), zoom: lerp(0.9, 1.15, smoothstep(0, 2.4 * B, k)), roll: 0}} view={<WindowView t={t} kind="moon" local={k} />} mode={sub} local={k} />
          <Flash k={Math.max(0, 1 - Math.abs(lt - flashT) * 8) * 0.8} />
        </g>
      );
    }
    // la Tierra al fondo y el beso: corazones luminosos que viajan hacia ella
    const kk = k - 2.6 * B;
    if (kk < 0.9 * B) return <Interior t={t} cam={{x: 0, y: 140, zoom: 0.78, roll: 0}} view={<WindowView t={t} kind="earth" local={kk} />} mode="kiss" local={kk} />;
    const h0 = s + 2 * B + 3.5 * B;
    const cam: Cam = {x: 0, y: 0, zoom: 0.8, roll: 0};
    return (
      <g>
        <SpaceBack cam={cam} t={t} sky={0} hue={0.2} />
        <g transform={layerT(cam, 0.6)}>
          <Earth x={340} y={-520} r={300} t={t} />
        </g>
        <g transform={layerT(cam, 1)}>
          <Rocket t={t} x={-260} y={520} rot={0.4} s={0.75} mood="wave" id="m3" />
          <HeartTrail t={t} t0={h0} t1={h0 + 2.2} x0={-230} y0={300} x1={300} y1={-560} n={8} />
        </g>
      </g>
    );
  }
  // ============================ 06 · ENCUENTRO CON ZUMI
  if (id === 'zumi') {
    const s = SEC.zumi.start;
    const lt = t - s;
    if (lt < B) {
      const cam: Cam = {x: 0, y: 0, zoom: 0.85, roll: 0};
      return (
        <g>
          <SpaceBack cam={cam} t={t} sky={0} hue={0.4} />
          <g transform={layerT(cam, 1)}>
            <Rocket t={t} x={-260} y={200} rot={0.3} s={0.8} mood="pilot" id="z1" />
            <ZumiShip x={lerp(900, 330, easeInOut(lt / B))} y={lerp(-300, 60, easeInOut(lt / B))} s={0.75} rot={-0.15} t={t} inside={<ZumiInShip t={t} waveK={0} invite={0} />} />
          </g>
        </g>
      );
    }
    if (t < SEC.hold.start + 1.2 * B) {
      const k = lt - B;
      return <Interior t={t} cam={{x: 0, y: lerp(60, 120, smoothstep(0, 2 * B, k)), zoom: lerp(0.85, 0.72, smoothstep(0, 2 * B, k)), roll: 0}} view={<WindowView t={t} kind="zumi" local={k} />} mode="zumi" local={k} />;
    }
    // vuelo compartido: trayectorias distintas pero coordinadas
    const k = t - (SEC.hold.start + 1.2 * B);
    const cam = pulsed({x: k * 140, y: 0, zoom: 0.78, roll: Math.sin(t * 0.4) * 0.05}, t, 0.4);
    return (
      <g>
        <SpaceBack cam={cam} t={t} sky={0} hue={0.4} />
        <Comets t={t} n={2} />
        <g transform={layerT(cam, 1)}>
          <Rocket t={t} x={k * 140 - 160 + Math.sin(k * 1.4) * 120} y={160 + Math.sin(k * 1.1) * 160} rot={1.0 + Math.sin(k * 1.4) * 0.2} s={0.72} mood="wave" id="z3" />
          <ZumiShip x={k * 140 + 240 + Math.sin(k * 1.4 + 2.2) * 140} y={-240 + Math.cos(k * 1.1) * 120} s={0.6} rot={Math.sin(k * 2) * 0.2} t={t} inside={<ZumiInShip t={t} waveK={1} invite={0} />} />
        </g>
        <Sparkles t={t} n={24} k={0.5} />
      </g>
    );
  }
  // ============================ 07 · SEGUNDO ESTRIBILLO (montaje)
  if (id === 'montage') {
    const s = SEC.c2.start;
    const seg = Math.floor((t - s) / (2 * B));
    const local = t - s - seg * 2 * B;
    const bp = beatPulse(t, 5);
    const zumiShipAt = (cx: number, cy: number, ph: number) => <ZumiShip x={cx} y={cy} s={0.55} rot={Math.sin(ph * 2) * 0.2} t={t} inside={<ZumiInShip t={t} waveK={1} invite={0} />} />;
    switch (seg % 8) {
      case 0:
      case 7: {
        // el cohete gira alrededor de un planeta (cámara orbital estilizada); Zumi lo acompaña
        const a = (t - s) * 0.9;
        const cam = pulsed({x: 0, y: 0, zoom: 0.7, roll: Math.sin(a * 0.5) * 0.08}, t, 0.8);
        const front = Math.sin(a) > 0;
        const rx = Math.cos(a) * 640;
        const ry = Math.sin(a) * 200;
        const planet = (
          <g transform={layerT(cam, 1)}>
            <Planet x={0} y={0} r={330} c1="#c38aff" c2="#ff9ad5" ring="#ffe9a8" t={t} tilt={-0.2} />
          </g>
        );
        return (
          <g>
            <SpaceBack cam={cam} t={t} sky={0} hue={0.6} />
            {front && planet}
            <g transform={layerT(cam, 1)}>
              <Rocket t={t} x={rx} y={ry} rot={a + Math.PI} s={0.55 + 0.15 * Math.sin(a)} mood="dance" id="mg0" />
              {zumiShipAt(Math.cos(a - 0.9) * 780, Math.sin(a - 0.9) * 280 - 120, a)}
            </g>
            {!front && planet}
            <Comets t={t} n={4} />
          </g>
        );
      }
      case 1:
        return <Interior t={t} cam={pulsed({x: 0, y: 140, zoom: 0.74, roll: 0}, t, 1)} view={<WindowView t={t} kind="stars" local={local} />} mode="dance" local={local} />;
      case 2: {
        // naves que cruzan sus trayectorias y estrellas fugaces
        const cam = pulsed({x: 0, y: 0, zoom: 0.8, roll: 0}, t, 0.8);
        return (
          <g>
            <SpaceBack cam={cam} t={t} sky={0} hue={0.5} />
            <Comets t={t} n={7} />
            <g transform={layerT(cam, 1)}>
              <Rocket t={t} x={lerp(-700, 700, local / (2 * B))} y={Math.sin(local * 2) * 260} rot={1.4 + Math.cos(local * 2) * 0.3} s={0.7} mood="dance" id="mg2" />
              {zumiShipAt(lerp(700, -700, local / (2 * B)), -Math.sin(local * 2) * 260 - 60, local)}
            </g>
          </g>
        );
      }
      case 3:
        return <Interior t={t} cam={pulsed({x: 120, y: 80, zoom: 0.8, roll: 0}, t, 1)} view={<WindowView t={t} kind="zumi" local={3} />} mode="flip" local={local} />;
      case 4: {
        // los personajes saludan a cámara (acercamiento a la ventana)
        const cam: Cam = {x: 0, y: -280 * 1.0, zoom: lerp(1.1, 2.4, easeInOut(local / (2 * B))), roll: 0};
        return (
          <g>
            <SpaceBack cam={{x: 0, y: 0, zoom: 1, roll: 0}} t={t} sky={0} hue={0.5} />
            <g transform={layerT(cam, 1)}>
              <Rocket t={t} x={0} y={0} rot={0} s={1} mood="wave" id="mg4" />
            </g>
          </g>
        );
      }
      case 5: {
        // atraviesan una nube de partículas brillantes
        const cam = pulsed({x: 0, y: 0, zoom: 0.85, roll: Math.sin(t) * 0.05}, t, 1);
        return (
          <g>
            <SpaceBack cam={cam} t={t} sky={0} hue={0.8} />
            <Sparkles t={t} n={70} k={0.6} speed={2.5} />
            <g transform={layerT(cam, 1)}>
              <Rocket t={t} x={Math.sin(t * 1.2) * 80} y={Math.cos(t) * 60} rot={1.57 + Math.sin(t * 2) * 0.08} s={0.95} mood="wow" id="mg5" />
            </g>
            <Sparkles t={t + 3} n={50} k={0.9} speed={4} />
            <rect width={1080} height={1920} fill="#ffffff" opacity={0.08 * bp} />
          </g>
        );
      }
      default:
        return <Interior t={t} cam={pulsed({x: -60, y: 120, zoom: 0.72, roll: 0}, t, 1)} view={<WindowView t={t} kind="zumi" local={3} />} mode="dance" local={local} />;
    }
  }
  // ============================ regreso hacia la Tierra (interludio)
  const s = SEC.inter.start;
  const lt = t - s;
  const d = SEC.inter.end - s;
  const u = clamp(lt / d);
  const cam: Cam = {x: 0, y: lerp(0, 600, u), zoom: lerp(0.6, 1.2, u), roll: 0};
  return (
    <g>
      <SpaceBack cam={cam} t={t} sky={smoothstep(0.55, 0.95, u)} />
      <g transform={layerT(cam, 0.6)} opacity={1 - smoothstep(0.6, 0.9, u)}>
        <Earth x={0} y={900} r={lerp(500, 1600, u)} t={t} />
      </g>
      <Clouds cam={cam} t={t} scroll={-lt * 600} op={smoothstep(0.5, 0.8, u)} />
      <g transform={layerT(cam, 1)}>
        <Rocket t={t} x={Math.sin(t) * 40} y={lerp(-500, 500, u)} rot={Math.sin(t * 1.3) * 0.08} s={0.9} mood="look" id="d1" engine={0.6} />
      </g>
    </g>
  );
};
