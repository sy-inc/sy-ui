import {render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";
import React from "react";

import {PromptInput} from "@/components/prompt-input";

import {PromptInputFixture} from "./fixtures";

describe("PromptInput", () => {
  it("exposes the documented compound slots and BEM modifiers", () => {
    render(<PromptInputFixture layout="compact" size="lg" status="error" variant="secondary" />);

    const root = screen.getByTestId("prompt-input");

    expect(root).toHaveAttribute("data-slot", "prompt-input");
    expect(root).toHaveAttribute("data-layout", "compact");
    expect(root).toHaveAttribute("data-status", "error");
    expect(root).toHaveAttribute("data-variant", "secondary");
    expect(root.className).toEqual(expect.stringContaining("prompt-input--lg"));
    expect(document.querySelector('[data-slot="prompt-input-shell"]')?.className).toEqual(
      expect.stringContaining("prompt-input__shell--secondary"),
    );
    [
      "prompt-input-shell",
      "prompt-input-content",
      "prompt-input-textarea",
      "prompt-input-toolbar",
      "prompt-input-toolbar-start",
      "prompt-input-action",
      "prompt-input-toolbar-end",
      "prompt-input-send",
      "prompt-input-footer",
    ].forEach((slot) => {
      expect(document.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    });
  });

  it("manages an uncontrolled value and submits on Enter", async () => {
    const user = setupUser();
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();

    render(<PromptInputFixture onSubmit={onSubmit} onValueChange={onValueChange} />);
    const textarea = screen.getByRole("textbox", {name: "Message input"});
    const send = screen.getByRole("button", {name: "Send message"});

    expect(send).toBeDisabled();
    await user.type(textarea, "Explain this");

    expect(textarea).toHaveValue("Explain this");
    expect(onValueChange).toHaveBeenLastCalledWith("Explain this");
    expect(send).toBeEnabled();

    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(textarea).toHaveFocus();
  });

  it("keeps Shift+Enter as a newline without submitting", async () => {
    const user = setupUser();
    const onSubmit = vi.fn();

    render(<PromptInputFixture onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox", {name: "Message input"});

    await user.type(textarea, "Line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}Line two");

    expect(textarea).toHaveValue("Line one\nLine two");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("supports a controlled value contract", async () => {
    const user = setupUser();
    const onValueChange = vi.fn();

    render(<PromptInputFixture value="Controlled" onValueChange={onValueChange} />);
    const textarea = screen.getByRole("textbox", {name: "Message input"});

    await user.type(textarea, " value");
    expect(textarea).toHaveValue("Controlled");
    expect(onValueChange).toHaveBeenCalled();
  });

  it("locks input during a run and calls onStop from Send", async () => {
    const user = setupUser();
    const onStop = vi.fn();

    render(<PromptInputFixture defaultValue="Working" status="streaming" onStop={onStop} />);

    expect(screen.getByRole("textbox", {name: "Message input"})).toBeDisabled();
    const stop = screen.getByRole("button", {name: "Stop generating"});

    expect(stop).toBeEnabled();
    await user.click(stop);
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("supports leaving input editable while running", () => {
    render(<PromptInputFixture defaultValue="Working" lockInputOnRun={false} status="submitted" />);

    expect(screen.getByRole("textbox", {name: "Message input"})).toBeEnabled();
    expect(screen.getByRole("button", {name: "Stop generating"})).toBeEnabled();
  });

  it("disables the composer and exposes its state", () => {
    render(<PromptInputFixture isDisabled defaultValue="Hello" />);

    expect(screen.getByTestId("prompt-input")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByRole("textbox", {name: "Message input"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Attach file"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Send message"})).toBeDisabled();
  });

  it("keeps root disabled authoritative for explicitly enabled parts and the queue", () => {
    const onRemove = vi.fn();
    const onReorder = vi.fn();

    render(
      <PromptInput isDisabled data-testid="disabled-prompt" defaultValue="Hello">
        <PromptInput.Queue actionsVisibility="always" values={["brief.pdf"]} onReorder={onReorder}>
          <PromptInput.Queue.Item value="brief.pdf">
            <PromptInput.Queue.Item.Handle aria-label="Reorder brief.pdf" isDisabled={false} />
            <PromptInput.Queue.Item.Body>
              <PromptInput.Queue.Item.Content>brief.pdf</PromptInput.Queue.Item.Content>
            </PromptInput.Queue.Item.Body>
            <PromptInput.Queue.Item.Actions>
              <PromptInput.Queue.Item.Remove isDisabled={false} onPress={onRemove} />
            </PromptInput.Queue.Item.Actions>
          </PromptInput.Queue.Item>
        </PromptInput.Queue>
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea aria-label="Message input" disabled={false} />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="Attach file" isDisabled={false}>
                Attach
              </PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send isDisabled={false} />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>,
    );

    const root = screen.getByTestId("disabled-prompt");

    expect(root).not.toHaveAttribute("inert");
    expect(document.querySelector('[data-slot="prompt-input-shell"]')).toHaveAttribute("inert");
    expect(document.querySelector('[data-slot="prompt-input-queue"]')).toHaveAttribute("inert");
    expect(screen.getByRole("textbox", {name: "Message input"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Attach file"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Send message"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Reorder brief.pdf"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Remove item"})).toBeDisabled();
    expect(onReorder).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  describe("queue reordering", () => {
    beforeEach(() => {
      vi.useFakeTimers({shouldAdvanceTime: true});
    });

    afterEach(() => {
      runAllTimers();
      vi.useRealTimers();
    });

    /** Tab into the grid, move to the row, reach its handle, then drag with the keyboard. */
    const dragWithKeyboard = async (row: number, keys: string) => {
      const user = setupUser({advanceTimers: vi.advanceTimersByTime});

      await user.tab();
      for (let index = 0; index < row; index += 1) await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{Enter}");
      runAllTimers();
      await user.keyboard(keys);
      runAllTimers();
      await user.keyboard("{Enter}");
      runAllTimers();
    };

    it("reorders queued values from the keyboard handle", async () => {
      const onReorder = vi.fn();

      render(
        <PromptInput>
          <PromptInput.Queue values={["brief.pdf", "notes.md"]} onReorder={onReorder}>
            {["brief.pdf", "notes.md"].map((file) => (
              <PromptInput.Queue.Item key={file} value={file}>
                <PromptInput.Queue.Item.Handle aria-label={`Reorder ${file}`} />
                <PromptInput.Queue.Item.Body>
                  <PromptInput.Queue.Item.Content>{file}</PromptInput.Queue.Item.Content>
                </PromptInput.Queue.Item.Body>
              </PromptInput.Queue.Item>
            ))}
          </PromptInput.Queue>
        </PromptInput>,
      );

      expect(screen.getByRole("grid", {name: "Queue"})).toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(2);

      await dragWithKeyboard(0, "{ArrowDown}");
      expect(onReorder).toHaveBeenCalledWith(["notes.md", "brief.pdf"]);
    });

    it("maps object values through getKey", async () => {
      const onReorder = vi.fn();
      const files = [
        {id: 1, name: "brief.pdf"},
        {id: 2, name: "notes.md"},
      ];

      render(
        <PromptInput>
          <PromptInput.Queue getKey={(file) => file.id} values={files} onReorder={onReorder}>
            {files.map((file) => (
              <PromptInput.Queue.Item key={file.id} textValue={file.name} value={file}>
                <PromptInput.Queue.Item.Handle aria-label={`Reorder ${file.name}`} />
                <PromptInput.Queue.Item.Content>{file.name}</PromptInput.Queue.Item.Content>
              </PromptInput.Queue.Item>
            ))}
          </PromptInput.Queue>
        </PromptInput>,
      );

      await dragWithKeyboard(1, "{ArrowUp}{ArrowUp}");
      expect(onReorder).toHaveBeenCalledWith([files[1], files[0]]);
    });
  });

  it("forwards root and textarea refs", () => {
    const rootRef = React.createRef<HTMLFormElement>();
    const textareaRef = React.createRef<HTMLTextAreaElement>();

    render(
      <PromptInput ref={rootRef}>
        <PromptInput.TextArea ref={textareaRef} aria-label="Message input" />
      </PromptInput>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLFormElement);
    expect(textareaRef.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
