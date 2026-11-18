import { clamp, fbm2, smoothstep } from '../math/noise';

/**
 * Fondo marino analítico: la ALTURA es una función pura h(x, z).
 * La misma función se usa para:
 *   - construir la malla del terreno,
 *   - apoyar las ventosas del pulpo sobre la roca (los brazos "sienten" el relieve),
 *   - evitar que la cámara atraviese el suelo.
 */
export type RockSpec = {
  x: number;
  z: number;
  /** Radios de la base (m). */
  rx: number;
  rz: number;
  /** Altura (m). */
  h: number;
  /** Rotación en Y (rad). */
  rot: number;
  seed: number;
};

export type SeabedConfig = {
  rocks: RockSpec[];
  /** Amplitud de las dunas de arena (m). */
  duneAmp: number;
  /** Amplitud de las ondulaciones (ripples) de arena (m). */
  rippleAmp: number;
};

export class Seabed {
  readonly rocks: RockSpec[];
  private readonly cfg: SeabedConfig;

  constructor(cfg: SeabedConfig) {
    this.cfg = cfg;
    this.rocks = cfg.rocks;
  }

  sand(x: number, z: number): number {
    const dunes = this.cfg.duneAmp * fbm2(x * 0.22, z * 0.22, 3, 11);
    const warp = fbm2(x * 0.6, z * 0.6, 2, 5) * 3.0;
    const ripples = this.cfg.rippleAmp * Math.sin((x * 0.82 + z * 0.57) * 17 + warp);
    return dunes + ripples;
  }

  /** Altura de la roca sobre la arena en (x,z). */
  rock(x: number, z: number): number {
    let best = 0;
    for (const r of this.rocks) {
      const dx = x - r.x;
      const dz = z - r.z;
      const maxR = Math.max(r.rx, r.rz) * 1.35;
      if (dx * dx + dz * dz > maxR * maxR) continue;
      const c = Math.cos(r.rot);
      const s = Math.sin(r.rot);
      const lx = (dx * c - dz * s) / r.rx;
      const lz = (dx * s + dz * c) / r.rz;
      // Contorno irregular: deformamos la distancia con ruido.
      const d = Math.sqrt(lx * lx + lz * lz) + 0.22 * fbm2(x * 2.2, z * 2.2, 3, r.seed);
      if (d >= 1) continue;
      const dome = Math.pow(1 - d * d, 0.55);
      // Detalle de superficie: grietas y protuberancias.
      const detail = 0.1 * fbm2(x * 6.5, z * 6.5, 3, r.seed + 3) + 0.04 * fbm2(x * 16, z * 16, 2, r.seed + 9);
      const v = r.h * dome * (1 + detail * 1.6) + detail * 0.05 * dome;
      if (v > best) best = v;
    }
    return best;
  }

  height(x: number, z: number): number {
    return this.sand(x, z) + this.rock(x, z);
  }

  /** 0 = arena, 1 = roca. Útil para color y para el camuflaje. */
  rockMask(x: number, z: number): number {
    return smoothstep(0.008, 0.05, this.rock(x, z));
  }

  /** Normal aproximada por diferencias centrales. */
  normal(x: number, z: number, eps = 0.05): [number, number, number] {
    const hx = this.height(x + eps, z) - this.height(x - eps, z);
    const hz = this.height(x, z + eps) - this.height(x, z - eps);
    const nx = -hx;
    const ny = 2 * eps;
    const nz = -hz;
    const l = Math.hypot(nx, ny, nz);
    return [nx / l, ny / l, nz / l];
  }

  /** Altura media en un disco (suaviza la trayectoria del cuerpo). */
  averageHeight(x: number, z: number, radius: number): number {
    let sum = this.height(x, z) * 2;
    let n = 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      sum += this.height(x + Math.cos(a) * radius, z + Math.sin(a) * radius);
      n++;
    }
    return clamp(sum / n, -10, 10);
  }
}
