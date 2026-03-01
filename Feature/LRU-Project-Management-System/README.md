# LRU Project Management System
*Project context management compatible with Unified Memory-Diary Core*

## Purpose
Manage project-specific memory independently from the core memory-diary pipeline.

## Command Separation
- `save`: core merged save (memory + diary)
- `save diary`: alias to `save`
- `save project`: project-only persistence

## Session Integration
Use `main/current-session.md` for active project linkage.
Do not use legacy session-file aliases as active targets.

## Key Commands
- `new [type] project [name]`
- `load project [name]`
- `save project`
- `list projects`
- `archive project [name]`
