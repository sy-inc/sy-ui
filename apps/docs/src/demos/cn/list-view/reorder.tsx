"use client";

import {Icon} from "@iconify/react";
import {ListView, useListData} from "@sy-inc/react";
import {useDragAndDrop} from "react-aria-components";

const files = [
  {icon: "gravity-ui:folder", id: "documents", name: "文档", updated: "2 天前更新"},
  {icon: "gravity-ui:folder", id: "photos", name: "照片", updated: "1 周前更新"},
  {icon: "gravity-ui:file", id: "readme", name: "README.md", updated: "3 小时前更新"},
  {icon: "gravity-ui:file", id: "package", name: "package.json", updated: "昨天更新"},
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
      aria-label="可排序文件"
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
