import { World, Entity, System, Component } from "~/lib/ECS";
import { ActionManager, ExecuteCodeAction } from "@babylonjs/core";

interface GameModeInput {
  loading: boolean;
  loaded: boolean;
  nextModeKey: string;
  currentMode: string;
  modes: string[];
}

export class GameModeComponent extends Component {
  loading = false;
  loaded = false;
  nextModeKey: string;
  currentMode: string;
  modes: string[];

  constructor(data: GameModeInput) {
    super(data);
    this.currentMode = data.currentMode;
    this.modes = data.modes;
    this.nextModeKey = data.nextModeKey;
  }
}

export class GameModeSystem extends System {
  constructor(world: World, componentClasses = [GameModeComponent]) {
    super(world, componentClasses);
    console.log("GameMode initialized");
  }
  processEntity(entity: Entity, deltaTime: number) {
    const gameModeComponent = entity.getComponent(GameModeComponent);

    if (!this.scene.actionManager)
      this.scene.actionManager = new ActionManager(this.scene);

    if (!gameModeComponent.loading && !gameModeComponent.loaded) {
      gameModeComponent.loading = true;
      this.scene.actionManager.registerAction(
        new ExecuteCodeAction(
          {
            trigger: ActionManager.OnKeyUpTrigger,
            parameter: (e) => {
              e.sourceEvent.preventDefault();
              const sk = e.sourceEvent.key.toUpperCase();
              const pk = gameModeComponent.nextModeKey?.toUpperCase();
              return sk == pk;
            },
          },
          (e) => {
            this.nextMode(gameModeComponent);
          },
        ),
      );
      gameModeComponent.loading = false;
      gameModeComponent.loaded = true;
    }
  }

  nextMode(gameModeComponent: GameModeComponent) {
    const currentModeIndex = gameModeComponent.modes.indexOf(
      gameModeComponent.currentMode,
    );
    const nextModeIndex =
      currentModeIndex + 1 >= gameModeComponent.modes.length
        ? 0
        : currentModeIndex + 1;
    gameModeComponent.currentMode = gameModeComponent.modes[nextModeIndex];
    console.log("Switching to mode: ", gameModeComponent.currentMode);
  }
}
