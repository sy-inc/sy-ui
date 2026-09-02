import type {Selection} from "@react-types/shared";

import {render, screen, setupUser, waitFor} from "@sy-inc/testing/helpers";
import {useDragAndDrop, useTreeData} from "react-aria-components";

import {Checkbox} from "@/components/checkbox";
import DefaultFileTree, {FileTree} from "@/components/file-tree";

const renderTree = (props: Omit<FileTree["RootProps"], "children"> = {}) =>
  render(
    <FileTree
      aria-label="Project files"
      defaultExpandedKeys={["src"]}
      selectionMode="single"
      {...props}
    >
      <FileTree.Section>
        <FileTree.Header>Project</FileTree.Header>
        <FileTree.Item icon={<span>folder</span>} id="src" title="src">
          <FileTree.Item id="index" title="index.ts" />
        </FileTree.Item>
        <FileTree.Item id="package" title="package.json" />
      </FileTree.Section>
    </FileTree>,
  );

function DraggableTree() {
  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
  });

  return (
    <FileTree aria-label="Draggable files" dragAndDropHooks={dragAndDropHooks}>
      <FileTree.Item id="readme" title="README.md" />
    </FileTree>
  );
}

function ReorderableTree() {
  const tree = useTreeData<{id: string; name: string}>({
    getKey: (item) => item.id,
    initialItems: [
      {id: "a", name: "a.ts"},
      {id: "b", name: "b.ts"},
    ],
  });
  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    onReorder(event) {
      if (event.target.dropPosition === "before") tree.moveBefore(event.target.key, event.keys);
      else tree.moveAfter(event.target.key, event.keys);
    },
  });

  return (
    <FileTree aria-label="Reorderable files" dragAndDropHooks={dragAndDropHooks} items={tree.items}>
      {(node) => <FileTree.Item id={node.key} title={node.value.name} />}
    </FileTree>
  );
}

describe("FileTree", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("exports the compound tree as both default and named FileTree", () => {
    expect(DefaultFileTree).toBe(FileTree);
    expect(FileTree.Root).toBeDefined();
    expect(FileTree.Section).toBeDefined();
    expect(FileTree.Header).toBeDefined();
    expect(FileTree.Item).toBeDefined();
    expect(FileTree.Indicator).toBeDefined();
  });

  it("exposes treegrid roles, hierarchy aria, defaults, and stable slots", () => {
    renderTree();

    const tree = screen.getByRole("treegrid", {name: "Project files"});
    const src = screen.getByRole("row", {name: "src"});

    expect(tree).toHaveAttribute("data-slot", "file-tree");
    expect(tree.className).toEqual(expect.stringContaining("file-tree--md"));
    expect(tree.className).not.toEqual(expect.stringContaining("guides"));
    expect(src).toHaveAttribute("aria-expanded", "true");
    expect(src).toHaveAttribute("aria-level", "1");
    expect(src).toHaveAttribute("aria-posinset", "1");
    expect(src).toHaveAttribute("aria-setsize", "2");
    expect(document.querySelector('[data-slot="file-tree-item-content"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="file-tree-indicator"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="file-tree-icon"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="file-tree-label"]')).not.toBeNull();
    expect(screen.getByRole("button", {name: /collapse item/i})).toHaveAttribute("slot", "chevron");
  });

  it("supports RAC ArrowLeft, ArrowRight, ArrowDown, and focus navigation", async () => {
    renderTree({defaultExpandedKeys: []});

    const src = screen.getByRole("row", {name: "src"});
    const packageFile = screen.getByRole("row", {name: "package.json"});

    await user.click(src);
    expect(src).toHaveFocus();
    expect(src).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{ArrowRight}");
    expect(src).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("row", {name: "index.ts"})).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(src).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(src).toHaveAttribute("aria-expanded", "false");
    expect(packageFile).toBeInTheDocument();
  });

  it("calls expansion and selection callbacks", async () => {
    const onExpandedChange = vi.fn();
    const onSelectionChange = vi.fn<(keys: Selection) => void>();

    renderTree({defaultExpandedKeys: [], onExpandedChange, onSelectionChange});

    const src = screen.getByRole("row", {name: "src"});
    const packageFile = screen.getByRole("row", {name: "package.json"});

    await user.click(src);
    await user.keyboard("{ArrowRight}");
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(["src"]));

    await user.click(packageFile);
    const selection = onSelectionChange.mock.calls.at(-1)?.[0];

    expect(selection === "all" ? null : [...(selection ?? [])]).toEqual(["package"]);
  });

  it("supports a controlled expandedKeys prop", async () => {
    const onExpandedChange = vi.fn();
    const {rerender} = renderTree({expandedKeys: [], onExpandedChange});

    await user.click(screen.getByRole("row", {name: "src"}));
    await user.keyboard("{ArrowRight}");

    // Controlled: the parent owns the value, so the row stays collapsed until it feeds one back.
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(["src"]));
    expect(screen.queryByRole("row", {name: "index.ts"})).not.toBeInTheDocument();

    rerender(
      <FileTree aria-label="Project files" expandedKeys={["src"]} selectionMode="single">
        <FileTree.Section>
          <FileTree.Header>Project</FileTree.Header>
          <FileTree.Item icon={<span>folder</span>} id="src" title="src">
            <FileTree.Item id="index" title="index.ts" />
          </FileTree.Item>
          <FileTree.Item id="package" title="package.json" />
        </FileTree.Section>
      </FileTree>,
    );

    expect(screen.getByRole("row", {name: "index.ts"})).toBeInTheDocument();
  });

  it("supports multiple selection and dynamic collections", async () => {
    const onSelectionChange = vi.fn();

    renderTree({onSelectionChange, selectionMode: "multiple"});

    await user.click(screen.getByRole("row", {name: "src"}));
    await user.click(screen.getByRole("row", {name: "package.json"}));

    expect(onSelectionChange).toHaveBeenCalledTimes(2);

    render(
      <FileTree aria-label="Dynamic files" items={[{id: "readme", name: "README.md"}]}>
        {(file) => <FileTree.Item title={file.name} />}
      </FileTree>,
    );

    expect(screen.getByRole("row", {name: "README.md"})).toBeInTheDocument();
  });

  it("supports a composable replacement Indicator without RAC expand warnings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <FileTree aria-label="Custom indicator files" defaultExpandedKeys={["src"]}>
        <FileTree.Item
          id="src"
          title="src"
          indicator={
            <FileTree.Indicator>
              <span data-testid="custom-indicator">custom</span>
            </FileTree.Indicator>
          }
        >
          <FileTree.Item id="index" title="index.ts" />
        </FileTree.Item>
      </FileTree>,
    );

    expect(screen.getByTestId("custom-indicator")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /collapse item/i})).toHaveAttribute("slot", "chevron");
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("Expandable tree items"));

    warn.mockRestore();
  });

  it("provides an accessible RAC drag button without drag warnings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(<DraggableTree />);

    const dragButton = screen.getByRole("button", {name: /drag item/i});

    expect(dragButton).toHaveAttribute("slot", "drag");
    expect(dragButton.querySelector("svg")).not.toBeNull();
    expect(document.querySelector('[data-slot="file-tree-drag-handle"]')).not.toBeNull();
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("Draggable items in a Tree"));

    warn.mockRestore();
  });

  it("drops a keyboard drag onto a reorder target", async () => {
    render(<ReorderableTree />);

    const order = () => screen.getAllByRole("row").map((row) => row.textContent);

    expect(order()).toEqual(["a.ts", "b.ts"]);

    screen
      .getAllByRole("row")[0]!
      .querySelector<HTMLButtonElement>('[data-slot="file-tree-drag-handle"]')!
      .focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(document.activeElement).toHaveAccessibleName("Insert after b.ts");
    });

    await user.keyboard("{Enter}");

    expect(order()).toEqual(["b.ts", "a.ts"]);
  });

  it("supports selection checkboxes through the RAC selection slot", async () => {
    render(
      <FileTree aria-label="Files with checkboxes" selectionMode="multiple">
        <FileTree.Item
          id="readme"
          title="README.md"
          selection={
            <Checkbox aria-label="Select README" slot="selection">
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Content>
            </Checkbox>
          }
        />
      </FileTree>,
    );

    const row = screen.getByRole("row", {name: "README.md"});

    await user.click(screen.getByRole("checkbox", {name: /Select README/}));

    expect(row).toHaveAttribute("data-selected", "true");
  });

  it("exposes disabled state, size, and guide-line modifiers", () => {
    renderTree({disabledKeys: ["package"], showGuideLines: false, size: "sm"});

    const tree = screen.getByRole("treegrid", {name: "Project files"});

    expect(tree.className).toEqual(expect.stringContaining("file-tree--no-guides"));
    expect(tree.className).toEqual(expect.stringContaining("file-tree--sm"));
    expect(screen.getByRole("row", {name: "package.json"})).toHaveAttribute(
      "data-disabled",
      "true",
    );

    const {container} = renderTree({showGuideLines: "hover"});

    expect(container.querySelector('[data-slot="file-tree"]')?.className).toEqual(
      expect.stringContaining("file-tree--guides-hover"),
    );
  });

  it("renders a chevron button only for items with children", () => {
    renderTree();

    expect(
      screen.getByRole("row", {name: "src"}).querySelector("button[slot=chevron]"),
    ).not.toBeNull();
    expect(
      screen.getByRole("row", {name: "package.json"}).querySelector("button[slot=chevron]"),
    ).toBeNull();
    expect(
      screen
        .getByRole("row", {name: "package.json"})
        .querySelector('[data-slot="file-tree-chevron"]'),
    ).not.toBeNull();
  });
});
