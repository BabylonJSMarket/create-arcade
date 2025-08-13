#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";
import { fileURLToPath } from "node:url";
import mri from "mri";
import * as prompts from "@clack/prompts";
import SETUP_OPTIONS from "./setup-options.ts";

import colors from "picocolors";

const {
  blue,
  blueBright,
  cyan,
  green,
  greenBright,
  magenta,
  red,
  redBright,
  reset,
  yellow,
} = colors;

const argv = mri<{
  template?: string;
  help?: boolean;
  overwrite?: boolean;
}>(process.argv.slice(2), {
  alias: { h: "help", t: "template" },
  boolean: ["help", "overwrite"],
  string: ["template"],
});
const cwd = process.cwd();

// prettier-ignore
const helpMessage = `\
Usage: create-arcade [OPTION]... [DIRECTORY]

Create a new BabylonJS Arcade project in JavaScript or TypeScript.

With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${yellow    ('ThirdPerson     ThirdPerson'  )}
${green     ('FirstPerson      FirstPerson' )}
${cyan      (''    )}
${cyan      ('')}
${magenta   (''   )}
${redBright (''      )}
${red       (''   )}
${blue      (''    )}
${blueBright(''     )}`

const TEMPLATES = SETUP_OPTIONS.reduce((a, b) => a.concat(b), []);

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

const defaultTargetDir = "babylonjs-arcade";

async function init() {
  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined;
  const argTemplate = argv.template;
  const argOverwrite = argv.overwrite;

  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const cancel = () => prompts.cancel("Operation cancelled");

  // 1. Get project name and target dir
  let targetDir = argTargetDir;
  if (!targetDir) {
    const projectName = await prompts.text({
      message: "Project name:",
      defaultValue: defaultTargetDir,
      placeholder: defaultTargetDir,
    });
    if (prompts.isCancel(projectName)) return cancel();
    targetDir = formatTargetDir(projectName as string);
  }

  // 2. Handle directory if exist and not empty
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = argOverwrite
      ? "yes"
      : await prompts.select({
          message:
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Please choose how to proceed:`,
          options: [
            {
              label: "Cancel operation",
              value: "no",
            },
            {
              label: "Remove existing files and continue",
              value: "yes",
            },
            {
              label: "Ignore files and continue",
              value: "ignore",
            },
          ],
        });
    if (prompts.isCancel(overwrite)) return cancel();
    switch (overwrite) {
      case "yes":
        emptyDir(targetDir);
        break;
      case "no":
        cancel();
        return;
    }
  }

  // 3. Get package name
  let packageName = path.basename(path.resolve(targetDir));
  if (!isValidPackageName(packageName)) {
    const packageNameResult = await prompts.text({
      message: "Package name:",
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate(dir) {
        if (!isValidPackageName(dir)) {
          return "Invalid package.json name";
        }
      },
    });
    if (prompts.isCancel(packageNameResult)) return cancel();
    packageName = packageNameResult;
  }

  // 4. Choose a framework and variant
  let template = argTemplate;
  let hasInvalidArgTemplate = false;
  if (argTemplate && !TEMPLATES.includes(argTemplate)) {
    template = undefined;
    hasInvalidArgTemplate = true;
  }
  if (!template) {
    const framework = await prompts.select({
      message: hasInvalidArgTemplate
        ? `"${argTemplate}" isn't a valid template. Please choose from below: `
        : "Select a framework:",
      options: SETUP_OPTIONS.map((framework) => {
        const frameworkColor = framework.color;
        return {
          label: frameworkColor(framework.display || framework.name),
          value: framework,
        };
      }),
    });
    if (prompts.isCancel(framework)) return cancel();
    template = framework.name;
  }

  const root = path.join(cwd, targetDir);
  fs.mkdirSync(root, { recursive: true });

  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  const { customCommand } =
    SETUP_OPTIONS.find((v) => v.name === template) ?? {};

  if (customCommand) {
    const fullCustomCommand = getFullCustomCommand(customCommand, pkgInfo);

    const [command, ...args] = fullCustomCommand.split(" ");
    // we replace TARGET_DIR here because targetDir may include a space
    const replacedArgs = args.map((arg) =>
      arg.replace("TARGET_DIR", () => targetDir),
    );
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: "inherit",
    });
    process.exit(status ?? 0);
  }

  prompts.log.step(`Scaffolding project in ${root}...`);

  // Generate project structure
  const write = (file: string, content: string) => {
    const targetPath = path.join(root, file);
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, content);
  };

  // Create package.json
  const pkg = {
    name: packageName,
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview"
    },
    dependencies: {
      "@babylonjsmarket/arcade": "^1.0.0",
      "@babylonjs/core": "^8.0.0",
      "@babylonjs/materials": "^8.0.0",
      "@babylonjs/inspector": "^8.0.0",
      "@babylonjs/loaders": "^8.0.0",
      "@babylonjs/gui": "^8.0.0"
    },
    devDependencies: {
      "typescript": "^5.8.3",
      "vite": "^5.0.0"
    }
  };

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  // Create vite.config.js
  const viteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@babylonjs/core', '@babylonjs/materials', '@babylonjs/loaders', '@babylonjs/gui', '@babylonjs/inspector']
  }
});
`;
  write("vite.config.js", viteConfig);

  // Create tsconfig.json
  const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`;
  write("tsconfig.json", tsConfig);

  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BabylonJS Arcade Game</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        width: 100vw;
        height: 100vh;
      }
      #renderCanvas {
        width: 100%;
        height: 100%;
        touch-action: none;
      }
    </style>
  </head>
  <body>
    <canvas id="renderCanvas"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
  write("index.html", indexHtml);

  // Create main.ts based on template
  let mainTs: string;
  
  if (template === "ThirdPerson") {
    mainTs = generateThirdPersonTemplate();
  } else if (template === "FirstPerson") {
    mainTs = generateFirstPersonTemplate();
  } else {
    mainTs = generateDefaultTemplate();
  }
  
  write("src/main.ts", mainTs);

  // Create .gitignore
  const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;
  write(".gitignore", gitignore);

  // Create README.md
  const readme = `# ${packageName}

A BabylonJS game built with the Arcade ECS framework.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Project Structure

- \`src/main.ts\` - Main entry point
- \`src/components/\` - ECS Components
- \`src/systems/\` - ECS Systems
- \`src/entities/\` - Game entities

## Documentation

For more information about the Arcade ECS framework, visit:
[https://github.com/babylonjsmarket/arcade](https://github.com/babylonjsmarket/arcade)
`;
  write("README.md", readme);

  let doneMessage = "";
  const cdProjectName = path.relative(cwd, root);
  doneMessage += `Done. Now run:\n`;
  if (root !== cwd) {
    doneMessage += `\n  cd ${
      cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
    }`;
  }
  switch (pkgManager) {
    case "yarn":
      doneMessage += "\n  yarn";
      doneMessage += "\n  yarn dev";
      break;
    default:
      doneMessage += `\n  ${pkgManager} install`;
      doneMessage += `\n  ${pkgManager} run dev`;
      break;
  }
  prompts.outro(doneMessage);
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, "");
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

interface PkgInfo {
  name: string;
  version: string;
}

function pkgFromUserAgent(userAgent: string | undefined): PkgInfo | undefined {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

function editFile(file: string, callback: (content: string) => string) {
  const content = fs.readFileSync(file, "utf-8");
  fs.writeFileSync(file, callback(content), "utf-8");
}

function getFullCustomCommand(customCommand: string, pkgInfo?: PkgInfo) {
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");

  return (
    customCommand
      .replace(/^npm create /, () => {
        // `bun create` uses it's own set of templates,
        // the closest alternative is using `bun x` directly on the package
        if (pkgManager === "bun") {
          return "bun x create-";
        }
        return `${pkgManager} create `;
      })
      // Only Yarn 1.x doesn't support `@version` in the `create` command
      .replace("@latest", () => (isYarn1 ? "" : "@latest"))
      .replace(/^npm exec/, () => {
        // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
        if (pkgManager === "pnpm") {
          return "pnpm dlx";
        }
        if (pkgManager === "yarn" && !isYarn1) {
          return "yarn dlx";
        }
        if (pkgManager === "bun") {
          return "bun x";
        }
        // Use `npm exec` in all other cases,
        // including Yarn 1.x and other custom npm clients.
        return "npm exec";
      })
  );
}

function generateDefaultTemplate(): string {
  return `import { Engine, Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder } from "@babylonjs/core";
import { World, Entity, Component, System } from "@babylonjsmarket/arcade";

// Example component
export class PositionComponent extends Component {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

// Example system
export class MovementSystem extends System {
  constructor(world: World) {
    super(world, [PositionComponent]);
  }

  loadEntity(entity: Entity): void {
    console.log("Loading entity:", entity.name);
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const position = entity.getComponent(PositionComponent);
    // Update position logic here
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  
  // Create camera and light
  const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  
  // Create ground
  const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
  
  // Initialize the ECS World
  const world = new World(scene);
  
  // Create an entity with components
  const player = world.createEntity("Player");
  player.addComponent(new PositionComponent());
  
  // Add systems
  const movementSystem = new MovementSystem(world);
  
  // Load systems
  await movementSystem.load();
  
  // Game loop
  let lastTime = performance.now();
  engine.runRenderLoop(() => {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000.0;
    lastTime = now;
    
    // Update systems
    movementSystem.update(deltaTime);
    
    scene.render();
  });
  
  window.addEventListener("resize", () => {
    engine.resize();
  });
});
`;
}

function generateThirdPersonTemplate(): string {
  return `import { Engine, Scene, UniversalCamera, HemisphericLight, Vector3, MeshBuilder, Color3 } from "@babylonjs/core";
import { World, Entity, Component, System } from "@babylonjsmarket/arcade";

// Player component
export class PlayerComponent extends Component {
  speed: number = 5;
  rotationSpeed: number = 0.05;
}

// Camera follow component
export class CameraFollowComponent extends Component {
  target: Entity | null = null;
  distance: number = 10;
  height: number = 5;
}

// Player movement system
export class PlayerMovementSystem extends System {
  constructor(world: World) {
    super(world, [PlayerComponent]);
  }

  loadEntity(entity: Entity): void {
    // Setup player controls
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const player = entity.getComponent(PlayerComponent);
    // Handle WASD movement
  }
}

// Camera follow system
export class CameraFollowSystem extends System {
  constructor(world: World) {
    super(world, [CameraFollowComponent]);
  }

  loadEntity(entity: Entity): void {
    // Setup camera
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const cameraFollow = entity.getComponent(CameraFollowComponent);
    // Update camera position to follow target
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  
  // Create camera
  const camera = new UniversalCamera("camera", new Vector3(0, 10, -20), scene);
  camera.setTarget(Vector3.Zero());
  
  // Create light
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  
  // Create environment
  const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
  
  // Create player mesh
  const playerMesh = MeshBuilder.CreateBox("player", { size: 1 }, scene);
  playerMesh.position.y = 0.5;
  
  // Initialize the ECS World
  const world = new World(scene);
  
  // Create player entity
  const player = world.createEntity("Player");
  player.addComponent(new PlayerComponent());
  
  // Create camera entity
  const cameraEntity = world.createEntity("Camera");
  const cameraFollow = new CameraFollowComponent();
  cameraFollow.target = player;
  cameraEntity.addComponent(cameraFollow);
  
  // Add systems
  const playerMovementSystem = new PlayerMovementSystem(world);
  const cameraFollowSystem = new CameraFollowSystem(world);
  
  // Load systems
  await playerMovementSystem.load();
  await cameraFollowSystem.load();
  
  // Game loop
  let lastTime = performance.now();
  engine.runRenderLoop(() => {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000.0;
    lastTime = now;
    
    // Update systems
    playerMovementSystem.update(deltaTime);
    cameraFollowSystem.update(deltaTime);
    
    scene.render();
  });
  
  window.addEventListener("resize", () => {
    engine.resize();
  });
});
`;
}

function generateFirstPersonTemplate(): string {
  return `import { Engine, Scene, UniversalCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import { World, Entity, Component, System } from "@babylonjsmarket/arcade";

// FPS Controller component
export class FPSControllerComponent extends Component {
  moveSpeed: number = 10;
  lookSpeed: number = 0.002;
  jumpHeight: number = 5;
  isGrounded: boolean = true;
}

// Weapon component
export class WeaponComponent extends Component {
  damage: number = 10;
  fireRate: number = 0.5;
  lastFireTime: number = 0;
}

// FPS movement system
export class FPSMovementSystem extends System {
  private camera: UniversalCamera;
  private keys: { [key: string]: boolean } = {};
  
  constructor(world: World) {
    super(world, [FPSControllerComponent]);
  }

  loadEntity(entity: Entity): void {
    // Setup keyboard controls
    window.addEventListener("keydown", (e) => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", (e) => this.keys[e.key.toLowerCase()] = false);
    
    // Setup mouse look
    const canvas = this.world.currentScene.getEngine().getRenderingCanvas();
    canvas?.addEventListener("click", () => {
      canvas.requestPointerLock();
    });
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const controller = entity.getComponent(FPSControllerComponent);
    
    // Handle WASD movement
    const moveVector = Vector3.Zero();
    if (this.keys['w']) moveVector.z = 1;
    if (this.keys['s']) moveVector.z = -1;
    if (this.keys['a']) moveVector.x = -1;
    if (this.keys['d']) moveVector.x = 1;
    
    // Apply movement
    // Note: In a real implementation, you'd move the camera based on moveVector
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  
  // Create FPS camera
  const camera = new UniversalCamera("fpsCamera", new Vector3(0, 1.8, -5), scene);
  camera.setTarget(new Vector3(0, 1.8, 0));
  camera.attachControl(canvas, true);
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(0.5, 1, 0.5);
  camera.minZ = 0.1;
  camera.speed = 0.5;
  camera.angularSensibility = 1000;
  
  // Create light
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  
  // Create environment
  const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  ground.checkCollisions = true;
  
  const groundMaterial = new StandardMaterial("groundMat", scene);
  groundMaterial.diffuseColor = new Color3(0.3, 0.5, 0.3);
  ground.material = groundMaterial;
  
  // Create some walls
  for (let i = 0; i < 5; i++) {
    const wall = MeshBuilder.CreateBox(\`wall\${i}\`, { width: 10, height: 3, depth: 0.5 }, scene);
    wall.position.x = Math.random() * 40 - 20;
    wall.position.z = Math.random() * 40 - 20;
    wall.position.y = 1.5;
    wall.checkCollisions = true;
  }
  
  // Initialize the ECS World
  const world = new World(scene);
  
  // Create player entity
  const player = world.createEntity("Player");
  player.addComponent(new FPSControllerComponent());
  player.addComponent(new WeaponComponent());
  
  // Add systems
  const fpsMovementSystem = new FPSMovementSystem(world);
  
  // Load systems
  await fpsMovementSystem.load();
  
  // Game loop
  let lastTime = performance.now();
  engine.runRenderLoop(() => {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000.0;
    lastTime = now;
    
    // Update systems
    fpsMovementSystem.update(deltaTime);
    
    scene.render();
  });
  
  window.addEventListener("resize", () => {
    engine.resize();
  });
});
`;
}

init().catch((e) => {
  console.error(e);
});
