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