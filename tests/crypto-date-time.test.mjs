import assert from 'node:assert/strict'
import test from 'node:test'

import { formatSeoulDate, formatSeoulDateTime } from '../src/utils/date-time.js'

test('UTC timestamps are displayed in Asia/Seoul across a date boundary', () => {
  assert.equal(
    formatSeoulDateTime('2026-09-18T16:30:00Z'),
    '2026-09-19 01:30 KST'
  )
  assert.equal(formatSeoulDate('2026-09-18T16:30:00Z'), '2026-09-19')
})

test('date-only values stay date-only and missing values use the placeholder', () => {
  assert.equal(formatSeoulDateTime('2026-09-18'), '2026-09-18')
  assert.equal(formatSeoulDate('2026-09-18'), '2026-09-18')
  assert.equal(formatSeoulDateTime(null), '-')
  assert.equal(formatSeoulDate('invalid'), '-')
})
