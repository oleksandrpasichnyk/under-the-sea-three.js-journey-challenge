import * as THREE from 'three';
import { RacingConfig } from "../fish.types";
import ThreeHelper from '../../../../helpers/three-hepler';

export class BotController {
  private racingConfig: RacingConfig;

  private _speed: number = 0;
  private _position: THREE.Vector3 = new THREE.Vector3();
  private _rotation: THREE.Quaternion = new THREE.Quaternion();

  private prewPos: number = 0;

  private racingCurve!: THREE.CatmullRomCurve3;

  constructor(racingConfig: RacingConfig) {
    this.racingConfig = racingConfig;
  }

  public setRaceCurve(racingCurve: THREE.CatmullRomCurve3) {
    this.racingCurve = racingCurve;
  }

  public getPosition() {
    return this._position;
  }

  public getRotation() {
    return this._rotation;
  }

  public update(dt: number) {
    if(!this.racingCurve) {
      return;
    }
 
    const randomFactor = Math.random() * 0.4 + 0.6;
    this._speed = Math.min(this._speed + this.racingConfig.acceleration * randomFactor * dt, this.racingConfig.maxSpeed);
    
    this.prewPos += this._speed;
    
    let t = this.prewPos / this.racingCurve.getLength();

    if(t > 1) {
      t = t - 1;
    }

    this._position = ThreeHelper.getCurvePosition(this.racingCurve, t);
    this._position.y += 3;
    this._rotation = ThreeHelper.getCurveRotation(this.racingCurve, t);
  }
}