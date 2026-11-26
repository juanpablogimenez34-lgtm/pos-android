// ESQUEMAS CIENTÍFICOS ANIMADOS (ilustrados, en espacio de pantalla):
// · Sistema visual: vista cenital de la cabeza, cada ojo con su campo de visión independiente → visión binocular.
// · Lengua balística: hueso hioides (proceso entogloso), músculo acelerador y fundas de colágeno que almacenan
//   energía elástica; liberación tipo catapulta.
// · Piel: capas (epidermis, xantóforos, iridóforos con red de nanocristales de guanina, iridóforos profundos,
//   melanóforos). La separación de la red decide qué color se refleja (Teyssier et al., 2015).
import React from 'react';
import {clamp, lerp, mixColor, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';

const f1 = (n: number) => Math.round(n * 10) / 10;
const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode; op?: number}> = ({x, y, s = 30, c = '#f6f2e4', w = 700, a = 'start', children, op = 1}) => (
  <text x={x} y={y} fontFamily={FONT_FAMILY} fontWeight={w} fontSize={s} fill={c} textAnchor={a} opacity={op} style={{paintOrder: 'stroke'}} stroke="#081410" strokeWidth={5} strokeLinejoin="round">
    {children}
  </text>
);
export const Card: React.FC<{x: number; y: number; w: number; h: number; k: number; title: string; children: React.ReactNode}> = ({x, y, w, h, k, title, children}) => {
  if (k <= 0.01) return null;
  const e = smoothstep(0, 1, k);
  return (
    <g opacity={e} transform={`translate(0 ${f1((1 - e) * 40)})`}>
      <rect x={x} y={y} width={w} height={h} rx={34} fill="#06140f" opacity={0.86} stroke="#7ee0b0" strokeOpacity={0.5} strokeWidth={2.5} />
      <T x={x + w / 2} y={y + 62} s={40} w={900} a="middle" c="#ffd23f">{title}</T>
      {children}
    </g>
  );
};

// ---------------------------------------------------------------- VISIÓN
/** yawL / yawR: dirección de cada ojo (rad, 0 = adelante); lock 0..1 = ambos ojos sobre la presa. */
export const VisionDiagram: React.FC<{cx: number; cy: number; t: number; yawL: number; yawR: number; lock: number; prey: {x: number; y: number}}> = ({cx, cy, yawL, yawR, lock, prey}) => {
  const cone = (ex: number, ey: number, a: number, col: string) => {
    const r = 430;
    const w = 0.42;
    return <path d={`M${ex} ${ey}L${f1(ex + Math.cos(a - w) * r)} ${f1(ey + Math.sin(a - w) * r)}A${r} ${r} 0 0 1 ${f1(ex + Math.cos(a + w) * r)} ${f1(ey + Math.sin(a + w) * r)}Z`} fill={col} opacity={0.28} stroke={col} strokeWidth={2} />;
  };
  // cabeza vista desde arriba, hocico hacia arriba (−y)
  const eyeL = {x: cx - 52, y: cy + 10};
  const eyeR = {x: cx + 52, y: cy + 10};
  const aim = (e: {x: number; y: number}) => Math.atan2(prey.y - e.y, prey.x - e.x);
  const aL = lerp(-Math.PI / 2 - 1.0 + yawL, aim(eyeL), lock);
  const aR = lerp(-Math.PI / 2 + 1.0 + yawR, aim(eyeR), lock);
  return (
    <g>
      {cone(eyeL.x, eyeL.y, aL, '#5ad8ff')}
      {cone(eyeR.x, eyeR.y, aR, '#ffd23f')}
      {lock > 0.5 && <path d={`M${eyeL.x} ${eyeL.y}L${prey.x} ${prey.y}L${eyeR.x} ${eyeR.y}`} stroke="#ffffff" strokeWidth={2.5} strokeDasharray="10 8" fill="none" opacity={(lock - 0.5) * 2} />}
      {/* cabeza: casco, cuerpo y cola desde arriba */}
      <path d={`M${cx} ${cy - 130}C${cx + 40} ${cy - 110} ${cx + 66} ${cy - 30} ${cx + 60} ${cy + 40}C${cx + 56} ${cy + 120} ${cx + 40} ${cy + 260} ${cx} ${cy + 330}C${cx - 40} ${cy + 260} ${cx - 56} ${cy + 120} ${cx - 60} ${cy + 40}C${cx - 66} ${cy - 30} ${cx - 40} ${cy - 110} ${cx} ${cy - 130}Z`} fill="#3a9e6a" stroke="#0f2a18" strokeWidth={3} />
      <path d={`M${cx} ${cy - 120}L${cx} ${cy + 320}`} stroke="#9ad18a" strokeWidth={4} opacity={0.6} />
      {[eyeL, eyeR].map((e, i) => {
        const a = i === 0 ? aL : aR;
        return (
          <g key={i}>
            <circle cx={e.x} cy={e.y} r={26} fill="#4ab07a" stroke="#0f2a18" strokeWidth={3} />
            <circle cx={f1(e.x + Math.cos(a) * 15)} cy={f1(e.y + Math.sin(a) * 15)} r={8} fill="#d8b23a" stroke="#1a1208" strokeWidth={1.5} />
            <circle cx={f1(e.x + Math.cos(a) * 17)} cy={f1(e.y + Math.sin(a) * 17)} r={4} fill="#050403" />
          </g>
        );
      })}
      <circle cx={prey.x} cy={prey.y} r={10} fill="#3a2a1a" stroke="#fff" strokeWidth={2} />
    </g>
  );
};

// ---------------------------------------------------------------- LENGUA
/** k: 0 cargada (fundas comprimidas) · 0..0.5 el músculo acelerador se contrae · 0.5..1 disparo. */
export const TongueDiagram: React.FC<{x: number; y: number; k: number; t: number}> = ({x, y, k, t}) => {
  const contract = smoothstep(0, 0.5, k); // el músculo se estrecha y se alarga
  const fire = smoothstep(0.55, 0.75, k);
  const back = smoothstep(0.85, 1, k);
  const shoot = fire * (1 - back);
  const boneL = 220;
  const sheathX = x + 40 + shoot * 520;
  const mus = (i: number) => {
    const u = i / 9;
    const xx = sheathX + u * 170 * (1 + contract * 0.15);
    const r = lerp(46, 36, contract) * (1 - u * 0.15);
    return <ellipse key={i} cx={f1(xx)} cy={y} rx={9} ry={f1(r)} fill={mixColor('#c8404a', '#ff7a6a', contract)} stroke="#5a1018" strokeWidth={1.4} />;
  };
  // fundas de colágeno: espirales que se estiran (energía almacenada) y se relajan al disparar
  const spiral = (r: number, off: number) => {
    const pts: string[] = [];
    const len = 190 * (1 + contract * 0.12) + shoot * 40;
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      const ang = u * Math.PI * 2 * lerp(9, 5, contract) + off + t * 0.0;
      pts.push(`${i ? 'L' : 'M'}${f1(sheathX - 10 + u * len)} ${f1(y + Math.sin(ang) * r)}`);
    }
    return pts.join('');
  };
  return (
    <g>
      {/* silueta de la cabeza (corte) */}
      <path d={`M${x - 340} ${y - 160}C${x - 200} ${y - 240} ${x - 20} ${y - 200} ${x + 120} ${y - 120}C${x + 220} ${y - 70} ${x + 260} ${y - 20} ${x + 260} ${y + 10}C${x + 180} ${y + 60} ${x - 60} ${y + 120} ${x - 340} ${y + 120}Z`} fill="#2f7a52" opacity={0.35} stroke="#7ee0b0" strokeWidth={2} />
      {/* hueso entogloso del hioides */}
      <rect x={x - boneL + 40} y={y - 9} width={boneL + 180} height={18} rx={9} fill="#efe6cc" stroke="#7a6a48" strokeWidth={2} />
      <path d={spiral(30, 0)} stroke="#ffe4a0" strokeWidth={2} fill="none" opacity={0.85} />
      <path d={spiral(22, 1.7)} stroke="#ffd070" strokeWidth={1.6} fill="none" opacity={0.75} />
      {Array.from({length: 10}, (_, i) => mus(i))}
      {/* punta de la lengua (maza) */}
      <ellipse cx={f1(sheathX + 200 * (1 + contract * 0.15) + 24)} cy={y} rx={34} ry={30} fill="#e07888" stroke="#5a1c28" strokeWidth={2} />
      {/* flecha de energía */}
      <path d={`M${x - 40} ${y + 90}L${f1(x + 120 + contract * 160)} ${y + 90}`} stroke="#ffd23f" strokeWidth={8} strokeLinecap="round" opacity={contract * (1 - fire)} />
      <path d={`M${f1(x + 130 + contract * 160)} ${y + 74}L${f1(x + 158 + contract * 160)} ${y + 90}L${f1(x + 130 + contract * 160)} ${y + 106}Z`} fill="#ffd23f" opacity={contract * (1 - fire)} />
      <T x={x - 300} y={y + 190} s={30} c="#efe6cc">hueso (proceso entogloso)</T>
      <T x={x + 40} y={y - 70} s={30} c="#ff8a7a" op={1 - shoot * 0.6}>músculo acelerador</T>
      <T x={x - 300} y={y + 236} s={30} c="#ffe4a0">fundas elásticas de colágeno</T>
      <T x={x - 300} y={y + 290} s={34} w={900} c="#ffd23f" op={clamp(contract * 2 - 0.4) * (1 - fire)}>energía elástica almacenada</T>
      <T x={x - 300} y={y + 290} s={34} w={900} c="#5ad8ff" op={fire}>¡liberación tipo catapulta!</T>
    </g>
  );
};

// ---------------------------------------------------------------- PIEL
/** spacing: 0 red compacta (relajado → azul) · 1 red expandida (excitado → amarillo/naranja/rojo). */
export const reflectColor = (spacing: number) =>
  spacing < 0.33 ? mixColor('#2f7fe0', '#22b0a0', spacing / 0.33) : spacing < 0.66 ? mixColor('#22b0a0', '#f2c02a', (spacing - 0.33) / 0.33) : mixColor('#f2c02a', '#e2402a', (spacing - 0.66) / 0.34);
export const SkinDiagram: React.FC<{x: number; y: number; w: number; spacing: number; t: number; zoom: number}> = ({x, y, w, spacing, t, zoom}) => {
  const layer = (yy: number, h: number, fill: string, label: string, lc: string) => (
    <g>
      <rect x={x} y={yy} width={w} height={h} fill={fill} />
      <T x={x + w - 14} y={yy + h / 2 + 10} s={27} c={lc} a="end">{label}</T>
    </g>
  );
  const y0 = y;
  const gap = lerp(12, 22, spacing);
  const crystals: React.ReactNode[] = [];
  const cols = Math.floor((w * 0.55 - 20) / gap);
  const rows = Math.floor(150 / gap);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cx = x + 14 + c * gap + (r % 2) * gap * 0.5;
      const cy = y0 + 150 + 10 + r * gap * 0.87;
      if (cx > x + w - 8) continue;
      crystals.push(<rect key={`${r}-${c}`} x={f1(cx - 4)} y={f1(cy - 3)} width={8} height={6} rx={1.5} fill="#dff4ff" stroke="#7aa8c8" strokeWidth={0.8} opacity={0.9} />);
    }
  const refl = reflectColor(spacing);
  const ray = (x1: number) => (
    <g>
      <path d={`M${x1 - 120} ${y0 - 160}L${x1} ${y0 + 220}`} stroke="#ffffff" strokeWidth={8} opacity={0.85} />
      <path d={`M${x1} ${y0 + 220}L${x1 + 120} ${y0 - 160}`} stroke={refl} strokeWidth={12} opacity={0.95} />
      <path d={`M${x1 + 110} ${y0 - 135}L${x1 + 124} ${y0 - 168}L${x1 + 96} ${y0 - 150}Z`} fill={refl} />
    </g>
  );
  void zoom;
  return (
    <g>
      {layer(y0, 60, '#e8e0c8', 'epidermis', '#f6f2e4')}
      {layer(y0 + 60, 90, '#f2d040', 'xantóforos (pigmento amarillo)', '#ffe27a')}
      {layer(y0 + 150, 170, '#3a5a7a', 'iridóforos: red de nanocristales', '#9ad8ff')}
      <g>{crystals}</g>
      {layer(y0 + 320, 90, '#5a7a8a', 'iridóforos profundos', '#bcd8e8')}
      {layer(y0 + 410, 80, '#2a1e16', 'melanóforos', '#c8b8a0')}
      {Array.from({length: 7}, (_, i) => (
        <ellipse key={i} cx={x + 50 + i * ((w * 0.5 - 100) / 6)} cy={y0 + 105} rx={34} ry={22} fill="#e8b020" stroke="#a87810" strokeWidth={2} opacity={0.85} />
      ))}
      {ray(x + w * 0.32)}
      <rect x={x} y={y0} width={w} height={490} fill="none" stroke="#7ee0b0" strokeWidth={3} rx={8} />
      <T x={x + w / 2} y={y0 + 560} s={36} w={900} a="middle" c={refl}>{spacing < 0.4 ? 'red compacta → refleja azul' : spacing < 0.7 ? 'red intermedia → verde-amarillo' : 'red expandida → naranja y rojo'}</T>
      <T x={x + w / 2} y={y0 + 604} s={26} a="middle" c="#c8e8d8">+ pigmento amarillo = verde (relajado)</T>
      <circle cx={f1(x + w * 0.32 + Math.sin(t * 2) * 2)} cy={y0 + 220} r={6} fill="#ffffff" />
    </g>
  );
};
