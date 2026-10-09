import assert from 'node:assert/strict'
import test from 'node:test'
import { valueTier, summarizeTierHoldings } from '../src/utils/tier-holdings.js'

test('tier returns use their own purchase prices and one close, regardless of account cost or stale profit', () => {
  const tiers = [
    { quantity: 10, buyPrice: 180, costBasis: 1500, unrealizedProfit: 100 },
    {
      quantity: 20,
      averageBuyPrice: 160,
      costBasis: 3000,
      unrealizedProfit: 200
    }
  ]
  const first = valueTier(tiers[0], 140)
  const second = valueTier(tiers[1], 140)
  const total = summarizeTierHoldings(tiers, 140)
  assert.equal(first.averageBuyPrice, 180)
  assert.equal(first.profitLoss, -400)
  assert.equal(second.profitLoss, -400)
  assert.notEqual(first.returnPct, second.returnPct)
  assert.ok(Math.abs(first.returnPct - (-400 / 1800) * 100) < 1e-10)
  assert.equal(second.returnPct, -12.5)
  assert.equal(total.quantity, 30)
  assert.equal(total.purchaseAmount, 5000)
  assert.equal(total.averageBuyPrice, 5000 / 30)
  assert.equal(total.profitLoss, first.profitLoss + second.profitLoss)
  assert.equal(total.profitLoss, -800)
  assert.equal(total.returnPct, -16)
  assert.ok(
    Math.abs(
      (140 - total.averageBuyPrice) * total.quantity - total.profitLoss
    ) < 1e-10
  )
})

test('missing tier price or close does not produce a partial total or fall back to account cost', () => {
  const tiers = [
    { quantity: 10, buyPrice: 180 },
    { quantity: 20, costBasis: 3000 }
  ]
  const missing = valueTier(tiers[1], 140)
  assert.equal(missing.averageBuyPrice, null)
  assert.equal(missing.profitLoss, null)
  assert.equal(missing.returnPct, null)
  const total = summarizeTierHoldings(tiers, 140)
  assert.equal(total.quantity, 30)
  assert.equal(total.averageBuyPrice, null)
  assert.equal(total.profitLoss, null)
  assert.equal(total.returnPct, null)
  const noClose = summarizeTierHoldings([{ quantity: 10, buyPrice: 180 }], null)
  assert.equal(noClose.averageBuyPrice, 180)
  assert.equal(noClose.profitLoss, null)
  assert.equal(noClose.returnPct, null)
})

test('zero prices, numeric strings and empty holdings remain well defined', () => {
  assert.equal(valueTier({ quantity: 10, buyPrice: 0 }, 140).returnPct, null)
  assert.equal(valueTier({ quantity: 10, buyPrice: 0 }, 140).profitLoss, 1400)
  assert.equal(valueTier({ quantity: 10, buyPrice: 150 }, 0).returnPct, -100)
  assert.equal(summarizeTierHoldings([], 140).returnPct, null)
  assert.equal(valueTier({ quantity: 0, buyPrice: 150 }, 140).returnPct, null)
  for (const buyPrice of [null, undefined, '', NaN, Infinity, -1]) {
    assert.equal(valueTier({ quantity: 10, buyPrice }, 140).returnPct, null)
  }
  assert.equal(
    valueTier({ quantity: '10', buyPrice: '150' }, '140').profitLoss,
    -100
  )
})

test('account average stays separate from tier prices and needs complete positive account cost', () => {
  const tiers = [
    { quantity: 10, buyPrice: 180, costBasis: '1500' },
    { quantity: 20, buyPrice: 160, costBasis: 3000 }
  ]
  const total = summarizeTierHoldings(tiers, 140)
  assert.equal(total.accountAverageBuyPrice, 150)
  assert.equal(total.averageBuyPrice, 5000 / 30)
  assert.equal(total.profitLoss, -800)
  assert.equal(total.returnPct, -16)
  for (const costBasis of [null, undefined, '', 0, -1, Infinity]) {
    assert.equal(
      summarizeTierHoldings([tiers[0], { ...tiers[1], costBasis }], 140)
        .accountAverageBuyPrice,
      null
    )
  }
  assert.equal(summarizeTierHoldings([], 140).accountAverageBuyPrice, null)
})

test('broker mode uses account cost for every tier and the summary', () => {
  const tiers = [
    { quantity: 10, buyPrice: 180, costBasis: 1500 },
    { quantity: 20, buyPrice: 160, costBasis: 3000 }
  ]
  const first = valueTier(tiers[0], 140, 'broker')
  const second = valueTier(tiers[1], 140, 'broker')
  const total = summarizeTierHoldings(tiers, 140, 'broker')
  assert.equal(first.averageBuyPrice, 150)
  assert.equal(second.averageBuyPrice, 150)
  assert.equal(first.profitLoss, -100)
  assert.equal(second.profitLoss, -200)
  assert.equal(first.returnPct, second.returnPct)
  assert.equal(total.averageBuyPrice, 150)
  assert.equal(total.purchaseAmount, 4500)
  assert.equal(total.profitLoss, first.profitLoss + second.profitLoss)
  assert.equal(total.returnPct, (-300 / 4500) * 100)
  assert.equal(summarizeTierHoldings(tiers, 140).profitLoss, -800)
  for (const costBasis of [null, undefined, 0, -1]) {
    assert.equal(
      valueTier({ ...tiers[0], costBasis }, 140, 'broker').returnPct,
      null
    )
    assert.equal(
      valueTier({ ...tiers[0], costBasis }, 140, 'broker').averageBuyPrice,
      null
    )
  }
  assert.equal(summarizeTierHoldings(tiers, null, 'broker').profitLoss, null)
})
