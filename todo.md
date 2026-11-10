# todo：Sidebar 菜单的选中指示器 + 悬停块（滑动背景）

本轮：在 `Sidebar.Content` 内给 MenuButton / MenuSubButton 加两层滑动背景（选中指示器、悬停块），复用 React Aria `SharedElementTransition` 与 `rac/selection-indicator.tsx` 的内联样式残留补丁；补 story 与浏览器测试。

纪律：最小改动；不引入 motion；默认开启、不加开关；不做任何 git 写操作（用户自己提交）；术语以 `CONTEXT.md` 的「Sidebar」节为准（滑动范围 / 选中指示器 / 悬停块）。

> 每项验收跑过后，立即把该项 `- [ ]` 改为 `- [x]` 并在行尾附跑过的那条证据，再开始下一项。不用内置任务追踪器代替本文件的勾选。

## 已确认口径（2026-11-10 拍板，写码前定案）

1. **Header/Footer 里的菜单按钮**：不在滑动范围内，不渲染指示器，保留现有静态 `:hover` / `data-active` 背景。理由：RAC `SharedElement` 离开 `SharedElementTransition` 会抛错；既有行为不变。
2. **悬停块淡出边界**：指针离开 `Sidebar.Content` 才淡出（与滑动范围同一边界）。在菜单项之间的空隙、分组标签上不淡出。
3. **子菜单裁剪**：仅在 sidebar.css 内覆盖菜单里的 `.disclosure__content`：展开且高度动画结束后改 `overflow: visible`（`overflow 0s 200ms allow-discrete` 延迟切换），收起时立即恢复 `clip`。不支持离散过渡的浏览器退化为展开即放开，可接受。
4. **按钮裁剪**：去掉 `.sidebar__menu-button` / `.sidebar__menu-sub-button` 的 `overflow-hidden`；span 标签仍靠自身 `truncate`。已知代价：不包 span 的纯文本超长标签不再被按钮裁切。
5. **补丁复用方式**（技术决定）：把 `rac/selection-indicator.tsx` 里的清理逻辑抽成同文件内的私有 hook，再从该文件额外导出打了同一补丁的 `SharedElement`；`SelectionIndicator` 行为不变，Tabs / Segment / BottomBar 不改。
6. **悬停状态存放**（技术决定）：`Sidebar.Content` 持有一个极小的外部 store（get/set/subscribe），每个按钮用 `useSyncExternalStore` 只订阅「是不是我」。理由：sidebar.tsx 现有注释明确避免一次状态变化重渲染全部菜单项；普通 context + useState 会让每次 hover 重渲染所有按钮。
7. **指示器放置**：两层都作为按钮的**最后**子元素渲染（悬停块在前、选中指示器在后，选中盖在悬停之上）；`start-0 top-0 size-full`（百分比尺寸，才能从快照 px 过渡回来；`inset-0` 的 auto 尺寸不会过渡）；`z-index: -1` + 按钮 `relative isolate`。
8. **颜色**：选中指示器沿用现有 `bg-surface-hover`；悬停块用 `bg-surface-hover/50`（更淡）。只在 story 里目测，不写颜色断言。
9. **减少动态效果**：两层都 `motion-reduce:transition-none`（写在 transition 之后）。transition-property 为 none 时 RAC 不存快照，新位置直接出现，即「跳到目标位置」。
10. **触屏 / 键盘**：悬停只由 RAC `onHoverStart` 写入（它本身忽略 touch 与触摸后的模拟鼠标事件）；键盘焦点不写悬停状态，焦点环不动。

## 清单

- [x] `packages/react/src/components/rac/selection-indicator.tsx` — 抽出补丁并导出打补丁的 `SharedElement` — 把现有 `useLayoutEffect(() => () => {...})` 清理体抽成私有 `useClearLeakedTransitionStyles(elementRef)`；`SelectionIndicator` 改为调用它；新增 `SharedElement = ({ref, ...props}: ComponentPropsWithRef<typeof SharedElementPrimitive>)`，用同一 hook + `mergeRefs` 包 `react-aria-components/SharedElementTransition` 的 `SharedElement`，`displayName = "SY INC.SharedElement"`，与 `SelectionIndicator` 一并导出 — 验收：`pnpm --filter @sy-inc/react exec vitest run tabs segment bottom-bar` 全绿（含 browser 项目），补丁对既有消费者行为不变。 ✅ 证据：`vitest run tabs segment bottom-bar` → Test Files 8 passed (8), Tests 53 passed (53)（含 tabs/bottom-bar browser）

- [x] `packages/styles/src/components/sidebar/sidebar.styles.ts` — 加两个 slot — `menuHoverIndicator: "sidebar__menu-hover-indicator"`、`menuSelectionIndicator: "sidebar__menu-selection-indicator"` — 验收：`pnpm --filter @sy-inc/styles typecheck`（或该包 build）零报错。 ✅ 证据：`pnpm --filter @sy-inc/styles typecheck` → `tsc --noEmit` 无输出、无报错

- [x] `packages/react/src/components/sidebar/sidebar.tsx` — `Sidebar.Content` 改为真实组件，提供滑动范围 — 用 `SidebarHoverContext`（值为 `createHoverStore()` 返回的 `{get, set, subscribe}`，`useState(createHoverStore)` 惰性创建）包裹 children，并在内部套 `<SharedElementTransition>`；外层仍是 `dom.div` + `slotClass("content", className)` + `data-slot="sidebar-content"`，`onPointerLeave` 里 `store.set(null)` 后调用使用方的 `onPointerLeave`；props 类型保持 `SidebarPartProps<"div">` 原样，`displayName` 不变 — 验收：`pnpm --filter @sy-inc/react exec vitest run sidebar.test sidebar.ssr` 现有用例全绿（fixture 的 Header 里有 MenuButton，证明范围外不抛错）。 ✅ 证据：`vitest run sidebar.test sidebar.ssr` → Test Files 2 passed (2), Tests 31 passed (31)

- [x] `packages/react/src/components/sidebar/sidebar.tsx` — `SidebarControl` 渲染两层指示器（MenuButton / MenuSubButton 的汇聚层）— `SidebarControlProps` 增加 `isActive?: boolean`，两个调用方把 `isActive` 传下去；`React.use(SidebarHoverContext)` 为 null 时与现状完全一致；非 null 时：`useId()` 作身份，`useSyncExternalStore(store.subscribe, () => store.get() === id, () => false)` 得 `isHovered`（store 为 null 时传 noop subscribe，保证 hook 无条件调用），`onHoverStart` 组合为先 `store.set(id)` 再调使用方的；children 包成 render 函数：`<>{原 children（函数则以 values 调用）}<SharedElement name="sidebar-menu-hover" isVisible={isHovered} aria-hidden data-slot="sidebar-menu-hover-indicator" className={slotClass("menuHoverIndicator")} /><SelectionIndicator isSelected={isActive} aria-hidden data-slot="sidebar-menu-selection-indicator" className={slotClass("menuSelectionIndicator")} /></>`；控件加 `data-indicator="true"` 供 CSS 区分 — 验收（jsdom，写进 `sidebar.test.tsx`）：Given Content 内一个 `isActive` 的 MenuButton，Then 其内有且仅有一个 `[data-slot="sidebar-menu-selection-indicator"]`，且 Header 里的 MenuButton 内没有任何 `-indicator` slot、也没有 `data-indicator`。 ✅ 证据：新增「renders a selection indicator only for active buttons inside Content」；`vitest run sidebar.test` → Tests 32 passed (32)

- [x] `packages/react/tests/components/sidebar/sidebar.test.tsx` — 触屏与键盘不产生悬停块 — 两个用例：① 对 Content 内按钮派发 `pointerType: "touch"` 的 pointerdown/pointerup → 不出现 `[data-slot="sidebar-menu-hover-indicator"]`；② Tab 键聚焦到菜单按钮 → 不出现悬停块，按钮带 `data-focus-visible="true"` — 验收：`pnpm --filter @sy-inc/react exec vitest run sidebar.test` 两例绿。反例：鼠标 hover 同一按钮时必须出现悬停块（同文件内第三个断言，用于证明前两例不是因为功能整体失效而“假绿”）。 ✅ 证据：拆为三个 it（mouse / touch / keyboard，鼠标在前以免触摸后的模拟鼠标忽略窗口影响）；`vitest run sidebar.test` → Tests 32 passed (32)；三个 it 合并为一个时鼠标断言曾失败，即反例确实会红

- [x] `packages/styles/components/sidebar.css` — 按钮可承载指示器 — `.sidebar__menu-button`、`.sidebar__menu-sub-button` 去掉 `overflow-hidden`，加 `relative isolate`；静态 hover / active **背景**选择器加 `:not([data-indicator])`（`font-medium`、`text-foreground` 等非背景样式保持不加限定）；`[data-indicator]` 的按钮设 `--button-bg-hover: transparent; --button-bg-pressed: transparent`（防 ghost Button 自带 hover 底色冒出来）— 验收：浏览器测试里 hover Content 内按钮时其 `getComputedStyle(button).backgroundColor` 为 `rgba(0, 0, 0, 0)`，hover Header 内按钮时不是（静态背景仍在）。 ✅ 证据：浏览器用例「paints menu backgrounds with indicators only inside Content」绿；`vitest run sidebar.browser` → Tests 14 passed (14)

- [x] `packages/styles/components/sidebar.css` — 指示器样式 — `.sidebar__menu-selection-indicator` / `.sidebar__menu-hover-indicator`：`pointer-events-none absolute start-0 top-0 size-full rounded-lg`、`z-index: -1`，`transition-property: translate, width, height`、250ms、`var(--ease-out-fluid)`；悬停块再加 `opacity 150ms var(--ease-smooth)`，`&[data-entering], &[data-exiting] { opacity: 0 }`；两者末尾 `@apply motion-reduce:transition-none`；选中 `bg-surface-hover`，悬停 `bg-surface-hover/50` — 验收：`pnpm --filter @sy-inc/styles build` 成功，且产物 `dist/sy-inc.min.css` 中能 grep 到 `sidebar__menu-hover-indicator` 与 `prefers-reduced-motion` 下的 transition none。 ✅ 证据：`pnpm --filter @sy-inc/styles build` → ✨ Build completed successfully!；`grep -o sidebar__menu-hover-indicator dist/sy-inc.min.css | wc -l` → 24；产物含 `@media (prefers-reduced-motion:reduce){.sidebar__menu-hover-indicator:not(...){transition-property:none}`

- [x] `packages/styles/components/sidebar.css` — 修正被新子元素打破的结构选择器 — 折叠态 `.sidebar__menu-button > :not(:first-child)` 改为排除两个指示器类（**不能**用 `[data-slot$="-indicator"]`，否则会误放出 `disclosure-indicator`）；`> span:last-child` 截断改为 `> span:nth-last-child(1 of :not(.sidebar__menu-selection-indicator, .sidebar__menu-hover-indicator))` — 验收：现有 browser 用例「renders the shadcn desktop geometry in expanded and icon states」仍绿（折叠后 `Models` 文本 `display: none`）；反例：折叠态下选中按钮的选中指示器 `display` 不是 `none`（加一行断言）。 ✅ 证据：「renders the shadcn desktop geometry…」绿并新增 `[href="#models"] > selection-indicator` display 非 none 断言；`vitest run sidebar.browser` → 14 passed

- [x] `packages/styles/components/sidebar.css` — 子菜单展开稳定后放开裁剪 — `.sidebar__menu-item .disclosure__content[data-expanded="true"] { overflow: visible; transition: height 200ms var(--ease-out-quad), opacity 200ms var(--ease-out), overflow 0s 200ms allow-discrete; }` 后接 `@apply motion-reduce:transition-none`；收起态不写 overflow 过渡（立即回到 clip）— 验收（浏览器）：fixture 的 Disclosure 展开 250ms 后 `getComputedStyle(content).overflow` 为 `visible`；收起后立即为 `clip`。 ✅ 证据：浏览器用例「unclips an open submenu after its height animation and clips it again on collapse」绿（Chromium 支持 overflow allow-discrete）

- [x] `packages/react/tests/components/sidebar/fixtures.tsx` — 指示器专用 fixture — 新增 `SidebarIndicatorFixture`：Header 里一个 lg MenuButton；Content 里两个 Group，含普通项、`size="sm"` 项、`size="lg"` 项和一个默认展开的子菜单（≥2 个 MenuSubButton）；选中项由 `useState` 控制，`onPress` 切换 — 验收：被下面两条浏览器用例使用，`pnpm typecheck` 零报错。 ✅ 证据：被下面两条及「paints…」「unclips…」用例使用；`pnpm typecheck` → Tasks: 5 successful, 5 total

- [x] `packages/react/tests/components/sidebar/sidebar.browser.test.tsx` — 用例「快速连续 hover 后指示器的位置不残留」— 桌面 media；依次 hover 跨分组、进子菜单、尺寸不同的 ≥4 项，每两次之间只隔一帧（`requestAnimationFrame`，远小于 250ms 过渡），再加一组同帧内连续派发；最后一项 hover 后先断言其悬停块上有运行中的 `translate` 过渡（证明是接着滑而不是瞬移），再 `expect.poll` 到稳定 — 验收：稳定后全文档只剩 1 个 `[data-slot="sidebar-menu-hover-indicator"]`，位于最后一项内，`style.translate === ""` 且 `style.width === "" && style.height === ""`，与按钮 rect 偏差 0。反例：去掉补丁（临时）时该用例应失败——执行时实际做一次，记录失败输出后恢复。 ✅ 证据：绿，连跑 3 次 14 passed；同帧组为「General→Dashboard→移出 Content→回到 Dashboard」（微任务分隔，模拟独立事件）。反例已实跑：临时让 `SharedElement` 不走补丁 → `× leaves no stale indicator position after rapid hovers` / `AssertionError: expected '0px' to be ''`（Dashboard 悬停块 translate 残留），随后恢复

- [x] `packages/react/tests/components/sidebar/sidebar.browser.test.tsx` — 用例「经过空隙时滑过去，不是淡出再淡入」— hover 项 A；把指针移到 A 与下一项 B 之间的 8px 空隙（`userEvent.hover(menuUl, {position})`）；再 hover B；最后移出 Content — 验收：在空隙期间 A 的悬停块仍在、无 `data-exiting`；hover B 后 B 的悬停块无 `data-entering`、`opacity` 为 `"1"` 且有运行中的 `translate` 过渡；移出 Content 后出现 `data-exiting`，随后元素被移除。 ✅ 证据：「slides across the gap between items instead of fading out and in」绿；注意需等 A 的淡入到 opacity 1 再移动，否则 B 继承快照里的中间 opacity（首跑曾得 0.569889）

- [ ] `packages/react/src/components/sidebar/sidebar.stories.tsx` — 新增 story `SlidingIndicators` — 复用文件内现有数据/图标，选中项用 `useState` 控制（点击切换），含两个分组、一个子菜单、不同尺寸项；Footer 保留一个菜单按钮展示「范围外静态背景」 — 验收（人工）：`pnpm dev` 打开 Components/Navigation/Sidebar → SlidingIndicators：点击切换时选中块从旧项滑到新项；鼠标快速划过多项悬停块连续滑动；经过空隙不闪；移出 Content 淡出；DevTools 模拟 `prefers-reduced-motion: reduce` 后直接跳位；DevTools 触屏模式下点按不出现悬停块。 ⏳ 代码已写；人工目测需用户在 Storybook 里做，未勾选

- [x] 全量检查 — `pnpm --filter @sy-inc/styles build` 后跑 `pnpm --filter @sy-inc/react exec vitest run sidebar tabs segment bottom-bar`，再 `pnpm lint && pnpm typecheck` — 验收：三条命令零失败零报错（浏览器测试读的是 `styles/dist/sy-inc.min.css`，必须先 build styles）。 ✅ 证据：styles build → ✨ Build completed successfully!；`vitest run sidebar tabs segment bottom-bar` → Test Files 11 passed (11), Tests 102 passed (102)；`pnpm lint` → 0 errors（改动文件无 warning；为消除 React Compiler「Cannot access refs during render」警告，mergeRefs 留在两个组件内，hook 只接收 elementRef；反例在此改动后复跑仍按预期失败）；`pnpm typecheck` → 5 successful

## 不做，仅记录

- 文档站（`apps/docs`）不更新 Sidebar 文档；用户未要求。
- 禁用项上 hover 时悬停块停在上一项（RAC 对禁用元素不触发 hover），本轮不处理。
- 同一时刻多个 `isActive` 项时，切换后只有最后卸载的那一个会作为滑动起点（RAC 快照按名字只存一份）。
