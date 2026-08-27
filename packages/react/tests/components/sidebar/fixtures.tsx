import {Disclosure} from "@/components/disclosure";
import {Sidebar} from "@/components/sidebar";

const TestIcon = () => <svg aria-hidden="true" data-icon viewBox="0 0 16 16" />;

export interface SidebarFixtureProps {
  collapsible?: "icon" | "none" | "offcanvas";
  collapseBreakpoint?: number;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  side?: "left" | "right";
  variant?: "floating" | "inset" | "sidebar";
}

export const SidebarFixture = ({
  collapsible = "icon",
  collapseBreakpoint,
  defaultOpen,
  isOpen,
  onOpenChange,
  side,
  variant,
}: SidebarFixtureProps) => (
  <Sidebar
    collapsible={collapsible}
    collapseBreakpoint={collapseBreakpoint}
    defaultOpen={defaultOpen}
    isOpen={isOpen}
    side={side}
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
