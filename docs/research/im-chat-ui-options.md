# React IM 双向气泡组件调研

调研日期：2026-09-05。目标：优先复用适合 SY UI（React 19 / Tailwind CSS 4）的消息展示组件。仅核对文档与源码声明，未安装或运行兼容性测试。

## WhatsApp 与 Telegram 官方能力

本次检索未找到两家官方发布、可直接安装到普通 React 项目的独立 IM 双向气泡库。

- WhatsApp Cloud API 面向商业消息收发和系统集成，本身不提供 React 气泡组件：[Meta 官方 API collection](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api)。
- Telegram Web A / Web K 是完整开源客户端，官方源码目录标注 GPL v3：[官方应用目录](https://telegram.org/apps#source-code)。其中 Web A 使用自有 Teact，README 将其描述为重新实现 React 范式；不能直接当普通 React 组件包使用：[Web A 源码](https://github.com/Ajaxy/telegram-tt)。
- Telegram Mini Apps 提供宿主 API、主题参数和设计指南，面向 Telegram 内的小程序：[官方文档](https://core.telegram.org/bots/webapps)。
- `@telegram-apps/telegram-ui` 是面向 Mini Apps 的 React UI 库；其名称不代表它是 Telegram 官方聊天气泡库：[项目说明](https://github.com/telegram-mini-apps-dev/TelegramUI)。

## 第三方组件

| 方案 | 已核实的能力 | 接入判断 |
| --- | --- | --- |
| [Chatscope Chat UI Kit React](https://github.com/chatscope/chat-ui-kit-react) | 提供消息、列表、输入框和聊天容器；UI 包可独立于其 use-chat 状态管理包使用；MIT | 希望复用整套聊天 UI 时优先试用；自带 CSS 和图标依赖，需要适配 SY 的视觉规范 |
| [react-chat-elements](https://github.com/Detaysoft/react-chat-elements) | MessageBox 支持左右位置、文本、图片、音视频、文件、回复、发送/接收/已读状态；MIT | 功能贴近传统 IM，适合参考消息结构；React 19 项目接入前需要验证兼容性 |
| [daisyUI Chat](https://daisyui.com/components/chat/) | CSS 气泡，含 start/end 对齐、头像、header/footer | 只需要气泡布局时优先评估；消息收发、已读逻辑等仍由业务提供 |

Chatscope 发布版 2.1.1 明确加入 React 19 peer dependencies：[发布记录](https://github.com/chatscope/chat-ui-kit-react/releases/tag/v2.1.1)。[package.json](https://raw.githubusercontent.com/chatscope/chat-ui-kit-react/master/package.json) 同时显示其样式和 Font Awesome 依赖。

react-chat-elements 本次读取的 master package.json 版本为 12.0.18，peerDependencies 为 React `^18.2.0`、React DOM `18.2.0`，不能据此宣称已支持 React 19，也不能据此判定一定不可运行：[依赖声明](https://raw.githubusercontent.com/Detaysoft/react-chat-elements/master/package.json)。消息 API 见 [MessageBox 文档](https://detaysoft.github.io/docs-react-chat-elements/docs/messagebox/)。

daisyUI 5 面向 Tailwind CSS 4：[发布说明](https://daisyui.com/docs/v5/)。支持 include 指定组件、prefix 避免类名冲突以及 root 限定主题变量作用域：[配置文档](https://daisyui.com/docs/config/)。这些机制降低共存成本，但主题变量仍需要和 SY 的设计令牌协调，不能理解为直接引入就会自动适配。

## 服务绑定型方案

[Stream Chat React](https://getstream.io/chat/docs/sdk/react/) 提供回复、反应、附件、已读等成熟聊天体验，但组件建立在 Stream Chat API / 客户端之上；启动需要 Stream app 和用户 token：[Getting Started](https://getstream.io/chat/docs/sdk/react/basics/getting-started/)。

[Sendbird UIKit](https://docs.sendbird.com/docs/chat/uikit/v3/react/essentials/sendbirdprovider) 的 Provider 传递其 Chat SDK，并使用 Sendbird appId。若只想借用气泡样式，这两类方案不是本次首选。

## 建议

这是基于文档和项目技术栈的选择建议，并非实测排名：

1. 要减少整页聊天 UI 开发量，先用 Chatscope 验证真实消息样例和主题适配。
2. 只要双向气泡、头像、时间和状态展示，先评估 daisyUI Chat 的局部引入。
3. react-chat-elements 作为传统 IM 消息类型和交互参考，实际采用前解决 React 19 兼容性验证。
4. 只有上述方案的样式覆盖或接口适配成本过高时，再将已验证的结构整理为 SY 自有组件。

初步验收关注：长文本和链接换行、图片加载后的滚动位置、历史消息插入时的视口保持、新消息是否打断阅读、发送失败重试、键盘操作。展示组件有相关外观或回调不等于实现消息传输与状态同步。
