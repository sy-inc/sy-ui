"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {SeparatorContentVariants} from "@sy-ui/styles";
import type {ReactNode} from "react";

import {separatorContentVariants} from "@sy-ui/styles";
import React from "react";

import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
 * Separator Content
 * -----------------------------------------------------------------------------------------------*/
interface SeparatorContentProps extends DOMRenderProps<"div", undefined>, SeparatorContentVariants {
  children: ReactNode;
  className?: string;
}

const SeparatorContent = ({
  children,
  className,
  variant = "default",
  ...props
}: SeparatorContentProps &
  Omit<React.JSX.IntrinsicElements["div"], keyof SeparatorContentProps>) => {
  const slots = separatorContentVariants({variant});

  return (
    <dom.div
      className={slots.container({className})}
      data-slot="separator-content"
      {...(props as any)}
    >
      <span aria-hidden="true" className={slots.line()} data-slot="separator-content-line" />
      <span className={slots.content()} data-slot="separator-content-content">
        {children}
      </span>
      <span aria-hidden="true" className={slots.line()} data-slot="separator-content-line" />
    </dom.div>
  );
};

export {SeparatorContent};

export type {SeparatorContentProps};
