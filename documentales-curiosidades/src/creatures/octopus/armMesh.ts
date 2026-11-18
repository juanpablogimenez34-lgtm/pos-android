import * as THREE from 'three';
import { armRadius, RADIAL_SEGMENTS, SPINE_POINTS, SUCKERS_PER_ARM } from './anatomy';
import { ArmSpine } from './armSolver';

const RING = RADIAL_SEGMENTS + 1;
/** Aplanamiento de la cara ventral (los brazos no son tubos perfectos). */
const VENTRAL_SQUASH = 0.8;
/** Radio de referencia para la coordenada de patrón de la piel. */
const BASE_SKIN_R = 0.03;

/**
 * Malla tubular de un brazo, regenerada cada fotograma a partir de su esqueleto.
 * Atributos extra para el shader de piel:
 *   aSkin    -> coordenada de patrón en metros (el dibujo viaja CON el brazo)
 *   aVentral -> 1 en la cara de las ventosas (piel más clara)
 */
export class ArmTube {
  readonly geometry = new THREE.BufferGeometry();
  private readonly pos: Float32Array;
  private readonly nor: Float32Array;
  private readonly skin: Float32Array;

  constructor(private readonly armIndex: number) {
    const count = SPINE_POINTS * RING + 1;
    this.pos = new Float32Array(count * 3);
    this.nor = new Float32Array(count * 3);
    this.skin = new Float32Array(count * 3);
    const ventral = new Float32Array(count);
    const uv = new Float32Array(count * 2);
    for (let j = 0; j < SPINE_POINTS; j++) {
      for (let r = 0; r < RING; r++) {
        const idx = j * RING + r;
        const th = (r / RADIAL_SEGMENTS) * Math.PI * 2;
        ventral[idx] = THREE.MathUtils.smoothstep(Math.cos(th), 0.15, 0.75);
        uv[idx * 2] = j / (SPINE_POINTS - 1);
        uv[idx * 2 + 1] = r / RADIAL_SEGMENTS;
      }
    }
    ventral[count - 1] = 0.5;
    const index: number[] = [];
    for (let j = 0; j < SPINE_POINTS - 1; j++) {
      for (let r = 0; r < RADIAL_SEGMENTS; r++) {
        const a = j * RING + r;
        const b = a + RING;
        index.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const tip = count - 1;
    const last = (SPINE_POINTS - 1) * RING;
    for (let r = 0; r < RADIAL_SEGMENTS; r++) index.push(last + r, tip, last + r + 1);
    this.geometry.setIndex(index);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('normal', new THREE.BufferAttribute(this.nor, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('aSkin', new THREE.BufferAttribute(this.skin, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('aVentral', new THREE.BufferAttribute(ventral, 1));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }

  update(spine: ArmSpine) {
    const { pos, nor, skin } = this;
    const off = this.armIndex * 1.37;
    for (let j = 0; j < SPINE_POINTS; j++) {
      const u = j / (SPINE_POINTS - 1);
      const r = armRadius(u);
      const P = spine.points[j];
      const V = spine.ventral[j];
      const L = spine.lateral[j];
      const s = spine.arc[j];
      for (let k = 0; k < RING; k++) {
        const th = (k / RADIAL_SEGMENTS) * Math.PI * 2;
        const c = Math.cos(th);
        const sn = Math.sin(th);
        const cy = c * (c > 0 ? VENTRAL_SQUASH : 1);
        const idx = (j * RING + k) * 3;
        pos[idx] = P.x + (V.x * cy + L.x * sn) * r;
        pos[idx + 1] = P.y + (V.y * cy + L.y * sn) * r;
        pos[idx + 2] = P.z + (V.z * cy + L.z * sn) * r;
        const ncy = c / (c > 0 ? VENTRAL_SQUASH : 1);
        let nx = V.x * ncy + L.x * sn;
        let ny = V.y * ncy + L.y * sn;
        let nz = V.z * ncy + L.z * sn;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;
        nor[idx] = nx;
        nor[idx + 1] = ny;
        nor[idx + 2] = nz;
        // Coordenada de patrón: longitud de arco + posición en la sección (metros).
        skin[idx] = c * BASE_SKIN_R + off;
        skin[idx + 1] = sn * BASE_SKIN_R;
        skin[idx + 2] = s;
      }
    }
    const tipIdx = SPINE_POINTS * RING * 3;
    const lastP = spine.points[SPINE_POINTS - 1];
    const lastT = spine.tangents[SPINE_POINTS - 1];
    pos[tipIdx] = lastP.x + lastT.x * 0.002;
    pos[tipIdx + 1] = lastP.y + lastT.y * 0.002;
    pos[tipIdx + 2] = lastP.z + lastT.z * 0.002;
    nor[tipIdx] = lastT.x;
    nor[tipIdx + 1] = lastT.y;
    nor[tipIdx + 2] = lastT.z;
    skin[tipIdx] = off;
    skin[tipIdx + 1] = 0;
    skin[tipIdx + 2] = spine.arc[SPINE_POINTS - 1];
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
    this.geometry.attributes.aSkin.needsUpdate = true;
  }
}

/** Ventosas de los 8 brazos en un solo InstancedMesh (2 filas alternas por brazo). */
export class Suckers {
  readonly mesh: THREE.InstancedMesh;
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly p = new THREE.Vector3();
  private readonly v = new THREE.Vector3();
  private readonly l = new THREE.Vector3();
  private readonly s = new THREE.Vector3();
  private static readonly Y = new THREE.Vector3(0, 1, 0);

  constructor(material: THREE.Material, arms: number) {
    // Ventosa: copa con borde grueso y centro hundido (perfil de torno).
    const profile = [
      [0.0, 0.12],
      [0.22, 0.14],
      [0.42, 0.3],
      [0.62, 0.52],
      [0.82, 0.56],
      [0.98, 0.42],
      [1.02, 0.18],
      [0.9, 0.0],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const geo = new THREE.LatheGeometry(profile, 20);
    const cp = geo.attributes.position as THREE.BufferAttribute;
    const cols = new Float32Array(cp.count * 3);
    for (let i = 0; i < cp.count; i++) {
      const rr = Math.hypot(cp.getX(i), cp.getZ(i));
      const shade = 0.72 + 0.28 * THREE.MathUtils.smoothstep(rr, 0.1, 0.7);
      cols.set([shade, shade * 0.97, shade * 0.95], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    this.mesh = new THREE.InstancedMesh(geo, material, arms * SUCKERS_PER_ARM);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
  }

  update(armIndex: number, spine: ArmSpine) {
    const { m, q, p, v, l, s } = this;
    for (let n = 0; n < SUCKERS_PER_ARM; n++) {
      const u = 0.05 + 0.88 * (n / (SUCKERS_PER_ARM - 1));
      spine.sample(u, p, v, l);
      const r = armRadius(u);
      const row = n % 2 === 0 ? 1 : -1;
      p.addScaledVector(v, r * VENTRAL_SQUASH * 0.86).addScaledVector(l, row * r * 0.3);
      q.setFromUnitVectors(Suckers.Y, v);
      const size = r * 0.23;
      s.set(size, size * 0.9, size);
      m.compose(p, q, s);
      this.mesh.setMatrixAt(armIndex * SUCKERS_PER_ARM + n, m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** Membrana interbraquial: une la base de dos brazos vecinos. */
export class Web {
  readonly geometry = new THREE.BufferGeometry();
  private readonly pos: Float32Array;
  private static readonly ROWS = 9;
  private static readonly COLS = 7;
  /** Hasta qué punto del brazo llega la membrana (índice del esqueleto). */
  private static readonly DEPTH = 7;

  constructor() {
    const { ROWS, COLS } = Web;
    this.pos = new Float32Array(ROWS * COLS * 3);
    const skin = new Float32Array(ROWS * COLS * 3);
    const ventral = new Float32Array(ROWS * COLS).fill(0.18);
    const index: number[] = [];
    for (let j = 0; j < ROWS - 1; j++) {
      for (let c = 0; c < COLS - 1; c++) {
        const a = j * COLS + c;
        index.push(a, a + COLS, a + 1, a + COLS, a + COLS + 1, a + 1);
      }
    }
    this.geometry.setIndex(index);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('aSkin', new THREE.BufferAttribute(skin, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('aVentral', new THREE.BufferAttribute(ventral, 1));
  }

  update(a: ArmSpine, b: ArmSpine, seed: number) {
    const { ROWS, COLS, DEPTH } = Web;
    const pa = new THREE.Vector3();
    const pb = new THREE.Vector3();
    const tmpV = new THREE.Vector3();
    const tmpL = new THREE.Vector3();
    const skin = this.geometry.attributes.aSkin.array as Float32Array;
    for (let j = 0; j < ROWS; j++) {
      for (let c = 0; c < COLS; c++) {
        const w = c / (COLS - 1);
        // Borde festoneado: la membrana llega menos lejos entre los brazos.
        const reach = (j / (ROWS - 1)) * (1 - 0.7 * Math.sin(Math.PI * w));
        const u = (reach * DEPTH) / (SPINE_POINTS - 1);
        a.sample(u, pa, tmpV, tmpL);
        b.sample(u, pb, tmpV, tmpL);
        pa.lerp(pb, w);
        const idx = (j * COLS + c) * 3;
        this.pos[idx] = pa.x;
        this.pos[idx + 1] = pa.y;
        this.pos[idx + 2] = pa.z;
        skin[idx] = seed + w * 0.08;
        skin[idx + 1] = 0.02;
        skin[idx + 2] = reach * 0.12;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aSkin.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }
}
