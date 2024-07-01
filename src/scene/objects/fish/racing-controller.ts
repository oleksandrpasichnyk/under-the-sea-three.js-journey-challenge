import * as THREE from 'three';

import Fish from "./fish-view";

export class RacingController {
  private fish: Fish;

  protected speed: number = 0;
  protected rotationSpeed: number = 0;

  constructor(player: Fish) {
    this.fish = player;

  }

  public setSpeed(speed: number) {
    this.speed = speed;
  }

  public setRotationSpeed(rotationSpeed: number) {
    this.rotationSpeed = rotationSpeed;
  }

  public update() {
    if (this.rotationSpeed !== 0) {
      this.fish.rotation.y += this.rotationSpeed;
    }

    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.fish.quaternion.clone());    
    this.fish.position.add(direction.clone().multiplyScalar(this.speed));
  }
}