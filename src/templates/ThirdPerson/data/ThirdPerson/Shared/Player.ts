// import Actions from "./Actions";

export const Player = (
  name: string = "Player",
  src: string = "Barbarian",
  spawnAt = [0, 15, 0],
  etc = {},
) => {
  return {
    [name]: {
      components: {
        Mesh: {
          name: name,
          src: `/Assets/Meshes/${src}.glb`,
          rotation: [0, 0, 0],
        },
        Debug: {
          bgAlpha: 1,
          bgColor: name == "Player" ? "DarkRed" : "DarkGreen",
        },
        Movement: {
          position: spawnAt,
          walkingSpeed: 40,
          runningSpeed: 5,
          jumpingSpeed: 5,
          maxWalkSpeed: 10,
          maxRunSpeed: 20,
          rotationSpeed: 100,
        },
        PlayerInput: {
          type: "keyboard",
          adjustWithView: true,
          actionMap: {
            forward: "Moving_Forward",
            backward: "Moving_Backward",
            left: "Moving_Left",
            right: "Moving_Right",
            spacebar: "Jump",
          },
        },
        Animation: {
          startingAnimation: "Idle_A",
          moveAnimation: "Running_A",
          loopMap: {
            Idle: true,
            Running: true,
            Jumping: true,
          },
        },
        ...etc,
      },
    },
  };
};
