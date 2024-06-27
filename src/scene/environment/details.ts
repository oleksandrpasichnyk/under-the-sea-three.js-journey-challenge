import * as THREE from 'three';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';
import ThreeHelper from '../../helpers/three-hepler';

export default class EnvDetails extends THREE.Group {
  private material: THREE.MeshStandardMaterial;

  constructor() {
    super();

    this.material = new THREE.MeshStandardMaterial();

    this.init();
  }

  private init() {
    this.initRocks();
  }

  private initRocks() {
    const rocks = new THREE.Group();
    this.add(rocks);

    const assetsList = [
      'models/pirates/Environment_Rock_1.gltf',
      'models/pirates/Environment_Rock_2.gltf',
      'models/pirates/Environment_Rock_3.gltf',
      'models/pirates/Environment_Rock_4.gltf',
      'models/pirates/Environment_Rock_5.gltf'
    ];
    
    assetsList.forEach(asset => {
      const count = Math.floor(Math.random() * 40 + 50);

      const instancesMesh = this.createInstancedMesh(asset, count);

      if(instancesMesh) {
        rocks.add(instancesMesh);

        this.setRandomPositions(instancesMesh);
      }

    });

    // const 
  }

  private initBigRocks() {


    // "Environment_Cliff1.gltf",
    // "Environment_Cliff2.gltf",
    // "Environment_Cliff3.gltf",
    // "Environment_Cliff4.gltf",
  }

  private createInstancedMesh(assetName: string, count: number) {
    const view = ThreeHelper.createModelView(assetName);
    const geometry = ThreeHelper.findGeometry(view);
    const material = ThreeHelper.findMaterial(view);

    if(geometry && material) {
      const mesh = new THREE.InstancedMesh(geometry, material, count);
      return mesh;
    }

    return null;
  }

  private setRandomPositions(instancedMesh: THREE.InstancedMesh) {
    const count = instancedMesh.count;

    const matrix = new THREE.Matrix4();
    let index = 0;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100 - 50;
      const z = Math.random() * 100 - 50;

      // matrix.identity();

      matrix.setPosition(x, 0, z);
      instancedMesh.setMatrixAt(index++, matrix);
    }
  }
}