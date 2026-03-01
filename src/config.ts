import fs from "node:fs";
import path from "node:path";

export interface Settings {
  runtimeDir: string;
  databasePath: string;
  host: string;
  port: number;
  instanceName: string;
  defaultScope: string;
  allowedScopePrefixes: string[];
}

function parseScopePrefixes(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function getSettings(): Settings {
  const repoRoot = process.cwd();
  const runtimeDir = process.env.OPENCLAW_RUNTIME_DIR ?? path.join(repoRoot, "runtime");
  fs.mkdirSync(runtimeDir, { recursive: true });

  const databasePath = process.env.OPENCLAW_DB_PATH ?? path.join(runtimeDir, "openclaw.db");
  const host = process.env.OPENCLAW_HOST ?? "127.0.0.1";
  const port = Number(process.env.OPENCLAW_PORT ?? "8787");
  const instanceName = (process.env.OPENCLAW_INSTANCE ?? "default").trim() || "default";
  const defaultScope = (process.env.OPENCLAW_DEFAULT_SCOPE ?? "general").trim() || "general";
  const allowedScopePrefixes = parseScopePrefixes(process.env.OPENCLAW_ALLOWED_SCOPE_PREFIXES);

  return {
    runtimeDir,
    databasePath,
    host,
    port,
    instanceName,
    defaultScope,
    allowedScopePrefixes
  };
}
