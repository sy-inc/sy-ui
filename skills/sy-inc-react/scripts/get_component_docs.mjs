#!/usr/bin/env node
/**
 * Get complete component documentation (MDX) for SY INC v3 components.
 *
 * Usage:
 *   node get_component_docs.mjs Button
 *   node get_component_docs.mjs Button Card TextField
 *
 * Output:
 *   MDX documentation including imports, usage, variants, props, examples
 */

import {findLocal, kebab} from "./local_repo.mjs";

const API_BASE = process.env.SY_INC_API_BASE || "https://mcp-api.sy-inc.com";
const FALLBACK_BASE = process.env.SY_INC_DOCS_BASE || "https://sy-inc.com";
const APP_PARAM = "app=react-skills";

/**
 * Convert PascalCase to kebab-case.
 */
function toKebabCase(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Fetch data from SY INC API with app parameter for analytics.
 */
async function fetchApi(endpoint, method = "GET", body = null) {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${API_BASE}${endpoint}${separator}${APP_PARAM}`;

  try {
    const options = {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SY INC-Skill/1.0",
      },
      method,
      signal: AbortSignal.timeout(30000),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetch MDX directly from v3.sy-inc.com as fallback.
 */
async function fetchFallback(component) {
  const kebabName = toKebabCase(component);
  const url = `${FALLBACK_BASE}/docs/react/components/${kebabName}.mdx`;

  try {
    const response = await fetch(url, {
      headers: {"User-Agent": "SY INC-Skill/1.0"},
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return {component, error: `Failed to fetch docs for ${component}`};
    }

    const content = await response.text();

    return {
      component,
      content,
      contentType: "mdx",
      source: "fallback",
      url,
    };
  } catch {
    return {component, error: `Failed to fetch docs for ${component}`};
  }
}

/**
 * Main function to get component documentation.
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node get_component_docs.mjs <Component1> [Component2] ...");
    console.error("Example: node get_component_docs.mjs Button Card");
    process.exit(1);
  }

  const components = args;

  const localResults = components.map((component) => {
    const local = findLocal("apps/docs/content/docs/en/react/components", `${kebab(component)}.mdx`);
    return local && {component, content: local.content, contentType: "mdx", path: local.path, source: "local"};
  });
  if (localResults.every(Boolean)) {
    if (localResults.length === 1) console.log(localResults[0].content);
    else console.log(JSON.stringify({results: localResults}, null, 2));
    return;
  }
  const remoteComponents = components.filter((_, index) => !localResults[index]);

  // Try API first - use POST /v1/components/docs for batch requests
  console.error(`# Fetching docs for: ${remoteComponents.join(", ")}...`);
  const data = await fetchApi("/v1/components/docs", "POST", {components: remoteComponents});

  if (data && data.results) {
    data.results = components.map((component, index) =>
      localResults[index] || data.results.find((result) => result.component === component),
    );
    // Output results
    if (data.results.length === 1) {
      // Single component - output content directly for easier reading
      const result = data.results[0];

      if (result.content) {
        console.log(result.content);
      } else if (result.error) {
        console.error(`# Error for ${result.component}: ${result.error}`);
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      // Multiple components - output as JSON array
      console.log(JSON.stringify(data, null, 2));
    }

    return;
  }

  // Fallback to individual component fetches
  console.error("# API failed, using fallback...");
  const results = [];

  for (const [index, component] of components.entries()) {
    results.push(localResults[index] || await fetchFallback(component));
  }

  // Output results
  if (results.length === 1) {
    // Single component - output content directly for easier reading
    const result = results[0];

    if (result.content) {
      console.log(result.content);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    // Multiple components - output as JSON array
    console.log(JSON.stringify(results, null, 2));
  }
}

main();
