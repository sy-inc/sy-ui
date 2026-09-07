import {render} from "@sy-inc/testing/browser";
import {StrictMode} from "react";
import {I18nProvider} from "react-aria-components/I18nProvider";
import {hydrateRoot} from "react-dom/client";
import {renderToString} from "react-dom/server";
import {page, userEvent} from "vitest/browser";

import {BottomBar} from "@/components/bottom-bar";
import {Tabs} from "@/components/tabs";

import "../../../../styles/dist/sy-inc.min.css";

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
        <Tabs.Tab key={key} id={key}>
          <Tabs.Indicator />
          {key.toUpperCase()}
        </Tabs.Tab>
      ))}
    </Tabs.List>
    <Tabs.Panel id={selectedKey}>Panel</Tabs.Panel>
  </Tabs.Root>
);

describe("Tabs (browser)", () => {
  describe("scrolling", () => {
    it.each([
      {dir: "ltr", nextKey: "{ArrowRight}", orientation: "horizontal"},
      {dir: "rtl", nextKey: "{ArrowLeft}", orientation: "horizontal"},
      {dir: "ltr", nextKey: "{ArrowDown}", orientation: "vertical"},
    ] as const)(
      "supports centering and arrow scrolling in $orientation $dir tabs",
      async ({dir, nextKey, orientation}) => {
        const onFocus = vi.fn();
        const onPress = vi.fn();
        const vertical = orientation === "vertical";

        await render(
          <I18nProvider locale={dir === "rtl" ? "ar" : "en-US"}>
            <div dir={dir}>
              <Tabs orientation={orientation}>
                <Tabs.ListContainer style={{height: vertical ? 144 : undefined, width: 360}}>
                  <Tabs.List aria-label="Scrollable sections">
                    {Array.from({length: 8}, (_, i) => (
                      <Tabs.Tab
                        key={i}
                        id={`t${i + 1}`}
                        isDisabled={i === 4}
                        style={{height: 40, width: 100}}
                        onFocus={onFocus}
                        onPress={onPress}
                      >
                        Section {i + 1}
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs.ListContainer>
              </Tabs>
            </div>
          </I18nProvider>,
        );

        const tab = (n: number) => page.getByRole("tab", {exact: true, name: `Section ${n}`});
        const scroller = tab(3).element().closest('[data-slot="scroll-shadow"]') as HTMLElement;
        const position = () => (vertical ? scroller.scrollTop : scroller.scrollLeft);
        const centerOffset = (n: number) => {
          const item = tab(n).element().getBoundingClientRect();
          const viewport = scroller.getBoundingClientRect();

          return vertical
            ? item.top + item.height / 2 - (viewport.top + viewport.height / 2)
            : item.left + item.width / 2 - (viewport.left + viewport.width / 2);
        };
        const expectCentered = async (n: number) => {
          await expect.poll(() => Math.abs(centerOffset(n))).toBeLessThan(1);
          await expect.element(tab(n)).toHaveFocus();
          await expect.element(tab(n)).toHaveAttribute("aria-selected", "true");
        };

        // This tab is already fully visible: revealing clipped tabs alone is insufficient.
        const initialTab = tab(3).element().getBoundingClientRect();
        const initialViewport = scroller.getBoundingClientRect();

        expect(initialTab[vertical ? "top" : "left"]).toBeGreaterThanOrEqual(
          initialViewport[vertical ? "top" : "left"],
        );
        expect(initialTab[vertical ? "bottom" : "right"]).toBeLessThanOrEqual(
          initialViewport[vertical ? "bottom" : "right"],
        );
        await userEvent.click(tab(3));
        await expectCentered(3);
        expect(onFocus).toHaveBeenCalledTimes(1);
        expect(onPress).toHaveBeenCalledTimes(1);

        // Manual scrolling retains focus; clicking the same tab must recenter it.
        scroller.scrollBy({behavior: "instant", [vertical ? "top" : "left"]: 30});
        expect(Math.abs(centerOffset(3))).toBeGreaterThan(20);
        await userEvent.click(tab(3));
        await expectCentered(3);
        expect(onFocus).toHaveBeenCalledTimes(1);
        expect(onPress).toHaveBeenCalledTimes(2);

        await userEvent.keyboard(nextKey);
        await expectCentered(4);
        await userEvent.keyboard(nextKey);
        await expectCentered(6); // Disabled tabs remain skipped.

        await userEvent.keyboard("{End}");
        const maxScroll = vertical
          ? scroller.scrollHeight - scroller.clientHeight
          : scroller.scrollWidth - scroller.clientWidth;

        await expect.poll(position).toBeCloseTo(dir === "rtl" ? -maxScroll : maxScroll, 0);
        await expect.element(tab(8)).toHaveAttribute("aria-selected", "true");
        await userEvent.keyboard("{Home}");
        await expect.poll(position).toBeCloseTo(0, 0);
        await expect.element(tab(1)).toHaveAttribute("aria-selected", "true");

        const next = page.getByRole("button", {
          includeHidden: true,
          name: vertical ? "Scroll tabs down" : "Scroll tabs right",
        });
        const prev = page.getByRole("button", {
          includeHidden: true,
          name: vertical ? "Scroll tabs up" : "Scroll tabs left",
        });
        const sign = dir === "rtl" ? -1 : 1;
        const size = vertical ? scroller.clientHeight : scroller.clientWidth;

        await userEvent.click(next);
        await expect.poll(position).toBeCloseTo(sign * size * 0.8, 0);

        // An arrow press near either edge must clamp to that edge without changing selection.
        scroller.scrollTo({
          behavior: "instant",
          [vertical ? "top" : "left"]: sign * (maxScroll - 12),
        });
        await userEvent.click(next);
        await expect.poll(position).toBeCloseTo(sign * maxScroll, 0);
        await expect.element(next).not.toBeVisible();

        scroller.scrollTo({behavior: "instant", [vertical ? "top" : "left"]: sign * 12});
        await userEvent.click(prev);
        await expect.poll(position).toBeCloseTo(0, 0);
        await expect.element(prev).not.toBeVisible();
        await expect.element(tab(1)).toHaveAttribute("aria-selected", "true");
      },
    );
  });

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
            <BottomBar.Item key={key} id={key}>
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
              <Tabs.Tab key={key} id={key}>
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
