import type {SplitViewRootProps} from "@/components/split-view";

import {useState} from "react";

import {Button} from "@/components/button";
import {SplitView} from "@/components/split-view";

export const WorkspaceFixture = ({
  endOpen = true,
  noStart = false,
  width = 1280,
  ...props
}: SplitViewRootProps & {width?: number; endOpen?: boolean; noStart?: boolean}) => {
  const [activePane, setActivePane] = useState<"start" | "content" | "end">("start");

  return (
    <div data-testid="workspace-container" style={{height: 240, width}}>
      <SplitView activePane={activePane} aria-label="Workspace" role="group" {...props}>
        {!noStart && (
          <SplitView.Pane aria-label="Navigation">
            <Button onPress={() => setActivePane("content")}>Select conversation</Button>
            {Array.from({length: 30}, (_, i) => (
              <p key={i}>Conversation {i}</p>
            ))}
          </SplitView.Pane>
        )}
        <SplitView.Content aria-label="Main content" variant="surface">
          <SplitView.Back aria-label="Back to list" onPress={() => setActivePane("start")} />
          <input aria-label="Draft" defaultValue="Keep this draft" />
          <Button onPress={() => setActivePane("end")}>Open inspector</Button>
        </SplitView.Content>
        <SplitView.Pane aria-label="Inspector" isOpen={endOpen} position="end" variant="surface">
          <SplitView.Back
            aria-label="Back to content"
            targetPane="content"
            onPress={() => setActivePane("content")}
          />
          <input aria-label="Inspector notes" defaultValue="Keep this note" />
        </SplitView.Pane>
      </SplitView>
    </div>
  );
};
