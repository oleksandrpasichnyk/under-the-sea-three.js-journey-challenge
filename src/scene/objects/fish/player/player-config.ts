import { PlayerRacingConfig, ViewConfig } from "../fish.types";

export const PLAYER_RACING_CONFIG: PlayerRacingConfig = {
  maxSpeed: 1.6,
  acceleration: 0.3,
  deceleration: 0.25,
  breakSpeed: 0.4, // to speed
  rotationBreakSpeed: 0.3, // to speed
  rotationAcceleration: 0.12,
  rotationDeceleration: 0.12,
  maxRotationSpeed: 0.3,
};

export const PLAYER_VIEW_CONFIG: ViewConfig = {
  modelName: 'models/fishes-2/Clownfish.glb',
  scale: 1,
}