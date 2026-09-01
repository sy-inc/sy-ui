import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";
import {Collection, isTextDropItem, useDragAndDrop, useTreeData} from "react-aria-components";

import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {CloseButton} from "../close-button";
import {SearchField} from "../search-field";

import {FileTree} from "./index";

const meta: Meta<typeof FileTree> = {
  component: FileTree,
  parameters: {layout: "centered"},
  tags: ["autodocs"],
  title: "Components/FileTree",
};

export default meta;

type Story = StoryObj<typeof FileTree>;
type TreeProps = Omit<FileTree["RootProps"], "children">;

const folderIcon = <Icon aria-hidden="true" className="size-4" icon="gravity-ui:folder" />;
const fileIcon = <Icon aria-hidden="true" className="size-4" icon="gravity-ui:file" />;

const selection = (name: string) => (
  <Checkbox aria-label={`Select ${name}`} slot="selection">
    <Checkbox.Content>
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Content>
  </Checkbox>
);

function ProjectStructureTree(props: TreeProps) {
  return (
    <FileTree
      aria-label="Project structure"
      defaultExpandedKeys={[
        "apps",
        "frontend",
        "fe-src",
        "fe-app",
        "api",
        "api-src",
        "packages",
        "packages-react",
        "claude",
      ]}
      {...props}
    >
      <FileTree.Item id="apps" title="apps">
        <FileTree.Item id="frontend" title="frontend">
          <FileTree.Item id="fe-package" title="package.json" />
          <FileTree.Item id="fe-tsconfig" title="tsconfig.json" />
          <FileTree.Item id="fe-src" title="src">
            <FileTree.Item id="fe-app" title="app">
              <FileTree.Item id="fe-layout" title="layout.tsx" />
              <FileTree.Item id="fe-page" title="page.tsx" />
            </FileTree.Item>
          </FileTree.Item>
        </FileTree.Item>
        <FileTree.Item id="api" title="api">
          <FileTree.Item id="api-package" title="package.json" />
          <FileTree.Item id="api-src" title="src">
            <FileTree.Item id="api-index" title="index.ts" />
            <FileTree.Item id="api-routes" title="routes.ts" />
          </FileTree.Item>
        </FileTree.Item>
      </FileTree.Item>
      <FileTree.Item id="packages" title="packages">
        <FileTree.Item id="packages-react" title="react">
          <FileTree.Item id="pr-package" title="package.json" />
          <FileTree.Item id="pr-src" title="src">
            <FileTree.Item id="pr-components" title="components">
              <FileTree.Item id="pr-file-tree" title="file-tree.tsx" />
            </FileTree.Item>
          </FileTree.Item>
        </FileTree.Item>
      </FileTree.Item>
      <FileTree.Item id="claude" title=".claude">
        <FileTree.Item id="claude-skills" title="skills">
          <FileTree.Item id="claude-frontend" title="frontend.md" />
        </FileTree.Item>
      </FileTree.Item>
      <FileTree.Item id="readme" title="README.md" />
      <FileTree.Item id="agents" title="AGENTS.md" />
      <FileTree.Item id="root-package" title="package.json" />
      <FileTree.Item id="root-tsconfig" title="tsconfig.json" />
    </FileTree>
  );
}

function ProjectWithIcons(props: TreeProps) {
  return (
    <FileTree
      aria-label="Project with icons"
      defaultExpandedKeys={["src", "components", "utils"]}
      {...props}
    >
      <FileTree.Item icon={folderIcon} id="src" title="src">
        <FileTree.Item icon={folderIcon} id="components" title="components">
          <FileTree.Item icon={fileIcon} id="button-tsx" title="button.tsx" />
          <FileTree.Item icon={fileIcon} id="card-tsx" title="card.tsx" />
          <FileTree.Item icon={fileIcon} id="button-css" title="button.css" />
        </FileTree.Item>
        <FileTree.Item icon={folderIcon} id="utils" title="utils">
          <FileTree.Item icon={fileIcon} id="compose-ts" title="compose.ts" />
          <FileTree.Item icon={fileIcon} id="cn-ts" title="cn.ts" />
        </FileTree.Item>
      </FileTree.Item>
      <FileTree.Item icon={fileIcon} id="index-ts" title="index.ts" />
      <FileTree.Item icon={fileIcon} id="package-json" title="package.json" />
      <FileTree.Item icon={fileIcon} id="tsconfig-json" title="tsconfig.json" />
      <FileTree.Item icon={fileIcon} id="readme-md" title="README.md" />
      <FileTree.Item icon={fileIcon} id="env" title=".env" />
    </FileTree>
  );
}

function DynamicProjectTree(props: TreeProps) {
  return (
    <FileTree
      aria-label="Dynamic file tree"
      defaultExpandedKeys={["apps", "frontend", "packages", "react"]}
      {...props}
    >
      <FileTree.Item id="apps" title="apps">
        <FileTree.Item id="frontend" title="frontend">
          <FileTree.Item id="layout" title="layout.tsx" />
          <FileTree.Item id="page" title="page.tsx" />
          <FileTree.Item id="globals" title="globals.css" />
        </FileTree.Item>
        <FileTree.Item id="api" title="api" />
      </FileTree.Item>
      <FileTree.Item id="packages" title="packages">
        <FileTree.Item id="react" title="react">
          <FileTree.Item id="index" title="index.ts" />
          <FileTree.Item id="package" title="package.json" />
        </FileTree.Item>
      </FileTree.Item>
      <FileTree.Item id="readme" title="README.md" />
      <FileTree.Item id="agents" title="AGENTS.md" />
      <FileTree.Item id="root-package" title="package.json" />
    </FileTree>
  );
}

function SelectableFileTree() {
  const [selected, setSelected] = React.useState<string[]>([]);

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <span aria-live="polite">Selected: {selected.length ? selected.join(", ") : "none"}</span>
      <FileTree
        aria-label="Selectable file tree"
        defaultExpandedKeys={["src", "components"]}
        selectedKeys={selected}
        selectionMode="multiple"
        onSelectionChange={(keys) => setSelected(keys === "all" ? ["all"] : [...keys].map(String))}
      >
        <FileTree.Item id="src" selection={selection("src")} title="src">
          <FileTree.Item id="components" selection={selection("components")} title="components">
            <FileTree.Item id="button" selection={selection("button.tsx")} title="button.tsx" />
            <FileTree.Item id="card" selection={selection("card.tsx")} title="card.tsx" />
            <FileTree.Item id="modal" selection={selection("modal.tsx")} title="modal.tsx" />
          </FileTree.Item>
          <FileTree.Item id="utils" selection={selection("utils")} title="utils" />
        </FileTree.Item>
        <FileTree.Item id="readme" selection={selection("README.md")} title="README.md" />
      </FileTree>
    </div>
  );
}

export const Default: Story = {
  render: () => <ProjectStructureTree className="max-h-[420px] w-80" />,
};

export const WithIcons: Story = {
  render: () => <ProjectWithIcons className="w-[300px]" />,
};

export const MultipleSelection: Story = {
  render: () => <SelectableFileTree />,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span>{size}</span>
          <ProjectWithIcons className="w-[260px]" size={size} />
        </div>
      ))}
    </div>
  ),
};

export const DynamicCollection: Story = {
  render: () => <DynamicProjectTree className="max-h-[380px] w-[300px] overflow-auto" />,
};

export const CustomIndicator: Story = {
  render: () => (
    <FileTree
      aria-label="Custom indicator"
      className="w-[300px]"
      defaultExpandedKeys={["src", "components"]}
    >
      <FileTree.Item id="src" title="src">
        <FileTree.Item
          id="components"
          title="components"
          indicator={
            <FileTree.Indicator>
              <Icon aria-hidden="true" className="size-4" icon="gravity-ui:chevron-right" />
            </FileTree.Indicator>
          }
        >
          <FileTree.Item id="button" title="button.tsx" />
          <FileTree.Item id="card" title="card.tsx" />
        </FileTree.Item>
      </FileTree.Item>
      <FileTree.Item id="index" title="index.ts" />
      <FileTree.Item id="package" title="package.json" />
      <FileTree.Item id="readme" title="README.md" />
    </FileTree>
  ),
};

export const GuideLines: Story = {
  render: () => (
    <div className="flex gap-4">
      {(
        [
          ["always", true],
          ["hover", "hover"],
          ["none", false],
        ] as const
      ).map(([label, showGuideLines]) => (
        <div key={label} className="flex flex-col gap-2">
          <span>{label}</span>
          <ProjectWithIcons className="w-[260px]" showGuideLines={showGuideLines} />
        </div>
      ))}
    </div>
  ),
};

type FileNode = {children?: FileNode[]; id: string; name: string};

const PR_FILES: FileNode[] = [
  {
    children: [
      {
        children: [
          {id: "page", name: "page.tsx"},
          {id: "layout", name: "layout.tsx"},
        ],
        id: "web",
        name: "web",
      },
    ],
    id: "apps",
    name: "apps",
  },
  {
    children: [
      {children: [{id: "file-tree-docs", name: "file-tree.mdx"}], id: "content", name: "content"},
    ],
    id: "docs",
    name: "docs",
  },
  {
    children: [{children: [{id: "file-tree", name: "file-tree.tsx"}], id: "react", name: "react"}],
    id: "packages",
    name: "packages",
  },
];

const renderFileNode = (node: FileNode) => (
  <FileTree.Item
    key={node.id}
    icon={node.children ? folderIcon : fileIcon}
    id={node.id}
    title={node.name}
  >
    {node.children?.map((child) => renderFileNode(child))}
  </FileTree.Item>
);

/** Keeps every node that matches, plus the folders needed to reach a match. */
const filterFileNodes = (nodes: FileNode[], needle: string): FileNode[] =>
  nodes.flatMap((node) => {
    if (node.name.toLowerCase().includes(needle)) return [node];

    const children = node.children ? filterFileNodes(node.children, needle) : [];

    return children.length ? [{...node, children}] : [];
  });

const folderKeys = (nodes: FileNode[]): string[] =>
  nodes.flatMap((node) => (node.children ? [node.id, ...folderKeys(node.children)] : []));

function PRFileReviewTree() {
  const [query, setQuery] = React.useState("");
  const needle = query.trim().toLowerCase();
  const files = needle ? filterFileNodes(PR_FILES, needle) : PR_FILES;

  return (
    <div className="flex w-[320px] flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchField aria-label="Filter files" className="flex-1" value={query} onChange={setQuery}>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input aria-label="Filter files" placeholder="Filter files" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <CloseButton aria-label="Close" />
      </div>
      <Button aria-label="File extensions" size="sm" variant="secondary">
        File extensions
      </Button>
      <FileTree
        key={needle}
        aria-label="PR changed files"
        // Remount on each query so the folders leading to a match start expanded.
        defaultExpandedKeys={folderKeys(files)}
        renderEmptyState={() => (
          <span className="block px-2 py-1 text-muted">No matching files</span>
        )}
      >
        {files.map((node) => renderFileNode(node))}
      </FileTree>
    </div>
  );
}

export const PRFileReview: Story = {
  render: () => <PRFileReviewTree />,
};

export const WithCheckboxes: Story = {
  render: () => (
    <div className="flex w-[460px] flex-col gap-2">
      <span>18 included</span>
      <FileTree
        aria-label="Repository file tree"
        className="w-[460px]"
        defaultExpandedKeys={["repository", "apps", "docs"]}
        defaultSelectedKeys={["repository"]}
        selectionMode="multiple"
      >
        <FileTree.Item
          id="repository"
          selection={selection("heroui-inc/heroui.pro")}
          title="heroui-inc/heroui.pro"
        >
          <FileTree.Item id=".cursor" selection={selection(".cursor")} title=".cursor" />
          <FileTree.Item id=".github" selection={selection(".github")} title=".github" />
          <FileTree.Item id=".husky" selection={selection(".husky")} title=".husky" />
          <FileTree.Item id=".vscode" selection={selection(".vscode")} title=".vscode" />
          <FileTree.Item id="apps" selection={selection("apps")} title="apps">
            <FileTree.Item id="api" selection={selection("api")} title="api" />
            <FileTree.Item id="campaigns" selection={selection("campaigns")} title="campaigns" />
          </FileTree.Item>
          <FileTree.Item id="docs" selection={selection("docs")} title="docs">
            <FileTree.Item id="content" selection={selection("content")} title="content" />
            <FileTree.Item id="public" selection={selection("public")} title="public" />
          </FileTree.Item>
          <FileTree.Item id="scripts" selection={selection("scripts")} title="scripts" />
          <FileTree.Item id="skills" selection={selection("skills")} title="skills" />
          <FileTree.Item id="src" selection={selection("src")} title="src" />
          <FileTree.Item id="packages" selection={selection("packages")} title="packages" />
        </FileTree.Item>
      </FileTree>
    </div>
  ),
};

type DraggableFile = {
  children?: DraggableFile[];
  id: string;
  name: string;
  type: "file" | "folder";
};

const DRAGGABLE_FILES: DraggableFile[] = [
  {
    children: [
      {
        children: [
          {id: "button-tsx", name: "button.tsx", type: "file"},
          {id: "card-tsx", name: "card.tsx", type: "file"},
          {id: "button-css", name: "button.css", type: "file"},
        ],
        id: "components",
        name: "components",
        type: "folder",
      },
      {
        children: [
          {id: "compose-ts", name: "compose.ts", type: "file"},
          {id: "cn-ts", name: "cn.ts", type: "file"},
        ],
        id: "utils",
        name: "utils",
        type: "folder",
      },
    ],
    id: "src",
    name: "src",
    type: "folder",
  },
  {id: "index-ts", name: "index.ts", type: "file"},
  {id: "package-json", name: "package.json", type: "file"},
  {id: "tsconfig-json", name: "tsconfig.json", type: "file"},
  {id: "readme-md", name: "README.md", type: "file"},
];

function DraggableFileTree() {
  const tree = useTreeData<DraggableFile>({
    getChildren: (item) => item.children ?? [],
    getKey: (item) => item.id,
    initialItems: DRAGGABLE_FILES,
  });

  /** Guards the one move a tree cannot survive: a folder dropped inside itself. */
  const isSelfOrDescendant = (key: React.Key, ancestorKey: React.Key): boolean => {
    if (key === ancestorKey) return true;

    const parentKey = tree.getItem(key)?.parentKey;

    return parentKey == null ? false : isSelfOrDescendant(parentKey, ancestorKey);
  };

  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    // Only folders swallow a drop; everything else reorders between siblings.
    shouldAcceptItemDrop: (target) => tree.getItem(target.key)?.value.type === "folder",
    // Every drop onto a row of this same tree lands here, already carrying the dragged keys.
    onMove(event) {
      const keys = [...event.keys].filter((key) => !isSelfOrDescendant(event.target.key, key));

      if (event.target.dropPosition === "on") {
        for (const key of keys) tree.move(key, event.target.key, 0);
      } else if (event.target.dropPosition === "before") {
        tree.moveBefore(event.target.key, keys);
      } else {
        tree.moveAfter(event.target.key, keys);
      }
    },
    // Dropping on empty space below the tree is a root target, which onMove does not cover.
    async onRootDrop(event) {
      const keys = await Promise.all(
        event.items.filter(isTextDropItem).map((item) => item.getText("text/plain")),
      );

      for (const key of keys) tree.move(key, null, 0);
    },
  });

  const renderNode = (node: {children: unknown; key: React.Key; value: DraggableFile}) => (
    <FileTree.Item
      key={node.key}
      icon={node.value.type === "folder" ? folderIcon : fileIcon}
      id={node.key}
      title={node.value.name}
    >
      <Collection items={(node.children ?? []) as never[]}>{renderNode}</Collection>
    </FileTree.Item>
  );

  return (
    <FileTree
      aria-label="Draggable file tree"
      className="w-[300px]"
      defaultExpandedKeys={["src", "components", "utils"]}
      dragAndDropHooks={dragAndDropHooks}
      items={tree.items}
      selectionMode="multiple"
    >
      {renderNode}
    </FileTree>
  );
}

export const DragAndDrop: Story = {
  render: () => <DraggableFileTree />,
};
