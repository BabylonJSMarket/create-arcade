import {
  Color3,
  MeshBuilder,
  PHI,
  PhysicsAggregate,
  PhysicsShapeType,
  StandardMaterial,
  Texture,
  Vector2,
} from "@babylonjs/core";
import { Component, Entity, World, System } from "~/lib/ECS";

export interface GroundComponentInput {
  height: number;
  width: number;
  groundTexture: string;
  textureScale: number;
}

export class GroundComponent extends Component {
  public height: number;
  public width: number;
  public groundTexture: string;
  public textureScale: number = 1;

  constructor(data: GroundComponentInput) {
    super(data);
    this.height = data.height;
    this.width = data.width;
    this.groundTexture = data.groundTexture;
    this.textureScale = data.textureScale;
  }
}

export class GroundSystem extends System {
  constructor(world: World, componentClasses = [GroundComponent]) {
    super(world, componentClasses);
  }

  load(entity: Entity) {
    const physicsEngine = this.scene.getPhysicsEngine();
    if (!physicsEngine) return;
    const groundComponent = entity.getComponent(GroundComponent);
    groundComponent.loading = true;
    const { height, width, groundTexture, textureScale } = groundComponent;
    const ground = MeshBuilder.CreateGround(
      "Ground",
      { width, height },
      this.scene,
    );
    const body = new PhysicsAggregate(ground, PhysicsShapeType.MESH, {
      mass: 0,
      restitution: 0.5,
      friction: 1,
    });
    const groundMaterial = new StandardMaterial("GroundMaterial", this.scene);
    groundMaterial.diffuseTexture = new Texture(groundTexture, this.scene);
    groundMaterial.specularColor = new Color3(0, 0, 0);
    groundMaterial.diffuseTexture.uScale = textureScale;
    groundMaterial.diffuseTexture.vScale = textureScale;
    ground.material = groundMaterial;
    groundComponent.loaded = true;
    groundComponent.loading = false;
    console.log("Ground component loaded");
  }
  processEntity(entity: Entity) {
    const groundComponent = entity.getComponent(GroundComponent);
    const { loading, loaded } = groundComponent;
    if (!loaded && !loading) this.load(entity);
  }
}
