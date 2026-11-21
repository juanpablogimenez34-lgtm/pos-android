// Subtítulos sincronizados (máx. 2 líneas, palabras clave destacadas por el motor) y tramos de voz
// para el ducking de la música, a partir de los tiempos MEDIDOS de la locución.
import {cuesFromTiming, speechIntervals, TimedLine} from '../../../engine/cues';
import narration from '../narration/narration-timing.json';

export const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const CUES = cuesFromTiming(TIMING);
export const SPEECH = speechIntervals(TIMING);
