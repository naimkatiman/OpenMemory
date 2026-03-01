# Session Format - Unified Memory-Diary Core
*Reference structure for `main/current-session.md`*

```markdown
# Current Session Memory - RAM

## Session Status
- Current session state
- Last activity timestamp
- Session focus

## Working Memory
- Current topic
- Immediate goals
- Recent progress
- Next steps

## Session Recap (Persistence Window)
- Previous session summary
- Where we left off
- Critical continuity context
- User current state

## Diary Continuity Fields
- Last diary write timestamp
- Last diary file (`daily-diary/current/YYYY-MM-DD.md` or archived path)
- Last diary entry heading/anchor

## 500-Line Reset Protocol
- Hard limit: 500 lines
- On overflow: preserve recap and diary continuity fields only
- Clear transient working memory
- Rebuild using this format
```

This file is a permanent reference. Keep runtime content in `main/current-session.md`.
