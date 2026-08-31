"use client";

import type {SheetSnapPoint} from "@sy-inc/react";

import {Button, Sheet} from "@sy-inc/react";
import React from "react";

const snapPoints = [0.35, 0.65, 1] as const;

export function SnapPoints() {
  const [activeSnapPoint, setActiveSnapPoint] = React.useState<SheetSnapPoint>(snapPoints[1]);

  return (
    <Sheet
      activeSnapPoint={activeSnapPoint}
      snapPoints={snapPoints}
      onActiveSnapPointChange={(point) => setActiveSnapPoint(point)}
    >
      <Sheet.Trigger>
        <Button variant="secondary">打开带 snap point 的 Sheet</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content className="mx-auto max-w-[420px]">
          <Sheet.Dialog>
            <Sheet.Handle />
            <Sheet.Header>
              <Sheet.Heading>Snap points</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body>
              <p>点击手柄或使用方向键，在可用高度的 35%、65% 和 100% 之间切换。</p>
              <p className="mt-3 text-xs text-muted">
                当前 point：<code>{String(activeSnapPoint)}</code>
              </p>
            </Sheet.Body>
            <Sheet.Footer>
              <Button slot="close">关闭</Button>
            </Sheet.Footer>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
