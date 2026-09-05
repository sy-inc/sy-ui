import type {ComponentProps} from "react";

import {CountdownRoot} from "./countdown";

export const Countdown = Object.assign(CountdownRoot, {Root: CountdownRoot});

export type Countdown = {
  Props: ComponentProps<typeof CountdownRoot>;
  RootProps: ComponentProps<typeof CountdownRoot>;
};

export {CountdownRoot};
export type {CountdownRootProps, CountdownRootProps as CountdownProps} from "./countdown";
export {countdownVariants} from "@sy-inc/styles";
export type {CountdownVariants} from "@sy-inc/styles";
