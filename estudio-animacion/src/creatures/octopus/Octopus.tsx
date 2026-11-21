import React, {useMemo} from 'react';
import {clamp, mixColor, rng, smoothPath, Vec} from '../../engine/math';
import {useQuality} from '../../engine/quality';
import {useStyle} from '../../engine/style';
import {ArmPose, EyePose, OctopusPose} from './pose';
import {OctopusSkin} from './rig';
import {StateParams} from './states';

type Palette = {
  base: string;
  shadow: string;
  highlight: string;
  spotDark: string;
  spotLight: string;
  underside: string;
  sucker: string;
  suckerRim: string;
  rim: string;
};

/** Colores de piel en función del estado (camuflaje, palidez, oscurecimiento). */
export function skinPalette(skin: OctopusSkin, s: StateParams): Palette {
  const c = clamp(s.camo);
  const fx = (a: string, camo: string) => {
    let v = mixColor(a, camo, c);
    v = mixColor(v, skin.pale, clamp(s.pale) * 0.7);
    v = mixColor(v, skin.dark, clamp(s.dark) * 0.7);
    return v;
  };
  return {
    base: fx(skin.base, skin.camoBase),
    shadow: fx(skin.shadow, skin.camoShadow),
    highlight: fx(skin.highlight, skin.camoHighlight),
    spotDark: fx(skin.spotDark, skin.camoSpotDark),
    spotLight: fx(skin.spotLight, skin.camoSpotLight),
    underside: fx(skin.underside, mixColor(skin.camoHighlight, skin.underside, 0.35)),
    sucker: fx(skin.sucker, mixColor(skin.camoHighlight, skin.sucker, 0.4)),
    suckerRim: fx(skin.suckerRim, skin.camoShadow),
    rim: skin.rim,
  };
}

type Spot = {u: number; v: number; rx: number; ry: number; rot: number; light: boolean};

function lerpIdx<T extends Vec>(arr: T[], f: number): Vec {
  const i = Math.min(arr.length - 2, Math.floor(f));
  const k = f - i;
  return {x: arr[i].x + (arr[i + 1].x - arr[i].x) * k, y: arr[i].y + (arr[i + 1].y - arr[i].y) * k};
}
const lerpNum = (arr: number[], f: number) => {
  const i = Math.min(arr.length - 2, Math.floor(f));
  return arr[i] + (arr[i + 1] - arr[i]) * (f - i);
};

// ---------------------------------------------------------------------------
// Brazo: volumen con 2 tonos, realce superior, moteado y ventosas que siguen
// la deformación (se colocan sobre la normal de la curva en cada fotograma).
// ---------------------------------------------------------------------------
export const Arm: React.FC<{arm: ArmPose; pal: Palette; s: StateParams; suckers: number; id: string; refined?: boolean}> = ({arm, pal, s, suckers, id, refined}) => {
  const {pts, widths, normals, z} = arm;
  const N = pts.length - 1;
  const depthShade = z < 0 ? -0.28 * -z : 0;
  const base = depthShade ? mixColor(pal.base, '#120a1e', -depthShade) : pal.base;
  const under = depthShade ? mixColor(pal.underside, '#120a1e', -depthShade * 1.1) : pal.underside;
  const left: Vec[] = [];
  const right: Vec[] = [];
  const mid: Vec[] = [];
  const top: Vec[] = [];
  for (let k = 0; k <= N; k++) {
    const p = pts[k];
    const n = normals[k];
    const w = widths[k];
    left.push({x: p.x + n.x * w, y: p.y + n.y * w});
    right.push({x: p.x - n.x * w, y: p.y - n.y * w});
    mid.push({x: p.x + n.x * w * 0.12, y: p.y + n.y * w * 0.12});
    top.push({x: p.x - n.x * w * 0.58, y: p.y - n.y * w * 0.58});
  }
  const tipDir = {x: pts[N].x - pts[N - 1].x, y: pts[N].y - pts[N - 1].y};
  const td = Math.hypot(tipDir.x, tipDir.y) || 1;
  const tip = {x: pts[N].x + (tipDir.x / td) * widths[N] * 2, y: pts[N].y + (tipDir.y / td) * widths[N] * 2};
  const body = smoothPath([...left, tip, ...[...right].reverse()], true);
  const band = smoothPath([...left, tip, ...[...mid].reverse()], true);

  // ventosas: dos filas escalonadas a lo largo del borde inferior
  const suckerEls: React.ReactNode[] = [];
  for (let q = 0; q < suckers; q++) {
    const f = (0.07 + (q / (suckers - 1)) * 0.9) * N;
    const p = lerpIdx(pts, f);
    const n = lerpIdx(normals, f);
    const w = lerpNum(widths, f);
    if (w < 1.6) continue;
    const row = q % 2 === 0 ? 0.62 : 0.9;
    const cx = p.x + n.x * w * row;
    const cy = p.y + n.y * w * row;
    const r = w * (q % 2 === 0 ? 0.36 : 0.32);
    const ang = (Math.atan2(n.y, n.x) * 180) / Math.PI + 90;
    suckerEls.push(
      <g key={q} transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${ang.toFixed(1)})`}>
        <ellipse rx={r} ry={r * 0.72} fill={refined ? `url(#${id}-suck)` : pal.sucker} stroke={pal.suckerRim} strokeWidth={Math.max(0.6, r * 0.22)} />
        <ellipse rx={r * 0.38} ry={r * 0.26} fill={refined ? `url(#${id}-cup)` : pal.suckerRim} opacity={refined ? 1 : 0.8} />
        {refined && r > 2.2 && <ellipse cx={-r * 0.3} cy={-r * 0.25} rx={r * 0.22} ry={r * 0.12} fill="#ffffff" opacity={0.55} />}
      </g>,
    );
  }
  // manchas dorsales
  const spots: React.ReactNode[] = [];
  for (let k = 2; k < N - 1; k += 2) {
    const w = widths[k];
    if (w < 3) break;
    const p = pts[k];
    const n = normals[k];
    const ang = (Math.atan2(n.y, n.x) * 180) / Math.PI + 90;
    spots.push(
      <ellipse
        key={k}
        cx={p.x - n.x * w * 0.3}
        cy={p.y - n.y * w * 0.3}
        rx={w * 0.42}
        ry={w * 0.24}
        transform={`rotate(${ang.toFixed(1)} ${(p.x - n.x * w * 0.3).toFixed(1)} ${(p.y - n.y * w * 0.3).toFixed(1)})`}
        fill={k % 4 === 0 ? pal.spotLight : pal.spotDark}
        opacity={(k % 4 === 0 ? 0.35 : 0.45) * (0.4 + s.pattern)}
      />,
    );
  }
  return (
    <g>
      <path d={body} fill={base} />
      <path d={band} fill={under} opacity={0.75} />
      {spots}
      <path d={smoothPath(top.slice(0, Math.round(N * 0.85)))} stroke={pal.highlight} strokeOpacity={0.45} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d={body} fill="none" stroke={pal.shadow} strokeOpacity={0.35} strokeWidth={1} />
      {refined && <path d={smoothPath(left.slice(1, Math.round(N * 0.9)))} stroke={pal.rim} strokeOpacity={0.3} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
      {suckerEls}
    </g>
  );
};

export const ArmShadow: React.FC<{arm: ArmPose; refined?: boolean}> = ({arm, refined}) => {
  const pts = arm.pts.map((p, k) => ({x: p.x + 4, y: p.y + 9 + arm.widths[k] * 0.3}));
  const d = smoothPath(pts);
  if (!refined) return <path d={d} stroke="#02040d" strokeOpacity={0.22} strokeWidth={arm.widths[2] * 1.6} strokeLinecap="round" fill="none" />;
  // sombra suave: penumbra ancha y tenue + núcleo estrecho (sin filtros de desenfoque)
  const d2 = smoothPath(arm.pts.map((p, k) => ({x: p.x + 7, y: p.y + 14 + arm.widths[k] * 0.4})));
  return (
    <g>
      <path d={d2} stroke="#02040d" strokeOpacity={0.09} strokeWidth={arm.widths[2] * 3.2} strokeLinecap="round" fill="none" />
      <path d={d2} stroke="#02040d" strokeOpacity={0.1} strokeWidth={arm.widths[2] * 2.2} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#02040d" strokeOpacity={0.16} strokeWidth={arm.widths[2] * 1.2} strokeLinecap="round" fill="none" />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Ojo: abultamiento de piel, iris dorado, pupila horizontal, párpado y papilas.
// ---------------------------------------------------------------------------
const Eye: React.FC<{eye: EyePose; pal: Palette; s: StateParams; gradId: string; papillae: number; refined?: boolean}> = ({eye, pal, gradId, papillae, refined}) => {
  const r = eye.r;
  const R = r * 0.86;
  const lidY = -R + 2 * R * clamp(eye.lid);
  const lx = Math.sqrt(Math.max(0, R * R - lidY * lidY));
  const large = lidY > 0 ? 1 : 0;
  const pw = r * 1.05 * eye.pupilScale;
  const ph = r * (0.26 + 0.18 * (eye.pupilScale - 0.75));
  const horn = 4 + papillae * 14;
  return (
    <g transform={`translate(${eye.local.x.toFixed(2)} ${eye.local.y.toFixed(2)})`} opacity={eye.visible}>
      {/* abultamiento */}
      <ellipse cx={0} cy={1} rx={r * 1.3} ry={r * 1.22} fill={`url(#${gradId})`} />
      <path
        d={`M${-r * 0.5},${-r * 1.05} q${r * 0.12},${-horn * 0.9} ${r * 0.28},${-horn}`}
        stroke={pal.base}
        strokeWidth={r * 0.28}
        strokeLinecap="round"
        fill="none"
      />
      <path d={`M${r * 0.15},${-r * 1.12} q${r * 0.1},${-horn * 0.6} ${r * 0.3},${-horn * 0.7}`} stroke={pal.base} strokeWidth={r * 0.22} strokeLinecap="round" fill="none" />
      {/* globo ocular */}
      <circle r={R} fill={`url(#${gradId}-iris)`} />
      {refined &&
        Array.from({length: 18}, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          return (
            <line key={i} x1={Math.cos(a) * R * 0.42} y1={Math.sin(a) * R * 0.42} x2={Math.cos(a) * R * 0.94} y2={Math.sin(a) * R * 0.94} stroke="#7d5a1c" strokeOpacity={0.35} strokeWidth={0.7} />
          );
        })}
      <circle r={R} fill="none" stroke="#2a1606" strokeOpacity={0.5} strokeWidth={1.4} />
      {/* pupila horizontal rectangular */}
      <rect x={eye.pupil.x - pw / 2} y={eye.pupil.y - ph / 2} width={pw} height={ph} rx={ph / 2} fill="#07050a" />
      <ellipse cx={-R * 0.38} cy={-R * 0.42} rx={R * 0.26} ry={R * 0.17} fill="#ffffff" opacity={0.85} />
      <circle cx={R * 0.35} cy={R * 0.3} r={R * 0.08} fill="#ffffff" opacity={0.6} />
      {/* párpados */}
      {eye.lid > 0.01 && (
        <path d={`M${-lx},${lidY} A${R} ${R} 0 ${large} 1 ${lx},${lidY} Z`} fill={pal.base} stroke={pal.shadow} strokeWidth={1.6} />
      )}
      <path d={`M${-R * 0.85},${R * 0.55} Q0,${R * 1.25} ${R * 0.85},${R * 0.55} L${R},${R} L${-R},${R}Z`} fill={pal.base} opacity={0.9} />
    </g>
  );
};

type OctopusProps = {
  id: string;
  pose: OctopusPose;
  skin: OctopusSkin;
  /** y del sustrato bajo el cuerpo (para la sombra de contacto) */
  groundY?: number;
  /** 0–1: vista "rayos X" (piel translúcida) para las visualizaciones científicas. */
  xray?: number;
  /** 0–1: nubes oscuras que recorren el manto (señal de cambio de color). */
  clouds?: number;
};

export const Octopus: React.FC<OctopusProps> = ({id, pose, skin, groundY, xray = 0, clouds = 0}) => {
  const q = useQuality();
  const {refined} = useStyle();
  const s = pose.state;
  const pal = skinPalette(skin, s);
  const spots = useMemo<Spot[]>(() => {
    const r = rng(77);
    return Array.from({length: q.skinSpots}, () => ({
      u: 0.08 + r() * 0.86,
      v: (r() * 2 - 1) * 0.85,
      rx: 4 + r() * 11,
      ry: 3 + r() * 6,
      rot: r() * 180,
      light: r() < 0.38,
    }));
  }, [q.skinSpots]);

  const {body, mantle, head, eyes, siphon} = pose;
  const sortedArms = [...pose.arms].sort((a, b) => a.z - b.z);
  const backArms = sortedArms.filter((a) => a.z < 0);
  const frontArms = sortedArms.filter((a) => a.z >= 0);
  const M = mantle.axis.length - 1;
  const mantlePath = smoothPath(mantle.outline, true);
  const webPath = smoothPath([...pose.web].sort((a, b) => Math.atan2(a.y - body.y, a.x - body.x) - Math.atan2(b.y - body.y, b.x - body.x)), true);
  const tf = `translate(${body.x.toFixed(2)} ${body.y.toFixed(2)}) rotate(${((body.rot * 180) / Math.PI).toFixed(3)}) scale(${body.scale.toFixed(4)})`;
  const hiC = mantle.axis[Math.round(M * 0.45)];
  const ux = Math.cos(mantle.dir);
  const uy = Math.sin(mantle.dir);
  const pap = 1.4 + s.papillae * 4.2;
  const contact = groundY !== undefined ? clamp(1 - (groundY - body.y) / 260) : 0;

  return (
    <g opacity={xray > 0 ? 1 - 0.72 * xray : undefined}>
      <defs>
        {refined && (
          <>
            <radialGradient id={`${id}-suck`} cx="0.4" cy="0.35" r="0.72">
              <stop offset="0" stopColor="#fff4ec" />
              <stop offset="0.55" stopColor={pal.sucker} />
              <stop offset="1" stopColor={pal.suckerRim} />
            </radialGradient>
            <radialGradient id={`${id}-cup`} cx="0.5" cy="0.6" r="0.6">
              <stop offset="0" stopColor={mixColor(pal.suckerRim, '#2a0c10', 0.55)} />
              <stop offset="1" stopColor={pal.suckerRim} />
            </radialGradient>
          </>
        )}
        <radialGradient id={`${id}-mantle`} gradientUnits="userSpaceOnUse" cx={hiC.x - 22} cy={hiC.y - 26} r={130}>
          <stop offset="0" stopColor={pal.highlight} />
          <stop offset="0.45" stopColor={pal.base} />
          <stop offset="1" stopColor={pal.shadow} />
        </radialGradient>
        <radialGradient id={`${id}-head`} gradientUnits="userSpaceOnUse" cx={head.cx - head.w * 0.35} cy={head.cy - head.h * 0.6} r={head.w * 1.6}>
          <stop offset="0" stopColor={pal.highlight} />
          <stop offset="0.5" stopColor={pal.base} />
          <stop offset="1" stopColor={pal.shadow} />
        </radialGradient>
        <radialGradient id={`${id}-bulge`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor={pal.highlight} />
          <stop offset="0.6" stopColor={pal.base} />
          <stop offset="1" stopColor={pal.shadow} />
        </radialGradient>
        <radialGradient id={`${id}-bulge-iris`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#fff0b0" />
          <stop offset="0.45" stopColor={skin.iris} />
          <stop offset="1" stopColor={skin.irisEdge} />
        </radialGradient>
        <linearGradient
          id={`${id}-rim`}
          gradientUnits="userSpaceOnUse"
          x1={hiC.x - uy * 80}
          y1={hiC.y + ux * 80}
          x2={hiC.x + uy * 80}
          y2={hiC.y - ux * 80}
        >
          <stop offset="0" stopColor={pal.rim} stopOpacity={0} />
          <stop offset="0.6" stopColor={pal.rim} stopOpacity={0} />
          <stop offset="1" stopColor={pal.rim} stopOpacity={0.75} />
        </linearGradient>
        <clipPath id={`${id}-mclip`}>
          <path d={mantlePath} />
        </clipPath>
        <radialGradient id={`${id}-contact`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#02040c" stopOpacity={0.55} />
          <stop offset="1" stopColor="#02040c" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* sombra de contacto sobre el sustrato */}
      {groundY !== undefined && contact > 0 && (
        <ellipse cx={body.x + 10} cy={groundY + 6} rx={190 * body.scale} ry={30 * body.scale} fill={`url(#${id}-contact)`} opacity={contact} />
      )}
      {pose.arms.map((a) => (
        <ArmShadow key={a.index} arm={a} refined={refined} />
      ))}
      {backArms.map((a) => (
        <Arm key={a.index} arm={a} pal={pal} s={s} suckers={q.suckersPerArm} id={id} refined={refined} />
      ))}
      <path d={webPath} fill={mixColor(pal.base, pal.shadow, 0.35)} stroke={pal.shadow} strokeOpacity={0.4} strokeWidth={1.5} />

      <g transform={tf}>
        {eyes[1].behind && <Eye eye={eyes[1]} pal={pal} s={s} gradId={`${id}-bulge`} papillae={s.papillae} refined={refined} />}
        {/* manto */}
        <path d={mantlePath} fill={`url(#${id}-mantle)`} />
        <g clipPath={`url(#${id}-mclip)`}>
          {spots.map((sp, i) => {
            const f = sp.u * M;
            const c = lerpIdx(mantle.axis, f);
            const hw = lerpNum(mantle.halfW, f);
            const x = c.x - uy * sp.v * hw;
            const y = c.y + ux * sp.v * hw;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={sp.rx}
                ry={sp.ry}
                transform={`rotate(${sp.rot} ${x.toFixed(1)} ${y.toFixed(1)})`}
                fill={sp.light ? pal.spotLight : pal.spotDark}
                opacity={(sp.light ? 0.4 : 0.5) * (0.35 + s.pattern * 0.8)}
              />
            );
          })}
          {/* pliegues longitudinales */}
          {[-0.45, 0, 0.45].map((v, i) => (
            <path
              key={i}
              d={smoothPath(mantle.axis.slice(2, M - 1).map((c, k) => {
                const hw = mantle.halfW[k + 2];
                return {x: c.x - uy * v * hw, y: c.y + ux * v * hw};
              }))}
              stroke={pal.shadow}
              strokeOpacity={0.18}
              strokeWidth={3}
              fill="none"
            />
          ))}
          <ellipse
            cx={hiC.x + uy * 22 - ux * 10}
            cy={hiC.y - ux * 22 - uy * 10}
            rx={18}
            ry={46}
            transform={`rotate(${((mantle.dir * 180) / Math.PI + 90).toFixed(1)} ${(hiC.x + uy * 22 - ux * 10).toFixed(1)} ${(hiC.y - ux * 22 - uy * 10).toFixed(1)})`}
            fill="#ffffff"
            opacity={0.14}
          />
          {refined &&
            [0, 1, 2].map((k) => {
              // reflejos de luz del agua que recorren el manto
              const cxk = hiC.x + Math.sin(pose.t * 0.7 + k * 2.1) * 38;
              const cyk = hiC.y + Math.cos(pose.t * 0.55 + k * 1.3) * 52;
              return (
                <ellipse
                  key={`c${k}`}
                  cx={cxk}
                  cy={cyk}
                  rx={20 + 6 * Math.sin(pose.t * 1.3 + k)}
                  ry={8}
                  transform={`rotate(${(pose.t * 12 + k * 60).toFixed(1)} ${cxk.toFixed(1)} ${cyk.toFixed(1)})`}
                  fill="#ffe9bf"
                  opacity={0.09 * (1 - s.camo * 0.6)}
                />
              );
            })}
          {clouds > 0.01 &&
            [0, 1, 2].map((k) => {
              // "nube pasajera": bandas oscuras que viajan por la piel durante el cambio de color
              const u = (pose.t * 0.55 + k / 3) % 1;
              const f = u * M;
              const c = lerpIdx(mantle.axis, f);
              const hw = lerpNum(mantle.halfW, f);
              return (
                <ellipse
                  key={`n${k}`}
                  cx={c.x}
                  cy={c.y}
                  rx={hw * 1.3}
                  ry={12 + 10 * Math.sin(u * Math.PI)}
                  transform={`rotate(${((mantle.dir * 180) / Math.PI + 90).toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`}
                  fill={pal.shadow}
                  opacity={clouds * 0.5 * Math.sin(u * Math.PI)}
                />
              );
            })}
        </g>
        <path d={mantlePath} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={3.5} />
        {/* papilas del contorno */}
        {mantle.outline.map((p, i) =>
          i % 2 === 0 ? <circle key={i} cx={p.x} cy={p.y} r={pap * (0.7 + 0.3 * Math.sin(i * 2.3))} fill={pal.base} /> : null,
        )}
        {/* cabeza */}
        <ellipse cx={head.cx} cy={head.cy} rx={head.w} ry={head.h} fill={`url(#${id}-head)`} />
        <path
          d={`M${head.cx - head.w * 0.7},${head.cy + head.h * 0.2} Q${head.cx},${head.cy + head.h * 0.55} ${head.cx + head.w * 0.7},${head.cy + head.h * 0.2}`}
          stroke={pal.shadow}
          strokeOpacity={0.3}
          strokeWidth={3}
          fill="none"
        />
        {/* sifón */}
        {siphon.visible > 0.01 && (
          <g opacity={siphon.visible} transform={`translate(${siphon.x} ${siphon.y}) rotate(${((siphon.ang * 180) / Math.PI).toFixed(2)})`}>
            <path d={`M0,-9 C${siphon.len * 0.5},-10 ${siphon.len},-7 ${siphon.len},-6 L${siphon.len},6 C${siphon.len},7 ${siphon.len * 0.5},10 0,9Z`} fill={pal.base} stroke={pal.shadow} strokeOpacity={0.5} strokeWidth={1.2} />
            <ellipse cx={siphon.len} cy={0} rx={2.5} ry={4 + siphon.open * 2} fill={pal.shadow} />
          </g>
        )}
        {!eyes[1].behind && <Eye eye={eyes[1]} pal={pal} s={s} gradId={`${id}-bulge`} papillae={s.papillae} refined={refined} />}
        <Eye eye={eyes[0]} pal={pal} s={s} gradId={`${id}-bulge`} papillae={s.papillae} refined={refined} />
      </g>

      {frontArms.map((a) => (
        <Arm key={a.index} arm={a} pal={pal} s={s} suckers={q.suckersPerArm} id={id} refined={refined} />
      ))}
    </g>
  );
};

/** Brillo especular de un ojo en la oscuridad (se dibuja por encima de sombras). */
export const EyeShine: React.FC<{pose: OctopusPose; strength: number}> = ({pose, strength}) => {
  if (strength <= 0.01) return null;
  const e = pose.eyes[0];
  const w = pose.toWorld(e.local);
  const r = e.r * pose.body.scale;
  const open = 1 - e.lid;
  return (
    <g opacity={strength}>
      <ellipse cx={w.x} cy={w.y} rx={r * 0.9} ry={r * 0.9 * Math.max(0.1, open)} fill="#e7c86a" opacity={0.55} />
      <rect x={w.x - r * 0.5 + e.pupil.x} y={w.y - r * 0.13} width={r} height={r * 0.26 * Math.max(0.1, open)} rx={r * 0.12} fill="#080608" />
      <circle cx={w.x - r * 0.32} cy={w.y - r * 0.32 * open} r={r * 0.2} fill="#ffffff" opacity={0.95 * open} />
    </g>
  );
};
