// Registro de los cinco Shorts verticales: duración = narración medida + cola (60–90 s).
import t1 from './data/short1-timing.json';
import t2 from './data/short2-timing.json';
import t3 from './data/short3-timing.json';
import t4 from './data/short4-timing.json';
import t5 from './data/short5-timing.json';
import s1 from './data/short1.json';
import s2 from './data/short2.json';
import s3 from './data/short3.json';
import s4 from './data/short4.json';
import s5 from './data/short5.json';
import {TimedLine} from '../utils/cues';
import {makeShort, ShortSpec} from './Short';
import {short1Scene, short2Scene} from './ShortsA';
import {short3Scene, short4Scene, short5Scene} from './ShortsB';

const tm = (x: unknown) => (x as {timing: TimedLine[]}).timing;
const endAt = (x: unknown) => tm(x)[tm(x).length - 1].start - 0.2;
export const SHORTS: ShortSpec[] = [
  {n: 1, title: 'El pez que utiliza una luz para cazar', duration: s1.durationSec, scene: short1Scene, timing: tm(t1), highlight: ['señuelo', 'bacterias', 'trampa'], endAt: endAt(t1)},
  {n: 2, title: 'Los dientes extraordinarios del pez víbora', duration: s2.durationSec, scene: short2Scene, timing: tm(t2), highlight: ['colmillos', 'jaula', 'fotóforos'], endAt: endAt(t2)},
  {n: 3, title: 'Los enormes ojos del calamar gigante', duration: s3.durationSec, scene: short3Scene, timing: tm(t3), highlight: ['ojos', 'veintisiete', 'cachalote'], endAt: endAt(t3)},
  {n: 4, title: 'Cómo caza el cachalote en la oscuridad', duration: s4.durationSec, scene: short4Scene, timing: tm(t4), highlight: ['ecolocalización', 'chasquidos', 'zumbido'], endAt: endAt(t4)},
  {n: 5, title: 'Calamar gigante contra calamar colosal', duration: s5.durationSec, scene: short5Scene, timing: tm(t5), highlight: ['gigante', 'colosal', 'ganchos'], endAt: endAt(t5)},
];
export const SHORT_COMPONENTS = SHORTS.map((s) => ({spec: s, Comp: makeShort(s)}));
