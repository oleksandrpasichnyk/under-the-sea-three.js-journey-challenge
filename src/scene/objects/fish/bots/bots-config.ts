import { FISHES } from "../../../../loader/models-list";
import { BOT_TYPE } from "../fish.types"
import { PLAYER_VIEW_CONFIG } from "../player/player-config";

export const BOTS_RACING_CONFIG = {
  [BOT_TYPE.ONE]: {
    maxSpeed: 1.6,
    acceleration: 0.2,
    lerp: 0.1,
  },
  [BOT_TYPE.TWO]: {
    maxSpeed: 1.6,
    acceleration: 0.25,
    lerp: 0.03,
  },
  [BOT_TYPE.THREE]: {
    maxSpeed: 1.7,
    acceleration: 0.28,
    lerp: 0.05,
  },
  [BOT_TYPE.FOUR]: {
    maxSpeed: 1.5,
    acceleration: 0.25,
    lerp: 0.04,
  },
  [BOT_TYPE.FIVE]: {
    maxSpeed: 1.4,
    acceleration: 0.35,
    lerp: 0.07,
  },
}

const randomModels = [...FISHES].sort(() => Math.random() - 0.5).slice(0, 5);

const playerModel = PLAYER_VIEW_CONFIG.modelName;
randomModels.indexOf(playerModel) > -1 && randomModels.splice(randomModels.indexOf(playerModel), 1);

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