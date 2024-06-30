import * as THREE from 'three';
import EnvDetails from './details';

import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import groundVertexShader from '../../shaders/ground/vertex.glsl'
import groundFragmentShader from '../../shaders/ground/fragment.glsl'
import ThreeHelper from '../../helpers/three-hepler';

import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';
import Fence from './fence';
import { ALL_ASSETS } from '../../loader/loader';

export default class Stadium extends THREE.Group {
  private roadWidth: number;

  private tribuneWidth: number = 70;
  private tribuneHeight: number = 40;

  private borderWidth: number = 40;

  private details!: EnvDetails;
  private mountainsUniforms: any;
  private mountainsUniforms2: any;
  private roadUniforms: any;

  private sandColor: number;
  private stoneColor: number;
  private stoneColor2: number;

  private centerCurve!: THREE.CatmullRomCurve3;

  constructor() {
    super();
    this.sandColor = 0xcaa341;
    this.stoneColor = 0x777777;
    this.stoneColor2 = 0xcaa341;

    this.roadWidth = 50;


    this.details = new EnvDetails();
    this.add(this.details);

    this.mountainsUniforms = {
      uPositionFrequency: new THREE.Uniform(0.2),
      uStrength: new THREE.Uniform(12.0),
    };

    this.mountainsUniforms2 = {
      uPositionFrequency: new THREE.Uniform(0.2),
      uStrength: new THREE.Uniform(3.0),
    };

    this.roadUniforms = {
      uPositionFrequency: new THREE.Uniform(0.2),
      uStrength: new THREE.Uniform(1.0),
      uWarpFrequency: new THREE.Uniform(5),
      uWarpStrength: new THREE.Uniform(0.5),
    };

    this.init();
  }

  public getRoadWidth() {
    return this.roadWidth;
  }

  public getCenterCurve() {
    return this.centerCurve;
  }

  public setGui(gui: any) {
    // const folderGround = gui.addFolder('Ground');

    // folderGround.add(this.mountainsUniforms.uPositionFrequency, 'value', 0, 10, 0.1).name('uPositionFrequency')
    // folderGround.add(this.mountainsUniforms.uStrength, 'value', 0, 100, 0.1).name('uStrength')
    // folderGround.add(this.mountainsUniforms.uWarpFrequency, 'value', 0, 100, 0.1).name('uWarpFrequency')
    // folderGround.add(this.mountainsUniforms.uWarpStrength, 'value', 0, 100, 0.1).name('uWarpStrength')
  }

  private createRoadCurve() {
    const curvePoints = [];
    const R = 200;
    const numPoints = 40;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const randomDeviation =  i < 2 || i > numPoints - 3 ? 20 : THREE.MathUtils.randFloatSpread(50);

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
    const centerLineSpline = this.centerCurve = new THREE.CatmullRomCurve3( centerLinePoints );

    roadSpline.curveType = "catmullrom";
    centerLineSpline.curveType = "catmullrom";
    
    const tribunes = this.createTribunes(roadSpline);
    this.createCenter(roadSpline);
    this.createFence(centerLineSpline);
    
    this.createRoad(roadSpline);
    this.createRoadBorder(centerLineSpline);

    this.initGates(tribunes, centerLineSpline);
    this.initFinishLine(centerLineSpline);
  }

  private initFinishLine(centerLineSpline: THREE.CatmullRomCurve3) {
    const zeroPoint = centerLineSpline.getPointAt(0);
    const finishLinePoint = zeroPoint.clone();

    const width = 10;

    const texture = ALL_ASSETS.textures['finish.png'];
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(this.roadWidth * 0.2, width * 0.2);

    const material = new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } );
    const geometry = new THREE.PlaneGeometry( this.roadWidth, width );
    const finishLine = new THREE.Mesh( geometry, material );

    finishLine.position.copy(finishLinePoint);
    finishLine.position.y += 2.5;
    finishLine.rotateX(Math.PI * 0.5);

    this.add(finishLine);
  }

  private initGates(tribunes: THREE.Mesh, centerLineSpline: THREE.CatmullRomCurve3) {
    const zeroPoint = centerLineSpline.getPointAt(0);
    const gatesPoint = zeroPoint.clone();
    gatesPoint.x += this.roadWidth * 0.5 + this.borderWidth + this.tribuneWidth - 8;

    const h = this.tribuneHeight * 0.6;
    const w = h * 1;
    const t = 10;
    const d = 20;

    const gatesShapeInner = new THREE.Shape();

    gatesShapeInner.moveTo( -w * 0.5, 0 );
    gatesShapeInner.lineTo( -w * 0.5, h - w * 0.5 );
    gatesShapeInner.arc( w * 0.5, 0, w * 0.5, Math.PI, 0, true );
    gatesShapeInner.lineTo( w * 0.5, 0 );

    gatesShapeInner.closePath();

    const gatesShapeOuter = new THREE.Shape();

    gatesShapeOuter.moveTo( -w * 0.5 - t, 0 );
    gatesShapeOuter.lineTo( -w * 0.5 - t, h - w * 0.5 );
    gatesShapeOuter.arc( w * 0.5 + t, 0, w * 0.5 + t, Math.PI, 0, true );
    gatesShapeOuter.lineTo( w * 0.5 + t, 0 );

    gatesShapeOuter.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: d + 2,
    }

    const geometryInner = new THREE.ExtrudeGeometry( gatesShapeInner, extrudeSettings );

    const extrudeSettings2 = {
      steps: 2,
      depth: d,
    }

    const geometryOuter = new THREE.ExtrudeGeometry( gatesShapeOuter, extrudeSettings2 )

    const evaluator = new Evaluator();
    const gatesRes = evaluator.evaluate( new Brush(geometryOuter), new Brush(geometryInner), SUBTRACTION );

    const material = new THREE.MeshLambertMaterial( { color: this.stoneColor2, wireframe: false } );
    const gates = new THREE.Mesh(gatesRes.geometry, material);

    gates.position.copy(gatesPoint);
    gates.position.y -= 4;

    gates.rotateY(Math.PI * 0.5);

    this.add(gates);


    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 512;

    // Draw background
    // ctx.fillStyle = '#000000';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text styles
    ctx.font = 'Bold 130px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText('ARENA', canvas.width / 2, canvas.height / 2);

    // Use the canvas as a texture
    const texture = new THREE.CanvasTexture(canvas);

    // Create a plane geometry and apply the texture
    const geometry2 = new THREE.PlaneGeometry(24, 12);
    const material2 = new THREE.MeshBasicMaterial({map: texture, transparent: true, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(geometry2, material2);
    this.add(plane);

    plane.position.copy(gates.position);

    plane.position.x += d + 0.5;
    plane.position.y += h + 3.5;

    plane.rotation.y = Math.PI * 0.5;
  }

  private createRoadBorder(centerLineSpline: THREE.CatmullRomCurve3) {
    const h = 5;

    const curve1 = ThreeHelper.getPerpendicularCurve(centerLineSpline, this.roadWidth * 0.5);
    const points1 = curve1.getPoints(200);

    const extrudeSettings = {
      steps: 2,
      depth: h + 1,
    };

    const shape1 = ThreeHelper.createShapeByPoints(points1);

    const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings );
    geometry1.rotateX(Math.PI * 0.5);

    const curve2 = ThreeHelper.getPerpendicularCurve(centerLineSpline, this.roadWidth * 0.5 + this.borderWidth + 10);
    const points2 = curve2.getPoints(200);

    const extrudeSettings2 = {
      steps: 2,
      depth: h,
    };

    const shape2 = ThreeHelper.createShapeByPoints(points2);

    const geometry2 = new THREE.ExtrudeGeometry( shape2, extrudeSettings2 );
    geometry2.rotateX(Math.PI * 0.5);

    const evaluator = new Evaluator();
    const result = evaluator.evaluate( new Brush(geometry2), new Brush(geometry1), SUBTRACTION );

    const material = new THREE.MeshLambertMaterial( { color: this.stoneColor, wireframe: false } );
    const roadBorder = new THREE.Mesh( result.geometry, material );

    this.add( roadBorder );

    roadBorder.position.y = h;
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

  private createTribunes(startCurve: THREE.CatmullRomCurve3) {
    const w = this.tribuneWidth;
    const h = this.tribuneHeight;

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

    return mesh;
  }

  private createCenter(startCurve: THREE.CatmullRomCurve3) {
    const h = 5;

    const curve = ThreeHelper.getPerpendicularCurve(startCurve, -this.roadWidth * 0.5 + 1);
    const points = curve.getPoints(300);

    const extrudeSettings = {
      steps: 200,
      depth: h,
    };

    const shape = ThreeHelper.createShapeByPoints(points);

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
}