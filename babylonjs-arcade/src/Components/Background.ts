import { System, Component, Entity, World } from "~/lib/ECS";
import { Color3, Color4, Scene, Vector3 } from "@babylonjs/core";
import { HavokPlugin } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

export interface BackgroundComponentData {
  fps: number;
  gravity: number;
  animationTimeScale: number;
  fogEnabled: boolean;
  fogDensity: number;
  fogStart: number;
  fogEnd: number;
  clearColor: number[];
  fogColor: number[];
  ambientColor: number[];
}

export class BackgroundComponent extends Component {
  fps: number;
  gravity: number;
  animationTimeScale: number;
  clearColor: number[];
  fogColor: number[];
  ambientColor: number[];
  fogEnabled: boolean;
  fogDensity: number;
  fogStart: number;
  fogEnd: number;

  constructor(data: BackgroundComponentData) {
    super(data);
    this.fps = data.fps;
    this.gravity = data.gravity;
    this.animationTimeScale = data.animationTimeScale;
    this.fogEnabled = data.fogEnabled;
    this.fogDensity = data.fogDensity;
    this.fogStart = data.fogStart;
    this.fogEnd = data.fogEnd;
    this.clearColor = data.clearColor;
    this.fogColor = data.fogColor;
    this.ambientColor = data.ambientColor || [0, 0, 0];
  }
}

export class BackgroundSystem extends System {
  constructor(world: World, componentClasses = [BackgroundComponent]) {
    super(world, componentClasses);
    this.componentClasses = componentClasses;
    console.log("BackgroundSystem initialized");
  }
  async processEntity(entity: Entity, deltaTime: number) {
    const worldComponent = entity.getComponent(BackgroundComponent);
    const {
      animationTimeScale,
      gravity,
      fogEnabled,
      fogStart,
      fogEnd,
      fogDensity,
      clearColor,
      fogColor,
      ambientColor,
      enabled,
      loading,
      loaded,
    } = worldComponent;
    if (!enabled) return;
    if (!loading && !loaded) {
      this.scene.animationTimeScale = animationTimeScale;
      this.scene.fogMode = fogEnabled ? Scene.FOGMODE_EXP : Scene.FOGMODE_NONE;
      if (fogDensity) this.scene.fogDensity = fogDensity;
      if (fogStart) this.scene.fogStart = fogStart;
      if (fogEnd) this.scene.fogEnd = fogEnd;
      if (clearColor) this.scene.clearColor = Color4.FromArray(clearColor);
      if (ambientColor)
        this.scene.ambientColor = Color3.FromArray(ambientColor);
      if (fogColor) this.scene.fogColor = Color3.FromArray(fogColor);
      worldComponent.loaded = true;
      worldComponent.loading = false;
    }
  }
}
