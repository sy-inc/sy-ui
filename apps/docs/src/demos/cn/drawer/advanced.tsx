import {Button, Drawer} from "@sy-inc/react";

const NESTED_DIALOG_HEIGHT = "h-[320px]";

export function Advanced() {
  return (
    <Drawer>
      <Button variant="secondary">打开父 Drawer</Button>
      <Drawer.Backdrop>
        <Drawer.Content className="mx-auto max-w-[420px]">
          <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>父 Drawer</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col justify-between pb-4">
              <p className="mb-4 text-sm text-muted">
                这是父 Drawer。打开嵌套 Drawer 后，父层会缩小，子层会滑到它的上方。
              </p>
              <Drawer>
                <Button className="w-full" variant="secondary">
                  打开嵌套 Drawer
                </Button>
                <Drawer.Backdrop>
                  <Drawer.Content className="mx-auto max-w-[420px]">
                    <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
                      <Drawer.Handle />
                      <Drawer.CloseTrigger />
                      <Drawer.Header>
                        <Drawer.Heading>嵌套 Drawer</Drawer.Heading>
                      </Drawer.Header>
                      <Drawer.Body>
                        <p className="mb-4 text-sm text-muted">
                          这个嵌套 Drawer 位于父层上方。向下拖拽即可关闭并返回父 Drawer。
                        </p>
                        <Drawer>
                          <Button className="w-full" variant="secondary">
                            继续深入
                          </Button>
                          <Drawer.Backdrop>
                            <Drawer.Content className="mx-auto max-w-[420px]">
                              <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
                                <Drawer.Handle />
                                <Drawer.CloseTrigger />
                                <Drawer.Header>
                                  <Drawer.Heading>第三层</Drawer.Heading>
                                </Drawer.Header>
                                <Drawer.Body>
                                  <p className="text-sm text-muted">
                                    已进入第三层。每当下一层打开时，它的父 Drawer
                                    都会缩小并形成堆叠效果。
                                  </p>
                                </Drawer.Body>
                                <Drawer.Footer>
                                  <Button className="w-full" slot="close">
                                    关闭
                                  </Button>
                                </Drawer.Footer>
                              </Drawer.Dialog>
                            </Drawer.Content>
                          </Drawer.Backdrop>
                        </Drawer>
                      </Drawer.Body>
                      <Drawer.Footer>
                        <Button slot="close" variant="secondary">
                          返回
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
