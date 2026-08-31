import {Button, Sheet} from "@sy-inc/react";

const placements = ["bottom", "top", "left", "right"] as const;

export function Placements() {
  return (
    <div className="flex flex-wrap gap-4">
      {placements.map((p) => (
        <Sheet key={p} placement={p}>
          <Sheet.Trigger>
            <Button variant="secondary">{p.charAt(0).toUpperCase() + p.slice(1)}</Button>
          </Sheet.Trigger>
          <Sheet.Backdrop variant="blur">
            <Sheet.Content className={p === "left" || p === "right" ? "w-[400px]" : undefined}>
              <Sheet.Dialog>
                <Sheet.CloseTrigger />
                {p === "bottom" && <Sheet.Handle />}
                <Sheet.Header>
                  <Sheet.Heading>{p.charAt(0).toUpperCase() + p.slice(1)} Sheet</Sheet.Heading>
                </Sheet.Header>
                <Sheet.Body>
                  <p className="text-sm text-muted">
                    此 Sheet 从屏幕的 <strong>{p}</strong> 边缘进入，并带有平滑的弹簧动画。
                  </p>
                </Sheet.Body>
                <Sheet.Footer>
                  <Button slot="close" variant="secondary">
                    取消
                  </Button>
                  <Button slot="close">完成</Button>
                </Sheet.Footer>
                {p === "top" && <Sheet.Handle />}
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>
      ))}
    </div>
  );
}
