import * as THREE from 'three';
import Fish from '../objects/fish/fish-view';
import Stadium from '../objects/stadium/stadium';
import ThreeHelper from '../../helpers/three-hepler';
import { Bot } from '../objects/fish/bots/bot';
import { BOT_TYPE } from '../objects/fish/fish.types';
import { GameScene } from '../scene';
import { Player } from '../objects/fish/player/player';

// const totalCircles = 1;

export default class PlayersController {
  private botsCount: number = 5;

  private player: Player;
  private bots: Bot[] = [];
  private stadium: Stadium;

  private scene: GameScene;

  private arrowHelper?: THREE.ArrowHelper;
  private raycaster: THREE.Raycaster;
  private raycaster2: THREE.Raycaster;

  private isPlaying: boolean = false;

  // private racesCountData = new Array(this.botsCount + 1).fill(0);
  // private lastTimeCheck = new Array(this.botsCount + 1).fill(0);

  constructor(scene: GameScene, player: Player, stadium: Stadium) {
    this.player = player;
    this.stadium = stadium;

    this.scene = scene;

    this.initBots();
    this.setupRace();

    this.raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
    this.raycaster2 = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));

    this.arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 10, 0xff0000);
    this.scene.add(this.arrowHelper);
  }

  public start() {
    this.isPlaying = true;
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

      const points = raceCurve.getPoints(50);
      const newRaceCurve = new THREE.CatmullRomCurve3(points);

      if (i === playerPositionIndex) {
        this.setStartPos(this.player, raceCurve);

        continue;
      }

      this.bots[botIndex].setRaceCurve(newRaceCurve);
      this.setStartPos(this.bots[botIndex], newRaceCurve);
      botIndex++;

    }
  }

  private setStartPos(fish: Fish, curve: THREE.CatmullRomCurve3) {
    const startPos = ThreeHelper.getCurvePosition(curve, 0);

    startPos.y += 3;

    fish.position.copy(startPos);
  }

  public update(dt: number) {
    if(!this.isPlaying) {

      this.player.updateAnimation(dt);

      this.bots.forEach(bot => {
        bot.updateAnimation(dt);
      });

      return;
    }

    this.player.update(dt);

    this.bots.forEach(bot => {
      bot.update(dt);
    });

    this.checkColliders();
    this.checkFinish();
  }

  private checkColliders() {
    const playerPos = this.player.position;

    const ray = this.raycaster;
    ray.ray.origin.copy(playerPos);
    ray.ray.direction.copy(this.player.getDirection());
    
    const ray2 = this.raycaster2;
    ray2.ray.origin.copy(playerPos);
    ray2.ray.direction.copy(this.player.getDirection().negate());

    this.checkRay(ray);
    this.checkRay(ray2, true);

    // this.arrowHelper.position.copy(playerPos);
    // this.arrowHelper.setDirection(this.player.getDirection().negate());
  }

  private checkRay(ray: THREE.Raycaster, isBack: boolean = false) {
    const { left, right } = this.stadium.getColliders();

    const intersects = ray.intersectObjects([left, right]);

    if (intersects.length > 0) {

      const distanceToCollider = this.player.position.distanceTo(intersects[0].point);

      if (distanceToCollider < 2) {
        this.player.onCollidedWithBorder(isBack);
      }
    }

  }

  private checkFinish() {
    // for (let i = 0; i < this.botsCount + 1; i++) {
    //   const fish = i === this.botsCount ? this.player : this.bots[i];
    //   this.checkFinishForFish(fish, i);
    // }
  }

  // private checkFinishForFish(fish: Fish, index: number) {
  //   const lastTimeCheck = this.lastTimeCheck[index];
  //   const currentTime = Date.now();

  //   if (currentTime - lastTimeCheck < 5000) {
  //     return;
  //   }

  //   const finishPlane = this.stadium.getFinishPlane();

  //   const playerPos = fish.position;
  //   const direction = fish.getDirection();

  //   this.raycaster.ray.origin.copy(playerPos);
  //   this.raycaster.ray.direction.copy(direction);

  //   const intersects = this.raycaster.intersectObject(finishPlane);

  //   if (intersects.length > 0) {
  //     this.racesCountData[index]++;

  //     if (this.racesCountData[index] >= totalCircles) {
  //       this.finishRace(fish);
  //     }
  //   }

  //   this.lastTimeCheck[index] = currentTime;
  // }

  // private finishRace(fish: Fish) {
  //   this.isPlaying = false;

  //   let res = ''

  //   if (fish == this.player) {
  //     res = 'Player won';
  //   } else {
  //     res = 'You lose';

  //     this.scene.setResult(res);
  //   }
  // }
}