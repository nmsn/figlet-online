# Figlet NPM 重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 `figlet` npm 包替换现有的自定义 parser + renderer，简化架构

**Architecture:** 客户端直接调用 `figlet.text()` 渲染 ASCII，字体元数据从 figlet 内置列表动态生成，删除废弃的 parser/renderer 和 API 路由

**Tech Stack:** `figlet` ^1.11.0

---

## 文件变更概览

| 操作 | 文件 |
|------|------|
| 修改 | `src/components/font-card.tsx` |
| 修改 | `src/lib/figlet/fonts-meta.ts` |
| 删除 | `src/lib/figlet/parser.ts` |
| 删除 | `src/lib/figlet/renderer.ts` |
| 删除 | `src/app/api/fonts/route.ts` |
| 删除 | `src/app/api/fonts/[id]/route.ts` |

---

## Task 1: 修改 fonts-meta.ts 使用 figlet 内置字体列表

**文件:** 修改: `src/lib/figlet/fonts-meta.ts`

- [ ] **Step 1: 读取现有文件内容确认结构**

```bash
head -20 /Users/nmsn/Studio/figlet-online/src/lib/figlet/fonts-meta.ts
```

- [ ] **Step 2: 用 figlet.fontsSync() 动态生成替换静态数组**

将文件内容替换为:

```ts
import figlet from "figlet";

export type FontStyle = "classic" | "3d" | "script" | "block" | "retro" | "fun" | "thin";

export interface FontMeta {
  id: string;
  name: string;
  style: FontStyle;
  heightLevel: 1 | 2 | 3;
}

export const allFontsMeta: FontMeta[] = figlet.fontsSync().map(name => ({
  id: name,
  name,
  style: "classic" as FontStyle,
  heightLevel: 2 as const,
}));

export function getFontById(id: string): FontMeta | undefined {
  return allFontsMeta.find(f => f.id === id);
}
```

- [ ] **Step 3: 运行类型检查确认无错误**

```bash
cd /Users/nmsn/Studio/figlet-online && npx tsc --noEmit 2>&1 | head -30
```

预期: 无类型错误

- [ ] **Step 4: 提交**

```bash
git add src/lib/figlet/fonts-meta.ts && git commit -m "refactor: generate fonts-meta from figlet.fontsSync()"
```

---

## Task 2: 修改 font-card.tsx 使用 figlet.text()

**文件:** 修改: `src/components/font-card.tsx`

- [ ] **Step 1: 读取现有文件**

- [ ] **Step 2: 替换 import 和渲染逻辑**

`import` 部分:
```ts
import figlet from "figlet";
// 删除: import { parseFlf } from "@/lib/figlet/parser";
// 删除: import { renderText, cleanAsciiOutput } from "@/lib/figlet/renderer";
```

`loadAndRender` 函数替换为:
```ts
const loadAndRender = useCallback(async () => {
  if (state !== "idle") return;
  setState("loading");
  figlet.text(text || " ", { font: font.id }, (err, data) => {
    if (err) {
      setState("error");
      return;
    }
    setAscii(data ?? "");
    setState("rendered");
    onVisible?.();
  });
}, [font.id, text, state, onVisible]);
```

`handleDoubleClick` 中的 `cleanAsciiOutput` 移除（figlet 输出不需要处理 hardblank）:
```ts
// 直接使用 ascii，不需要 cleanAsciiOutput
```

- [ ] **Step 3: 运行 lint 检查**

```bash
cd /Users/nmsn/Studio/figlet-online && npm run lint 2>&1 | head -30
```

预期: 无 lint 错误

- [ ] **Step 4: 提交**

```bash
git add src/components/font-card.tsx && git commit -m "refactor: use figlet.text() instead of custom parser/renderer"
```

---

## Task 3: 删除废弃文件

**文件:** 删除: `src/lib/figlet/parser.ts`, `src/lib/figlet/renderer.ts`, `src/app/api/fonts/route.ts`, `src/app/api/fonts/[id]/route.ts`

- [ ] **Step 1: 确认没有其他文件引用这些模块**

```bash
grep -r "from.*parser" /Users/nmsn/Studio/figlet-online/src/ --include="*.ts" --include="*.tsx"
grep -r "from.*renderer" /Users/nmsn/Studio/figlet-online/src/ --include="*.ts" --include="*.tsx"
grep -r "from.*figlet/renderer" /Users/nmsn/Studio/figlet-online/src/ --include="*.ts" --include="*.tsx"
```

预期: 仅 font-card.tsx 引用，且 font-card.tsx 已在 Task 2 中处理

- [ ] **Step 2: 删除文件**

```bash
cd /Users/nmsn/Studio/figlet-online && rm src/lib/figlet/parser.ts src/lib/figlet/renderer.ts src/app/api/fonts/route.ts src/app/api/fonts/[id]/route.ts && rmdir src/app/api/fonts/[id] src/app/api/fonts 2>/dev/null; echo "done"
```

- [ ] **Step 3: 检查 src/lib/figlet 目录是否还有其他文件**

```bash
ls /Users/nmsn/Studio/figlet-online/src/lib/figlet/
```

预期: 仅剩 `fonts-meta.ts`

- [ ] **Step 4: 运行构建确认无错误**

```bash
cd /Users/nmsn/Studio/figlet-online && npm run build 2>&1 | tail -20
```

预期: 构建成功

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "refactor: remove custom parser/renderer and fonts API routes"
```

---

## Task 4: 验证功能

- [ ] **Step 1: 启动开发服务器**

```bash
cd /Users/nmsn/Studio/figlet-online && npm run dev &
sleep 5
```

- [ ] **Step 2: 访问页面确认字体墙正常渲染**

打开 http://localhost:3000，确认:
1. 页面加载无白屏
2. 输入框输入文字后，字体卡片能正常渲染 ASCII art
3. 无 console error

- [ ] **Step 3: 双击复制确认工作正常**

---

## 完成后清理

- `public/fonts/` 目录可选择保留或删除（不影响 figlet 内置字体工作）
- 如需清理，执行: `rm -rf /Users/nmsn/Studio/figlet-online/public/fonts`
