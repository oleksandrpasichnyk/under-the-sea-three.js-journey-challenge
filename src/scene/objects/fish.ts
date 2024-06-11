import * as THREE from 'three';
import ThreeHelper from '../../helpers/three-hepler';

export default class Fish extends THREE.Group {
  constructor(modelName: string) {
    super();

    modelName = 'models/Clownfish.glb';

    this.init(modelName);
  }

  private init(modelName: string) {
    const view = THREE.Cache.get(modelName).scene;
    ThreeHelper.makeModelDoubleSide(view);

    this.add(view);
  }


  public update(dt: number) {

  }
}
