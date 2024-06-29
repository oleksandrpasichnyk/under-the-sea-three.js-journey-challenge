import * as THREE from 'three';

export default class UnderwaterBubbles extends THREE.Group{
  private bubbleCount: number = 50;

  private bubbles!: THREE.InstancedMesh;
  private windVector: THREE.Vector3;

  private positions!: any[];
  private speeds!: any[];

  private isShown: boolean = false;
  private duration: number = 0;  
  private intensity: number = 0;
  private elapsedTime: number = 0; 

  constructor() {
    super();

    this.windVector = new THREE.Vector3(0, 0, 0);
    this.init();
  }

  private init() {
    // Create a geometry and material for the bubbles
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });

    // Create the InstancedMesh
    this.bubbles = new THREE.InstancedMesh(geometry, material, this.bubbleCount);
    this.bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Add the InstancedMesh to the scene
    this.add(this.bubbles);

    // Initialize bubble positions
    this.positions = [];
    this.speeds = [];
    for (let i = 0; i < this.bubbleCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 10,
        (Math.random() - 0.5) * 10
      );
      this.positions.push(position);

      const speed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.1
      );
      this.speeds.push(speed);

      const matrix = new THREE.Matrix4();
      matrix.setPosition(position);
      this.bubbles.setMatrixAt(i, matrix);
    }
  }

  show(duration: number, intensity: number) {
    this.duration = duration;
    this.intensity = intensity;
    this.elapsedTime = 0;

    this.isShown = true;
  }

  setWindVector(windVector: THREE.Vector3) {
    this.windVector.copy(windVector);
  }

  update (dt: number) {
      if(!this.isShown) {
        return;
      }

      this.elapsedTime += dt / 1000;

      if (this.elapsedTime > this.duration) {
        this.remove(this.bubbles);

        this.isShown = false;
        return;
      }

      for (let i = 0; i < this.bubbleCount; i++) {
        const position = this.positions[i];
        const speed = this.speeds[i].clone().multiplyScalar(this.intensity).add(this.windVector);

        position.add(speed);
        if (position.y > 10) {
          position.y = 0;
        }

        const matrix = new THREE.Matrix4();
        matrix.setPosition(position);
        this.bubbles.setMatrixAt(i, matrix);
      }

      this.bubbles.instanceMatrix.needsUpdate = true;
  }
}

