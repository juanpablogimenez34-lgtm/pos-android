// Dibujo de una caza (hoja, insecto, chorro, ondas y pez) repartido entre las capas del manglar.
import {ArcherFish} from '../character/ArcherFish';
import {Insect, PerchLeaf, Ripples} from '../character/Insects';
import {WaterJet} from '../effects/WaterJet';
import {HuntFrame} from './hunt';

export function huntLayers(hf: HuntFrame, T: number, uid: string, opts: {fishTone?: number} = {}) {
  const f = hf.fish;
  return {
    above: <PerchLeaf p={hf.perch} t={T} wet={hf.wet} />,
    below: <ArcherFish uid={uid} x={f.x} y={f.y} angle={f.angle} dir={f.dir} scale={f.scale} look={{t: T, swim: f.swim, freq: f.freq, mouth: f.mouth, squeeze: f.squeeze, lookAt: f.lookAt, tone: opts.fishTone}} />,
    free: (
      <>
        {hf.insect.visible && <Insect x={hf.insect.x} y={hf.insect.y} ang={hf.insect.ang} s={hf.insect.s} t={T} kind={hf.insect.kind} state={hf.insect.state} />}
        <WaterJet sh={hf.shot} t={T} />
        <Ripples x={hf.shot.mouth.x} t={T} t0={hf.shot.t0} n={2} big={0.6} />
        {hf.shot.hit ? <Ripples x={hf.landX} t={T} t0={hf.landT} n={3} /> : null}
        {hf.shot.hit ? <Ripples x={hf.landX} t={T} t0={hf.captureT - 0.05} n={2} big={1.3} /> : null}
      </>
    ),
  };
}
