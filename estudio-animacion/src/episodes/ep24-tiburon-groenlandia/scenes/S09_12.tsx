// ESCENAS 9–12.
//  9  (120–135) ¿CÓMO SABEMOS SU EDAD?: buque científico moderno → laboratorio ilustrado → cristalino y núcleo.
//  10 (135–150) EL DESCUBRIMIENTO DE LOS 392 AÑOS: lámina del ejemplar (≈ 5 m) → 392 → barra ±120 años.
//  11 (150–165) SOBREVIVIR EN UN MUNDO CAMBIANTE: bajo aguas frías → barcos modernos (pesca) → océano amplio.
//  12 (165–180) EL VIAJERO DEL TIEMPO: escenario cinematográfico → montaje de épocas → se aleja en la oscuridad.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot} from '../../../studio2';
import {DeepOcean, OceanFront, SurfaceWorld} from '../../ep23-cachalote/environment/Ocean';
import {GreenlandShark, SL} from '../character/GreenlandShark';
import {BigTitle, Note, poseFrom, seg, STrack, Tag, toWorld, Vignette, Wash, win} from '../components/common';
import {EV} from '../data/timeline';
import {AgeEstimate, Lab, LensDiagram} from '../environment/Lab';
import {Brig18, Galleon17, Research21, Steamer19, Trawler20} from '../environment/Ships';
import {ColdFish, IceCeiling, Seabed} from '../environment/World';

// ---------------- ESCENA 9 ----------------
export function scene09(t: number): SceneOut {
  if (t < EV.lab) {
    const c = breathe(cam(-100 + (t - 120) * 30, -320, 0.5), t, 0.2);
    const P = {x: 200 + (t - 120) * 40, y: 1700, a: 0};
    return {
      svg: (
        <SurfaceWorld cam={c} t={t}>
          <Research21 x={-300 + (t - 120) * 30} t={t} s={0.7} />
          <GreenlandShark uid="s9" pose={poseFrom([[120, 'SLOW_SWIM']], t, {age: 0.9}, 0.7)} x={P.x} y={P.y} scale={0.9} />
        </SurfaceWorld>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Note k={win(t, 120.4, 124.8, 0.4)} text="Buque de investigación (ilustración)" top={1290} />
        </>
      ),
    };
  }
  return {
    svg: <rect width={1080} height={1920} fill="#0a1c24" />,
    overlay: (
      <>
        <Lab t={t} t0={EV.lab} pan={seg(t, EV.lab, EV.lens)} />
        {t >= EV.lens - 0.2 && <LensDiagram t={t} t0={EV.lens} />}
        <Wash k={1 - clamp((t - EV.lab) / 0.5)} />
        <Tag k={win(t, 125.3, 134.8, 0.4)} text="LABORATORIO ILUSTRADO" color="#9ff0ff" />
      </>
    ),
  };
}

// ---------------- ESCENA 10 ----------------
export function scene10(t: number): SceneOut {
  const s = 0.72;
  const P = {x: 360, y: 1180, a: 0};
  const pose = poseFrom([[135, 'SCIENTIFIC_REVEAL']], t, {age: 1, rim: 0.9}, 1.2);
  const nose = toWorld({x: 0, y: 0}, P.x, P.y, 0, s);
  const tailX = P.x - 1.05 * SL * s;
  return {
    svg: (
      <g>
        <rect width={1080} height={1920} fill="#0c2430" />
        {Array.from({length: 24}, (_, i) => <line key={`v${i}`} x1={i * 48} y1={0} x2={i * 48} y2={1920} stroke="#1c3c48" strokeWidth={1} />)}
        {Array.from({length: 40}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 48} x2={1080} y2={i * 48} stroke="#1c3c48" strokeWidth={1} />)}
        <g transform={`translate(${(540 - (nose.x + tailX) / 2).toFixed(1)} 0)`}>
          <GreenlandShark uid="s10" pose={pose} x={P.x} y={P.y} scale={s} />
          <line x1={tailX} y1={P.y + 150} x2={nose.x} y2={P.y + 150} stroke="#ffd870" strokeWidth={3} />
          <line x1={tailX} y1={P.y + 136} x2={tailX} y2={P.y + 164} stroke="#ffd870" strokeWidth={3} />
          <line x1={nose.x} y1={P.y + 136} x2={nose.x} y2={P.y + 164} stroke="#ffd870" strokeWidth={3} />
          <text x={(tailX + nose.x) / 2} y={P.y + 196} textAnchor="middle" fill="#ffd870" fontSize={28} fontWeight={800} fontFamily={FONT_FAMILY}>ejemplar de unos 5 m (502 cm)</text>
        </g>
      </g>
    ),
    overlay: (
      <>
        <AgeEstimate t={t} tNum={EV.num392} tRange={EV.range} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 28, color: '#cfe8ff', opacity: win(t, 135.4, 139.8, 0.4)}}>Ilustración científica del ejemplar más grande del estudio</div>
        <Note k={win(t, 135.4, 149.8, 0.4)} text="Nielsen et al. (2016), Science · DOI 10.1126/science.aaf1703" top={1700} />
      </>
    ),
  };
}

// ---------------- ESCENA 11 ----------------
const TR11: STrack = [[150, 'UNDER_ICE_SWIM'], [160, 'SLOW_SWIM']];
export function scene11(t: number): SceneOut {
  if (t < 155) {
    const P = {x: -400 + (t - 150) * 50, y: 480, a: 0.02};
    const mid = toWorld({x: -0.45 * SL, y: 0}, P.x, P.y, P.a, 0.9);
    const c = breathe(cam(mid.x + 60, 300, 0.75), t, 0.2);
    return {
      svg: (
        <DeepOcean cam={c} t={t} depth={0.4} glow={0} violet={0.1}>
          <IceCeiling t={t} x0={-2400} x1={2400} />
          <GreenlandShark uid="s11a" pose={poseFrom(TR11, t, {age: 0.95, tone: 0.15}, 2)} x={P.x} y={P.y} angle={P.a} scale={0.9} />
        </DeepOcean>
      ),
      overlay: (
        <>
          <OceanFront cam={c} t={t} />
          <Vignette k={0.6} />
        </>
      ),
    };
  }
  if (t < 160) {
    let c: Cam = cam(0, -260, 0.45);
    c = shot(t, 155, 160, c, cam(-200, 500, 0.45), 'inOut');
    c = breathe(c, t, 0.2);
    return {
      svg: (
        <SurfaceWorld cam={c} t={t}>
          <Trawler20 x={-260 + (t - 155) * 40} t={t} s={0.8} />
          <Research21 x={900 + (t - 155) * 25} t={t} s={0.5} />
          <GreenlandShark uid="s11b" pose={poseFrom(TR11, t, {age: 0.95}, 2)} x={-900 + (t - 155) * 45} y={1100} scale={0.8} />
        </SurfaceWorld>
      ),
      overlay: (
        <>
          <Vignette k={0.5} />
          <Note k={win(t, 155.3, 159.8, 0.4)} text="Pesquerías y captura accidental: una amenaza para una especie de reproducción lenta" top={1290} />
        </>
      ),
    };
  }
  const c = breathe(cam(300, 380, lerp(0.5, 0.36, seg(t, 160, 165))), t, 0.2);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={0.7} glow={0.3} violet={0.15}>
        <Seabed t={t} x0={-3000} x1={3600} y={1000} />
        <ColdFish t={t} cx={-200} cy={100} n={14} s={0.6} />
        <ColdFish t={t + 7} cx={1100} cy={600} n={9} s={0.55} dir={-1} />
        <GreenlandShark uid="s11c" pose={poseFrom(TR11, t, {age: 0.95, tone: 0.2}, 2)} x={-200 + (t - 160) * 40} y={500} scale={0.85} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.6} />
      </>
    ),
  };
}

// ---------------- ESCENA 12 ----------------
const TR12: STrack = [[165, 'SLOW_SWIM'], [175, 'FINAL_RETREAT']];
export function scene12(t: number): SceneOut {
  const [m0, m1, m2, m3] = EV.montage;
  if (t >= m0 && t < m3 + 1.25) {
    const i = t < m1 ? 0 : t < m2 ? 1 : t < m3 ? 2 : 3;
    const c = breathe(cam(-60 + (t - m0) * 60, -320, 0.5), t, 0.2);
    const Ship = [Galleon17, Brig18, Steamer19, Research21][i];
    const k = clamp(Math.min((t - EV.montage[i]) / 0.3, (EV.montage[i] + 1.25 - t) / 0.3));
    return {
      svg: (
        <SurfaceWorld cam={c} t={t} light={lerp(1, 0.75, i / 3)}>
          <Ship x={-120 + (t - m0) * 50} t={t} s={0.7} k={k} />
        </SurfaceWorld>
      ),
      overlay: (
        <>
          <Vignette k={0.6} />
          <Note k={1} text={['siglo XVII', 'siglo XVIII', 'siglo XIX', 'siglo XXI'][i]} top={1290} />
        </>
      ),
    };
  }
  const late = t >= 175;
  const P = late ? {x: 100 + (t - 175) * 80, y: 400 + (t - 175) * 70, a: 0.25} : {x: -500 + (t - 165) * 60, y: 420, a: 0.02};
  const pose = poseFrom(TR12, t, {age: 1, tone: late ? lerp(0.3, 0.85, seg(t, 175, 179)) : 0.15, rim: late ? 0.4 : 0.85}, 0.2);
  const mid = toWorld({x: -0.45 * SL, y: 0}, P.x, P.y, P.a, 0.9);
  const c = late ? breathe(cam(200, 500, 0.5), t, 0.2) : breathe(cam(mid.x + 100, 380, lerp(0.75, 0.6, seg(t, 165, 170))), t, 0.2);
  return {
    svg: (
      <DeepOcean cam={c} t={t} depth={late ? lerp(0.8, 1, seg(t, 175, 179)) : 0.55} glow={0.35} violet={0.18}>
        {!late && <Seabed t={t} x0={-2400} x1={3000} y={900} />}
        {!late && <ColdFish t={t} cx={400} cy={150} n={10} s={0.55} />}
        <GreenlandShark uid="s12" pose={pose} x={P.x} y={P.y} angle={P.a} scale={0.9} />
      </DeepOcean>
    ),
    overlay: (
      <>
        <OceanFront cam={c} t={t} />
        <Vignette k={0.6} />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿Y SI PUDIERAS', 'VIVIR 400 AÑOS?']} top={330} size={80} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#eaf4ff', opacity: 0.85 * clamp((t - EV.endText - 0.6) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
