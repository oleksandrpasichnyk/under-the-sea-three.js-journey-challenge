import './style.css';
import * as THREE from 'three'
import Scene from './scene/scene';

class Main {
  private scene!: Scene;
  private clock: THREE.Clock;

    constructor() {
        this.clock = new THREE.Clock();
        this.clock.start();

        this.initScene();
        this.initEvents();
    }

    private initScene() {
      this.scene = new Scene();
    }

    private initEvents() {
        window.addEventListener('resize', () => this.resize());
        this.update = this.update.bind(this);
        this.update();
    }

    public update() {
        requestAnimationFrame(this.update);

        const delta = this.clock.getDelta();

        this.scene.update(delta);
    }

    public resize() {
        // this.scene.resize();
    }
}

new Main();
// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()