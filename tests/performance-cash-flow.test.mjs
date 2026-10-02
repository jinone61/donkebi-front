import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCashFlowRows,
  rebaseCashFlowRows
} from '../src/utils/performance-cash-flow.js'

test('starting capital and the classified deposit give the dated principal line', () => {
  const rows = buildCashFlowRows(
    [
      { sessionDate: '2026-08-06', totalAsset: 6999.85 },
      {
        sessionDate: '2026-10-01',
        totalAsset: 28650.96,
        transactions: [
          { changeAmount: 21000.000332, externalCashFlow: '21000' }
        ]
      }
    ],
    '7000'
  )
  assert.deepEqual(
    rows.map(row => row.netPrincipal),
    [7000, 28000]
  )
  assert.deepEqual(
    rows.map(row => row.externalCashFlow),
    [0, 21000]
  )
  assert.equal(rows[1].totalAsset, 28650.96)
})

test('withdrawals and unclassified cash changes stay distinct', () => {
  const [row] = buildCashFlowRows(
    [
      {
        sessionDate: '2026-10-01',
        transactions: [
          { externalCashFlow: 100 },
          { externalCashFlow: -200 },
          { changeAmount: 50 },
          { externalCashFlow: 0 }
        ]
      }
    ],
    1000
  )
  assert.equal(row.netPrincipal, 900)
  assert.equal(row.externalCashFlow, -100)
})

test('capital accumulates chronologically before selecting a chart range', () => {
  const rows = buildCashFlowRows(
    [
      { sessionDate: '2026-10-02' },
      { sessionDate: '2026-10-01', transactions: [{ externalCashFlow: 3000 }] }
    ],
    1000
  )
  assert.equal(rows.slice(1)[0].netPrincipal, 4000)
  assert.equal(
    buildCashFlowRows([{ sessionDate: '2026-10-01' }], null)[0].netPrincipal,
    null
  )
  assert.deepEqual(buildCashFlowRows([], 7000), [])
})

test('total-capital mode moves future deposits to the start while preserving dollar profit', () => {
  const original = buildCashFlowRows(
    [
      { sessionDate: '2026-09-30', totalAsset: 7593.09 },
      {
        sessionDate: '2026-10-01',
        totalAsset: 28650.96,
        transactions: [{ externalCashFlow: 21000 }]
      }
    ],
    7000
  )
  const rebased = rebaseCashFlowRows(original)
  assert.deepEqual(
    rebased.map(row => row.netPrincipal),
    [28000, 28000]
  )
  assert.ok(Math.abs(rebased[0].totalAsset - 28593.09) < 1e-8)
  rebased.forEach((row, index) =>
    assert.ok(
      Math.abs(
        row.totalAsset -
          row.netPrincipal -
          (original[index].totalAsset - original[index].netPrincipal)
      ) < 1e-8
    )
  )
  assert.equal(rebased[1].totalAsset, original[1].totalAsset)
  assert.equal(original[0].totalAsset, 7593.09)
})

test('rebased drawdown uses the displayed asset history and includes the starting baseline', () => {
  const rows = rebaseCashFlowRows(
    buildCashFlowRows(
      [
        { sessionDate: '2026-10-01', totalAsset: 900 },
        {
          sessionDate: '2026-10-02',
          totalAsset: 3800,
          transactions: [{ externalCashFlow: 3000 }]
        }
      ],
      1000
    )
  )
  assert.ok(Math.abs(rows[0].drawdownPct + 2.5) < 1e-8)
  assert.ok(Math.abs(rows[1].drawdownPct + 5) < 1e-8)
})

test('rebasing applies signed withdrawals and does not invent missing valuations', () => {
  const rows = rebaseCashFlowRows(
    buildCashFlowRows(
      [
        { sessionDate: '2026-10-01', totalAsset: 1100 },
        {
          sessionDate: '2026-10-02',
          totalAsset: 600,
          transactions: [{ externalCashFlow: -500 }]
        }
      ],
      1000
    )
  )
  assert.equal(rows[0].totalAsset, 600)
  assert.equal(rows[1].netPrincipal, 500)
  assert.equal(
    rebaseCashFlowRows([{ totalAsset: null, netPrincipal: 1000 }])[0]
      .totalAsset,
    null
  )
  assert.deepEqual(rebaseCashFlowRows([]), [])
})
