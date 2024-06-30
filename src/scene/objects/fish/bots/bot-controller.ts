import * as THREE from 'three';
import { RacingConfig } from "../fish.types";

export class BotController {
  private config: RacingConfig;

  private _speed: number = 0;
  private _rotationSpeed: number = 0;

  private racingCurve!: THREE.CatmullRomCurve3;

  constructor(config: RacingConfig) {
    this.config = config;
  }

  public setRaceCurve(racingCurve: THREE.CatmullRomCurve3) {
    this.racingCurve = racingCurve;
  }

  public getSpeed() {
    return this._speed;
  }

  public getRotationSpeed() {
    return this._rotationSpeed;
  }

  public update(dt: number) {
    if(!this.racingCurve) {
      return;
    }

    let speed = this._speed;
    let rotationSpeed = this._rotationSpeed;

    // todo

    this._speed = speed;
    this._rotationSpeed = rotationSpeed;
  }
}