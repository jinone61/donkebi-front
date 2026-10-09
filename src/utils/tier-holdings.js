function nonNegativeNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

// Both pages value each strategy tier at the same closing price.
export function valueTier(tier = {}, closePrice, basis = 'strategy') {
  const quantity = nonNegativeNumber(tier.quantity)
  const tierBuyPrice = nonNegativeNumber(tier.averageBuyPrice ?? tier.buyPrice)
  const accountCost = nonNegativeNumber(tier.costBasis)
  const price = nonNegativeNumber(closePrice)
  const purchaseAmount =
    basis === 'broker'
      ? accountCost > 0
        ? accountCost
        : null
      : quantity !== null && tierBuyPrice !== null
        ? tierBuyPrice * quantity
        : null
  const averageBuyPrice =
    basis === 'broker'
      ? quantity > 0 && purchaseAmount !== null
        ? purchaseAmount / quantity
        : null
      : tierBuyPrice
  const profitLoss =
    quantity > 0 && purchaseAmount !== null && price !== null
      ? basis === 'broker'
        ? price * quantity - purchaseAmount
        : (price - tierBuyPrice) * quantity
      : null

  return {
    quantity,
    purchaseAmount,
    averageBuyPrice,
    profitLoss,
    returnPct:
      purchaseAmount > 0 && profitLoss !== null
        ? (profitLoss / purchaseAmount) * 100
        : null
  }
}

export function summarizeTierHoldings(
  tiers = [],
  closePrice,
  basis = 'strategy'
) {
  const accountCosts = tiers.map(tier => nonNegativeNumber(tier.costBasis))
  const accountCost = accountCosts.every(cost => cost !== null && cost > 0)
    ? accountCosts.reduce((sum, cost) => sum + cost, 0)
    : null
  const holdings = tiers.map(tier => valueTier(tier, closePrice, basis))
  const quantity = holdings.every(tier => tier.quantity !== null)
    ? holdings.reduce((sum, tier) => sum + tier.quantity, 0)
    : null
  const purchaseAmount = holdings.every(tier => tier.purchaseAmount !== null)
    ? holdings.reduce((sum, tier) => sum + tier.purchaseAmount, 0)
    : null
  const profitLoss =
    holdings.length > 0 && holdings.every(tier => tier.profitLoss !== null)
      ? holdings.reduce((sum, tier) => sum + tier.profitLoss, 0)
      : null

  return {
    quantity,
    purchaseAmount,
    accountAverageBuyPrice:
      quantity > 0 && accountCost !== null ? accountCost / quantity : null,
    averageBuyPrice:
      quantity > 0 && purchaseAmount !== null
        ? purchaseAmount / quantity
        : null,
    profitLoss,
    returnPct:
      purchaseAmount > 0 && profitLoss !== null
        ? (profitLoss / purchaseAmount) * 100
        : null
  }
}
