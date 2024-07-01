import './style.css';
import * as THREE from 'three'
import Scene from './scene/scene';
import { Application } from 'pixi.js';
import { UI } from './ui/ui';

class Main {
    private scene!: Scene;
    private clock: THREE.Clock;

    private app!: Application;
    private ui!: UI;

    constructor() {
        this.clock = new THREE.Clock();
        this.clock.start();

        this.initUI();
        this.initScene();
        this.initEvents();

        this.resize();
    }

    private initScene() {
        this.scene = new Scene(this.ui);
    }

    private initEvents() {
        window.addEventListener('resize', () => this.resize());
        this.update = this.update.bind(this);
        this.update();
    }

    private initUI() {
        const app = this.app = new Application({
            resolution: Math.max(window.devicePixelRatio, 2),
            backgroundColor: 0xffffff,
            backgroundAlpha: 0,
        });

        this.ui = new UI();
        app.stage.addChild(this.ui);

        document.getElementById('game_app')?.appendChild(app.view);
    }

    public update() {
        requestAnimationFrame(this.update);

        const delta = this.clock.getDelta();

        this.scene.update(delta);
    }

    public resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const scaleY = 1; // windowHeight < minHeight ? minHeight / windowHeight : 1;
        const scale = scaleY; // scaleX > scaleY ? scaleX : scaleY;
        const width = windowWidth * scale;
        const height = windowHeight * scale;

        this.app.renderer.view.style.width = `${windowWidth}px`;
        this.app.renderer.view.style.height = `${windowHeight}px`;
        window.scrollTo(0, 0);

        this.app.renderer.resize(width, height);
        this.ui.resize();
    }
}

new Main();
// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()