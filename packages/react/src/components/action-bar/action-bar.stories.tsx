import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import {useState} from "react";

import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {Chip} from "../chip";
import {CloseButton} from "../close-button";
import {Separator} from "../separator";
import {Tooltip} from "../tooltip";

import {ActionBar} from "./index";

const files = [
  "Project proposal.pdf",
  "Q4 financial report.xlsx",
  "Brand guidelines.fig",
  "Team photo.jpg",
  "Meeting notes.md",
  "API documentation.pdf",
];

const ActionBarDemo = () => {
  const [selectedFiles, setSelectedFiles] = useState(() => new Set<string>());

  const updateSelection = (file: string, isSelected: boolean) => {
    setSelectedFiles((current) => {
      const next = new Set(current);

      if (isSelected) next.add(file);
      else next.delete(file);

      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg p-4">
      <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface shadow-surface">
        {files.map((file) => (
          <Checkbox
            key={file}
            aria-label={`Select ${file}`}
            className="w-full px-4 py-3 data-[selected=true]:bg-default"
            isSelected={selectedFiles.has(file)}
            onChange={(isSelected) => updateSelection(file, isSelected)}
          >
            <Checkbox.Content className="flex min-h-5 w-full items-center gap-3 text-sm font-medium">
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {file}
            </Checkbox.Content>
          </Checkbox>
        ))}
      </div>
      <ActionBar isOpen={selectedFiles.size > 0}>
        <Chip aria-label={`${selectedFiles.size} selected`}>{selectedFiles.size}</Chip>
        <Separator />
        <Button className="px-3" variant="ghost" onPress={() => undefined}>
          <Icon aria-hidden icon="gravity-ui:pencil" />
          Edit
        </Button>
        <Button className="px-3" variant="ghost" onPress={() => undefined}>
          <Icon aria-hidden icon="gravity-ui:arrow-down-to-line" />
          Export
        </Button>
        <Button className="px-3" variant="ghost" onPress={() => undefined}>
          <Icon aria-hidden icon="gravity-ui:archive" />
          Archive
        </Button>
        <Separator />
        <Button className="px-3" variant="danger-soft" onPress={() => undefined}>
          <Icon aria-hidden icon="gravity-ui:trash-bin" />
          Delete
        </Button>
        <Separator />
        <Tooltip>
          <CloseButton
            aria-label="Clear selection"
            className="size-9 rounded-3xl bg-transparent text-foreground"
            onPress={() => setSelectedFiles(new Set())}
          />
          <Tooltip.Content>Clear selection</Tooltip.Content>
        </Tooltip>
      </ActionBar>
    </div>
  );
};

const meta = {
  component: ActionBar,
  parameters: {layout: "fullscreen"},
  title: "Components/ActionBar",
} satisfies Meta<typeof ActionBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ActionBarDemo />,
};
