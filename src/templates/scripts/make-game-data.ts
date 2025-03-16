import path from "path";
import fs from "fs";

const DATA_DIR = path.resolve(process.cwd(), "data");
const GAMES_DIR = path.resolve(DATA_DIR);
const PUB_GAME_DIR = "public/GameData";
const OUTPUT_DIR = path.resolve(process.cwd(), PUB_GAME_DIR);
const LEVEL_DIR = "scenes";

const MakeGameData = async (GAME_DIR: string) => {
  const GAME = path.resolve(GAMES_DIR, GAME_DIR);
  if (GAME_DIR[0] == ".") return;
  console.log("Making: ", GAME_DIR);
  const scenes = fs.readdirSync(path.resolve(GAME, LEVEL_DIR));
  for (const scene of scenes) {
    const sceneFile = path.resolve(GAME, LEVEL_DIR, scene);
    console.log("--  Input: ", ["data", GAME_DIR, LEVEL_DIR, scene].join("/"));
    const mod = await import(sceneFile);
    const sceneData = mod.default;
    const dirPath = path.resolve(GAME_DIR, LEVEL_DIR);
    const jsonFile = `${scene.replace(".ts", "")}.json`;
    const outputFileName = path.resolve(dirPath, jsonFile);
    console.log(
      "-- Output: ",
      [PUB_GAME_DIR, GAME_DIR, LEVEL_DIR, jsonFile].join("/"),
    );
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    const data = JSON.stringify(sceneData, null, 2);
    fs.writeFileSync(outputFileName, data);
  }
};

const AllGameData = async () => {
  const games = fs.readdirSync(GAMES_DIR);
  for (const game of games) await MakeGameData(game);
};

await AllGameData();
process.exit(0);
