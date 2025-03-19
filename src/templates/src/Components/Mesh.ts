import {
  AssetsManager,
  DracoCompression,
  Material,
  Mesh,
  Vector3,
} from "@babylonjs/core";
import { System, World, Entity, Component } from "~/lib/ECS";
import "@babylonjs/loaders";
import { LightingComponent } from "./Lighting";
// import { ActionComponent } from "./Action";
import { arrayToMap } from "~/lib/utils";

export interface MeshComponentInput {
  src: string;
  position: number[];
}

export class MeshComponent extends Component {
  public src: string;
  public mesh: Mesh;
  public position: Vector3 = Vector3.Zero();
  constructor(data: MeshComponentInput) {
    super(data);
    if (data.position) this.position = Vector3.FromArray(data.position);
    this.src = data.src;
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
    // const actionComponent = entity.getComponent(ActionComponent);
    const meshTask = this.assetsManager.addMeshTask(
      meshComponent.src,
      "",
      "",
      meshComponent.src,
    );
    meshTask.onSuccess = (task) => {
      task.loadedMeshes.forEach((m) => {
        // m.checkCollisions = false;
        // m.isPickable = false;
      });
      const mesh = task.loadedMeshes[0];
      const animations = task.loadedAnimationGroups;
      // if (actionComponent) actionComponent.animations = arrayToMap(animations);
      meshComponent.mesh = mesh;
      meshComponent.ready = true;
      meshComponent.loading = false;
      meshComponent.mesh.name = entity.name + "_MESH";
      entity.addChild(mesh);
      if (entity.position != meshComponent.position)
        entity.position.copyFrom(meshComponent.position);
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
