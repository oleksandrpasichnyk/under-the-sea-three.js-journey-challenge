import * as THREE from 'three';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';

export default class Ground extends THREE.Group {
  private size: number;
  private resolution: number;
  private material!: THREE.MeshStandardMaterial;

  private view!: THREE.InstancedMesh;

  constructor() {
    super();
    this.size = 50;
    this.resolution = 0.6;

    this.init();
  }

  public setGui(gui: any) {
    const folderGround = gui.addFolder('Ground');

    // resolution
    folderGround.add(this, 'resolution', 0.1, 10).name('resolution').onChange(() => {
      this.resetView();
    });

    // size
    folderGround.add(this, 'size', 50, 5000).name('size').onChange(() => {
      this.resetView();
    });

    folderGround.add(this.material, 'flatShading').name('flatShading').onChange(() => {
      this.material.needsUpdate = true;
    });

    folderGround.add(this.material, 'wireframe').name('wireframe').onChange(() => {
      this.material.needsUpdate = true;
    });

    folderGround.add(this.material, 'displacementScale', 0, 100).name('displacementScale').onChange(() => {
      this.material.needsUpdate = true;
    });

    folderGround.addColor(this.material, 'color').name('color').onChange(() => {
      this.material.needsUpdate = true;
    });

    folderGround.add(this.view.position, 'y', -50, 50).name('y:').onChange((y) => {
      this.view.position.y = y;
    });

    folderGround.open();
  }

  private resetView() {
    this.view.geometry.dispose();
    this.remove(this.view);
    this.initView();
  }

  private init() {
    this.initMaterial();

    this.initView();
  }

  private initMaterial() {
    const texture = ALL_ASSETS.textures['ground/ground-alphamap-2.png'];
    const sand = ALL_ASSETS.textures['ground/sand2.png'];
    sand.wrapS = THREE.RepeatWrapping;
    sand.wrapT = THREE.RepeatWrapping;

    this.material = new THREE.MeshStandardMaterial({
      color: 0xcaa341,
      map: sand,
      displacementMap: texture,
      displacementScale: 3,
    });
  }

  private initView() {
    const width = this.size;
    const height = this.size;
    const xCount = Math.ceil(SIZES.width/this.size);
    const zCount = Math.ceil(SIZES.length/this.size);
    const instances = xCount * zCount;

    const view = this.view = new THREE.InstancedMesh(this.createPartGeometry(), this.material, instances);

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
        view.setMatrixAt(index++, matrix);
      }
    }

    this.add(view);

    console.log('vertices', view.geometry.attributes.position.count);
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