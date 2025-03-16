import { Entity, Component, World, System } from "~/lib/ECS";
import {
  Scene,
  DynamicTexture,
  StandardMaterial,
  VideoTexture,
  MeshBuilder,
  Mesh,
  Vector3,
  Plane,
  Color3,
} from "@babylonjs/core";

import { AdvancedDynamicTexture, Image } from "@babylonjs/gui";

interface VideoTextureInputData {
  src: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export class VideoTextureComponent extends Component {
  src: string;
  width: number;
  height: number;
  loop: boolean;
  autoplay: boolean;
  video: HTMLVideoElement | null = null;
  texture: DynamicTexture | null = null;
  material: StandardMaterial | null = null;
  mesh: Mesh | null = null;
  loaded: boolean = false;
  loading: boolean = false;
  enabled: boolean = true;

  constructor(data: VideoTextureInputData) {
    super(data);
    this.src = data.src;
    this.loop = data.loop !== undefined ? data.loop : true;
    this.autoplay = data.autoplay !== undefined ? data.autoplay : true;
  }
}

export class VideoTextureSystem extends System {
  constructor(world: World, componentClasses = [VideoTextureComponent]) {
    super(world, componentClasses);
    console.log("VideoTextureSystem Initialized");
  }

  load(entity: Entity, deltaTime: number) {
    const videoTextureComponent = entity.getComponent(VideoTextureComponent);
    videoTextureComponent.loading = true;

    const videoTexture = new VideoTexture(
      "videoTexture",
      videoTextureComponent.src,
      this.scene,
      videoTextureComponent.autoplay,
      videoTextureComponent.loop,
    );

    videoTexture.video.muted = true; // Ensure video is muted for autoplay to work in most browsers

    videoTexture.onLoadObservable.add(() => {
      const material = new StandardMaterial("videoMaterial", this.scene);
      material.diffuseTexture = videoTexture;
      material.emissiveColor = new Color3(1, 1, 1);

      // Create a full-screen plane
      const engine = this.scene.getEngine();
      console.log(engine.getRenderWidth(true));
      const plane = MeshBuilder.CreatePlane(
        "videoPlane",
        {
          width: engine.getRenderWidth(true) / 10,
          height: engine.getRenderHeight(true) / 10,
          sideOrientation: Mesh.FRONTSIDE,
        },
        this.scene,
      );
      plane.material = material;
      plane.position = new Vector3(0, 0, 50); // Center the plane
      plane.rotation = new Vector3(0, 0, 0);
      plane.scaling = new Vector3(1, -1, 1);

      videoTextureComponent.material = material;
      videoTexture.video.play();
      videoTextureComponent.mesh = plane;
      videoTextureComponent.loaded = true;
      videoTextureComponent.loading = false;
    });
  }

  processEntity(entity: Entity, deltaTime: number) {
    const videoTextureComponent = entity.getComponent(VideoTextureComponent);
    const { enabled, loaded, loading } = videoTextureComponent;
    if (!enabled) return;
    if (!loaded && !loading) this.load(entity, deltaTime);
    else this.updateEntity(entity, deltaTime);
  }

  updateEntity(entity: Entity, deltaTime: number) {
    const videoTextureComponent = entity.getComponent(VideoTextureComponent);
    const { enabled, loaded, texture, video } = videoTextureComponent;

    if (!enabled || !loaded || !texture || !video) return;

    // Update the dynamic texture with the current video frame
    texture.update();
  }

  disposeEntity(entity: Entity) {
    const videoTextureComponent = entity.getComponent(VideoTextureComponent);

    if (videoTextureComponent.video) {
      videoTextureComponent.video.pause();
      videoTextureComponent.video.src = ""; // Release the video resource
      videoTextureComponent.video.load();
    }

    if (videoTextureComponent.texture) {
      videoTextureComponent.texture.dispose();
    }

    if (videoTextureComponent.material) {
      videoTextureComponent.material.dispose();
    }

    if (videoTextureComponent.mesh) {
      videoTextureComponent.mesh.dispose();
    }
  }
}
