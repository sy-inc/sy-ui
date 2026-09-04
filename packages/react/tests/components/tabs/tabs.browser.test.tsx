import {render} from "@sy-inc/testing/browser";
import {StrictMode} from "react";
import {hydrateRoot} from "react-dom/client";
import {renderToString} from "react-dom/server";
import {page, userEvent} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {BottomBar} from "@/components/bottom-bar";
import {Tabs} from "@/components/tabs";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** StrictMode + hydration: the double-invoked layout effect that leaks the overrides. */
const hydrateStrict = async (ui: React.ReactElement) => {
  document.body.innerHTML = "";
  const container = document.createElement("div");
  const tree = <StrictMode>{ui}</StrictMode>;

  container.innerHTML = renderToString(tree);
  document.body.appendChild(container);
  hydrateRoot(container, tree);
  await wait(2000);
};

const indicatorOf = (tabName: string) => {
  const tab = page.getByRole("tab", {name: tabName}).element();

  return {indicator: tab.querySelector<HTMLElement>('[data-slot="tabs-indicator"]')!, tab};
};

const settledOn = (tabName: string) => {
  const {indicator, tab} = indicatorOf(tabName);
  const a = indicator.getBoundingClientRect();
  const b = tab.getBoundingClientRect();

  return {
    offset: [Math.round(a.left - b.left), Math.round(a.top - b.top), Math.round(a.width - b.width)],
    translate: indicator.style.translate,
  };
};

const FlatTabs = ({selectedKey}: {selectedKey: string}) => (
  <Tabs.Root selectedKey={selectedKey}>
    <Tabs.List aria-label="Sections">
      {["t1", "t2", "t3", "t4", "t5"].map((key) => (
        <Tabs.Tab id={key} key={key}>
          <Tabs.Indicator />
          {key.toUpperCase()}
        </Tabs.Tab>
      ))}
    </Tabs.List>
    <Tabs.Panel id={selectedKey}>Panel</Tabs.Panel>
  </Tabs.Root>
);

describe("Tabs (browser)", () => {
  describe("indicator", () => {
    it("settles on the selected tab when nested inside another tab panel", async () => {
      await hydrateStrict(
        <Tabs.Root defaultSelectedKey="o1">
          <Tabs.List aria-label="Outer">
            <Tabs.Tab id="o1">Outer One</Tabs.Tab>
            <Tabs.Tab id="o2">Outer Two</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="o1">
            <FlatTabs selectedKey="t5" />
          </Tabs.Panel>
        </Tabs.Root>,
      );

      expect(settledOn("T5")).toEqual({offset: [0, 0, 0], translate: ""});
    });

    it("settles on a controlled selection that is not the first tab", async () => {
      await hydrateStrict(<FlatTabs selectedKey="t5" />);

      expect(settledOn("T5")).toEqual({offset: [0, 0, 0], translate: ""});
    });

    it("settles on a controlled BottomBar selection that is not the first item", async () => {
      await hydrateStrict(
        <BottomBar selectedKey="b4">
          {["b1", "b2", "b3", "b4"].map((key) => (
            <BottomBar.Item id={key} key={key}>
              <BottomBar.Label>{key.toUpperCase()}</BottomBar.Label>
            </BottomBar.Item>
          ))}
        </BottomBar>,
      );

      expect(settledOn("B4")).toEqual({offset: [0, 0, 0], translate: ""});
    });

    it("slides between tabs and settles on the new selection", async () => {
      await render(
        <Tabs.Root defaultSelectedKey="t1">
          <Tabs.List aria-label="Sections">
            {["t1", "t2", "t3"].map((key) => (
              <Tabs.Tab id={key} key={key}>
                <Tabs.Indicator />
                {key.toUpperCase()}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel id="t1">One</Tabs.Panel>
          <Tabs.Panel id="t2">Two</Tabs.Panel>
          <Tabs.Panel id="t3">Three</Tabs.Panel>
        </Tabs.Root>,
      );

      await userEvent.click(page.getByRole("tab", {name: "T3"}));

      // Mid-flight the indicator is still travelling: a transition is running.
      expect(indicatorOf("T3").indicator.getAnimations().length).toBeGreaterThan(0);

      await expect.poll(() => settledOn("T3")).toEqual({offset: [0, 0, 0], translate: ""});
    });
  });
});
