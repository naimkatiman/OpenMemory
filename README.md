# AI MemoryCore
*Unified Memory-Diary Core architecture*

## Summary
This repository uses a single canonical memory architecture:
- Unified permanent memory in `main/main-memory.md`
- Session RAM in `main/current-session.md` with a 500-line reset protocol
- Diary as default behavior in `save` (not optional extension)
- OpenClaw capability layer integrated through assistant profiles (`Zaky` + `Fatin`)

## Canonical File Structure
```text
Project-AI-MemoryCore/
├── master-memory.md
├── save-protocol.md
├── main/
│   ├── main-memory.md
│   ├── current-session.md
│   ├── main-memory-format.md
│   ├── session-format.md
│   ├── openclaw-capability-bridge.md
│   ├── identity-core.md            # Deprecated stub
│   └── relationship-memory.md      # Deprecated stub
├── daily-diary/
│   ├── daily-diary-protocol.md
│   ├── current/
│   │   └── YYYY-MM-DD.md
│   └── archived/
│       ├── YYYY-MM/
│       │   └── YYYY-MM-DD.md
│       └── legacy/
│           └── Daily-Diary-001.md  # legacy only
└── Feature/
    ├── Time-based-Aware-System/
    ├── LRU-Project-Management-System/
    ├── Echo-Memory-Recall/
    ├── Skill-Plugin-System/
    ├── Save-Diary-System/          # Deprecated wrapper
    └── Memory-Consolidation-System/ # Deprecated wrapper
```

## Command Model
| Command | Result |
| --- | --- |
| `[AI_NAME]` | Restore from `main/main-memory.md` + `main/current-session.md` |
| `save` | Memory update + diary append + session recap update |
| `save diary` | Alias to `save` |
| `review diary` | Read current + archived diary entries |
| `save project` | Project-only save (LRU feature) |
| `Load save-diary` | Compatibility alias with deprecation guidance |
| `use zaky` | Switch to native memory profile |
| `use fatin` / `use openclaw` | Switch to OpenClaw capability profile |
| `show capabilities` | Show active profile and capability set |
| `sync profiles` | Confirm shared memory-diary state between profiles |

## Diary Behavior
- Active entries: `daily-diary/current/YYYY-MM-DD.md`
- Monthly archive: `daily-diary/archived/YYYY-MM/`
- Legacy numbered diaries: `daily-diary/archived/legacy/`
- Format authority: `daily-diary/daily-diary-protocol.md`

## Setup
1. Update placeholders in `main/main-memory.md`, `main/current-session.md`, and `master-memory.md`.
2. Load memory with `[AI_NAME]`.
3. Use `save` to persist both memory and diary.

Dual assistant example:
- Native memory assistant name: `Zaky`
- OpenClaw assistant name: `Fatin`
- Both modes use one shared backend (no split memory storage)

## TypeScript Runtime Stack
This repository now includes a real TypeScript runtime implementation:
- API server: `src/server.ts`
- Command engine: `src/service.ts`
- SQLite persistence: `src/storage.ts`
- CLI runner: `src/cli.ts`

Run locally:
1. `npm install`
2. `npm run start`

Run CLI:
- `npm run cli -- switch openclaw`
- `npm run cli -- save --update identity:assistant_name:Fatin --summary "live save"`
- `npm run cli -- review --limit 5`
- `npm run cli -- execute "Run OpenClaw loop"`

## Feature Status
Active modules:
- Time-based aware system
- LRU project management
- Echo memory recall
- Skill plugin system

Deprecated wrappers (kept for compatibility only):
- Save-Diary-System
- Memory-Consolidation-System

---

Version: Unified Memory-Diary Core v1.0
Last updated: 2026-02-28
