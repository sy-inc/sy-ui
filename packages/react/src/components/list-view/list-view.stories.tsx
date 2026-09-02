import type {Selection} from "@react-types/shared";
import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import {useState} from "react";

import {ActionBar} from "../action-bar";
import {Button} from "../button";
import {Chip} from "../chip";
import {CloseButton} from "../close-button";
import {Separator} from "../separator";
import {Tooltip} from "../tooltip";

import {ListView} from "./index";

const meta: Meta<typeof ListView> = {
  component: ListView,
  title: "Components/ListView",
};

export default meta;

type Story = StoryObj<typeof ListView>;

type ListViewFile = {
  icon: string;
  id: string;
  name: string;
  updated?: string;
};

const files: ListViewFile[] = [
  {icon: "gravity-ui:folder", id: "documents", name: "Documents", updated: "Updated 2 days ago"},
  {icon: "gravity-ui:folder", id: "photos", name: "Photos", updated: "Updated 1 week ago"},
  {icon: "gravity-ui:file", id: "readme", name: "README.md", updated: "Updated 3 hours ago"},
  {icon: "gravity-ui:file", id: "package", name: "package.json", updated: "Updated Yesterday"},
  {icon: "gravity-ui:folder", id: "src", name: "src", updated: "Updated Just now"},
  {icon: "gravity-ui:file", id: "gitignore", name: ".gitignore", updated: "Updated 2 weeks ago"},
];

const disabledFiles: ListViewFile[] = [
  {icon: "gravity-ui:folder", id: "documents", name: "Documents"},
  {icon: "gravity-ui:file", id: "budget", name: "Budget.xlsx"},
  {icon: "gravity-ui:file", id: "archived", name: "Archived.zip"},
  {icon: "gravity-ui:folder", id: "photos", name: "Photos"},
  {icon: "gravity-ui:file", id: "backup", name: "Old backup.tar"},
  {icon: "gravity-ui:file", id: "readme", name: "README.md"},
];

const ListViewRow = ({
  file,
  isDisabled = false,
  selectable = true,
  trailing,
}: {
  file: ListViewFile;
  isDisabled?: boolean;
  selectable?: boolean;
  trailing?: React.ReactNode;
}) => (
  <ListView.Item id={file.id} isDisabled={isDisabled} textValue={file.name}>
    {selectable ? <ListView.Selection aria-label={`Select ${file.name}`} /> : null}
    <Icon aria-hidden icon={file.icon} />
    <ListView.Content>
      <ListView.Title>{file.name}</ListView.Title>
      {file.updated ? <ListView.Description>{file.updated}</ListView.Description> : null}
    </ListView.Content>
    {trailing}
  </ListView.Item>
);

const ListViewCanvas = ({children}: {children: React.ReactNode}) => (
  <div className="ms-5 w-[448px]">{children}</div>
);

const SelectionModesTemplate = () => {
  const [singleKeys, setSingleKeys] = useState<Selection>(new Set());
  const [multipleKeys, setMultipleKeys] = useState<Selection>(new Set());
  const selectedCount = (keys: Selection) => (keys === "all" ? files.length : keys.size);

  return (
    <div className="ms-5 grid grid-cols-3 gap-8">
      <div className="grid gap-2">
        <span className="text-sm font-medium">None</span>
        <ListView aria-label="Files without selection" className="w-[235px]" selectionMode="none">
          {files.slice(0, 5).map((file) => (
            <ListViewRow key={file.id} file={file} selectable={false} />
          ))}
        </ListView>
      </div>
      <div className="grid gap-2">
        <span className="flex items-center justify-between text-sm font-medium">
          Single <span className="text-muted">{selectedCount(singleKeys) || "None"} selected</span>
        </span>
        <ListView
          aria-label="Files with single selection"
          className="w-[235px]"
          selectedKeys={singleKeys}
          selectionMode="single"
          onSelectionChange={setSingleKeys}
        >
          {files.slice(0, 5).map((file) => (
            <ListViewRow key={file.id} file={file} />
          ))}
        </ListView>
      </div>
      <div className="grid gap-2">
        <span className="flex items-center justify-between text-sm font-medium">
          Multiple{" "}
          <span className="text-muted">{selectedCount(multipleKeys) || "None"} selected</span>
        </span>
        <ListView
          aria-label="Files with multiple selection"
          className="w-[235px]"
          selectedKeys={multipleKeys}
          selectionMode="multiple"
          onSelectionChange={setMultipleKeys}
        >
          {files.slice(0, 5).map((file) => (
            <ListViewRow key={file.id} file={file} />
          ))}
        </ListView>
      </div>
    </div>
  );
};

const WithActionBarTemplate = () => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const selectedCount = selectedKeys === "all" ? files.length : selectedKeys.size;

  return (
    <ListViewCanvas>
      <ListView
        aria-label="Files with actions"
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        onSelectionChange={setSelectedKeys}
      >
        {files.map((file) => (
          <ListViewRow key={file.id} file={file} />
        ))}
      </ListView>
      <ActionBar isOpen={selectedCount > 0}>
        <Chip aria-label={`${selectedCount} selected`}>{selectedCount}</Chip>
        <Separator />
        <Button className="px-3" variant="ghost">
          <Icon aria-hidden icon="gravity-ui:pencil" />
          Edit
        </Button>
        <Button className="px-3" variant="ghost">
          <Icon aria-hidden icon="gravity-ui:arrow-down-to-line" />
          Export
        </Button>
        <Button className="px-3" variant="ghost">
          <Icon aria-hidden icon="gravity-ui:archive" />
          Archive
        </Button>
        <Separator />
        <Button className="px-3" variant="danger-soft">
          <Icon aria-hidden icon="gravity-ui:trash-bin" />
          Delete
        </Button>
        <Separator />
        <Tooltip>
          <CloseButton
            aria-label="Clear selection"
            className="size-9 rounded-3xl bg-transparent text-foreground"
            onPress={() => setSelectedKeys(new Set())}
          />
          <Tooltip.Content>Clear selection</Tooltip.Content>
        </Tooltip>
      </ActionBar>
    </ListViewCanvas>
  );
};

export const Default: Story = {
  render: () => (
    <ListViewCanvas>
      <ListView aria-label="Project files" selectionMode="multiple">
        {files.map((file) => (
          <ListViewRow key={file.id} file={file} />
        ))}
      </ListView>
    </ListViewCanvas>
  ),
};

export const SelectionModes: Story = {
  render: () => <SelectionModesTemplate />,
};

export const SecondaryVariant: Story = {
  render: () => (
    <ListViewCanvas>
      <ListView aria-label="Secondary project files" selectionMode="multiple" variant="secondary">
        {files.map((file) => (
          <ListViewRow key={file.id} file={file} />
        ))}
      </ListView>
    </ListViewCanvas>
  ),
};

export const WithActionBar: Story = {
  render: () => <WithActionBarTemplate />,
};

/**
 * Rows can hold their own focusable controls — the reason this collection is a
 * grid instead of a listbox. Tab reaches the row, then the controls inside it.
 */
export const InlineActions: Story = {
  render: () => (
    <ListViewCanvas>
      <ListView aria-label="Files with row actions" selectionMode="multiple">
        {files.map((file) => (
          <ListViewRow
            key={file.id}
            file={file}
            trailing={
              <Button
                aria-label={`Download ${file.name}`}
                className="size-8 shrink-0 px-0"
                variant="ghost"
              >
                <Icon aria-hidden icon="gravity-ui:arrow-down-to-line" />
              </Button>
            }
          />
        ))}
      </ListView>
    </ListViewCanvas>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ListViewCanvas>
      <ListView aria-label="Disabled project files" selectionMode="multiple">
        {disabledFiles.map((file) => (
          <ListViewRow
            key={file.id}
            file={file}
            isDisabled={file.id === "archived" || file.id === "backup"}
            trailing={
              file.id === "archived" || file.id === "backup" ? (
                <Icon aria-hidden icon="gravity-ui:lock" />
              ) : undefined
            }
          />
        ))}
      </ListView>
    </ListViewCanvas>
  ),
};
