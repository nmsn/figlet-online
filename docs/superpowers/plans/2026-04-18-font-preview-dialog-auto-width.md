# FontPreviewDialog Auto Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make FontPreviewDialog width auto-expand to fit content, with a 95vw max limit.

**Architecture:** CSS-only change - replace fixed width constraints with `w-auto` and `max-w-[95vw]`.

**Tech Stack:** React, Tailwind CSS

---

## File Inventory

| File | Responsibility |
|------|----------------|
| `src/components/font-preview-dialog.tsx` | Single line CSS class change |

---

## Task 1: Update DialogContent Width

**Files:**
- Modify: `src/components/font-preview-dialog.tsx:38`

- [ ] **Step 1: Update DialogContent className**

Change line 38 from:
```tsx
<Dialog.DialogContent className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] flex flex-col">
```

To:
```tsx
<Dialog.DialogContent className="w-auto max-w-[95vw] min-w-125 max-h-[90vh] flex flex-col">
```

**What changed:**
- `max-w-4xl` → `max-w-[95vw]`：移除固定 xl 限制，改为 95vw 上限
- `w-[90vw]` → `w-auto`：宽度由内容决定

- [ ] **Step 2: Manual verification**

Start dev server: `pnpm dev`
1. 打开任意字体预览
2. 输入很长的文本（如 100+ 字符）
3. 验证对话框宽度是否扩展以容纳内容
4. 验证对话框不会超出屏幕边界

- [ ] **Step 3: Commit**

```bash
git add src/components/font-preview-dialog.tsx
git commit -m "feat: auto-expand dialog width for wide ASCII art

- w-auto lets dialog width follow content
- max-w-[95vw] prevents overflow beyond screen
- keeps min-w-125 for minimum readable width"
```

---

## Verification Checklist

- [ ] ASCII 艺术过宽时，对话框宽度自动扩展
- [ ] 对话框最大宽度不超过屏幕边界（95vw）
- [ ] 对话框最小宽度保持 125（min-w-125）
- [ ] 短 ASCII 艺术时，对话框保持合理默认宽度

---

## Self-Review Checklist

**Spec coverage:**
- [x] "ASCII 艺术过宽时，对话框按需扩大" → Task 1 `w-auto`
- [x] "最大宽度限制" → Task 1 `max-w-[95vw]`

**Placeholder scan:** No TBD/TODO. Single line change, no complexity.

**Type consistency:** N/A - CSS-only change, no types involved.
