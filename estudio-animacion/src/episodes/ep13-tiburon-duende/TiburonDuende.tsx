// MUNDO INSÓLITO DOCUMENTALES — EL TIBURÓN DUENDE: LA CRIATURA QUE DISPARA SU MANDÍBULA.
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas. Episodio independiente (ep13-tiburon-duende) construido
// sobre el Estudio 2.0; no modifica ningún episodio anterior.
import React from 'react';
import {EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import {SCENES} from './config/episode';
import {scene01, scene02, scene03, scene04} from './scenes/ScenesA';
import {scene05, scene06, scene07, scene08} from './scenes/ScenesB';
import {scene09, scene10, scene11, scene12} from './scenes/ScenesC';
import {CUES, SPEECH} from './subtitles/subtitles';

const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));

export type TiburonDuendeProps = ShellProps;
export const TiburonDuende: React.FC<TiburonDuendeProps> = (props) => <EpisodeShell {...props} scenes={DEFS} cues={CUES} speech={SPEECH} background="#01030a" />;
