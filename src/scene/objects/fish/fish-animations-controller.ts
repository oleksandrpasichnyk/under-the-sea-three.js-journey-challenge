import * as THREE from "three";
// import ThreeHelper from "../../../helpers/three-hepler";

interface Actions {
  [key: string]: THREE.AnimationAction;
}

export enum FISH_ANIMATION_TYPE {
  Attack = 'ATTACK',
  Death = 'DEATH',
  OutOfWater = 'OUT_OF_WATER',
  SwimmingFast = 'SWIMMING_FAST',
  SwimmingImpulse = 'SWIMMING_IMPULSE',
  SwimmingNormal = 'SWIMMING_NORMAL',
}

const animationsConfig = {
  [FISH_ANIMATION_TYPE.Attack]: 'Fish_Armature|Attack',
  [FISH_ANIMATION_TYPE.Death]: 'Fish_Armature|Death',
  [FISH_ANIMATION_TYPE.OutOfWater]: 'Fish_Armature|Out_Of_Water',
  [FISH_ANIMATION_TYPE.SwimmingFast]: 'Fish_Armature|Swimming_Fast',
  [FISH_ANIMATION_TYPE.SwimmingImpulse]: 'Fish_Armature|Swimming_Impulse',
  [FISH_ANIMATION_TYPE.SwimmingNormal]: 'Fish_Armature|Swimming_Normal',
}

export class FishAnimationsController {
  private view: THREE.Object3D;
  private animationMixer!: THREE.AnimationMixer;
  private currentAnimation: FISH_ANIMATION_TYPE;
  private previousAnimation: FISH_ANIMATION_TYPE;
  private actions: Actions = {};
  private animations: THREE.AnimationClip[];

  private animationsTransitionTime: number;
  private previousAnimationTimeScale: number;
  private animationTimeScale: number;
  private moveSpeed!: number;
  private previousMoveSpeed!: number;

  constructor(view: THREE.Object3D, animations: THREE.AnimationClip[]) {
    this.view = view;
    this.animations = animations;

    this.currentAnimation = FISH_ANIMATION_TYPE.SwimmingNormal;
    this.previousAnimation = this.currentAnimation;
    this.animationTimeScale = 1;
    this.previousAnimationTimeScale = this.animationTimeScale;

    this.animationsTransitionTime = 0.5;

    this.init();
  }

  public update(dt: number): void {
    this.animationMixer.update(dt);

    this.updateTimeScale();
    this.updateAnimation();
  }

  public setOffsetTime(offsetTime: number): void {
    // this.currentAnimation.time = offsetTime;

    const action: THREE.AnimationAction = this.getActionByKey(this.currentAnimation);
    action.time = offsetTime;

  }

  public playAnimation(animation: FISH_ANIMATION_TYPE, loop: boolean = true): void {
    this.currentAnimation = animation;

    const action: THREE.AnimationAction = this.getActionByKey(animation);
    action?.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    
    if (!loop) {
      action.clampWhenFinished = true;
    }
  }

  public setTimeScaleMoveSpeed(moveSpeed: number): void {
    this.moveSpeed = moveSpeed;
  }

  private updateTimeScale(): void {
    if (this.animationTimeScale !== this.previousAnimationTimeScale || this.moveSpeed !== this.previousMoveSpeed) {
      this.animationMixer.timeScale = this.animationTimeScale * this.moveSpeed;

      this.previousAnimationTimeScale = this.animationTimeScale;
      this.previousMoveSpeed = this.moveSpeed;
    }
  }

  private getActionByKey(key: string): THREE.AnimationAction {
    return this.actions[key];
  }

  private updateAnimation(): void {
    if (this.currentAnimation !== this.previousAnimation) {
      const previousAnimationAction: THREE.AnimationAction = this.getActionByKey(this.previousAnimation);
      const currentAnimationAction: THREE.AnimationAction = this.getActionByKey(this.currentAnimation);

      this.executeCrossFade(previousAnimationAction, currentAnimationAction, this.animationsTransitionTime);

      this.previousAnimation = this.currentAnimation;
      this.animationTimeScale = 1;
    }
  }

  private init(): void {
    this.animationMixer = new THREE.AnimationMixer(this.view);
    this.animationMixer.timeScale = this.animationTimeScale;

    this.setupAnimations();
  }

  private setupAnimations(): void {
    for (const key in FISH_ANIMATION_TYPE) {
      const animationName: FISH_ANIMATION_TYPE = (<any>FISH_ANIMATION_TYPE)[key];

      const animationClip = THREE.AnimationClip.findByName(this.animations, animationsConfig[animationName]);
      const animationAction: THREE.AnimationAction = this.animationMixer.clipAction(animationClip);
      this.actions[animationName] = animationAction;
    }

    for (const key in this.actions) {
      const actionData = this.actions[key];
      const weight: number = key === this.currentAnimation ? 1 : 0;

      this.setWeight(actionData, weight);
      actionData?.play();
    }
  }

  private setWeight(action: THREE.AnimationAction, weight: number): void {
    if(!action) {
      return;
    }

    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }

  private executeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number): void {
    this.setWeight(endAction, 1);
    endAction.time = 0;

    startAction.crossFadeTo(endAction, duration, true);
  }
}
