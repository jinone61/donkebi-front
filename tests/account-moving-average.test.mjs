import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateAccountMovingAverage } from '../src/utils/account-moving-average.js'

const fill = (tradeSide, quantity, price) => ({
  execution: { tradeSide, quantity, price }
})
const day = (sessionDate, totalQuantity, brokerOrders = []) => ({
  sessionDate,
  portfolio: { totalQuantity },
  plan: { brokerOrders }
})

test('actual broker buys update average while sales preserve it, independent of sale price and tier cost', () => {
  const history = [
    day('2026-01-01', 2, [fill('BUY', 1, 100), fill('BUY', 1, 200)]),
    day('2026-01-02', 1, [fill('SELL', 1, 160)])
  ]
  assert.equal(calculateAccountMovingAverage(history, 1), 150)
  assert.equal(
    calculateAccountMovingAverage(
      [...history, day('2026-01-03', 2, [fill('BUY', 1, 250)])],
      2
    ),
    200
  )
})

test('latest flat portfolio resets earlier history, and cutoff excludes future trades', () => {
  const history = [
    day('2026-01-01', 10),
    day('2026-01-02', 0),
    day('2026-01-03', 2, [fill('BUY', 2, 80)]),
    day('2026-01-04', 3, [fill('BUY', 1, 110)])
  ]
  assert.equal(
    calculateAccountMovingAverage(history.toReversed(), 2, '2026-01-03'),
    80
  )
  assert.equal(calculateAccountMovingAverage(history, 3), 90)
  assert.equal(calculateAccountMovingAverage(history, 0, '2026-01-02'), null)
})

test('internal transfers and unfilled orders do not change the account average', () => {
  const history = [
    day('2026-01-01', 2, [fill('BUY', 1, 100), fill('BUY', 1, 120)]),
    day('2026-01-02', 2, [{ tradeSide: 'SELL', quantity: 2, execution: null }])
  ]
  history[1].plan.strategyOrders = [fill('BUY', 100, 999)]
  history[1].plan.tierTransfers = [{ quantity: 2, price: 999 }]
  assert.equal(calculateAccountMovingAverage(history, 2), 110)
})

test('missing or inconsistent history and unsequenced mixed-side days show no guessed average', () => {
  assert.equal(calculateAccountMovingAverage([], 2), null)
  assert.equal(
    calculateAccountMovingAverage(
      [day('2026-01-01', 3, [fill('BUY', 1, 100)])],
      3
    ),
    null
  )
  assert.equal(
    calculateAccountMovingAverage(
      [day('2026-01-01', 1, [fill('SELL', 1, 100)])],
      1
    ),
    null
  )
  assert.equal(
    calculateAccountMovingAverage(
      [day('2026-01-01', 2, [fill('BUY', 2, null)])],
      2
    ),
    null
  )
  const history = [day('2026-01-01', 2, [fill('BUY', 2, 100)])]
  assert.equal(calculateAccountMovingAverage(history, 1), null)
  assert.equal(calculateAccountMovingAverage(history, 2, '2026-01-02'), null)
  history.push(
    day('2026-01-02', 2, [fill('SELL', 1, 120), fill('BUY', 1, 140)])
  )
  assert.equal(calculateAccountMovingAverage(history, 2), null)
})
