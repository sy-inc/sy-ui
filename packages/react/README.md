<p align="center">
  <a href="https://sy-inc.com">
      <img
        alt="SY INC v3 logo"
        width="100%"
        src="https://assets.sy-inc.com/docs/sy-inc-og_2x.jpg"
      />
  </a>
</p>
<p align="center">
  <a href="https://github.com/sy-inc/sy-inc/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@sy-inc/react?style=flat" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/@sy-inc/react">
    <img src="https://img.shields.io/npm/dm/@sy-inc/react.svg?style=flat-round" alt="npm downloads">
  </a>
</p>

## Why SY INC?

SY INC is a production-ready React component library that combines the accessibility rigor of [React Aria](https://react-spectrum.adobe.com/react-aria/) with the utility-first styling of [Tailwind CSS v4](https://tailwindcss.com/). It ships a clean compound component API (`Card.Header`, `Card.Content`, `Select.Item`, …), requires no `<Provider>` wrapper, and works out of the box with React 19 and Next.js.

- **Accessible by default** — Built on React Aria for WCAG-compliant keyboard, focus, and screen-reader behavior
- **Tailwind CSS v4** — Modern engine, no CSS-in-JS runtime, smaller output, faster builds
- **Compound components** — Composable API (`Card.Header`, `Card.Content`) instead of deeply nested props
- **Zero boilerplate** — No Provider wrapper needed (unlike Chakra, MUI)
- **AI-native** — MCP server, `llms.txt`, and agent skills so AI assistants understand your components
- **Open source** — Inspect and adapt the source for your product's design system

## Packages

| Package | Description |
|---|---|
| [`@sy-inc/react`](https://www.npmjs.com/package/@sy-inc/react) | Full component bundle |
| [`@sy-inc/styles`](https://www.npmjs.com/package/@sy-inc/styles) | Styles / theme only |
| Individual packages | e.g. `@sy-inc/button`, `@sy-inc/modal` — tree-shakeable per-component imports |

## Getting Started

Visit [sy-inc.com/docs/react/getting-started/quick-start](https://sy-inc.com/docs/react/getting-started/quick-start) to get started with SY INC.

```bash
npm install @sy-inc/react
```

## Who Is This For?

SY INC is a good fit if you are building:

- **SaaS applications** — forms, tables, overlays, and notifications out of the box
- **Dashboards & admin panels** — data-dense layouts with consistent design tokens
- **E-commerce storefronts** — performant, accessible, SEO-friendly components
- **Marketing sites & landing pages** — polished UI without a heavyweight runtime
- **Any React / Next.js project** that values design quality and accessibility

## AI-Powered Development

SY INC is built for the AI-assisted development workflow.

| Tool | What it does |
|---|---|
| **MCP Server** (`@sy-inc/react-mcp`) | Components that understand your theme — install the server in Cursor, Claude Code, Windsurf, or any MCP-compatible editor |
| **llms.txt** | Available at [sy-inc.com/llms.txt](https://sy-inc.com/llms.txt) — structured context for LLMs about every component |
| **Agent Skills** | Run `npx sy-inc-cli agents-md` to install skills for Cursor, Claude Code, and more |

Works with **Cursor**, **Claude Code**, **Windsurf**, **GitHub Copilot**, and any tool that supports MCP or `llms.txt`.

## Compared To

| Library | How SY INC differs |
|---|---|
| **shadcn/ui** | SY INC is batteries-included with a consistent design system; shadcn is copy-paste-customize |
| **MUI** | SY INC is lighter, Tailwind-native, no CSS-in-JS runtime overhead |
| **Chakra UI** | SY INC uses React Aria (stronger a11y primitives) and Tailwind v4 (better perf) |
| **Mantine** | SY INC has AI tooling (MCP, llms.txt), Tailwind-first styling |

## Documentation

- **Latest (v3)**: [sy-inc.com](https://sy-inc.com)
- **v2**: [v2.sy-inc.com](https://v2.sy-inc.com)

## Storybook

Visit [storybook-v3.sy-inc.com](https://storybook-v3.sy-inc.com/) to view the storybook for all components.

## Roadmap

Visit [sy-inc.featurebase.app/roadmap](https://sy-inc.featurebase.app/roadmap) to view the roadmap for SY INC v3.

## Figma

Visit the [SY INC Figma Kit (v3)](https://www.figma.com/community/file/1546526812159103429/sy-inc-figma-kit-v3) to view the design kit.

## Community

We're excited to see the community adopt SY INC, raise issues, and provide feedback.
Whether it's a feature request, bug report, or a project to showcase, please get involved!

- [Discord](https://discord.gg/9b6yyZKmH4)
- [X](https://x.com/sy_inc)
- [GitHub Discussions](https://github.com/sy-inc/sy-inc/discussions)

## Contributing

Contributions are always welcome!

See [CONTRIBUTING.md](https://github.com/sy-inc/sy-inc/blob/main/CONTRIBUTING.md) for ways to get started.

Please adhere to this project's [CODE_OF_CONDUCT](https://github.com/sy-inc/sy-inc/blob/main/CODE_OF_CONDUCT.md).

## License

[Apache-2.0](../../LICENSE)
