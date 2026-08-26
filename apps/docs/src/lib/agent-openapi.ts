import {
  AGENT_API_VERSION,
  NATIVE_MCP_API_URL,
  REACT_MCP_API_URL,
  getAgentServiceBaseUrl,
} from "@/lib/agent-discovery";

export type OpenAPIDocument = Record<string, unknown>;

function baseDocument(
  title: string,
  version: string,
  serverUrl: string,
  description: string,
): OpenAPIDocument {
  return {
    info: {
      description,
      title,
      version,
    },
    openapi: "3.1.0",
    security: [],
    servers: [{url: serverUrl}],
  };
}

const errorResponse = {
  content: {
    "application/json": {
      schema: {$ref: "#/components/schemas/ErrorResponse"},
    },
  },
  description: "A structured error with a stable code and recovery hint.",
};

export function agentApiDocument(origin: string): OpenAPIDocument {
  return {
    ...baseDocument(
      "SY UI Docs Agent API",
      AGENT_API_VERSION,
      getAgentServiceBaseUrl(origin),
      "Public, read-only endpoints for searching SY UI documentation and retrieving markdown page content. No authentication or OAuth scopes are required.",
    ),
    components: {
      schemas: {
        AgentPage: {
          additionalProperties: false,
          properties: {
            description: {type: "string"},
            markdown: {type: "string"},
            title: {type: "string"},
            url: {type: "string"},
          },
          required: ["description", "markdown", "title", "url"],
          type: "object",
        },
        ErrorResponse: {
          additionalProperties: false,
          properties: {
            code: {type: "string"},
            error: {const: true, type: "boolean"},
            hint: {type: "string"},
            message: {type: "string"},
          },
          required: ["error", "code", "message", "hint"],
          type: "object",
        },
        HealthResponse: {
          additionalProperties: false,
          properties: {
            service: {const: "sy-ui-docs-agent-api", type: "string"},
            status: {const: "ok", type: "string"},
            version: {type: "string"},
          },
          required: ["service", "status", "version"],
          type: "object",
        },
        SearchResponse: {
          additionalProperties: false,
          properties: {
            count: {minimum: 0, type: "integer"},
            platform: {enum: ["all", "react", "native"], type: "string"},
            query: {type: "string"},
            results: {
              items: {$ref: "#/components/schemas/SearchResult"},
              type: "array",
            },
          },
          required: ["count", "platform", "query", "results"],
          type: "object",
        },
        SearchResult: {
          additionalProperties: false,
          properties: {
            description: {type: "string"},
            platform: {enum: ["all", "react", "native"], type: "string"},
            title: {type: "string"},
            url: {type: "string"},
          },
          required: ["description", "platform", "title", "url"],
          type: "object",
        },
      },
    },
    paths: {
      "/health": {
        get: {
          description:
            "Returns the current status and version of the public SY UI Docs Agent API.",
          operationId: "getAgentApiHealth",
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {$ref: "#/components/schemas/HealthResponse"},
                },
              },
              description: "The agent API is available.",
            },
          },
          summary: "Check SY UI agent API health",
        },
      },
      "/page": {
        get: {
          description:
            "Retrieves one public SY UI documentation page, including its metadata and markdown body.",
          operationId: "getSyUIDocPageMarkdown",
          parameters: [
            {
              description: "SY UI docs page URL, for example /docs/react/components/button.",
              in: "query",
              name: "url",
              required: true,
              schema: {minLength: 1, type: "string"},
            },
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {$ref: "#/components/schemas/AgentPage"},
                },
              },
              description: "Documentation page metadata and markdown.",
            },
            "400": errorResponse,
            "404": errorResponse,
          },
          summary: "Retrieve SY UI documentation as markdown",
        },
      },
      "/search": {
        get: {
          description:
            "Searches public SY UI documentation titles, descriptions, URLs, and slugs, optionally restricted to React or React Native.",
          operationId: "searchSyUIDocs",
          parameters: [
            {
              description: "Case-insensitive text to find in SY UI documentation.",
              in: "query",
              name: "q",
              required: true,
              schema: {minLength: 1, type: "string"},
            },
            {
              description: "Limit results to one SY UI platform or search all documentation.",
              in: "query",
              name: "platform",
              schema: {default: "all", enum: ["all", "react", "native"], type: "string"},
            },
            {
              description: "Maximum number of matches to return.",
              in: "query",
              name: "limit",
              schema: {default: 10, maximum: 20, minimum: 1, type: "integer"},
            },
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {$ref: "#/components/schemas/SearchResponse"},
                },
              },
              description: "Matching SY UI documentation pages.",
            },
            "400": errorResponse,
          },
          summary: "Search SY UI documentation",
        },
      },
    },
  };
}

function mcpApiDocument(kind: "react" | "native"): OpenAPIDocument {
  const isReact = kind === "react";
  const serverUrl = isReact ? REACT_MCP_API_URL : NATIVE_MCP_API_URL;
  const title = isReact ? "SY UI React MCP Data API" : "SY UI Native MCP Data API";
  const componentSourcePaths = isReact
    ? {
        "/v1/components/source": {
          post: {
            description: "Returns TypeScript source for requested SY UI React components.",
            operationId: "getComponentSource",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    properties: {components: {items: {type: "string"}, type: "array"}},
                    required: ["components"],
                    type: "object",
                  },
                },
              },
              required: true,
            },
            responses: {"200": {description: "Component source code."}},
            summary: "Get component TypeScript source",
          },
        },
        "/v1/components/styles": {
          post: {
            description: "Returns CSS source for requested SY UI React components.",
            operationId: "getComponentStyles",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    properties: {components: {items: {type: "string"}, type: "array"}},
                    required: ["components"],
                    type: "object",
                  },
                },
              },
              required: true,
            },
            responses: {"200": {description: "Component CSS styles."}},
            summary: "Get component styles",
          },
        },
      }
    : {};

  return {
    ...baseDocument(
      title,
      "1.1.0",
      serverUrl,
      `Public, read-only data API used by the ${isReact ? "@sy-ui/react-mcp" : "@sy-ui/native-mcp"} package and SY UI agent skills.`,
    ),
    paths: {
      "/health": {
        get: {
          description: "Returns the current availability of the SY UI MCP data API.",
          operationId: "getHealth",
          responses: {"200": {description: "Health status."}},
          summary: "Check API health",
        },
      },
      "/v1/components": {
        get: {
          description: "Lists the component names available for this SY UI platform.",
          operationId: "listComponents",
          responses: {"200": {description: "Available components."}},
          summary: "List available components",
        },
      },
      "/v1/components/docs": {
        post: {
          description: "Returns documentation for requested SY UI components.",
          operationId: "getComponentDocs",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  properties: {components: {items: {type: "string"}, type: "array"}},
                  required: ["components"],
                  type: "object",
                },
              },
            },
            required: true,
          },
          responses: {"200": {description: "Component documentation."}},
          summary: "Get component documentation",
        },
      },
      ...componentSourcePaths,
      "/v1/docs/{path}": {
        get: {
          description: "Returns a SY UI documentation resource by its canonical path.",
          operationId: "getDocs",
          parameters: [
            {
              description: "Canonical documentation path.",
              in: "path",
              name: "path",
              required: true,
              schema: {type: "string"},
            },
          ],
          responses: {"200": {description: "Documentation content."}},
          summary: "Get documentation by path",
        },
      },
      "/v1/themes/variables": {
        get: {
          description: "Returns the design tokens for a named SY UI theme.",
          operationId: "getThemeVariables",
          parameters: [
            {
              description: "Theme identifier.",
              in: "query",
              name: "theme",
              schema: {default: "default", type: "string"},
            },
          ],
          responses: {"200": {description: "Theme variables."}},
          summary: "Get theme variables",
        },
      },
    },
  };
}

export const OPENAPI_BUILDERS: Record<string, (origin: string) => OpenAPIDocument> = {
  "sy-ui-agent-api.json": agentApiDocument,
  "sy-ui-native-mcp-api.json": () => mcpApiDocument("native"),
  "sy-ui-react-mcp-api.json": () => mcpApiDocument("react"),
};
