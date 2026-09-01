import type {ActionBarProps} from "@/components/action-bar";

import {ActionBar} from "@/components/action-bar";
import {Button} from "@/components/button";
import {CloseButton} from "@/components/close-button";
import {Separator} from "@/components/separator";

export const ActionBarFixture = ({
  isOpen = true,
  onAction,
  ...props
}: Omit<ActionBarProps, "children" | "isOpen"> & {isOpen?: boolean; onAction?: () => void}) => (
  <ActionBar isOpen={isOpen} {...props}>
    <span>2 selected</span>
    <Separator />
    <Button onPress={onAction}>Archive</Button>
    <Button onPress={onAction}>Move</Button>
    <Separator />
    <CloseButton aria-label="Clear selection" onPress={onAction} />
  </ActionBar>
);
