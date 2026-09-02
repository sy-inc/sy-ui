"use client";

import {Icon} from "@iconify/react";
import {ListView} from "@sy-inc/react";

const files = [
  {icon: "gravity-ui:folder", id: "documents", name: "文档", updated: "2 天前更新"},
  {icon: "gravity-ui:folder", id: "photos", name: "照片", updated: "1 周前更新"},
  {icon: "gravity-ui:file", id: "readme", name: "README.md", updated: "3 小时前更新"},
  {icon: "gravity-ui:file", id: "package", name: "package.json", updated: "昨天更新"},
];

export function Default() {
  return (
    <ListView aria-label="项目文件" className="w-[360px]" selectionMode="multiple">
      {files.map((file) => (
        <ListView.Item key={file.id} id={file.id} textValue={file.name}>
          <ListView.Selection aria-label={`选择 ${file.name}`} />
          <Icon aria-hidden icon={file.icon} />
          <ListView.Content>
            <ListView.Title>{file.name}</ListView.Title>
            <ListView.Description>{file.updated}</ListView.Description>
          </ListView.Content>
        </ListView.Item>
      ))}
    </ListView>
  );
}
