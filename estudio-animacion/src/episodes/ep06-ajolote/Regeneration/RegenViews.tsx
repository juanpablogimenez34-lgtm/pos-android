// Visualizaciones científicas de la regeneración (ilustración simplificada pero correcta):
//  STAGE_0 extremidad lesionada · STAGE_1 epitelio de la herida · STAGE_2 blastema ·
//  STAGE_3 crecimiento inicial · STAGE_4 organización (condensaciones de cartílago) ·
//  STAGE_5 dedos (aparecen en orden: 2, 1, 3, 4) · STAGE_6 extremidad regenerada.
// Las células del blastema se colorean por su tejido de origen: la mayoría conserva esa
// "memoria" (no se convierten libremente en cualquier tejido). Todo es función de r (0–6).
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {FONT_FAMILY} from '../../../engine/fonts';
import {clamp, easeOut, hash1, lerp, smoothstep} from '../../../engine/math';
import {useTime} from '../../../engine/useTime';
import {EV, regenR, STAGES, stageAt} from '../Timeline/timeline';

const COL = {skin: '#f3c9c6', tissue: '#f0b6b2', epi: '#ffffff', cart: '#9ec3e6', muscle: '#e0707a', conn: '#f2d27a', nerve: '#ffe066', bud: '#fbe6e2'};
const win = (t: number, a: number, b: number, r = 0.5) => smoothstep(a, a + r, t) * (1 - smoothstep(b - r, b, t));

/** Diagrama del tejido en coordenadas locales (la extremidad apunta hacia +x). */
export const TissueDiagram: React.FC<{r: number; W: number; H: number; t: number; signals: number; labels: number}> = ({r, W, H, t, signals, labels}) => {
  const cy = H * 0.5;
  const x0 = W * 0.42; // borde del muñón
  const th = H * 0.2; // semiancho del antebrazo
  const els: React.ReactNode[] = [];
  // ---- muñón: piel, tejido, cartílago, músculo y nervios
  els.push(<rect key="skin" x={-20} y={cy - th - 14} width={x0 + 20} height={(th + 14) * 2} rx={th} fill={COL.skin} />);
  els.push(<rect key="tis" x={-20} y={cy - th} width={x0 + 6} height={th * 2} rx={th * 0.6} fill={COL.tissue} />);
  els.push(<rect key="cart" x={-20} y={cy - th * 0.18} width={x0 - 10} height={th * 0.36} rx={th * 0.18} fill={COL.cart} />);
  for (const k of [-0.62, 0.62]) els.push(<path key={`mu${k}`} d={`M-20,${cy + k * th * 0.75} L${x0 - 20},${cy + k * th * 0.7}`} stroke={COL.muscle} strokeWidth={th * 0.32} strokeLinecap="round" opacity={0.75} />);
  // ---- crecimiento: longitud de la nueva estructura
  const grow = smoothstep(1, 2, r) * 0.18 + smoothstep(2, 3, r) * 0.32 + smoothstep(3, 4, r) * 0.2 + smoothstep(4, 6, r) * 0.08;
  const len = W * grow;
  const tip = x0 + len;
  // yema / nueva extremidad (forma de cono → paleta → mano)
  if (r > 1) {
    const paddle = smoothstep(3, 4.2, r);
    const bw = th * (1 + 0.5 * paddle);
    els.push(<path key="bud" d={`M${x0},${cy - th} C${x0 + len * 0.6},${cy - th} ${tip},${cy - bw} ${tip + bw * 0.35},${cy} C${tip},${cy + bw} ${x0 + len * 0.6},${cy + th} ${x0},${cy + th}Z`} fill={COL.bud} />);
  }
  // ---- epitelio de la herida (STAGE_1): células planas que cubren el extremo
  const cover = smoothstep(0, 1, r);
  const capX = Math.max(x0, tip);
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI / 2 + (i / 17) * Math.PI;
    const reach = (Math.abs(a) / (Math.PI / 2)) >= 1 - cover ? 1 : 0;
    if (!reach) continue;
    const R = th * 1.05 + 6;
    const px = capX + Math.cos(a) * R * 0.45 + (r > 1 ? th * 0.2 : 0);
    const py = cy + Math.sin(a) * R;
    els.push(<ellipse key={`ep${i}`} cx={px} cy={py} rx={9} ry={4.5} transform={`rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${px} ${py})`} fill={COL.epi} stroke="#c9d6e8" strokeWidth={1} opacity={0.95} />);
  }
  // ---- blastema: células coloreadas por su tejido de origen; proliferan (STAGE_2–3)
  const nCells = Math.round(clamp((r - 1) / 2) * 70);
  for (let i = 0; i < nCells; i++) {
    const u = hash1(i * 3.1);
    const v = hash1(i * 5.7) * 2 - 1;
    const px = x0 + 6 + u * Math.max(20, len - 10);
    const py = cy + v * th * 0.8 * (1 - u * 0.3);
    const origin = hash1(i * 7.3);
    const col = origin < 0.4 ? COL.conn : origin < 0.7 ? COL.cart : COL.muscle;
    const div = Math.sin(t * 3 + i) > 0.92 && r > 1.8 && r < 4 ? 1 : 0; // célula dividiéndose
    els.push(<circle key={`c${i}`} cx={px} cy={py} r={6 + 2 * div} fill={col} stroke="#ffffff" strokeWidth={1} opacity={0.9 * (1 - smoothstep(4.6, 5.6, r) * 0.6)} />);
    if (div) els.push(<circle key={`cd${i}`} cx={px + 9} cy={py} r={6} fill={col} stroke="#ffffff" strokeWidth={1} />);
  }
  // ---- organización (STAGE_4): condensaciones de cartílago (antebrazo, carpo) y dedos (STAGE_5)
  const org = smoothstep(3, 4, r);
  if (org > 0.01) {
    els.push(<rect key="z1" x={x0 - 4} y={cy - th * 0.38} width={len * 0.55 * org} height={th * 0.22} rx={th * 0.1} fill={COL.cart} opacity={org} />);
    els.push(<rect key="z2" x={x0 - 4} y={cy + th * 0.16} width={len * 0.55 * org} height={th * 0.22} rx={th * 0.1} fill={COL.cart} opacity={org} />);
    for (let k = 0; k < 3; k++) els.push(<circle key={`cp${k}`} cx={x0 + len * 0.62} cy={cy + (k - 1) * th * 0.35} r={th * 0.12} fill={COL.cart} opacity={smoothstep(3.4, 4.2, r)} />);
  }
  const order = [1, 0, 2, 3];
  order.forEach((di, pos) => {
    const g = smoothstep(4 + pos * 0.22, 4.55 + pos * 0.22, r);
    if (g <= 0.01) return;
    const yy = cy + (di - 1.5) * th * 0.42;
    const dl = th * (0.9 + (di === 1 || di === 2 ? 0.4 : 0)) * g;
    els.push(<rect key={`dg${di}`} x={x0 + len * 0.72} y={yy - th * 0.09} width={dl} height={th * 0.18} rx={th * 0.09} fill={COL.cart} />);
  });
  // ---- nervios: llegan al extremo y son necesarios para que avance
  for (const k of [-0.36, 0.36]) {
    const end = Math.max(x0 - 10, tip - th * 0.6);
    els.push(<path key={`nv${k}`} d={`M-20,${cy + k * th} C${x0 * 0.5},${cy + k * th * 1.2} ${x0},${cy + k * th * 0.6} ${end},${cy + k * th * 0.35}`} stroke={COL.nerve} strokeWidth={3.5} fill="none" opacity={0.95} />);
  }
  // ---- señales (puntos luminosos desde nervios y epitelio hacia el blastema)
  if (signals > 0.01) {
    for (let i = 0; i < 26; i++) {
      const ph = (t * 0.6 + hash1(i)) % 1;
      const fromNerve = i % 2 === 0;
      const sx = fromNerve ? lerp(x0 * 0.4, x0, hash1(i * 3)) : capX + th * 0.3;
      const sy = fromNerve ? cy + (i % 4 === 0 ? -0.36 : 0.36) * th : cy + (hash1(i * 5) * 2 - 1) * th * 0.9;
      const ex = x0 + 10 + hash1(i * 7) * Math.max(30, len - 20);
      const ey = cy + (hash1(i * 9) * 2 - 1) * th * 0.6;
      els.push(<circle key={`sg${i}`} cx={lerp(sx, ex, ph)} cy={lerp(sy, ey, ph)} r={4.5} fill={fromNerve ? '#fff3a0' : '#bff6ff'} opacity={signals * Math.sin(Math.PI * ph)} />);
    }
  }
  // ---- rótulos
  const lab = (x: number, y: number, tx: number, ty: number, text: string, k: number, col = '#ffffff') =>
    k > 0.01 ? (
      <g key={text} opacity={k}>
        <path d={`M${x},${y} L${tx},${ty}`} stroke={col} strokeWidth={2} />
        <circle cx={x} cy={y} r={5} fill={col} />
        <text x={tx} y={ty - 8} fill="#ffffff" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={24} textAnchor="middle">
          {text}
        </text>
      </g>
    ) : null;
  els.push(lab(x0 * 0.4, cy, x0 * 0.4, cy - th - 60, 'cartílago', labels * smoothstep(0.2, 0.6, labels)));
  els.push(lab(x0 * 0.55, cy + th * 0.42, x0 * 0.4, cy + th + 80, 'nervio', labels, COL.nerve));
  els.push(lab(capX + th * 0.3, cy - th * 0.9, capX + 60, cy - th - 60, 'epitelio de la herida', labels * cover * (1 - smoothstep(3.5, 4.5, r))));
  if (r > 1.3) els.push(lab(x0 + len * 0.4, cy + th * 0.3, x0 + len * 0.4 + 40, cy + th + 80, 'blastema', labels * smoothstep(1.3, 1.8, r) * (1 - smoothstep(4.4, 5, r)), '#fbe6e2'));
  return <g>{els}</g>;
};

/** Lupa conectada con la pata real (70–120 s) + barra de etapas + rótulo de aceleración. */
export const RegenLoupe: React.FC<{tipX: number; tipY: number}> = ({tipX, tipY}) => {
  const t = useTime();
  const {width} = useVideoConfig();
  const k = win(t, 69.6, 120.4, 0.8);
  if (k <= 0.01) return null;
  const r = regenR(t);
  const st = stageAt(r);
  const cx = width / 2;
  const cy = 600;
  const R = 330;
  const signals = win(t, 89, 99, 1) + win(t, 104, 110, 1) * 0.6;
  return (
    <AbsoluteFill style={{opacity: easeOut(k), pointerEvents: 'none'}}>
      <svg width={width} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <clipPath id="loupe-c">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
        </defs>
        <path d={`M${tipX},${tipY} L${cx + (tipX - cx) * 0.0},${cy + R}`} stroke="#7ff3ff" strokeWidth={3} strokeDasharray="10 8" opacity={0.8} />
        <circle cx={tipX} cy={tipY} r={34} fill="none" stroke="#7ff3ff" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={R + 8} fill="rgba(6,20,22,0.85)" stroke="#7ff3ff" strokeWidth={4} />
        <g clipPath="url(#loupe-c)">
          <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="#1e2d33" />
          <g transform={`translate(${cx - R} ${cy - R})`}>
            <TissueDiagram r={r} W={R * 2} H={R * 2} t={t} signals={signals} labels={1} />
          </g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT_FAMILY}}>
        <span style={{background: 'rgba(6,20,22,0.8)', border: '2px solid #7ff3ff', borderRadius: 16, padding: '8px 20px', color: '#7ff3ff', fontWeight: 800, fontSize: 28, letterSpacing: 1}}>{STAGES[st]}</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1010, display: 'flex', gap: 8}}>
        {STAGES.map((_, i) => (
          <div key={i} style={{flex: 1, height: 14, borderRadius: 7, background: 'rgba(127,243,255,0.18)', overflow: 'hidden'}}>
            <div style={{width: `${clamp(r - i) * 100}%`, height: '100%', background: '#7ff3ff'}} />
          </div>
        ))}
      </div>
      {t > 95 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 95, 120.4, 0.6)}}>
          <span style={{background: 'rgba(30,20,4,0.82)', border: '2px solid #ffd27a', borderRadius: 16, padding: '10px 22px', color: '#ffd27a', fontWeight: 900, fontSize: 30, letterSpacing: 1}}>REGENERACIÓN ACELERADA — SEMANAS O MESES</span>
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 600, color: '#bfe9ef'}}>ilustración simplificada · colores = tejido de origen de las células</div>
    </AbsoluteFill>
  );
};

/** 120–145 s: panel celular a pantalla completa ("EL SECRETO DE SUS CÉLULAS"). */
export const CellPanel: React.FC = () => {
  const t = useTime();
  const {width, height} = useVideoConfig();
  const k = win(t, EV.sciPanel, EV.sciOut + 0.6, 0.9);
  if (k <= 0.01) return null;
  const signals = smoothstep(137, 138.5, t);
  const labels = smoothstep(128, 129, t);
  const zoomIn = 1 + 0.25 * smoothstep(EV.sciPanel, 128, t);
  return (
    <AbsoluteFill style={{opacity: easeOut(k)}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #22363d 0%, #0b1418 80%)'}} />
      <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${width / 2} ${height * 0.47}) scale(${zoomIn}) translate(${-width / 2} ${-height * 0.25})`}>
          <TissueDiagram r={4.7} W={width} H={height * 0.5} t={t} signals={signals} labels={labels} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#fff'}}>
        <div style={{fontWeight: 900, fontSize: 44, letterSpacing: 2}}>CÉLULAS · NERVIOS · SEÑALES</div>
        <div style={{fontWeight: 600, fontSize: 24, color: '#7ff3ff', marginTop: 6}}>ilustración del tejido durante la regeneración · no es una imagen real</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1320, display: 'flex', justifyContent: 'center', gap: 26, fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 700, color: '#fff', opacity: labels}}>
        {[[COL.cart, 'de cartílago'], [COL.muscle, 'de músculo'], [COL.conn, 'de tejido conectivo'], [COL.nerve, 'nervio']].map(([c, l]) => (
          <span key={l} style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 22, height: 22, borderRadius: 11, background: c, display: 'inline-block'}} />
            {l}
          </span>
        ))}
      </div>
      {signals > 0.01 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1390, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: signals}}>
          <span style={{background: 'rgba(6,20,22,0.8)', borderRadius: 14, padding: '8px 18px', color: '#fff3a0', fontWeight: 800, fontSize: 28}}>señales moleculares (representación ilustrada)</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** 59–70 s: transición elegante a la vista científica (velo, rejilla y destello). */
export const SciTransition: React.FC<{k: number; lesionFlash: number}> = ({k, lesionFlash}) => {
  const {width, height} = useVideoConfig();
  if (k <= 0.01 && lesionFlash <= 0.01) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'rgba(8,30,40,0.38)', opacity: k}} />
      <svg width={width} height={height} style={{position: 'absolute', opacity: k * 0.5}}>
        {Array.from({length: 28}, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={height} stroke="#7ff3ff" strokeOpacity={0.12} />
        ))}
        {Array.from({length: 49}, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={width} y2={i * 40} stroke="#7ff3ff" strokeOpacity={0.12} />
        ))}
      </svg>
      <AbsoluteFill style={{background: '#e9fbff', opacity: lesionFlash}} />
    </AbsoluteFill>
  );
};
