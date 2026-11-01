import type {Meta} from "@storybook/react";
import type {Key} from "react";
import type {Selection} from "react-aria-components/ListBox";

import {Icon} from "@iconify/react";
import React, {useState} from "react";
import {useFilter} from "react-aria-components/Autocomplete";

import {Autocomplete} from "../autocomplete";
import {Button} from "../button";
import {Description} from "../description";
import {Drawer} from "../drawer";
import {EmptyState} from "../empty-state";
import {FieldError} from "../field-error";
import {Input} from "../input";
import {Label} from "../label";
import {ListBox} from "../list-box";
import {Modal} from "../modal";
import {Popover} from "../popover";
import {Radio} from "../radio";
import {RadioGroup} from "../radio-group";
import {SearchField} from "../search-field";
import {Separator} from "../separator";
import {Stepper} from "../stepper";
import {TextField} from "../textfield";

import {ViewStack, useViewStack} from "./index";

export default {
  component: ViewStack,
  parameters: {layout: "centered"},
  title: "Components/ViewStack",
} as Meta<typeof ViewStack>;

/* -------------------------------------------------------------------------------------------------
 * Steps in a Modal, driven by the same key as a Stepper
 * -----------------------------------------------------------------------------------------------*/

const STEPS = [
  {id: "details", title: "Details"},
  {id: "plan", title: "Plan"},
  {id: "confirm", title: "Confirm"},
] as const;

const PLANS = [
  {description: "Up to 100 bookings a month", id: "basic", name: "Basic"},
  {description: "Unlimited bookings and reports", id: "pro", name: "Pro"},
] as const;

export const StepsInModal = () => {
  const [step, setStep] = useState<Key>("details");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("basic");
  const [nameError, setNameError] = useState<string | null>(null);

  return (
    <Modal
      onOpenChange={(open) => {
        if (open) return;
        setStep("details");
        setNameError(null);
      }}
    >
      <Button variant="secondary">New member</Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[420px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New member</Modal.Heading>
            </Modal.Header>
            <Stepper aria-label="Steps" className="mt-5 mb-6" currentKey={step} size="sm">
              {STEPS.map(({id, title}) => (
                <Stepper.Item key={id} id={id}>
                  <Stepper.Indicator />
                  <Stepper.Content>
                    <Stepper.Title>{title}</Stepper.Title>
                  </Stepper.Content>
                </Stepper.Item>
              ))}
            </Stepper>

            <ViewStack currentKey={step} onCurrentChange={setStep}>
              <ViewStack.View aria-label="Details" id="details">
                <Modal.Body>
                  <TextField
                    autoFocus
                    isInvalid={nameError !== null}
                    value={name}
                    onChange={(value) => {
                      setName(value);
                      setNameError(null);
                    }}
                  >
                    <Label>Full name</Label>
                    <Input placeholder='Try "taken" to see an error' />
                    <FieldError>{nameError}</FieldError>
                  </TextField>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="tertiary">
                    Cancel
                  </Button>
                  <Button isDisabled={name.trim() === ""} onPress={() => setStep("plan")}>
                    Next
                  </Button>
                </Modal.Footer>
              </ViewStack.View>

              <ViewStack.View aria-label="Plan" id="plan">
                <Modal.Body>
                  <RadioGroup aria-label="Plan" value={plan} onChange={setPlan}>
                    {PLANS.map((option) => (
                      <Radio key={option.id} value={option.id}>
                        <Radio.Content>
                          <Radio.Control>
                            <Radio.Indicator />
                          </Radio.Control>
                          {option.name}
                        </Radio.Content>
                        <Description>{option.description}</Description>
                      </Radio>
                    ))}
                  </RadioGroup>
                </Modal.Body>
                <Modal.Footer>
                  <ViewStack.Back>Back</ViewStack.Back>
                  <Button onPress={() => setStep("confirm")}>Next</Button>
                </Modal.Footer>
              </ViewStack.View>

              <ViewStack.View aria-label="Confirm" id="confirm">
                <Modal.Body>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                    <dt className="text-muted">Name</dt>
                    <dd>{name}</dd>
                    <dt className="text-muted">Plan</dt>
                    <dd>{PLANS.find((option) => option.id === plan)?.name}</dd>
                  </dl>
                </Modal.Body>
                <Modal.Footer>
                  <ViewStack.Back>Back</ViewStack.Back>
                  <Button
                    onPress={() => {
                      // A server error about step 1 jumps back there: direction and focus follow.
                      if (name.trim().toLowerCase() === "taken") {
                        setNameError("This name is already taken");
                        setStep("details");
                      }
                    }}
                  >
                    Create
                  </Button>
                </Modal.Footer>
              </ViewStack.View>
            </ViewStack>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drill-down in a Popover: list → create
 * -----------------------------------------------------------------------------------------------*/

const INITIAL_TAGS = [
  {id: "vip", name: "VIP"},
  {id: "new", name: "New customer"},
  {id: "returning", name: "Returning"},
  {id: "wholesale", name: "Wholesale"},
];

export const DrillDownInPopover = () => {
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(["vip"]));
  const [page, setPage] = useState<Key>("list");
  const [draft, setDraft] = useState("");
  const {contains} = useFilter({sensitivity: "base"});

  const create = () => {
    const id = draft.trim().toLowerCase().replace(/\s+/g, "-");

    setTags((current) => [...current, {id, name: draft.trim()}]);
    setSelectedKeys((keys) => new Set([...(keys === "all" ? [] : keys), id]));
    setPage("list");
  };

  return (
    <Popover onOpenChange={(open) => !open && setPage("list")}>
      <Button isIconOnly aria-label="Add tags" variant="tertiary">
        <Icon icon="gravity-ui:plus" />
      </Button>
      <Popover.Content placement="bottom start" variant="list">
        <Popover.Dialog aria-label="Tags">
          <ViewStack currentKey={page} onCurrentChange={setPage}>
            <ViewStack.View aria-label="Tags" id="list">
              <Autocomplete.Filter filter={contains}>
                <SearchField autoFocus aria-label="Search tags" variant="secondary">
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search tags..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <ListBox
                  aria-label="Tags"
                  // Escape would otherwise clear every selected tag.
                  escapeKeyBehavior="none"
                  renderEmptyState={() => <EmptyState>No tags found</EmptyState>}
                  selectedKeys={selectedKeys}
                  selectionMode="multiple"
                  onSelectionChange={setSelectedKeys}
                >
                  {tags.map((tag) => (
                    <ListBox.Item key={tag.id} id={tag.id} textValue={tag.name}>
                      {tag.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Autocomplete.Filter>
              <Separator />
              <div className="p-1.5">
                <Button
                  fullWidth
                  className="justify-start"
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    setDraft("");
                    setPage("create");
                  }}
                >
                  <Icon icon="gravity-ui:plus" />
                  New tag
                  <Icon className="ms-auto opacity-60" icon="gravity-ui:chevron-right" />
                </Button>
              </div>
            </ViewStack.View>

            <ViewStack.View id="create">
              <ViewStack.Header>
                <ViewStack.Back />
                <ViewStack.Title>New tag</ViewStack.Title>
              </ViewStack.Header>
              {/* Popover has no Body part: the page sets the list gutter itself. */}
              <div className="flex flex-col gap-3 px-3 pb-3">
                <TextField autoFocus aria-label="Tag name" value={draft} onChange={setDraft}>
                  <Input
                    placeholder="Tag name"
                    variant="secondary"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && draft.trim() !== "") create();
                    }}
                  />
                </TextField>
                <Button fullWidth isDisabled={draft.trim() === ""} size="sm" onPress={create}>
                  Create
                </Button>
              </div>
            </ViewStack.View>
          </ViewStack>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Bottom sheet on mobile (Drawer)
 * -----------------------------------------------------------------------------------------------*/

const SETTINGS = [
  {body: "Choose which updates reach you.", id: "notifications", title: "Notifications"},
  {body: "Control who can see your profile.", id: "privacy", title: "Privacy"},
] as const;

export const InDrawer = () => (
  <Drawer>
    <Button variant="secondary">Open settings</Button>
    <Drawer.Backdrop>
      <Drawer.Content className="mx-auto max-w-[420px]">
        <Drawer.Dialog aria-label="Settings">
          <Drawer.Handle />
          <ViewStack defaultKey="root">
            <ViewStack.View id="root">
              <ViewStack.Header>
                <ViewStack.Title>Settings</ViewStack.Title>
              </ViewStack.Header>
              <Drawer.Body className="pb-4">
                <SettingsLinks />
              </Drawer.Body>
            </ViewStack.View>
            {SETTINGS.map(({body, id, title}) => (
              <ViewStack.View key={id} id={id}>
                <ViewStack.Header>
                  <ViewStack.Back />
                  <ViewStack.Title>{title}</ViewStack.Title>
                </ViewStack.Header>
                <Drawer.Body className="pb-4">{body}</Drawer.Body>
              </ViewStack.View>
            ))}
          </ViewStack>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  </Drawer>
);

/** Uncontrolled: deep children navigate through the hook. */
const SettingsLinks = () => {
  const {navigate} = useViewStack();

  return SETTINGS.map(({id, title}) => (
    <Button
      key={id}
      fullWidth
      className="-mx-4 w-[calc(100%+2rem)] justify-start"
      variant="ghost"
      onPress={() => navigate(id)}
    >
      {title}
      <Icon className="ms-auto opacity-60" icon="gravity-ui:chevron-right" />
    </Button>
  ));
};
