export interface RacingConfig {
  maxSpeed: number,
  acceleration: number,
  lerp: number,
}

export interface PlayerRacingConfig {
  maxSpeed: number,
  acceleration: number,
  maxTurboSpeed: number,
  turboAcceleration: number,
  deceleration: number,
  breakSpeed: number,
  handBreakSpeed: number,
  rotationBreakSpeed: number,
  rotationAcceleration: number,
  rotationDeceleration: number,
  maxRotationSpeed: number,
}

export interface ViewConfig {
  modelName: string,
  scale: number,
}

export enum BOT_TYPE {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
}