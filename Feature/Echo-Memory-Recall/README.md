# Echo Memory Recall
*Recall extension for Unified Memory-Diary Core*

## Purpose
Search diary history and respond with narrative memory grounded in stored entries.

## Trigger Examples
- "do you remember..."
- "when did we..."
- "recall..."
- "check history"

## Search Scope (in order)
1. `daily-diary/current/`
2. `daily-diary/archived/YYYY-MM/`
3. `daily-diary/archived/legacy/` (fallback for old numbered diaries)

## Rules
- Search before answering memory questions.
- Do not fabricate past events.
- If no reliable match, ask the user for clarification.
