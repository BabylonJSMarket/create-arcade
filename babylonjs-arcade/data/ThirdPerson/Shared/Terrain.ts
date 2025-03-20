export const Terrain = {
  Terrain: {
    components: {
      Movement: {
        stationary: true,
      },
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
