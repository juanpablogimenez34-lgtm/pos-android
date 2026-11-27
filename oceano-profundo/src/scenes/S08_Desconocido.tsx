// ESCENA 08 — EL MUNDO DESCONOCIDO (500–570 s).
//  500–506 llanura abisal en penumbra: medusas, sifonóforos y ctenóforos a la deriva.
//  506–516 llega un ROV con focos y cable umbilical (rótulo).
//  516–529 se acerca al fondo y recoge una muestra con su brazo manipulador.
//  529–539 apaga los focos: aparece la bioluminiscencia (≈ 3 de cada 4 animales observados producían luz).
//  539–547 barrido de sonar: gran parte del fondo marino sin cartografiar en detalle; nuevas especies cada año.
//  547–556 la luz como lenguaje: cazar, esconderse, encontrar pareja.
//  556–570 el ROV se aleja; preguntas abiertas.
import {Atolla, CombJelly, Jellyfish, Siphonophore} from '../animals/Fauna';
import {ROV} from '../animals/Machines';
import {Lanternfish} from '../animals/SmallFish';
import {breathe, cam, shot, toScreen} from '../camera/camera';
import {Label, Title, win} from '../components/UI';
import {Glow} from '../effects/Effects';
import {Ocean} from '../environment/Ocean';
import {FONT} from '../utils/fonts';
import {clamp, hash1, lerp} from '../utils/math';
import {along} from '../utils/motion';
import {f1} from '../utils/spline';
import {SceneFn} from './common';

const VP = {w: 1920, h: 1080};
const FLOOR = 520;
const DEPTH = 3800;

export const scene08: SceneFn = (t) => {
  const rov = along([[500, -1600, -900], [506.5, -900, -500], [516, -200, 160], [529, 60, 250], [556, 200, 220], [570, 1600, -500]], t);
  const lights = clamp((t - 503) / 2) * (1 - clamp((t - 529.4) / 0.8)) + clamp((t - 539.2) / 1.2) * (1 - clamp((t - 562) / 4));
  const arm = win(t, 518.5, 528.5, 1.5);
  const grab = win(t, 522.5, 527, 0.6);
  const glowAll = clamp((t - 529.6) / 1.6) * (1 - clamp((t - 539) / 1.2)) * 1.0 + 0.25;
  let c = cam(rov.x + 300, rov.y + 120, 0.75);
  if (t < 506.5) c = shot(t, 500, 506.5, cam(200, 0, 0.42), cam(-500, -200, 0.55), 'inOut');
  else if (t < 529) c = shot(t, 506.5, 518, cam(rov.x + 200, rov.y + 60, 0.62), cam(rov.x + 380, 280, 0.95), 'cine');
  else if (t < 547.4) c = shot(t, 529, 539, cam(rov.x + 380, 280, 0.95), cam(300, 100, 0.48), 'inOut');
  else c = shot(t, 547.4, 570, cam(300, 100, 0.48), cam(700, -100, 0.55), 'inOut');
  c = breathe(c, t, 0.5);
  const rovS = toScreen(c, VP, rov.x, rov.y);
  const sampleS = toScreen(c, VP, 420, FLOOR - 10);
  const sweep = clamp((t - 539.4) / 6);
  const fauna = Array.from({length: 26}, (_, i) => ({x: -1800 + hash1(i * 5) * 3800, y: -900 + hash1(i * 9) * 1300, k: i % 5, s: 0.6 + hash1(i * 3) * 0.7}));
  return {
    depth: DEPTH,
    svg: (
      <Ocean cam={c} t={t} depth={DEPTH} floor={{y: FLOOR, kind: 'abyss'}} snow={1.1} specks={1 + glowAll * 2.5}>
        {/* fauna a la deriva; brilla con más intensidad cuando los focos se apagan */}
        {fauna.map((f, i) => {
          const x = f.x + Math.sin(t * 0.2 + i) * 60;
          const y = f.y + Math.cos(t * 0.17 + i) * 40;
          const g = <Glow key={`g${i}`} id={`fg${i % 3}`} x={x} y={y} r={90 * f.s} color={['#5ad8ff', '#7affc8', '#a890ff'][i % 3]} k={glowAll * 0.9} />;
          switch (f.k) {
            case 0:
              return <g key={i}>{g}<Jellyfish x={x} y={y} s={f.s} t={t + i} hue="#a8c8ff" glow={0.4 + glowAll} seed={i} /></g>;
            case 1:
              return <g key={i}>{g}<Atolla x={x} y={y} s={f.s} t={t + i} alarm={0.3 + glowAll} /></g>;
            case 2:
              return <g key={i}><CombJelly x={x} y={y} s={f.s * 1.2} t={t + i} /></g>;
            case 3:
              return <g key={i}>{g}<Siphonophore x={x} y={y} s={f.s} t={t + i} len={700} /></g>;
            default:
              return <g key={i}>{g}<Lanternfish x={x + (t - 500) * 30} y={y} scale={f.s * 1.4} angle={0} t={t + i} /></g>;
          }
        })}
        {/* barrido de sonar sobre el fondo */}
        {sweep > 0 && sweep < 1 && (
          <g opacity={win(t, 539.4, 546.8, 0.5)}>
            <path d={`M${f1(-1600 + sweep * 3600)},${FLOOR - 400} L${f1(-1600 + sweep * 3600)},${FLOOR + 400}`} stroke="#5affb0" strokeWidth={6} opacity={0.8} />
            {Array.from({length: 18}, (_, i) => {
              const x = -1600 + i * 200;
              if (x > -1600 + sweep * 3600) return null;
              return <path key={i} d={`M${x},${FLOOR + 10} l200,0`} stroke="#5affb0" strokeWidth={3} opacity={i % 4 === 1 ? 0.15 : 0.6} strokeDasharray={i % 4 === 1 ? '6 10' : undefined} />;
            })}
          </g>
        )}
        <ROV uid="rov8" x={rov.x} y={rov.y} s={0.9} t={t} lights={lights} beamAng={0.45} arm={arm} grab={grab} tether={{x: rov.x - 1400, y: rov.y - 2400}} />
        {/* muestra recogida (holoturia) */}
        {t < 524 && <ellipse cx={420} cy={FLOOR - 12} rx={34} ry={12} fill="#a85a68" />}
      </Ocean>
    ),
    overlay: (
      <>
        <Label x={rovS.x} y={rovS.y} tx={rovS.x + 260} ty={rovS.y - 220} text="ROV: vehículo operado a distancia" k={win(t, 507, 515.4, 0.5)} />
        <Label x={sampleS.x} y={sampleS.y} tx={sampleS.x + 220} ty={sampleS.y - 200} text="Toma de muestras" k={win(t, 521.8, 528.6, 0.5)} color="#ffd76a" />
        {win(t, 530, 538.6, 0.5) > 0.01 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: FONT, opacity: win(t, 530, 538.6, 0.5)}}>
            <div style={{fontSize: 52, fontWeight: 900, color: '#ffffff', textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>≈ 3 DE CADA 4 ANIMALES OBSERVADOS</div>
            <div style={{fontSize: 34, fontWeight: 700, color: '#9ff0ff', textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>podían producir luz (estudio frente a California)</div>
            <svg width={360} height={80} style={{marginTop: 14}}>
              {[0, 1, 2, 3].map((i) => <circle key={i} cx={50 + i * 87} cy={40} r={28} fill={i < 3 ? '#5ad8ff' : 'none'} stroke="#cfefff" strokeWidth={3} opacity={i < 3 ? 0.9 : 0.6} />)}
            </svg>
          </div>
        )}
        <Title k={win(t, 539.6, 546.8, 0.5)} lines={['GRAN PARTE DEL FONDO MARINO', 'AÚN SIN CARTOGRAFIAR EN DETALLE']} size={44} top={110} />
        {win(t, 547.8, 555.2, 0.5) > 0.01 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: FONT, opacity: win(t, 547.8, 555.2, 0.5)}}>
            {[['CAZAR', '#9ff0ff'], ['ESCONDERSE', '#bfe0ff'], ['ENCONTRAR PAREJA', '#ffd76a']].map(([s, col], i) => (
              <div key={s} style={{fontSize: 44, fontWeight: 900, color: col, textShadow: '0 3px 12px rgba(0,0,0,0.85)', opacity: clamp((t - 548 - i * 1.6) / 0.6)}}>{s}</div>
            ))}
          </div>
        )}
        <Title k={win(t, 555.8, 563, 0.6)} lines={['MÁS PREGUNTAS QUE RESPUESTAS']} size={54} top={130} />
      </>
    ),
    grade: {vignette: 0.85},
  };
};
export const _lerp = lerp;
