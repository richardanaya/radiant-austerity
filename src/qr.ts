/**
 * Byte-mode QR Code, versions 1–6, error correction L and M.
 * Matrix cells are true when the module is dark.
 */

export type QrLevel = "L" | "M";

type BlockGroup = { count: number; data: number; ec: number };

const LEVEL_BITS: Record<QrLevel, number> = { L: 0b01, M: 0b00 };

/** One group per version/level. Counts are the ISO table for versions 1–6. */
const SPECS: Record<string, BlockGroup> = {
  "1-L": { count: 1, data: 19, ec: 7 },
  "1-M": { count: 1, data: 16, ec: 10 },
  "2-L": { count: 1, data: 34, ec: 10 },
  "2-M": { count: 1, data: 28, ec: 16 },
  "3-L": { count: 1, data: 55, ec: 15 },
  "3-M": { count: 1, data: 44, ec: 26 },
  "4-L": { count: 1, data: 80, ec: 20 },
  "4-M": { count: 2, data: 32, ec: 18 },
  "5-L": { count: 1, data: 108, ec: 26 },
  "5-M": { count: 2, data: 43, ec: 24 },
  "6-L": { count: 2, data: 68, ec: 18 },
  "6-M": { count: 4, data: 27, ec: 16 },
};

const ALIGNMENT: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
};

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

{
  let value = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = value;
    LOG[value] = i;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255] ?? 0;
}

function mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] ?? 0) + (LOG[b] ?? 0)] ?? 0;
}

function generator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] = (next[j] ?? 0) ^ (poly[j] ?? 0);
      next[j + 1] = (next[j + 1] ?? 0) ^ mul(poly[j] ?? 0, EXP[i] ?? 0);
    }
    poly = next;
  }
  return poly;
}

function remainder(data: number[], degree: number): number[] {
  const gen = generator(degree);
  let result = data.concat(new Array<number>(degree).fill(0));
  while (result.length - gen.length >= 0) {
    const coeff = result[0] ?? 0;
    for (let i = 0; i < gen.length; i += 1) {
      result[i] = (result[i] ?? 0) ^ mul(gen[i] ?? 0, coeff);
    }
    let offset = 0;
    while (offset < result.length && result[offset] === 0) offset += 1;
    result = result.slice(offset);
  }
  if (result.length >= degree) return result;
  return new Array<number>(degree - result.length).fill(0).concat(result);
}

function sizeOf(version: number): number {
  return 17 + version * 4;
}

function capacityBytes(spec: BlockGroup): number {
  const codewords = spec.count * spec.data;
  return Math.floor((codewords * 8 - 12) / 8);
}

export function chooseQrVersion(text: string, level: QrLevel = "L"): number {
  const bytes = new TextEncoder().encode(text).length;
  for (let version = 1; version <= 6; version += 1) {
    const spec = SPECS[`${version}-${level}`];
    if (spec && bytes <= capacityBytes(spec)) return version;
  }
  throw new Error("QR text is longer than version 6 can hold in this kit.");
}

function dataCodewords(bytes: Uint8Array, total: number): number[] {
  const bits: number[] = [];
  const push = (value: number, width: number) => {
    for (let i = width - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, 8);
  for (const byte of bytes) push(byte, 8);
  const capacity = total * 8;
  const terminator = Math.min(4, capacity - bits.length);
  for (let i = 0; i < terminator; i += 1) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const words: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let word = 0;
    for (let b = 0; b < 8; b += 1) word = (word << 1) | (bits[i + b] ?? 0);
    words.push(word);
  }
  const pads = [0xec, 0x11];
  let pad = 0;
  while (words.length < total) {
    words.push(pads[pad % 2] ?? 0);
    pad += 1;
  }
  return words;
}

function interleave(blocks: number[][], ecBlocks: number[][]): number[] {
  const out: number[] = [];
  const dataLen = Math.max(...blocks.map(block => block.length));
  for (let i = 0; i < dataLen; i += 1) {
    for (const block of blocks) {
      if (i < block.length) out.push(block[i] ?? 0);
    }
  }
  const ecLen = ecBlocks[0]?.length ?? 0;
  for (let i = 0; i < ecLen; i += 1) {
    for (const block of ecBlocks) out.push(block[i] ?? 0);
  }
  return out;
}

function formatBits(level: QrLevel, mask: number): number {
  const data = ((LEVEL_BITS[level] << 3) | mask) & 0b11111;
  let rem = data << 10;
  for (let i = 0; i < 5; i += 1) {
    if ((rem & (1 << (14 - i))) !== 0) rem ^= 0b10100110111 << (4 - i);
  }
  return ((data << 10) | (rem & 0x3ff)) ^ 0b101010000010010;
}

type Grid = { dark: boolean[][]; fn: boolean[][] };

function paint(grid: Grid, row: number, col: number, dark: boolean) {
  const line = grid.dark[row];
  const flags = grid.fn[row];
  if (!line || !flags) return;
  line[col] = dark;
  flags[col] = true;
}

function finder(grid: Grid, row: number, col: number) {
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      const y = row + r;
      const x = col + c;
      if (y < 0 || x < 0 || y >= grid.dark.length || x >= grid.dark.length) continue;
      const on =
        r >= 0 &&
        r <= 6 &&
        c >= 0 &&
        c <= 6 &&
        (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      paint(grid, y, x, on);
    }
  }
}

function alignment(grid: Grid, row: number, col: number) {
  for (let r = -2; r <= 2; r += 1) {
    for (let c = -2; c <= 2; c += 1) {
      const edge = Math.max(Math.abs(r), Math.abs(c));
      paint(grid, row + r, col + c, edge !== 1);
    }
  }
}

function blank(size: number): Grid {
  return {
    dark: Array.from({ length: size }, () => Array.from({ length: size }, () => false)),
    fn: Array.from({ length: size }, () => Array.from({ length: size }, () => false)),
  };
}

function reserveFunctions(grid: Grid, version: number) {
  const size = grid.dark.length;
  finder(grid, 0, 0);
  finder(grid, 0, size - 7);
  finder(grid, size - 7, 0);
  for (let i = 8; i < size - 8; i += 1) {
    paint(grid, 6, i, i % 2 === 0);
    paint(grid, i, 6, i % 2 === 0);
  }
  const centers = ALIGNMENT[version] ?? [];
  for (const row of centers) {
    for (const col of centers) {
      const nearFinder =
        (row < 9 && col < 9) || (row < 9 && col > size - 10) || (row > size - 10 && col < 9);
      if (!nearFinder) alignment(grid, row, col);
    }
  }
  for (let i = 0; i < 9; i += 1) {
    if (i === 6) continue;
    paint(grid, 8, i, grid.dark[8]?.[i] ?? false);
    paint(grid, i, 8, grid.dark[i]?.[8] ?? false);
  }
  paint(grid, 8, 8, false);
  for (let i = 0; i < 8; i += 1) paint(grid, 8, size - 1 - i, false);
  for (let i = 0; i < 7; i += 1) paint(grid, size - 1 - i, 8, false);
  paint(grid, size - 8, 8, true);
}

function placeData(grid: Grid, words: number[]) {
  const bits: number[] = [];
  for (const word of words) {
    for (let i = 7; i >= 0; i -= 1) bits.push((word >>> i) & 1);
  }
  const size = grid.dark.length;
  let index = 0;
  let col = size - 1;
  let upward = true;
  while (col > 0) {
    if (col === 6) col = 5;
    for (let i = 0; i < size; i += 1) {
      const row = upward ? size - 1 - i : i;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = col - offset;
        if (grid.fn[row]?.[x]) continue;
        const bit = bits[index] ?? 0;
        index += 1;
        const line = grid.dark[row];
        if (line) line[x] = bit === 1;
      }
    }
    upward = !upward;
    col -= 2;
  }
}

function applyMask(grid: Grid, mask: number): boolean[][] {
  const size = grid.dark.length;
  const out = grid.dark.map(row => row.slice());
  const hit = (row: number, col: number) => {
    switch (mask) {
      case 0:
        return (row + col) % 2 === 0;
      case 1:
        return row % 2 === 0;
      case 2:
        return col % 3 === 0;
      case 3:
        return (row + col) % 3 === 0;
      case 4:
        return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
      case 5:
        return ((row * col) % 2) + ((row * col) % 3) === 0;
      case 6:
        return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
      default:
        return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    }
  };
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (grid.fn[row]?.[col]) continue;
      if (hit(row, col)) {
        const line = out[row];
        if (line) line[col] = !line[col];
      }
    }
  }
  return out;
}

function writeFormat(matrix: boolean[][], level: QrLevel, mask: number) {
  const bits = formatBits(level, mask);
  const size = matrix.length;
  for (let i = 0; i < 15; i += 1) {
    const dark = ((bits >>> i) & 1) === 1;
    if (i < 6) {
      const line = matrix[i];
      if (line) line[8] = dark;
    } else if (i < 8) {
      const line = matrix[i + 1];
      if (line) line[8] = dark;
    } else {
      const line = matrix[size - 15 + i];
      if (line) line[8] = dark;
    }
    const row = matrix[8];
    if (!row) continue;
    if (i < 8) row[size - i - 1] = dark;
    else if (i < 9) row[15 - i - 1 + 1] = dark;
    else row[15 - i - 1] = dark;
  }
  const darkLine = matrix[size - 8];
  if (darkLine) darkLine[8] = true;
}

function penalty(matrix: boolean[][]): number {
  const size = matrix.length;
  let score = 0;
  const run = (dark: boolean, length: number) => {
    if (length >= 5) score += 3 + (length - 5);
    return dark;
  };
  for (let row = 0; row < size; row += 1) {
    let length = 1;
    for (let col = 1; col < size; col += 1) {
      if (matrix[row]?.[col] === matrix[row]?.[col - 1]) length += 1;
      else {
        run(matrix[row]?.[col - 1] ?? false, length);
        length = 1;
      }
    }
    run(matrix[row]?.[size - 1] ?? false, length);
  }
  for (let col = 0; col < size; col += 1) {
    let length = 1;
    for (let row = 1; row < size; row += 1) {
      if (matrix[row]?.[col] === matrix[row - 1]?.[col]) length += 1;
      else {
        run(matrix[row - 1]?.[col] ?? false, length);
        length = 1;
      }
    }
    run(matrix[size - 1]?.[col] ?? false, length);
  }
  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const value = matrix[row]?.[col];
      if (
        value === matrix[row]?.[col + 1] &&
        value === matrix[row + 1]?.[col] &&
        value === matrix[row + 1]?.[col + 1]
      ) {
        score += 3;
      }
    }
  }
  const finder = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const reversed = [...finder].reverse();
  const scan = (line: boolean[]) => {
    for (let i = 0; i <= line.length - finder.length; i += 1) {
      const window = line.slice(i, i + finder.length).map(cell => (cell ? 1 : 0));
      const same = (pattern: number[]) => pattern.every((bit, index) => bit === window[index]);
      if (same(finder) || same(reversed)) score += 40;
    }
  };
  for (let row = 0; row < size; row += 1) scan(matrix[row] ?? []);
  for (let col = 0; col < size; col += 1) scan(matrix.map(row => row[col] ?? false));
  let dark = 0;
  for (const row of matrix) for (const cell of row) if (cell) dark += 1;
  score += Math.floor(Math.abs(dark / (size * size) - 0.5) / 0.05) * 10;
  return score;
}

export function qrMatrix(text: string, level: QrLevel = "L", version = chooseQrVersion(text, level)): boolean[][] {
  const spec = SPECS[`${version}-${level}`];
  if (!spec) throw new Error(`Unsupported QR version ${version}-${level}.`);
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > capacityBytes(spec)) {
    throw new Error(`QR text does not fit version ${version} level ${level}.`);
  }
  const words = dataCodewords(bytes, spec.count * spec.data);
  const blocks: number[][] = [];
  const ecBlocks: number[][] = [];
  for (let i = 0; i < spec.count; i += 1) {
    const block = words.slice(i * spec.data, (i + 1) * spec.data);
    blocks.push(block);
    ecBlocks.push(remainder(block, spec.ec));
  }
  const stream = interleave(blocks, ecBlocks);
  const grid = blank(sizeOf(version));
  reserveFunctions(grid, version);
  placeData(grid, stream);
  let best: boolean[][] | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask += 1) {
    const masked = applyMask(grid, mask);
    writeFormat(masked, level, mask);
    const score = penalty(masked);
    if (score < bestScore) {
      bestScore = score;
      best = masked;
    }
  }
  return best ?? grid.dark;
}

export function qrSvg(text: string, level: QrLevel = "L"): string {
  const matrix = qrMatrix(text, level);
  const quiet = 4;
  const size = matrix.length + quiet * 2;
  const rects: string[] = [];
  matrix.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x]) {
        const start = x;
        while (x < row.length && row[x]) x += 1;
        rects.push(
          `<rect x="${start + quiet}" y="${y + quiet}" width="${x - start}" height="1"/>`,
        );
      } else {
        x += 1;
      }
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">${rects.join("")}</svg>`;
}
