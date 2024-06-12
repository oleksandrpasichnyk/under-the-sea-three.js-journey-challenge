import * as THREE from 'three';
import Fish from '../objects/fish/fish-view';

const enum POV {
  FIRST_PERSON = 'First person',
  THIRD_PERSON = 'Third person',
}

export default class CameraController {
  private camera: THREE.PerspectiveCamera;
  private player: Fish;
  private offset: THREE.Vector3;

  private pov: POV;
  private prewPov: POV;

  constructor(camera: THREE.PerspectiveCamera, player: Fish) {
    this.camera = camera;
    this.player = player;

    this.offset = new THREE.Vector3(0, 7.2, 23);

    this.prewPov = POV.THIRD_PERSON;
    this.pov = POV.THIRD_PERSON;
  }

  setGUI(gui: any) {
    const folderCamera = gui.addFolder('Camera');
    folderCamera.add(this.offset, 'x', -50, 50).name('x');
    folderCamera.add(this.offset, 'y', -50, 50).name('y');
    folderCamera.add(this.offset, 'z', -50, 50).name('z');

    folderCamera.add(this, 'pov', [POV.FIRST_PERSON, POV.THIRD_PERSON]).name('POV')

    folderCamera.open();
  }

  update(dt: number) {
    if(this.pov !== this.prewPov){
      console.log('change pov');
      this.prewPov = this.pov;
      switch (this.pov) {
        case POV.FIRST_PERSON:
          this.offset.set(0, 0, -this.player.length * 0.5 - 2);

          break;
        case POV.THIRD_PERSON:
          this.offset.set(0, 10, 15);
          break;
      }
    }else{

      const desiredPosition = new THREE.Vector3().copy(this.player.position);
      const offsetRotated = this.offset.clone().applyQuaternion(this.player.quaternion);
      desiredPosition.add(offsetRotated);
      
      this.camera.position.lerp(desiredPosition, this.getLerp()); // The lerp factor can be adjusted for smoother or quicker follow

      // if(this.pov === POV.FIRST_PERSON){
      //   this.camera.rotation.copy(this.player.rotation);
      // }else{
      //   this.camera.lookAt(this.getLookAtTarget());
      // }


      this.camera.lookAt(this.getLookAtTarget());
    }
  }

  getLookAtTarget() {
    const desiredPosition = new THREE.Vector3().copy(this.player.position);
    const offsetRotated = new THREE.Vector3(0, 0, -this.player.length * 0.5 - 4).applyQuaternion(this.player.quaternion);
    desiredPosition.add(offsetRotated);

    return this.pov === POV.THIRD_PERSON ? this.player.position : desiredPosition;
  }

  getLerp() {
    return this.pov === POV.THIRD_PERSON ? 0.1 : 1;
  }
}