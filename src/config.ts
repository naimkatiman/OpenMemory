import fs from "node:fs";
import path from "node:path";

export interface Settings {
  runtimeDir: string;
  databasePath: string;
  host: string;
  port: number;
}

export function getSettings(): Settings {
  const repoRoot = process.cwd();
  const runtimeDir = process.env.OPENCLAW_RUNTIME_DIR ?? path.join(repoRoot, "runtime");
  fs.mkdirSync(runtimeDir, { recursive: true });

  const databasePath = process.env.OPENCLAW_DB_PATH ?? path.join(runtimeDir, "openclaw.db");
  const host = process.env.OPENCLAW_HOST ?? "127.0.0.1";
  const port = Number(process.env.OPENCLAW_PORT ?? "8787");

  return {
    runtimeDir,
    databasePath,
    host,
    port
  };
}

