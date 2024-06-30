import * as THREE from 'three';
import ThreeHelper from '../../../helpers/three-hepler';
import { ALL_ASSETS } from '../../../loader/loader';
import { FISH_ANIMATION_TYPE, FishAnimationsController } from './fish-animations-controller';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { RacingConfig, ViewConfig } from './fish.types';
import { RacingController } from './racing-controller';

export default class Fish extends THREE.Group {
  private view!: THREE.Object3D;
  private mixer?: FishAnimationsController;
  private animationFactor: number = 5;
  private boundingBox!: THREE.Vector3;
  
  protected racingConfig: RacingConfig;
  protected viewConfig: ViewConfig;

  protected racingController!: RacingController;

  constructor(racingConfig: RacingConfig, viewConfig: ViewConfig) {
    super();

    this.racingConfig = racingConfig;
    this.viewConfig = viewConfig;

    this.init();
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
    const asset = ALL_ASSETS.models[this.viewConfig.modelName];
    const view = this.view = asset.scene;

    const s = this.viewConfig.scale;
    view.scale.set(s, s, s);
    view.rotation.y = Math.PI;

    if (asset.animations.length !== 0) {
      const mixer = this.mixer = new FishAnimationsController(view, asset.animations);

      mixer.playAnimation(FISH_ANIMATION_TYPE.SwimmingNormal);
    };

    ThreeHelper.makeModelDoubleSide(view);

    const material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      silent: true,
  
      metalness: 0,
      roughness: 1,
      color: 0x00ff00,
      flatShading: true,

      // wireframe: true
    })

    view.children[0].material = material;

    this.add(view);
  }

  private updateAnimation(dt: number) {
    this.mixer?.setTimeScaleMoveSpeed(this.animationFactor * this.racingController.getRealSpeed() / this.racingConfig.maxSpeed);
    this.mixer?.update(dt);
  }

  public update(dt: number) {
    this.racingController.update(dt);
    
    this.updateAnimation(dt);
  }
}
