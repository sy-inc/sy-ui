import {Button, Sheet} from "@sy-inc/react";

const NESTED_DIALOG_HEIGHT = "h-[320px]";

export function Advanced() {
  return (
    <Sheet>
      <Sheet.Trigger>
        <Button variant="secondary">打开父 Sheet</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content className="mx-auto max-w-[420px]">
          <Sheet.Dialog className={NESTED_DIALOG_HEIGHT}>
            <Sheet.Handle />
            <Sheet.CloseTrigger />
            <Sheet.Header>
              <Sheet.Heading>父 Sheet</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body className="flex flex-col justify-between pb-4">
              <p className="mb-4 text-sm text-muted">
                这是父 Sheet。打开嵌套 Sheet 后，父层会缩小，子层会滑到它的上方。
              </p>
              <Sheet.NestedRoot>
                <Sheet.Trigger>
                  <Button className="w-full" variant="secondary">
                    打开嵌套 Sheet
                  </Button>
                </Sheet.Trigger>
                <Sheet.Backdrop>
                  <Sheet.Content className="mx-auto max-w-[420px]">
                    <Sheet.Dialog className={NESTED_DIALOG_HEIGHT}>
                      <Sheet.Handle />
                      <Sheet.CloseTrigger />
                      <Sheet.Header>
                        <Sheet.Heading>嵌套 Sheet</Sheet.Heading>
                      </Sheet.Header>
                      <Sheet.Body>
                        <p className="mb-4 text-sm text-muted">
                          这个嵌套 Sheet 位于父层上方。向下拖拽即可关闭并返回父 Sheet。
                        </p>
                        <Sheet.NestedRoot>
                          <Sheet.Trigger>
                            <Button className="w-full" variant="secondary">
                              继续深入
                            </Button>
                          </Sheet.Trigger>
                          <Sheet.Backdrop>
                            <Sheet.Content className="mx-auto max-w-[420px]">
                              <Sheet.Dialog className={NESTED_DIALOG_HEIGHT}>
                                <Sheet.Handle />
                                <Sheet.CloseTrigger />
                                <Sheet.Header>
                                  <Sheet.Heading>第三层</Sheet.Heading>
                                </Sheet.Header>
                                <Sheet.Body>
                                  <p className="text-sm text-muted">
                                    已进入第三层。每当下一层打开时，它的父 Sheet
                                    都会缩小并形成堆叠效果。
                                  </p>
                                </Sheet.Body>
                                <Sheet.Footer>
                                  <Button className="w-full" slot="close">
                                    关闭
                                  </Button>
                                </Sheet.Footer>
                              </Sheet.Dialog>
                            </Sheet.Content>
                          </Sheet.Backdrop>
                        </Sheet.NestedRoot>
                      </Sheet.Body>
                      <Sheet.Footer>
                        <Button slot="close" variant="secondary">
                          返回
                        </Button>
                      </Sheet.Footer>
                    </Sheet.Dialog>
                  </Sheet.Content>
                </Sheet.Backdrop>
              </Sheet.NestedRoot>
            </Sheet.Body>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
