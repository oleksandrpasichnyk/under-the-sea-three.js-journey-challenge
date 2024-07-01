import * as THREE from 'three';
import Fish from '../objects/fish/fish-view';

const enum POV {
  // FIRST_PERSON = 'First person',
  THIRD_PERSON = 'Third person',
}

export default class CameraController {
  private camera: THREE.PerspectiveCamera;
  private player: Fish;
  private offset: THREE.Vector3;

  constructor(camera: THREE.PerspectiveCamera, player: Fish) {
    this.camera = camera;
    this.player = player;

    this.offset = new THREE.Vector3(0, 1.44, 4.6).multiplyScalar(5);

    // document.addEventListener('keydown', (event) => {
    //   if (event.code === 'KeyP') {
    //     this.pov = this.pov === POV.FIRST_PERSON ? POV.THIRD_PERSON : POV.FIRST_PERSON;
    //   }
    // });
  }

  setGUI(gui: any) {
    // const folderCamera = gui.addFolder('Camera');
    // folderCamera.add(this.offsetsConfig[POV.THIRD_PERSON], 'x', 0, 10).name('x');
    // folderCamera.add(this.offsetsConfig[POV.THIRD_PERSON], 'y', 0, 10).name('y');
    // folderCamera.add(this.offsetsConfig[POV.THIRD_PERSON], 'z', 0, 10).name('z');

    // // folderCamera.add(this, 'pov', [POV.FIRST_PERSON, POV.THIRD_PERSON]).name('POV')

    // folderCamera.open();
  }

  update(dt: number) {
      const desiredPosition = new THREE.Vector3().copy(this.player.position.clone());
      const offsetRotated = this.offset.clone().applyQuaternion(this.player.quaternion.clone());
      desiredPosition.add(offsetRotated);
      
      this.camera.position.lerp(desiredPosition, this.getLerp());

      this.camera.lookAt(this.getLookAtTarget());
  }

  getLookAtTarget() {
    const desiredPosition = new THREE.Vector3().copy(this.player.position.clone());
    const offsetRotated = new THREE.Vector3(0, 0, -this.player.length * 0.5 - 4).applyQuaternion(this.player.quaternion.clone());
    desiredPosition.add(offsetRotated);

    return this.player.position.clone(); // this.pov === POV.THIRD_PERSON ? this.player.position.clone() : desiredPosition;
  }

  getLerp() {
    return 0.4;
  }
}