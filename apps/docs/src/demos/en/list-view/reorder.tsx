"use client";

import {Icon} from "@iconify/react";
import {ListView, useListData} from "@sy-inc/react";
import {useDragAndDrop} from "react-aria-components";

const files = [
  {icon: "gravity-ui:folder", id: "documents", name: "Documents", updated: "Updated 2 days ago"},
  {icon: "gravity-ui:folder", id: "photos", name: "Photos", updated: "Updated 1 week ago"},
  {icon: "gravity-ui:file", id: "readme", name: "README.md", updated: "Updated 3 hours ago"},
  {icon: "gravity-ui:file", id: "package", name: "package.json", updated: "Updated yesterday"},
];

export function Reorder() {
  const list = useListData({initialItems: files});
  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    onReorder(event) {
      if (event.target.dropPosition === "before") {
        list.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === "after") {
        list.moveAfter(event.target.key, event.keys);
      }
    },
  });

  return (
    <ListView
      aria-label="Reorderable files"
      className="w-[360px]"
      dragAndDropHooks={dragAndDropHooks}
      items={list.items}
    >
      {(file) => (
        <ListView.Item textValue={file.name}>
          <ListView.DragHandle />
          <Icon aria-hidden icon={file.icon} />
          <ListView.Content>
            <ListView.Title>{file.name}</ListView.Title>
            <ListView.Description>{file.updated}</ListView.Description>
          </ListView.Content>
        </ListView.Item>
      )}
    </ListView>
  );
}
