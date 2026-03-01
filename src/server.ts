import { buildApi } from "./api";
import { getSettings } from "./config";
import { OpenClawService } from "./service";
import { SQLiteStore } from "./storage";

async function start(): Promise<void> {
  const settings = getSettings();
  const store = new SQLiteStore(settings.databasePath);
  const service = new OpenClawService(store, {
    instanceName: settings.instanceName,
    defaultScope: settings.defaultScope,
    allowedScopePrefixes: settings.allowedScopePrefixes
  });
  const app = buildApi(service, store);

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[${signal}] Shutting down...`);
    try {
      await app.close();
    } finally {
      store.close();
      console.log("Store closed. Goodbye.");
    }
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ host: settings.host, port: settings.port });
    console.log(
      `OpenClaw [${settings.instanceName}] running at http://${settings.host}:${settings.port}`
    );
  } catch (error) {
    store.close();
    throw error;
  }
}

void start();
