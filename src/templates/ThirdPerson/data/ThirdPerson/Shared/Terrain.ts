import { PhotoDome } from "@babylonjs/core";

export const Terrain = {
  Terrain: {
    components: {
      Ground: {
        width: 100,
        height: 100,
        groundTexture: "/Assets/Meshes/terrain.jpg",
        textureScale: 10,
      },
      FollowCamera: {
        offset: 14,
        target: "Player",
      },
      Debug: {},
      Physics: {
        gravity: -9.81,
        restitution: 0.5,
      },
      GameMode: {
        currentMode: "ThirdPerson",
        modes: ["TopDown", "SideScroller", "ThirdPerson"],
        nextModeKey: "1",
      },
      Lighting: {
        types: ["ambient", "directional"],
        offset: [-2, -4, -4],
      },
      SkyBox: {
        size: 100,
        assetPath: "/Assets/SkyBoxes/cloud/skybox",
      },
    },
  },
};
