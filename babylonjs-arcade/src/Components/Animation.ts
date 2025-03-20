import { AnimationGroup } from "@babylonjs/core";
import { Component, Entity, World, System } from "~/lib/ECS";
import { MeshComponent } from "./Mesh";

interface AnimationComponentData {
  loopMap: any;
  speedRatioMap: any;
  startingAnimation: string;
  moveAnimation: string;
  idleAnimation: string;
}

// AnimationComponent
export class AnimationComponent extends Component {
  animations: Map<String, AnimationGroup>;
  currentAnimation: string;
  targetAnimation: string;
  moveAnimation: string;
  idleAnimation: string;
  blendingWeight: number;
  blendSpeed: number;
  speedRatioMap: Map<String, number>;
  loopMap: Map<String, boolean>;

  constructor(data: AnimationComponentData) {
    super(data);
    const {
      startingAnimation,
      loopMap,
      speedRatioMap,
      moveAnimation,
      idleAnimation,
    } = data;
    this.animations = new Map();
    this.currentAnimation = ""; // Default starting animation
    this.targetAnimation = startingAnimation.toUpperCase();
    this.moveAnimation = moveAnimation?.toUpperCase() || "RUN";
    this.idleAnimation = idleAnimation?.toUpperCase() || "IDLE";
    this.blendingWeight = 0.04;
    this.blendSpeed = 0.2;
    this.loopMap = new Map();
    for (const key in loopMap) {
      this.loopMap.set(key.toUpperCase(), loopMap[key]);
    }
    this.speedRatioMap = new Map();
    for (const key in speedRatioMap) {
      this.speedRatioMap.set(key.toUpperCase(), speedRatioMap[key]);
    }
  }

  setState(state: string) {
    state = state.toUpperCase();
    try {
      this.playAnimation(state).then(() => {
        console.log("END");
      });
    } catch (e) {
      console.error(e);
    }
  }

  async playAnimation(animationName: string) {
    const animation = this.animations.get(animationName);
    this.animationPlayer = new AnimationPlayer(animation, 3);
    return this.animationPlayer.play();
  }
}

export class AnimationSystem extends System {
  constructor(
    world: World,
    componentClasses = [AnimationComponent, MeshComponent],
  ) {
    super(world, componentClasses);
    this.componentClasses = componentClasses;
    console.log("AnimationSystem initialized");
  }

  load(entity: Entity) {
    const animationComponent = entity.getComponent(AnimationComponent);
    const animations = this.scene.animationGroups;
    for (const animation of animations) {
      animation.stop();
      animationComponent.animations.set(animation.name, animation);
      animationComponent.speedRatioMap.set(animation.name, 1);
    }
    animationComponent.loaded = true;
    animationComponent.loading = false;
  }

  processEntity(entity: Entity, deltaTime: number) {
    const animationComponent = entity.getComponent(AnimationComponent);
    let { currentAnimation, targetAnimation, loopMap, loaded, loading } =
      animationComponent;

    if (!loading && !loaded) {
      this.load(entity);
      return;
    }
    if (currentAnimation != targetAnimation) {
      animationComponent.targetAnimation = targetAnimation;
      animationComponent.animations.forEach((animation) => {
        animation.stop();
      });
      animationComponent.animations
        .get(targetAnimation)
        ?.play(loopMap.get(targetAnimation));
    }
  }
}
