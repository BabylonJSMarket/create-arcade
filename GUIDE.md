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
```

---

## The Default Scaffold

Every project starts as a **multigame arcade**: a carpeted room with a row of
cabinets that you grow into a full arcade. Scenes are TypeScript modules that
declare entities and their components *by name* (pure data); arcade lazy-imports
each named component the first time it appears. Each cabinet can point a player
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
│   ├── registry.ts             # Resolvers for HUD panels and any custom components
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
scene modules as entities plus named components. The arcade package's default
registry maps every named component to its module; bundlers tree-shake any
component a scene doesn't use.

> For the component / system / world / scene-JSON API itself, see the
> **bjs-ecs** and **bjs-arcade** guides — those are the source of truth for the
> framework surface.

---

## Filling the Arcade

Each cabinet is meant to launch its own game. To add one:

1. Author a scene under `src/scenes/<my-game>.ts` (copy `arcade-room.ts`).
2. Import it in `src/scenes/index.ts` and add it under a new key.
3. Switch to it at runtime — `game.loadScene(SCENES['<my-game>'])` — e.g. when
   the player activates the matching cabinet.

To add a **custom** component, drop a file under `src/components/MyThing.ts`
exporting `MyThingComponent` (and optionally `MyThingSystem`), then add
`MyThing: () => import('./components/MyThing')` to the resolver map in
`src/registry.ts`.

---

## Adding Components (the download flow)

You don't pick a template up front — you **pull in code on demand**. There are
two sources, and both land the same way: real source files in
`src/components/<Name>/` that you own and can edit, wired into `src/registry.ts`
so your local copy overrides the package's built-in one.

### 1. The bundled arcade library — `arcade eject`

`@babylonjsmarket/arcade` ships a free component library (bullets, enemies,
spawners, cameras, pinball pieces, money fields, …). `arcade eject` copies any
of them — plus their dependencies — into your project, shadcn-style:

```bash
arcade eject                 # eject every component this project already uses
arcade eject Bullet Enemy    # eject specific components (+ their deps)
arcade eject --all --dry-run # preview a full eject, write nothing
```

### 2. The BabylonJS Market — download more components

The marketplace at [babylonjsmarket.com](https://babylonjsmarket.com) carries
additional components beyond the bundled set. Some are **free**, some are
**paid**; once a component is in your account you download it and drop it into
`src/components/<Name>/` exactly like an ejected one, then register it in
`src/registry.ts`.

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

### `arcade eject` can't find components

Run it inside a project that has `@babylonjsmarket/arcade` installed (the
package ships the component source it copies from). If it can't auto-detect what
your project uses, name the components explicitly or pass `--all`.
