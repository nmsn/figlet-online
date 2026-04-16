# Figlet Fonts - Theme Toggle & Modal Preview

## 目标

为 Figlet Fonts 网站增加三个功能：
1. 明暗主题切换（带同心圆扩散动画）
2. 主题色设置（文字/标题颜色变换）
3. 字体卡片点击弹窗全屏预览

## 设计原则

- **组件自包含** — 每个功能独立，不污染全局样式
- **TDD 驱动** — 先写测试，再实现
- **使用现有工具** — shadcn Dialog、next-themes、CSS 动画

---

## Feature 1: 明暗主题切换

### 描述
Header 右侧增加主题切换按钮，点击时触发同心圆扩散动画，从按钮位置向外扩散。

### 技术方案
- 使用 `next-themes` 管理主题状态（SSR 友好）
- CSS 变量定义颜色：
  - Dark: `--background: #0a0a0a`, `--foreground: #ffffff`, `--accent: #00ff00`
  - Light: `--background: #ffffff`, `--foreground: #0a0a0a`, `--accent: #22c55e`
- 同心圆动画：CSS `@keyframes` 实现，从按钮位置扩散 3 层圆环
- 首次加载检测 `prefers-color-scheme`

### 文件
- `src/components/theme-toggle.tsx` — 切换按钮组件
- `src/app/globals.css` — 主题 CSS 变量

### 验收测试
- [ ] 切换到 Light 模式，背景变白，文字变黑
- [ ] 切换到 Dark 模式，背景变黑，文字变白
- [ ] 点击按钮显示同心圆扩散动画
- [ ] 刷新页面保持上次选择的主题

---

## Feature 2: 主题色设置

### 描述
Header 右侧增加主题色设置按钮，点击展开色板选择器，切换 `--accent` 颜色。

### 技术方案
- 预设 6 个主题色：
  - `#00ff00` — Neon Green（默认）
  - `#3b82f6` — Blue
  - `#a855f7` — Purple
  - `#f97316` — Orange
  - `#ec4899` — Pink
  - `#eab308` — Yellow
- 点击色板调用 `setAccentColor(hex)` 切换
- 使用 localStorage 持久化颜色选择

### 文件
- `src/components/accent-picker.tsx` — 颜色选择器组件

### 验收测试
- [ ] 页面显示 6 个颜色圆点
- [ ] 点击颜色，`--accent` 变量更新
- [ ] 刷新页面保持选择的主题色

---

## Feature 3: 字体卡片弹窗预览

### 描述
点击 FontCard 打开 Dialog 全屏展示 ASCII 艺术，解决某些字体渲染很高被截断的问题。

### 技术方案
- 使用 shadcn `Dialog` 组件
- FontCard 增加 `onClick` 打开 Dialog
- Dialog 内容：
  - 全屏展示 ASCII 艺术（完整内容，无截断）
  - 字体名称标题
  - 双击复制按钮
  - ESC 关闭
- 状态：`isPreviewOpen`, `previewFont`, `previewText`

### 文件
- `src/components/font-preview-dialog.tsx` — Dialog 组件
- `src/components/font-card.tsx` — 增加点击打开 Dialog

### 验收测试
- [ ] 点击卡片打开 Dialog
- [ ] Dialog 内显示完整 ASCII 艺术（无截断）
- [ ] 双击 Dialog 内容复制成功，显示 toast
- [ ] ESC 或点击外部关闭 Dialog

---

## 技术栈

- **主题管理**: `next-themes`
- **UI 组件**: shadcn `Dialog`
- **动画**: CSS `@keyframes`（同心圆扩散）
- **状态**: React `useState` + localStorage
- **测试**: Vitest + @testing-library/react

---

## 并行任务分解

三个功能完全独立，可并行执行：

| Agent | 任务 |
|-------|------|
| Agent 1 | Theme Toggle - `theme-toggle.tsx` + CSS 变量 |
| Agent 2 | Accent Picker - `accent-picker.tsx` + 颜色逻辑 |
| Agent 3 | Font Preview Dialog - `font-preview-dialog.tsx` + FontCard 修改 |

---

## 实现顺序

1. 安装依赖: `next-themes`
2. 并行执行三个功能开发
3. 集成到 `page.tsx` header
4. E2E 测试验证
