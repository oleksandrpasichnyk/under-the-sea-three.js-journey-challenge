import { RacingConfig, ViewConfig } from "../fish.types";

export const PLAYER_RACING_CONFIG: RacingConfig = {
  maxSpeed: 50,
  maxTurboSpeed: 100,
  acceleration: 4,
  turboAcceleration: 50,
  deceleration: 3,
  breakSpeed: 10, // to speed
  handBreakSpeed: 15, // to speed
  rotationBreakSpeed: 6, // to speed
  rotationAcceleration: 2,
  rotationDeceleration: 3,
  maxRotationSpeed: 3.5,
};

export const PLAYER_VIEW_CONFIG: ViewConfig = {
  modelName: 'models/fishes-2/Clownfish.glb',
  scale: 0.2,
}