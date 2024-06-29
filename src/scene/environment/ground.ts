import * as THREE from 'three';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';
import EnvDetails from './details';

import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import groundVertexShader from '../../shaders/ground/vertex.glsl'
import groundFragmentShader from '../../shaders/ground/fragment.glsl'
import { depth } from 'three/examples/jsm/nodes/Nodes';
import ThreeHelper from '../../helpers/three-hepler';

export default class Ground extends THREE.Group {
  private size: number;
  private resolution: number;
  private pathWidth: number;

  private mountWidth: number = 30;

  private material!: THREE.MeshStandardMaterial;
  private view!: THREE.Mesh; // THREE.InstancedMesh;

  private details!: EnvDetails;
  private mountainsUniforms: any;
  private mountainsUniforms2: any;
  private roadUniforms: any;

  private sandColor: number;
  private stoneColor: number;

  constructor() {
    super();
    this.size = 50;
    this.resolution = 5;

    this.sandColor = 0xcaa341;
    this.stoneColor = 0x777777;

    this.pathWidth = 60;


    this.details = new EnvDetails();
    this.add(this.details);

    this.mountainsUniforms = {
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(0.2),
      uStrength: new THREE.Uniform(12.0),
      uWarpFrequency: new THREE.Uniform(5),
      uWarpStrength: new THREE.Uniform(0.5),
    };

    this.mountainsUniforms2 = {
      uPositionFrequency: new THREE.Uniform(0.2),
      uStrength: new THREE.Uniform(3.0),
    };

    this.roadUniforms = {
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(0.2),
      uStrength: new THREE.Uniform(1.0),
      uWarpFrequency: new THREE.Uniform(5),
      uWarpStrength: new THREE.Uniform(0.5),
    };

    this.init();
  }

  public setGui(gui: any) {
    const folderGround = gui.addFolder('Ground');


    folderGround.add(this, 'resolution', 0.1, 10, 0.01).name('resolution');
    folderGround.add(this.mountainsUniforms.uPositionFrequency, 'value', 0, 10, 0.1).name('uPositionFrequency')
    folderGround.add(this.mountainsUniforms.uStrength, 'value', 0, 100, 0.1).name('uStrength')
    folderGround.add(this.mountainsUniforms.uWarpFrequency, 'value', 0, 100, 0.1).name('uWarpFrequency')
    folderGround.add(this.mountainsUniforms.uWarpStrength, 'value', 0, 100, 0.1).name('uWarpStrength')
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
    const height = 4;
    const segments = 20;

    const points = [];

    for (let i = 0; i < segments; i++) {
      points.push(new THREE.Vector2(height * 0.5, -width * 0.5 + i * width / (segments - 1)));
    }

    for (let i = 0; i < segments; i++) {
      points.push(new THREE.Vector2(-height * 0.5, -(-width * 0.5 + i * width / (segments - 1))));
    }

    const shape = new THREE.Shape( points );
    const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

    const material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      vertexShader: groundVertexShader,
      fragmentShader: groundFragmentShader,
      uniforms: this.roadUniforms,
      silent: true,
  
      metalness: 0,
      roughness: 1,
      color: this.sandColor,
      flatShading: true,

      // wireframe: true
    })


    geometry.computeVertexNormals();

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

    this.createRoad(roadSpline);
    this.createRoadCenterLine(centerLineSpline);

    this.createRightMountains(roadSpline);
    this.createCenterMountains(roadSpline);
    this.createFence(centerLineSpline);
    // this.createLeftMountains(roadSpline)
  }

  private createFence(startCurve: THREE.CatmullRomCurve3) {
    const count = 50;
    const curve = startCurve; // this.getPerpendicularCurve(startCurve, -this.pathWidth * 0.5);

    const points = curve.getPoints(count);

    const view = ThreeHelper.createModelView('models/pirates/Environment_Dock_Pole.gltf');
    const geometry = ThreeHelper.findGeometry(view);
    const material = ThreeHelper.findMaterial(view);

    if(geometry && material) {
      const mesh = new THREE.InstancedMesh(geometry, material, count);
      this.add(mesh);

      const matrix = new THREE.Matrix4();
      let index = 0;

      for (let i = 0; i < count; i++) {
        const x = points[i].x;
        const z = points[i].z;

        matrix.identity(); // Reset matrix to identity
        matrix.setPosition(x, 10, z);
        matrix.scale(new THREE.Vector3(10, 10, 10)); // Set scale to 10

        mesh.setMatrixAt(index++, matrix);
      }
    }

    const points2 = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 10, 5),
      new THREE.Vector3(10, 0, 10)
    ];
    
    // Create a curve based on the points
    const curve2 = new THREE.CatmullRomCurve3(points2);
    
    // Define a circular shape to extrude
    const radius = 1;
    const segments = 32;
    const circleShape = new THREE.Shape();
    circleShape.moveTo(radius, 0);
    for (let i = 1; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      circleShape.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
    }
    circleShape.closePath();
    
    // Define extrude settings
    const extrudeSettings = {
      steps: 100,
      bevelEnabled: false,
      extrudePath: curve2
    };
    
    // Create extrude geometry
    const extrudeGeometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(extrudeGeometry, material2);
    
    // Add the mesh to the scene
    this.add(mesh);

    mesh.position.y = 20;
  }

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

  private createRightMountains(startCurve: THREE.CatmullRomCurve3) {
    const w = 70;
    const h = 40;

    const curve = this.getPerpendicularCurve(startCurve, w * 0.5 + this.pathWidth * 0.5 - 1);
    const helper = this.createCurveHelper(curve);

    const extrudeSettings = {
      steps: 100,
      bevelEnabled: false,
      extrudePath: curve,
    };


    helper.position.y = h + 0.1;

    const circleShape = new THREE.Shape();

    circleShape.moveTo( -h * 0.5, w * 0.4 );
    // circleShape.moveTo( 0, w * 0.45 );
    circleShape.lineTo( h * 0.5, w * 0.5 );
    // circleShape.lineTo( h * 0.5, 0 );
    circleShape.lineTo( h * 0.5, -w * 0.5 );
    // circleShape.lineTo( h * 2, -w * 0.24 );
    circleShape.lineTo( h * 0.25, -w * 0.4 );
    circleShape.lineTo( -h * 0.01, -w * 0.3 );
    circleShape.lineTo( -h * 0.25, -w * 0.15 );
    circleShape.lineTo( -h * 0.5, -w * 0 );
    circleShape.lineTo( -h * 0.5, w * 0.1 );
    circleShape.lineTo( -h * 0.5, w * 0.2 );
    circleShape.lineTo( -h * 0.5, w * 0.3 );

    circleShape.closePath();

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    geometry.translate(0, h * 0.4, 0);
    // const material = new THREE.MeshLambertMaterial( { color: this.stoneColor, wireframe: false } );

    const material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      vertexShader: groundVertexShader,
      fragmentShader: groundFragmentShader,
      uniforms: this.mountainsUniforms,
      silent: true,
  
      metalness: 0,
      roughness: 0.8,
      color: this.stoneColor,
      flatShading: true,
    })

    const mesh = new THREE.Mesh( geometry, material );

    this.add( mesh );

    // this.noiseGeometry(mesh);
  }

  private createCenterMountains(startCurve: THREE.CatmullRomCurve3) {
    const w = 40;
    const h = 5;

    const curve = this.getPerpendicularCurve(startCurve, -this.pathWidth * 0.5 + 1);
    const helper = this.createCurveHelper(curve);

    const points = curve.getPoints(100);

    const extrudeSettings = {
      steps: 200,
      depth: h,
      // bevelEnabled: true,
      // bevelThickness: 1,
      // bevelSize: w,
      // bevelOffset: 0,
      // bevelSegments: 20
    };

    // helper.position.y = h + 0.1;

    const circleShape = new THREE.Shape();

    points.forEach((p, i) => {
      if(i === 0) {
        circleShape.moveTo( p.x, p.z );
      }else{
        circleShape.lineTo( p.x, p.z );
      }
    })

    const geometry = new THREE.ExtrudeGeometry( circleShape, extrudeSettings );
    geometry.rotateX(Math.PI * 0.5);
    geometry.translate(0, h, 0);

    const material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      vertexShader: groundVertexShader,
      fragmentShader: groundFragmentShader,
      uniforms: this.mountainsUniforms2,
      silent: true,
  
      metalness: 0,
      roughness: 0.8,
      color: this.stoneColor,
      flatShading: true,
    })
    const mesh = new THREE.Mesh( geometry, material );

    this.add( mesh );
  }

  private createLeftMountains(startCurve: THREE.CatmullRomCurve3) {
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
    uniforms: this.mountainsUniforms,
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
}