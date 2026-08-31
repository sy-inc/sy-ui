import {Button, Sheet} from "@sy-inc/react";

export function Basic() {
  return (
    <Sheet>
      <Sheet.Trigger>
        <Button variant="secondary">打开 Sheet</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content className="mx-auto max-w-[420px]">
          <Sheet.Dialog>
            <Sheet.Handle />
            <Sheet.CloseTrigger />
            <Sheet.Header>
              <Sheet.Heading>Sheet 标题</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body>
              <p>
                Sheet 适合在不离开当前页面的情况下承载聚焦的内容与操作。面板可以从手柄或非交互区域
                开始拖拽。
              </p>
            </Sheet.Body>
            <Sheet.Footer>
              <Button slot="close" variant="secondary">
                取消
              </Button>
              <Button slot="close">确认</Button>
            </Sheet.Footer>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
