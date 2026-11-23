// ESCENA 10 (135–150 s) · UN LINAJE ANTIGUO: línea temporal ilustrada que se dibuja sobre el fondo
// (con un mixino nadando, atenuado). Fechas aproximadas; se aclara que las especies actuales también
// han evolucionado.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, SceneOut} from '../../../studio2';
import {Hagfish} from '../character/Hagfish';
import {seg, Vignette} from '../components/common';
import {EV} from '../data/timeline';
import {DeepBack} from '../environment/Deep';
import {crawl, pathOf} from './rig';

const P = pathOf([{x: -1600, y: -200}, {x: -1000, y: -260}, {x: -400, y: -180}, {x: 200, y: -260}, {x: 800, y: -190}, {x: 1400, y: -250}, {x: 2000, y: -200}]);

const NODES = [
  {t: EV.timeline + 0.6, when: 'MÁS DE 500 MILLONES DE AÑOS', what: 'Aparecen los primeros vertebrados sin mandíbulas', icon: 'early'},
  {t: EV.timeline + 3.4, when: '≈ 300 MILLONES DE AÑOS', what: 'Myxinikela: un fósil de mixino', icon: 'fossil'},
  {t: EV.timeline + 6.2, when: '≈ 100 MILLONES DE AÑOS', what: 'Tethymyxine: fósil con rastros de glándulas mucosas', icon: 'fossil2'},
  {t: EV.timeline + 9.0, when: 'HOY', what: 'Decenas de especies de mixinos', icon: 'today'},
];

const Icon: React.FC<{kind: string}> = ({kind}) => {
  if (kind === 'early')
    return (
      <svg width={120} height={60} viewBox="0 0 120 60">
        <path d="M8,30 C20,14 60,16 96,26 L114,18 L110,30 L114,42 L96,34 C60,44 20,46 8,30Z" fill="#7aa6a0" />
        <circle cx={22} cy={28} r={3} fill="#0a1a1a" />
      </svg>
    );
  if (kind === 'fossil' || kind === 'fossil2')
    return (
      <svg width={120} height={60} viewBox="0 0 120 60">
        <rect x={2} y={4} width={116} height={52} rx={10} fill="#5a5448" />
        <path d="M14,34 C34,20 54,44 74,30 S104,24 108,32" stroke="#2a2620" strokeWidth={7} fill="none" strokeLinecap="round" />
        {kind === 'fossil2' && <path d="M40,22 q6,-8 12,0 M70,44 q6,8 12,0" stroke="#c8c0a8" strokeWidth={2} fill="none" />}
      </svg>
    );
  return (
    <svg width={120} height={60} viewBox="0 0 120 60">
      <path d="M10,32 C30,18 50,44 72,30 S102,22 110,30" stroke="#8e5a50" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M110,30 l8,-4 M110,30 l8,4" stroke="#9a6a5c" strokeWidth={2} />
    </svg>
  );
};

export function scene10(t: number): SceneOut {
  const sp = crawl(P, 1200 + (t - 135) * 70, t, 26, 1.5, 1.4);
  const c = breathe(cam(sp[20].x, -150, 1.1), t, 0.3);
  const draw = seg(t, EV.timeline, EV.timeline + 10);
  const top = 540;
  const bottom = 1250;
  return {
    svg: (
      <DeepBack cam={c} t={t} light={0.7}>
        <Hagfish uid="h10" spine={sp} look={{t, tone: 0.45}} />
      </DeepBack>
    ),
    overlay: (
      <>
        <Vignette />
        <AbsoluteFill style={{background: 'rgba(2,14,16,0.55)', opacity: seg(t, 135, 136)}} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={`M150,${top} L150,${top + (bottom - top) * draw}`} stroke="#7ee0d0" strokeWidth={6} strokeLinecap="round" />
          {NODES.map((nd, i) => {
            const y = top + ((bottom - top) * i) / 3;
            const k = clamp((t - nd.t) / 0.5);
            return <circle key={i} cx={150} cy={y} r={14 * k} fill="#04161a" stroke="#bff7ea" strokeWidth={5} />;
          })}
        </svg>
        {NODES.map((nd, i) => {
          const y = top + ((bottom - top) * i) / 3;
          const k = clamp((t - nd.t) / 0.6);
          if (k <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: 200, right: 60, top: y - 50, fontFamily: FONT_FAMILY, opacity: k, transform: `translateX(${((1 - k) * 30).toFixed(1)}px)`, display: 'flex', alignItems: 'center', gap: 18}}>
              <Icon kind={nd.icon} />
              <div>
                <div style={{color: '#7ee0d0', fontWeight: 900, fontSize: 30, letterSpacing: 2}}>{nd.when}</div>
                <div style={{color: '#f2fffb', fontWeight: 700, fontSize: 32, lineHeight: 1.15}}>{nd.what}</div>
              </div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 80, right: 80, top: 1330, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#bfe8e0', fontSize: 26, fontWeight: 700, opacity: seg(t, 146, 147)}}>Fechas aproximadas. Las especies actuales también han evolucionado.</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#f4fffb', fontWeight: 900, fontSize: 44, letterSpacing: 3, opacity: seg(t, 135.3, 136.2)}}>VERTEBRADOS SIN MANDÍBULAS</div>
      </>
    ),
  };
}
