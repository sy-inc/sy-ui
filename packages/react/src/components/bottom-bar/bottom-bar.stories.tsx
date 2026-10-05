import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";

import {RouterProvider} from "../rac";
import {Spinner} from "../spinner";

import {BottomBar} from "./index";

const destinations = [
  {id: "home", icon: "gravity-ui:house", label: "Home"},
  {id: "search", icon: "gravity-ui:magnifier", label: "Search"},
  {id: "create", icon: "gravity-ui:plus", label: "Create"},
  {id: "profile", icon: "gravity-ui:person", label: "Profile"},
] as const;

/**
 * Links to `/<id>`; the RouterProvider stands in for the app router, so the story keeps the
 * current page in state instead of navigating the frame.
 */
const RoutedBottomBar = ({
  initialPage = "/home",
  ...props
}: Omit<React.ComponentProps<typeof BottomBar>, "children"> & {initialPage?: string}) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  return (
    <RouterProvider navigate={setCurrentPage}>
      <BottomBar aria-label="Primary navigation" {...props}>
        {destinations.map((destination) => (
          <BottomBar.Item
            key={destination.id}
            aria-label={destination.label}
            href={`/${destination.id}`}
            isActive={currentPage === `/${destination.id}`}
          >
            <BottomBar.Icon>
              <Icon icon={destination.icon} />
            </BottomBar.Icon>
          </BottomBar.Item>
        ))}
      </BottomBar>
    </RouterProvider>
  );
};

const meta = {
  argTypes: {
    position: {
      control: "select",
      options: ["fixed", "sticky", "static"],
    },
  },
  args: {
    position: "fixed",
  },
  component: BottomBar,
  parameters: {
    layout: "centered",
  },
  title: "Components/Navigation/BottomBar",
} satisfies Meta<typeof BottomBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[390px] rounded-4xl bg-background p-4 pt-72">
      <RoutedBottomBar {...args} />
    </div>
  ),
};

export const ColorSelection: Story = {
  render: () => (
    <div className="w-[390px] rounded-4xl bg-background p-4 pt-72">
      <RoutedBottomBar selectionStyle="color" />
    </div>
  ),
};

export const UnderlineSelection: Story = {
  render: () => (
    <div className="w-[390px] rounded-4xl bg-background p-4 pt-72">
      <RoutedBottomBar selectionStyle="underline" />
    </div>
  ),
};

export const EdgeAttached: Story = {
  render: () => (
    <div className="relative h-[640px] w-[390px] overflow-y-auto bg-linear-to-br from-accent/15 via-background to-surface">
      <div className="space-y-4 p-4 pb-24">
        {Array.from({length: 7}, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-3xl border border-border/70 bg-surface/65 p-5 backdrop-blur-sm"
          >
            <p className="text-sm font-semibold">Page content {index + 1}</p>
            <p className="mt-2 text-xs text-muted">
              The navigation stays attached to the viewport edge.
            </p>
          </div>
        ))}
      </div>
      <RoutedBottomBar position="fixed" variant="edge" />
    </div>
  ),
};

export const FixedWithScrollingContent: Story = {
  render: () => (
    <div className="relative h-[640px] w-[390px] overflow-y-auto bg-background">
      <div className="space-y-4">
        {Array.from({length: 8}, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-3xl border border-border/70 bg-linear-to-br from-accent/20 via-surface to-surface-secondary p-5"
          >
            <p className="text-sm font-semibold">Scrollable content {index + 1}</p>
            <p className="mt-2 text-xs text-muted">
              Scroll this content behind the fixed glass BottomBar.
            </p>
          </div>
        ))}
      </div>
      <RoutedBottomBar position="fixed" />
    </div>
  ),
};

/** The current page (`/settings`) is not in the bar, so no item is highlighted. */
export const NoActiveDestination: Story = {
  render: (args) => (
    <div className="w-[390px] rounded-4xl bg-background p-4 pt-72">
      <RoutedBottomBar {...args} initialPage="/settings" />
    </div>
  ),
};

/** Items without `href` render buttons, for switching views within one page. */
export const InPageViews: Story = {
  render: (args) => {
    const [view, setView] = React.useState("inbox");

    return (
      <div className="w-[390px] rounded-4xl bg-background p-4 pt-72">
        <BottomBar {...args} aria-label="Mailbox views">
          {["inbox", "archive", "trash"].map((id) => (
            <BottomBar.Item key={id} isActive={view === id} onPress={() => setView(id)}>
              <BottomBar.Label className="capitalize">{id}</BottomBar.Label>
            </BottomBar.Item>
          ))}
        </BottomBar>
      </div>
    );
  },
};

export const DisabledAndPending: Story = {
  render: (args) => (
    <div className="w-[390px] rounded-4xl bg-background p-4 pt-72">
      <BottomBar {...args} aria-label="Primary navigation">
        <BottomBar.Item isActive href="#home">
          <BottomBar.Icon>
            <Icon icon="gravity-ui:house" />
          </BottomBar.Icon>
          <BottomBar.Label>Home</BottomBar.Label>
        </BottomBar.Item>
        <BottomBar.Item aria-describedby="sync-status" href="#sync">
          <BottomBar.Icon>
            <Spinner color="current" size="sm" />
          </BottomBar.Icon>
          <BottomBar.Label>
            Sync
            <span className="sr-only" id="sync-status">
              Loading
            </span>
          </BottomBar.Label>
        </BottomBar.Item>
        <BottomBar.Item isDisabled href="#profile">
          <BottomBar.Icon>
            <Icon icon="gravity-ui:person" />
          </BottomBar.Icon>
          <BottomBar.Label>Profile</BottomBar.Label>
        </BottomBar.Item>
      </BottomBar>
    </div>
  ),
};
