import * as THREE from 'three';

import Fish from "./fish-view";
import { PlayerRacingConfig, RacingConfig } from "./fish.types";

export class RacingController {
  private fish: Fish;
  private racingConfig: RacingConfig | PlayerRacingConfig;

  protected speed: number = 0;
  protected rotationSpeed: number = 0;

  constructor(player: Fish, racingConfig: RacingConfig | PlayerRacingConfig) {
    this.fish = player;
    this.racingConfig = racingConfig;

  }

  public setSpeed(speed: number) {
    this.speed = speed;
  }

  public setRotationSpeed(rotationSpeed: number) {
    this.rotationSpeed = rotationSpeed;
  }

  public update(dt: number) {
    if (this.rotationSpeed !== 0) {
      this.fish.rotation.y += this.rotationSpeed;
    }

    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.fish.quaternion.clone());    
    this.fish.position.add(direction.clone().multiplyScalar(this.speed));
  }
}