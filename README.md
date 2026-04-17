# Figlet Fonts — ASCII Art Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

[中文](./README_zh.md) | English

Browse **353 built-in figlet fonts** and generate ASCII art text effects in your browser. No installation, no command line — just type and explore.

## Features

- **353 Fonts** — All figlet built-in fonts available instantly
- **Live Preview** — Type any text and see it rendered in all fonts simultaneously
- **Dark/Light Theme** — Toggle between themes with system preference detection
- **Accent Colors** — Customize the title accent color
- **Animated Header** — Interactive shuffle animation on the logo
- **Responsive Design** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Animation | [Motion](https://motion.dev/) + [GSAP](https://greensock.com/gsap/) |
| FIGlet Engine | [figlet](https://www.npmjs.com/package/figlet) |

## Usage

1. Open the website
2. Type your text in the input field
3. Scroll through 353 font previews
4. Toggle theme or pick accent colors as desired

## How It's Different

Unlike traditional command-line figlet tools:

| | Figlet CLI | **Figlet Fonts Online** |
|---|---|---|
| Installation | Required | None — runs in browser |
| Font Preview | One font at a time | All 353 fonts at once |
| Theme Support | No | Dark/light mode + accent colors |
| Animation | No | Shuffle effect on title |
| Mobile | No | Responsive design |

Unlike other web implementations:

| | Others | **Figlet Fonts Online** |
|---|---|---|
| Font Count | Limited selection | All 353 built-in fonts |
| Live Preview | Single font | All fonts update simultaneously |
| Modern Stack | Old jQuery/vanilla JS | Next.js + Tailwind v4 + TypeScript |
| UX | Basic input | Animated, polished interface |

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## License

MIT
