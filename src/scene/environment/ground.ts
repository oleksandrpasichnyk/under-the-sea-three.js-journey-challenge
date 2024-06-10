import * as THREE from 'three';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';

export default class Ground extends THREE.Group {
  private size: number;
  private resolution: number;
  private material!: THREE.MeshStandardMaterial;

  constructor() {
    super();
    this.size = 50;
    this.resolution = 0.6;

    this.init();
  }

  public setGui(gui: any) {
    const folderGround = gui.addFolder('Ground');

    // resolution
    // folderGround.add(this, 'resolution', 0.1, 1).name('resolution').onChange(() => {
    //   this.children[0].geometry.dispose();
    //   this.children[0].material.dispose();
    //   this.remove(this.children[0]);
    //   this.init();

    //   // this.material.wireframe = true;
    // });

    // size
    // folderGround.add(this, 'size', 50, 500).name('size').onChange(() => {
    //   this.remove(this.children[0]);
    //   this.init();
    // });

    folderGround.add(this.material, 'wireframe').name('wireframe').onChange(() => {
      this.material.needsUpdate = true;
    });
    folderGround.add(this.material, 'displacementScale', 0, 10).name('displacementScale').onChange(() => {
      this.material.needsUpdate = true;
    });
    folderGround.addColor(this.material, 'color').name('color').onChange(() => {
      this.material.needsUpdate = true;
    });
    folderGround.open();
  }

  private init() {
    const texture = ALL_ASSETS.textures['ground/ground-alphamap-2.png'];
    const sand = ALL_ASSETS.textures['ground/sand2.png'];
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

    console.log('vertices', instancedMesh.geometry.attributes.position.count);
  }

  private createPartGeometry() {
    const width = this.size;
    const height = this.size;

    const res = this.resolution;

    const widthSegments = this.size * res;
    const heightSegments = this.size * res;
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

    geometry.rotateX(-Math.PI / 2);

    return geometry;
  }
}