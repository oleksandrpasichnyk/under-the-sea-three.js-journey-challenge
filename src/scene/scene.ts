import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { resizeRendererToDisplaySize } from '../helpers/responsiveness';
import Stats from 'three/examples/jsm/libs/stats.module';
import GUI from 'lil-gui';
import Ground from './environment/ground';
import Background from './environment/background';
import TopWater from './environment/water';
import { SIZES } from '../config';
import RendererStats from '@xailabs/three-renderer-stats';
import { LOADER } from '../loader/loader';
import Test from './test/test';
import Fish from './objects/fish/fish-view';
import CameraController from './controllers/camera-controller';

const CANVAS_ID = 'scene';

export default class Scene extends THREE.Scene{
  private canvas!: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private stats!: Stats;
  private gui!: GUI;
  private water!: TopWater;
  private ground!: Ground;
  private bg!: Background;
  private test!: Test;
  private fish!: Fish;

  private cameraController!: CameraController;

  private rendererStats!: RendererStats;

  constructor() {
    super();

    this.gui = new GUI();

    this.init();
  }

  private async init() {
    this.setupRenderer();
    this.setupLights();
    this.setupCamera();
    this.setupControls();
    this.setupStats();
    this.setupFog();

    
    await this.setupLoadingManager();
    this.setupObjects();
    this.initCameraController();
    this.setupGUI();

    this.initRendererStats();
  }

  private initRendererStats() {
    const renderStats = this.rendererStats = new RendererStats();

    renderStats.domElement.style.position	= 'absolute'
    renderStats.domElement.style.left	= '0px'
    renderStats.domElement.style.bottom	= '0px'
    document.body.appendChild( renderStats.domElement )
}

  private setupRenderer() {
    this.canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private async setupLoadingManager() {
    // this.loadingManager = new THREE.LoadingManager();
    // this.loadingManager.onStart = () => {
    //   console.log('loading started');
    // };
    // this.loadingManager.onProgress = (url, loaded, total) => {
    //   console.log('loading in progress:');
    //   console.log(`${url} -> ${loaded} / ${total}`);
    // };
    // this.loadingManager.onLoad = () => {
    //   console.log('loaded!');
    // };
    // this.loadingManager.onError = () => {
    //   console.log('❌ error while loading');
    // };

    await LOADER.loadAll();

  }

  private setupLights() {
    const ambientLight = this.ambientLight = new THREE.AmbientLight('white', 4);
    this.add(ambientLight);

    const directionalLight = this.directionalLight = new THREE.DirectionalLight(0xeeeeee, 6);
    directionalLight.position.set(100, 100, 150);
    directionalLight.lookAt(0, 0, 0);
    this.add(directionalLight);

    // light helper

    const helper = new THREE.DirectionalLightHelper(directionalLight);
    this.add(helper);
  }

  private setupObjects() {
    const ground = this.ground = new Ground();
    ground.setGui(this.gui);
    this.add(ground);
    ground.position.y = -10;
    
    const bg = this.bg = new Background();
    this.add(bg)

    const water = this.water = new TopWater();
    water.setGui(this.gui);
    this.add(water);
    water.position.y = 50;

    // const test = this.test = new Test();
    // this.add(test);

    const fish = this.fish = new Fish('');
    this.add(fish);
    fish.setGUI(this.gui);
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.canvas.clientWidth / this.canvas.clientHeight, 0.01, 10000);
    this.camera.position.set(40, 40, 100);
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.autoRotate = false;

    // set zoom steps

    this.controls.minDistance = 1;
    this.controls.maxDistance = 2000;

    this.controls.update();
  }

  private initCameraController() {
    this.cameraController = new CameraController(this.camera, this.fish);
    this.cameraController.setGUI(this.gui);
  }

  private setupStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  private setupFog() {
    this.fog = new THREE.Fog(0x001e57, 80, SIZES.length);
  }

  private setupGUI() {
    const sceneFolder = this.gui.addFolder('Scene');
    sceneFolder.add(this.water, 'visible').name('water');
    sceneFolder.add(this.ground, 'visible').name('ground');
    sceneFolder.add(this.bg, 'visible').name('background');

    sceneFolder.close();

    const lightsFolder = this.gui.addFolder('Lights');
    lightsFolder.add(this.directionalLight, 'visible').name('directional light');
    lightsFolder.add(this.directionalLight, 'intensity', 0, 10, 0.1).name('intensity');
    lightsFolder.addColor(this.directionalLight, 'color').name('color');
    lightsFolder.add(this.ambientLight, 'visible').name('ambient light');
    lightsFolder.add(this.ambientLight, 'intensity', 0, 10, 0.1).name('ambientLight intensity');

    lightsFolder.close();

    const fogFolder = this.gui.addFolder('Fog');
    // fogFolder.add(this.fog!, 'visible').name('fog');
    fogFolder.addColor(this.fog!, 'color').name('color');
    fogFolder.add(this.fog!, 'near', 0, 1000, 1).name('near');
    fogFolder.add(this.fog!, 'far', 0, 1000, 1).name('far');

    fogFolder.close();

    this.gui.onFinishChange(() => {
      const guiState = this.gui.save();
      localStorage.setItem('guiState', JSON.stringify(guiState));
    });

    const guiState = localStorage.getItem('guiState');
    if (guiState) this.gui.load(JSON.parse(guiState));

    const resetGui = () => {
      localStorage.removeItem('guiState');
      this.gui.reset();
    };
    this.gui.add({ resetGui }, 'resetGui').name('RESET');

    // this.gui.close();
  }

  public update(dt: number) {
    this.stats?.update();
    this.water?.update(dt);
    this.test?.update(dt);
    this.fish?.update(dt);

    if (resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.cameraController?.update(dt);

    // this.controls.update();

    this.renderer.render(this, this.camera);

    this.rendererStats?.update(this.renderer);
  }
}
