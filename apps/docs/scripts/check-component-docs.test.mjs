import assert from "node:assert/strict";
import {mkdir, mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";

import {REQUIRED_COMPONENT_DOCS, getComponentDocGaps} from "./check-component-docs.mjs";

test("reports missing and unregistered component documentation", async () => {
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("action-bar"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("segment"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("input-phone"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("list-view"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("item-card"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("pressable-feedback"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("text-shimmer"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("sheet"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("radio-button-group"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("file-tree"));
  assert.ok(REQUIRED_COMPONENT_DOCS.includes("resizable"));
  const root = await mkdtemp(path.join(tmpdir(), "sy-docs-"));

  try {
    const missingSlug = REQUIRED_COMPONENT_DOCS[0];
    const registeredSlugs = REQUIRED_COMPONENT_DOCS.slice(1);

    for (const language of ["en", "cn"]) {
      const components = path.join(root, language, "react", "components");

      await mkdir(path.join(components, "(navigation)"), {recursive: true});
      await writeFile(path.join(components, "meta.json"), JSON.stringify({pages: []}));
      for (const slug of registeredSlugs) {
        await writeFile(
          path.join(components, "(navigation)", `${slug}.mdx`),
          "---\ntitle: Test\n---\n",
        );
      }
    }

    const gaps = await getComponentDocGaps(root);

    assert.deepEqual(gaps, [
      `en: missing ${missingSlug}.mdx`,
      ...registeredSlugs.map(
        (slug) => `en: (navigation)/${slug}.mdx is not registered in meta.json`,
      ),
      `cn: missing ${missingSlug}.mdx`,
      ...registeredSlugs.map(
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
      await writeFile(path.join(components, "(navigation)", "action-bar.mdx"), "");
    }
    assert.deepEqual(await getComponentDocGaps(root), []);
  } finally {
    await rm(root, {force: true, recursive: true});
  }
});
