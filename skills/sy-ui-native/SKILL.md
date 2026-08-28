---
name: sy-ui-native
description: "SY UI Native component library for React Native (Tailwind v4 via Uniwind). Use when building mobile UIs with SY UI Native — creating Buttons, Cards, TextFields, Dialogs; installing sy-ui-native; configuring dark/light themes; or fetching component docs. Keywords: SY UI Native, sy-ui-native, React Native UI, Uniwind, mobile components."
metadata:
  author: sy-ui
  version: "2.0.1"
---

# SY UI Native Development Guide

SY UI Native is a component library built on **Uniwind (Tailwind CSS for React Native)** and **React Native**, providing accessible, customizable UI components for mobile applications.

---

## Installation

```bash
curl -fsSL https://sy-ui.com/install | bash -s sy-ui-native
```

---

## CRITICAL: Native Only - Do Not Use Web Patterns

**This guide is for SY UI Native ONLY.** Do NOT apply SY UI React (web) patterns — the package, styling engine, and color format all differ:

| Feature      | React (Web)          | Native (Mobile)                     |
| ------------ | -------------------- | ----------------------------------- |
| **Styling**  | Tailwind CSS v4      | Uniwind (Tailwind for React Native) |
| **Colors**   | oklch format         | HSL format                          |
| **Package**  | `@sy-inc/react` 	  | `sy-ui-native`                     |
| **Platform** | Web browsers         | iOS & Android                       |

```tsx
// CORRECT — Native pattern
import { Button } from "sy-ui-native";

<Button variant="primary" onPress={() => console.log("Pressed!")}>
	Click me
</Button>;
```

**Always fetch Native docs before implementing.**

---

## Core Principles

- Semantic variants (`primary`, `secondary`, `tertiary`) over visual descriptions
- Composition over configuration (compound components)
- Theme variables with HSL color format
- React Native StyleSheet patterns with Uniwind utilities

---

## Accessing Documentation & Component Information

**For component details, examples, props, and implementation patterns, always fetch documentation:**

### Using Scripts

```bash
# List all available components
node scripts/list_components.mjs

# Get component documentation (MDX)
node scripts/get_component_docs.mjs Button
node scripts/get_component_docs.mjs Button Card TextField

# Get theme variables
node scripts/get_theme.mjs

# Get non-component docs (guides, releases)
node scripts/get_docs.mjs /docs/native/getting-started/theming
```

### Direct MDX URLs

Component docs: fetch `.mdx` with a concrete kebab-case slug. Run `node scripts/list_components.mjs` when the slug is unknown, and never fetch a URL that still contains a placeholder.

Examples:

- Button: `https://sy-ui.com/docs/native/components/button.mdx`
- Dialog: `https://sy-ui.com/docs/native/components/dialog.mdx`
- TextField: `https://sy-ui.com/docs/native/components/text-field.mdx`

Getting started guides: use a concrete topic URL such as `https://sy-ui.com/docs/native/getting-started/quick-start.mdx`.

**Important:** Always fetch component docs before implementing. The MDX docs include complete examples, props, anatomy, and API references.

---

## Installation Essentials

### Quick Install

```bash
npm i sy-ui-native react-native-reanimated react-native-gesture-handler react-native-safe-area-context @gorhom/bottom-sheet react-native-svg react-native-worklets tailwind-merge tailwind-variants
```

### Framework Setup (Expo - Recommended)

1. **Install dependencies:**

```bash
npx create-expo-app MyApp
cd MyApp
npm i sy-ui-native uniwind tailwindcss
npm i react-native-reanimated react-native-gesture-handler react-native-safe-area-context @gorhom/bottom-sheet react-native-svg react-native-worklets tailwind-merge tailwind-variants
```

2. **Create `global.css`:**

```css
@import "tailwindcss";
@import "uniwind";
@import "sy-ui-native/styles";

@source "./node_modules/sy-ui-native/lib";
```

3. **Wrap app with providers:**

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SyUINativeProvider } from "sy-ui-native";
import "./global.css";

export default function Layout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SyUINativeProvider>
				<App />
			</SyUINativeProvider>
		</GestureHandlerRootView>
	);
}
```

### Critical Setup Requirements

1. **Uniwind is Required** - SY UI Native uses Uniwind (Tailwind CSS for React Native)
2. **SyUINativeProvider Required** - Wrap your app with `SyUINativeProvider`
3. **GestureHandlerRootView Required** - Wrap with `GestureHandlerRootView` from react-native-gesture-handler
4. **Use Compound Components** - Components use compound structure (e.g., `Card.Header`, `Card.Body`)
5. **Use onPress, not onClick** - React Native uses `onPress` event handlers
6. **Platform-Specific Code** - Use `Platform.OS` for iOS/Android differences

---

## Component Patterns

SY UI Native uses **compound component patterns**. Each component has subcomponents accessed via dot notation.

**Example - Card:**

```tsx
<Card>
	<Card.Header>{/* Icons, badges */}</Card.Header>
	<Card.Body>
		<Card.Title>Title</Card.Title>
		<Card.Description>Description</Card.Description>
	</Card.Body>
	<Card.Footer>{/* Actions */}</Card.Footer>
</Card>
```

**Key Points:**

- Always use compound structure - don't flatten to props
- Subcomponents are accessed via dot notation (e.g., `Card.Header`)
- Native Card uses `Card.Body` (not `Card.Content`); Title and Description go inside Body
- **Fetch component docs for complete anatomy and examples**

---

## Semantic Variants

SY UI uses semantic naming to communicate functional intent:

| Variant       | Purpose                           | Usage          |
| ------------- | --------------------------------- | -------------- |
| `primary`     | Main action to move forward       | 1 per context  |
| `secondary`   | Alternative actions               | Multiple       |
| `tertiary`    | Dismissive actions (cancel, skip) | Sparingly      |
| `danger`      | Destructive actions               | When needed    |
| `danger-soft` | Soft destructive actions          | Less prominent |
| `ghost`       | Low-emphasis actions              | Minimal weight |
| `outline`     | Secondary actions                 | Bordered style |

**Don't use raw colors** - semantic variants adapt to themes and accessibility.

---

## Theming

SY UI Native uses CSS variables via Tailwind/Uniwind for theming. Theme colors are defined in `global.css`:

```css
@theme {
	--color-accent: hsl(260, 100%, 70%);
	--color-accent-foreground: hsl(0, 0%, 100%);
}
```

**Get current theme variables:**

```bash
node scripts/get_theme.mjs
```

**Access theme colors programmatically:**

```tsx
import { useThemeColor } from "sy-ui-native";

const accentColor = useThemeColor("accent");
```

**Theme switching (Light/Dark Mode):**

```tsx
import { Uniwind, useUniwind } from "uniwind";

const { theme } = useUniwind();
Uniwind.setTheme(theme === "light" ? "dark" : "light");
```

For detailed theming, fetch: `https://sy-ui.com/docs/native/getting-started/theming.mdx`
