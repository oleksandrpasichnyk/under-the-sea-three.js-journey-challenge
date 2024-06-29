import * as THREE from 'three';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';
import EnvDetails from './details';

import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import groundVertexShader from '../../shaders/ground/vertex.glsl'
import groundFragmentShader from '../../shaders/ground/fragment.glsl'
import ThreeHelper from '../../helpers/three-hepler';

import { SUBTRACTION, INTERSECTION, Brush, Evaluator } from 'three-bvh-csg';
import Fence from './fence';

export default class Stadium extends THREE.Group {
  private size: number;
  private resolution: number;
  private roadWidth: number;

  private mountWidth: number = 70;
  private mountHeight: number = 40;

  private borderWidth: number = 40;

  private material!: THREE.MeshStandardMaterial;
  private view!: THREE.Mesh;

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

    this.roadWidth = 100;


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
    const R = 200;
    const numPoints = 40;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const randomDeviation =  i < 2 || i > numPoints - 3 ? 20 : THREE.MathUtils.randFloatSpread(70);

      const x = Math.cos(angle) * (R + randomDeviation);
      const z = Math.sin(angle) * (R + randomDeviation);

      curvePoints.push(new THREE.Vector3(x, 0, z));
    }

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

    const width = this.roadWidth * 1.5;
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

    this.createRoadShape(roadSpline);
    // this.createRoadCenterLine(centerLineSpline);
    
    this.createRightMountains(roadSpline);
    this.createCenterMountains(roadSpline);
    this.createFence(centerLineSpline);
    
    this.createRoad(roadSpline);
    this.createRoadBorder(centerLineSpline);
    // this.createRoadBorder(centerLineSpline);
    // this.createRoadBorder(roadSpline);
    // this.createLeftMountains(roadSpline)
  }

  private createRoadBorder(centerLineSpline: THREE.CatmullRomCurve3) {
    // SUBTRACTION road - centerShape
    
    // create extrude geom for road right side
    // create extrude geom for road right side + border width and offset
    // subtract the two extrude geom

    const h = 5;

    const curve1 = ThreeHelper.getPerpendicularCurve(centerLineSpline, this.roadWidth * 0.5);
    const points1 = curve1.getPoints(200);

    const extrudeSettings = {
      steps: 2,
      depth: h + 1,
    };

    const shape1 = this.createShapeByPoints(points1);

    const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings );
    geometry1.rotateX(Math.PI * 0.5);

    const curve2 = ThreeHelper.getPerpendicularCurve(centerLineSpline, this.roadWidth * 0.5 + this.borderWidth + 10);
    const points2 = curve2.getPoints(200);

    const extrudeSettings2 = {
      steps: 2,
      depth: h,
    };

    const shape2 = this.createShapeByPoints(points2);

    const geometry2 = new THREE.ExtrudeGeometry( shape2, extrudeSettings2 );
    geometry2.rotateX(Math.PI * 0.5);

    const evaluator = new Evaluator();
    const result = evaluator.evaluate( new Brush(geometry2), new Brush(geometry1), SUBTRACTION );

    const material = new THREE.MeshLambertMaterial( { color: this.stoneColor, wireframe: false } );
    const mesh = new THREE.Mesh( result.geometry, material );
    // const mesh = new THREE.Mesh( geometry1, material );

    this.add( mesh );

    mesh.position.y = h;

    // const brush1 = new Brush( new SphereGeometry() );
    // brush1.updateMatrixWorld();

    // const brush2 = new Brush( new BoxGeometry() );
    // brush2.position.y = 0.5;
    // brush2.updateMatrixWorld();

    // const evaluator = new Evaluator();
    // const result1 = evaluator.evaluate( brush1, brush2, SUBTRACTION );
  }

  private createFence(startCurve: THREE.CatmullRomCurve3) {
    const distanceBetweenItems = 10;
    const fenceOffset = 2;
    const curve1 = ThreeHelper.getPerpendicularCurve(startCurve, this.roadWidth * 0.5 + fenceOffset);

    const curve1Length = curve1.getLength();
    const count1 = Math.floor(curve1Length / distanceBetweenItems);

    const fence1 = new Fence(curve1, count1);
    this.add(fence1);

    const curve2 = ThreeHelper.getPerpendicularCurve(startCurve, -this.roadWidth * 0.5 - fenceOffset);

    const curve2Length = curve2.getLength();
    const count2 = Math.floor(curve2Length / distanceBetweenItems);

    const fence2 = new Fence(curve2, count2);
    this.add(fence2);
  }

  private createRightMountains(startCurve: THREE.CatmullRomCurve3) {
    const w = this.mountWidth;
    const h = this.mountHeight;

    const curve = ThreeHelper.getPerpendicularCurve(startCurve, w * 0.5 + this.roadWidth * 0.5 + this.borderWidth);

    const extrudeSettings = {
      steps: 300,
      bevelEnabled: false,
      extrudePath: curve,
    };

    const circleShape = new THREE.Shape();

    circleShape.moveTo( -h * 0.5, w * 0.4 );
    circleShape.lineTo( h * 0.5, w * 0.5 );
    circleShape.lineTo( h * 0.5, -w * 0.5 );
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
  }

  private createShapeByPoints(points: THREE.Vector3[]) {
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

  private createCenterMountains(startCurve: THREE.CatmullRomCurve3) {
    const h = 5;

    const curve = ThreeHelper.getPerpendicularCurve(startCurve, -this.roadWidth * 0.5 + 1);
    const points = curve.getPoints(300);

    const extrudeSettings = {
      steps: 200,
      depth: h,
    };

    const shape = this.createShapeByPoints(points);

    const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
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

    return mesh;
  }

  private createRoadShape(startCurve: THREE.CatmullRomCurve3) {
    const h = 20;

    const curve = ThreeHelper.getPerpendicularCurve(startCurve, this.roadWidth * 0.5);
    const points = curve.getPoints(200);

    const extrudeSettings = {
      steps: 2,
      depth: h,
    };

    const shape = this.createShapeByPoints(points);

    const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    geometry.rotateX(Math.PI * 0.5);

    const mesh = new THREE.Mesh( geometry );

    mesh.position.y = h * 0.5;

    // this.add( mesh );
    return mesh;
  }
}