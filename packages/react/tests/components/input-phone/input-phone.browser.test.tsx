import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {PhoneField} from "./fixtures";

describe("InputPhone (browser)", () => {
  it("opens, searches, selects, dismisses with Escape, restores focus, and accepts input", async () => {
    await render(<PhoneField defaultCountry="US" />);

    const input = page.getByRole("textbox", {name: "Phone number"});
    const trigger = page.getByRole("button", {name: "Change country, United States"});

    await expect.element(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();

    const dialog = page.getByRole("dialog");

    await expect.element(dialog).toBeInTheDocument();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");

    const search = page.getByRole("searchbox", {name: "Search countries"});

    await userEvent.type(search, "Germany");
    await expect.element(page.getByRole("option", {name: /Germany/})).toBeInTheDocument();

    await userEvent.keyboard("{ArrowDown}");
    // React Aria delays the active descendant update so screen readers finish announcing
    // the typed characters first.
    await vi.waitFor(() => {
      expect(search.element().getAttribute("aria-activedescendant")).toBeTruthy();
    });
    const activeOptionId = search.element().getAttribute("aria-activedescendant");

    const activeOption = document.getElementById(activeOptionId ?? "");

    expect(activeOption).not.toBeNull();
    expect(activeOption).toHaveAttribute("role", "option");
    await expect
      .element(page.getByRole("option", {name: /Germany/}))
      .toHaveAttribute("id", activeOptionId as string);

    await userEvent.keyboard("{ArrowUp}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    const selectedTrigger = page.getByRole("button", {name: "Change country, Germany"});

    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(selectedTrigger).toBeInTheDocument();
    await expect.element(selectedTrigger).toHaveFocus();
    await expect.element(selectedTrigger).toHaveAttribute("aria-expanded", "false");

    await selectedTrigger.click();
    await expect.element(dialog).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(selectedTrigger).toHaveFocus();

    await input.click();
    await input.fill("03012345678");
    await expect.element(input).not.toHaveValue("");
  });

  it("keeps option ids and active descendants isolated across instances", async () => {
    await render(
      <div>
        <PhoneField defaultCountry="US" inputProps={{"aria-label": "Primary phone"}} />
        <PhoneField defaultCountry="GB" inputProps={{"aria-label": "Secondary phone"}} />
      </div>,
    );

    const firstTrigger = page.getByRole("button", {name: "Change country, United States"});
    const secondTrigger = page.getByRole("button", {name: "Change country, United Kingdom"});

    await firstTrigger.click();
    const firstSearch = page.getByRole("searchbox", {name: "Search countries"});

    await userEvent.type(firstSearch, "Germany");
    await userEvent.keyboard("{ArrowDown}");

    await vi.waitFor(() => {
      expect(firstSearch.element().getAttribute("aria-activedescendant")).toBeTruthy();
    });
    const firstActiveId = firstSearch.element().getAttribute("aria-activedescendant");
    const firstListbox = page.getByRole("listbox", {name: "Countries"}).element();
    const firstOptionIds = Array.from(
      firstListbox.querySelectorAll<HTMLElement>('[role="option"]'),
      (option) => option.id,
    );

    expect(firstActiveId).toBeTruthy();
    expect(firstOptionIds).toContain(firstActiveId as string);

    await firstTrigger.click({force: true});
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();

    await secondTrigger.click();
    const secondSearch = page.getByRole("searchbox", {name: "Search countries"});

    await userEvent.type(secondSearch, "Germany");
    await userEvent.keyboard("{ArrowDown}");

    await vi.waitFor(() => {
      expect(secondSearch.element().getAttribute("aria-activedescendant")).toBeTruthy();
    });
    const secondActiveId = secondSearch.element().getAttribute("aria-activedescendant");
    const secondListbox = page.getByRole("listbox", {name: "Countries"}).element();
    const secondOptionIds = Array.from(
      secondListbox.querySelectorAll<HTMLElement>('[role="option"]'),
      (option) => option.id,
    );

    expect(secondActiveId).toBeTruthy();
    expect(secondOptionIds).toContain(secondActiveId as string);
    expect(firstActiveId).not.toBe(secondActiveId);
    expect(firstOptionIds.some((id) => secondOptionIds.includes(id))).toBe(false);
  });
});
