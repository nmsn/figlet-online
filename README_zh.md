# Figlet Fonts — ASCII 艺术文字生成器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

[English](./README.md) | 中文

在线浏览 **353 个 figlet 内置字体**，即时生成 ASCII 艺术文字效果。无需安装，无需命令行 — 输入文字即可探索所有字体。

## 功能特点

- **353 种字体** — 所有 figlet 内置字体即时可用
- **实时预览** — 输入任意文字，所有字体同时渲染
- **深色/浅色主题** — 支持主题切换与系统偏好检测
- **强调色** — 自定义标题强调色
- **动画标题** — Logo 上的随机滚动动画效果
- **响应式设计** — 适配桌面端和移动端

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 语言 | [TypeScript](https://www.typescriptlang.org/) |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| 动画 | [Motion](https://motion.dev/) + [GSAP](https://greensock.com/gsap/) |
| FIGlet 引擎 | [figlet](https://www.npmjs.com/package/figlet) |

## 使用方法

1. 打开网站
2. 在输入框中输入文字
3. 滚动浏览 353 种字体预览
4. 根据需要切换主题或选择强调色

## 与其他 Figlet 项目的区别

与传统命令行 figlet 工具对比：

| | Figlet CLI | **Figlet Fonts 在线版** |
|---|---|---|
| 安装 | 需要安装 | 无需安装 — 浏览器直接运行 |
| 字体预览 | 一次一个字体 | 所有 353 种字体同时展示 |
| 主题支持 | 无 | 深色/浅色模式 + 强调色 |
| 动画效果 | 无 | 标题随机滚动效果 |
| 移动端 | 不支持 | 响应式设计 |

与其他网页版实现对比：

| | 其他网页版 | **Figlet Fonts 在线版** |
|---|---|---|
| 字体数量 | 有限的精选字体 | 全部 353 种内置字体 |
| 实时预览 | 单个字体 | 所有字体同步更新 |
| 技术栈 | 旧的 jQuery/原生 JS | Next.js + Tailwind v4 + TypeScript |
| 用户体验 | 基础输入 | 动画效果、精致的界面 |

## 开发

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 在浏览器中预览。

## 开源协议

MIT
