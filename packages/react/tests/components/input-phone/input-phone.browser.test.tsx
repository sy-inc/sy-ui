import {render} from "@sy-inc/testing/browser";
import {createRef} from "react";
import {ListLayout, Virtualizer} from "react-aria-components/Virtualizer";
import {page, userEvent} from "vitest/browser";

import {InputPhone} from "@/components/input-phone";

import "../../../../styles/dist/sy-inc.min.css";

import {PhoneField} from "./fixtures";

describe("InputPhone (browser)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([false, true])(
    "updates scroll shadows as countries scroll and filter (virtualized: %s)",
    async (virtualized) => {
      // React Stately checks this flag at runtime; browser tests must keep real virtualization on.
      if (virtualized) vi.stubGlobal("process", {env: {NODE_ENV: "test", VIRT_ON: "1"}});

      const ref = createRef<HTMLDivElement>();
      const countries = <InputPhone.CountryList ref={ref} />;

      await render(
        <InputPhone defaultCountry="MY">
          <InputPhone.CountrySelect>
            <InputPhone.CountrySearch />
            {virtualized ? (
              <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 36}}>
                {countries}
              </Virtualizer>
            ) : (
              countries
            )}
          </InputPhone.CountrySelect>
          <InputPhone.Input aria-label="Phone number" />
        </InputPhone>,
      );

      await page.getByRole("button", {name: "Change country, Malaysia"}).click();
      const list = page.getByRole("listbox", {name: "Countries"});

      await expect.element(list).toBeInTheDocument();
      const element = list.element();

      expect(ref.current).toBe(element);
      await vi.waitFor(() => expect(element.scrollHeight).toBeGreaterThan(element.clientHeight));
      element.scrollTop = 0;
      await expect.element(list).toHaveAttribute("data-bottom-scroll", "true");
      await expect.element(list).toHaveAttribute("data-top-scroll", "false");
      expect(getComputedStyle(element).maskImage).not.toBe("none");

      element.scrollTop = (element.scrollHeight - element.clientHeight) / 2;
      await expect.element(list).toHaveAttribute("data-top-bottom-scroll", "true");
      element.scrollTop = element.scrollHeight;
      await expect.element(list).toHaveAttribute("data-top-scroll", "true");
      await expect.element(list).toHaveAttribute("data-bottom-scroll", "false");

      const search = page.getByRole("searchbox", {name: "Search countries"});

      await search.fill("Germany");
      await expect.element(list).toHaveAttribute("data-top-scroll", "false");
      await expect.element(list).toHaveAttribute("data-bottom-scroll", "false");
      expect(getComputedStyle(element).maskImage).toBe("none");
      await search.fill("");
      await expect.element(list).toHaveAttribute("data-bottom-scroll", "true");
    },
  );

  it("skips the static country prefix during keyboard navigation", async () => {
    await render(
      <div>
        <button type="button">Before phone</button>
        <PhoneField countries={["MY"]} />
        <button type="button">After phone</button>
      </div>,
    );

    await page.getByRole("button", {name: "Before phone"}).click();
    await userEvent.tab();
    await expect.element(page.getByRole("textbox", {name: "Phone number"})).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", {name: "After phone"})).toHaveFocus();
    await page.getByRole("img", {name: "Malaysia, +60"}).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("adds list spacing only when the country search is present", async () => {
    await render(
      <div>
        <InputPhone countries={["MY", "SG"]} defaultCountry="MY">
          <InputPhone.CountrySelect aria-label="Without search">
            <InputPhone.CountryList />
          </InputPhone.CountrySelect>
          <InputPhone.Input aria-label="Phone without search" />
        </InputPhone>
        <InputPhone countries={["MY", "SG"]} defaultCountry="MY">
          <InputPhone.CountrySelect aria-label="With search" />
          <InputPhone.Input aria-label="Phone with search" />
        </InputPhone>
      </div>,
    );

    await page.getByRole("button", {name: "Without search"}).click();
    const list = page.getByRole("listbox", {name: "Countries"});

    await expect.element(list).toBeInTheDocument();
    expect(getComputedStyle(list.element()).marginTop).toBe("0px");
    await userEvent.keyboard("{Escape}");
    await expect.element(list).not.toBeInTheDocument();

    await page.getByRole("button", {name: "With search"}).click();
    await expect.element(list).toBeInTheDocument();
    expect(parseFloat(getComputedStyle(list.element()).marginTop)).toBeGreaterThan(0);
  });

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
