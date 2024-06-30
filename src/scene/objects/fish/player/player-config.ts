import { PlayerRacingConfig, ViewConfig } from "../fish.types";

export const PLAYER_RACING_CONFIG: PlayerRacingConfig = {
  maxSpeed: 70,
  acceleration: 10,
  deceleration: 8,
  breakSpeed: 50, // to speed
  rotationBreakSpeed: 10, // to speed
  rotationAcceleration: 5,
  rotationDeceleration: 5,
  maxRotationSpeed: 7,
};

export const PLAYER_VIEW_CONFIG: ViewConfig = {
  modelName: 'models/fishes-2/Clownfish.glb',
  scale: 1,
}