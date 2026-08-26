export interface DocsSeoMetadata {
  description: string;
  title: string;
}

const ENGLISH_DOCS_SEO_METADATA: Readonly<Record<string, DocsSeoMetadata>> = {
  "/docs/react/components": {
    description:
      "Browse accessible SY UI React components for forms, overlays, navigation, data display, and more, built with React Aria and Tailwind CSS v4.",
    title: "SY UI React Components – Accessible UI Library",
  },
  "/docs/react/components/button": {
    description:
      "Build accessible React buttons with SY UI. Explore variants, sizes, icon-only states, custom styles, ripple effects, render props, and BEM classes.",
    title: "SY UI Button – Accessible React Button Component",
  },
  "/docs/react/components/select": {
    description:
      "Build accessible React select inputs with SY UI. Explore single and multiple selection, async loading, sections, disabled items, and controlled values.",
    title: "SY UI Select – Accessible React Select Component",
  },
  "/docs/react/getting-started": {
    description:
      "Meet SY UI v0.0.1, an accessible React UI library built on React Aria and Tailwind CSS v4. Explore its design approach, ecosystem, and common questions.",
    title: "Introduction to SY UI v0.0.1 – React UI Library",
  },
};

export function getDocsSeoMetadata(
  locale: string | undefined,
  unlocalizedPath: string,
): DocsSeoMetadata | undefined {
  return locale === "en" ? ENGLISH_DOCS_SEO_METADATA[unlocalizedPath] : undefined;
}
