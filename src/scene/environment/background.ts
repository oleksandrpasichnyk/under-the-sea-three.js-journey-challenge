import * as THREE from 'three';
import Scene from '../scene';

export default class Background extends THREE.Group {
  constructor() {
    super();

    this.init();
  }

  private init() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      'leftblue.png',
      'rightblue.png',
      'upblue.png',
      'bottomblue.png',
      'backblue.png',
      'middleblue.png',
    ]);
    // scene.background = texture;

    // texture.rotation = Math.PI;

    const geometry = new THREE.SphereGeometry(500, 60, 60);
    const material = new THREE.MeshBasicMaterial({ envMap: texture, envMapRotation: new THREE.Euler(Math.PI, 0, 0), side: THREE.BackSide });
    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);
  }
}