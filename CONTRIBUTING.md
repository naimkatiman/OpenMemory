# Contributing to AI MemoryCore

Thanks for your interest! Here's how to contribute.

## Quick Setup

```bash
git clone https://github.com/Kiyoraka/Project-AI-MemoryCore.git
cd Project-AI-MemoryCore
npm install
npm run dev
```

## Development

```bash
npm run dev      # Start dev server (tsx watch)
npm run build    # TypeScript compile
npm run test     # Run tests
npm run cli      # Run CLI commands
```

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes with clear commit messages
3. Add tests if you're adding new features
4. Ensure `npm run build` passes
5. Open a PR with a description of what you changed and why

## Issues

- **Bug reports**: Include steps to reproduce, expected vs actual behavior
- **Feature requests**: Describe the use case and proposed solution
- **Questions**: Use GitHub Discussions if available, otherwise open an issue

## Code Style

- TypeScript strict mode
- Use Zod for input validation
- Keep functions focused and small
- Add JSDoc comments for public APIs

## Architecture

```
src/
├── server.ts    # Entry point
├── api.ts       # Fastify routes
├── mcp.ts       # MCP server
├── service.ts   # Business logic
├── storage.ts   # SQLite layer
├── schemas.ts   # Zod schemas
├── config.ts    # Env config
└── cli.ts       # CLI
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
