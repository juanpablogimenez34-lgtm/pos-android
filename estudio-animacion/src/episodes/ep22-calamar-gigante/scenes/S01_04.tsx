// ESCENAS 1–4.
//  1 (0–15)  EL MONSTRUO DE LAS LEYENDAS: un ojo emerge de la oscuridad; los tentáculos se lanzan y
//            atrapan un pez (recreación); corte a la silueta en plano general; el cuerpo se revela.
//  2 (15–30) EL GIGANTE REAL: animal completo con un buceador a escala; recorrido por manto, brazos y tentáculos.
//  3 (30–45) EL MUNDO SIN SOL: descenso por la columna de agua con profundímetro; la luz se apaga; silueta.
//  4 (45–60) LOS OJOS GIGANTES: primer plano del ojo; comparación con un ojo humano a escala; luz captada.
import {AbsoluteFill} from 'remotion';
import {clamp, hash1, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {GiantSquid} from '../character/GiantSquid';
import {DeepFish} from '../character/Others';
import {BigTitle, Brand, Callout, Diver, poseFrom, RecTag, seg, SqTrack, strike, toWorld, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {OceanBack, OceanFront} from '../environment/OpenOcean';


// ---------------- ESCENA 1 ----------------
const P1 = {x: -250, y: 380, a: -0.32, s: 1};
const T1 = {x: 1000, y: -60};
const TR1: SqTrack = [[0, 'TARGET_DETECTION'], [1.0, 'TENTACLE_EXTEND'], [1.65, 'PREY_GRAB'], [2.0, 'TENTACLE_RETRACT'], [4.6, 'ARM_MANIPULATION'], [9, 'CINEMATIC_REVEAL']];

export function scene01(t: number): SceneOut {
  const st = strike(t, EV.hookStrike, T1, {x: 330, y: 0}, 0.35, 2.4);
  const pose = poseFrom(TR1, t, {look: T1, tentacles: [{tip: st.tip, ext: st.ext}, {tip: {x: st.tip.x, y: st.tip.y + 18}, ext: st.ext}], tone: t < 3 ? 0.2 : t < 5 ? 0.72 : lerp(0.72, 0.35, seg(t, 5, 8)), rim: t < 3 ? 0.3 : 1});
  const eyeW = toWorld({x: -26, y: -18}, P1.x, P1.y, P1.a);
  const fishLocal = st.carrying || st.phase === 'release' || t > EV.hookStrike + 0.5 ? (st.carrying ? st.tip : {x: 300, y: 4}) : {x: T1.x + Math.sin(t * 2) * 10 - (1.3 - t) * 40, y: T1.y};
  const fishW = toWorld(fishLocal, P1.x, P1.y, P1.a);
  const tipW = toWorld(st.tip, P1.x, P1.y, P1.a);
  const bodyMid = toWorld({x: -100, y: 0}, P1.x, P1.y, P1.a);
  let c: Cam = cam(eyeW.x, eyeW.y, 6.5);
  if (t >= 1.15) c = shot(t, 1.15, 2.9, cam(eyeW.x, eyeW.y, 6.5), cam((eyeW.x + tipW.x) / 2 + 100, (eyeW.y + tipW.y) / 2, 1.5), 'cine');
  if (t >= EV.hookCut) c = cam(bodyMid.x + 60, bodyMid.y, 0.62);
  if (t >= 5) c = shot(t, 5, 10, cam(bodyMid.x + 60, bodyMid.y, 0.62), cam(bodyMid.x + 300, bodyMid.y - 60, 0.75), 'inOut');
  if (t >= 10) c = shot(t, 10, 15, cam(bodyMid.x + 300, bodyMid.y - 60, 0.75), cam(bodyMid.x + 120, bodyMid.y - 40, 0.44), 'cine');
  c = breathe(c, t, 0.25);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.9}>
        <GiantSquid uid="s1" x={P1.x} y={P1.y} angle={P1.a} pose={pose} />
        {!(st.phase === 'release' && t > EV.hookStrike + 5) && <DeepFish x={fishW.x} y={fishW.y} t={t} s={1.3} dir={-1} angle={P1.a} flail={st.carrying ? 1 : 0} opacity={t > 9 ? 1 - seg(t, 9, 10) : 1} />}
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <BigTitle k={win(t, EV.hookText, 7.4, 0.35)} lines={['¡ESTE MONSTRUO', 'ES REAL!']} top={300} size={100} />
        <RecTag k={win(t, 1.2, 14.6, 0.5)} text="RECREACIÓN ANIMADA" />
        <Brand k={clamp((t - 8) / 1)} />
        <Wash k={1 - seg(t, 0, 0.95)} />
      </>
    ),
  };
}

// ---------------- ESCENA 2 ----------------
const TR2: SqTrack = [[15, 'SLOW_SWIM'], [23, 'EXPLORING'], [27, 'SLOW_SWIM']];
export function scene02(t: number): SceneOut {
  const px = -260 + (t - 15) * 22;
  const py = 250 + Math.sin(t * 0.4) * 20;
  const a = -0.28;
  const pose = poseFrom(TR2, t, {tone: 0.3, rim: 0.8});
  const W = (lx: number, ly = 0) => toWorld({x: lx, y: ly}, px, py, a);
  const tail = W(-480);
  const head = W(0);
  const crown = W(260);
  const club = W(660, 10);
  let c: Cam = cam(W(-60).x, W(-60).y + 120, 0.46);
  if (t >= 19) c = shot(t, 19, 20, cam(W(-60).x, W(-60).y + 120, 0.46), cam(tail.x, tail.y, 1.4), 'cine');
  if (t >= 20) c = cam(lerp(tail.x, head.x, seg(t, 20, 23)), lerp(tail.y, head.y, seg(t, 20, 23)), 1.4);
  if (t >= 23) c = cam(crown.x, crown.y, lerp(1.4, 1.6, seg(t, 23, 24)));
  if (t >= 27) c = cam(lerp(crown.x, club.x, seg(t, 27, 29.5)), lerp(crown.y, club.y, seg(t, 27, 29.5)), 1.5);
  c = breathe(c, t, 0.25);
  const k = win(t, 15.6, 18.9, 0.4);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.85}>
        {t < 19.6 && <g opacity={1 - seg(t, 18.9, 19.5)}><Diver x={px + 150} y={py + 520} h={320} t={t} /></g>}
        <GiantSquid uid="s2" x={px} y={py} angle={a} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        {k > 0.01 && (
          <div style={{position: 'absolute', left: 60, right: 60, top: 1260, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k}}>
            <div style={{color: '#ffd8a8', fontWeight: 800, fontSize: 30}}>Escala aproximada · persona de 1,8 m</div>
            <div style={{color: '#cfe0f0', fontWeight: 700, fontSize: 24}}>ejemplar más grande registrado: unos 17 m de longitud total</div>
          </div>
        )}
        <Callout k={win(t, 20.4, 22.8)} x={540} y={960} tx={160} ty={560} text="manto musculoso" />
        <Callout k={win(t, 23.6, 26.8)} x={540} y={960} tx={160} ty={560} text="ocho brazos con ventosas" />
        <Callout k={win(t, 27.4, 29.8)} x={540} y={960} tx={160} ty={560} text="maza del tentáculo" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 3 ----------------
const TR3: SqTrack = [[30, 'DEEP_IDLE'], [40, 'CINEMATIC_REVEAL']];
export function scene03(t: number): SceneOut {
  const camY = lerp(-6400, 120, seg(t, 30, 42.5));
  const depth = lerp(0.05, 0.95, seg(t, 30, 42));
  const meters = Math.round(900 * clamp((camY + 6400) / 6520));
  const pose = poseFrom(TR3, t, {tone: lerp(0.95, 0.65, seg(t, 41, 44.5)), rim: seg(t, 40.5, 43)});
  const c = breathe(cam(Math.sin(t * 0.2) * 40, camY, lerp(0.8, 0.55, seg(t, 40, 45))), t, 0.2);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={depth}>
        <GiantSquid uid="s3" x={-120} y={420} angle={-0.9} pose={pose} />
        {Array.from({length: 6}, (_, i) => <DeepFish key={i} x={-500 + hash1(i) * 1000 + (t - 30) * 20} y={-5200 + i * 900} t={t + i} s={0.7} dir={1} opacity={0.5} />)}
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: win(t, 30.5, 44.6, 0.5)}}>
          <rect x={960} y={360} width={10} height={900} rx={5} fill="rgba(200,230,255,0.25)" />
          <circle cx={965} cy={360 + 900 * (meters / 900)} r={14} fill="#7ac8ff" />
          <rect x={960} y={360 + 900 * (400 / 900)} width={10} height={900 * (400 / 900)} fill="#ffb07a" opacity={0.6} />
        </svg>
        <div style={{position: 'absolute', right: 140, top: 340 + 900 * (meters / 900), fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 40, color: '#eaf6ff', opacity: win(t, 30.5, 44.6, 0.5), textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{meters} m</div>
        <div style={{position: 'absolute', right: 140, top: 360 + 900 * (560 / 900), width: 300, textAlign: 'right', fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 24, color: '#ffd0a8', opacity: win(t, 36, 44.6, 0.5)}}>capturas registradas: 400–800 m</div>
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 4 ----------------
const TR4: SqTrack = [[45, 'TARGET_DETECTION'], [50, 'DEEP_IDLE']];
export function scene04(t: number): SceneOut {
  const P = {x: 0, y: 300, a: -0.1, s: 1.4};
  const pose = poseFrom(TR4, t, {tone: 0.15, rim: 0.4, look: {x: 600, y: -200 + Math.sin(t * 0.5) * 120}});
  const eyeW = toWorld({x: -26, y: -18}, P.x, P.y, P.a, P.s);
  let c: Cam = cam(eyeW.x, eyeW.y, 5.4);
  if (t >= 50) c = shot(t, 50, 51.5, cam(eyeW.x, eyeW.y, 5.4), cam(eyeW.x + 18, eyeW.y, 4.4), 'cine');
  if (t >= 51.5) c = cam(eyeW.x + 18, eyeW.y, 4.4);
  c = breathe(c, t, 0.12);
  const es = toScreen(c, eyeW.x, eyeW.y);
  const pxPerUnit = c.zoom * P.s;
  const humanR = 2.7 * pxPerUnit; // ojo humano (~1,2 cm de radio) a la escala del calamar
  const ck = win(t, 50.4, 55.6, 0.4);
  const vk = win(t, 55.4, 59.7, 0.4);
  return {
    svg: (
      <OceanBack cam={c} t={t} depth={0.88}>
        <GiantSquid uid="s4" x={P.x} y={P.y} angle={P.a} scale={P.s} pose={pose} />
      </OceanBack>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette />
        {ck > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: ck}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              <circle cx={es.x} cy={es.y} r={28 * pxPerUnit} fill="none" stroke="#ffd8a8" strokeWidth={4} strokeDasharray="12 8" />
              <circle cx={es.x + 28 * pxPerUnit + 90} cy={es.y + 40} r={humanR} fill="#f4f4f4" stroke="#ffd8a8" strokeWidth={3} />
              <circle cx={es.x + 28 * pxPerUnit + 90} cy={es.y + 40} r={humanR * 0.45} fill="#4a6a3a" />
            </svg>
            <div style={{position: 'absolute', left: Math.min(800, es.x + 28 * pxPerUnit + 40), top: es.y + 80, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 28, color: '#ffd8a8'}}>ojo humano (a escala)</div>
          </AbsoluteFill>
        )}
        {vk > 0.01 && (
          <AbsoluteFill style={{pointerEvents: 'none', opacity: vk}}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              {Array.from({length: 26}, (_, i) => {
                const u = ((t * 0.5 + hash1(i)) % 1);
                const a0 = hash1(i * 3) * Math.PI * 2;
                const r0 = 520 * (1 - u);
                return <circle key={i} cx={es.x + Math.cos(a0) * r0} cy={es.y + Math.sin(a0) * r0} r={3 + 3 * u} fill="#9ad8ff" opacity={0.7 * Math.sin(u * Math.PI)} />;
              })}
            </svg>
            <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#cfe8ff', fontSize: 22, fontWeight: 700, letterSpacing: 2}}>VISUALIZACIÓN · LUZ QUE CAPTA EL OJO (NO EMITE RAYOS)</div>
          </AbsoluteFill>
        )}
        <Callout k={win(t, 46, 49.6)} x={es.x} y={es.y} tx={160} ty={560} text="uno de los ojos más grandes del reino animal" />
        <Brand />
      </>
    ),
  };
}

