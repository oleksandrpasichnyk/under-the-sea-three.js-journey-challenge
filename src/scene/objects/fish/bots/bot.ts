import * as THREE from 'three';

import Fish from "../fish-view";
import { BOT_TYPE, RacingConfig } from "../fish.types";
import { BotController } from "./bot-controller";
import { BOTS_RACING_CONFIG, BOTS_VIEW_CONFIG } from "./bots-config";

export class Bot extends Fish {
  private botController: BotController;

  constructor(botType: BOT_TYPE) {

    super(BOTS_RACING_CONFIG[botType], BOTS_VIEW_CONFIG[botType]);

    this.botController = new BotController(BOTS_RACING_CONFIG[botType]);
  }


  public setRaceCurve(racingCurve: THREE.CatmullRomCurve3) {
    this.botController.setRaceCurve(racingCurve);
  }

  public update(dt: number) {
    this.botController.update(dt);
    
    this.position.lerp(this.botController.getPosition(), (this.racingConfig as RacingConfig).lerp);
    this.quaternion.slerp(this.botController.getRotation(), 0.1);

    super.update(dt);
  }
}