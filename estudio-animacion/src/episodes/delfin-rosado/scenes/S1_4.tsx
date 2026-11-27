// ESCENAS 1–4.
//  1 (0–5)   EL DELFÍN IMPOSIBLE: nada rápido entre raíces gigantes, atraviesa el hueco entre dos troncos (uno delante
//            de él, otro detrás), la cámara lo sigue; gira la cabeza y mira a la cámara. «¡UN DELFÍN EN LA SELVA!»
//  2 (5–12)  EL HABITANTE DEL AMAZONAS: el río y la selva desde la superficie (el lomo asoma); la cámara atraviesa
//            la superficie y lo encuentra nadando entre los árboles sumergidos.
//  3 (12–22) ¿POR QUÉ ES ROSADO?: cría gris → juvenil → adulto rosado (paso del tiempo, no un cambio instantáneo);
//            primer plano de la piel: pigmentación y cicatrices.
//  4 (22–32) EL CUELLO EXTRAORDINARIO: gira la cabeza con el cuerpo estable; vista cenital del giro del cuello;
//            maniobra entre raíces con las aletas pectorales.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {DolphinPose, PinkDolphin, dolphinPoint} from '../character/PinkDolphin';
import {BigTitle, DTrack, Info, Label, poseFrom, seg, Vignette, win} from '../components/common';
import {Amazon, FreshFish, school, Trunk} from '../environment/Amazon';

type V = {x: number; y: number};
export const S = 0.5; // escala del adulto (L = 1.000 u → 500 u)
/** Trayectoria con inercia (Catmull-Rom en el tiempo). */
export function path(keys: [number, number, number][], t: number) {
  const n = keys.length;
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], vx: 0, vy: 0};
  if (t >= keys[n - 1][0]) return {x: keys[n - 1][1], y: keys[n - 1][2], vx: 0, vy: 0};
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)];
  const k1 = keys[i];
  const k2 = keys[i + 1];
  const k3 = keys[Math.min(n - 1, i + 2)];
  const cr = (a: number, b: number, c: number, d: number, u: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  const at = (tt: number) => {
    const u = clamp((tt - k1[0]) / (k2[0] - k1[0]));
    return {x: cr(k0[1], k1[1], k2[1], k3[1], u), y: cr(k0[2], k1[2], k2[2], k3[2], u)};
  };
  const p = at(t);
  const q = at(t + 1 / 30);
  return {x: p.x, y: p.y, vx: (q.x - p.x) * 30, vy: (q.y - p.y) * 30};
}
/** Ángulo de cabeceo a partir de la velocidad (el cuerpo sigue la trayectoria). */
export const pitch = (v: {vx: number; vy: number}, dir: 1 | -1 = 1, max = 0.6) => clamp(Math.atan2(v.vy, Math.abs(v.vx) + 30) * dir, -max, max);
export const START: [number, number, number] = [0, -520, 700];
export const HOOK_PATH: [number, number, number][] = [START, [1.6, 60, 660], [3.2, 520, 640]];
export const hookCam = (t: number, d: {x: number; y: number}): Cam => cam(d.x - 190, d.y - 30, 1.25 + t * 0);

// ---------------- ESCENA 1 ----------------
const HOOK: DTrack = [[0, 'FAST'], [2.6, 'HEAD_TURN']];
export function scene1(t: number): SceneOut {
  const d = path(HOOK_PATH, t);
  const turn = seg(t, 2.3, 3.1);
  const pose: DolphinPose = poseFrom(HOOK, t, {headYaw: turn * 0.75, rim: 0.45, caustics: 0.8, flipper: -0.3 + turn * 0.6});
  const front = clamp((t - 3.0) / 0.45);
  let c = breathe(hookCam(t, d), t, 0.4);
  if (t > 2.6) c = shot(t, 2.6, 4.9, hookCam(2.6, path(HOOK_PATH, 2.6)), cam(d.x - 40, d.y - 50, 1.6), 'cine');
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.1}>
        <g opacity={1 - front}>
          <PinkDolphin uid="h1" pose={pose} x={d.x} y={d.y} scale={S} angle={pitch(d)} yaw={turn * 0.4} />
        </g>
        {front > 0.01 && (
          <g opacity={front}>
            <PinkDolphin uid="h1f" pose={{...pose, headYaw: Math.sin(t * 1.2) * 0.12}} x={d.x + 40} y={d.y - 40} scale={0.62 + (t - 3) * 0.08} view="front" />
          </g>
        )}
        {/* tronco cercano por DELANTE del delfín: atraviesa el hueco entre dos árboles */}
        <Trunk x={160} w={110} lean={0.02} roots={4} seed={91} t={t} under="#3a2e1a" above="#3a2e1a" murk={0} />
      </Amazon>
    ),
    overlay: (
      <>
        <Vignette k={0.55} />
        <BigTitle k={win(t, 0.25, 4.85, 0.25)} lines={['¡UN DELFÍN', 'EN LA SELVA!']} top={250} size={96} />
      </>
    ),
  };
}

// ---------------- ESCENA 2 ----------------
const S2: DTrack = [[5, 'SLOW'], [9, 'EXPLORE']];
export function scene2(t: number): SceneOut {
  // 5–8: superficie del río; el lomo y la cresta dorsal asoman en un arco
  const arc = seg(t, 5.6, 7.8);
  const above = {x: lerp(-500, 300, arc), y: 60 - Math.sin(arc * Math.PI) * 110};
  const under = path([[8, -700, 650], [12, 120, 600]], t);
  const pose = poseFrom(S2, t, {caustics: 1, rim: 0.4});
  let c: Cam;
  if (t < 8) c = breathe(cam(-60, -380, 0.78), t, 0.4);
  else if (t < 9.6) c = shot(t, 8, 9.6, cam(-60, -380, 0.78), cam(under.x - 120, 560, 1.0), 'inOut');
  else c = breathe(cam(under.x - 120, 560, 1.0), t, 0.4);
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.15}>
        {t < 8.2 && <PinkDolphin uid="s2a" pose={{...pose, wet: 1, rim: 0.7}} x={above.x} y={above.y} scale={S} angle={lerp(-0.35, 0.4, arc)} />}
        {t >= 8 && <PinkDolphin uid="s2b" pose={pose} x={under.x} y={under.y} scale={S} angle={pitch(under)} />}
        {school(8, t, {x: 300, y: 420}, 160, 3).map((f, i) => <FreshFish key={i} x={f.x} y={f.y} s={0.8} t={t + i} dir={f.dir} />)}
      </Amazon>
    ),
    overlay: (
      <>
        <Vignette k={0.45} />
        <Info k={win(t, 5.3, 8.4, 0.4)} text="Ríos de Sudamérica · cuenca del Amazonas" top={260} size={34} />
        <BigTitle k={win(t, 9.8, 11.9, 0.4)} lines={['BOSQUES SUMERGIDOS']} top={260} size={72} />
      </>
    ),
  };
}

// ---------------- ESCENA 3 ----------------
const S3: DTrack = [[12, 'SLOW']];
export function scene3(t: number): SceneOut {
  const grow = seg(t, 15.2, 20.2);
  const d = path([[12, -600, 700], [20.2, 260, 640]], t);
  const pose = poseFrom(S3, t, {pink: grow, caustics: 0.9, rim: 0.4});
  const s = lerp(0.34, S, grow);
  if (t >= 20.2) {
    // primer plano de la piel del adulto: moteado y cicatrices
    const c = breathe(shot(t, 20.2, 22, cam(-30, 600, 2.6), cam(-60, 600, 3.0), 'inOut'), t, 0.15);
    const pz = poseFrom(S3, t, {pink: 1, caustics: 1, amp: 0.25});
    const sc = toScreen(c, -20 + dolphinPoint(pz, 0.45, -0.3).x * S, 600 + dolphinPoint(pz, 0.45, -0.3).y * S);
    const sp = toScreen(c, -20 + dolphinPoint(pz, 0.55, 0.4).x * S, 600 + dolphinPoint(pz, 0.55, 0.4).y * S);
    return {
      svg: (
        <Amazon cam={c} t={t} murk={0.1} front={false}>
          <PinkDolphin uid="s3c" pose={pz} x={160} y={600} scale={S} />
        </Amazon>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Label x={sc.x} y={sc.y} tx={sc.x + 140} ty={sc.y - 340} text="CICATRICES" k={win(t, 20.4, 21.9, 0.25)} color="#ffe0d0" />
          <Label x={sp.x} y={sp.y} tx={sp.x - 60} ty={sp.y + 320} text="PIGMENTACIÓN" k={win(t, 20.7, 21.9, 0.25)} />
        </>
      ),
    };
  }
  const c = breathe(cam(d.x - lerp(90, 170, grow), 640, lerp(1.35, 1.05, grow)), t, 0.4);
  const stage = grow < 0.33 ? 'CRÍA' : grow < 0.7 ? 'JUVENIL' : 'ADULTO';
  const ds = toScreen(c, d.x, d.y);
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.12}>
        <PinkDolphin uid="s3" pose={pose} x={d.x} y={d.y} scale={s} angle={pitch(d)} />
        {school(6, t, {x: d.x + 500, y: 900}, 140, 7).map((f, i) => <FreshFish key={i} x={f.x} y={f.y} s={0.7} t={t + i} dir={f.dir} kind={i % 3 ? 'characin' : 'cichlid'} />)}
      </Amazon>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Label x={ds.x - 40} y={ds.y - 20} tx={ds.x + 60} ty={ds.y - 330} text="AL NACER: GRIS" k={win(t, 12.3, 15.2, 0.3)} color="#dfe6ea" />
        {/* barra del paso del tiempo */}
        {win(t, 15.2, 20.2, 0.4) > 0.01 && (
          <div style={{position: 'absolute', left: 120, right: 120, top: 250, fontFamily: FONT_FAMILY, opacity: win(t, 15.2, 20.2, 0.4)}}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#f4e8d8', fontWeight: 800, fontSize: 30, letterSpacing: 2, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
              {['CRÍA', 'JUVENIL', 'ADULTO'].map((x) => <span key={x} style={{color: x === stage ? '#ffd0c8' : '#a8b0a0'}}>{x}</span>)}
            </div>
            <div style={{height: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 4, marginTop: 12}}>
              <div style={{height: 8, width: `${(grow * 100).toFixed(1)}%`, background: 'linear-gradient(90deg,#9aa1a8,#d79ea0)', borderRadius: 4}} />
            </div>
            <div style={{textAlign: 'center', color: '#e8e0c8', fontWeight: 700, fontSize: 26, marginTop: 14, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>años de crecimiento · el color varía entre individuos</div>
          </div>
        )}
      </>
    ),
  };
}

// ---------------- ESCENA 4 ----------------
const S4: DTrack = [[22, 'EXPLORE'], [22.8, 'HEAD_TURN'], [29.2, 'ROOTS']];
/** Vista cenital estilizada: agua ámbar con manchas de sol y raíces vistas desde arriba. */
function overhead(t: number): SceneOut {
  const yaw = Math.sin((t - 26.4) * 1.8) * 0.8;
  const pose = poseFrom(S4, t, {headYaw: yaw, bend: -yaw * 0.25, flipper: yaw * 0.9});
  return {
    svg: (
      <g>
        <defs>
          <radialGradient id="ovG" cx="0.5" cy="0.4" r="0.8">
            <stop offset="0" stopColor="#7a6a2a" />
            <stop offset="1" stopColor="#2a2a14" />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#ovG)" />
        {Array.from({length: 18}, (_, i) => <ellipse key={i} cx={(i * 197 + t * 12) % 1180 - 50} cy={(i * 331) % 1920} rx={60 + (i % 4) * 20} ry={18} fill="#fff0b0" opacity={0.08 + 0.05 * Math.sin(t + i)} />)}
        {[[180, 520, 70], [900, 760, 90], [220, 1420, 80], [860, 1500, 60], [540, 280, 50]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="#3a2e1a" stroke="#1a140a" strokeWidth={6} />
            {Array.from({length: 4}, (_, k) => <path key={k} d={`M${x},${y} q${Math.cos(k * 1.6 + i) * r * 2},${Math.sin(k * 1.6 + i) * r * 0.6} ${Math.cos(k * 1.6 + i) * r * 3},${Math.sin(k * 1.6 + i) * r * 2}`} stroke="#3a2e1a" strokeWidth={18} fill="none" strokeLinecap="round" />)}
          </g>
        ))}
        <PinkDolphin uid="s4o" pose={pose} x={540} y={1180} scale={0.62} view="top" angle={-Math.PI / 2} />
      </g>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <BigTitle k={win(t, 26.6, 29.1, 0.3)} lines={['CUELLO FLEXIBLE']} top={250} size={78} />
        <Info k={win(t, 26.9, 29.1, 0.3)} text="vértebras del cuello no fusionadas" top={360} size={32} />
      </>
    ),
  };
}
export function scene4(t: number): SceneOut {
  if (t >= 26.4 && t < 29.2) return overhead(t);
  if (t < 26.4) {
    const hover = {x: 40 + Math.sin(t * 0.4) * 20, y: 760 + Math.sin(t * 0.6) * 10};
    const yaw = seg(t, 22.8, 23.6) * 0.75 * Math.sin((t - 23) * 1.4 + 1.2);
    const pose = poseFrom(S4, t, {headYaw: yaw, headPitch: Math.sin(t * 0.9) * 0.12, caustics: 0.8, rim: 0.4});
    const c = breathe(shot(t, 22, 26.4, cam(hover.x - 200, 740, 1.3), cam(hover.x - 110, 750, 1.9), 'cine'), t, 0.25);
    const neck = toScreen(c, hover.x + dolphinPoint(pose, 0.22, -0.5).x * S, hover.y + dolphinPoint(pose, 0.22, -0.5).y * S);
    return {
      svg: (
        <Amazon cam={c} t={t} murk={0.2}>
          <PinkDolphin uid="s4a" pose={pose} x={hover.x} y={hover.y} scale={S} yaw={0.15} />
          <Trunk x={330} w={90} lean={-0.03} roots={3} seed={77} t={t} under="#3a2e1a" above="#3a2e1a" murk={0.2} />
        </Amazon>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Label x={neck.x} y={neck.y} tx={neck.x - 60} ty={neck.y - 360} text="GIRA LA CABEZA" k={win(t, 23.2, 26.2, 0.3)} />
        </>
      ),
    };
  }
  // 29,2–32: maniobra entre raíces con las aletas pectorales
  const d = path([[29.2, -300, 820], [30.4, 0, 700], [31.4, 280, 820], [32.2, 520, 720]], t);
  const pose = poseFrom(S4, t, {flipper: Math.sin((t - 29.2) * 3.2) * 1.0, headYaw: Math.sin((t - 29.2) * 3.2) * 0.25, caustics: 0.6});
  const c = breathe(cam(d.x - 160, 760, 1.2), t, 0.3);
  const fl = toScreen(c, d.x + dolphinPoint(pose, 0.3, 1).x * S, d.y + dolphinPoint(pose, 0.3, 1).y * S + 30);
  return {
    svg: (
      <Amazon cam={c} t={t} murk={0.25}>
        <PinkDolphin uid="s4m" pose={pose} x={d.x} y={d.y} scale={S} angle={pitch(d)} yaw={0.25} />
        <Trunk x={140} w={70} lean={0.04} roots={5} seed={63} t={t} under="#33281a" above="#33281a" murk={0.25} />
      </Amazon>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Label x={fl.x} y={fl.y} tx={fl.x + 40} ty={fl.y + 300} text="ALETAS PECTORALES" k={win(t, 29.5, 31.9, 0.3)} color="#ffe0d0" />
      </>
    ),
  };
}
export type {V};
