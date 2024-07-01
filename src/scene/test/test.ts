import * as THREE from 'three';
import { FISHES } from '../../loader/models-list';
import TestObject from './test-object';

export default class Test extends THREE.Group {
  constructor() {
    super();

    this.init();
  }

  private init() {
    let prewX = 0;
    const offset = 2;

    const list = FISHES;

    for (let i = 0; i < list.length; i++) {
      const fishName = list[i];
      const view = new TestObject(fishName);

      view.position.x = prewX + view.width / 2 + offset;
      prewX = view.position.x + view.width / 2;

      this.add(view);
    }
  }

  public update(dt: number) {
    this.children.forEach((child: any) => {
      child.update(dt);
    });
  }
}
