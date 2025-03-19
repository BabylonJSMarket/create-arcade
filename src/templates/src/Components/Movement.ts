import { Component } from "~/lib/ECS";
import { Entity, World, System } from "~/lib/ECS";
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
  collisionMesh: Mesh;
  stationary: boolean = false;
  velocity: Vector3;
  position: Vector3;
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
      position,
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
    this.position = Vector3.FromArray(position);
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

  load(movementComponent: MovementComponent, entity: Entity) {
    // entity.inspectableCustomProperties = [
    //     {
    //         label: "Speed",
    //         propertyName: "speed",
    //         type: InspectableType.Slider,
    //         min: 0,
    //         max: 100,
    //         step: 0.1,
    //     },
    // ];
    movementComponent.loaded = true;
    movementComponent.loading = false;
  }

  protected processEntity(entity: Entity, deltaTime: number): void {
    const movementComponent = entity.getComponent(MovementComponent);
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
    if (!loaded && !loading) this.load(movementComponent, entity);

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
      position,
      desiredVelocity,
      stationary,
      moveWithCollisions,
    } = movementComponent;
    if (stationary) return;

    // const { context } = actionComponent;
    // const isImobile = context?.state.isBlocking;
    // if (isImobile) return;

    // if (position !== entity.position && velocity.length() == 0)
    //   entity.position = movementComponent.position;

    // 2. Calculate the acceleration needed to reach desired velocity
    let acceleration = desiredVelocity.scale(deltaTime);

    // 3. Limit acceleration to a maximum value if needed
    acceleration.scaleInPlace(runningSpeed);

    // 4. Update velocity with acceleration and deltaTime
    // gui[entity.name].addLabel("Acc", acceleration);
    movementComponent.velocity.copyFrom(acceleration);
    movementComponent.position.addInPlace(movementComponent.velocity);

    // Handle gravity
    // if (movementComponent.position.y < 0) movementComponent.position.y = 0;

    entity.position = movementComponent.position;
    this.rotateTowards(entity, movementComponent, deltaTime);
  }

  rotateTowards(
    entity: Entity,
    movementComponent: MovementComponent,
    deltaTime: number,
  ) {
    const { rotationSpeed, velocity } = movementComponent;
    const targetVector = velocity;
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
}
