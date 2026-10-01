"use client";

import type {DrawerSnapPoint} from "@sy-inc/react";

import {Button, Drawer} from "@sy-inc/react";
import React from "react";

const snapPoints = [0.35, 0.65, 1] as const;

export function SnapPoints() {
  const [activeSnapPoint, setActiveSnapPoint] = React.useState<DrawerSnapPoint>(snapPoints[1]);

  return (
    <Drawer
      activeSnapPoint={activeSnapPoint}
      snapPoints={snapPoints}
      onActiveSnapPointChange={(point) => setActiveSnapPoint(point)}
    >
      <Button variant="secondary">打开带 snap point 的 Drawer</Button>
      <Drawer.Backdrop>
        <Drawer.Content className="mx-auto max-w-[420px]">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Heading>Snap points</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <p>点击手柄或使用方向键，在可用高度的 35%、65% 和 100% 之间切换。</p>
              <p className="mt-3 text-xs text-muted">
                当前 point：<code>{String(activeSnapPoint)}</code>
              </p>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close">关闭</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
