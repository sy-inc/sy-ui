import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";

import {Disclosure} from "../disclosure";
import {Tabs} from "../tabs";

import {Sidebar} from "./index";

const platform = [
  {children: ["History", "Starred", "Settings"], icon: "gravity-ui:rocket", label: "Playground"},
  {icon: "gravity-ui:cube", label: "Models"},
  {icon: "gravity-ui:book-open", label: "Documentation"},
  {icon: "gravity-ui:gear", label: "Settings"},
] as const;
const projects = [
  {icon: "gravity-ui:frame", label: "Design Engineering"},
  {icon: "gravity-ui:chart-column", label: "Sales & Marketing"},
  {icon: "gravity-ui:map", label: "Travel"},
] as const;

const SidebarNavigation = () => (
  <Sidebar.Panel aria-label="Workspace navigation">
    <Sidebar.Header>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton className="gap-3" size="lg" tooltip="Acme Inc">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-4" icon="gravity-ui:gallery" />
            </span>
            <span className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold">Acme Inc</span>
              <span className="truncate text-xs text-muted">Enterprise</span>
            </span>
            <Icon className="ml-auto size-4" icon="gravity-ui:chevrons-up-down" />
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
      <Sidebar.Input aria-label="Search navigation" placeholder="Search..." />
    </Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {platform.map((item) => (
              <Sidebar.MenuItem key={item.label}>
                {"children" in item ? (
                  <Disclosure defaultExpanded>
                    <Sidebar.MenuButton isActive slot="trigger" tooltip={item.label}>
                      <Icon icon={item.icon} />
                      <span>{item.label}</span>
                      <Disclosure.Indicator />
                    </Sidebar.MenuButton>
                    <Disclosure.Content>
                      <Sidebar.MenuSub>
                        {item.children.map((child) => (
                          <Sidebar.MenuSubItem key={child}>
                            <Sidebar.MenuSubButton>
                              <span>{child}</span>
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSubItem>
                        ))}
                      </Sidebar.MenuSub>
                    </Disclosure.Content>
                  </Disclosure>
                ) : (
                  <Sidebar.MenuButton
                    tooltip={item.label}
                    variant={item.label === "Documentation" ? "outline" : "default"}
                  >
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </Sidebar.MenuButton>
                )}
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
      <Sidebar.Separator />
      <Sidebar.Group>
        <Sidebar.GroupLabel elementType="h2">Projects</Sidebar.GroupLabel>
        <Sidebar.GroupAction aria-label="Add project">
          <Icon icon="gravity-ui:plus" />
        </Sidebar.GroupAction>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {projects.map((item) => (
              <Sidebar.MenuItem key={item.label}>
                <Sidebar.MenuButton tooltip={item.label}>
                  <Icon icon={item.icon} />
                  <span>{item.label}</span>
                </Sidebar.MenuButton>
                <Sidebar.MenuAction showOnHover aria-label={`More actions for ${item.label}`}>
                  <Icon icon="gravity-ui:ellipsis" />
                </Sidebar.MenuAction>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton className="gap-3" size="lg" tooltip="shadcn">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-default font-semibold">
              SC
            </span>
            <span className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold">shadcn</span>
              <span className="truncate text-xs text-muted">m@example.com</span>
            </span>
            <Icon className="ml-auto size-4" icon="gravity-ui:chevrons-up-down" />
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Footer>
    <Sidebar.Rail />
  </Sidebar.Panel>
);

const meta = {
  argTypes: {
    collapseBreakpoint: {control: "number"},
    collapsible: {control: "select", options: ["offcanvas", "icon", "none"]},
    side: {control: "select", options: ["left", "right"]},
    variant: {control: "select", options: ["sidebar", "floating", "inset"]},
  },
  args: {collapsible: "icon", side: "left", variant: "sidebar"},
  component: Sidebar,
  parameters: {layout: "fullscreen"},
  title: "Components/Navigation/Sidebar",
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const CookiePersistedSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("sidebar_state="))
    ?.split("=")[1];

  return (
    <Sidebar {...props} className="h-svh min-h-[640px]" defaultOpen={cookieValue !== "false"}>
      <SidebarNavigation />
      <Sidebar.Inset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <Sidebar.Trigger />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium">Building Your Application</span>
          <Icon className="size-4 text-muted" icon="gravity-ui:chevron-right" />
          <span className="text-sm">Data Fetching</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {Array.from({length: 3}, (_, index) => (
              <div key={index} className="aspect-video rounded-xl bg-default" />
            ))}
          </div>
          <div className="min-h-[50vh] flex-1 rounded-xl bg-default" />
        </div>
      </Sidebar.Inset>
    </Sidebar>
  );
};

export const Default: Story = {
  render: (args) => <CookiePersistedSidebar {...args} />,
};

export const HeaderTrigger: Story = {
  args: {collapsible: "icon"},
  render: (args) => (
    <Sidebar {...args} className="h-svh min-h-[640px]">
      <Sidebar.Panel aria-label="Workspace navigation">
        <Sidebar.Header className="flex-row items-center">
          <span className="group-data-[state=collapsed]/sidebar:hidden">Workspace</span>
          <Sidebar.Trigger className="ml-auto" />
        </Sidebar.Header>
      </Sidebar.Panel>
      <Sidebar.Inset className="p-4" />
    </Sidebar>
  ),
};

export const TabsInPanel: Story = {
  args: {collapsible: "icon"},
  render: (args) => (
    <Sidebar {...args} className="h-svh min-h-[640px]" width="270px">
      <Sidebar.Panel aria-label="Workspace navigation">
        <Sidebar.Header>Workspace</Sidebar.Header>
        <Sidebar.Content>
          <Tabs>
            <Tabs.ListContainer>
              <Tabs.List aria-label="Workspace options">
                <Tabs.Tab id="navigation">
                  Navigation111
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="language">
                  Language22222
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel className="p-2" id="navigation">
              Navigation settings
            </Tabs.Panel>
            <Tabs.Panel className="p-2" id="language">
              Language settings
            </Tabs.Panel>
            <Tabs.Panel className="p-2" id="appearance">
              Appearance settings
            </Tabs.Panel>
          </Tabs>
        </Sidebar.Content>
      </Sidebar.Panel>
      <Sidebar.Inset className="p-4">
        <Sidebar.Trigger />
      </Sidebar.Inset>
    </Sidebar>
  ),
};

export const CollapseBreakpoint: Story = {
  args: {collapseBreakpoint: 1024},
  render: (args) => <CookiePersistedSidebar {...args} />,
};

export const FloatingCollapseBreakpoint: Story = {
  args: {collapseBreakpoint: 1024, variant: "floating"},
  render: (args) => <CookiePersistedSidebar {...args} />,
};

export const InsetCollapseBreakpoint: Story = {
  args: {collapseBreakpoint: 1024, variant: "inset"},
  render: (args) => <CookiePersistedSidebar {...args} />,
};

export const FloatingOffcanvasCollapseBreakpoint: Story = {
  args: {collapseBreakpoint: 1024, collapsible: "offcanvas", variant: "floating"},
  render: (args) => <CookiePersistedSidebar {...args} />,
};

export const InsetOffcanvasCollapseBreakpoint: Story = {
  args: {collapseBreakpoint: 1024, collapsible: "offcanvas", variant: "inset"},
  render: (args) => <CookiePersistedSidebar {...args} />,
};

export const Controlled: Story = {render: () => <ControlledSidebar />};

export const Loading: Story = {
  render: (args) => (
    <Sidebar {...args} className="h-svh min-h-[640px]">
      <Sidebar.Panel>
        <Sidebar.Content>
          <Sidebar.Group aria-busy="true" aria-label="Loading navigation">
            <Sidebar.Menu>
              {Array.from({length: 5}, (_, index) => (
                <Sidebar.MenuItem key={index}>
                  <Sidebar.MenuSkeleton showIcon />
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Panel>
      <Sidebar.Inset className="p-4">
        <Sidebar.Trigger />
      </Sidebar.Inset>
    </Sidebar>
  ),
};

const ControlledSidebar = () => {
  const [isOpen, setOpen] = React.useState(true);

  return (
    <Sidebar collapsible="icon" isOpen={isOpen} onOpenChange={setOpen}>
      <SidebarNavigation />
      <Sidebar.Inset className="p-4">
        <Sidebar.Trigger />
      </Sidebar.Inset>
    </Sidebar>
  );
};
