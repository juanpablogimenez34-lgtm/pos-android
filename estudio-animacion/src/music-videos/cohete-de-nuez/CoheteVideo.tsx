// Videoclip "Nuestro cohete de nuez": composición principal. La duración y todas las marcas
// salen del audio real (MusicSync/song-map.json). El audio es el MP3 original, sin cambios.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {ensureFonts} from '../../engine/fonts';
import {useTime} from '../../engine/useTime';
import {SharedDefs} from './Characters/parts';
import {StarIris, Vignette} from './Effects/Fx';
import {RoomScene} from './Scenes/RoomScene';
import {CountdownScene} from './Scenes/CountdownScene';
import {SpaceScenes} from './Scenes/SpaceScenes';
import {sceneAt, SCENES} from './Timeline/timeline';

export const CoheteVideo: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  ensureFonts();
  const t = useTime();
  const sc = sceneAt(t);
  return (
    <AbsoluteFill style={{background: '#2a1a5a'}}>
      <svg width={1080} height={1920}>
        <SharedDefs />
        {sc.id === 'room' && <RoomScene t={t} home={false} />}
        {sc.id === 'home' && <RoomScene t={t} home />}
        {sc.id === 'countdown' && <CountdownScene t={t} />}
        {sc.id !== 'room' && sc.id !== 'home' && sc.id !== 'countdown' && <SpaceScenes t={t} id={sc.id} />}
      </svg>
      <Vignette k={0.8} />
      {SCENES.slice(1).map((s) => (s.id === 'countdown' || s.id === 'moon' || s.id === 'home' || s.id === 'montage' ? <StarIris key={s.id} t={t} at={s.start} d={0.35} /> : null))}
      {withAudio && <Audio src={staticFile('music/nuestro_cohete_de_nuez.mp3')} />}
    </AbsoluteFill>
  );
};
