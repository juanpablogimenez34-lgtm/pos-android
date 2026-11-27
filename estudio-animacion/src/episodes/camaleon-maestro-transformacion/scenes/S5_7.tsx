// ESCENA 5 (95–121)  EL SECRETO DE SUS COLORES: secuencia de patrones naturales de la especie (verde, turquesa,
//                    azul, amarillo, barras rojas) que avanzan por regiones; zoom a la piel: capas, xantóforos e
//                    iridóforos cuya red de nanocristales se expande (azul → amarillo/naranja/rojo); vuelta al animal.
// ESCENA 6 (121–150) EL ARTE DE SOBREVIVIR: marcha con vaivén; primer plano de los dedos en pinza sobre la corteza;
//                    la cola se enrolla en una rama; aparece un ave; el camaleón se desliza al lado oculto de la rama,
//                    se oscurece y queda inmóvil; el ave sigue su camino; vuelve a asomarse.
// ESCENA 7 (150–180) EL MAESTRO DE LA TRANSFORMACIÓN: atardecer; los ojos exploran; la cola se desenrolla; camina a
//                    otra rama; última transformación cromática; captura espectacular; primer plano del ojo; cierre.
import {clamp, lerp, mixColor, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {cam, Cam, SceneOut, shot} from '../../../studio2';
import {Chameleon, chamToWorld, CHAM_ANCHORS} from '../character/Chameleon';
import {Branch, lookAt, makeWalk, poseOn, restFeet, scanEye, strike} from '../character/motion';
import {colorTrack} from '../character/skin';
import {BigTitle, Brand, Forest, seg, Tag, Wash, win} from '../components/common';
import {Bird, Fly, flyPath} from '../environment/Critters';
import {BranchArt} from '../environment/Forest';
import {Card, reflectColor, SkinDiagram} from './Science';

const breatheCam = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 5 * k, y: c.y + Math.sin(t * 0.29 + 1) * 4 * k, roll: c.roll + Math.sin(t * 0.21) * 0.003 * k});

// ---------------------------------------------------------------- ESCENA 5
const B5: Branch = {pts: [{x: -800, y: 1290}, {x: 300, y: 1220}, {x: 1200, y: 1170}, {x: 2000, y: 1140}], r: 26};
const X5 = 80;
const S5 = 1.35;
export function scene5(t: number): SceneOut {
  const color = colorTrack([[0, 'rest'], [96.4, 'turquoise', 1.8], [98.6, 'blue', 2], [100.8, 'display', 2], [103.0, 'excited', 2], [113.0, 'excited', 0.1]], t);
  const P = poseOn(B5, X5, restFeet(B5, X5, S5, 1), {scale: S5, facing: 1, t, color, tail: {curl: 0.95, base: 0.8}});
  P.eyeN = scanEye(t, 41);
  P.eyeF = scanEye(t + 2, 43);
  const flank = chamToWorld(P, {x: 110, y: -30});
  const zoomIn = smoothstep(102.4, 104.4, t);
  const micro = win(t, 104.0, 116.2, 0.5);
  const c0 = shot(t, 95, 102, cam(X5 + 300, 1000, 1.2), cam(X5 + 260, 990, 1.4));
  const c = breatheCam(t < 104.5 ? shot(t, 102.2, 104.5, c0, cam(flank.x, flank.y, 6.5), 'in') : shot(t, 115.6, 118, cam(flank.x, flank.y, 6.5), cam(X5 + 290, 990, 1.25)), t, 0.3);
  // separación de la red: relajado (azul) → excitado (rojo) sincronizado con la locución
  const spacing = t < 108.6 ? 0.08 : t < 113.6 ? lerp(0.08, 0.95, smoothstep(108.8, 112.8, t)) : 0.95;
  const main = (
    <g>
      <BranchArt b={B5} light="golden" seed={15} />
      <Chameleon pose={P} uid="s5" />
    </g>
  );
  return {
    svg: (
      <g>
        <Forest cam={c} t={t} light="golden" L={{seed: 19, span: [-1600, 2800]}} main={main} />
        {micro > 0.01 && (
          <g opacity={micro}>
            <rect width={1080} height={1920} fill="#04120e" />
            <defs>
              <radialGradient id="cellglow" cx="0.5" cy="0.5" r="0.6">
                <stop offset="0" stopColor={reflectColor(spacing)} stopOpacity={0.25} />
                <stop offset="1" stopColor="#04120e" stopOpacity={0} />
              </radialGradient>
            </defs>
            <rect width={1080} height={1920} fill="url(#cellglow)" />
            <Card x={50} y={300} w={980} h={1260} k={1} title="DENTRO DE LA PIEL">
              <SkinDiagram x={100} y={620} w={880} spacing={spacing} t={t} zoom={1} />
            </Card>
            {/* muestra de piel real del animal con el color que produce la red */}
            <g transform="translate(540 470)">
              <rect x={-170} y={-50} width={340} height={70} rx={20} fill={mixColor(reflectColor(spacing), '#f2d040', spacing < 0.4 ? 0.35 : 0.1)} stroke="#fff" strokeWidth={2} />
              <text y={-6} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={26} fill="#06140f">color visible de la piel</text>
            </g>
          </g>
        )}
        {zoomIn > 0.6 && micro < 0.05 && t < 105 && <rect width={1080} height={1920} fill="#ffffff" opacity={(zoomIn - 0.6) * 1.2} />}
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 95.4, 102, 0.4)} text="PATRONES NATURALES DE LA ESPECIE" top={330} color="#ffe2a0" />
        <Tag k={win(t, 116.4, 120.8, 0.5)} text="COMUNICACIÓN · TEMPERATURA · ESTADO FISIOLÓGICO" top={330} color="#c8f0d8" />
        <Tag k={win(t, 104.6, 115.8, 0.5)} text="Basado en Teyssier et al., Nature Communications (2015)" top={1720} color="#9fc8b8" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 6
const B6: Branch = {pts: [{x: -900, y: 1250}, {x: 200, y: 1200}, {x: 1100, y: 1170}, {x: 2400, y: 1150}], r: 30};
const TWIG6: Branch = {pts: [{x: -900, y: 1420}, {x: -100, y: 1390}, {x: 500, y: 1400}], r: 9};
const S6 = 1.15;
export function scene6(t: number): SceneOut {
  const walk = makeWalk(B6, S6, 1, -380, 121, 151, (tt) => 34 * smoothstep(121.2, 122, tt) * (1 - smoothstep(133.5, 134.5, tt)));
  const w = walk.at(t);
  const hide = smoothstep(138.2, 140.6, t) * (1 - smoothstep(145.4, 147.6, t));
  const color = colorTrack([[0, 'excited'], [121.5, 'rest', 3], [138.4, 'dark', 2], [145.6, 'rest', 3]], t);
  const P = poseOn(B6, w.x, w.feet, {scale: S6, facing: 1, t, color, rock: Math.sin(w.phase * Math.PI * 4) * 7 * smoothstep(0, 10, w.speed), tail: {curl: lerp(0.8, 1.25, smoothstep(127, 130.5, t)), base: lerp(0.6, 1.05, smoothstep(127, 130.5, t))}});
  // al esconderse: baja tras la rama, se aplana y se oscurece; la rama queda delante
  P.y += hide * 96 * S6;
  P.flat = hide;
  P.shade = hide * 0.5;
  P.headPitch = -hide * 0.1;
  const eyeW = chamToWorld(P, CHAM_ANCHORS.EYE_C);
  const birdX = lerp(1500, -600, seg(t, 135.6, 144.6));
  const birdY = 640 + Math.sin(t * 1.4) * 40;
  P.eyeN = t > 135.8 && t < 145 ? lookAt(eyeW, {x: birdX, y: birdY}, 1, P.angle) : scanEye(t, 51);
  P.eyeF = scanEye(t + 1.7, 53);
  const foot = w.feet.FN.p;
  const grip = win(t, 122.6, 126.6, 0.6);
  const cBase = cam(w.x + 290, 1010, 1.22);
  const c = breatheCam(grip > 0.001 ? shot(grip, 0, 1, cBase, cam(foot.x, foot.y - 20, 3.4)) : t > 127 && t < 132 ? shot(win(t, 127, 132, 0.8), 0, 1, cBase, cam(w.x - 60, 1250, 1.5)) : cBase, t, 0.4);
  const main = (
    <g>
      <BranchArt b={TWIG6} light="day" seed={21} twigs={false} flowers={false} />
      {hide < 0.5 && <BranchArt b={B6} light="day" seed={22} />}
      <Chameleon pose={P} uid="s6" />
      {hide >= 0.5 && <BranchArt b={B6} light="day" seed={22} />}
    </g>
  );
  return {
    svg: (
      <g>
        <Forest cam={c} t={t} light="day" L={{seed: 23, span: [-1800, 3000]}} main={main} />
        {/* el ave cruza entre los árboles (plano medio, por delante del fondo) */}
        {t > 135.4 && t < 145 && <Bird x={(birdX - c.x) * c.zoom * 0.85 + 540} y={(birdY - c.y) * c.zoom * 0.85 + 960} t={t} s={1.3} facing={-1} />}
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={grip} text="DEDOS EN PINZA: DOS GRUPOS OPUESTOS" top={330} color="#ffe2a0" />
        <Tag k={win(t, 127.2, 131.6, 0.5)} text="COLA PRENSIL ENROLLADA" top={330} color="#c8f0d8" />
        <Tag k={win(t, 138.4, 145, 0.5)} text="SE OCULTA TRAS LA RAMA Y SE QUEDA INMÓVIL" top={330} color="#ff8a6a" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- ESCENA 7
const B7: Branch = {pts: [{x: -900, y: 1260}, {x: 200, y: 1200}, {x: 900, y: 1150}, {x: 1500, y: 1110}, {x: 2600, y: 1090}], r: 28};
const S7 = 1.25;
const ST7 = 163.4;
const FLY7 = {x: 1030, y: 830};
export function scene7(t: number): SceneOut {
  const walk = makeWalk(B7, S7, 1, -300, 150, 181, (tt) => 30 * smoothstep(155.6, 156.4, tt) * (1 - smoothstep(161.6, 162.6, tt)));
  const w = walk.at(t);
  const st = strike(t, ST7, 3);
  const color = colorTrack([[0, 'rest'], [151, 'turquoise', 2], [157.8, 'display', 2.4], [160.6, 'excited', 2.4]], t);
  const P = poseOn(B7, w.x, w.feet, {scale: S7, facing: 1, t, color, rock: Math.sin(w.phase * Math.PI * 4) * 6 * smoothstep(0, 10, w.speed), tail: {curl: lerp(1.2, 0.5, smoothstep(152, 156, t)), base: lerp(1.0, 0.55, smoothstep(152, 156, t))}});
  P.rim = '#ffb468';
  P.rimK = 0.8;
  const eyeW = chamToWorld(P, CHAM_ANCHORS.EYE_C);
  const fp = t < st.tHit ? {x: lerp(flyPath(t, {x: 1300, y: 760}, 120, 9).x, FLY7.x, smoothstep(161, 165, t)), y: lerp(flyPath(t, {x: 1300, y: 760}, 120, 9).y, FLY7.y, smoothstep(161, 165, t))} : FLY7;
  P.eyeN = t < 160 ? scanEye(t, 61) : lookAt(eyeW, fp, 1, P.angle);
  P.eyeF = t < 162 ? scanEye(t + 3, 63) : {yaw: 0.9, pitch: -0.1};
  P.headPitch = -0.06 * st.lean;
  P.x += st.lean * 10;
  P.jaw = st.jaw;
  if (st.ext > 0) P.tongue = {ext: st.ext, target: FLY7, bulge: st.bulge, prey: st.caught ? <Fly x={0} y={0} t={t} s={1.3} still /> : undefined};
  const close = smoothstep(168.6, 172, t);
  const cWide = cam(w.x + 300, 1000, 1.22);
  const c0 = t < 158 ? shot(t, 150, 158, cam(w.x + 300, 960, 1.0), cWide) : shot(t, 162, 165, cWide, cam(w.x + 480, 980, 1.3));
  const c = breatheCam(close > 0 ? shot(close, 0, 1, c0, cam(eyeW.x + 5, eyeW.y + 5, 4.6)) : c0, t, 0.4);
  const end = smoothstep(173.6, 175.4, t);
  const main = (
    <g>
      <BranchArt b={B7} light="sunset" seed={25} />
      <Chameleon pose={P} uid="s7" />
      {t < st.tHit && <Fly x={fp.x} y={fp.y} t={t} s={1.3} ang={Math.sin(t * 3) * 0.3} />}
    </g>
  );
  return {
    svg: <Forest cam={c} t={t} light="sunset" L={{seed: 29, span: [-1800, 3200]}} main={main} />,
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 165.0, 167.6, 0.3)} text="◉ CÁMARA LENTA" top={260} color="#ff8a6a" />
        <Wash k={end * 0.55} color="#000" />
        <BigTitle k={end} lines={['EL MAESTRO DE LA', 'TRANSFORMACIÓN']} top={560} size={100} color="#ffd23f" />
        <Tag k={smoothstep(175.4, 176.6, t)} text="MUNDO INSÓLITO" top={860} color="#e8fff4" />
        <Wash k={smoothstep(179.3, 180, t)} color="#000" />
      </>
    ),
  };
}
export const _k = {clamp};
