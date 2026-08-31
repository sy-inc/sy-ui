"use client";

import type {TextShimmerVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {textShimmerVariants} from "@sy-inc/styles";

/* -------------------------------------------------------------------------------------------------
 * Text Shimmer Root
 * -----------------------------------------------------------------------------------------------*/
interface TextShimmerRootProps extends ComponentPropsWithRef<"span">, TextShimmerVariants {}

const TextShimmerRoot = ({children, className, ...rest}: TextShimmerRootProps) => (
  <span className={textShimmerVariants({className})} data-slot="text-shimmer" {...rest}>
    {children}
  </span>
);

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {TextShimmerRoot};

export type {TextShimmerRootProps};
