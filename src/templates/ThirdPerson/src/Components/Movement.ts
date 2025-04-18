import { Component, Entity, World, System } from "~/lib/ECS";
import {
  CharacterSupportedState,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsCharacterController,
  PhysicsShapeType,
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
  spawnAt: number[];
  inAirSpeed: number;
  onGroundSpeed: number;
  jumpHeight: number;
  rotationSpeed: number;
}

// MovementComponent.ts
export class MovementComponent extends Component {
  spawnAt: Vector3 = Vector3.Zero();
  controller: PhysicsCharacterController;
  state: string = "IN_AIR";
  inAirSpeed = 80.0;
  onGroundSpeed = 10000.0;
  jumpHeight = 1.5;
  rotationSpeed = 100;
  wantJump = false;
  forwardLocalSpace = new Vector3(0, 0, 1);
  characterOrientation = Quaternion.Identity();
  characterGravity = new Vector3(0, -18, 0);
  velocity = Vector3.Zero();
  acceleration: Vector3;
  desiredVelocity: Vector3;

  constructor(data: MovementInput) {
    const { inAirSpeed, onGroundSpeed, jumpHeight, spawnAt } = data;
    super(data);
    this.desiredVelocity = Vector3.Zero();
    this.acceleration = Vector3.Zero();
    this.spawnAt = spawnAt ? Vector3.FromArray(spawnAt) : Vector3.Zero();
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
    const physicsEngine = this.scene.getPhysicsEngine();
    if (!physicsEngine) return;
    const movementComponent = entity.getComponent(MovementComponent);
    const { spawnAt } = movementComponent;
    movementComponent.loading = true;
    if (spawnAt.length()) entity.position.copyFrom(spawnAt);
    movementComponent.controller = new PhysicsCharacterController(
      entity.position,
      {
        capsuleHeight: 3,
        capsuleRadius: 1,
      },
      this.scene,
    );
    // const capsule = MeshBuilder.CreateCapsule(
    //   "CharacterDisplay",
    //   { height: 3, radius: 1 },
    //   this.scene,
    // );
    // capsule.isVisible = false;
    // capsule.setParent(entity);
    // const body = new PhysicsAggregate(entity, PhysicsShapeType.CAPSULE, {
    //   mass: 100,
    //   restitution: 0,
    //   friction: 100,
    // });
    movementComponent.loading = false;
    movementComponent.loaded = true;
  }

  protected processEntity(entity: Entity, deltaTime: number): void {
    const movementComponent = entity.getComponent(MovementComponent);
    if (!movementComponent.loaded && !movementComponent.loading) {
      this.load(entity);
    }
    if (!movementComponent.loaded) return;
    const inputComponent = entity.getComponent(PlayerInputComponent);
    const { controller } = movementComponent;

    const inputMoving = inputComponent?.movementVector.length() > 0;
    if (inputComponent)
      movementComponent.desiredVelocity.copyFrom(inputComponent.movementVector);
    if (controller) this.updateMovement(entity, deltaTime);
  }

  updateMovement(entity: Entity, deltaTime: number) {
    const movementComponent = entity.getComponent(MovementComponent);
    // const actionComponent = entity.getComponent(ActionComponent);

    const { controller, characterGravity, state } = movementComponent;

    const supportInfo = controller.checkSupport(deltaTime, Vector3.Down());
    const desiredLinearVelocity = this.getDesiredVelocity(
      deltaTime,
      supportInfo,
      movementComponent,
    );
    controller.setVelocity(desiredLinearVelocity);
    controller.integrate(deltaTime, supportInfo, characterGravity);
    const newPosition = controller.getPosition();
    entity.position.copyFrom(newPosition);
    if (state == "ON_GROUND")
      this.rotateTowards(entity, movementComponent, deltaTime);
  }

  getNextState = (supportInfo, movementComponent) => {
    const { wantJump, state } = movementComponent;

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
    } else {
      return state;
    }
  };

  rotateTowards(
    entity: Entity,
    movementComponent: MovementComponent,
    deltaTime: number,
  ) {
    const { rotationSpeed, controller } = movementComponent;
    const targetVector = controller.getVelocity();
    const speed = rotationSpeed;
    if (targetVector.length() === 0) return; // No rotation needed if no input vector
    const targetDirection = targetVector.normalize();
    const currentForward = entity.forward.normalize();
    const sign = Math.sign(Vector3.Cross(currentForward, targetDirection).y);
    let angle = Math.atan2(
      Vector3.Cross(currentForward, targetDirection).length(),
      Vector3.Dot(currentForward, targetDirection),
    );
    angle *= sign;
    if (Math.abs(angle) > 0.001) {
      const axis = Vector3.Up();
      const amountToRotate = speed * deltaTime;
      const clampedRotation =
        Math.sign(angle) * Math.min(Math.abs(angle), amountToRotate);
      const q = Quaternion.RotationAxis(axis, clampedRotation);
      if (!entity.rotationQuaternion)
        entity.rotationQuaternion = Quaternion.Identity();
      entity.rotationQuaternion = Quaternion.Slerp(
        entity.rotationQuaternion,
        entity.rotationQuaternion.multiply(q),
        (1 - deltaTime) / 5,
      );
    }
  }

  getDesiredVelocity(
    deltaTime: number,
    supportInfo: any,
    movementComponent: MovementComponent,
  ): Vector3 {
    let {
      state,
      characterOrientation,
      characterGravity,
      controller,
      forwardLocalSpace,
      onGroundSpeed,
      inAirSpeed,
      jumpHeight,
      wantJump,
    } = movementComponent;

    let nextState = this.getNextState(supportInfo, movementComponent);
    if (nextState != state) {
      movementComponent.state = state = nextState;
    }

    let upWorld = characterGravity.normalizeToNew();
    upWorld.scaleInPlace(-1.0);

    let forwardWorld =
      forwardLocalSpace.applyRotationQuaternion(characterOrientation);
    if (state == "IN_AIR") {
      let desiredVelocity = movementComponent.desiredVelocity
        .scale(inAirSpeed)
        .applyRotationQuaternion(characterOrientation);
      let outputVelocity = controller.calculateMovement(
        deltaTime,
        forwardWorld,
        upWorld,
        controller.getVelocity(),
        Vector3.ZeroReadOnly,
        desiredVelocity,
        upWorld,
      );
      // Restore to original vertical component
      outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
      outputVelocity.addInPlace(
        upWorld.scale(controller.getVelocity().dot(upWorld)),
      );
      // Add gravity
      outputVelocity.addInPlace(characterGravity.scale(deltaTime));
      return outputVelocity;
    } else if (state == "ON_GROUND") {
      // Move character relative to the surface we're standing on
      // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
      // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
      let desiredVelocity = movementComponent.desiredVelocity
        .scale(onGroundSpeed)
        .applyRotationQuaternion(characterOrientation);

      let outputVelocity = controller.calculateMovement(
        deltaTime,
        forwardWorld,
        supportInfo.averageSurfaceNormal,
        controller.getVelocity(),
        supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        upWorld,
      );
      // Horizontal projection

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
    } else if (state == "START_JUMP") {
      const vel = controller.getVelocity();
      let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
      let curRelVel = vel.dot(upWorld);
      return vel.add(upWorld.scale(u - curRelVel));
    }
    return Vector3.Zero();
  }
}
