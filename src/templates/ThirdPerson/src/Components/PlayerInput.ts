import { upKeys, upValues } from "../lib/utils";
import { KeyboardControlComponent } from "./KeyboardControl";
import { Component, Entity, World, System } from "~/lib/ECS";
import { Vector3, Camera, Axis } from "@babylonjs/core";

interface PlayerInputData {
  inputType: string;
  adjustWithView: boolean;
  actionMap: any;
}

export class PlayerInputComponent extends Component {
  public inputType = "keyboard";
  public actionMap: any;
  public currentActions: any = {};
  public adjustWithView: boolean;
  public movementVector: Vector3 | undefined;
  public inputSource: KeyboardControlComponent | undefined;

  constructor(data: PlayerInputData) {
    super(data);
    this.inputType = data.inputType;
    this.adjustWithView = data.adjustWithView;
    this.actionMap = upKeys(upValues(data.actionMap));
    this.movementVector = Vector3.Zero();
  }

  anyActions() {
    const filteredObject = Object.fromEntries(
      Object.entries(this.currentActions).filter(
        ([key, value]) => value !== false,
      ),
    );
    return Object.keys(filteredObject).length > 0;
  }
}

export class PlayerInputSystem extends System {
  constructor(world: World) {
    super(world, [
      PlayerInputComponent,
      //, ActionComponent
    ]);
    this.isPauseable = true;
    console.log("PlayerInput initialized");
  }

  processEntity(entity: Entity, deltaTime: number): void {
    this.updateActions(entity, deltaTime);
  }

  getAdjustedMovementVector(inputVector: Vector3) {
    const camera = this.scene.activeCamera as Camera;
    if (!camera) return inputVector;

    // Get the camera's forward and right direction vectors
    const cameraForward = camera.getDirection(Axis.Z).normalize();
    const cameraRight = camera.getDirection(Axis.X).normalize();
    cameraForward.y = 0;
    cameraRight.y = 0;

    // Adjust the movement vector based on input
    const adjustedVector = cameraForward
      .scale(inputVector.z)
      .add(cameraRight.scale(inputVector.x));

    // Normalize the adjusted vector to maintain consistent movement speed
    const normalizedAdjustedVector = adjustedVector.normalize();
    return normalizedAdjustedVector;
  }

  lerpEasing(start, end, t) {
    // Quadratic ease-out: steep at first, then levels off.
    const easedT = 1 - Math.pow(1 - t, 2);
    return start + (end - start) * easedT;
  }

  updateActions(entity: Entity, deltaTime: number) {
    const playerInputComponent = entity.getComponent(PlayerInputComponent);
    const inputSource = playerInputComponent.inputSource;
    // const actionComponent = entity.getComponent(ActionComponent);
    // const { actions } = actionComponent;
    const { adjustWithView, actionMap } = playerInputComponent;

    const adjust = adjustWithView;

    const v = inputSource?.movementVector;
    if (!v) return;
    playerInputComponent.movementVector = adjust
      ? this.getAdjustedMovementVector(v)
      : v;

    const { pressed } = inputSource;
    const { x, z, y } = playerInputComponent.movementVector;
    let a = !!(x || z) ? { MOVING: true } : {};
    playerInputComponent.currentActions = a;
    // console.log("Actions: ", a);
  }
}
