import { Component } from "~/lib/ECS";
import { Entity, World, System } from "~/lib/ECS";
import { PhysicsCharacterController } from "@babylonjs/core";
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
  walkingSpeed: number;
  runningSpeed: number;
  maxWalkSpeed: number;
  maxRunSpeed: number;
  rotationSpeed: number;
  jumpingSpeed: number;
  autoRotateSpeed: number;
  autoHoverSpeed: number;
  hoverAmplitude: number;
  moveWithCollisions: boolean;
}

// MovementComponent.ts
export class MovementComponent extends Component {
  controller: PhysicsCharacterController;
  collisionMesh: Mesh;
  stationary: boolean = false;
  velocity: Vector3;
  acceleration: Vector3;
  desiredVelocity: Vector3;
  walkingSpeed: number;
  runningSpeed: number;
  maxRunSpeed: number;
  maxWalkSpeed: number;
  rotationSpeed: number;
  jumpingSpeed: number;
  maxJumpHeight: number;
  previousMoving = false;
  moveWithCollisions = false;

  constructor(data: MovementInput) {
    const {
      walkingSpeed,
      runningSpeed,
      maxWalkSpeed,
      maxRunSpeed,
      rotationSpeed,
      jumpingSpeed,
      stationary,
      moveWithCollisions,
    } = data;
    super(data);
    this.velocity = Vector3.Zero();
    this.desiredVelocity = Vector3.Zero();
    this.acceleration = Vector3.Zero();
    this.walkingSpeed = walkingSpeed || 0;
    this.runningSpeed = runningSpeed || 0;
    this.maxWalkSpeed = maxWalkSpeed || 0;
    this.maxRunSpeed = maxRunSpeed || 0;
    this.rotationSpeed = rotationSpeed || 0;
    this.jumpingSpeed = jumpingSpeed || 0;
    this.maxJumpHeight = 5;
    this.stationary =
      typeof stationary == "undefined" ? this.stationary : stationary;
    this.moveWithCollisions =
      typeof moveWithCollisions == "undefined"
        ? this.moveWithCollisions
        : moveWithCollisions;
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

  // Optional: Methods to manipulate position and velocity directly
  setPosition(x: number, y: number, z: number) {
    this.position = new Vector3(x, y, z);
  }

  setVelocity(vx: number, vy: number, vz: number) {
    this.velocity = new Vector3(vx, vy, vz);
  }

  // Optional: Method to apply a force to the acceleration
  applyForce(force: Vector3) {
    this.velocity.addInPlace(force);
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
      mesh,
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
    if (!movementComponent.loaded || !movementComponent.loading)
      this.load(entity);
    const inputComponent = entity.getComponent(PlayerInputComponent);
    const meshComponent = entity.getComponent(MeshComponent);
    const {
      velocity,
      position,
      desiredVelocity,
      stationary,
      collisionMesh,
      loaded,
      loading,
    } = movementComponent;

    if (stationary) return;

    const inputMoving = inputComponent?.movementVector.length() > 0;
    if (inputComponent) desiredVelocity.copyFrom(inputComponent.movementVector);

    if (
      desiredVelocity.length() ||
      velocity.length() ||
      position != entity?.position
    )
      this.updateMovement(entity, deltaTime);
  }

  updateMovement(entity: Entity, deltaTime: number) {
    const meshComponent = entity.getComponent(MeshComponent);
    const movementComponent = entity.getComponent(MovementComponent);
    // const actionComponent = entity.getComponent(ActionComponent);
    const { mesh } = meshComponent;

    if (!mesh) return;

    const {
      runningSpeed,
      velocity,
      desiredVelocity,
      stationary,
      moveWithCollisions,
      controller,
    } = movementComponent;

    if (stationary) return;
    const characterController = controller;
    let down = new Vector3(0, -1, 0);
    const support = characterController.checkSupport(deltaTime, down);
    const desiredLinearVelocity = this.getDesiredVelocity(
      deltaTime,
      support,
      characterCurrentOrientation,
      characterCurrentVelocity,
    );
    characterController.setVelocity(desiredLinearVelocity);
    characterController.integrate(dt, support, characterGravity);
    const newPosition = characterController.getPosition();
  }

  getDesiredVelocity(
    deltaTime: number,
    support: boolean,
    characterCurrentOrientation: Vector3,
    characterCurrentVelocity: Vector3,
  ): Vector3 {
    var getDesiredVelocity = function (
      deltaTime,
      supportInfo,
      characterOrientation,
      currentVelocity,
    ) {
      let nextState = getNextState(supportInfo);
      if (nextState != state) {
        state = nextState;
      }

      let upWorld = characterGravity.normalizeToNew();
      upWorld.scaleInPlace(-1.0);
      let forwardWorld =
        forwardLocalSpace.applyRotationQuaternion(characterOrientation);
      if (state == "IN_AIR") {
        let desiredVelocity = inputDirection
          .scale(inAirSpeed)
          .applyRotationQuaternion(characterOrientation);
        let outputVelocity = characterController.calculateMovement(
          deltaTime,
          forwardWorld,
          upWorld,
          currentVelocity,
          BABYLON.Vector3.ZeroReadOnly,
          desiredVelocity,
          upWorld,
        );
        // Restore to original vertical component
        outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
        outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
        // Add gravity
        outputVelocity.addInPlace(characterGravity.scale(deltaTime));
        return outputVelocity;
      } else if (state == "ON_GROUND") {
        // Move character relative to the surface we're standing on
        // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
        // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
        let desiredVelocity = inputDirection
          .scale(onGroundSpeed)
          .applyRotationQuaternion(characterOrientation);

        let outputVelocity = characterController.calculateMovement(
          deltaTime,
          forwardWorld,
          supportInfo.averageSurfaceNormal,
          currentVelocity,
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
            let horizLen =
              velLen / supportInfo.averageSurfaceNormal.dot(upWorld);

            // Re project the velocity onto the horizontal plane
            let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
            outputVelocity = c.cross(upWorld);
            outputVelocity.scaleInPlace(horizLen);
          }
          outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
          return outputVelocity;
        }
      } else if (state == "START_JUMP") {
        let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
        let curRelVel = currentVelocity.dot(upWorld);
        return currentVelocity.add(upWorld.scale(u - curRelVel));
      }
      return Vector3.Zero();
    };
  }
}
