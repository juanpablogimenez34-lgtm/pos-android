// Pulga de agua (género Daphnia): caparazón translúcido con espina caudal, cabeza con ojo
// compuesto oscuro, segundas antenas ramificadas (remos) e intestino y corazón visibles.
// Se dibuja en el plano de la imagen (es diminuta) en su posición 3D proyectada.
import {f1, Item} from '../Animation/render';
import {project, V3, View} from '../Animation/proj';

export type DaphniaPose = {pos: V3; angle: number; stroke: number; size: number; opacity: number};

export function daphniaItems(view: View, d: DaphniaPose, uid: string): Item[] {
  const q = project(view, d.pos);
  const s = d.size;
  // golpe de antenas: 0 = arriba (preparado) → 1 = abajo (impulso)
  const a = -0.9 + 1.5 * d.stroke;
  const ant = (sg: number) => {
    const bx = 3 * s;
    const by = -4.5 * s;
    const ex = bx + Math.cos(a) * 9 * s;
    const ey = by + Math.sin(a) * 9 * s * sg;
    const br = (k: number) => `M${f1(ex)},${f1(ey)} l${f1(Math.cos(a + 0.5 * k) * 5 * s)},${f1(Math.sin(a + 0.5 * k) * 5 * s * sg)}`;
    return (
      <g key={sg}>
        <path d={`M${f1(bx)},${f1(by)} L${f1(ex)},${f1(ey)}`} stroke="#c9b48a" strokeWidth={0.9 * s} strokeLinecap="round" />
        <path d={br(1) + br(-1) + br(0)} stroke="#e6d7b0" strokeWidth={0.5 * s} strokeLinecap="round" />
      </g>
    );
  };
  return [
    {
      z: q.z,
      key: uid,
      node: (
        <g key={uid} transform={`translate(${f1(q.x)} ${f1(q.y)}) rotate(${((d.angle * 180) / Math.PI).toFixed(1)})`} opacity={d.opacity}>
          {ant(-1)}
          {/* caparazón translúcido con espina caudal */}
          <path d={`M${f1(5 * s)},${f1(-4 * s)} C${f1(9 * s)},${f1(-2 * s)} ${f1(8 * s)},${f1(5 * s)} ${f1(2 * s)},${f1(7 * s)} C${f1(-4 * s)},${f1(8.5 * s)} ${f1(-8 * s)},${f1(4 * s)} ${f1(-9 * s)},${f1(0)} L${f1(-15 * s)},${f1(-1.5 * s)} L${f1(-8 * s)},${f1(-2.5 * s)} C${f1(-6 * s)},${f1(-6 * s)} ${f1(0)},${f1(-7 * s)} ${f1(5 * s)},${f1(-4 * s)}Z`} fill="#e8dcbc" fillOpacity={0.42} stroke="#b9a678" strokeWidth={0.5 * s} />
          {/* intestino, corazón y huevos en la cámara incubatriz */}
          <path d={`M${f1(5 * s)},${f1(-1 * s)} Q${f1(0)},${f1(3 * s)} ${f1(-7 * s)},${f1(1 * s)}`} stroke="#7a8a3a" strokeWidth={1.4 * s} fill="none" opacity={0.75} />
          <circle cx={f1(1 * s)} cy={f1(-3.5 * s)} r={1.2 * s} fill="#d98a6a" opacity={0.7} />
          <circle cx={f1(-3 * s)} cy={f1(-3.5 * s)} r={1.1 * s} fill="#9aa86a" opacity={0.6} />
          <circle cx={f1(-5 * s)} cy={f1(-2.5 * s)} r={1.1 * s} fill="#9aa86a" opacity={0.6} />
          {/* cabeza con ojo compuesto */}
          <ellipse cx={f1(6.5 * s)} cy={f1(-2.8 * s)} rx={3.2 * s} ry={2.6 * s} fill="#e3d4ae" fillOpacity={0.55} stroke="#b9a678" strokeWidth={0.4 * s} />
          <circle cx={f1(7.6 * s)} cy={f1(-2.6 * s)} r={1.5 * s} fill="#141210" />
          {ant(1)}
        </g>
      ),
    },
  ];
}
