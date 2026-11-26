// ESCENA 3 (45–70) EL COLMILLO: primer plano del rostro; la cámara recorre el colmillo de la base a la punta;
//                  esquema del cráneo visto desde arriba (el canino IZQUIERDO superior crece hacia delante; el derecho
//                  normalmente queda dentro del hueso); escala (> 2 m); corte transversal (cemento, dentina con
//                  túbulos, pulpa con nervios; hipótesis sensorial, no una "antena mágica"); comparación macho/hembra.
// ESCENA 4 (70–95) LA CAZA CON EL COLMILLO: reconstrucción animada con vista tipo dron (no es una grabación real) de
//                  las 10 fases y repetición submarina en cámara lenta. No todos los narvales lo hacen.
import React from 'react';
import {clamp, lerp, smoothstep} from '../../../engine/math';
import {cam, SceneOut, shot} from '../../../studio2';
import {Narwhal, narwhalPoint, NarwhalPose, tuskTip} from '../character/Narwhal';
import {Key, nswim, STRIKE_NAMES} from '../character/motion';
import {Brand, Card, PhaseTag, Tag, Txt, win} from '../components/common';
import {AerialSea, CodTop} from '../environment/Aerial';
import {Bubbles, Sea} from '../../orca-reina-oceanos/environment/Sea';
import {bc, Floes, FLOES_TOP} from './S1_2';
import {aerialStrike, sideStrike} from './strike';

const f1 = (n: number) => Math.round(n * 10) / 10;

/** Esquema del cráneo visto desde arriba con el origen del colmillo. */
const SkullTop: React.FC<{k: number; t: number}> = ({k, t}) => {
  const grow = smoothstep(0.15, 0.85, k);
  const cx = 540;
  const cy = 1060;
  const tl = 520 * grow;
  const spiral = Array.from({length: 16}, (_, i) => {
    const y = cy - 250 - (i + 0.5) * (tl / 16);
    const r = lerp(16, 5, i / 16);
    return `M${f1(cx - 58 - r)} ${f1(y + 8)}L${f1(cx - 58 + r)} ${f1(y - 8)}`;
  }).join('');
  return (
    <Card k={k} title="ES UN DIENTE, NO UN CUERNO" y={330} h={1000}>
      {/* cráneo (vista dorsal, hocico hacia arriba) */}
      <path d={`M${cx - 200} ${cy + 180}C${cx - 230} ${cy + 20} ${cx - 160} ${cy - 120} ${cx - 90} ${cy - 220}C${cx - 60} ${cy - 262} ${cx + 60} ${cy - 262} ${cx + 90} ${cy - 220}C${cx + 160} ${cy - 120} ${cx + 230} ${cy + 20} ${cx + 200} ${cy + 180}C${cx + 120} ${cy + 230} ${cx - 120} ${cy + 230} ${cx - 200} ${cy + 180}Z`} fill="#e9e2cf" stroke="#6a5e48" strokeWidth={3} />
      <ellipse cx={cx} cy={cy + 40} rx={70} ry={50} fill="#8a7e66" opacity={0.6} />
      <text x={cx} y={cy + 50} textAnchor="middle" fontSize={22} fontWeight={800} fill="#3a3020">espiráculo</text>
      {/* alvéolos: izquierdo (con colmillo) y derecho (diente incluido en el hueso) */}
      <ellipse cx={cx - 58} cy={cy - 222} rx={22} ry={30} fill="#b8a888" stroke="#6a5e48" strokeWidth={2} />
      <path d={`M${cx + 58} ${cy - 222}l-6 -60l12 0Z`} fill="#f6efdc" stroke="#6a5e48" strokeWidth={2} strokeDasharray="5 4" />
      {/* colmillo izquierdo creciendo hacia delante */}
      {tl > 4 && <path d={`M${cx - 74} ${cy - 230}L${cx - 58} ${f1(cy - 250 - tl)}L${cx - 42} ${cy - 230}Z`} fill="#f2e8cc" stroke="#6a5e48" strokeWidth={2.5} />}
      {tl > 4 && <path d={spiral} stroke="#a89a78" strokeWidth={2.4} />}
      {/* rótulos */}
      <Txt x={cx - 90} y={cy - 420} s={28} c="#ffd23f" a="end">COLMILLO</Txt>
      <Txt x={cx - 90} y={cy - 388} s={24} a="end">canino superior</Txt>
      <Txt x={cx - 90} y={cy - 358} s={24} a="end">IZQUIERDO</Txt>
      <Txt x={cx + 90} y={cy - 300} s={24} c="#bfeaff">canino derecho:</Txt>
      <Txt x={cx + 90} y={cy - 270} s={24} c="#bfeaff">normalmente</Txt>
      <Txt x={cx + 90} y={cy - 240} s={24} c="#bfeaff">no sale</Txt>
      <Txt x={cx} y={cy + 290} s={26} a="middle" c="#9fe8ff">VISTA DESDE ARRIBA · ESQUEMA</Txt>
      <Txt x={cx - 300} y={cy + 150} s={24} a="middle" c="#eef8ff">izquierda</Txt>
      <Txt x={cx + 300} y={cy + 150} s={24} a="middle" c="#eef8ff">derecha</Txt>
      <path d={`M${cx} ${cy - 300}l0 -${f1(60 + 20 * Math.sin(t * 3))}`} stroke="#ffd23f" strokeWidth={4} opacity={0} />
    </Card>
  );
};

/** Corte transversal del colmillo: cemento, dentina con túbulos, pulpa con nervios. */
const Section: React.FC<{k: number; t: number}> = ({k, t}) => {
  const cx = 540;
  const cy = 820;
  const R = 270;
  const tub = smoothstep(0.15, 0.5, k);
  const nerves = smoothstep(0.35, 0.7, k);
  const water = smoothstep(0.55, 0.85, k);
  return (
    <Card k={clamp(k * 6) * clamp((1 - k) * 12)} title="CORTE DEL COLMILLO" y={330} h={1000}>
      <circle cx={cx} cy={cy} r={R + 14} fill="#c8b890" stroke="#6a5e48" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={R} fill="#efe4c8" />
      {/* túbulos radiales */}
      <g opacity={tub}>
        {Array.from({length: 120}, (_, i) => {
          const a = (i / 120) * Math.PI * 2;
          return <path key={i} d={`M${f1(cx + Math.cos(a) * 92)} ${f1(cy + Math.sin(a) * 92)}L${f1(cx + Math.cos(a + 0.05) * (R + 6))} ${f1(cy + Math.sin(a + 0.05) * (R + 6))}`} stroke="#b0a078" strokeWidth={1.4} />;
        })}
      </g>
      <circle cx={cx} cy={cy} r={88} fill="#d88a8a" stroke="#8a4a4a" strokeWidth={2} />
      <g opacity={nerves}>
        {Array.from({length: 14}, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.2;
          return <path key={i} d={`M${cx} ${cy}Q${f1(cx + Math.cos(a + 0.4) * 40)} ${f1(cy + Math.sin(a + 0.4) * 40)} ${f1(cx + Math.cos(a) * 84)} ${f1(cy + Math.sin(a) * 84)}`} stroke="#ffe27a" strokeWidth={3} fill="none" />;
        })}
        <circle cx={cx} cy={cy} r={10} fill="#ffe27a" />
      </g>
      {/* agua exterior: estímulos que llegan a la superficie (hipótesis) */}
      <g opacity={water}>
        {[-0.6, 0, 0.6].map((d, i) => {
          const a = -Math.PI / 2 + d - 0.9;
          const r0 = R + 120 - ((t * 60 + i * 30) % 90);
          return <path key={i} d={`M${f1(cx + Math.cos(a) * r0)} ${f1(cy + Math.sin(a) * r0)}l${f1(-Math.cos(a) * 40)} ${f1(-Math.sin(a) * 40)}`} stroke="#7ad8ff" strokeWidth={5} strokeLinecap="round" />;
        })}
        <Txt x={250} y={470} s={26} c="#7ad8ff" a="middle">agua</Txt>
      </g>
      <Txt x={cx} y={cy + R + 70} s={27} a="middle" c="#f2e8cc">CEMENTO (capa externa) · DENTINA</Txt>
      <Txt x={cx} y={cy + R + 104} s={27} a="middle" c="#b0a078" op={tub}>millones de túbulos diminutos</Txt>
      <Txt x={cx} y={cy + R + 138} s={27} a="middle" c="#ffe27a" op={nerves}>PULPA CON NERVIOS en el centro</Txt>
      <Txt x={cx} y={cy + R + 186} s={28} a="middle" c="#ffd23f" op={water}>HIPÓTESIS EN ESTUDIO:</Txt>
      <Txt x={cx} y={cy + R + 220} s={26} a="middle" op={water}>podría detectar cambios en el agua</Txt>
    </Card>
  );
};

// ---------------------------------------------------------------- ESCENA 3
const HERO: Key[] = [[44, -500, 700], [56, 120, 680], [64, 420, 690], [71, 760, 700]];
const FEM: Key[] = [[60, -900, 1020], [71, 450, 1000]];
const MALE2: Key[] = [[60, -1200, 360], [71, 250, 380]];
export function scene3(t: number): SceneOut {
  const hero = nswim(HERO, t, {kind: 'male', scale: 0.9, seed: 3, tusk: 0.56, maxPitch: 0.15});
  hero.eye = {x: 0.6, y: 0.2};
  hero.rimK = 0.6;
  const base = narwhalPoint(hero, 0.008, -0.12);
  const tip = tuskTip(hero);
  const head = narwhalPoint(hero, 0.06, 0);
  const along = (u: number) => ({x: lerp(base.x, tip.x, u), y: lerp(base.y, tip.y, u)});
  const skull = win(t, 48.6, 52.6, 0.5);
  const measure = win(t, 52.8, 56.2, 0.4);
  const sec = seg(t, 56.1, 63.8);
  const cmp = smoothstep(63.6, 65, t);
  let c = shot(t, 45, 46.6, cam(head.x - 60, head.y, 1.7), cam(along(0.05).x, base.y, 1.9));
  if (t > 46.6) c = shot(t, 46.6, 48.8, cam(along(0.05).x, base.y, 1.9), cam(along(0.95).x, tip.y, 1.9));
  if (t > 48.8) c = shot(t, 48.8, 52.6, cam(along(0.95).x, tip.y, 1.9), cam(along(0.3).x, base.y + 60, 0.75));
  if (t > 52.6) c = cam(along(0.3).x, base.y + 60, 0.75);
  if (t > 56) c = shot(t, 56, 57, cam(along(0.3).x, base.y + 60, 0.75), cam(along(0.5).x, along(0.5).y, 2.4));
  if (t > 63.4) c = shot(t, 63.4, 65.4, cam(along(0.5).x, along(0.5).y, 2.4), cam(hero.x - 250, 700, 0.55));
  c = bc(c, t, 0.4);
  const fem = nswim(FEM, t, {kind: 'female', scale: 0.82, seed: 6, tusk: 0});
  const m2 = nswim(MALE2, t, {kind: 'male', scale: 0.86, seed: 8, tusk: 0.5});
  const len = Math.hypot(tip.x - base.x, tip.y - base.y);
  const nrm = {x: -(tip.y - base.y) / len, y: (tip.x - base.x) / len};
  const off = 46;
  return {
    svg: (
      <g>
        <Sea cam={c} t={t} mood="polar" ice floor={2000} rocks front={<Floes t={t} xs={[-900, 0, 900, 1700]} />}>
          {cmp > 0.01 && <g opacity={cmp}><Narwhal pose={m2} uid="m3" /><Narwhal pose={fem} uid="f3" /></g>}
          <Narwhal pose={hero} uid="h3" />
          {measure > 0.01 && (
            <g opacity={measure}>
              <path d={`M${f1(base.x + nrm.x * off)} ${f1(base.y + nrm.y * off)}L${f1(tip.x + nrm.x * off)} ${f1(tip.y + nrm.y * off)}`} stroke="#ffd23f" strokeWidth={5} />
              {Array.from({length: 11}, (_, i) => {
                const p = along(i / 10);
                return <path key={i} d={`M${f1(p.x + nrm.x * (off - 12))} ${f1(p.y + nrm.y * (off - 12))}L${f1(p.x + nrm.x * (off + 12))} ${f1(p.y + nrm.y * (off + 12))}`} stroke="#ffd23f" strokeWidth={4} />;
              })}
            </g>
          )}
          {/* plano de corte sobre el colmillo */}
          {sec > 0 && sec < 0.12 && <ellipse cx={along(0.5).x} cy={along(0.5).y} rx={6} ry={22} fill="none" stroke="#ffd23f" strokeWidth={3} opacity={1 - sec * 8} />}
        </Sea>
        <SkullTop k={skull} t={t} />
        {sec > 0 && sec < 1 && <Section k={sec} t={t} />}
      </g>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 45.6, 48.6, 0.4)} text="DE LA BASE A LA PUNTA: ESPIRAL LEVÓGIRA" color="#ffe2a0" />
        <Tag k={measure} text="PUEDE SUPERAR LOS 2 METROS" top={1150} color="#ffd23f" />
        <Tag k={win(t, 64.8, 69.6, 0.4)} text="MACHO: CON COLMILLO" color="#ffe2a0" />
        <Tag k={win(t, 65.2, 69.6, 0.4)} text="HEMBRA: NORMALMENTE SIN COLMILLO" top={376} color="#ffe2a0" />
        <Tag k={win(t, 66.2, 69.6, 0.4)} text="SU FUNCIÓN AÚN SE INVESTIGA" top={1200} color="#bfeaff" />
      </>
    ),
  };
}
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

// ---------------------------------------------------------------- ESCENA 4
const ST4A = {t0: 70.6, slow: 1.3, fish0: {x: 300, y: 200}, heading: -0.35, scale: 0.55};
const ST4B = {t0: 81.7, slow: 1.8, fish0: {x: 700, y: 720}, scale: 0.78};
const Viewfinder: React.FC<{k: number}> = ({k}) =>
  k > 0.01 ? (
    <div style={{position: 'absolute', inset: 0, opacity: k}}>
      <svg width={1080} height={1920}>
        {[[60, 230, 1, 1], [1020, 230, -1, 1], [60, 1440, 1, -1], [1020, 1440, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M${x} ${y + sy * 70}L${x} ${y}L${x + sx * 70} ${y}`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.75} />)}
        <path d="M520 835L560 835M540 815L540 855" stroke="#ffffff" strokeWidth={3} opacity={0.5} />
      </svg>
    </div>
  ) : null;
export function scene4(t: number): SceneOut {
  if (t < 81.5) {
    const A = aerialStrike(t, ST4A);
    const mid = A.focus;
    let c = shot(t, 70, 73, cam(mid.x - 200, mid.y + 200, 0.55, -0.04), cam(mid.x, mid.y, 1.05, 0));
    if (t > 73) c = cam(mid.x, mid.y, lerp(1.05, 1.35, smoothstep(73, 79, t)));
    const others = [0, 1, 2, 3, 4].map((i) => ({x: A.F.x + 200 + i * 60, y: A.F.y - 160 + i * 40 - (t - 70) * 22, a: -0.5}));
    return {
      svg: (
        <AerialSea cam={c} t={t} floes={FLOES_TOP.map((f) => ({...f, x: f.x - 300, y: f.y + 200}))} ripples={[{x: A.F.x, y: A.F.y, t0: A.C.contactT}]}>
          {others.map((f, i) => <CodTop key={i} x={f.x} y={f.y} a={f.a} t={t + i} s={1.2} />)}
          {A.svg}
        </AerialSea>
      ),
      overlay: (
        <>
          <Viewfinder k={win(t, 70.2, 81.3, 0.4)} />
          <Brand />
          <Tag k={win(t, 70.2, 81.3, 0.4)} text="RECONSTRUCCIÓN ANIMADA · VISTA TIPO DRON" top={250} color="#ffffff" />
          <PhaseTag i={A.C.P.i} k={win(t, 70.6, 81.2, 0.3)} names={STRIKE_NAMES} top={300} />
        </>
      ),
    };
  }
  const S = sideStrike(t, ST4B);
  const tail = narwhalPoint(S.pose, 0.97, 0);
  const pose: NarwhalPose = S.pose;
  // planos: general (fases 1–4) → colmillo y pez (5–7) → boca y pez (8–10)
  const ps = S.C.ps;
  const wide = cam(S.H.x - 175, (S.H.y + S.F.y) / 2, 0.85);
  const tuskShot = cam(S.F.x - 120, S.F.y, 1.35);
  const mouth = narwhalPoint(S.pose, 0.02, -0.3);
  const mouthShot = cam((mouth.x + S.F.x) / 2 - 60, (mouth.y + S.F.y) / 2, 1.3);
  const k1 = smoothstep(ps(4) - 0.6, ps(4) + 0.4, t);
  const k2 = smoothstep(ps(7), ps(8), t);
  const k3 = smoothstep(ps(9) + 1.2, S.C.tEnd + 0.2, t);
  const mixC = (a: typeof wide, b: typeof wide, k: number) => cam(lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.zoom, b.zoom, k));
  let c = mixC(mixC(mixC(wide, tuskShot, k1), mouthShot, k2), cam(S.H.x - 300, S.H.y, 0.75), k3);
  if (t < 83) c = mixC(cam(wide.x - 250, wide.y, 0.6), c, smoothstep(81.5, 83, t));
  c = bc(c, t, 0.3);
  return {
    svg: (
      <Sea cam={c} t={t} mood="polar" floor={1700} rocks front={<Floes t={t} xs={[-200, 700, 1500]} />} schools={[{c: {x: 1300, y: 500}, n: 16, r: 120, seed: 9, dir: 1, scatter: smoothstep(S.C.contactT, S.C.contactT + 1.5, t)}]}>
        <Bubbles t={t * 0.6} src={tail} n={8} seed={5} k={0.6} />
        <Narwhal pose={pose} uid="n4" />
        {S.fish}
        {S.fx}
      </Sea>
    ),
    overlay: (
      <>
        <Brand />
        <Tag k={win(t, 81.8, 94.6, 0.4)} text="◉ CÁMARA LENTA · RECONSTRUCCIÓN" top={250} color="#ffc890" />
        <PhaseTag i={S.C.P.i} k={win(t, 81.8, 94.4, 0.3)} names={STRIKE_NAMES} top={300} />
        <Tag k={win(t, 88, 92, 0.4)} text="NO TODOS LOS NARVALES LO HACEN" top={1180} color="#bfeaff" />
      </>
    ),
  };
}
export const _k = {React, lerp};
