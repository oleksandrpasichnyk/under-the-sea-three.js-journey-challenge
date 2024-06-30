import { FISHES } from "../../../../loader/models-list";
import { BOT_TYPE } from "../fish.types"

export const BOTS_RACING_CONFIG = {
  [BOT_TYPE.ONE]: {
    maxSpeed: 40,
    acceleration: 7,
    lerp: 0.1,
  },
  [BOT_TYPE.TWO]: {
    maxSpeed: 45,
    acceleration: 8,
    lerp: 0.03,
  },
  [BOT_TYPE.THREE]: {
    maxSpeed: 43,
    acceleration: 8,
    lerp: 0.05,
  },
  [BOT_TYPE.FOUR]: {
    maxSpeed: 42,
    acceleration: 7.5,
    lerp: 0.04,
  },
  [BOT_TYPE.FIVE]: {
    maxSpeed: 40,
    acceleration: 8,
    lerp: 0.07,
  },
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