import Fastify, { FastifyInstance } from "fastify";

import { OpenClawService } from "./service";
import { SQLiteStore } from "./storage";

export function buildApi(service: OpenClawService, store: SQLiteStore): FastifyInstance {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "production"
  });

  app.get("/health", async () => ({
    status: "ok",
    time: new Date().toISOString(),
    active_profile: store.getActiveProfile()
  }));

  app.get("/v1/profiles", async () => service.getProfiles());

  app.post<{ Body: { profile: string } }>("/v1/profiles/switch", async (request, reply) => {
    try {
      return service.switchProfile(request.body.profile);
    } catch (error) {
      return reply.code(400).send({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/v1/capabilities", async () => service.showCapabilities());
  app.get("/v1/sync", async () => service.syncProfiles());

  app.get<{ Querystring: { scope?: string } }>("/v1/memory", async (request) => ({
    items: store.listMemory(request.query.scope)
  }));

  app.get<{ Querystring: { limit?: string; days?: string } }>(
    "/v1/diary/recent",
    async (request) => {
      const limit = Number(request.query.limit ?? "20");
      const days = request.query.days ? Number(request.query.days) : undefined;
      return service.reviewDiary({ limit, days });
    }
  );

  app.post<{ Body: Record<string, unknown> }>("/v1/save", async (request, reply) => {
    try {
      return service.mergedSave(request.body ?? {});
    } catch (error) {
      return reply.code(400).send({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post<{ Body: { objective: string; context?: Record<string, unknown> } }>(
    "/v1/execute",
    async (request, reply) => {
      try {
        return service.executeObjective({
          objective: request.body.objective,
          context: request.body.context ?? {}
        });
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  app.post<{ Body: { command: string; payload?: Record<string, unknown> } }>(
    "/v1/command",
    async (request, reply) => {
      try {
        return service.runCommand(request.body.command, request.body.payload ?? {});
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  app.get<{ Querystring: { limit?: string } }>("/v1/commands/recent", async (request) => {
    const limit = Number(request.query.limit ?? "20");
    return { items: store.listCommandLog(limit) };
  });

  return app;
}

