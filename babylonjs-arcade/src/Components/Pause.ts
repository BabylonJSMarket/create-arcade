// PauseSystem.ts
import { Entity, World, System, Component } from "~/lib/ECS";
import * as GUI from "@babylonjs/gui";
import { Mesh, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { StackPanel } from "@babylonjs/gui";

export interface PauseOptions {
  text: string;
  action: string;
}

export interface PauseComponentData {
  isPaused: boolean;
  pauseKey: string;
  options: PauseOptions[];
}

export class PauseComponent extends Component {
  isPaused: boolean;
  pauseKey: string;
  heading: string;
  options: PauseOptions[];
  loading = false;
  buttons: Mesh[] = [];
  menu: GUI.AdvancedDynamicTexture;

  constructor(data: PauseComponentData) {
    super(data);
    this.heading = data.heading || "Paused";
    this.isPaused = data.isPaused || false;
    this.options = data.options;
    this.pauseKey = data.pauseKey || "Escape";
  }
}

export class PauseSystem extends System {
  constructor(world: World, componentClasses = [PauseComponent]) {
    super(world, componentClasses);
  }

  load(entity: Entity) {
    const pauseComponent = entity.getComponent(PauseComponent);
    let gui, sp, rect;
    const ww = this.scene.getEngine().getRenderWidth();
    const wh = this.scene.getEngine().getRenderHeight();
    gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "Pause_UI",
      true,
      this.scene,
    );
    // gui.isEnabled = false;
    rect = new GUI.Container("Pause_Screen");
    rect.isVisible = false;
    rect.widthInPixels = 400;
    rect.heightInPixels = 400;
    rect.topInPixels = 0;
    rect.leftInPixels = 0;
    // rect.alpha = 1;
    rect.background = "white";
    sp = new StackPanel("Pause_Buttons");
    gui.addControl(rect);
    rect.addControl(sp);
    this.scene.actionManager = new ActionManager(this.scene);

    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger,
          parameter: (e) => {
            const sk = e.sourceEvent.key.toUpperCase();
            const pk = pauseComponent.pauseKey.toUpperCase();
            return sk == pk;
          },
        },
        (e) => {
          pauseComponent.isPaused = !pauseComponent.isPaused;
          this.toggleOverlay(pauseComponent);
        },
      ),
    );
    pauseComponent.options.forEach((option) => {
      const button = GUI.Button.CreateSimpleButton("Pause_Button", option.text);
      button.width = "150px";
      button.height = "40px";
      button.color = "white";
      button.background = "green";
      button.onPointerClickObservable.add(() => {
        console.log("Clicked", option.action);
        switch (option.action) {
          case "Resume":
            pauseComponent.isPaused = false;
            break;
          case "Restart":
            console.log("Restart");
            break;
          case "Save":
            console.log("Save");
            break;
          case "Load":
            console.log("Load");
            break;
          case "Options":
            console.log("Options");
            break;
          case "Main Menu":
            console.log("Main Menu");
            break;
        }
        this.toggleOverlay(pauseComponent);
      });
      sp.addControl(button);
    });
    pauseComponent.menu = rect;
    console.log("PauseSystem Initialized");
  }

  protected processEntity(entity: Entity, deltatime: number) {
    const pauseComponent = entity.getComponent(PauseComponent);
    if (!pauseComponent.menu && !pauseComponent.loading) {
      this.load(entity);
      return;
    }
    this.world.isPaused = pauseComponent.isPaused;
  }

  toggleOverlay(pauseComponent: PauseComponent) {
    const { isPaused, menu } = pauseComponent;
    if (menu) menu.isVisible = isPaused;
  }
}
