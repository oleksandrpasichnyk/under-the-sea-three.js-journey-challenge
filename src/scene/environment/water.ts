import { Noise } from 'noisejs';
import * as THREE from 'three';
// import { Water as WaterObject } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/objects/Water2.js';
import { Water } from 'three/addons/objects/Water.js';


export default class TopWater extends THREE.Group {
  private noise: Noise;
  private groundGeometry!: THREE.PlaneGeometry;

  private params: any;
  private size: number;
  private water: Water;

  constructor() {
    super();

    this.noise = new Noise(Math.random());
    this.size = 100;

    this.params = {
      offsetX: 0,
      offsetY: 0,
      speedX: 0.1,
      speedY: 0.2,
      repeats: 10,
      step: 10,
      height: 1,
    };

    this.init2();
  }

  public setGui(gui: any) {
    const waterUniforms = this.water.material.uniforms;

    const folderWater = gui.addFolder( 'Water' );
    folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
    folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    folderWater.open();
  }

  private init2() {
    const waterGeometry = new THREE.PlaneGeometry( 1000, 1000 );

    const water = this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( 'textures/water/Water_1_M_Normal.jpg', function ( texture ) {

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set( 1, 1 );
        } ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0x00ffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        // fog: scene.fog !== undefined
      }
    );

    water.rotation.x = - Math.PI * 1.5;

    this.add( water );
  }

  // private init() {
    // const material = new THREE.MeshStandardMaterial({
    //   color: 0xc6cc88,
    //   side: THREE.DoubleSide,
    // });

    // const mesh = new THREE.Mesh(this.createPart(), material);
    // this.add(mesh);

  //   var waterGeometry = new THREE.PlaneGeometry(50, 40);
  //   // var waterGeometry = new THREE.LatheGeometry(points);
  //   var water = new WaterObject(waterGeometry, {
  //     color: 0xffffff,
  //     scale: 1,
  //     flowDirection: new THREE.Vector2(0.1, 0.1),
  //     textureWidth: 1024,
  //     textureHeight: 1024
  //   });
  //   water.rotation.x = -Math.PI / 2;
  //   water.position.y = -0.005;
  //   this.add(water);

  //   var waterGeometry3 = new THREE.PlaneGeometry(5,4);
  //   // var waterGeometry = new THREE.LatheGeometry(points);
  //   var water3 = new WaterObject(waterGeometry3,{
  //     color: 0xffffff,
  //     scale: 1,
  //     flowDirection: new THREE.Vector2(0.1,0.1),
  //     textureWidth:1024,
  //     textureHeight:1024
  //   });
  //   water3.rotation.x = -Math.PI/2;
  //   water3.position.y = -0.004;
  //   this.add(water3);

  //   var waterGeometry2 = new THREE.PlaneGeometry(50,40);
  //   // var waterGeometry = new THREE.LatheGeometry(points);
  //   var water2 = new WaterObject(waterGeometry2,{
  //     color: 0xffffff,
  //     scale: 1,
  //     flowDirection: new THREE.Vector2(0.1,0.1),
  //     textureWidth:1024,
  //     textureHeight:1024
  //   });
  //   water2.rotation.x = Math.PI/2;
  //   water2.position.y = -0.003;
  //   this.add(water2);
  // }

  // private createPart() {
  //   const width = this.size;
  //   const height = this.size;

  //   const res = 1;

  //   const widthSegments = this.size * res;
  //   const heightSegments = this.size * res;
  //   const geometry = this.groundGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

  //   this.updateGroundParams();

  //   geometry.computeVertexNormals();
  //   geometry.attributes.position.needsUpdate = true;
  //   geometry.rotateX(-Math.PI / 2);

  //   return geometry;
  // }

  // private updateGroundParams() {
  //   const geometry = this.groundGeometry;
  //   const { offsetX, offsetY, repeats, step, height } = this.params;

  //   for (let i = 0; i < geometry.attributes.position.count; i++) {
  //     const x = geometry.attributes.position.getX(i);
  //     const y = geometry.attributes.position.getY(i);

  //     // Use offset and repeat to create seamless tiles
  //     const noiseValue = this.noise.perlin2((x + offsetX) / step % repeats, (y + offsetY) / step % repeats);
  //     geometry.attributes.position.setZ(i, noiseValue * height);
  //   }

  //   geometry.attributes.position.needsUpdate = true;
  // }

  public update(dt: number) {
    // this.params.offsetX += this.params.speedX * dt;
    // this.params.offsetY += this.params.speedY * dt;
    // this.updateGroundParams();

    this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  }
}
