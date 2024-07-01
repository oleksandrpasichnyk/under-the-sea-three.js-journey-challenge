import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water';
import { SIZES } from '../../config';
import { ALL_ASSETS } from '../../loader/loader';

export default class TopWater extends THREE.Group {
  private water!: Water;
  // private water2!: Water;

  constructor() {
    super();

    this.init();
  }

  public setGui(gui: any) {
    const waterUniforms = this.water.material.uniforms;

    const folderWater = gui.addFolder( 'Water' );
    folderWater.add( waterUniforms.distortionScale, 'value', 0, 50, 0.1 ).name( 'distortionScale' );
    folderWater.add( waterUniforms.size, 'value', 0.01, 5, 0.1 ).name( 'size' );
    folderWater.add( waterUniforms.alpha, 'value', 0.0, 1, .001 ).name( 'alpha' );
    folderWater.addColor( waterUniforms.waterColor, 'value' ).name( 'waterColor' );
    folderWater.addColor( waterUniforms.sunColor, 'value' ).name( 'sunColor' );
    folderWater.close();
  }

  private init() {
    const circleShape = new THREE.Shape();
    circleShape.moveTo( 0, 0 );
    circleShape.absarc( 0, 0, SIZES.width, 0, Math.PI * 2, false );

    const waterGeometry = new THREE.ShapeGeometry( circleShape );


    // const waterGeometry = new THREE.PlaneGeometry( SIZES.width, SIZES.length );
    const texture = ALL_ASSETS.textures['water/water3.jpg'];
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    const water = this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: texture,
        sunDirection: new THREE.Vector3(0, -1, 0),
        sunColor: 0xffffff,
        waterColor: 0x0061ff,
        distortionScale: 5,
        // fog: true,
        eye: new THREE.Vector3(0, -1, 0),
      }
    );

    water.material.uniforms.size.value = 0.4;

    water.material.transparent = true;
    water.material.opacity = 0.5;
    water.material.uniforms.alpha.value = 0.5;

    water.rotation.x = - Math.PI * 1.5;

    this.add( water );
  }

  public update(dt: number) {
    this.water.material.uniforms[ 'time' ].value += dt;
    // this.water2.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  }
}
