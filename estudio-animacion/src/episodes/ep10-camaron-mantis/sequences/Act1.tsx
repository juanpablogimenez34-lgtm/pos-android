// ACTO 1 · EL MISTERIO (secuencias 01–04, 0–36 s, fotogramas 0–1079).
import {clamp} from '../../../engine/math';
import {Grade, ScreenRays, SubjectLight} from '../lighting/Lighting';
import {anatomyScreen, BigTitle, Callouts, Caption, SceneOut, win} from './common';
import {ReefShot} from './ReefShot';
import {mantisAt, reefCam} from './world';
import {toScreen} from '../camera/CameraSystem';
import {FONT_FAMILY} from '../../../engine/fonts';

/** 01 · DESCENSO AL ARRECIFE (0–9 s · f 0–269). Cámara que desciende desde la superficie entre
 *  rayos de luz, peces y partículas hasta el arrecife; el rótulo del episodio aparece y se va. */
export function seq01(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  return {
    svg: <ReefShot t={t} cam={cam} tone={0.22 + 0.1 * clamp(t / 9)} />,
    overlay: (
      <>
        <ScreenRays t={t} k={1 - clamp(t / 10) * 0.6} />
        <Grade depth={0.2 + 0.25 * clamp(t / 9)} vignette={0.7} dark={1 - clamp(t / 1.2)} />
        <BigTitle lines={['EPISODIO 04', 'EL CAMARÓN MANTIS']} k={win(t, 1.6, 7.9, 0.7)} top={330} />
        <Caption text="el pequeño gigante del océano" k={win(t, 2.6, 7.9, 0.6)} top={600} color="#ffe2a0" size={40} />
      </>
    ),
  };
}

/** 02 · OJOS EN LA GRIETA (9–18 s · f 270–539). Primer plano de la grieta oscura: dos ojos se
 *  asoman y se mueven por separado; un instante después se insinúa el apéndice plegado. */
export function seq02(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const eye = anatomyScreen(cam, m, 'eyes');
  return {
    svg: <ReefShot t={t} cam={cam} />,
    overlay: (
      <>
        <SubjectLight x={eye.x} y={eye.y} r={420} k={clamp((t - 9.8) / 1.5)} color="rgba(120,255,200,0.22)" />
        <Grade depth={0.45} vignette={0.95} />
      </>
    ),
  };
}

/** 03 · EL PROTAGONISTA EMERGE (18–27 s · f 540–809). Sale de la grieta caminando con las patas
 *  coordinadas; la cámara le sigue en travelling lateral. */
export function seq03(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  return {
    svg: <ReefShot t={t} cam={cam} />,
    overlay: (
      <>
        <Grade depth={0.4} vignette={0.8} />
        <Caption text="Camarón mantis pavo real" sub="Odontodactylus scyllarus" k={win(t, 19.4, 26.4, 0.6)} />
      </>
    ),
  };
}

/** 04 · UN CUERPO EXTRAORDINARIO (27–36 s · f 810–1079). Plano lateral; etiquetas anatómicas
 *  que se dibujan sobre el cuerpo y una barra de escala de 10–18 cm. */
export function seq04(t: number): SceneOut {
  const m = mantisAt(t);
  const cam = reefCam(t, m);
  const L = (key: 'eyes' | 'antennae' | 'raptor' | 'legs' | 'abdomen' | 'tail', label: string, lx: number, ly: number, a: number) => ({p: anatomyScreen(cam, m, key), label, lx, ly, k: win(t, a, 35.6, 0.5)});
  const head = toScreen(cam, m.x + 150 * m.scale, -40);
  const tail = toScreen(cam, m.x - 205 * m.scale, -40);
  const bar = win(t, 31.5, 35.6, 0.5);
  return {
    svg: <ReefShot t={t} cam={cam} />,
    overlay: (
      <>
        <Grade depth={0.4} vignette={0.75} />
        <Caption text="No es un camarón verdadero" sub="es un estomatópodo" k={win(t, 27.4, 31.2, 0.5)} top={240} />
        <Callouts
          items={[
            L('eyes', 'ojos con pedúnculo', 760, 470, 29.2),
            L('antennae', 'antenas', 860 - 10, 650, 29.8),
            L('abdomen', 'segmentos abdominales', 300, 560, 30.4),
            L('raptor', 'apéndices raptores', 800, 1160, 31.0),
            L('legs', 'patas marchadoras', 470, 1240, 31.6),
            L('tail', 'abanico caudal', 250, 1100, 32.2),
          ]}
        />
        {bar > 0.01 && (
          <div style={{position: 'absolute', left: Math.min(tail.x, head.x), width: Math.abs(head.x - tail.x), top: head.y - 330, opacity: bar, fontFamily: FONT_FAMILY, textAlign: 'center'}}>
            <div style={{height: 6, background: '#bff6ff', borderRadius: 3}} />
            <div style={{color: '#bff6ff', fontWeight: 800, fontSize: 30, marginTop: 8}}>10 – 18 cm</div>
          </div>
        )}
      </>
    ),
  };
}
