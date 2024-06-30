import * as THREE from 'three';

import Fish from "../fish-view";
import { BOT_TYPE } from "../fish.types";
import { BotController } from "./bot-controller";
import { BOTS_RACING_CONFIG, BOTS_VIEW_CONFIG } from "./bots-config";

export class Bot extends Fish {
  private botController: BotController;

  constructor(botType: BOT_TYPE) {

    super(BOTS_RACING_CONFIG, BOTS_VIEW_CONFIG[botType]);

    this.botController = new BotController(BOTS_RACING_CONFIG);
  }

  public setRaceCurve(racingCurve: THREE.CatmullRomCurve3) {
    this.botController.setRaceCurve(racingCurve);
  }

  public update(dt: number) {
    this.botController.update(dt);

    const speed = this.botController.getSpeed();
    const rotationSpeed = this.botController.getRotationSpeed();

    this.racingController.setSpeed(speed);
    this.racingController.setRotationSpeed(rotationSpeed);

    super.update(dt);
  }
}