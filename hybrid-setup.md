# Hybrid Setup Guide (Central + Project Instances)

This setup gives you:
- One central memory instance for user-level facts/preferences.
- One isolated memory instance per project for project context.

## Topology

```bash
~/memory-core/   # central instance on 8787 (preferences, identity, facts)
project-a/       # project-specific instance on 8788 (project scopes only)
project-b/       # project-specific instance on 8789 (project scopes only)
```

## 1) Start the central memory instance

From this repository:

```bash
npm run dev:central
```

Central defaults:
- `OPENCLAW_PORT=8787`
- `OPENCLAW_RUNTIME_DIR=~/memory-core/runtime`
- `OPENCLAW_ALLOWED_SCOPE_PREFIXES=preferences,identity,facts`

## 2) Start project instances

From this repository:

```bash
npm run dev:project-a
npm run dev:project-b
```

Project defaults:
- `project-a` runs on `8788` with runtime at `./runtime/project-a`
- `project-b` runs on `8789` with runtime at `./runtime/project-b`
- Both enforce project-only scopes via:
  - `OPENCLAW_DEFAULT_SCOPE=project`
  - `OPENCLAW_ALLOWED_SCOPE_PREFIXES=project,<project-name>`

### Docker alternative

```bash
docker compose -f docker-compose.hybrid.yml up -d
```

## 3) Verify each instance

```bash
curl http://localhost:8787/health
curl http://localhost:8788/health
curl http://localhost:8789/health
```

Each health response includes:
- `instance_name`
- `default_scope`
- `allowed_scope_prefixes`

## 4) MCP configuration per project

Build once first:

```bash
npm run build
```

### Central MCP server

```json
{
  "mcpServers": {
    "memorycore-central": {
      "command": "node",
      "args": ["dist/src/mcp.js"],
      "cwd": "/path/to/Project-AI-MemoryCore",
      "env": {
        "OPENCLAW_INSTANCE": "central",
        "OPENCLAW_RUNTIME_DIR": "/home/you/memory-core/runtime",
        "OPENCLAW_DB_PATH": "/home/you/memory-core/runtime/openclaw.db",
        "OPENCLAW_DEFAULT_SCOPE": "preferences",
        "OPENCLAW_ALLOWED_SCOPE_PREFIXES": "preferences,identity,facts"
      }
    }
  }
}
```

### Project A MCP server

```json
{
  "mcpServers": {
    "memorycore-project-a": {
      "command": "node",
      "args": ["dist/src/mcp.js"],
      "cwd": "/path/to/Project-AI-MemoryCore",
      "env": {
        "OPENCLAW_INSTANCE": "project-a",
        "OPENCLAW_RUNTIME_DIR": "/path/to/project-a/.memorycore",
        "OPENCLAW_DB_PATH": "/path/to/project-a/.memorycore/openclaw.db",
        "OPENCLAW_DEFAULT_SCOPE": "project",
        "OPENCLAW_ALLOWED_SCOPE_PREFIXES": "project,project-a"
      }
    }
  }
}
```

### Project B MCP server

```json
{
  "mcpServers": {
    "memorycore-project-b": {
      "command": "node",
      "args": ["dist/src/mcp.js"],
      "cwd": "/path/to/Project-AI-MemoryCore",
      "env": {
        "OPENCLAW_INSTANCE": "project-b",
        "OPENCLAW_RUNTIME_DIR": "/path/to/project-b/.memorycore",
        "OPENCLAW_DB_PATH": "/path/to/project-b/.memorycore/openclaw.db",
        "OPENCLAW_DEFAULT_SCOPE": "project",
        "OPENCLAW_ALLOWED_SCOPE_PREFIXES": "project,project-b"
      }
    }
  }
}
```

## Migration Strategy

1. Start central memory first and store user preferences/facts there.
2. Add project-specific instances and keep project context in those DBs only.
3. In each project workspace, point MCP to that project instance config.
4. Keep central MCP available for cross-project personal memory.
