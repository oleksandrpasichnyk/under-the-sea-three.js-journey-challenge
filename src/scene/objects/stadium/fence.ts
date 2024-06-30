import * as THREE from 'three';
import ThreeHelper from '../../../helpers/three-hepler';

export default class Fence extends THREE.Group {
  private curve!: THREE.CatmullRomCurve3;
  private points!: THREE.Vector3[];
  private count: number = 100;

  constructor(startCurve: THREE.CatmullRomCurve3, count: number = 100) {
    super();

    this.curve = startCurve;
    this.count = count;

    this.init();
  }

  private init() {
    const count = this.count;
    const curve = this.curve;

    const points = this.points = curve.getPoints(count);

    const view = ThreeHelper.createModelView('models/pirates/Environment_Dock_Pole.gltf');
    const geometry = ThreeHelper.findGeometry(view);
    const material = ThreeHelper.findMaterial(view);

    if(geometry && material) {
      const sticksMesh = new THREE.InstancedMesh(geometry, material, count);
      this.add(sticksMesh);

      const sticksMatrix = new THREE.Matrix4();
      let index = 0;

      for (let i = 0; i < count; i++) {
        const x = points[i].x;
        const z = points[i].z;

        sticksMatrix.identity();
        sticksMatrix.setPosition(x, 10, z);
        sticksMatrix.scale(new THREE.Vector3(2, 3, 2));

        sticksMesh.setMatrixAt(index++, sticksMatrix);
      }
    }

    this.initRope();
    this.initRope(-2);
    this.initRope(-4);
  }

  private initRope(dy: number = 0) {
    const { count, points } = this;

    const rope = this.createRope();
    const ropeInstancedMesh = new THREE.InstancedMesh(rope.geometry, rope.material, count);
    this.add(ropeInstancedMesh);

    const ropeMatrix = new THREE.Matrix4();
    let ropeIndex = 0;

    for (let i = 0; i < count; i++) {
      const x = points[i].x;
      const z = points[i].z;

      ropeMatrix.identity();
      
      const angleBetweenStick = i < count - 1 ? Math.atan2(points[i + 1].x - points[i].x, points[i + 1].z - points[i].z) : Math.atan2(points[0].x - points[i].x, points[0].z - points[i].z);
      ropeMatrix.makeRotationY(angleBetweenStick - Math.PI * 0.5);

      const distanceBetweenStick = i < count - 1 ? points[i].distanceTo(points[i + 1]) : points[i].distanceTo(points[0]); 
      const s = distanceBetweenStick/10;
      ropeMatrix.scale(new THREE.Vector3(s, 1, 1));
      
      ropeMatrix.setPosition(x, 12.1 + dy, z);
      ropeInstancedMesh.setMatrixAt(ropeIndex++, ropeMatrix);
    }
  }

  private createRope() {
    const points2 = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, -0.5, 0),
      new THREE.Vector3(10, 0, 0)
    ];
    
    const curve2 = new THREE.CatmullRomCurve3(points2);
    
    const radius = 0.1;
    const segments = 7;
    const circleShape = new THREE.Shape();
    circleShape.moveTo(radius, 0);
    for (let i = 1; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      circleShape.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
    }
    circleShape.closePath();
    
    const extrudeSettings = {
      steps: 10,
      bevelEnabled: false,
      extrudePath: curve2
    };
    
    const extrudeGeometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings);
    const material2 = new THREE.MeshLambertMaterial({ color: 0xb9ab7d });
    const mesh = new THREE.Mesh(extrudeGeometry, material2);
    
    return mesh;
  }
}
