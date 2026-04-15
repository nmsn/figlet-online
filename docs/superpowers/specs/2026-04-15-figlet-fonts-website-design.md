# Figlet Fonts 网站 — 设计文档

**日期:** 2026-04-15
**状态:** 已确认

---

## 1. 项目概述

### 背景
用户希望创建一个 figlet-fonts 在线网站，使用 https://github.com/xero/figlet-fonts 仓库的 353 个 ASCII Art 字体特效。用户输入文本后，页面展示所有字体的渲染效果，方便用户选择满意的效果并复制使用。

### 核心交互
```
输入文本 → 字体墙全量渲染预览 → 双击卡片复制 ASCII 效果
```

---

## 2. 设计决策汇总

| 决策项 | 选择 |
|--------|------|
| 核心交互 | 输入文本 → 字体墙预览 → 双击复制 |
| 导出功能 | 无（纯复制操作） |
| 收藏功能 | 无 |
| 字体覆盖 | 353 个全量接入 |
| 元数据来源 | 脚本提取 .flf header + 关键词分类 |
| 字体墙布局 | 固定网格 (方案A) |
| 卡片列数 | 桌面 4-5 列，移动端自适应 |
| 文本输入框 | 粘性顶部，滚动时固定可见 |
| 卡片交互 | 单击临时预览 + 双击复制 |
| 批量选中 | 无 |
| 分享链接 | 无 |
| 随机示例文本 | 无 |
| 风格筛选 | 无侧边栏过滤，全量展示 |
| 视觉风格 | 暗色主题，终端/Terminal 美学 |

---

## 3. 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│  🔤 Figlet Fonts                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  输入任意文本，浏览全部字体效果...                    │   │  ← 粘性顶部
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────────┐  ┌──────────────────┐                │
│   │  ╔════════════╗ │  │  ╔════════════╗ │                │
│   │  ║  _   _  _ ║ │  │  ║  _____  _ ║ │                │
│   │  ║ | | | | |║ │  │  ║ |_   _|| |║ │                │
│   │  ║ |_| |_| |_║ │  │  ║   | |  |_|║ │                │
│   │  ╚════════════╝ │  │  ╚════════════╝ │                │
│   │   Banner         │  │   Big           │                │
│   └──────────────────┘  └──────────────────┘                │
│                                                             │
│              ... 353 个字体全量展示 ...                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  已复制! ✓                                                   │  ← Toast 通知
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 技术架构

### 4.1 技术栈

| 层级 | 技术选型 |
|------|----------|
| 框架 | Next.js 15 (App Router) |
| UI | React 19 + shadcn/ui + Tailwind CSS v4 |
| 样式 | Tailwind v4 (CSS-first config) |
| 后端 | Next.js API Routes (Serverless 友好) |
| 字体解析 | 自研 flf-parser (~300行 TypeScript) |
| 虚拟滚动 | @tanstack/react-virtual |
| 部署 | Vercel / 任意 Node.js 环境 |

### 4.2 项目结构

```
figlet-online/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx               # 首页
│   │   └── api/
│   │       ├── fonts/
│   │       │   ├── route.ts       # GET /api/fonts
│   │       │   └── [id]/
│   │       │       └── route.ts   # GET /api/fonts/:id
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui 组件
│   │   ├── text-input.tsx         # 粘性文本输入框
│   │   ├── font-wall.tsx          # 字体墙核心组件
│   │   ├── font-card.tsx          # 单个字体卡片
│   │   └── toast.tsx              # 复制成功提示
│   │
│   ├── lib/
│   │   ├── figlet/
│   │   │   ├── parser.ts          # .flf 文件解析器
│   │   │   ├── renderer.ts        # 文本渲染为 ASCII
│   │   │   └── fonts-meta.ts     # 353 个字体元数据
│   │   └── utils.ts
│   │
│   └── styles/
│       └── globals.css            # Tailwind 入口
│
├── public/
│   └── fonts/                     # 353 个 .flf 文件 (~3.5MB)
│       ├── Standard.flf
│       ├── Banner.flf
│       └── ...
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── components.json
└── tsconfig.json
```

### 4.3 API 设计

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/fonts` | GET | 返回 353 个字体元数据 JSON |
| `/api/fonts/[id]` | GET | 返回指定字体的 .flf 文件内容 |

**渲染全部客户端完成，无服务端渲染 API。**

---

## 5. 字体元数据设计

353 个字体元数据静态存储在 `fonts-meta.ts`，按需从 `/api/fonts` 返回：

```typescript
export interface FontMeta {
  id: string          // "Standard" — 对应 public/fonts/Standard.flf
  name: string        // 显示名
  style: FontStyle    // "classic" | "3d" | "script" | "block" | "retro" | "fun" | "thin"
  heightLevel: 1 | 2 | 3  // 1=矮小, 2=普通, 3=高大
}

export const allFontsMeta: FontMeta[] = [
  { id: "Standard", name: "Standard", style: "classic", heightLevel: 2 },
  { id: "Banner", name: "Banner", style: "block", heightLevel: 3 },
  // ... 353 条
]
```

**元数据生成流程:**
1. Node 脚本遍历 `public/fonts/*.flf`
2. 读取每个 .flf 文件 header，提取 height
3. 通过字体文件名关键词猜测 style 分类
4. 输出 `fonts-meta.ts`

---

## 6. FLF 解析器设计

### 6.1 .flf 格式头部

```
flf2a$ 6 5 16 15 13 0 24443 229
 ^   ^ ^ ^  ^  ^ ^   ^     ^
 │   │ │ │  │  │ │   │     └─ 字符数
 │   │ │ │  │  │ │   └─        布局参数
 │   │ │ │  │  └─           打印方向
 │   │ │ │  └─              注释行数
 │   │ └─                 基准线
 └─                     高度(行数/字符)
```

### 6.2 核心类型

```typescript
export interface FlfHeader {
  height: number       // 每个字符的高度(行数)
  baseline: number     // 基准线
  maxLength: number    // 单字符最大宽度
  layout: number        // 紧凑度 (0=full, 15=tight)
  commentLines: number // 注释行数(跳过)
  direction: number    // 1=左→右, 0=右→左
  codetagCount: number // 代码标签数
}

export interface FlfFont {
  header: FlfHeader
  comment: string      // 字体描述
  chars: Map<number, string[]> // charCode → 行数组
}

export function parseFlf(content: string): FlfFont { ... }
```

### 6.3 渲染函数

```typescript
export function renderText(text: string, font: FlfFont): string {
  const lines = Array.from({ length: font.header.height }, () => '')

  for (const char of text) {
    const charLines = font.chars.get(char.charCodeAt(0))
      ?? font.chars.get(63)  // fallback to '?'

    for (let i = 0; i < font.header.height; i++) {
      lines[i] += (charLines?.[i] ?? '').padEnd(font.header.maxLength)
    }
  }

  return lines.join('\n')
}
```

---

## 7. 性能优化策略

### 分级加载

```
第一级: 元数据 + 骨架屏
├── /api/fonts → 返回全部 353 个字体的元数据
├── 首次只渲染可见区域的 20-30 个字体卡片
└── 未加载的卡片显示 "Loading..." 骨架

第二级: 按需加载字体文件
├── Intersection Observer 监测卡片是否进入视口
├── 进入视口 → fetch /api/fonts/:id → 解析 .flf → 渲染
└── 渲染过的卡片缓存起来，不重复渲染

第三级: 防抖节流
├── 文本输入防抖 300ms 后触发全局重渲染
└── 滚动时暂停渲染，滚动停止 100ms 后恢复
```

### 虚拟滚动

使用 `@tanstack/react-virtual` 处理大量卡片，只渲染可见行：

```tsx
const rowVirtualizer = useVirtualizer({
  count: Math.ceil(filteredFonts.length / COLS_PER_ROW),
  getScrollElement: () => containerRef.current,
  estimateSize: () => CARD_HEIGHT + GAP,
  overscan: 3,
})
```

---

## 8. 视觉风格

### 暗色 Terminal 美学

| 元素 | 样式 |
|------|------|
| 页面背景 | `#0a0a0a` (纯黑) |
| 卡片背景 | `#111111` (深灰) |
| 卡片边框 | `#1a1a1a` (暗灰), hover 时 `#333` |
| ASCII 文字 | `#00ff00` (终端绿) 或 `#ffffff` (白色) |
| 输入框 | 暗色背景 + 绿色聚焦边框 |
| 字体名称 | `#888888` (灰色) |

### 卡片设计

- 固定网格，每行 4-5 列（桌面），3 列（平板），2 列（手机）
- 每个卡片包含: ASCII 预览 + 字体名称
- 双击卡片复制 ASCII 效果到剪贴板
- Toast 提示复制成功

---

## 9. 实现顺序

```
Day 1: 核心闭环
├── 搭建 Next.js + shadcn + Tailwind 项目
├── flf-parser.ts + renderer.ts 验证
├── 脚本生成 fonts-meta.ts (353 个字体元数据)
├── font-card.tsx 单卡片 (loading/rendered/error 状态)
├── 首页基本布局 (粘性输入框 + 网格)
└── 双击复制 + Toast 提示

Day 2: 性能优化
├── @tanstack/react-virtual 虚拟滚动
├── Intersection Observer 按需加载
├── 渲染结果缓存 (Map 存储已渲染字体)
└── 输入防抖 (300ms)

Day 3: 字体元数据完善
├── 脚本优化: 从 .flf header 提取 height
├── 关键词映射 style 分类
└── 人工校正分类结果

Day 4: 细节打磨
├── 响应式布局完善
├── 字体高度差异处理（卡片高度固定，显示不下时截断或缩小字号）
├── 空状态处理
└── 加载骨架屏美化
```

---

## 10. 不在 Phase 1 范围的功能

以下功能预留接口，Phase 1 不实现：

- PNG/SVG 导出
- 用户收藏 / LocalStorage
- 分享链接
- 风格/高度过滤侧边栏
- 服务端渲染降级
- 用户自定义字体上传
