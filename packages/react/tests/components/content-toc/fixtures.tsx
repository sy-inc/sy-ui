/* eslint-disable react-refresh/only-export-components -- Shared entries and JSX for jsdom and SSR suites. */
import type {ContentTocEntry, ContentTocRootProps} from "@/components/content-toc";

import {ContentToc} from "@/components/content-toc";

export const items: ContentTocEntry[] = [
  {depth: 2, id: "intro", title: "Overview"},
  {depth: 3, id: "details", title: "Anchors"},
  {depth: 2, id: "next", title: "Next steps"},
];

export const TocFixture = (props: Partial<ContentTocRootProps>) => (
  <ContentToc activeId="details" items={items} label="On this page" {...props}>
    <ContentToc.Title />
    <ContentToc.List />
  </ContentToc>
);
