import type {TabsProps} from "@/components/tabs";

import {User, act, render, screen, waitFor} from "@sy-ui/testing/helpers";

import {Tabs} from "@/components/tabs";

const renderTabs = async (props: Omit<Partial<TabsProps>, "children"> = {}) => {
  const result = render(
    <Tabs data-testid="tabs" {...props}>
      <Tabs.ListContainer>
        <Tabs.List aria-label="Options">
          <Tabs.Tab id="overview">
            Overview
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="analytics">
            Analytics
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab isDisabled id="reports">
            Reports
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="overview">Overview panel</Tabs.Panel>
      <Tabs.Panel id="analytics">Analytics panel</Tabs.Panel>
      <Tabs.Panel id="reports">Reports panel</Tabs.Panel>
    </Tabs>,
  );

  // SharedElementTransition may schedule work after mount.
  await act(async () => {
    await Promise.resolve();
  });
  await waitFor(() => {
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
  });

  return result;
};

describe("Tabs", () => {
  let testUtilUser: User;

  beforeAll(() => {
    testUtilUser = new User({interactionType: "mouse"});
  });

  it("exposes data-slots and BEM block", async () => {
    await renderTabs();

    const root = screen.getByTestId("tabs");

    expect(root).toHaveAttribute("data-slot", "tabs");
    expect(root.className).toEqual(expect.stringContaining("tabs"));
    expect(document.querySelector('[data-slot="tabs-list"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-slot="tabs-tab"]')).toHaveLength(3);
    expect(document.querySelector('[data-slot="tabs-panel"]')).not.toBeNull();
  });

  it("exposes variant BEM modifier", async () => {
    await renderTabs({variant: "secondary"});

    expect(screen.getByTestId("tabs").className).toEqual(
      expect.stringContaining("tabs--secondary"),
    );
  });

  it("supports selecting tabs via createTester", async () => {
    const onSelectionChange = vi.fn();

    await renderTabs({onSelectionChange});

    const tester = testUtilUser.createTester("Tabs", {
      root: screen.getByTestId("tabs"),
    });

    expect(tester.getTabs()).toHaveLength(3);
    expect(tester.getSelectedTab()).toHaveTextContent("Overview");
    expect(tester.getActiveTabpanel()).toHaveTextContent("Overview panel");

    await tester.triggerTab({tab: "Analytics"});

    expect(onSelectionChange).toHaveBeenCalledWith("analytics");
    expect(tester.getSelectedTab()).toHaveTextContent("Analytics");
    expect(tester.getActiveTabpanel()).toHaveTextContent("Analytics panel");
  });

  it("supports keyboard selection via createTester", async () => {
    await renderTabs();

    const tester = testUtilUser.createTester("Tabs", {
      root: screen.getByTestId("tabs"),
      interactionType: "keyboard",
    });

    await tester.triggerTab({tab: "Analytics"});

    expect(tester.getSelectedTab()).toHaveTextContent("Analytics");
  });

  it("scrolls a focused tab into view", async () => {
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    try {
      await renderTabs();
      screen.getByRole("tab", {name: "Analytics"}).focus();

      await waitFor(() => {
        expect(scrollIntoView).toHaveBeenCalledWith({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      });
    } finally {
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    }
  });

  it("supports disabled tabs without selecting", async () => {
    const onSelectionChange = vi.fn();

    await renderTabs({onSelectionChange});

    const tester = testUtilUser.createTester("Tabs", {
      root: screen.getByTestId("tabs"),
    });

    await tester.triggerTab({tab: "Reports"});

    expect(tester.getSelectedTab()).toHaveTextContent("Overview");
    expect(onSelectionChange).not.toHaveBeenCalledWith("reports");
  });
});
