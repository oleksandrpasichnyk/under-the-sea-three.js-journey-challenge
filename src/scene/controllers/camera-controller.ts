import * as THREE from 'three';
import gsap from 'gsap';
import Fish from '../objects/fish/fish-view';

export default class CameraController {
  private camera: THREE.PerspectiveCamera;
  private player: Fish;
  private offset: THREE.Vector3;

  private isIntroShown: boolean = false;

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

  startInto(duration: number) {
    const startPosition = new THREE.Vector3().copy(this.player.position.clone()).add(new THREE.Vector3(25, 2, -12));
    const endPosition = new THREE.Vector3().copy(this.player.position.clone()).add(new THREE.Vector3(-10, 2, -12));

    this.camera.position.copy(startPosition);
    this.camera.lookAt(new THREE.Vector3(this.player.position.x + 10, 0, 0));

    gsap.to(this.camera.position, {
      delay: 0.3,
      x: endPosition.x,
      y: endPosition.y,
      z: endPosition.z,
      duration,
      onComplete: () => {
        this.isIntroShown = true;
      }
    });
  }

  update() {
    if (!this.isIntroShown) {
      return
    }

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