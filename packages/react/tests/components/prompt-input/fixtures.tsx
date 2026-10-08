import type {ComponentProps} from "react";

import {useState} from "react";

import {Autocomplete} from "@/components/autocomplete";
import {ListBox} from "@/components/list-box";
import {PromptInput} from "@/components/prompt-input";
import {TextField} from "@/components/textfield";

type PromptInputFixtureProps = ComponentProps<typeof PromptInput> & {
  withFooter?: boolean;
};

export const PromptInputFixture = ({withFooter = true, ...props}: PromptInputFixtureProps) => (
  <PromptInput data-testid="prompt-input" {...props}>
    <PromptInput.Shell>
      <PromptInput.Content>
        <PromptInput.TextArea aria-label="Message input" placeholder="What do you want to know?" />
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
    {withFooter ? (
      <PromptInput.Footer>AI can make mistakes. Check important info.</PromptInput.Footer>
    ) : null}
  </PromptInput>
);

const quickReplies = [
  {id: "greet", shortcut: "greet", text: "Hi there!"},
  {id: "refund", shortcut: "refund", text: "Refunds take 3 days."},
  {id: "thanks", shortcut: "thanks", text: "Thanks for reaching out."},
];

const getSlashQuery = (value: string) => /(?:^|\s)\/(\S*)$/.exec(value)?.[1];

/** The documented `/` quick-reply composition: Autocomplete.Filter + TextField + inline ListBox. */
export const SlashCommandsFixture = ({onSubmit}: {onSubmit?: (value: string) => void}) => {
  const [value, setValue] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const query = isDismissed ? undefined : getSlashQuery(value);

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    setIsDismissed(false);
  };

  return (
    <PromptInput
      value={value}
      onValueChange={handleValueChange}
      onSubmit={() => {
        onSubmit?.(value);
        setValue("");
      }}
    >
      <Autocomplete.Filter
        inputValue={value}
        filter={(textValue, inputValue) =>
          textValue.startsWith((getSlashQuery(inputValue) ?? "").toLowerCase())
        }
        onInputChange={handleValueChange}
      >
        {query !== undefined ? (
          <ListBox
            aria-label="Quick replies"
            items={quickReplies}
            renderEmptyState={() => "No quick replies"}
            onAction={(key) => {
              const reply = quickReplies.find((item) => item.id === key);

              if (reply) setValue(value.replace(/\/\S*$/, reply.text));
            }}
          >
            {(item) => (
              <ListBox.Item id={item.id} textValue={item.shortcut}>
                /{item.shortcut}
              </ListBox.Item>
            )}
          </ListBox>
        ) : null}
        <PromptInput.Shell>
          <PromptInput.Content>
            <TextField aria-label="Message input">
              <PromptInput.TextArea
                spellCheck
                onKeyDown={(event) => {
                  if (event.key === "Escape") setIsDismissed(true);
                }}
              />
            </TextField>
          </PromptInput.Content>
          <PromptInput.Send />
        </PromptInput.Shell>
      </Autocomplete.Filter>
    </PromptInput>
  );
};
