import * as THREE from 'three';
import ThreeHelper from '../../../helpers/three-hepler';
import { ALL_ASSETS } from '../../../loader/loader';

export default class Finish extends THREE.Group {
  private roadWidth: number;

  constructor(roadWidth: number) {
    super();

    this.roadWidth = roadWidth;

    this.init();
  }

  private init() {
    this.initArc();
    this.initBottomLine();
  }

  private initBottomLine() {
    const width = 5;

    const repeatY = 2;
    const repeatX = (this.roadWidth/width) * repeatY;

    const texture = ALL_ASSETS.textures['finish.png'].clone();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);

    const material = new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } );
    const geometry = new THREE.PlaneGeometry( this.roadWidth, width );
    const finishLine = new THREE.Mesh( geometry, material );

    finishLine.position.y += 2.5;
    finishLine.rotateX(Math.PI * 0.5);

    this.add(finishLine);
  }

  private initArc() {
    const pole1 = ThreeHelper.createModelView('models/pirates/Environment_Dock_Pole.gltf');
    const pole2 = ThreeHelper.createModelView('models/pirates/Environment_Dock_Pole.gltf');
    
    const height = 40;
    const startHeight = ThreeHelper.getBoundingBox(pole1).y;
    const scaleY = height / startHeight;

    const s = 4;

    pole1.scale.set(s, scaleY, s);
    pole2.scale.set(s, scaleY, s);

    pole1.position.set(-this.roadWidth / 2 + 2, height * 0.5 + 4, 0);
    pole2.position.set(this.roadWidth / 2, height * 0.5 + 4, 0);

    this.add(pole1, pole2);


    const width = 6;

    const repeatY = 2;
    const repeatX = (this.roadWidth/width) * repeatY;

    const texture = ALL_ASSETS.textures['finish.png'].clone();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);

    const material = new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } );
    const geometry = new THREE.PlaneGeometry( this.roadWidth - 2, width );
    const finishLine = new THREE.Mesh( geometry, material );

    finishLine.position.y += 2.5 + height - width - 4;
    finishLine.position.x += 1;

    this.add(finishLine);
  }
}
