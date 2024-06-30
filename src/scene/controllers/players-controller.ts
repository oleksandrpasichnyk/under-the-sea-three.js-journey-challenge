import * as THREE from 'three';
import Fish from '../objects/fish/fish-view';
import Stadium from '../environment/stadium';
import ThreeHelper from '../../helpers/three-hepler';
import { Bot } from '../objects/fish/bots/bot';
import { BOT_TYPE } from '../objects/fish/fish.types';
import Scene from '../scene';

export default class PlayersController {
  private botsCount: number = 5;

  private player: Fish;
  private bots: Bot[] = [];
  private stadium: Stadium;

  private scene: Scene;

  constructor(scene: Scene, player: Fish, stadium: Stadium) {
    this.player = player;
    this.stadium = stadium;

    this.scene = scene;

    this.initBots();
    this.setupRace();
  }

  private initBots() {
    const botsTypes = [BOT_TYPE.ONE, BOT_TYPE.TWO, BOT_TYPE.THREE, BOT_TYPE.FOUR, BOT_TYPE.FIVE];

    for (let i = 0; i < this.botsCount; i++) {
      const bot = new Bot(botsTypes[i]);
      this.bots.push(bot);
      this.scene.add(bot);
    }
  }

  private setupRace() {
    // set bots skins and params

    const roadWidth = this.stadium.getRoadWidth();
    const centerCurve = this.stadium.getCenterCurve();

    const totalPlayersCount = this.botsCount + 1;
    const playerPositionIndex = 3;
    
    const step = (roadWidth / (totalPlayersCount + 1));

    let botIndex = 0;

    for (let i = 0; i < totalPlayersCount; i++) {      
      const offset = -roadWidth * 0.5 + step * (i + 1);
      const raceCurve = ThreeHelper.getPerpendicularCurve(centerCurve, offset);
      
      if(i === playerPositionIndex) {
        this.setStartPos(this.player, raceCurve);

        continue;
      }

      // const helper = ThreeHelper.createCurveHelper(raceCurve);
      // this.stadium.add(helper);
      // helper.position.y = 3;

      this.bots[botIndex].setRaceCurve(raceCurve);
      this.setStartPos(this.bots[botIndex], raceCurve);
      botIndex++;

    }
  }

  private setStartPos(fish: Fish, curve: THREE.CatmullRomCurve3) {
    const startPos = ThreeHelper.getCurvePosition(curve, 0);
    const startRot = ThreeHelper.getCurveRotation(curve, 0);

    startPos.y += 5;

    fish.position.copy(startPos);
  }

  public update(dt: number) {
    this.player.update(dt);
    // bots set positions

    // bots update

    // player update
  }
}