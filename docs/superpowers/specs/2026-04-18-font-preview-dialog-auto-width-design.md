# FontPreviewDialog Auto Width Design

## Status
- [x] Approved
- [ ] Implemented
- [ ] Tested

## Problem Statement

当 ASCII 艺术文本过宽时，`FontPreviewDialog` 显示横向滚动条。但用户希望对话框能够自动扩展宽度以容纳更宽的内容，而不是直接显示滚动条。

**期望效果：**
- ASCII 艺术过宽时，对话框按需扩大宽度
- 但有最大宽度限制（不超过屏幕边界）

## Root Cause

`FontPreviewDialog` 的 `DialogContent` 设置了固定宽度约束：

```tsx
className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] flex flex-col"
```

- `max-w-4xl`：限制了最大宽度为固定值
- `w-[90vw]`：宽度固定为视口的 90%

这导致对话框宽度不会随内容自动扩展。

## Solution

### Layout Strategy: CSS Intrinsic Sizing

使用 CSS 的 `fit-content` 特性，让对话框宽度由内容决定，但设置合理的最大宽度限制。

### Implementation Details

#### FontPreviewDialog Component Changes

**Before:**
```tsx
<Dialog.DialogContent className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] flex flex-col">
```

**After:**
```tsx
<Dialog.DialogContent className="w-auto max-w-[95vw] max-h-[90vh] flex flex-col">
```

**Key changes:**
- `max-w-4xl` → `max-w-[95vw]`：移除固定的 xl 限制，改为 95vw 上限（不超过屏幕边界）
- `w-[90vw]` → `w-auto`：宽度由内容决定（fit-content 行为）
- 保留 `min-w-125`：确保对话框最小宽度不会太小

#### Why This Works

1. **`w-auto`**：对话框宽度由其内容决定，当 ASCII 艺术很宽时，对话框会自动扩展
2. **`max-w-[95vw]`**：确保对话框永远不会超出屏幕，提供硬性上限
3. **配合 `whitespace-pre` on `<pre>`**：ASCII 艺术会保持原始换行格式，不会折行

#### Preview Area Adjustments

ASCII 预览区 `<pre>` 元素当前使用 `whitespace-pre`，这意味着：
- 文本会保持原始格式，不会自动换行
- 当文本过宽时，会撑开父容器宽度

如果需要水平滚动作为 fallback，可以保留 `overflow-auto`，但由于 dialog 本身会扩展，可能不需要。

## Files to Modify

| File | Change |
|------|--------|
| `src/components/font-preview-dialog.tsx` | 修改 DialogContent className |

## Verification Checklist

- [ ] ASCII 艺术过宽时，对话框宽度自动扩展
- [ ] 对话框最大宽度不超过屏幕边界（95vw）
- [ ] 对话框最小宽度保持 125（min-w-125）
- [ ] 短 ASCII 艺术时，对话框保持合理默认宽度
