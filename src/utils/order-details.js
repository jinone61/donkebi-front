export function getOrderDetails(details = {}) {
  const legacyOrders = Array.isArray(details.orders) ? details.orders : []
  const strategyOrders = (
    Array.isArray(details.strategyOrders)
      ? details.strategyOrders
      : legacyOrders
  ).map(order => {
    const orderId = order.strategyOrderId ?? order.orderId
    const metadata =
      legacyOrders.find(item =>
        item.orderId != null && orderId != null
          ? item.orderId === orderId
          : item.tier === order.tier && item.tradeSide === order.tradeSide
      ) || {}
    return { ...metadata, ...order, orderId }
  })
  const brokerOrders = (
    Array.isArray(details.brokerOrders)
      ? details.brokerOrders
      : legacyOrders.filter(order => order.submission || order.execution)
  ).map(order => ({
    ...order,
    executionPrice: order.execution?.price ?? null,
    executedQuantity: order.execution?.quantity ?? 0
  }))
  return { strategyOrders, brokerOrders }
}

export function getStrategyExecutions(details = {}) {
  const { strategyOrders, brokerOrders } = getOrderDetails(details)
  return strategyOrders
    .toSorted(
      (left, right) =>
        Number(String(left.planType || '').toUpperCase() === 'DEFERRED') -
        Number(String(right.planType || '').toUpperCase() === 'DEFERRED')
    )
    .map(order => {
      const linkedOrders = brokerOrders.filter(broker => {
        const brokerStrategyId =
          broker.strategyOrderId ?? broker.planOrderId ?? broker.orderId
        return brokerStrategyId != null && order.orderId != null
          ? brokerStrategyId === order.orderId
          : broker.tier === order.tier && broker.tradeSide === order.tradeSide
      })
      const transfers = (details.tierTransfers || []).filter(
        transfer =>
          transfer.appliedSessionDate &&
          order.planType !== 'DEFERRED' &&
          (order.tradeSide === 'BUY'
            ? transfer.toTier === order.tier
            : order.tradeSide === 'SELL' && transfer.fromTier === order.tier)
      )
      const fills = linkedOrders.map(broker => broker.execution).filter(Boolean)
      const brokerExecutedQuantity = fills.reduce(
        (sum, fill) => sum + (fill.quantity || 0),
        0
      )
      const transferredQuantity = transfers.reduce(
        (sum, transfer) => sum + (transfer.quantity || 0),
        0
      )
      const executions = [
        ...fills,
        ...transfers.map(transfer => ({
          quantity: transfer.quantity,
          price: transfer.appliedPrice
        }))
      ].filter(execution => execution.quantity > 0)
      const executedQuantity = brokerExecutedQuantity + transferredQuantity
      const executionPrice =
        executedQuantity > 0 &&
        executions.every(execution => execution.price != null)
          ? executions.reduce(
              (sum, execution) => sum + execution.quantity * execution.price,
              0
            ) / executedQuantity
          : null
      const submissions = linkedOrders
        .map(broker => broker.submission)
        .filter(Boolean)
      return {
        ...order,
        brokerExecutedQuantity,
        transferredQuantity,
        executedQuantity,
        executionPrice,
        brokerOrderIds: [
          ...new Set(
            submissions
              .map(submission => submission.brokerOrderId)
              .filter(Boolean)
          )
        ].join(', '),
        submissionStatus: [
          ...new Set(
            submissions.map(submission => submission.status).filter(Boolean)
          )
        ].join(', '),
        submissionMode: [
          ...new Set(
            submissions.map(submission => submission.mode).filter(Boolean)
          )
        ].join(', ')
      }
    })
}
