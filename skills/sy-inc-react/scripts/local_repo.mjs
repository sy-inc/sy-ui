import {existsSync, readdirSync, readFileSync, statSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

export function repoRoot() {
  let dir = resolve(process.env.SY_INC_REPO_ROOT || dirname(fileURLToPath(import.meta.url)));

  while (dirname(dir) !== dir) {
    if (existsSync(join(dir, "pnpm-workspace.yaml")) && existsSync(join(dir, "packages/react"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return null;
}

export function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function readLocal(relativePath) {
  const root = repoRoot();
  const path = root && join(root, relativePath);
  return path && existsSync(path) ? {content: readFileSync(path, "utf8"), path} : null;
}

export function findLocal(base, fileName) {
  const root = repoRoot();
  const start = root && join(root, base);
  if (!start || !existsSync(start)) return null;

  const visit = (dir) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = visit(path);
        if (found) return found;
      } else if (entry.name === fileName) {
        return {content: readFileSync(path, "utf8"), path};
      }
    }
    return null;
  };
  return visit(start);
}

export function localComponents() {
  const root = repoRoot();
  const dir = root && join(root, "packages/react/src/components");
  if (!dir || !existsSync(dir)) return null;
  return readdirSync(dir)
    .filter((name) => !name.startsWith("-") && statSync(join(dir, name)).isDirectory())
    .filter((name) => existsSync(join(dir, name, `${name}.tsx`)))
    .sort();
}
