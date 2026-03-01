# Setup Guide
*Manual setup for Unified Memory-Diary Core*

## Step 1: Set Names and Relationship
Edit:
- `main/main-memory.md`
- `main/current-session.md`
- `master-memory.md`

Replace:
- `[AI_NAME]`
- `[YOUR_NAME]`
- `[RELATIONSHIP_STYLE]`

Optional dual-assistant naming:
- Native memory assistant: `Kiyoraka`
- OpenClaw assistant: `Vanguard`

## Step 2: Confirm Canonical Paths
Use only these active files:
- `main/main-memory.md`
- `main/current-session.md`
- `save-protocol.md`
- `daily-diary/daily-diary-protocol.md`
- `main/openclaw-capability-bridge.md`

Deprecated stubs remain for compatibility but are not active sources.

## Step 3: Configure Loader Prompt
Add to your AI memory instruction:

```markdown
- Always load `master-memory.md` first.
- On `Kiyoraka`, restore from `main/main-memory.md` and `main/current-session.md`.
- `save` and `save diary` use the same merged save pipeline.
```

## Step 4: Test Commands
- `Kiyoraka`
- `save`
- `save diary`
- `review diary`
- `Load save-diary` (should return deprecation guidance)
- `use kiyoraka`
- `use vanguard` (or `use openclaw`)
- `show capabilities`
- `sync profiles`

## Step 5: Verify Diary Layout
Ensure directories exist:
- `daily-diary/current/`
- `daily-diary/archived/`
- `daily-diary/archived/legacy/`

Legacy numbered diary should be in:
- `daily-diary/archived/legacy/Daily-Diary-001.md`

## Final Notes
- `save` is now memory + diary by default.
- `save project` remains project-only.
- Session file follows hard 500-line reset protocol.
- `Kiyoraka` and `Vanguard` share the same memory-diary backend.

---

Status: Active setup guide
Version: Unified Memory-Diary Core v1.0
