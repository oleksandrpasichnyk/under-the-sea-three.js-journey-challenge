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
  acceleration: 6,
  turboAcceleration: 12,
  deceleration: 5,
  rotationSpeed: 3,
  rotationLerp: 0.03,
  breakSpeed: 20,
};


export default class Fish extends THREE.Group {
  private view!: THREE.Object3D;
  private mixer?: FishAnimationsController;
  private realSpeedDisplay!: any;

  private line!: THREE.Line;

  private _speed: number = 0;
  private _angle: THREE.Euler = new THREE.Euler();

  private _maxSpeed: number = RACING_CONFIG.maxSpeed;
  private _acceleration: number = RACING_CONFIG.acceleration;

  private _deceleration: number = RACING_CONFIG.deceleration;
  private _rotationSpeed: number = RACING_CONFIG.rotationSpeed;
  private _rotationLerp: number = RACING_CONFIG.rotationLerp;
  private _breakSpeed: number = RACING_CONFIG.breakSpeed;

  private _realSpeed: number = 0;
  private _boundingBox!: THREE.Vector3;

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
    folderFish.add(this, '_rotationLerp', 0, 5).name('Rotation Lerp');

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
    if (this.keyStates[KEYS.SHIFT]) {
      this._maxSpeed = RACING_CONFIG.maxTurboSpeed;
      this._acceleration = RACING_CONFIG.turboAcceleration;
    } else {
      this._maxSpeed = RACING_CONFIG.maxSpeed;
      this._acceleration = RACING_CONFIG.acceleration;
    }
  }

  private checkControls(dt: number) {
    if (this.keyStates[KEYS.UP]) {
      this._speed += (this._speed > 0 ? this._acceleration : this._breakSpeed) * dt;
      this._speed = Math.min(this._speed, this._maxSpeed);
    } else if (this.keyStates[KEYS.DOWN]) {
      this._speed -= (this._speed > 0 ? this._breakSpeed : this._acceleration) * dt;
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

    if (this.keyStates[KEYS.LEFT]) {
      this._angle.y += this._rotationSpeed * dt;
    } else if (this.keyStates[KEYS.RIGHT]) {
      this._angle.y -= this._rotationSpeed * dt;
    }
  }

  private updatePosition(dt: number) {
    if (this._angle.y !== 0) {
      this.rotation.y = THREE.MathUtils.lerp(this.rotation.y, this._angle.y, this._rotationLerp);
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
    this.mixer?.setTimeScaleMoveSpeed(5 * this._realSpeed / this._maxSpeed);
    this.mixer?.update(dt);
  }

  public update(dt: number) {
    this.checkShift();
    this.checkControls(dt);

    this.updatePosition(dt);
    this.updateAnimation(dt);
  }
}
