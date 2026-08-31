import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {RichTextEditor} from "@/components/rich-text-editor";

const value = {
  type: "doc",
  content: [{type: "paragraph", content: [{type: "text", text: "Hello"}]}],
};

const Editor = (props: any) => (
  <RichTextEditor {...props}>
    <RichTextEditor.Shell>
      <RichTextEditor.Toolbar aria-label="Editor toolbar">
        <RichTextEditor.ToolbarGroup aria-label="History">
          <RichTextEditor.ActionButton action="undo">Undo</RichTextEditor.ActionButton>
          <RichTextEditor.ActionButton action="redo">Redo</RichTextEditor.ActionButton>
        </RichTextEditor.ToolbarGroup>
        <RichTextEditor.ToolbarSeparator />
        <RichTextEditor.ToolbarGroup aria-label="Text style">
          <RichTextEditor.ToggleButton command="bold">Bold</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="italic">Italic</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="underline">Underline</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="strike">Strikethrough</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="code">Inline code</RichTextEditor.ToggleButton>
        </RichTextEditor.ToolbarGroup>
        <RichTextEditor.ToolbarSeparator />
        <RichTextEditor.ToolbarGroup aria-label="Blocks">
          <RichTextEditor.ToggleButton command="heading-1">Heading 1</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="heading-2">Heading 2</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="heading-3">Heading 3</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="blockquote">Blockquote</RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="codeBlock">Code block</RichTextEditor.ToggleButton>
        </RichTextEditor.ToolbarGroup>
        <RichTextEditor.ToolbarSeparator />
        <RichTextEditor.ToolbarGroup aria-label="Lists and links">
          <RichTextEditor.ToggleButton command="bulletList">
            Bulleted list
          </RichTextEditor.ToggleButton>
          <RichTextEditor.ToggleButton command="orderedList">
            Numbered list
          </RichTextEditor.ToggleButton>
          <RichTextEditor.LinkPopover>
            <RichTextEditor.LinkPopover.Trigger>Link</RichTextEditor.LinkPopover.Trigger>
            <RichTextEditor.LinkPopover.Content>
              <RichTextEditor.LinkPopover.Input />
              <RichTextEditor.LinkPopover.Actions>
                <RichTextEditor.LinkPopover.UnsetButton />
                <RichTextEditor.LinkPopover.ApplyButton />
              </RichTextEditor.LinkPopover.Actions>
            </RichTextEditor.LinkPopover.Content>
          </RichTextEditor.LinkPopover>
        </RichTextEditor.ToolbarGroup>
        <RichTextEditor.ToolbarSeparator />
        <RichTextEditor.ToolbarGroup aria-label="Clear">
          <RichTextEditor.ActionButton action="clearFormatting">
            Clear formatting
          </RichTextEditor.ActionButton>
          <RichTextEditor.ActionButton action="clearContent">
            Clear content
          </RichTextEditor.ActionButton>
        </RichTextEditor.ToolbarGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor.Shell>
  </RichTextEditor>
);

describe("RichTextEditor", () => {
  it("renders the documented toolbar groups and command order", () => {
    render(<Editor defaultValue={value} />);

    expect(screen.getByRole("toolbar", {name: "Editor toolbar"})).toBeInTheDocument();
    ["History", "Text style", "Blocks", "Lists and links", "Clear"].forEach((name) =>
      expect(screen.getByRole("group", {name})).toBeInTheDocument(),
    );
    expect(
      screen.getAllByRole("button").map((button) => button.getAttribute("aria-label")),
    ).toEqual([
      "Undo",
      "Redo",
      "Bold",
      "Italic",
      "Underline",
      "Strikethrough",
      "Inline code",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Blockquote",
      "Code block",
      "Bulleted list",
      "Numbered list",
      "Link",
      "Clear formatting",
      "Clear content",
    ]);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByTestId("rich-text-editor")).toHaveAttribute("data-slot", "rich-text-editor");
  });

  it("calls JSON value changes and supports focus, undo, and redo", async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    render(
      <Editor
        defaultValue={value}
        editorOptions={{editorProps: {handleScrollToSelection: () => true}}}
        onValueChange={onValueChange}
      />,
    );

    const undo = screen.getByRole("button", {name: "Undo"});
    const redo = screen.getByRole("button", {name: "Redo"});
    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();
    await user.tab();
    expect(screen.getByRole("button", {name: "Bold"})).toHaveFocus();
    const editable = document.querySelector("[contenteditable=true]") as HTMLElement;
    await user.click(editable);
    await user.keyboard(" Hi");
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({type: "doc"}),
      expect.objectContaining({
        html: expect.any(String),
        text: expect.any(String),
        characters: expect.any(Number),
        words: expect.any(Number),
      }),
    );
    expect(undo).toBeEnabled();
    await user.click(undo);
    expect(redo).toBeEnabled();
  });

  it("disables controls for disabled and read-only editors", () => {
    const {rerender} = render(<Editor defaultValue={value} isDisabled />);
    expect(screen.getByTestId("rich-text-editor")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByRole("button", {name: "Bold"})).toBeDisabled();
    rerender(<Editor defaultValue={value} isReadOnly />);
    expect(screen.getByTestId("rich-text-editor")).toHaveAttribute("data-readonly", "true");
    expect(screen.getByRole("button", {name: "Undo"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Bold"})).toBeDisabled();
  });

  it("formats visible character and word counts", () => {
    render(
      <RichTextEditor defaultValue={value}>
        <RichTextEditor.Content />
        <RichTextEditor.Footer>
          <RichTextEditor.CharacterCount showWords />
        </RichTextEditor.Footer>
      </RichTextEditor>,
    );
    expect(screen.getByText("5 characters, 1 words")).toBeInTheDocument();
  });
});
