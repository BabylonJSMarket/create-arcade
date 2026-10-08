# create-arcade

CLI tool for scaffolding a BabylonJS game project on the `@babylonjsmarket/ecs`
framework and the `@babylonjsmarket/arcade` component library.

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
| `--overwrite` | Overwrite existing directory |
| `-h, --help` | Show help message |

There is no `--template` flag — every scaffold produces the same default
project (see below).

## One Default Scaffold

Every project starts as a **multigame arcade**: a carpeted room with a row of
cabinets that you grow into a full arcade. Scenes are TypeScript modules that
declare entities and their components *by name*; each name is a folder in
`src/components/`, loaded the first time a scene uses it. You don't choose a template — you pull in
the code you need afterward.

## Adding Components (download, free or paid)

| Source | How |
|--------|-----|
| The core set (free) | Downloaded into `src/components/` when the project is created, no login; `npx arcade core` re-fetches missing files |
| BabylonJS Market | `bjs download <Name>` — more components, free or paid |

Both land as editable source in `src/components/<Name>/`; `src/registry.ts`
registers every folder there by name.

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
│   ├── main.ts                 # Boot: BabylonAdapter → ArcadeGame → loadScene → start
│   ├── registry.ts             # Resolvers for HUD panels and custom components
│   └── scenes/
│       ├── index.ts            # The scene map (the multigame seam)
│       └── arcade-room.ts      # The starter room, as data
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
├── eslint.config.js
├── .claude/skills/babylonjsmarket/   # Claude Code skill (auto-discovered)
├── .gitignore
└── README.md
```

## What's Included

- **BabylonJS** — 3D engine (with loaders + Havok physics)
- **@babylonjsmarket/ecs** — Entity-Component-System framework
- **@babylonjsmarket/arcade** — `ArcadeGame`, viz mount, keyboard input + the scaffolder CLI
- **The core components** — 35 free components (meshes, lights, cameras, physics, scoring, …) downloaded into `src/components/`
- **TypeScript** — type-safe development
- **Vite** — fast dev server and build (with the Solid plugin for viz panels)
- **ESLint** — `@babylonjsmarket/eslint-plugin` framework rules

## Configuration

- **Dev server**: `http://localhost:3000`
- **Build output**: `dist/`
- **Node.js**: 18.x, 20.x, or 22.x+
