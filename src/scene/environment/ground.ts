import * as THREE from 'three';

export default class Ground extends THREE.Group {

  private size: number;

  constructor() {
    super();
    this.size = 100;

    this.init();
  }

  private init() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('public/ground-alphamap-2.png');
    const sand = loader.load('public/sand2.png');
    sand.wrapS = THREE.RepeatWrapping;
    sand.wrapT = THREE.RepeatWrapping;
    // const repeatTimes = this.size / 4;
    // sand.repeat.set(repeatTimes, repeatTimes);

    const material = new THREE.MeshStandardMaterial({
      // color: 0xddcc88,
      map: sand,
      displacementMap: texture,
      // displacementBias: 4,
      displacementScale: 4,
      // flatShading: true,
      // depthTest: false,
    });

    const width = this.size;
    const height = this.size;
    const xCount = 3;
    const zCount = 3;
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

        matrix.identity();

        matrix.setPosition(startX + offsetX, 0, startZ + offsetZ);
        instancedMesh.setMatrixAt(index++, matrix);
      }
    }

    this.add(instancedMesh);
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