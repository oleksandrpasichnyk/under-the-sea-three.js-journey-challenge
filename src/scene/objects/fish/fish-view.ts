import * as THREE from 'three';
import ThreeHelper from '../../../helpers/three-hepler';
import { ALL_ASSETS } from '../../../loader/loader';
import { FISH_ANIMATION_TYPE, FishAnimationsController } from './fish-animations-controller';

const enum KEYS {
  UP = 'KeyW',
  DOWN = 'KeyS',
  LEFT = 'KeyA',
  RIGHT = 'KeyD',
  SHIFT = 'ShiftLeft',
  SPACE = 'Space',
}

const RACING_CONFIG = {
  maxSpeed: 50,
  maxTurboSpeed: 100,
  acceleration: 4,
  turboAcceleration: 50,
  deceleration: 3,
  breakSpeed: 10, // to speed
  handBreakSpeed: 15, // to speed
  rotationBreakSpeed: 6, // to speed
  rotationAcceleration: 2,
  rotationDeceleration: 3,
  maxRotationSpeed: 3.5,
};

export default class Fish extends THREE.Group {
  private view!: THREE.Object3D;
  private mixer?: FishAnimationsController;
  private realSpeedDisplay!: any;

  private line!: THREE.Line;

  private _speed: number = 0;
  private _rotationSpeed: number = 0;

  private _maxSpeed: number = RACING_CONFIG.maxSpeed;
  private _acceleration: number = RACING_CONFIG.acceleration;

  private _deceleration: number = RACING_CONFIG.deceleration;
  private _rotationAcceleration: number = RACING_CONFIG.rotationAcceleration;
  private _rotationDeceleration: number = RACING_CONFIG.rotationDeceleration;
  private _maxRotationSpeed: number = RACING_CONFIG.maxRotationSpeed;
  private _breakSpeed: number = RACING_CONFIG.breakSpeed;
  private _handBreakSpeed: number = RACING_CONFIG.handBreakSpeed;
  private _rotationBreakSpeed: number = RACING_CONFIG.rotationBreakSpeed;

  private _realSpeed: number = 0;
  private _boundingBox!: THREE.Vector3;

  private _animationFactor: number = 5;

  private keyStates: any;

  constructor(modelName: string) {
    super();

    modelName = 'models/fishes-2/Clownfish.glb';

    this.keyStates = {};


    this.init(modelName);
  }

  get width() {
    return this._boundingBox.x;
  }

  get height() {
    return this._boundingBox.y;
  }

  get length() {
    return this._boundingBox.z;
  }

  public setGUI(gui: any) {
    const folderFish = gui.addFolder('Fish');

    this.realSpeedDisplay = folderFish.add(this, '_realSpeed').name('Real speed');
    folderFish.add(this, '_maxSpeed', 0, 300).name('Max speed');
    folderFish.add(this, '_breakSpeed', 0, 300).name('Break speed');
    folderFish.add(this, '_acceleration', 0, 100).name('Acceleration');
    folderFish.add(this, '_deceleration', 0, 100).name('Deceleration');
    folderFish.add(this, '_rotationSpeed', 0, 20).name('Rotation Speed');
    folderFish.add(this, '_rotationAcceleration', 0, 5, 0.01).name('Rotation acceleration');
    folderFish.add(this, '_rotationDeceleration', 0, 5, 0.01).name('Rotation deceleration');
    folderFish.add(this, '_maxRotationSpeed', 0, 20, 0.1).name('Max rotation speed');
    folderFish.add(this, '_rotationBreakSpeed', 0, 5, 0.01).name('Rotation break speed');
    folderFish.add(this, '_animationFactor', 1, 10, 0.01).name('Animation factor');

    folderFish.open();
  }

  private init(modelName: string) {
    this.initView(modelName);
    this.setupEvents();

    this._boundingBox = new THREE.Box3().setFromObject(this.view).getSize(new THREE.Vector3());

    const line = this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -10)]), new THREE.LineBasicMaterial({ color: 0xff0000 }));

    setTimeout(() => {
      this.parent?.add(line);
    }, 500);
  }

  private initView(modelName: string) {
    const asset = ALL_ASSETS.models[modelName];
    const view = this.view = asset.scene;

    const s = 0.2;
    view.scale.set(s, s, s);
    view.rotation.y = Math.PI;

    if (asset.animations.length !== 0) {
      const mixer = this.mixer = new FishAnimationsController(view, asset.animations);

      mixer.playAnimation(FISH_ANIMATION_TYPE.SwimmingNormal);
    };

    ThreeHelper.makeModelDoubleSide(view);

    this.add(view);
  }

  private setupEvents() {
    document.addEventListener('keydown', (event) => {
      this.keyStates[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keyStates[event.code] = false;
    });
  }

  private checkShift() {
    // if (this.keyStates[KEYS.SHIFT]) {
    //   this._maxSpeed = RACING_CONFIG.maxTurboSpeed;
    //   this._acceleration = RACING_CONFIG.turboAcceleration;
    // } else {
    //   this._maxSpeed = RACING_CONFIG.maxSpeed;
    //   this._acceleration = RACING_CONFIG.acceleration;
    // }
  }

  private getBreakSpeed() {
    return this.isHandBreak() ? 0 : this._breakSpeed;
  }

  private isHandBreak() {
    return this.keyStates[KEYS.SPACE];
  }

  private checkControls(dt: number) {
    if(this.isHandBreak()){
      if(this._speed > 0) {
        this._speed -= this._handBreakSpeed * dt;
        this._speed = Math.max(this._speed, 0);
      }else {
        this._speed += this._handBreakSpeed * dt;
        this._speed = Math.min(this._speed, 0);
      }
    }else{
      if (this.keyStates[KEYS.UP]) {
        this._speed += (this._speed > 0 ? this._acceleration : this.getBreakSpeed()) * dt;
        this._speed = Math.min(this._speed, this._maxSpeed);
      } else if (this.keyStates[KEYS.DOWN]) {
        this._speed -= (this._speed > 0 ? this.getBreakSpeed() : this._acceleration) * dt;
        this._speed = Math.max(this._speed, -this._maxSpeed);
      } else {
        if (this._speed > 0) {
          this._speed -= this._deceleration * dt;
          this._speed = Math.max(this._speed, 0);
        } else if (this._speed < 0) {
          this._speed += this._deceleration * dt;
          this._speed = Math.min(this._speed, 0);
        }
      }
    }


    if (this.keyStates[KEYS.LEFT]) {
      this._rotationSpeed += (this._rotationSpeed > 0 ? this._rotationAcceleration : this._rotationBreakSpeed) * dt;
      this._rotationSpeed = Math.min(this._rotationSpeed, this._maxRotationSpeed);
    } else if (this.keyStates[KEYS.RIGHT]) {
      this._rotationSpeed -= (this._rotationSpeed > 0 ? this._rotationBreakSpeed : this._rotationAcceleration) * dt;
      this._rotationSpeed = Math.max(this._rotationSpeed, -this._maxRotationSpeed);
    } else {
      if (this._rotationSpeed > 0) {
        this._rotationSpeed -= this._rotationDeceleration * dt;
        this._rotationSpeed = Math.max(this._rotationSpeed, 0);
      } else if (this._rotationSpeed < 0) {
        this._rotationSpeed += this._rotationDeceleration * dt;
        this._rotationSpeed = Math.min(this._rotationSpeed, 0);
      }
    }
  }

  private updatePosition(dt: number) {
    if (this._rotationSpeed !== 0) {
      this.rotation.y += this._rotationSpeed * dt;
    }

    const prewPos = this.position.clone();

    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion).multiplyScalar(this._speed * dt);
    this.position.add(direction);

    this._realSpeed = Math.round(this.position.distanceTo(prewPos) / dt);
    this.realSpeedDisplay?.updateDisplay();

    this.line.position.copy(this.position);
    this.line.lookAt(this.position.clone().add(direction.clone().add(new THREE.Vector3(0, -0.002, 0)).negate()));
  }

  private updateAnimation(dt: number) {
    this.mixer?.setTimeScaleMoveSpeed(this._animationFactor * this._realSpeed / this._maxSpeed);
    this.mixer?.update(dt);
  }

  public update(dt: number) {
    this.checkShift();
    this.checkControls(dt);

    this.updatePosition(dt);
    this.updateAnimation(dt);
  }
}
