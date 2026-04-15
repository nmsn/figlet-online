// src/lib/figlet/parser.ts

export interface FlfHeader {
  height: number;
  baseline: number;
  maxLength: number;
  layout: number;
  commentLines: number;
  direction: number;
  codetagCount: number;
  charCount: number;
}

export interface FlfFont {
  header: FlfHeader;
  comment: string;
  /** Map from char code (0-255) to array of height strings */
  chars: Map<number, string[]>;
  /** The char used for end-of-line marker, stored separately */
  hardblank: string;
}

function parseHeader(lines: string[]): { header: FlfHeader; headerLineIndex: number } {
  const firstLine = lines[0];
  const match = firstLine.match(/^flf2a\$\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (!match) {
    throw new Error(`Invalid flf header: ${firstLine}`);
  }
  const [, height, baseline, maxLength, layout, commentLines, direction, codetagCount, charCount] = match.map(Number);
  return {
    header: { height, baseline, maxLength, layout, commentLines, direction, codetagCount, charCount },
    headerLineIndex: 0,
  };
}

/**
 * Parse a .flf file content into a FlfFont structure.
 * The .flf format is:
 * - Line 0: header "flf2a$ h b l c d t n"
 * - Lines 1..commentLines: comment text (font name, author, etc.)
 * - Then charCount characters, each with `height` lines
 * - Last char is "hardblank" char (endmark for each line)
 */
export function parseFlf(content: string): FlfFont {
  const lines = content.split(/\r?\n/);
  const { header, headerLineIndex } = parseHeader(lines);

  const dataStart = headerLineIndex + 1 + header.commentLines;
  const chars = new Map<number, string[]>();

  let lineIdx = dataStart;
  // ASCII chars start at code 32 (' ')
  // Characters are stored sequentially: code 32, 33, 34, ...
  for (let charCode = 32; charCode < 32 + header.charCount && lineIdx < lines.length; charCode++) {
    const charLines: string[] = [];
    for (let row = 0; row < header.height; row++) {
      if (lineIdx >= lines.length) break;
      charLines.push(lines[lineIdx]);
      lineIdx++;
    }
    if (charLines.length > 0) {
      chars.set(charCode, charLines);
    }
  }

  // Hardblank is the last character stored (used for endmark)
  const lastCharCode = 32 + header.charCount - 1;
  const lastCharLines = chars.get(lastCharCode);
  const hardblank = lastCharLines && lastCharLines[0] ? lastCharLines[0].slice(-1) : ' ';

  return { header, comment: "", chars, hardblank };
}
