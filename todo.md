# todo.md — 2026-08-31 起新增组件的 compound 与 BEM 整改交接

审计日期：2026-09-09。执行日期：2026-09-09。
范围：`packages/styles/components/` 中 8 月 31 日起新增的 33 个 CSS 文件及其对应的 `packages/react/src/components/<name>/`。

规范来源：`CLAUDE.md` 的 Compound Component Pattern、BEM 命名、Default Size Pattern、Pseudo-Class Fallback Pattern。

---

## 剩余待办

### A2. cell-switch、cell-slider — 二选一（本轮跳过，需产品定夺）

- 文件：`packages/react/src/components/cell-switch/cell-switch.tsx`、`cell-slider/cell-slider.tsx`
- 现状：`badge` / `description` / `label` prop 内部拼装，同族的 `cell-select`、`cell-color-picker` 都是 compound。
- 方案甲（推荐，最少代码）：删除两个组件，文档指向 `<Switch variant="cell">` 与 `<Slider variant="cell">` 直接组合；`cell-switch.css`、`cell-slider.css` 中真正需要的差量并入 switch.css / slider.css 的 `--cell` 变体。对外破坏性变更。
- 方案乙：补齐部件（CellSwitch.Copy / Badge；CellSlider.Label / Output），与 cell-select 对齐。
- 连带未做：
  - A4 导出补齐 `cell-switch/index.ts`、`cell-slider/index.ts`（等方案确定后一起做）
  - B2-4 中 `cell-switch.css:12`、`:36` 两处 `.cell-switch .switch__content` 跨块选择器（方案甲会连文件一起删）

### A3. 暂不动，仅记录

- `countdown`：segment / value / digit / glyph / label / accessible-text 全内部渲染，结构由时间单位循环生成；等出现样式覆盖需求再拆 `Countdown.Segment` / `Label`。
- `overflow-text`：viewport / content 两层内部渲染，叶子文本组件；等有重排需求再拆。
- `file-tree`：Root / Item / Section / Header / Indicator 已导出，但 `Item` 用 `title` / `icon` / `indicator` / `selection` 四个 prop 拼装。受 React Aria `TreeItemContent` render props 约束，属于折中；有需求再拆。

### 有意保留的例外

- `message-bubble.css` 链接焦点环用 `outline: 2px solid currentColor`，不收敛到 `status-focused`：链接位于 sent 气泡派生的 accent 表面上，只有文字色在两套主题下都保证对比度。已在 CSS 内注明。
- `input-phone.css` 的 `[data-slot="list-box-item"]` 行布局与 `[role="presentation"]` 虚拟化补丁保留为 slot 选择器：前者是本列表特有的排版组合而非 ListBoxItem 的 token，后者是 React Aria Virtualizer 的既有 workaround。均已在 CSS 内注明。

---

## 验证

- `pnpm lint`、`pnpm typecheck`：0 error。
- `pnpm test`：1100 项中 1099 通过。唯一失败是 `marquee` / `carousel` 的计时用例，在全量并行下随机失败、单独运行通过，且两个文件本轮未改动（已用 `git stash` 对照确认为既有 flake）。

## 已核实无问题、无需处理

compound：rating、checkbox-button-group、radio-button-group、kpi、kpi-group、cell-select、cell-color-picker、item-card、item-card-group、marquee、drop-zone、widget、timeline、prompt-input、chat-message、list-view、pressable-feedback、resizable、input-phone、text-shimmer、sheet、rich-text-editor、segment、message-list、message-bubble。
BEM 样板：timeline、file-tree、pressable-feedback、rating、countdown、marquee。
