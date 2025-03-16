import { Scene, Engine } from "@babylonjs/core";
import { World } from "../DECS";

export class GAME {
    private world: World;
    private sceneManager: SceneManager;

    constructor(engine: Engine, gameName: string, level: string) {
        const scene = new Scene(engine);
        this.world = new World(scene);
        this.world.loadSceneData(level, gameName);
        return this;
    }
}
