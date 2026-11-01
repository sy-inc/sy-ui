import type {Key} from "react";

import {render} from "@sy-inc/testing/browser";
import {useState} from "react";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {Popover} from "@/components/popover";
import {ViewStack} from "@/components/view-stack";

import "../../../../styles/dist/sy-inc.min.css";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A short list page and a taller second page, so the popover height has to change. */
const PopoverStack = () => {
  const [key, setKey] = useState<Key>("list");

  return (
    <div className="p-10">
      <Popover defaultOpen>
        <Button>Tags</Button>
        <Popover.Content placement="bottom start" variant="list">
          <Popover.Dialog aria-label="Tags">
            <ViewStack currentKey={key} data-testid="stack" onCurrentChange={setKey}>
              <ViewStack.View id="list">
                <Button onPress={() => setKey("create")}>New tag</Button>
              </ViewStack.View>
              <ViewStack.View id="create">
                <ViewStack.Header>
                  <ViewStack.Back />
                  <ViewStack.Title>New tag</ViewStack.Title>
                </ViewStack.Header>
                <div style={{height: 200}} />
              </ViewStack.View>
            </ViewStack>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
};

const stackEl = () => page.getByTestId("stack").element() as HTMLElement;
const views = () => stackEl().querySelectorAll('[data-slot="view-stack-view"]');

describe("ViewStack (browser)", () => {
  it("keeps the leaving page inert until its exit animation ends, then unmounts it", async () => {
    await render(<PopoverStack />);
    await wait(400);

    await page.getByRole("button", {name: "New tag"}).click();

    const leaving = stackEl().querySelector('[data-exiting="true"]');

    expect(views()).toHaveLength(2);
    expect(leaving).toHaveAttribute("inert");

    await wait(500);

    expect(views()).toHaveLength(1);
    await expect.element(page.getByRole("heading", {name: "New tag"})).toHaveFocus();
  });

  it("transitions the height and returns it to auto", async () => {
    await render(<PopoverStack />);
    await wait(400);
    const before = stackEl().getBoundingClientRect().height;

    await page.getByRole("button", {name: "New tag"}).click();

    // Mid-transition: an explicit px height, still close to where it started.
    expect(stackEl().style.getPropertyValue("--view-stack-height")).toMatch(/px$/);
    expect(stackEl().getBoundingClientRect().height).toBeLessThan(before + 150);

    await wait(500);

    expect(stackEl().style.getPropertyValue("--view-stack-height")).toBe("auto");
    expect(stackEl().getBoundingClientRect().height).toBeGreaterThan(before + 150);
  });

  it("keeps a bottom-placed popover anchored while it grows", async () => {
    await render(<PopoverStack />);
    await wait(400);
    const dialog = page.getByRole("dialog").element();
    const top = dialog.getBoundingClientRect().top;

    await page.getByRole("button", {name: "New tag"}).click();
    await wait(500);

    expect(Math.abs(dialog.getBoundingClientRect().top - top)).toBeLessThan(1);
  });

  it("restores focus to the leaving control on Back", async () => {
    await render(<PopoverStack />);
    await wait(400);

    await page.getByRole("button", {name: "New tag"}).click();
    await wait(500);
    await userEvent.keyboard("{Tab}");
    await expect.element(page.getByRole("button", {name: "Back"})).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await wait(500);

    await expect.element(page.getByRole("button", {name: "New tag"})).toHaveFocus();
  });
});
