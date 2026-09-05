import {readFile, readdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

export const REQUIRED_COMPONENT_DOCS = [
  "cell-color-picker",
  "action-bar",
  "chat-message",
  "bottom-bar",
  "segment",
  "navbar",
  "sidebar",
  "cell-slider",
  "carousel",
  "time-picker",
  "stepper",
  "timeline",
  "text-shimmer",
  "rich-text-editor",
  "prompt-input",
  "sheet",
  "input-phone",
  "widget",
  "radio-button-group",
  "list-view",
  "item-card",
  "item-card-group",
  "pressable-feedback",
  "resizable",
  "file-tree",
  "cell-select",
  "marquee",
  "kpi",
  "kpi-group",
  "overflow-text",
];

const LANGUAGES = ["en", "cn"];

async function findMdx(directory, slug) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const target = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const found = await findMdx(target, slug);

      if (found) return found;
    } else if (entry.name === `${slug}.mdx`) {
      return target;
    }
  }
}

export async function getComponentDocGaps(contentRoot) {
  const gaps = [];

  for (const language of LANGUAGES) {
    const componentsDirectory = path.join(contentRoot, language, "react", "components");
    let pages;

    try {
      ({pages} = JSON.parse(await readFile(path.join(componentsDirectory, "meta.json"), "utf8")));
      if (!Array.isArray(pages)) throw new Error('"pages" must be an array');
    } catch (error) {
      gaps.push(`${language}: invalid meta.json (${error.message})`);
      continue;
    }

    for (const slug of REQUIRED_COMPONENT_DOCS) {
      const mdx = await findMdx(componentsDirectory, slug);

      if (!mdx) {
        gaps.push(`${language}: missing ${slug}.mdx`);
        continue;
      }

      const page = path.relative(componentsDirectory, mdx).slice(0, -4);

      if (!pages.includes(page))
        gaps.push(`${language}: ${page}.mdx is not registered in meta.json`);
    }
  }

  return gaps;
}

async function main() {
  const contentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../content/docs");
  const gaps = await getComponentDocGaps(contentRoot);

  if (gaps.length) {
    console.error(`Component documentation coverage check failed:\n- ${gaps.join("\n- ")}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Component documentation coverage check passed (${REQUIRED_COMPONENT_DOCS.length} components, ${LANGUAGES.length} languages).`,
    );
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main();
