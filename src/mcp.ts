import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getSettings } from "./config";
import { OpenClawService } from "./service";
import { SQLiteStore } from "./storage";

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const settings = getSettings();
const store = new SQLiteStore(settings.databasePath);
const service = new OpenClawService(store, {
    instanceName: settings.instanceName,
    defaultScope: settings.defaultScope,
    allowedScopePrefixes: settings.allowedScopePrefixes
});

const server = new Server(
    { name: "openmemory", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

// ── Tool definitions ──────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "memory_save",
            description:
                "Save memory facts and append a diary entry. Use this to persist information the AI should remember across sessions.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    memory_updates: {
                        type: "array",
                        description: "Array of {scope, key, value} objects to upsert into memory",
                        items: {
                            type: "object",
                            properties: {
                                scope: { type: "string", description: "Category (e.g. preferences, identity, projects)" },
                                key: { type: "string", description: "Fact key" },
                                value: { type: "string", description: "Fact value" },
                            },
                            required: ["key", "value"],
                        },
                    },
                    summary: {
                        type: "string",
                        description: "One-line summary for the diary entry",
                    },
                    title: {
                        type: "string",
                        description: "Optional title for the diary entry",
                    },
                    details: {
                        type: "string",
                        description: "Optional longer details for the diary entry",
                    },
                },
            },
        },
        {
            name: "memory_recall",
            description:
                "Retrieve stored memory facts. Optionally filter by scope (e.g. preferences, identity).",
            inputSchema: {
                type: "object" as const,
                properties: {
                    scope: {
                        type: "string",
                        description: "Optional scope filter (e.g. preferences, identity, projects)",
                    },
                },
            },
        },
        {
            name: "diary_review",
            description: "Read recent diary entries to recall session history.",
            inputSchema: {
                type: "object" as const,
                properties: {
                    limit: {
                        type: "number",
                        description: "Max entries to return (default: 10)",
                    },
                    days: {
                        type: "number",
                        description: "Only show entries from the last N days",
                    },
                },
            },
        },
        {
            name: "profile_switch",
            description:
                "Switch the active assistant profile. Available: primary, assistant (or legacy aliases: zaky, fatin, openclaw).",
            inputSchema: {
                type: "object" as const,
                properties: {
                    profile: {
                        type: "string",
                        description: "Profile name to switch to",
                    },
                },
                required: ["profile"],
            },
        },
        {
            name: "profile_list",
            description: "List all available profiles and their capabilities.",
            inputSchema: {
                type: "object" as const,
                properties: {},
            },
        },
    ],
}));

// ── Tool handlers ─────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "memory_save": {
                const result = service.mergedSave({
                    memory_updates: (args as Record<string, unknown>).memory_updates ?? [],
                    summary: (args as Record<string, unknown>).summary ?? "",
                    title: (args as Record<string, unknown>).title ?? "",
                    details: (args as Record<string, unknown>).details ?? "",
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "memory_recall": {
                const scope = (args as Record<string, unknown>).scope as string | undefined;
                const items = store.listMemory(scope);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ count: items.length, items }, null, 2),
                        },
                    ],
                };
            }

            case "diary_review": {
                const result = service.reviewDiary({
                    limit: (args as Record<string, unknown>).limit ?? 10,
                    days: (args as Record<string, unknown>).days,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "profile_switch": {
                const profile = (args as Record<string, unknown>).profile as string;
                const result = service.switchProfile(profile);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "profile_list": {
                const result = service.getProfiles();
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    const policy = service.getScopePolicy();
    console.error(
        `OpenMemory MCP server [${policy.instance_name}] running on stdio (default_scope=${policy.default_scope})`
    );
}

void main();
