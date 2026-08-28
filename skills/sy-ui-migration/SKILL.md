---
name: sy-ui-migration
description: "SY UI v2 to v3 migration guide for agents. Use when migrating SY UI v2 apps to v3, upgrading components, or accessing migration documentation. Keywords: SY UI migration, v2 to v3, migration guide, upgrade SY UI."
metadata:
  author: sy-ui
  version: "2.0.0"
  status: preview
---

# SY UI v2 to v3 Migration Guide

This skill helps agents migrate SY UI v2 applications to v3. SY UI v3 introduces breaking changes: compound components, no Provider, Tailwind v4, and removed hooks.

---

## Installation

```bash
curl -fsSL https://sy-ui.com/install | bash -s sy-ui-migration
```

---

## CRITICAL: Always Fetch Migration Docs Before Applying

**Do NOT assume v2 patterns work in v3.** Always fetch migration guides before implementing changes.

### Key v2 → v3 Changes

| Feature       | v2 (Migrate From)          | v3 (Migrate To)                        |
| ------------- | -------------------------- | -------------------------------------- |
| Provider      | `<SyUIProvider>` required | **No Provider needed**                 |
| Component API | Flat props: `<Card title="x">` | Compound: `<Card><Card.Header>`      |
| Event handlers | `onClick`                 | `onPress`                              |
| Styling       | `classNames` prop         | `className` prop                       |
| Hooks         | `useSwitch`, `useDisclosure`, etc. | Compound components, `useOverlayState` |
| Packages      | `@sy-ui/system`, `@sy-ui/theme` | `@sy-inc/react`, `@sy-inc/styles` |

---

## Accessing Migration Documentation

**For migration details, examples, and step-by-step guides, always fetch documentation:**

### Using Scripts

```bash
# List all available component migration guides
node scripts/list_migration_guides.mjs

# Get main migration workflow (full or incremental)
node scripts/get_migration_guide.mjs full
node scripts/get_migration_guide.mjs incremental

# Get component-specific migration guides
node scripts/get_component_migration_guides.mjs button
node scripts/get_component_migration_guides.mjs button card modal

# Get styling migration guide
node scripts/get_styling_migration_guide.mjs

# Get hooks migration guide
node scripts/get_hooks_migration_guide.mjs
```

### Direct URLs

Migration docs (preview): use a concrete guide URL from the examples below, and never fetch a URL that still contains a placeholder.

Examples:

- Full migration: `.../agent-guide-full.mdx`
- Incremental: `.../agent-guide-incremental.mdx`
- Button: `.../button.mdx`
- Styling: `.../styling.mdx`
- Hooks: `.../hooks.mdx`

Override base URL with `SY_UI_MIGRATION_DOCS_BASE` when docs are merged to production.

### MCP Alternative

When using Cursor or other MCP clients, configure the Migration MCP server for tool-based access:

```json
{
  "mcpServers": {
    "sy-ui-migration": {
      "url": "https://migration-mcp.sy-ui.com"
    }
  }
}
```

---

## Migration Strategies

### Full Migration

- Best for: Projects that can dedicate focused time; teams comfortable with temporarily broken code
- Migrate all component code first (project broken during migration)
- Switch dependencies to v3
- Complete styling migration

### Incremental Migration

- Best for: Projects that must stay functional; large codebases migrating gradually
- Set up coexistence (pnpm aliases or component packages)
- Migrate components one-by-one
- Both v2 and v3 coexist during migration

**Always fetch the agent guide before starting:** `node scripts/get_migration_guide.mjs full` or `incremental`

---

## Core Principles

1. **Fetch first**: Use scripts to get migration guides before applying changes
2. **Compound components**: v3 uses `Card.Header`, `Card.Title`, `Button` with children—not flat props
3. **No Provider**: Remove `SyUIProvider` when migrating
4. **onPress not onClick**: All interactive components use `onPress`
5. **Workflow**: Analyze → Migrate components → Switch deps → Styling migration

---

## Migration Workflow Summary

1. Create migration branch
2. Analyze project (SY UI imports, component usage)
3. Fetch main guide: `node scripts/get_migration_guide.mjs full`
4. Migrate components in batches (fetch component guides per batch)
5. Switch dependencies to v3
6. Fetch styling guide: `node scripts/get_styling_migration_guide.mjs`
7. Apply styling updates

---

## Preview Mode

This skill targets the staging deployment of the `docs/migration` branch. Once docs are merged to main and live on sy-ui.com, set `SY_UI_MIGRATION_DOCS_BASE=https://sy-ui.com/docs/react/migration` or update the default in scripts.
