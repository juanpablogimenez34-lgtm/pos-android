// ESCENA 12 (165–180 s) — EL ÚLTIMO ENCUENTRO. Amanecer: el leopardo descansa sobre una rama; la
// cámara se acerca despacio; levanta la cabeza y mira al horizonte. Pregunta final, logotipo
// «MUNDO INSÓLITO DOCUMENTALES» y «DESCUBRE LO QUE PARECE IMPOSIBLE».
import {lerp, smoothstep} from '../../../engine/math';
import {look, rest} from '../animation/LeopardMotion';
import {Cam, drift, layerT} from '../animation/CameraSystem';
import {leopardPose} from '../animation/LeopardRig';
import {Dust, LightRays} from '../animation/ParticleSystem';
import {Leopard} from '../characters/Leopard';
import {SavannahBack} from '../environments/Savannah';
import {GiantTree} from '../environments/Tree';
import {FONT_FAMILY} from '../../../engine/fonts';
import {Caption, Grade, SceneOut, win} from './common';

const BR = -760;

export function scene12(t: number): SceneOut {
  const lookUp = smoothstep(167.5, 169, t);
  const p = leopardPose({x: 470, y: BR - 26, scale: 1.05, t, rim: '#ffcf8a', rimK: 0.7, ...look(rest(t), 0.6 * lookUp, 0.25 * lookUp)});
  const hour = lerp(1.6, 1.0, smoothstep(165, 178, t));
  const cam: Cam = drift({x: lerp(300, 470, smoothstep(165, 175, t)), y: lerp(BR - 220, BR - 140, smoothstep(165, 175, t)), zoom: lerp(1.1, 2.0, smoothstep(165, 176, t)), roll: 0}, t, 0.6);
  const logo = win(t, 174.0, 180.4, 0.6);
  return {
    svg: (
      <g>
        <SavannahBack cam={cam} t={t} hour={hour} />
        <LightRays cam={cam} t={t} color="#ffd8a0" k={0.7} x0={-400} />
        <g transform={layerT(cam, 1)}>
          <rect x={-3000} y={0} width={6000} height={1600} fill="#5a4030" />
          <GiantTree x={0} t={t} branchY={BR} color="#4a3422" />
          <Leopard uid="l12" p={p} />
        </g>
        <Dust cam={cam} t={t} n={30} color="#ffe8c0" />
      </g>
    ),
    overlay: (
      <>
        <Grade warm={1} vignette={0.9} dark={smoothstep(179.2, 180, t)} />
        <Caption text="¿Qué otro animal te gustaría descubrir?" k={win(t, 170.8, 173.9, 0.4)} top={260} color="#ffe2a0" size={44} />
        {logo > 0.01 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: logo}}>
            <div style={{fontSize: 92, fontWeight: 900, color: '#ffffff', letterSpacing: 6, textShadow: '0 0 28px rgba(255,190,90,0.7), 0 4px 16px rgba(0,0,0,0.8)'}}>MUNDO INSÓLITO</div>
            <div style={{fontSize: 40, fontWeight: 800, color: '#ffe2a0', letterSpacing: 10, marginTop: 4}}>DOCUMENTALES</div>
            <div style={{marginTop: 26, fontSize: 38, fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>DESCUBRE LO QUE PARECE IMPOSIBLE</div>
          </div>
        )}
      </>
    ),
  };
}
