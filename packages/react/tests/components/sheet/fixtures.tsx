import type {SheetSnapPoint} from "@/components/sheet";

import {Button} from "@/components/button";
import {Sheet} from "@/components/sheet";

export type SheetFixtureProps = {
  activeSnapPoint?: SheetSnapPoint;
  backdropVariant?: "blur" | "opaque" | "transparent";
  defaultActiveSnapPoint?: SheetSnapPoint;
  defaultOpen?: boolean;
  isDetached?: boolean;
  isDismissable?: boolean;
  isHandleOnly?: boolean;
  isModal?: boolean;
  isOpen?: boolean;
  onActiveSnapPointChange?: (point: SheetSnapPoint) => void;
  onOpenChange?: (open: boolean) => void;
  placement?: "top" | "bottom" | "left" | "right";
  shouldScaleBackground?: boolean;
  snapPoints?: readonly SheetSnapPoint[];
};

export const SheetFixture = (props: SheetFixtureProps = {}) => (
  <Sheet
    activeSnapPoint={props.activeSnapPoint}
    defaultActiveSnapPoint={props.defaultActiveSnapPoint}
    defaultOpen={props.defaultOpen}
    isDetached={props.isDetached}
    isDismissable={props.isDismissable}
    isHandleOnly={props.isHandleOnly}
    isModal={props.isModal}
    isOpen={props.isOpen}
    placement={props.placement}
    shouldScaleBackground={props.shouldScaleBackground}
    snapPoints={props.snapPoints}
    onActiveSnapPointChange={props.onActiveSnapPointChange}
    onOpenChange={props.onOpenChange}
  >
    <Sheet.Trigger>
      <Button variant="secondary">Open Sheet</Button>
    </Sheet.Trigger>
    <Sheet.Backdrop variant={props.backdropVariant}>
      <Sheet.Content>
        <Sheet.Dialog>
          <Sheet.Handle />
          <Sheet.CloseTrigger />
          <Sheet.Header>
            <Sheet.Heading>Sheet Title</Sheet.Heading>
          </Sheet.Header>
          <Sheet.Body>
            <p>Sheet body content</p>
            <Button>Inside action</Button>
          </Sheet.Body>
          <Sheet.Footer>
            <Button slot="close">Confirm</Button>
          </Sheet.Footer>
        </Sheet.Dialog>
      </Sheet.Content>
    </Sheet.Backdrop>
  </Sheet>
);
