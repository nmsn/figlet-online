# Font Wall 自动加载 & 布局优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
1. FontCard 使用 IntersectionObserver 自动加载（点击 → 自动渲染）
2. 增大卡片尺寸（180px）、间距（20px）、减少列数（3列 desktop）
3. 滚动条从容器移到页面级别

**Tech Stack:** React, IntersectionObserver, @tanstack/react-virtual

---

## Task 1: TDD — FontCard 自动加载测试

**文件:** 修改: `src/components/font-card.tsx`

- [ ] **Step 1: 写测试 — FontCard 在可见时自动加载**

```tsx
// src/components/font-card.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FontCard } from "@/components/font-card";

const mockFont = { id: "Standard", name: "Standard", style: "classic" as const, heightLevel: 2 as const };

describe("FontCard auto-load", () => {
  it("renders idle state initially", () => {
    render(<FontCard font={mockFont} text="Hi" />);
    expect(screen.getByText("Click to load")).toBeInTheDocument();
  });

  it("does NOT render ASCII when not mounted (SSR safety)", () => {
    // FontCard should handle SSR gracefully - state starts as "idle"
    const { container } = render(<FontCard font={mockFont} text="Hi" />);
    expect(container.querySelector(".ascii-text")).toBeNull();
  });
});
```

```bash
cd /Users/nmsn/Studio/figlet-online && npx jest src/components/font-card.test.tsx 2>&1 | head -20
```
预期: 测试通过（idle 状态渲染 "Click to load"）

- [ ] **Step 2: 写测试 — FontCard IntersectionObserver 触发加载**

```tsx
it("calls figlet.text when card becomes visible", async () => {
  const observer = new IntersectionObserver();
  vi.spyOn(observer, "observe");
  vi.spyOn(observer, "disconnect");

  render(<FontCard font={mockFont} text="Hi" />);

  // Simulate card entering viewport by calling the internal callback
  // (Test will be implemented after seeing actual observer integration)
});
```

- [ ] **Step 3: 提交**

```bash
git add src/components/font-card.test.tsx && git commit -m "test: add FontCard auto-load tests"
```

---

## Task 2: 实现 FontCard 自动加载

**文件:** 修改: `src/components/font-card.tsx`

- [ ] **Step 1: 添加 IntersectionObserver 逻辑**

在 `FontCard` 组件中添加:

```tsx
import { useEffect, useRef } from "react";

// 在组件内添加 ref
const cardRef = useRef<HTMLDivElement>(null);

// 添加 useEffect
useEffect(() => {
  if (state !== "idle") return;

  const el = cardRef.current;
  if (!el) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadAndRender();
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(el);
  return () => observer.disconnect();
}, [state, loadAndRender]);
```

- [ ] **Step 2: 在 JSX 中给外层 div 添加 ref**

```tsx
<div
  ref={cardRef}
  className={cn(
    "relative bg-card border border-card-border rounded-lg p-3 cursor-pointer",
    "transition-all duration-150 hover:border-card-hover hover:bg-card-hover",
    "select-none min-h-[180px] flex flex-col",
    isCopied && "border-accent"
  )}
  onClick={handleClick}
  onDoubleClick={handleDoubleClick}
>
```

- [ ] **Step 3: 运行 lint 检查**

```bash
cd /Users/nmsn/Studio/figlet-online && npm run lint 2>&1 | head -20
```
预期: 无 lint 错误

- [ ] **Step 4: 提交**

```bash
git add src/components/font-card.tsx && git commit -m "feat: auto-load font cards on visible via IntersectionObserver"
```

---

## Task 3: 优化 FontWall 布局参数

**文件:** 修改: `src/components/font-wall.tsx`

- [ ] **Step 1: 更新布局常量**

```tsx
const COLS = 3; // desktop (was 4)
const CARD_HEIGHT = 180; // was 140
const GAP = 20; // was 12
```

- [ ] **Step 2: 移除 overflow-auto 和 contain 样式**

```tsx
// 移除 style={{ contain: "strict" }}
// 移除 className="min-h-[calc(100vh-120px)] overflow-auto"
// 改为:
className="w-full"
```

- [ ] **Step 3: 更新骨架屏网格列数**

```tsx
// 骨架屏也用 3 列:
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5"
```

- [ ] **Step 4: 提交**

```bash
git add src/components/font-wall.tsx && git commit -m "feat: increase card size (180px) and gap (20px), 3 cols desktop"
```

---

## Task 4: 修复 page.tsx 页面滚动

**文件:** 修改: `src/app/page.tsx`

- [ ] **Step 1: 恢复 min-h-screen 和容器布局**

```tsx
// 替换:
return (
  <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// 为:
return (
  <main className="min-h-screen">
```

```tsx
// 替换:
<div className="container mx-auto px-4 py-6" style={{ flex: 1 }}>
// 为:
<div className="container mx-auto px-4 py-6">
```

- [ ] **Step 2: 提交**

```bash
git add src/app/page.tsx && git commit -m "fix: page-level scrolling instead of container-scoped"
```

---

## Task 5: 验证功能

- [ ] **Step 1: 启动 dev server 并检查渲染**

```bash
pkill -f "next dev" 2>/dev/null; sleep 1
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 8
```

- [ ] **Step 2: Playwright 检查**

1. 页面加载后，首屏卡片自动渲染（无需点击）
2. 滚动页面，滚动条在页面级别而非容器内
3. 卡片尺寸更大，间距更宽
4. 0 个 console error

```bash
# 验证构建
npm run build 2>&1 | tail -10
# 预期: 成功
```

- [ ] **Step 3: 最终 commit**

```bash
git add -A && git commit -m "feat: auto-load and layout improvements complete"
```
