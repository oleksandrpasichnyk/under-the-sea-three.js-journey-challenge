import * as THREE from 'three';
import ThreeHelper from '../../../helpers/three-hepler';
import { FISH_ANIMATION_TYPE, FishAnimationsController } from './fish-animations-controller';
import { PlayerRacingConfig, RacingConfig, ViewConfig } from './fish.types';
import { RacingController } from './racing-controller';

export default class Fish extends THREE.Group {
  private view!: THREE.Object3D;
  private mixer?: FishAnimationsController;
  private animationFactor: number = 0.125;
  private boundingBox!: THREE.Vector3;

  protected racingConfig: RacingConfig | PlayerRacingConfig;
  protected viewConfig: ViewConfig;

  protected racingController!: RacingController;
  private prewPos: THREE.Vector3 = new THREE.Vector3();
  private realSpeed: number = 0;

  private idleAnimationScale: number = Math.random() * 0.4 + 0.4;

  constructor(racingConfig: RacingConfig | PlayerRacingConfig, viewConfig: ViewConfig) {
    super();

    this.racingConfig = racingConfig;
    this.viewConfig = viewConfig;

    this.init();
  }

  public getRealSpeed() {
    return this.realSpeed;
  }

  public getDirection() {
    return new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion.clone());
  }

  get width() {
    return this.boundingBox.x;
  }

  get height() {
    return this.boundingBox.y;
  }

  get length() {
    return this.boundingBox.z;
  }

  private init() {
    this.initView();

    this.racingController = new RacingController(this, this.racingConfig);
    this.boundingBox = new THREE.Box3().setFromObject(this.view).getSize(new THREE.Vector3());
  }

  private initView() {
    const view = this.view = ThreeHelper.createModelView(this.viewConfig.modelName);
    const animations = ThreeHelper.createAnimations(this.viewConfig.modelName);

    const s = this.viewConfig.scale;

    view.rotation.y = Math.PI;
    view.scale.set(s, s, s);

    if (animations.length !== 0) {
      const mixer = this.mixer = new FishAnimationsController(view, animations);

      const offsetTime = Math.random() * 2;
      mixer.setOffsetTime(offsetTime);
      mixer.playAnimation(FISH_ANIMATION_TYPE.SwimmingNormal);
    };

    // const material = new CustomShaderMaterial({
    //   baseMaterial: THREE.MeshStandardMaterial,
    //   silent: true,
  
    //   metalness: 0,
    //   roughness: 1,
    //   color: 0x00ff00,
    //   flatShading: true,

    //   // wireframe: true
    // })

    // view.children[0].material = material;

    this.add(view);
  }

  public updateAnimation(dt: number) {
    const ts = Math.max(this.animationFactor * this.realSpeed / this.racingConfig.maxSpeed, this.idleAnimationScale);

    this.mixer?.setTimeScaleMoveSpeed(ts);
    this.mixer?.update(dt);
  }

  public update(dt: number) {
    this.racingController.update(dt);

    this.realSpeed = Math.round(this.position.clone().distanceTo(this.prewPos) * 100);

    this.updateAnimation(dt);

    this.prewPos = this.position.clone();
  }
}
