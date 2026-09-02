"use client";

import {Icon} from "@iconify/react";
import {ListView} from "@sy-inc/react";

const files = [
  {icon: "gravity-ui:folder", id: "documents", name: "Documents", updated: "Updated 2 days ago"},
  {icon: "gravity-ui:folder", id: "photos", name: "Photos", updated: "Updated 1 week ago"},
  {icon: "gravity-ui:file", id: "readme", name: "README.md", updated: "Updated 3 hours ago"},
  {icon: "gravity-ui:file", id: "package", name: "package.json", updated: "Updated yesterday"},
];

export function Default() {
  return (
    <ListView aria-label="Project files" className="w-[360px]" selectionMode="multiple">
      {files.map((file) => (
        <ListView.Item key={file.id} id={file.id} textValue={file.name}>
          <ListView.Selection aria-label={`Select ${file.name}`} />
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
