import { AdvancedDynamicTexture, Control, StackPanel } from "@babylonjs/gui";

import { Component, Entity, World, System } from "~/lib/ECS";

import { LabelStack } from "../lib/LabelStack";

export interface DebugComponentInput {
  textColor?: string;
  bgAlpha?: number;
  bgColor?: string;
}

export class DebugComponent extends Component {
  public gui: LabelStack;
  public bgColor: string;
  public bgAlpha: number;
  public textColor: string;
  constructor(data: DebugComponentInput) {
    super(data);
    this.bgColor = data.bgColor || "black";
    this.textColor = data.textColor || "white";
    this.bgAlpha = data.bgAlpha || 0.5;
  }
}

export class DebugSystem extends System {
  protected ui: AdvancedDynamicTexture;
  protected container: StackPanel;

  constructor(world: World, componentClasses = [DebugComponent]) {
    super(world, componentClasses);
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI(
      "DEBUG_PANEL",
      true,
      this.scene,
    );
    this.container = new StackPanel("CONTAINER");
    this.container.isVertical = true;
    this.container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.ui.addControl(this.container);
  }
  keyDown(event: KeyboardEvent) {
    if (event.key === "2") {
      console.log("DebugConsole");
      this.showConsole();
    }
    if (event.code === `Backquote`) {
      this.showInspector();
    }
  }
  showConsole() {
    window.gui.ui.isVisible = !window.gui.ui.isVisible;
  }
  showInspector() {
    const scene = this.scene;
    const canvas = scene.getEngine().getRenderingCanvas();
    canvas.focus();

    if (scene.debugLayer?.isVisible()) {
      scene.debugLayer.hide();
      // scene.setActiveCameraByName("Camera");
      // const cam2 = scene.getCameraByName("Camera");
      // cam2.attachControl(canvas, true);
    } else {
      scene.debugLayer
        .show({
          overlay: true,
          embedMode: true,
          globalRoot: document.getElementById("debugLayer") as HTMLElement,
        })
        .then((layer) => {
          layer
            .select
            // scene.setActiveCameraByName("FreeCamera"),
            ();
          // const cam = scene.getCameraByName("FreeCamera");
          // cam.attachControl(canvas, true);
        });
    }
  }

  load(entity: Entity) {
    const debugComponent = entity.getComponent(DebugComponent);
    debugComponent.loading = true;
    window.gui = window.gui || {};
    window.gui[entity.name] = debugComponent.gui = new LabelStack(
      entity,
      this.scene,
      this.container,
    );
    debugComponent.loaded = true;
    debugComponent.loading = false;
    window.addEventListener("keydown", this.keyDown.bind(this));
    console.log("Debug component loaded");
  }
  processEntity(entity: Entity) {
    const debugComponent = entity.getComponent(DebugComponent);
    const { loading, loaded } = debugComponent;
    if (!loaded && !loading) this.load(entity);
  }
}
