# Figlet NPM 重构设计方案

## 目标

用 `figlet` npm 包替换现有的自定义 parser + renderer 逻辑，简化架构。

## 背景

当前架构：
- `parser.ts` — 手动解析 `.flf` 字体文件格式
- `renderer.ts` — 根据解析后的字体数据渲染 ASCII 文本
- `font-card.tsx` — 通过 API fetch 字体文件 → 解析 → 渲染

`figlet` npm 包已完整实现 FIGfont spec，可直接使用。

## 改动范围

### 删除的文件

| 文件 | 原因 |
|------|------|
| `src/lib/figlet/parser.ts` | figlet 包内部处理 |
| `src/lib/figlet/renderer.ts` | figlet.text() 替代 |
| `src/app/api/fonts/route.ts` | 不再需要字体列表 API |
| `src/app/api/fonts/[id]/route.ts` | 不再需要字体文件 API |

### 修改的文件

| 文件 | 改动 |
|------|------|
| `src/components/font-card.tsx` | 使用 `figlet.text()` 直接渲染 |
| `src/lib/figlet/fonts-meta.ts` | 从 figlet 内置字体列表生成元数据 |

### 可选清理

- `public/fonts/` 目录 — figlet 内置 328 个字体，其中 289 个与 custom 字体相同，可选择删除或保留（保留不影响功能）

## 核心实现

### font-card.tsx 改动

**Before:**
```ts
const res = await fetch(`/api/fonts/${font.id}`));
const content = await res.text();
const parsed = parseFlf(content);
const rendered = renderText(text || " ", parsed);
```

**After:**
```ts
figlet.text(text || " ", { font: font.id }, (err, data) => {
  if (err) { setState("error"); return; }
  setAscii(data);
  setState("rendered");
});
```

### fonts-meta.ts 改动

**Before:** 静态 `allFontsMeta` 数组（~2270 行）

**After:**
```ts
import figlet from "figlet";

export const allFontsMeta: FontMeta[] = figlet.fontsSync().map((name, i) => ({
  id: name,
  name,
  style: "classic", // figlet 不暴露 style 元数据
  heightLevel: 2,
}));
```

注意：`figlet.fontsSync()` 不包含 style/heightLevel 信息，这些字段在当前 UI 中仅用于分类展示，可统一设为默认值。

## 依赖变更

```diff
+ "figlet": "^1.11.0"
```

## 风险

- `figlet.fontsSync()` 返回的字体名与 `fonts-meta.ts` 的 id 字段需完全匹配
- 87 个 custom 字体不在 figlet 内置中，这些字体的 FontCard 将无法渲染（fallback 待定）
- figlet 在浏览器环境通过 fetch 加载字体文件，需确保字体路径可访问
