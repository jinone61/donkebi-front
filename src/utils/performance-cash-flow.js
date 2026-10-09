function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// Starting capital already includes funding before the first plan.
// Reconciliation deltas and trade proceeds are not external deposits.
export function buildCashFlowRows(rows, startingCapital) {
  let netPrincipal = finiteNumber(startingCapital)
  return [...rows]
    .sort((left, right) => left.sessionDate.localeCompare(right.sessionDate))
    .map(row => {
      const externalCashFlow = (row.transactions || []).reduce(
        (sum, transaction) =>
          sum + (finiteNumber(transaction.externalCashFlow) ?? 0),
        0
      )
      if (netPrincipal !== null) netPrincipal += externalCashFlow
      return { ...row, externalCashFlow, netPrincipal }
    })
}

// Move later classified net contributions to the start as idle cash.
// This preserves dollar profit, rather than simulating extra investment returns.
export function rebaseCashFlowRows(rows) {
  const finalPrincipal = finiteNumber(rows.at(-1)?.netPrincipal)
  let peak = finalPrincipal > 0 ? finalPrincipal : null
  return rows.map(row => {
    const actualTotalAsset = finiteNumber(row.totalAsset)
    const actualClosingCash = finiteNumber(row.closingCash)
    const principal = finiteNumber(row.netPrincipal)
    const closingCash =
      actualClosingCash !== null &&
      principal !== null &&
      finalPrincipal !== null
        ? actualClosingCash + finalPrincipal - principal
        : null
    const totalAsset =
      actualTotalAsset !== null && principal !== null && finalPrincipal !== null
        ? actualTotalAsset + finalPrincipal - principal
        : null
    if (totalAsset !== null && peak !== null) peak = Math.max(peak, totalAsset)
    const drawdownPct =
      totalAsset !== null && peak > 0 ? (totalAsset / peak - 1) * 100 : null
    return {
      ...row,
      actualTotalAsset,
      actualClosingCash,
      closingCash,
      totalAsset,
      netPrincipal: finalPrincipal,
      drawdownPct
    }
  })
}
