"use client";

import type {SwitchRootProps} from "../switch";
import type {CellSwitchVariants} from "@sy-inc/styles";
import type {ReactNode} from "react";

import {cellSwitchSurface, cellSwitchVariants} from "@sy-inc/styles";

import {Description} from "../description";
import {Label} from "../label";
import {Switch} from "../switch";

/* The variant only marks the root, so the slots are constant per variant. */
const slots = cellSwitchVariants();

/* -------------------------------------------------------------------------------------------------
 * CellSwitch
 * -----------------------------------------------------------------------------------------------*/
interface CellSwitchProps
  extends Omit<SwitchRootProps, "children" | "className" | "variant">, CellSwitchVariants {
  /** Inline badge rendered after the label text. */
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Secondary line under the label. */
  description?: ReactNode;
}

/**
 * Single-line settings switch. For any other composition, use
 * `<Switch variant="cell">` with the Switch parts directly.
 */
const CellSwitch = ({
  badge,
  children,
  className,
  description,
  variant = "default",
  ...props
}: CellSwitchProps) => (
  <Switch
    {...props}
    className={slots.base({variant, className})}
    variant={cellSwitchSurface[variant]}
  >
    <Switch.Content>
      <span className={slots.copy()} data-slot="cell-switch-copy">
        <Label>
          {children}
          {badge == null ? null : (
            <span className={slots.badge()} data-slot="cell-switch-badge">
              {badge}
            </span>
          )}
        </Label>
        {description == null ? null : <Description>{description}</Description>}
      </span>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Content>
  </Switch>
);

CellSwitch.displayName = "SY INC.CellSwitch";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {CellSwitch};

export type {CellSwitchProps};
