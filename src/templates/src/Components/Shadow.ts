import { Entity, World, System, Component } from "~/lib/ECS";
import {
  HemisphericLight,
  Vector3,
  DirectionalLight,
  ShadowGenerator,
  AbstractMesh,
  Mesh,
  IShadowLight,
} from "@babylonjs/core";
import { MeshComponent } from "./Mesh";

export interface ShadowComponentInput {
  lightName: string;
}

export class ShadowComponent extends Component {
  shadowGenerator: ShadowGenerator | null = null;
  lightName: string;

  constructor(data: ShadowComponentInput) {
    super(data);
    this.lightName = data.lightName;
  }
}

export class ShadowSystem extends System {
  public shadowGenerator: ShadowGenerator | null = null;
  constructor(world: World, componentClasses = [ShadowComponent]) {
    super(world, componentClasses);
  }
  load(entity: Entity) {
    const shadowComponent = entity.getComponent(ShadowComponent);
    shadowComponent.loading = true;
    const { lightName } = shadowComponent;
    const light = this.scene.getLightByName(lightName);
    if (!light) return;
    const shadowGenerator = new ShadowGenerator(
      1024 * 4,
      light as IShadowLight,
      true,
    );
    shadowGenerator.bias = 0.001;
    shadowGenerator.normalBias = 0.001;
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 16;
    shadowGenerator.enableSoftTransparentShadow = true;
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.usePercentageCloserFiltering = true;
    this.scene.meshes.forEach((mesh) => {
      if (
        mesh.name == "SkyBox" ||
        mesh.name == "Ground" ||
        mesh.name == "Terrain" ||
        mesh.name == "Water" ||
        mesh.name == "World"
      ) {
        mesh.receiveShadows = true;
        return;
      } else {
        shadowGenerator.addShadowCaster(mesh, true);
        mesh.receiveShadows = true;
      }
    });
    this.shadowGenerator = shadowGenerator;
    shadowComponent.loading = false;
    shadowComponent.loaded = true;
    console.log("Shadows initialized");
  }
  processEntity(entity: Entity, deltaTime: number) {
    const shadowComponent = entity.getComponent(ShadowComponent);
    const { loading, loaded } = shadowComponent;
    if (!loading && !loaded && this.scene.isReady()) this.load(entity);
  }
}
