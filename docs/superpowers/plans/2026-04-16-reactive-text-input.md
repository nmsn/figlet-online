# Reactive Text Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 当用户在输入框输入文本时，屏幕可见的字体卡片自动重新渲染 ASCII art 特效；不支持的字符显示提示

**Architecture:** TextInput 添加 300ms 节流，FontCard 监听 text prop 变化并重置状态触发重新渲染，figlet 返回空字符串时显示"此字体不支持该字符"

**Tech Stack:** React hooks (useCallback, useEffect), lodash.debounce 或自定义实现

---

## Task 1: TextInput 添加节流

**Files:**
- Modify: `src/components/text-input.tsx`
- Test: `src/components/text-input.test.tsx` (新建)

---

- [ ] **Step 1: 创建 text-input 测试文件**

```typescript
// src/components/text-input.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TextInput } from "@/components/text-input";

describe("TextInput debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onChange after 300ms debounce", async () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello" } });

    // onChange should NOT be called immediately
    expect(onChange).not.toHaveBeenCalledWith("Hello");

    // After 300ms, onChange should be called
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledWith("Hello");
  });

  it("does not call onChange if user keeps typing within 300ms", async () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "H" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "He" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "Hel" } });
    vi.advanceTimersByTime(100);

    // Should not have called onChange yet
    expect(onChange).not.toHaveBeenCalled();

    // After total 300ms from first keystroke
    vi.advanceTimersByTime(100);
    expect(onChange).toHaveBeenCalledWith("Hel");
  });

  it("renders with initial value", () => {
    const onChange = vi.fn();
    render(<TextInput value="Test" onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("Test");
  });
});
```

Run: `npx vitest src/components/text-input.test.tsx`
Expected: FAIL - test file doesn't exist yet

---

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest src/components/text-input.test.tsx`
Expected: FAIL - file not found

---

- [ ] **Step 3: 实现节流**

修改 `src/components/text-input.tsx`:

```typescript
// src/components/text-input.tsx

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync localValue when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const scheduleOnChange = useCallback((newValue: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      onChange(localValue);
    }
  }, [localValue, onChange]);

  const handleBlur = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onChange(localValue);
  }, [localValue, onChange]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Input
        type="text"
        value={localValue}
        onChange={(e) => {
          handleChange(e);
          scheduleOnChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="输入任意文本，浏览全部字体效果..."
        className="text-center text-lg"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
```

---

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest src/components/text-input.test.tsx`
Expected: PASS

---

- [ ] **Step 5: 提交**

```bash
git add src/components/text-input.tsx src/components/text-input.test.tsx
git commit -m "$(cat <<'EOF'
feat: add 300ms debounce to text input

Prevents excessive re-renders when user types quickly.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: FontCard 响应 text 变化 + 字符不支持提示

**Files:**
- Modify: `src/components/font-card.tsx`
- Modify: `src/components/font-card.test.tsx`

**New RenderState type:**
```typescript
type RenderState = "idle" | "loading" | "rendered" | "error" | "unsupported";
```

---

- [ ] **Step 1: 写失败的测试 - text 变化时重置状态**

```typescript
// 在 src/components/font-card.test.tsx 添加以下测试

it("resets to idle when text prop changes", async () => {
  const mockFont = {
    id: "Standard",
    name: "Standard",
    style: "classic" as const,
    heightLevel: 2 as const,
  };

  // Mock IntersectionObserver to trigger immediately
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();
  class MockIntersectionObserver {
    observe = mockObserve;
    disconnect = mockDisconnect;
    constructor() { return this; }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

  const { rerender } = render(<FontCard font={mockFont} text="Hello" />);

  // Simulate card becoming visible and rendering
  mockObserve.mock.calls[0]?.[0]?.({ isIntersecting: true } as any);

  await waitFor(() => {
    expect(screen.queryByText("Click to load")).not.toBeInTheDocument();
  });

  // Change text prop
  rerender(<FontCard font={mockFont} text="World" />);

  // Should show "Click to load" again (state reset to idle)
  expect(screen.getByText("Click to load")).toBeInTheDocument();
});
```

Run: `npx vitest src/components/font-card.test.tsx`
Expected: FAIL - "Click to load" not found (because state doesn't reset)

---

- [ ] **Step 2: 写失败的测试 - 不支持字符显示提示**

```typescript
it('shows "此字体不支持该字符" when font does not support the text', async () => {
  const mockFont = {
    id: "Standard",
    name: "Standard",
    style: "classic" as const,
    heightLevel: 2 as const,
  };

  // Mock IntersectionObserver to trigger immediately
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();
  class MockIntersectionObserver {
    observe = mockObserve;
    disconnect = mockDisconnect;
    constructor() { return this; }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

  render(<FontCard font={mockFont} text="你好" />);

  // Trigger visible
  mockObserve.mock.calls[0]?.[0]?.({ isIntersecting: true } as any);

  await waitFor(() => {
    expect(screen.getByText("此字体不支持该字符")).toBeInTheDocument();
  });
});
```

Run: `npx vitest src/components/font-card.test.tsx`
Expected: FAIL - "此字体不支持该字符" not found

---

- [ ] **Step 3: 实现 - 响应 text 变化**

修改 `src/components/font-card.tsx`:

在 `useCallback(async () => {...})` 之后添加 `useEffect`:

```typescript
// 响应 text 变化 - 当 text 变化且当前已渲染时，重置为 idle
useEffect(() => {
  if (state === "rendered" || state === "unsupported") {
    setState("idle");
    setAscii("");
  }
}, [text, state]);
```

同时在 `loadAndRender` 的 `figlet.text` 回调中，添加空输出检测：

```typescript
figlet.text(text || " ", { font: font.id }, (err, data) => {
  if (err) {
    setState("error");
    return;
  }
  // 检查空输出 - 表示字体不支持该字符
  if (!data || data.trim() === "") {
    setState("unsupported");
    return;
  }
  setAscii(data ?? "");
  setState("rendered");
  onVisible?.();
});
```

---

- [ ] **Step 4: 实现 - unsupported 状态 UI**

在 `FontCard` 的 return JSX 中，添加 unsupported 状态的渲染：

```tsx
{state === "unsupported" && (
  <span className="text-muted text-xs text-center px-2">
    此字体不支持该字符
  </span>
)}
```

**注意：** 把原来的 `{state === "error" && ...}` 保持不变，添加新的 unsupported 分支。

---

- [ ] **Step 5: 运行测试确认通过**

Run: `npx vitest src/components/font-card.test.tsx`
Expected: PASS

---

- [ ] **Step 6: 提交**

```bash
git add src/components/font-card.tsx src/components/font-card.test.tsx
git commit -m "$(cat <<'EOF'
feat: make FontCard responsive to text changes

- Reset state to idle when text prop changes, triggering re-render
- Show "此字体不支持该字符" when figlet returns empty output

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## 验证

- [ ] **集成测试**: 在浏览器中打开页面，输入 "Hello" 确认可见卡片渲染
- [ ] **输入节流测试**: 快速输入文字，确认只有停止输入 300ms 后才触发重渲染
- [ ] **字符不支持测试**: 输入 "你好" 确认显示不支持提示
- [ ] **懒加载测试**: 滚动页面确认屏幕外卡片正确懒加载

Run: `npx vitest` (all tests)
Expected: All PASS
