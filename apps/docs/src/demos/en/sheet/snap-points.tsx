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
        <Button variant="secondary">Open snap sheet</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content className="mx-auto max-w-[420px]">
          <Sheet.Dialog>
            <Sheet.Handle />
            <Sheet.Header>
              <Sheet.Heading>Snap points</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body>
              <p>
                Click the handle or use its arrow keys to move between 35%, 65%, and 100% of the
                available height.
              </p>
              <p className="mt-3 text-xs text-muted">
                Active point: <code>{String(activeSnapPoint)}</code>
              </p>
            </Sheet.Body>
            <Sheet.Footer>
              <Button slot="close">Close</Button>
            </Sheet.Footer>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
