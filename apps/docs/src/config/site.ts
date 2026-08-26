import {__BASE_URL__, __CDN_URL__} from "@/utils/env";

export const siteConfig = {
  authors: [
    {
      name: "SY UI",
      url: "https://x.com/sy_ui",
    },
  ],
  cdnUrl: __CDN_URL__,
  creator: "sy-ui",
  description:
    "Beautiful, accessible React UI components built on React Aria and Tailwind CSS v4. The modern alternative to MUI, Chakra UI, and shadcn/ui for building production-ready applications.",
  figmaCommunityFile: "https://www.figma.com/community/file/1546526812159103429",
  fullName: "SY UI v0.0.1 — Beautiful by default, customizable by design.",
  githubRawUrl:
    "https://raw.githubusercontent.com/sy-ui/sy-ui/refs/heads/v3/apps/docs/content/docs",
  githubRepo: "sy-ui/sy-ui",
  githubUrl: "https://github.com/sy-ui/sy-ui",
  links: {
    discord: "https://discord.gg/9b6yyZKmH4",
    github: "https://github.com/sy-ui",
    twitter: "https://x.com/sy_ui",
  },
  name: "SY UI",
  ogImage: `/images/twitter-card.jpg`,
  ogImageNative: `/images/twitter-card-native.jpeg`,
  siteUrl: __BASE_URL__,
  supportEmail: "support@sy-ui.com",
};

export type SiteConfig = typeof siteConfig;
