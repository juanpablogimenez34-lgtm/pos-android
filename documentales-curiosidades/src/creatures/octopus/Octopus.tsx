import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Seabed } from '../../core/environment/seabed';
import { fbm2 } from '../../core/math/noise';
import { ARM_RING_ORDER, ARMS, BODY } from './anatomy';
import { ArmTube, Suckers, Web } from './armMesh';
import { ArmSpine } from './armSolver';
import { OctopusGait } from './gait';
import { CrawlMotion } from './locomotion';
import { createSkinMaterial, createSkinUniforms } from './skinMaterial';

export type OctopusBehavior = {
  camo: number;
  papillae: number;
  wave: number;
  /** Peso de exploración por brazo (8 valores, 0..1). */
  explore: number[];
  /** Hacia dónde mira el animal (offset de los ojos, rad). */
  gaze: number;
};

type Props = {
  seabed: Seabed;
  motion: CrawlMotion;
  gait: OctopusGait;
  behavior: (t: number) => OctopusBehavior;
  time: number;
};

/** Esfera deformada con ruido + atributos de piel en espacio del cuerpo. */
const makeBodyPart = (
  scale: [number, number, number],
  offset: [number, number, number],
  rotX: number,
  lumpiness: number,
  seed: number,
) => {
  const g = new THREE.SphereGeometry(1, 48, 32);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = fbm2(v.x * 2.2 + seed, v.y * 2.2 + v.z * 1.7, 3, seed) * lumpiness;
    v.multiplyScalar(1 + n);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.scale(...scale);
  g.rotateX(rotX);
  g.translate(...offset);
  g.computeVertexNormals();
  // aSkin = posición en el cuerpo (m); aVentral = parte inferior más clara.
  const skin = new Float32Array(pos.count * 3);
  const ventral = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    skin[i * 3] = pos.getX(i);
    skin[i * 3 + 1] = pos.getY(i);
    skin[i * 3 + 2] = pos.getZ(i);
    ventral[i] = THREE.MathUtils.smoothstep(-pos.getY(i), 0.0, 0.06) * 0.7;
  }
  g.setAttribute('aSkin', new THREE.BufferAttribute(skin, 3));
  g.setAttribute('aVentral', new THREE.BufferAttribute(ventral, 1));
  return g;
};

const withSkinAttrs = (g: THREE.BufferGeometry, ventral = 0) => {
  const pos = g.attributes.position as THREE.BufferAttribute;
  g.setAttribute('aSkin', new THREE.BufferAttribute(new Float32Array(pos.array as Float32Array), 3));
  g.setAttribute('aVentral', new THREE.BufferAttribute(new Float32Array(pos.count).fill(ventral), 1));
  return g;
};

/**
 * Pulpo 100 % procedural:
 *  - Cuerpo (cabeza + manto que respira), ojos con pupila horizontal, sifón.
 *  - 8 brazos independientes con esqueleto de 56 puntos, ventosas y membrana.
 *  - Marcha con apoyos reales sobre el relieve, punta de los brazos enrollada,
 *    exploración y camuflaje animado.
 */
export const Octopus: React.FC<Props> = ({ seabed, motion, gait, behavior, time }) => {
  const rig = useMemo(() => {
    const uniforms = createSkinUniforms();
    const skin = createSkinMaterial(uniforms);
    const skinDouble = createSkinMaterial(uniforms, { side: THREE.DoubleSide });
    const suckerMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      color: '#bf9d8e',
      roughness: 0.35,
      clearcoat: 0.6,
      sheen: 0.5,
      sheenColor: new THREE.Color('#ffd2c0'),
    });

    const body = new THREE.Group();
    // Cabeza (donde están los ojos y el cerebro) y manto (vísceras... y los 3 corazones).
    const head = new THREE.Mesh(makeBodyPart([0.078, 0.064, 0.082], [0, 0, 0.02], 0, 0.03, 1), skin);
    const mantle = new THREE.Mesh(makeBodyPart([0.085, 0.075, 0.14], [0, 0, 0], 0, 0.014, 5), skin);
    const mantlePivot = new THREE.Group();
    mantlePivot.position.set(0, 0.035, -0.035);
    mantle.position.set(0, 0.035, -0.11);
    mantlePivot.rotation.x = 0.5;
    mantlePivot.add(mantle);
    // "Cuello" que une cabeza y manto.
    const neck = new THREE.Mesh(makeBodyPart([0.075, 0.062, 0.07], [0, 0.03, -0.045], 0.3, 0.05, 9), skin);
    // Corona donde nacen los brazos.
    const crown = new THREE.Mesh(makeBodyPart([0.07, 0.035, 0.07], [0, BODY.armRootY + 0.01, BODY.armRootZ], 0, 0.04, 13), skin);

    // Ojos: bulbo de piel + globo ocular + pupila horizontal.
    const eyeMat = new THREE.MeshPhysicalMaterial({
      color: '#a8862f',
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const pupilMat = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.2 });
    const eyes: { pivot: THREE.Group; pupil: THREE.Mesh }[] = [];
    for (const side of [1, -1]) {
      const bulge = new THREE.Mesh(withSkinAttrs(new THREE.SphereGeometry(0.026, 24, 16)), skin);
      bulge.position.set(side * 0.05, 0.04, 0.045);
      // Pequeños "cuernos" (papilas supraoculares) típicos del pulpo común.
      const horn = new THREE.Mesh(withSkinAttrs(new THREE.ConeGeometry(0.0045, 0.012, 8)), skin);
      horn.position.set(side * 0.052, 0.068, 0.04);
      horn.rotation.z = -side * 0.3;
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.056, 0.046, 0.05);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.017, 32, 20), eyeMat);
      // Pupila horizontal rectangular, grande (como en los pulpos reales).
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), pupilMat);
      pupil.scale.set(0.004, 0.0042, 0.0115);
      pupil.position.set(side * 0.0142, 0.001, 0.004);
      pupil.rotation.y = side * 0.25;
      // Párpado: anillo de piel que envuelve el ojo.
      const lid = new THREE.Mesh(withSkinAttrs(new THREE.TorusGeometry(0.0165, 0.006, 12, 32)), skin);
      lid.rotation.y = Math.PI / 2;
      lid.position.set(side * 0.006, 0, 0);
      pivot.add(lid);
      pivot.add(ball, pupil);
      body.add(bulge, horn, pivot);
      eyes.push({ pivot, pupil });
    }

    // Sifón (embudo) en el lado derecho: lo usa para respirar y propulsarse.
    const siphonGeo = new THREE.CylinderGeometry(0.008, 0.014, 0.05, 14, 1, true);
    siphonGeo.rotateX(Math.PI / 2);
    const siphon = new THREE.Mesh(withSkinAttrs(siphonGeo, 0.3), skinDouble);
    siphon.position.set(-0.062, -0.01, -0.03);
    siphon.rotation.set(0.35, -0.5, 0);

    body.add(head, mantlePivot, neck, crown, siphon);
    body.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    // Brazos
    const spines = ARMS.map(() => new ArmSpine());
    const tubes = ARMS.map((_, i) => new ArmTube(i));
    const armMeshes = tubes.map((t) => {
      const m = new THREE.Mesh(t.geometry, skin);
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      return m;
    });
    const suckers = new Suckers(suckerMat, ARMS.length);
    const webs = ARM_RING_ORDER.map(() => new Web());
    const webMeshes = webs.map((w) => {
      const m = new THREE.Mesh(w.geometry, skinDouble);
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      return m;
    });

    const root = new THREE.Group();
    root.add(body, ...armMeshes, suckers.mesh, ...webMeshes);
    return { root, body, mantle, mantlePivot, siphon, eyes, spines, tubes, suckers, webs, uniforms };
  }, []);

  useLayoutEffect(() => {
    const t = time;
    const pose = motion.poseAt(t);
    const beh = behavior(t);
    const { body } = rig;

    body.position.copy(pose.position);
    body.quaternion.copy(pose.quaternion);
    body.updateMatrixWorld(true);

    // Respiración: el manto se hincha y el sifón late (~0.5 Hz).
    const breath = Math.sin(t * Math.PI * 2 * 0.5);
    rig.mantle.scale.setScalar(1 + 0.045 * breath);
    rig.mantlePivot.rotation.x = 0.5 + 0.06 * Math.sin(t * 0.8) - Math.min(0.25, pose.speed * 0.8);
    rig.siphon.scale.set(1 + 0.15 * breath, 1 + 0.15 * breath, 1);

    // Ojos: miran alrededor; la pupila se mantiene horizontal
    // (los estatocistos del pulpo compensan la inclinación del cuerpo).
    const euler = new THREE.Euler().setFromQuaternion(pose.quaternion, 'YXZ');
    for (const e of rig.eyes) {
      e.pivot.rotation.set(0, beh.gaze, -euler.z);
    }

    // Brazos
    const base = new THREE.Vector3();
    const out = new THREE.Vector3();
    ARMS.forEach((arm, i) => {
      base
        .set(Math.sin(arm.angle) * BODY.armRootRadius, BODY.armRootY, Math.cos(arm.angle) * BODY.armRootRadius + BODY.armRootZ)
        .applyMatrix4(body.matrixWorld);
      out.set(Math.sin(arm.angle), -0.65, Math.cos(arm.angle)).normalize().applyQuaternion(pose.quaternion);

      const c = gait.contact(arm, i, t);
      const ex = beh.explore[i] ?? 0;
      let contact = c.point;
      if (ex > 0) {
        // Exploración: el brazo se alza por delante y "palpa" el agua.
        const a = pose.yaw + arm.angle * 2.2;
        const sway = Math.sin(t * 1.9 + i * 2.1) * 0.08;
        const target = new THREE.Vector3(
          pose.position.x + Math.sin(a + sway) * 0.36,
          pose.position.y + 0.07 + 0.04 * Math.sin(t * 2.6 + i),
          pose.position.z + Math.cos(a + sway) * 0.36,
        );
        contact = c.point.clone().lerp(target, ex);
      }
      rig.spines[i].solve(
        {
          base,
          outDir: out,
          contact,
          lift: Math.max(c.lift, ex),
          swing: c.swing,
          time: t,
          armIndex: i,
          spec: arm,
          explore: ex,
        },
        seabed,
      );
      rig.tubes[i].update(rig.spines[i]);
      rig.suckers.update(i, rig.spines[i]);
    });

    ARM_RING_ORDER.forEach((ai, n) => {
      const bi = ARM_RING_ORDER[(n + 1) % ARM_RING_ORDER.length];
      rig.webs[n].update(rig.spines[ai], rig.spines[bi], n * 0.37);
    });

    rig.uniforms.uCamo.value = beh.camo;
    rig.uniforms.uPapillae.value = beh.papillae;
    rig.uniforms.uWave.value = beh.wave;
  }, [time, rig, motion, gait, behavior, seabed]);

  return <primitive object={rig.root} />;
};
