// Portions adapted from HeroUI v3.2.7 (Apache-2.0); modified for SY INC.
// Copyright 2025 NextUI Inc.
import {Comment, Envelope} from "@gravity-ui/icons";
import {Tabs} from "@sy-inc/react";
import React from "react";

export function TabsDemo2() {
  return (
    <Tabs className="w-[256px]">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Options">
          <Tabs.Tab className="gap-1.5" id="chats">
            <Comment />
            <span>Chats</span>
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab className="gap-1.5" id="emails">
            <Envelope />
            <span>Emails</span>
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel className="pt-2 text-sm text-muted" id="chats">
        No new chats
      </Tabs.Panel>
      <Tabs.Panel className="pt-2 text-sm text-muted" id="emails">
        No new emails
      </Tabs.Panel>
    </Tabs>
  );
}
