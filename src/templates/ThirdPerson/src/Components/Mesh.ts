import {
  AssetsManager,
  DracoCompression,
  Material,
  Mesh,
  Vector3,
  PhysicsAggregate,
  PhysicsShapeMesh,
  PhysicsShape,
  PhysicsShapeType,
} from "@babylonjs/core";
import { System, World, Entity, Component } from "~/lib/ECS";
import "@babylonjs/loaders";

import { arrayToMap } from "~/lib/utils";

export interface MeshComponentInput {
  src: string;
  position: number[];
  collider: string;
  scale: number;
}

export class MeshComponent extends Component {
  public src: string;
  public mesh: Mesh;
  public scale: number;
  public collider: string;
  public position: Vector3 = Vector3.Zero();
  constructor(data: MeshComponentInput) {
    super(data);
    if (data.position) this.position = Vector3.FromArray(data.position);
    this.src = data.src;
    this.collider = data.collider;
    this.scale = data.scale;
  }
}

export class MeshSystem extends System {
  assetsManager: AssetsManager;

  constructor(world: World, componentClasses = [MeshComponent]) {
    super(world, componentClasses);
    DracoCompression.Configuration = {
      decoder: {
        wasmUrl: "/Babylon/draco_wasm_wrapper_gltf.js",
        wasmBinaryUrl: "/Babylon/draco_decoder_gltf.wasm",
        fallbackUrl: "/Babylon/draco_decoder_gltf.js",
      },
    };
  }

  loadMesh(entity: Entity) {
    const meshComponent = entity.getComponent(MeshComponent);
    const { scale, collider } = meshComponent;
    // const actionComponent = entity.getComponent(ActionComponent);
    const meshTask = this.assetsManager.addMeshTask(
      meshComponent.src,
      "",
      "",
      meshComponent.src,
    );
    meshTask.onSuccess = (task) => {
      task.loadedMeshes.forEach((m) => {
        m.checkCollisions = false;
        m.isPickable = false;
        if (collider && m.name.toUpperCase().includes(collider.toUpperCase())) {
          new PhysicsAggregate(m, PhysicsShapeType.MESH, this.scene);
        }
      });
      const mesh = task.loadedMeshes[0];
      if (scale) {
        mesh.scaling = new Vector3(scale, scale, scale);
      }
      const animations = task.loadedAnimationGroups;
      animations.forEach((animation) => {
        animation.stop();
        if (animation.name.toUpperCase().includes("IDLE")) animation.play(true);
      });
      meshComponent.mesh = mesh;
      meshComponent.ready = true;
      meshComponent.loading = false;
      meshComponent.mesh.name = entity.name + "_MESH";
      entity.addChild(mesh);
      meshComponent.loaded = true;
      entity.meshLoaded = true;
    };
    this.assetsManager.load();
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const meshComponent = entity.getComponent(MeshComponent);
    const { mesh, loading, loaded } = meshComponent;
    if (!mesh && !loading && !loaded) {
      meshComponent.loading = true;
      this.assetsManager = new AssetsManager(this.scene);
      // this.assetsManager.autoHideLoadingUI = true;
      this.loadMesh(entity);
    }
  }
}
