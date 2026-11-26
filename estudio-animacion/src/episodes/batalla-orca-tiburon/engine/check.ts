// Verificación numérica de la coreografía: separación mínima entre los cuerpos (líneas medias con su grosor).
import {orcaPoint} from '../../orca-reina-oceanos/character/Orca';
import {sharkPoint} from '../../tiburon-blanco/character/WhiteShark';
import {orcaAt, sharkAt} from './choreo';

const rO = (u: number) => 700 * (u < 0.1 ? 0.06 + u * 0.4 : 0.11 * (1 - Math.max(0, u - 0.45) * 1.4));
const rS = (u: number) => 500 * (u < 0.1 ? 0.04 + u * 0.6 : 0.12 * (1 - Math.max(0, u - 0.45) * 1.4));
const rows: string[] = [];
let worst = 1e9;
for (let t = 0; t < 140; t += 0.1) {
  const o = orcaAt(t);
  const s = sharkAt(t);
  let m = 1e9;
  for (let i = 0; i <= 20; i++) {
    const a = orcaPoint(o, i / 20, 0);
    for (let j = 0; j <= 20; j++) {
      const b = sharkPoint(s, j / 20, 0);
      m = Math.min(m, Math.hypot(a.x - b.x, a.y - b.y) - rO(i / 20) - rS(j / 20));
    }
  }
  if (!(t > 109 && t < 112)) worst = Math.min(worst, m);
  if (m < 60) rows.push(`${t.toFixed(1)}s holgura ${m.toFixed(0)} px`);
  if (t > 107.9 && t < 113.2 && Math.abs((t * 10) % 5) < 0.01) console.log('contacto', t.toFixed(1), m.toFixed(0));
}
console.log(rows.join('\n'));
console.log('holgura mínima fuera del contacto:', worst.toFixed(0), 'px');
