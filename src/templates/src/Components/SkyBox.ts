import { World, Entity, System, Component } from "~/lib/ECS";
import {
  Mesh,
  MeshBuilder,
  StandardMaterial,
  CubeTexture,
  Texture,
  Color3,
} from "@babylonjs/core";

interface SkyBoxData {
  size: number;
  assetPath: string;
}

export class SkyBoxComponent extends Component {
  mesh: Mesh | undefined;
  size: number;
  assetPath: string;

  constructor(data: SkyBoxData) {
    super(data);
    this.size = data.size;
    this.assetPath = data.assetPath;
  }
}

export class SkyBoxSystem extends System {
  constructor(world: World, componentClasses = [SkyBoxComponent]) {
    super(world, componentClasses);
    console.log("SkyBox initialized");
  }

  load(entity: Entity, deltaTime: number) {
    const skyBoxComponent = entity.getComponent(SkyBoxComponent);
    skyBoxComponent.loading = true;
    const { size, assetPath } = skyBoxComponent;
    var skybox = MeshBuilder.CreateBox("SkyBox", { size }, this.scene);
    var skyboxMaterial = new StandardMaterial("SkyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skybox.infiniteDistance = true;
    skybox.renderingGroupId = 0;
    skyboxMaterial.disableLighting = false;

    skyboxMaterial.reflectionTexture = new CubeTexture(assetPath, this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skyBoxComponent.mesh = skybox;
    skyBoxComponent.loading = false;
  }

  processEntity(entity: Entity, deltaTime: number) {
    const skyBoxComponent = entity.getComponent(SkyBoxComponent);
    const { mesh, loading } = skyBoxComponent;
    if (!mesh && !loading) this.load(entity, deltaTime);
  }
}
