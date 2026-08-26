# SY UI v3 — AI Integration Prompt Packs

System prompts that teach AI code-generation tools to produce correct, idiomatic SY UI v3 code.

## What's in this directory

| File | Purpose |
|------|---------|
| `sy-ui-system-prompt.md` | Universal prompt — works with any LLM or AI coding tool (Claude, ChatGPT, Cursor, Copilot, etc.) |
| `v0-sy-ui.md` | Tailored for [v0.dev](https://v0.dev) — emphasizes Next.js App Router, RSC patterns, and Tailwind v4 |
| `bolt-sy-ui.md` | Tailored for [bolt.new](https://bolt.new) / StackBlitz — includes full Vite setup and runnable single-file examples |

These prompts also work well with **Lovable**, **Replit Agent**, **Windsurf**, and similar AI-powered code generation platforms.

## How to use

### v0.dev

Paste the contents of `v0-sy-ui.md` into v0's system instructions or prepend it to your prompt.

### bolt.new / StackBlitz

Paste the contents of `bolt-sy-ui.md` at the start of your prompt when creating a new project. It includes the full Vite + Tailwind v4 setup so bolt can scaffold the project correctly.

### Cursor / Claude / ChatGPT / Copilot

Use `sy-ui-system-prompt.md` as a custom instruction, system prompt, or `.cursorrules` file. It gives the AI a complete reference of SY UI v3 components and patterns.

### Any other tool

The universal `sy-ui-system-prompt.md` works with any tool that accepts system-level instructions.

## Richer integrations

For deeper integration beyond system prompts:

- **MCP Server** — The SY UI MCP server provides real-time component docs, source code, and theme tokens to AI agents. See the [`@sy-ui/mcp`](https://www.npmjs.com/package/@sy-ui/mcp) package.
- **llms.txt** — Full-context documentation following the llms.txt standard, available at [sy-ui.com/llms.txt](https://sy-ui.com/llms.txt).

## Contributing

When updating these prompts, verify that the component names, APIs, and import patterns match the actual v3 source code in this repo. Run a quick check against the component docs in `apps/docs/content/docs/react/components/` to catch any drift.
