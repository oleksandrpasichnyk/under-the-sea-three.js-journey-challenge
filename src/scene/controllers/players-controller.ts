import * as THREE from 'three';
import Fish from '../objects/fish/fish-view';
import Stadium from '../environment/stadium';
import ThreeHelper from '../../helpers/three-hepler';

export default class PlayersController {
  private botsCount: number = 5;

  private player: Fish;
  private bots: Bot[] = [];
  private stadium: Stadium;
  private botsRaceCurves!: THREE.CatmullRomCurve3;

  constructor(player: Fish, stadium: Stadium) {
    this.player = player;
    this.stadium = stadium;

    this.setupRace();
  }

  private setupRace() {
    // set bots skins and params

    const roadWidth = this.stadium.getRoadWidth();
    const centerCurve = this.stadium.getCenterCurve();

    const totalPlayersCount = this.botsCount + 1;
    const playerPositionIndex = Math.floor(Math.random() * totalPlayersCount);
    
    const step = (roadWidth / (totalPlayersCount + 1));

    for (let i = 0; i < totalPlayersCount; i++) {
      const raceIndex = i; //  === playerPositionIndex ? 

      const offset = -roadWidth * 0.5 + step * (raceIndex + 1);
      const raceCurve = ThreeHelper.getPerpendicularCurve(centerCurve, offset);
      const helper = ThreeHelper.createCurveHelper(raceCurve);
      this.stadium.add(helper);

      helper.position.y = 3;
    }
  }

  public update(dt: number) {
    this.player.update(dt);
    // bots set positions

    // bots update

    // player update
  }
}