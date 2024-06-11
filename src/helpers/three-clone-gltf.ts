// source:
// https://gist.github.com/cdata/f2d7a6ccdec071839bc1954c32595e87

import * as THREE from 'three';
import { Skeleton } from "three";

// eslint-disable-next-line max-lines-per-function
const cloneGltf = (gltf: any): THREE.Object3D => {
  const clone: any = {
    animations: gltf.animations,
    scene: gltf.scene.clone(true)
  };

  const skinnedMeshes: any = {};

  gltf.scene.traverse((node: any) => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  const cloneBones = {};
  const cloneSkinnedMeshes = {};

  clone.scene.traverse((node: any) => {
    if (node.isBone) {
      (<any>cloneBones)[node.name] = node;
    }

    if (node.isSkinnedMesh) {
      (<any>cloneSkinnedMeshes)[node.name] = node;
    }
  });

  for (const name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name];
    const skeleton = skinnedMesh.skeleton;
    const cloneSkinnedMesh = (<any>cloneSkinnedMeshes)[name];

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = (<any>cloneBones)[skeleton.bones[i].name];
      orderedCloneBones.push(cloneBone);
    }

    cloneSkinnedMesh.bind(new Skeleton(orderedCloneBones, skeleton.boneInverses), cloneSkinnedMesh.matrixWorld);
  }

  return clone;
};

export default cloneGltf;
