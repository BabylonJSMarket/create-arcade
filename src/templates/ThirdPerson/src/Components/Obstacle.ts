import {
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShape,
  PhysicsShapeType,
  Vector3,
} from "@babylonjs/core";
import { World, Entity, System, Component } from "~/lib/ECS";
import { MeshComponent } from "./Mesh";

interface ObstacleInputData {
  meshMap: any;
}

export class ObstacleComponent extends Component {
  meshMap: any;
  constructor(data: ObstacleInputData) {
    super(data);
    this.meshMap = data.meshMap;
  }

  ready() {
    return true;
  }
}

export class ObstacleSystem extends System {
  constructor(world: World, componentClasses = [ObstacleComponent]) {
    super(world, componentClasses);
  }

  load(entity: Entity, deltaTime: number) {
    if (this.scene.isLoading) return;
    const obstacleComponent = entity.getComponent(ObstacleComponent);
    const assetComponent = entity.getComponent(MeshComponent);
    obstacleComponent.loading = true;
    const { meshMap } = obstacleComponent;
    const meshes = this.scene.meshes;
    for (const name in meshMap) {
      console.log(name);
      const foundMeshes = meshes.filter(
        (m) => m.name.toUpperCase().includes(name.toUpperCase()), // Partials allowed, insensitive casing.
      );
      if (!foundMeshes.length) {
        console.log("Meshes not found: ", name);
        continue;
      } else {
        foundMeshes.forEach((m) => {
          // m.checkCollisions = true;
          m.isPickable = true;
          m.useOctreeForCollisions = true;
          m.showBoundingBox = true;
          this.createCollisionMesh(m as Mesh);
        });
      }
    }
    // this.scene.createOrUpdateSelectionOctree(8, 1);
    obstacleComponent.loaded = true;
    obstacleComponent.loading = false;
    console.log("ObstacleSystem Initialized");
  }

  // Function to create a collision mesh for a given mesh
  createCollisionMesh(mesh) {
    // Set the collision mesh position to match the mesh position
    let collisionMesh = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {
      mass: 0.1,
    });
    // Set the collision mesh as the mesh's collision shape

    // Make the collision mesh invisible
    // collisionMesh.isVisible = false;

    return collisionMesh;
  }

  processEntity(entity: Entity, deltaTime: number) {
    const assetComponent = entity.getComponent(MeshComponent);
    if (!assetComponent.loaded) return;
    const obstacleComponent = entity.getComponent(ObstacleComponent);
    const { enabled, loaded, loading } = obstacleComponent;
    if (!enabled) return;
    if (!loaded && !loading) this.load(entity, deltaTime);
    else this.updateEntity(entity, deltaTime);
  }

  updateEntity(entity: Entity, deltaTime: number) {
    // const assetComponent = entity.getComponent(MeshComponent);
    // const obstacleComponent = entity.getComponent(ObstacleComponent);
    // const { enabled, loaded, loading } = obstacleComponent;
  }
}
