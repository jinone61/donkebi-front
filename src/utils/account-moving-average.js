import { getOrderDetails } from './order-details.js'

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

// Replay actual broker fills, never strategy fills or internal tier transfers.
// The API aggregates fills by order without intraday execution timestamps.
export function calculateAccountMovingAverage(
  dailyResults = [],
  expectedQuantity,
  throughDate
) {
  const days = dailyResults
    .filter(
      day => day.sessionDate && (!throughDate || day.sessionDate <= throughDate)
    )
    .toSorted((left, right) =>
      left.sessionDate.localeCompare(right.sessionDate)
    )
  if (!days.length || (throughDate && days.at(-1).sessionDate !== throughDate))
    return null
  const lastFlat = days.findLastIndex(
    day => numberOrNull(day.portfolio?.totalQuantity) === 0
  )
  let quantity = 0
  let cost = 0
  for (const day of days.slice(lastFlat + 1)) {
    const fills = getOrderDetails(day.plan || {})
      .brokerOrders.filter(order => order.execution)
      .map(order => ({
        ...order.execution,
        tradeSide: order.execution.tradeSide ?? order.tradeSide
      }))
    // Do not invent BUY/SELL ordering when it can affect the moving average.
    if (new Set(fills.map(fill => fill.tradeSide)).size > 1) return null
    for (const fill of fills) {
      const filledQuantity = numberOrNull(fill.quantity)
      if (!(filledQuantity > 0)) return null
      if (fill.tradeSide === 'BUY') {
        const price = numberOrNull(fill.price)
        if (price === null) return null
        cost += price * filledQuantity
        quantity += filledQuantity
      } else if (fill.tradeSide === 'SELL') {
        if (filledQuantity > quantity + 1e-8 || quantity <= 0) return null
        const remaining = quantity - filledQuantity
        cost = remaining > 1e-8 ? (cost / quantity) * remaining : 0
        quantity = remaining > 1e-8 ? remaining : 0
      } else return null
    }
    const closingQuantity = numberOrNull(day.portfolio?.totalQuantity)
    if (closingQuantity !== null && Math.abs(quantity - closingQuantity) > 1e-8)
      return null
  }
  const expected = numberOrNull(expectedQuantity)
  if (expected === null || Math.abs(quantity - expected) > 1e-8) return null
  return quantity > 0 ? cost / quantity : null
}
