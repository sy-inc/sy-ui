import type {DrawerSnapPoint} from "@/components/drawer";

import {Button} from "@/components/button";
import {Drawer} from "@/components/drawer";

export type DrawerFixtureProps = {
  activeSnapPoint?: DrawerSnapPoint;
  backdropVariant?: "blur" | "opaque" | "transparent";
  defaultActiveSnapPoint?: DrawerSnapPoint;
  fadeFromIndex?: number;
  defaultOpen?: boolean;
  isDetached?: boolean;
  isDismissable?: boolean;
  isHandleOnly?: boolean;
  isModal?: boolean;
  isOpen?: boolean;
  onActiveSnapPointChange?: (point: DrawerSnapPoint) => void;
  onOpenChange?: (open: boolean) => void;
  placement?: "top" | "bottom" | "left" | "right";
  shouldScaleBackground?: boolean;
  snapPoints?: readonly DrawerSnapPoint[];
};

export const DrawerFixture = (props: DrawerFixtureProps = {}) => (
  <Drawer
    activeSnapPoint={props.activeSnapPoint}
    defaultActiveSnapPoint={props.defaultActiveSnapPoint}
    fadeFromIndex={props.fadeFromIndex}
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
    <Button variant="secondary">Open Drawer</Button>
    <Drawer.Backdrop variant={props.backdropVariant}>
      <Drawer.Content>
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>Drawer Title</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <p>Drawer body content</p>
            <Button>Inside action</Button>
          </Drawer.Body>
          <Drawer.Footer>
            <Button slot="close">Confirm</Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);
