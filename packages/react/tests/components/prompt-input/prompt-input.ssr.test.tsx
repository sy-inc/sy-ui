import {ssrSmoke} from "@sy-inc/testing/helpers";

import {PromptInput} from "@/components/prompt-input";

describe("PromptInput SSR", () => {
  it("renders without hydration mismatch", async () => {
    await ssrSmoke(
      <PromptInput defaultValue="Hello">
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea aria-label="Message input" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>,
    );
  });
});
