import { FISHES } from "../../../../loader/models-list";
import { BOT_TYPE } from "../fish.types"

export const BOTS_RACING_CONFIG = {
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
}

const randomModels = [...FISHES].sort(() => Math.random() - 0.5).slice(0, 5);

export const BOTS_VIEW_CONFIG = {
  [BOT_TYPE.ONE]: {
    modelName: randomModels[0],
    scale: 1,
  },
  [BOT_TYPE.TWO]: {
    modelName: randomModels[1],
    scale: 1,
  },
  [BOT_TYPE.THREE]: {
    modelName: randomModels[2],
    scale: 1,
  },
  [BOT_TYPE.FOUR]: {
    modelName: randomModels[3],
    scale: 1,
  },
  [BOT_TYPE.FIVE]: {
    modelName: randomModels[4],
    scale: 1,
  },
}