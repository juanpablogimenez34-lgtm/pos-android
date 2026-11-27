// ESCENAS 9–12.
//  9  (120–135) EL REGRESO A LA SUPERFICIE: ascenso, la luz aumenta, sale y exhala (soplo inclinado).
//  10 (135–150) UNA FAMILIA DE GIGANTES: hembras, un joven y una cría junto a su madre, cerca de la superficie.
//  11 (150–165) EL LENGUAJE DE LOS CLICS: dos cachalotes, patrones de codas (gráfico), el grupo completo.
//  12 (165–180) EL ÚLTIMO MISTERIO: un adulto se aleja, la inmensidad del océano, la cola emerge y se sumerge.
import {clamp, lerp} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {breathe, cam, Cam, SceneOut, shot, toScreen} from '../../../studio2';
import {L, SpermWhale, WhalePose} from '../character/SpermWhale';
import {BigTitle, Brand, Callout, Note, poseFrom, seg, toWorld, Vignette, Wash, win, WTrack} from '../components/common';
import {EV} from '../data/timeline';
import {DeepOcean, OceanFront, SurfaceWorld} from '../environment/Ocean';

const xy = (p: {x: number; y: number}): [number, number] => [p.x, p.y];
const blowAt = (t: number, list: number[]) => list.reduce((acc, b) => (t >= b && t < b + 2.6 ? (t - b) / 2.6 : acc), 0);

// ---------------- ESCENA 9 ----------------
const TR9: WTrack = [[120, 'ASCENT'], [128.5, 'SLOW_SWIM'], [130, 'SURFACE_BREATHING']];
export function scene09(t: number): SceneOut {
  const s = 0.5;
  if (t < 130) {
    const u = seg(t, 120, 130);
    const depthM = lerp(520, 15, u);
    const a = lerp(-0.95, -0.35, seg(t, 125, 130));
    const P = {x: 200 + u * 600, y: depthM * 10};
    const pose = poseFrom(TR9, t, {tone: lerp(0.65, 0.05, u), rim: lerp(0.3, 0.9, u)}, 1.1);
    const mid = toWorld({x: -0.4 * L, y: 0}, P.x, P.y, a, s);
    let c: Cam = cam(mid.x, mid.y - 60, lerp(0.7, 0.6, u));
    c = breathe(c, t, 0.2);
    return {
      svg: (
        <DeepOcean cam={c} t={t} depth={lerp(0.85, 0.08, Math.pow(u, 0.8))} glow={0.3} violet={0.15}>
          <SpermWhale uid="w9a" pose={pose} x={P.x} y={P.y} angle={a} scale={s} />
        </DeepOcean>
      ),
      overlay: (
        <>
          <OceanFront cam={c} t={t} />
          <Vignette />
          <Note k={win(t, 120.6, 129.6, 0.4)} text={`ascenso · ${Math.round(depthM)} m (ilustrativo)`} top={300} />
          <Brand />
        </>
      ),
    };
  }
  const P = {x: 120 + (t - 130) * 40, y: 0.098 * L * s - 4 + Math.max(0, 131 - t) * 30, a: -0.02};
  const pose = poseFrom(TR9, t, {blow: blowAt(t, [EV.blows[2], EV.blows[3]]), rim: 0.9}, 1.1);
  const mid = toWorld({x: -0.45 * L, y: 0}, P.x, P.y, P.a, s);
  let c: Cam = cam(mid.x + 160, -140, 0.66);
  c = breathe(c, t, 0.2);
  const bh = toScreen(c, P.x - 0.03 * L * s, -0.1 * L * s);
  return {
    svg: (
      <SurfaceWorld cam={c} t={t}>
        <SpermWhale uid="w9b" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </SurfaceWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.5} />
        <Callout k={win(t, 131.2, 134.8)} x={bh.x} y={bh.y} tx={110} ty={560} text="espiráculo a la izquierda → soplo inclinado hacia delante" />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENAS 10 y 11: el grupo ----------------
type Member = {id: string; s: number; x0: number; y0: number; ph: number; calf?: boolean; tr: WTrack};
const SA = 0.4; // escala de un macho de 16 m; hembra ≈ 12 m → 0,75·SA
const GROUP: Member[] = [
  {id: 'mom', s: SA * 0.75, x0: 0, y0: 760, ph: 0.3, tr: [[135, 'SOCIAL_SWIMMING'], [139.5, 'CALF_PROTECTION'], [150, 'SOCIAL_SWIMMING']]},
  {id: 'calf', s: SA * 0.26, x0: -60, y0: 890, ph: 1.9, calf: true, tr: [[135, 'SOCIAL_SWIMMING']]},
  {id: 'f2', s: SA * 0.75, x0: -260, y0: 600, ph: 2.6, tr: [[135, 'SOCIAL_SWIMMING'], [146, 'SLOW_SWIM']]},
  {id: 'f3', s: SA * 0.72, x0: 640, y0: 1060, ph: 4.1, tr: [[135, 'SLOW_SWIM'], [143, 'SOCIAL_SWIMMING']]},
  {id: 'juv', s: SA * 0.55, x0: -980, y0: 1180, ph: 5.3, tr: [[135, 'SOCIAL_SWIMMING']]},
  {id: 'f4', s: SA * 0.74, x0: 1150, y0: 620, ph: 0.9, tr: [[135, 'SLOW_SWIM'], [150, 'SOCIAL_SWIMMING']]},
];
function member(m: Member, t: number): {x: number; y: number; a: number} {
  const k = m.calf ? 1.15 : 1;
  const x = m.x0 + (t - 135) * 46 * k + Math.sin(t * 0.21 + m.ph) * 50;
  const y = m.y0 + Math.sin(t * 0.17 + m.ph * 1.3) * 40;
  const a = Math.cos(t * 0.17 + m.ph * 1.3) * 0.05 - 0.02;
  // la cría se mantiene junto a la madre (debajo y algo por detrás de la aleta pectoral)
  if (m.calf) {
    const mom = member(GROUP[0], t);
    const off = toWorld({x: -0.3 * L, y: 0.16 * L}, mom.x, mom.y, mom.a, GROUP[0].s);
    return {x: off.x + Math.sin(t * 0.9) * 14, y: off.y + Math.sin(t * 0.7) * 10, a: mom.a + Math.sin(t * 0.6) * 0.06};
  }
  return {x, y, a};
}
const Group: React.FC<{t: number; tone?: number; only?: string[]; extra?: Partial<WhalePose>}> = ({t, tone = 0, only, extra}) => (
  <>
    {GROUP.filter((m) => !only || only.includes(m.id)).map((m) => {
      const p = member(m, t);
      const pose = poseFrom(m.tr, t, {tone, rim: 0.85, calf: m.calf, ...extra}, m.ph);
      return <SpermWhale key={m.id} uid={`g-${m.id}`} pose={pose} x={p.x} y={p.y} angle={p.a} scale={m.s} />;
    })}
  </>
);

export function scene10(t: number): SceneOut {
  const mom = member(GROUP[0], t);
  const momMid = toWorld({x: -0.4 * L, y: 0}, mom.x, mom.y, mom.a, GROUP[0].s);
  const calf = member(GROUP[1], t);
  let c: Cam = cam(momMid.x + 100, 520, 0.38);
  if (t >= 139.5) c = shot(t, 139.5, 141.5, cam(momMid.x + 100, 520, 0.38), cam(momMid.x + 40, mom.y + 60, 0.95), 'cine');
  if (t >= 141.5) c = cam(momMid.x + 40, mom.y + 60, 0.95);
  if (t >= 145) c = shot(t, 145, 148, cam(momMid.x + 40, mom.y + 60, 0.95), cam(momMid.x + 150, 700, 0.42), 'cine');
  c = breathe(c, t, 0.22);
  const cs = toScreen(c, calf.x - 0.2 * L * GROUP[1].s, calf.y);
  return {
    svg: (
      <SurfaceWorld cam={c} t={t} tint={0.3}>
        <Group t={t} />
      </SurfaceWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <Callout k={win(t, 141.8, 144.8)} x={cs.x} y={cs.y} tx={120} ty={1200} text="cría junto a su madre (unos 4 m al nacer, NOAA)" />
        <Note k={win(t, 145.6, 149.8, 0.4)} text="Unidad social: hembras emparentadas, jóvenes y crías" top={1700} />
        <Brand />
      </>
    ),
  };
}

export function scene11(t: number): SceneOut {
  const a = member(GROUP[0], t);
  const b = member(GROUP[2], t);
  const ha = toWorld({x: -0.12 * L, y: 0}, a.x, a.y, a.a, GROUP[0].s);
  const hb = toWorld({x: -0.12 * L, y: 0}, b.x, b.y, b.a, GROUP[2].s);
  const mid = {x: (ha.x + hb.x) / 2, y: (ha.y + hb.y) / 2};
  let c: Cam = cam(mid.x - 120, mid.y + 40, 1.0);
  if (t >= 160) c = shot(t, 160, 164.5, cam(mid.x - 120, mid.y + 40, 1.0), cam(mid.x + 150, 760, 0.3), 'cine');
  c = breathe(c, t, 0.2);
  const ck = win(t, 154.8, 160.6, 0.4);
  return {
    svg: (
      <SurfaceWorld cam={c} t={t} tint={0.32}>
        <Group t={t} />
      </SurfaceWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        {ck > 0.01 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: ck}}>
            <rect x={90} y={1130} width={900} height={190} rx={18} fill="rgba(4,16,30,0.72)" stroke="#9ff0ff" strokeWidth={2} />
            {[0, 1].map((row) => (
              <g key={row}>
                <text x={120} y={1182 + row * 80} fill={row ? '#ffd870' : '#9ff0ff'} fontSize={22} fontWeight={800} fontFamily={FONT_FAMILY}>{row ? 'cachalote B' : 'cachalote A'}</text>
                <line x1={300} y1={1175 + row * 80} x2={960} y2={1175 + row * 80} stroke="#ffffff" strokeWidth={1} opacity={0.25} />
                {EV.codas.filter((_, i) => i % 2 === row).map((c0, i) =>
                  EV.codaPattern.map((o, j) => {
                    const tc = c0 + o;
                    if (tc > t) return null;
                    const x = 300 + ((tc - 150) / 15) * 660;
                    return <line key={`${i}-${j}`} x1={x} y1={1155 + row * 80} x2={x} y2={1195 + row * 80} stroke={row ? '#ffd870' : '#9ff0ff'} strokeWidth={4} opacity={clamp(1 - (t - tc) / 6) * 0.6 + 0.4} />;
                  }),
                )}
              </g>
            ))}
          </svg>
        )}
        <Note k={ck} text="Patrón de coda ilustrativo («1+1+3»): ritmos de clics, no palabras traducidas" top={1340} />
        <Brand />
      </>
    ),
  };
}

// ---------------- ESCENA 12 ----------------
const TR12: WTrack = [[165, 'FINAL_RETREAT'], [171.5, 'SURFACE_BREATHING'], [172.8, 'DIVE_PREPARATION'], [173.8, 'TAIL_LIFT']];
export function scene12(t: number): SceneOut {
  const s = 0.42;
  const dive = seg(t, 173.2, 178.5);
  const a = lerp(-0.02, 1.32, Math.pow(dive, 1.3));
  const baseX = 200 + (t - 165) * 55;
  const P = {x: baseX + dive * 200, y: lerp(0.098 * L * s + 30 - seg(t, 168, 172) * 34, 0.85 * L * s, Math.pow(dive, 1.15)), a};
  const pose = poseFrom(TR12, t, {fv: lerp(0.3, 0.95, seg(t, 174, 176.5)), rim: 0.9, blow: blowAt(t, [171.6])}, 3.3);
  const mid = toWorld({x: -0.5 * L, y: 0}, baseX, 0, 0, s);
  let c: Cam = cam(mid.x + 60, 140, 0.62);
  if (t >= 169) c = shot(t, 169, 174, cam(mid.x + 60, 140, 0.62), cam(mid.x + 120, -260, 0.3), 'cine');
  if (t >= 174) c = cam(mid.x + 120 + (t - 174) * 10, -260, 0.3 - (t - 174) * 0.004);
  c = breathe(c, t, 0.18);
  return {
    svg: (
      <SurfaceWorld cam={c} t={t}>
        <SpermWhale uid="w12" pose={pose} x={P.x} y={P.y} angle={P.a} scale={s} />
      </SurfaceWorld>
    ),
    overlay: (
      <>
        <Vignette k={0.6} />
        <BigTitle k={clamp((t - EV.endText) / 0.6) * (1 - seg(t, EV.fadeOut, 180))} lines={['¿QUÉ OTRO GIGANTE', 'ESCONDE EL OCÉANO?']} top={330} size={78} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: '#eaf4ff', textShadow: '0 2px 8px rgba(0,0,0,0.7)', opacity: 0.85 * clamp((t - EV.endText - 0.6) / 0.6) * (1 - seg(t, EV.fadeOut, 180))}}>MUNDO INSÓLITO DOCUMENTALES</div>
        <Wash k={seg(t, EV.fadeOut, 180)} />
      </>
    ),
  };
}
export const _xy = xy;
