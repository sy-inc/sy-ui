"use client";

import {useEffect} from "react";

type WebMCPInput = Record<string, unknown>;

type WebMCPTool = {
  description: string;
  execute: (input: WebMCPInput) => Promise<unknown> | unknown;
  inputSchema: Record<string, unknown>;
  name: string;
};

type WebMCPModelContext = {
  provideContext?: (
    context: {tools: WebMCPTool[]},
    options?: {signal?: AbortSignal},
  ) => (() => void) | void;
  provideTools?: (tools: WebMCPTool[], options?: {signal?: AbortSignal}) => (() => void) | void;
  registerTool?: (tool: WebMCPTool) => void;
  unregisterTool?: (name: string) => void;
};

declare global {
  interface Navigator {
    modelContext?: WebMCPModelContext;
  }
}

function getString(input: WebMCPInput, key: string, fallback = ""): string {
  const value = input[key];

  return typeof value === "string" ? value : fallback;
}

function getInteger(input: WebMCPInput, key: string, fallback: number): number {
  const value = input[key];
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.trunc(parsed);
}

function getPlatform(input: WebMCPInput, fallback: "all" | "native" | "react" = "all") {
  const platform = getString(input, "platform", fallback);

  if (platform === "react" || platform === "native" || platform === "all") return platform;

  return fallback;
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(path, {
    headers: {
      Accept: "application/json",
    },
  });
  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : "SY UI WebMCP request failed";

    throw new Error(message);
  }

  return data;
}

function resolveSameOriginPath(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) return null;
    if (
      url.pathname === "/" ||
      url.pathname.startsWith("/docs/") ||
      url.pathname.startsWith("/llms")
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return null;
  }

  return null;
}

const tools: WebMCPTool[] = [
  {
    description:
      "Search SY UI React and Native documentation. Use this when an agent needs relevant SY UI docs pages by keyword.",
    execute(input) {
      const query = getString(input, "query").trim();
      const platform = getPlatform(input);
      const limit = Math.min(Math.max(getInteger(input, "limit", 10), 1), 20);

      if (!query) throw new Error("query is required");

      return fetchJson(
        `/api/agent/search?q=${encodeURIComponent(query)}&platform=${platform}&limit=${limit}`,
      );
    },
    inputSchema: {
      properties: {
        limit: {default: 10, maximum: 20, minimum: 1, type: "integer"},
        platform: {default: "all", enum: ["all", "react", "native"], type: "string"},
        query: {
          description: "Search query, such as button, theming, or native colors.",
          type: "string",
        },
      },
      required: ["query"],
      type: "object",
    },
    name: "search_sy-ui_docs",
  },
  {
    description: "Retrieve a SY UI documentation page as markdown by same-origin docs URL.",
    execute(input) {
      const url = resolveSameOriginPath(getString(input, "url"));

      if (!url || !url.startsWith("/docs/")) {
        throw new Error("url must be a same-origin /docs/ path");
      }

      return fetchJson(`/api/agent/page?url=${encodeURIComponent(url)}`);
    },
    inputSchema: {
      properties: {
        url: {
          description: "A SY UI docs path, for example /docs/react/components/button.",
          type: "string",
        },
      },
      required: ["url"],
      type: "object",
    },
    name: "get_sy-ui_doc",
  },
  {
    description:
      "Navigate the browser to a SY UI same-origin page such as the homepage or a docs page.",
    execute(input) {
      const url = resolveSameOriginPath(getString(input, "url"));

      if (!url) {
        throw new Error("url must be a same-origin SY UI homepage, docs, or llms path");
      }

      window.location.assign(url);

      return `Navigating to ${url}`;
    },
    inputSchema: {
      properties: {
        url: {
          description: "A same-origin SY UI path, for example /docs/react/getting-started.",
          type: "string",
        },
      },
      required: ["url"],
      type: "object",
    },
    name: "navigate_sy-ui",
  },
  {
    description: "List SY UI component documentation pages for React or Native.",
    execute(input) {
      const platform = getPlatform(input, "react") === "native" ? "native" : "react";
      const limit = Math.min(Math.max(getInteger(input, "limit", 20), 1), 20);

      return fetchJson(
        `/api/agent/search?q=${encodeURIComponent("/components/")}&platform=${platform}&limit=${limit}`,
      );
    },
    inputSchema: {
      properties: {
        limit: {default: 20, maximum: 20, minimum: 1, type: "integer"},
        platform: {default: "react", enum: ["react", "native"], type: "string"},
      },
      type: "object",
    },
    name: "list_sy-ui_components",
  },
];

const WEBMCP_REGISTRATION_RETRY_MS = 100;
const WEBMCP_REGISTRATION_TIMEOUT_MS = 5000;

export function WebMCPProvider() {
  useEffect(() => {
    const abortController = new AbortController();
    const registeredTools: string[] = [];
    let cleanup: (() => void) | void;
    let didRegister = false;
    let didWarn = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const registerTools = (modelContext: WebMCPModelContext | undefined): boolean => {
      if (!modelContext || didRegister) return didRegister;

      try {
        if (typeof modelContext.provideContext === "function") {
          cleanup = modelContext.provideContext({tools}, {signal: abortController.signal});
          didRegister = true;

          return true;
        }

        if (typeof modelContext.provideTools === "function") {
          cleanup = modelContext.provideTools(tools, {signal: abortController.signal});
          didRegister = true;

          return true;
        }

        if (typeof modelContext.registerTool === "function") {
          for (const tool of tools) {
            modelContext.registerTool(tool);
            registeredTools.push(tool.name);
          }

          didRegister = true;

          return true;
        }
      } catch (error) {
        if (!didWarn) {
          console.warn("Unable to register SY UI WebMCP tools", error);
          didWarn = true;
        }
      }

      return false;
    };

    if (!registerTools(navigator.modelContext)) {
      intervalId = setInterval(() => {
        if (registerTools(navigator.modelContext) && intervalId) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
      }, WEBMCP_REGISTRATION_RETRY_MS);

      timeoutId = setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
      }, WEBMCP_REGISTRATION_TIMEOUT_MS);
    }

    return () => {
      abortController.abort();

      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      if (typeof cleanup === "function") cleanup();

      const modelContext = navigator.modelContext;

      if (typeof modelContext?.unregisterTool === "function") {
        for (const toolName of registeredTools) {
          modelContext.unregisterTool(toolName);
        }
      }
    };
  }, []);

  return null;
}
