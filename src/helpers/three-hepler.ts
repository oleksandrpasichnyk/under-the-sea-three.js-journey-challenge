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

  static createAnimations(name: string): THREE.AnimationClip[] {
    const source: any = ALL_ASSETS.models[name];

    if (!source) {
      throw new Error(`Object ${name} is not in the cache.`);
    }

    const anim = cloneGltf(source);

    return anim.animations;
  }

  static createModelView(name: string) {
    // const view = ALL_ASSETS.models[name].scene.clone(true);
    const view = cloneGltf(ALL_ASSETS.models[name]).scene;

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

  static createShapeByPoints(points: THREE.Vector3[]) {
    const shape = new THREE.Shape();

    points.forEach((p, i) => {
      if(i === 0) {
        shape.moveTo( p.x, p.z );
      }else{
        shape.lineTo( p.x, p.z );
      }
    })

    return shape;
  }

  static getCurvePosition(curve: THREE.CatmullRomCurve3, t: number) {
    const point = curve.getPoint(t);
    return new THREE.Vector3(point.x, point.y, point.z);
  }

  static getCurveRotation(curve: THREE.CatmullRomCurve3, t: number) {
    const tangent = curve.getTangent(t);
    const axis = new THREE.Vector3(0, 1, 0);
    const angle = Math.atan2(tangent.z, tangent.x);

    return new THREE.Quaternion().setFromAxisAngle(axis, angle);
  }
}