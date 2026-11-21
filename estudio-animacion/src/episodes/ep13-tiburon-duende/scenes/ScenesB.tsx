// ESCENAS 5–8 (54–120 s · fotogramas 1620–3599).
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Grade, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {Callouts, Caption} from '../../ep10-camaron-mantis/sequences/common';
import {Question} from '../../ep11-dragon-azul/scenes/common';
import {BubbleCurtain, breathe, Cam, cam, SceneOut, shot, toScreen} from '../../../studio2';
import {glide, replay, strike, swim} from '../animation/JawMotion';
import {DeepFish, Shrimp, Squid} from '../character/DeepPrey';
import {GoblinShark, jawGeom, sharkPoint, sharkPose, SharkPose} from '../character/GoblinShark';
import {EV, SS} from '../config/episode';
import {RevealFlash, Shockwave, SlowMoFrame, WaterBurst} from '../effects/Effects';
import {DeepSea} from '../environment/DeepSea';

const win = (t: number, a: number, b: number, r = 0.4) => clamp((t - a) / r) * clamp((b - t) / r);
const P = (c: Cam, p: SharkPose, lx: number, ly: number) => {
  const w = sharkPoint(p, lx, ly);
  return toScreen(c, w.x, w.y);
};
const f1 = (n: number) => n.toFixed(1);

/** Persecución (54–88 s): el tiburón y la presa en un mismo espacio continuo. */
function hunt(te: number) {
  const x = glide(te, 54, EV.realStrike, -900, -120);
  const s = strike(te, EV.realStrike, 1);
  const p = sharkPose({...swim(te, 0.75), x, y: 0, scale: SS, jaw: s.jaw, open: s.open, exposure: 0.85, rim: 0.85});
  const mouthAtStrike = sharkPoint({...p, x: glide(EV.realStrike, 54, EV.realStrike, -900, -120), jaw: 1, open: 0.12}, 262, 34);
  // la presa nada delante y es alcanzada justo en la máxima extensión
  const fx = lerp(-320, mouthAtStrike.x, clamp((te - 54) / (EV.realStrike - 54))) + Math.sin(te * 0.8) * 10 * (te < 72 ? 1 : 0);
  const fy = mouthAtStrike.y + Math.sin(te * 1.6) * 10 * (te < 73 ? 1 : 0);
  const caught = te > EV.realStrike + 0.05;
  return {p, s, fish: {x: fx, y: fy}, caught, mouth: sharkPoint(p, 262, 34)};
}

/** ESCENA 5 · LA CAZA EN LA OSCURIDAD (54–70 s). Alternancia: lateral amplio, presa, primer plano del
 *  tiburón, plano bajo de ambos, cabeza que se prepara. Tensión progresiva. */
export function scene05(t: number): SceneOut {
  const h = hunt(t);
  const head = sharkPoint(h.p, 200, 0);
  let c: Cam;
  if (t < 58) c = shot(t, 54, 58, cam((head.x + h.fish.x) / 2, 20, 0.9), cam((head.x + h.fish.x) / 2 + 30, 30, 1.0), 'linear');
  else if (t < 61) c = shot(t, 58, 61, cam(h.fish.x, h.fish.y, 3.0), cam(h.fish.x + 20, h.fish.y, 3.3), 'linear');
  else if (t < 64) c = shot(t, 61, 64, cam(head.x - 20, head.y - 10, 2.6), cam(head.x + 20, head.y - 10, 2.8), 'linear');
  else if (t < 67) c = shot(t, 64, 67, cam((head.x + h.fish.x) / 2, 120, 1.25, -0.05), cam((head.x + h.fish.x) / 2 + 20, 110, 1.4, -0.03), 'linear');
  else c = shot(t, 67, 70, cam(head.x + 40, head.y + 10, 1.9), cam(head.x + 60, head.y + 10, 2.2), 'cine');
  c = breathe(c, t, 0.6);
  const cutK = [58, 61, 64, 67].some((k) => t > k && t < k + 0.18) ? 1 : 0;
  const tension = clamp((t - 54) / 16);
  return {
    svg: (
      <DeepSea cam={c} t={t} d={0.9} fish={0.2}>
        <DeepFish x={h.fish.x} y={h.fish.y} s={1.25} t={t * (1 + tension)} dir={1} c="#9ab6d8" />
        <GoblinShark uid="s5" p={h.p} />
      </DeepSea>
    ),
    overlay: (
      <>
        <Grade depth={0.85} vignette={0.85 + 0.15 * tension} />
        {cutK > 0 && <AbsoluteFill style={{background: '#02060f', opacity: 0.35}} />}
      </>
    ),
  };
}

/** ESCENA 6 · EL ATAQUE EXTRAORDINARIO (70–88 s). Aproximación, ataque a velocidad real (cámara y
 *  mandíbula sincronizadas), repetición a cámara lenta y vista lateral anatómica. */
export function scene06(t: number): SceneOut {
  const te = replay(t, EV.slow[0], EV.slow[1], EV.realStrike - 0.75, EV.realStrike + 1.1);
  const slow = t >= EV.slow[0] && t < EV.slow[1];
  const ana = t >= EV.slow[1];
  const h = hunt(ana ? EV.realStrike + 1.2 : te);
  const p0 = h.p;
  const anaJaw = ana ? 0.5 - 0.5 * Math.cos((t - EV.slow[1]) * 2.2) : 0;
  const p = ana ? sharkPose({...p0, ...swim(t, 0.5), jaw: anaJaw, open: anaJaw * 0.9, xray: clamp((t - EV.slow[1]) / 0.6), exposure: 0.55}) : p0;
  const head = sharkPoint(p, 210, 10);
  const u = te - EV.realStrike;
  let c: Cam = shot(t, 70, 74.2, cam(head.x - 40, head.y, 1.6), cam(head.x + 20, head.y + 10, 2.25), 'cine');
  if (t >= 74.2 && t < EV.slow[0]) {
    const kick = u > -0.05 && u < 0.3 ? Math.sin(((u + 0.05) / 0.35) * Math.PI) : 0;
    c = cam(head.x + 20 + Math.sin(t * 80) * 8 * kick, head.y + 10 + Math.cos(t * 70) * 6 * kick, 2.25 * (1 - 0.06 * kick));
  }
  if (slow) c = shot(t, EV.slow[0], EV.slow[1], cam(head.x + 50, head.y + 20, 3.0), cam(head.x + 70, head.y + 24, 3.3), 'linear');
  if (ana) c = shot(t, EV.slow[1], 85.4, cam(head.x + 40, head.y + 10, 3.0), cam(head.x - 20, head.y + 10, 2.4), 'cine');
  c = breathe(c, t, 0.4);
  const J = jawGeom({...p, jaw: 1, open: 0.6});
  const a0 = toScreen(c, sharkPoint(p, 205, 30).x, sharkPoint(p, 205, 30).y);
  const a1 = toScreen(c, sharkPoint(p, J.mouth.x + 4, J.mouth.y).x, sharkPoint(p, J.mouth.x + 4, J.mouth.y).y);
  return {
    svg: (
      <DeepSea cam={c} t={t} d={0.9} fish={0.2}>
        {!h.caught && !ana && <DeepFish x={h.fish.x} y={h.fish.y} s={1.25} t={te * 1.6} dir={1} c="#9ab6d8" />}
        <GoblinShark uid="s6" p={p} />
        {!ana && <WaterBurst x={h.mouth.x} y={h.mouth.y} u={u} s={1} />}
        {!ana && <Shockwave x={h.mouth.x} y={h.mouth.y} u={u * (slow ? 1.5 : 1)} s={0.7} />}
      </DeepSea>
    ),
    overlay: (
      <>
        <SubjectLight x={toScreen(c, head.x, head.y).x} y={toScreen(c, head.x, head.y).y} r={560} k={0.5} />
        <Grade depth={0.85} vignette={0.9} />
        {!slow && !ana && <RevealFlash u={u} />}
        <Caption text="Velocidad real" k={win(t, 71.0, 76.4, 0.4)} top={190} size={34} color="#bff6ff" />
        <SlowMoFrame k={win(t, EV.slow[0], EV.slow[1], 0.25)} label="REPETICIÓN · CÁMARA LENTA" />
        {ana && (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <svg width={1080} height={1920}>
              <defs>
                <marker id="ep13arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10Z" fill="#ffd23f" />
                </marker>
              </defs>
              <g opacity={clamp((t - 84.8) / 0.5)}>
                <path d={`M${f1(a0.x)},${f1(a0.y + 70)} L${f1(a0.x + (a1.x - a0.x) * anaJaw)},${f1(a0.y + 70 + (a1.y - a0.y) * anaJaw * 0.3)}`} stroke="#ffd23f" strokeWidth={6} markerEnd="url(#ep13arr)" />
              </g>
            </svg>
          </AbsoluteFill>
        )}
        {ana && <Caption text="Vista anatómica lateral" sub="las mandíbulas avanzan; el cráneo no" k={win(t, 84.7, 88.0, 0.4)} top={190} size={36} />}
      </>
    ),
  };
}

/** ESCENA 7 · CÓMO FUNCIONA SU MANDÍBULA (88–104 s). Ilustración científica: cuerpo atenuado, cráneo
 *  fijo, mandíbulas resaltadas y ligamentos; el mecanismo paso a paso (dos ciclos). */
export function scene07(t: number): SceneOut {
  const cyc = ((t - 88.6) / 7.4) % 1;
  const step = t < 88.6 ? 0 : cyc < 0.25 ? 1 : cyc < 0.5 ? 2 : cyc < 0.75 ? 3 : 4;
  const k = (cyc % 0.25) / 0.25;
  const e = k * k * (3 - 2 * k);
  const jaw = step === 1 ? 0 : step === 2 ? 0.1 * e : step === 3 ? 0.1 + 0.9 * e : 1 - e;
  const open = step === 1 ? 0 : step === 2 ? 0.55 * e : step === 3 ? 0.55 + 0.45 * e : (1 - e) * 1;
  const p = sharkPose({...swim(t, 0.25), x: 0, y: 0, scale: SS, jaw, open, xray: 1, exposure: 0.32, rim: 0.4, swim: 0.2});
  const c = breathe(cam(190, 20, 2.6), t, 0.3);
  const hingeS = (dy: number) => {
    const g = jawGeom(p);
    const w = sharkPoint(p, g.hingeU.x, g.hingeU.y + dy);
    return toScreen(c, w.x, w.y);
  };
  const skullA = P(c, p, 128, 4);
  const skullB = P(c, p, 128, 30);
  const hu = hingeS(2);
  const hl = hingeS(14);
  const spring = (a: {x: number; y: number}, b: {x: number; y: number}, n = 8) =>
    Array.from({length: n + 1}, (_, i) => {
      const u = i / n;
      const x = lerp(a.x, b.x, u);
      const y = lerp(a.y, b.y, u) + (i % 2 ? -10 : 10) * (i && i < n ? 1 : 0);
      return `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`;
    }).join(' ');
  const labels = ['', '1 · Boca cerrada: mandíbulas retraídas', '2 · Abre la boca', '3 · Las mandíbulas se proyectan', '4 · Cierra y las mandíbulas vuelven'];
  const fadeIn = clamp((t - 88) / 0.8);
  return {
    svg: (
      <g>
        <DeepSea cam={c} t={t} d={0.75} fish={0}>
          <GoblinShark uid="s7" p={p} />
        </DeepSea>
      </g>
    ),
    overlay: (
      <>
        <Grade depth={0.7} vignette={0.85} />
        <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(170,220,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(170,220,255,0.05) 2px, transparent 2px)', backgroundSize: '80px 80px'}} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <g opacity={fadeIn}>
              <path d={spring(skullA, hu)} stroke="#ff9ab0" strokeWidth={4} fill="none" />
              <path d={spring(skullB, hl)} stroke="#ff9ab0" strokeWidth={4} fill="none" />
            </g>
          </svg>
        </AbsoluteFill>
        <Question text="¿Lanza toda la cabeza?" k={win(t, 88.2, 91.6, 0.4)} top={250} />
        <Callouts
          items={[
            {p: P(c, p, 150, -40), label: 'cráneo (fijo)', lx: 300, ly: 470, k: win(t, 92.0, 103.6, 0.4)},
            {p: toScreen(c, sharkPoint(p, jawGeom(p).U[2].x, jawGeom(p).U[2].y).x, sharkPoint(p, jawGeom(p).U[2].x, jawGeom(p).U[2].y).y), label: 'mandíbula superior', lx: 800, ly: 600, k: win(t, 92.6, 103.6, 0.4)},
            {p: toScreen(c, sharkPoint(p, jawGeom(p).L[2].x, jawGeom(p).L[2].y).x, sharkPoint(p, jawGeom(p).L[2].x, jawGeom(p).L[2].y).y), label: 'mandíbula inferior', lx: 800, ly: 1240, k: win(t, 93.2, 103.6, 0.4)},
            {p: {x: (skullB.x + hl.x) / 2, y: (skullB.y + hl.y) / 2}, label: 'músculos y ligamentos', lx: 330, ly: 1180, k: win(t, 94.0, 103.6, 0.4)},
          ]}
        />
        {step > 0 && (
          <div style={{position: 'absolute', left: 90, right: 120, top: 330, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 36, color: '#ffffff', textShadow: '0 3px 10px rgba(0,0,0,0.8)', opacity: t > 91.8 ? 1 : 0}}>
            <span style={{background: 'rgba(2,10,24,0.7)', padding: '8px 20px', borderRadius: 16}}>{labels[step]}</span>
          </div>
        )}
        <BubbleCurtain u={(t - 87.6) / 0.9} />
      </>
    ),
  };
}

/** ESCENA 8 · UN CAZADOR DE AGUAS PROFUNDAS (104–120 s). Plano amplio y oscuro: el tiburón cruza entre
 *  peces, un cefalópodo y crustáceos (ejemplos genéricos de los grupos de su dieta). */
export function scene08(t: number): SceneOut {
  const x = glide(t, 104, 120, -900, 700);
  const p = sharkPose({...swim(t, 0.8), x, y: 60, scale: SS, exposure: 0.7, rim: 0.8, yaw: -0.15 + 0.3 * Math.sin((t - 104) * 0.2)});
  const c = breathe(shot(t, 104, 120, cam(-300, 0, 0.82), cam(300, 20, 0.9), 'linear'), t, 0.6);
  const fishes = Array.from({length: 6}, (_, i) => ({x: -700 + i * 260 + Math.sin(t * 0.5 + i) * 40 + (t - 104) * 12, y: -380 + (i % 3) * 60}));
  const sq = {x: 420 - (t - 104) * 14, y: 360};
  const sh = Array.from({length: 4}, (_, i) => ({x: -200 + i * 120 + Math.sin(t + i) * 20, y: -40 + 420 + (i % 2) * 40}));
  const labK = win(t, 106.0, 116.6, 0.5);
  return {
    svg: (
      <DeepSea cam={c} t={t} d={0.9} fish={0.4}>
        {fishes.map((f, i) => (
          <DeepFish key={i} x={f.x} y={f.y} s={0.9} t={t + i} dir={1} c="#8aa6c8" seed={i} />
        ))}
        <Squid x={sq.x} y={sq.y} s={1.5} t={t} dir={-1} />
        {sh.map((q, i) => (
          <Shrimp key={i} x={q.x} y={q.y} s={1.1} t={t} dir={i % 2 ? 1 : -1} seed={i} />
        ))}
        <GoblinShark uid="s8" p={p} />
      </DeepSea>
    ),
    overlay: (
      <>
        <Grade depth={0.8} vignette={0.85} />
        <Callouts
          items={[
            {p: toScreen(c, fishes[3].x, fishes[3].y), label: 'peces', lx: 540, ly: 470, k: labK},
            {p: toScreen(c, sq.x, sq.y), label: 'cefalópodos', lx: 800, ly: 1230, k: labK},
            {p: toScreen(c, sh[1].x, sh[1].y), label: 'crustáceos', lx: 300, ly: 1230, k: labK},
          ]}
        />
        <Caption text="Ejemplos genéricos de su dieta" k={win(t, 106.0, 110.4, 0.4)} top={190} size={32} />
      </>
    ),
  };
}
