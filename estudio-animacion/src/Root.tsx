import React from 'react';
import {Composition} from 'remotion';
import {StatesShowcase} from './creatures/octopus/StatesShowcase';
import {FlightShowcase} from './creatures/falcon/FlightShowcase';
import {DEMO_META} from './episodes/ep01-pulpo/demo.config';
import {Ep01Demo, Ep01DemoProps} from './episodes/ep01-pulpo/Ep01Demo';
import {EP01_DEFAULT_AUDIO, Ep01Full, Ep01FullProps} from './episodes/ep01-pulpo/full/Ep01Full';
import {DURATION, FPS} from './episodes/ep01-pulpo/full/timeline';
import {EP02_DEFAULT_AUDIO, Ep02Full, Ep02FullProps} from './episodes/ep02-pez-abisal/Ep02Full';
import {DURATION as EP02_DURATION, FPS as EP02_FPS} from './episodes/ep02-pez-abisal/timeline';
import {Ep03Full, Ep03FullProps} from './episodes/ep03-tardigrado/Ep03Full';
import {EP03_DEFAULT_AUDIO} from './episodes/ep03-tardigrado/sound';
import {DURATION as EP03_DURATION, FPS as EP03_FPS} from './episodes/ep03-tardigrado/timeline';
import {Ep04Full, Ep04FullProps} from './episodes/ep04-halcon-peregrino/Ep04Full';
import {EP04_DEFAULT_AUDIO} from './episodes/ep04-halcon-peregrino/sound';
import {DURATION as EP04_DURATION, FPS as EP04_FPS} from './episodes/ep04-halcon-peregrino/timeline';
import {Ep05Characters, Ep05Creatures} from './episodes/ep05-planta-carnivora/characters/Showcase';
import {Ep05Full, Ep05FullProps} from './episodes/ep05-planta-carnivora/Ep05Full';
import {EP05_DEFAULT_AUDIO} from './episodes/ep05-planta-carnivora/sound';
import {DURATION as EP05_DURATION, FPS as EP05_FPS} from './episodes/ep05-planta-carnivora/timeline';
import {Ep06Characters} from './episodes/ep06-ajolote/Characters/Showcase';
import {Ep06Full, Ep06FullProps} from './episodes/ep06-ajolote/Ep06Full';
import {EP06_DEFAULT_AUDIO} from './episodes/ep06-ajolote/Audio/sound';
import {DURATION as EP06_DURATION, FPS as EP06_FPS} from './episodes/ep06-ajolote/Timeline/timeline';
import {Ep07Full, Ep07FullProps} from './episodes/ep07-hongo-hormigas/Ep07Full';
import {EP07_DEFAULT_AUDIO} from './episodes/ep07-hongo-hormigas/Audio/sound';
import {DURATION as EP07_DURATION, FPS as EP07_FPS} from './episodes/ep07-hongo-hormigas/Timeline/timeline';
import {Ep07Characters} from './episodes/ep07-hongo-hormigas/Characters/Showcase';
import {CoheteFichas} from './music-videos/cohete-de-nuez/Characters/Fichas';
import {CoheteVideo} from './music-videos/cohete-de-nuez/CoheteVideo';
import {CoheteFichasV2} from './music-videos/cohete-de-nuez/v2/Characters/Fichas2';
import {SONG_FRAMES} from './music-videos/cohete-de-nuez/MusicSync/songMap';

const demoDefaults: Ep01DemoProps = {quality: 'final', showSubtitles: true, audio: {}};
const fullDefaults: Ep01FullProps = {quality: 'final', showSubtitles: true, audio: EP01_DEFAULT_AUDIO};
const ep02Defaults: Ep02FullProps = {quality: 'final', showSubtitles: true, audio: EP02_DEFAULT_AUDIO};
const ep03Defaults: Ep03FullProps = {quality: 'final', showSubtitles: true, audio: EP03_DEFAULT_AUDIO};
const ep04Defaults: Ep04FullProps = {quality: 'final', showSubtitles: true, audio: EP04_DEFAULT_AUDIO};
const ep05Defaults: Ep05FullProps = {quality: 'final', showSubtitles: true, audio: EP05_DEFAULT_AUDIO};
const ep06Defaults: Ep06FullProps = {quality: 'final', showSubtitles: true, audio: EP06_DEFAULT_AUDIO};
const ep07Defaults: Ep07FullProps = {quality: 'final', showSubtitles: true, audio: EP07_DEFAULT_AUDIO};

export const RemotionRoot: React.FC = () => (
  <>
    {/* Episodio 01 completo: 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep01Full"
      component={Ep01Full}
      durationInFrames={DURATION * FPS}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={fullDefaults}
    />
    {/* Episodio 02 completo: rape abisal, 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep02Full"
      component={Ep02Full}
      durationInFrames={EP02_DURATION * EP02_FPS}
      fps={EP02_FPS}
      width={1080}
      height={1920}
      defaultProps={ep02Defaults}
    />
    {/* Episodio 03 completo: tardígrados, 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep03Full"
      component={Ep03Full}
      durationInFrames={EP03_DURATION * EP03_FPS}
      fps={EP03_FPS}
      width={1080}
      height={1920}
      defaultProps={ep03Defaults}
    />
    {/* Episodio 04 completo: halcón peregrino, 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep04Full"
      component={Ep04Full}
      durationInFrames={EP04_DURATION * EP04_FPS}
      fps={EP04_FPS}
      width={1080}
      height={1920}
      defaultProps={ep04Defaults}
    />
    {/* Episodio 05 completo: venus atrapamoscas, 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep05Full"
      component={Ep05Full}
      durationInFrames={EP05_DURATION * EP05_FPS}
      fps={EP05_FPS}
      width={1080}
      height={1920}
      defaultProps={ep05Defaults}
    />
    {/* Ep. 05: hoja de control de personajes (planta, mosca, araña) */}
    <Composition id="Ep05Characters" component={Ep05Characters} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="Ep05Creatures" component={Ep05Creatures} durationInFrames={300} fps={30} width={1080} height={1920} />
    {/* Episodio 06 completo: ajolote, 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep06Full"
      component={Ep06Full}
      durationInFrames={EP06_DURATION * EP06_FPS}
      fps={EP06_FPS}
      width={1080}
      height={1920}
      defaultProps={ep06Defaults}
    />
    {/* Episodio 07 completo: hongo y hormigas, 180 s × 30 fps = 5.400 fotogramas */}
    <Composition
      id="Ep07Full"
      component={Ep07Full}
      durationInFrames={EP07_DURATION * EP07_FPS}
      fps={EP07_FPS}
      width={1080}
      height={1920}
      defaultProps={ep07Defaults}
    />
    <Composition id="Ep07Characters" component={Ep07Characters} durationInFrames={300} fps={30} width={1080} height={1920} />
    {/* Videoclip 01 "Nuestro cohete de nuez": fichas de personajes y del cohete */}
    {/* Videoclip 01 completo: la duración sale del MP3 real (4.278 fotogramas a 30 fps) */}
    <Composition id="CoheteVideo" component={CoheteVideo} durationInFrames={SONG_FRAMES} fps={30} width={1080} height={1920} defaultProps={{withAudio: true}} />
    <Composition id="CoheteFichas" component={CoheteFichas} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="CoheteFichasV2" component={CoheteFichasV2} durationInFrames={300} fps={30} width={1080} height={1920} />
    {/* Ep. 06: fichas de personaje (ajolote rosado, silvestre, Daphnia, etapas de regeneración) */}
    <Composition id="Ep06Characters" component={Ep06Characters} durationInFrames={300} fps={30} width={1080} height={1920} />
    {/* Demo aprobada de 15 s (se conserva intacta) */}
    <Composition
      id="Ep01Demo"
      component={Ep01Demo}
      durationInFrames={DEMO_META.durationSec * DEMO_META.fps}
      fps={DEMO_META.fps}
      width={DEMO_META.width}
      height={DEMO_META.height}
      defaultProps={demoDefaults}
    />
    <Composition
      id="OctopusStates"
      component={StatesShowcase}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{quality: 'final' as const}}
    />
    <Composition id="FalconStates" component={FlightShowcase} durationInFrames={180} fps={30} width={1080} height={1920} />
  </>
);
