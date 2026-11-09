import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Dropdown} from "@/components/dropdown";
import {Label} from "@/components/label";

import "../../../../styles/dist/sy-inc.min.css";

import {DropdownFixture} from "./fixtures";

const renderDropdown = () => render(<DropdownFixture />);

/**
 * Applies the stylesheet's touch-only dropdown rules unconditionally. Media emulation over
 * CDP is page-wide and would leak into browser test files running in parallel.
 */
const applyTouchPointerRules = () => {
  // Rules can sit inside @layer blocks, so walk every grouping rule.
  const walk = (list: CSSRuleList): CSSRule[] =>
    [...list].flatMap((rule) =>
      rule instanceof CSSGroupingRule && !(rule instanceof CSSMediaRule)
        ? walk(rule.cssRules)
        : [rule],
    );
  const rules = [...document.styleSheets]
    .flatMap((sheet) => walk(sheet.cssRules))
    .filter(
      (rule): rule is CSSMediaRule =>
        rule instanceof CSSMediaRule &&
        rule.conditionText.replaceAll(" ", "") === "(hover:none)and(pointer:coarse)" &&
        rule.cssText.includes(".dropdown__popover"),
    )
    .flatMap((rule) => [...rule.cssRules].map((inner) => inner.cssText));
  const style = document.createElement("style");

  expect(rules.length).toBeGreaterThan(0);
  style.textContent = rules.join("\n");
  document.head.append(style);
  onTestFinished(() => style.remove());
};

describe("Dropdown (browser)", () => {
  it("keeps row icons visible on a narrow screen while capping the menu to the viewport", async () => {
    await page.viewport(390, 844);
    onTestFinished(() => page.viewport(1280, 720));
    await render(
      <Dropdown>
        <Dropdown.Trigger>Settings</Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Item id="theme" textValue="Theme">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
                <circle cx="8" cy="8" r="6" />
              </svg>
              <Label style={{minWidth: 256}}>Theme</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>,
    );
    await page.getByRole("button", {name: "Settings"}).click();
    await expect.element(page.getByRole("menuitem", {name: "Theme"})).toBeVisible();
    const popover = document.querySelector<HTMLElement>('[data-slot="dropdown-popover"]')!;

    await expect.poll(() => popover.getAnimations().length).toBe(0);
    expect(popover.offsetWidth).toBeGreaterThanOrEqual(256);
    expect(popover.offsetWidth).toBeLessThanOrEqual(358);
    expect(popover.querySelector("svg")!.getBoundingClientRect().width).toBeCloseTo(16, 0);
    await userEvent.keyboard("{Escape}");
  });

  it("keeps submenu start padding contextual and separates its selection and chevron indicators", async () => {
    await render(
      <Dropdown>
        <Dropdown.Trigger>Actions</Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Item id="plain">
              <Label>Plain</Label>
            </Dropdown.Item>
            <Dropdown.SubmenuTrigger>
              <Dropdown.Item id="submenu" textValue="Submenu">
                <Label>Submenu</Label>
                <Dropdown.SubmenuIndicator />
              </Dropdown.Item>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Item id="child">Child</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.SubmenuTrigger>
            <Dropdown.SubmenuTrigger>
              <Dropdown.Item id="both" textValue="Selected submenu">
                <Dropdown.ItemIndicator />
                <Label>Selected submenu</Label>
                <Dropdown.SubmenuIndicator />
              </Dropdown.Item>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Item id="other">Other</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.SubmenuTrigger>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>,
    );
    await page.getByRole("button", {name: "Actions"}).click();
    const plain = page.getByRole("menuitem", {name: "Plain"});
    const submenu = page.getByRole("menuitem", {exact: true, name: "Submenu"});
    const both = page.getByRole("menuitem", {name: "Selected submenu"});

    await expect.element(submenu).toBeVisible();
    expect(getComputedStyle(submenu.element()).paddingInlineStart).toBe(
      getComputedStyle(plain.element()).paddingInlineStart,
    );
    const selection = both.element().querySelector('[data-slot="menu-item-indicator"]')!;
    const chevron = both.element().querySelector('[data-slot="submenu-indicator"]')!;

    expect(selection.getBoundingClientRect().right).toBeLessThan(
      chevron.getBoundingClientRect().left,
    );
    expect(parseFloat(getComputedStyle(both.element()).paddingInlineStart)).toBeGreaterThan(
      parseFloat(getComputedStyle(plain.element()).paddingInlineStart),
    );
    await userEvent.keyboard("{Escape}");
  });

  it("opens the menu, shows items, and restores focus to the trigger after Escape", async () => {
    await renderDropdown();

    const trigger = page.getByRole("button", {name: "Menu"});

    await trigger.click();

    const menu = page.getByRole("menu");

    await expect.element(menu).toBeInTheDocument();
    await expect.element(page.getByRole("menuitem", {name: "New file"})).toBeInTheDocument();
    await expect.element(page.getByRole("menuitem", {name: "Copy link"})).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await expect.element(menu).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it("reveals placed touch menus without an enter animation and keeps exit motion", async () => {
    applyTouchPointerRules();

    // React Aria hides a popover with these inline styles until it is ready.
    await render(
      <div
        className="dropdown__popover"
        data-entering="true"
        data-placement="bottom"
        data-testid="touch-menu"
        style={{
          clipPath: "inset(100%)",
          maskImage: "linear-gradient(transparent,transparent)",
          opacity: 0,
        }}
      >
        Menu
      </div>,
    );
    const element = document.querySelector<HTMLElement>("[data-testid='touch-menu']")!;
    const style = getComputedStyle(element);

    expect([style.opacity, style.clipPath, style.maskImage, style.animationName]).toEqual([
      "1",
      "none",
      "none",
      "none",
    ]);

    element.removeAttribute("data-entering");
    element.setAttribute("data-exiting", "true");
    expect(getComputedStyle(element).animationName).toBe("sy-overlay-exit");
  });
});
