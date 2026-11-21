// ESCENA 12 · FINAL IMPACTANTE (165–180 s · f 4950–5399). Atraviesa un haz de luz (escamas que brillan,
// cresta roja ondulante); la cámara se aleja y el animal desaparece en la oscuridad. Texto final y,
// discretamente, el nombre del canal.
import {FONT_FAMILY} from '../../../engine/fonts';
import {LightBeam} from '../components/VolumetricLight';
import {EV} from '../data/timeline';
import {breathe, cam, clamp, DocTitle, Fade, Grade, lerp, Oarfish, OceanEnvironment, oarPoint, oarPose, OS, PaletteGrade, SceneOut, shot, toScreen, win} from './common';

export function scene12(t: number): SceneOut {
  const x = -500 + (t - 165) * 95;
  const beamX = 380; // haz en el mundo
  const base = oarPose({t, x, y: 40, scale: OS, sCurve: 40});
  const head = oarPoint(base, 0, 0);
  const inBeam = clamp(1 - Math.abs(head.x - 120 - beamX) / 700);
  const away = clamp((t - 172) / 6);
  const p = oarPose({...base, light: 0.25 + 0.7 * inBeam * (1 - away), shine: 1, fade: lerp(0.2, 1, away), opacity: 1 - clamp((t - 177) / 1.6)});
  const c = breathe(shot(t, 165, 180, cam(beamX + 60, 0, 1.15), cam(beamX + 260, -160, 0.5), 'cine'), t, 0.5);
  const bs = toScreen(c, beamX, -400);
  const fade = clamp((t - EV.fade[0]) / (EV.fade[1] - EV.fade[0]));
  const ch = win(t, EV.channel, 181, 0.8);
  return {
    svg: (
      <OceanEnvironment cam={c} t={t} depth={0.85} fish={0.2}>
        <Oarfish uid="s12" p={p} />
      </OceanEnvironment>
    ),
    overlay: (
      <>
        <LightBeam x={bs.x} w={200 * c.zoom} t={t} k={0.85 * (1 - away * 0.6)} />
        <PaletteGrade depth={0.85} />
        <Grade depth={0.8} vignette={0.88} />
        <DocTitle text="¿QUÉ OTRO MISTERIO ESCONDE EL OCÉANO?" k={win(t, EV.endText, 181, 0.6) * (1 - fade)} top={300} color="#e8b86d" size={60} />
        {ch > 0.01 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: ch * (1 - fade)}}>
            <div style={{fontWeight: 900, fontSize: 40, letterSpacing: 4, color: '#dce7ec'}}>MUNDO INSÓLITO DOCUMENTALES</div>
            <div style={{fontWeight: 700, fontSize: 28, color: '#3bcbd6', marginTop: 8}}>Síguenos para descubrir más.</div>
          </div>
        )}
        <Fade k={fade} />
      </>
    ),
  };
}
