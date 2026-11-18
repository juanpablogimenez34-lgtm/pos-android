import * as THREE from 'three';
import { Seabed } from '../environment/seabed';
import { computeCamera, Subject } from './CinematicCamera';
import { Shot } from './shots';

/**
 * Pre-calcula el recorrido completo de la cámara y permite preguntar si un objeto
 * decorativo estorbaría (cámara dentro de una roca, alga tapando al sujeto...).
 * Así la escenografía se adapta automáticamente a la planificación de planos.
 */
export class CameraSafety {
  private readonly segs: { a: THREE.Vector3; b: THREE.Vector3 }[] = [];

  constructor(shots: Shot[], subject: Subject, seabed: Seabed, duration: number, step = 0.1) {
    for (let t = 0; t <= duration; t += step) {
      const c = computeCamera(shots, subject, seabed, t);
      this.segs.push({ a: c.position.clone(), b: c.target.clone() });
    }
  }

  /** ¿Está una esfera (centro, radio) libre de la línea cámara→sujeto en todo momento? */
  sphereClear(center: THREE.Vector3, radius: number): boolean {
    const tmp = new THREE.Vector3();
    const line = new THREE.Line3();
    for (const s of this.segs) {
      line.set(s.a, s.b);
      line.closestPointToPoint(center, true, tmp);
      if (tmp.distanceTo(center) < radius) return false;
    }
    return true;
  }

  /** Igual pero en planta (XZ): para algas altas. */
  columnClear(x: number, z: number, radius: number): boolean {
    for (const s of this.segs) {
      const ax = s.a.x;
      const az = s.a.z;
      const dx = s.b.x - ax;
      const dz = s.b.z - az;
      const l2 = dx * dx + dz * dz || 1e-6;
      const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      const px = ax + dx * k - x;
      const pz = az + dz * k - z;
      if (px * px + pz * pz < radius * radius) return false;
    }
    return true;
  }
}
