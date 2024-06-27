import * as THREE from 'three';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';
import EnvDetails from './details';

import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import groundVertexShader from '../../shaders/ground/vertex.glsl'
import groundFragmentShader from '../../shaders/ground/fragment.glsl'

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
  private uniforms: any;

  private sandColor: number;

  constructor() {
    super();
    this.size = 50;
    this.resolution = 5;

    this.sandColor = 0xcaa341;

    this.pathWidth = 60;


    this.details = new EnvDetails();
    this.add(this.details);

    // this.init();
    this.uniforms = {
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(0.2),
      uStrength: new THREE.Uniform(2.0),
      uWarpFrequency: new THREE.Uniform(5),
      uWarpStrength: new THREE.Uniform(0.5),
    }

    this.init();
  }

  public setGui(gui: any) {
    const folderGround = gui.addFolder('Ground');


    folderGround.add(this, 'resolution', 0.1, 10, 0.01).name('resolution');
    folderGround.add(this.uniforms.uPositionFrequency, 'value', 0, 10, 0.1).name('uPositionFrequency')
    folderGround.add(this.uniforms.uStrength, 'value', 0, 100, 0.1).name('uStrength')
    folderGround.add(this.uniforms.uWarpFrequency, 'value', 0, 100, 0.1).name('uWarpFrequency')
    folderGround.add(this.uniforms.uWarpStrength, 'value', 0, 100, 0.1).name('uWarpStrength')

    // folderGround.add(this, 'pathWidth', 1, 100, 1).name('pathWidth');
    // folderGround.add(this, 'mountWidth', 1, 100, 1).name('mountWidth');
    // folderGround.add(this, 'minMountHeight', 1, 50, 1).name('minMountHeight');
    // folderGround.add(this, 'mountRandomHeight', 1, 50, 1).name('mountRandomHeight');
    // folderGround.add(this, 'maxGroundHeight', 1, 50, 1).name('maxGroundHeight');
    folderGround.add({ reset: () => this.resetShaderView() }, 'reset').name('reset view');

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

    // folderGround.close();
  }

  private resetShaderView() {
    // this.view.material.dispose();
    // this.remove(this.view);
    // this.createShaderView();
  }

  private createRoadCurve() {
    const curvePoints = [];
    const R = 100;
    const numPoints = 25;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const randomDeviation =  i < 2 || i > numPoints - 3 ? 20 : THREE.MathUtils.randFloatSpread(15);

      const x = Math.cos(angle) * (R + randomDeviation);
      const z = Math.sin(angle) * (R + randomDeviation);

      curvePoints.push(new THREE.Vector3(x, 0, z));
    }

    // To ensure the curve is closed, add the first point at the end of the array again
    curvePoints.push(curvePoints[0].clone());
    curvePoints.push(curvePoints[1].clone());

    return curvePoints;
  }

  private createRoad(spline: THREE.CatmullRomCurve3) {
    const extrudeSettings = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: spline,
    };

    const width = this.pathWidth;
    const segments = 5;

    const points = [];

    for (let i = 0; i < segments; i++) {
      points.push(new THREE.Vector2(0, -width * 0.5 + i * width / (segments - 1)));
    }

    const shape = new THREE.Shape( points );
    const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    const material = new THREE.MeshLambertMaterial( { color: this.sandColor, wireframe: false } );
    const road = new THREE.Mesh( geometry, material );

    this.add( road );
  }

  private createRoadCenterLine(curve: THREE.CatmullRomCurve3) {
    const extrudeSettings = {
      steps: 300,
      bevelEnabled: false,
      extrudePath: curve,
    };

    const w = 1;
    const h = 0.1;

    const circleShape = new THREE.Shape();

    circleShape.moveTo( -h * 0.5, w * 0.5 );
    circleShape.lineTo( h * 0.5, w * 0.5 );
    circleShape.lineTo( h * 0.5, -w * 0.5 );
    circleShape.lineTo( -h * 0.5, -w * 0.5 );

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    geometry.translate(0, -h * 0.5 + 0.001, 0);
    const material = new THREE.MeshLambertMaterial( { color: 0x000000, wireframe: false } );
    const mesh = new THREE.Mesh( geometry, material );

    this.add( mesh );
  }

  private init() {
    const curvePoints = this.createRoadCurve();
    const centerLinePoints = [...curvePoints]
    centerLinePoints.pop();
    const roadSpline = new THREE.CatmullRomCurve3( curvePoints );
    const centerLineSpline = new THREE.CatmullRomCurve3( centerLinePoints );

    roadSpline.curveType = "catmullrom";
    centerLineSpline.curveType = "catmullrom";


    // this.createCurveHelper(roadSpline);

    this.createRoad(roadSpline);
    this.createRoadCenterLine(centerLineSpline);

    this.createLeftMountains(roadSpline);
    this.createRightMountains(roadSpline)
  }

  // private getPerpendicularCurve(startCurve: THREE.CatmullRomCurve3, dx: number): THREE.CatmullRomCurve3 {
  //   const points = startCurve.getPoints(100); // Get points along the curve
  //   const perpendicularPoints = [];

  //   for (let i = 0; i < points.length; i++) {
  //     const point = points[i];
  //     const tangent = startCurve.getTangent(i / (points.length - 1)).normalize(); // Get tangent vector

  //     // Calculate perpendicular vector in the XY plane
  //     const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

  //     // Offset point by dx along the perpendicular vector
  //     const newPoint = new THREE.Vector3(
  //       point.x + perpendicular.x * dx,
  //       point.y + perpendicular.y * dx,
  //       point.z + perpendicular.z * dx
  //     );

  //     perpendicularPoints.push(newPoint);
  //   }

  //   return new THREE.CatmullRomCurve3(perpendicularPoints);
  // }

  private getPerpendicularCurve(startCurve: THREE.CatmullRomCurve3, dx: number): THREE.CatmullRomCurve3 {
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

  private createLeftMountains(startCurve: THREE.CatmullRomCurve3) {
    const w = 50;
    const h = 20;

    const curve = this.getPerpendicularCurve(startCurve, w * 0.5 + this.pathWidth * 0.5 - 1);
    const helper = this.createCurveHelper(curve);

    const extrudeSettings = {
      steps: 300,
      bevelEnabled: false,
      extrudePath: curve,
    };


    helper.position.y = h + 0.1;

    const circleShape = new THREE.Shape();

    circleShape.moveTo( -h * 0.5, w * 0.4 );
    circleShape.lineTo( h * 0.5, w * 0.5 );
    circleShape.lineTo( h * 0.5, -w * 0.5 );
    circleShape.lineTo( -h * 0.4, -w * 0.2 );

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    geometry.translate(0, h * 0.5, 0);
    const material = new THREE.MeshLambertMaterial( { color: this.sandColor, wireframe: false } );
    const mesh = new THREE.Mesh( geometry, material );

    this.add( mesh );
  }

  private createRightMountains(startCurve: THREE.CatmullRomCurve3) {
    const w = 40;
    const h = 20;

    const curve = this.getPerpendicularCurve(startCurve, -w * 0.5 - this.pathWidth * 0.5 + 1);
    const helper = this.createCurveHelper(curve);

    const extrudeSettings = {
      steps: 300,
      bevelEnabled: false,
      extrudePath: curve,
    };

    helper.position.y = h + 0.1;

    const circleShape = new THREE.Shape();

    circleShape.moveTo( -h * 0.4, w * 0.2 );
    circleShape.lineTo( h * 0.5, w * 0.5 );
    circleShape.lineTo( h * 0.5, -w * 0.5 );
    circleShape.lineTo( -h * 0.5, -w * 0.4 );

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    geometry.translate(0, h * 0.5, 0);
    const material = new THREE.MeshLambertMaterial( { color: this.sandColor, wireframe: false } );
    const mesh = new THREE.Mesh( geometry, material );

    this.add( mesh );
  }

  private createCurveHelper(curve: THREE.CatmullRomCurve3) {
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

    this.add( mesh );

    return mesh;
  }

  private createShaderView() {
    const res = this.resolution;
    const width = 100; // SIZES.width / 2;
    const length = 100; // SIZES.length / 2;

    console.log('res', res);

    const widthSegments = width * res;
    const lengthSegments = length * res;

    console.log(width, length, widthSegments, lengthSegments)

    const geometry = new THREE.PlaneGeometry(width, length, widthSegments, lengthSegments)
    geometry.deleteAttribute('uv')
    geometry.deleteAttribute('normal')
    geometry.rotateX(- Math.PI * 0.5)

  const material = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    uniforms: this.uniforms,
    silent: true,

    // MeshPhysicalMaterial
    metalness: 0,
    roughness: 0.8,
    color: 0xcaa341,
    flatShading: true,
})

    const ground = this.view = new THREE.Mesh(geometry, material)
    this.add(ground)

    console.log('vertices', ground.geometry.attributes.position.count)
  }

  private resetVerticesView() {
    this.view.geometry.dispose();
    this.material.dispose();
    this.remove(this.view);
    this.init();
  }

  private getClosestPerpendicularPointOnCurve(curve: THREE.CatmullRomCurve3, x: number, y: number, width: number) {
    let closestPoint = null;
    let minDistance = Infinity;
  
    // Sample points along the curve to find the closest perpendicular point
    const divisions = 100; // Increase for higher accuracy
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
  

  private initTraceByVertices() {
    const s = 1.2;
    const res = this.resolution;
    const width = SIZES.width / s;
    const length = SIZES.length / s;

    const widthSegments = width * res;
    const lengthSegments = length * res;

    const geometry = new THREE.PlaneGeometry(width, length, widthSegments, lengthSegments);
    const material = this.material = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    const plane = this.view = new THREE.Mesh(geometry, material);

    const helpersGroup = new THREE.Group();
    this.add(helpersGroup);

    helpersGroup.scale.set(s, s, s);

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
      helpersGroup.add(point);
    });

    const curve = new THREE.CatmullRomCurve3(curvePoints.map(p => new THREE.Vector3(p.x, -p.y, 0)));

    const pathWidth = this.pathWidth / s;
    const mountWidth = this.mountWidth / s;
    const minMountHeight = this.minMountHeight / s;
    const mountRandomHeight = this.mountRandomHeight / s;
    const maxGroundHeight = this.maxGroundHeight / s;

    const vertices = plane.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];

      // Get the closest point on the curve to the current vertex
      const pointOnCurve = curve.getPoint(curve.getUtoTmapping((x / width) + 0.5, 0));

      // Define the path width

      
      // const tangent = curve.getTangent(curve.getUtoTmapping((x / width) + 0.5, 0)).normalize();
      // const perpendicular = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      
      // const perpendicularPointOnCurve = curve.getPointAt((x / width) + 0.5);
      // const tangent = curve.getTangent((x / width) + 0.5).normalize();
      
      
      if (i % 1800 === 0) {
        const point = new THREE.Mesh(new THREE.SphereGeometry(3), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        point.position.set(pointOnCurve.x, 8, -pointOnCurve.y);
        helpersGroup.add(point);
      }

      const closestPoint = this.getClosestPerpendicularPointOnCurve(curve, x, y, width);
      
      
      if(closestPoint) {

        const distance = Math.sqrt(Math.pow(closestPoint.y - y, 2));

        if (Math.abs(distance) < pathWidth * 0.5) {
          vertices[i + 2] = 0; // Flat path along the curve
        } else if (Math.abs(distance) >= pathWidth * 0.5 && Math.abs(distance) < pathWidth * 0.5 + mountWidth) {
          vertices[i + 2] = Math.random() * mountRandomHeight + minMountHeight; // Mountains on left and right
        } else {
          vertices[i + 2] = Math.random() * maxGroundHeight; // Random ground elsewhere
        }
      }
    }

    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.computeVertexNormals();

    this.add(plane);

    plane.rotation.x = -Math.PI / 2;
    plane.scale.set(s, s, s);
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