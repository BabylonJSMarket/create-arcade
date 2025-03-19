export const Terrain = {
  Terrain: {
    components: {
      Movement: {
        position: [0, -2, 0],
        stationary: true,
      },
      Mesh: {
        name: "Floor",
        src: "/Assets/Meshes/Level-1.glb",
      },
      FollowCamera: {
        offset: 14,
        target: "Player",
      },
      Debug: {},
      Background: {
        gravity: -1,
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
