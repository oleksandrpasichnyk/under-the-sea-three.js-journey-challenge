import * as THREE from 'three';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';
import EnvDetails from './details';

export default class Ground extends THREE.Group {
  private size: number;
  private resolution: number;
  private pathWidth: number;
  private mountRandomHeight: number = 4;
  private maxGroundHeight: number = 3;
  private minMountHeight: number = 10;
  private mountWidth: number = 30;

  private material!: THREE.MeshStandardMaterial;
  private view!: THREE.Mesh; // THREE.InstancedMesh;

  private details!: EnvDetails;

  constructor() {
    super();
    this.size = 50;
    this.resolution = 0.3;

    this.pathWidth = 60;

    this.details = new EnvDetails();
    this.add(this.details);

    // this.init();
  }

  public setGui(gui: any) {
    const folderGround = gui.addFolder('Ground');

    folderGround.add(this, 'resolution', 0.1, 10, 0.01).name('resolution');
    folderGround.add(this, 'pathWidth', 1, 50, 1).name('pathWidth');
    folderGround.add(this, 'minMountHeight', 1, 50, 1).name('minMountHeight');
    folderGround.add(this, 'mountRandomHeight', 1, 50, 1).name('mountRandomHeight');
    folderGround.add(this, 'maxGroundHeight', 1, 50, 1).name('maxGroundHeight');

    // btn to reset view
    folderGround.add({ reset: () => this.resetView() }, 'reset').name('reset view');

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
    this.material.dispose();
    this.remove(this.view);
    this.init();
  }

  private getClosestPerpendicularPointOnCurve(curve: THREE.CatmullRomCurve3, x: number, y: number, width: number) {
    let closestPoint = null;
    let minDistance = Infinity;
  
    // Sample points along the curve to find the closest perpendicular point
    const divisions = 200; // Increase for higher accuracy
    for (let i = 0; i <= divisions; i++) {
      // const t = i / divisions;
      // const point = curve.getPoint(t);

      const point = curve.getPoint(curve.getUtoTmapping((x / width) + 0.5, 0));

      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
  
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
  
    return closestPoint;
  }
  

  private init() {
    const res = this.resolution;
    const width = SIZES.width;
    const length = SIZES.length;

    const widthSegments = width * res;
    const lengthSegments = length * res;

    const geometry = new THREE.PlaneGeometry(width, length, widthSegments, lengthSegments);
    const material = this.material = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    const plane = this.view = new THREE.Mesh(geometry, material);

    const curvePoints = [
      new THREE.Vector2(-50, -20),
      new THREE.Vector2(-30, -10),
      new THREE.Vector2(-10, -10),
      new THREE.Vector2(10, 10),
      new THREE.Vector2(30, 20),
      new THREE.Vector2(50, 50)
    ];

    curvePoints.forEach(p => {
      p.x = p.x / 100 * width;
      p.y = p.y / 100 * length;

      const point = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      point.position.set(p.x, 5, p.y);
      this.add(point);
    });

    const curve = new THREE.CatmullRomCurve3(curvePoints.map(p => new THREE.Vector3(p.x, -p.y, 0)));

    const vertices = plane.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];

      // Get the closest point on the curve to the current vertex
      const pointOnCurve = curve.getPoint(curve.getUtoTmapping((x / width) + 0.5, 0));

      // Define the path width
      const pathWidth = this.pathWidth;

      
      // const tangent = curve.getTangent(curve.getUtoTmapping((x / width) + 0.5, 0)).normalize();
      // const perpendicular = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      
      // const perpendicularPointOnCurve = curve.getPointAt((x / width) + 0.5);
      // const tangent = curve.getTangent((x / width) + 0.5).normalize();
      
      
      if (i % 1800 === 0) {
        const point = new THREE.Mesh(new THREE.SphereGeometry(3), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        point.position.set(pointOnCurve.x, 8, -pointOnCurve.y);
        this.add(point);
      }

      const closestPoint = this.getClosestPerpendicularPointOnCurve(curve, x, y, width);
      
      
      if(closestPoint) {

        const distance = Math.sqrt(Math.pow(closestPoint.y - y, 2));

        if (Math.abs(distance) < pathWidth * 0.5) {
          vertices[i + 2] = 0; // Flat path along the curve
        } else if (Math.abs(distance) >= pathWidth * 0.5 && Math.abs(distance) < pathWidth * 0.5 + this.mountWidth) {
          vertices[i + 2] = Math.random() * this.mountRandomHeight + this.minMountHeight; // Mountains on left and right
        } else {
          vertices[i + 2] = Math.random() * this.maxGroundHeight; // Random ground elsewhere
        }
      }
    }

    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.computeVertexNormals();

    this.add(plane);

    plane.rotation.x = -Math.PI / 2;

    console.log('vertices', plane.geometry.attributes.position.count);

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
    const xCount = Math.ceil(SIZES.width / this.size);
    const zCount = Math.ceil(SIZES.length / this.size);
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