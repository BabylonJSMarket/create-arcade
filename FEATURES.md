# create-arcade

CLI tool for scaffolding BabylonJS games using the Arcade ECS framework.

## TLDR / Quick Start

```bash
npm create @babylonjsmarket/arcade@latest
cd my-game
npm install
npm run dev
```

## Command Options

| Option | Description |
|--------|-------------|
| `<directory>` | Project directory name |
| `-t, --template <name>` | Use a specific template |
| `--overwrite` | Overwrite existing directory |
| `-h, --help` | Show help message |

## Available Templates

| Template | Description |
|----------|-------------|
| `empty-3d` | Minimal BabylonJS scene with ECS |
| `ThirdPerson` | Third-person camera and player movement |
| `FirstPerson` | FPS controller with collision detection |
| `full-arcade` | Complete arcade game from my-arcade template |

## Package Manager Support

```bash
# npm
npm create @babylonjsmarket/arcade@latest

# yarn
yarn create @babylonjsmarket/arcade

# pnpm
pnpm create @babylonjsmarket/arcade

# bun
bun create @babylonjsmarket/arcade
```

## Project Structure Created

```
my-game/
├── src/
│   ├── main.ts           # Entry point
│   └── lib/ECS/          # Entity-Component-System
│       ├── Component.ts
│       ├── Entity.ts
│       ├── System.ts
│       ├── World.ts
│       └── index.ts
├── public/               # Static assets
├── index.html            # HTML entry
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.js        # Vite config
├── .gitignore
└── README.md
```

## What's Included

- **BabylonJS 8.x** - 3D engine
- **TypeScript** - Type-safe development
- **Vite** - Fast dev server and build
- **ECS Framework** - Entity-Component-System pattern

## Screenshots

> Image placeholders for future screenshots

### template-selector.png
Interactive CLI showing template selection prompt

### third-person-demo.png
Running Third Person template with player and camera

### first-person-demo.png
First Person template with FPS controls

## Configuration

- **Dev server**: `http://localhost:3000`
- **Build output**: `dist/`
- **Node.js**: 18.x, 20.x, or 22.x+
