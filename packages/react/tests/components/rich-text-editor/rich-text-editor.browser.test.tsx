import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {RichTextEditor} from "@/components/rich-text-editor";

describe("RichTextEditor (browser)", () => {
  it("runs slash suggestions with the matched range", async () => {
    await render(
      <RichTextEditor>
        <RichTextEditor.Content />
        <RichTextEditor.SuggestionMenu
          items={({query}) =>
            query.startsWith("hea")
              ? [
                  {
                    title: "Heading 1",
                    description: "Large section heading",
                    command: ({editor, range}) =>
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 1})
                        .insertContent("Heading")
                        .run(),
                  },
                ]
              : []
          }
        />
      </RichTextEditor>,
    );

    const editor = page.getByRole("textbox");

    await editor.click();
    await userEvent.keyboard("/hea");
    await expect.element(page.getByRole("listbox", {name: "Suggestions"})).toBeInTheDocument();
    await expect.element(page.getByText("Large section heading")).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("heading", {name: "Heading"})).toBeInTheDocument();
    await expect.element(editor).not.toHaveTextContent("/hea");
  });

  it("supports link popover semantics and enabled Apply state", async () => {
    await render(
      <RichTextEditor>
        <RichTextEditor.Shell>
          <RichTextEditor.Toolbar aria-label="Editor toolbar">
            <RichTextEditor.ToolbarGroup aria-label="Lists and links">
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
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor.Shell>
      </RichTextEditor>,
    );
    const trigger = page.getByRole("button", {name: "Link"});

    await expect
      .element(trigger)
      .toHaveAttribute("data-slot", "rich-text-editor-link-popover-trigger");
    await trigger.click();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.element(page.getByRole("dialog", {name: "Link"})).toBeInTheDocument();
    const input = page.getByRole("textbox", {name: "Link URL"});

    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAttribute("placeholder", "https://example.com");
    await expect.element(page.getByRole("button", {name: "Remove"})).toBeDisabled();
    const apply = page.getByRole("button", {name: "Apply"});

    await expect.element(apply).toBeDisabled();
    await input.fill("https://example.com");
    await expect.element(apply).toBeEnabled();
    await userEvent.keyboard("{Escape}");
  });
});
