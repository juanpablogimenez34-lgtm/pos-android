// Subtítulos (máx. 2 líneas, palabras clave resaltadas) y tramos de voz para el ducking.
import {cuesFromTiming, speechIntervals, TimedLine} from '../../../engine/cues';
import narration from '../narration/narration-timing.json';

export const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const CUES = cuesFromTiming(TIMING, 30);
export const SPEECH = speechIntervals(TIMING);
