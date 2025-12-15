"use strict";
const assert = require("node:assert/strict");
const { characterFrequency, formatCounts } = require("./charfreq");

function toObj(arr) {
  const o = {};
  for (const { char, count } of arr) o[char] = count;
  return o;
}

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err.stack || err);
    process.exitCode = 1;
  }
}

test("counts in order of first appearance (default case-insensitive, ignore spaces)", () => {
  const res = characterFrequency("hello world");
  assert.deepEqual(res, [
    { char: "h", count: 1 },
    { char: "e", count: 1 },
    { char: "l", count: 3 },
    { char: "o", count: 2 },
    { char: "w", count: 1 },
    { char: "r", count: 1 },
    { char: "d", count: 1 },
  ]);
  assert.equal(formatCounts(res), "h:1, e:1, l:3, o:2, w:1, r:1, d:1");
});

test("case-insensitive merges A and a by default", () => {
  const res = characterFrequency("Aa a");
  const obj = toObj(res);
  assert.equal(obj["a"], 3);
  assert.equal(Object.keys(obj).length, 1);
});

test("case-sensitive splits A and a when flag set", () => {
  const res = characterFrequency("Aa a", { caseSensitive: true });
  const obj = toObj(res);
  assert.equal(obj["A"], 1);
  assert.equal(obj["a"], 2);
});

test("include whitespace when flag set", () => {
  const res = characterFrequency("a a\n\t", { includeWhitespace: true });
  const obj = toObj(res);
  assert.equal(obj["a"], 2);
  assert.equal(obj[" "], 1);
  assert.equal(obj["\n"], 1);
  assert.equal(obj["\t"], 1);
});

test("handles punctuation and digits", () => {
  const res = characterFrequency("a1!a1");
  assert.equal(res[0].char, "a");
  assert.equal(res[0].count, 2);
  assert.equal(res[1].char, "1");
  assert.equal(res[1].count, 2);
  assert.equal(res[2].char, "!");
  assert.equal(res[2].count, 1);
});

test("empty string returns empty list", () => {
  const res = characterFrequency("");
  assert.equal(res.length, 0);
});

test("non-string throws TypeError", () => {
  assert.throws(() => characterFrequency(null), { name: "TypeError" });
});
