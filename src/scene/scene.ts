import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { resizeRendererToDisplaySize } from '../helpers/responsiveness';
import Stats from 'three/examples/jsm/libs/stats.module';
import GUI from 'lil-gui';
import Ground from './environment/ground';

const CANVAS_ID = 'scene';

export default class Scene extends THREE.Scene{
  private canvas!: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private loadingManager!: THREE.LoadingManager;
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private stats!: Stats;
  private gui!: GUI;

  constructor() {
    super();

    this.init();
  }

  private init() {
    this.setupRenderer();
    this.setupLoadingManager();
    this.setupLights();
    this.setupObjects();
    this.setupCamera();
    this.setupControls();
    this.setupStats();
    this.setupGUI();
  }

  private setupRenderer() {
    this.canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupLoadingManager() {
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = () => {
      console.log('loading started');
    };
    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:');
      console.log(`${url} -> ${loaded} / ${total}`);
    };
    this.loadingManager.onLoad = () => {
      console.log('loaded!');
    };
    this.loadingManager.onError = () => {
      console.log('❌ error while loading');
    };
  }

  private setupLights() {
    const ambientLight = this.ambientLight = new THREE.AmbientLight('white', 0.4);
    this.add(ambientLight);

    const directionalLight = this.directionalLight = new THREE.DirectionalLight(0xeeeeee, 2);
    directionalLight.position.set(10, 10, 15);
    directionalLight.lookAt(0, 0, 0);
    this.add(directionalLight);
  }

  private setupObjects() {
    const ground = new Ground();
    this.add(ground);
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.canvas.clientWidth / this.canvas.clientHeight, 0.0001, 1000);
    this.camera.position.set(2, 2, 5);
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.autoRotate = false;
    this.controls.update();
  }

  private setupStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  private setupGUI() {
    this.gui = new GUI();
    const lightsFolder = this.gui.addFolder('Lights');
    lightsFolder.add(this.directionalLight, 'visible').name('directional light');
    lightsFolder.add(this.ambientLight, 'visible').name('ambient light');

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

    this.gui.close();
  }

  public update(dt: number) {
    this.stats.update();

    if (resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.controls.update();

    this.renderer.render(this, this.camera);
  }
}
