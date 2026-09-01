import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {ActionBarFixture} from "./fixtures";

describe("ActionBar (browser)", () => {
  it("fits its fixed toolbar and focused controls inside a 390px viewport", async () => {
    await page.viewport(390, 720);
    await render(<ActionBarFixture />);

    const toolbar = page.getByRole("toolbar", {name: "Actions"}).element();
    const clear = page.getByRole("button", {name: "Clear selection"}).element();
    const toolbarRect = toolbar.getBoundingClientRect();

    expect(toolbarRect.left).toBeGreaterThanOrEqual(0);
    expect(toolbarRect.right).toBeLessThanOrEqual(window.innerWidth);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);

    clear.focus();
    const focusedRect = clear.getBoundingClientRect();

    expect(focusedRect.left).toBeGreaterThanOrEqual(0);
    expect(focusedRect.right).toBeLessThanOrEqual(window.innerWidth);
    expect(focusedRect.bottom).toBeLessThanOrEqual(window.innerHeight);
  });

  it("makes closed actions inert and inaccessible", async () => {
    await render(<ActionBarFixture isOpen={false} />);

    const root = document.querySelector<HTMLElement>('[data-slot="action-bar"]')!;

    expect(root.inert).toBe(true);
    await expect.element(page.getByRole("toolbar", {name: "Actions"})).not.toBeInTheDocument();
  });
});
