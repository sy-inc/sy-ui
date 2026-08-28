import {CopyPromptButton} from "./copy-prompt-button";

/**
 * Configuration describing the framework-specific parts of an AI setup prompt.
 * Everything that differs between the React and Native prompts lives here so the
 * surrounding instructions stay in a single source of truth.
 */
interface SetupPromptConfig {
  /** Docs path segment used for resource links, e.g. `react`. */
  docsPath: string;
  /** Skill / MCP server / install identifier, e.g. `sy-ui-react`. */
  id: string;
  /** One-line summary of what is being built, e.g. ``UIs with SY UI v3 (`@sy-inc/react`)``. */
  intro: string;
  /** Sentence describing what the MCP server exposes. */
  mcpAccess: string;
  /** MCP npm package, e.g. `@sy-inc/react-mcp`. */
  mcpPackage: string;
  /** Short marketing name, e.g. `SY UI` or `SY UI Native`. */
  productName: string;
}

/**
 * Builds the official SY UI AI setup prompt from a framework config. The prompt
 * body is identical across frameworks; only the values in {@link SetupPromptConfig}
 * change, which keeps the React and Native prompts from drifting apart.
 */
function buildSetupPrompt({
  docsPath,
  id,
  intro,
  mcpAccess,
  mcpPackage,
  productName,
}: SetupPromptConfig): string {
  return `These are official instructions from SY UI to set up a good AI development environment for building ${intro}.

Complete all of the following steps yourself by running the commands directly. Do not ask the user to run any of these commands.

- Install the ${productName} skill and register the ${productName} MCP server

---

## 1. Install the ${productName} skill

The installer detects your tool (Claude Code, Cursor, OpenCode, and more) and places the skill in the correct directory:

\`\`\`
curl -fsSL https://sy-ui.com/install | bash -s ${id}
\`\`\`

Or using the skills package:

\`\`\`
npx skills add sy-ui/sy-ui
\`\`\`

## 2. Register the ${productName} MCP server

The MCP gives your agent live access to ${mcpAccess}. Use the correct section for your agent below.

### Claude Code

\`\`\`
claude mcp add ${id} -- npx -y ${mcpPackage}@latest
\`\`\`

### Cursor — \`.cursor/mcp.json\`

Add under \`"mcpServers"\`:

\`\`\`json
"${id}": { "command": "npx", "args": ["-y", "${mcpPackage}@latest"] }
\`\`\`

### VS Code — \`.vscode/mcp.json\`

Add under \`"servers"\`:

\`\`\`json
"${id}": { "type": "stdio", "command": "npx", "args": ["-y", "${mcpPackage}@latest"] }
\`\`\`

### Windsurf — \`.windsurf/mcp.json\`

Add under \`"mcpServers"\`:

\`\`\`json
"${id}": { "command": "npx", "args": ["-y", "${mcpPackage}@latest"] }
\`\`\`

### Zed — \`settings.json\`

Add under \`"context_servers"\`:

\`\`\`json
"${id}": { "command": "npx", "args": ["-y", "${mcpPackage}@latest"], "env": {} }
\`\`\`

### Codex — \`~/.codex/config.toml\`

\`\`\`toml
[mcp_servers.${id}]
command = "npx"
args = ["-y", "${mcpPackage}@latest"]
\`\`\`

### OpenCode — \`opencode.json\`

Add under \`"mcp"\`:

\`\`\`json
"${id}": { "type": "local", "command": ["npx", "-y", "${mcpPackage}@latest"] }
\`\`\`

Restart the agent after adding the config, then verify the \`${id}\` MCP is connected.

Once done, tell the user:

\`\`\`
✓ Skill: ${id}
✓ MCP server: ${id}
⚡ Restart your agent to load the MCP server
\`\`\`

---

## Resources

- Quick Start: https://sy-ui.com/docs/${docsPath}/getting-started/quick-start
- MCP server: https://sy-ui.com/docs/${docsPath}/getting-started/mcp-server
- Agent Skills: https://sy-ui.com/docs/${docsPath}/getting-started/agent-skills

These instructions are published at https://sy-ui.com/docs/${docsPath}/getting-started so you can re-verify their authenticity at any time.`;
}

const REACT_PROMPT = buildSetupPrompt({
  docsPath: "react",
  id: "sy-ui-react",
  intro: "UIs with SY UI v3 (`@sy-inc/react`)",
  mcpAccess: "component docs, source code, CSS, and theme variables",
  mcpPackage: "@sy-inc/react-mcp",
  productName: "SY UI",
});

const NATIVE_PROMPT = buildSetupPrompt({
  docsPath: "native",
  id: "sy-ui-native",
  intro: "mobile UIs with SY UI Native (`sy-ui-native`)",
  mcpAccess: "component docs, theme variables, and setup guides",
  mcpPackage: "@sy-ui/native-mcp",
  productName: "SY UI Native",
});

/**
 * CopySetupPrompt
 *
 * Header action for the React getting-started docs that copies the official
 * SY UI v3 (OSS) AI setup prompt to the clipboard.
 */
export function CopySetupPrompt() {
  return <CopyPromptButton prompt={REACT_PROMPT} />;
}

/**
 * CopyNativeSetupPrompt
 *
 * Header action for the Native getting-started docs that copies the official
 * SY UI Native (OSS) AI setup prompt to the clipboard.
 */
export function CopyNativeSetupPrompt() {
  return <CopyPromptButton prompt={NATIVE_PROMPT} />;
}
