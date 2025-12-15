#!/usr/bin/env node
"use strict";

/**
 * Character frequency counter that preserves the order of first appearance.
 *
 * Assumptions (defaults):
 * - Case-insensitive: characters are normalized to lower-case unless --case-sensitive is set.
 * - Whitespace ignored: spaces/tabs/newlines are excluded unless --include-whitespace is set.
 * - Punctuation/digits included: non-whitespace characters are counted by default.
 * - Unicode-safe iteration: iterates by code points (handles surrogate pairs correctly).
 *
 * Usage:
 *   node scripts/charfreq.js "hello world"
 *   echo "hello world" | node scripts/charfreq.js
 *   node scripts/charfreq.js --case-sensitive --include-whitespace "Aa a"
 */

/**
 * Compute ordered character frequencies.
 * @param {string} input
 * @param {{caseSensitive?: boolean, includeWhitespace?: boolean}} [opts]
 * @returns {{char:string,count:number}[]} Array ordered by first appearance
 */
function characterFrequency(input, opts = {}) {
  if (typeof input !== "string") throw new TypeError("input must be a string");
  const { caseSensitive = false, includeWhitespace = false } = opts;

  const counts = new Map(); // preserves insertion order

  const iterate = (() => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return function* (str) {
        for (const { segment } of seg.segment(str)) yield segment;
      };
    }
    // Fallback: iterate code points
    return function* (str) {
      for (const ch of str) yield ch;
    };
  })();

  for (const raw of iterate(input)) {
    const isWs = /\s/u.test(raw);
    if (!includeWhitespace && isWs) continue;
    const ch = caseSensitive ? raw : raw.toLowerCase();
    // Count all non-whitespace characters; includes punctuation/digits by default
    const key = ch;
    const prev = counts.get(key) || 0;
    counts.set(key, prev + 1);
  }

  return Array.from(counts.entries()).map(([char, count]) => ({ char, count }));
}

/**
 * Format counts as `a:1, b:2` string.
 * @param {{char:string,count:number}[]} counts
 */
function formatCounts(counts) {
  return counts.map(({ char, count }) => `${char}:${count}`).join(", ");
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  let caseSensitive = false;
  let includeWhitespace = false;
  const data = [];

  // Parse flags and collect input tokens
  for (const token of args) {
    if (token === "--case-sensitive") {
      caseSensitive = true;
    } else if (token === "--include-whitespace") {
      includeWhitespace = true;
    } else if (token.startsWith("--")) {
      console.error(`Unknown option: ${token}`);
      process.exitCode = 2;
      process.exit();
    } else {
      data.push(token);
    }
  }

  function run(inputStr) {
    const result = characterFrequency(inputStr, { caseSensitive, includeWhitespace });
    console.log(formatCounts(result));
  }

  if (data.length > 0) {
    run(data.join(" "));
  } else {
    // Read from stdin
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => (buf += chunk));
    process.stdin.on("end", () => run(buf));
    if (process.stdin.isTTY) {
      // No piped input and no args: show help
      console.error("Usage: node scripts/charfreq.js [--case-sensitive] [--include-whitespace] \"your text\"");
      process.exitCode = 64;
    }
  }
}

module.exports = { characterFrequency, formatCounts };
