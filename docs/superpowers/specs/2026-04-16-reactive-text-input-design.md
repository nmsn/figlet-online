# 输入文本触发的字体特效响应 - 设计文档

## 概述

当用户在输入框输入文本时，屏幕可见的字体卡片应自动重新渲染 ASCII art 特效。

## 问题

当前 `FontCard` 的 `loadAndRender` 只在 IntersectionObserver 触发时执行一次。当 text 变化时，已加载的卡片不会重新渲染，导致用户看不到更新后的效果。

## 解决方案

### 1. 输入节流（TextInput）

- 在 `onChange` 上加 300ms 节流
- 避免频繁渲染

### 2. FontCard 响应 text 变化

- 当 `text` prop 变化且当前状态是 `rendered`，自动重置为 `idle`
- IntersectionObserver 检测到可见卡片时会重新触发 `loadAndRender`
- 屏幕外的卡片保持懒加载，不重新渲染

### 3. 字符支持检测

- figlet 对不支持的字符返回空字符串
- 检测到输出为空时，显示 `"此字体不支持该字符"` 而非空白

### 4. 状态流

```
idle → loading → rendered
                  ↑
    (text 变化时) ←┘
```

## 实现细节

### TextInput 节流

在 `handleChange` 上加 debounce/throttle，300ms 后才调用 `onChange`。

### FontCard text 变化检测

使用 `useEffect` 监听 `text` prop 变化，当变化且状态为 `rendered` 时：
1. 设置状态为 `idle`
2. 清空 `ascii`
3. IntersectionObserver 重新检测时会触发 `loadAndRender`

### 字符不支持提示

当 `figlet.text` 返回空字符串时：
- 状态设为 `unsupported` 而非 `rendered`
- UI 显示 `"此字体不支持该字符"`
- 不显示复制提示

## 性能考虑

- 只重渲染屏幕内可见的卡片（~10-20个）
- 屏幕外几百个卡片不受影响
- 节流避免连续输入时过度渲染
