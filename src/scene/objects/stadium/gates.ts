import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

export class Gates extends THREE.Group {
  private color: number = 0xcaa341;

  private height: number;

  constructor(height: number) {
    super();

    this.height = height;

    this.init();
  }

  private init() {
    this.initView();
    this.initTitle();
  }

  private initView() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);
  }

  private initTitle() {
    const h = this.height;
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

    const material = new THREE.MeshLambertMaterial( { color: this.color, wireframe: false } );
    const gates = new THREE.Mesh(gatesRes.geometry, material);

    gates.position.y -= 4;
    gates.rotateY(Math.PI * 0.5);

    this.add(gates);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 512;

    ctx.font = 'Bold 130px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText('ARENA', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);

    const geometry2 = new THREE.PlaneGeometry(24, 12);
    const material2 = new THREE.MeshBasicMaterial({map: texture, transparent: true, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(geometry2, material2);
    this.add(plane);

    plane.position.copy(gates.position);

    plane.position.x += d + 0.5;
    plane.position.y += h + 3.5;

    plane.rotation.y = Math.PI * 0.5;
  }
}