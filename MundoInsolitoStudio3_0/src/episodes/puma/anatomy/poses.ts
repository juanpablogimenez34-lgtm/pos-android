// POSES DE REFERENCIA (estación, sentado, agazapado) a partir de la especie y la posición en el mundo.
import * as THREE from 'three';
import {basePose, LEGS, Pose, Species} from './rig';

export function standPose(sp: Species, x = 0, z = 0, heading = 0, crouch = 0, ground = 0): Pose {
  const P = basePose();
  const fwd = new THREE.Vector3(Math.cos(heading), 0, -Math.sin(heading));
  const side = new THREE.Vector3(-Math.sin(heading), 0, -Math.cos(heading)); // derecha del animal
  P.heading = heading;
  P.crouch = crouch;
  P.root = new THREE.Vector3(x, ground + sp.hipH * (1 - crouch * 0.4), z);
  const slope = Math.asin(Math.min(0.5, Math.max(-0.5, (sp.withersH - sp.hipH) / sp.torso)));
  const reach = sp.torso * Math.cos(slope);
  for (const id of LEGS) {
    const s = id[0] === 'L' ? 1 : -1;
    const hind = id[1] === 'H';
    const hw = hind ? sp.hipW : sp.shW;
    const along = hind ? -0.02 * (sp.torso / 0.66) + sp.paw * 0.45 : reach + 0.035 * (sp.torso / 0.66) + sp.paw * 0.4;
    const p = new THREE.Vector3(x, ground, z).addScaledVector(fwd, along).addScaledVector(side, -s * hw * 0.92);
    P.legs[id] = {target: p, lift: 0, pawPitch: 0, contact: 1};
  }
  return P;
}
