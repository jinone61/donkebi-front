import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { getStrategyExecutions } from '../src/utils/order-details.js'

test('strategy execution rows place deferred plans last while preserving each group order', () => {
  const strategyOrders = [
    { strategyOrderId: 1, planType: 'DEFERRED' },
    { strategyOrderId: 2, planType: 'REGULAR' },
    { strategyOrderId: 3, planType: 'deferred' },
    { strategyOrderId: 4, planType: 'REGULAR' }
  ]
  assert.deepEqual(
    getStrategyExecutions({ strategyOrders, brokerOrders: [] }).map(
      order => order.strategyOrderId
    ),
    [2, 4, 1, 3]
  )
  assert.deepEqual(
    strategyOrders.map(order => order.strategyOrderId),
    [1, 2, 3, 4]
  )
})

test('strategy execution combines split fills and applied transfers without counting pending transfers', () => {
  const rows = getStrategyExecutions({
    strategyOrders: [
      { strategyOrderId: 127, tradeSide: 'BUY', tier: '공T3', quantity: 39 },
      { strategyOrderId: 130, tradeSide: 'SELL', tier: '공T2', quantity: 7 }
    ],
    brokerOrders: [
      {
        strategyOrderId: 127,
        submission: { status: 'SUBMITTED', brokerOrderId: 'a' },
        execution: { quantity: 12, price: 160 }
      },
      {
        strategyOrderId: 127,
        submission: { status: 'SUBMITTED', brokerOrderId: 'b' },
        execution: { quantity: 20, price: 162 }
      },
      { strategyOrderId: 130, execution: null }
    ],
    tierTransfers: [
      {
        fromTier: '공T2',
        toTier: '공T3',
        quantity: 7,
        appliedSessionDate: '2026-10-02',
        appliedPrice: 161
      },
      {
        fromTier: '공T2',
        toTier: '공T3',
        quantity: 7,
        appliedSessionDate: null,
        appliedPrice: null
      }
    ]
  })
  assert.equal(rows[0].executedQuantity, 39)
  assert.equal(rows[0].brokerExecutedQuantity, 32)
  assert.equal(rows[0].transferredQuantity, 7)
  assert.equal(rows[0].executionPrice, (12 * 160 + 20 * 162 + 7 * 161) / 39)
  assert.equal(rows[0].brokerOrderIds, 'a, b')
  assert.equal(rows[1].executedQuantity, 7)
  assert.equal(rows[1].executionPrice, 161)
})

test('legacy executions match the correct tier when legacy orders have no IDs', () => {
  const rows = getStrategyExecutions({
    strategyOrders: [
      { strategyOrderId: 1, tier: 'T1', tradeSide: 'BUY' },
      {
        strategyOrderId: 2,
        tier: 'T2',
        tradeSide: 'SELL',
        planType: 'DEFERRED'
      }
    ],
    orders: [
      { tier: 'T1', tradeSide: 'BUY', execution: { quantity: 3, price: 100 } },
      { tier: 'T2', tradeSide: 'SELL', planType: 'DEFERRED', execution: null }
    ]
  })
  assert.equal(rows[0].executedQuantity, 3)
  assert.equal(rows[1].executedQuantity, 0)
  assert.equal(rows[1].executionPrice, null)
})

test('Plan broker desktop and mobile rows render orders without a submissions array', async () => {
  const source = await readFile(
    new URL('../src/pages/index/operation.vue', import.meta.url),
    'utf8'
  )
  const start = source.indexOf('brokerPlanOrders(slide.job.details).length')
  const desktopStart = source.indexOf('<tbody>', start)
  const desktop = source.slice(
    desktopStart,
    source.indexOf('</tbody>', desktopStart) + 8
  )
  const mobileStart = source.indexOf('<article', desktopStart)
  const mobile = source.slice(
    mobileStart,
    source.indexOf('</article>', mobileStart) + 10
  )
  const { getOrderDetails } = await import('../src/utils/order-details.js')
  const helper = source.match(
    /function brokerPlanOrders\(details = \{\}\) \{[\s\S]*?\n\}/
  )[0]
  const brokerPlanOrders = new Function(
    'getOrderDetails',
    `${helper}; return brokerPlanOrders`
  )(getOrderDetails)
  for (const template of [desktop, mobile]) {
    const render = new Function(
      'Vue',
      compile(template, { prefixIdentifiers: true }).code
    )(Vue)
    const app = Vue.createSSRApp({
      render,
      setup: () => ({
        slide: {
          job: {
            details: {
              brokerOrders: [
                {
                  id: null,
                  planOrderId: 117,
                  strategyOrderId: 117,
                  tradeSide: 'BUY',
                  tier: '공T1',
                  orderType: 'LOC',
                  orderPrice: 158.76,
                  quantity: 7,
                  submission: {
                    mode: 'DBSEC',
                    status: 'SUBMITTED',
                    brokerOrderId: '6386'
                  }
                }
              ]
            }
          }
        },
        brokerPlanOrders,
        sideClass: () => 'buy',
        sideLabel: () => '매수',
        shortTypeLabel: value => value,
        formatPrice: value => String(value),
        formatInteger: value => String(value)
      })
    })
    const html = await renderToString(app)
    assert.match(html, /6386/)
    assert.match(html, /158\.76/)
    assert.match(html, /공T1/)
  }
})

test('keeps split broker orders separate from strategy plans and counts each fill once', async () => {
  const { getOrderDetails } = await import('../src/utils/order-details.js')
  const result = getOrderDetails({
    orders: [
      { orderId: 127, quantity: 39, submission: { brokerOrderId: 'old' } }
    ],
    strategyOrders: [{ strategyOrderId: 127, quantity: 39 }],
    brokerOrders: [
      {
        strategyOrderId: 127,
        quantity: 7,
        submission: { brokerOrderId: '6918' },
        execution: { quantity: 7, price: 153.86 }
      },
      {
        strategyOrderId: 127,
        quantity: 32,
        submission: { brokerOrderId: '6919' },
        execution: null
      }
    ]
  })
  assert.equal(result.strategyOrders[0].orderId, 127)
  assert.equal(result.strategyOrders[0].quantity, 39)
  assert.equal(result.brokerOrders.length, 2)
  assert.equal(result.brokerOrders[0].executedQuantity, 7)
  assert.equal(result.brokerOrders[1].executedQuantity, 0)
  assert.deepEqual(
    result.brokerOrders.map(order => order.strategyOrderId),
    [127, 127]
  )
})

test('an explicit empty broker list never falls back to strategy submissions', async () => {
  const { getOrderDetails } = await import('../src/utils/order-details.js')
  assert.deepEqual(
    getOrderDetails({
      orders: [{ submission: { status: 'SUBMITTED' } }],
      brokerOrders: []
    }).brokerOrders,
    []
  )
})

test('legacy plans retain metadata and broker submissions when new fields are absent', async () => {
  const { getOrderDetails } = await import('../src/utils/order-details.js')
  const result = getOrderDetails({
    orders: [
      {
        orderId: 5,
        buyPrice: 12,
        quantity: 3,
        submission: { status: 'SUBMITTED' },
        execution: { price: 14, quantity: 2 }
      },
      { orderId: 6, planType: 'DEFERRED' }
    ]
  })
  assert.equal(result.strategyOrders.length, 2)
  assert.equal(result.strategyOrders[0].buyPrice, 12)
  assert.equal(result.brokerOrders.length, 1)
  assert.equal(result.brokerOrders[0].executionPrice, 14)
  assert.deepEqual(getOrderDetails().brokerOrders, [])
})
