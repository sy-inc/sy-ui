import type {Meta, StoryObj} from "@storybook/react";
import type {ReactNode} from "react";

import {Icon} from "@iconify/react";

import {Button} from "../button";
import {ItemCard} from "../item-card";
import {PressableFeedback} from "../pressable-feedback";
import {Switch} from "../switch";

import {ItemCardGroup} from "./index";

const meta: Meta<typeof ItemCardGroup> = {
  component: ItemCardGroup,
  parameters: {layout: "centered"},
  tags: ["autodocs"],
  title: "Components/ItemCardGroup",
};

export default meta;
type Story = StoryObj<typeof meta>;

const Item = ({
  action = (
    <Button size="sm" variant="outline">
      Manage
    </Button>
  ),
  description,
  icon = "gravity-ui:gear",
  title,
}: {
  action?: ReactNode;
  description?: string;
  icon?: string;
  title: string;
}) => (
  <ItemCard>
    <ItemCard.Icon aria-hidden="true">
      <Icon icon={icon} />
    </ItemCard.Icon>
    <ItemCard.Content>
      <ItemCard.Title>{title}</ItemCard.Title>
      {description ? <ItemCard.Description>{description}</ItemCard.Description> : null}
    </ItemCard.Content>
    {action ? <ItemCard.Action>{action}</ItemCard.Action> : null}
  </ItemCard>
);

const PressableItem = ({
  description = "Open settings",
  icon = "gravity-ui:gear",
  title,
}: {
  description?: string;
  icon?: string;
  title: string;
}) => (
  <ItemCard<"button">
    className="w-full text-start"
    render={({children, className, ref}) => (
      <PressableFeedback ref={ref} className={className}>
        <PressableFeedback.Highlight />
        <PressableFeedback.Ripple />
        {children}
      </PressableFeedback>
    )}
  >
    <ItemCard.Icon aria-hidden="true">
      <Icon icon={icon} />
    </ItemCard.Icon>
    <ItemCard.Content>
      <ItemCard.Title>{title}</ItemCard.Title>
      <ItemCard.Description>{description}</ItemCard.Description>
    </ItemCard.Content>
    <ItemCard.Action>
      <Icon aria-hidden="true" icon="gravity-ui:chevron-right" />
    </ItemCard.Action>
  </ItemCard>
);

const WalletAction = ({amount, eth, label}: {amount: string; eth: string; label: string}) => (
  <>
    <span className="flex flex-col text-end text-xs">
      <span>{amount}</span>
      <span className="text-muted">{eth}</span>
    </span>
    <Button aria-label={`${label} menu`} isIconOnly size="sm" variant="outline">
      <Icon icon="gravity-ui:ellipsis" />
    </Button>
  </>
);

const pressableIcons: Record<string, string> = {
  Appearance: "gravity-ui:palette",
  "Cloud sync": "gravity-ui:cloud",
  Devices: "gravity-ui:device-phone",
  "Dark mode": "gravity-ui:moon",
  Language: "gravity-ui:globe",
  Notifications: "gravity-ui:bell",
  Privacy: "gravity-ui:shield",
  Profile: "gravity-ui:person",
  Region: "gravity-ui:globe",
  Security: "gravity-ui:key",
};

export const DeveloperSettings: Story = {
  render: () => (
    <div className="w-[552px] space-y-8">
      <ItemCardGroup variant="transparent">
        <ItemCardGroup.Header className="flex items-center justify-between px-1.5 py-0">
          <ItemCardGroup.Title>Source Control</ItemCardGroup.Title>
          <Button size="sm" variant="outline">
            Add Provider
          </Button>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <Item
            description="Connected as @jrgarciadev to repositories in organizations: heroui-inc"
            icon="logos:github-icon"
            title="GitHub"
          />
          <Item
            action={
              <Button size="sm" variant="outline">
                Connect
              </Button>
            }
            description="Connect GitLab for Cloud Agents, Bugbot and enhanced codebase context"
            icon="logos:gitlab"
            title="GitLab"
          />
          <PressableItem
            description="Register a GitHub Enterprise App via Manifest"
            icon="logos:github-icon"
            title="GitHub Enterprise"
          />
          <PressableItem
            description="Register a self-hosted GitLab instance"
            icon="logos:gitlab"
            title="GitLab Self Hosted"
          />
        </ItemCardGroup>
      </ItemCardGroup>
      <ItemCardGroup variant="transparent">
        <ItemCardGroup.Header className="px-1.5 py-0">
          <ItemCardGroup.Title>Integrations</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <Item
            description="Work with Cloud Agents from Slack"
            icon="logos:slack-icon"
            action={
              <Button size="sm" variant="outline">
                Connect
              </Button>
            }
            title="Slack"
          />
          <Item
            action={
              <Button size="sm" variant="outline">
                Connect
              </Button>
            }
            description="Connect a Linear workspace to delegate issues to Cloud Agents"
            icon="logos:linear-icon"
            title="Linear"
          />
        </ItemCardGroup>
      </ItemCardGroup>
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <ItemCardGroup className="w-[600px]" layout="grid">
      <Item action={null} description="Personal info" icon="gravity-ui:person" title="Profile" />
      <Item action={null} description="2FA & passwords" icon="gravity-ui:key" title="Security" />
      <Item action={null} description="English (US)" icon="gravity-ui:globe" title="Language" />
      <Item
        action={null}
        description="Theme & colors"
        icon="gravity-ui:palette"
        title="Appearance"
      />
    </ItemCardGroup>
  ),
};

export const GridThreeColumns: Story = {
  render: () => (
    <ItemCardGroup className="w-[760px]" columns={3} layout="grid">
      <ItemCardGroup.Header>
        <ItemCardGroup.Title>Devices</ItemCardGroup.Title>
      </ItemCardGroup.Header>
      <Item action={null} description="Active now" icon="gravity-ui:laptop" title="MacBook Pro" />
      <Item action={null} description="3 days ago" icon="gravity-ui:device-phone" title="iMac" />
      <Item
        action={null}
        description="1 hour ago"
        icon="gravity-ui:device-phone"
        title="iPhone 15"
      />
    </ItemCardGroup>
  ),
};

export const LinkedAccounts: Story = {
  render: () => (
    <ItemCardGroup className="w-[600px]" layout="grid">
      <Item
        action={<Icon icon="gravity-ui:circle-check" />}
        description="junior@heroui.com"
        icon="logos:google-icon"
        title="Google"
      />
      <Item
        action={<Icon icon="gravity-ui:plus" />}
        description="Not Linked"
        icon="logos:apple"
        title="Apple"
      />
      <Item
        action={<Icon icon="gravity-ui:plus" />}
        description="Not Linked"
        icon="logos:github-icon"
        title="Github"
      />
      <Item
        action={<Icon icon="gravity-ui:circle-check" />}
        description="Account Linked"
        icon="logos:linkedin-icon"
        title="LinkedIn"
      />
      <Item
        action={<Icon icon="gravity-ui:plus" />}
        description="Not Linked"
        icon="logos:notion-icon"
        title="Notion"
      />
    </ItemCardGroup>
  ),
};

export const List: Story = {
  render: () => (
    <ItemCardGroup className="w-[500px]">
      <Item
        action={
          <Button size="sm" variant="outline">
            Update
          </Button>
        }
        description="Update your personal information"
        icon="gravity-ui:person"
        title="Profile"
      />
      <Item description="Manage passwords and 2FA" icon="gravity-ui:key" title="Security" />
      <Item
        action={
          <Button size="sm" variant="outline">
            Sync
          </Button>
        }
        description="Sync data across your devices"
        icon="gravity-ui:cloud"
        title="Cloud sync"
      />
    </ItemCardGroup>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <div className="w-[500px] space-y-6">
      <ItemCardGroup variant="transparent">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Account</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <PressableItem
            description="Update your personal information"
            icon="gravity-ui:person"
            title="Profile"
          />
          <PressableItem
            description="Manage passwords and 2FA"
            icon="gravity-ui:key"
            title="Security"
          />
        </ItemCardGroup>
      </ItemCardGroup>
      <ItemCardGroup variant="transparent">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Preferences</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <Item
            action={
              <Button size="sm" variant="outline">
                English
              </Button>
            }
            description="Choose your preferred language"
            icon="gravity-ui:globe"
            title="Language"
          />
          <Item
            action={
              <Switch aria-label="Dark mode">
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            }
            description="Use dark theme across the app"
            icon="gravity-ui:moon"
            title="Dark mode"
          />
        </ItemCardGroup>
      </ItemCardGroup>
    </div>
  ),
};

export const NotificationPreferences: Story = {
  render: () => (
    <ItemCardGroup className="w-[500px]">
      <ItemCardGroup.Header>
        <ItemCardGroup.Title>Notification Preferences</ItemCardGroup.Title>
        <ItemCardGroup.Description>
          Choose how you receive notifications for each event type
        </ItemCardGroup.Description>
      </ItemCardGroup.Header>
      <Item
        action={
          <select aria-label="Event Invites">
            <option>Email and Push Notifications</option>
          </select>
        }
        icon="gravity-ui:envelope"
        title="Event Invites"
      />
      <Item
        action={
          <select aria-label="Event Reminders">
            <option>Email</option>
          </select>
        }
        icon="gravity-ui:bell"
        title="Event Reminders"
      />
      <Item
        action={
          <select aria-label="Event Blasts">
            <option>Email and Push Notifications</option>
          </select>
        }
        icon="gravity-ui:megaphone"
        title="Event Blasts"
      />
    </ItemCardGroup>
  ),
};

export const PermissionLevels: Story = {
  render: () => (
    <ItemCardGroup className="w-[500px]" variant="transparent">
      <ItemCardGroup.Header>
        <ItemCardGroup.Title>Permissions</ItemCardGroup.Title>
        <ItemCardGroup.Description>Control access levels for your team</ItemCardGroup.Description>
      </ItemCardGroup.Header>
      <Item
        action={
          <select aria-label="Documents permission">
            <option>Edit</option>
          </select>
        }
        description="Access to shared files"
        icon="gravity-ui:document"
        title="Documents"
      />
      <Item
        action={
          <select aria-label="Billing permission">
            <option>View</option>
          </select>
        }
        description="Payment and invoices"
        icon="gravity-ui:credit-card"
        title="Billing"
      />
      <Item
        action={
          <select aria-label="Members permission">
            <option>Manage</option>
          </select>
        }
        description="Team member management"
        icon="gravity-ui:persons"
        title="Members"
      />
    </ItemCardGroup>
  ),
};

export const Pressable: Story = {
  render: () => (
    <ItemCardGroup className="w-[500px]">
      <ItemCardGroup.Header>
        <ItemCardGroup.Title>Account</ItemCardGroup.Title>
        <ItemCardGroup.Description>
          Manage your account settings and preferences
        </ItemCardGroup.Description>
      </ItemCardGroup.Header>
      <PressableItem
        description="Manage your personal information"
        icon="gravity-ui:person"
        title="Profile"
      />
      <PressableItem
        description="Manage passwords and 2FA"
        icon="gravity-ui:key"
        title="Security"
      />
      <PressableItem
        description="Sync data across your devices"
        icon="gravity-ui:cloud"
        title="Cloud sync"
      />
    </ItemCardGroup>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="w-[500px] space-y-3">
      {(
        [
          [
            "default",
            "Default",
            "Surface background with shadow",
            "Profile",
            "Update your personal information",
            "Security",
            "Manage passwords and 2FA",
          ],
          [
            "secondary",
            "Secondary",
            "Secondary surface, no shadow",
            "Language",
            "Choose your preferred language",
            "Appearance",
            "Theme and colors",
          ],
          [
            "tertiary",
            "Tertiary",
            "Tertiary surface, no shadow",
            "Cloud sync",
            "Sync data across your devices",
            "Dark mode",
            "Use dark theme across the app",
          ],
          [
            "outline",
            "Outline",
            "Transparent with border, no shadow",
            "Devices",
            "Manage connected devices",
            "Privacy",
            "Control your data and privacy",
          ],
          [
            "transparent",
            "Transparent",
            "No background, no border, no shadow",
            "Notifications",
            "Manage alert preferences",
            "Region",
            "Set your locale and timezone",
          ],
        ] as const
      ).map(
        ([
          variant,
          title,
          description,
          firstTitle,
          firstDescription,
          secondTitle,
          secondDescription,
        ]) => (
          <ItemCardGroup key={variant} variant={variant}>
            <ItemCardGroup.Header>
              <ItemCardGroup.Title>{title}</ItemCardGroup.Title>
              <ItemCardGroup.Description>{description}</ItemCardGroup.Description>
            </ItemCardGroup.Header>
            <PressableItem
              description={firstDescription}
              icon={pressableIcons[firstTitle]}
              title={firstTitle}
            />
            <PressableItem
              description={secondDescription}
              icon={pressableIcons[secondTitle]}
              title={secondTitle}
            />
          </ItemCardGroup>
        ),
      )}
    </div>
  ),
};

export const WalletList: Story = {
  render: () => (
    <ItemCardGroup className="w-[500px]">
      <Item
        action={<WalletAction amount="$0.00" eth="0.0 ETH" label="Funds" />}
        description="0x34E6...6255"
        icon="gravity-ui:wallet"
        title="Funds"
      />
      <Item
        action={<WalletAction amount="$0.00" eth="0.0 ETH" label="0xD9EA...f40e" />}
        description="0xD9EA...f40e"
        icon="gravity-ui:person"
        title="0xD9EA...f40e"
      />
      <Item
        action={<WalletAction amount="$37.09" eth="0.021 ETH" label="SLMobbin's" />}
        description="0x9DC5...621a"
        icon="gravity-ui:person"
        title="SLMobbin's"
      />
      <Item
        action={<WalletAction amount="$0.00" eth="0.0 ETH" label="Sam Lee's Wallet" />}
        description="0xa98b...4daa"
        icon="gravity-ui:person"
        title="Sam Lee's Wallet"
      />
    </ItemCardGroup>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <ItemCardGroup className="w-[500px]">
      <ItemCardGroup.Header>
        <ItemCardGroup.Title>General</ItemCardGroup.Title>
        <ItemCardGroup.Description>Manage your basic account settings</ItemCardGroup.Description>
      </ItemCardGroup.Header>
      <Item
        action={
          <Button size="sm" variant="outline">
            English
          </Button>
        }
        description="Choose your preferred language"
        icon="gravity-ui:globe"
        title="Language"
      />
      <Item
        action={
          <Button size="sm" variant="outline">
            System
          </Button>
        }
        description="Choose light or dark mode"
        icon="gravity-ui:moon"
        title="Theme"
      />
      <Item
        action={
          <Switch aria-label="Dark mode">
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        }
        description="Override system theme"
        icon="gravity-ui:moon"
        title="Dark mode"
      />
    </ItemCardGroup>
  ),
};
