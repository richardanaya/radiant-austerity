import assert from "node:assert/strict";
import { test } from "node:test";
import QRCode from "qrcode";
import { qrMatrix } from "../../src/qr.ts";

const samples = ["HELLO", "https://richardanaya.github.io/radiant-austerity/", "Radiant Austerity UI Kit 0.1.0"];

for (const text of samples) {
  for (const level of ["L", "M"] as const) {
    test(`byte-mode QR matches the reference for ${level} ${JSON.stringify(text)}`, () => {
      const ours = qrMatrix(text, level);
      const ref = QRCode.create([{ data: Buffer.from(text), mode: "byte" }], {
        errorCorrectionLevel: level,
        version: (ours.length - 17) / 4,
      });
      assert.equal(ours.length, ref.modules.size);
      for (let row = 0; row < ours.length; row += 1) {
        for (let col = 0; col < ours.length; col += 1) {
          assert.equal(Boolean(ours[row]?.[col]), Boolean(ref.modules.get(row, col)));
        }
      }
    });
  }
}

test("finder patterns occupy the three corners", () => {
  const matrix = qrMatrix("KIT", "L");
  assert.equal(matrix[0]?.[0], true);
  assert.equal(matrix[0]?.[matrix.length - 1], true);
  assert.equal(matrix[matrix.length - 1]?.[0], true);
  assert.equal(matrix[3]?.[3], true);
});
