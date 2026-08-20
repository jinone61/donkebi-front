<template>
  <q-page class="agent-page">
    <main class="content-container">
      <div class="agent-tab-panels">
        <section class="agent-tab-panel">
          <q-banner v-if="performanceLoadError" class="error-banner" rounded>
            <div>
              <strong>성과 정보를 불러오지 못했습니다.</strong>
              <p>{{ performanceLoadError }}</p>
            </div>
            <template #action>
              <q-btn
                flat
                dense
                no-caps
                color="negative"
                label="다시 시도"
                @click="fetchAgentResult"
              />
            </template>
          </q-banner>

          <div
            v-if="isPerformanceLoading"
            class="loading-shell"
            aria-label="성과 정보 불러오는 중"
          >
            <q-skeleton type="rect" height="132px" />
            <div class="loading-grid">
              <q-skeleton
                v-for="index in 8"
                :key="index"
                type="rect"
                height="82px"
              />
            </div>
            <q-skeleton type="rect" height="260px" />
          </div>

          <template v-else-if="agentResult">
            <section
              class="agent-overview"
              aria-labelledby="agent-overview-title"
            >
              <div class="section-heading section-heading--split">
                <div>
                  <p class="section-index">01 · CURRENT STATE</p>
                  <h2 id="agent-overview-title" class="dk-serif">
                    Agent Performance
                  </h2>
                  <p>
                    {{ agentResult.evaluation.fromDate }} —
                    {{ agentResult.evaluation.throughDate }}
                  </p>
                </div>
                <div
                  class="section-heading__meta section-heading__meta--performance"
                >
                  <div class="source-tags">
                    <span>{{
                      agentResult.finalPortfolio.currency || 'USD'
                    }}</span>
                    <span>{{
                      agentResult.finalPortfolio.source || 'UNKNOWN SOURCE'
                    }}</span>
                  </div>
                  <div
                    class="section-heading__updated section-heading__updated--quiet"
                  >
                    <span class="section-heading__updated-label"
                      >UPDATED ·</span
                    >
                    <time
                      :datetime="
                        performanceUpdatedAt
                          ? performanceUpdatedAt.toISOString()
                          : undefined
                      "
                      >{{ formatDateTime(performanceUpdatedAt) }}</time
                    >
                    <q-btn
                      flat
                      dense
                      round
                      icon="refresh"
                      color="dark"
                      aria-label="성과 정보 새로고침"
                      class="section-heading__refresh"
                      :loading="isPerformanceRefreshing"
                      @click="fetchAgentResult"
                    />
                  </div>
                </div>
              </div>

              <div class="summary-grid">
                <article
                  v-for="metric in summaryMetrics"
                  :key="metric.label"
                  class="metric-card"
                >
                  <span class="metric-card__label">{{ metric.label }}</span>
                  <strong :class="metric.valueClass">{{ metric.value }}</strong>
                </article>
              </div>

              <section
                class="current-tiers"
                aria-labelledby="current-holdings-title"
              >
                <div class="current-tiers__heading">
                  <p id="current-holdings-title" class="section-index">
                    CURRENT HOLDINGS
                  </p>
                  <span>{{ currentTiers.length }} TIERS</span>
                </div>

                <template v-if="currentTiers.length">
                  <q-markup-table
                    flat
                    dense
                    separator="horizontal"
                    class="current-tiers__table"
                  >
                    <thead>
                      <tr>
                        <th class="text-center">Tier</th>
                        <th class="text-center">보유</th>
                        <th class="text-right">매수가</th>
                        <th class="text-right">수익률</th>
                        <th class="text-right">손익</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="tier in currentTiers" :key="tier.tier">
                        <td class="current-tier-name">{{ tier.tier }}</td>
                        <td class="text-center">
                          {{ formatInteger(tier.quantity) }}주
                        </td>
                        <td class="text-right">
                          {{ formatPrice(tier.averageBuyPrice) }}
                        </td>
                        <td
                          class="text-right"
                          :class="profitClass(tier.unrealizedReturnPct)"
                        >
                          {{ formatPct(tier.unrealizedReturnPct) }}
                        </td>
                        <td
                          class="text-right"
                          :class="profitClass(tier.unrealizedProfit)"
                        >
                          {{ formatMoney(tier.unrealizedProfit) }}
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </template>
                <p v-else class="detail-empty"> 현재 보유 내역이 없습니다. </p>
              </section>
            </section>

            <section class="agent-charts" aria-labelledby="agent-charts-title">
              <div class="section-heading section-heading--split">
                <div>
                  <p class="section-index">02 · PERFORMANCE</p>
                  <h2 id="agent-charts-title" class="dk-serif"
                    >Movement, measured.</h2
                  >
                  <p>같은 기간의 가격, 체결과 자산 변화를 함께 확인합니다.</p>
                </div>
                <span>{{ chartStartDate }} — {{ chartEndDate }}</span>
              </div>

              <q-card
                v-if="dailyRows.length"
                flat
                bordered
                class="section-card chart-range-card"
              >
                <q-card-section class="section-heading chart-range-heading">
                  <div>
                    <div class="text-h6 text-grey-9">차트 조회 구간</div>
                    <div class="text-caption text-grey-6">
                      선택한 기간을 가격·체결과 포트폴리오 성과 차트에 함께
                      적용합니다.
                    </div>
                  </div>
                  <div class="chart-range-dates text-weight-medium text-grey-8">
                    {{ chartStartDate }} ~ {{ chartEndDate }}
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section class="chart-range-controls">
                  <q-btn-toggle
                    v-model="selectedChartPreset"
                    :options="chartPresets"
                    color="grey-3"
                    text-color="grey-8"
                    toggle-color="grey-7"
                    unelevated
                    dense
                    no-caps
                    class="chart-range-presets"
                    @update:model-value="applyChartPreset"
                  />
                  <q-range
                    v-if="dailyRows.length > 1"
                    v-model="draftChartRange"
                    :min="0"
                    :max="chartRangeMax"
                    :step="1"
                    :left-label-value="chartStartDate"
                    :right-label-value="chartEndDate"
                    color="grey-6"
                    label-color="grey-7"
                    label
                    label-always
                    class="chart-range-slider"
                    @pan="handleChartRangePan"
                    @change="commitChartRange"
                  />
                  <div v-else class="text-caption text-grey-6">
                    선택 가능한 거래일이 하루입니다.
                  </div>
                  <div class="chart-range-adjustments">
                    <q-btn
                      label="시작 -1일"
                      color="grey-3"
                      text-color="grey-8"
                      unelevated
                      dense
                      no-caps
                      :disable="draftChartRange.min === 0"
                      @click="adjustRange('min', -1)"
                    />
                    <q-btn
                      label="시작 +1일"
                      color="grey-3"
                      text-color="grey-8"
                      unelevated
                      dense
                      no-caps
                      :disable="draftChartRange.min >= draftChartRange.max"
                      @click="adjustRange('min', 1)"
                    />
                    <q-btn
                      label="종료 -1일"
                      color="grey-3"
                      text-color="grey-8"
                      unelevated
                      dense
                      no-caps
                      :disable="draftChartRange.max <= draftChartRange.min"
                      @click="adjustRange('max', -1)"
                    />
                    <q-btn
                      label="종료 +1일"
                      color="grey-3"
                      text-color="grey-8"
                      unelevated
                      dense
                      no-caps
                      :disable="draftChartRange.max >= chartRangeMax"
                      @click="adjustRange('max', 1)"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="section-card">
                <q-card-section class="section-heading">
                  <div class="text-h6 text-grey-9">가격 및 체결</div>
                  <div class="text-caption text-grey-6">
                    일별 종가와 실제 매수·매도 체결 위치
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div v-if="dailyRows.length" class="chart-container">
                    <Chart
                      ref="priceChartComponent"
                      type="line"
                      :data="priceChartData"
                      :options="priceChartOptions"
                      @mouseleave="clearChartHover"
                    />
                  </div>
                  <div v-else class="empty-copy">
                    차트로 표시할 일별 데이터가 없습니다.
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="section-card">
                <q-card-section class="section-heading">
                  <div class="text-h6 text-grey-9">포트폴리오 성과</div>
                  <div class="text-caption text-grey-6">
                    총자산과 drawdown 추이
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div v-if="dailyRows.length" class="chart-container">
                    <Chart
                      ref="performanceChartComponent"
                      type="line"
                      :data="performanceChartData"
                      :options="performanceChartOptions"
                      @mouseleave="clearChartHover"
                    />
                  </div>
                  <div v-else class="empty-copy">
                    차트로 표시할 일별 데이터가 없습니다.
                  </div>
                </q-card-section>
              </q-card>
            </section>

            <q-card
              flat
              bordered
              class="section-card agent-history"
              aria-labelledby="agent-history-title"
            >
              <q-card-section
                class="section-heading row items-center justify-between"
              >
                <div>
                  <div id="agent-history-title" class="text-h6 text-grey-9">
                    일별 운영 내역
                  </div>
                  <div class="text-caption text-grey-6">
                    날짜를 선택하면 주문·체결·현금 흐름을 확인할 수 있습니다.
                  </div>
                </div>
                <q-badge color="grey-7" :label="`${dailyRows.length} 거래일`" />
              </q-card-section>

              <q-card-section class="q-pa-sm">
                <div v-if="visibleHistoryRows.length" class="daily-history">
                  <div class="daily-header desktop-only">
                    <span>날짜</span><span>모드</span><span>종가</span
                    ><span>총자산</span><span>DD</span><span>주문</span
                    ><span>체결</span><span>마감 현금</span
                    ><span>현금 비중</span>
                  </div>
                  <q-expansion-item
                    v-for="day in visibleHistoryRows"
                    :key="day.sessionDate"
                    group="daily-results"
                    dense
                    expand-separator
                    class="daily-history-item"
                    header-class="daily-item-header"
                    expand-icon-class="daily-expand-section"
                  >
                    <template #header>
                      <div class="daily-row daily-desktop-summary">
                        <div class="daily-cell">{{ day.sessionDate }}</div>
                        <div class="daily-cell">
                          <q-badge
                            :color="modeColor(day.mode)"
                            :label="day.mode"
                          />
                        </div>
                        <div class="daily-cell">{{
                          formatClosePrice(day.closePrice)
                        }}</div>
                        <div class="daily-cell">{{
                          formatMoney(day.totalAsset)
                        }}</div>
                        <div
                          class="daily-cell"
                          :class="profitClass(day.drawdownPct)"
                        >
                          {{ formatPct(day.drawdownPct, false) }}
                        </div>
                        <div class="daily-cell">{{
                          day.submittedOrderCount
                        }}</div>
                        <div class="daily-cell">{{
                          day.executions.length
                        }}</div>
                        <div class="daily-cell">{{
                          formatMoney(day.closingCash)
                        }}</div>
                        <div class="daily-cell">{{
                          formatPct(day.cashRatioPct, false)
                        }}</div>
                      </div>

                      <div class="daily-mobile-summary">
                        <div class="daily-mobile-summary__header">
                          <span class="text-weight-bold text-grey-8">{{
                            day.sessionDate
                          }}</span>
                          <span class="daily-mobile-summary__meta">
                            <q-badge
                              class="daily-close-badge"
                              :label="formatClosePrice(day.closePrice)"
                            />
                          </span>
                        </div>
                        <div class="daily-mobile-summary__values">
                          <div>
                            <span class="data-label">자산</span>
                            <span class="daily-mobile-summary__primary">
                              {{ formatMoney(day.totalAsset) }}
                            </span>
                          </div>
                          <div class="text-right">
                            <span class="data-label">DD</span>
                            <span
                              class="daily-mobile-summary__primary"
                              :class="profitClass(day.drawdownPct)"
                            >
                              {{ formatPct(day.drawdownPct, false) }}
                            </span>
                          </div>
                        </div>
                        <div class="daily-mobile-summary__meta">
                          <span>
                            <span>현금</span>
                            <span class="daily-mobile-summary__cash">{{
                              formatMoney(day.closingCash)
                            }}</span>
                            ({{ formatPct(day.cashRatioPct, false) }})
                          </span>
                          <span></span>
                          <span>
                            주문 {{ day.submittedOrderCount }} · 체결
                            {{ day.executions.length }}
                          </span>
                        </div>
                      </div>
                    </template>

                    <div class="daily-detail bg-grey-1">
                      <div class="detail-section">
                        <div class="detail-title">계획</div>
                        <q-markup-table
                          flat
                          bordered
                          dense
                          class="plan-summary-table"
                        >
                          <thead>
                            <tr>
                              <th class="text-left">생성 기준일</th>
                              <th class="text-left">주문 실행일</th>
                              <th class="text-left">모드</th>
                              <th class="text-right">Broker</th>
                              <th class="text-right">주문 결과 반영</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td class="text-left">{{
                                day.plan?.basisDate || '-'
                              }}</td>
                              <td class="text-left">{{
                                day.plan?.targetDate || day.sessionDate
                              }}</td>
                              <td class="text-left">{{ day.mode }}</td>
                              <td class="text-right">{{
                                day.submissionMode
                              }}</td>
                              <td class="text-right">{{
                                day.plan?.completionStatus || '-'
                              }}</td>
                            </tr>
                          </tbody>
                        </q-markup-table>
                      </div>

                      <div class="detail-section">
                        <div class="detail-title">주문 및 체결</div>
                        <div v-if="day.orders.length" class="table-scroll">
                          <q-markup-table flat bordered dense>
                            <thead>
                              <tr>
                                <th class="text-left">구분</th
                                ><th class="text-left">티어</th
                                ><th class="text-left">유형</th
                                ><th class="text-left daily-submission-status"
                                  >제출 상태</th
                                ><th class="text-left">Broker ID</th>
                                <th class="text-right">주문가</th>
                                <th class="text-right">체결가</th
                                ><th class="text-right">수량</th
                                ><th class="text-right">체결</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(order, index) in day.orders"
                                :key="`${day.sessionDate}-${order.tier}-${index}`"
                              >
                                <td>
                                  <span
                                    class="operation-side"
                                    :class="sideClass(order.tradeSide)"
                                    >{{ sideLabel(order.tradeSide) }}</span
                                  >
                                </td>
                                <td>{{ order.tier }}</td>
                                <td>
                                  {{ shortTypeLabel(order.orderType) }}·
                                  {{ shortTypeLabel(order.planType) }}
                                </td>
                                <td class="daily-submission-status">
                                  {{ order.submission?.status || '미제출' }}
                                  <small v-if="order.submission?.mode">{{
                                    order.submission.mode
                                  }}</small>
                                </td>
                                <td>
                                  {{ order.submission?.brokerOrderId || '-' }}
                                  <small
                                    v-if="order.submission?.brokerErrorMessage"
                                    class="text-negative"
                                  >
                                    {{ order.submission.brokerErrorMessage }}
                                  </small>
                                </td>
                                <td class="text-right">{{
                                  formatPrice(order.orderPrice)
                                }}</td>
                                <td class="text-right">{{
                                  formatPrice(order.executionPrice)
                                }}</td>
                                <td class="text-right">{{
                                  formatInteger(order.quantity)
                                }}</td>
                                <td class="text-right">{{
                                  formatInteger(order.executedQuantity)
                                }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>
                        <div v-else class="detail-note">주문 없음</div>
                      </div>

                      <div class="detail-section">
                        <div class="detail-title">현금 흐름</div>
                        <div class="detail-summary q-mb-sm">
                          <span
                            >시작
                            {{ formatMoney(day.cash?.openingCash, 2) }}</span
                          >
                          <span
                            >마감
                            {{ formatMoney(day.cash?.closingCash, 2) }}</span
                          >
                        </div>
                        <div
                          v-if="day.transactions.length"
                          class="table-scroll"
                        >
                          <q-markup-table flat bordered dense>
                            <thead>
                              <tr>
                                <th class="text-left">유형</th>
                                <th class="text-right">변동액</th>
                                <th class="text-right">변동 후 현금</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(transaction, index) in day.transactions"
                                :key="`${transaction.eventKey}-${index}`"
                              >
                                <td>{{ transaction.type }}</td>
                                <td
                                  class="text-right"
                                  :class="profitClass(transaction.changeAmount)"
                                >
                                  {{ formatMoney(transaction.changeAmount, 2) }}
                                </td>
                                <td class="text-right">
                                  {{ formatMoney(transaction.cashAfter, 2) }}
                                </td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>
                        <div v-else class="detail-note">현금 거래 없음</div>
                      </div>
                    </div>
                  </q-expansion-item>

                  <div v-if="hasMoreHistory" class="q-pa-md">
                    <q-btn
                      outline
                      color="green-7"
                      label="더 불러오기"
                      class="full-width"
                      @click="visibleHistoryCount += DAILY_HISTORY_PAGE_SIZE"
                    />
                  </div>
                </div>
                <div v-else class="empty-copy q-pa-lg">
                  일별 운영 기록이 없습니다.
                </div>
              </q-card-section>
            </q-card>
          </template>

          <div v-else class="operation-empty-state">
            <strong>표시할 성과 기록이 없습니다.</strong>
            <p>성과 데이터가 생성되면 차트와 운영 기록이 표시됩니다.</p>
          </div>
        </section>
      </div>
    </main>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { api } from '@/boot/axios'

import { useQuasar } from 'quasar'

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip
} from 'chart.js'

import { Chart } from 'vue-chartjs'

let agentChartHoverGuideVisible = true

let isSyncingAgentChartTooltips = false

let synchronizedAgentChartTooltipDate = null

const agentChartRangeGuidePlugin = {
  id: 'agentChartRangeGuide',
  afterDatasetsDraw(chart, _args, options) {
    const labels = chart.data.labels || []
    const rangeIndexes = options?.display
      ? getChartRangeGuideIndexes(labels, options.startDate, options.endDate)
      : []
    const hoverIndexes = agentChartHoverGuideVisible
      ? getChartRangeGuideIndexes(
          labels,
          options?.hoverDate,
          options?.hoverDate
        )
      : []
    const indexes = [...new Set([...rangeIndexes, ...hoverIndexes])]
    if (!indexes.length) return

    const { ctx, chartArea } = chart
    ctx.save()
    ctx.strokeStyle = 'rgba(117, 117, 117, 0.8)'
    ctx.lineWidth = 1
    indexes.forEach(index => {
      const x = chart.scales.x.getPixelForValue(index)
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top)
      ctx.lineTo(x, chartArea.bottom)
      ctx.stroke()
    })
    ctx.restore()
  },
  afterEvent(chart, args) {
    const isAgentChart = [
      priceChartComponent.value,
      performanceChartComponent.value
    ].some(component => getChartInstance(component) === chart)
    const eventType = args.event?.type
    const isPointerOutsidePlot =
      !args.inChartArea &&
      ['mousemove', 'touchmove', 'click'].includes(eventType)
    const hasSynchronizedHover =
      chartHoverDate.value !== null ||
      synchronizedAgentChartTooltipDate !== null

    if (
      !isAgentChart ||
      args.replay ||
      !isPointerOutsidePlot ||
      !hasSynchronizedHover
    )
      return
    clearChartHover()
  }
}

const STRATEGY_ID = 1

const AGENT_RESULT_URL = '/api/dualsniper/strategies/results'

const AGENT_ACCENT = '#357a55'

const AGENT_ACCENT_FILL = 'rgba(53, 122, 85, 0.1)'

const DAILY_HISTORY_PAGE_SIZE = 30

const chartPresets = [
  { label: '전체', value: 'all' },
  { label: '1개월', value: 1 },
  { label: '3개월', value: 3 },
  { label: '6개월', value: 6 },
  { label: '1년', value: 12 }
]

const $q = useQuasar()

const agentResult = ref(null)

const isPerformanceLoading = ref(false)

const isPerformanceRefreshing = ref(false)

const performanceLoadError = ref('')

const performanceUpdatedAt = ref(null)

const visibleHistoryCount = ref(DAILY_HISTORY_PAGE_SIZE)

const draftChartRange = ref({ min: 0, max: 0 })

const appliedChartRange = ref({ min: 0, max: 0 })

const selectedChartPreset = ref('all')

const isChartRangeDragging = ref(false)

const chartHoverDate = ref(null)

const priceChartComponent = ref(null)

const performanceChartComponent = ref(null)

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function getChartInstance(component) {
  const exposedChart = component?.chart
  return exposedChart?.value || exposedChart || null
}

function getChartRangeGuideIndexes(labels = [], startDate, endDate) {
  return [...new Set([startDate, endDate])]
    .map(date => labels.indexOf(date))
    .filter(index => index >= 0)
}

function formatMonthTickLabel(currentLabel, previousLabel) {
  const currentMonth = String(currentLabel || '').slice(0, 7)
  if (!currentMonth) return undefined
  const previousMonth = String(previousLabel || '').slice(0, 7)
  return currentMonth === previousMonth ? undefined : currentMonth
}

function getChartAxisLayout(isMobile) {
  return isMobile ? { left: 60, right: 42 } : { left: 72, right: 48 }
}

function isDateWithinRows(sessionDate, rows = []) {
  if (!sessionDate || !rows.length) return false
  return (
    sessionDate >= rows[0].sessionDate &&
    sessionDate <= rows[rows.length - 1].sessionDate
  )
}

function getChartTooltipActiveElements(chart, sessionDate) {
  const labelIndex = (chart?.data?.labels || []).indexOf(sessionDate)
  if (labelIndex < 0) return []

  return (chart.data.datasets || []).flatMap((dataset, datasetIndex) => {
    if (!chart.isDatasetVisible(datasetIndex)) return []

    const dataIndex =
      dataset.type === 'scatter'
        ? (dataset.data || []).findIndex(point => point?.x === sessionDate)
        : labelIndex
    if (dataIndex < 0 || dataset.data?.[dataIndex] == null) return []
    if (!chart.getDatasetMeta(datasetIndex)?.data?.[dataIndex]) return []

    return [{ datasetIndex, index: dataIndex }]
  })
}

function deactivateOtherChartInteractions(sourceChart, chartComponents = []) {
  chartComponents.forEach(component => {
    const chart = getChartInstance(component)
    if (!chart || chart === sourceChart) return

    const hasActiveElements = chart.getActiveElements?.().length > 0
    const hasActiveTooltip = chart.tooltip?.getActiveElements?.().length > 0
    if (!hasActiveElements && !hasActiveTooltip) return

    chart.setActiveElements([])
    chart.tooltip?.setActiveElements([], { x: 0, y: 0 })
    chart.draw()
  })
}

function drawChartComponents(chartComponents = []) {
  chartComponents.forEach(component => getChartInstance(component)?.draw())
}

function syncChartTooltips(sessionDate, chartComponents = []) {
  if (isSyncingAgentChartTooltips) return

  isSyncingAgentChartTooltips = true
  try {
    chartComponents.forEach(component => {
      const chart = getChartInstance(component)
      if (!chart) return

      const activeElements = getChartTooltipActiveElements(chart, sessionDate)
      if (!activeElements.length) {
        chart.setActiveElements([])
        chart.tooltip?.setActiveElements([], { x: 0, y: 0 })
        chart.draw()
        return
      }

      const labelIndex = chart.data.labels.indexOf(sessionDate)
      const position = {
        x: chart.scales.x.getPixelForValue(labelIndex),
        y: (chart.chartArea.top + chart.chartArea.bottom) / 2
      }
      chart.setActiveElements(activeElements)
      chart.tooltip?.setActiveElements(activeElements, position)
      chart.draw()
    })
  } finally {
    isSyncingAgentChartTooltips = false
  }
}

function updateChartHover(event, _elements, chart) {
  const { chartArea } = chart
  const isInsideChartArea =
    !isChartRangeDragging.value &&
    event.x !== null &&
    event.y !== null &&
    event.x >= chartArea.left &&
    event.x <= chartArea.right &&
    event.y >= chartArea.top &&
    event.y <= chartArea.bottom
  const rawIndex = isInsideChartArea
    ? chart.scales.x.getValueForPixel(event.x)
    : null
  const index = Math.round(Number(rawIndex))
  const nextDate =
    Number.isInteger(index) && index >= 0 && index < chart.data.labels.length
      ? chart.data.labels[index]
      : null

  if (nextDate === null) {
    clearChartHover()
    return
  }

  const chartComponents = [
    priceChartComponent.value,
    performanceChartComponent.value
  ]
  agentChartHoverGuideVisible = true
  if (chartHoverDate.value !== nextDate) chartHoverDate.value = nextDate
  if (synchronizedAgentChartTooltipDate !== nextDate) {
    deactivateOtherChartInteractions(chart, chartComponents)
    syncChartTooltips(nextDate, chartComponents)
    synchronizedAgentChartTooltipDate = nextDate
  }
}

function clearChartHover() {
  const chartComponents = [
    priceChartComponent.value,
    performanceChartComponent.value
  ]
  synchronizedAgentChartTooltipDate = null
  agentChartHoverGuideVisible = false
  deactivateOtherChartInteractions(null, chartComponents)
  if (chartHoverDate.value !== null) chartHoverDate.value = null
  drawChartComponents(chartComponents)
}

function normalizeOrder(order = {}) {
  return {
    ...order,
    executionPrice: order.execution?.price ?? null,
    executedQuantity: order.execution?.quantity ?? 0
  }
}

function calculateCashRatioPct(closingCash, totalAsset) {
  const cash = finiteNumber(closingCash)
  const assets = finiteNumber(totalAsset)
  if (cash === null || assets === null || assets === 0) return null
  return (cash / assets) * 100
}

function normalizeStrategyResult(result = {}) {
  return {
    ...result,
    evaluation: {
      fromDate: result.evaluatedFromDate || '-',
      throughDate: result.evaluatedThroughDate || '-'
    },
    finalPortfolio: result.finalPortfolio || {},
    pendingPlan: result.pendingPlan || null,
    dailyRows: (result.dailyResults || [])
      .map(day => {
        const orders = (day.plan?.orders || []).map(normalizeOrder)
        const submissionMode = [
          ...new Set(
            orders.map(order => order.submission?.mode).filter(Boolean)
          )
        ].join(', ')
        const totalAsset = day.portfolio?.totalAsset ?? null
        const closingCash = day.cash?.closingCash ?? null

        return {
          ...day,
          mode: day.plan?.mode || '-',
          closePrice: day.portfolio?.closePrice ?? null,
          totalAsset,
          closingCash,
          cashRatioPct: calculateCashRatioPct(closingCash, totalAsset),
          orders,
          submissionMode: submissionMode || day.plan?.completionSource || '-',
          submittedOrderCount: orders.filter(order => order.submission).length,
          executions: orders.flatMap(order =>
            order.execution ? [order.execution] : []
          ),
          transactions: day.cash?.transactions || []
        }
      })
      .sort((left, right) => left.sessionDate.localeCompare(right.sessionDate))
  }
}

async function fetchAgentResult() {
  const hasExistingResult = Boolean(agentResult.value)
  isPerformanceLoading.value = !hasExistingResult
  isPerformanceRefreshing.value = hasExistingResult
  performanceLoadError.value = ''

  try {
    const { data } = await api.get(AGENT_RESULT_URL, {
      params: { strategyId: STRATEGY_ID }
    })
    agentResult.value = normalizeStrategyResult(data)
    visibleHistoryCount.value = DAILY_HISTORY_PAGE_SIZE
    resetChartRange()
    performanceUpdatedAt.value = new Date()
  } catch (error) {
    const responseMessage =
      error.response?.data?.message || error.response?.data?.error
    performanceLoadError.value =
      responseMessage || error.message || '알 수 없는 오류가 발생했습니다.'
    if (hasExistingResult) {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: '새로고침에 실패했습니다. 기존 데이터를 유지합니다.'
      })
    }
  } finally {
    isPerformanceLoading.value = false
    isPerformanceRefreshing.value = false
  }
}

const dailyRows = computed(() => agentResult.value?.dailyRows || [])

const finalPortfolio = computed(() => agentResult.value?.finalPortfolio || {})

const currentTiers = computed(() => finalPortfolio.value.tiers || [])

const latestDay = computed(() => dailyRows.value.at(-1) || null)

const agentMetrics = computed(() => {
  const totalInvestment = finiteNumber(agentResult.value?.totalInvestment)

  return {
    currentAsset: finiteNumber(finalPortfolio.value.totalAsset),
    totalInvestment,
    availableCash: finiteNumber(finalPortfolio.value.availableCash),
    holdingsMarketValue: finiteNumber(finalPortfolio.value.holdingsMarketValue),
    totalProfit: finiteNumber(agentResult.value?.totalProfitLoss),
    totalReturnPct: finiteNumber(agentResult.value?.totalReturnPct),
    currentDrawdownPct: finiteNumber(latestDay.value?.drawdownPct),
    maximumDrawdownPct: finiteNumber(agentResult.value?.maximumDrawdownPct),
    allTimeHigh: agentResult.value?.allTimeHigh || null
  }
})

const summaryMetrics = computed(() => [
  {
    label: 'TOTAL',
    value: formatMoney(agentMetrics.value.currentAsset)
  },
  {
    label: 'ATH',
    value: formatMoney(agentMetrics.value.allTimeHigh?.totalAsset)
  },
  {
    label: 'CASH',
    value: formatMoney(agentMetrics.value.availableCash)
  },
  {
    label: 'HOLDING',
    value: formatMoney(agentMetrics.value.holdingsMarketValue)
  },
  {
    label: 'PROFIT',
    value: formatMoney(agentMetrics.value.totalProfit)
  },
  {
    label: 'RETURN',
    value: formatPct(agentMetrics.value.totalReturnPct)
  },
  {
    label: 'DD',
    value: formatPct(agentMetrics.value.currentDrawdownPct)
  },
  {
    label: 'MDD',
    value: formatPct(agentMetrics.value.maximumDrawdownPct)
  }
])

const chartRangeMax = computed(() => Math.max(dailyRows.value.length - 1, 0))

function buildChartPreviewRange(appliedRange, draftRange, isDragging) {
  if (!isDragging) return appliedRange
  return {
    min: Math.min(appliedRange.min, draftRange.min),
    max: Math.max(appliedRange.max, draftRange.max)
  }
}

const previewChartRange = computed(() =>
  buildChartPreviewRange(
    appliedChartRange.value,
    draftChartRange.value,
    isChartRangeDragging.value
  )
)

const visibleChartRows = computed(() =>
  dailyRows.value.slice(
    previewChartRange.value.min,
    previewChartRange.value.max + 1
  )
)

const performanceDrawdownMin = computed(() => {
  const drawdowns = visibleChartRows.value
    .map(day => finiteNumber(day.drawdownPct))
    .filter(value => value !== null)
  return Math.min(-40, ...drawdowns)
})

const chartStartDate = computed(
  () => dailyRows.value[draftChartRange.value.min]?.sessionDate || '-'
)

const chartEndDate = computed(
  () => dailyRows.value[draftChartRange.value.max]?.sessionDate || '-'
)

const visibleHistoryRows = computed(() =>
  [...dailyRows.value].reverse().slice(0, visibleHistoryCount.value)
)

const hasMoreHistory = computed(
  () => visibleHistoryCount.value < dailyRows.value.length
)

function subtractMonths(dateString, months) {
  const date = new Date(`${dateString}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() - months)
  return date.toISOString().slice(0, 10)
}

function applyChartPreset(preset) {
  const max = chartRangeMax.value
  let min = 0
  if (preset !== 'all' && dailyRows.value.length) {
    const cutoff = subtractMonths(
      dailyRows.value[max].sessionDate,
      Number(preset)
    )
    const found = dailyRows.value.findIndex(day => day.sessionDate >= cutoff)
    min = found >= 0 ? found : 0
  }
  const nextRange = { min, max }
  draftChartRange.value = { ...nextRange }
  appliedChartRange.value = { ...nextRange }
  isChartRangeDragging.value = false
  selectedChartPreset.value = preset
  clearChartHover()
}

function resetChartRange() {
  applyChartPreset('all')
}

function adjustRange(boundary, direction) {
  const next = { ...draftChartRange.value }
  if (boundary === 'min') {
    next.min = Math.min(next.max, Math.max(0, next.min + direction))
  } else {
    next.max = Math.min(
      chartRangeMax.value,
      Math.max(next.min, next.max + direction)
    )
  }
  draftChartRange.value = { ...next }
  appliedChartRange.value = { ...next }
  isChartRangeDragging.value = false
  selectedChartPreset.value = null
  clearChartHover()
}

function handleChartRangePan(phase) {
  isChartRangeDragging.value = phase === 'start'
  if (phase === 'start') clearChartHover()
}

function commitChartRange(range) {
  draftChartRange.value = { ...range }
  appliedChartRange.value = { ...range }
  isChartRangeDragging.value = false
  selectedChartPreset.value = null
  clearChartHover()
}

const priceChartData = computed(() => {
  const rows = visibleChartRows.value
  const buyExecutions = []
  const sellExecutions = []
  rows.forEach(day => {
    day.executions.forEach(execution => {
      const point = {
        x: day.sessionDate,
        y: finiteNumber(execution.price),
        tier: execution.tier,
        quantity: execution.quantity
      }
      if (execution.tradeSide === 'BUY') buyExecutions.push(point)
      if (execution.tradeSide === 'SELL') sellExecutions.push(point)
    })
  })

  return {
    labels: rows.map(day => day.sessionDate),
    datasets: [
      {
        type: 'line',
        label: '종가',
        data: rows.map(day => finiteNumber(day.closePrice)),
        borderColor: '#78909c',
        backgroundColor: 'rgba(38, 166, 154, 0.12)',
        borderWidth: 2,
        pointRadius: rows.length > 50 ? 0 : 2,
        pointHoverRadius: 5,
        tension: 0.15,
        order: 1
      },
      {
        type: 'scatter',
        label: '매수 체결',
        data: buyExecutions,
        backgroundColor: '#d32f2f',
        borderColor: '#d32f2f',
        pointStyle: 'triangle',
        pointRadius: 6,
        pointHoverRadius: 8,
        order: 0
      },
      {
        type: 'scatter',
        label: '매도 체결',
        data: sellExecutions,
        backgroundColor: '#1976d2',
        borderColor: '#1976d2',
        pointStyle: 'triangle',
        pointRotation: 180,
        pointRadius: 6,
        pointHoverRadius: 8,
        order: 0
      }
    ]
  }
})

const performanceChartData = computed(() => {
  const rows = visibleChartRows.value
  const totalInvestment = finiteNumber(agentResult.value?.totalInvestment)
  const ath = agentResult.value?.allTimeHigh
  const athPoint =
    ath && isDateWithinRows(ath.sessionDate, rows)
      ? [
          {
            x: ath.sessionDate,
            y: finiteNumber(ath.totalAsset),
            sessionDate: ath.sessionDate
          }
        ]
      : []

  return {
    labels: rows.map(day => day.sessionDate),
    datasets: [
      {
        type: 'line',
        label: '총자산',
        data: rows.map(day => finiteNumber(day.totalAsset)),
        yAxisID: 'asset',
        borderColor: AGENT_ACCENT,
        backgroundColor: AGENT_ACCENT_FILL,
        borderWidth: 2,
        pointRadius: rows.length > 50 ? 0 : 2,
        pointHoverRadius: 5,
        tension: 0.15
      },
      {
        type: 'line',
        label: '초기자산',
        data: rows.map(() => totalInvestment),
        yAxisID: 'asset',
        borderColor: '#9e9e9e',
        borderDash: [6, 5],
        borderWidth: 1,
        pointRadius: 0
      },
      {
        type: 'scatter',
        label: 'ATH',
        data: athPoint,
        yAxisID: 'asset',
        backgroundColor: '#f2c037',
        borderColor: '#f2c037',
        pointStyle: 'rectRot',
        pointRadius: 7,
        pointHoverRadius: 9
      },
      {
        type: 'line',
        label: 'Drawdown',
        data: rows.map(day => finiteNumber(day.drawdownPct)),
        yAxisID: 'drawdown',
        borderColor: '#42a5f5',
        backgroundColor: 'rgba(66, 165, 245, 0.15)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: 'origin',
        tension: 0.15
      }
    ]
  }
})

const priceChartOptions = computed(() => {
  const isMobile = $q.screen.lt.sm
  const axisLayout = getChartAxisLayout(isMobile)

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: axisLayout.right } },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    onHover: updateChartHover,
    plugins: {
      agentChartRangeGuide: {
        display: isChartRangeDragging.value,
        startDate: chartStartDate.value,
        endDate: chartEndDate.value,
        hoverDate: chartHoverDate.value
      },
      legend: {
        position: 'top',
        align: 'center',
        fullSize: false,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 6,
          padding: isMobile ? 14 : 18,
          font: { size: isMobile ? 10 : 12 }
        }
      },
      tooltip: {
        animations: false,
        displayColors: false,
        filter(_tooltipItem, index) {
          return index === 0
        },
        callbacks: {
          title(items) {
            return getDailyExecutionTooltipDate(items[0]) || ''
          },
          label(context) {
            const sessionDate = getDailyExecutionTooltipDate(context)
            return buildDailyExecutionTooltipLines(
              visibleChartRows.value,
              sessionDate
            )
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : undefined,
          font: { size: isMobile ? 10 : 12 },
          callback(value) {
            const index = Number(value)
            const currentLabel = this.getLabelForValue(index)
            const previousLabel =
              index > 0 ? this.getLabelForValue(index - 1) : undefined
            return formatMonthTickLabel(currentLabel, previousLabel)
          }
        }
      },
      y: {
        afterFit(scale) {
          scale.width = axisLayout.left
        },
        ticks: {
          maxTicksLimit: isMobile ? 6 : undefined,
          font: { size: isMobile ? 10 : 12 },
          callback: value => `$${formatNumber(value, 2)}`
        },
        grid: { color: 'rgba(0, 0, 0, 0.06)' }
      }
    }
  }
})

const performanceChartOptions = computed(() => {
  const isMobile = $q.screen.lt.sm
  const axisLayout = getChartAxisLayout(isMobile)

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    onHover: updateChartHover,
    plugins: {
      agentChartRangeGuide: {
        display: isChartRangeDragging.value,
        startDate: chartStartDate.value,
        endDate: chartEndDate.value,
        hoverDate: chartHoverDate.value
      },
      legend: {
        position: 'top',
        align: 'center',
        fullSize: false,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 6,
          padding: isMobile ? 14 : 18,
          font: { size: isMobile ? 10 : 12 }
        }
      },
      tooltip: {
        animations: false,
        callbacks: {
          label(context) {
            if (context.dataset.yAxisID === 'drawdown') {
              return `Drawdown ${formatPct(context.parsed.y, false)}`
            }
            return `${context.dataset.label} ${formatMoney(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : undefined,
          font: { size: isMobile ? 10 : 12 },
          callback(value) {
            const index = Number(value)
            const currentLabel = this.getLabelForValue(index)
            const previousLabel =
              index > 0 ? this.getLabelForValue(index - 1) : undefined
            return formatMonthTickLabel(currentLabel, previousLabel)
          }
        }
      },
      asset: {
        type: 'linear',
        position: 'left',
        afterFit(scale) {
          scale.width = axisLayout.left
        },
        ticks: {
          maxTicksLimit: isMobile ? 6 : undefined,
          font: { size: isMobile ? 10 : 12 },
          callback: value => `$${formatCompactNumber(value)}`
        },
        grid: { color: 'rgba(0, 0, 0, 0.06)' }
      },
      drawdown: {
        type: 'linear',
        position: 'right',
        min: performanceDrawdownMin.value,
        suggestedMax: 0,
        afterFit(scale) {
          scale.width = axisLayout.right
        },
        ticks: {
          maxTicksLimit: isMobile ? 6 : undefined,
          font: { size: isMobile ? 10 : 12 },
          callback: value => `${value}%`
        },
        grid: { drawOnChartArea: false }
      }
    }
  }
})

function formatNumber(value, maximumFractionDigits = 2) {
  const number = finiteNumber(value)
  if (number === null) return '-'
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits }).format(
    number
  )
}

function formatInteger(value) {
  return formatNumber(value, 0)
}

function formatMoney(value, fractionDigits = 0) {
  const number = finiteNumber(value)
  if (number === null) return '-'

  const formattedNumber = new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(Math.abs(number))

  return `${number < 0 ? '-' : ''}$${formattedNumber}`
}

function formatPrice(value, minimumFractionDigits = 0) {
  const number = finiteNumber(value)
  if (number === null) return '-'
  return `$${new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits,
    maximumFractionDigits: 2
  }).format(number)}`
}

function formatClosePrice(value) {
  const number = finiteNumber(value)
  if (number === null) return '-'
  return `$${new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)}`
}

function buildDailyExecutionTooltipLines(rows = [], sessionDate) {
  const day = rows.find(row => row.sessionDate === sessionDate)
  if (!day) return []

  return [
    `종가 ${formatClosePrice(day.closePrice)}`,
    ...(day.executions || []).map(
      execution =>
        `${execution.tradeSide} ${execution.tier} · ${formatPrice(execution.price)} · ${formatInteger(execution.quantity)}주`
    )
  ]
}

function getDailyExecutionTooltipDate(tooltipItem) {
  if (!tooltipItem) return null
  const rawDate =
    tooltipItem.raw && typeof tooltipItem.raw === 'object'
      ? tooltipItem.raw.x
      : null
  return (
    rawDate || tooltipItem.chart?.data?.labels?.[tooltipItem.dataIndex] || null
  )
}

function formatPct(value, showSign = true) {
  const number = finiteNumber(value)
  if (number === null) return '-'
  return `${showSign && number > 0 ? '+' : ''}${formatNumber(number, 2)}%`
}

function formatCompactNumber(value) {
  const number = finiteNumber(value)
  if (number === null) return '-'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number)
}

function formatZonedDateTime(value, timeZone, zoneLabel = '') {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const options = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }
  if (zoneLabel === 'AUTO') options.timeZoneName = 'short'

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', options)
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )
  const formatted = `${parts.year}.${parts.month}.${parts.day} ${parts.weekday.toUpperCase()} · ${parts.hour}:${parts.minute}`
  const suffix = zoneLabel === 'AUTO' ? parts.timeZoneName : zoneLabel

  return suffix ? `${formatted} ${suffix}` : formatted
}

function formatDateTime(date) {
  return formatZonedDateTime(date, 'Asia/Seoul', 'KST')
}

function profitClass(value) {
  const number = finiteNumber(value)
  if (number === null || number === 0) return ''
  return number > 0 ? 'value-positive' : 'value-negative'
}

function modeColor(mode) {
  if (mode === '공격') return 'amber-8'
  if (mode === '방어') return 'green-6'
  return 'grey-6'
}

function sideLabel(side) {
  if (side === 'BUY') return '매수'
  if (side === 'SELL') return '매도'
  return side || '-'
}

function sideClass(side) {
  if (side === 'BUY') return 'operation-side--buy'
  if (side === 'SELL') return 'operation-side--sell'
  return ''
}

function shortTypeLabel(value) {
  const label = String(value || '').trim()
  return label ? label.charAt(0).toUpperCase() : '-'
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineController,
  ScatterController,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  agentChartRangeGuidePlugin
)

onMounted(fetchAgentResult)
</script>

<style scoped lang="scss">
.agent-page {
  --agent-accent: #357a55;
  --agent-accent-soft: rgba(53, 122, 85, 0.1);
  --agent-accent-border: rgba(53, 122, 85, 0.45);

  min-height: calc(100vh - 82px);
  background: var(--dk-paper);
  color: var(--dk-ink);
}

.workspace-intro {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
  align-items: end;
  padding-block: 38px 34px;

  > div:first-child {
    grid-column: 1 / 9;
  }

  h1 {
    margin: 15px 0 0;
    font-size: clamp(2rem, 3.2vw, 3.6rem);
    font-weight: 400;
    line-height: 1.08;
  }
}

.workspace-intro__status {
  grid-column: 9 / 13;
  display: flex;
  padding-top: 13px;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  border-top: 1px solid var(--dk-line-strong);

  p {
    margin: 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.1em;
  }
}

.workspace-intro__times {
  display: grid;
  width: 100%;
  gap: 0;
}

.workspace-intro__time-row {
  display: grid;
  width: 100%;
  min-height: 22px;
  grid-template-columns: 62px 8px minmax(0, max-content) auto;
  align-items: center;
  column-gap: 6px;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;

  > span {
    letter-spacing: 0.1em;
  }

  > i {
    font-style: normal;
    text-align: center;
  }

  time {
    white-space: nowrap;
  }
}

.section-heading__meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.section-heading__meta--operation {
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 4px;
}

.section-heading__updated {
  display: flex;
  min-height: 22px;
  align-items: center;
  gap: 4px;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.section-heading__updated--operation {
  gap: 8px;
}

.section-heading__updated-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-heading__refresh {
  flex: 0 0 auto;
  width: 22px;
  min-width: 22px;
  height: 22px;
  min-height: 22px;
  padding: 0;

  :deep(.q-icon) {
    font-size: 14px;
  }
}

.system-state {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: var(--dk-text-label);
  letter-spacing: 0.13em;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--agent-accent);
    box-shadow: 0 0 0 4px var(--agent-accent-soft);
  }
}

.tabs-bar {
  position: sticky;
  top: 82px;
  z-index: 4;
  min-height: 52px;
  border-block: 1px solid var(--dk-line);
  background: rgba(244, 241, 234, 0.94);
  color: var(--dk-muted);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  :deep(.q-tab) {
    min-height: 52px;
    font-size: var(--dk-text-label);
    font-weight: 500;
    letter-spacing: 0.08em;
  }
}

.agent-tab-panels,
.agent-tab-panel {
  min-width: 0;
  overflow: visible;
  background: transparent;
}

:deep(.text-green-5),
:deep(.text-green-6),
:deep(.text-green-7),
:deep(.text-green-8) {
  color: var(--agent-accent) !important;
}

:deep(.bg-green-5),
:deep(.bg-green-6),
:deep(.bg-green-7),
:deep(.bg-green-8) {
  background: var(--agent-accent) !important;
}

.content-container {
  width: min(1120px, calc(100% - 24px));
  margin: 0 auto;
  padding: 24px 0 56px;
}

.error-banner {
  margin-bottom: 24px;
  border: 1px solid rgba(157, 74, 63, 0.28);
  background: rgba(157, 74, 63, 0.07);
  color: #733a32;

  p {
    margin: 4px 0 0;
  }
}

.loading-shell {
  display: grid;
  gap: 16px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.agent-operation,
.agent-overview,
.agent-charts {
  padding: 0;
  border: 0;
}

.agent-overview,
.agent-charts {
  margin-bottom: 16px;
}

.section-heading {
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);

  h2 {
    margin: 3px 0;
    font-size: var(--dk-text-heading);
    font-weight: 400;
    line-height: 1.25;
    letter-spacing: 0;
  }

  > div > p:last-child {
    margin: 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-body-sm);
  }

  &__description {
    margin: 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-body-sm);
  }

  > span {
    color: var(--dk-muted);
    font-size: var(--dk-text-label);
    letter-spacing: 0.1em;
  }
}

.section-heading--split {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: flex-end;
}

.agent-operation > .section-heading {
  margin-bottom: 22px;
}

.section-card {
  overflow: hidden;
  margin-bottom: 16px;
  border-color: var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
  box-shadow: none;

  > .section-heading {
    margin-bottom: 0;
    border: 0;
    border-radius: 0;
  }
}

.section-index {
  margin: 0;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-weight: 600;
  letter-spacing: 0.1em;
}

.timeline-timezone-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-weight: 600;
  letter-spacing: 0.08em;

  button {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    opacity: 0.42;
    transition:
      color 140ms ease,
      opacity 140ms ease;
    cursor: pointer;

    &.is-active {
      color: var(--dk-ink);
      opacity: 1;
    }

    &:focus-visible {
      outline: 1px solid currentcolor;
      outline-offset: 3px;
    }
  }

  > span {
    opacity: 0.3;
  }
}

.source-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;

  span {
    padding: 7px 10px;
    border: 1px solid var(--dk-line);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.09em;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 10px;
}

.metric-card {
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
  text-align: center;

  &__label {
    color: var(--dk-muted);
    font-size: var(--dk-text-label);
    letter-spacing: 0.04em;
  }

  strong {
    display: block;
    margin-top: 5px;
    color: var(--dk-ink);
    font-size: var(--dk-text-heading-sm);
    font-weight: 650;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }
}

.current-tiers {
  margin-top: 10px;
  border: 1px solid var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
}

.current-tiers__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--dk-line);

  .section-index {
    margin: 0;
  }

  > span {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.08em;
  }
}

.current-tiers__table {
  border-radius: 0;
  box-shadow: none;

  table {
    width: 100%;
    table-layout: fixed;
  }

  th,
  td {
    height: 38px;
    padding: 6px 10px;
    font-size: var(--dk-text-body-sm);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  th {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    font-weight: 500;
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 14%;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 16%;
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 26%;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 20%;
  }

  th:nth-child(5),
  td:nth-child(5) {
    width: 24%;
  }
}

.current-tier-name {
  color: var(--dk-ink);
  font-weight: 700;
  text-align: center;
}

.current-tiers > .detail-empty {
  margin: 0;
  padding: 18px 14px;
}

.operation-list {
  display: grid;
  gap: 0;
}

.operation-slide {
  position: relative;
  display: grid;
  min-width: 0;
  margin-bottom: 8px;
  grid-template-columns: 132px minmax(0, 1fr);
  column-gap: 12px;
  row-gap: 0;
}

.operation-rail {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 72px;
  padding: 34px 0 8px 35px;
  flex-direction: column;
  gap: 5px;

  &::before {
    position: absolute;
    top: -8px;
    bottom: -16px;
    left: 11px;
    width: 1px;
    background: var(--dk-line-strong);
    content: '';
  }

  strong {
    font-size: var(--dk-text-body-sm);
    font-weight: 600;
  }

  time {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.05em;
  }
}

.operation-rail__time {
  position: relative;
  display: block;
  min-height: 1em;

  time {
    position: absolute;
    inset: 0 auto auto 0;
    font-variant-numeric: tabular-nums;
  }
}

.operation-date-divider {
  height: 28px;
  grid-column: 1 / -1;
}

.operation-date-divider__rail {
  position: relative;
  height: 100%;
  min-width: 0;

  &::before {
    position: absolute;
    top: -8px;
    bottom: -8px;
    left: 11px;
    width: 1px;
    background: var(--dk-line-strong);
    content: '';
  }

  span {
    position: absolute;
    top: calc(50% + 4px);
    left: 9px;
    z-index: 1;
    width: 5px;
    height: 5px;
    background: var(--dk-line-strong);
    transform: translateY(-50%);
  }

  time {
    position: absolute;
    top: calc(50% + 4px);
    left: 27px;
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
    transform: translateY(-50%);
    white-space: nowrap;
  }
}

.timeline-time-enter-active,
.timeline-time-leave-active {
  transition: opacity 160ms ease;
}

.timeline-time-enter-from,
.timeline-time-leave-to {
  opacity: 0;
}

.timeline-date-enter-active,
.timeline-date-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.timeline-date-enter-from,
.timeline-date-leave-to {
  opacity: 0;
  transform: translateY(3px);
}

.timeline-date-leave-active {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
}

.operation-flow-move {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.operation-node {
  position: absolute;
  top: 33px;
  left: 1px;
  z-index: 1;
  display: grid;
  width: 20px;
  height: 20px;
  border: 1px solid var(--dk-line-strong);
  border-radius: 50%;
  place-items: center;
  background: var(--dk-surface);
  color: var(--dk-surface);
  font-size: var(--dk-text-label);
  font-weight: 700;
  transition:
    transform 180ms ease,
    background-color 180ms ease;
}

.operation-node--success {
  border-color: var(--agent-accent);
  background: var(--agent-accent);
}

.operation-node--failed {
  border-color: #9d4a3f;
  background: #9d4a3f;
}

.operation-node--running {
  border-color: var(--dk-ink);
  background: var(--dk-ink);
  font-size: 1rem;
}

.operation-node--next {
  overflow: hidden;
}

.operation-node--next::after {
  position: absolute;
  inset: 0;
  background: #357a557e;
  pointer-events: none;
  animation: operation-next-glow 2.2s ease-in-out infinite;
  content: '';
}

@keyframes operation-next-glow {
  0%,
  100% {
    opacity: 0.26;
    clip-path: circle(37.5% at 50% 50%);
  }

  50% {
    opacity: 0.92;
    clip-path: circle(58% at 50% 50%);
  }
}

.operation-slide:has(.operation-card.is-expanded) .operation-node {
  transform: scale(1.14);
  box-shadow: 0 0 0 4px rgba(23, 23, 23, 0.07);
}

.operation-card {
  min-width: 0;
  overflow: hidden;
  border-color: var(--dk-line);
  border-radius: 2px;
  background: var(--dk-paper);
  transition: border-color 180ms ease;

  &.is-expanded {
    border-color: var(--dk-line-strong);
  }
}

.operation-card--failed.is-expanded {
  border-color: rgba(157, 74, 63, 0.7);
}

.operation-card__head {
  display: flex;
  min-height: 72px;
  padding: 9px 12px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid var(--dk-ink);
    outline-offset: -2px;
  }

  p {
    margin: 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    font-weight: 600;
    letter-spacing: 0.11em;
  }

  h3 {
    margin: 2px 0 1px;
    font-size: var(--dk-text-heading-sm);
    font-weight: 400;
    line-height: 1.1;
  }

  > div:first-child > span {
    color: var(--dk-muted);
    font-size: var(--dk-text-label);
    font-variant-numeric: tabular-nums;

    .operation-countdown-value {
      // color: var(--dk-ink);
      font-weight: 600;
    }
  }
}

.operation-card__meta {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  flex-direction: column;
  gap: 4px;

  small {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.04em;
  }
}

.operation-expand-icon {
  margin-top: 1px;
  color: var(--dk-muted);
  font-size: 17px;
  transition: transform 180ms ease;

  &.is-expanded {
    transform: rotate(180deg);
  }
}

.operation-status {
  min-width: 68px;
  padding: 4px 7px;
  border: 1px solid var(--dk-line-strong);
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-align: center;
}

.operation-status--success {
  border-color: var(--agent-accent-border);
  background: var(--agent-accent-soft);
  color: var(--agent-accent);
}

.operation-status--failed {
  border-color: rgba(157, 74, 63, 0.42);
  background: rgba(157, 74, 63, 0.08);
  color: #8c4037;
}

.operation-status--running {
  background: var(--dk-ink);
  color: var(--dk-surface);
}

.operation-card__body {
  padding: 10px 12px 12px;
}

.operation-empty {
  display: flex;
  min-height: 88px;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: var(--dk-muted);

  > span {
    font-family: var(--dk-font-serif);
    font-size: 1.8rem;
    opacity: 0.36;
  }

  strong {
    color: var(--dk-ink);
    font-size: var(--dk-text-body);
  }

  p {
    margin: 5px 0 0;
    font-size: var(--dk-text-label);
  }
}

.operation-error {
  display: flex;
  margin-bottom: 8px;
  padding: 8px 10px;
  flex-direction: column;
  gap: 3px;
  border: 1px solid rgba(157, 74, 63, 0.3);
  background: rgba(157, 74, 63, 0.07);
  color: #733a32;
  font-size: var(--dk-text-label);
}

.operation-mode-banner {
  display: flex;
  margin-bottom: 8px;
  padding: 9px 10px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #1c1d1b;
  color: #f2f0e9;

  span {
    color: rgba(242, 240, 233, 0.56);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.11em;
  }

  strong {
    font-size: var(--dk-text-body);
    font-weight: 500;
  }

  i {
    margin-inline: 8px;
    color: rgba(242, 240, 233, 0.5);
    font-style: normal;
  }
}

.operation-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1px;
  border: 1px solid var(--dk-line);
  background: var(--dk-line);

  > div {
    display: flex;
    min-width: 0;
    padding: 7px 9px;
    flex-direction: column;
    gap: 2px;
    background: var(--dk-surface);

    span {
      color: var(--dk-muted);
      font-size: var(--dk-text-caption);
    }

    strong {
      overflow: hidden;
      font-size: var(--dk-text-body-sm);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.operation-data-grid--compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.operation-cash-value {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;

  small {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    font-weight: 500;
  }
}

.operation-detail-block {
  margin-top: 10px;

  h4 {
    margin: 0 0 5px;
    font-size: var(--dk-text-body-sm);
    font-weight: 600;
  }
}

.operation-table-scroll {
  overflow-x: auto;
  border-top: 1px solid var(--dk-line);

  :deep(table) {
    min-width: 760px;
  }

  :deep(th),
  :deep(td) {
    height: 28px;
    padding: 3px 6px;
    font-size: var(--dk-text-label);
    white-space: nowrap;
  }

  small {
    display: block;
    color: #9d4a3f;
    font-size: var(--dk-text-caption);
  }
}

.operation-mobile-rows {
  display: none;
}

.operation-side {
  display: inline-flex;
  min-width: 30px;
  padding: 2px 5px;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-size: var(--dk-text-caption);
  font-weight: 600;
  line-height: 1.2;
}

.operation-side--buy {
  background: var(--agent-accent-soft);
  color: var(--agent-accent);
}

.operation-side--sell {
  background: rgba(157, 74, 63, 0.09);
  color: #9d4a3f;
}

.operation-empty-state {
  padding: 72px 20px;
  border: 1px solid var(--dk-line);
  background: var(--dk-surface);
  text-align: center;

  strong {
    font-family: var(--dk-font-serif);
    font-size: var(--dk-text-heading-sm);
    font-weight: 400;
  }

  p {
    margin: 7px 0 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-body-sm);
  }
}

.chart-range-card {
  padding: 0;
}

.chart-range-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.chart-range-dates {
  flex: 0 0 auto;
  color: var(--dk-muted) !important;
  white-space: nowrap;
}

.chart-range-controls {
  display: grid;
  gap: 18px;
}

.chart-range-presets {
  display: grid;
  width: min(100%, 520px);
  margin-bottom: 8px;
  border: 1px solid var(--dk-line);
  grid-template-columns: repeat(5, minmax(0, 1fr));
  justify-self: center;

  :deep(.q-btn) {
    width: 100%;
    min-width: 0;
    padding-inline: 8px;
    border-radius: 0;
  }

  :deep(.q-btn + .q-btn) {
    border-left: 1px solid var(--dk-line);
  }
}

.chart-range-slider {
  padding: 18px 10px 0;
}

.chart-range-adjustments {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  :deep(.q-btn) {
    width: 100%;
  }
}

.chart-container {
  position: relative;
  width: 100%;
  height: 340px;
}

.charts-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.chart-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
}

.chart-card__heading {
  padding: 14px 16px;
  border-bottom: 1px solid var(--dk-line);

  h3 {
    margin: 0;
    font-family: var(--dk-font-serif);
    font-size: var(--dk-text-heading);
    font-weight: 400;
  }

  p {
    margin: 6px 0 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-body-sm);
  }
}

.chart-frame {
  height: 340px;
  padding: 16px;
}

.daily-history {
  display: grid;
  gap: 2px;
}

.daily-history-item {
  overflow: hidden;
  border: 1px solid var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
}

.daily-header,
.daily-row {
  display: grid;
  grid-template-columns: 1.1fr 0.65fr 0.75fr 1.1fr 0.65fr 0.5fr 0.5fr 1.05fr 0.75fr;
  gap: 8px;
  align-items: center;
}

.daily-header {
  padding: 7px 44px 7px 12px;
  color: var(--dk-muted);
  font-size: var(--dk-text-label);
  font-weight: 700;
  background: rgba(23, 23, 23, 0.035);
}

.daily-row {
  width: 100%;
  color: var(--dk-ink);
  font-size: var(--dk-text-body-sm);
}

.daily-cell {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.daily-mobile-summary {
  display: none;
}

.daily-history-item :deep(.daily-item-header) {
  min-height: 38px;
  padding: 3px 12px;
}

.daily-history-item :deep(.daily-expand-section) {
  width: 22px;
  min-width: 22px;
  padding-top: 7px;
  padding-left: 6px;
  align-items: center;
  justify-content: flex-start;
  color: var(--dk-muted);
}

.daily-history-item :deep(.daily-expand-section .q-icon) {
  font-size: 18px;
}

.daily-detail {
  padding: 16px;
  background: var(--dk-surface) !important;
}

.detail-section + .detail-section {
  margin-top: 16px;
}

.detail-title {
  margin-bottom: 8px;
  color: var(--dk-ink);
  font-size: var(--dk-text-body);
  font-weight: 700;
}

.detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  color: var(--dk-muted);
  font-size: var(--dk-text-body-sm);
}

:deep(.plan-summary-table table) {
  width: 100%;
  table-layout: auto;
}

:deep(.plan-summary-table th),
:deep(.plan-summary-table td) {
  padding: 5px 8px;
  white-space: nowrap;
}

.detail-note {
  margin-top: 6px;
  color: var(--dk-muted);
  font-size: var(--dk-text-body-sm);
}

.table-scroll {
  max-width: 100%;
  overflow-x: auto;
}

:deep(.q-table__container) {
  border-color: var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
  box-shadow: none;
}

:deep(.q-table thead tr),
:deep(.q-table tbody td) {
  background: transparent;
}

:deep(.q-table th) {
  color: var(--dk-muted);
  font-size: var(--dk-text-label);
  font-weight: 600;
  letter-spacing: 0.03em;
}

:deep(.q-table td) {
  font-size: var(--dk-text-body-sm);
}

.table-scroll small {
  display: block;
  margin-top: 2px;
  color: var(--dk-muted);
}

.empty-copy,
.detail-empty {
  color: var(--dk-muted);
}

.detail-empty {
  margin: 0;
  font-size: var(--dk-text-body-sm);
}

.value-positive {
  color: var(--agent-accent);
}

.value-negative {
  color: #9d4a3f;
}

@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .loading-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .agent-page {
    min-height: calc(100vh - 68px);
  }

  .workspace-intro {
    grid-template-columns: minmax(0, 1fr);
  }

  .workspace-intro {
    gap: 24px;

    > div:first-child,
    .workspace-intro__status {
      grid-column: 1 / -1;
    }

    h1 {
      font-size: clamp(1.85rem, 9vw, 2.65rem);
    }
  }

  .content-container {
    width: calc(100% - 16px);
    padding: 12px 0 56px;
  }

  .section-heading--split {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-heading__meta {
    align-items: flex-start;
  }

  .section-heading__meta--operation {
    width: 100%;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
  }

  .section-heading__meta--performance {
    width: 100%;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
  }

  .section-heading__updated--quiet {
    min-height: 16px;
    font-size: var(--dk-text-caption);
    letter-spacing: 0.02em;
    line-height: 16px;

    .section-heading__updated-label {
      display: none;
    }

    .section-heading__refresh {
      align-self: center;
      width: 16px;
      min-width: 16px;
      height: 16px;
      min-height: 16px;
      margin-right: -7px;
      color: inherit !important;
    }
  }

  .section-heading__updated--operation {
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }

  .section-heading__updated-time {
    justify-content: flex-end;
  }

  .source-tags {
    justify-content: flex-start;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .current-tiers__table {
    th,
    td {
      height: 34px;
      padding: 5px 4px;
      font-size: clamp(0.62rem, 2.5vw, var(--dk-text-caption));
    }

    th {
      font-size: clamp(0.58rem, 2.3vw, var(--dk-text-caption));
    }
  }

  .metric-card {
    padding: 10px 14px;

    strong {
      font-size: var(--dk-text-heading-sm);
    }
  }

  .chart-card {
    padding: 16px;
  }

  .chart-card {
    padding: 0;
  }

  .operation-slide {
    grid-template-columns: 78px minmax(0, 1fr);
    column-gap: 6px;
  }

  .operation-date-divider {
    height: 24px;
  }

  .operation-rail {
    min-height: 64px;
    padding: 31px 0 6px 25px;

    &::before {
      top: -8px;
      bottom: -14px;
      left: 8px;
    }

    strong {
      font-size: var(--dk-text-label);
    }
  }

  .operation-date-divider__rail {
    &::before {
      left: 8px;
    }

    span {
      left: 6px;
      width: 5px;
      height: 5px;
    }

    time {
      left: 22px;
      font-size: var(--dk-text-caption);
      letter-spacing: 0.025em;
    }
  }

  .operation-node {
    top: 30px;
    left: 0;
    width: 17px;
    height: 17px;
  }

  .operation-card__head {
    min-height: 64px;
    padding: 7px 9px;
    gap: 7px;
  }

  .operation-card__body {
    padding: 8px 9px 10px;
  }

  .operation-data-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .operation-table-scroll {
    width: 100%;
    min-width: 0;
    overflow: visible;
    border-top: 0;
  }

  :deep(.operation-desktop-table) {
    display: none;
  }

  .operation-mobile-rows {
    display: grid;
    gap: 5px;

    article {
      min-width: 0;
      border: 1px solid var(--dk-line);
      background: var(--dk-surface);
    }

    dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin: 0;

      > div {
        min-width: 0;
        padding: 6px 8px;
        border-top: 1px solid var(--dk-line);

        &:nth-child(even) {
          border-left: 1px solid var(--dk-line);
        }

        &:last-child:nth-child(odd) {
          grid-column: 1 / -1;
        }
      }
    }

    dt {
      color: var(--dk-muted);
      font-size: var(--dk-text-caption);
      letter-spacing: 0.02em;
    }

    dd {
      margin: 2px 0 0;
      font-size: var(--dk-text-label);
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
  }

  .operation-mobile-rows--three-columns {
    dl {
      grid-template-columns: repeat(3, minmax(0, 1fr));

      > div {
        &:nth-child(even) {
          border-left: 0;
        }

        &:nth-child(3n + 2),
        &:nth-child(3n + 3) {
          border-left: 1px solid var(--dk-line);
        }

        &:last-child:nth-child(odd) {
          grid-column: auto;
        }
      }
    }
  }

  .operation-mobile-row__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    padding: 7px 8px;
    font-size: var(--dk-text-label);

    strong,
    span {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  .operation-mobile-row__error {
    margin: 0;
    padding: 6px 8px;
    border-top: 1px solid var(--dk-line);
    color: #9d4a3f;
    font-size: var(--dk-text-caption);
    overflow-wrap: anywhere;
  }

  .chart-frame {
    height: 300px;
  }

  .daily-desktop-summary,
  .daily-header {
    display: none;
  }

  .daily-history-item :deep(.daily-item-header) {
    min-height: 48px;
    padding: 8px 12px;
  }

  .daily-mobile-summary {
    display: block;
    width: 100%;
    min-width: 0;
    padding: 2px 0;
  }

  .daily-mobile-summary__header,
  .daily-mobile-summary__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .daily-mobile-summary__values {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-top: 5px;
  }

  .daily-mobile-summary__values > div {
    display: flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  .daily-mobile-summary__primary {
    color: var(--dk-ink);
    font-size: var(--dk-text-body);
    font-weight: 700;
    white-space: nowrap;
  }

  .daily-mobile-summary__cash {
    padding-left: 6px;
    color: var(--dk-ink);
    font-size: var(--dk-text-label);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .daily-close-badge {
    padding: 3px 7px;
    border: 1px solid var(--dk-line);
    background: rgba(23, 23, 23, 0.045) !important;
    color: var(--dk-muted) !important;
    font-size: var(--dk-text-caption);
    font-weight: 600;
  }

  .daily-mobile-summary__meta {
    margin-top: 4px;
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
  }

  .data-label {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
  }

  .daily-detail {
    padding: 12px;
  }

  :deep(.plan-summary-table th),
  :deep(.plan-summary-table td) {
    padding: 4px 2px;
  }

  :deep(.daily-submission-status) {
    display: none;
  }
}

@media (max-width: 599px) {
  .chart-range-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .chart-range-dates {
    width: 100%;
    font-size: var(--dk-text-body-sm);
  }

  .chart-range-presets {
    width: 100%;
  }

  .chart-range-presets :deep(.q-btn) {
    padding-inline: 4px;
  }

  .chart-range-adjustments {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, auto);
    grid-auto-flow: column;

    :deep(.q-btn) {
      width: 100%;
    }
  }

  .chart-range-slider {
    padding-right: 4px;
    padding-left: 4px;
  }

  .chart-container {
    height: 300px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .timeline-time-enter-active,
  .timeline-time-leave-active,
  .timeline-date-enter-active,
  .timeline-date-leave-active,
  .operation-flow-move {
    transition: none;
  }

  .timeline-date-enter-from,
  .timeline-date-leave-to {
    transform: none;
  }

  .timeline-timezone-toggle button {
    transition: none;
  }

  .operation-node--next::after {
    opacity: 0.72;
    box-shadow: 0 0 0 2px rgba(23, 23, 23, 0.08);
    animation: none;
    clip-path: circle(45% at 50% 50%);
  }
}
</style>
