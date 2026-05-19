# create-arcade User Guide

A CLI tool for scaffolding BabylonJS games using the Arcade ECS (Entity-Component-System) framework. Similar to `create-react-app` but for 3D game development.

## Installation

No installation required. Run directly with your package manager:

```bash
npm create @babylonjsmarket/arcade@latest
```

Or install globally:

```bash
npm install -g @babylonjsmarket/create-arcade
```

Verify installation:

```bash
create-arcade --help
```

## Quick Start

```bash
# 1. Create a new project
npm create @babylonjsmarket/arcade@latest my-game

# 2. Navigate to project
cd my-game

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

Your game opens at `http://localhost:3000`

---

## Interactive Mode

Run without arguments for guided setup:

```bash
npm create @babylonjsmarket/arcade@latest
```

You'll be prompted for:

1. **Project name** - Directory name for your project
2. **Template** - Choose from available game templates
3. **Package name** - npm package name (auto-generated)

Example session:

```
◇  Project name:
│  my-awesome-game

◇  Select a framework:
│  ○ Empty 3D Scene
│  ● Third Person Template
│  ○ First Person Template
│  ○ Full Arcade Game (from my-arcade)

◆  Scaffolding project in /path/to/my-awesome-game...

Done. Now run:

  cd my-awesome-game
  npm install
  npm run dev
```

---

## Command Line Options

### Specify Project Name

```bash
npm create @babylonjsmarket/arcade@latest my-game
```

### Specify Template

```bash
npm create @babylonjsmarket/arcade@latest my-game --template ThirdPerson
```

### Create in Current Directory

```bash
npm create @babylonjsmarket/arcade@latest .
```

### Overwrite Existing Directory

```bash
npm create @babylonjsmarket/arcade@latest my-game --overwrite
```

### Show Help

```bash
npm create @babylonjsmarket/arcade@latest --help
```

Output:

```
Usage: create-arcade [OPTION]... [DIRECTORY]

Create a new BabylonJS Arcade project in JavaScript or TypeScript.

With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
  ThirdPerson     ThirdPerson
  FirstPerson     FirstPerson
```

---

## Available Templates

### Empty 3D Scene (`empty-3d`)

Minimal BabylonJS setup without ECS.

```bash
npm create @babylonjsmarket/arcade@latest my-game --template empty-3d
```

Includes:
- Basic scene with camera and light
- Ground plane and sample box
- No ECS framework (raw BabylonJS)

### Third Person Template (`ThirdPerson`)

Pre-configured for third-person games.

```bash
npm create @babylonjsmarket/arcade@latest my-game --template ThirdPerson
```

Includes:
- `PlayerComponent` - Speed and rotation settings
- `CameraFollowComponent` - Follow target with distance/height
- `PlayerMovementSystem` - WASD movement
- `CameraFollowSystem` - Smooth camera tracking
- Sample environment with ground

### First Person Template (`FirstPerson`)

Pre-configured for FPS-style games.

```bash
npm create @babylonjsmarket/arcade@latest my-game --template FirstPerson
```

Includes:
- `FPSControllerComponent` - Move speed, look speed, jump
- `WeaponComponent` - Damage and fire rate
- `FPSMovementSystem` - WASD + mouse look
- Collision detection enabled
- Sample level with walls
- Pointer lock for mouse capture

### Full Arcade (`full-arcade`)

Complete arcade game from the my-arcade template.

```bash
npm create @babylonjsmarket/arcade@latest my-game --template full-arcade
```

Includes:
- Full my-arcade source code
- Selectable game data folders
- Scripts and build configuration
- Requires `npm link @babylonjsmarket/arcade`

---

## Project Structure

After scaffolding, your project contains:

```
my-game/
├── src/
│   ├── main.ts                 # Game entry point
│   └── lib/ECS/
│       ├── Component.ts        # Base component class
│       ├── Entity.ts           # Entity (extends Mesh)
│       ├── System.ts           # Base system class
│       ├── World.ts            # ECS world container
│       └── index.ts            # Exports
├── public/                     # Static assets (images, models)
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.js              # Vite dev server config
├── .gitignore
└── README.md
```

---

## ECS Framework

### Component

Data container attached to entities:

```typescript
import { Component } from "./lib/ECS/index.js";

export class HealthComponent extends Component {
  health: number = 100;
  maxHealth: number = 100;
}
```

### Entity

Game object that holds components:

```typescript
const player = world.createEntity("Player");
player.addComponent(new HealthComponent());
player.addComponent(new PlayerComponent());

// Get component
const health = player.getComponent(HealthComponent);
health.health -= 10;

// Check for component
if (player.hasComponent(WeaponComponent)) {
  // ...
}
```

### System

Logic that processes entities with specific components:

```typescript
import { System, Entity, World } from "./lib/ECS/index.js";

export class HealthSystem extends System {
  constructor(world: World) {
    super(world, [HealthComponent]);
  }

  loadEntity(entity: Entity): void {
    console.log("Entity loaded:", entity.name);
  }

  processEntity(entity: Entity, deltaTime: number): void {
    const health = entity.getComponent(HealthComponent);
    if (health.health <= 0) {
      // Handle death
    }
  }
}
```

### World

Container for entities and scene:

```typescript
const world = new World(scene);

// Create entities
const player = world.createEntity("Player");
const enemy = world.createEntity("Enemy");

// Query entities by components
const healthyEntities = world.entitiesWith([HealthComponent]);
```

---

## Development Workflow

### Start Dev Server

```bash
npm run dev
```

Opens at `http://localhost:3000` with hot reload.

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Package Manager Support

### npm

```bash
npm create @babylonjsmarket/arcade@latest my-game
cd my-game
npm install
npm run dev
```

### Yarn

```bash
yarn create @babylonjsmarket/arcade my-game
cd my-game
yarn
yarn dev
```

### pnpm

```bash
pnpm create @babylonjsmarket/arcade my-game
cd my-game
pnpm install
pnpm run dev
```

### Bun

```bash
bun create @babylonjsmarket/arcade my-game
cd my-game
bun install
bun run dev
```

---

## Examples

### Create a Third Person Platformer

```bash
# Create project
npm create @babylonjsmarket/arcade@latest platformer --template ThirdPerson
cd platformer
npm install

# Start developing
npm run dev
```

Then modify `src/main.ts` to add:
- Platform meshes
- Jump mechanics in PlayerMovementSystem
- Collectibles with new components

### Create an FPS Game

```bash
npm create @babylonjsmarket/arcade@latest my-fps --template FirstPerson
cd my-fps
npm install
npm run dev
```

Then extend with:
- Shooting mechanics in WeaponSystem
- Enemy AI components
- Health pickups

### Non-Interactive CI/CD

```bash
# Create without prompts
npm create @babylonjsmarket/arcade@latest game \
  --template ThirdPerson \
  --overwrite

cd game
npm install
npm run build
```

---

## Troubleshooting

### "Directory is not empty"

Choose one of:
- **Cancel** - Stop and manually clear directory
- **Remove existing files** - Clear and continue
- **Ignore files** - Merge with existing

Or use `--overwrite` flag:

```bash
npm create @babylonjsmarket/arcade@latest my-game --overwrite
```

### Invalid Template Name

If template doesn't exist:

```
"invalid-template" isn't a valid template. Please choose from below:
```

Use one of: `empty-3d`, `ThirdPerson`, `FirstPerson`, `full-arcade`

### Port 3000 in Use

Edit `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3001,  // Change port
  },
});
```

### TypeScript Errors

Ensure you have TypeScript 5.x:

```bash
npm install typescript@latest --save-dev
```

---

## Screenshots

| Image | Description |
|-------|-------------|
| `template-selector.png` | Interactive CLI template selection |
| `third-person-demo.png` | Third Person template running |
| `first-person-demo.png` | First Person template with FPS controls |
| `project-structure.png` | Generated project in VS Code |
