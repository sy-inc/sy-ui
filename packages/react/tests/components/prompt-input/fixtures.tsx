import type {ComponentProps} from "react";

import {PromptInput} from "@/components/prompt-input";

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
