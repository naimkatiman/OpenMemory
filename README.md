<div align="center">

# 🧠 AI MemoryCore

**Give your AI assistant persistent memory that survives across sessions.**

AI MemoryCore is an open-source memory server that lets AI assistants remember facts, keep diaries, and maintain context across conversations — backed by SQLite and exposed via REST API + MCP.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green?logo=node.js)](https://nodejs.org/)

</div>

---

## Why MemoryCore?

Every AI conversation starts from scratch. **MemoryCore fixes that.**

- 🔒 **Persistent memory** — facts, preferences, and context survive across sessions
- 📓 **Automatic diary** — every `save` appends a timestamped diary entry
- 🔌 **MCP Server** — plug directly into Claude Code, Cursor, Windsurf, or any MCP client
- 🌐 **REST API** — integrate with any language or platform via HTTP
- 💻 **CLI** — manage memory from the terminal
- 🐳 **Docker-ready** — one `docker compose up` to deploy
- ⚡ **Zero config** — SQLite database, no external services needed

## Quick Start

```bash
# Clone and install
git clone https://github.com/Kiyoraka/Project-AI-MemoryCore.git
cd Project-AI-MemoryCore
npm install

# Start the server
npm run dev
```

Server starts at `http://localhost:8787` — Swagger docs at `http://localhost:8787/docs`

### Try It Out

```bash
# Save a memory
curl -X POST http://localhost:8787/v1/save \
  -H "Content-Type: application/json" \
  -d '{
    "memory_updates": [
      {"scope": "preferences", "key": "language", "value": "TypeScript"},
      {"scope": "preferences", "key": "editor", "value": "VS Code"}
    ],
    "summary": "User prefers TypeScript and VS Code"
  }'

# Recall memories
curl http://localhost:8787/v1/memory

# Review diary entries
curl http://localhost:8787/v1/diary/recent?limit=5

# Switch profiles
curl -X POST http://localhost:8787/v1/profiles/switch \
  -H "Content-Type: application/json" \
  -d '{"profile": "assistant"}'
```

### Use via CLI

```bash
npm run cli -- save --update preferences:language:TypeScript --summary "setup complete"
npm run cli -- review --limit 5
npm run cli -- switch assistant
npm run cli -- execute "Summarize today's progress"
```

## MCP Server (Claude Code / Cursor / Windsurf)

Add to your MCP config (e.g. `~/.cursor/mcp.json` or Claude Code settings):

```json
{
  "mcpServers": {
    "memorycore": {
      "command": "node",
      "args": ["dist/src/mcp.js"],
      "cwd": "/path/to/Project-AI-MemoryCore"
    }
  }
}
```

Build first: `npm run build`

Available MCP tools:
| Tool | Description |
|------|-------------|
| `memory_save` | Save memory facts and diary entry |
| `memory_recall` | Retrieve stored memory facts |
| `diary_review` | Read recent diary entries |
| `profile_switch` | Switch between assistant profiles |
| `profile_list` | List all profiles and capabilities |

## Architecture

```
┌─────────────────────────────────────────┐
│             Client Layer                │
│  MCP Server │ REST API │ CLI            │
├─────────────────────────────────────────┤
│           Service Layer                 │
│  Command Engine │ Profile Manager       │
├─────────────────────────────────────────┤
│           Storage Layer                 │
│     SQLite (better-sqlite3)             │
│  ┌──────────┬──────────┬──────────┐     │
│  │ Memory   │ Diary    │ Command  │     │
│  │ Facts    │ Entries  │ Log      │     │
│  └──────────┴──────────┴──────────┘     │
└─────────────────────────────────────────┘
```

### File Structure

```text
Project-AI-MemoryCore/
├── src/
│   ├── server.ts          # Fastify server bootstrap
│   ├── api.ts             # REST route definitions
│   ├── mcp.ts             # MCP server for AI editors
│   ├── service.ts         # Command engine + profile logic
│   ├── storage.ts         # SQLite persistence layer
│   ├── schemas.ts         # Zod validation schemas
│   ├── config.ts          # Environment config
│   └── cli.ts             # CLI runner
├── examples/
│   ├── curl-commands.sh   # Example API calls
│   └── js-client.mjs      # JavaScript client example
├── tests/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Profiles

MemoryCore supports **dual assistant profiles** that share the same memory backend:

| Profile | Mode | Use Case |
|---------|------|----------|
| `primary` | Native Memory | Relationship-first, continuity mode |
| `assistant` | Capability Mode | Execution-first, structured mode |

Both profiles read/write to the same SQLite database. Switch between them without losing context.

### Configure Your Own Profile Names

Set custom names via the API or just use them as aliases:

```bash
# The default profiles are "primary" and "assistant"
# You can switch using any registered alias
curl -X POST http://localhost:8787/v1/profiles/switch \
  -H "Content-Type: application/json" \
  -d '{"profile": "primary"}'
```

## Docker Deployment

```bash
# Start with Docker Compose
docker compose up -d

# Or build manually
docker build -t memorycore .
docker run -p 8787:8787 -v memorycore-data:/app/runtime memorycore
```

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_HOST` | `127.0.0.1` | Server bind address |
| `OPENCLAW_PORT` | `8787` | Server port |
| `OPENCLAW_DB_PATH` | `./runtime/openclaw.db` | SQLite database path |
| `OPENCLAW_API_KEY` | *(empty)* | API key for auth (set in production) |
| `OPENCLAW_CORS_ORIGIN` | `*` | CORS allowed origin |

## API Reference

Full OpenAPI docs available at `http://localhost:8787/docs` when running.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check + active profile |
| `GET` | `/v1/profiles` | List profiles |
| `POST` | `/v1/profiles/switch` | Switch active profile |
| `GET` | `/v1/capabilities` | Show profile capabilities |
| `GET` | `/v1/memory` | List memory facts |
| `POST` | `/v1/save` | Save memory + diary entry |
| `GET` | `/v1/diary/recent` | Recent diary entries |
| `POST` | `/v1/command` | Run a named command |
| `POST` | `/v1/execute` | Execute an objective |

## Feature Modules

| Module | Status | Description |
|--------|--------|-------------|
| Echo Memory Recall | ✅ Active | Semantic memory search and recall |
| LRU Project Management | ✅ Active | Track active projects with LRU eviction |
| Time-based Awareness | ✅ Active | Time-aware context and reminders |
| Skill Plugin System | ✅ Active | Extensible skill plugins for AI assistants |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Issues and PRs welcome!

## Contributors

- **[Kiyoraka](https://github.com/Kiyoraka)** (Afif Maahi) - Project creator and lead maintainer

## License

[MIT](LICENSE) — use it, fork it, ship it.
