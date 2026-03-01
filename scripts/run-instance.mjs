#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PRESETS = {
  central: {
    port: 8787,
    runtimeDir: path.join(os.homedir(), "memory-core", "runtime"),
    dbName: "openclaw.db",
    defaultScope: "preferences",
    allowedScopePrefixes: ["preferences", "identity", "facts"]
  },
  "project-a": {
    port: 8788,
    runtimeDir: path.join(repoRoot, "runtime", "project-a"),
    dbName: "openclaw.db",
    defaultScope: "project",
    allowedScopePrefixes: ["project", "project-a"]
  },
  "project-b": {
    port: 8789,
    runtimeDir: path.join(repoRoot, "runtime", "project-b"),
    dbName: "openclaw.db",
    defaultScope: "project",
    allowedScopePrefixes: ["project", "project-b"]
  }
};

function parseArgs(argv) {
  const output = {
    mode: "http",
    instance: "central",
    port: undefined,
    runtimeDir: undefined,
    dbPath: undefined,
    defaultScope: undefined,
    allowedScopePrefixes: undefined
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    const name = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${token}`);
    }
    i += 1;
    switch (name) {
      case "mode":
        output.mode = value;
        break;
      case "instance":
        output.instance = value;
        break;
      case "port":
        output.port = Number(value);
        break;
      case "runtime-dir":
        output.runtimeDir = value;
        break;
      case "db-path":
        output.dbPath = value;
        break;
      case "default-scope":
        output.defaultScope = value;
        break;
      case "allowed-scope-prefixes":
        output.allowedScopePrefixes = value;
        break;
      default:
        throw new Error(`Unknown argument: --${name}`);
    }
  }

  if (output.mode !== "http" && output.mode !== "mcp") {
    throw new Error(`Invalid mode: ${output.mode}. Use "http" or "mcp".`);
  }
  return output;
}

function resolveConfig(cli) {
  const preset = PRESETS[cli.instance];
  if (!preset) {
    throw new Error(
      `Unknown instance "${cli.instance}". Use one of: ${Object.keys(PRESETS).join(", ")}`
    );
  }
  const runtimeDir = path.resolve(cli.runtimeDir ?? preset.runtimeDir);
  const dbPath = path.resolve(cli.dbPath ?? path.join(runtimeDir, preset.dbName));
  const allowedScopePrefixes =
    cli.allowedScopePrefixes ??
    (preset.allowedScopePrefixes.length > 0 ? preset.allowedScopePrefixes.join(",") : "");

  return {
    mode: cli.mode,
    instanceName: cli.instance,
    port: cli.port ?? preset.port,
    runtimeDir,
    dbPath,
    defaultScope: cli.defaultScope ?? preset.defaultScope,
    allowedScopePrefixes
  };
}

function main() {
  const cli = parseArgs(process.argv.slice(2));
  const cfg = resolveConfig(cli);

  fs.mkdirSync(cfg.runtimeDir, { recursive: true });

  const env = {
    ...process.env,
    OPENCLAW_INSTANCE: cfg.instanceName,
    OPENCLAW_PORT: String(cfg.port),
    OPENCLAW_RUNTIME_DIR: cfg.runtimeDir,
    OPENCLAW_DB_PATH: cfg.dbPath,
    OPENCLAW_DEFAULT_SCOPE: cfg.defaultScope,
    OPENCLAW_ALLOWED_SCOPE_PREFIXES: cfg.allowedScopePrefixes
  };

  const entry = cfg.mode === "http" ? "src/server.ts" : "src/mcp.ts";

  process.stderr.write(
    `[memorycore] launching ${cfg.mode} instance=${cfg.instanceName} port=${cfg.port} db=${cfg.dbPath}\n`
  );
  if (cfg.allowedScopePrefixes) {
    process.stderr.write(
      `[memorycore] scope policy default=${cfg.defaultScope} allowed=${cfg.allowedScopePrefixes}\n`
    );
  }

  const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");

  const child = spawn(process.execPath, [tsxCli, entry], {
    cwd: repoRoot,
    env,
    stdio: "inherit"
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.stderr.write(
    "Usage: node scripts/run-instance.mjs --mode <http|mcp> --instance <central|project-a|project-b>\n"
  );
  process.exit(1);
}
