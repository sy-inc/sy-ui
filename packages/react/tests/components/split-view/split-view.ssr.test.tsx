import {ssrSmoke} from "@sy-inc/testing/helpers";
import {renderToString} from "react-dom/server";

import {SplitView} from "@/components/split-view";

import {WorkspaceFixture} from "./fixtures";

describe("SplitView SSR", () => {
  it("renders all panes and hydrates the selected pane without mismatch", async () => {
    const {html} = await ssrSmoke(
      <WorkspaceFixture activePane="end" mediumBehavior="replace-content" />,
    );

    expect(html).toContain('data-active="end"');
    expect(html).toContain('data-medium-behavior="replace-content"');
    expect(html).toContain("Keep this draft");
    expect(html).toContain("Keep this note");
  });

  it("renders without browser measurement APIs or layout notifications", () => {
    const onLayoutChange = vi.fn();
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");

    Object.defineProperty(globalThis, "window", {configurable: true, value: undefined});

    try {
      const html = renderToString(
        <SplitView activePane="end" onLayoutChange={onLayoutChange}>
          <SplitView.Content aria-label="Editor">Editor</SplitView.Content>
          <SplitView.Pane aria-label="Closed tools" isOpen={false} position="end">
            Retained tools
          </SplitView.Pane>
        </SplitView>,
      );

      expect(html).toContain("Retained tools");
      expect(html).toContain('hidden=""');
      expect(html).not.toContain("data-motion");
      expect(onLayoutChange).not.toHaveBeenCalled();
    } finally {
      if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
    }
  });
});
