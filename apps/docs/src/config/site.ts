import {__BASE_URL__, __CDN_URL__} from "@/utils/env";

export const siteConfig = {
  authors: [
    {
      name: "SY INC",
      url: "https://x.com/sy_inc",
    },
  ],
  cdnUrl: __CDN_URL__,
  creator: "sy-inc",
  description:
    "Beautiful, accessible React UI components built on React Aria and Tailwind CSS v4. The modern alternative to MUI, Chakra UI, and shadcn/ui for building production-ready applications.",
  figmaCommunityFile: "https://www.figma.com/community/file/1546526812159103429",
  fullName: "SY INC v0.0.1 — Beautiful by default, customizable by design.",
  githubRawUrl:
    "https://raw.githubusercontent.com/sy-inc/sy-inc/refs/heads/v3/apps/docs/content/docs",
  githubRepo: "sy-inc/sy-inc",
  githubUrl: "https://github.com/sy-inc/sy-inc",
  links: {
    discord: "https://discord.gg/9b6yyZKmH4",
    github: "https://github.com/sy-inc",
    twitter: "https://x.com/sy_inc",
  },
  name: "SY INC",
  ogImage: `/images/twitter-card.jpg`,
  ogImageNative: `/images/twitter-card-native.jpeg`,
  siteUrl: __BASE_URL__,
  supportEmail: "support@sy-inc.com",
};

export type SiteConfig = typeof siteConfig;
