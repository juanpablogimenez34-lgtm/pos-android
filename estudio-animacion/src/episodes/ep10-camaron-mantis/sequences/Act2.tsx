// ACTO 2 · LA VISIÓN (secuencias 05–07, 36–63 s, fotogramas 1080–1889).
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {Dim, Grade, SubjectLight} from '../lighting/Lighting';
import {ArtisticVision, EyeDiagram} from '../science/Science';
import {anatomyScreen, Caption, SceneOut, win} from './common';
import {ReefShot} from './ReefShot';
import {mantisAt, reefCam} from './world';

/** 05 · OJOS INDEPENDIENTES (36–45 s · f 1080–1349). Primerísimo plano de la cabeza: cada ojo
 *  hace sus propias sacadas (uno vigila arriba, el otro explora); indicadores de dirección. */
export function seq05(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const e = anatomyScreen(cam, m, 'eyes');
  const k = win(t, 38.2, 44.6, 0.5);
  const arrow = (a: number, len: number, c: string) => <path d={`M0,0 L${(Math.cos(a) * len).toFixed(1)},${(Math.sin(a) * len).toFixed(1)}`} stroke={c} strokeWidth={6} strokeLinecap="round" markerEnd="url(#ep10arr)" />;
  return {
    svg: <ReefShot t={t} cam={cam} />,
    overlay: (
      <>
        <SubjectLight x={e.x} y={e.y} r={520} k={0.8} color="rgba(120,255,210,0.2)" />
        <Grade depth={0.4} vignette={0.9} />
        <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
          <svg width={1080} height={1920}>
            <defs>
              <marker id="ep10arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0,0 L10,5 L0,10Z" fill="#ffd27a" />
              </marker>
            </defs>
            <g transform={`translate(${(e.x - 90).toFixed(1)} ${(e.y - 170).toFixed(1)})`}>{arrow(-Math.PI / 2 + m.eyeF.yaw * 0.9, 80, '#bff6ff')}</g>
            <g transform={`translate(${(e.x + 90).toFixed(1)} ${(e.y - 170).toFixed(1)})`}>{arrow(-Math.PI / 2 + m.eyeN.yaw * 0.9, 80, '#ffd27a')}</g>
          </svg>
        </AbsoluteFill>
        <Caption text="Cada ojo se mueve por separado" k={win(t, 37.6, 44.6, 0.5)} top={250} />
      </>
    ),
  };
}

/** 06 · CÓMO FUNCIONAN SUS OJOS (45–54 s · f 1350–1619). Gráfico científico: tres regiones,
 *  banda media de seis filas, muchos tipos de fotorreceptores y detección de luz polarizada. */
export function seq06(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const k = win(t, 45.9, 54.2, 0.7);
  return {
    svg: <ReefShot t={t} cam={cam} />,
    overlay: (
      <>
        <Grade depth={0.45} vignette={0.85} />
        <Dim k={k} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <EyeDiagram t={t - 45} k={k} />
          </svg>
        </AbsoluteFill>
      </>
    ),
  };
}

/** 07 · EL MUNDO A TRAVÉS DE SU MIRADA (54–63 s · f 1620–1889). Interpretación ARTÍSTICA de
 *  señales y movimientos; el animal gira el cuerpo para mirar el arrecife y vuelve. */
export function seq07(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const k = win(t, 55.2, 62.4, 0.8);
  return {
    svg: <ReefShot t={t} cam={cam} />,
    overlay: (
      <>
        <Grade depth={0.4} vignette={0.8} />
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1080} height={1920}>
            <ArtisticVision t={t} k={k * 0.9} />
          </svg>
        </AbsoluteFill>
        <Caption text="No distingue mejor los colores" sub="su visión está adaptada a señales y movimiento" k={win(t, 55.4, 62.2, 0.5) * clamp(1)} top={250} size={40} />
      </>
    ),
  };
}
