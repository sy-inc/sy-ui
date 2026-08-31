import type {TextShimmerProps} from "./index";
import type {Meta} from "@storybook/react";

import React from "react";

import {TextShimmer} from "./index";

/**
 * The shimmer is driven entirely by CSS custom properties, so every knob is set
 * through `style` (or a wrapper class) rather than a prop.
 */
const vars = (values: Record<string, number | string>) => values as React.CSSProperties;

const Row = ({children, label}: {children: React.ReactNode; label: string}) => (
  <div className="flex items-baseline gap-4">
    <span className="w-40 shrink-0 font-mono text-xs text-muted">{label}</span>
    {children}
  </div>
);

export default {
  argTypes: {
    children: {control: "text"},
  },
  component: TextShimmer,
  parameters: {
    layout: "centered",
  },
  title: "Components/Feedback/TextShimmer",
} as Meta<typeof TextShimmer>;

const defaultArgs: TextShimmerProps = {
  children: "Thinking...",
};

const Template = (props: TextShimmerProps) => <TextShimmer {...props} />;

/**
 * `--shimmer-speed` is px per second. The duration is derived from it, so raising
 * the speed shortens the sweep without touching any other value.
 */
const SpeedTemplate = (props: TextShimmerProps) => (
  <div className="flex flex-col gap-3">
    <Row label="--shimmer-speed: 90">
      <TextShimmer {...props} style={vars({"--shimmer-speed": 90})} />
    </Row>
    <Row label="200 (default)">
      <TextShimmer {...props} />
    </Row>
    <Row label="--shimmer-speed: 450">
      <TextShimmer {...props} style={vars({"--shimmer-speed": 450})} />
    </Row>
  </div>
);

/**
 * `--shimmer-angle` tilts the highlight. 90deg is a flat vertical edge; the default
 * 105deg leans it slightly so the top of the glyphs lights up before the bottom.
 */
const AngleTemplate = (props: TextShimmerProps) => (
  <div className="flex flex-col gap-3">
    <Row label="--shimmer-angle: 90deg">
      <TextShimmer {...props} style={vars({"--shimmer-angle": "90deg"})} />
    </Row>
    <Row label="105deg (default)">
      <TextShimmer {...props} />
    </Row>
    <Row label="--shimmer-angle: 140deg">
      <TextShimmer {...props} style={vars({"--shimmer-angle": "140deg"})} />
    </Row>
  </div>
);

/**
 * The sweep runs at a constant speed, but it needs to know how far to travel.
 * `--shimmer-width` is that distance: the approximate text width in px, as a
 * unitless number. Leave it at the default and a long label sweeps at the wrong
 * speed — the top two rows below start and finish at noticeably different moments.
 */
const WidthTemplate = () => (
  <div className="flex flex-col gap-3">
    <Row label="192 (default)">
      <TextShimmer>Thinking...</TextShimmer>
    </Row>
    <Row label="192 — too short">
      <TextShimmer>Generating a much longer response for you...</TextShimmer>
    </Row>
    <Row label="--shimmer-width: 420">
      <TextShimmer style={vars({"--shimmer-width": 420})}>
        Generating a much longer response for you...
      </TextShimmer>
    </Row>
  </div>
);

/**
 * All four knobs at once. `--shimmer-spread` is the width of the bright band in px;
 * widen it for a soft wash, narrow it for a sharp glint.
 */
const PlaygroundTemplate = ({
  shimmerAngle,
  shimmerSpeed,
  shimmerSpread,
  shimmerWidth,
  ...props
}: TextShimmerProps & {
  shimmerAngle: number;
  shimmerSpeed: number;
  shimmerSpread: number;
  shimmerWidth: number;
}) => (
  <TextShimmer
    {...props}
    style={vars({
      "--shimmer-angle": `${shimmerAngle}deg`,
      "--shimmer-speed": shimmerSpeed,
      "--shimmer-spread": shimmerSpread,
      "--shimmer-width": shimmerWidth,
    })}
  />
);

export const Default = {
  args: defaultArgs,
  render: Template,
};

export const Speed = {
  args: defaultArgs,
  render: SpeedTemplate,
};

export const Angle = {
  args: defaultArgs,
  render: AngleTemplate,
};

export const Width = {
  render: WidthTemplate,
};

export const Playground = {
  argTypes: {
    shimmerAngle: {control: {max: 180, min: 0, step: 5, type: "range"}},
    shimmerSpeed: {control: {max: 600, min: 40, step: 10, type: "range"}},
    shimmerSpread: {control: {max: 320, min: 20, step: 4, type: "range"}},
    shimmerWidth: {control: {max: 600, min: 40, step: 10, type: "range"}},
  },
  args: {
    children: "Generating response...",
    shimmerAngle: 105,
    shimmerSpeed: 200,
    shimmerSpread: 112,
    shimmerWidth: 260,
  },
  render: PlaygroundTemplate,
};
