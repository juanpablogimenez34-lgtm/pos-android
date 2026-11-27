// PUMA (React Three Fiber): ensambla esqueleto + mallas + materiales NPR. Recibe una pose y la edad.
import React, {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {clamp, lerp, smooth} from '../../../lib/noise';
import {LegId, LEGS, Pose, solve, Species, growPuma} from '../anatomy/rig';
import {flatToon, furMaterial, outlineMaterial} from '../anatomy/npr';
import {v3} from '../anatomy/mesh';
import {
  buildEar, buildHead, buildJaw, buildLeg, buildPaw, buildTail, buildTorso, EYE_PHI, EYE_U, headShape, headSurface, headTexture, JAW_PIVOT,
  legTexture, padTexture, pawTexture, tailTexture, torsoTexture,
} from './pumaBody';

type Props = {pose: Pose; age?: number; sp?: Species; outline?: boolean; eyeShine?: number; rim?: string; castShadow?: boolean; xray?: number};

/** Textura del ojo (proyección frontal): iris ámbar (adulto) o azul (cachorro), pupila redonda, anillo limbal. */
const irisCache = new Map<string, THREE.DataTexture>();
function irisTexture(age: number, pupil: number) {
  const key = `${Math.round(age * 10)}-${Math.round(pupil * 10)}`;
  const h = irisCache.get(key);
  if (h) return h;
  const N = 256;
  const d = new Uint8Array(N * N * 4);
  const adult = smooth(0.45, 0.85, age);
  const cIn = new THREE.Color().lerpColors(new THREE.Color('#8fb4d6'), new THREE.Color('#b9a548'), adult);
  const cOut = new THREE.Color().lerpColors(new THREE.Color('#5c7fa6'), new THREE.Color('#c48a2c'), adult);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const u = (x / (N - 1)) * 2 - 1;
      const v = (y / (N - 1)) * 2 - 1;
      const r = Math.hypot(u, v) / 0.86;
      const a = Math.atan2(v, u);
      let c = new THREE.Color();
      if (r < pupil) c.set('#050403');
      else if (r < 1) {
        const t = (r - pupil) / (1 - pupil);
        c.lerpColors(cIn, cOut, t);
        const streak = 0.85 + 0.15 * Math.sin(a * 40 + Math.sin(a * 7) * 2) * Math.sin(r * 18);
        c.multiplyScalar(streak * (1 - 0.35 * smooth(0.85, 1, r)));
      } else c.set('#2a1d12');
      d.set([Math.pow(c.r, 1 / 2.2) * 255, Math.pow(c.g, 1 / 2.2) * 255, Math.pow(c.b, 1 / 2.2) * 255, 255], (y * N + x) * 4);
    }
  const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  irisCache.set(key, t);
  return t;
}
/** Esfera con UV proyectadas desde delante (+x local). */
function eyeGeometry() {
  const g = new THREE.SphereGeometry(1, 32, 24);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const uv = g.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, -p.getZ(i) * 0.5 + 0.5, p.getY(i) * 0.5 + 0.5);
  g.rotateY(0); // el polo de la esfera no importa: la proyección es frontal
  return g;
}

/** Bigotes: líneas curvas desde las almohadillas del hocico (coordenadas locales de la cabeza). */
function whiskerGeometry(age: number) {
  const H = headShape(age);
  const pts: number[] = [];
  for (const side of [1, -1])
    for (let k = 0; k < 11; k++) {
      // nacen en filas sobre la cara externa de las almohadillas
      const row = Math.floor(k / 3);
      const o = v3(0.09 + 0.077 * H.mz - 0.006 + (k % 3) * 0.007, -0.01 - row * 0.0055, side * (0.02 + 0.0215 - row * 0.001));
      const len = (0.075 + (k % 4) * 0.012) * lerp(0.75, 1, age);
      const dir = v3(-0.35, -0.12 - Math.floor(k / 3) * 0.08, side).normalize();
      let prev = o.clone();
      for (let s = 1; s <= 7; s++) {
        const u = s / 7;
        const p = o.clone().addScaledVector(dir, len * u).add(v3(0, -len * 0.25 * u * u, 0));
        pts.push(prev.x, prev.y, prev.z, p.x, p.y, p.z);
        prev = p;
      }
    }
  // vibrisas superciliares
  for (const side of [1, -1])
    for (let k = 0; k < 2; k++) {
      const o = headSurface(0.1 + k * 0.006, side > 0 ? 0.62 : Math.PI * 2 - 0.62, H);
      const dir = v3(-0.2, 0.6, side * 0.8).normalize();
      let prev = o.clone();
      for (let s = 1; s <= 5; s++) {
        const p = o.clone().addScaledVector(dir, 0.045 * (s / 5)).add(v3(-0.01 * (s / 5) ** 2, 0, 0));
        pts.push(prev.x, prev.y, prev.z, p.x, p.y, p.z);
        prev = p;
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Normal aproximada de la superficie de la cabeza. */
function headNormal(xa: number, phi: number, age: number) {
  const H = headShape(age);
  const a = headSurface(xa - 0.002, phi, H);
  const b = headSurface(xa + 0.002, phi, H);
  const c = headSurface(xa, phi - 0.02, H);
  const d = headSurface(xa, phi + 0.02, H);
  const n = new THREE.Vector3().crossVectors(b.sub(a), d.sub(c)).normalize();
  const p = headSurface(xa, phi, H);
  // hacia fuera respecto al eje
  if (n.dot(v3(0, p.y, p.z)) < 0) n.negate();
  return n;
}

export const Puma: React.FC<Props> = ({pose, age = 1, sp, outline = true, eyeShine = 0, rim = '#ffd59a', castShadow = true}) => {
  const S = sp ?? growPuma(age);
  const sk = solve(S, pose);
  const ref = useRef<{torso?: THREE.BufferGeometry; tail?: THREE.BufferGeometry; legs: Partial<Record<LegId, THREE.BufferGeometry>>}>({legs: {}});
  const R = ref.current;
  R.torso = buildTorso(sk, pose.breathe, R.torso);
  R.tail = buildTail(sk, R.tail);
  for (const id of LEGS) R.legs[id] = buildLeg(sk, id, pose.heading, R.legs[id]);

  const ak = Math.round(clamp(age) * 20) / 20;
  const mats = useMemo(() => {
    const t = torsoTexture(ak);
    const l = legTexture(ak);
    const ta = tailTexture(ak);
    const h = headTexture(ak);
    const pw = pawTexture(ak);
    return {
      torso: furMaterial(t.map, t.normalMap, rim),
      leg: furMaterial(l.map, l.normalMap, rim),
      tail: furMaterial(ta.map, ta.normalMap, rim),
      head: furMaterial(h.map, h.normalMap, rim, 0.45, 0.4),
      paw: furMaterial(pw.map, pw.normalMap, rim, 0.4, 0.4),
      earIn: flatToon(age < 0.4 ? '#cbb69c' : '#c9b49a'),
      earBack: flatToon(age < 0.4 ? '#5a4a3c' : '#3e3129'),
      nose: flatToon('#8e5450'),
      nostril: flatToon('#2e1b18'),
      mouth: flatToon('#7a3a3a'),
      tooth: flatToon('#efe8d8'),
      lid: flatToon(age < 0.2 ? '#8a6c50' : '#4a3426'),
      jaw: furMaterial(h.map, h.normalMap, rim, 0.4, 0.3),
      padL: furMaterial(padTexture(ak, 1).map, null, rim, 0.3),
      padR: furMaterial(padTexture(ak, -1).map, null, rim, 0.3),
      chin: flatToon('#ece4d6'),
      tongue: flatToon('#b0605c'),
    };
  }, [ak, rim, age]);
  const statics = useMemo(() => {
    const H = headShape(ak);
    return {
      head: buildHead(H),
      jaw: buildJaw(H),
      earF: buildEar(false),
      earB: buildEar(true),
      eye: eyeGeometry(),
      whisk: whiskerGeometry(ak),
      pawF: buildPaw(S.paw * 0.85, 0.095 * S.legR, 0.042 * S.legR, true),
      pawH: buildPaw(S.paw * 1.05, 0.084 * S.legR, 0.04 * S.legR, false),
      lid: new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      ball: new THREE.SphereGeometry(1, 28, 20),
    };
  }, [ak, S.paw, S.legR]);

  const ow = 0.0024 * (S.torso / 0.66) ** 0.6;
  const olBody = outlineMaterial(ow);
  const olHead = outlineMaterial(0.0022 / Math.max(0.3, S.head) * (S.head ** 0.6));
  const H = headShape(ak);

  // ---- ojos: posición en la superficie del cráneo y párpados
  const eyeR = 0.0165 * lerp(1.3, 1, smooth(0.15, 0.9, age));
  const pupil = clamp(0.32 + eyeShine * 0.35, 0.2, 0.75);
  const iris = irisTexture(age, pupil);
  const eyeMat = useMemo(() => new THREE.MeshPhysicalMaterial({map: iris, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, emissive: new THREE.Color('#6a8a3a'), emissiveIntensity: 0}), [iris]);
  eyeMat.emissiveIntensity = eyeShine * 1.6;
  const blink = Math.max(pose.blink, age < 0.08 ? 1 : 0);
  const eyes = [1, -1].map((side) => {
    const ph = side > 0 ? EYE_PHI : Math.PI * 2 - EYE_PHI;
    const s = headSurface(EYE_U, ph, H);
    const n = headNormal(EYE_U, ph, ak);
    const c = s.clone().addScaledVector(n, -eyeR * 0.6);
    // mirada: hacia delante y algo hacia fuera (visión binocular), con el giro de los ojos
    const gaze = v3(Math.cos(pose.eyeYaw * 0.4), 0.02, side * 0.32 + Math.sin(pose.eyeYaw * 0.4)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(v3(1, 0, 0), gaze);
    return {c, q, side};
  });
  const lidAngle = (b: number) => lerp(150, 4, b) * (Math.PI / 180);

  // ---- orejas
  const earSize = 0.046 * lerp(1.25, 1, smooth(0.2, 0.9, age));
  const ears = [1, -1].map((side) => {
    const base = headSurface(0.03, side > 0 ? 0.8 : Math.PI * 2 - 0.8, H);
    const swivel = (side > 0 ? pose.earL : pose.earR) * 0.6;
    const e = new THREE.Euler(side * 0.5, side * (0.8 - swivel), -0.2, 'YXZ');
    return {p: base.add(v3(-0.006, -0.008, 0)), q: new THREE.Quaternion().setFromEuler(e), side};
  });

  // ---- pies
  const paws = LEGS.map((id) => {
    const J = sk.legs[id];
    const heel = J[J.length - 2];
    const toe = J[J.length - 1];
    const lp = pose.legs[id];
    const hh = (id[1] === 'H' ? 0.012 : 0.01) * S.legR;
    let X = toe.clone().sub(heel);
    X.y = 0;
    X = X.lengthSq() < 1e-10 ? v3(Math.cos(pose.heading), 0, -Math.sin(pose.heading)) : X.normalize();
    const Z = new THREE.Vector3().crossVectors(X, v3(0, 1, 0)).normalize();
    const pitch = -lp.pawPitch * 0.75;
    const Xr = X.clone().applyAxisAngle(Z, pitch);
    const Yr = new THREE.Vector3().crossVectors(Z, Xr).normalize();
    const O = heel.clone().addScaledVector(Yr, -hh);
    const m = new THREE.Matrix4().makeBasis(Xr, Yr, Z).setPosition(O);
    return {id, m};
  });

  const jawRot = -clamp(pose.jaw) * 0.55;
  const headQ = sk.head.q;
  const hs = S.head;
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, ol?: THREE.Material, key?: string) => (
    <React.Fragment key={key}>
      <mesh geometry={geo} material={mat} castShadow={castShadow} receiveShadow />
      {outline && ol ? <mesh geometry={geo} material={ol} /> : null}
    </React.Fragment>
  );
  return (
    <group>
      {mesh(R.torso, mats.torso, olBody)}
      {mesh(R.tail, mats.tail, olBody)}
      {LEGS.map((id) => mesh(R.legs[id]!, mats.leg, olBody, id))}
      {paws.map(({id, m}) => (
        <group key={`paw-${id}`} matrixAutoUpdate={false} matrix={m}>
          {mesh(id[1] === 'F' ? statics.pawF : statics.pawH, mats.paw, olBody)}
        </group>
      ))}
      <group position={sk.head.p} quaternion={headQ} scale={hs}>
        {mesh(statics.head, mats.head, olHead)}
        <group position={JAW_PIVOT} rotation={[0, 0, jawRot]}>
          {mesh(statics.jaw, mats.jaw, olHead)}
          <mesh geometry={statics.ball} position={[0.07, -0.002, 0]} scale={[0.055 * H.mz, 0.006, 0.02]} material={mats.tongue} />
          <mesh geometry={statics.ball} position={[0.06 + 0.062 * H.mz, -0.016, 0]} scale={[0.016, 0.013, 0.018]} material={mats.chin} />
          {[1, -1].map((s) => (
            <mesh key={s} position={[0.06 + 0.05 * H.mz, 0.0, s * 0.014]} rotation={[0, 0, 0]} material={mats.tooth} scale={[0.0035, 0.014, 0.0035]}>
              <coneGeometry args={[1, 1, 8]} />
            </mesh>
          ))}
        </group>
        {/* almohadillas de los bigotes (hocico de felino en «W») */}
        {[1, -1].map((s) => (
          <mesh key={`pad${s}`} geometry={statics.ball} material={s > 0 ? mats.padL : mats.padR} position={[0.09 + 0.077 * H.mz, -0.02, s * 0.02]} scale={[0.024 * H.mz, 0.022, 0.024]} castShadow />
        ))}
        {/* paladar (visible solo con la boca abierta) y caninos superiores */}
        <mesh geometry={statics.ball} position={[0.115, -0.047, 0]} scale={[0.058 * H.mz, 0.004, 0.03]} material={mats.mouth} />
        {[1, -1].map((s) => (
          <mesh key={s} position={[0.09 + 0.07 * H.mz, -0.046, s * 0.016]} rotation={[Math.PI, 0, 0]} material={mats.tooth} scale={[0.0038, 0.016, 0.0038]}>
            <coneGeometry args={[1, 1, 8]} />
          </mesh>
        ))}
        {/* nariz rosada oscura con orificios */}
        <group position={[0.09 + 0.093 * H.mz, 0.012, 0]}>
          <mesh scale={[0.012, 0.012, 0.021]} material={mats.nose}>
            <sphereGeometry args={[1, 20, 14]} />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0.007, -0.003, s * 0.007]} scale={[0.004, 0.003, 0.0045]} material={mats.nostril}>
              <sphereGeometry args={[1, 10, 8]} />
            </mesh>
          ))}
        </group>
        {eyes.map(({c, q, side}) => (
          <group key={side} position={c} quaternion={q}>
            <mesh geometry={statics.eye} material={eyeMat} scale={eyeR} />
            {/* párpado superior (móvil) e inferior */}
            <mesh geometry={statics.lid} material={mats.lid} scale={eyeR * 1.035} rotation={[0, 0, lidAngle(blink) - Math.PI / 2]} />
            <mesh geometry={statics.lid} material={mats.lid} scale={eyeR * 1.03} rotation={[0, 0, (-112 + blink * 20) * (Math.PI / 180) - Math.PI / 2]} />
          </group>
        ))}
        {ears.map(({p, q, side}) => (
          <group key={side} position={p} quaternion={q} scale={earSize}>
            <mesh geometry={statics.earF} material={mats.earIn} castShadow />
            <mesh geometry={statics.earB} material={mats.earBack} castShadow />
          </group>
        ))}
        <lineSegments geometry={statics.whisk}>
          <lineBasicMaterial color="#f6f2ea" transparent opacity={0.85} />
        </lineSegments>
      </group>
    </group>
  );
};
export const _unused = {v3};
