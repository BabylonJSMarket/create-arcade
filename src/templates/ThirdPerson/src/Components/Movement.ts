import { Component, Entity, World, System } from "~/lib/ECS";
import {
  CharacterSupportedState,
  PhysicsCharacterController,
} from "@babylonjs/core";
import { PlayerInputComponent } from "./PlayerInput";
import {
  Mesh,
  Vector3,
  Quaternion,
  Scalar,
  AbstractMesh,
  InspectableType,
} from "@babylonjs/core";

// import { IntersectionComponent } from "./Intersection";
import { MeshComponent } from "./Mesh";
// import { ActionComponent } from "./Action";

export interface MovementInput {
  stationary: boolean;
  velocity: number[];
  position: number[];
  inAirSpeed: number;
  onGroundSpeed: number;
  jumpHeight: number;
}

// MovementComponent.ts
export class MovementComponent extends Component {
  controller: PhysicsCharacterController;
  state: string;
  inAirSpeed = 8.0;
  onGroundSpeed = 10.0;
  jumpHeight = 1.5;
  wantJump = false;
  inputDirection = new Vector3(0, 0, 0);
  forwardLocalSpace = new Vector3(0, 0, 1);
  characterOrientation = Quaternion.Identity();
  characterGravity = new Vector3(0, -18, 0);
  characterOrientation = Quaternion.Identity();
  characterVelocity = Vector3.Zero();
  stationary: boolean = false;
  velocity: Vector3;
  acceleration: Vector3;
  desiredVelocity: Vector3;

  constructor(data: MovementInput) {
    const { inAirSpeed, onGroundSpeed, jumpHeight } = data;
    super(data);
    this.velocity = Vector3.Zero();
    this.desiredVelocity = Vector3.Zero();
    this.acceleration = Vector3.Zero();
  }

  wantsToMove() {
    return this.desiredVelocity.length() > 0;
  }

  isMoving() {
    return this.velocity.length() > 0;
  }

  isJumping() {
    return this.velocity.y > 0;
  }

  isFalling() {
    return this.velocity.y < 0;
  }
}

export class MovementSystem extends System {
  constructor(
    world: World,
    componentClasses = [MovementComponent, MeshComponent],
  ) {
    super(world, componentClasses);
    console.log("Movement initialized");
    this.isPauseable = true;
  }

  load(entity: Entity) {
    const movementComponent = entity.getComponent(MovementComponent);
    movementComponent.loading = true;
    movementComponent.controller = new PhysicsCharacterController(
      entity.position,
      {
        capsuleHeight: 1.8,
        capsuleRadius: 0.3,
      },
      this.scene,
    );
    movementComponent.loading = false;
    movementComponent.loaded = true;
  }

  protected processEntity(entity: Entity, deltaTime: number): void {
    const movementComponent = entity.getComponent(MovementComponent);
    const physicsEngine = this.scene.getPhysicsEngine();
    if (
      physicsEngine &&
      !movementComponent.loaded &&
      !movementComponent.loading
    ) {
      this.load(entity);
    }
    if (!movementComponent.loaded) return;
    const inputComponent = entity.getComponent(PlayerInputComponent);
    const meshComponent = entity.getComponent(MeshComponent);
    const mesh = meshComponent?.mesh;
    const {
      velocity,
      position,
      desiredVelocity,
      stationary,
      controller,
      characterOrientation,
    } = movementComponent;

    if (stationary) return;

    const inputMoving = inputComponent?.movementVector.length() > 0;
    if (inputComponent)
      movementComponent.desiredVelocity.copyFrom(inputComponent.movementVector);

    if (mesh && controller) this.updateMovement(entity, deltaTime);
  }

  updateMovement(entity: Entity, deltaTime: number) {
    const movementComponent = entity.getComponent(MovementComponent);
    // const actionComponent = entity.getComponent(ActionComponent);

    const {
      stationary,
      controller,
      characterOrientation,
      characterVelocity,
      characterGravity,
    } = movementComponent;

    if (stationary) return;

    let down = new Vector3(0, -1, 0);
    const supportInfo = controller.checkSupport(deltaTime, down);
    const desiredLinearVelocity = this.getDesiredVelocity(
      deltaTime,
      supportInfo,
      movementComponent,
    );
    controller.setVelocity(desiredLinearVelocity);
    controller.integrate(deltaTime, supportInfo, characterGravity);
    const newPosition = controller.getPosition();
    entity.position.copyFrom(newPosition);
  }

  getNextState = (state, supportInfo, movementComponent) => {
    const { wantJump } = movementComponent;

    if (state == "IN_AIR") {
      if (supportInfo.supportedState == CharacterSupportedState.SUPPORTED) {
        return "ON_GROUND";
      }
      return "IN_AIR";
    } else if (state == "ON_GROUND") {
      if (supportInfo.supportedState != CharacterSupportedState.SUPPORTED) {
        return "IN_AIR";
      }

      if (wantJump) {
        return "START_JUMP";
      }
      return "ON_GROUND";
    } else if (state == "START_JUMP") {
      return "IN_AIR";
    }
  };

  getDesiredVelocity(
    deltaTime: number,
    supportInfo: any,
    movementComponent: MovementComponent,
  ): Vector3 {
    const {
      state,
      characterOrientation,
      characterGravity,
      controller,
      forwardLocalSpace,
      inputDirection,
      onGroundSpeed,
      inAirSpeed,
      jumpHeight,
      velocity,
      wantJump,
    } = movementComponent;

    let nextState = this.getNextState(state, supportInfo, movementComponent);
    if (nextState != state) {
      movementComponent.state = nextState;
    }
    let upWorld = characterGravity.normalizeToNew();
    upWorld.scaleInPlace(-1.0);
    let forwardWorld =
      forwardLocalSpace.applyRotationQuaternion(characterOrientation);
    if (nextState == "IN_AIR") {
      let desiredVelocity = inputDirection
        .scale(inAirSpeed)
        .applyRotationQuaternion(characterOrientation);
      let outputVelocity = controller.calculateMovement(
        deltaTime,
        forwardWorld,
        upWorld,
        velocity,
        Vector3.ZeroReadOnly,
        desiredVelocity,
        upWorld,
      );
      // Restore to original vertical component
      outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
      outputVelocity.addInPlace(upWorld.scale(velocity.dot(upWorld)));
      // Add gravity
      outputVelocity.addInPlace(characterGravity.scale(deltaTime));
      return outputVelocity;
    } else if (nextState == "ON_GROUND") {
      // Move character relative to the surface we're standing on
      // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
      // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
      let desiredVelocity = inputDirection
        .scale(onGroundSpeed)
        .applyRotationQuaternion(characterOrientation);

      let outputVelocity = controller.calculateMovement(
        deltaTime,
        forwardWorld,
        supportInfo.averageSurfaceNormal,
        velocity,
        supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        upWorld,
      );
      // Horizontal projection
      {
        outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
        let inv1k = 1e-3;
        if (outputVelocity.dot(upWorld) > inv1k) {
          let velLen = outputVelocity.length();
          outputVelocity.normalizeFromLength(velLen);

          // Get the desired length in the horizontal direction
          let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);

          // Re project the velocity onto the horizontal plane
          let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
          outputVelocity = c.cross(upWorld);
          outputVelocity.scaleInPlace(horizLen);
        }
        outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
        return outputVelocity;
      }
    } else if (nextState == "START_JUMP") {
      let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
      let curRelVel = velocity.dot(upWorld);
      return velocity.add(upWorld.scale(u - curRelVel));
    }
    return Vector3.Zero();
  }
}
