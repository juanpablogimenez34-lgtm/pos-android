// ESCENA 4 (45–60 s) · LA EXPANSIÓN (vista microscópica esquemática): las madejas de filamento
// proteico se despliegan en fibras larguísimas y las vesículas de mucina se hinchan y estallan; ambos
// componentes forman una red que retiene agua y ocupa un volumen enorme.
import {clamp, hash1} from '../../../engine/math';
import {SceneOut} from '../../../studio2';
import {Callout, seg, Wash, win} from '../components/common';
import {EV} from '../data/timeline';

const f1 = (n: number) => n.toFixed(1);

const SKEINS = Array.from({length: 11}, (_, i) => ({x: 120 + hash1(i * 3.1) * 840, y: 380 + hash1(i * 5.3) * 1180, a: hash1(i * 7.7) * Math.PI * 2, d: hash1(i * 2.3) * 2.4}));
const VES = Array.from({length: 22}, (_, i) => ({x: 80 + hash1(i * 9.1) * 920, y: 320 + hash1(i * 4.7) * 1300, d: hash1(i * 6.1) * 2.5, r: 16 + hash1(i) * 12}));

export function scene04(t: number): SceneOut {
  const z = 1 + 0.12 * seg(t, 45, 60);
  const net = seg(t, 54, 58.5);
  const svg = (
    <g transform={`translate(540 960) scale(${f1(z)}) translate(-540 -960)`}>
      <defs>
        <radialGradient id="microBg" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0" stopColor="#1c5a5e" />
          <stop offset="0.7" stopColor="#0a2a30" />
          <stop offset="1" stopColor="#03100f" />
        </radialGradient>
        <filter id="microSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      <rect x={-200} y={-200} width={1480} height={2320} fill="url(#microBg)" />
      {/* partículas del agua */}
      {Array.from({length: 60}, (_, i) => (
        <circle key={`d${i}`} cx={(hash1(i * 3) * 1080 + Math.sin(t * 0.4 + i) * 20) % 1080} cy={(hash1(i * 7) * 1920 + t * 8) % 1920} r={1 + hash1(i) * 2} fill="#bfeee4" opacity={0.3} />
      ))}
      {/* red final (une fibras y mucinas) */}
      {net > 0.01 &&
        Array.from({length: 70}, (_, i) => {
          const a = SKEINS[i % SKEINS.length];
          const b = VES[(i * 7) % VES.length];
          return <path key={`n${i}`} d={`M${f1(a.x)},${f1(a.y)} Q${f1((a.x + b.x) / 2 + Math.sin(i + t) * 60)},${f1((a.y + b.y) / 2 + Math.cos(i * 1.3 + t) * 60)} ${f1(b.x)},${f1(b.y)}`} stroke="#d8f8ee" strokeWidth={1.2} fill="none" opacity={0.28 * net} />;
        })}
      {/* vesículas de mucina: se hinchan y estallan en un velo */}
      {VES.map((v, i) => {
        const t0 = EV.microBurst + v.d;
        const sw = seg(t, 46 + v.d * 0.5, t0);
        const burst = clamp((t - t0) / 1.6);
        const r = v.r * (1 + 1.3 * sw) * (1 + burst * 1.3);
        return (
          <g key={`v${i}`}>
            {burst < 1 && <circle cx={v.x} cy={v.y} r={r} fill="#e8f8f0" opacity={(0.2 + 0.15 * sw) * (1 - burst)} stroke="#f4fffa" strokeWidth={2} strokeOpacity={0.5 * (1 - burst)} />}
            {burst > 0 && <circle cx={v.x} cy={v.y} r={r * 1.1} fill="#cfeee4" opacity={0.06 * Math.min(1, burst * 3)} filter="url(#microSoft)" />}
            {burst > 0 && Array.from({length: 6}, (_, k) => {
              const a = (k / 6) * Math.PI * 2 + i;
              return <path key={k} d={`M${f1(v.x)},${f1(v.y)} q${f1(Math.cos(a + 0.6) * r * 0.6)},${f1(Math.sin(a + 0.6) * r * 0.6)} ${f1(Math.cos(a) * r * 1.3)},${f1(Math.sin(a) * r * 1.3)}`} stroke="#e8fbf4" strokeWidth={1} fill="none" opacity={0.4 * Math.min(1, burst * 2)} />;
            })}
          </g>
        );
      })}
      {/* madejas: espiral que se deshace mientras crece una fibra ondulada */}
      {SKEINS.map((s, i) => {
        const u = seg(t, EV.microUnravel + s.d, EV.microUnravel + s.d + 4.5);
        let coil = '';
        const loops = 9 * (1 - u) + 0.3;
        for (let k = 0; k <= 60; k++) {
          const q = k / 60;
          const ang = q * Math.PI * 2 * loops;
          coil += `${k ? 'L' : 'M'}${f1(s.x + Math.cos(ang) * 30 + q * 0)},${f1(s.y + Math.sin(ang) * 18 + (q - 0.5) * 50 * (1 - u))} `;
        }
        let fib = '';
        const L = u * 1100;
        for (let k = 0; k <= 50; k++) {
          const q = (k / 50) * L;
          const wob = Math.sin(q * 0.025 + i + t * 0.6) * 24 + Math.sin(q * 0.06 + i * 2) * 8;
          const x = s.x + Math.cos(s.a) * q - Math.sin(s.a) * wob;
          const y = s.y + Math.sin(s.a) * q + Math.cos(s.a) * wob;
          fib += `${k ? 'L' : 'M'}${f1(x)},${f1(y)} `;
        }
        return (
          <g key={`s${i}`}>
            <ellipse cx={s.x} cy={s.y} rx={44} ry={34} fill="#f0dcc8" opacity={0.35 * (1 - u)} stroke="#c8a888" strokeWidth={2} strokeOpacity={0.6 * (1 - u)} />
            <path d={coil} stroke="#f4e6d4" strokeWidth={2.4} fill="none" opacity={0.9} />
            {u > 0.01 && <path d={fib} stroke="#f8fff8" strokeWidth={2} fill="none" opacity={0.85} />}
            {u > 0.01 && <path d={fib} stroke="#bff7ea" strokeWidth={6} fill="none" opacity={0.12} />}
          </g>
        );
      })}
      {/* ocular del microscopio */}
      <path d="M-200,-200 L1280,-200 L1280,2120 L-200,2120Z M540,330 a560,640 0 1,0 0.1,0Z" fill="#010708" fillRule="evenodd" opacity={0.85} />
    </g>
  );
  return {
    svg,
    overlay: (
      <>
        <Callout k={win(t, 46.0, 51.5)} x={SKEINS[2].x} y={SKEINS[2].y} tx={Math.min(760, SKEINS[2].x + 120)} ty={SKEINS[2].y - 150} text="madeja de filamento" />
        <Callout k={win(t, 50.5, 55.5)} x={VES[3].x} y={VES[3].y} tx={Math.min(700, VES[3].x + 100)} ty={VES[3].y + 160} text="vesículas de mucina" />
        <Callout k={win(t, 55.5, 59.6)} x={540} y={960} tx={200} ty={760} text="red de filamentos y mucinas" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', color: '#9fd8cc', fontSize: 24, fontWeight: 700, letterSpacing: 2, opacity: 0.8 * win(t, 45.3, 59.6)}}>ILUSTRACIÓN ESQUEMÁTICA · ESCALA MICROSCÓPICA</div>
        <Wash k={(1 - seg(t, 45, 45.5)) * 0.9 + seg(t, 59.5, 60) * 0.9} color="#010708" />
      </>
    ),
  };
}
