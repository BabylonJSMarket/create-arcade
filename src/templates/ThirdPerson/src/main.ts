// File: main.ts
import { Database, Engine, Scene } from "@babylonjs/core";
import { World } from "./lib/ECS";
import "@babylonjs/core/Debug/debugLayer"; // Import the debug layer
import "@babylonjs/inspector"; // Import the inspector
// import { EntityInspector } from "./lib/EntityInspector";

export class Game {
  public world: World;
  public engine: Engine;

  constructor(engine: Engine, gameName: string, level: string) {
    const scene = new Scene(engine);
    this.world = new World(scene);
    this.world.loadSceneData(level, gameName);
    return this;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Ensure the DOM is fully loaded before attempting to access the canvas
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Adjust the ID as needed
  const engine = new Engine(canvas, true, {
    deterministicLockstep: true,
    lockstepMaxSteps: 4,
    stencil: true,
  });

  // Create the game instance and initialize the scene
  const params = new URLSearchParams(location.search);
  const gameName = params.get("game") || "Arcade";
  const level = params.get("scene") || params.get("level") || "0";
  const game = new Game(engine, gameName, level);

  engine.enableOfflineSupport = true;
  Database.IDBStorageEnabled = true;

  let lastTime = performance.now();

  engine.runRenderLoop(() => {
    const scene = game.world.currentScene;
    if (!scene || !scene.isReady()) return;

    // Calculate deltaTime in seconds
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000.0;
    lastTime = now;
    game.world.updateSystems(deltaTime);
    if (scene.activeCamera) scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
});
