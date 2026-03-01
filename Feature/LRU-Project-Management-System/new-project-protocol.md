# New Project Protocol
*Create a new project with LRU positioning*

## Trigger
`new [type] project [name]`

## Steps
1. Parse project type and project name.
2. Collect short description and goals.
3. Create project file from template.
4. Move new project to LRU position #1.
5. Update `projects/project-list.md`.
6. Record active project in `main/current-session.md`.

## Notes
- Archiving behavior applies when active list exceeds capacity.
- Works independently of core memory-diary save behavior.
