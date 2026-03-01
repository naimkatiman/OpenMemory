import { getSettings } from "./config";
import { OpenClawService } from "./service";
import { SQLiteStore } from "./storage";

type ParsedArgs = {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
};

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "", ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token.startsWith("--")) {
      const name = token.slice(2);
      const next = rest[i + 1];
      if (!next || next.startsWith("--")) {
        flags[name] = true;
      } else {
        flags[name] = next;
        i += 1;
      }
    } else {
      positional.push(token);
    }
  }

  return { command, positional, flags };
}

function parseUpdates(raw: string[]): Array<{ scope: string; key: string; value: string }> {
  return raw.map((item) => {
    const parts = item.split(":");
    if (parts.length < 3) {
      throw new Error(`Invalid update '${item}'. Use scope:key:value format.`);
    }
    const scope = parts[0];
    const key = parts[1];
    const value = parts.slice(2).join(":");
    return { scope, key, value };
  });
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function toNumber(value: string | boolean | undefined, fallback: number): number {
  if (typeof value !== "string") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toStringList(value: string | boolean | undefined): string[] {
  if (typeof value !== "string") {
    return [];
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function usage(): void {
  printJson({
    usage: [
      "npm run cli -- switch <zaky|fatin|openclaw>",
      "npm run cli -- save --update scope:key:value --summary <text>",
      "npm run cli -- review --limit 10 --days 30",
      "npm run cli -- execute <objective text>",
      "npm run cli -- command \"save\" --payload '{\"memory_updates\":[]}'",
      "npm run cli -- capabilities",
      "npm run cli -- sync"
    ]
  });
}

function main(): void {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.command) {
    usage();
    process.exit(1);
  }

  const settings = getSettings();
  const store = new SQLiteStore(settings.databasePath);
  const service = new OpenClawService(store);

  try {
    let result: unknown;
    switch (parsed.command) {
      case "switch": {
        const profile = parsed.positional[0];
        if (!profile) {
          throw new Error("Profile is required for 'switch'.");
        }
        result = service.switchProfile(profile);
        break;
      }
      case "save": {
        const updates = parseUpdates(toStringList(parsed.flags.update));
        result = service.runCommand("save", {
          memory_updates: updates,
          diary: {
            title: toString(parsed.flags.title),
            summary: toString(parsed.flags.summary),
            details: toString(parsed.flags.details)
          }
        });
        break;
      }
      case "review": {
        result = service.runCommand("review diary", {
          limit: toNumber(parsed.flags.limit, 20),
          days: parsed.flags.days ? toNumber(parsed.flags.days, 30) : undefined
        });
        break;
      }
      case "execute": {
        const objective = parsed.positional.join(" ").trim();
        if (!objective) {
          throw new Error("Objective is required for 'execute'.");
        }
        result = service.executeObjective({ objective });
        break;
      }
      case "command": {
        const commandText = parsed.positional.join(" ").trim();
        if (!commandText) {
          throw new Error("Command text is required for 'command'.");
        }
        let payload: Record<string, unknown> = {};
        const payloadRaw = toString(parsed.flags.payload);
        if (payloadRaw) {
          payload = JSON.parse(payloadRaw) as Record<string, unknown>;
        }
        result = service.runCommand(commandText, payload);
        break;
      }
      case "capabilities": {
        result = service.showCapabilities();
        break;
      }
      case "sync": {
        result = service.syncProfiles();
        break;
      }
      default:
        throw new Error(`Unsupported CLI command: ${parsed.command}`);
    }
    printJson(result);
  } finally {
    store.close();
  }
}

main();

