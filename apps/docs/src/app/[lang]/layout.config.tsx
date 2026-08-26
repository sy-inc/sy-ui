import type {BaseLayoutProps} from "fumadocs-ui/layouts/shared";

import {SyUILogo} from "@/components/sy-ui-logo";

export {getHomeLayoutLinks} from "./(home)/home-layout-links";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <SyUILogo />,
    transparentMode: "always",
  },
};
