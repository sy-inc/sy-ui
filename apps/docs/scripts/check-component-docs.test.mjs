import assert from "node:assert/strict";
import {mkdtemp, mkdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {getComponentDocGaps, REQUIRED_COMPONENT_DOCS} from "./check-component-docs.mjs";

test("reports missing and unregistered component documentation", async () => {
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("segment"));
  const root = await mkdtemp(path.join(tmpdir(), "sy-docs-"));
  try {
    for (const language of ["en", "cn"]) {
      const components = path.join(root, language, "react", "components");
      await mkdir(path.join(components, "(navigation)"), {recursive: true});
      await writeFile(path.join(components, "meta.json"), JSON.stringify({pages: []}));
      for (const slug of REQUIRED_COMPONENT_DOCS.slice(1)) {
        await writeFile(
          path.join(components, "(navigation)", `${slug}.mdx`),
          "---\ntitle: Test\n---\n",
        );
      }
    }

    const gaps = await getComponentDocGaps(root);
    assert.deepEqual(gaps, [
      "en: missing bottom-bar.mdx",
      ...REQUIRED_COMPONENT_DOCS.slice(1).map(
        (slug) => `en: (navigation)/${slug}.mdx is not registered in meta.json`,
      ),
      "cn: missing bottom-bar.mdx",
      ...REQUIRED_COMPONENT_DOCS.slice(1).map(
        (slug) => `cn: (navigation)/${slug}.mdx is not registered in meta.json`,
      ),
    ]);

    for (const language of ["en", "cn"]) {
      const components = path.join(root, language, "react", "components");
      await writeFile(
        path.join(components, "meta.json"),
        JSON.stringify({pages: REQUIRED_COMPONENT_DOCS.map((slug) => `(navigation)/${slug}`)}),
      );
      await writeFile(path.join(components, "(navigation)", "bottom-bar.mdx"), "");
    }
    assert.deepEqual(await getComponentDocGaps(root), []);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
