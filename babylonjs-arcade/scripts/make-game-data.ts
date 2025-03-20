import path from "path";
import fs from "fs";

// --- Path Variables ---
const CWD = process.cwd();
const DATA_DIR = path.resolve(CWD, "data");
const GAMES_DIR = DATA_DIR;
const PUB_GAME_SUBDIR = "public/GameData";
const OUTPUT_DIR = path.resolve(CWD, PUB_GAME_SUBDIR);
const LEVEL_DIR_NAME = "scenes";

// --- Utility Functions ---
const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// --- Core Logic ---
const processScene = async (gameDir: string, sceneFile: string) => {
  const inputPathParts = ["data", gameDir, LEVEL_DIR_NAME, sceneFile];
  console.log("-- Input: ", inputPathParts.join("/"));

  const sceneFilePath = path.resolve(
    GAMES_DIR,
    gameDir,
    LEVEL_DIR_NAME,
    sceneFile,
  );
  const mod = await import(sceneFilePath);
  const sceneData = mod.default;

  const outputDir = path.resolve(OUTPUT_DIR, gameDir, LEVEL_DIR_NAME);
  ensureDirExists(outputDir);

  const jsonFileName = sceneFile.replace(".ts", ".json");
  const outputFilePath = path.resolve(outputDir, jsonFileName);
  const outputPathParts = [
    PUB_GAME_SUBDIR,
    gameDir,
    LEVEL_DIR_NAME,
    jsonFileName,
  ];
  console.log("-- Output: ", outputPathParts.join("/"));

  const data = JSON.stringify(sceneData, null, 2);
  fs.writeFileSync(outputFilePath, data);
};

const MakeGameData = async (gameDir: string) => {
  const gamePath = path.resolve(GAMES_DIR, gameDir);
  if (gameDir.startsWith(".")) {
    return;
  }
  console.log("Making: ", gameDir);

  const levelDirPath = path.resolve(gamePath, LEVEL_DIR_NAME);
  try {
    const scenes = fs.readdirSync(levelDirPath);
    for (const scene of scenes) {
      await processScene(gameDir, scene);
    }
  } catch (error) {
    console.error(`Error processing game directory "${gameDir}":, error`);
  }
};

const AllGameData = async () => {
  try {
    const games = fs.readdirSync(GAMES_DIR);
    for (const game of games) {
      await MakeGameData(game);
    }
  } catch (error) {
    console.error("Error reading games directory:", error);
    throw error;
  }
};

// --- Main Execution ---
AllGameData()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
