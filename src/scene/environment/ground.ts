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
    this.resolution = 0.5;

    this.init();
  }

  public setGui(gui: any) {
    const folderGround = gui.addFolder('Ground');

    // // resolution
    // folderGround.add(this, 'resolution', 0.1, 10, 0.01).name('resolution').onChange(() => {
    //   this.resetView();
    // });

    // // size
    // folderGround.add(this, 'size', 2, 300).name('size').onChange(() => {
    //   this.resetView();
    // });

    // folderGround.add(this.material, 'flatShading').name('flatShading').onChange(() => {
    //   this.material.needsUpdate = true;
    // });

    // folderGround.add(this.material, 'wireframe').name('wireframe').onChange(() => {
    //   this.material.needsUpdate = true;
    // });

    // folderGround.add(this.material, 'displacementScale', 0, 5, 0.01).name('displacementScale').onChange(() => {
    //   this.material.needsUpdate = true;
    // });

    // folderGround.addColor(this.material, 'color').name('color').onChange(() => {
    //   this.material.needsUpdate = true;
    // });

    // folderGround.add(this.view.position, 'y', -50, 50).name('y:').onChange((y: number) => {
    //   this.view.position.y = y;
    // });

    folderGround.close();
  }

  private resetView() {
    this.view.geometry.dispose();
    this.remove(this.view);
    this.initView();
  }

  private init() {
    const res = this.resolution;

    

    const geometry = new THREE.PlaneGeometry(SIZES.width, SIZES.length, SIZES.width * res, SIZES.length * res);
    const material = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    const plane = new THREE.Mesh(geometry, material);

    const curvePoints = [
      new THREE.Vector2(-50, -20),
      new THREE.Vector2(-30, -10),
      new THREE.Vector2(-10, -10),
      new THREE.Vector2(10, 10),
      new THREE.Vector2(30, 20),
      new THREE.Vector2(50, 50)
    ];

    const curve = new THREE.CatmullRomCurve3(curvePoints.map(p => new THREE.Vector3(p.x, p.y, 0)));

    const vertices = plane.geometry.attributes.position.array;
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];

        // Get the closest point on the curve to the current vertex
        const pointOnCurve = curve.getPoint(curve.getUtoTmapping(x / 100 + 0.5, 0));

        // Define the path width
        const pathWidth = 5;

        if (Math.abs(y - pointOnCurve.y) < pathWidth) {
          vertices[i + 2] = 0; // Flat path along the curve
        } else if (Math.abs(y - pointOnCurve.y) >= pathWidth && Math.abs(y - pointOnCurve.y) < pathWidth * 2) {
          vertices[i + 2] = Math.random() * 5 + 2; // Mountains on left and right
        } else {
          vertices[i + 2] = Math.random() * 3; // Random ground elsewhere
        }
      }

    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.computeVertexNormals();

    this.add(plane);

    plane.rotation.x = -Math.PI / 2;
    // plane.position.y = 10;

    // this.initMaterial();

    // this.initView();
  }

  private initMaterial() {
    // const texture = ALL_ASSETS.textures['ground/ground-noise.jpg'];
    const texture = ALL_ASSETS.textures['ground/ground-alphamap-2.png'];
    const sand = ALL_ASSETS.textures['ground/sand2.png'];
    sand.wrapS = THREE.RepeatWrapping;
    sand.wrapT = THREE.RepeatWrapping;

    //set texture scale
    sand.repeat.set(1, 1);

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

    const offset = -0.01;

    for (let i = 0; i < xCount; i++) {
      for (let j = 0; j < zCount; j++) {
        const offsetX = i * (width + offset);
        const offsetZ = j * (height + offset);

        // matrix.identity();

        matrix.setPosition(startX + offsetX, 0, startZ + offsetZ);
        view.setMatrixAt(index++, matrix);
      }
    }

    this.add(view);

    // console.log('vertices', view.geometry.attributes.position.count);
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