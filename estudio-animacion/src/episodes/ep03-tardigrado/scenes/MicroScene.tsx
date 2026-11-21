import React from 'react';
import {useVideoConfig} from 'remotion';
import {cameraAt, CameraProvider, ParallaxLayer, worldToScreen} from '../../../engine/camera';
import {clamp, hash1} from '../../../engine/math';
import {Callout} from '../../../engine/Overlays';
import {useTime} from '../../../engine/useTime';
import {Tardigrade, tardiPose} from '../../../creatures/tardigrade/Tardigrade';
import {Droplet, MicroMoss, stemTop} from '../../../environments/moss/Moss';
import {MICRO_ANCHOR, MICRO_CAM} from '../cameras';
import {dryness, fallingDrop, passingDrop, splash, tardiParams} from '../timeline';

/** Entornos B, C y G: el tallo de musgo al microscopio, el tardígrado y el agua. */
export const MicroScene: React.FC = () => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const shakeK = splash(t) >= 0 ? (1 - splash(t)) * 8 : 0;
  const camK = cameraAt(MICRO_CAM, t);
  const camera = {...camK, x: camK.x + Math.sin(t * 60) * shakeK, y: camK.y + Math.cos(t * 50) * shakeK};
  const ctx = {camera, viewport: {width, height}, anchor: MICRO_ANCHOR};
  const dry = dryness(t);
  const tp = tardiParams(t);
  const pose = tardiPose(tp);
  const fd = fallingDrop(t);
  const sp = splash(t);
  const pd = passingDrop(t);
  // silueta a contraluz al principio (15–20 s): el animal se ve oscuro tras una gota
  const silhouette = clamp(1 - (t - 17.5) / 3);
  const toScreen = (v: {x: number; y: number}) => worldToScreen(ctx, 1, pose.toWorld(v));
  return (
    <CameraProvider {...ctx}>
      <MicroMoss
        dry={dry}
        foreground={
          <>
            {pd.active && <Droplet id="pass" x={pd.x} y={pd.y} r={pd.r} wobble={Math.sin(t * 3)} opacity={0.9} />}
          </>
        }
      >
        <g style={{filter: silhouette > 0.02 ? `brightness(${(1 - 0.85 * silhouette).toFixed(3)})` : undefined}}>
          <Tardigrade id="tg" pose={pose} dryness={dry} />
        </g>
        {fd.active && <Droplet id="fall" x={fd.x} y={fd.y} r={fd.r} />}
        {sp >= 0 && (
          <g opacity={1 - sp}>
            <ellipse cx={6} cy={stemTop(6) - 10} rx={60 + sp * 360} ry={14 + sp * 40} fill="none" stroke="#e8fbff" strokeWidth={6 * (1 - sp) + 1} />
            <ellipse cx={6} cy={stemTop(6) - 30} rx={180 * Math.min(1, sp * 3)} ry={50} fill="#bfe8ff" opacity={0.25} />
            {Array.from({length: 12}, (_, i) => {
              const a = -Math.PI * (0.1 + 0.8 * hash1(i));
              const v = 260 + hash1(i + 3) * 340;
              return <circle key={i} cx={6 + Math.cos(a) * v * sp} cy={stemTop(6) - 40 + Math.sin(a) * v * sp + 600 * sp * sp} r={6 + hash1(i + 7) * 10} fill="#dff6ff" opacity={0.8} />;
            })}
          </g>
        )}
        {/* película de agua que cubre al animal al rehidratarse */}
        {t > SPLASH_T && t < 164 && (
          <ellipse cx={pose.centerWorld.x} cy={pose.centerWorld.y + 10} rx={260} ry={120} fill="#bfe8ff" opacity={0.18 * clamp(1 - (t - 158) / 6)} />
        )}
      </MicroMoss>
      {/* rótulos anatómicos */}
      {t > 27 && t < 34 && (() => {
        const leg = pose.legs.find((l) => !l.far && l.pair === 1)!;
        const claw = pose.legs.find((l) => !l.far && l.pair === 3)!;
        const a = toScreen(leg.knee);
        const b = toScreen(claw.foot);
        return (
          <>
            <Callout x={a.x} y={a.y} side="right" dy={-260} text="8 patas · 4 pares" sub="el último par apunta hacia atrás" appear={smoothIn(t, 27.6, 28.4) * smoothOut(t, 33.2, 33.8)} width={330} color="#c9f27a" />
            <Callout x={b.x} y={b.y} side="left" dy={-200} text="Garras" sub="para sujetarse al musgo" appear={smoothIn(t, 29, 29.8) * smoothOut(t, 33.2, 33.8)} width={300} color="#c9f27a" />
          </>
        );
      })()}
      {t > 21.5 && t < 26.5 && (() => {
        const h = worldToScreen(ctx, 1, pose.centerWorld);
        return <Callout x={h.x} y={h.y - 120} side="right" dy={-200} text="Tardígrado" sub="la mayoría mide menos de 1 mm" appear={smoothIn(t, 21.8, 22.6) * smoothOut(t, 25.8, 26.4)} width={340} color="#c9f27a" />;
      })()}
    </CameraProvider>
  );
};

const SPLASH_T = 152.4;
const smoothIn = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smoothOut = (t: number, a: number, b: number) => 1 - clamp((t - a) / (b - a));
void ParallaxLayer;
