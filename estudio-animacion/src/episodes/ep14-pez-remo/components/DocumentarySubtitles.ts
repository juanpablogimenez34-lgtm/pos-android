// SUBTÍTULOS: Subtitles2 del Estudio 2.0 (máx. 2 líneas, palabra a palabra, palabras clave en turquesa
// o dorado, zona segura), alimentados con los tiempos medidos de la locución.
import {cuesFromTiming, speechIntervals, TimedLine} from '../../../engine/cues';
import narration from '../data/narration-timing.json';
export {Subtitles2 as DocumentarySubtitles} from '../../../studio2';

export const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const CUES = cuesFromTiming(TIMING, 28);
export const SPEECH = speechIntervals(TIMING);
