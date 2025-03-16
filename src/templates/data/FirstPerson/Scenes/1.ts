import { Player } from "../Shared/Player";
import { Terrain } from "../Shared/Terrain";

export default {
  entities: {
    ...Terrain,
    ...Player("Player", "Barbarian"),
  },
};
