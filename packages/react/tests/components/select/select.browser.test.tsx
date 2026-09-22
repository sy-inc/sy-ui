import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {SelectFixture} from "./fixtures";

const renderSelect = () => render(<SelectFixture />);

/** The focus ring transitions in, so settle it to read a steady-state box-shadow. */
const disableTransitions = () => {
  const style = document.createElement("style");

  style.textContent = "*, *::before, *::after { transition: none !important; }";
  document.head.append(style);

  return () => style.remove();
};

const ringOf = (name: string) =>
  getComputedStyle(page.getByRole("option", {name}).element()).boxShadow;

const triggerRing = () =>
  getComputedStyle(page.getByRole("button", {name: "State"}).element()).boxShadow;

describe("Select (browser)", () => {
  it("opens the listbox, shows options, and restores focus to the trigger after Escape", async () => {
    await renderSelect();

    const trigger = page.getByRole("button", {name: "State"});

    await trigger.click();

    const listbox = page.getByRole("listbox");

    await expect.element(listbox).toBeInTheDocument();
    await expect.element(page.getByRole("option", {name: "Florida"})).toBeInTheDocument();
    await expect.element(page.getByRole("option", {name: "California"})).toBeInTheDocument();
    await expect.element(page.getByRole("option", {name: "Texas"})).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await expect.element(listbox).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  describe("focus ring", () => {
    beforeEach(disableTransitions);

    it("supports opening with the mouse without ringing the focused option", async () => {
      await render(<SelectFixture defaultValue="california" />);

      await page.getByRole("button", {name: "State"}).click();
      await expect.element(page.getByRole("listbox")).toBeInTheDocument();

      const selected = page.getByRole("option", {name: "California"});

      await expect.element(selected).toHaveFocus();
      await expect.element(selected).not.toHaveAttribute("data-focus-visible");
      expect(ringOf("California")).toBe("none");
    });

    it("supports opening with the keyboard and rings the focused option", async () => {
      await render(<SelectFixture defaultValue="california" />);

      const trigger = page.getByRole("button", {name: "State"});

      await trigger.click();
      await expect.element(page.getByRole("listbox")).toBeInTheDocument();

      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();

      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("listbox")).toBeInTheDocument();

      const selected = page.getByRole("option", {name: "California"});

      await expect.element(selected).toHaveAttribute("data-focus-visible", "true");
      expect(ringOf("California")).not.toBe("none");
    });

    it("supports arrow navigation moving the ring to the newly focused option", async () => {
      await renderSelect();

      await page.getByRole("button", {name: "State"}).click();
      await expect.element(page.getByRole("listbox")).toBeInTheDocument();

      await userEvent.keyboard("{ArrowDown}");

      await expect
        .element(page.getByRole("option", {name: "Florida"}))
        .toHaveAttribute("data-focus-visible", "true");

      await userEvent.keyboard("{ArrowDown}");

      await expect
        .element(page.getByRole("option", {name: "California"}))
        .toHaveAttribute("data-focus-visible", "true");
      expect(ringOf("California")).not.toBe("none");
      expect(ringOf("Florida")).toBe("none");
    });
  });

  describe("trigger focus ring", () => {
    beforeEach(disableTransitions);

    it("supports selecting with the mouse without ringing the trigger", async () => {
      await render(<SelectFixture defaultValue="california" />);

      const trigger = page.getByRole("button", {name: "State"});
      const unringed = triggerRing();

      await trigger.click();
      await expect.element(page.getByRole("listbox")).toBeInTheDocument();

      await page.getByRole("option", {name: "Texas"}).click();
      await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();

      await expect.element(trigger).toHaveFocus();
      await expect.element(trigger).not.toHaveAttribute("data-focus-visible");
      expect(triggerRing()).toBe(unringed);
    });

    it("supports selecting with the keyboard and rings the trigger", async () => {
      await render(<SelectFixture defaultValue="california" />);

      const trigger = page.getByRole("button", {name: "State"});
      const unringed = triggerRing();

      await trigger.click();
      await expect.element(page.getByRole("listbox")).toBeInTheDocument();

      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();

      await expect.element(trigger).toHaveAttribute("data-focus-visible", "true");
      expect(triggerRing()).not.toBe(unringed);
    });
  });
});
