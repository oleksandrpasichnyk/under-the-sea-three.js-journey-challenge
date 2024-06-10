import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader } from 'three';
import { FISHES, FISHES_2, PIRATES } from './models-list';
import { TEXTURES } from './textures-list';

export const ALL_ASSETS: {
  textures: TextureAssets;
  models: ModelAssets;
} = {
  textures: {},
  models: {}
};

interface AssetsData {
  textures: string[];
  models: string[];
}

interface TextureAssets {
  [key: string]: any;
}

interface ModelAssets {
  [key: string]: any;
}

class Loader {
  private assetsData: AssetsData;
  private loaded: boolean;

  constructor(assets: AssetsData) {
    this.assetsData = assets; // assets is an object { textures: [], models: [] }
    this.loaded = false;
  }

  public async loadAll() {
    await this.loadTextures();
    await this.loadModels();
  }

  private async loadTextures() {
    const loader = new TextureLoader();

    const texturePromises = this.assetsData.textures.map(textureName => {
      return new Promise<void>((resolve, reject) => {
        loader.load(
          `textures/${textureName}`, // Adjust path as needed
          (texture) => {
            (ALL_ASSETS.textures as TextureAssets)[textureName] = texture;
            resolve();
          },
          undefined,
          (err) => reject(err)
        );
      });
    });

    await Promise.all(texturePromises);
    this.checkAllLoaded();

    console.log(ALL_ASSETS.textures)
  }

  private async loadModels() {
    const loader = new GLTFLoader();
    const modelPromises = this.assetsData.models.map(modelName => {
      return new Promise<void>((resolve, reject) => {
        loader.load(
          `${modelName}`, // Adjust path as needed
          (gltf) => {
            (ALL_ASSETS.models as ModelAssets)[modelName] = gltf.scene;
            resolve();
          },
          undefined,
          (err) => reject(err)
        );
      });
    });

    await Promise.all(modelPromises);
    this.checkAllLoaded();
  }

  checkAllLoaded() {
    // Check if all textures and models are loaded
    if (Object.keys(ALL_ASSETS.textures).length === this.assetsData.textures.length &&
      Object.keys(ALL_ASSETS.models).length === this.assetsData.models.length) {
      this.loaded = true;
      console.log("All assets are loaded.");
      // Optionally, call a callback or dispatch an event
    }
  }

  isLoaded() {
    return this.loaded;
  }
}

// Usage
const assets = {
  textures: [...TEXTURES],
  models: [...FISHES, ...FISHES_2, ...PIRATES]
};

export const LOADER = new Loader(assets);
