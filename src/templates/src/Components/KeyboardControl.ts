import { Matrix, Vector3, Axis, Camera, Scene } from "@babylonjs/core";
import { Entity, World, System, Component } from "~/lib/ECS";
import { PlayerInputComponent } from "./PlayerInput";

interface KeyboardControlInput {
  keyMap: any;
}

export class KeyboardControlComponent extends Component {
  public pressed = {};
  public keyMap: any;
  public movementVector = Vector3.Zero();

  constructor(data: KeyboardControlInput) {
    super(data);
    this.keyMap = data.keyMap;
  }
}

export class KeyboardControlSystem extends System {
  constructor(world: World) {
    super(world, [KeyboardControlComponent]);
    console.log("KeyboardControl initialized");
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const playerInputComponent = entity.getComponent(PlayerInputComponent);
    const keyboardComponent = entity.getComponent(KeyboardControlComponent);
    if (!playerInputComponent) return;
    const { loaded, loading } = keyboardComponent;
    if (!loading && !loaded) this.load(entity, deltaTime);
    else this.updateEntity(entity, deltaTime);
  }

  load(entity: Entity, deltaTime: number) {
    const keyboardComponent = entity.getComponent(KeyboardControlComponent);
    keyboardComponent.loading = true;
    const playerInputComponent = entity.getComponent(PlayerInputComponent);
    playerInputComponent.inputSource = keyboardComponent;
    document.addEventListener("keydown", this.handleKeyDown.bind(this, entity));
    document.addEventListener("keyup", this.handleKeyUp.bind(this, entity));
    window.addEventListener("blur", () => {
      for (const key in keyboardComponent.pressed) {
        keyboardComponent.pressed[key] = false;
      }
      this.updateMovementVector(entity, deltaTime);
    });
    keyboardComponent.loading = false;
    keyboardComponent.loaded = true;
  }

  updateEntity(entity: Entity, deltaTime: number) {
    this.updateMovementVector(entity, deltaTime);
  }

  private handleKeyDown(entity: Entity, event: KeyboardEvent) {
    const keyboard = entity.getComponent(KeyboardControlComponent);
    const { keys, keyMap } = keyboard;
    const code = event.code.toLowerCase();
    const key = keyMap[code];
    if (!key) return;
    keyboard.pressed[key] = true;
  }

  private handleKeyUp(entity: Entity, event: KeyboardEvent) {
    const keyboard = entity.getComponent(KeyboardControlComponent);
    const { keyMap } = keyboard;
    const code = event.code.toLowerCase();
    const key = keyMap[code];
    if (!key) return;
    keyboard.pressed[key] = false;
  }

  private updateMovementVector(entity: Entity, deltaTime: number) {
    const keyboard = entity.getComponent(KeyboardControlComponent);
    keyboard.movementVector.x =
      (keyboard.pressed.right ? 1 : 0) - (keyboard.pressed.left ? 1 : 0);
    keyboard.movementVector.y = 0;
    keyboard.movementVector.z =
      (keyboard.pressed.forward ? 1 : 0) - (keyboard.pressed.backward ? 1 : 0);
  }
}
