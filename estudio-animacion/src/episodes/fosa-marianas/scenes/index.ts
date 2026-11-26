// Registro de las 10 escenas.
import {Frame} from '../components/HShell';
import {scene1, scene2} from './S1_2';
import {scene3, scene4} from './S3_4';
import {scene5, scene6, scene7} from './S5_7';

export const SCENE_FNS: ((t: number) => Frame)[] = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
