"use client";

import type {Selection} from "@sy-inc/react";

import {Check} from "@gravity-ui/icons";
import {Avatar, Description, Label, ListBox, Surface} from "@sy-inc/react";
import {useState} from "react";

export function Controlled() {
  const [selected, setSelected] = useState<Selection>(new Set(["1"]));

  const selectedItems = Array.from(selected);

  return (
    <div className="space-y-4">
      <Surface className="w-[256px] rounded-3xl shadow-surface">
        <ListBox
          aria-label="用户"
          selectedKeys={selected}
          selectionMode="multiple"
          onSelectionChange={setSelected}
        >
          <ListBox.Item id="1" textValue="Bob">
            <Avatar size="sm">
              <Avatar.Image
                alt="Bob"
                src="https://assets.sy-inc.com/avatars/blue.jpg"
              />
              <Avatar.Fallback>B</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <Label>Bob</Label>
              <Description>bob@sy-inc.com</Description>
            </div>
            <ListBox.ItemIndicator>
              {({isSelected}) => (isSelected ? <Check className="size-4 text-accent" /> : null)}
            </ListBox.ItemIndicator>
          </ListBox.Item>
          <ListBox.Item id="2" textValue="Fred">
            <Avatar size="sm">
              <Avatar.Image
                alt="Fred"
                src="https://assets.sy-inc.com/avatars/green.jpg"
              />
              <Avatar.Fallback>F</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <Label>Fred</Label>
              <Description>fred@sy-inc.com</Description>
            </div>
            <ListBox.ItemIndicator>
              {({isSelected}) => (isSelected ? <Check className="size-4 text-accent" /> : null)}
            </ListBox.ItemIndicator>
          </ListBox.Item>
          <ListBox.Item id="3" textValue="Martha">
            <Avatar size="sm">
              <Avatar.Image
                alt="Martha"
                src="https://assets.sy-inc.com/avatars/purple.jpg"
              />
              <Avatar.Fallback>M</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <Label>Martha</Label>
              <Description>martha@sy-inc.com</Description>
            </div>
            <ListBox.ItemIndicator>
              {({isSelected}) => (isSelected ? <Check className="size-4 text-accent" /> : null)}
            </ListBox.ItemIndicator>
          </ListBox.Item>
        </ListBox>
      </Surface>
      <p className="text-sm text-muted">
        已选：{selectedItems.length > 0 ? selectedItems.join("、") : "无"}
      </p>
    </div>
  );
}
