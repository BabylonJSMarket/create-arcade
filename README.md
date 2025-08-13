# @babylonjsmarket/create-arcade

A CLI tool for scaffolding BabylonJS games using the Arcade ECS (Entity-Component-System) framework.

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

Simply run the create command and follow the prompts:

```bash
npm create @babylonjsmarket/arcade@latest
```

You'll be asked to:
1. Choose a project name
2. Select a template (Basic, Third Person, or First Person)
3. Confirm package name

### Command Line Options

```bash
# Create with a specific template
npm create @babylonjsmarket/arcade@latest my-game --template ThirdPerson

# Create in current directory
npm create @babylonjsmarket/arcade@latest .

# Overwrite existing directory
npm create @babylonjsmarket/arcade@latest my-game --overwrite
```

## Available Templates

### Basic ECS Template
A minimal setup with the ECS framework, perfect for starting from scratch.

### Third Person Template
Pre-configured for third-person games with:
- Player entity with movement controls
- Camera follow system
- Basic environment setup

### First Person Template  
Pre-configured for first-person games with:
- FPS camera controller
- Movement system with WASD controls
- Collision detection setup
- Basic level geometry

## Project Structure

After scaffolding, your project will have:

```
my-game/
├── src/
│   ├── main.ts           # Entry point
│   ├── components/       # ECS Components
│   ├── systems/          # ECS Systems
│   └── entities/         # Game entities
├── public/               # Static assets
├── index.html            # HTML entry
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.js        # Vite config
└── README.md             # Project docs
```

## What's Included

Every project comes with:
- **@babylonjsmarket/arcade** - The ECS framework
- **BabylonJS** - 3D engine and dependencies
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- Pre-configured development environment

## Development

After creating your project:

```bash
cd my-game
npm install
npm run dev
```

Your game will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Learn More

- [Arcade ECS Documentation](https://github.com/babylonjsmarket/arcade)
- [BabylonJS Documentation](https://doc.babylonjs.com/)
- [Entity-Component-System Pattern](https://en.wikipedia.org/wiki/Entity_component_system)

## License

MIT © BabylonJS Market