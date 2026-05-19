#!/usr/bin/env node
// @babylonjsmarket/create-arcade is a thin forwarder so that
// `npm create @babylonjsmarket/arcade@latest <name>` keeps working — the
// scaffolder itself now lives in @babylonjsmarket/arcade. This bin resolves
// that package's CLI and invokes its `init` subcommand with whatever
// positional args npm passed through.

import { createRequire } from "node:module";
import spawn from "cross-spawn";

const require = createRequire(import.meta.url);
const cliPath = require.resolve("@babylonjsmarket/arcade/cli");

const result = spawn.sync(
  process.execPath,
  [cliPath, "init", ...process.argv.slice(2)],
  { stdio: "inherit" },
);

process.exit(result.status ?? 0);
