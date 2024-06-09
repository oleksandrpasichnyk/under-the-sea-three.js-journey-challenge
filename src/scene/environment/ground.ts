import { Noise } from 'noisejs';
import * as THREE from 'three';

export default class Ground extends THREE.Group {
  constructor() {
    super();

    this.init();
  }

  private init() {
    // use instanced mesh to create 10*10 parts
    
  }

  private createPart() {
    const noise = new Noise(Math.random());
    const width = 100;
    const height = 100;
    const widthSegments = 100;
    const heightSegments = 100;
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

    // Generate height map

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i);
      const y = geometry.attributes.position.getY(i);

      const s = 10;

      const noiseValue = noise.perlin2(x / s, y / s);
      geometry.attributes.position.setZ(i, noiseValue * 2);
    }

    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: 0xc6cc88,
    });

    // Create the mesh
    const plane2 = new THREE.Mesh(geometry, material);
    plane2.rotation.x = -Math.PI / 2;
    plane2.position.y = -1;
    this.add(plane2);
  }
}