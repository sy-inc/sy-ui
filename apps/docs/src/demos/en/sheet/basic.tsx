import {Button, Sheet} from "@sy-inc/react";

export function Basic() {
  return (
    <Sheet>
      <Sheet.Trigger>
        <Button variant="secondary">Open Sheet</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content className="mx-auto max-w-[420px]">
          <Sheet.Dialog>
            <Sheet.Handle />
            <Sheet.CloseTrigger />
            <Sheet.Header>
              <Sheet.Heading>Sheet title</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body>
              <p>
                Use a Sheet for focused content and actions without leaving the current page. The
                panel can be dragged from its handle or non-interactive areas.
              </p>
            </Sheet.Body>
            <Sheet.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button slot="close">Confirm</Button>
            </Sheet.Footer>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
