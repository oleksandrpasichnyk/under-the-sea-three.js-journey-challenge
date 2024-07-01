import * as THREE from 'three';
import { ALL_ASSETS } from '../../loader/loader';
import { FishAnimationsController } from '../objects/fish/fish-animations-controller';

export default class TestObject extends THREE.Group {
  private view!: THREE.Object3D;
  private mixer!: FishAnimationsController;
  constructor(name: string) {
    super();

    this.init(name);
  }

  get width() {
    return new THREE.Box3().setFromObject(this.view).getSize(new THREE.Vector3()).x;
  }

  get height() {
    return new THREE.Box3().setFromObject(this.view).getSize(new THREE.Vector3()).y;
  }

  private init(name: string) {
    this.initView(name);
    this.initTitle(name);
  }

  private initView(name: string) {
    const asset = ALL_ASSETS.models[name];
    const view = this.view = asset.scene;

    if(asset.animations.length !== 0){
      // const mixer = this.mixer = new FishAnimationsController(view, asset.animations);

      // run Fish_Armature|Swimming_Fast action

      // mixer.playAnimation(FISH_ANIMATION_TYPE.SwimmingFast);

      // setTimeout(() => {
      //   mixer.playAnimation(FISH_ANIMATION_TYPE.Death, false);
      // } , 5000);

      // const action = mixer.clipAction()
      // mixer.clipAction(asset.animations[0]); // Get the first animation
      // action.play();
    };


    view.traverse((child: any) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
      }
    });
    
    this.add(view);
  }

  private initTitle(name: string) {
    // plane with canvas texture with text

    name = name.replace('models/', ' ').replace('.glb', ' ').replace('.gltf', ' ');

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const size = 256 * 4;
    canvas.width = size;
    canvas.height = size * 0.5;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '100px Arial bold';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.LinearFilter, THREE.LinearMipMapLinearFilter, THREE.RGBAFormat, THREE.UnsignedByteType, 4);
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const geometry = new THREE.PlaneGeometry(4, 2);
    const text = new THREE.Mesh(geometry, material);

    text.position.set(0, -this.height * 0.5 - 1, 0);
    this.add(text);
  }

  public update(delta: number) {
    if(this.mixer){
      this.mixer.update(delta);
    }
  }
}
