import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {AudioTracks} from '../../engine/AudioTracks';
import {ensureFonts, FONT_FAMILY} from '../../engine/fonts';
import {easeOut, smoothstep} from '../../engine/math';
import {ChapterTag, Dip, Fade, FinalCard} from '../../engine/Overlays';
import {QualityName, QualityProvider} from '../../engine/quality';
import {StyleProvider} from '../../engine/style';
import {Subtitles} from '../../engine/Subtitles';
import {TitleCard} from '../../engine/TitleCard';
import {AudioMix} from '../../engine/types';
import {useTime} from '../../engine/useTime';
import {CellScene} from '../../environments/cell/Cell';
import {SpaceScene} from '../../environments/space/Space';
import {ExtremeScene} from './scenes/ExtremeScene';
import {ForestScene} from './scenes/ForestScene';
import {MicroScene} from './scenes/MicroScene';
import {CUES, SPEECH} from './subtitles';
import {cellDsup, cellGel, cellLens, dryness, ENV, inWin, lensIn, lensOut, SCENES, tunPanel} from './timeline';

export type Ep03FullProps = {quality: QualityName; showSubtitles: boolean; audio: AudioMix};

/** Revela un entorno dentro de una "lente" circular (transición microscopio). */
const Lens: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) => {
  const {width, height} = useVideoConfig();
  if (k <= 0.001) return null;
  if (k >= 0.999) return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = Math.hypot(width, height) * 0.55 * easeOut(k);
  return (
    <AbsoluteFill style={{clipPath: `circle(${r.toFixed(0)}px at 50% 50%)`}}>
      {children}
      <AbsoluteFill style={{boxShadow: 'none', background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${Math.max(0, r - 30)}px, rgba(220,255,200,0.5) ${r - 4}px, rgba(0,0,0,0) ${r}px)`}} />
    </AbsoluteFill>
  );
};

const Badge: React.FC<{y: number; k: number; title: string; sub: string; color?: string}> = ({y, k, title, sub, color = '#c9f27a'}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: easeOut(k), transform: `translateY(${(1 - easeOut(k)) * 16}px)`, fontFamily: FONT_FAMILY}}>
      <div style={{padding: '16px 30px', borderRadius: 24, background: 'rgba(3,14,20,0.8)', border: `2px solid ${color}88`, textAlign: 'center', maxWidth: 900}}>
        <div style={{fontWeight: 900, fontSize: 42, color, letterSpacing: 1}}>{title}</div>
        <div style={{fontWeight: 600, fontSize: 26, color: '#eafffb', marginTop: 4}}>{sub}</div>
      </div>
    </div>
  ) : null;

/** Panel del estado de resistencia (65–70 s). */
const TunPanel: React.FC<{k: number; t: number}> = ({k, t}) => {
  if (k <= 0.01) return null;
  const water = 1 - smoothstep(64.6, 68, t) * 0.94;
  const meta = 1 - smoothstep(64.6, 68.5, t) * 0.97;
  const bar = (label: string, v: number, color: string, note: string) => (
    <div style={{marginTop: 18}}>
      <div style={{display: 'flex', justifyContent: 'space-between', color: '#eafffb', fontWeight: 800, fontSize: 28}}>
        <span>{label}</span>
        <span style={{color, fontWeight: 600, fontSize: 24}}>{note}</span>
      </div>
      <div style={{height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.12)', marginTop: 8}}>
        <div style={{width: `${(v * 100).toFixed(1)}%`, height: '100%', borderRadius: 11, background: color}} />
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 230, opacity: easeOut(k), fontFamily: FONT_FAMILY, padding: '26px 34px', borderRadius: 30, background: 'rgba(20,14,6,0.82)', border: '2px solid rgba(201,242,122,0.5)'}}>
      <div style={{color: '#c9f27a', fontWeight: 900, fontSize: 40, letterSpacing: 2}}>ESTADO DE TONEL</div>
      <div style={{color: '#eafffb', fontWeight: 600, fontSize: 26}}>criptobiosis por desecación (anhidrobiosis)</div>
      {bar('Agua del cuerpo', water, '#7fd0ff', water < 0.2 ? 'casi toda perdida' : '')}
      {bar('Metabolismo', meta, '#ffd27a', meta < 0.1 ? 'casi indetectable' : '')}
      <div style={{marginTop: 16, color: '#ffffff', fontWeight: 800, fontSize: 28}}>No está muerto: puede recuperarse.</div>
    </div>
  );
};

export const Ep03Full: React.FC<Ep03FullProps> = ({quality, showSubtitles, audio}) => {
  ensureFonts();
  const t = useTime();
  const mix: AudioMix = {...audio, music: audio.music ? {...audio.music, duck: SPEECH} : undefined};
  const microVisible = inWin(t, ENV.microA) || inWin(t, ENV.microB) || inWin(t, ENV.microC);
  const microLens = t < 20 ? lensIn(t) : t > 170 ? lensOut(t) : 1;
  return (
    <QualityProvider quality={quality}>
      <StyleProvider refined>
        <AbsoluteFill style={{backgroundColor: '#0a140a'}}>
          {/* sólo se monta el entorno visible en cada instante */}
          {(inWin(t, ENV.forestA) || inWin(t, ENV.forestB)) && <ForestScene />}
          {microVisible && (
            <Lens k={microLens}>
              <MicroScene />
            </Lens>
          )}
          {inWin(t, ENV.cell) && (
            <Lens k={cellLens(t)}>
              <CellScene t={t} gel={cellGel(t)} dsup={cellDsup(t)} dryness={dryness(t)} />
            </Lens>
          )}
          {inWin(t, ENV.extreme) && (
            <AbsoluteFill style={{opacity: smoothstep(70, 70.8, t)}}>
              <ExtremeScene />
            </AbsoluteFill>
          )}
          {inWin(t, ENV.space) && <SpaceScene t={t} start={95} />}

          {/* visualizaciones y rótulos */}
          <TunPanel k={tunPanel(t)} t={t} />
          <Badge y={230} k={smoothstep(127.6, 128.4, t) * (1 - smoothstep(130.4, 131, t))} title="PROTEÍNAS CAHS" sub="en algunas especies, forman un gel al secarse" />
          <Badge y={230} k={smoothstep(131, 131.8, t) * (1 - smoothstep(136.4, 137, t))} title="DSUP" sub="protegió el ADN de células humanas en experimentos" color="#d6a8ff" />
          <Badge y={230} k={smoothstep(137.2, 138, t) * (1 - smoothstep(142.4, 143, t))} title="VARIOS MECANISMOS" sub="no existe un único secreto · se siguen investigando" color="#7fd0ff" />
          <Badge y={230} k={smoothstep(143.2, 144, t) * (1 - smoothstep(145.4, 146, t))} title="INVESTIGACIÓN" sub="posible ayuda para conservar medicamentos" color="#ffd27a" />

          <TitleCard start={16.0} end={20.4} kicker="EL ANIMAL QUE" title="SOBREVIVIÓ AL ESPACIO" centerY={0.15} accent="#c9f27a" titleSize={72} />
          {SCENES.slice(1).map((s) => (
            <ChapterTag key={s.n} start={s.start + 0.5} num={`0${s.n}`} label={s.title} />
          ))}
          <FinalCard start={175.4} question="¿QUÉ OTRO ANIMAL EXTRAORDINARIO CONOCES?" accent={/EXTRAORDINARIO/} accentColor="#c9f27a" footer="EPISODIO 03 · EL ANIMAL QUE SOBREVIVIÓ AL ESPACIO" />

          <Dip at={70} down={0.5} up={0.6} />
          <Dip at={95} down={0.5} up={0.6} />
          <Dip at={120} down={0.5} up={0.6} />
          <Fade from={0} to={0.8} inverse />
          {showSubtitles && <Subtitles cues={CUES} centerY={0.76} />}
          <AudioTracks mix={mix} />
        </AbsoluteFill>
      </StyleProvider>
    </QualityProvider>
  );
};
