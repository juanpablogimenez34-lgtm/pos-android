// MUNDO INSÓLITO DOCUMENTALES — EL PEZ REMO GIGANTE: EL DRAGÓN DE LAS PROFUNDIDADES (EP07).
// 180 s · 1080×1920 · 30 fps · 5.400 fotogramas. Episodio independiente (ep14-pez-remo) sobre el
// Estudio 2.0; no modifica ningún episodio anterior.
import React from 'react';
import {EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import {CUES, SPEECH} from './components/DocumentarySubtitles';
import {SCENES} from './data/timeline';
import {scene01} from './scenes/Scene01';
import {scene02} from './scenes/Scene02';
import {scene03} from './scenes/Scene03';
import {scene04} from './scenes/Scene04';
import {scene05} from './scenes/Scene05';
import {scene06} from './scenes/Scene06';
import {scene07} from './scenes/Scene07';
import {scene08} from './scenes/Scene08';
import {scene09} from './scenes/Scene09';
import {scene10} from './scenes/Scene10';
import {scene11} from './scenes/Scene11';
import {scene12} from './scenes/Scene12';

const FNS = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09, scene10, scene11, scene12];
const DEFS: SceneDef[] = SCENES.map((s, i) => ({start: s.start, end: s.end, render: FNS[i]}));

export type PezRemoProps = ShellProps;
export const PezRemoDocumentary: React.FC<PezRemoProps> = (props) => <EpisodeShell {...props} scenes={DEFS} cues={CUES} speech={SPEECH} background="#061427" />;
