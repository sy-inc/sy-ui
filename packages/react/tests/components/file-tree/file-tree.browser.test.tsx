import type {FileTreeRootProps} from "@/components/file-tree";

import {render} from "@sy-inc/testing/browser";
import {cdp, page, userEvent} from "vitest/browser";

import {FileTree} from "@/components/file-tree";

import "../../../../styles/dist/sy-inc.min.css";

type BrowserCDPSession = {
  send(command: string, params?: unknown): Promise<unknown>;
};

type NestedTreeProps = Pick<FileTreeRootProps, "showGuideLines" | "size">;

const browserCdp = () => cdp() as BrowserCDPSession;

const contentOf = (name: string) =>
  page
    .getByRole("row", {name})
    .element()
    .querySelector<HTMLElement>('[data-slot="file-tree-item-content"]')!;

const guideOf = (name: string) => getComputedStyle(contentOf(name), "::before");

const chevronOf = (name: string) =>
  page
    .getByRole("row", {name})
    .element()
    .querySelector<HTMLElement>('[data-slot="file-tree-chevron"]')!;

const centerXOf = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();

  return rect.left + rect.width / 2;
};

/**
 * Absolute x where each ancestor guide hairline starts. Guides are one
 * repeating gradient, so the stops are read back from the resolved computed
 * value: the first opaque stop starts the 1px line inside a step, and the last
 * stop is the step width.
 */
const guideLineXsOf = (name: string) => {
  const content = contentOf(name);
  const guide = guideOf(name);
  const stops = [
    ...guide.backgroundImage.matchAll(/(rgba?\([^)]*\)|oklch\([^)]*\)) (-?[\d.]+)px/g),
  ].map((match) => ({isLine: match[1] !== "rgba(0, 0, 0, 0)", position: parseFloat(match[2]!)}));
  const lineStart = stops.find((stop) => stop.isLine)!.position;
  const step = stops[stops.length - 1]!.position;
  const originX = content.getBoundingClientRect().left + parseFloat(guide.left);

  return Array.from(
    {length: Math.round(parseFloat(guide.width) / step)},
    (_, index) => originX + lineStart + index * step,
  );
};

function NestedTree({showGuideLines = true, size}: NestedTreeProps = {}) {
  return (
    <FileTree
      aria-label="Nested files"
      defaultExpandedKeys={["src", "components"]}
      showGuideLines={showGuideLines}
      size={size}
    >
      <FileTree.Item id="src" title="src">
        <FileTree.Item id="components" title="components">
          <FileTree.Item id="file-tree" title="file-tree.tsx" />
        </FileTree.Item>
      </FileTree.Item>
    </FileTree>
  );
}

describe("FileTree (browser)", () => {
  afterEach(async () => {
    await browserCdp().send("Emulation.setEmulatedMedia", {features: []});
  });

  it("draws one guide step per ancestor level", async () => {
    await render(<NestedTree />);

    const indent = centerXOf(chevronOf("components")) - centerXOf(chevronOf("src"));

    expect(guideOf("src").width).toBe("0px");
    expect(parseFloat(guideOf("components").width)).toBeCloseTo(indent, 1);
    expect(parseFloat(guideOf("file-tree.tsx").width)).toBeCloseTo(2 * indent, 1);
    expect(guideOf("file-tree.tsx").opacity).toBe("0.1");
    expect(guideOf("file-tree.tsx").backgroundImage).toContain("repeating-linear-gradient");
  });

  it("centres every guide line on its ancestor row control", async () => {
    await render(<NestedTree />);

    const expectCentred = (row: string, ancestors: string[]) => {
      const lines = guideLineXsOf(row);

      expect(lines).toHaveLength(ancestors.length);
      ancestors.forEach((ancestor, index) => {
        expect(lines[index]).toBeCloseTo(centerXOf(chevronOf(ancestor)), 0);
      });
    };

    expectCentred("components", ["src"]);
    expectCentred("file-tree.tsx", ["src", "components"]);
  });

  it("steps each level by exactly one indent at every size", async () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const {unmount} = await render(<NestedTree size={size} />);
      const steps = [
        centerXOf(chevronOf("components")) - centerXOf(chevronOf("src")),
        centerXOf(chevronOf("file-tree.tsx")) - centerXOf(chevronOf("components")),
      ];
      const indent = parseFloat(guideOf("components").width);

      expect(steps[0]).toBeCloseTo(indent, 1);
      expect(steps[1]).toBeCloseTo(indent, 1);

      await unmount();
    }
  });

  it("animates the expanded indicator rotation", async () => {
    await render(<NestedTree />);

    const indicator = page
      .getByRole("row", {name: "src"})
      .element()
      .querySelector<HTMLElement>('[data-slot="file-tree-indicator"]')!;
    const styles = getComputedStyle(indicator);

    expect(styles.transitionProperty).toContain("rotate");
    expect(styles.transitionDuration).not.toBe("0s");
  });

  it("does not scale rows while pressed so guides stay aligned", async () => {
    await render(<NestedTree />);

    const content = contentOf("components");
    const before = content.getBoundingClientRect();

    await userEvent.click(content);

    expect(content.getBoundingClientRect().left).toBe(before.left);
    expect(getComputedStyle(content).transform).toBe("none");
  });

  it("holds sm/md/lg row heights", async () => {
    const heightOf = async (size: NestedTreeProps["size"]) => {
      const {unmount} = await render(<NestedTree size={size} />);
      const height = contentOf("src").getBoundingClientRect().height;

      await unmount();

      return height;
    };

    expect(await heightOf("sm")).toBeCloseTo(24, 0);
    expect(await heightOf("md")).toBeCloseTo(28, 0);
    expect(await heightOf("lg")).toBeCloseTo(36, 0);
  });

  it("reveals hover guides only during a real hover", async () => {
    await render(<NestedTree showGuideLines="hover" />);

    expect(guideOf("components").opacity).toBe("0");
    await userEvent.hover(page.getByRole("treegrid", {name: "Nested files"}).element());
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    expect(guideOf("components").opacity).toBe("0.1");
  });

  it("spans guides across the full row height at every size", async () => {
    await render(<NestedTree size="lg" />);

    expect(parseFloat(guideOf("file-tree.tsx").height)).toBeCloseTo(
      contentOf("file-tree.tsx").getBoundingClientRect().height,
      1,
    );
  });

  it("leaves scrolling and width to the consumer", async () => {
    await render(<NestedTree />);

    const styles = getComputedStyle(page.getByRole("treegrid", {name: "Nested files"}).element());

    expect(styles.overflowY).toBe("visible");
    expect(styles.maxHeight).toBe("none");
  });

  it("omits guides when disabled", async () => {
    await render(<NestedTree showGuideLines={false} />);

    expect(guideOf("file-tree.tsx").display).toBe("none");
  });

  it("disables transitions for system reduced motion", async () => {
    await browserCdp().send("Emulation.setEmulatedMedia", {
      features: [{name: "prefers-reduced-motion", value: "reduce"}],
    });
    await render(<NestedTree />);

    const indicator = page
      .getByRole("row", {name: "src"})
      .element()
      .querySelector<HTMLElement>('[data-slot="file-tree-indicator"]')!;

    expect(getComputedStyle(contentOf("src")).transitionProperty).toBe("none");
    expect(getComputedStyle(indicator).transitionProperty).toBe("none");
    expect(guideOf("components").transitionProperty).toBe("none");
  });
});
