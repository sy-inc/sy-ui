import {Button, Drawer} from "@sy-inc/react";

const NESTED_DIALOG_HEIGHT = "h-[320px]";

export function Advanced() {
  return (
    <Drawer>
      <Button variant="secondary">Open Parent Drawer</Button>
      <Drawer.Backdrop>
        <Drawer.Content className="mx-auto max-w-[420px]">
          <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Parent Drawer</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col justify-between pb-4">
              <p className="mb-4 text-sm text-muted">
                This is the parent drawer. Open a nested drawer from here — the parent will scale
                down and the child slides on top.
              </p>
              <Drawer>
                <Button className="w-full" variant="secondary">
                  Open Nested Drawer
                </Button>
                <Drawer.Backdrop>
                  <Drawer.Content className="mx-auto max-w-[420px]">
                    <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
                      <Drawer.Handle />
                      <Drawer.CloseTrigger />
                      <Drawer.Header>
                        <Drawer.Heading>Nested Drawer</Drawer.Heading>
                      </Drawer.Header>
                      <Drawer.Body>
                        <p className="mb-4 text-sm text-muted">
                          This is a nested drawer that sits on top of the parent. Drag it down to
                          dismiss and return to the parent drawer.
                        </p>
                        <Drawer>
                          <Button className="w-full" variant="secondary">
                            Go Deeper
                          </Button>
                          <Drawer.Backdrop>
                            <Drawer.Content className="mx-auto max-w-[420px]">
                              <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
                                <Drawer.Handle />
                                <Drawer.CloseTrigger />
                                <Drawer.Header>
                                  <Drawer.Heading>Third Level</Drawer.Heading>
                                </Drawer.Header>
                                <Drawer.Body>
                                  <p className="text-sm text-muted">
                                    Three levels deep! Each parent drawer scales down as the next
                                    one opens, creating a stacking effect.
                                  </p>
                                </Drawer.Body>
                                <Drawer.Footer>
                                  <Button className="w-full" slot="close">
                                    Close
                                  </Button>
                                </Drawer.Footer>
                              </Drawer.Dialog>
                            </Drawer.Content>
                          </Drawer.Backdrop>
                        </Drawer>
                      </Drawer.Body>
                      <Drawer.Footer>
                        <Button slot="close" variant="secondary">
                          Back
                        </Button>
                      </Drawer.Footer>
                    </Drawer.Dialog>
                  </Drawer.Content>
                </Drawer.Backdrop>
              </Drawer>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
