import {
  MCP_PACKAGE_VERSION,
  NATIVE_MCP_API_URL,
  REACT_MCP_API_URL,
  absoluteUrl,
} from "@/lib/agent-discovery";

export function getMcpServerCard(origin: string) {
  return {
    $schema: "https://modelcontextprotocol.io/schemas/server-card/draft.json",
    capabilities: {
      prompts: false,
      resources: false,
      tools: true,
    },
    description:
      "SY INC MCP servers expose read-only SY INC React and SY INC Native documentation, component metadata, source references, styles, and theme variables to AI coding agents.",
    endpoint: absoluteUrl(origin, "/.well-known/mcp/server-card.json"),
    links: {
      docs: [
        absoluteUrl(origin, "/docs/react/getting-started/mcp-server"),
        absoluteUrl(origin, "/docs/native/getting-started/mcp-server"),
      ],
      npm: [
        "https://www.npmjs.com/package/@sy-inc/react-mcp",
        "https://www.npmjs.com/package/@sy-inc/native-mcp",
      ],
      serverCard: absoluteUrl(origin, "/.well-known/mcp/server-card.json"),
      source: "https://github.com/sy-inc/sy-inc-mcp",
    },
    notes:
      "SY INC's supported MCP transport is stdio through the published npm packages. This well-known document is a discovery handshake for those existing servers, not a Streamable HTTP MCP endpoint.",
    serverInfo: {
      name: "SY INC MCP",
      version: MCP_PACKAGE_VERSION,
    },
    tools: [
      {
        description: "List all available SY INC v3 React components.",
        name: "list_components",
        package: "@sy-inc/react-mcp",
      },
      {
        description: "Get complete React component documentation.",
        name: "get_component_docs",
        package: "@sy-inc/react-mcp",
      },
      {
        description: "Get React component TypeScript source code.",
        name: "get_component_source_code",
        package: "@sy-inc/react-mcp",
      },
      {
        description: "Get React component CSS source styles.",
        name: "get_component_source_styles",
        package: "@sy-inc/react-mcp",
      },
      {
        description: "Get SY INC React theme variables.",
        name: "get_theme_variables",
        package: "@sy-inc/react-mcp",
      },
      {
        description: "Browse full SY INC React documentation.",
        name: "get_docs",
        package: "@sy-inc/react-mcp",
      },
      {
        description: "List all available SY INC Native components.",
        name: "list_components",
        package: "@sy-inc/native-mcp",
      },
      {
        description: "Get complete Native component documentation.",
        name: "get_component_docs",
        package: "@sy-inc/native-mcp",
      },
      {
        description: "Get SY INC Native theme variables.",
        name: "get_theme_variables",
        package: "@sy-inc/native-mcp",
      },
      {
        description: "Browse full SY INC Native documentation.",
        name: "get_docs",
        package: "@sy-inc/native-mcp",
      },
    ],
    transports: [
      {
        args: ["-y", "@sy-inc/react-mcp@latest"],
        command: "npx",
        dataApi: REACT_MCP_API_URL,
        package: "@sy-inc/react-mcp",
        type: "stdio",
      },
      {
        args: ["-y", "@sy-inc/native-mcp@latest"],
        command: "npx",
        dataApi: NATIVE_MCP_API_URL,
        package: "@sy-inc/native-mcp",
        type: "stdio",
      },
    ],
  };
}
