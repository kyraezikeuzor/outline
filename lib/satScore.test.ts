import assert from "node:assert/strict";
import test from "node:test";
import { getDigitalSatScore } from "./satScore.ts";

test("matches the module-aware 1380 example", () => {
  assert.deepEqual(
    getDigitalSatScore({
      reading_writing_1: 23,
      reading_writing_2: 21,
      math_1: 19,
      math_2: 21,
    }),
    { reading_writing: 650, math: 730, total: 1380 }
  );
});

test("returns the full SAT score range at the boundaries", () => {
  assert.deepEqual(
    getDigitalSatScore({
      reading_writing_1: 0,
      reading_writing_2: 0,
      math_1: 0,
      math_2: 0,
    }),
    { reading_writing: 200, math: 200, total: 400 }
  );
  assert.deepEqual(
    getDigitalSatScore({
      reading_writing_1: 27,
      reading_writing_2: 27,
      math_1: 22,
      math_2: 22,
    }),
    { reading_writing: 800, math: 800, total: 1600 }
  );
});

test("scores modules independently instead of using only total percentage", () => {
  const screenshotDistribution = getDigitalSatScore({
    reading_writing_1: 23,
    reading_writing_2: 21,
    math_1: 19,
    math_2: 21,
  });
  const alternateDistribution = getDigitalSatScore({
    reading_writing_1: 22,
    reading_writing_2: 23,
    math_1: 19,
    math_2: 20,
  });

  assert.equal(screenshotDistribution.total, 1380);
  assert.equal(alternateDistribution.total, 1370);
});
