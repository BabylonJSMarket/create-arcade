import {
  HavokPlugin,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsViewer,
  Vector3,
} from "@babylonjs/core";
import { World, Entity, System, Component } from "~/lib/ECS";
import HavokPhysics from "@babylonjs/havok";
import { ObstacleComponent } from "./Obstacle";
import { MeshComponent } from "./Mesh";

interface PhysicsInputData {
  gravity: any;
  ground: boolean;
}

export class PhysicsComponent extends Component {
  gravity: number;
  constructor(data: PhysicsInputData) {
    super(data);
    this.gravity = data.gravity || -9.8;
    this.ground = data.ground || false;
  }
}

export class PhysicsSystem extends System {
  plugin: HavokPlugin;
  viewer: PhysicsViewer;
  constructor(world: World, componentClasses = [PhysicsComponent]) {
    super(world, componentClasses);
  }

  async load(entity: Entity, deltaTime: number) {
    if (this.scene.isLoading) return;
    const physicsComponent = entity.getComponent(PhysicsComponent);
    const obstacleComponent = entity.getComponent(ObstacleComponent);
    const meshComponent = entity.getComponent(MeshComponent);
    physicsComponent.loading = true;
    const { gravity } = physicsComponent;
    this.scene.gravity = new Vector3(0, gravity, 0);
    const havokInstance = await HavokPhysics();
    var hk = new HavokPlugin(true, havokInstance);
    this.plugin = hk;
    this.scene.enablePhysics(this.scene.gravity, hk);
    // new PhysicsAggregate(entity, PhysicsShapeType.BOX, { mass: 0 });
    physicsComponent.loaded = true;
    physicsComponent.loading = false;
  }

  protected processEntity(entity: Entity, deltaTime: number): void {
    const { loading, loaded } = entity.getComponent(PhysicsComponent);
    // const { physicsBody } = entity.getComponent(ObstacleComponent);
    if (!loading && !loaded) this.load(entity, deltaTime);
  }
}
