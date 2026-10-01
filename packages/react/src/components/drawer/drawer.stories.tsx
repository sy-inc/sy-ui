import type {DrawerSnapPoint} from "./index";
import type {Meta} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";

import {Button} from "../button";
import {Input} from "../input";
import {Label} from "../label";
import {ListBox} from "../list-box";
import {SearchField} from "../search-field";
import {TextField} from "../textfield";

import {Drawer} from "./index";

export default {
  component: Drawer,
  parameters: {layout: "centered"},
  title: "Components/Drawer",
} as Meta<typeof Drawer>;

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
  "Drawers keep focused tasks close at hand without taking users away from the current page.",
  "This example keeps the header and actions in place while the body handles a longer reading flow.",
  "Use the drawer body for supporting context, grouped settings, or a compact sequence of decisions.",
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
    {handle === "top" && <Drawer.Handle />}
    <Drawer.CloseTrigger />
    <Drawer.Header>
      <Drawer.Heading>Drawer title</Drawer.Heading>
    </Drawer.Header>
    <Drawer.Body>
      <p>Drag the drawer or use its handle to change snap points.</p>
    </Drawer.Body>
    <Drawer.Footer>
      <Button slot="close" variant="secondary">
        Close
      </Button>
    </Drawer.Footer>
    {handle === "bottom" && <Drawer.Handle />}
  </>
);

export const BackdropVariants = () => (
  <div className="flex flex-wrap gap-3">
    {BACKDROP_VARIANTS.map((variant) => (
      <Drawer key={variant}>
        <Button variant="secondary">Open {variant} backdrop</Button>
        <Drawer.Backdrop variant={variant}>
          <Drawer.Content className="mx-auto max-w-[420px]">
            <Drawer.Dialog>
              <Content />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    ))}
  </div>
);

export const ScrollableContent = () => (
  <Drawer>
    <Button variant="secondary">Open scrollable drawer</Button>
    <Drawer.Backdrop variant="blur">
      <Drawer.Content className="mx-auto max-w-[480px]">
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger aria-label="Close scrollable drawer" />
          <Drawer.Header>
            <Drawer.Heading>Scrollable content</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <div className="min-h-[720px] space-y-4 pb-2">
              {SCROLLABLE_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button slot="close" variant="secondary">
              Close
            </Button>
            <Button slot="close">Accept</Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);

export const Default = () => (
  <Drawer>
    <Button variant="secondary">Open drawer</Button>
    <Drawer.Backdrop>
      <Drawer.Content className="mx-auto max-w-[420px]">
        <Drawer.Dialog>
          <Content />
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);
export const Placements = () => (
  <div className="flex flex-wrap gap-3">
    {(["bottom", "top", "left", "right"] as const).map((placement) => (
      <Drawer key={placement} placement={placement}>
        <Button variant="secondary">
          {placement.charAt(0).toUpperCase() + placement.slice(1)}
        </Button>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content
            className={placement === "left" || placement === "right" ? "w-[400px]" : undefined}
          >
            <Drawer.Dialog>
              <Content
                handle={placement === "bottom" ? "top" : placement === "top" ? "bottom" : "none"}
              />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    ))}
  </div>
);
export const Detached = () => (
  <div className="flex flex-wrap gap-3">
    {DETACHED_PLACEMENTS.map((placement) => (
      <Drawer key={placement} isDetached shouldScaleBackground placement={placement}>
        <Button variant="secondary">Open detached {placement} drawer</Button>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content
            className={placement === "left" || placement === "right" ? "m-2 w-[400px]" : "m-2"}
          >
            <Drawer.Dialog>
              <Content
                handle={placement === "bottom" ? "top" : placement === "top" ? "bottom" : "none"}
              />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    ))}
  </div>
);

export const NonModal = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="tertiary" onPress={() => setCount((value) => value + 1)}>
        Page button · pressed {count} times
      </Button>
      <Drawer isModal={false}>
        <Button variant="secondary">Open non-modal drawer</Button>
        <Drawer.Backdrop>
          <Drawer.Content className="mx-auto max-w-[420px]">
            <Drawer.Dialog>
              <Drawer.Handle />
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Non-modal drawer</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  The page behind stays interactive while this drawer is open. Press the page button
                  above: its counter still updates. Focus is not trapped and there is no backdrop.
                </p>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
};

export const HandleOnly = () => (
  <Drawer isHandleOnly>
    <Button variant="secondary">Open handle-only drawer</Button>
    <Drawer.Backdrop>
      <Drawer.Content className="mx-auto max-w-[420px]">
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>Drag from the handle only</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <p>
              Dragging the header or this text does nothing. Only the handle at the top drags the
              drawer down to dismiss it. Use this when the panel content needs its own gestures.
            </p>
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);

const SNAP_POINTS = [
  {label: "Peek", point: "25%"},
  {label: "Half", point: "50%"},
  {label: "Full", point: "90%"},
] as const;

export const SnapPoints = () => {
  const [activeSnapPoint, setActiveSnapPoint] = React.useState<DrawerSnapPoint>("50%");

  return (
    <Drawer
      activeSnapPoint={activeSnapPoint}
      snapPoints={SNAP_POINTS.map(({point}) => point)}
      onActiveSnapPointChange={setActiveSnapPoint}
    >
      <Button variant="secondary">Open snap-point drawer</Button>
      <Drawer.Backdrop>
        <Drawer.Content className="mx-auto max-w-[480px]">
          <Drawer.Dialog>
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Resting at {activeSnapPoint} of the screen</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-4">
              <p>
                The drawer can rest at several heights instead of only open or closed. Drag it and
                release: it settles on the nearest height. Dragging below the lowest one closes it.
              </p>
              <div className="flex gap-2">
                {SNAP_POINTS.map(({label, point}) => (
                  <Button
                    key={point}
                    size="sm"
                    variant={point === activeSnapPoint ? "primary" : "secondary"}
                    onPress={() => setActiveSnapPoint(point)}
                  >
                    {label} · {point}
                  </Button>
                ))}
              </div>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export const ProfessionsPicker = () => {
  const [query, setQuery] = React.useState("");
  const [selectedProfession, setSelectedProfession] = React.useState<string | null>(null);
  const filteredProfessions = PROFESSIONS.filter(({name}) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selectedProfessionName =
    PROFESSIONS.find(({id}) => id === selectedProfession)?.name ?? "None";

  return (
    <Drawer>
      <Button variant="secondary">Choose profession</Button>
      <Drawer.Backdrop variant="blur">
        <Drawer.Content className="mx-auto max-w-[440px]">
          <Drawer.Dialog>
            <Drawer.CloseTrigger aria-label="Close professions picker" />
            <Drawer.Header>
              <Drawer.Heading>Choose a profession</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-4">
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
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button isDisabled={!selectedProfession} slot="close">
                Accept
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

const NESTED_DIALOG_HEIGHT = "h-[320px]";

export const Nested = () => (
  <Drawer>
    <Button variant="secondary">Open Parent Drawer</Button>
    <Drawer.Backdrop>
      <Drawer.Content className="mx-auto max-w-[420px]">
        <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
          <Drawer.Handle />
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>Parent Drawer</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col justify-between pb-4">
            <p className="mb-4 text-sm text-muted">
              This is the parent drawer. Open a nested drawer from here — the parent will scale down
              and the child slides on top.
            </p>
            <Drawer>
              <Button className="w-full" variant="secondary">
                Open Nested Drawer
              </Button>
              <Drawer.Backdrop>
                <Drawer.Content className="mx-auto max-w-[420px]">
                  <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
                    <Drawer.Handle />
                    <Drawer.CloseTrigger />
                    <Drawer.Header>
                      <Drawer.Heading>Nested Drawer</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.Body>
                      <p className="mb-4 text-sm text-muted">
                        This is a nested drawer that sits on top of the parent. Drag it down to
                        dismiss and return to the parent drawer.
                      </p>
                      <Drawer>
                        <Button className="w-full" variant="secondary">
                          Go Deeper
                        </Button>
                        <Drawer.Backdrop>
                          <Drawer.Content className="mx-auto max-w-[420px]">
                            <Drawer.Dialog className={NESTED_DIALOG_HEIGHT}>
                              <Drawer.Handle />
                              <Drawer.CloseTrigger />
                              <Drawer.Header>
                                <Drawer.Heading>Third Level</Drawer.Heading>
                              </Drawer.Header>
                              <Drawer.Body>
                                <p className="text-sm text-muted">
                                  Three levels deep! Each parent drawer scales down as the next one
                                  opens, creating a stacking effect.
                                </p>
                              </Drawer.Body>
                              <Drawer.Footer>
                                <Button className="w-full" slot="close">
                                  Close
                                </Button>
                              </Drawer.Footer>
                            </Drawer.Dialog>
                          </Drawer.Content>
                        </Drawer.Backdrop>
                      </Drawer>
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Button slot="close" variant="secondary">
                        Back
                      </Button>
                    </Drawer.Footer>
                  </Drawer.Dialog>
                </Drawer.Content>
              </Drawer.Backdrop>
            </Drawer>
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);

// Stories below are kept from the previous Drawer to show its composition still works.
export const WithForm = () => (
  <Drawer>
    <Button variant="secondary">Edit Profile</Button>
    <Drawer.Backdrop>
      <Drawer.Content placement="right">
        <Drawer.Dialog>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>Edit Profile</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <form className="flex flex-col gap-4">
              <TextField className="w-full" name="name" type="text">
                <Label>Name</Label>
                <Input placeholder="Enter your name" variant="secondary" />
              </TextField>
              <TextField className="w-full" name="email" type="email">
                <Label>Email</Label>
                <Input placeholder="Enter your email" variant="secondary" />
              </TextField>
              <TextField className="w-full" name="bio">
                <Label>Bio</Label>
                <Input placeholder="Tell us about yourself" variant="secondary" />
              </TextField>
            </form>
          </Drawer.Body>
          <Drawer.Footer>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
            <Button slot="close">Save Changes</Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);

export const NavigationDrawer = () => {
  const navItems = [
    {icon: "gravity-ui:house", label: "Home"},
    {icon: "gravity-ui:magnifier", label: "Search"},
    {icon: "gravity-ui:bell", label: "Notifications"},
    {icon: "gravity-ui:envelope", label: "Messages"},
    {icon: "gravity-ui:person", label: "Profile"},
    {icon: "gravity-ui:gear", label: "Settings"},
  ];

  return (
    <Drawer>
      <Button variant="secondary">
        <Icon icon="gravity-ui:bars" />
        Menu
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="left">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Navigation</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default"
                    type="button"
                  >
                    <Icon className="size-5 text-muted" icon={item.icon} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export const NonDismissable = () => (
  <Drawer>
    <Button variant="secondary">Important Action</Button>
    <Drawer.Backdrop isDismissable={false}>
      <Drawer.Content>
        <Drawer.Dialog>
          <Drawer.Header>
            <Drawer.Heading>Confirm Action</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <p>
              This drawer cannot be dismissed by clicking outside. You must use one of the buttons
              below.
            </p>
          </Drawer.Body>
          <Drawer.Footer>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
            <Button slot="close">Confirm</Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);

export const Controlled = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onPress={() => setIsOpen(true)}>
          Open Drawer
        </Button>
        <p className="text-sm text-muted">
          Status:{" "}
          <span className="font-mono font-medium text-foreground">
            {isOpen ? "open" : "closed"}
          </span>
        </p>
      </div>

      <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Controlled Drawer</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <p>This drawer is controlled externally via React state.</p>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </div>
  );
};
