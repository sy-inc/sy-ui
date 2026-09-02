import type {PromptInputStatus, PromptInputVariants} from "./index";
import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";

import {Label} from "../label";
import {ListBox} from "../list-box";
import {Select} from "../select";

import {PromptInput} from "./index";

const meta: Meta<typeof PromptInput> = {
  component: PromptInput,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "Components/Forms/PromptInput",
};

export default meta;
type Story = StoryObj<typeof meta>;

const ModelSelect = () => (
  <Select aria-label="Model" className="w-[220px]" defaultSelectedKey="gpt-5.4" variant="secondary">
    <Label className="sr-only">Model</Label>
    <Select.Trigger className="select__trigger--outline">
      <Select.Value />
      <Select.Indicator />
    </Select.Trigger>
    <Select.Popover>
      <ListBox>
        <ListBox.Item id="gpt-5.4" textValue="GPT-5.4">
          GPT-5.4
          <ListBox.ItemIndicator />
        </ListBox.Item>
        <ListBox.Item id="gpt-5.4-mini" textValue="GPT-5.4 mini">
          GPT-5.4 mini
          <ListBox.ItemIndicator />
        </ListBox.Item>
        <ListBox.Item id="gpt-5.3" textValue="GPT-5.3">
          GPT-5.3
          <ListBox.ItemIndicator />
        </ListBox.Item>
      </ListBox>
    </Select.Popover>
  </Select>
);

const Composer = ({
  layout = "stacked",
  status = "ready",
}: {
  layout?: "stacked" | "compact" | "inline";
  status?: PromptInputStatus;
}) => {
  const [value, setValue] = React.useState("");
  const [currentStatus, setCurrentStatus] = React.useState(status);
  const [announcement, setAnnouncement] = React.useState("");

  const handleSubmit = () => {
    setAnnouncement(`Submitted: ${value}`);
    setValue("");
  };

  return (
    <>
      <PromptInput
        aria-label="AI prompt"
        layout={layout}
        status={currentStatus}
        value={value}
        onStop={() => setCurrentStatus("ready")}
        onSubmit={handleSubmit}
        onValueChange={setValue}
      >
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea
              aria-label="Message input"
              placeholder="What do you want to know?"
            />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="Attach file" tooltip="Attach file">
                <Icon icon="gravity-ui:paperclip" />
              </PromptInput.Action>
              {layout === "stacked" ? <ModelSelect /> : null}
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
        <PromptInput.Footer>AI can make mistakes. Check important info.</PromptInput.Footer>
      </PromptInput>
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </>
  );
};

/**
 * The default light demo mirrors the official 640px PromptInput canvas. Type a prompt and press
 * Enter to submit. Use Shift+Enter for a new line.
 */
export const Default: Story = {
  render: () => (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[640px]">
        <Composer />
      </div>
    </main>
  ),
};

export const Layouts: Story = {
  render: () => (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="grid w-full max-w-[720px] gap-8">
        {(["stacked", "compact", "inline"] as const).map((layout) => (
          <section key={layout} className="grid gap-2">
            <h2 className="text-sm font-medium capitalize">{layout}</h2>
            <Composer layout={layout} />
          </section>
        ))}
      </div>
    </main>
  ),
};

const StaticComposer = ({
  isDisabled = false,
  size = "md",
  status = "ready",
  variant = "primary",
}: {
  isDisabled?: boolean;
  size?: NonNullable<PromptInputVariants["size"]>;
  status?: PromptInputStatus;
  variant?: NonNullable<PromptInputVariants["variant"]>;
}) => (
  <PromptInput
    defaultValue="Summarize the attached report"
    isDisabled={isDisabled}
    size={size}
    status={status}
    variant={variant}
  >
    <PromptInput.Shell>
      <PromptInput.Content>
        <PromptInput.TextArea aria-label={`${status} message input`} />
      </PromptInput.Content>
      <PromptInput.Toolbar>
        <PromptInput.ToolbarStart>
          <PromptInput.Action aria-label="Attach file">
            <Icon icon="gravity-ui:paperclip" />
          </PromptInput.Action>
        </PromptInput.ToolbarStart>
        <PromptInput.ToolbarEnd>
          <PromptInput.Send />
        </PromptInput.ToolbarEnd>
      </PromptInput.Toolbar>
    </PromptInput.Shell>
  </PromptInput>
);

export const Statuses: Story = {
  render: () => (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="grid w-full max-w-[640px] gap-6">
        {(["ready", "submitted", "streaming", "error"] as const).map((status) => (
          <section key={status} className="grid gap-2">
            <h2 className="text-sm font-medium capitalize">{status}</h2>
            <StaticComposer status={status} />
          </section>
        ))}
      </div>
    </main>
  ),
};

const surfaceExamples = [
  {isDisabled: false, label: "Primary · sm", size: "sm", variant: "primary"},
  {isDisabled: false, label: "Primary · md", size: "md", variant: "primary"},
  {isDisabled: false, label: "Secondary · lg", size: "lg", variant: "secondary"},
  {isDisabled: true, label: "Disabled · md", size: "md", variant: "primary"},
] as const;

export const VariantsSizesAndDisabled: Story = {
  render: () => (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="grid w-full max-w-[640px] gap-6">
        {surfaceExamples.map(({isDisabled, label, size, variant}) => (
          <section key={label} className="grid gap-2">
            <h2 className="text-sm font-medium">{label}</h2>
            <StaticComposer isDisabled={isDisabled} size={size} variant={variant} />
          </section>
        ))}
      </div>
    </main>
  ),
};

export const WithAttachments: Story = {
  render: () => (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[640px]">
        <PromptInput>
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.Attachments>
                <span className="inline-flex items-center gap-2 rounded-lg bg-default px-2.5 py-1.5 text-xs">
                  <Icon icon="gravity-ui:file-text" />
                  product-brief.pdf
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-default px-2.5 py-1.5 text-xs">
                  <Icon icon="gravity-ui:file-picture" />
                  wireframe.png
                </span>
              </PromptInput.Attachments>
              <PromptInput.TextArea aria-label="Message input" placeholder="Ask about your files" />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarStart>
                <PromptInput.Action aria-label="Attach file">
                  <Icon icon="gravity-ui:paperclip" />
                </PromptInput.Action>
              </PromptInput.ToolbarStart>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
        </PromptInput>
      </div>
    </main>
  ),
};

const QueueExample = () => {
  const [files, setFiles] = React.useState(["research.pdf", "notes.md", "diagram.png"]);

  return (
    <PromptInput defaultValue="Compare these files">
      <PromptInput.Queue actionsVisibility="always" values={files} onReorder={setFiles}>
        {files.map((file) => (
          <PromptInput.Queue.Item key={file} value={file}>
            <PromptInput.Queue.Item.Handle />
            <PromptInput.Queue.Item.Body>
              <PromptInput.Queue.Item.Icon>
                <Icon icon="gravity-ui:file-text" />
              </PromptInput.Queue.Item.Icon>
              <PromptInput.Queue.Item.Content>{file}</PromptInput.Queue.Item.Content>
            </PromptInput.Queue.Item.Body>
            <PromptInput.Queue.Item.Actions>
              <PromptInput.Queue.Item.More />
              <PromptInput.Queue.Item.Remove
                onPress={() => setFiles((current) => current.filter((item) => item !== file))}
              />
            </PromptInput.Queue.Item.Actions>
          </PromptInput.Queue.Item>
        ))}
      </PromptInput.Queue>
      <PromptInput.Shell>
        <PromptInput.Content>
          <PromptInput.TextArea aria-label="Message input" />
        </PromptInput.Content>
        <PromptInput.Toolbar>
          <PromptInput.ToolbarStart />
          <PromptInput.ToolbarEnd>
            <PromptInput.Send />
          </PromptInput.ToolbarEnd>
        </PromptInput.Toolbar>
      </PromptInput.Shell>
    </PromptInput>
  );
};

export const ReorderableQueue: Story = {
  render: () => (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[640px]">
        <QueueExample />
      </div>
    </main>
  ),
};
