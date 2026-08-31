"use client";

import type {Editor, EditorOptions, Extensions, JSONContent, Range} from "@tiptap/core";
import type {SuggestionOptions, SuggestionProps} from "@tiptap/suggestion";

import {richTextEditorVariants} from "@sy-inc/styles";
import {CharacterCount as CharacterCountExtension, Placeholder} from "@tiptap/extensions";
import {EditorContent, useEditor, useEditorState} from "@tiptap/react";
import {
  BubbleMenu as TiptapBubbleMenu,
  FloatingMenu as TiptapFloatingMenu,
} from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {Suggestion, SuggestionPluginKey, exitSuggestion} from "@tiptap/suggestion";
import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {composeTwRenderProps} from "../../utils";
import {Button} from "../button";
import {Input} from "../input";
import {Popover} from "../popover";
import {ToggleButton} from "../toggle-button";
import {Toolbar} from "../toolbar";

export type RichTextEditorDetails = {
  html: string;
  text: string;
  isEmpty: boolean;
  characters: number;
  words: number;
};
export type ToggleCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "blockquote"
  | "bulletList"
  | "orderedList"
  | "codeBlock"
  | "heading-1"
  | "heading-2"
  | "heading-3";
export type Action = "undo" | "redo" | "clearFormatting" | "clearContent";
export type SuggestionItem = {
  title: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  command?: (args: {editor: Editor; range: Range}) => void;
};
type Context = {
  editor: Editor | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  maxLength?: number;
  slots: ReturnType<typeof richTextEditorVariants>;
};
const EditorContext = createContext<Context | null>(null);
const LinkContext = createContext<{url: string; setUrl: (url: string) => void} | null>(null);
const defaultExtensions: Extensions = [];
const slots = richTextEditorVariants();

const details = (editor: Editor): RichTextEditorDetails => {
  const text = editor.getText();

  return {
    html: editor.getHTML(),
    text,
    isEmpty: editor.isEmpty,
    characters: editor.storage.characterCount?.characters?.() ?? text.length,
    words: editor.storage.characterCount?.words?.() ?? 0,
  };
};

export const useRichTextEditor = () => {
  const context = useContext(EditorContext);

  if (!context) throw new Error("useRichTextEditor must be used inside RichTextEditor");

  return context;
};
export const useRichTextEditorState = <T,>(
  selector: (editor: Editor | null) => T,
  equalityFn?: (a: T, b: T | null) => boolean,
): T | null => {
  const {editor} = useRichTextEditor();

  return useEditorState({
    editor,
    equalityFn,
    selector: (snapshot) => selector(snapshot.editor),
  });
};
export const filterRichTextEditorSuggestionItems = <
  T extends Pick<SuggestionItem, "title" | "keywords">,
>(
  items: T[],
  query: string,
) => {
  const lower = query.trim().toLowerCase();

  return !lower
    ? items
    : items.filter((item) =>
        [item.title, ...(item.keywords ?? [])].some((value) => value.toLowerCase().includes(lower)),
      );
};

export interface RichTextEditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange" | "value"
> {
  value?: JSONContent;
  defaultValue?: JSONContent;
  onValueChange?: (value: JSONContent, details: RichTextEditorDetails) => void;
  placeholder?: string;
  maxLength?: number;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  extensions?: Extensions;
  editorOptions?: Partial<EditorOptions>;
}
export const RichTextEditorRoot = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditorRoot(
    {
      children,
      className,
      defaultValue,
      editorOptions,
      extensions: suppliedExtensions,
      isDisabled = false,
      isReadOnly = false,
      maxLength,
      onValueChange,
      placeholder = "Start writing...",
      value,
      ...props
    },
    ref,
  ) {
    const onUpdate = useRef(onValueChange);

    onUpdate.current = onValueChange;
    const initial = useRef(value ?? defaultValue);
    const extensions = suppliedExtensions ?? defaultExtensions;
    const tiptapExtensions = useMemo(
      () => [
        StarterKit.configure({link: {openOnClick: false}}),
        Placeholder.configure({placeholder}),
        CharacterCountExtension.configure({limit: maxLength ?? null}),
        ...extensions,
      ],
      [extensions, maxLength, placeholder],
    );
    const editorProps = editorOptions?.editorProps;
    const editorAttributes = editorProps?.attributes;
    const prosemirrorAttributes =
      typeof editorAttributes === "function"
        ? (state: any) => {
            const attributes = editorAttributes(state);

            return {
              ...attributes,
              "aria-label": attributes["aria-label"] ?? "Rich text editor",
              "aria-multiline": attributes["aria-multiline"] ?? "true",
              class: [attributes["class"], "rich-text-editor__prosemirror"]
                .filter(Boolean)
                .join(" "),
              role: attributes["role"] ?? "textbox",
            };
          }
        : {
            ...editorAttributes,
            "aria-label": editorAttributes?.["aria-label"] ?? "Rich text editor",
            "aria-multiline": editorAttributes?.["aria-multiline"] ?? "true",
            class: [editorAttributes?.["class"], "rich-text-editor__prosemirror"]
              .filter(Boolean)
              .join(" "),
            role: editorAttributes?.["role"] ?? "textbox",
          };
    const editor = useEditor(
      {
        ...editorOptions,
        content: initial.current,
        editable: !isDisabled && !isReadOnly,
        editorProps: {...editorProps, attributes: prosemirrorAttributes},
        extensions: tiptapExtensions,
        immediatelyRender: false,
        onUpdate: ({editor: current}) => onUpdate.current?.(current.getJSON(), details(current)),
      },
      [tiptapExtensions],
    );

    useEffect(() => {
      editor?.setEditable(!isDisabled && !isReadOnly);
    }, [editor, isDisabled, isReadOnly]);
    useEffect(() => {
      if (
        editor &&
        value !== undefined &&
        JSON.stringify(editor.getJSON()) !== JSON.stringify(value)
      )
        editor.commands.setContent(value, {emitUpdate: false});
    }, [editor, value]);

    return (
      <EditorContext value={{editor, isDisabled, isReadOnly, maxLength, slots}}>
        <div
          ref={ref}
          className={slots.root({className})}
          data-disabled={isDisabled || undefined}
          data-readonly={isReadOnly || undefined}
          data-slot="rich-text-editor"
          data-testid="rich-text-editor"
          {...props}
        >
          {children}
        </div>
      </EditorContext>
    );
  },
);
RichTextEditorRoot.displayName = "SY INC.RichTextEditor";

export const Shell = ({children, className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  const {slots} = useRichTextEditor();

  return (
    <div className={slots.shell({className})} data-slot="rich-text-editor-shell" {...props}>
      {children}
    </div>
  );
};
export const ToolbarPart = ({children, className, ...props}: any) => {
  const {isDisabled, isReadOnly, slots} = useRichTextEditor();

  return (
    <Toolbar
      className={composeTwRenderProps(className, slots.toolbar())}
      data-slot="rich-text-editor-toolbar"
      isDisabled={isDisabled || isReadOnly}
      {...props}
    >
      {children}
    </Toolbar>
  );
};
export const ToolbarGroup = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const {slots} = useRichTextEditor();

  return (
    <div
      className={slots.toolbarGroup({className})}
      data-slot="rich-text-editor-toolbar-group"
      role="group"
      {...props}
    >
      {children}
    </div>
  );
};
export const ToolbarSeparator = ({className, ...props}: React.HTMLAttributes<HTMLSpanElement>) => {
  const {slots} = useRichTextEditor();

  return (
    <span
      aria-orientation="vertical"
      className={slots.separator({className})}
      data-slot="rich-text-editor-toolbar-separator"
      role="separator"
      {...props}
    />
  );
};

const toggle = (editor: Editor, command: ToggleCommand) => {
  const chain: any = editor.chain().focus();

  if (command.startsWith("heading-"))
    return chain.toggleHeading({level: Number(command.at(-1))}).run();

  return chain[`toggle${command.charAt(0).toUpperCase()}${command.slice(1)}`]().run();
};

export interface ToggleButtonProps extends Omit<
  React.ComponentProps<typeof ToggleButton>,
  "onPress"
> {
  command: ToggleCommand;
}
export const ToggleButtonPart = ({children, command, ...props}: ToggleButtonProps) => {
  const {editor, isDisabled, slots} = useRichTextEditor();
  const state = useRichTextEditorState((current) => {
    if (!current) return {active: false, disabled: true};
    const name = command.startsWith("heading-") ? "heading" : command;

    return {
      active: current.isActive(
        name,
        command.startsWith("heading-") ? {level: Number(command.at(-1))} : undefined,
      ),
      disabled: !current.isEditable,
    };
  }) ?? {active: false, disabled: true};
  const label = children ?? command.replace("-", " ");

  return (
    <ToggleButton
      aria-label={typeof label === "string" ? label : command}
      className={slots.button()}
      data-active={state.active || undefined}
      data-slot="rich-text-editor-toggle-button"
      isDisabled={isDisabled || state.disabled}
      isSelected={state.active}
      onPress={() => editor && toggle(editor, command)}
      {...props}
    >
      {label}
    </ToggleButton>
  );
};
export interface ActionButtonProps extends Omit<React.ComponentProps<typeof Button>, "onPress"> {
  action: Action;
}
export const ActionButton = ({action, children, ...props}: ActionButtonProps) => {
  const {editor, isDisabled, slots} = useRichTextEditor();
  const state = useRichTextEditorState((current) => ({
    disabled:
      !current ||
      !current.isEditable ||
      (action === "undo" && !current.can().undo()) ||
      (action === "redo" && !current.can().redo()),
  })) ?? {disabled: true};
  const run = () => {
    const chain: any = editor?.chain().focus();

    if (!chain) return;
    if (action === "undo") chain.undo().run();
    if (action === "redo") chain.redo().run();
    if (action === "clearFormatting") chain.unsetAllMarks().clearNodes().run();
    if (action === "clearContent") chain.clearContent().run();
  };

  return (
    <Button
      aria-label={typeof children === "string" ? children : action}
      className={slots.button()}
      data-slot="rich-text-editor-action-button"
      isDisabled={isDisabled || state.disabled}
      onPress={run}
      {...props}
    >
      {children ?? action}
    </Button>
  );
};
export interface CommandButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "isDisabled" | "onPress"
> {
  onCommand: (editor: Editor) => void | boolean;
  isActive?: boolean | ((editor: Editor) => boolean);
  isDisabled?: boolean | ((editor: Editor) => boolean);
}
export const CommandButton = ({
  children,
  isActive,
  isDisabled,
  onCommand,
  ...props
}: CommandButtonProps) => {
  const {editor, isDisabled: rootDisabled, slots} = useRichTextEditor();
  const state = useRichTextEditorState((current) => ({
    active: !!current && (typeof isActive === "function" ? isActive(current) : !!isActive),
    disabled:
      !current ||
      !current.isEditable ||
      (typeof isDisabled === "function" ? isDisabled(current) : !!isDisabled),
  }));

  return (
    <Button
      aria-pressed={state?.active}
      className={slots.button()}
      data-active={state?.active || undefined}
      data-slot="rich-text-editor-command-button"
      isDisabled={rootDisabled || state?.disabled}
      onPress={() => editor && onCommand(editor)}
      {...props}
    >
      {children}
    </Button>
  );
};

export const Content = ({className, ...props}: any) => {
  const {editor, isDisabled, slots} = useRichTextEditor();

  return (
    <EditorContent
      aria-disabled={isDisabled || undefined}
      className={slots.content({className})}
      data-slot="rich-text-editor-content"
      editor={editor}
      tabIndex={0}
      {...props}
    />
  );
};
export const BubbleMenu = ({children, className, toolbarProps, ...props}: any) => {
  const {editor, slots} = useRichTextEditor();

  return editor ? (
    <TiptapBubbleMenu
      className={slots.bubbleMenu({className})}
      data-slot="rich-text-editor-bubble-menu"
      editor={editor}
      {...props}
    >
      <Toolbar
        className={slots.bubbleMenuToolbar()}
        data-slot="rich-text-editor-bubble-menu-toolbar"
        {...toolbarProps}
      >
        {children}
      </Toolbar>
    </TiptapBubbleMenu>
  ) : null;
};
export const FloatingMenu = ({children, className, toolbarProps, ...props}: any) => {
  const {editor, slots} = useRichTextEditor();

  return editor ? (
    <TiptapFloatingMenu
      className={slots.floatingMenu({className})}
      data-slot="rich-text-editor-floating-menu"
      editor={editor}
      {...props}
    >
      <Toolbar
        className={slots.floatingMenuToolbar()}
        data-slot="rich-text-editor-floating-menu-toolbar"
        {...toolbarProps}
      >
        {children}
      </Toolbar>
    </TiptapFloatingMenu>
  ) : null;
};
export interface SuggestionMenuProps {
  char?: string;
  items: (args: {
    query: string;
    editor: Editor;
    signal: AbortSignal;
  }) => SuggestionItem[] | Promise<SuggestionItem[]>;
  children?: (args: {items: SuggestionItem[]; selectedIndex: number}) => React.ReactNode;
  onSelect?: (args: {editor: Editor; item: SuggestionItem; range: Range}) => void;
  pluginKey?: SuggestionOptions["pluginKey"];
  allowSpaces?: boolean;
  allowedPrefixes?: string[] | null;
  startOfLine?: boolean;
  maxHeight?: number;
}
export const SuggestionMenu = ({
  allowSpaces,
  allowedPrefixes,
  char = "/",
  children,
  items,
  maxHeight,
  onSelect,
  pluginKey = SuggestionPluginKey,
  startOfLine,
}: SuggestionMenuProps) => {
  const {editor, slots} = useRichTextEditor();
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  const [menu, setMenu] = useState<{
    element: HTMLElement;
    props: SuggestionProps<SuggestionItem, SuggestionItem>;
    selectedIndex: number;
  } | null>(null);

  useEffect(() => {
    itemsRef.current = items;
    onSelectRef.current = onSelect;
  }, [items, onSelect]);

  useEffect(() => {
    if (!editor) return;
    let current: SuggestionProps<SuggestionItem, SuggestionItem> | null = null;
    let element: HTMLElement | null = null;
    let selectedIndex = 0;
    let unmount: (() => void) | undefined;
    const render = (
      props: SuggestionProps<SuggestionItem, SuggestionItem>,
      element: HTMLElement,
    ) => {
      current = props;
      selectedIndex = 0;
      setMenu({element, props, selectedIndex});
    };
    const plugin = Suggestion<SuggestionItem, SuggestionItem>({
      allowSpaces,
      allowedPrefixes,
      char,
      editor,
      items: (args) => itemsRef.current(args),
      pluginKey,
      startOfLine,
      command: ({editor: currentEditor, props: item, range}) => {
        item.command?.({editor: currentEditor, range});
        onSelectRef.current?.({editor: currentEditor, item, range});
      },
      render: () => ({
        onStart: (props) => {
          element = document.createElement("div");
          unmount = props.mount(element);
          render(props, element);
        },
        onUpdate: (props) => {
          if (element) render(props, element);
        },
        onKeyDown: ({event}) => {
          if (!current?.items.length) return false;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            selectedIndex =
              (selectedIndex + (event.key === "ArrowDown" ? 1 : -1) + current.items.length) %
              current.items.length;
            setMenu((value) => (value ? {...value, selectedIndex} : value));

            return true;
          }
          if (event.key === "Enter") {
            const item = current.items[selectedIndex];

            if (!item) return false;
            current.command(item);
            exitSuggestion(editor.view, pluginKey);

            return true;
          }
          if (event.key === "Escape") {
            exitSuggestion(editor.view, pluginKey);

            return true;
          }

          return false;
        },
        onExit: () => {
          current = null;
          unmount?.();
          element = null;
          unmount = undefined;
          setMenu(null);
        },
      }),
    });

    editor.registerPlugin(plugin, (newPlugin, plugins) => [newPlugin, ...plugins]);

    return () => {
      unmount?.();
      setMenu(null);
      editor.unregisterPlugin(pluginKey);
    };
  }, [allowSpaces, allowedPrefixes, char, editor, pluginKey, startOfLine]);
  if (!menu?.props.items.length) return null;
  if (children)
    return createPortal(
      children({items: menu.props.items, selectedIndex: menu.selectedIndex}),
      menu.element,
    );

  return createPortal(
    <div
      aria-label="Suggestions"
      className={slots.suggestionMenu()}
      data-slot="rich-text-editor-suggestion-menu"
      role="listbox"
      style={maxHeight === undefined ? undefined : {maxHeight}}
    >
      {menu.props.items.map((item, index) => (
        <button
          key={item.title}
          aria-selected={index === menu.selectedIndex}
          className={slots.suggestionMenuItem()}
          role="option"
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            menu.props.command(item);
            exitSuggestion(editor!.view, pluginKey);
          }}
        >
          {item.icon}
          <span className={slots.suggestionMenuItemContent()}>
            <span>{item.title}</span>
            {item.description ? (
              <span className={slots.suggestionMenuItemDescription()}>{item.description}</span>
            ) : null}
          </span>
        </button>
      ))}
    </div>,
    menu.element,
  );
};
export const Footer = ({children, className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  const {slots} = useRichTextEditor();

  return (
    <div className={slots.footer({className})} data-slot="rich-text-editor-footer" {...props}>
      {children}
    </div>
  );
};
export interface CharacterCountProps {
  showWords?: boolean;
  children?:
    | React.ReactNode
    | ((stats: {characters: number; words: number; isOverLimit: boolean}) => React.ReactNode);
}
export const CharacterCount = ({children, showWords = false}: CharacterCountProps) => {
  const {maxLength, slots} = useRichTextEditor();
  const stats = useRichTextEditorState((current) => {
    const text = current?.getText() ?? "";
    const characters = current?.storage.characterCount?.characters?.() ?? text.length;

    return {
      characters,
      words: current?.storage.characterCount?.words?.() ?? 0,
      isOverLimit: maxLength !== undefined && characters > maxLength,
    };
  }) ?? {characters: 0, words: 0, isOverLimit: false};

  return (
    <span
      className={slots.characterCount()}
      data-over-limit={stats.isOverLimit || undefined}
      data-slot="rich-text-editor-character-count"
    >
      {typeof children === "function"
        ? children(stats)
        : (children ??
          (showWords
            ? `${stats.characters}${maxLength !== undefined ? ` / ${maxLength}` : ""} characters, ${stats.words} words`
            : `${stats.characters}${maxLength !== undefined ? ` / ${maxLength}` : ""}`))}
    </span>
  );
};

export const LinkPopover = ({children}: {children: React.ReactNode}) => {
  const [url, setUrl] = useState("");

  return (
    <LinkContext value={{url, setUrl}}>
      <Popover.Root>{children}</Popover.Root>
    </LinkContext>
  );
};
export const LinkTrigger = ({children, ...props}: any) => {
  const {isDisabled, isReadOnly, slots} = useRichTextEditor();

  return (
    <Button
      aria-label="Link"
      className={slots.button()}
      data-slot="rich-text-editor-link-popover-trigger"
      isDisabled={isDisabled || isReadOnly}
      {...props}
    >
      {children ?? "Link"}
    </Button>
  );
};
export const LinkContent = ({children}: {children: React.ReactNode}) => {
  return (
    <Popover.Content>
      <Popover.Dialog aria-label="Link">{children}</Popover.Dialog>
    </Popover.Content>
  );
};
export const LinkInput = (props: any) => {
  const {isDisabled, isReadOnly, slots} = useRichTextEditor();
  const context = useContext(LinkContext);

  return (
    <Input
      aria-label="Link URL"
      className={slots.linkInput()}
      disabled={isDisabled || isReadOnly}
      placeholder="https://example.com"
      value={context?.url ?? ""}
      onChange={(event: any) => context?.setUrl(event.target.value)}
      {...props}
    />
  );
};
export const LinkActions = ({children}: {children: React.ReactNode}) => {
  const {slots} = useRichTextEditor();

  return (
    <div className={slots.linkActions()} data-slot="rich-text-editor-link-actions">
      {children}
    </div>
  );
};
export const ApplyButton = ({children, ...props}: any) => {
  const {editor, isDisabled} = useRichTextEditor();
  const context = useContext(LinkContext);

  return (
    <Button
      isDisabled={isDisabled || !editor?.isEditable || !context?.url}
      onPress={() =>
        context?.url &&
        (editor as any)?.chain().focus().extendMarkRange("link").setLink({href: context.url}).run()
      }
      {...props}
    >
      {children ?? "Apply"}
    </Button>
  );
};
export const UnsetButton = ({children, ...props}: any) => {
  const {editor, isDisabled} = useRichTextEditor();
  const isActive =
    useRichTextEditorState((current) => !!current?.isEditable && current.isActive("link")) ?? false;

  return (
    <Button
      isDisabled={isDisabled || !isActive}
      onPress={() => (editor as any)?.chain().focus().unsetLink().run()}
      {...props}
    >
      {children ?? "Remove"}
    </Button>
  );
};
