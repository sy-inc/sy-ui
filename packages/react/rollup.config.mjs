import fs from "fs";
import path from "path";

import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import {defineConfig} from "rollup";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

// Custom plugin to replace version placeholder
const replaceVersion = () => ({
  name: "replace-version",
  transform(code, id) {
    if (id.includes("version.ts") || id.includes("version.js")) {
      return code.replace("__SY_INC_VERSION__", packageJson.version);
    }

    return null;
  },
});

// Rollup hoists `export {x} from "pkg"` up into whichever barrel re-exports it (dist/index.js),
// so a client-only package would land in the root entry and break Server Components importing it.
// Inside "use client" modules, bind such re-exports to local consts: rollup can't hoist those.
const CLIENT_ONLY_REEXPORT =
  /^(react-aria-components|react-aria|react-stately)$|^@react-(aria|stately)\//;
const keepClientReexports = () => ({
  name: "keep-client-reexports",
  transform(code, id) {
    if (!/^\s*["']use client["']/.test(code)) return null;

    let output = code;
    let count = 0;
    const nodes = this.parse(code).body.filter(
      (node) =>
        node.source &&
        CLIENT_ONLY_REEXPORT.test(node.source.value) &&
        node.type.startsWith("Export"),
    );

    for (const node of nodes.reverse()) {
      if (node.type !== "ExportNamedDeclaration") {
        this.error(
          `${id}: \`export *\` from "${node.source.value}" can't be kept client-side; list the names.`,
        );
      }
      const specs = node.specifiers.map((spec) => ({
        alias: `__client${count++}`,
        exported: spec.exported.name,
        local: spec.local.name,
      }));
      const replacement = [
        `import {${specs.map((s) => `${s.local} as ${s.alias}`).join(", ")}} from ${JSON.stringify(node.source.value)};`,
        `const ${specs.map((s) => `${s.alias}$ = ${s.alias}`).join(", ")};`,
        `export {${specs.map((s) => `${s.alias}$ as ${s.exported}`).join(", ")}};`,
      ].join("\n");

      output = output.slice(0, node.start) + replacement + output.slice(node.end);
    }

    return count ? {code: output, map: null} : null;
  },
});

// Get all component directories
const componentDirs = fs.readdirSync("./src/components").filter((file) => {
  const fullPath = path.join("./src/components", file);

  return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, "index.ts"));
});

// Create individual entry points for each component
const componentEntries = componentDirs.reduce((acc, dir) => {
  acc[`components/${dir}/index`] = `src/components/${dir}/index.ts`;

  return acc;
}, {});

// All entry points
const input = {
  index: "src/index.ts",
  ...componentEntries,
};

const external = [
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.dependencies || {}),
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^react-phone-number-input($|\/)/,
  /^@react-aria/,
  /^@react-stately/,
  /^@react-types\//,
  /^@internationalized\//,
  /^react-aria($|\/)/,
  /^react-aria-components($|\/)/,
  /^tailwind-merge/,
  /^tailwind-variants/,
];

const plugins = [
  peerDepsExternal(),
  resolve({
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  }),
  replaceVersion(),
  babel({
    babelHelpers: "bundled",
    exclude: "node_modules/**",
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    presets: [["@babel/preset-react", {runtime: "automatic"}], "@babel/preset-typescript"],
  }),
  keepClientReexports(),
  postcss({
    extract: true,
    minimize: true,
    modules: false,
  }),
];

export default defineConfig({
  external,
  input,
  onwarn(warning, warn) {
    // Ignore "use client" directive warnings
    if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
      return;
    }
    warn(warning);
  },
  output: {
    dir: "dist",
    // Disable sourcemaps
    // Optimize for tree shaking
    exports: "named",
    format: "es",
    hoistTransitiveImports: false,
    preserveModules: true,
    preserveModulesRoot: "src",
    sourcemap: false,
  },
  plugins,
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
  },
});
