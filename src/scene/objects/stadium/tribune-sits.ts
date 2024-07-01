import * as THREE from 'three';
// import ThreeHelper from '../../../helpers/three-hepler';

export class TribuneSits extends THREE.Group {
  // private tribune: THREE.Object3D;
  // private curve: THREE.CatmullRomCurve3;
  // private posY: number;

  // private count = 160;
  // private sitsMatrix!: THREE.Matrix4;
  // private sitsMesh!: THREE.InstancedMesh;

  // curve: THREE.CatmullRomCurve3, tribune: THREE.Object3D, posY: number = 0
  constructor() {
    super();

    // this.tribune = tribune;
    // this.curve = curve;
    // this.posY = posY;

    this.init();
  }

  private init() {
    // this.initSits();

    // FISHES.forEach((fish, i) => {
    //   this.initVisitors(fish);
    // });

    // this.initVisitors();
  }

  // private initSits() {
  //   const curve = this.curve;
    
  //   const count = this.count;
  //   const points = curve.getPoints(count);
    
  //   const view = ThreeHelper.createModelView('models/pirates/Environment_Dock.gltf');
  //   const geometry = ThreeHelper.findGeometry(view);
  //   const material = ThreeHelper.findMaterial(view);
    

  //   const s = 6;

  //   if(geometry && material) {
  //     const sitsMesh = this.sitsMesh = new THREE.InstancedMesh(geometry, material, count);
  //     this.add(sitsMesh);

  //     const sitsMatrix = this.sitsMatrix = new THREE.Matrix4();
  //     let index = 0;

  //     for (let i = 0; i < count; i++) {
  //       // const x = points[i].x;
  //       // const z = points[i].z;

  //       points[i].y = this.tribune.position.y + this.posY;

  //       const res = this.getIntersectionWithTribune(points[i]);

  //       if(res) {
  //         sitsMatrix.identity();

  //         sitsMatrix.identity().compose(
  //           res.position,
  //           res.rotation,
  //           new THREE.Vector3(s, s, s)
  //         );
          
  //         sitsMesh.setMatrixAt(index++, sitsMatrix);
  //       }
  //     }
  //   }
  // }

  // private getIntersectionWithTribune(pointFrom: THREE.Vector3) {
  //   const pointTo = pointFrom.clone().addScalar(30);
  //   pointTo.y = this.tribune.position.y + this.posY;
  //   const ray = new THREE.Raycaster(pointFrom, pointTo);
  //   const intersects = ray.intersectObject(this.tribune, true);

  //   if(intersects.length > 0) {
  //     const rotation = new THREE.Quaternion();
  //     const normal = intersects[0].face!.normal;
  //     normal.y = 0;

  //     const lookAt = new THREE.Vector3(-1, 0, 0);
  //     const angle = lookAt.angleTo(normal);
  //     const axis = new THREE.Vector3().crossVectors(lookAt, normal).normalize();
  //     rotation.setFromAxisAngle(axis, angle);

  //     return {
  //       position: intersects[0].point,
  //       rotation: rotation,
  //     }
  //   };

  //   return null;
    
  // }

//   private initVisitors(name: string) {
//     const view = ThreeHelper.createModelView(name);

//     const geometry = ThreeHelper.findGeometry(view);
//     const material = ThreeHelper.findMaterial(view);

//     const counts = this.count;

//     if(geometry && material) {
//       const visitorsMesh = new THREE.InstancedMesh(geometry, material, counts);
//       this.add(visitorsMesh);

//       const visitorsMatrix = new THREE.Matrix4();
//       let index = 0;

//       const tempMatrix = new THREE.Matrix4();
//       const tempQuaternion = new THREE.Quaternion();
//       const tempScale = new THREE.Vector3();

//       for (let i = 0; i < counts; i++) {
//         this.sitsMesh.getMatrixAt(i, tempMatrix);
//         const position = new THREE.Vector3();
//         tempMatrix.decompose(position, tempQuaternion, tempScale);
        
//         position.y += 10;

//         visitorsMatrix.identity().compose(
//           position,
//           new THREE.Quaternion(),
//           new THREE.Vector3(100, 100, 100)
//         );

//         visitorsMesh.setMatrixAt(index++, visitorsMatrix);
//       }

//       visitorsMesh.instanceMatrix.needsUpdate = true;
//     }
//   }
}