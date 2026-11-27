// ESCENAS 5–8.
//  5 (32–42) PUEDE DETECTAR LO QUE NO VE: el agua se enturbia; peces ocultos entre raíces; ecolocalización
//            ILUSTRATIVA: clics desde el melón, ecos que vuelven de los obstáculos y de los peces.
//  6 (42–51) EL CAZADOR DEL BOSQUE: cardumen entre raíces; detecta una presa, gira rápido, se aproxima, abre la boca
//            y la atrapa (sin violencia gráfica); el cardumen se dispersa.
//  7 (51–56) LA REVELACIÓN: asciende hacia la luz dorada y asoma para respirar (soplo por el espiráculo).
//  8 (56–60) CIERRE EN BUCLE: vuelve a sumergirse y la cámara lo sigue hasta las raíces del primer plano (= fotograma 0).
import {clamp, hash1, lerp} from '../../../engine/math';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {ClickFlash, ClickWaves} from '../../ep23-cachalote/environment/Ocean';
import {DolphinPose, PinkDolphin, dolphinPoint} from '../character/PinkDolphin';
import {BigTitle, DTrack, Info, Note, poseFrom, seg, Vignette, win} from '../components/common';
import {EV} from '../data/timeline';
import {Amazon, FreshFish, school, Trunk} from '../environment/Amazon';
import {HOOK_PATH, hookCam, path, pitch, S} from './S1_4';

type V = {x: number; y: number};
const local = (pose: DolphinPose, x: number, y: number, u: number, side: number, ang = 0): V => {
  const q = dolphinPoint(pose, u, side);
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  return {x: x + (q.x * ca - q.y * sa) * S, y: y + (q.x * sa + q.y * ca) * S};
};

// ---------------- ESCENA 5 ----------------
const S5: DTrack = [[32, 'SLOW'], [34.4, 'EXPLORE']];
const CLICKS5 = Array.from({length: 22}, (_, i) => EV.clicks[0] + i * 0.31);
const HIDDEN: V[] = [{x: 620, y: 520}, {x: 760, y: 900}, {x: 480, y: 1120}, {x: 900, y: 640}];
export function scene5(t: number): SceneOut {
  const murk = seg(t, 32, 35);
  const d = path([[32, -500, 760], [37, -150, 760], [42.2, 80, 760]], t);
  const pose = poseFrom(S5, t, {headYaw: Math.sin(t * 0.8) * 0.2, caustics: 0.6 * (1 - murk), tone: murk * 0.35, rim: 0.3});
  const melon = local(pose, d.x, d.y, 0.14, -0.6);
  const c = breathe(shot(t, 32, 42, cam(d.x + 120, 780, 0.9), cam(d.x + 160, 800, 1.0), 'inOut'), t, 0.3);
  const lit = (p: V) => {
    const dist = Math.hypot(p.x - melon.x, p.y - melon.y);
    let k = 0;
    CLICKS5.forEach((tc) => {
      const back = tc + (dist * 2) / 1300;
      k = Math.max(k, clamp(1 - Math.abs(t - back) / 0.35));
    });
    return k;
  };
  const obstacles: V[] = [{x: 330, y: 700}, {x: 560, y: 1000}];
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.15 + murk * 0.75}>
        {HIDDEN.map((p, i) => (
          <g key={i}>
            <FreshFish x={p.x + Math.sin(t + i) * 10} y={p.y} s={0.9} t={t + i} dir={-1} kind={i % 2 ? 'cichlid' : 'characin'} opacity={0.35 + lit(p) * 0.65} />
            {lit(p) > 0.05 && <ellipse cx={p.x} cy={p.y} rx={60} ry={34} fill="none" stroke="#ffc870" strokeWidth={3} opacity={lit(p) * 0.8} />}
          </g>
        ))}
        <Trunk x={330} w={80} lean={0.02} roots={4} seed={52} t={t} under="#2e2616" above="#2e2616" murk={murk} />
        <PinkDolphin uid="s5" pose={pose} x={d.x} y={d.y} scale={S} angle={pitch(d)} />
        <ClickWaves t={t} origin={melon} dir={0} clicks={CLICKS5} speed={1300} maxR={1500} targets={[...HIDDEN, ...obstacles]} spread={0.7} />
        <ClickFlash t={t} origin={melon} clicks={CLICKS5} />
      </Amazon>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <BigTitle k={win(t, 35.2, 41.6, 0.4)} lines={['ECOLOCALIZACIÓN']} top={250} size={80} />
        <Note k={win(t, 35.2, 41.8, 0.4)} text="ONDAS SONORAS: REPRESENTACIÓN ILUSTRATIVA" top={360} />
      </>
    ),
  };
}

// ---------------- ESCENA 6 ----------------
const S6: DTrack = [[42, 'EXPLORE'], [EV.turn, 'BODY_TURN'], [45.4, 'FAST'], [EV.catch, 'CATCH'], [49.4, 'SLOW']];
export function scene6(t: number): SceneOut {
  const d = path([[42, -400, 700], [44.4, -140, 690], [45.6, 40, 860], [48.6, 360, 1020], [51.2, 760, 880]], t);
  const prey = {x: lerp(560, 470, seg(t, 44, 48.5)), y: lerp(980, 1040, seg(t, 44, 48.5))};
  const jaw = t > EV.catch - 0.2 && t < EV.catch + 0.5 ? Math.sin(clamp((t - EV.catch + 0.2) / 0.7) * Math.PI) : 0;
  const yawTo = seg(t, EV.detect, EV.detect + 0.5) * (1 - seg(t, 45.2, 45.8)) * 0.5;
  const pose = poseFrom(S6, t, {jaw, headYaw: yawTo, headPitch: seg(t, EV.detect, 44.2) * 0.25 * (1 - seg(t, 45.4, 46)), caustics: 0.5, rim: 0.4});
  const ang = pitch(d, 1, 0.75);
  const snout = local(pose, d.x, d.y, 0, 0, ang);
  const melon = local(pose, d.x, d.y, 0.14, -0.6, ang);
  const scare = seg(t, EV.catch - 0.6, EV.catch + 0.2);
  const fishes = school(12, t, {x: 560, y: 960}, 190, 11, scare, snout);
  const caught = t >= EV.catch + 0.15;
  const pu = clamp((t - EV.catch) / 0.15);
  const preyNow = t < EV.catch ? prey : {x: lerp(prey.x, snout.x, pu), y: lerp(prey.y, snout.y, pu)};
  let c: Cam;
  if (t < 44.2) c = shot(t, 42, 44.2, cam(d.x + 80, 760, 1.0), cam(d.x - 80, 740, 1.6), 'cine');
  else if (t < 47.6) c = shot(t, 44.2, 47.6, cam(d.x - 80, 740, 1.6), cam(d.x + 40, 940, 1.15), 'cine');
  else c = shot(t, 47.6, 51, cam(380, 1000, 1.45), cam(560, 960, 1.05), 'inOut');
  c = breathe(c, t, 0.3);
  const detectClicks = [43.2, 43.45, 43.65, 43.82, 43.95, 44.05];
  const ps = toScreen(c, prey.x, prey.y);
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.35}>
        <Trunk x={760} w={90} lean={-0.02} roots={5} seed={44} t={t} under="#33281a" above="#33281a" murk={0.35} />
        {fishes.map((f, i) => (i === 0 ? null : <FreshFish key={i} x={f.x} y={f.y} s={0.85} t={t + i} dir={f.dir} flee={scare} />))}
        {!caught && <FreshFish x={preyNow.x} y={preyNow.y} s={0.9} t={t} dir={-1} flee={seg(t, 47.8, EV.catch)} opacity={1 - clamp((t - EV.catch - 0.08) / 0.07)} />}
        <PinkDolphin uid="s6" pose={pose} x={d.x} y={d.y} scale={S} angle={ang} yaw={seg(t, EV.turn, 45) * (1 - seg(t, 45.4, 46)) * 0.4} />
        <ClickWaves t={t} origin={melon} dir={Math.atan2(prey.y - melon.y, prey.x - melon.x)} clicks={detectClicks} speed={1400} maxR={900} targets={[prey]} spread={0.5} />
        {/* remolino de partículas en la captura (sin detalle gráfico) */}
        {t > EV.catch && t < EV.catch + 1 && Array.from({length: 14}, (_, i) => {
          const a = hash1(i * 3) * Math.PI * 2;
          const r = 30 + (t - EV.catch) * 160 * hash1(i);
          return <circle key={i} cx={snout.x + Math.cos(a) * r} cy={snout.y + Math.sin(a) * r * 0.6} r={3} fill="#e8f0d0" opacity={0.6 * (1 - (t - EV.catch))} />;
        })}
      </Amazon>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        {win(t, 43.3, 45, 0.25) > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: win(t, 43.3, 45, 0.25)}}>
            <circle cx={ps.x} cy={ps.y} r={70} fill="none" stroke="#ffc870" strokeWidth={4} strokeDasharray="14 10" />
          </svg>
        )}
        <Info k={win(t, 46.2, 50.2, 0.4)} text="Hocico largo + gran movilidad" top={260} size={36} />
      </>
    ),
  };
}

// ---------------- ESCENA 7 ----------------
const S7: DTrack = [[51, 'ASCEND'], [53.2, 'SURFACE'], [EV.breath, 'BREATHE']];
export function scene7(t: number): SceneOut {
  if (t < 53.4) {
    const d = path([[50.6, -200, 900], [53.4, 120, 120]], t);
    const pose = poseFrom(S7, t, {rim: 1, caustics: 1});
    const c = breathe(shot(t, 51, 53.4, cam(d.x + 60, 760, 1.0), cam(60, 320, 1.15), 'cine'), t, 0.3);
    return {
      svg: (
        <Amazon cam={c} t={t} murk={0.1} rays={1.4}>
          <PinkDolphin uid="s7a" pose={pose} x={d.x} y={d.y} scale={S} angle={-0.95} />
        </Amazon>
      ),
      overlay: <Vignette k={0.45} />,
    };
  }
  // asoma: cabeza y lomo fuera del agua, soplo, luz dorada, ondas concéntricas
  const rise = seg(t, 53.4, 54.0) * (1 - seg(t, 55.3, 56));
  const x = 40;
  const y = lerp(120, 30, rise);
  const pose = poseFrom(S7, t, {wet: 1, rim: 1, pink: 1});
  const blowhole = local(pose, x, y, 0.205, -1, -0.18);
  const bt = t - EV.breath;
  const c = breathe(cam(-60, -40, 1.25), t, 0.3);
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.1} front={false}>
        <PinkDolphin uid="s7b" pose={pose} x={x} y={y} scale={S} angle={-0.18} />
        {/* ondas concéntricas en la superficie */}
        {[0, 0.5, 1].map((k) => {
          const u = clamp((t - 53.6 - k) / 2);
          return u > 0 && u < 1 ? <ellipse key={k} cx={x - 120} cy={2} rx={120 + u * 520} ry={10 + u * 26} fill="none" stroke="#fff0c0" strokeWidth={3} opacity={(1 - u) * 0.7} /> : null;
        })}
        {/* soplo: nube de vapor y gotas por el espiráculo */}
        {bt > 0 && bt < 1.8 && (
          <g opacity={1 - bt / 1.8}>
            {Array.from({length: 22}, (_, i) => {
              const a = -Math.PI / 2 + (hash1(i * 3) - 0.5) * 0.9;
              const r = bt * (120 + hash1(i * 5) * 160);
              return <circle key={i} cx={blowhole.x + Math.cos(a) * r} cy={blowhole.y + Math.sin(a) * r + bt * bt * 40} r={6 + bt * 22 * hash1(i)} fill="#fff8e0" opacity={0.35} />;
            })}
          </g>
        )}
      </Amazon>
    ),
    overlay: (
      <>
        <Vignette k={0.4} />
        <BigTitle k={win(t, 53.8, 55.9, 0.3)} lines={['UN MAMÍFERO', 'DE AGUA DULCE']} top={260} size={74} />
      </>
    ),
  };
}

// ---------------- ESCENA 8 ----------------
const S8: DTrack = [[56, 'DESCEND'], [58.4, 'FAST']];
export function scene8(t: number): SceneOut {
  // se sumerge y vuelve a las raíces del primer plano: termina en la pose y el encuadre del fotograma 0
  const d = path([[56, 40, 120], [58.5, -760, 640], [60, HOOK_PATH[0][1], HOOK_PATH[0][2]]], t);
  const pose = poseFrom(S8, t, {caustics: 0.8, rim: 0.45});
  const end = hookCam(0, {x: HOOK_PATH[0][1], y: HOOK_PATH[0][2]});
  const c = breathe(shot(t, 56, 59.6, cam(-160, 300, 1.0), end, 'cine'), t, 0.4);
  const dir: 1 | -1 = t < 58.6 ? -1 : 1;
  const flip = clamp(1 - Math.abs(t - 58.6) / 0.35);
  const ang = t < 59.2 ? pitch(d, dir) : pitch(path(HOOK_PATH, 0.05));
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.1}>
        <PinkDolphin uid="s8" pose={{...pose, headYaw: flip * 0.6}} x={d.x} y={d.y} scale={S} angle={ang} dir={dir} yaw={flip * 1.95} />
        <Trunk x={160} w={110} lean={0.02} roots={4} seed={91} t={t} under="#3a2e1a" above="#3a2e1a" murk={0} />
      </Amazon>
    ),
    overlay: <Vignette k={0.55} />,
  };
}
