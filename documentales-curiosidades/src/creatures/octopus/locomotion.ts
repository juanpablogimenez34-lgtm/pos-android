import * as THREE from 'three';
import { Seabed } from '../../core/environment/seabed';
import { clamp } from '../../core/math/noise';
import { BODY } from './anatomy';

export type BodyPose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  yaw: number;
  /** Vector unitario hacia delante (horizontal). */
  forward: THREE.Vector3;
  /** Velocidad sobre el suelo (m/s). */
  speed: number;
  /** Distancia recorrida (m). */
  distance: number;
};

export type CrawlConfig = {
  seabed: Seabed;
  /** Puntos de control (x, z) del recorrido. */
  path: [number, number][];
  /** Velocidad deseada (m/s) en función del tiempo (s). */
  speed: (t: number) => number;
  /** Duración máxima a precalcular (s). */
  duration: number;
  /** Frecuencia del ciclo de marcha (Hz), para el leve balanceo del cuerpo. */
  gaitFrequency: number;
};

const LUT_RATE = 120;

/**
 * Locomoción "reptante" del cuerpo a lo largo de una curva.
 * La distancia recorrida se integra una sola vez en una tabla (LUT), de modo
 * que cualquier fotograma se puede evaluar al instante y sin estado.
 */
export class CrawlMotion {
  readonly curve: THREE.CatmullRomCurve3;
  readonly length: number;
  private readonly lut: Float32Array;
  private readonly cfg: CrawlConfig;
  private readonly cache = new Map<number, BodyPose>();

  constructor(cfg: CrawlConfig) {
    this.cfg = cfg;
    this.curve = new THREE.CatmullRomCurve3(
      cfg.path.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      'centripetal',
    );
    this.length = this.curve.getLength();
    const n = Math.ceil(cfg.duration * LUT_RATE) + 2;
    this.lut = new Float32Array(n);
    let s = 0;
    for (let i = 1; i < n; i++) {
      const t = (i - 0.5) / LUT_RATE;
      s += Math.max(0, cfg.speed(t)) / LUT_RATE;
      this.lut[i] = Math.min(s, this.length);
    }
  }

  distanceAt(t: number): number {
    const x = clamp(t * LUT_RATE, 0, this.lut.length - 1.001);
    const i = Math.floor(x);
    const f = x - i;
    return this.lut[i] * (1 - f) + this.lut[i + 1] * f;
  }

  /** Punto de la curva a una distancia s, en el plano XZ. */
  pointAtDistance(s: number, target = new THREE.Vector3()) {
    return this.curve.getPointAt(clamp(s / this.length, 0, 1), target);
  }

  /** Distancia mínima (XZ) del punto al recorrido. */
  distanceToPath(x: number, z: number, samples = 160): number {
    let best = Infinity;
    const p = new THREE.Vector3();
    for (let i = 0; i <= samples; i++) {
      this.curve.getPointAt(i / samples, p);
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < best) best = d;
    }
    return best;
  }

  poseAt(t: number): BodyPose {
    // Cache por tiempo cuantizado: la marcha consulta la pose muchas veces por fotograma.
    const key = Math.round(t * 1000);
    const cached = this.cache.get(key);
    if (cached) return cached;
    if (this.cache.size > 4000) this.cache.clear();

    const { seabed } = this.cfg;
    const s = this.distanceAt(t);
    const u = clamp(s / this.length, 0, 1);
    const p = this.curve.getPointAt(u);
    const tan = this.curve.getTangentAt(u);
    const yaw = Math.atan2(tan.x, tan.z);
    const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const left = new THREE.Vector3(fwd.z, 0, -fwd.x);

    const ground = seabed.averageHeight(p.x, p.z, 0.2);
    const hf = seabed.averageHeight(p.x + fwd.x * 0.2, p.z + fwd.z * 0.2, 0.12);
    const hb = seabed.averageHeight(p.x - fwd.x * 0.2, p.z - fwd.z * 0.2, 0.12);
    const hl = seabed.averageHeight(p.x + left.x * 0.2, p.z + left.z * 0.2, 0.12);
    const hr = seabed.averageHeight(p.x - left.x * 0.2, p.z - left.z * 0.2, 0.12);
    const pitch = -Math.atan2(hf - hb, 0.4) * 0.65;
    const roll = Math.atan2(hl - hr, 0.4) * 0.5;

    const speed = (this.distanceAt(t + 0.05) - this.distanceAt(t - 0.05)) / 0.1;
    // Balanceo: el cuerpo sube y baja levemente con cada "tirón" de los brazos.
    const bob = 0.008 * Math.sin(t * Math.PI * 2 * this.cfg.gaitFrequency * 2) * clamp(speed * 6, 0.2, 1);
    const position = new THREE.Vector3(p.x, ground + BODY.rideHeight + bob, p.z);
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'));

    const pose: BodyPose = { position, quaternion, yaw, forward: fwd, speed, distance: s };
    this.cache.set(key, pose);
    return pose;
  }
}
