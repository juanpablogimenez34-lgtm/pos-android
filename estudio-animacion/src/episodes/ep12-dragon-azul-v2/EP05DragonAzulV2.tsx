// MUNDO INSÓLITO DOCUMENTALES · ESTUDIO PREMIUM 2.0
// EP05 v2 — EL DRAGÓN AZUL: LA CRIATURA QUE ROBA EL VENENO DE SUS PRESAS (180 s, 1080×1920, 30 fps).
// Versión NUEVA y separada: la v1 (EP05DragonAzul, ep11-dragon-azul) sigue intacta y funcionando.
// Estado: implementados los segmentos 1–2 (0–20 s) para la PRUEBA DE 15 s; los segmentos 3–9 se
// producen tras la aprobación (guion, narración, música y plan visual ya están definidos).
import React from 'react';
import {EpisodeShell, SceneDef, ShellProps} from '../../studio2';
import {hook, mystery} from './scenes/Opening';
import {CUES, SPEECH} from './subtitles/subtitles';

const SCENES: SceneDef[] = [
  {start: 0, end: 5, render: hook},
  {start: 5, end: 180, render: mystery},
];

export type EP05V2Props = ShellProps;

export const EP05DragonAzulV2: React.FC<EP05V2Props> = (props) => <EpisodeShell {...props} scenes={SCENES} cues={CUES} speech={SPEECH} />;
