import {useState} from "react";

import {Disclosure} from "@/components/disclosure";
import {Sidebar} from "@/components/sidebar";

const TestIcon = () => <svg data-icon aria-hidden="true" viewBox="0 0 16 16" />;

export interface SidebarFixtureProps {
  collapsible?: "icon" | "none" | "offcanvas";
  toggleShortcut?: string | false;
  collapseBreakpoint?: "2xl" | "lg" | "xl";
  defaultOpen?: boolean | "auto";
  isOpen?: boolean | "auto";
  onOpenChange?: (isOpen: boolean) => void;
  side?: "left" | "right";
  variant?: "floating" | "inset" | "sidebar";
}

export const SidebarFixture = ({
  collapseBreakpoint,
  collapsible = "icon",
  defaultOpen,
  isOpen,
  onOpenChange,
  side,
  toggleShortcut,
  variant,
}: SidebarFixtureProps) => (
  <Sidebar
    collapseBreakpoint={collapseBreakpoint}
    collapsible={collapsible}
    defaultOpen={defaultOpen}
    isOpen={isOpen}
    side={side}
    toggleShortcut={toggleShortcut}
    variant={variant}
    onOpenChange={onOpenChange}
  >
    <Sidebar.Panel aria-label="Workspace navigation">
      <Sidebar.Header>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton size="lg">
              <TestIcon />
              <span>Acme Inc</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group aria-label="Application">
          <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Disclosure defaultExpanded>
                  <Sidebar.MenuButton slot="trigger" tooltip="Playground">
                    <TestIcon />
                    <span>Playground</span>
                    <Disclosure.Indicator />
                  </Sidebar.MenuButton>
                  <Disclosure.Content>
                    <Sidebar.MenuSub>
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton href="#history">History</Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    </Sidebar.MenuSub>
                  </Disclosure.Content>
                </Disclosure>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton isActive href="#models">
                  <TestIcon />
                  <span>Models</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Footer>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton size="lg">
              <TestIcon />
              <span>shadcn</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Footer>
      <Sidebar.Rail />
    </Sidebar.Panel>
    <Sidebar.Inset>
      <Sidebar.Trigger />
      <h1>Dashboard</h1>
    </Sidebar.Inset>
  </Sidebar>
);

const indicatorGroups = [
  {label: "Platform", items: [{name: "Dashboard"}, {name: "Inbox", size: "sm" as const}]},
  {label: "Projects", items: [{name: "Design Engineering", size: "lg" as const}]},
];

/** Two groups, mixed sizes and an open submenu inside one sliding range; Header stays outside. */
export const SidebarIndicatorFixture = () => {
  const [active, setActive] = useState("Dashboard");
  const menuButton = (name: string, size?: "lg" | "sm") => (
    <Sidebar.MenuButton isActive={active === name} size={size} onPress={() => setActive(name)}>
      <TestIcon />
      <span>{name}</span>
    </Sidebar.MenuButton>
  );

  return (
    <Sidebar collapsible="icon">
      <Sidebar.Panel aria-label="Workspace navigation">
        <Sidebar.Header>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton size="lg">
                <TestIcon />
                <span>Acme Inc</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Header>
        <Sidebar.Content>
          {indicatorGroups.map((group) => (
            <Sidebar.Group key={group.label} aria-label={group.label}>
              <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  {group.items.map((item) => (
                    <Sidebar.MenuItem key={item.name}>
                      {menuButton(item.name, item.size)}
                    </Sidebar.MenuItem>
                  ))}
                  {group.label === "Platform" && (
                    <Sidebar.MenuItem>
                      <Disclosure defaultExpanded>
                        <Sidebar.MenuButton slot="trigger">
                          <TestIcon />
                          <span>Settings</span>
                          <Disclosure.Indicator />
                        </Sidebar.MenuButton>
                        <Disclosure.Content>
                          <Sidebar.MenuSub>
                            {["General", "Billing"].map((name) => (
                              <Sidebar.MenuSubItem key={name}>
                                <Sidebar.MenuSubButton
                                  isActive={active === name}
                                  onPress={() => setActive(name)}
                                >
                                  {name}
                                </Sidebar.MenuSubButton>
                              </Sidebar.MenuSubItem>
                            ))}
                          </Sidebar.MenuSub>
                        </Disclosure.Content>
                      </Disclosure>
                    </Sidebar.MenuItem>
                  )}
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          ))}
        </Sidebar.Content>
      </Sidebar.Panel>
      <Sidebar.Inset>
        <Sidebar.Trigger />
      </Sidebar.Inset>
    </Sidebar>
  );
};
