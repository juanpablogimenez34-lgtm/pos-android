// PUMA 2.5D (SVG): dibuja el esqueleto resuelto con volúmenes proyectados, pelaje orientado y rostro.
// Componentes: PumaTorso/Neck/Shoulders/Hips (cuerpo), cuatro patas + PumaPaws, PumaTail, PumaHead
// (cráneo, mejillas, hocico, PumaJaw), PumaEyes, PumaEars, PumaWhiskers, PumaFur, PumaShadows, PumaHighlights.
// El orden de dibujo se decide por profundidad en cada fotograma: al girar, las patas lejanas quedan
// detrás del cuerpo, la oreja y el ojo lejanos se ocultan y el pecho cambia de anchura aparente.
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothstep} from '../../../engine/math';
import {bodyPart, headGeo, legPart, Part, pawPart, Section, tailPart, visible} from './build';
import {LEGS, Skeleton} from './rig';
import {add3, camDir, ellipsoid, Ell, f1, mul3, norm3, proj, sub3, v3, V3, View} from './space';

export type Look = {
  night?: number; // 0 día · 1 noche (tinte azul)
  rim?: string; // color de la luz de contorno
  rimK?: number;
  light?: V3; // dirección de la luz principal en espacio de cámara
  shine?: number; // brillo de los ojos (tapetum lucidum) de noche
  detail?: number; // 0,5 borrador · 1 final
  muscle?: number; // visualización anatómica (0…1)
  ghost?: number;
};

const BASE = {
  outline: '#2e1c0e', fur: '#a57d55', back: '#7e5a38', flank: '#b08a5e', belly: '#ece0c8', cream: '#f4ecdd', shadow: '#3e2614', light: '#f6dcae',
  dark: '#231710', earBack: '#3e3028', earIn: '#d4bea2', nose: '#9a5650', cubFur: '#b39a78', cubBack: '#8f765a', spot: '#46301e',
};

type Pal = typeof BASE;
function palette(sk: Skeleton, look: Look): Pal {
  const n = look.night ?? 0;
  const cub = sk.sp.spots;
  const out = {} as Pal;
  for (const k of Object.keys(BASE) as (keyof Pal)[]) {
    let c = BASE[k];
    if (k === 'fur') c = mixColor(c, BASE.cubFur, cub * 0.7);
    if (k === 'back') c = mixColor(c, BASE.cubBack, cub * 0.7);
    if (k === 'flank') c = mixColor(c, BASE.cubFur, cub * 0.6);
    out[k] = n > 0 ? mixColor(c, '#1a2644', n * (k === 'outline' || k === 'dark' ? 0.2 : 0.55)) : c;
  }
  return out;
}

const E = (e: Ell, grow = 0, key?: React.Key, fill?: string, op?: number) => (
  <ellipse key={key} cx={f1(e.cx)} cy={f1(e.cy)} rx={f1(Math.max(0.3, e.rx + grow))} ry={f1(Math.max(0.3, e.ry + grow))} transform={`rotate(${f1(e.rot)} ${f1(e.cx)} ${f1(e.cy)})`} fill={fill} opacity={op} />
);
/** Radio de una elipse en una dirección de pantalla. */
function radiusIn(e: Ell, dx: number, dy: number) {
  const a = (e.rot * Math.PI) / 180;
  const c = dx * Math.cos(a) + dy * Math.sin(a);
  const s = -dx * Math.sin(a) + dy * Math.cos(a);
  return 1 / Math.sqrt((c * c) / (e.rx * e.rx + 1e-6) + (s * s) / (e.ry * e.ry + 1e-6));
}

// ------------------------------------------------------------------ PELAJE (trazos orientados en 3D)
const RAMP_N = 9;
function surfaceStrokes(secs: Section[], w: View, n: number, seed: number, kind: string, lightC: V3, lenM: number, pal: Pal, sk: Skeleton, out: Map<string, string[]>, widthPx: number) {
  if (secs.length < 2) return;
  for (let i = 0; i < n; i++) {
    const r1 = hash1(seed + i * 1.713);
    const r2 = hash1(seed + i * 7.311);
    const r3 = hash1(seed + i * 3.97);
    const fi = r1 * (secs.length - 1);
    const k = Math.floor(fi);
    const t = fi - k;
    const A = secs[k];
    const B = secs[Math.min(secs.length - 1, k + 1)];
    const c = add3(mul3(A.c, 1 - t), mul3(B.c, t));
    const v = r2 * Math.PI * 2;
    const cv = Math.cos(v);
    const sv = Math.sin(v);
    const h = lerp(A.h, B.h, t);
    const wd = lerp(A.w, B.w, t);
    const p = add3(c, add3(mul3(A.u, h * cv), mul3(A.l, wd * sv)));
    const nn = norm3(add3(mul3(A.u, cv / h), mul3(A.l, sv / wd)));
    const nc = camDir(nn, w);
    if (nc.z < 0.06) continue;
    // dirección del pelo
    let dir: V3;
    if (kind === 'body') dir = norm3(add3(mul3(A.f, -1), mul3(A.u, -0.45 * Math.abs(sv) - 0.1)));
    else dir = norm3(add3(A.f, mul3(A.u, (r3 - 0.5) * 0.3)));
    const L = lenM * (0.65 + r3 * 0.7);
    const q1 = proj(p, w);
    const q2 = proj(add3(p, mul3(dir, L)), w);
    // color: región (lomo oscuro, flanco, vientre claro) × iluminación
    let region = 0; // 0 lomo · 1 flanco · 2 vientre/interior
    if (kind === 'body') region = cv > 0.55 ? 0 : cv > -0.35 ? 1 : 2;
    else if (kind === 'leg') region = A.l.z * sv * (sk.pose ? 1 : 1) < -0.3 ? 2 : 1;
    else region = cv > 0.3 ? 0 : 1;
    if (kind === 'body' && r1 > 0.9) region = Math.min(2, region); // cuello/garganta más clara
    const lam = Math.max(0, nc.x * lightC.x + nc.y * lightC.y + nc.z * lightC.z);
    const b = clamp(0.18 + lam * 0.85 + (r3 - 0.5) * 0.25);
    const bin = Math.min(RAMP_N - 1, Math.floor(b * RAMP_N));
    const key = `${region}|${bin}`;
    let arr = out.get(key);
    if (!arr) out.set(key, (arr = []));
    arr.push(`M${f1(q1.x)} ${f1(q1.y)}L${f1(q2.x)} ${f1(q2.y)}`);
  }
  void pal;
  void widthPx;
}
function rampColor(pal: Pal, region: number, bin: number) {
  const base = region === 0 ? pal.back : region === 1 ? pal.flank : pal.belly;
  const b = bin / (RAMP_N - 1);
  return b < 0.5 ? mixColor(pal.shadow, base, b * 2) : mixColor(base, region === 2 ? '#ffffff' : pal.light, (b - 0.5) * 1.6);
}

// ------------------------------------------------------------------ COMPONENTE DE VOLUMEN
const PartView: React.FC<{part: Part; uid: string; pal: Pal; fill: string; outlinePx: number; lightDir: {x: number; y: number}; blur: number; fur?: React.ReactNode; belly?: Ell[]; spots?: Ell[]; top?: boolean; noOutlineFirst?: number; dim?: number; cream?: Ell[]; outlineAll?: Ell[]}> = ({part, uid, pal, fill, outlinePx, lightDir, blur, fur, belly, spots, noOutlineFirst = 0, dim = 0, cream, outlineAll}) => {
  const id = `${uid}-${part.id}`;
  const all = outlineAll ?? part.ells;
  const shadowEl: React.ReactNode[] = [];
  const lightEl: React.ReactNode[] = [];
  part.ells.forEach((e, i) => {
    const rS = radiusIn(e, -lightDir.x, -lightDir.y);
    const rL = radiusIn(e, lightDir.x, lightDir.y);
    shadowEl.push(E({...e, cx: e.cx - lightDir.x * rS * 0.55, cy: e.cy - lightDir.y * rS * 0.55, rx: e.rx * 0.85, ry: e.ry * 0.85}, 0, i));
    lightEl.push(E({...e, cx: e.cx + lightDir.x * rL * 0.42, cy: e.cy + lightDir.y * rL * 0.42, rx: e.rx * 0.5, ry: e.ry * 0.5}, 0, i));
  });
  return (
    <g>
      <defs>
        <clipPath id={`${id}-c`}>{all.map((e, i) => E(e, 0, i))}</clipPath>
      </defs>
      <g fill={pal.outline}>{all.map((e, i) => (i >= noOutlineFirst ? E(e, outlinePx, i) : null))}</g>
      <g fill={fill}>{part.ells.map((e, i) => E(e, 0, i))}</g>
      {cream ? <g fill={pal.cream}>{cream.map((e, i) => E(e, 0, i))}</g> : null}
      <g clipPath={`url(#${id}-c)`}>
        <g fill={pal.shadow} opacity={0.5} filter={blur > 0 ? `url(#${uid}-b${blur})` : undefined}>{shadowEl}</g>
        {belly ? <g fill={pal.belly} opacity={0.7} filter={blur > 0 ? `url(#${uid}-b${blur})` : undefined}>{belly.map((e, i) => E(e, 0, i))}</g> : null}
        {spots ? <g fill={pal.spot} opacity={0.7}>{spots.map((e, i) => E(e, 0, i))}</g> : null}
        <g fill={pal.light} opacity={0.32} filter={blur > 0 ? `url(#${uid}-b${blur})` : undefined}>{lightEl}</g>
        {fur}
        {dim > 0 ? <g fill="#140c08" opacity={dim}>{part.ells.map((e, i) => E(e, 2, i))}</g> : null}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ PUMA
export const Puma: React.FC<{sk: Skeleton; view: View; uid: string; look?: Look}> = ({sk, view: w, uid, look = {}}) => {
  const pal = palette(sk, look);
  const detail = look.detail ?? 1;
  const S = w.S * sk.sp.head; // escala de la cabeza en píxeles
  const lightC = norm3(look.light ?? v3(-0.45, 0.75, 0.5));
  const ld = norm3(v3(lightC.x, -lightC.y, 0));
  const lightDir = {x: ld.x, y: ld.y};
  const outlinePx = clamp(w.S * 0.0045, 0.8, 2.6);
  const blurPx = Math.max(1, Math.round(clamp(w.S * sk.sp.girth * 0.02, 1, 14)));

  const body = bodyPart(sk, w, Math.round(46 + 30 * detail));
  const legs = LEGS.map((id) => legPart(sk, id, w, Math.round(16 + 10 * detail)));
  const paws = LEGS.map((id) => pawPart(sk, id, w));
  const tail = tailPart(sk, w, Math.round(22 + 14 * detail));
  const H = headGeo(sk, w);

  // --- pelaje
  const furFor = (secs: Section[], kind: string, n: number, seed: number, lenM: number) => {
    const map = new Map<string, string[]>();
    surfaceStrokes(secs, w, Math.round(n * detail), seed, kind, lightC, lenM, pal, sk, map, 1);
    const wpx = clamp(w.S * 0.0032, 0.5, 1.8);
    return (
      <g fill="none" strokeLinecap="round" strokeWidth={wpx} opacity={0.75}>
        {[...map.entries()].map(([k, arr]) => {
          const [region, bin] = k.split('|').map(Number);
          return <path key={k} d={arr.join('')} stroke={rampColor(pal, region, bin)} />;
        })}
      </g>
    );
  };
  const g = sk.sp.girth;
  const furLen = 0.028 * Math.max(0.45, g);
  // --- vientre claro (visible de lado y de frente, no desde arriba)
  const nNeck = Math.floor(body.secs.length * 0.6);
  const belly: Ell[] = body.secs.map((s, i) => {
    const k = clamp(camDir(mul3(s.u, -1), w).z + 0.75) * (i > nNeck ? clamp(1 - (i - nNeck) / 6) * 0.6 + 0.25 : 1);
    return {...ellipsoid(add3(s.c, mul3(s.u, -s.h * 0.78)), mul3(s.f, s.ds * 1.5), mul3(s.u, s.h * 0.34 * k), mul3(s.l, s.w * 0.75), w)};
  });
  // --- manchas del cachorro (sobre la superficie, deformadas por la perspectiva)
  const spotsOn = (secs: Section[], n: number, seed: number, size: number, vmin: number) => {
    if (sk.sp.spots < 0.02) return undefined;
    const out: Ell[] = [];
    for (let i = 0; i < n; i++) {
      const fi = (0.08 + hash1(seed + i * 2.1) * 0.84) * (secs.length - 1);
      const s = secs[Math.floor(fi)];
      const v = vmin + hash1(seed + i * 5.7) * (Math.PI - vmin) * (hash1(seed + i) > 0.5 ? 1 : -1);
      const nrm = norm3(add3(mul3(s.u, Math.cos(v)), mul3(s.l, Math.sin(v))));
      if (camDir(nrm, w).z < 0.05) continue;
      const p = add3(s.c, add3(mul3(s.u, s.h * Math.cos(v)), mul3(s.l, s.w * Math.sin(v))));
      const tangent = norm3(sub3(s.f, mul3(nrm, s.f.x * nrm.x + s.f.y * nrm.y + s.f.z * nrm.z)));
      const bit = norm3(crossV(nrm, tangent));
      const r = size * (0.7 + hash1(seed + i * 9.1) * 0.6) * sk.sp.spots;
      out.push(ellipsoid(p, mul3(tangent, r * 1.25), mul3(bit, r * 0.85), mul3(nrm, 0.0001), w));
    }
    return out;
  };

  const parts: {d: number; node: React.ReactNode}[] = [];
  const bodyD = body.d;
  // patas: profundidad relativa → las lejanas más oscuras y detrás
  legs.forEach((lp, i) => {
    const near = lp.d >= bodyD;
    const pw = paws[i];
    const leg = (
      <g key={lp.id}>
        <PartView part={lp} uid={uid} pal={pal} fill={pal.fur} outlinePx={outlinePx} lightDir={lightDir} blur={blurPx} noOutlineFirst={near ? 4 : 0} dim={near ? 0 : 0.22} fur={furFor(lp.secs, 'leg', 170, 31 + i * 101, furLen * 0.8)} spots={spotsOn(lp.secs, 10, 7 + i * 13, 0.012 * sk.sp.legR, 0.3)} />
        <PartView part={pw} uid={uid} pal={pal} fill={mixColor(pal.flank, pal.cream, 0.35)} outlinePx={outlinePx} lightDir={lightDir} blur={blurPx} dim={near ? 0 : 0.2} />
        {/* surcos entre los dedos */}
        {pw.ells.length > 4 && detail > 0.6 ? (
          <g stroke={pal.outline} strokeWidth={Math.max(0.6, outlinePx * 0.6)} opacity={0.55} fill="none">
            {[1, 2, 3].map((j) => {
              const a = pw.ells[j];
              const b = pw.ells[j + 1];
              return <path key={j} d={`M${f1((a.cx + b.cx) / 2)} ${f1((a.cy + b.cy) / 2 - Math.min(a.ry, a.rx) * 0.6)}L${f1((a.cx + b.cx) / 2)} ${f1((a.cy + b.cy) / 2 + Math.min(a.ry, a.rx) * 0.5)}`} />;
            })}
          </g>
        ) : null}
      </g>
    );
    parts.push({d: near ? bodyD + 0.001 + lp.d * 1e-3 : lp.d - 1, node: leg});
  });
  parts.push({
    d: tail.d < bodyD ? tail.d - 0.5 : bodyD + 0.0005,
    node: <PartView key="tail" part={tail} uid={uid} pal={pal} fill={pal.fur} outlinePx={outlinePx} lightDir={lightDir} blur={blurPx} fur={furFor(tail.secs, 'tail', 220, 77, furLen * 0.8)} spots={sk.sp.spots > 0.02 ? tailRings(tail, w, sk) : undefined} />,
  });
  parts.push({
    d: bodyD,
    node: <PartView key="body" part={body} uid={uid} pal={pal} fill={pal.fur} outlinePx={outlinePx} lightDir={lightDir} blur={blurPx} belly={belly} fur={furFor(body.secs, 'body', 1500, 13, furLen)} spots={spotsOn(body.secs, 70, 3, 0.022 * g, 0.2)} />,
  });
  // cabeza: delante del cuerpo salvo de espaldas
  const headFront = H.facingF > -0.35;
  parts.push({d: headFront ? bodyD + 10 : bodyD - 0.2, node: <Head key="head" H={H} sk={sk} w={w} pal={pal} uid={uid} look={look} outlinePx={outlinePx} lightDir={lightDir} S={S} blur={Math.max(1, Math.round(blurPx * 0.6))} />});
  parts.sort((a, b) => a.d - b.d);

  return (
    <g>
      <defs>
        <filter id={`${uid}-b${blurPx}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={blurPx} />
        </filter>
        <filter id={`${uid}-b${Math.max(1, Math.round(blurPx * 0.6))}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={Math.max(1, Math.round(blurPx * 0.6))} />
        </filter>
        <filter id={`${uid}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={Math.max(0.6, S * 0.0025)} />
        </filter>
      </defs>
      {parts.map((p) => p.node)}
      {/* luz de contorno cálida */}
      {(look.rimK ?? 0) > 0 ? null : null}
    </g>
  );
};
const crossV = (a: V3, b: V3): V3 => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);

function tailRings(tail: Part, w: View, sk: Skeleton): Ell[] {
  const out: Ell[] = [];
  for (let r = 0; r < 6; r++) {
    const u = 0.35 + r * 0.1;
    const s = tail.secs[Math.round(u * (tail.secs.length - 1))];
    out.push(ellipsoid(s.c, mul3(s.f, s.h * 0.45), mul3(s.u, s.h * 1.05), mul3(s.l, s.w * 1.05), w));
  }
  void sk;
  return out;
}

// ------------------------------------------------------------------ CABEZA Y ROSTRO
const Head: React.FC<{H: ReturnType<typeof headGeo>; sk: Skeleton; w: View; pal: Pal; uid: string; look: Look; outlinePx: number; lightDir: {x: number; y: number}; S: number; blur: number}> = ({H, sk, w, pal, uid, look, outlinePx, lightDir, S, blur}) => {
  const sp = sk.sp;
  const P = sk.pose;
  const {P: HP, D, F} = H;
  const all = [...H.ells, ...H.cream];
  const part: Part = {id: 'head', kind: 'head', ells: H.ells, secs: [], d: 0, far: 0};
  const pt = (p: V3) => proj(p, w);
  const pathOf = (pts: V3[], close = false) => pts.map((p, i) => `${i ? 'L' : 'M'}${f1(pt(p).x)} ${f1(pt(p).y)}`).join('') + (close ? 'Z' : '');
  /** Curva por puntos 3D (cuadráticas por puntos medios). */
  const curve = (pts: V3[], close = false) => {
    const q = pts.map(pt);
    const Q = close ? [...q, q[0], q[1]] : q;
    let d = `M${f1(close ? (Q[0].x + Q[1].x) / 2 : Q[0].x)} ${f1(close ? (Q[0].y + Q[1].y) / 2 : Q[0].y)}`;
    for (let i = close ? 1 : 1; i < Q.length - 1; i++) {
      const m = {x: (Q[i].x + Q[i + 1].x) / 2, y: (Q[i].y + Q[i + 1].y) / 2};
      d += `Q${f1(Q[i].x)} ${f1(Q[i].y)} ${f1(m.x)} ${f1(m.y)}`;
    }
    if (!close) d += `L${f1(Q[Q.length - 1].x)} ${f1(Q[Q.length - 1].y)}`;
    return d + (close ? 'Z' : '');
  };
  const disk = (c: V3, n: V3, r: number, r2 = r) => {
    const a = norm3(crossV(F.u, n));
    const b = norm3(crossV(n, a));
    return ellipsoid(c, mul3(a, r), mul3(b, r2), mul3(n, 0.00001), w);
  };
  const s = sp.head;
  const eyeR = 0.0165 * sp.eyeK * s;
  const nodes: React.ReactNode[] = [];
  const back: React.ReactNode[] = [];

  // ---- orejas (PumaEars): concha con dorso oscuro; giran con earL/earR
  const earSize = 0.05 * sp.earK * s;
  for (const side of [1, -1]) {
    const swivel = (side > 0 ? P.earR : P.earL) - 0.3;
    const base = HP(0.018, 0.068, side * 0.05);
    let n = D(0.85, 0.15, side * 0.55);
    const c = Math.cos(swivel * 0.7 * -side);
    const sn = Math.sin(swivel * 0.7 * -side);
    n = norm3(add3(mul3(n, c), mul3(crossV(F.u, n), sn)));
    let b = norm3(add3(F.u, D(-0.2, 0, side * 0.3)));
    b = norm3(sub3(b, mul3(n, b.x * n.x + b.y * n.y + b.z * n.z)));
    const a = norm3(crossV(b, n));
    const E2 = (x: number, y: number) => add3(base, add3(mul3(a, x * earSize), mul3(b, y * earSize)));
    const outer = [E2(-0.55, -0.1), E2(-0.6, 0.45), E2(-0.25, 0.95), E2(0.1, 1.02), E2(0.48, 0.6), E2(0.55, -0.1)];
    const inner = [E2(-0.38, 0.0), E2(-0.4, 0.45), E2(-0.15, 0.78), E2(0.08, 0.8), E2(0.34, 0.5), E2(0.36, 0.0)];
    const vis = visible(n, w);
    const depth = pt(base).d - pt(F.p).d;
    const node = (
      <g key={`ear${side}`}>
        <path d={curve(outer, true)} fill={vis > 0.5 ? '#5a4636' : pal.earBack} stroke={pal.outline} strokeWidth={outlinePx * 0.8} />
        {vis > 0.02 ? <path d={curve(inner, true)} fill={pal.earIn} opacity={vis} /> : null}
        {vis > 0.3 ? <path d={curve([E2(-0.1, 0.1), E2(-0.05, 0.4), E2(0.05, 0.62)])} stroke="#f6eee0" strokeWidth={0.8} fill="none" opacity={vis * 0.7} /> : null}
      </g>
    );
    (depth < -0.02 * s ? back : nodes).push(node);
  }

  // ---- ojos (PumaEyes)
  const blink = Math.max(P.blink, 1 - sp.eyesOpen);
  const iris1 = sp.blueEyes > 0.5 ? '#8fb2d0' : '#d6bb5a';
  const iris2 = sp.blueEyes > 0.5 ? '#46648a' : '#a8742c';
  for (const side of [1, -1]) {
    const n = D(0.82, 0.06, side * 0.55);
    const vis = visible(n, w);
    if (vis < 0.02) continue;
    const c = HP(0.1, 0.03, side * 0.036);
    const a0 = norm3(crossV(F.u, n));
    const a = mul3(a0, side * (camDir(a0, w).x >= 0 ? 1 : 1));
    const b = norm3(crossV(n, a0));
    const Pt = (x: number, y: number) => add3(c, add3(mul3(a0, x * eyeR), mul3(b, y * eyeR)));
    const upY = lerp(0.62, -0.25, blink);
    const loY = lerp(-0.5, -0.25, blink);
    const alm = [Pt(-1.3, 0), Pt(-0.6, upY * 0.95), Pt(0, upY), Pt(0.65, upY * 0.9), Pt(1.3, 0.04), Pt(0.6, loY * 0.9), Pt(0, loY), Pt(-0.65, loY * 0.85)];
    const almD = curve(alm, true);
    const gaze = add3(c, add3(mul3(a0, P.eyeX * eyeR * 0.3), mul3(b, P.eyeY * eyeR * 0.25)));
    const ir = disk(add3(gaze, mul3(n, eyeR * 0.1)), n, eyeR * 0.82);
    const pupil = clamp(0.36 + (look.night ?? 0) * 0.4, 0.3, 0.8);
    const pu = disk(add3(gaze, mul3(n, eyeR * 0.12)), n, eyeR * 0.82 * pupil);
    const hl = pt(add3(add3(gaze, mul3(b, eyeR * 0.3)), mul3(a0, eyeR * 0.2)));
    const id = `${uid}-eye${side}`;
    const shine = look.shine ?? 0;
    // parche claro alrededor y lagrimal oscuro (marcas faciales del puma)
    const patch = disk(add3(HP(0.1, 0.02, side * 0.037), mul3(n, 0.001)), n, eyeR * 1.9, eyeR * 1.2);
    nodes.push(
      <g key={`eye${side}`} opacity={vis}>
        {E(patch, 0, 'p', pal.cream, 0.45 * (1 - (look.night ?? 0) * 0.6))}
        <path d={curve([HP(0.112, 0.024, side * 0.029), HP(0.124, 0.01, side * 0.03), HP(0.138, -0.004, side * 0.031)])} stroke={pal.dark} strokeWidth={Math.max(0.8, S * 0.004)} fill="none" opacity={0.6} strokeLinecap="round" />
        <defs>
          <clipPath id={id}>
            <path d={almD} />
          </clipPath>
        </defs>
        <path d={almD} fill="#1a110a" stroke={pal.dark} strokeWidth={Math.max(0.8, S * 0.005)} />
        {blink < 0.95 ? (
          <g clipPath={`url(#${id})`}>
            {E(ir, 0, 'i', iris2)}
            {E({...ir, rx: ir.rx * 0.75, ry: ir.ry * 0.75}, 0, 'i2', iris1)}
            {E(pu, 0, 'pu', '#060403')}
            {shine > 0 ? E({...ir, rx: ir.rx * 0.95, ry: ir.ry * 0.95}, 0, 'sh', '#c8e870', shine * 0.8) : null}
            <ellipse cx={f1(hl.x)} cy={f1(hl.y)} rx={f1(eyeR * w.S * 0.17)} ry={f1(eyeR * w.S * 0.12)} fill="#fffaf0" opacity={0.9} />
            {/* sombra del párpado superior sobre el iris */}
            <path d={curve([Pt(-1.3, 0), Pt(0, upY * 1.05), Pt(1.3, 0.04), Pt(0, upY * 0.55)], true)} fill="#1a0f06" opacity={0.35} />
          </g>
        ) : null}
        <path d={curve([Pt(-1.25, 0.05), Pt(0, upY + 0.05), Pt(1.25, 0.08)])} stroke="#3a2412" strokeWidth={Math.max(0.6, S * 0.003)} fill="none" opacity={0.55} />
      </g>,
    );
    void a;
  }
  // ---- hocico: mancha oscura en la base de los bigotes, nariz, boca (PumaJaw)
  for (const side of [1, -1]) {
    const n = D(0.35, -0.1, side * 1);
    const vis = visible(n, w);
    if (vis < 0.02) continue;
    const pad = disk(add3(HP(0.166, -0.011, side * 0.036), mul3(n, 0.002)), n, 0.014 * s, 0.009 * s);
    nodes.push(<g key={`wp${side}`} filter={`url(#${uid}-soft)`} opacity={vis}>{E(pad, 0, 0, pal.dark, 0.75)}</g>);
    nodes.push(<path key={`lip${side}`} d={curve([HP(0.186, -0.028, side * 0.004), HP(0.176, -0.036, side * 0.02), HP(0.155, -0.038, side * 0.03), HP(0.13, -0.036, side * 0.034)])} stroke={pal.dark} strokeWidth={Math.max(0.7, S * 0.004)} fill="none" opacity={vis * 0.85} strokeLinecap="round" />);
    // puntos de los bigotes
    for (let r = 0; r < 3; r++)
      for (let k = 0; k < 3; k++) {
        const q = pt(HP(0.16 + k * 0.008, -0.016 - r * 0.005, side * (0.04 - r * 0.001)));
        nodes.push(<circle key={`dot${side}${r}${k}`} cx={f1(q.x)} cy={f1(q.y)} r={f1(Math.max(0.4, S * 0.0011))} fill={pal.dark} opacity={vis * 0.75} />);
      }
  }
  const noseN = D(1, 0.35, 0);
  const noseVis = visible(noseN, w);
  const nose = ellipsoid(HP(0.188, 0.012, 0), mul3(F.f, 0.011 * s), mul3(F.u, 0.011 * s), mul3(F.l, 0.019 * s), w);
  nodes.push(<g key="nose">{E(nose, outlinePx * 0.5, 'o', pal.outline)}{E(nose, 0, 'n', pal.nose)}{E({...nose, cy: nose.cy - nose.ry * 0.35, rx: nose.rx * 0.5, ry: nose.ry * 0.3}, 0, 'h', '#d9a097', 0.6)}</g>);
  if (noseVis > 0.05) {
    nodes.push(<path key="phil" d={curve([HP(0.19, 0.002, 0), HP(0.188, -0.014, 0), HP(0.186, -0.026, 0)])} stroke={pal.dark} strokeWidth={Math.max(0.6, S * 0.0035)} fill="none" opacity={noseVis * 0.8} />);
    for (const side of [1, -1]) {
      const q = pt(HP(0.192, 0.006, side * 0.008));
      nodes.push(<ellipse key={`nos${side}`} cx={f1(q.x)} cy={f1(q.y)} rx={f1(S * 0.0035)} ry={f1(S * 0.0022)} fill="#2a1512" opacity={noseVis} />);
    }
  }
  // ---- bigotes (PumaWhiskers)
  const wh: string[] = [];
  for (const side of [1, -1])
    for (let k = 0; k < 9; k++) {
      const row = Math.floor(k / 3);
      const o = HP(0.158 + (k % 3) * 0.008, -0.012 - row * 0.006, side * 0.043);
      const dir = D(-0.3 + (k % 3) * 0.1, -0.08 - row * 0.12, side * 1);
      const L = (0.075 + (k % 4) * 0.012) * s;
      const pts: V3[] = [];
      for (let j = 0; j <= 5; j++) {
        const u = j / 5;
        pts.push(add3(add3(o, mul3(dir, L * u)), mul3(F.u, -L * 0.25 * u * u)));
      }
      wh.push(pathOf(pts));
    }
  // ---- pelo de la cabeza: trazos en la dirección hocico → nuca
  const hf = proj(add3(F.p, F.f), w);
  const h0 = proj(F.p, w);
  let hx = h0.x - hf.x;
  let hy = h0.y - hf.y;
  const hl = Math.hypot(hx, hy);
  const along = hl > 1e-3 ? {x: hx / hl, y: hy / hl} : {x: 0, y: 1};
  const hair: Record<number, string[]> = {};
  const nH = Math.round(380 * (look.detail ?? 1));
  for (let i = 0; i < nH; i++) {
    const e = H.ells[i % H.ells.length];
    const r = Math.sqrt(hash1(i * 3.3 + 1)) * 0.92;
    const th = hash1(i * 7.1 + 2) * Math.PI * 2;
    const a = (e.rot * Math.PI) / 180;
    const lx = Math.cos(th) * e.rx * r;
    const ly = Math.sin(th) * e.ry * r;
    const x = e.cx + lx * Math.cos(a) - ly * Math.sin(a);
    const y = e.cy + lx * Math.sin(a) + ly * Math.cos(a);
    const L = S * 0.012 * (0.6 + hash1(i * 1.9) * 0.8);
    const lit = clamp(0.45 + ((x - e.cx) * lightDir.x + (y - e.cy) * lightDir.y) / (Math.max(e.rx, e.ry) + 1e-3) * 0.5 + (hash1(i * 5.5) - 0.5) * 0.3);
    const bin = Math.min(RAMP_N - 1, Math.floor(lit * RAMP_N));
    (hair[bin] ??= []).push(`M${f1(x)} ${f1(y)}l${f1(along.x * L)} ${f1(along.y * L)}`);
  }
  const fur = (
    <g fill="none" strokeLinecap="round" strokeWidth={clamp(S * 0.0028, 0.5, 1.5)} opacity={0.7}>
      {Object.entries(hair).map(([b, arr]) => (
        <path key={b} d={arr.join('')} stroke={rampColor(pal, 1, Number(b))} />
      ))}
    </g>
  );
  return (
    <g>
      {back}
      <PartView part={part} uid={uid} pal={pal} fill={pal.fur} outlinePx={outlinePx} lightDir={lightDir} blur={blur} cream={H.cream} outlineAll={all} fur={fur} />
      {nodes}
      <path d={wh.join('')} stroke="#fbf7ee" strokeWidth={clamp(S * 0.0022, 0.4, 1.2)} fill="none" opacity={0.8} strokeLinecap="round" />
    </g>
  );
};
export const _k = {smoothstep, lerp, sub3, v3, pathNoop: 0};
