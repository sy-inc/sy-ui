import type {SplitViewLayout, SplitViewPaneName} from "./index";
import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import {useState} from "react";

import {Avatar} from "../avatar";
import {Button} from "../button";
import {Chip} from "../chip";
import {Description} from "../description";
import {Input} from "../input";
import {Label} from "../label";
import {ListBox} from "../list-box";
import {MessageBubble} from "../message-bubble";
import {Switch} from "../switch";
import {TextArea} from "../textarea";
import {TextField} from "../textfield";

import {SplitView} from "./index";

const meta: Meta<typeof SplitView> = {
  component: SplitView,
  parameters: {controls: {disable: true}, layout: "fullscreen"},
  tags: ["autodocs"],
  title: "Components/SplitView",
};

export default meta;
type Story = StoryObj<typeof SplitView>;

const conversations = [
  {
    avatar: "https://assets.sy-inc.com/avatars/blue.jpg",
    email: "alex@northwind.io",
    id: "alex",
    messages: [
      {sent: false, text: "Hi! Can I move our workspace to annual billing?", time: "09:38"},
      {sent: true, text: "Absolutely. Annual saves you two months.", time: "09:39"},
      {sent: false, text: "Great, and will the seats carry over?", time: "09:41"},
    ],
    name: "Alex Chen",
    plan: "Pro",
    time: "09:41",
    unread: 2,
  },
  {
    avatar: "https://assets.sy-inc.com/avatars/green.jpg",
    email: "taylor@lumen.dev",
    id: "taylor",
    messages: [
      {sent: true, text: "Your export is ready in the Downloads tab.", time: "08:10"},
      {sent: false, text: "Got it, thanks for the quick turnaround!", time: "08:12"},
    ],
    name: "Taylor Kim",
    plan: "Team",
    time: "08:12",
    unread: 0,
  },
  {
    avatar: "https://assets.sy-inc.com/avatars/purple.jpg",
    email: "morgan@fieldnotes.co",
    id: "morgan",
    messages: [{sent: false, text: "Invoice #2041 shows the wrong VAT ID.", time: "Mon"}],
    name: "Morgan Lee",
    plan: "Free",
    time: "Mon",
    unread: 1,
  },
  {
    avatar: "https://assets.sy-inc.com/avatars/orange.jpg",
    email: "riley@harbor.app",
    id: "riley",
    messages: [{sent: false, text: "Is there an API limit for webhooks?", time: "Sun"}],
    name: "Riley Park",
    plan: "Pro",
    time: "Sun",
    unread: 0,
  },
];

const paneHeader = "flex h-16 shrink-0 items-center gap-3 px-4";

const Workspace = ({
  contentVariant = "surface",
  mediumBehavior,
  paneVariant,
  width,
  withEnd = false,
  withStart = true,
}: {
  contentVariant?: SplitView.ContentProps["variant"];
  mediumBehavior?: SplitView.Props["mediumBehavior"];
  paneVariant?: SplitView.PaneProps["variant"];
  width?: number;
  withStart?: boolean;
  withEnd?: boolean;
}) => {
  const [activePane, setActivePane] = useState<SplitViewPaneName>(withStart ? "start" : "content");
  const [endOpen, setEndOpen] = useState(withEnd);
  const [selectedId, setSelectedId] = useState("alex");
  const [layout, setLayout] = useState<SplitViewLayout>();
  const selected = conversations.find((item) => item.id === selectedId)!;
  // An open End pane can still be displaced, so toggle on what is actually shown.
  const endVisible = !!layout?.visiblePanes.includes("end");
  const openCustomer = () => {
    setEndOpen(true);
    setActivePane("end");
  };
  const closeCustomer = () => {
    setEndOpen(false);
    setActivePane("content");
  };

  return (
    <div className="flex flex-col gap-2 bg-background p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Chip size="sm" variant="soft">
          {layout?.tier ?? "…"}
        </Chip>
        <span>{layout?.visiblePanes.join(" · ")}</span>
        <span className="ms-auto">Drag the corner to resize</span>
      </div>
      <div
        className="h-[36rem] resize-x overflow-hidden p-1"
        style={{maxWidth: "100%", minWidth: 320, width}}
      >
        <SplitView
          activePane={activePane}
          mediumBehavior={mediumBehavior}
          onLayoutChange={setLayout}
        >
          {!!withStart && (
            <SplitView.Pane aria-label="Inbox" scroll="none" variant={paneVariant}>
              <div className={paneHeader}>
                <h2 className="flex-1 ps-1 font-semibold">Inbox</h2>
                <Chip color="accent" size="sm" variant="soft">
                  3 open
                </Chip>
              </div>
              <ListBox
                aria-label="Conversations"
                className="min-h-0 flex-1 overflow-y-auto p-2"
                selectedKeys={[selectedId]}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  // Pressing the current row in compact still opens it.
                  if (keys !== "all" && keys.size) setSelectedId(String([...keys][0]));
                  setActivePane("content");
                }}
              >
                {conversations.map((item) => (
                  <ListBox.Item
                    key={item.id}
                    className="items-start p-3 data-[selected=true]:bg-surface data-[selected=true]:shadow-surface"
                    id={item.id}
                    textValue={item.name}
                  >
                    <Avatar size="sm">
                      <Avatar.Image alt="" src={item.avatar} />
                      <Avatar.Fallback>{item.name[0]}</Avatar.Fallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-baseline gap-2">
                        <Label className="flex-1 truncate">{item.name}</Label>
                        <span className="text-xs text-muted">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Description className="flex-1 truncate">
                          {item.messages.at(-1)!.text}
                        </Description>
                        {item.unread > 0 && (
                          <span className="grid size-5 place-items-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                            {item.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </ListBox.Item>
                ))}
              </ListBox>
            </SplitView.Pane>
          )}
          <SplitView.Content aria-label="Conversation" scroll="none" variant={contentVariant}>
            <div className={paneHeader}>
              {!!withStart && (
                <SplitView.Back
                  aria-label="Back to inbox"
                  size="sm"
                  onPress={() => setActivePane("start")}
                />
              )}
              <Avatar size="sm">
                <Avatar.Image alt="" src={selected.avatar} />
                <Avatar.Fallback>{selected.name[0]}</Avatar.Fallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="truncate text-sm font-semibold">{selected.name}</h2>
                <span className="text-xs text-muted">Active now</span>
              </div>
              <Button
                isIconOnly
                aria-label="Customer details"
                aria-pressed={endVisible}
                size="sm"
                variant="ghost"
                onPress={endVisible ? closeCustomer : openCustomer}
              >
                <Icon icon="gravity-ui:circle-info" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
              {selected.messages.map((message, index) => (
                <MessageBubble key={index} direction={message.sent ? "sent" : "received"}>
                  <MessageBubble.Content>
                    <MessageBubble.Text>
                      {message.text}
                      <MessageBubble.Time>{message.time}</MessageBubble.Time>
                    </MessageBubble.Text>
                  </MessageBubble.Content>
                </MessageBubble>
              ))}
            </div>
            <div className="flex shrink-0 items-end gap-2 p-3">
              <TextArea
                fullWidth
                aria-label="Reply"
                placeholder={`Reply to ${selected.name.split(" ")[0]}…`}
                rows={1}
              />
              <Button isIconOnly aria-label="Send">
                <Icon icon="gravity-ui:paper-plane" />
              </Button>
            </div>
          </SplitView.Content>
          <SplitView.Pane
            aria-label="Customer details"
            isOpen={endOpen}
            position="end"
            scroll="none"
            variant={paneVariant}
          >
            <div className={paneHeader}>
              <SplitView.Back
                aria-label="Back to conversation"
                size="sm"
                targetPane="content"
                onPress={() => setActivePane("content")}
              />
              <h2 className="flex-1 ps-1 font-semibold">Customer</h2>
              <Button
                isIconOnly
                aria-label="Close details"
                size="sm"
                variant="ghost"
                onPress={closeCustomer}
              >
                <Icon icon="gravity-ui:xmark" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <Avatar size="lg">
                  <Avatar.Image alt="" src={selected.avatar} />
                  <Avatar.Fallback>{selected.name[0]}</Avatar.Fallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-sm text-muted">{selected.email}</p>
                </div>
                <div className="flex gap-1">
                  <Chip color="accent" size="sm" variant="soft">
                    {selected.plan}
                  </Chip>
                  <Chip color="success" size="sm" variant="soft">
                    Active
                  </Chip>
                </div>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">Customer since</dt>
                <dd className="text-end">March 2024</dd>
                <dt className="text-muted">Seats</dt>
                <dd className="text-end">12</dd>
                <dt className="text-muted">Region</dt>
                <dd className="text-end">EU West</dd>
              </dl>
              <TextArea
                fullWidth
                aria-label="Internal note"
                defaultValue="Prefers email follow-ups. Notes survive closing this pane."
                rows={3}
              />
            </div>
          </SplitView.Pane>
        </SplitView>
      </div>
    </div>
  );
};

export const Default: Story = {render: () => <Workspace />};
export const SurfacePanes: Story = {render: () => <Workspace withEnd paneVariant="surface" />};
export const Transparent: Story = {render: () => <Workspace contentVariant="transparent" />};
export const ThreePanes: Story = {render: () => <Workspace withEnd />};
export const ReplaceContent: Story = {
  render: () => <Workspace withEnd mediumBehavior="replace-content" />,
};
export const ContentAndInspector: Story = {
  render: () => <Workspace withEnd withStart={false} />,
};
export const Compact: Story = {render: () => <Workspace withEnd width={390} />};

const SettingsWorkspace = () => {
  const [activePane, setActivePane] = useState<SplitViewPaneName>("start");
  const [section, setSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  return (
    <div className="h-[42rem] max-w-6xl bg-background p-4">
      <SplitView activePane={activePane}>
        <SplitView.Pane aria-label="Settings navigation" width="15rem">
          <div className="flex items-center gap-3 px-3 py-5">
            <Avatar className="bg-accent-soft text-accent-soft-foreground" size="sm">
              <Avatar.Fallback>AC</Avatar.Fallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">Alex Chen</p>
              <p className="text-xs text-muted">Personal account</p>
            </div>
          </div>
          <h1 className="px-3 pt-5 pb-3 text-xs font-medium text-muted">Settings</h1>
          <ListBox
            aria-label="Settings"
            selectedKeys={[section]}
            selectionMode="single"
            onSelectionChange={(keys) => {
              if (keys !== "all" && keys.size) setSection(String([...keys][0]));
              setActivePane("content");
              setSaved(false);
            }}
          >
            <ListBox.Item
              className="min-h-11 px-3 data-[selected=true]:bg-default"
              id="profile"
              textValue="Profile"
            >
              <Icon icon="gravity-ui:person" />
              <Label>Profile</Label>
            </ListBox.Item>
            <ListBox.Item
              className="min-h-11 px-3 data-[selected=true]:bg-default"
              id="notifications"
              textValue="Notifications"
            >
              <Icon icon="gravity-ui:bell" />
              <Label>Notifications</Label>
            </ListBox.Item>
          </ListBox>
        </SplitView.Pane>
        <SplitView.Content aria-label="Account settings" className="p-6" variant="surface">
          <div className="mx-auto w-full max-w-xl py-2">
            <div className="mb-8 flex items-center gap-3">
              <SplitView.Back
                aria-label="Back to settings"
                onPress={() => setActivePane("start")}
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {section === "profile" ? "Your profile" : "Notifications"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {section === "profile"
                    ? "Manage your personal information and how you appear to others."
                    : "Choose which updates you want to hear about."}
                </p>
              </div>
            </div>
            <form
              className="space-y-8"
              onChange={() => setSaved(false)}
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
              }}
            >
              <div className="space-y-6" hidden={section !== "profile"}>
                <div className="flex items-center gap-4">
                  <Avatar className="bg-accent-soft text-accent-soft-foreground" size="lg">
                    <Avatar.Fallback>AC</Avatar.Fallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Personal information</p>
                    <p className="mt-1 text-sm text-muted">Keep your details up to date.</p>
                  </div>
                </div>
                <TextField fullWidth defaultValue="Alex Chen" name="name">
                  <Label>Full name</Label>
                  <Input className="bg-surface-secondary shadow-none" />
                </TextField>
                <TextField fullWidth defaultValue="alex@example.com" name="email" type="email">
                  <Label>Email address</Label>
                  <Input className="bg-surface-secondary shadow-none" />
                </TextField>
                <TextField
                  fullWidth
                  defaultValue="Designing thoughtful digital experiences."
                  name="bio"
                >
                  <Label>Bio</Label>
                  <TextArea className="bg-surface-secondary shadow-none" rows={3} />
                  <Description>A short introduction for your profile.</Description>
                </TextField>
              </div>
              <div className="space-y-5" hidden={section !== "notifications"}>
                <Switch defaultSelected name="messages">
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Email me about new messages
                  </Switch.Content>
                </Switch>
                <Switch name="updates">
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Send me product updates
                  </Switch.Content>
                </Switch>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit">Save changes</Button>
                <p className="text-sm text-muted" role="status">
                  {saved ? "Changes saved in this preview." : ""}
                </p>
              </div>
            </form>
          </div>
        </SplitView.Content>
      </SplitView>
    </div>
  );
};

export const Settings: Story = {render: () => <SettingsWorkspace />};
