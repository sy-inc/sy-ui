import type {Layout, ResizableHandleType} from "./index";
import type {Meta, StoryObj} from "@storybook/react";

import React from "react";

import {Resizable} from "./index";

const Example = ({
  disabled = false,
  handleType = "line",
  orientation = "horizontal",
}: {
  disabled?: boolean;
  handleType?: ResizableHandleType;
  orientation?: "horizontal" | "vertical";
}) => {
  const [layout, setLayout] = React.useState<Layout>({});

  return (
    <div className={orientation === "horizontal" ? "h-64 w-full max-w-3xl" : "h-96 w-96"}>
      <Resizable orientation={orientation} onLayoutChange={setLayout}>
        <Resizable.Panel
          className="bg-surface p-4 text-foreground"
          defaultSize="30%"
          id="sidebar"
          minSize="20%"
        >
          Sidebar
        </Resizable.Panel>
        <Resizable.Handle disabled={disabled} type={handleType} />
        <Resizable.Panel className="bg-surface p-4 text-foreground" minSize="30%">
          Main panel — drag the divider or use arrow keys.
        </Resizable.Panel>
      </Resizable>
      <p className="mt-3 bg-surface p-2 text-sm text-foreground">
        Sidebar: {Math.round(layout["sidebar"] ?? 30)}%
      </p>
    </div>
  );
};

const meta: Meta<typeof Resizable> = {
  title: "Components/Resizable",
  component: Resizable,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Resizable>;

export const Default: Story = {
  render: () => <Example />,
};

export const Vertical: Story = {
  render: () => <Example orientation="vertical" />,
};

const handleTypes: ResizableHandleType[] = ["line", "drag", "pill"];

export const Types: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      {handleTypes.map((type) => (
        <div key={type} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-foreground uppercase">{type}</span>
          <div className="h-40 overflow-hidden rounded-xl border border-border">
            <Resizable>
              <Resizable.Panel className="flex items-center justify-center bg-surface p-4 text-surface-foreground">
                Left
              </Resizable.Panel>
              <Resizable.Handle aria-label={`${type} resize handle`} type={type} />
              <Resizable.Panel className="flex items-center justify-center bg-surface-secondary p-4 text-surface-secondary-foreground">
                Right
              </Resizable.Panel>
            </Resizable>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Nested: Story = {
  render: () => (
    <div className="h-96 w-full max-w-3xl overflow-hidden rounded-xl border border-border">
      <Resizable>
        <Resizable.Panel className="bg-surface" defaultSize="25%" minSize="15%">
          <div className="flex size-full items-center justify-center p-6 text-surface-foreground">
            Sidebar
          </div>
        </Resizable.Panel>
        <Resizable.Handle aria-label="Resize sidebar" />
        <Resizable.Panel className="overflow-hidden" minSize="40%">
          <Resizable orientation="vertical">
            <Resizable.Panel className="bg-surface" defaultSize="65%" minSize="20%">
              <div className="flex size-full items-center justify-center p-6 text-surface-foreground">
                Editor
              </div>
            </Resizable.Panel>
            <Resizable.Handle aria-label="Resize editor" />
            <Resizable.Panel className="bg-surface-secondary" minSize="15%">
              <div className="flex size-full items-center justify-center p-6 text-surface-secondary-foreground">
                Terminal
              </div>
            </Resizable.Panel>
          </Resizable>
        </Resizable.Panel>
      </Resizable>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <Example disabled />,
};

export const Constraints: Story = {
  render: () => (
    <div className="h-64 w-full max-w-3xl">
      <Resizable>
        <Resizable.Panel
          className="bg-surface p-4 text-foreground"
          defaultSize="25%"
          maxSize="30%"
          minSize="20%"
        >
          First (20–30%)
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel className="bg-surface p-4 text-foreground" defaultSize="50%" minSize="40%">
          Middle (min 40%)
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel className="bg-surface p-4 text-foreground" defaultSize="25%" minSize="20%">
          Last (min 20%)
        </Resizable.Panel>
      </Resizable>
    </div>
  ),
};
