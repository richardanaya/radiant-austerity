import assert from "node:assert/strict";
import { test } from "node:test";
import { BARS, START_B, code128Modules, code128Symbols } from "../../src/code128.ts";

test("Code 128 set B checksum for HI", () => {
  const symbols = code128Symbols("HI");
  assert.deepEqual(symbols, [104, 40, 41, 20, 106]);
});

test("start symbol is the Code 128 B pattern and quiet zones are empty", () => {
  assert.equal(START_B, 104);
  assert.equal(BARS.length, 107);
  const modules = code128Modules("HI");
  assert.equal(modules.slice(0, 10).every(bit => bit === 0), true);
  assert.equal(modules.slice(-10).every(bit => bit === 0), true);
  const start = modules.slice(10, 21).join("");
  assert.equal(start, "11010010000");
});

test("rejects characters outside set B", () => {
  assert.throws(() => code128Symbols("café"), /cannot encode/);
});
