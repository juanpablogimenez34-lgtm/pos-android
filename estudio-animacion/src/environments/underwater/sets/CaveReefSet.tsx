// Escenario reutilizable "arrecife con cueva". Toda la serie submarina puede
// reutilizarlo: las capas son componentes y la disposición es DATOS.
import React from 'react';
import {ParallaxLayer} from '../../../engine/camera';
import {profileAt} from '../../../engine/math';
import {useQuality} from '../../../engine/quality';
import {Caustics, Particles} from '../CanvasFX';
import {Anemone, BranchCoral, FanCoral, Kelp, TubeSponges, Urchin} from '../Flora';
import {UW} from '../palette';
import {CaveFormation, CaveShadow, Rock, RockShelf} from '../Rocks';
import {FishSchool, LightRays, ReefRidge, SandFloor, WaterBackground} from '../Water';
import {AbsoluteFill, useVideoConfig} from 'remotion';

export const CAVE_REEF = {
  anchor: {x: 900, y: 1000},
  sunX: 1150,
  /** Perfil del sustrato del plano principal (mundo, profundidad 1). */
  ground: [
    [-600, 1330],
    [200, 1320],
    [500, 1302],
    [700, 1290],
    [850, 1284],
    [980, 1266],
    [1100, 1272],
    [1250, 1240],
    [1400, 1252],
    [1550, 1226],
    [1700, 1242],
    [1850, 1234],
    [2000, 1262],
    [2300, 1296],
    [2900, 1320],
  ] as [number, number][],
  caveMouth: {x: 820, y: 1160, rx: 178, ry: 150},
};

export const groundY = (x: number) => profileAt(CAVE_REEF.ground, x);

/** Planos lejanos y medios (detrás de todo). */
const Distant: React.FC = () => (
  <>
    <ParallaxLayer depth={0.06}>
      <WaterBackground sunX={CAVE_REEF.sunX} />
    </ParallaxLayer>
    <ParallaxLayer depth={0.22}>
      <ReefRidge y={1090} amp={110} seed={4} fogAmt={0.86} />
      <FishSchool x={300} y={640} fogAmt={0.8} speed={22} seed={3} />
    </ParallaxLayer>
    <ParallaxLayer depth={0.3}>
      <LightRays originX={CAVE_REEF.sunX} count={9} seed={5} />
    </ParallaxLayer>
    <ParallaxLayer depth={0.4}>
      <ReefRidge y={1135} amp={80} seed={12} fogAmt={0.68} />
      <Kelp id="k-far1" x={140} y={1150} height={520} width={10} seed={21} strands={5} fogAmt={0.65} />
      <Kelp id="k-far2" x={1720} y={1150} height={600} width={10} seed={22} strands={6} fogAmt={0.65} />
      <FishSchool x={900} y={820} fogAmt={0.62} speed={-18} seed={8} scale={0.8} />
    </ParallaxLayer>
    <ParallaxLayer depth={0.58}>
      <SandFloor y={1160} x0={-1500} x1={3600} fogAmt={0.45} />
      <Rock id="r-m1" x={-80} y={1190} w={380} h={220} seed={101} fogAmt={0.48} />
      <Rock id="r-m2" x={420} y={1185} w={260} h={150} seed={102} fogAmt={0.5} />
      <Rock id="r-m3" x={1380} y={1195} w={420} h={260} seed={103} fogAmt={0.46} flip />
      <Rock id="r-m4" x={1900} y={1190} w={300} h={170} seed={104} fogAmt={0.48} />
      <BranchCoral x={520} y={1130} height={170} seed={7} color={UW.coralViolet} fogAmt={0.5} />
      <FanCoral x={1230} y={1150} w={180} h={200} seed={8} color={UW.coralRed} fogAmt={0.5} />
      <Kelp id="k-mid1" x={250} y={1185} height={460} width={13} seed={31} strands={4} fogAmt={0.42} />
      <Kelp id="k-mid2" x={1050} y={1180} height={540} width={13} seed={32} strands={5} fogAmt={0.42} />
      <Kelp id="k-mid3" x={2150} y={1185} height={500} width={13} seed={33} strands={4} fogAmt={0.42} />
      <TubeSponges x={1620} y={1170} scale={0.8} seed={9} fogAmt={0.5} />
    </ParallaxLayer>
  </>
);

/** Plano principal, por detrás del protagonista. */
const MainBack: React.FC = () => (
  <ParallaxLayer depth={1}>
    <Rock id="r-p0" x={140} y={1340} w={520} h={420} seed={201} fogAmt={0.15} />
    <Kelp id="k-p1" x={1470} y={1250} height={620} width={17} seed={41} strands={4} />
    <Kelp id="k-p2" x={1960} y={1262} height={560} width={16} seed={42} strands={3} colorB="#9bb24a" />
    <CaveFormation id="cave" mouth={CAVE_REEF.caveMouth} />
    <BranchCoral x={1290} y={1252} height={220} seed={13} color={UW.coralOrange} />
    <FanCoral x={2060} y={1268} w={230} h={260} seed={14} color={UW.coralViolet} />
    <RockShelf id="shelf" profile={CAVE_REEF.ground} bottom={2600} />
    <TubeSponges x={2180} y={1290} seed={15} />
    <Anemone x={1090} y={1278} size={58} seed={3} />
    <Anemone x={1880} y={1240} size={46} seed={5} color="#3fc7b0" tip="#d8fff4" />
    <Urchin x={1580} y={1330} r={18} seed={6} />
  </ParallaxLayer>
);

/** Plano principal, por delante del protagonista (labio de la cueva, sombra interior). */
export const CaveReefFront: React.FC = () => (
  <>
    <CaveShadow id="cave" mouth={CAVE_REEF.caveMouth} />
    <Rock id="r-lip" x={730} y={1318} w={280} h={96} seed={301} />
    <Rock id="r-lip2" x={560} y={1330} w={220} h={120} seed={302} />
  </>
);

const BANK: [number, number][] = [
  [-900, 1500], [-300, 1480], [200, 1492], [600, 1462], [1000, 1484], [1400, 1456], [1800, 1478], [2200, 1452], [2600, 1480], [3300, 1470],
];

/** Banco de arrecife entre el protagonista y la cámara: vida en el tercio inferior. */
const FrontBank: React.FC = () => (
  <ParallaxLayer depth={1.15}>
    <RockShelf id="bank" profile={BANK} bottom={2900} seed={19} />
    <BranchCoral x={420} y={1478} height={190} seed={61} color={UW.coralRed} />
    <Anemone x={700} y={1470} size={64} seed={8} />
    <TubeSponges x={980} y={1486} scale={0.9} seed={62} />
    <FanCoral x={1250} y={1470} w={200} h={230} seed={63} color={UW.coralPink} />
    <Urchin x={1700} y={1470} r={20} seed={64} />
    <BranchCoral x={1470} y={1470} height={200} seed={65} color={UW.coralViolet} flip />
    <Anemone x={1880} y={1476} size={54} seed={9} color="#3fc7b0" tip="#d8fff4" />
    <Kelp id="k-b1" x={2080} y={1462} height={380} width={14} seed={66} strands={3} />
    <TubeSponges x={2300} y={1458} scale={1.1} seed={67} />
    <BranchCoral x={2560} y={1478} height={200} seed={68} color={UW.coralOrange} />
    <Urchin x={150} y={1490} r={22} seed={69} />
    <Kelp id="k-b2" x={-60} y={1495} height={420} width={14} seed={70} strands={4} />
  </ParallaxLayer>
);

/** Primer plano (encuadre oscuro con parallax fuerte, desenfocado en calidad final). */
const Foreground: React.FC = () => (
  <ParallaxLayer depth={1.45}>
    <Rock id="r-f1" x={300} y={2060} w={760} h={560} seed={401} darken={0.55} details={false} />
    <Rock id="r-f2" x={1500} y={2120} w={620} h={420} seed={402} darken={0.55} details={false} flip />
    <Rock id="r-f3" x={2500} y={2080} w={820} h={600} seed={403} darken={0.55} details={false} />
    <Kelp id="k-f1" x={-60} y={2000} height={1150} width={30} seed={51} strands={3} colorA="#06231f" colorB="#1d4d2a" />
    <Kelp id="k-f2" x={2330} y={2050} height={1100} width={30} seed={52} strands={3} colorA="#06231f" colorB="#1d4d2a" />
    <Kelp id="k-f3" x={3000} y={2050} height={1200} width={30} seed={53} strands={3} colorA="#06231f" colorB="#1d4d2a" />
  </ParallaxLayer>
);

/**
 * Pila completa de capas del escenario, con un hueco (`hero`) para el protagonista.
 * Orden: lejanos → plano principal → cáusticas → héroe + frontales → partículas → primer plano.
 */
export const CaveReefStage: React.FC<{hero: React.ReactNode; heroOverlay?: React.ReactNode}> = ({hero, heroOverlay}) => {
  const {width, height} = useVideoConfig();
  const q = useQuality();
  const vb = `0 0 ${width} ${height}`;
  return (
    <>
      <AbsoluteFill>
        <svg width={width} height={height} viewBox={vb}>
          <Distant />
          <MainBack />
        </svg>
      </AbsoluteFill>
      <Caustics profile={CAVE_REEF.ground} />
      <AbsoluteFill>
        <svg width={width} height={height} viewBox={vb}>
          <ParallaxLayer depth={1}>
            {hero}
            <CaveReefFront />
            {heroOverlay}
          </ParallaxLayer>
          <FrontBank />
        </svg>
      </AbsoluteFill>
      <Particles lightX={CAVE_REEF.sunX} />
      <AbsoluteFill style={q.foregroundBlur ? {filter: `blur(${q.foregroundBlur}px)`} : undefined}>
        <svg width={width} height={height} viewBox={vb}>
          <Foreground />
        </svg>
      </AbsoluteFill>
    </>
  );
};

