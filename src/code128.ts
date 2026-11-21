/**
 * Code 128, set B, for printable ASCII.
 * Patterns are the ISO/IEC 15417 symbol widths: 1 is a dark module.
 * Stop is the only 13-module symbol. The rest are 11.
 */

const BARS = [
  0b11011001100, 0b11001101100, 0b11001100110, 0b10010011000, 0b10010001100, 0b10001001100,
  0b10011001000, 0b10011000100, 0b10001100100, 0b11001001000, 0b11001000100, 0b11000100100,
  0b10110011100, 0b10011011100, 0b10011001110, 0b10111001100, 0b10011101100, 0b10011100110,
  0b11001110010, 0b11001011100, 0b11001001110, 0b11011100100, 0b11001110100, 0b11101101110,
  0b11101001100, 0b11100101100, 0b11100100110, 0b11101100100, 0b11100110100, 0b11100110010,
  0b11011011000, 0b11011000110, 0b11000110110, 0b10100011000, 0b10001011000, 0b10001000110,
  0b10110001000, 0b10001101000, 0b10001100010, 0b11010001000, 0b11000101000, 0b11000100010,
  0b10110111000, 0b10110001110, 0b10001101110, 0b10111011000, 0b10111000110, 0b10001110110,
  0b11101110110, 0b11010001110, 0b11000101110, 0b11011101000, 0b11011100010, 0b11011101110,
  0b11101011000, 0b11101000110, 0b11100010110, 0b11101101000, 0b11101100010, 0b11100011010,
  0b11101111010, 0b11001000010, 0b11110001010, 0b10100110000, 0b10100001100, 0b10010110000,
  0b10010000110, 0b10000101100, 0b10000100110, 0b10110010000, 0b10110000100, 0b10011010000,
  0b10011000010, 0b10000110100, 0b10000110010, 0b11000010010, 0b11001010000, 0b11110111010,
  0b11000010100, 0b10001111010, 0b10100111100, 0b10010111100, 0b10010011110, 0b10111100100,
  0b10011110100, 0b10011110010, 0b11110100100, 0b11110010100, 0b11110010010, 0b11011011110,
  0b11011110110, 0b11110110110, 0b10101111000, 0b10100011110, 0b10001011110, 0b10111101000,
  0b10111100010, 0b11110101000, 0b11110100010, 0b10111011110, 0b10111101110, 0b11101011110,
  0b11110101110, 0b11010000100, 0b11010010000, 0b11010011100, 0b1100011101011,
];

const START_B = 104;
const STOP = 106;
const QUIET = 10;

function modulesOf(pattern: number, width: number): number[] {
  const modules: number[] = [];
  for (let bit = width - 1; bit >= 0; bit -= 1) {
    modules.push((pattern >>> bit) & 1);
  }
  return modules;
}

/** Symbol values: start B, data, checksum, stop. */
export function code128Symbols(text: string): number[] {
  if (text.length === 0) {
    throw new Error("Code 128 needs at least one character.");
  }
  const symbols = [START_B];
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      throw new Error(`Code 128 set B cannot encode ${JSON.stringify(char)}.`);
    }
    symbols.push(code - 32);
  }
  let sum = symbols[0] ?? 0;
  for (let index = 1; index < symbols.length; index += 1) {
    sum += (symbols[index] ?? 0) * index;
  }
  symbols.push(sum % 103);
  symbols.push(STOP);
  return symbols;
}

/** Dark (1) and light (0) modules, including quiet zones. */
export function code128Modules(text: string): number[] {
  const modules: number[] = Array.from({ length: QUIET }, () => 0);
  for (const symbol of code128Symbols(text)) {
    const pattern = BARS[symbol];
    if (pattern === undefined) {
      throw new Error(`Missing Code 128 pattern ${symbol}.`);
    }
    modules.push(...modulesOf(pattern, symbol === STOP ? 13 : 11));
  }
  modules.push(...Array.from({ length: QUIET }, () => 0));
  return modules;
}

export function code128Svg(text: string): string {
  const modules = code128Modules(text);
  const height = 72;
  const rects: string[] = [];
  let index = 0;
  while (index < modules.length) {
    if (modules[index] === 1) {
      const start = index;
      while (index < modules.length && modules[index] === 1) index += 1;
      rects.push(`<rect x="${start}" y="0" width="${index - start}" height="${height}"/>`);
    } else {
      index += 1;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${modules.length} ${height}" preserveAspectRatio="none" aria-hidden="true">${rects.join("")}</svg>`;
}

export { BARS, START_B, STOP };
