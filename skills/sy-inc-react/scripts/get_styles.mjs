#!/usr/bin/env node
/**
 * Get CSS styles (BEM classes) for SY INC v3 components.
 *
 * Usage:
 *   node get_styles.mjs Button
 *   node get_styles.mjs Button Card Chip
 *
 * Output:
 *   CSS file content with BEM classes and GitHub URL for each component
 */

import {kebab, readLocal} from "./local_repo.mjs";

const API_BASE = process.env.SY_INC_API_BASE || "https://mcp-api.sy-inc.com";
const GITHUB_RAW_BASE = process.env.SY_INC_GITHUB_RAW_BASE || "https://raw.githubusercontent.com/sy-inc/sy-inc/refs/heads/v3";
const APP_PARAM = "app=react-skills";

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
      console.error(`# API Error: HTTP ${response.status}`);

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`# API Error: ${error.message}`);

    return null;
  }
}

/**
 * Fetch CSS styles directly from GitHub as fallback.
 */
async function fetchGithubFallback(component) {
  // Try common patterns for style paths
  const patterns = [
    `packages/styles/src/components/${component.toLowerCase()}.css`,
    `packages/styles/components/${component.toLowerCase()}.css`,
  ];

  for (const path of patterns) {
    const url = `${GITHUB_RAW_BASE}/${path}`;

    try {
      const response = await fetch(url, {
        headers: {"User-Agent": "SY INC-Skill/1.0"},
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const content = await response.text();

        return {
          component,
          filePath: path,
          githubUrl: `https://github.com/sy-inc/sy-inc/blob/v3/${path}`,
          source: "fallback",
          stylesCode: content,
        };
      }
    } catch {
      continue;
    }
  }

  return {component, error: `Failed to fetch styles for ${component}`};
}

/**
 * Main function to get CSS styles for specified components.
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node get_styles.mjs <Component1> [Component2] ...");
    console.error("Example: node get_styles.mjs Button Card");
    process.exit(1);
  }

  const components = args;

  const localResults = components.map((component) => {
    const slug = kebab(component);
    const local = readLocal(`packages/styles/components/${slug}.css`) ||
      readLocal(`packages/styles/src/components/${slug}/${slug}.styles.ts`) ||
      readLocal(`packages/react/src/components/${slug}/${slug}.styles.ts`);
    return local && {component, filePath: local.path, source: "local", stylesCode: local.content};
  });
  if (localResults.every(Boolean)) {
    const data = {results: localResults};
    if (data.results.length === 1) {
      console.log(`/* File: ${data.results[0].filePath} */`);
      console.log();
      console.log(data.results[0].stylesCode);
    } else console.log(JSON.stringify(data, null, 2));
    return;
  }
  const remoteComponents = components.filter((_, index) => !localResults[index]);

  // Try API first
  console.error(`# Fetching styles for: ${remoteComponents.join(", ")}...`);
  const data = await fetchApi("/v1/components/styles", "POST", {components: remoteComponents});

  if (data && data.results) {
    data.results = components.map((component, index) =>
      localResults[index] || data.results.find((result) => result.component === component),
    );
    for (const result of data.results) {
      result.source = "api";
    }

    // Output results
    if (data.results.length === 1) {
      const result = data.results[0];

      if (result.stylesCode) {
        console.log(`/* File: ${result.filePath || "unknown"} */`);
        console.log(`/* GitHub: ${result.githubUrl || "unknown"} */`);
        console.log();
        console.log(result.stylesCode);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      console.log(JSON.stringify(data, null, 2));
    }

    return;
  }

  // Fallback to GitHub direct fetch
  console.error("# API failed, using GitHub fallback...");
  const results = [];

  for (const [index, component] of components.entries()) {
    results.push(localResults[index] || await fetchGithubFallback(component));
  }

  if (results.length === 1) {
    const result = results[0];

    if (result.stylesCode) {
      console.log(`/* File: ${result.filePath || "unknown"} */`);
      console.log(`/* GitHub: ${result.githubUrl || "unknown"} */`);
      console.log();
      console.log(result.stylesCode);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log(JSON.stringify({results}, null, 2));
  }
}

main();
