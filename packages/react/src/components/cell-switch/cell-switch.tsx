"use client";

import type {ReactNode} from "react";

import React from "react";

import {Switch, type SwitchProps} from "../switch";

import {cellSwitchVariants, type CellSwitchVariants} from "./cell-switch.styles";

export interface CellSwitchProps
  extends Omit<SwitchProps, "children" | "className" | "variant">,
    CellSwitchVariants {
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
}

export const CellSwitch = React.forwardRef<HTMLDivElement, CellSwitchProps>(
  ({badge, children, className, description, variant, ...props}, ref) => {
    const slots = cellSwitchVariants({variant});

    return (
      <Switch {...props} ref={ref} className={slots.base({className})}>
        <Switch.Content className={slots.content()}>
          <span className={slots.copy()} data-slot="cell-switch-copy">
            <span className={slots.label()} data-slot="cell-switch-label">
              {children}
              {badge ? (
                <span className={slots.badge()} data-slot="cell-switch-badge">
                  {badge}
                </span>
              ) : null}
            </span>
            {description ? (
              <span className={slots.description()} data-slot="cell-switch-description">
                {description}
              </span>
            ) : null}
          </span>
          <Switch.Control className={slots.control()}>
            <Switch.Thumb className={slots.thumb()} />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    );
  },
);

CellSwitch.displayName = "SY INC.CellSwitch";
