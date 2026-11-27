// PERSONAJE 3D: delfín rosado (Inia geoffrensis). Cuerpo continuo + boca interior + dientes + ojos + aletas + cola.
// Toda la geometría se recalcula a partir de la pose en cada fotograma (render determinista e independiente).
import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {buildBody, buildMouth, eyeFrame, flipperGeometry, flipperMatrix, flukeFlex, flukeGeometry, flukeMatrix, IniaPose, teethMatrices} from './model';
import {finSkin, iniaSkin} from './skin';

/** Material de piel: mate-satinado, con capa húmeda (clearcoat) y brillo de borde rosado (simula dispersión subsuperficial). */
function skinMaterial(maps: ReturnType<typeof iniaSkin>, wet: number) {
  return new THREE.MeshPhysicalMaterial({
    map: maps.map,
    normalMap: maps.normalMap,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughnessMap: maps.roughnessMap,
    roughness: 1,
    metalness: 0,
    clearcoat: 0.25 + wet * 0.55,
    clearcoatRoughness: 0.45 - wet * 0.25,
    sheen: 0.45,
    sheenColor: new THREE.Color('#ff9a96'),
    sheenRoughness: 0.6,
    side: THREE.DoubleSide, // el interior de las mandíbulas solo se ve con la boca abierta
  });
}

const EYE_TEX = (() => {
  let t: THREE.DataTexture | null = null;
  return () => {
    if (t) return t;
    const S = 256;
    const d = new Uint8Array(S * S * 4);
    for (let j = 0; j < S; j++)
      for (let i = 0; i < S; i++) {
        // la esfera se mapea por (u, v); el iris ocupa el casquete frontal (v alrededor del polo +z por rotación)
        const u = i / S;
        const v = j / S;
        const r = v; // distancia al polo frontal
        const o = (j * S + i) * 4;
        let c = [70, 52, 46];
        if (r < 0.42) c = [72, 44, 30]; // iris pardo oscuro
        if (r < 0.42) {
          const fib = 0.75 + 0.25 * Math.sin(u * Math.PI * 2 * 40);
          c = c.map((x) => x * fib) as number[];
        }
        if (r < 0.2) c = [6, 5, 5]; // pupila
        if (r > 0.4 && r < 0.44) c = [30, 20, 16];
        d[o] = c[0];
        d[o + 1] = c[1];
        d[o + 2] = c[2];
        d[o + 3] = 255;
      }
    t = new THREE.DataTexture(d, S, S, THREE.RGBAFormat);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
})();

export const IniaDolphin: React.FC<{pose: IniaPose; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; wet?: number; castShadow?: boolean}> = ({pose, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, wet = 0.4, castShadow = true}) => {
  const ageKey = Math.round(pose.age * 20) / 20;
  const maps = useMemo(() => iniaSkin(ageKey), [ageKey]);
  const fins = useMemo(() => finSkin(ageKey), [ageKey]);
  const skin = useMemo(() => skinMaterial(maps, wet), [maps, wet]);
  const finMat = useMemo(() => {
    const m = skinMaterial(fins, wet);
    m.side = THREE.DoubleSide;
    return m;
  }, [fins, wet]);
  const mouthMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#7e3d46', roughness: 0.55, side: THREE.DoubleSide}), []);
  const toothMat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#e6dcc6', roughness: 0.38, clearcoat: 0.4}), []);
  const eyeMat = useMemo(() => new THREE.MeshPhysicalMaterial({map: EYE_TEX(), roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05}), []);
  const lidMat = skin;

  const {body, frames, head} = useMemo(() => {
    const b = buildBody(pose);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(b.buffers.position, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(b.buffers.normal, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(b.buffers.uv, 2));
    g.setIndex(new THREE.BufferAttribute(b.buffers.index, 1));
    g.computeBoundingSphere();
    return {body: g, frames: b.frames, head: b.head};
  }, [pose]);
  const mouth = useMemo(() => {
    if (pose.jaw < 0.01) return null;
    const m = buildMouth(pose, head);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(m.position, 3));
    g.setIndex(new THREE.BufferAttribute(m.index, 1));
    g.computeVertexNormals();
    return g;
  }, [pose, head]);
  const flipG = useMemo(() => flipperGeometry(), []);
  const flex = Math.round(flukeFlex(pose) * 100) / 100;
  const flukeG = useMemo(() => flukeGeometry(flex), [flex]);
  const toothG = useMemo(() => new THREE.ConeGeometry(0.0028, 0.0085, 8), []);
  const teeth = useMemo(() => {
    if (pose.jaw < 0.01) return null;
    const mats = teethMatrices(pose, head);
    const im = new THREE.InstancedMesh(toothG, toothMat, mats.length);
    mats.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, [pose, head, toothG, toothMat]);
  useEffect(() => () => body.dispose(), [body]);
  useEffect(() => () => mouth?.dispose(), [mouth]);

  const mL = flipperMatrix(frames, 1, pose.flipL, pose.age);
  const mR = flipperMatrix(frames, -1, pose.flipR, pose.age);
  const mF = flukeMatrix(frames, pose);
  const eyes = ([1, -1] as (1 | -1)[]).map((side) => eyeFrame(head, side));
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[pose.roll, 0, 0]}>
        <mesh geometry={body} material={skin} castShadow={castShadow} receiveShadow />
        {mouth && <mesh geometry={mouth} material={mouthMat} />}
        {teeth && <primitive object={teeth} />}
        <mesh geometry={flipG} material={finMat} matrix={mL} matrixAutoUpdate={false} castShadow={castShadow} receiveShadow />
        <mesh geometry={flipG} material={finMat} matrix={mR} matrixAutoUpdate={false} castShadow={castShadow} receiveShadow />
        <mesh geometry={flukeG} material={finMat} matrix={mF} matrixAutoUpdate={false} castShadow={castShadow} receiveShadow />
        {eyes.map((e, i) => {
          // el globo ocular mira a lo largo de la normal de la superficie (+ dirección de la mirada)
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), e.n.clone().normalize());
          const gaze = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pose.eyeYaw * (i === 0 ? 1 : -1) * 0.4);
          const qq = q.clone().multiply(gaze).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
          return (
            <group key={i}>
              <mesh position={e.p} quaternion={qq} material={eyeMat}>
                <sphereGeometry args={[0.0105, 32, 24]} />
              </mesh>
              {/* párpados: anillo de piel alrededor del ojo; se cierra (escala) al parpadear */}
              <mesh position={e.p.clone().addScaledVector(e.n, 0.0015)} quaternion={q} material={lidMat} scale={[1, 1 - 0.9 * pose.blink, 1]}>
                <torusGeometry args={[0.0108, 0.0038, 12, 32]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};
