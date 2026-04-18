# FontPreviewDialog Scroll Fix Design

## Status
- [x] Approved
- [ ] Implemented
- [ ] Tested

## Problem Statement

当 ASCII 艺术文本过长时，`FontPreviewDialog` 整个对话框出现滚动条。期望效果是：
- 头部（标题 + 描述）固定不动
- 底部（复制按钮）固定不动
- **只有 ASCII 预览区域可滚动**

## Root Cause

`FontPreviewDialog` 组件的 `DialogContent` 设置了 `max-h-[90vh] overflow-auto`：

```tsx
<Dialog.DialogContent className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] overflow-auto">
```

这导致整个对话框内容区域成为滚动容器，而非只有 ASCII 预览区滚动。

## Solution

### Layout Strategy: Flexbox

将对话框内容分为三个纵向区域：
1. **Header** (`flex-shrink: 0`) - 固定高度，包含标题和描述
2. **ASCII Preview Area** (`flex: 1`, `overflow: auto`) - 自适应高度，可滚动
3. **Footer** (`flex-shrink: 0`) - 固定高度，包含复制按钮

### Implementation Details

#### 1. FontPreviewDialog Component Changes

**Before:**
```tsx
<Dialog.DialogContent className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] overflow-auto">
  <Dialog.DialogHeader>...</Dialog.DialogHeader>
  <div className="relative flex justify-center cursor-pointer min-h-32">
    <pre className="ascii-text ... overflow-auto">{ascii}</pre>
  </div>
  <div className="flex justify-end">...</div>
</Dialog.DialogContent>
```

**After:**
```tsx
<Dialog.DialogContent className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] flex flex-col">
  <Dialog.DialogHeader className="flex-shrink-0">...</Dialog.DialogHeader>
  <div className="relative flex-1 flex justify-center cursor-pointer min-h-32 overflow-auto">
    <pre className="ascii-text ... whitespace-pre">{ascii}</pre>
  </div>
  <div className="flex-shrink-0 flex justify-end">...</div>
</Dialog.DialogContent>
```

**Key changes:**
- `DialogContent`: 移除 `overflow-auto`，添加 `flex flex-col`
- ASCII 预览容器：移除内联 `min-h-32`，改为 `flex-1`，滚动发生在预览容器而非 `<pre>` 元素
- `<pre>` 元素：移除 `overflow-auto`（因为外层容器已处理滚动）
- Footer：添加 `flex-shrink-0` 确保不被压缩

#### 2. DialogContent Component Review

`DialogContent` 当前样式足够灵活（使用 `gap-4` 和默认 padding），无需修改。flex 布局会正常工作。

#### 3. Test Case

创建 `font-preview-dialog.test.tsx` 或在现有测试文件中添加：

```tsx
describe("FontPreviewDialog scroll behavior", () => {
  it("should scroll only in ASCII preview area when text is long", async () => {
    const longText = "A".repeat(500); // 长文本
    render(<FontPreviewDialog open={true} font={mockFont} text={longText} onClose={fn()} />);

    const dialog = screen.getByRole("dialog");
    const header = dialog.querySelector('[data-slot="dialog-header"]');
    const previewArea = dialog.querySelector(".ascii-preview-container");
    const footer = dialog.querySelector(".flex-shrink-0:last-child");

    // 验证 header 和 footer 不应有 overflow 属性
    expect(header).not.toHaveStyle({ overflow: "auto" });
    expect(footer).not.toHaveStyle({ overflow: "auto" });

    // 验证预览区域应该可以滚动
    expect(previewArea).toHaveStyle({ overflow: "auto" });
  });

  it("should keep header and footer visible when scrolling", () => {
    // 验证滚动后 header/footer 仍在视口内
  });
});
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/font-preview-dialog.tsx` | 修改布局结构，添加 flex 类 |
| `src/components/font-preview-dialog.test.tsx` | 添加滚动行为测试 |

## Verification Checklist

- [ ] 长文本时只有 ASCII 预览区显示滚动条
- [ ] Header（标题+描述）始终可见，不随内容滚动
- [ ] Footer（复制按钮）始终可见，不随内容滚动
- [ ] 正常长度文本时无需滚动，对话框自适应高度
- [ ] 水平方向过长的 ASCII 艺术也能正确滚动（`whitespace-pre` 处理）
- [ ] 对话框仍能正确响应 ESC 关闭
