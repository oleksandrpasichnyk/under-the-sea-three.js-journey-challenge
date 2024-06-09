import { Noise } from 'noisejs';
import * as THREE from 'three';

export default class Ground extends THREE.Group {
  private noise: Noise;
  private groundGeometry!: THREE.PlaneGeometry;

  private params: any;
  private size: number;

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

    this.init();
  }

  private init() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xc6cc88,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(this.createPart(), material);
    this.add(mesh);
  }

  private createPart() {
    const width = this.size;
    const height = this.size;

    const res = 1;

    const widthSegments = this.size * res;
    const heightSegments = this.size * res;
    const geometry = this.groundGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

    this.updateGroundParams();

    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;
    geometry.rotateX(-Math.PI / 2);

    return geometry;
  }

  private updateGroundParams() {
    const geometry = this.groundGeometry;
    const { offsetX, offsetY, repeats, step, height } = this.params;

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i);
      const y = geometry.attributes.position.getY(i);

      // Use offset and repeat to create seamless tiles
      const noiseValue = this.noise.perlin2((x + offsetX) / step % repeats, (y + offsetY) / step % repeats);
      geometry.attributes.position.setZ(i, noiseValue * height);
    }

    geometry.attributes.position.needsUpdate = true;
  }

  public update(dt: number) {
    this.params.offsetX += this.params.speedX * dt;
    this.params.offsetY += this.params.speedY * dt;
    this.updateGroundParams();
  }
}