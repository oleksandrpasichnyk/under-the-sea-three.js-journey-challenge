import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { resizeRendererToDisplaySize } from '../helpers/responsiveness';
import Stats from 'three/examples/jsm/libs/stats.module';
import GUI from 'lil-gui';
import Stadium from './environment/stadium';
import Background from './environment/background';
import TopWater from './environment/water';
import { SIZES } from '../config';
import RendererStats from '@xailabs/three-renderer-stats';
import { LOADER } from '../loader/loader';
import Test from './test/test';
import CameraController from './controllers/camera-controller';
import UnderwaterBubbles from './vfx/bubbles-effect';
import PlayersController from './controllers/players-controller';
import { Player } from './objects/fish/player/player';

const CANVAS_ID = 'scene';

const enum CAMERA_MODES {
  CONTROLLER = 'CONTROLLER',
  ORBIT_CONTROLS = 'ORBIT_CONTROLS',
}

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
  private stadium!: Stadium;
  private bg!: Background;
  private test!: Test;
  private player!: Player;

  private cameraMode: CAMERA_MODES;

  private cameraController!: CameraController;
  private playersController!: PlayersController;

  private rendererStats!: RendererStats;

  private prewPos = new THREE.Vector3();

  private underwaterBubbles!: UnderwaterBubbles;

  constructor() {
    super();

    this.gui = new GUI();

    this.cameraMode = CAMERA_MODES.CONTROLLER;

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

    console.time('init scene')
    this.setupObjects();
    this.initCameraController();
    this.initPlayersController();
    this.setupGUI();

    this.initRendererStats();

    console.timeEnd('init scene')
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
    // const gridHelper = new THREE.GridHelper(SIZES.width, SIZES.width * 0.1, 0xff0000, 0xffffff);
    // this.add(gridHelper);

    const ground = this.stadium = new Stadium();
    ground.setGui(this.gui);
    this.add(ground);
    ground.position.y = -4;
    
    const bg = this.bg = new Background();
    this.add(bg)

    const water = this.water = new TopWater();
    water.setGui(this.gui);
    this.add(water);
    water.position.y = 50;

    // const test = this.test = new Test();
    // this.add(test);
    // test.position.y = 10;

    const player = this.player = new Player();
    this.add(player);
    // fish.setGUI(this.gui);

    setTimeout(() => {
      const underwaterBubbles = this.underwaterBubbles = new UnderwaterBubbles();
      this.add(underwaterBubbles);

      underwaterBubbles.position.y = 20;

      underwaterBubbles.show(10, 1);
      underwaterBubbles.setWindVector(new THREE.Vector3(0.01, 0, 0));
    }, 1000);

  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(70, this.canvas.clientWidth / this.canvas.clientHeight, 0.01, 10000);
    this.camera.position.set(4, 4, 10);
  }

  private setupControls() {
    const controls = this.controls = new OrbitControls(this.camera, this.canvas);
    controls.enableDamping = true;
    controls.autoRotate = false;

    controls.zoomSpeed = 10;
    controls.panSpeed = 4;
    controls.rotateSpeed = 2;

    controls.minDistance = 0.1;
    controls.maxDistance = 2000;

    controls.update();
  }

  private initCameraController() {
    this.cameraController = new CameraController(this.camera, this.player);
    this.cameraController.setGUI(this.gui);
  }

  private initPlayersController() {
    this.playersController = new PlayersController(this, this.player, this.stadium);
  }

  private setupStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  private setupFog() {
    this.fog = new THREE.Fog(0x001e57, 80, SIZES.length);
  }

  private setupGUI() {
    this.gui.add(this, 'cameraMode', [CAMERA_MODES.CONTROLLER, CAMERA_MODES.ORBIT_CONTROLS]).name('Camera Mode');


    const sceneFolder = this.gui.addFolder('Scene');
    sceneFolder.add(this.water, 'visible').name('water');
    sceneFolder.add(this.stadium, 'visible').name('ground');
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
    // switch fog visibility
    fogFolder.add(this, 'fog', [null, this.fog]).name('fog').onChange((fog) => {
      this.fog = fog;
    });

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

    this.underwaterBubbles?.update(dt);
    
    if (resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    if (this.cameraMode === CAMERA_MODES.ORBIT_CONTROLS) {
      this.controls?.update(dt);
    }else if (this.cameraMode === CAMERA_MODES.CONTROLLER) {
      this.cameraController?.update(dt);
    }

    this.playersController?.update(dt);

    this.renderer.render(this, this.camera);
    this.rendererStats?.update(this.renderer);
  }
}
