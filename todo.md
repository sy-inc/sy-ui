# todo.md — 按 4d_platform `docs/note/sy-ui-gaps.md` 核实后补齐 sy-ui 侧成立的缺口

纪律：最小改动；遵守 `skills/sy-inc-create-component`（styles 放 `packages/styles`，React 不维护本地 styles；BEM 类名静态完整；变更公共契约要同步 story、测试、中英文 MDX）；不新建顶层组件，不改 meta.json，不做 4d_platform 侧任何文件。

> 每项验收跑过后，立即把该项 `- [ ]` 改为 `- [x]` 并在行尾附跑过的那条证据，再开始下一项。不用内置任务追踪器代替本文件的勾选。

## 已确认口径（2026-09-07 拍板，写码前定案）

gaps 文档 8 条核实结论（不成立的不做）：

- 第 2 条 i18n：不成立。"Select an item" 来自 React Aria 自带多语言表，`@sy-inc/react` 已导出 `I18nProvider`。库侧不动。
- 第 5 条 Select 短写法：不做。compound 是规范刻意选择，便利层留在业务侧 `FormSelect`。
- 第 7 条 Suffix 对齐：库侧无问题（input-group `min-h-9`，Button sm 桌面 `h-8`，Suffix `h-full`）。业务侧改用 Suffix 或行容器 `items-end`。
- 第 6 条：`validationErrors` 不是 TextField 的 prop，文档写错；不写 react-hook-form 指南。
- 4d_platform 的 gaps 文档本轮不动。

第 1 条密码切换，拍板：库侧加 `InputGroup.PasswordToggle`。

- 状态由 `InputGroup` 根用 `useState` 托管，经 `InputGroupContext` 下发 `passwordVisible` + `togglePasswordVisible`；消费方零状态，仅非受控（不提供 `isVisible/onVisibleChange`）。
- `InputGroup.Input` 收到 `type="password"` 且 `passwordVisible` 为 true 时渲染 `type="text"`；其他 type 完全不受影响。
- `PasswordToggle` 只渲染一个 `Button`（复用 `../button`，`isIconOnly size="sm" variant="ghost"`），消费方自己放进 `<InputGroup.Suffix>`。不自带 Suffix 外壳，不新增 CSS 类。
- aria-label 硬编码英文 `"Show password"` / `"Hide password"`，接受 `showLabel` / `hideLabel` prop 覆盖。不引入 intl 字典。
- 图标：`icons.tsx` 已有 `EyeIcon`，新增内联 `EyeSlashIcon`，不加图标依赖。

第 4 条 TextArea 自动增高，拍板：显式 `autoGrow` prop，默认 `false`，实现为 `.textarea--auto-grow { field-sizing: content }`。只改 `TextArea`，`InputGroup.TextArea` 不动。Safari 不支持 `field-sizing` 时退化为原行为（`rows` 兜底），不做 JS polyfill。

第 3 条文件选择，拍板：只在 `rac/components.tsx` 再导出 React Aria 的 `FileTrigger`，不做 `FileField`；在 drop-zone 中英文 MDX 加一小节说明。

第 8 条，拍板：`variant` 已通过 context 下发到 Input/TextArea/InputGroup，无需改码。`fullWidth` 的 CSS 后代选择器漏了 `[data-slot="input-group"]`，补上；text-field 中英文 MDX 补一句说明。

文档范围：修 `validationErrors` 错行、drop-zone 加 FileTrigger 说明、text-field 加 variant/fullWidth 下发说明。不新建指南页。

## 清单

### A. FileTrigger 再导出

- [x] `packages/react/src/components/rac/components.tsx` — 再导出 `FileTrigger` — 在现有 `export {Collection, ListBoxLoadMoreItem, RouterProvider, I18nProvider}` 里加 `FileTrigger`（`rac/index.ts` 的同名再导出也一并加上，否则出不到包外） — 验收：`pnpm build --filter=@sy-inc/react` 零报错。原定的 `grep dist/index.d.ts` 判据不成立（该文件只是 5 行 barrel，不内联类型），改用 `grep -rn "FileTrigger" packages/react/dist/` → `dist/index.js:50` 与 `dist/components/rac/index.d.ts:3` 均命中

- [x] `apps/docs/content/docs/en/react/components/(forms)/drop-zone.mdx` 与 `cn/.../drop-zone.mdx` — 加一小节 "Standalone file picker / 独立文件选择" — 说明 `FileTrigger` 可从 `@sy-inc/react` 直接导入，配合 `Button` 使用，附 6 行以内代码块（`<FileTrigger onSelect={...}><Button>Choose file</Button></FileTrigger>`），不新建 demo 文件 — 验收：`pnpm typegen:docs` 零报错（`✓ Types generated successfully`）；`grep -n "Standalone file picker"` → en:150，`grep -n "独立文件选择"` → cn:148

### B. TextArea `autoGrow`

- [x] `packages/styles/components/textarea.css` + `packages/styles/src/components/textarea/textarea.styles.ts` — 加 `autoGrow` variant — CSS 末尾加 `.textarea--auto-grow { field-sizing: content; }`；styles.ts 的 `variants` 加 `autoGrow: {false: "", true: "textarea--auto-grow"}`，`defaultVariants` 加 `autoGrow: false` — 验收：`pnpm build --filter=@sy-inc/styles` → `2 successful`；`grep -c "textarea--auto-grow" packages/styles/components/textarea.css` → 1

- [x] `packages/react/src/components/textarea/textarea.tsx` — 透传 `autoGrow` 到 variants — `TextAreaRoot` 解构 `autoGrow` 并传入 `textAreaVariants({autoGrow, fullWidth, variant})`（类型经 `TextAreaVariants` 自动带上） — 验收：`packages/react/tests/components/textarea/textarea.test.tsx` 新增用例 "exposes autoGrow BEM modifier"：Given `<TextArea autoGrow>`，Then className 含 `textarea--auto-grow`；反例：不传时 className 不含该类。`pnpm --filter @sy-inc/react exec vitest run textarea` → `Tests 7 passed (7)`

- [x] `packages/react/src/components/textarea/textarea.stories.tsx` — 加 `AutoGrow` story — `render: () => <TextArea autoGrow fullWidth placeholder="Grows with content" rows={1} />`，容器 `w-[280px]` — 验收：`pnpm typecheck` → `5 successful, 5 total`

- [x] `apps/docs/src/demos/en/textarea/auto-grow.tsx`、`cn/textarea/auto-grow.tsx` 及各自 `index.ts` 注册，`apps/docs/content/docs/en/react/components/(forms)/text-area.mdx`、`cn/.../text-area.mdx` — 文档 `autoGrow` — demo 同 story；MDX 在 Examples 加 "Auto Grow / 自动增高" 一节引用 `<ComponentPreview name="textarea-auto-grow" />`，API 表加一行 `autoGrow | boolean | false | Grows with content (field-sizing: content); falls back to rows where unsupported` — 验收：`pnpm typegen:docs` → `✓ Types generated successfully`；两个 index.ts 各注册（en/cn `demos` map + 组件 barrel）；en mdx 52/130 行、cn mdx 52/129 行均命中。**待人工**：浏览器里打字增高

### C. `InputGroup.PasswordToggle`

- [x] `packages/react/src/components/icons.tsx` — 加 `EyeSlashIcon` — 紧邻 `EyeIcon` 之后，同样的 `IconProps` 签名、`aria-hidden`、16px、`currentColor` 内联 svg — 验收：`pnpm typecheck` → `5 successful, 5 total`

- [x] `packages/react/src/components/input-group/input-group.tsx` — 加密码可见状态与 `InputGroupPasswordToggle` — `InputGroupContext` 加 `passwordVisible?: boolean; togglePasswordVisible?: () => void`；`InputGroupRoot` 内 `useState(false)` 并放进 context value；`InputGroupInput` 解构 `type`，渲染 `type={type === "password" && passwordVisible ? "text" : type}`；新增 `InputGroupPasswordToggle({showLabel = "Show password", hideLabel = "Hide password", className, ...props})` 渲染 `<Button isIconOnly size="sm" variant="ghost" aria-label={visible ? hideLabel : showLabel} data-slot="input-group-password-toggle" onPress={togglePasswordVisible}>{visible ? <EyeSlashIcon/> : <EyeIcon/>}</Button>`；导出组件与 `InputGroupPasswordToggleProps` — 验收：`packages/react/tests/components/input-group/input-group.test.tsx` 新增用例 "toggles password visibility"：Given `<InputGroup><InputGroup.Input type="password"/><InputGroup.Suffix><InputGroup.PasswordToggle/></InputGroup.Suffix></InputGroup>`，When 点击 name 为 "Show password" 的按钮，Then input `type` 变为 `text` 且按钮 name 变为 "Hide password"，再点回到 `password`；反例：`<InputGroup.Input type="email"/>` 旁放 PasswordToggle 点击后 type 仍为 `email`。`pnpm --filter @sy-inc/react exec vitest run input-group` → `Tests 10 passed (10)`

- [x] `packages/react/src/components/input-group/index.ts` — 挂到 compound 并导出类型 — `Object.assign` 加 `PasswordToggle: InputGroupPasswordToggle`；`InputGroup` 类型加 `PasswordToggleProps`；named export 与 type re-export 各加一项 — 验收：`pnpm build --filter=@sy-inc/react` → `2 successful`；同 A 项，dist/index.d.ts 是 barrel，实际判据 `grep -n "InputGroupPasswordToggle" packages/react/dist/components/input-group/index.d.ts` → 2/9/18 行命中

- [x] `packages/react/src/components/input-group/input-group.stories.tsx` — 现有 password 相关 story 改用 `InputGroup.PasswordToggle`（若无则加 `PasswordToggle` story） — 去掉 story 内 `useState` 和手写 type 切换 — 验收：`pnpm typecheck` → `5 successful`；`eslint src/components/input-group` → 0 errors 0 warnings

- [x] `apps/docs/src/demos/en/input-group/password-with-toggle.tsx`、`cn/input-group/password-with-toggle.tsx` — demo 改用新 part — 删 `useState`、`@gravity-ui/icons` 导入和手写 type；改为 `<InputGroup.Input type="password" defaultValue="87$2h.3diua"/>` + `<InputGroup.Suffix className="pe-0"><InputGroup.PasswordToggle/></InputGroup.Suffix>` — 验收：`pnpm typegen:docs` → `✓ Types generated successfully`；cn demo 传 `showLabel`/`hideLabel` 保留中文无障碍名。**待人工**：页面点眼睛图标明文/密文切换

- [x] `apps/docs/content/docs/en/react/components/(forms)/input-group.mdx`、`cn/.../input-group.mdx` — 文档新 part — Anatomy 加 `InputGroup.PasswordToggle`；"Password Toggle" 小节文字改为说明内建 part；Composition Components 加 "InputGroup.PasswordToggle Props" 表（`showLabel`、`hideLabel`、`className`，说明须放在 `InputGroup.Suffix` 内且 Input 需 `type="password"`）；Styling Reference 的 data-slot 列表加 `input-group-password-toggle` — 验收：`grep -n "InputGroup.PasswordToggle\|input-group-password-toggle"` 两个语言均命中 32/112/266/325/371 行（Anatomy、Password Toggle 小节、data-slot、Composition 列表、Props 表）

### D. TextField `fullWidth` 覆盖 InputGroup

- [x] `packages/styles/components/textfield.css` — `.textfield--full-width` 内的后代选择器加 `[data-slot="input-group"]` — 与现有 `[data-slot="input"], [data-slot="textarea"]` 并列 — 验收：`packages/react/tests/components/textfield/textfield.test.tsx` 不可测 CSS，改用命令：`grep -c 'data-slot="input-group"' packages/styles/components/textfield.css` → 1；`pnpm build --filter=@sy-inc/styles` → `2 successful`。**待人工**：Storybook `Components/Forms/InputGroup` 的 Full Width 场景下仅 TextField 传 `fullWidth` 时 group 撑满

### E. text-field 文档修正

- [x] `apps/docs/content/docs/en/react/components/(forms)/text-field.mdx`（第 169 行）与 `cn/.../text-field.mdx`（第 167 行） — 删除错误的 `validationErrors` prop 行；在 `fullWidth`/`variant` 表行的描述末尾补一句 "Propagates to Input, TextArea and InputGroup children; no need to repeat it on the child" / 中文对应 — 验收：`grep -c "validationErrors"` en → 0、cn → 0；`pnpm typegen:docs` → `✓ Types generated successfully`。注：两个页面原本都没有 `variant` 表行，一并补上（TextField 确实经 `TextFieldContext` 下发 variant）

### F. 收尾验证

- [x] 仓库根目录 — 全量校验 — `pnpm lint && pnpm typecheck && pnpm build` — 验收：`pnpm lint` → `3 successful`（仅既有 warning，0 error）；`pnpm typecheck` → `5 successful`；`pnpm build` → `2 successful`；`vitest run textarea input-group textfield` → `Tests 30 passed (30)`。`pnpm test` 全量 1093/1095：两处失败均与本轮无关 —— `sidebar.browser` 在 `git stash` 后的干净树上同样失败（既有问题）；`carousel` autoplay 计时用例在并发满载下偶发，单独重跑 3 次均 45/45

## 不做，仅记录

- `InputGroup.TextArea` 的 `autoGrow`：等有消费者再加。
- `PasswordToggle` 受控模式（`isVisible/onVisibleChange`）：无消费者。
- 其余硬编码 aria-label（drop-zone "Select files"、tag "Remove tag"、close-button "Close" 等）的本地化：需要先建 intl 字典基础设施，单独立项。
- react-hook-form 指南页：业务侧 `isInvalid={!!error}` + `<FieldError>{msg}</FieldError>` 已是正确姿势。
- 4d_platform `docs/note/sy-ui-gaps.md` 同步：第 2/5/7 条应删或改写为"根上包 `I18nProvider`"，留给 4d 侧处理。
