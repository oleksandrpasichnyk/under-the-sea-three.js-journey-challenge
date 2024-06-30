import * as THREE from 'three';

import Fish from "./fish-view";
import { RacingConfig } from "./fish.types";

export class RacingController {
  private player: Fish;
  private racingConfig: RacingConfig;

  protected speed: number = 0;
  protected rotationSpeed: number = 0;

  private realSpeed: number = 0;

  constructor(player: Fish, racingConfig: RacingConfig) {
    this.player = player;
    this.racingConfig = racingConfig;

  }

  public setSpeed(speed: number) {
    this.speed = speed;
  }

  public setRotationSpeed(rotationSpeed: number) {
    this.rotationSpeed = rotationSpeed;
  }

  public getRealSpeed() {
    return this.realSpeed;
  }

  public update(dt: number) {
    if (this.rotationSpeed !== 0) {
      this.player.rotation.y += this.rotationSpeed * dt;
    }

    const prewPos = this.player.position.clone();

    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.player.quaternion.clone());    
    this.player.position.add(direction.clone().multiplyScalar(this.speed * dt));

    this.realSpeed = Math.round(this.player.position.distanceTo(prewPos) / dt);
  }
}