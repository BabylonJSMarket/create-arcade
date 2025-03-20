import {
  AbstractMesh,
  ArcRotateCamera,
  Camera,
  Vector3,
} from "@babylonjs/core";
import {
  Viewport,
  FreeCamera,
  ArcFollowCamera,
  KeyboardEventTypes,
  Scalar,
  MeshBuilder,
} from "@babylonjs/core";
import { Component, Entity, World, System } from "~/lib/ECS";
import { MovementComponent } from "./Movement";
import { MeshComponent } from "./Mesh";
import { GameModeComponent } from "./GameMode";

export interface FollowCameraComponentInput {
  target: string;
  offset: number;
  detachControl: boolean;
}

export class FollowCameraComponent extends Component {
  camera: ArcRotateCamera;
  offset: number;
  detachControl: boolean;
  target: string;

  constructor(data: FollowCameraComponentInput) {
    super(data);
    this.offset = data.offset;
    this.camera = null;
    this.detachControl = data.detachControl;
    this.target = data.target;
  }
}

// FollowCameraSystem.ts
const CAMERA_MODE_SWITCH_SPEED = 0.1;

let ALPHAS = {}; // Left and right rotation
ALPHAS.StartScreen = -Math.PI / 2;
ALPHAS.TopDown = -Math.PI / 2;
ALPHAS.SideScroller = -Math.PI / 2;
ALPHAS.ThirdPerson = -Math.PI / 2;
ALPHAS.FirstPerson = -Math.PI / 2;

let BETAS = {}; // Up and down rotation
BETAS.StartScreen = 0;
BETAS.TopDown = Math.PI / 2;
BETAS.SideScroller = -Math.PI / 6;
BETAS.ThirdPerson = Math.PI / 4;
BETAS.FirstPerson = -Math.PI / 4;

let OFFSETS = {};
OFFSETS.StartScreen = 5;
OFFSETS.TopDown = 14;
OFFSETS.SideScroller = 10;
OFFSETS.ThirdPerson = 18;
OFFSETS.FirstPerson = 0.1;

export class FollowCameraSystem extends System {
  world: World;

  constructor(
    world: World,
    componentClasses = [FollowCameraComponent, MovementComponent],
  ) {
    super(world, componentClasses);
    this.componentClasses = componentClasses;
    this.world = world;

    console.log("Camera initialized");
  }

  adjustCameraHeight(camera, players) {
    let minX = Infinity,
      maxX = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    players.forEach((player) => {
      const position = player.getComponent(MovementComponent).position;
      const { x, y, z } = position;
      if (x < minX) minX = x;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (z > maxZ) maxZ = z;
    });

    const boundingBoxSize = Math.max(maxX - minX, maxZ - minZ);
    const distance = boundingBoxSize / (2 * Math.tan(camera.fov / 4));
    camera.position.y = Math.min(distance, 30);
    return distance;
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const world = entity;
    const cameraComponent = entity.getComponent(FollowCameraComponent);
    const { target } = cameraComponent;
    const t = this.scene.getNodeByName(target);
    const gameModeComponent = world?.getComponent(GameModeComponent);
    let { offset, camera, loading } = cameraComponent;
    const cm = gameModeComponent?.currentMode || "StartScreen";
    if (!camera && !loading) {
      camera = new ArcFollowCamera(
        "FollowCamera",
        ALPHAS[cm],
        BETAS[cm],
        offset || OFFSETS[cm],
        t,
        this.scene,
      );
      this.scene.setActiveCameraByName("FollowCamera");
      const canvas = this.scene.getEngine().getRenderingCanvas();
      camera.attachControl(canvas, true);
      camera.minZ = 0;
      this.keyboardEvents(camera);
      // camera.checkCollisions = true;
      // camera.collisionRadius = new Vector3(0.5, 0.5, 0.5);
      // camera.useFramingBehavior = true;
      camera.lowerBetaLimit = 1;
      cameraComponent.camera = camera;
      const ac = this.scene.activeCameras;
    }

    camera = cameraComponent.camera;

    if (!camera) return;
    camera.alpha = Scalar.SmoothStep(
      camera.alpha,
      ALPHAS[cm],
      CAMERA_MODE_SWITCH_SPEED,
    );
    camera.beta = Scalar.SmoothStep(
      camera.beta,
      BETAS[cm],
      CAMERA_MODE_SWITCH_SPEED,
    );
    camera.radius = Scalar.SmoothStep(
      camera.radius,
      offset || OFFSETS[cm],
      CAMERA_MODE_SWITCH_SPEED,
    );
  }
  updateCameraPosition(
    camera: Camera,
    targetsPosition: Vector3,
    cameraPosition: Vector3,
  ) {
    camera.position = cameraPosition;
    let cy = camera.position.y;
    // camera.setTarget(targetsPosition);
  }

  keyboardEvents(camera: ArcFollowCamera) {
    // Camera control variables
    const ROTATION_SNAP = Math.PI / 4; // 45 degrees in radians
    const MIN_BETA = Math.PI / 12; // 30 degrees (prevents going below ground)
    const MAX_BETA = Math.PI / 1.9; // 90 degrees (prevents top-down view)

    let targetAlpha = camera.alpha;
    let targetBeta = camera.beta;

    // Set up keyboard controls
    this.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        switch (kbInfo.event.key) {
          case "ArrowLeft":
            targetAlpha -= ROTATION_SNAP;
            break;
          case "ArrowRight":
            targetAlpha += ROTATION_SNAP;
            break;
          case "ArrowUp":
            targetBeta = Math.min(targetBeta + ROTATION_SNAP, MAX_BETA);
            break;
          case "ArrowDown":
            targetBeta = Math.max(targetBeta - ROTATION_SNAP, MIN_BETA);
            break;
        }
        // console.log(targetAlpha);
      }
    });

    // Smooth camera movement in the render loop
    this.scene.onBeforeRenderObservable.add(() => {
      // Smoothly interpolate alpha
      camera.alpha = Scalar.SmoothStep(
        camera.alpha,
        targetAlpha,
        CAMERA_MODE_SWITCH_SPEED,
      );

      // Smoothly interpolate beta
      camera.beta = Scalar.SmoothStep(
        camera.beta,
        targetBeta,
        CAMERA_MODE_SWITCH_SPEED,
      );
    });
  }
}
