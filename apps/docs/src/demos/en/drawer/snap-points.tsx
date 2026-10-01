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
      <Button variant="secondary">Open snap drawer</Button>
      <Drawer.Backdrop>
        <Drawer.Content className="mx-auto max-w-[420px]">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Heading>Snap points</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <p>
                Click the handle or use its arrow keys to move between 35%, 65%, and 100% of the
                available height.
              </p>
              <p className="mt-3 text-xs text-muted">
                Active point: <code>{String(activeSnapPoint)}</code>
              </p>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close">Close</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
