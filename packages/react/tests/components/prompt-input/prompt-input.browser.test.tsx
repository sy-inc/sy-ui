import {render} from "@sy-inc/testing/browser";
import React from "react";
import {page, userEvent} from "vitest/browser";

import {PromptInput} from "@/components/prompt-input";
import {TextField} from "@/components/textfield";

import "../../../../styles/dist/sy-inc.min.css";

import {SlashCommandsFixture} from "./fixtures";

const BrowserComposer = () => {
  const [value, setValue] = React.useState("");

  return (
    <PromptInput value={value} onSubmit={() => setValue("")} onValueChange={setValue}>
      <PromptInput.Shell>
        <PromptInput.Content>
          <PromptInput.TextArea aria-label="Message input" />
        </PromptInput.Content>
        <PromptInput.Toolbar>
          <PromptInput.ToolbarStart>
            <PromptInput.Action aria-label="Attach file">Attach</PromptInput.Action>
          </PromptInput.ToolbarStart>
          <PromptInput.ToolbarEnd>
            <PromptInput.Send />
          </PromptInput.ToolbarEnd>
        </PromptInput.Toolbar>
      </PromptInput.Shell>
    </PromptInput>
  );
};

const CompactComposer = () => {
  const [value, setValue] = React.useState("");

  return (
    <div style={{width: 220}}>
      <PromptInput
        data-testid="compact-prompt"
        layout="compact"
        value={value}
        onValueChange={setValue}
      >
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea aria-label="Compact message input" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="Attach compact file">Attach</PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>
    </div>
  );
};

describe("PromptInput (browser)", () => {
  it("supports multiline entry, Enter submit, and the keyboard focus path", async () => {
    await render(<BrowserComposer />);
    const textarea = page.getByRole("textbox", {name: "Message input"});
    const send = page.getByRole("button", {name: "Send message"});

    await expect.element(send).toBeDisabled();
    await textarea.click();
    await userEvent.keyboard("Line one{Shift>}{Enter}{/Shift}Line two");
    await expect.element(textarea).toHaveValue("Line one\nLine two");
    await expect.element(send).toBeEnabled();

    await userEvent.keyboard("{Enter}");
    await expect.element(textarea).toHaveValue("");
    await expect.element(textarea).toHaveFocus();
    await expect.element(send).toBeDisabled();

    await userEvent.keyboard("{Tab}");
    await expect.element(page.getByRole("button", {name: "Attach file"})).toHaveFocus();
  });

  it("keeps the focus treatment on the shell instead of ringing the text area", async () => {
    await render(<BrowserComposer />);
    const textarea = page.getByRole("textbox", {name: "Message input"});
    const shell = document.querySelector('[data-slot="prompt-input-shell"]')!;
    const idleShellShadow = getComputedStyle(shell).boxShadow;

    await textarea.click();
    await expect.element(textarea).toHaveFocus();

    expect(getComputedStyle(textarea.element()).boxShadow).toBe("none");
    expect(getComputedStyle(shell).boxShadow).not.toBe(idleShellShadow);
  });

  it.each(["inline", "compact"] as const)(
    "renders a TextField-wrapped text area across the %s row",
    async (layout) => {
      await render(
        <div style={{width: 480}}>
          <SlashCommandsFixture layout={layout} />
        </div>,
      );
      const textarea = page.getByRole("textbox", {name: "Message input"}).element();

      /* Unplaced, the wrapper falls into an auto column at the textarea's ~156px intrinsic width. */
      expect(textarea.getBoundingClientRect().width).toBeGreaterThan(360);
    },
  );

  it("renders attachment spacing for a wrapped stacked text area", async () => {
    await render(
      <PromptInput>
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.Attachments>
              <span>file.pdf</span>
            </PromptInput.Attachments>
            <TextField aria-label="Message input">
              <PromptInput.TextArea />
            </TextField>
          </PromptInput.Content>
        </PromptInput.Shell>
      </PromptInput>,
    );
    const textarea = page.getByRole("textbox", {name: "Message input"}).element();

    expect(getComputedStyle(textarea).paddingTop).toBe("4px");
  });

  it("expands compact layout for natural wrapping and collapses when cleared", async () => {
    await render(<CompactComposer />);
    const root = page.getByTestId("compact-prompt");
    const textarea = page.getByRole("textbox", {name: "Compact message input"});

    expect(Math.round(textarea.element().getBoundingClientRect().height)).toBe(48);
    await textarea.fill(
      "This is a naturally wrapping prompt that needs more than one visual line in a narrow composer.",
    );

    await expect.poll(() => textarea.element().getBoundingClientRect().height).toBeGreaterThan(48);
    await expect.element(root).toHaveAttribute("data-expanded", "true");

    await textarea.fill("");
    await expect.poll(() => Math.round(textarea.element().getBoundingClientRect().height)).toBe(48);
    await expect.element(root).not.toHaveAttribute("data-expanded");
  });
});
