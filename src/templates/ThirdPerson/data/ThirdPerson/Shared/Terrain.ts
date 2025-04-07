import { PhotoDome } from "@babylonjs/core";

export const Terrain = {
  Terrain: {
    components: {
      Mesh: {
        src: "/Assets/Meshes/RaceTrack.glb",
        colliders: "Collider",
        scale: 20,
        position: [0, -15, 0],
      },
      // Ground: {
      //   height: 10,
      //   width: 10,
      //   // position: [0, 0, 0],
      // },
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
