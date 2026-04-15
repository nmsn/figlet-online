# Font Wall 自动加载 & 布局优化设计方案

## 目标

1. **自动加载**：用户输入后立即看到尽可能多的渲染内容，无需点击
2. **布局优化**：增大卡片尺寸和间距，滚动条从卡片容器移到页面级别

## 现状分析

### FontCard 当前逻辑
- `RenderState = "idle" | "loading" | "rendered" | "error"`
- 初始状态为 `idle`，显示 "Click to load"
- 点击后才触发 `figlet.text()` 渲染

### FontWall 当前布局
- 4 列 desktop（`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`）
- `CARD_HEIGHT=140`，`GAP=12`
- `overflow-auto` 在 FontWall 容器上，页面 header sticky，卡片区域独立滚动

### figlet 渲染性能
- `figlet.text()` 是同步 CPU 操作，单次渲染 <1ms
- 328 个字体同时渲染约 50-100ms，完全可接受
- 不需要懒加载优化，无需 fetch

## 设计方案

### 1. 自动加载（Auto-Load on Visible）

**方案**：使用 `IntersectionObserver` 在卡片进入视口时自动加载

**实现**：
- `FontCard` 添加 `useEffect`，初始状态为 `"idle"`
- 卡片进入视口时自动调用 `loadAndRender()`
- 不需要 `onVisible` 回调（FontWall 不再需要感知可见性）
- 已渲染的卡片（`state !== "idle"`）不重复加载

**优点**：只渲染可见卡片，首屏快，适合 300+ 字体
**注意**：滚动时可能同时触发多个渲染，但 figlet 够快无感知

### 2. 布局优化

**改动**：
| 属性 | 当前值 | 新值 |
|------|--------|------|
| desktop 列数 | 4 | 3 |
| CARD_HEIGHT | 140 | 180 |
| GAP | 12 | 20 |
| 滚动位置 | 容器内滚动 | 页面整体滚动 |

**实现**：
- `FontWall`：移除 `overflow-auto` 和 `min-h-[calc(100vh-120px)]`
- `page.tsx`：移除 `style={{ flex: 1 }}` 的 flex 布局，让 `main` 自然流
- 页面级别滚动条，header sticky

### 3. 骨架屏

保持不变：`mounted` 为 false 时显示骨架屏

## 改动范围

### FontCard
- 添加 `useEffect` + `IntersectionObserver` 实现自动加载
- 不再需要 `onVisible` prop（可移除）

### FontWall
- `COLS`: 4 → 3
- `CARD_HEIGHT`: 140 → 180
- `GAP`: 12 → 20
- 移除 `overflow-auto` 和 `style={{ contain: "strict" }}`

### page.tsx
- 恢复 `className="min-h-screen"` 替代 flex 布局
- 恢复外层 div 的 `className="container mx-auto px-4 py-6"` 替代 flex 样式

## 风险

- `IntersectionObserver` 在 SSR 时不可用，但 FontCard 本身是 client component，已经有 `mounted` 状态处理
- 首屏大量卡片同时渲染可能短暂影响响应，但 figlet 足够快
