import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Fish extends THREE.Group {
  constructor() {
    super();

    this.init();
  }

  private init() {
    const loader = new GLTFLoader();
    loader.load('models/Clownfish.glb', (gltf: any) => {
      const view = gltf.scene;

      const s = 2;
      view.scale.set(s, s, s);

      // tree.position.set(0, 0, 0);
      this.add(view);


      // traverse view

      view.traverse((child: any) => {
        if (child.isMesh) {
          child.material.side = THREE.DoubleSide;
        }
      });
    });
  }


  public update(dt: number) {

  }
}
