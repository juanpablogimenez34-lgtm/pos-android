import * as THREE from 'three';
import { Seabed } from '../../core/environment/seabed';
import { noise1 } from '../../core/math/noise';
import { armRadius, ArmSpec, SPINE_POINTS } from './anatomy';

const UP = new THREE.Vector3(0, 1, 0);

export type ArmInputs = {
  base: THREE.Vector3;
  /** Dirección de salida del brazo en la raíz (mundo). */
  outDir: THREE.Vector3;
  contact: THREE.Vector3;
  lift: number;
  swing: number;
  time: number;
  armIndex: number;
  spec: ArmSpec;
  /** 0..1: el brazo explora (se eleva y ondula buscando). */
  explore: number;
};

/** Esqueleto de un brazo: puntos + marco local (tangente, ventral, lateral). */
export class ArmSpine {
  readonly points = Array.from({ length: SPINE_POINTS }, () => new THREE.Vector3());
  readonly tangents = Array.from({ length: SPINE_POINTS }, () => new THREE.Vector3());
  /** Normal ventral (hacia donde miran las ventosas). */
  readonly ventral = Array.from({ length: SPINE_POINTS }, () => new THREE.Vector3());
  readonly lateral = Array.from({ length: SPINE_POINTS }, () => new THREE.Vector3());
  /** Longitud de arco acumulada en cada punto. */
  readonly arc = new Float32Array(SPINE_POINTS);

  private readonly poly: THREE.Vector3[] = Array.from({ length: 64 }, () => new THREE.Vector3());

  solve(inp: ArmInputs, seabed: Seabed) {
    const { base, outDir, contact, lift, swing, time: t, armIndex: i, spec, explore } = inp;
    const poly = this.poly;

    // 1) Tramo proximal: curva de Bézier desde la raíz hasta el punto de contacto.
    const d = new THREE.Vector3().subVectors(contact, base);
    const dist = Math.max(0.05, d.length());
    const groundDir = new THREE.Vector3(d.x, 0, d.z);
    if (groundDir.lengthSq() < 1e-6) groundDir.set(outDir.x, 0, outDir.z);
    groundDir.normalize();
    const p0 = base;
    const p1 = base.clone().addScaledVector(outDir, dist * 0.42);
    const p2 = contact
      .clone()
      .addScaledVector(groundDir, -dist * 0.38)
      .addScaledVector(UP, 0.045 + lift * 0.1 + explore * 0.05);
    const p3 = contact;
    const NB = 32;
    const bez = (u: number, out: THREE.Vector3) => {
      const a = 1 - u;
      return out
        .set(0, 0, 0)
        .addScaledVector(p0, a * a * a)
        .addScaledVector(p1, 3 * a * a * u)
        .addScaledVector(p2, 3 * a * u * u)
        .addScaledVector(p3, u * u * u);
    };
    let bezLen = 0;
    for (let j = 0; j < NB; j++) {
      bez(j / (NB - 1), poly[j]);
      if (j > 0) bezLen += poly[j].distanceTo(poly[j - 1]);
    }

    // 2) Tramo distal: la punta se extiende y se enrolla (rasgo muy característico).
    const NT = 32;
    const tipLen = Math.max(spec.length * 0.22, spec.length - bezLen);
    const theta0 = Math.atan2(groundDir.x, groundDir.z);
    const curlNoise = noise1(t * 0.45 + i * 3.7, 40 + i);
    const curlSide = spec.curlSign * (1.3 + 0.9 * curlNoise + swing * 2.4 * Math.sin(Math.PI * swing) + explore * 0.6);
    const curlUp = 0.2 + lift * 0.55 + explore * 0.8;
    const wave = Math.sin(t * 2.3 + i * 1.3) * explore * 0.5;
    const ds = tipLen / (NT - 1);
    const cur = contact.clone();
    let k = NB;
    for (let j = 1; j < NT; j++, k++) {
      const u = j / (NT - 1);
      const th = theta0 + curlSide * Math.pow(u, 2.2) + wave * u;
      const el = lift * 0.25 + explore * 0.55 + curlUp * Math.pow(u, 2.4) - (1 - lift) * 0.15 * u;
      const ce = Math.cos(el);
      cur.x += Math.sin(th) * ce * ds;
      cur.y += Math.sin(el) * ds;
      cur.z += Math.cos(th) * ce * ds;
      poly[k].copy(cur);
    }
    const polyCount = k;

    // 3) Re-muestreo uniforme por longitud de arco.
    const cum = new Float32Array(polyCount);
    for (let j = 1; j < polyCount; j++) cum[j] = cum[j - 1] + poly[j].distanceTo(poly[j - 1]);
    const total = cum[polyCount - 1];
    let seg = 1;
    for (let j = 0; j < SPINE_POINTS; j++) {
      const target = (j / (SPINE_POINTS - 1)) * total;
      while (seg < polyCount - 1 && cum[seg] < target) seg++;
      const a = cum[seg - 1];
      const b = cum[seg];
      const f = b > a ? (target - a) / (b - a) : 0;
      this.points[j].copy(poly[seg - 1]).lerp(poly[seg], f);
    }

    // 4) Ondulación secundaria: ondas que viajan por el brazo (músculos hidrostáticos).
    const pts = this.points;
    const tmpT = new THREE.Vector3();
    const lat = new THREE.Vector3();
    const amp = 0.016 + lift * 0.02 + explore * 0.03;
    for (let j = 2; j < SPINE_POINTS; j++) {
      const u = j / (SPINE_POINTS - 1);
      tmpT.subVectors(pts[Math.min(j + 1, SPINE_POINTS - 1)], pts[j - 1]).normalize();
      lat.crossVectors(tmpT, UP).normalize();
      const w = Math.sin(Math.PI * 2 * (1.4 * u - 0.55 * t) + i * 1.7);
      const w2 = Math.sin(Math.PI * 2 * (0.9 * u - 0.33 * t) + i * 2.9);
      pts[j].addScaledVector(lat, amp * Math.pow(u, 1.3) * w);
      pts[j].y += 0.008 * u * w2 * (0.4 + lift + explore);
    }

    // 5) Contacto con el relieve: suavizado + "nunca atravesar la roca".
    const clampGround = () => {
      for (let j = 1; j < SPINE_POINTS; j++) {
        const u = j / (SPINE_POINTS - 1);
        const p = pts[j];
        const floor = seabed.height(p.x, p.z) + armRadius(u) * 0.9;
        if (p.y < floor) p.y = floor;
      }
    };
    const tmp = new THREE.Vector3();
    for (let iter = 0; iter < 2; iter++) {
      clampGround();
      for (let j = 2; j < SPINE_POINTS - 1; j++) {
        tmp.addVectors(pts[j - 1], pts[j + 1]).multiplyScalar(0.5);
        pts[j].lerp(tmp, 0.5);
      }
    }
    clampGround();

    // 6) Marco local de cada punto. La cara ventral (ventosas) apunta "hacia el suelo".
    this.arc[0] = 0;
    for (let j = 0; j < SPINE_POINTS; j++) {
      const a = pts[Math.max(0, j - 1)];
      const b = pts[Math.min(SPINE_POINTS - 1, j + 1)];
      const T = this.tangents[j].subVectors(b, a).normalize();
      if (j > 0) this.arc[j] = this.arc[j - 1] + pts[j].distanceTo(pts[j - 1]);
      // Transporte paralelo: el marco se arrastra punto a punto sin girar bruscamente,
      // con una leve atracción de la cara ventral hacia el suelo (donde se apoyan las ventosas).
      const V = this.ventral[j];
      if (j === 0) {
        V.set(0, -1, 0);
      } else {
        V.copy(this.ventral[j - 1]);
        const horiz = 1 - Math.abs(T.y);
        V.y -= 0.18 * horiz;
      }
      V.addScaledVector(T, -V.dot(T));
      if (V.lengthSq() < 1e-6) V.copy(this.lateral[Math.max(0, j - 1)]).cross(T);
      V.normalize();
      this.lateral[j].crossVectors(T, V).normalize();
    }
  }

  /** Interpola posición y marco en u ∈ [0,1]. */
  sample(u: number, pos: THREE.Vector3, ventral: THREE.Vector3, lateral: THREE.Vector3) {
    const x = Math.min(0.9999, Math.max(0, u)) * (SPINE_POINTS - 1);
    const j = Math.floor(x);
    const f = x - j;
    pos.copy(this.points[j]).lerp(this.points[j + 1], f);
    ventral.copy(this.ventral[j]).lerp(this.ventral[j + 1], f).normalize();
    lateral.copy(this.lateral[j]).lerp(this.lateral[j + 1], f).normalize();
  }
}
