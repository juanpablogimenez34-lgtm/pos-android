// Subtítulos y ducking a partir de los tiempos MEDIDOS de la locución.
import {cuesFromTiming, speechIntervals, TimedLine} from '../../../engine/cues';
import narration from '../script/narration-timing.json';

export const TIMING = (narration as {timing: TimedLine[]}).timing;
export const CUES = cuesFromTiming(TIMING);
export const SPEECH = speechIntervals(TIMING);
