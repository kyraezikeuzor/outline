import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAssignmentDueDate, uniqueRecentMistakes } from './studentReview.ts';

test('due dates accept calendar dates and timestamps without double-appending a time', () => {
  assert.equal(formatAssignmentDueDate('2026-09-18'), 'Sep 18');
  assert.equal(formatAssignmentDueDate('2026-09-18T00:00:00+00:00'), 'Sep 18');
  assert.equal(formatAssignmentDueDate('2026-09-18T23:00:00-05:00'), 'Sep 18');
});
test('invalid and missing due dates do not leak Invalid Date or normalize impossible days', () => {
  for (const value of [null, undefined, '', 'bad', '2026-02-30', '2026-13-01']) assert.equal(formatAssignmentDueDate(value), null);
});
test('repeated misses retain latest attempt and sort newest first without mutating history', () => {
  const items = [
    { question_id: 'a', attempted_at: '2026-09-01', id: 1 },
    { question_id: 'b', attempted_at: '2026-09-02', id: 2 },
    { question_id: 'a', attempted_at: '2026-09-03', id: 3 },
  ];
  assert.deepEqual(uniqueRecentMistakes(items).map(item => item.id), [3, 2]);
  assert.equal(items.length, 3);
  assert.deepEqual(uniqueRecentMistakes([]), []);
});
