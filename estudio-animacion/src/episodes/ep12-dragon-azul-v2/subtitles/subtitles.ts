import {cuesFromTiming, speechIntervals, TimedLine} from '../../../engine/cues';
import narration from '../narration/narration-timing.json';

export const TIMING = (narration as unknown as {timing: TimedLine[]}).timing;
export const CUES = cuesFromTiming(TIMING, 28);
export const SPEECH = speechIntervals(TIMING);
