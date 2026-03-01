# Load Project Protocol
*Load and reactivate project context with LRU management*

## Trigger
`load project [name]`

## Steps
1. Search active then archived project folders.
2. Resolve selection if multiple matches exist.
3. Load project context and metadata.
4. Move project to LRU position #1.
5. Update `projects/project-list.md`.
6. Write active project linkage to `main/current-session.md`.

## Notes
- If loading from archived, reactivate to active folder.
- Project loading is separate from core memory-diary save pipeline.
