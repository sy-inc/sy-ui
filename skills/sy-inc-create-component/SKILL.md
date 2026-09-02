---
name: sy-inc-create-component
description: Create or evolve public components inside the SY INC v3 React library. Use when asked to scaffold, implement, style, test, document, export, or change the public API or behavior of a component under packages/react. Do not use for consuming SY INC components in an app or for v2 migration.
---

# Create or evolve a SY INC v3 component

只处理 SY INC v3 组件库内部的公开组件开发和维护。不要包含安装教程、页面搭建或 v2 迁移内容。

## 开始前

1. 阅读仓库根目录的 `AGENTS.md`，它是当前约束的最终依据。
2. 判断任务类型：
   - 新组件：将组件名确定为 PascalCase，例如 `DateRangePicker`；目录名使用 kebab-case，例如 `date-range-picker`，并确认它尚不存在。
   - 修改已有组件：不要运行脚手架；先读取当前实现、styles、stories、tests、双语 docs 和公开 exports，确认现有公共契约。
3. 检查最接近的现有 v3 组件。优先复用现有 primitive、context、tester 和公共子组件。
4. 明确本次公共契约：公开 parts、props、默认值、variants、事件、ref、键盘行为、无障碍语义和 `data-*` hooks。
5. 不要复制旧版 API，也不要引入 v2 的 Provider、`@sy-inc/theme`、`@sy-inc/system` 或 `framer-motion` 模式。
6. 常规组件开发直接完成，不默认委派给 `.claude/agents`。只有实际出现 Tailwind CSS v4 编译或语法问题时才读取 `.claude/guides/tailwindcss-v4-css-guide.md`；只有问题仅在 Storybook 浏览器环境复现时才执行 Storybook 视觉调试。发生冲突时，以 `AGENTS.md` 和当前代码为准。

## 新组件使用脚手架

仅新组件必须从 `packages/react` 运行现有脚手架，并传入 PascalCase 名称：

```bash
cd packages/react
pnpm add:component ComponentName
```

脚手架只生成 React 目录骨架并更新 React 组件总出口，不代表组件已经完成。按组件实际职责检查并补齐以下结构：

```text
packages/react/src/components/<slug>/
  <slug>.tsx
  <slug>.stories.tsx
  index.ts

packages/styles/src/components/<slug>/
  <slug>.styles.ts

packages/styles/components/<slug>.css

packages/react/tests/components/<slug>/
  <slug>.test.tsx
  <slug>.ssr.test.tsx       # 按风险需要
  <slug>.browser.test.tsx   # overlay、portal 或高风险交互才需要
  fixtures.tsx              # 多层测试共享 JSX 时才需要

apps/docs/content/docs/en/react/components/**/<slug>.mdx
apps/docs/content/docs/cn/react/components/**/<slug>.mdx
```

新顶层组件需要独立 Story、行为测试和双语文档。由父组件完整覆盖的公开 part 可以复用父级 Story、测试和文档；透明的 React Aria passthrough 如果没有视觉样式或 variants，不要为了满足目录结构制造空的 styles 或 CSS 文件。

同时检查这些出口或清单：

- `packages/react/src/components/index.ts`
- `packages/styles/src/components/index.ts`（直接 `export * from "./<slug>/<slug>.styles"`，styles 组件目录不放 `index.ts` 桶文件）
- `packages/styles/components/index.css`
- 英文和中文组件文档目录中的 `meta.json`
- `apps/docs/scripts/check-component-docs.mjs` 的覆盖范围；如果守卫仍使用显式组件清单，将新公开组件注册进去并更新对应测试

当前 v3 组件从 `@sy-inc/styles` 导入 variants。脚手架生成的本地 `<slug>.styles.ts` 只是初始模板；按照相邻组件的当前模式，将正式 variants 放进 `packages/styles`，不要维护两份实现，也不要从 React 实现直接导入组件 CSS。

构建后确认组件、公开 Props 类型和 variants 能从预期的 `@sy-inc/react`、`@sy-inc/styles` 入口导入；如果项目提供组件 subpath export，也确认生成的 package export 存在。

## React 实现约束

- 每个公开组件实现 `.tsx` 文件顶部写 `"use client"`。
- 可交互组件优先基于 React Aria Components，并保留其 props、render props、ref、键盘行为和无障碍语义。
- React Aria render-prop 组件的 `className` 使用 `composeTwRenderProps`；字符串 slot 使用 `composeSlotClassName`，不要自行拼接或绕过 `tailwind-variants` 的合并。
- 自己渲染公开 DOM 的 part 必须提供稳定 `data-slot`；纯 provider、行为适配器和复用已有公共 part 的包装器可以继承底层 slot。值使用 kebab-case，通常为 `<component>` 或 `<component>-<part>`；细分 modifier 可以使用 `--modifier`。TV slot 只为具有独立样式接缝的 DOM part 建立，不要求与公开 part 一一对应。只有承诺为外部样式或测试接口的 slot 才必须文档化；修改已发布的 slot 名视为公共契约变化。
- 多个可组合 part 只有在需要共享 variants、状态或行为时才使用 context，不要仅因为存在多个 part 就创建 context。
- Compound component 沿用当前 barrel 模式，保留 `Object.assign` 入口、Root/parts named exports 和公开 Props/PartProps 类型；仅在存在公开样式 variants 时 re-export variants。
- 只有需要稳定 DevTools 名称的包装器或匿名组件才显式设置 display name；一旦设置，使用 `SY INC.ComponentName` 或 `SY INC.Component.Part`。
- 复用已有的 `Label`、`Description`、`FieldError` 等公共组件，不创建组件专属副本。
- 意图、状态和层级 variant 轴使用语义化名称；形状、位置和视觉处理轴可以使用 `outline`、`blur`、`floating` 等结构名称。禁止公开原始色板名称，也不要在同一个轴中混合无关维度。

## 样式约束

- 有视觉样式或 variants 的组件使用 `tv()`，直接从 `tailwind-variants` 导入；不要手动调用 `twMerge`。透明 passthrough 可以没有 variants。
- 具体视觉声明放在 `packages/styles/components/<slug>.css`；`packages/styles/src/components/<slug>/<slug>.styles.ts` 只映射静态 BEM 类名、slots、variants 和默认值。React 实现从 `@sy-inc/styles` 导入，不维护本地正式 styles，也不直接导入组件 CSS。
- variants 只输出完整、静态可扫描的类名；禁止动态拼接 Tailwind 类名。
- CSS 使用 BEM：`block`、`block__element`、`block--modifier`。一个组件文件可以包含多个有独立语义的 block，不要把所有公开 part 机械改成同一 root 的 element。
- 默认尺寸必须写在实际承载尺寸的基础 block 或 slot 中；默认尺寸 modifier 可以为空，确保未传 `size` 时仍有正确尺寸。
- 只有同一个实际交互节点同时支持浏览器伪类和 React Aria data 状态时才配对，例如 `:hover` 与 `[data-hovered="true"]`、`:active` 与 `[data-pressed="true"]`。对于由子级传播、虚拟化包装器或仅由 React Aria 发出的状态，使用真实可观察的 selector，不要机械添加无效 fallback。
- 普通焦点环默认配对 `:focus-visible` 与 `[data-focus-visible="true"]`，并使用 `status-focused`。不要使用 `:focus:not(:focus-visible)` 或无法匹配的 `:focus-visible:not(:focus)`：

  ```css
  &:focus-visible,
  &[data-focus-visible="true"] {
    @apply status-focused;
  }
  ```
- 连续、内嵌或跨多个子元素的特殊焦点几何可以使用 `var(--focus)` 自定义，但必须保留 keyboard-visible 语义。disabled 和 pending 状态优先复用 `status-disabled`、`status-pending`。
- 自定义 `transition` 或 `animation` 必须提供 `motion-reduce:*` 或 `prefers-reduced-motion` 降级。使用自定义 `transition:` 时，将 `motion-reduce:transition-none` 写在 transition 声明之后，保留覆盖顺序。优先复用现有 easing 和 motion token，不要为所有动画规定同一个 duration。
- 在 `packages/styles/components/index.css` 注册 CSS 时保留依赖顺序：共享 primitive 必须先于覆盖它们的复合组件；不要简单按字母排序。
- 颜色和 surface 优先消费现有语义 token，不创建组件私有的语义色板。承载内容的新 background 或 surface token 必须配套 foreground token；需要子级随表面自适应时复用现有 `SurfaceContext`。
- 组件派生变量默认保留在本地 CSS，并使用组件或 family 前缀；只有跨模块语义或主题作者需要统一控制的能力才提升为全局 token。
- 禁止硬编码表达主题语义的颜色。颜色可视化、透明棋盘格、mask 和非语义光学阴影可以使用必要的颜色字面量。

## Storybook 和测试

- 新顶层组件必须有独立 Storybook Story，标题使用 `Components/ComponentName`，并只覆盖组件实际具备的默认状态、主要 variants、sizes、disabled 和关键交互。由父组件完整覆盖的公开 part 可以复用父级 Story。
- 每个顶层公开组件至少有 jsdom 行为覆盖；`AGENTS.md` 明确的 parent-covered part 不要求独立 suite。SSR 和 browser 测试按 `AGENTS.md` 的风险规则添加。
- 测试工具从 `@sy-inc/testing/helpers` 导入；browser render 从 `@sy-inc/testing/browser` 导入。
- 优先使用 role、label、text 查询。断言公开语义、回调、焦点、键盘行为、SY INC `data-*` hooks 和必要的 `data-slot`，不要断言完整 class 列表或 React Aria 内部实现。
- 无法由 jsdom 可靠验证的 portal、焦点圈闭、定位、滚动和浏览器布局行为必须使用 browser 测试；已由共享 overlay 或父模块完整覆盖的行为不要重复建立 suite。

## 修改已有组件

- 纯内部重构且公共契约与可观察行为不变：运行现有定向测试；只有发现契约覆盖缺口时才补强测试，不要为了制造改动而修改测试或文档。
- Props、公开 parts、默认值、variants、事件、焦点/键盘行为、无障碍语义或视觉行为发生变化：只同步受影响的类型、Story、测试和双语 MDX；不要求修改未受影响的产物。
- 破坏兼容性的修改必须由用户明确要求，并补充适用的 migration 或 release 说明；不要静默移除旧 API。

## 文档

- 每个新顶层公开组件必须添加对应的英文和中文 MDX；由父组件完整覆盖的公开 part 可以记录在父级文档中。文档 slug 和分类遵循相邻组件及现有导航，不要求机械等于实现目录名。修改组件时，按公共契约和可观察行为是否变化决定是否更新。
- 英文 MDX 是组件文档的主要事实来源，中文内容与其语义保持一致。
- 按组件实际能力记录用途、import、基础示例、anatomy、props 与默认值、variants、events、accessibility 和常见组合。只在确有迁移价值时记录 HeroUI 或旧版差异。
- 示例必须可运行，并与当前 exports、类型和实现一致；不要记录尚未实现的 API。
- 将两个语言版本注册到各自组件目录的 `meta.json`。

## 验证

按变更范围分层验证；不得用某一层成功替代另一适用层。

实现、样式或 exports 发生变化时，先运行组件定向测试并从仓库根目录构建组件包：

```bash
pnpm --filter @sy-inc/react exec vitest run <slug>
pnpm build
```

新增顶层公开组件或修改文档导航、覆盖范围时，验证文档覆盖：

```bash
pnpm check:component-docs
```

如果修改了覆盖守卫，同时运行其定向测试：

```bash
pnpm --filter @sy-inc/docs test:component-docs
```

修改双语文档时，生成并检查两个语言版本；`pnpm build` 只构建 styles 和 React，不能替代这些检查：

```bash
pnpm typegen:docs
pnpm typegen:docs-cn
pnpm typecheck:docs
pnpm typecheck:docs-cn
pnpm build:docs
pnpm build:docs-cn
```

文档构建若因缺少项目外部环境变量停止，报告准确的环境阻塞和已通过的检查；不要把环境问题伪装成成功，也不要把真实的 MDX、类型或构建错误归因于环境。

新增公开组件，或修改其文档、源码、样式和 exports 时，确认使用者 skill 能从本地仓库发现当前结果：

```bash
node skills/sy-inc-react/scripts/list_components.mjs
node skills/sy-inc-react/scripts/get_component_docs.mjs ComponentName
node skills/sy-inc-react/scripts/get_source.mjs ComponentName
node skills/sy-inc-react/scripts/get_styles.mjs ComponentName
```

这些查询应解析到当前仓库；不要以远端 fallback 的旧内容作为本地修改的验收依据。

准备合并时执行完整门禁：

```bash
pnpm lint
pnpm typecheck
pnpm test
```

只有受本次变更影响的实现、styles、公开 exports、Storybook、测试、双语文档、导航、覆盖守卫、本地 skill 可发现性和验证均已同步，才能把任务视为完成。准备合并时必须通过完整门禁；任何适用但未执行或受环境阻塞的检查必须明确报告。
