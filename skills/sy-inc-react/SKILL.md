---
name: sy-inc-react
description: "SY INC v3 React component library (Tailwind CSS v4 + React Aria). Use when building UIs with SY INC — creating Buttons, Modals, Forms, Cards; installing @sy-inc/react; configuring dark/light themes with oklch variables; or fetching component docs. Keywords: SY INC, SY INC, sy-inc, @sy-inc/react, @sy-inc/styles."
metadata:
  author: sy-inc
  version: "3.0.1"
---

# SY INC v3 React Development Guide

SY INC v3 is a component library built on **Tailwind CSS v4** and **React Aria Components**, providing accessible, customizable UI components for React applications.

---

## Installation

```bash
curl -fsSL https://sy-inc.com/install | bash -s sy-inc-react
```

---

## CRITICAL: v3 Only - Ignore v2 Knowledge

**This guide is for SY INC v3 ONLY.** Do NOT apply v2 patterns — the provider, styling, and component API all changed:

| Feature       | v2 (DO NOT USE)                   | v3 (USE THIS)                               |
| ------------- | --------------------------------- | ------------------------------------------- |
| Provider      | `<SyIncProvider>` required       | **No Provider needed**                      |
| Animations    | `framer-motion` package           | CSS-based, no extra deps                    |
| Component API | Flat props: `<Card title="x">`    | Compound: `<Card><Card.Header>`             |
| Styling       | Tailwind v3 + `@sy-inc/theme`     | Tailwind v4 + `@sy-inc/styles`         	  |
| Packages      | `@sy-inc/system`, `@sy-inc/theme` | `@sy-inc/react`, `@sy-inc/styles` 		  |

```tsx
// DO NOT DO THIS - v2 pattern
import { SyIncProvider } from "@sy-inc/react";
import { motion } from "framer-motion";

<SyIncProvider>
	<Card title="Product" description="A great product" />
</SyIncProvider>;
```

### CORRECT (v3 patterns)

```tsx
// DO THIS - v3 pattern (no provider, compound components)
import { Card } from "@sy-inc/react";

<Card>
	<Card.Header>
		<Card.Title>Product</Card.Title>
		<Card.Description>A great product</Card.Description>
	</Card.Header>
</Card>;
```

**Always inspect the current fork's v3 docs and implementation before implementing.**

---

## Core Principles

- Semantic variants (`primary`, `secondary`, `tertiary`) over visual descriptions
- Composition over configuration (compound components)
- CSS variable-based theming with `oklch` color space
- BEM naming convention for predictable styling

---

## Accessing Documentation & Component Information

**For component details, examples, props, and implementation patterns, use the scripts below. They resolve this monorepo first and only contact a remote source when the requested artifact is absent locally.**

Local resolution starts at `SY_INC_REPO_ROOT` when set; otherwise the scripts walk upward from their own directory until they find `pnpm-workspace.yaml` and `packages/react`.

| Artifact | Local source of truth |
| --- | --- |
| Component list | `packages/react/src/components/*/*.tsx` |
| Component MDX | `apps/docs/content/docs/en/react/components/**/<slug>.mdx` |
| Guides/releases | `apps/docs/content/docs/en/**/<slug>.mdx` |
| React source | `packages/react/src/components/<slug>/<slug>.tsx` |
| Component styles | `packages/styles/components/<slug>.css`, then `packages/styles/src/components/<slug>/<slug>.styles.ts`, then `packages/react/src/components/<slug>/<slug>.styles.ts` |
| Theme | `packages/styles/themes/default/variables.css` |

### Using Scripts

```bash
# List all available components
node scripts/list_components.mjs

# Get component documentation (MDX)
node scripts/get_component_docs.mjs Button
node scripts/get_component_docs.mjs Button Card TextField

# Get component source code
node scripts/get_source.mjs Button

# Get component CSS styles (BEM classes)
node scripts/get_styles.mjs Button

# Get theme variables
node scripts/get_theme.mjs

# Get non-component docs (guides, releases)
node scripts/get_docs.mjs /docs/react/getting-started/theming
```

### Direct MDX URLs

Use direct URLs only as a fallback when the file is not present in the current fork. Remote endpoints are configurable with:

- `SY_INC_API_BASE` for the component/docs API
- `SY_INC_DOCS_BASE` for direct MDX
- `SY_INC_GITHUB_RAW_BASE` for source and style files

Component docs: fetch `.mdx` with a concrete kebab-case slug. Run `node scripts/list_components.mjs` when the slug is unknown, and never fetch a URL that still contains a placeholder.

Examples:

- Button: `https://sy-inc.com/docs/react/components/button.mdx`
- Modal: `https://sy-inc.com/docs/react/components/modal.mdx`
- Form: `https://sy-inc.com/docs/react/components/form.mdx`

Getting started guides: use a concrete topic URL such as `https://sy-inc.com/docs/react/getting-started/quick-start.mdx`.

**Important:** Always inspect component docs before implementing. Prefer the fork's MDX because it matches the source being edited; use the configured remote fallback only when local documentation is missing.

---

## Installation Essentials

### Quick Install

```bash
npm i @sy-inc/styles @sy-inc/react tailwind-variants
```

### Framework Setup (Next.js App Router - Recommended)

1. **Install dependencies:**

```bash
npm i @sy-inc/styles @sy-inc/react tailwind-variants tailwindcss @tailwindcss/postcss postcss
```

2. **Create/update `app/globals.css`:**

```css
/* Tailwind CSS v4 - Must be first */
@import "tailwindcss";

/* SY INC v3 styles - Must be after Tailwind */
@import "@sy-inc/styles";
```

3. **Import in `app/layout.tsx`:**

```tsx
import "./globals.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				{/* No Provider needed in SY INC v3! */}
				{children}
			</body>
		</html>
	);
}
```

4. **Configure PostCSS (`postcss.config.mjs`):**

```js
export default {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};
```

### Critical Setup Requirements

1. **Tailwind CSS v4 is MANDATORY** - SY INC v3 will NOT work with Tailwind CSS v3
2. **Use Compound Components** - Components use compound structure (e.g., `Card.Header`, `Card.Content`)
3. **Use onPress, not onClick** - For better accessibility, use `onPress` event handlers
4. **Import Order Matters** - Always import Tailwind CSS before SY INC styles

---

## Component Patterns

All components use the **compound pattern** shown above (dot-notation subcomponents like `Card.Header`, `Card.Content`). Don't flatten to props — always compose with subcomponents. Fetch component docs for complete anatomy and examples.

---

## Semantic Variants

SY INC uses semantic naming to communicate functional intent:

| Variant     | Purpose                           | Usage          |
| ----------- | --------------------------------- | -------------- |
| `primary`   | Main action to move forward       | 1 per context  |
| `secondary` | Alternative actions               | Multiple       |
| `tertiary`  | Dismissive actions (cancel, skip) | Sparingly      |
| `danger`    | Destructive actions               | When needed    |
| `ghost`     | Low-emphasis actions              | Minimal weight |
| `outline`   | Secondary actions                 | Bordered style |

**Don't use raw colors** - semantic variants adapt to themes and accessibility.

---

## Theming

SY INC v3 uses CSS variables with `oklch` color space:

```css
:root {
	--accent: oklch(0.6204 0.195 253.83);
	--accent-foreground: var(--snow);
	--background: oklch(0.9702 0 0);
	--foreground: var(--eclipse);
}
```

**Get current theme variables:**

```bash
node scripts/get_theme.mjs
```

**Color naming:**

- Without suffix = background (e.g., `--accent`)
- With `-foreground` = text color (e.g., `--accent-foreground`)

**Theme switching:**

```html
<html class="dark" data-theme="dark"></html>
```

For detailed theming, fetch: `https://sy-inc.com/docs/react/getting-started/theming.mdx`
