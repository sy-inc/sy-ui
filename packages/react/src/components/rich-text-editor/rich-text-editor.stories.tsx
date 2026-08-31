import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import {useState} from "react";

import {RichTextEditor} from "./index";

const documentJson = {
  type: "doc",
  content: [
    {type: "heading", attrs: {level: 2}, content: [{type: "text", text: "Features"}]},
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{type: "italic"}],
              text: "A composable rich text editor with toolbar controls, contextual menus, JSON persistence, and common writing shortcuts. Try markdown ** or keyboard shortcuts for common marks.",
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {type: "text", text: "Select the phrase "},
        {type: "text", marks: [{type: "bold"}], text: "contextual selection actions"},
        {
          type: "text",
          text: " and use the bubble menu to apply bold, italic, underline, strike, or a link without leaving the document.",
        },
      ],
    },
    {type: "heading", attrs: {level: 3}, content: [{type: "text", text: "What to try"}]},
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Use the toolbar to switch headings, lists, quotes, and code blocks.",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {type: "text", text: "Add a link to "},
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://tiptap.dev",
                        target: "_blank",
                        rel: "noopener noreferrer nofollow",
                        class: null,
                      },
                    },
                  ],
                  text: "tiptap.dev",
                },
                {type: "text", text: " or remove formatting with the clear actions."},
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {type: "text", text: "Notice how "},
                {type: "text", marks: [{type: "code"}], text: "onValueChange"},
                {type: "text", text: " can store JSON while still exposing HTML and text details."},
              ],
            },
          ],
        },
      ],
    },
    {
      type: "codeBlock",
      content: [{type: "text", text: "editor.chain().focus().toggleHeading({ level: 2 }).run()"}],
    },
    {type: "paragraph"},
  ],
};

const meta: Meta<typeof RichTextEditor> = {
  title: "Components/Forms/RichTextEditor",
  component: RichTextEditor,
};
export default meta;
type Story = StoryObj<typeof RichTextEditor>;

const DefaultToolbar = () => (
  <>
    <RichTextEditor.ToolbarGroup aria-label="History">
      <RichTextEditor.ActionButton
        action="undo"
        aria-label="Undo"
        isIconOnly
        size="sm"
        variant="tertiary"
      >
        <Icon icon="gravity-ui:arrow-rotate-left" />
      </RichTextEditor.ActionButton>
      <RichTextEditor.ActionButton
        action="redo"
        aria-label="Redo"
        isIconOnly
        size="sm"
        variant="tertiary"
      >
        <Icon icon="gravity-ui:arrow-rotate-right" />
      </RichTextEditor.ActionButton>
    </RichTextEditor.ToolbarGroup>
    <RichTextEditor.ToolbarSeparator />
    <RichTextEditor.ToolbarGroup aria-label="Text style">
      <RichTextEditor.ToggleButton
        command="bold"
        aria-label="Bold"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <Icon icon="gravity-ui:bold" />
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="italic"
        aria-label="Italic"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <Icon icon="gravity-ui:italic" />
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="underline"
        aria-label="Underline"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <Icon icon="gravity-ui:underline" />
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="strike"
        aria-label="Strikethrough"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <Icon icon="gravity-ui:strikethrough" />
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="code"
        aria-label="Inline code"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <Icon icon="gravity-ui:code" />
      </RichTextEditor.ToggleButton>
    </RichTextEditor.ToolbarGroup>
    <RichTextEditor.ToolbarSeparator />
    <RichTextEditor.ToolbarGroup aria-label="Blocks">
      <RichTextEditor.ToggleButton
        command="heading-1"
        aria-label="Heading 1"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        H1
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="heading-2"
        aria-label="Heading 2"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        H2
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="heading-3"
        aria-label="Heading 3"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        H3
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="blockquote"
        aria-label="Blockquote"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        “
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="codeBlock"
        aria-label="Code block"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        {"{}"}
      </RichTextEditor.ToggleButton>
    </RichTextEditor.ToolbarGroup>
    <RichTextEditor.ToolbarSeparator />
    <RichTextEditor.ToolbarGroup aria-label="Lists and links">
      <RichTextEditor.ToggleButton
        command="bulletList"
        aria-label="Bulleted list"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <Icon icon="gravity-ui:list-ul" />
      </RichTextEditor.ToggleButton>
      <RichTextEditor.ToggleButton
        command="orderedList"
        aria-label="Numbered list"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <Icon icon="gravity-ui:list-ol" />
      </RichTextEditor.ToggleButton>
      <RichTextEditor.LinkPopover>
        <RichTextEditor.LinkPopover.Trigger aria-label="Link" isIconOnly size="sm" variant="ghost">
          <Icon icon="gravity-ui:link" />
        </RichTextEditor.LinkPopover.Trigger>
        <RichTextEditor.LinkPopover.Content>
          <RichTextEditor.LinkPopover.Input />
          <RichTextEditor.LinkPopover.Actions>
            <RichTextEditor.LinkPopover.UnsetButton size="sm" variant="ghost" />
            <RichTextEditor.LinkPopover.ApplyButton size="sm" />
          </RichTextEditor.LinkPopover.Actions>
        </RichTextEditor.LinkPopover.Content>
      </RichTextEditor.LinkPopover>
    </RichTextEditor.ToolbarGroup>
    <RichTextEditor.ToolbarSeparator />
    <RichTextEditor.ToolbarGroup aria-label="Clear">
      <RichTextEditor.ActionButton
        action="clearFormatting"
        aria-label="Clear formatting"
        isIconOnly
        size="sm"
        variant="tertiary"
      >
        <Icon icon="gravity-ui:eraser" />
      </RichTextEditor.ActionButton>
      <RichTextEditor.ActionButton
        action="clearContent"
        aria-label="Clear content"
        isIconOnly
        size="sm"
        variant="tertiary"
      >
        <Icon icon="gravity-ui:trash-bin" />
      </RichTextEditor.ActionButton>
    </RichTextEditor.ToolbarGroup>
  </>
);

const Editor = ({toolbar = <DefaultToolbar />, ...props}: any) => (
  <RichTextEditor {...props}>
    <RichTextEditor.Shell>
      <RichTextEditor.Toolbar aria-label="Editor toolbar">{toolbar}</RichTextEditor.Toolbar>
      <RichTextEditor.Content />
      <RichTextEditor.Footer>
        <span>JSON-first editor state</span>
        <RichTextEditor.CharacterCount showWords />
      </RichTextEditor.Footer>
    </RichTextEditor.Shell>
  </RichTextEditor>
);

export const Default: Story = {
  parameters: {layout: "centered"},
  render: () => (
    <div className="w-[760px] max-w-full">
      <Editor defaultValue={documentJson} />
    </div>
  ),
};
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(documentJson);
    return <Editor maxLength={640} onValueChange={setValue} value={value} />;
  },
};
export const CharacterCount: Story = {
  render: () => (
    <Editor
      defaultValue={{
        type: "doc",
        content: [{type: "paragraph", content: [{type: "text", text: "A short editor value."}]}],
      }}
      maxLength={240}
    />
  ),
};
export const Placeholder: Story = {render: () => <Editor placeholder="Start writing..." />};
export const Disabled: Story = {render: () => <Editor defaultValue={documentJson} isDisabled />};
export const ReadOnly: Story = {render: () => <Editor defaultValue={documentJson} isReadOnly />};
export const CustomComposition: Story = {
  render: () => (
    <RichTextEditor defaultValue={documentJson}>
      <RichTextEditor.Shell>
        <RichTextEditor.Content />
        <RichTextEditor.Footer>
          <RichTextEditor.Toolbar aria-label="Custom editor toolbar">
            <RichTextEditor.ToolbarGroup aria-label="Custom">
              <RichTextEditor.CommandButton
                aria-label="Insert date"
                isIconOnly
                size="sm"
                variant="ghost"
                onCommand={(editor) => editor.chain().focus().insertContent("27 May 2026").run()}
              >
                <Icon icon="gravity-ui:calendar" />
              </RichTextEditor.CommandButton>
            </RichTextEditor.ToolbarGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.CharacterCount showWords />
        </RichTextEditor.Footer>
      </RichTextEditor.Shell>
    </RichTextEditor>
  ),
};
export const Extensible: Story = {
  render: () => (
    <Editor
      defaultValue={documentJson}
      extensions={[]}
      toolbar={
        <RichTextEditor.ToolbarGroup aria-label="Custom commands">
          <RichTextEditor.CommandButton
            aria-label="Insert date"
            size="sm"
            variant="ghost"
            onCommand={(editor) => editor.chain().focus().insertContent("27 May 2026").run()}
          >
            Insert date
          </RichTextEditor.CommandButton>
          <RichTextEditor.CommandButton
            aria-label="Insert launch checklist"
            size="sm"
            variant="ghost"
            onCommand={(editor) => editor.chain().focus().insertContent("Launch checklist").run()}
          >
            Insert launch checklist
          </RichTextEditor.CommandButton>
        </RichTextEditor.ToolbarGroup>
      }
    />
  ),
};
