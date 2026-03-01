import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CommandBody, ExecuteBody, SaveBody, SwitchProfileBody, zodError } from "./schemas";
import { OpenClawService } from "./service";
import { SQLiteStore } from "./storage";

// ── Auth middleware ────────────────────────────────────────────────────────────

function buildAuthHook(apiKey: string | undefined) {
  return async function authHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!apiKey) {
      // No API key configured → open mode (dev-friendly)
      return;
    }
    const provided = request.headers["x-api-key"];
    if (provided !== apiKey) {
      await reply.code(401).send({ error: "Unauthorized. Provide a valid x-api-key header." });
    }
  };
}

// ── API builder ───────────────────────────────────────────────────────────────

export function buildApi(service: OpenClawService, store: SQLiteStore): FastifyInstance {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "production"
  });

  const apiKey = process.env.OPENCLAW_API_KEY || undefined;
  const corsOrigin = process.env.OPENCLAW_CORS_ORIGIN ?? "*";

  // ── Plugins ─────────────────────────────────────────────────────────────────

  void app.register(cors, { origin: corsOrigin });

  void app.register(swagger, {
    openapi: {
      info: {
        title: "OpenClaw Memory API",
        description: "AI memory and diary persistence layer",
        version: "1.0.0"
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            in: "header",
            name: "x-api-key"
          }
        }
      },
      security: [{ apiKey: [] }]
    }
  });

  void app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
    staticCSP: true
  });

  // ── Global auth ──────────────────────────────────────────────────────────────

  app.addHook("preHandler", buildAuthHook(apiKey));

  // ── Routes ───────────────────────────────────────────────────────────────────

  app.get(
    "/health",
    {
      schema: {
        description: "Health check — returns server status and active profile",
        tags: ["System"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              time: { type: "string" },
              active_profile: { type: "string" }
            }
          }
        }
      }
    },
    async () => ({
      status: "ok",
      time: new Date().toISOString(),
      active_profile: store.getActiveProfile()
    })
  );

  app.get(
    "/v1/profiles",
    {
      schema: {
        description: "List all profiles and the currently active one",
        tags: ["Profiles"]
      }
    },
    async () => service.getProfiles()
  );

  app.post<{ Body: z.infer<typeof SwitchProfileBody> }>(
    "/v1/profiles/switch",
    {
      schema: {
        description: "Switch the active profile (zaky | fatin | openclaw)",
        tags: ["Profiles"],
        body: {
          type: "object",
          required: ["profile"],
          properties: { profile: { type: "string" } }
        }
      }
    },
    async (request, reply) => {
      const parsed = SwitchProfileBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send(zodError(parsed.error));
      }
      try {
        return service.switchProfile(parsed.data.profile);
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  app.get(
    "/v1/capabilities",
    {
      schema: {
        description: "Show active profile capabilities",
        tags: ["Profiles"]
      }
    },
    async () => service.showCapabilities()
  );

  app.get(
    "/v1/sync",
    {
      schema: {
        description: "Check sync state across profiles",
        tags: ["Profiles"]
      }
    },
    async () => service.syncProfiles()
  );

  app.get<{ Querystring: { scope?: string } }>(
    "/v1/memory",
    {
      schema: {
        description: "List memory facts, optionally filtered by scope",
        tags: ["Memory"],
        querystring: {
          type: "object",
          properties: { scope: { type: "string" } }
        }
      }
    },
    async (request) => ({
      items: store.listMemory(request.query.scope)
    })
  );

  app.get<{ Querystring: { limit?: string; days?: string } }>(
    "/v1/diary/recent",
    {
      schema: {
        description: "List recent diary entries",
        tags: ["Diary"],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "string" },
            days: { type: "string" }
          }
        }
      }
    },
    async (request) => {
      const limit = Number(request.query.limit ?? "20");
      const days = request.query.days ? Number(request.query.days) : undefined;
      return service.reviewDiary({ limit, days });
    }
  );

  app.post<{ Body: z.infer<typeof SaveBody> }>(
    "/v1/save",
    {
      schema: {
        description: "Merged save: upsert memory facts + append diary entry",
        tags: ["Memory", "Diary"],
        body: {
          type: "object",
          properties: {
            memory_updates: { type: "array" },
            diary: { type: "object" },
            title: { type: "string" },
            summary: { type: "string" },
            details: { type: "string" }
          }
        }
      }
    },
    async (request, reply) => {
      const parsed = SaveBody.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send(zodError(parsed.error));
      }
      try {
        return service.mergedSave(parsed.data as Record<string, unknown>);
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  app.post<{ Body: z.infer<typeof ExecuteBody> }>(
    "/v1/execute",
    {
      schema: {
        description: "Execute an objective through the active profile",
        tags: ["Commands"],
        body: {
          type: "object",
          required: ["objective"],
          properties: {
            objective: { type: "string" },
            context: { type: "object" }
          }
        }
      }
    },
    async (request, reply) => {
      const parsed = ExecuteBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send(zodError(parsed.error));
      }
      try {
        return service.executeObjective(parsed.data as Record<string, unknown>);
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  app.post<{ Body: z.infer<typeof CommandBody> }>(
    "/v1/command",
    {
      schema: {
        description: "Run a named command (save | review diary | use <profile> | …)",
        tags: ["Commands"],
        body: {
          type: "object",
          required: ["command"],
          properties: {
            command: { type: "string" },
            payload: { type: "object" }
          }
        }
      }
    },
    async (request, reply) => {
      const parsed = CommandBody.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send(zodError(parsed.error));
      }
      try {
        return service.runCommand(parsed.data.command, parsed.data.payload ?? {});
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  app.get<{ Querystring: { limit?: string } }>(
    "/v1/commands/recent",
    {
      schema: {
        description: "List recent command audit log",
        tags: ["Commands"],
        querystring: {
          type: "object",
          properties: { limit: { type: "string" } }
        }
      }
    },
    async (request) => {
      const limit = Number(request.query.limit ?? "20");
      return { items: store.listCommandLog(limit) };
    }
  );

  return app;
}
