import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

const richTextEditorVariants = tv({
  slots: {
    root: "rich-text-editor",
    shell: "rich-text-editor__shell",
    toolbar: "rich-text-editor__toolbar",
    toolbarGroup: "rich-text-editor__toolbar-group",
    button: "rich-text-editor__toolbar-button",
    separator: "rich-text-editor__toolbar-separator",
    content: "rich-text-editor__content",
    prosemirror: "rich-text-editor__prosemirror",
    bubbleMenu: "rich-text-editor__bubble-menu",
    bubbleMenuToolbar: "rich-text-editor__bubble-menu-toolbar",
    floatingMenu: "rich-text-editor__floating-menu",
    floatingMenuToolbar: "rich-text-editor__floating-menu-toolbar",
    suggestionMenu: "rich-text-editor__suggestion-menu",
    suggestionMenuItem: "rich-text-editor__suggestion-menu-item",
    suggestionMenuItemContent: "rich-text-editor__suggestion-menu-item-content",
    suggestionMenuItemDescription: "rich-text-editor__suggestion-menu-item-description",
    footer: "rich-text-editor__footer",
    characterCount: "rich-text-editor__character-count",
    linkInput: "rich-text-editor__link-input",
    linkActions: "rich-text-editor__link-actions",
  },
});

type RichTextEditorVariants = VariantProps<typeof richTextEditorVariants>;

export {richTextEditorVariants};
export type {RichTextEditorVariants};
