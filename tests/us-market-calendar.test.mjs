import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getNextUsMarketDate,
  isUsMarketDate
} from '../src/utils/us-market-calendar.js'

test('moves from Friday to the following Monday', () => {
  assert.equal(getNextUsMarketDate('2026-08-14'), '2026-08-17')
})

test('skips recurring US market holidays', () => {
  assert.equal(getNextUsMarketDate('2026-07-02'), '2026-07-06')
  assert.equal(getNextUsMarketDate('2026-04-02'), '2026-04-06')
  assert.equal(getNextUsMarketDate('2026-11-25'), '2026-11-27')
  assert.equal(getNextUsMarketDate('2022-12-30'), '2023-01-03')
})

test('identifies regular market dates', () => {
  assert.equal(isUsMarketDate('2026-08-14'), true)
  assert.equal(isUsMarketDate('2026-08-15'), false)
  assert.equal(isUsMarketDate('2026-12-25'), false)
  assert.equal(isUsMarketDate('2021-12-31'), true)
})
