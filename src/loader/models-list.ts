const FISHES = [
  "Anglerfish.glb",
  "ArmoredCatfish.glb",
  "Betta.glb",
  "BlackLionFish.glb",
  "Blobfish.glb",
  "BlueGoldfish.glb",
  "BlueTang.glb",
  "ButterflyFish.glb",
  "CardinalFish.glb",
  "Clownfish.glb",
  "CoralGrouper.glb",
  "Cowfish.glb",

  // "Flatfish.glb",
  // "FlowerHorn.glb",
  // "GoblinShark.glb",
  // "Goldfish.glb",
  // "Humphead.glb",
  // "Koi.glb",
  // "Lionfish.glb",

  // "MandarinFish.glb",
  // "MoorishIdol.glb",
  // "ParrotFish.glb",
  // "Piranha.glb",
  // "Puffer.glb",
  // "RedSnapper.glb",
  // "RoyalGramma.glb",

  "Sunfish.glb",
  "Swordfish.glb",
  "Tang.glb",
  "Tetra.glb",
  "Tuna.glb",
  "Turbot.glb",
  // "Worm.glb",
  "YellowTang.glb",
  "ZebraClownFish.glb"
];


const PIRATES = [
  // "Characters_Anne.gltf",
  // "Characters_Captain_Barbarossa.gltf",
  // "Characters_Henry.gltf",
  // "Characters_Mako.gltf",
  // "Characters_Shark.gltf",
  // "Characters_Sharky.gltf",
  // "Characters_Skeleton.gltf",
  // "Characters_Skeleton_Headless.gltf",
  // "Characters_Tentacle.gltf",
  // "Enemy_Tentacle.gltf",
  // "Environment_Cliff1.gltf",
  // "Environment_Cliff2.gltf",
  // "Environment_Cliff3.gltf",
  // "Environment_Cliff4.gltf",
  "Environment_Dock.gltf",
  // "Environment_Dock_Broken.gltf",
  "Environment_Dock_Pole.gltf",
  // "Environment_House1.gltf",
  // "Environment_House2.gltf",
  // "Environment_House3.gltf",
  // "Environment_LargeBones.gltf",
  // "Environment_PalmTree_1.gltf",
  // "Environment_PalmTree_2.gltf",
  // "Environment_PalmTree_3.gltf",
  // "Environment_Rock_1.gltf",
  // "Environment_Rock_2.gltf",
  // "Environment_Rock_3.gltf",
  // "Environment_Rock_4.gltf",
  // "Environment_Rock_5.gltf",
  // "Environment_Sawmill.gltf",
  // "Environment_Skulls.gltf",
  // "Prop_Anchor.gltf",
  // "Prop_Barrel.gltf",
  // "Prop_Bomb.gltf",
  // "Prop_Bottle_1.gltf",
  // "Prop_Bottle_2.gltf",
  // "Prop_Bucket.gltf",
  // "Prop_Bucket_Fishes.gltf",
  // "Prop_Cannon.gltf",
  // "Prop_CannonBall.gltf",
  // "Prop_Chest_Closed.gltf",
  // "Prop_Chest_Gold.gltf",
  // "Prop_Coins.gltf",
  // "Prop_Fish_Mackerel.gltf",
  // "Prop_Fish_Tuna.gltf",
  // "Prop_GoldBag.gltf",
  // "Prop_Skull.gltf",
  // "Ship_Large.gltf",
  // "Ship_Small.gltf",
  // "UI_ChickenLeg.gltf",
  // "UI_Gem_Blue.gltf",
  // "UI_Gem_Green.gltf",
  // "UI_Gem_Pink.gltf",
  // "UI_Gold.gltf",
  // "UI_Paper.gltf",
  // "UI_Red_Dash.gltf",
  // "UI_Red_X.gltf",
  // "UI_Rocks.gltf",
  // "UI_Swords.gltf",
  // "UI_Wheat.gltf",
  // "UI_Wood.gltf",
  // "Weapon_Axe.gltf",
  // "Weapon_AxeRifle.gltf",
  // "Weapon_Cutlass.gltf",
  // "Weapon_Dagger.gltf",
  // "Weapon_DoubleAxe.gltf",
  // "Weapon_DoubleShotgun.gltf",
  // "Weapon_Lute.gltf",
  // "Weapon_Pistol.gltf",
  // "Weapon_Rifle.gltf",
  // "Weapon_Sword_1.gltf",
  // "Weapon_Sword_2.gltf"
];


// add prefix to all models

const addPrefix = (models: string[], prefix: string) => {
  models.forEach((model, index) => models[index] = `${prefix}/${model}`);
}

const FISHES_PREFIX = 'models/fishes-2';
const PIRATES_PREFIX = 'models/pirates';

addPrefix(FISHES, FISHES_PREFIX);
addPrefix(PIRATES, PIRATES_PREFIX);

export { FISHES, PIRATES };