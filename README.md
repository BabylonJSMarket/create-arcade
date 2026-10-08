# @babylonjsmarket/create-arcade

A thin forwarder so `npm create @babylonjsmarket/arcade` keeps working — the
scaffolder itself ships inside `@babylonjsmarket/arcade` and is invoked here as
its `init` subcommand. It scaffolds a BabylonJS game project built on the
`@babylonjsmarket/ecs` framework and the `@babylonjsmarket/arcade` component
library.

## Quick Start

```bash
npm create @babylonjsmarket/arcade@latest
```

Or with specific package managers:

```bash
# yarn
yarn create @babylonjsmarket/arcade

# pnpm
pnpm create @babylonjsmarket/arcade

# bun
bun create @babylonjsmarket/arcade
```

## Usage

### Interactive Mode

Run the create command and follow the prompts:

```bash
npm create @babylonjsmarket/arcade@latest
```

You'll be asked for:
1. A project name.
2. A package name (only when the project name isn't a valid package name).

There is **no template selection** — every scaffold produces the same default
project (see below).

### Command Line Options

```bash
# Create in a named directory
npm create @babylonjsmarket/arcade@latest my-game

# Create in the current directory
npm create @babylonjsmarket/arcade@latest .

# Overwrite an existing directory
npm create @babylonjsmarket/arcade@latest my-game --overwrite
```

## One Default Scaffold

Every project starts as a data-driven **multigame arcade**: a carpeted room with
a row of cabinets that you grow into a full arcade. Scenes are TypeScript
modules that declare entities and their components *by name*; each name is a
folder in `src/components/`, loaded the first time a scene uses it. Each cabinet can
point a player at another scene registered in `src/scenes/index.ts`.

You don't pick a template up front. You start from this one project and pull in
the code you actually need.

## Components

Every component is editable source under `src/components/<Name>/`, and
`src/registry.ts` picks each folder up by name.

- **The core set** — meshes, lights, cameras, input, physics, scoring and the
  rest the starter scenes use. It is free and is **downloaded when the project
  is created** (no login). If that download fails, or you passed `--no-core`,
  run `npx arcade core` in the project after `npm install`. Re-running it only
  fills in missing files. Offline, `--core-from <CodeLibrary dir>` copies the
  set from a local library checkout.
- **BabylonJS Market** — download more components (free or paid) from
  [babylonjsmarket.com](https://babylonjsmarket.com) with `bjs download <Name>`.
  They land in the same folder.

## Project Structure

After scaffolding, your project will have:

```
my-game/
├── src/
│   ├── main.ts                 # Boot: BabylonAdapter → ArcadeGame → loadScene → start
│   ├── components/             # The core set, plus anything you download or write
│   ├── registry.ts             # Registers every folder in components/ by name
│   └── scenes/
│       ├── index.ts            # The scene map (the multigame seam)
│       └── arcade-room.ts      # The starter room, as data
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## What's Included

Every project comes with:
- **@babylonjsmarket/ecs** — the ECS framework
- **@babylonjsmarket/arcade** — the free component library + CLI
- **BabylonJS** — 3D engine, loaders, and Havok physics
- **TypeScript** — type-safe development
- **Vite** — fast dev server and build
- **ESLint** — `@babylonjsmarket/eslint-plugin` framework rules

## Development

```bash
cd my-game
npm install
npm run dev      # http://localhost:3000
```

## Building for Production

```bash
npm run build    # outputs to dist/
```

## Learn More

- [BabylonJS Market](https://babylonjsmarket.com)
- [BabylonJS Documentation](https://doc.babylonjs.com/)
- [Entity-Component-System Pattern](https://en.wikipedia.org/wiki/Entity_component_system)

## License

MIT © BabylonJS Market
