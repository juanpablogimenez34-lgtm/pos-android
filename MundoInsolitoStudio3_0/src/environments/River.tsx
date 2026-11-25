// ENTORNO 3D: río amazónico / bosque inundado. Unidades: metros. Superficie del agua en y = SURF.
//  · Agua: fondo con degradado (ámbar verdoso arriba → oscuro abajo) + niebla exponencial (absorción y turbidez).
//  · Lecho: lodo con textura procedural (sedimento, ondulaciones) y hojarasca instanciada.
//  · Troncos: loft cilíndrico con corteza en relieve (geometría + mapa de normales) y raíces tabulares que se abren.
//  · Raíces y ramas sumergidas: tubos a lo largo de curvas.
//  · Superficie vista desde abajo (ventana de Snell) con ondulación animada; haces de luz volumétricos (aditivos).
//  · Partículas en suspensión que derivan con la corriente; peces carácidos instanciados.
// Todo determinista (semillas fijas) y dependiente solo del tiempo.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {fbm2, hash, noise2} from '../lib/noise';

export const SURF = 3.6;
export const FLOOR = -1.2;

/** Textura procedural de lodo con ondulaciones y manchas. */
let MUD: THREE.DataTexture | null = null;
function mudTexture() {
  if (MUD) return MUD;
  const S = 512;
  const d = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      const u = i / S;
      const v = j / S;
      // ruido periódico en ambos ejes (textura sin costuras al repetirse): periódico en v por construcción y
      // en u por fundido entre F(u) y F(u − 1)
      const F = (uu: number, oct: number, seed: number, sc: number) => fbm2(uu * sc, v * sc, oct, seed, sc);
      const n = (1 - u) * F(u, 5, 3, 8) + u * F(u - 1, 5, 3, 8);
      const wn = (1 - u) * F(u, 2, 5, 6) + u * F(u - 1, 2, 5, 6);
      const rip = 0.5 + 0.5 * Math.sin((u * 40 + wn * 3) * Math.PI);
      const k = 0.55 + 0.35 * n + 0.08 * rip;
      const o = (j * S + i) * 4;
      d[o] = 92 * k;
      d[o + 1] = 76 * k;
      d[o + 2] = 50 * k;
      d[o + 3] = 255;
    }
  MUD = new THREE.DataTexture(d, S, S, THREE.RGBAFormat);
  MUD.wrapS = MUD.wrapT = THREE.RepeatWrapping;
  MUD.repeat.set(30, 30);
  MUD.colorSpace = THREE.SRGBColorSpace;
  MUD.generateMipmaps = true;
  MUD.minFilter = THREE.LinearMipmapLinearFilter;
  MUD.magFilter = THREE.LinearFilter;
  MUD.needsUpdate = true;
  return MUD;
}
/** Corteza: color y normales (estrías verticales irregulares). */
let BARK: {map: THREE.DataTexture; normalMap: THREE.DataTexture} | null = null;
function barkTextures() {
  if (BARK) return BARK;
  const S = 512;
  const c = new Uint8Array(S * S * 4);
  const h = new Float32Array(S * S);
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      const u = i / S;
      const v = j / S;
      const fib = Math.abs(Math.sin((u * 26 + fbm2(u * 4, v * 2, 4, 9, 2) * 2.2) * Math.PI));
      const knot = fbm2(u * 10, v * 6, 3, 13, 6);
      const ht = fib * 0.7 + knot * 0.5;
      h[j * S + i] = ht;
      const k = 0.45 + 0.4 * ht;
      const o = (j * S + i) * 4;
      c[o] = 86 * k + 10;
      c[o + 1] = 70 * k + 8;
      c[o + 2] = 50 * k + 6;
      c[o + 3] = 255;
    }
  const n = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      const g = (x: number, y: number) => h[((y + S) % S) * S + ((x + S) % S)];
      const nx = -(g(i + 1, j) - g(i - 1, j)) * 4;
      const ny = -(g(i, j + 1) - g(i, j - 1)) * 4;
      const l = Math.hypot(nx, ny, 1);
      const o = (j * S + i) * 4;
      n[o] = (nx / l * 0.5 + 0.5) * 255;
      n[o + 1] = (ny / l * 0.5 + 0.5) * 255;
      n[o + 2] = (1 / l * 0.5 + 0.5) * 255;
      n[o + 3] = 255;
    }
  const mk = (data: Uint8Array, srgb: boolean) => {
    const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 3);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  BARK = {map: mk(c, true), normalMap: mk(n, false)};
  return BARK;
}

/** Tronco con raíces tabulares: loft de secciones irregulares desde el lecho hasta por encima de la superficie. */
function trunkGeometry(r: number, seed: number) {
  const NS = 40;
  const NP = 36;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const y0 = FLOOR - 0.1;
  const y1 = SURF + 30; // continúa muy por encima de la superficie (se pierde en la luz)
  for (let i = 0; i <= NS; i++) {
    const v = i / NS;
    const y = y0 + (y1 - y0) * v;
    const base = Math.max(0, 1 - (y - FLOOR) / 1.4); // ensanchamiento de la base
    for (let k = 0; k <= NP; k++) {
      const a = (k / NP) * Math.PI * 2;
      // contrafuertes: lóbulos radiales que se abren cerca del lecho
      const lobes = Math.pow(Math.max(0, Math.cos(a * 5 + seed)), 6) * base * base * r * 3.2;
      const rr = r * (1 + 0.08 * noise2(a * 2, y * 0.8, seed) + 0.05 * Math.sin(a * 13 + y * 3)) + lobes + base * r * 0.4;
      pos.push(Math.cos(a) * rr, y, Math.sin(a) * rr);
      uv.push(k / NP, y * 0.5);
    }
  }
  for (let i = 0; i < NS; i++)
    for (let k = 0; k < NP; k++) {
      const a = i * (NP + 1) + k;
      const b = a + NP + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export type TreeSpec = {x: number; z: number; r: number; seed: number};
export type RootSpec = {pts: [number, number, number][]; r: number};

/** Haces de luz: conos aditivos con degradado vertical, desplazados por el oleaje. */
const RayMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {col: {value: new THREE.Color('#ffe2a0')}, k: {value: 0.1}},
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 col; uniform float k; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float edge = pow(abs(dot(vN, vV)), 2.0); float fall = smoothstep(0.0, 0.6, vY) * (1.0 - smoothstep(0.92, 1.0, vY)); gl_FragColor = vec4(col * k * fall * edge, 1.0); }',
  });

export const River: React.FC<{t: number; trees?: TreeSpec[]; roots?: RootSpec[]; murk?: number; rays?: boolean; fish?: {n: number; center: [number, number, number]; radius: number; scare?: number; threat?: [number, number, number]}[]; floorShadow?: boolean}> = ({t, trees = [], roots = [], murk = 0.3, rays = true, fish = [], floorShadow = true}) => {
  const mud = useMemo(() => mudTexture(), []);
  const bark = useMemo(() => barkTextures(), []);
  const barkMat = useMemo(() => new THREE.MeshStandardMaterial({map: bark.map, normalMap: bark.normalMap, normalScale: new THREE.Vector2(1.4, 1.4), roughness: 0.92}), [bark]);
  const trunkGs = useMemo(() => trees.map((tr) => trunkGeometry(tr.r, tr.seed)), [trees]);
  const rootGs = useMemo(() => roots.map((r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(r.pts.map((p) => new THREE.Vector3(...p))), 48, r.r, 10, false)), [roots]);
  const bg = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {top: {value: new THREE.Color('#a8a85a')}, mid: {value: new THREE.Color('#4a5a2c')}, bot: {value: new THREE.Color('#3e4a24')}, murk: {value: murk}},
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform float murk; varying vec3 vP; void main(){ float y = vP.y; vec3 c = y > 0.0 ? mix(mid, top, smoothstep(0.0, 0.85, y)) : mix(mid, bot, smoothstep(0.0, 0.6, -y)); c = mix(c, vec3(0.28,0.27,0.16), murk*0.4); gl_FragColor = vec4(c, 1.0); }',
      }),
    [murk],
  );
  const surfaceMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: {t: {value: 0}, fogC: {value: new THREE.Color('#4a5a2c')}},
        vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: 'uniform float t; uniform vec3 fogC; varying vec2 vU; varying vec3 vW; void main(){ float r = length(vW.xz - cameraPosition.xz); float snell = smoothstep(9.0, 2.0, r); float w = sin(vW.x*3.1 + t*1.3)*0.5 + sin(vW.z*2.3 - t*1.7)*0.5 + sin((vW.x+vW.z)*5.7 + t*2.1)*0.3; float caust = smoothstep(0.9, 1.3, w); vec3 c = mix(vec3(0.5,0.54,0.28), vec3(0.98,0.94,0.72), snell) + caust * 0.06; float dd = length(vW - cameraPosition); c = mix(fogC * 1.4, c, exp(-dd * 0.045)); gl_FragColor = vec4(c, 0.85); }',
      }),
    [],
  );
  surfaceMat.uniforms.t.value = t;
  const rayMat = useMemo(() => RayMaterial(), []);
  const leafG = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.05, 0.05, 0, 0.14);
    s.quadraticCurveTo(-0.05, 0.05, 0, 0);
    return new THREE.ShapeGeometry(s, 6);
  }, []);
  const leaves = useMemo(() => {
    const m = new THREE.InstancedMesh(leafG, new THREE.MeshStandardMaterial({color: '#7a5a28', roughness: 0.9, side: THREE.DoubleSide}), 900);
    const col = new THREE.Color();
    for (let i = 0; i < 900; i++) {
      const x = (hash(i * 3.1) - 0.5) * 30;
      const z = (hash(i * 5.3) - 0.5) * 30;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + (hash(i) - 0.5) * 0.4, hash(i * 7) * 6.28, 0));
      m.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, FLOOR + 0.012 + hash(i * 9) * 0.01, z), q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + hash(i * 11))));
      m.setColorAt(i, col.set(['#6a4a1e', '#8a6224', '#4e3a18', '#9a7a3a'][i % 4]));
    }
    m.receiveShadow = true;
    return m;
  }, [leafG]);
  // partículas: posiciones deterministas que derivan con la corriente
  const NPART = 1400;
  const partGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const pp = new Float32Array(NPART * 3);
  for (let i = 0; i < NPART; i++) {
    const span = 16;
    pp[i * 3] = ((hash(i * 1.7) * span + t * 0.12 * (0.5 + hash(i))) % span) - span / 2;
    pp[i * 3 + 1] = FLOOR + ((hash(i * 2.9) * (SURF - FLOOR) + Math.sin(t * 0.3 + i) * 0.05 + 10) % (SURF - FLOOR));
    pp[i * 3 + 2] = (hash(i * 4.3) - 0.5) * 14;
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  // partículas redondas y suaves (sprite radial), nunca cuadrados
  const partMat = useMemo(() => {
    const S = 64;
    const d = new Uint8Array(S * S * 4);
    for (let j = 0; j < S; j++)
      for (let i = 0; i < S; i++) {
        const r = Math.hypot(i - S / 2 + 0.5, j - S / 2 + 0.5) / (S / 2);
        const a = Math.max(0, 1 - r) ** 2;
        const o = (j * S + i) * 4;
        d[o] = d[o + 1] = d[o + 2] = 255;
        d[o + 3] = a * 255;
      }
    const tex = new THREE.DataTexture(d, S, S, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return new THREE.PointsMaterial({color: '#e8dca8', size: 0.022, map: tex, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false});
  }, []);
  return (
    <>
      <fogExp2 attach="fog" args={['#4a5a2c', 0.04 + murk * 0.1]} />
      <mesh material={bg}>
        <sphereGeometry args={[160, 32, 16]} />
      </mesh>
      {/* luz del sol filtrada por el dosel y el agua */}
      <hemisphereLight args={['#e0d898', '#3a3420', 1.0]} />
      <directionalLight position={[2, 9, 3]} intensity={2.4} color="#ffe6b0" castShadow={floorShadow} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-camera-far={40} shadow-bias={-0.0005} shadow-radius={5} />
      <directionalLight position={[-4, 2, -5]} intensity={0.9} color="#c8e0d0" />
      <directionalLight position={[0, 1, 8]} intensity={0.55} color="#ffe8e0" />
      {/* lecho */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, 0]} receiveShadow>
        <planeGeometry args={[300, 300, 1, 1]} />
        <meshStandardMaterial map={mud} roughness={0.95} />
      </mesh>
      <primitive object={leaves} />
      {/* superficie vista desde abajo */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, SURF, 0]} material={surfaceMat}>
        <planeGeometry args={[300, 300, 1, 1]} />
      </mesh>
      {/* troncos y raíces */}
      {trees.map((tr, i) => <mesh key={`t${i}`} geometry={trunkGs[i]} material={barkMat} position={[tr.x, 0, tr.z]} castShadow receiveShadow />)}
      {roots.map((r, i) => <mesh key={`r${i}`} geometry={rootGs[i]} material={barkMat} castShadow receiveShadow />)}
      {/* haces de luz */}
      {rays &&
        Array.from({length: 7}, (_, i) => {
          const x = (hash(i * 13) - 0.5) * 9 + Math.sin(t * 0.2 + i) * 0.3;
          const z = (hash(i * 17) - 0.5) * 6 - 1;
          return (
            <mesh key={`ray${i}`} material={rayMat} position={[x + 0.6, (SURF + FLOOR) / 2, z]} rotation={[0, 0, 0.18]}>
              <cylinderGeometry args={[0.35 + hash(i) * 0.3, 1.0 + hash(i * 3) * 0.6, SURF - FLOOR, 24, 1, true]} />
            </mesh>
          );
        })}
      <points geometry={partGeo} material={partMat} />
      {fish.map((s, k) => <School key={k} t={t} {...s} seed={k} />)}
    </>
  );
};

/** Carácido de agua dulce (plateado, banda oscura, cola roja): malla procedural con cola que bate. */
const fishGeo = (() => {
  let g: THREE.BufferGeometry | null = null;
  return () => {
    if (g) return g;
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      pts.push(new THREE.Vector2(Math.sin(u * Math.PI) * 0.018 * (1 - 0.35 * u), (u - 0.5) * 0.09));
    }
    g = new THREE.LatheGeometry(pts, 12);
    g.rotateZ(-Math.PI / 2);
    g.scale(1, 1.25, 0.55);
    return g;
  };
})();
const School: React.FC<{t: number; n: number; center: [number, number, number]; radius: number; scare?: number; threat?: [number, number, number]; seed: number}> = ({t, n, center, radius, scare = 0, threat, seed}) => {
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#c8d0cc', metalness: 0.6, roughness: 0.3, clearcoat: 0.5}), []);
  const tailM = useMemo(() => new THREE.MeshStandardMaterial({color: '#d84a30', roughness: 0.5, side: THREE.DoubleSide}), []);
  const tailG = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(-0.03, 0.018);
    s.lineTo(-0.024, 0);
    s.lineTo(-0.03, -0.018);
    s.lineTo(0, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const ph = hash(seed * 31 + i) * Math.PI * 2;
        const rr = radius * (0.3 + hash(seed * 17 + i) * 0.7);
        const sp = 0.35 + hash(i * 3) * 0.2;
        const a = ph + t * sp;
        let x = center[0] + Math.cos(a) * rr;
        const y = center[1] + Math.sin(ph * 1.7 + t * 0.4) * radius * 0.25;
        let z = center[2] + Math.sin(a) * rr * 0.6;
        let heading = Math.atan2(-Math.cos(a) * 0.6, -Math.sin(a));
        if (threat && scare > 0) {
          const dx = x - threat[0];
          const dz = z - threat[2];
          const d = Math.hypot(dx, dz) || 1;
          const push = scare * 1.6 * Math.max(0, 1 - d / (radius * 3));
          x += (dx / d) * push;
          z += (dz / d) * push;
          if (push > 0.05) heading = Math.atan2(-dz, dx);
        }
        const beat = Math.sin(t * (12 + scare * 10) + i) * 0.35;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, heading, 0]} scale={1 + hash(i * 5) * 0.4}>
            <mesh geometry={fishGeo()} material={body} castShadow />
            <mesh geometry={tailG} material={tailM} position={[-0.045, 0, 0]} rotation={[0, beat, 0]} />
          </group>
        );
      })}
    </>
  );
};
