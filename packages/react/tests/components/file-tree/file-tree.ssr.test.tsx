import {ssrSmoke} from "@sy-inc/testing/helpers";

import {FileTree} from "@/components/file-tree";

describe("FileTree SSR", () => {
  it("renders without hydration mismatch with an expanded item", async () => {
    const {html} = await ssrSmoke(
      <FileTree aria-label="Project files" defaultExpandedKeys={["src"]}>
        <FileTree.Item id="src" title="src">
          <FileTree.Item id="index" title="index.ts" />
        </FileTree.Item>
      </FileTree>,
    );

    expect(html).toContain('data-slot="file-tree"');
    expect(html).toContain('data-slot="file-tree-item-content"');
    expect(html).toContain('aria-expanded="true"');
  });
});
