import Fish from "../fish-view";
import { InputController } from "./input-controller";
import { PLAYER_RACING_CONFIG, PLAYER_VIEW_CONFIG } from "./player-config";

export class Player extends Fish {
  private inputController: InputController = new InputController(PLAYER_RACING_CONFIG);

  constructor() {
    super(PLAYER_RACING_CONFIG, PLAYER_VIEW_CONFIG);

  }

  // public setGUI(gui: any) {
  //   const folderFish = gui.addFolder('Fish');

  //   this.realSpeedDisplay = folderFish.add(this, '_realSpeed').name('Real speed');
  //   folderFish.add(this, '_maxSpeed', 0, 300).name('Max speed');
  //   folderFish.add(this, '_breakSpeed', 0, 300).name('Break speed');
  //   folderFish.add(this, '_acceleration', 0, 100).name('Acceleration');
  //   folderFish.add(this, '_deceleration', 0, 100).name('Deceleration');
  //   folderFish.add(this, '_rotationSpeed', 0, 20).name('Rotation Speed');
  //   folderFish.add(this, '_rotationAcceleration', 0, 5, 0.01).name('Rotation acceleration');
  //   folderFish.add(this, '_rotationDeceleration', 0, 5, 0.01).name('Rotation deceleration');
  //   folderFish.add(this, '_maxRotationSpeed', 0, 20, 0.1).name('Max rotation speed');
  //   folderFish.add(this, '_rotationBreakSpeed', 0, 5, 0.01).name('Rotation break speed');
  //   folderFish.add(this, '_animationFactor', 1, 10, 0.01).name('Animation factor');

  //   folderFish.close();
  // }

  public update(dt: number) {
    this.inputController.checkControls(dt);

    const speed = this.inputController.getSpeed();
    const rotationSpeed = this.inputController.getRotationSpeed();

    this.racingController.setSpeed(speed);
    this.racingController.setRotationSpeed(rotationSpeed);

    super.update(dt);
  }
}