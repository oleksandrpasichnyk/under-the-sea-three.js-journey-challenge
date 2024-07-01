import * as THREE from 'three';
// import { SIZES } from '../../config';
// import { ALL_ASSETS } from '../../loader/loader';

export default class Background extends THREE.Group {
  constructor() {
    super();

    this.init();
  }

  private init() {
    // const texture = new THREE.CubeTexture([
    //   ALL_ASSETS.textures['bg/leftblue.png'].image,
    //   ALL_ASSETS.textures['bg/rightblue.png'].image,
    //   ALL_ASSETS.textures['bg/upblue.png'].image,
    //   ALL_ASSETS.textures['bg/bottomblue.png'].image,
    //   ALL_ASSETS.textures['bg/backblue.png'].image,
    //   ALL_ASSETS.textures['bg/middleblue.png'].image,
    // ]);
    
    // console.log(ALL_ASSETS.textures['bg/leftblue.png'])
    
    // const loader = new THREE.CubeTextureLoader();
    // const texture = loader.load(
    // [
    //   'textures/bg/leftblue.png',
    //   'textures/bg/rightblue.png',
    //   'textures/bg/upblue.png',
    //   'textures/bg/bottomblue.png',
    //   'textures/bg/backblue.png',
    //   'textures/bg/middleblue.png',
    // ]);

    // const geometry = new THREE.SphereGeometry(SIZES.width * 0.5, 60, 60);
    // const material = new THREE.MeshBasicMaterial({ envMap: texture, envMapRotation: new THREE.Euler(Math.PI, 0, 0), side: THREE.BackSide });
    // const mesh = new THREE.Mesh(geometry, material);

    // this.add(mesh);
  }
}