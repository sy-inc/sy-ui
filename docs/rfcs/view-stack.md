# ViewStack 草案

> 状态：已实现（`packages/react/src/components/view-stack`）。目标：弹层（Popover / Modal / Drawer）或整页里的多页切换——前进下一页、退回上一页、跳到任意一页。

## 1. 要解决什么

页面状态本身是一个 `useState`，库不接管。库接的是每个消费侧都会做错、而且与容器无关的部分：

| 难点 | 不处理的后果 |
| --- | --- |
| 焦点 | 旧页卸载时焦点掉到 `body`，或被 Dialog 的 FocusScope 拉回第一个元素；退回时找不回原来的按钮 |
| 读屏 | 换页没有任何播报 |
| 方向动画 | 前进 / 后退方向反了，退场页提前消失，`prefers-reduced-motion` 没顾到 |
| 高度过渡 | 两页高度不同，容器直接跳；Popover 跟着跳位置 |
| 退场页可交互 | 动画期间还能点到、Tab 到旧页 |

## 2. 不做什么

- **流程引擎**：不做 `steps` 配置、校验函数、自动前进。「处理完进下一步」是业务里的 `setStep(next)`。
- **报错策略**：报错默认就地显示（`FieldError`）。需要退回某一步（如最终提交时服务端说第 1 步数据不对）由业务调 `setStep("info")`，组件只保证方向和焦点对。
- **Esc 返回上一页**：Esc 保持关闭弹层（RAC 默认语义）。见 §8-1。
- **空搜索框 Backspace 返回**：和页内输入框冲突，不做。
- **URL / 浏览器历史同步、手势侧滑返回、窄屏自动全屏**：容器或路由的事，不在这里。

## 3. 用法

### 3.1 分步流程（Modal + Stepper）

`currentKey` / `onCurrentChange` 与 `Stepper` 同名，一个 state 喂两个组件：

```tsx
const [step, setStep] = useState<Key>("info");

<Modal>
  <Button>新建会员</Button>
  <Modal.Backdrop>
  <Modal.Container>
    <Modal.Dialog>
      <Stepper currentKey={step}>
        <Stepper.Item id="info">…</Stepper.Item>
        <Stepper.Item id="plan">…</Stepper.Item>
        <Stepper.Item id="confirm">…</Stepper.Item>
      </Stepper>

      <ViewStack currentKey={step} onCurrentChange={setStep}>
        <ViewStack.View id="info">
          <ViewStack.Header>
            <ViewStack.Title>基本信息</ViewStack.Title>
          </ViewStack.Header>
          <InfoForm onDone={() => setStep("plan")} />
        </ViewStack.View>

        <ViewStack.View id="plan">
          <ViewStack.Header>
            <ViewStack.Back />
            <ViewStack.Title>选择方案</ViewStack.Title>
          </ViewStack.Header>
          …
        </ViewStack.View>

        <ViewStack.View id="confirm">…</ViewStack.View>
      </ViewStack>
    </Modal.Dialog>
  </Modal.Container>
  </Modal.Backdrop>
</Modal>
```

提交失败、错在第 1 步：

```tsx
onError: (error) => {
  if (error.field === "phone") setStep("info"); // 自动按「后退」处理：方向、焦点都对
};
```

### 3.2 下钻（Popover：列表 → 新建）

TagPicker 换成这样，两页的 `useState` 仍在业务侧，手写的返回键、页头删掉：

```tsx
<Popover.Content variant="list">
  <Popover.Dialog aria-label="标签">
    <ViewStack currentKey={page} onCurrentChange={setPage}>
      <ViewStack.View id="list">{/* Filter + SearchField + ListBox + 底部「新增标签」 */}</ViewStack.View>
      <ViewStack.View id="create">
        <ViewStack.Header>
          <ViewStack.Back />
          <ViewStack.Title>新增标签</ViewStack.Title>
        </ViewStack.Header>
        <TagCreateForm />
      </ViewStack.View>
    </ViewStack>
  </Popover.Dialog>
</Popover.Content>
```

### 3.3 非受控 + 深层组件里跳转

```tsx
<ViewStack defaultKey="list">…</ViewStack>

// 任意 View 内部
const {navigate, goBack, canGoBack} = useViewStack();
```

## 4. API

```ts
type ViewStackProps = ComponentPropsWithRef<"div"> & {
  /** 受控当前页 */
  currentKey?: Key;
  /** 非受控初始页 */
  defaultKey?: Key;
  onCurrentChange?: (key: Key) => void;
  children: ReactNode;
};

type ViewStackViewProps = ComponentPropsWithRef<"div"> & {
  id: Key;
  /** 不在当前页时也保持挂载（inert + hidden），用来保留未提升的表单状态。默认 false，同 RAC TabPanel */
  shouldForceMount?: boolean;
};

/** 页面分区，同 Modal 的 Header / Body / Footer：不带外边距，只管分区之间的节奏（header→body 12px，→footer 20px）。
 *  Modal / 默认 Popover 自带内边距；Drawer、列表 Popover 由各自 CSS 给分区加左右留白。 */
type ViewStackHeaderProps = ComponentPropsWithRef<"div">; // 一行：Back + Title
type ViewStackBodyProps = ComponentPropsWithRef<"div">;   // 纵向 gap-4
type ViewStackFooterProps = ComponentPropsWithRef<"div">; // 操作行，右对齐；文字版 Back 自动靠左

/** SY INC Button。无可退页时不渲染。无 children：页头用的 chevron 图标键（ghost，aria-label="Back"）；
 *  有 children（如「上一步」）：页脚用的文字键（tertiary）。 */
type ViewStackBackProps = Omit<ButtonProps, "onPress"> & {onPress?: () => void};

/** 原生 h1–h6（默认 h2，不用 RAC Heading，免得抢 Dialog 的 title slot）；作为 View 的 aria-labelledby，也是焦点兜底目标 */
type ViewStackTitleProps = ComponentPropsWithRef<"h2"> & {level?: 1 | 2 | 3 | 4 | 5 | 6};

function useViewStack(): {
  currentKey: Key;
  direction: "forward" | "backward" | null; // null = 首次渲染
  canGoBack: boolean;
  goBack: () => void;
  navigate: (key: Key) => void;
};
```

导出：`ViewStack`（`Object.assign(ViewStackRoot, {View, Header, Back, Title, Body, Footer})`）、`useViewStack`、`viewStackVariants`、各 Props 类型。

## 5. 行为规则

### 5.1 历史与方向

组件内部记一条路径 `history: Key[]`，初始为 `[初始页]`。每次当前页变化（`navigate` / `goBack` / 受控 `currentKey` 从外部改）：

- 新页**在路径里** → 截断到它，方向 `backward`（覆盖「退一步」「报错跳回第 1 步」「点 Stepper 回到第 2 步」）
- 新页**不在路径里** → 追加，方向 `forward`（覆盖线性下一步、分叉 2 → 3b、点 Stepper 跳到没去过的页）
- 与当前页相同 → 不做任何事

`goBack()` = `navigate(history[history.length - 2])`；路径只有一项时 `canGoBack = false`。

不按 View 的声明顺序推断方向——那样处理不了分叉流程。

### 5.2 焦点

- **前进**：新页进场后，按顺序取第一个存在的：页内 `autoFocus` 元素（React 自己聚焦，组件不抢）→ `ViewStack.Title`（`tabIndex=-1`，读屏会读出标题）→ View 容器（`tabIndex=-1`）。
- **后退**：回到当初离开这一页时有焦点的元素（导航那一刻记下 `document.activeElement`，挂在路径项上）；元素已不在 DOM 时，按前进的规则兜底。
- **退场页**：动画期间 `inert`，Tab、点击、读屏都进不去（同 RAC TabPanel）。

### 5.3 动画与高度

- 退场页用 `useExitAnimation`（`@react-aria/utils`，RAC TabPanel 同款），等 CSS 过渡结束才卸载；退场期间 `position: absolute`，不参与容器高度。
- 进场用 CSS `@starting-style` 过渡（同 SplitView），挂载后才给 Root 加 `data-motion`，首屏和 SSR 不动画；`shouldForceMount` 的页从 `hidden` 变可见时也会触发。
- 高度照 RAC `TabPanels` 的做法：切页时量新高度，写到 `--view-stack-height`，CSS 有 `height` 过渡时才生效，动画结束后改回 `auto`。旧高度由 ResizeObserver 持续记录，不在 render 里读 DOM。
- 方向写在 `data-direction` 上，CSS 决定滑动方向；RTL 下左右对调；`motion-reduce` 下关闭位移和高度过渡，只保留瞬切。

## 6. 样式与 DOM

| 部件 | class | data |
| --- | --- | --- |
| Root | `.view-stack` | `data-slot="view-stack"`、`data-direction` |
| View | `.view-stack__view` | `data-slot="view-stack-view"`、`data-current`、`data-entering`、`data-exiting`、`data-direction`、`role="group"` + `aria-labelledby`（有 Title 时） |
| Header | `.view-stack__header` | `data-slot="view-stack-header"` |
| Back | `.view-stack__back` | `data-slot="view-stack-back"` |
| Title | `.view-stack__title` | `data-slot="view-stack-title"` |

Root 是 `flex flex-col min-h-0`，这样放进 `.popover--list` 里时，ListBox 的 `max-h-[320px] min-h-0` 滚动链不被打断。

## 7. 落地

文件（`pnpm add:component ViewStack` 生成后改）：

```
packages/react/src/components/view-stack/{view-stack.tsx, view-stack.stories.tsx, index.ts}
packages/styles/components/view-stack.css
packages/styles/src/components/view-stack/view-stack.styles.ts
packages/react/tests/components/view-stack/{view-stack.test.tsx, view-stack.ssr.test.tsx, view-stack.browser.test.tsx}
```

Story：`Components/ViewStack` 下至少三个——Modal 分步 + Stepper、Popover 列表 → 新建、Drawer（手机底部弹层）。

测试：

- jsdom：路径截断与方向（含分叉、跳回、同页 no-op）；受控 / 非受控；`canGoBack` 与 Back 隐藏；前进 / 后退焦点规则；退场页 `inert`；`shouldForceMount`。
- browser（Popover、Modal 是 portal，按风险需要）：动画结束后退场页卸载；高度过渡后回到 `auto`；Popover 在高度变化时跟着重新定位（RAC `useOverlayPosition` 监听了弹层尺寸）。
- SSR：`ssrSmoke()` 首屏只渲染当前页。

## 8. 已定

1. **Esc**：保持「关闭弹层」（RAC Dialog 默认），不在 `canGoBack` 时退一页。
2. **命名**：`ViewStack`。
3. **`shouldForceMount`**：默认 `false`，非当前页卸载；跨步数据由业务提升到上层。
4. **Back**：由使用方手放进 `Header`，`Header` 不自动生成。

## 9. 需要实测的风险

- Popover `placement="top"` 时高度过渡，弹层是否抖动或中途翻转方向。
- Drawer 底部弹层自身的高度 / 拖拽与 `--view-stack-height` 过渡是否打架。
- 前进时 `autoFocus` 与进场动画同时发生，iOS Safari 弹键盘是否导致布局跳动。

## 10. 已知上限

- 方向只看「新页在不在路径里」。想从第 3 步「前进」回到第 1 步重新开始（方向向前）做不到——需要时加 `navigate(key, {direction})`。
