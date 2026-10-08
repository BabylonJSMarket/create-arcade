# create-arcade User Guide

A CLI tool for scaffolding a BabylonJS game project built on the
`@babylonjsmarket/ecs` framework and the `@babylonjsmarket/arcade` component
library. Similar to `create-react-app`, but for 3D game development.

There is **no template menu**. Every scaffold produces the same starting point —
a data-driven **multigame arcade**. You grow it by authoring scenes and by
pulling ready-made components into your project (see
[Adding components](#adding-components-the-download-flow)).

## Installation

No installation required. Run directly with your package manager:

```bash
npm create @babylonjsmarket/arcade@latest
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

Your game opens at `http://localhost:3000`.

---

## Interactive Mode

Run without a directory argument for guided setup:

```bash
npm create @babylonjsmarket/arcade@latest
```

You'll be prompted for:

1. **Project name** — directory name for your project.
2. **Package name** — npm package name (only asked when the project name isn't a
   valid package name; otherwise auto-derived).

That's the whole prompt flow — there is no framework/template question. Example
session:

```
◇  Project name:
│  my-awesome-game

◆  Scaffolding project in /path/to/my-awesome-game...

Added .claude/skills/babylonjsmarket (Claude Code skill)

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
Usage: arcade init [OPTION]... [DIRECTORY]
   or: npm create @babylonjsmarket/arcade [DIRECTORY]

Create a new multigame BabylonJS arcade powered by @babylonjsmarket/ecs and
@babylonjsmarket/arcade.

With no arguments, start the CLI in interactive mode.

Options:
  -h, --help                 print this help message
      --overwrite            replace any existing files in the target directory
      --no-core              don't download the core components into
                             src/components (fetch them later with
                             npx arcade core)
      --core-from <dir>      copy the core components from a local library
                             checkout (a CodeLibrary folder) instead of
                             downloading them

Also:
  arcade core [DIRECTORY]    download the core components into an existing
                             project's src/components (fills in missing files,
                             never overwrites). Same --core-from option.
```

(Abridged: `--help` also lists `--kind`, `--renderer`, `--demo` and
`--new-project`.)

---

## The Default Scaffold

Every project starts as a **multigame arcade**: a carpeted room with a row of
cabinets that you grow into a full arcade. Scenes are TypeScript modules that
declare entities and their components *by name* (pure data); each name is a
folder in `src/components/`, loaded the first time a scene uses it. Each cabinet can point a player
at another scene (a subdirectory game) registered in `src/scenes/index.ts`.

The starter room streams its carpet textures and cabinet model from the public
BabylonJS Games asset host, so a fresh scaffold runs with **no local assets**.

---

## Project Structure

After scaffolding, your project contains:

```
my-game/
├── src/
│   ├── main.ts                 # Boot: BabylonAdapter → ArcadeGame → loadScene → start
│   ├── components/             # The core set, plus anything you download or write
│   ├── registry.ts             # Registers every folder in components/ by name
│   └── scenes/
│       ├── index.ts            # The scene map: every scene the arcade can load
│       └── arcade-room.ts      # The starter room — entities + components, as data
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.js              # Vite dev server config
├── eslint.config.js            # Flat ESLint config (@babylonjsmarket/eslint-plugin)
├── .claude/skills/babylonjsmarket/   # Claude Code skill (auto-discovered)
├── .gitignore
└── README.md
```

`.claude/skills/babylonjsmarket/` is dropped in automatically so Claude Code
discovers the framework skill in your project with no plugin install.

---

## How It Works

`src/main.ts` boots the renderer through the `BabylonAdapter`, mounts the viz
panels (press `` ` `` for the Entities panel, `F4` for the EventBus debugger),
then calls `game.loadScene(...)` with the default scene — that's it.

Everything else — meshes, lights, cameras, gameplay logic — is declared in the
scene modules as entities plus named components. Each of those components is a
folder in `src/components/` that `src/registry.ts` maps by name; bundlers
tree-shake any component a scene doesn't use. A component that needs engine
code the adapter lacks keeps it in `adapter/register.ts`, and `main.ts` globs
and registers those before the scene loads.

> For the component / system / world / scene-JSON API itself, see the
> **[ECS Framework](/tools/bjs-ecs)** and **[Arcade Foundations](/tools/bjs-arcade)**
> guides — those are the source of truth for the framework surface.

---

## Filling the Arcade

Each cabinet is meant to launch its own game. To add one:

1. Author a scene under `src/scenes/<my-game>.ts` (copy `arcade-room.ts`).
2. Import it in `src/scenes/index.ts` and add it under a new key.
3. Switch to it at runtime — `game.loadScene(SCENES['<my-game>'])` — e.g. when
   the player activates the matching cabinet.

To add a **custom** component, make a folder `src/components/MyThing/` with a
`MyThing.ts` exporting `MyThingComponent` (and optionally `MyThingSystem`).
`src/registry.ts` picks the folder up by name.

---

## Adding Components (the download flow)

You don't pick a template up front — you **pull in code on demand**. Every
component lands the same way: real source files in `src/components/<Name>/`
that you own and can edit, picked up by `src/registry.ts` by name.

### 1. The core set — downloaded at create time

The 35 core components (MeshPrimitive, Mesh, the lights and cameras, Physics,
Health, Score, Shadow, Skybox, Pool, Sound, …) are free. The scaffolder
downloads them into `src/components/` when it creates the project, with no
login. If that download failed, or you passed `--no-core`, fill them in later:

```bash
npx arcade core              # download any core component that is missing
```

It never overwrites a file, so your edits are safe. Your code imports these
components from the project copy — `./components/Score/Score.events` for event
names, `./components/Score/Score.defs` for classes — not from
`@babylonjsmarket/arcade`.

### 2. The BabylonJS Market — download more components

The marketplace at [babylonjsmarket.com](https://babylonjsmarket.com) carries
many more components. Some are **free**, some are **paid**. The
[`bjs` CLI](/tools/bjs-cli) puts one in your project:

```bash
bjs download <Name>          # lands in src/components/<Name>/
```

The same command fetches a fresh copy of any core component.

Either way, there's one default project and you grow it by downloading the
pieces you actually need — instead of committing to a fixed template at creation
time.

---

## Development Workflow

### Start Dev Server

```bash
npm run dev      # http://localhost:3000 with hot reload
```

### Build for Production

```bash
npm run build    # outputs to dist/
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint     # eslint src, enforcing the @babylonjsmarket framework rules
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

## Troubleshooting

### "Directory is not empty"

Choose one of:
- **Cancel operation** — stop and clear the directory yourself.
- **Remove existing files and continue** — clear and scaffold.
- **Ignore files and continue** — merge with the existing files.

Or skip the prompt with `--overwrite`:

```bash
npm create @babylonjsmarket/arcade@latest my-game --overwrite
```

### Port 3000 in Use

Edit `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3001,  // Change port
  },
});
```

### A scene says a component is missing

The core download probably failed or was skipped. Run `npx arcade core` in the
project (after `npm install`). Offline, `npx arcade core --core-from
<CodeLibrary dir>` copies the set from a local library checkout.

---

## Where to Go Next

- **[ECS Framework](/tools/bjs-ecs)** (`@babylonjsmarket/ecs`) — the runtime under everything this scaffold generates: entities, components, systems, the World, the EventBus.
- **[Arcade Foundations](/tools/bjs-arcade)** (`@babylonjsmarket/arcade`) — `ArcadeGame`, the viz mount, keyboard input, and the scaffolder itself.
- **[CLI](/tools/bjs-cli)** (`bjs`) — download marketplace components and assets straight into the project you just scaffolded.
