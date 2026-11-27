import React from 'react';
import {Composition} from 'remotion';
import {GLProbe} from './compositions/GLProbe';
import {SheetView, SheetViewName} from './compositions/SheetView';
import {Turntable} from './compositions/Turntable';
import {MotionTest} from './compositions/MotionTest';
import {CinematicTest} from './compositions/CinematicTest';
import {PumaSheet, PumaView} from './episodes/puma/ui/PumaSheet';

export const Root: React.FC = () => (
  <>
    <Composition id="GLProbe" component={GLProbe} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="SheetView" component={SheetView as React.FC<{view: SheetViewName}>} durationInFrames={1} fps={30} width={900} height={900} defaultProps={{view: 'left' as SheetViewName}} />
    <Composition id="Turntable" component={Turntable} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="MotionTest" component={MotionTest} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="CinematicTest" component={CinematicTest} durationInFrames={450} fps={30} width={1080} height={1920} />
    <Composition id="PumaSheet" component={PumaSheet as React.FC<{view: PumaView}>} durationInFrames={1} fps={30} width={900} height={900} defaultProps={{view: 'left' as PumaView}} />
  </>
);
