import * as THREE from 'three';
import Fish from '../objects/fish/fish-view';

const enum POV {
  FIRST_PERSON = 'First person',
  THIRD_PERSON = 'Third person',
}

export default class CameraController {
  private camera: THREE.PerspectiveCamera;
  private player: Fish;
  private offsetsConfig!: Record<POV, THREE.Vector3>;

  private pov: POV;
  private prewPov: POV;

  constructor(camera: THREE.PerspectiveCamera, player: Fish) {
    this.camera = camera;
    this.player = player;

    this.prewPov = POV.THIRD_PERSON;
    this.pov = POV.THIRD_PERSON;

    this.offsetsConfig = {
      [POV.FIRST_PERSON]: new THREE.Vector3(0, 0, -this.player.length * 0.5 - 2),
      [POV.THIRD_PERSON]: new THREE.Vector3(0, 7.2, 23),
    }

    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyP') {
        this.pov = this.pov === POV.FIRST_PERSON ? POV.THIRD_PERSON : POV.FIRST_PERSON;
      }
    });
  }

  getOffset() {
    return this.offsetsConfig[this.pov];
  }

  setGUI(gui: any) {
    const folderCamera = gui.addFolder('Camera');
    folderCamera.add(this.offsetsConfig[POV.THIRD_PERSON], 'x', -50, 50).name('x');
    folderCamera.add(this.offsetsConfig[POV.THIRD_PERSON], 'y', -50, 50).name('y');
    folderCamera.add(this.offsetsConfig[POV.THIRD_PERSON], 'z', -50, 50).name('z');

    folderCamera.add(this, 'pov', [POV.FIRST_PERSON, POV.THIRD_PERSON]).name('POV')

    folderCamera.open();
  }

  update(dt: number) {
    const isPOVChanged = this.pov !== this.prewPov;

    if(isPOVChanged){
      console.log('change pov');
      this.prewPov = this.pov;

      // switch (this.pov) {
      //   case POV.FIRST_PERSON:
      //     this.offset.set(0, 0, -this.player.length * 0.5 - 2);

      //     break;
      //   case POV.THIRD_PERSON:
      //     this.offset.set(0, 10, 15);
      //     break;
      // }
    }

      const desiredPosition = new THREE.Vector3().copy(this.player.position);
      const offsetRotated = this.getOffset().clone().applyQuaternion(this.player.quaternion);
      desiredPosition.add(offsetRotated);
      
      this.camera.position.lerp(desiredPosition, isPOVChanged ? 1 : this.getLerp());

      this.camera.lookAt(this.getLookAtTarget());
  }

  getLookAtTarget() {
    const desiredPosition = new THREE.Vector3().copy(this.player.position);
    const offsetRotated = new THREE.Vector3(0, 0, -this.player.length * 0.5 - 4).applyQuaternion(this.player.quaternion);
    desiredPosition.add(offsetRotated);

    return this.pov === POV.THIRD_PERSON ? this.player.position : desiredPosition;
  }

  getLerp() {
    return this.pov === POV.THIRD_PERSON ? 0.4 : 1;
  }
}