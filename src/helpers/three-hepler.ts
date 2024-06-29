import * as THREE from 'three';
import { ALL_ASSETS } from '../loader/loader';
import cloneGltf from './three-clone-gltf';

export default class ThreeHelper {
  public static getBoundingBox(view: THREE.Object3D) {
    
  }

  public static makeModelDoubleSide(view: THREE.Object3D) {
    view.traverse((child: any) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
      }
    });
  }

  static createAnim(name: string): THREE.AnimationClip {
    const source: any = ALL_ASSETS.models[name];

    if (!source) {
      throw new Error(`Object ${name} is not in the cache.`);
    }

    const anim = cloneGltf(source);

    return anim.animations[0];
  }

  static createModelView(name: string) {
    const gltf = ALL_ASSETS.models[name];
    const view = cloneGltf(gltf).scene;
    
    this.makeModelDoubleSide(view);

    return view;
  }

  static findGeometry(view: THREE.Object3D) {
    let geom = null;

    view.traverse((child: any) => {
      if (child.isMesh) {
        geom = child.geometry;

        return;
      }
    });

    return geom;
  }

  static findMaterial(view: THREE.Object3D) {
    let mat = null;

    view.traverse((child: any) => {
      if (child.isMesh) {
        mat = child.material;

        return;
      }
    });

    return mat;
  }

  static getPerpendicularCurve(startCurve: THREE.CatmullRomCurve3, dx: number): THREE.CatmullRomCurve3 {
    const points = startCurve.getPoints(100); // Get points along the curve
    const perpendicularPoints = [];

    const center = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const dis = point.distanceTo(center);
      const newDis = dis + dx;
      const s = newDis/dis;
      point.multiplyScalar(s)
      
      const newPoint = point.clone();

      perpendicularPoints.push(newPoint);
    }

    return new THREE.CatmullRomCurve3(perpendicularPoints);
  }

  static createCurveHelper(curve: THREE.CatmullRomCurve3) {
    const extrudeSettings = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: curve,
    };

    const circleShape = new THREE.Shape();

    circleShape.moveTo( 0, 0 );
    circleShape.absarc( 0, 0, 0.5, 0, Math.PI * 2, false );

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    const material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );
    const mesh = new THREE.Mesh( geometry, material );

    return mesh;
  }
}