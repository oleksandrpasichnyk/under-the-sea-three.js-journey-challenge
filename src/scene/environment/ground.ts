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

  constructor() {
    super();
    this.size = 50;
    this.resolution = 5;

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

  private init() {
    const curvePoints = [];

    for ( let i = 0; i < 10; i ++ ) {
      curvePoints.push( new THREE.Vector3( THREE.MathUtils.randFloat( - 50, 50 ), 0, ( i - 4.5 ) * 50 ) );
    }

    const randomSpline = new THREE.CatmullRomCurve3( curvePoints );

    // visualize curve
    const points = randomSpline.getPoints( 50 );

    const extrudeSettings = {
      steps: 100,
      bevelEnabled: false,
      extrudePath: new THREE.CatmullRomCurve3( points ),
    };

    const circleShape = new THREE.Shape();

    circleShape.moveTo( 0, 0 );
    circleShape.absarc( 0, 0, 0.5, 0, Math.PI * 2, false );

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    const material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );
    const mesh = new THREE.Mesh( geometry, material );

    mesh.position.set(0, 0.1, 0);
    this.add( mesh );

    const extrudeSettings2 = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: randomSpline,
    };

    const width = 20;
    const segments = 5;

    const pts2 = [];

    for (let i = 0; i < segments; i++) {
      pts2.push(new THREE.Vector2(0, -width * 0.5 + i * width / (segments - 1)));
    }

    const shape2 = new THREE.Shape( pts2 );
    const geometry2 = new THREE.ExtrudeGeometry( shape2, extrudeSettings2 );
    const material2 = new THREE.MeshLambertMaterial( { color: 0xff8000, wireframe: false } );
    const mesh2 = new THREE.Mesh( geometry2, material2 );

    this.add( mesh2 );

    this.createLeftMountain(curvePoints);
    // this.createRightRightMountains(curvePoints)
  }

  private getPerpendicularCurve(startCurve: THREE.CatmullRomCurve3, dx: number): THREE.CatmullRomCurve3 {
    const points = startCurve.getPoints(50); // Get points along the curve
    const perpendicularPoints = [];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const tangent = startCurve.getTangent(i / (points.length - 1)).normalize(); // Get tangent vector

      // Calculate perpendicular vector in the XY plane
      const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Offset point by dx along the perpendicular vector
      const newPoint = new THREE.Vector3(
        point.x + perpendicular.x * dx,
        point.y + perpendicular.y * dx,
        point.z + perpendicular.z * dx
      );

      perpendicularPoints.push(newPoint);
    }

    return new THREE.CatmullRomCurve3(perpendicularPoints);
  }

  private createLeftMountain(centerCurvePoints: THREE.Vector3[]) {
    
    const curve = this.getPerpendicularCurve(new THREE.CatmullRomCurve3(centerCurvePoints), 10);
    const helper = this.createCurveHelper(curve);
    
  }

  private createRightMountains(centerCurvePoints: THREE.Vector3[]) {
    
    const curve = this.getPerpendicularCurve(new THREE.CatmullRomCurve3(centerCurvePoints), -40);
    this.createCurveHelper(curve);
  }

  private createCurveHelper(curve: THREE.CatmullRomCurve3) {
    const points = curve.getPoints(200);
    const extrudeSettings = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: new THREE.CatmullRomCurve3( points ),
    };

    const circleShape = new THREE.Shape();

    circleShape.moveTo( 0, 0 );
    circleShape.absarc( 0, 0, 0.5, 0, Math.PI * 2, false );

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    const material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );
    const mesh = new THREE.Mesh( geometry, material );

    mesh.position.set(0, 0.1, 0);
    this.add( mesh );
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