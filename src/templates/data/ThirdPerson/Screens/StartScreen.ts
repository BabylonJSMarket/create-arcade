const options = [
  {
    label: "Play",
    action: "0.json",
  },
  {
    label: "Options",
    action: "options.json",
  },
];

export const StartScreen = {
  entities: {
    GamesMenu: {
      components: {
        FollowCamera: {
          offset: 6,
          detachControl: true,
        },
        Movement: {
          position: [-1, 0, -1],
          rotation: [0, 1, 0],
        },
        Background: {
          clearColor: [0.2, 0.2, 0.2],
        },
        GamesMenuGUI: {
          options,
        },
        VideoTexture: {
          src: "/Assets/Videos/Arcade-Infinity.mp4",
          loop: true,
          autoplay: true,
        },
      },
    },
  },
};
