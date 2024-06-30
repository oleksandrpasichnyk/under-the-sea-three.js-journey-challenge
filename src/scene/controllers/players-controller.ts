import * as THREE from 'three';
import Fish from '../objects/fish/fish-view';
import Stadium from '../environment/stadium';
import ThreeHelper from '../../helpers/three-hepler';

export default class PlayersController {
  private botsCount: number = 5;

  private player: Fish;
  private bots!: Bot[];
  private stadium: Stadium;
  private botsRaceCurves!: THREE.CatmullRomCurve3;

  constructor(player: Fish, stadium: Stadium) {
    this.player = player;
    this.stadium = stadium;
  }

  private setupRace() {
    // set bots skins and params

    const roadWidth = this.stadium.getRoadWidth();
    const centerCurve = this.stadium.getCenterCurve();

    const totalPlayersCount = this.bots.length + 1;
    const playerPositionIndex = Math.floor(Math.random() * totalPlayersCount);

    const roadBorderOffset = 5;
    const raceZoneWidth = roadWidth - roadBorderOffset * 2;

    this.bots.forEach((bot, i) => {
      const raceIndex = i; //  === playerPositionIndex ? 

      const offset = -roadWidth * 0.5 + roadBorderOffset + (raceZoneWidth / totalPlayersCount) * raceIndex;
      const raceCurve = ThreeHelper.getPerpendicularCurve(centerCurve, offset);
      const helper = ThreeHelper.createCurveHelper(raceCurve);
      this.stadium.add(helper)

    })
  }

  public update(dt: number) {
    // bots set positions

    // bots update

    // player update
  }
}