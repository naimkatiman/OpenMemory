# Setup Guide
*Quick setup for OpenMemory*

## Step 1: Install and Start

```bash
git clone https://github.com/naimkatiman/OpenMemory.git
cd OpenMemory
npm install
cp .env.example .env
npm run dev
```

Server starts at `http://localhost:8787` with Swagger docs at `/docs`.

## Step 2: Personalize Your Memory Files

Edit the following files and replace placeholders:

| Placeholder | Replace With | Example |
|-------------|-------------|---------|
| `[AI_NAME]` | Your AI assistant name | `Atlas` |
| `[YOUR_NAME]` | Your name | `Alex` |
| `[RELATIONSHIP_STYLE]` | How the AI should communicate | `Direct, concise, no fluff` |

Files to update:
- `master-memory.md`
- `main/main-memory.md`
- `main/current-session.md`

## Step 3: Test Commands

### Via CLI
```bash
npm run cli -- save --update preferences:language:TypeScript --summary "first save"
npm run cli -- review --limit 5
npm run cli -- switch assistant
```

### Via API
```bash
curl http://localhost:8787/health
curl http://localhost:8787/v1/memory
curl http://localhost:8787/v1/diary/recent
```

## Step 4: Connect via MCP (Optional)

Build first: `npm run build`

Add to your MCP config:
```json
{
  "mcpServers": {
    "memorycore": {
      "command": "node",
      "args": ["dist/src/mcp.js"],
      "cwd": "/path/to/OpenMemory"
    }
  }
}
```

## Step 5: Verify Diary Layout

Ensure these directories exist:
- `daily-diary/current/`
- `daily-diary/archived/`

---

Version: OpenMemory v1.0
