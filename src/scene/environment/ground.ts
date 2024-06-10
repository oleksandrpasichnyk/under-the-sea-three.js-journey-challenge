import * as THREE from 'three';
import { SIZES } from '../../config';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Ground extends THREE.Group {
  private size: number;
  private material!: THREE.MeshStandardMaterial;

  constructor() {
    super();
    this.size = 200;

    this.init();
  }

  public setGui(gui: any) {
    // const folderGround = gui.addFolder('Ground');
    // folderGround.addColor(this.material, 'color').name('color').onChange(() => {
    //   this.material.needsUpdate = true;
    // });
    // folderGround.open();
  }

  private init() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('ground-alphamap-2.png');
    const sand = loader.load('sand2.png');
    sand.wrapS = THREE.RepeatWrapping;
    sand.wrapT = THREE.RepeatWrapping;
    // const repeatTimes = this.size / 4;
    // sand.repeat.set(repeatTimes, repeatTimes);

    const material = this.material = new THREE.MeshStandardMaterial({
      color: 0xcaa341,
      map: sand,
      displacementMap: texture,
      displacementScale: 3,
      // flatShading: true,
      // depthTest: false,
    });

    const width = this.size;
    const height = this.size;
    const xCount = Math.ceil(SIZES.width/this.size);
    const zCount = Math.ceil(SIZES.length/this.size);
    const instances = xCount * zCount;

    // const instancedMesh = new THREE.Mesh(this.createPart(), material);


    const instancedMesh = new THREE.InstancedMesh(this.createPartGeometry(), material, instances);

    const matrix = new THREE.Matrix4();
    let index = 0;

    const startX = -width * (xCount - 1) * 0.5;
    const startZ = -height * (zCount - 1);

    for (let i = 0; i < xCount; i++) {
      for (let j = 0; j < zCount; j++) {
        const offsetX = i * width;
        const offsetZ = j * height;

        // matrix.identity();

        matrix.setPosition(startX + offsetX, 0, startZ + offsetZ);
        instancedMesh.setMatrixAt(index++, matrix);
      }
    }

    this.add(instancedMesh);

    this.addAsset();
  }

  private addAsset() {
    const loader = new GLTFLoader();
    loader.load('models/Clownfish.glb', (gltf) => {
      console.log('load', gltf)
      const tree = gltf.scene;

      const s = 10;
      tree.scale.set(s, s, s);

      tree.position.set(0, 0, 0);
      this.add(tree);
    });
  }

  private createPartGeometry() {
    const width = this.size;
    const height = this.size;

    const res = 1;

    const widthSegments = this.size * res;
    const heightSegments = this.size * res;
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

    geometry.rotateX(-Math.PI / 2);

    return geometry;
  }
}