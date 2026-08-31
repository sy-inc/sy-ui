import type {Meta} from "@storybook/react";

import React from "react";

import {Button} from "../button";
import {Label} from "../label";
import {ListBox} from "../list-box";
import {SearchField} from "../search-field";

import {Sheet} from "./index";

export default {
  component: Sheet,
  parameters: {layout: "centered"},
  title: "Components/Sheet",
} as Meta<typeof Sheet>;

const BACKDROP_VARIANTS = ["opaque", "blur", "transparent"] as const;
const DETACHED_PLACEMENTS = ["bottom", "top", "left", "right"] as const;
const PROFESSIONS = [
  {id: "engineering", name: "Engineering"},
  {id: "design", name: "Design"},
  {id: "marketing", name: "Marketing"},
  {id: "product", name: "Product Management"},
  {id: "sales", name: "Sales"},
  {id: "finance", name: "Finance"},
  {id: "operations", name: "Operations"},
] as const;
const SCROLLABLE_PARAGRAPHS = [
  "Sheets keep focused tasks close at hand without taking users away from the current page.",
  "This example keeps the header and actions in place while the body handles a longer reading flow.",
  "Use the sheet body for supporting context, grouped settings, or a compact sequence of decisions.",
  "The content remains available to keyboard users and can be dismissed with the close button or Escape.",
  "A long body should preserve comfortable spacing so each section remains easy to scan on smaller screens.",
  "When content grows beyond the available viewport, the body scrolls independently of the footer.",
  "Keeping the primary action visible helps users finish the task without scrolling back down.",
  "The same layout works for confirmations, filters, preferences, and other short-lived workflows.",
  "Use concise headings and paragraphs when adapting this pattern to production content.",
  "This final section makes the overflow behavior easy to inspect in the Storybook preview.",
] as const;

const Content = ({handle = "top"}: {handle?: "bottom" | "none" | "top"}) => (
  <>
    {handle === "top" && <Sheet.Handle />}
    <Sheet.CloseTrigger />
    <Sheet.Header>
      <Sheet.Heading>Sheet title</Sheet.Heading>
    </Sheet.Header>
    <Sheet.Body>
      <p>Drag the sheet or use its handle to change snap points.</p>
    </Sheet.Body>
    <Sheet.Footer>
      <Button slot="close" variant="secondary">
        Close
      </Button>
    </Sheet.Footer>
    {handle === "bottom" && <Sheet.Handle />}
  </>
);

export const BackdropVariants = () => (
  <div className="flex flex-wrap gap-3">
    {BACKDROP_VARIANTS.map((variant) => (
      <Sheet key={variant}>
        <Sheet.Trigger>
          <Button variant="secondary">Open {variant} backdrop</Button>
        </Sheet.Trigger>
        <Sheet.Backdrop variant={variant}>
          <Sheet.Content className="mx-auto max-w-[420px]">
            <Sheet.Dialog>
              <Content />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    ))}
  </div>
);

export const ScrollableContent = () => (
  <Sheet>
    <Sheet.Trigger>
      <Button variant="secondary">Open scrollable sheet</Button>
    </Sheet.Trigger>
    <Sheet.Backdrop variant="blur">
      <Sheet.Content className="mx-auto max-w-[480px]">
        <Sheet.Dialog>
          <Sheet.Handle />
          <Sheet.CloseTrigger aria-label="Close scrollable sheet" />
          <Sheet.Header>
            <Sheet.Heading>Scrollable content</Sheet.Heading>
          </Sheet.Header>
          <Sheet.Body>
            <div className="min-h-[720px] space-y-4 pb-2">
              {SCROLLABLE_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Sheet.Body>
          <Sheet.Footer>
            <Button slot="close" variant="secondary">
              Close
            </Button>
            <Button slot="close">Accept</Button>
          </Sheet.Footer>
        </Sheet.Dialog>
      </Sheet.Content>
    </Sheet.Backdrop>
  </Sheet>
);

export const Default = () => (
  <Sheet>
    <Sheet.Trigger>
      <Button variant="secondary">Open sheet</Button>
    </Sheet.Trigger>
    <Sheet.Backdrop>
      <Sheet.Content className="mx-auto max-w-[420px]">
        <Sheet.Dialog>
          <Content />
        </Sheet.Dialog>
      </Sheet.Content>
    </Sheet.Backdrop>
  </Sheet>
);
export const Placements = () => (
  <div className="flex flex-wrap gap-3">
    {(["bottom", "top", "left", "right"] as const).map((placement) => (
      <Sheet key={placement} placement={placement}>
        <Sheet.Trigger>
          <Button variant="secondary">
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </Button>
        </Sheet.Trigger>
        <Sheet.Backdrop variant="blur">
          <Sheet.Content
            className={placement === "left" || placement === "right" ? "w-[400px]" : undefined}
          >
            <Sheet.Dialog>
              <Content
                handle={placement === "bottom" ? "top" : placement === "top" ? "bottom" : "none"}
              />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    ))}
  </div>
);
export const Detached = () => (
  <div className="flex flex-wrap gap-3">
    {DETACHED_PLACEMENTS.map((placement) => (
      <Sheet key={placement} isDetached shouldScaleBackground placement={placement}>
        <Sheet.Trigger>
          <Button variant="secondary">Open detached {placement} sheet</Button>
        </Sheet.Trigger>
        <Sheet.Backdrop variant="blur">
          <Sheet.Content
            className={placement === "left" || placement === "right" ? "m-2 w-[400px]" : "m-2"}
          >
            <Sheet.Dialog>
              <Content
                handle={placement === "bottom" ? "top" : placement === "top" ? "bottom" : "none"}
              />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    ))}
  </div>
);

export const SnapPoints = () => (
  <Sheet defaultActiveSnapPoint="50%" snapPoints={["25%", "50%", "90%"]}>
    <Sheet.Trigger>
      <Button variant="secondary">Open snap-point sheet</Button>
    </Sheet.Trigger>
    <Sheet.Backdrop>
      <Sheet.Content>
        <Sheet.Dialog>
          <Content />
        </Sheet.Dialog>
      </Sheet.Content>
    </Sheet.Backdrop>
  </Sheet>
);

export const ProfessionsPicker = () => {
  const [query, setQuery] = React.useState("");
  const [selectedProfession, setSelectedProfession] = React.useState<string | null>(null);
  const filteredProfessions = PROFESSIONS.filter(({name}) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selectedProfessionName =
    PROFESSIONS.find(({id}) => id === selectedProfession)?.name ?? "None";

  return (
    <Sheet>
      <Sheet.Trigger>
        <Button variant="secondary">Choose profession</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop variant="blur">
        <Sheet.Content className="mx-auto max-w-[440px]">
          <Sheet.Dialog>
            <Sheet.CloseTrigger aria-label="Close professions picker" />
            <Sheet.Header>
              <Sheet.Heading>Choose a profession</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body className="flex flex-col gap-4">
              <SearchField name="profession-search" value={query} onChange={setQuery}>
                <Label>Search professions</Label>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search professions..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                aria-label="Professions"
                className="w-full"
                selectedKeys={selectedProfession ? [selectedProfession] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  if (keys !== "all")
                    setSelectedProfession(Array.from(keys)[0]?.toString() ?? null);
                }}
              >
                {filteredProfessions.map(({id, name}) => (
                  <ListBox.Item key={id} id={id} textValue={name}>
                    <Label>{name}</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
              <p aria-live="polite">Selected profession: {selectedProfessionName}</p>
            </Sheet.Body>
            <Sheet.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button isDisabled={!selectedProfession} slot="close">
                Accept
              </Button>
            </Sheet.Footer>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
};

const NESTED_DIALOG_HEIGHT = "h-[320px]";

export const Advanced = () => (
  <Sheet>
    <Sheet.Trigger>
      <Button variant="secondary">Open Parent Sheet</Button>
    </Sheet.Trigger>
    <Sheet.Backdrop>
      <Sheet.Content className="mx-auto max-w-[420px]">
        <Sheet.Dialog className={NESTED_DIALOG_HEIGHT}>
          <Sheet.Handle />
          <Sheet.CloseTrigger />
          <Sheet.Header>
            <Sheet.Heading>Parent Sheet</Sheet.Heading>
          </Sheet.Header>
          <Sheet.Body className="flex flex-col justify-between pb-4">
            <p className="mb-4 text-sm text-muted">
              This is the parent sheet. Open a nested sheet from here — the parent will scale down
              and the child slides on top.
            </p>
            <Sheet.NestedRoot>
              <Sheet.Trigger>
                <Button className="w-full" variant="secondary">
                  Open Nested Sheet
                </Button>
              </Sheet.Trigger>
              <Sheet.Backdrop>
                <Sheet.Content className="mx-auto max-w-[420px]">
                  <Sheet.Dialog className={NESTED_DIALOG_HEIGHT}>
                    <Sheet.Handle />
                    <Sheet.CloseTrigger />
                    <Sheet.Header>
                      <Sheet.Heading>Nested Sheet</Sheet.Heading>
                    </Sheet.Header>
                    <Sheet.Body>
                      <p className="mb-4 text-sm text-muted">
                        This is a nested sheet that sits on top of the parent. Drag it down to
                        dismiss and return to the parent sheet.
                      </p>
                      <Sheet.NestedRoot>
                        <Sheet.Trigger>
                          <Button className="w-full" variant="secondary">
                            Go Deeper
                          </Button>
                        </Sheet.Trigger>
                        <Sheet.Backdrop>
                          <Sheet.Content className="mx-auto max-w-[420px]">
                            <Sheet.Dialog className={NESTED_DIALOG_HEIGHT}>
                              <Sheet.Handle />
                              <Sheet.CloseTrigger />
                              <Sheet.Header>
                                <Sheet.Heading>Third Level</Sheet.Heading>
                              </Sheet.Header>
                              <Sheet.Body>
                                <p className="text-sm text-muted">
                                  Three levels deep! Each parent sheet scales down as the next one
                                  opens, creating a stacking effect.
                                </p>
                              </Sheet.Body>
                              <Sheet.Footer>
                                <Button className="w-full" slot="close">
                                  Close
                                </Button>
                              </Sheet.Footer>
                            </Sheet.Dialog>
                          </Sheet.Content>
                        </Sheet.Backdrop>
                      </Sheet.NestedRoot>
                    </Sheet.Body>
                    <Sheet.Footer>
                      <Button slot="close" variant="secondary">
                        Back
                      </Button>
                    </Sheet.Footer>
                  </Sheet.Dialog>
                </Sheet.Content>
              </Sheet.Backdrop>
            </Sheet.NestedRoot>
          </Sheet.Body>
        </Sheet.Dialog>
      </Sheet.Content>
    </Sheet.Backdrop>
  </Sheet>
);
