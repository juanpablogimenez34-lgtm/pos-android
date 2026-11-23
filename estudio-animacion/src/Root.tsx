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
import {CoheteVideoV2} from './music-videos/cohete-de-nuez/v2/CoheteVideoV2';
import {LobitoFichas} from './music-videos/baile-del-lobito/Characters/Fichas';
import {Ep08Full, Ep08FullProps} from './episodes/ep08-medusa-inmortal/Ep08Full';
import {EP08_DEFAULT_AUDIO} from './episodes/ep08-medusa-inmortal/Audio/sound';
import {LeopardSheet} from './episodes/ep09-leopardo/characters/LeopardSheet';
import {MantisSheet} from './episodes/ep10-camaron-mantis/characters/MantisSheet';
import {EP04MantisProps, EP04MantisShrimp} from './episodes/ep10-camaron-mantis/EP04MantisShrimp';
import {EP04_MANTIS_AUDIO} from './episodes/ep10-camaron-mantis/audio/SoundDesign';
import {DragonSheet} from './episodes/ep11-dragon-azul/character/DragonSheet';
import {EP05DragonAzul, EP05DragonProps} from './episodes/ep11-dragon-azul/EP05DragonAzul';
import {EP05_DRAGON_AUDIO} from './episodes/ep11-dragon-azul/audio/SoundDesign';
import {EP05DragonAzulV2, EP05V2Props} from './episodes/ep12-dragon-azul-v2/EP05DragonAzulV2';
import {EP05V2_AUDIO} from './episodes/ep12-dragon-azul-v2/audio/SoundDesign';
import {SharkSheet} from './episodes/ep13-tiburon-duende/character/SharkSheet';
import {TiburonDuende, TiburonDuendeProps} from './episodes/ep13-tiburon-duende/TiburonDuende';
import {GOBLIN_AUDIO} from './episodes/ep13-tiburon-duende/audio/SoundDesign';
import {OarfishSheet} from './episodes/ep14-pez-remo/components/OarfishSheet';
import {PezRemoDocumentary, PezRemoProps} from './episodes/ep14-pez-remo/Documentary';
import {OARFISH_AUDIO} from './episodes/ep14-pez-remo/audio/SoundDesign';
import {OarfishDemo} from './episodes/ep15-pez-remo-personaje/demo/OarfishDemo';
import {LayerSheet as OarfishLayerSheet} from './episodes/ep15-pez-remo-personaje/demo/LayerSheet';
import {OarfishDemo as OarfishPremiumDemo} from './episodes/ep16-pez-remo-premium/OarfishDemo';
import {RefHead as OarfishV2RefHead, RefSide as OarfishV2RefSide, RefWide as OarfishV2RefWide} from './episodes/oarfish-cinematic-v2/refs/ReferenceStills';
import {StageSheet as ToadStageSheet} from './episodes/ep17-de-huevo-a-sapo/character/StageSheet';
import {SapoDemo} from './episodes/ep17-de-huevo-a-sapo/SapoDemo';
import {MixinoSheet} from './episodes/ep18-mixino/character/Sheet';
import {EelSheet} from './episodes/ep19-anguila-electrica/character/Sheet';
import {PufferSheet} from './episodes/ep20-pez-erizo/character/Sheet';
import {PUFFER_AUDIO, PufferDocProps, PufferDocumentary} from './episodes/ep20-pez-erizo/Documentary';
const pufferDefaults: PufferDocProps = {quality: 'final', showSubtitles: true, audio: PUFFER_AUDIO, extraTracks: true};
import {EEL_AUDIO, EelDocProps, EelDocumentary} from './episodes/ep19-anguila-electrica/Documentary';
const eelDefaults: EelDocProps = {quality: 'final', showSubtitles: true, audio: EEL_AUDIO, extraTracks: true};
import {MIXINO_AUDIO, MixinoProps, MixinoWithSlime} from './episodes/ep18-mixino/Documentary';
const mixinoDefaults: MixinoProps = {quality: 'final', showSubtitles: true, audio: MIXINO_AUDIO, slimeTrack: true};
import {SAPO_AUDIO, SapoDocProps, SapoDocumentary} from './episodes/ep17-de-huevo-a-sapo/full/Documentary';
const sapoDefaults: SapoDocProps = {quality: 'final', showSubtitles: true, audio: SAPO_AUDIO};
const oarfishDefaults: PezRemoProps = {quality: 'final', showSubtitles: true, audio: OARFISH_AUDIO};
const goblinDefaults: TiburonDuendeProps = {quality: 'final', showSubtitles: true, audio: GOBLIN_AUDIO};
const dragonV2Defaults: EP05V2Props = {quality: 'final', showSubtitles: true, audio: EP05V2_AUDIO};
const dragonDefaults: EP05DragonProps = {quality: 'final', showSubtitles: true, audio: EP05_DRAGON_AUDIO};
const mantisDefaults: EP04MantisProps = {quality: 'final', showSubtitles: true, audio: EP04_MANTIS_AUDIO};
import {EP04Leopardo, EP04LeopardoProps} from './episodes/ep09-leopardo/EP04Leopardo';
import {EP04_LEOPARDO_AUDIO} from './episodes/ep09-leopardo/audio/SoundDesign';
const leopardoDefaults: EP04LeopardoProps = {quality: 'final', showSubtitles: true, audio: EP04_LEOPARDO_AUDIO};
const ep08Defaults: Ep08FullProps = {quality: 'final', showSubtitles: true, audio: EP08_DEFAULT_AUDIO};
import {LobitoPrueba} from './music-videos/baile-del-lobito/Scenes/Test20';
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
    <Composition id="CoheteVideoV2" component={CoheteVideoV2} durationInFrames={SONG_FRAMES} fps={30} width={1080} height={1920} defaultProps={{withAudio: true, offset: 0}} />
    <Composition id="CohetePruebaV2" component={CoheteVideoV2} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{withAudio: true, offset: 5.7}} />
    <Composition id="EP04Leopardo" component={EP04Leopardo} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={leopardoDefaults} />
    <Composition id="EP04-MantisShrimp-Premium" component={EP04MantisShrimp} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={mantisDefaults} />
    <Composition id="DeHuevoASapoDemo" component={SapoDemo} durationInFrames={450} fps={30} width={1080} height={1920} />
    <Composition id="DeHuevoASapo" component={SapoDocumentary} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={sapoDefaults} />
    <Composition id="EP-Mixino" component={MixinoWithSlime} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={mixinoDefaults} />
    <Composition id="EP-AnguilaElectrica" component={EelDocumentary} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={eelDefaults} />
    <Composition id="EP-PezErizo" component={PufferDocumentary} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={pufferDefaults} />
    <Composition id="PezErizoFicha" component={PufferSheet} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="AnguilaFicha" component={EelSheet} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="MixinoFicha" component={MixinoSheet} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="SapoEtapasFicha" component={ToadStageSheet} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="OarfishV2RefHead" component={OarfishV2RefHead} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="OarfishV2RefSide" component={OarfishV2RefSide} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="OarfishV2RefWide" component={OarfishV2RefWide} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="PezRemoPremiumDemo" component={OarfishPremiumDemo} durationInFrames={450} fps={30} width={1080} height={1920} />
    <Composition id="PezRemoPersonajeDemo" component={OarfishDemo} durationInFrames={240} fps={30} width={1080} height={1920} />
    <Composition id="PezRemoPersonajeCapas" component={OarfishLayerSheet} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="EP07PezRemo" component={PezRemoDocumentary} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={oarfishDefaults} />
    <Composition id="PezRemoFicha" component={OarfishSheet} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="TiburonDuende" component={TiburonDuende} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={goblinDefaults} />
    <Composition id="TiburonDuendeFicha" component={SharkSheet} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="EP05DragonAzulV2" component={EP05DragonAzulV2} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={dragonV2Defaults} />
    <Composition id="EP05DragonAzul" component={EP05DragonAzul} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={dragonDefaults} />
    <Composition id="EP05DragonAzulFicha" component={DragonSheet} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="EP04-MantisShrimp-Ficha" component={MantisSheet} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="EP04LeopardoFicha" component={LeopardSheet} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="Ep08Full" component={Ep08Full} durationInFrames={180 * 30} fps={30} width={1080} height={1920} defaultProps={ep08Defaults} />
    <Composition id="Ep08Demo" component={Ep08Full} durationInFrames={15 * 30} fps={30} width={1080} height={1920} defaultProps={ep08Defaults} />
 <Composition id="LobitoPrueba" component={LobitoPrueba} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{withAudio: true}} />
    <Composition id="LobitoFichas" component={LobitoFichas} durationInFrames={300} fps={30} width={1080} height={1920} />
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
