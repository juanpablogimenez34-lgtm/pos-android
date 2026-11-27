// ALETA DORSAL ARTICULADA del pez remo: ~140 radios desde la cabeza hasta la cola, unidos por una
// membrana roja. La ondulación se PROPAGA de la cabeza hacia la cola (fase = 2π·n·u − ω·t), como en la
// natación por ondulación de la aleta dorsal; cada radio se inclina y varía de longitud con su fase,
// con un poco de variación natural por radio. Los primeros radios, más largos, forman la cresta.
// Todo se dibuja con 3 trayectos SVG (membrana, radios, puntas) para que sea eficiente.
import React from 'react';
import {hash1} from '../../../engine/math';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export type Pt = {x: number; y: number};

export type FinParams = {
  t: number;
  waves: number; // número de ondas a lo largo de la aleta
  speed: number; // velocidad angular de la onda (rad/s)
  amp: number; // inclinación máxima de los radios (rad)
  glow: number; // brillo rojizo
  dark: number; // oscurecimiento por profundidad (0…1)
};

/** `base` = puntos del borde dorsal (cabeza → cola), `nrm` = normales hacia arriba, `scale` = factor por punto. */
export const OarfishFin: React.FC<{base: Pt[]; nrm: Pt[]; scale: number[]; p: FinParams; uid: string; crest: number}> = ({base, nrm, scale, p, uid, crest}) => {
  const n = base.length;
  const tips: Pt[] = [];
  let rays = '';
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const ph = 2 * Math.PI * p.waves * u - p.speed * p.t + hash1(i * 1.7) * 0.25;
    const crestK = Math.max(0, 1 - i / crest);
    // radios del cuerpo inclinados hacia atrás; la cresta, casi erguida y con balanceo propio
    const tilt = crestK > 0 ? 0.1 - 0.25 * (i / crest) + Math.sin(p.t * 1.3 + i * 0.8) * 0.12 : Math.sin(ph) * p.amp - 0.35;
    const len = (crestK > 0 ? (40 + 150 * Math.pow(crestK, 1.3)) * (0.7 + 0.5 * hash1(i * 9.7)) : 32 * (1 - 0.75 * Math.pow(u, 1.5)) * (0.72 + 0.28 * Math.cos(ph))) * (0.92 + 0.16 * hash1(i * 3.1)) * scale[i];
    // dirección: normal girada por la inclinación (hacia la cola = +x local negativo)
    const c = Math.cos(tilt);
    const s = Math.sin(tilt);
    const dx = nrm[i].x * c - nrm[i].y * s;
    const dy = nrm[i].x * s + nrm[i].y * c;
    const tip = {x: base[i].x + dx * len, y: base[i].y + dy * len};
    tips.push(tip);
    rays += `M${f1(base[i].x)},${f1(base[i].y)} L${f1(tip.x)},${f1(tip.y)} `;
  }
  const membrane = `M${f1(base[crest].x)},${f1(base[crest].y)} ` + tips.slice(crest).map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ') + ' ' + base.slice(crest).reverse().map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ') + 'Z';
  const crestMem = `M${f1(base[0].x)},${f1(base[0].y)} ` + tips.slice(0, crest + 1).map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ') + ' ' + base.slice(0, crest + 1).reverse().map((q) => `L${f1(q.x)},${f1(q.y)}`).join(' ') + 'Z';
  const crestTips = tips.slice(0, crest);
  return (
    <g>
      <defs>
        <linearGradient id={`fin-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={`rgba(${Math.round(150 - 90 * p.dark)},${Math.round(30 - 15 * p.dark)},${Math.round(45 - 20 * p.dark)},0.95)`} />
          <stop offset="1" stopColor={`rgba(${Math.round(232 - 140 * p.dark)},${Math.round(70 - 40 * p.dark)},${Math.round(82 - 40 * p.dark)},0.75)`} />
        </linearGradient>
      </defs>
      <path d={membrane} fill={`url(#fin-${uid})`} />
      <path d={rays} stroke={`rgba(${Math.round(120 - 70 * p.dark)},${Math.round(16)},${Math.round(30)},0.9)`} strokeWidth={2.2} strokeLinecap="round" />
      <path d={tips.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke={`rgba(255,${Math.round(120 + 60 * p.glow)},${Math.round(120 + 40 * p.glow)},${(0.35 + 0.4 * p.glow) * (1 - 0.6 * p.dark)})`} strokeWidth={2} fill="none" />
      {/* cresta: membrana tenue y radios largos e independientes */}
      <path d={crestMem} fill={`url(#fin-${uid})`} opacity={0.35} />
      {crestTips.map((q, i) => (
        <path key={`cr${i}`} d={`M${f1(base[i].x)},${f1(base[i].y)} Q${f1((base[i].x + q.x) / 2 + 6)},${f1((base[i].y + q.y) / 2)} ${f1(q.x)},${f1(q.y)}`} stroke={`rgba(${Math.round(214 - 120 * p.dark)},56,71,0.95)`} strokeWidth={4 * scale[i]} fill="none" strokeLinecap="round" />
      ))}
      {crestTips.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={3.5 * scale[i]} fill="#ff5a6a" opacity={(0.7 + 0.3 * p.glow) * (1 - 0.5 * p.dark)} />
      ))}
    </g>
  );
};
