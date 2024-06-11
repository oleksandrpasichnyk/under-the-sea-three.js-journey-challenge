import * as THREE from 'three';
import { ALL_ASSETS } from '../loader/loader';
import cloneGltf from './three-clone-gltf';

export default class ThreeHelper {
  public static makeModelDoubleSide(view: THREE.Object3D) {
    view.traverse((child: any) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
      }
    });
  }

  static createAnim(name: string): THREE.AnimationClip {
    const source: any = ALL_ASSETS.models[name];

    if (!source) {
      throw new Error(`Object ${name} is not in the cache.`);
    }

    const anim = cloneGltf(source);

    return anim.animations[0];
  }
}