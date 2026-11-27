// PUESTA EN ESCENA DE LA BATALLA (tiempo GLOBAL 0–140 s). Un único escenario (aguas costeras sudafricanas
// ilustradas: rocas, arrecifes de algas, arena, bancos de peces, superficie, rayos y partículas) con la orca y el
// tiburón de la coreografía, cámara continua por tramos con fundidos de encuadre, luz que evoluciona, estelas y
// turbulencias, y los rótulos de cada variante (episodios con retos al espectador / documental completo).
import React from 'react';
import {clamp, lerp, mixColor, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {cam, Cam, SceneOut} from '../../../studio2';
import {ClickFlash, ClickWaves} from '../../ep23-cachalote/environment/Ocean';
import {Orca, orcaPoint, OrcaPose} from '../../orca-reina-oceanos/character/Orca';
import {Blow, Bubbles, Sea, Splash} from '../../orca-reina-oceanos/environment/Sea';
import {sharkPoint, SharkPose, WhiteShark} from '../../tiburon-blanco/character/WhiteShark';
import {isSlow, orcaAt, sharkAt, TAU_CONTACT, tauOf} from '../engine/choreo';
import {Variant} from '../engine/timeline';
import {Card, Tag, Txt, win} from '../components/common';

const f1 = (n: number) => Math.round(n * 10) / 10;
const ease = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), k)), roll: lerp(a.roll, b.roll, k)});

// ------------------------------------------------------------------ cámara por tramos (fundidos de encuadre)
type Seg = {a: number; blend: number; f: (t: number, o: OrcaPose, s: SharkPose) => Cam};
const mid = (o: OrcaPose, s: SharkPose) => {
  const a = orcaPoint(o, 0.35, 0);
  const b = sharkPoint(s, 0.35, 0);
  return {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y)};
};
const fitZoom = (d: number, lo = 0.36, hi = 0.95) => clamp(760 / (d + 700), lo, hi);
const SEGS: Seg[] = [
  {a: 0, blend: 0, f: (t, o, s) => {const h = sharkPoint(s, 0.08, 0); return cam(h.x + 60, lerp(860, 840, t / 3), lerp(1.45, 1.0, ease(clamp(t / 3))));}},
  {a: 3, blend: 1.0, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, fitZoom(m.d, 0.45));}},
  {a: 5.2, blend: 0.8, f: (t, o, s) => {const h = sharkPoint(s, 0.07, -0.2); return cam(h.x - 40, h.y, 1.75);}},
  {a: 8.1, blend: 0.8, f: (t, o) => {const h = orcaPoint(o, 0.06, -0.2); return cam(h.x + 40 * Math.sign(o.facing), h.y, 1.6);}},
  {a: 10.6, blend: 0.7, f: (t, o) => {const h = orcaPoint(o, 0.2, -0.6); return cam(h.x, h.y, 1.3);}},
  {a: 12.4, blend: 1.0, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, 820, 0.42);}},
  {a: 22, blend: 1.4, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, fitZoom(m.d, 0.45, 0.8));}},
  {a: 30, blend: 1.2, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, lerp(0.8, 0.95, smoothstep(30, 35, t)));}},
  {a: 35, blend: 0.6, f: (t, o, s) => {const h = sharkPoint(s, 0.2, 0); return cam(h.x - 120 * Math.sign(s.facing), h.y, 0.85);}},
  {a: 38, blend: 1.2, f: (t, o, s) => {const h = sharkPoint(s, 0.3, 0); return cam(lerp(h.x, orcaPoint(o, 0.3, 0).x, 0.25), h.y - 60, 0.58);}},
  {a: 46.6, blend: 0.8, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, 0.5);}},
  {a: 52, blend: 0, f: (t, o) => {const h = orcaPoint(o, 0.3, 0); return {...cam(h.x - 60, h.y - 120, 0.72), roll: 0.06};}},
  {a: 57, blend: 0, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, fitZoom(m.d, 0.5, 0.7));}},
  {a: 65, blend: 1.2, f: (t, o) => {const h = orcaPoint(o, 0.3, 0); return cam(h.x, h.y, 0.66);}},
  {a: 70, blend: 0.8, f: (t, o) => {const h = orcaPoint(o, 0.15, 0); return {...cam(h.x, h.y, 1.05), roll: lerp(-0.12, 0, smoothstep(70, 73, t))};}},
  {a: 73.2, blend: 1.4, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, fitZoom(m.d, 0.5, 0.7));}},
  {a: 92, blend: 0, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, Math.min(m.y, 880), 0.36);}},
  {a: 100, blend: 1.4, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, lerp(0.62, 0.82, smoothstep(100, 105, t)));}},
  {a: 105, blend: 0.6, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, lerp(0.82, 1.0, smoothstep(105, 109.4, t)));}},
  {a: 109.5, blend: 0.3, f: (t, o) => {const h = orcaPoint(o, 0.02, 0.8); return cam(h.x - 60, h.y - 40, 1.25);}},
  {a: 111.6, blend: 0.8, f: (t, o, s) => {const m = mid(o, s); return cam(m.x, m.y, fitZoom(m.d, 0.5, 0.8));}},
  {a: 114.5, blend: 1.0, f: (t, o, s) => {const h = sharkPoint(s, 0.35, 0); return cam(lerp(h.x, orcaPoint(o, 0.3, 0).x, 0.3), h.y + 60, 0.62);}},
  {a: 119.5, blend: 1.6, f: (t, o) => {const h = orcaPoint(o, 0.35, 0); return cam(h.x, h.y, 0.8);}},
  {a: 124, blend: 1.4, f: (t, o) => {const h = orcaPoint(o, 0.3, 0); return cam(h.x, Math.max(260, h.y), 0.72);}},
  {a: 132.5, blend: 1.2, f: (t, o) => {const h = orcaPoint(o, 0.3, 0); return cam(h.x - 200, 240, 0.55);}},
];
export function battleCam(t: number, o: OrcaPose, s: SharkPose): Cam {
  let i = 0;
  while (i < SEGS.length - 1 && t >= SEGS[i + 1].a) i++;
  const S = SEGS[i];
  const c = S.f(t, o, s);
  const k = S.blend > 0 && i > 0 ? clamp((t - S.a) / S.blend) : 1;
  const out = k < 1 ? lerpCam(SEGS[i - 1].f(t, o, s), c, ease(k)) : c;
  return {...out, x: out.x + Math.sin(t * 0.37) * 6, y: out.y + Math.sin(t * 0.29 + 1) * 5};
}

// ------------------------------------------------------------------ efectos
/** Branquias: movimiento sutil de las hendiduras (se dibuja sobre el tiburón). */
const Gills: React.FC<{s: SharkPose; t: number}> = ({s, t}) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = sharkPoint(s, 0.172 + i * 0.017, 0.3);
      const b = sharkPoint(s, 0.168 + i * 0.017, -0.45);
      const open = 0.5 + 0.5 * Math.sin(t * 3.2 - i * 0.4);
      const nx = (b.y - a.y) * 0.08 * open;
      return <path key={i} d={`M${f1(a.x)} ${f1(a.y)}Q${f1((a.x + b.x) / 2 - nx * 3)} ${f1((a.y + b.y) / 2)} ${f1(b.x)} ${f1(b.y)}`} stroke="#5a2a30" strokeWidth={1.4 + open * 1.6} fill="none" opacity={0.45} />;
    })}
  </g>
);
/** Estela: burbujas y remolinos detrás de la cola cuando el animal acelera. */
const Wake: React.FC<{tail: {x: number; y: number}; t: number; k: number; seed: number}> = ({tail, t, k, seed}) =>
  k > 0.05 ? (
    <g>
      <Bubbles t={t} src={tail} n={Math.round(6 + k * 10)} seed={seed} k={k} s={1.2} />
      {[0, 1, 2].map((i) => {
        const ph = ((t * 1.4 + i / 3 + seed * 0.1) % 1);
        return <ellipse key={i} cx={tail.x} cy={tail.y} rx={30 + ph * 140} ry={12 + ph * 50} fill="none" stroke="#dff6ff" strokeWidth={2.5} opacity={0.35 * (1 - ph) * k} />;
      })}
    </g>
  ) : null;
/** Siluetas de la próxima batalla (león y tigre). */
const BigCats: React.FC<{k: number; t: number}> = ({k, t}) => {
  if (k <= 0.01) return null;
  const e = ease(clamp(k));
  const breathe = Math.sin(t * 2) * 3;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: e}}>
      <defs>
        <linearGradient id="cat-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8b860" /><stop offset="1" stopColor="#8a5a20" /></linearGradient>
        <linearGradient id="cat-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f09a40" /><stop offset="1" stopColor="#8a3a10" /></linearGradient>
      </defs>
      <rect x={60} y={640} width={960} height={560} rx={36} fill="#06121e" opacity={0.86} stroke="#ffd23f" strokeOpacity={0.45} strokeWidth={2.5} />
      {/* león (melena) */}
      <g transform={`translate(${f1(300 - (1 - e) * 60)} ${960 + breathe}) scale(1.05)`}>
        <path d="M-150 60C-160 0 -120 -40 -60 -44L40 -46C70 -70 110 -96 150 -86C190 -76 206 -40 196 -6C190 14 170 26 150 30L140 70L120 70L118 40L60 44L50 100L30 100L26 46L-60 48L-80 100L-100 100L-104 50C-130 60 -170 90 -200 60C-180 60 -160 64 -150 60Z" fill="url(#cat-l)" />
        <path d="M60 -50C70 -110 150 -130 190 -96C226 -66 220 -10 196 10C210 -30 200 -70 170 -84C130 -100 90 -86 60 -50Z" fill="#6a3a14" />
        <circle cx={178} cy={-56} r={4} fill="#1a0e04" />
      </g>
      {/* tigre (rayas) */}
      <g transform={`translate(${f1(780 + (1 - e) * 60)} ${960 - breathe}) scale(-1.05 1.05)`}>
        <path d="M-150 60C-160 0 -120 -40 -60 -44L40 -46C60 -60 90 -76 130 -70C170 -64 190 -34 184 -6C180 14 164 24 146 28L138 70L118 70L116 40L60 44L50 100L30 100L26 46L-60 48L-80 100L-100 100L-104 50C-130 60 -170 90 -200 60C-180 60 -160 64 -150 60Z" fill="url(#cat-t)" />
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M${-120 + i * 26} -40q8 30 -4 70`} stroke="#1a0a04" strokeWidth={6} fill="none" opacity={0.8} />)}
        <circle cx={160} cy={-40} r={4} fill="#1a0e04" />
      </g>
      <text x={540} y={990} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={900} fontSize={84} fill="#ffd23f" style={{paintOrder: 'stroke'}} stroke="#06121e" strokeWidth={8}>VS</text>
      <text x={300} y={1140} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={34} fill="#ffffff">LEÓN</text>
      <text x={780} y={1140} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={34} fill="#ffffff">TIGRE</text>
      <text x={540} y={1180} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={26} fill="#9fd8f0">o cocodrilo contra anaconda</text>
    </svg>
  );
};

// ------------------------------------------------------------------ tarjetas
/** Comparación a la misma escala con los personajes animados (tamaños elegidos para la simulación). */
const SizeCompare: React.FC<{k: number; t: number}> = ({k, t}) => {
  if (k <= 0.01) return null;
  const px = 120; // px por metro
  const g = smoothstep(0.1, 0.4, k);
  const oPose: OrcaPose = {x: 940, y: 820, angle: 0, scale: (7 * px) / 1000, facing: 1, kind: 'male', t, phase: t * 3, amp: 0.7, flipN: Math.sin(t) * 0.15, under: 1};
  const sPose: SharkPose = {x: 840, y: 1160, angle: 0, scale: (5 * px) / 1000, facing: 1, t, phase: t * 4, amp: 0.8, rim: 0.4};
  return (
    <Card k={k} title="A LA MISMA ESCALA" h={1110}>
      <g opacity={g}>
        <Orca pose={oPose} uid="cmp-o" />
        <WhiteShark uid="cmp-s" p={sPose} />
        <Gills s={sPose} t={t} />
      </g>
      <line x1={100} y1={1300} x2={980} y2={1300} stroke="#4a7a9a" strokeWidth={2} />
      {Array.from({length: 8}, (_, i) => <g key={i}><line x1={100 + i * px} y1={1300} x2={100 + i * px} y2={1314} stroke="#9fd8f0" strokeWidth={2} /><Txt x={100 + i * px} y={1344} s={22} a="middle" c="#9fd8f0">{i} m</Txt></g>)}
      <Txt x={540} y={600} s={40} a="middle" w={900} c="#ffffff">ORCA: 7 METROS</Txt>
      <Txt x={540} y={1010} s={40} a="middle" w={900} c="#ffffff">TIBURÓN: 5 METROS</Txt>
      <Txt x={540} y={1395} s={22} a="middle" c="#ffd23f">tamaños elegidos para esta simulación</Txt>
    </Card>
  );
};
/** Reconstrucción independiente: un tiburón boca arriba entra en inmovilidad tónica. */
const TonicStage: React.FC<{t: number}> = ({t}) => {
  const k = win(t, 82, 91.8, 0.6);
  if (k <= 0.01) return null;
  const roll = smoothstep(83, 86, t);
  const still = smoothstep(85.5, 87.5, t);
  const a = roll * Math.PI;
  // gira alrededor del centro del cuerpo (el hocico describe un arco): siempre dentro del cuadro
  const s: SharkPose = {x: 540 + Math.cos(a) * 310, y: 1000 + Math.sin(a) * 310 * 0.35 + Math.sin(t * 0.6) * 10, angle: a, scale: 0.62, facing: 1, t, phase: t * (4 - still * 3.6), amp: lerp(0.9, 0.08, still), rim: 0.5};
  return (
    <g opacity={ease(clamp(k))}>
      <defs>
        <radialGradient id="tonic-bg" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#14506e" /><stop offset="1" stopColor="#041626" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#tonic-bg)" />
      {Array.from({length: 30}, (_, i) => <circle key={i} cx={(i * 137) % 1080} cy={(i * 293 + t * 12) % 1920} r={1.6 + (i % 3)} fill="#bfe8ff" opacity={0.3} />)}
      <WhiteShark uid="tonic" p={s} />
      <path d="M200 1120Q540 1170 880 1120" stroke="#7ad8ff" strokeWidth={3} fill="none" strokeDasharray="10 8" opacity={0.6 * roll} />
      <Txt x={540} y={1200} s={34} a="middle" w={900} c="#ffd23f" op={still}>INMOVILIDAD TÓNICA</Txt>
      <Txt x={540} y={1245} s={26} a="middle" op={still}>estado temporal en algunos tiburones</Txt>
      <Txt x={540} y={1280} s={26} a="middle" op={still}>al quedar boca arriba · no ocurre siempre</Txt>
    </g>
  );
};
const ObsCard: React.FC<{k: number}> = ({k}) => (
  <Card k={k} title="OBSERVACIONES REALES" y={380} h={540}>
    <Txt x={540} y={520} s={30} a="middle">orcas que cazan tiburones blancos</Txt>
    <Txt x={120} y={610} s={28} c="#ffd23f">● California</Txt>
    <Txt x={150} y={650} s={24} c="#d8f0ff">islas Farallón, 1997</Txt>
    <Txt x={120} y={730} s={28} c="#ffd23f">● Sudáfrica</Txt>
    <Txt x={150} y={770} s={24} c="#d8f0ff">costa de Gansbaai, desde 2017</Txt>
    <Txt x={540} y={870} s={22} a="middle" c="#9fd8f0">es propio de algunas poblaciones de orcas</Txt>
  </Card>
);

// ------------------------------------------------------------------ rótulos por variante
const Big: React.FC<{k: number; lines: string[]; top?: number; size?: number; color?: string; sub?: string}> = ({k, lines, top = 300, size = 84, color = '#ffffff', sub}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', left: 40, right: 40, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `scale(${(0.94 + 0.06 * k).toFixed(3)})`}}>
      {lines.map((l, i) => <div key={i} style={{fontWeight: 900, fontSize: i === 0 ? size : size * 0.62, lineHeight: 1.08, color: i === 0 ? color : '#ffffff', letterSpacing: 2, textShadow: '0 0 30px rgba(0,20,40,0.7), 0 6px 18px rgba(0,0,0,0.9)'}}>{l}</div>)}
      {sub && <div style={{marginTop: 18, display: 'inline-block', padding: '8px 22px', borderRadius: 30, background: 'rgba(255,210,63,0.92)', color: '#06121e', fontWeight: 900, fontSize: 30, letterSpacing: 3}}>{sub}</div>}
    </div>
  ) : null;
const PartChip: React.FC<{t: number; variant: Variant}> = ({t, variant}) => {
  const n = Math.min(4, Math.floor(t / 35) + 1);
  const label = variant === 'episodios' ? `PARTE ${n}/4` : 'ORCA VS. TIBURÓN BLANCO';
  return (
    <div style={{position: 'absolute', left: 54, top: 70, fontFamily: FONT_FAMILY}}>
      <div style={{fontWeight: 900, fontSize: 22, letterSpacing: 4, color: '#eaf6ff', opacity: 0.55, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>MUNDO INSÓLITO · BATALLAS DE LA NATURALEZA</div>
      <div style={{marginTop: 8, display: 'inline-block', padding: '4px 14px', borderRadius: 16, background: 'rgba(2,18,30,0.6)', border: '1.5px solid rgba(255,210,63,0.6)', color: '#ffd23f', fontWeight: 900, fontSize: 22, letterSpacing: 3}}>{label}</div>
    </div>
  );
};
const SimBadge: React.FC<{k: number}> = ({k}) => (k > 0.01 ? <div style={{position: 'absolute', right: 54, top: 124, opacity: k * 0.85, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#bfe8ff', textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>SIMULACIÓN ILUSTRADA</div> : null);

// ------------------------------------------------------------------ fotograma completo
export function battleFrame(t: number, variant: Variant): SceneOut {
  const o = orcaAt(t);
  const s = sharkAt(t);
  const c = battleCam(t, o, s);
  const τ = tauOf(t);
  // velocidad aparente para estelas
  const so = sharkAt(t + 0.1);
  const oo = orcaAt(t + 0.1);
  const vs = Math.hypot(so.x - s.x, so.y - s.y) * 10;
  const vo = Math.hypot(oo.x - o.x, oo.y - o.y) * 10;
  // luz que evoluciona: dorada (E1) → neutra (E2) → más oscura (E3) → cálida (E4)
  const warm = 0.1 * (1 - smoothstep(20, 40, t)) + 0.12 * smoothstep(118, 135, t);
  const dark = 0.16 * smoothstep(68, 76, t) * (1 - smoothstep(100, 108, t));
  const shadowK = 1 - smoothstep(1.2, 3.0, t); // la orca aparece como sombra detrás del tiburón
  const contact = τ > TAU_CONTACT - 0.2 && τ < TAU_CONTACT + 2;
  const cp = orcaPoint(o, 0.01, 0.6);
  const slow = isSlow(t);
  const E = variant === 'episodios';
  const echoClicks = Array.from({length: 18}, (_, i) => 74.2 + i * 0.4);
  const melon = orcaPoint(o, 0.05, 0.55);
  const sh = sharkPoint(s, 0.3, 0);
  const schoolThreat = vs > vo ? sharkPoint(s, 0.05, 0) : orcaPoint(o, 0.05, 0);
  const svg = (
    <g>
      <Sea cam={c} t={t} mood="day" floor={2100} rocks kelp
        schools={[{c: {x: 200 + Math.sin(t * 0.1) * 300, y: 1450}, n: 34, r: 170, seed: 3, dir: 1, threat: schoolThreat, scatter: clamp((vs + vo) / 1400)}, {c: {x: -900, y: 500}, n: 22, r: 140, seed: 9, dir: -1, threat: schoolThreat, scatter: 0.3}]}
        front={<g><Splash x={o.x} t={t} t0={131} size={0.8} slow={1.4} /></g>}>
        <Wake tail={sharkPoint(s, 0.98, 0)} t={t} k={clamp((vs - 300) / 700)} seed={4} />
        <Wake tail={orcaPoint(o, 0.98, 0)} t={t} k={clamp((vo - 300) / 700)} seed={8} />
        <WhiteShark uid="ws" p={s} />
        <Gills s={s} t={t} />
        <g opacity={1}>
          <Orca pose={o} uid="oc" />
          {shadowK > 0.01 && <g opacity={shadowK * 0.85}><Orca pose={{...o, shade: 1, rimK: 0}} uid="oc-sh" /></g>}
        </g>
        {contact && (
          <g>
            <Bubbles t={t} src={cp} n={22} seed={11} k={1 - smoothstep(TAU_CONTACT + 1, TAU_CONTACT + 2, τ)} s={1.6} />
            {[0, 1, 2].map((i) => {
              const ph = clamp((τ - TAU_CONTACT) / 1.4 - i * 0.15);
              return ph > 0 && ph < 1 ? <circle key={i} cx={cp.x} cy={cp.y} r={40 + ph * 320} fill="none" stroke="#e8fbff" strokeWidth={4} opacity={0.5 * (1 - ph)} /> : null;
            })}
          </g>
        )}
        <ClickWaves t={t} origin={melon} dir={Math.atan2(sh.y - melon.y, sh.x - melon.x)} clicks={echoClicks} speed={1400} maxR={1500} targets={[sh]} spread={0.38} k={win(t, 74, 81.6, 0.4)} />
        <ClickFlash t={t} origin={melon} clicks={echoClicks} k={win(t, 74, 81.6, 0.4)} />
        <Blow x={orcaPoint(o, 0.13, 1).x} y={-4} t={t} t0={130.6} s={0.9} />
      </Sea>
      {warm > 0.005 && <rect width={1080} height={1920} fill="#ffb060" opacity={warm} />}
      {dark > 0.005 && <rect width={1080} height={1920} fill="#04101e" opacity={dark} />}
      <TonicStage t={t} />
      <SizeCompare k={win(t, 12.5, 21.8, 0.6)} t={t} />
      <ObsCard k={win(t, 87.6, 91.8, 0.5)} />
    </g>
  );
  const fight = win(t, 22, 126, 0.6) * (1 - win(t, 82, 91.8, 0.3));
  const overlay = (
    <>
      <PartChip t={t} variant={variant} />
      <SimBadge k={fight} />
      {slow && <Tag k={win(t, 52, 57, 0.3) + win(t, 109.5, 111.5, 0.2)} text={t < 60 ? '◉ REPETICIÓN · CÁMARA LENTA' : '◉ CÁMARA LENTA'} top={250} color="#ffc890" />}
      {/* ganchos iniciales */}
      <Big k={win(t, 0.2, 3.4, 0.25)} lines={['ORCA VS.', 'TIBURÓN BLANCO']} top={360} size={110} color="#ffd23f" />
      <Big k={win(t, 35.1, 37.8, 0.25)} lines={[E ? 'PARTE 2/4' : 'EL PRIMER ATAQUE']} top={360} size={96} color="#ffd23f" />
      <Big k={win(t, 70.1, 72.8, 0.25)} lines={[E ? 'PARTE 3/4' : 'LA ESTRATEGIA SECRETA']} top={360} size={E ? 96 : 76} color="#ffd23f" />
      <Big k={win(t, 105.1, 107.8, 0.25)} lines={[E ? 'FINAL — PARTE 4/4' : 'EL VENCEDOR']} top={360} size={E ? 80 : 96} color="#ffd23f" />
      {/* datos */}
      <Tag k={win(t, 5.6, 8, 0.3)} text="DIENTES TRIANGULARES Y SERRADOS" top={420} color="#ffe2a0" />
      <Tag k={win(t, 8.6, 10.6, 0.3)} text="DIENTES CÓNICOS" top={420} color="#ffe2a0" />
      <Tag k={win(t, 10.8, 12.3, 0.3)} text="ALETAS PECTORALES PARA MANIOBRAR" top={420} color="#bfeaff" />
      <Tag k={win(t, 74, 81.6, 0.4)} text="ECOLOCALIZACIÓN · REPRESENTACIÓN ILUSTRADA" top={420} color="#9ff0ff" />
      <Tag k={win(t, 82.2, 91.6, 0.4)} text="RECONSTRUCCIÓN CIENTÍFICA · NO ES UNA GRABACIÓN" top={250} color="#ffb8a0" />
      <Tag k={win(t, 92.2, 99.6, 0.4)} text="MASA CORPORAL Y MANIOBRA FRENTE A POTENCIA" top={420} color="#bfeaff" />
      <Tag k={win(t, 117.6, 124, 0.4)} text="VICTORIA PROBABLE: ORCA" top={400} color="#ffd23f" />
      <Tag k={win(t, 124.4, 131.8, 0.4)} text="CASOS REALES DOCUMENTADOS · CADA ENCUENTRO ES DISTINTO" top={400} color="#d8f6ff" />
      {/* retos al espectador (solo episodios) mientras los animales siguen moviéndose */}
      {E && <Big k={win(t, 30, 34.95, 0.4)} lines={['¿DE QUÉ EQUIPO ERES?', 'ORCA VS. TIBURÓN']} top={330} size={74} color="#ffd23f" sub="CONTINÚA EN LA PARTE 2" />}
      {E && <Big k={win(t, 65, 69.95, 0.4)} lines={['¿FUERZA O ESTRATEGIA?']} top={360} size={74} color="#ffd23f" sub="CONTINÚA EN LA PARTE 3" />}
      {E && <Big k={win(t, 100, 104.95, 0.4)} lines={['HAZ TU ÚLTIMA PREDICCIÓN']} top={360} size={66} color="#ffd23f" sub="EL VENCEDOR EN LA PARTE 4" />}
      {!E && <Tag k={win(t, 30.5, 34.6, 0.4)} text="EL PRIMER MOVIMIENTO ESTÁ CERCA" top={400} color="#ffe2a0" />}
      {!E && <Tag k={win(t, 100.4, 104.6, 0.4)} text="EL CHOQUE ES INEVITABLE" top={400} color="#ffe2a0" />}
      {/* cierre de la serie */}
      <Big k={win(t, 133.6, 140.2, 0.5)} lines={['ELIGE LA PRÓXIMA BATALLA']} top={330} size={66} color="#ffd23f" />
      <BigCats k={win(t, 133.8, 140.2, 0.5)} t={t} />
      {win(t, 133.6, 140.2, 0.5) > 0.01 && <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 133.6, 140.2, 0.5)}}><div style={{fontWeight: 900, fontSize: 40, letterSpacing: 8, color: '#ffffff', textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>MUNDO INSÓLITO</div><div style={{fontWeight: 800, fontSize: 26, letterSpacing: 5, color: '#ffd23f'}}>BATALLAS DE LA NATURALEZA</div></div>}
    </>
  );
  return {svg, overlay};
}
export const _k = {mixColor};
