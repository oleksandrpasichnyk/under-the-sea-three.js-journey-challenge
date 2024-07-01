import { PlayerRacingConfig } from "../fish.types";

const enum KEYS {
  UP = 'KeyW',
  DOWN = 'KeyS',
  LEFT = 'KeyA',
  RIGHT = 'KeyD',
  SHIFT = 'ShiftLeft',
  SPACE = 'Space',
}

export class InputController {
  private config: PlayerRacingConfig;

  private _speed: number = 0;
  private _rotationSpeed: number = 0;

  private keyStates: any;

  constructor(config: PlayerRacingConfig) {
    this.config = config;

    this.keyStates = {};

    this.setupEvents();
  }

  public getSpeed() {
    return this._speed;
  }

  public getRotationSpeed() {
    return this._rotationSpeed;
  }

  public onCollidedWithBorder(isBackSide: boolean) {
    this._speed = -this.config.breakSpeed * 0.5 * (isBackSide ? -1 : 1);
    this._rotationSpeed = 0;
  }

  public checkControls(dt: number) {    
    const { maxSpeed, acceleration, deceleration, maxRotationSpeed, rotationAcceleration,
      rotationDeceleration, breakSpeed, rotationBreakSpeed } = this.config;

    let speed = this._speed;
    let rotationSpeed = this._rotationSpeed;

    if (this.keyStates[KEYS.UP]) {
      speed += (speed > 0 ? acceleration : breakSpeed) * dt;
      speed = Math.min(speed, maxSpeed);
    } else if (this.keyStates[KEYS.DOWN]) {
      speed -= (speed > 0 ? breakSpeed : acceleration) * dt;
      speed = Math.max(speed, -maxSpeed);
    } else {
      if (speed > 0) {
        speed -= deceleration * dt;
        speed = Math.max(speed, 0);
      } else if (this._speed < 0) {
        speed += deceleration * dt;
        speed = Math.min(speed, 0);
      }
    }

    if (this.keyStates[KEYS.LEFT]) {
      rotationSpeed += (rotationSpeed > 0 ? rotationAcceleration : rotationBreakSpeed) * dt;
      rotationSpeed = Math.min(rotationSpeed, maxRotationSpeed);
    } else if (this.keyStates[KEYS.RIGHT]) {
      rotationSpeed -= (rotationSpeed > 0 ? rotationBreakSpeed : rotationAcceleration) * dt;
      rotationSpeed = Math.max(rotationSpeed, -maxRotationSpeed);
    } else {
      if (rotationSpeed > 0) {
        rotationSpeed -= rotationDeceleration * dt;
        rotationSpeed = Math.max(rotationSpeed, 0);
      } else if (rotationSpeed < 0) {
        rotationSpeed += rotationDeceleration * dt;
        rotationSpeed = Math.min(rotationSpeed, 0);
      }
    }

    this._speed = speed;
    this._rotationSpeed = rotationSpeed;
  }

  private setupEvents() {
    document.addEventListener('keydown', (event) => {
      this.keyStates[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keyStates[event.code] = false;
    });
  }
}