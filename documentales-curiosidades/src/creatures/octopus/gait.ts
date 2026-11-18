import * as THREE from 'three';
import { Seabed } from '../../core/environment/seabed';
import { easeInOutSine } from '../../core/math/easing';
import { hash2 } from '../../core/math/noise';
import { ArmSpec } from './anatomy';
import { CrawlMotion } from './locomotion';

export type ArmContact = {
  /** Punto donde el brazo toca (o pretende tocar) el sustrato. */
  point: THREE.Vector3;
  /** 0 = apoyado, 1 = totalmente levantado. */
  lift: number;
  /** Progreso de la fase aérea (0..1), 0 en apoyo. */
  swing: number;
};

export type GaitConfig = {
  frequency: number;
  /** Fracción del ciclo en apoyo. */
  duty: number;
  /** Altura máxima del arco de cada paso (m). */
  stepHeight: number;
};

/**
 * Marcha procedural SIN ESTADO.
 * Cada brazo alterna apoyo (la ventosa queda fija en el mundo mientras el cuerpo
 * avanza, lo que "tira" del animal) y fase aérea (el brazo se levanta y busca un
 * nuevo punto de apoyo por delante). Todo se deduce del tiempo t.
 */
export class OctopusGait {
  constructor(
    private readonly motion: CrawlMotion,
    private readonly seabed: Seabed,
    private readonly cfg: GaitConfig,
  ) {}

  /** Punto de apoyo elegido para el ciclo k del brazo. */
  foothold(arm: ArmSpec, armIndex: number, k: number): THREE.Vector3 {
    const { frequency, duty } = this.cfg;
    // El apoyo se elige para que el brazo quede en su posición de reposo a mitad de la fase de apoyo.
    const tMid = (k + duty * 0.5 - arm.phase) / frequency;
    const pose = this.motion.poseAt(tMid);
    const jitterA = (hash2(k, armIndex, 3) - 0.5) * 0.22;
    const jitterR = 1 + (hash2(k, armIndex, 7) - 0.5) * 0.18;
    const a = pose.yaw + arm.angle + jitterA;
    const r = arm.reach * jitterR;
    const x = pose.position.x + Math.sin(a) * r;
    const z = pose.position.z + Math.cos(a) * r;
    return new THREE.Vector3(x, this.seabed.height(x, z), z);
  }

  contact(arm: ArmSpec, armIndex: number, t: number): ArmContact {
    const { frequency, duty, stepHeight } = this.cfg;
    const cyc = t * frequency + arm.phase;
    const k = Math.floor(cyc);
    const phi = cyc - k;
    if (phi < duty) {
      return { point: this.foothold(arm, armIndex, k), lift: 0, swing: 0 };
    }
    const u = (phi - duty) / (1 - duty);
    const a = this.foothold(arm, armIndex, k);
    const b = this.foothold(arm, armIndex, k + 1);
    const stride = a.distanceTo(b);
    const e = easeInOutSine(u);
    const p = a.clone().lerp(b, e);
    const arc = Math.sin(Math.PI * u);
    // Con zancadas cortas (animal casi quieto) el brazo apenas se despega.
    const h = Math.min(stepHeight, 0.025 + stride * 0.55);
    p.y = Math.max(p.y, this.seabed.height(p.x, p.z)) + arc * h;
    return { point: p, lift: arc * Math.min(1, 0.35 + stride * 4), swing: u };
  }
}
