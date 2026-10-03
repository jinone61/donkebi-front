<template>
  <section class="order-comparison">
    <section
      v-for="group in groups"
      :key="group.label"
      class="order-comparison__group"
    >
      <h4
        >{{ group.label }} <span>{{ group.orders.length }}건</span></h4
      >
      <p v-if="!group.orders.length">{{
        group.broker ? 'Broker 주문 없음' : '전략 계획 없음'
      }}</p>
      <div v-else class="order-comparison__rows">
        <article v-for="(order, index) in group.orders" :key="index">
          <header
            ><strong>
              <span
                :class="{
                  'order-side--deferred':
                    !group.broker &&
                    String(order.planType || '').toUpperCase() === 'DEFERRED'
                }"
                >{{ order.tradeSide === 'BUY' ? '매수' : '매도' }}</span
              >
              · {{ order.tier || '-' }}</strong
            ><span
              >{{ order.orderType || '-'
              }}{{ order.planType ? ` · ${order.planType}` : '' }}</span
            ></header
          >
          <dl>
            <div
              ><dt>주문가</dt><dd>{{ price(order.orderPrice) }}</dd></div
            >
            <div
              ><dt>수량</dt><dd>{{ order.quantity ?? '-' }}주</dd></div
            >
            <template v-if="group.broker">
              <div
                ><dt>제출 상태</dt
                ><dd>{{ order.submission?.status || '미제출' }}</dd></div
              >
              <div
                ><dt>Broker ID</dt
                ><dd>{{ order.submission?.brokerOrderId || '-' }}</dd></div
              >
              <div
                ><dt>체결</dt
                ><dd
                  >{{ order.executedQuantity }}주 ·
                  {{ price(order.executionPrice) }}</dd
                ></div
              >
            </template>
          </dl>
          <p
            v-if="order.submission?.brokerErrorMessage"
            class="text-negative"
            >{{ order.submission.brokerErrorMessage }}</p
          >
        </article>
      </div>
    </section>
    <section
      v-if="details.tierTransfers?.length"
      class="order-comparison__group"
    >
      <h4>티어 이전</h4>
      <article
        v-for="(transfer, index) in details.tierTransfers"
        :key="transfer.id ?? index"
        class="order-comparison__transfer"
      >
        <strong
          >{{ transfer.fromTier }} → {{ transfer.toTier }} ·
          {{ transfer.quantity }}주</strong
        >
        <p
          >종가 조건 {{ price(transfer.minClosePrice) }} ~
          {{ price(transfer.maxClosePrice) }}</p
        >
        <p>{{
          transfer.appliedSessionDate
            ? `적용 ${transfer.appliedSessionDate} · ${price(transfer.appliedPrice)}`
            : '조건 충족 시 적용 대기'
        }}</p>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getOrderDetails } from '@/utils/order-details'

const props = defineProps({
  details: { type: Object, default: () => ({}) },
  showStrategy: { type: Boolean, default: true },
  showBroker: { type: Boolean, default: true }
})
const groups = computed(() => {
  const { strategyOrders, brokerOrders } = getOrderDetails(props.details)
  return [
    ...(props.showStrategy
      ? [{ label: '전략 계획', orders: strategyOrders, broker: false }]
      : []),
    ...(props.showBroker
      ? [{ label: 'Broker 제출 주문', orders: brokerOrders, broker: true }]
      : [])
  ]
})
function price(value) {
  return value == null
    ? '-'
    : `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

<style scoped>
.order-comparison {
  margin: 20px 0;
}
.order-comparison__group + .order-comparison__group {
  margin-top: 24px;
}
h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}
h4 span {
  color: #777;
  margin-left: 8px;
  font-weight: 400;
}
.order-comparison__rows {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}
article {
  padding: 14px;
  border: 1px solid #deded8;
  border-radius: 8px;
  background: #fff;
  min-width: 0;
}
header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}
header span,
dt {
  color: #777;
}
dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 14px 0 0;
  font-size: 12px;
}
dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
}
p {
  margin: 8px 0 0;
  font-size: 12px;
  color: #666;
}
.order-comparison__transfer + .order-comparison__transfer {
  margin-top: 8px;
}
@media (max-width: 600px) {
  .order-comparison__rows {
    grid-template-columns: 1fr;
  }
}
.order-side--deferred {
  text-decoration: line-through;
}
</style>
