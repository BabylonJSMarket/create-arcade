import { Player } from "../Shared/Player";
import { Terrain } from "../Shared/Terrain";

export default {
  entities: {
    ...Terrain,
    ...Player("Player", "Mario", [2, 32, 0], {
      KeyboardControl: {
        keyMap: {
          keyw: "forward",
          keys: "backward",
          keya: "left",
          keyd: "right",
        },
      },
    }),
    // ...Player("Player2", "Rogue", [2, 0, 0]),
  },
};
