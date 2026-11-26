// ESCENA 3 (45–70)  LOS OJOS INDEPENDIENTES: primer plano de la cabeza; un ojo sigue a un insecto que queda detrás
//                   (a la izquierda) mientras el otro explora; rótulos de la torreta y la pupila; esquema cenital del
//                   campo visual de cada ojo; al detectar la presa, ambos ojos se alinean (visión binocular).
// ESCENA 4 (70–95)  LA LENGUA RELÁMPAGO: un grillo camina sobre una hoja; el camaleón se acerca despacio sin
//                   perderlo de vista; esquema del mecanismo (hueso, músculo acelerador, fundas elásticas);
//                   captura en cámara lenta, de perfil, con apertura de boca, impacto y retracción.
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {Chameleon, chamToWorld, CHAM_ANCHORS} from '../character/Chameleon';
import {Branch, branchAt, lookAt, makeWalk, poseOn, restFeet, scanEye, strike} from '../character/motion';
import {colorTrack} from '../character/skin';
import {Brand, Forest, Label, seg, Tag, win} from '../components/common';
import {Butterfly, Cricket, Fly, flyPath} from '../environment/Critters';
import {BranchArt, TropicalLeaf} from '../environment/Forest';
import {Card, TongueDiagram, VisionDiagram} from './Science';
import {toScreen} from '../../../studio2';

const breatheCam = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 5 * k, y: c.y + Math.sin(t * 0.29 + 1) * 4 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});

// ---------------------------------------------------------------- ESCENA 3
const B3: Branch = {pts: [{x: -800, y: 1300}, {x: 300, y: 1230}, {x: 1200, y: 1180}, {x: 2000, y: 1150}], r: 26};
const X3 = 60;
const S3 = 1.3;
export function scene3(t: number): SceneOut {
  const color = colorTrack([[0, 'rest'], [47, 'turquoise', 4]], t);
  const P = poseOn(B3, X3, restFeet(B3, X3, S3, 1), {scale: S3, facing: 1, t, color, tail: {curl: 0.9, base: 0.75}});
  const eyeW = chamToWorld(P, CHAM_ANCHORS.EYE_C);
  // mariposa detrás (a la izquierda del encuadre) y grillo delante
  const bf = flyPath(t, {x: eyeW.x - 330, y: eyeW.y - 120}, 70, 11);
  const prey = {x: eyeW.x + 380, y: eyeW.y + 150};
  const lock = smoothstep(63, 64.6, t);
  const nearOnBug = t < 58 ? lookAt(eyeW, bf, 1, P.angle) : scanEye(t, 3);
  const nearLock = lookAt(eyeW, prey, 1, P.angle);
  P.eyeN = {yaw: lerp(nearOnBug.yaw, nearLock.yaw, lock), pitch: lerp(nearOnBug.pitch, nearLock.pitch, lock)};
  const farScan = scanEye(t + 4, 17);
  P.eyeF = {yaw: lerp(farScan.yaw, 1.0, lock), pitch: lerp(farScan.pitch, -0.2, lock)};
  P.headPitch = lock * 0.04;
  const c = breatheCam(t < 58 ? shot(t, 45, 49, cam(eyeW.x - 60, eyeW.y + 20, 2.2), cam(eyeW.x - 20, eyeW.y + 10, 2.9)) : shot(t, 63.5, 66.5, cam(eyeW.x - 20, eyeW.y + 10, 2.9), cam(eyeW.x + 150, eyeW.y + 80, 1.45)), t, 0.3);
  const es = toScreen(c, eyeW.x, eyeW.y);
  const dim = win(t, 58.4, 64.4, 0.6);
  const main = (
    <g>
      <BranchArt b={B3} light="day" seed={12} />
      <Chameleon pose={P} uid="s3" />
      {t < 64 && <Butterfly x={bf.x} y={bf.y} t={t} s={1.4} hue="#f2b030" />}
      <TropicalLeaf x={prey.x - 120} y={prey.y + 60} len={230} ang={-0.1} t={t} light="day" seed={33} />
      <Cricket x={prey.x} y={prey.y + 10} t={t} s={1.3} walk={0.3} facing={-1} />
    </g>
  );
  // panel: los dos ojos en el esquema cenital con la misma lógica (independientes → bloqueo)
  const yl = scanEye(t, 21).yaw * 0.9;
  const yr = scanEye(t + 2, 23).yaw * 0.9;
  return {
    svg: (
      <g>
        <Forest cam={c} t={t} light="day" L={{seed: 13, span: [-1600, 2800]}} main={main} />
        {dim > 0.01 && <rect width={1080} height={1920} fill="#04100c" opacity={dim * 0.6} />}
        <Label x={es.x} y={es.y} tx={es.x - 60} ty={es.y - 300} text="torreta de escamas" k={win(t, 52.4, 58.2, 0.4)} />
        <Label x={es.x + 10} y={es.y} tx={es.x - 120} ty={es.y + 360} text="pequeña abertura: pupila" k={win(t, 53.6, 58.2, 0.4)} />
        <Card x={90} y={330} w={900} h={1180} k={dim} title="CAMPO VISUAL">
          <VisionDiagram cx={540} cy={1000} t={t} yawL={yl} yawR={yr} lock={smoothstep(62.6, 64, t)} prey={{x: 640, y: 560}} />
          <text x={540} y={1450} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={32} fill="#f6f2e4">{t < 62.6 ? 'cada ojo explora por su cuenta' : 'ambos ojos sobre la presa'}</text>
        </Card>
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 46, 51.6, 0.5)} text="UN OJO SIGUE A LA MARIPOSA · EL OTRO EXPLORA" top={330} color="#ffe2a0" />
        <Tag k={win(t, 65, 69.6, 0.5)} text="◎ OBJETIVO FIJADO" top={330} color="#ff8a6a" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 4
const B4: Branch = {pts: [{x: -900, y: 1320}, {x: 200, y: 1250}, {x: 1100, y: 1200}, {x: 2200, y: 1170}], r: 26};
const S4 = 1.25;
const LEAF4 = {x: 760, y: 930};
const ST4 = 86.4;
export function scene4(t: number): SceneOut {
  const walk = makeWalk(B4, S4, 1, -260, 70, 96, (tt) => 30 * smoothstep(70.3, 71, tt) * (1 - smoothstep(84.6, 85.6, tt)));
  const w = walk.at(t);
  const st = strike(t, ST4, 6);
  const color = colorTrack([[0, 'turquoise'], [86.6, 'excited', 2]], t);
  const P = poseOn(B4, w.x, w.feet, {scale: S4, facing: 1, t, color, rock: Math.sin(w.phase * Math.PI * 4) * 5 * smoothstep(0, 10, w.speed), tail: {curl: 0.75, base: 0.6}});
  const eyeW = chamToWorld(P, CHAM_ANCHORS.EYE_C);
  // grillo sobre la hoja: camina y se detiene; tras el impacto sigue pegado a la lengua
  const cx = LEAF4.x + 60 + Math.sin(t * 0.5) * 40 * (t < ST4 ? 1 : 0);
  const cr = {x: t < ST4 + 1.5 ? cx : LEAF4.x + 60 + Math.sin(ST4 * 0.5) * 40, y: LEAF4.y - 8};
  const tgt = {x: cr.x, y: cr.y - 6};
  P.eyeN = lookAt(eyeW, tgt, 1, P.angle);
  P.eyeF = t > ST4 + 0.6 ? {yaw: 1.0, pitch: -0.2} : scanEye(t, 31);
  P.headPitch = -0.06 * st.lean;
  P.x += st.lean * 12;
  P.jaw = st.jaw;
  if (st.ext > 0) P.tongue = {ext: st.ext, target: tgt, bulge: st.bulge, prey: st.caught ? <Cricket x={0} y={6} t={t} s={1.2} caught facing={-1} /> : undefined};
  const diag = win(t, 74.0, 86.6, 0.6);
  const k = t < 79.4 ? seg(t, 74.5, 79.2) * 0.5 : t < 82.2 ? 0.5 : t < 85.8 ? lerp(0.5, 0.84, seg(t, 82.2, 83.2)) : lerp(0.84, 1, seg(t, 85.4, 86.4));
  const c = breatheCam(t < 86 ? shot(t, 70, 76, cam(w.x + 300, 1010, 1.2), cam(w.x + 330, 1000, 1.22)) : shot(t, 86, 88.6, cam(w.x + 330, 1000, 1.22), cam((w.x + cr.x) / 2 + 40, 990, 1.0)), t, 0.4);
  const slow = win(t, 88.6, 92.4, 0.3);
  const main = (
    <g>
      <BranchArt b={B4} light="day" seed={14} />
      <path d={`M${LEAF4.x + 300} ${branchAt(B4, LEAF4.x + 300).y}Q${LEAF4.x + 260} ${LEAF4.y + 120} ${LEAF4.x + 200} ${LEAF4.y + 10}`} stroke="#4e3a24" strokeWidth={8} fill="none" />
      <TropicalLeaf x={LEAF4.x + 220} y={LEAF4.y + 12} len={300} ang={Math.PI + 0.04} t={0} light="day" seed={41} width={0.34} />
      <Chameleon pose={P} uid="s4" />
      {!st.caught && <Cricket x={cr.x} y={cr.y} t={t} s={1.2} walk={t < 84 ? 0.6 + 0.4 * Math.sin(t * 0.7) : 0} facing={-1} />}
      {t < 80 && <Fly x={flyPath(t, {x: 400, y: 640}, 120, 5).x} y={flyPath(t, {x: 400, y: 640}, 120, 5).y} t={t} s={1.1} />}
    </g>
  );
  return {
    svg: (
      <g>
        <Forest cam={c} t={t} light="day" L={{seed: 17, span: [-1800, 3000]}} main={main} />
        {diag > 0.01 && <rect width={1080} height={1920} fill="#04100c" opacity={diag * 0.62} />}
        <Card x={60} y={360} w={960} h={1060} k={diag} title="LA LENGUA BALÍSTICA">
          <g transform="translate(-105 -330) scale(1.45)">
            <TongueDiagram x={420} y={820} k={k} t={t} />
          </g>
        </Card>
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={slow} text="◉ CÁMARA LENTA · LA CAPTURA DURA UNA FRACCIÓN DE SEGUNDO" top={260} color="#ff8a6a" />
        <Tag k={win(t, 70.4, 73.8, 0.4)} text="SE ACERCA SIN PERDERLO DE VISTA" top={330} color="#ffe2a0" />
      </>
    ),
  };
}
export const _k = {clamp};
