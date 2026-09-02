import type {Meta, StoryObj} from "@storybook/react";
import type {ReactNode} from "react";

import {Icon} from "@iconify/react";

import {Button} from "../button";
import {Chip} from "../chip";
import {ListBox} from "../list-box";
import {PressableFeedback} from "../pressable-feedback";
import {Select} from "../select";
import {Switch} from "../switch";

import {ItemCard} from "./index";

const meta: Meta<typeof ItemCard> = {
  component: ItemCard,
  decorators: [
    (Story) => (
      <div className="-my-4 flex h-[720px] w-full items-center justify-center">
        <Story />
      </div>
    ),
  ],
  parameters: {layout: "centered"},
  tags: ["autodocs"],
  title: "Components/Data Display/ItemCard",
};

export default meta;
type Story = StoryObj<typeof meta>;

const Details = ({description, title}: {title: string; description?: string}) => (
  <ItemCard.Content>
    <ItemCard.Title>{title}</ItemCard.Title>
    {description ? <ItemCard.Description>{description}</ItemCard.Description> : null}
  </ItemCard.Content>
);

const Chevron = () => <Icon aria-hidden="true" icon="gravity-ui:chevron-right" />;

const CircleArrowRight = () => (
  <Icon aria-hidden="true" className="!size-4" icon="gravity-ui:circle-arrow-right" />
);

const StoryCard = ({
  children,
  variant,
}: {
  children: ReactNode;
  variant?: ItemCard["Props"]["variant"];
}) => (
  <ItemCard className="w-[452px]" variant={variant}>
    {children}
  </ItemCard>
);

const PressableCard = ({children}: {children: ReactNode}) => (
  <ItemCard<"button">
    className="w-[452px] text-start"
    render={({children: content, className, ref}) => (
      <PressableFeedback ref={ref} className={className}>
        <PressableFeedback.Highlight />
        <PressableFeedback.Ripple />
        {content}
      </PressableFeedback>
    )}
  >
    {children}
  </ItemCard>
);

const LanguageSelect = () => (
  <Select aria-label="Language" className="w-auto" defaultSelectedKey="en">
    <Select.Trigger className="h-6 min-h-6 items-center gap-2 rounded-md border-0 bg-transparent py-0 ps-1 !pe-1 text-sm text-muted shadow-none">
      <Select.Value className="flex-none" />
      <Select.Indicator className="!static !size-4 shrink-0" />
    </Select.Trigger>
    <Select.Popover className="w-[94px]">
      <ListBox>
        <ListBox.Item id="en" textValue="English">
          English
        </ListBox.Item>
        <ListBox.Item id="es" textValue="Spanish">
          Spanish
        </ListBox.Item>
        <ListBox.Item id="fr" textValue="French">
          French
        </ListBox.Item>
        <ListBox.Item id="ja" textValue="Japanese">
          Japanese
        </ListBox.Item>
      </ListBox>
    </Select.Popover>
  </Select>
);

export const Default: Story = {
  render: () => (
    <StoryCard>
      <ItemCard.Icon aria-hidden="true">
        <Icon icon="gravity-ui:globe" />
      </ItemCard.Icon>
      <Details description="Choose your preferred language" title="Language" />
      <ItemCard.Action>
        <Button size="sm" variant="outline">
          English <CircleArrowRight />
        </Button>
      </ItemCard.Action>
    </StoryCard>
  ),
};
export const Variants: Story = {
  render: () => (
    <div className="w-[500px] space-y-3 rounded-2xl p-6">
      <StoryCard>
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:globe" />
        </ItemCard.Icon>
        <Details description="Surface background with shadow" title="Default" />
        <ItemCard.Action>
          <Chevron />
        </ItemCard.Action>
      </StoryCard>
      <StoryCard variant="secondary">
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:palette" />
        </ItemCard.Icon>
        <Details description="Secondary surface, no shadow" title="Secondary" />
        <ItemCard.Action>
          <Chevron />
        </ItemCard.Action>
      </StoryCard>
      <StoryCard variant="tertiary">
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:moon" />
        </ItemCard.Icon>
        <Details description="Tertiary surface, no shadow" title="Tertiary" />
        <ItemCard.Action>
          <Chevron />
        </ItemCard.Action>
      </StoryCard>
      <StoryCard variant="outline">
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:key" />
        </ItemCard.Icon>
        <Details description="Transparent with border, no shadow" title="Outline" />
        <ItemCard.Action>
          <Chevron />
        </ItemCard.Action>
      </StoryCard>
      <StoryCard variant="transparent">
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:bell" />
        </ItemCard.Icon>
        <Details description="No background, no border, no shadow" title="Transparent" />
        <ItemCard.Action>
          <Chevron />
        </ItemCard.Action>
      </StoryCard>
    </div>
  ),
};
export const WithSwitch: Story = {
  render: () => (
    <StoryCard>
      <ItemCard.Icon aria-hidden="true">
        <Icon icon="gravity-ui:envelope" />
      </ItemCard.Icon>
      <Details description="Receive product announcements" title="Email notifications" />
      <ItemCard.Action>
        <Switch defaultSelected aria-label="Enable email notifications">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>
      </ItemCard.Action>
    </StoryCard>
  ),
};
export const DeviceList: Story = {
  render: () => (
    <div className="w-[500px] space-y-2 rounded-2xl p-6">
      <StoryCard>
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:laptop" />
        </ItemCard.Icon>
        <Details description="Last active: 2 minutes ago" title="MacBook Pro" />
        <ItemCard.Action className="min-h-6 items-center">
          <Chip className="px-1 py-0" color="success" variant="soft">
            Active
          </Chip>
        </ItemCard.Action>
      </StoryCard>
      <StoryCard>
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:display" />
        </ItemCard.Icon>
        <Details description="Last active: 3 days ago" title="iMac" />
        <ItemCard.Action>
          <Button size="sm" variant="outline">
            Revoke
          </Button>
        </ItemCard.Action>
      </StoryCard>
      <StoryCard>
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:device-phone" />
        </ItemCard.Icon>
        <Details description="Last active: 1 hour ago" title="iPhone 15 Pro" />
        <ItemCard.Action>
          <Button size="sm" variant="outline">
            Revoke
          </Button>
        </ItemCard.Action>
      </StoryCard>
    </div>
  ),
};
export const Pressable: Story = {
  render: () => (
    <div className="w-[500px] space-y-4 rounded-2xl p-6">
      <PressableCard>
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:person" />
        </ItemCard.Icon>
        <Details description="Manage your account preferences" title="Account settings" />
        <ItemCard.Action>
          <Chevron />
        </ItemCard.Action>
      </PressableCard>
      <PressableCard>
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:key" />
        </ItemCard.Icon>
        <Details description="Passwords and two-factor authentication" title="Security" />
        <ItemCard.Action>
          <Chevron />
        </ItemCard.Action>
      </PressableCard>
    </div>
  ),
};
export const WithSelect: Story = {
  render: () => (
    <div className="w-[500px] rounded-2xl p-6">
      <StoryCard>
        <ItemCard.Icon aria-hidden="true">
          <Icon icon="gravity-ui:globe" />
        </ItemCard.Icon>
        <Details description="Choose your preferred language" title="Language" />
        <ItemCard.Action>
          <LanguageSelect />
        </ItemCard.Action>
      </StoryCard>
    </div>
  ),
};
