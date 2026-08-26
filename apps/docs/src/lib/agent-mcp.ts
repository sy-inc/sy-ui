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
      "SY UI MCP servers expose read-only SY UI React and SY UI Native documentation, component metadata, source references, styles, and theme variables to AI coding agents.",
    endpoint: absoluteUrl(origin, "/.well-known/mcp/server-card.json"),
    links: {
      docs: [
        absoluteUrl(origin, "/docs/react/getting-started/mcp-server"),
        absoluteUrl(origin, "/docs/native/getting-started/mcp-server"),
      ],
      npm: [
        "https://www.npmjs.com/package/@sy-ui/react-mcp",
        "https://www.npmjs.com/package/@sy-ui/native-mcp",
      ],
      serverCard: absoluteUrl(origin, "/.well-known/mcp/server-card.json"),
      source: "https://github.com/sy-ui/sy-ui-mcp",
    },
    notes:
      "SY UI's supported MCP transport is stdio through the published npm packages. This well-known document is a discovery handshake for those existing servers, not a Streamable HTTP MCP endpoint.",
    serverInfo: {
      name: "SY UI MCP",
      version: MCP_PACKAGE_VERSION,
    },
    tools: [
      {
        description: "List all available SY UI v3 React components.",
        name: "list_components",
        package: "@sy-ui/react-mcp",
      },
      {
        description: "Get complete React component documentation.",
        name: "get_component_docs",
        package: "@sy-ui/react-mcp",
      },
      {
        description: "Get React component TypeScript source code.",
        name: "get_component_source_code",
        package: "@sy-ui/react-mcp",
      },
      {
        description: "Get React component CSS source styles.",
        name: "get_component_source_styles",
        package: "@sy-ui/react-mcp",
      },
      {
        description: "Get SY UI React theme variables.",
        name: "get_theme_variables",
        package: "@sy-ui/react-mcp",
      },
      {
        description: "Browse full SY UI React documentation.",
        name: "get_docs",
        package: "@sy-ui/react-mcp",
      },
      {
        description: "List all available SY UI Native components.",
        name: "list_components",
        package: "@sy-ui/native-mcp",
      },
      {
        description: "Get complete Native component documentation.",
        name: "get_component_docs",
        package: "@sy-ui/native-mcp",
      },
      {
        description: "Get SY UI Native theme variables.",
        name: "get_theme_variables",
        package: "@sy-ui/native-mcp",
      },
      {
        description: "Browse full SY UI Native documentation.",
        name: "get_docs",
        package: "@sy-ui/native-mcp",
      },
    ],
    transports: [
      {
        args: ["-y", "@sy-ui/react-mcp@latest"],
        command: "npx",
        dataApi: REACT_MCP_API_URL,
        package: "@sy-ui/react-mcp",
        type: "stdio",
      },
      {
        args: ["-y", "@sy-ui/native-mcp@latest"],
        command: "npx",
        dataApi: NATIVE_MCP_API_URL,
        package: "@sy-ui/native-mcp",
        type: "stdio",
      },
    ],
  };
}
