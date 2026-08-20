<template>
  <q-page class="agent-page">
    <main class="content-container">
      <div class="agent-tab-panels">
        <section class="agent-tab-panel">
          <q-banner v-if="operationLoadError" class="error-banner" rounded>
            <div>
              <strong>운영 상태를 불러오지 못했습니다.</strong>
              <p>{{ operationLoadError }}</p>
            </div>
            <template #action>
              <q-btn
                flat
                dense
                no-caps
                color="negative"
                label="다시 시도"
                @click="fetchOperationResult"
              />
            </template>
          </q-banner>

          <div
            v-if="isOperationLoading"
            class="loading-shell"
            aria-label="운영 상태 불러오는 중"
          >
            <q-skeleton type="rect" height="110px" />
            <q-skeleton type="rect" height="620px" />
          </div>

          <section
            v-else-if="operationResult"
            class="agent-operation"
            aria-labelledby="agent-operation-title"
          >
            <div class="section-heading section-heading--split">
              <div>
                <p class="section-index">01 · LIVE OPERATION</p>
                <h2 id="agent-operation-title" class="dk-serif">
                  Agent Operation
                </h2>
                <p
                  class="section-heading__description"
                  style="margin-top: 6px; font-size: 12px"
                >
                  {{ nextOperationHeadline.message }}
                  <template v-if="nextOperationHeadline.countdown">
                    <strong class="operation-heading-countdown">{{
                      nextOperationHeadline.countdown
                    }}</strong>
                    남음
                  </template>
                </p>
              </div>
              <div
                class="section-heading__meta section-heading__meta--operation"
              >
                <div class="source-tags">
                  <span>{{ operationResult?.owner || 'PRIVATE' }}</span>
                  <span
                    >STRATEGY {{ operationResult?.strategyId || '01' }}</span
                  >
                </div>
                <div
                  class="section-heading__updated section-heading__updated--quiet section-heading__updated--operation"
                >
                  <div class="section-heading__updated-time">
                    <time
                      :datetime="
                        operationUpdatedAt
                          ? operationUpdatedAt.toISOString()
                          : undefined
                      "
                      >{{ formatOperationUpdatedAt(operationUpdatedAt) }}</time
                    >
                    <q-btn
                      flat
                      dense
                      round
                      icon="refresh"
                      color="dark"
                      aria-label="운영 상태 새로고침"
                      class="section-heading__refresh"
                      :loading="isOperationRefreshing"
                      @click="fetchOperationResult"
                    />
                  </div>
                </div>
              </div>
            </div>

            <section
              class="operation-active-tiers"
              aria-labelledby="operation-active-tiers-title"
            >
              <div class="operation-active-tiers__heading">
                <p id="operation-active-tiers-title" class="section-index">
                  ACTIVE TIERS
                </p>
                <span>
                  {{ operationResult.activeTiersAsOfDate || '-' }} ·
                  {{ activeTiers.length }} TIERS
                </span>
              </div>

              <dl
                v-if="activeTiers.length"
                class="operation-active-tiers__summary"
                aria-label="Active Tier 전체 요약"
              >
                <div>
                  <dt>보유</dt>
                  <dd>{{ formatInteger(activeTiersSummary.quantity) }}주</dd>
                </div>
                <div>
                  <dt>매수가</dt>
                  <dd>{{ formatPrice(activeTiersSummary.averageBuyPrice) }}</dd>
                </div>
                <div>
                  <dt>손익</dt>
                  <dd :class="profitClass(activeTiersSummary.profitLoss)">
                    {{ formatMoney(activeTiersSummary.profitLoss) }}
                  </dd>
                </div>
                <div>
                  <dt>수익률</dt>
                  <dd :class="profitClass(activeTiersSummary.returnPct)">
                    {{ formatPct(activeTiersSummary.returnPct) }}
                  </dd>
                </div>
                <div>
                  <dt>종가</dt>
                  <dd>{{ formatClosePrice(activeTiersClosePrice) }}</dd>
                </div>
              </dl>

              <q-markup-table
                v-if="activeTiers.length"
                flat
                dense
                separator="horizontal"
                class="operation-active-tiers__table"
              >
                <thead>
                  <tr>
                    <th class="text-center">Tier</th>
                    <th class="text-center">보유</th>
                    <th class="text-center">매수일</th>
                    <th class="text-right">매수가</th>
                    <th class="text-right">손익</th>
                    <th class="text-right">수익률</th>
                    <th class="text-right">보유</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tier in activeTiers" :key="tier.tier">
                    <td class="operation-active-tier-name">
                      {{ tier.tier }}
                    </td>
                    <td class="text-center">
                      {{ formatInteger(tier.quantity) }}주
                    </td>
                    <td class="text-center">
                      {{ tier.buySessionDate || '-' }}
                    </td>
                    <td class="text-right">
                      {{ formatPrice(tier.buyPrice) }}
                    </td>
                    <td
                      class="text-right"
                      :class="profitClass(activeTierProfitLoss(tier))"
                    >
                      {{ formatMoney(activeTierProfitLoss(tier)) }}
                    </td>
                    <td
                      class="text-right"
                      :class="profitClass(activeTierReturnPct(tier))"
                    >
                      {{ formatPct(activeTierReturnPct(tier)) }}
                    </td>
                    <td class="text-right">
                      {{ formatInteger(tier.heldSessionCount) }} /
                      {{ formatInteger(tier.maxHoldDays) }}
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
              <p v-else class="operation-active-tiers__empty">
                현재 운용 중인 Tier가 없습니다.
              </p>
            </section>

            <div class="operation-status-card">
              <div class="operation-status-card__head">
                <span class="system-state"><i></i> AGENT CONNECTED</span>
                <div
                  class="timeline-timezone-toggle"
                  role="group"
                  aria-label="타임라인 시간대"
                >
                  <button
                    type="button"
                    :class="{ 'is-active': operationTimeZone === 'KST' }"
                    :aria-pressed="operationTimeZone === 'KST'"
                    @click="operationTimeZone = 'KST'"
                    >SEOUL</button
                  >
                  <span aria-hidden="true">|</span>
                  <button
                    type="button"
                    :class="{ 'is-active': operationTimeZone === 'ET' }"
                    :aria-pressed="operationTimeZone === 'ET'"
                    @click="operationTimeZone = 'ET'"
                    >NEW YORK</button
                  >
                </div>
              </div>
              <div
                class="operation-status-card__times"
                aria-label="선택한 지역의 현재 시각"
                aria-live="polite"
              >
                <time
                  :key="operationTimeZone"
                  :datetime="clockNow.toISOString()"
                  >{{
                    formatZonedDateTime(
                      clockNow,
                      OPERATION_TIME_ZONES[operationTimeZone],
                      operationTimeZone === 'ET' ? 'AUTO' : 'KST'
                    )
                  }}</time
                >
              </div>
            </div>

            <TransitionGroup
              v-if="operationSlides.length"
              tag="div"
              name="operation-flow"
              class="operation-list"
              aria-label="날짜별 Agent 작업 흐름"
            >
              <article
                v-for="slide in operationSlides"
                :key="slide.id"
                class="operation-slide"
              >
                <aside class="operation-rail">
                  <span
                    class="operation-node"
                    :class="[
                      `operation-node--${operationStatusKind(slide)}`,
                      { 'operation-node--next': slide.isNextPending }
                    ]"
                  >
                    {{ operationNodeLabel(slide) }}
                  </span>
                  <strong>{{ slide.label }}</strong>
                  <span class="operation-rail__time">
                    <Transition name="timeline-time">
                      <time :key="operationTimeZone">{{
                        formatOperationTime(operationSlideDateTime(slide))
                      }}</time>
                    </Transition>
                  </span>
                </aside>

                <q-card
                  flat
                  bordered
                  class="operation-card"
                  :class="[
                    `operation-card--${operationStatusKind(slide)}`,
                    { 'is-expanded': isOperationExpanded(slide.id) }
                  ]"
                >
                  <q-card-section
                    class="operation-card__head"
                    role="button"
                    tabindex="0"
                    :aria-expanded="isOperationExpanded(slide.id)"
                    @click="toggleOperation(slide.id)"
                    @keydown.enter.prevent="toggleOperation(slide.id)"
                    @keydown.space.prevent="toggleOperation(slide.id)"
                  >
                    <div>
                      <p>{{ slide.index }} · {{ slide.jobType }}</p>
                      <h3 class="dk-serif">{{ slide.label }}</h3>
                      <span>
                        <template v-if="operationCountdownLabel(slide)">
                          실행까지
                          <strong class="operation-countdown-value">{{
                            operationCountdownLabel(slide)
                          }}</strong>
                          남음
                        </template>
                        <template v-else>{{
                          operationSummary(slide)
                        }}</template>
                      </span>
                    </div>
                    <div class="operation-card__meta">
                      <span
                        class="operation-status"
                        :class="`operation-status--${operationStatusKind(slide)}`"
                      >
                        {{ operationStatusLabel(slide) }}
                      </span>
                      <small v-if="slide.job">
                        {{ formatOperationDuration(slide.job) }}
                        <template v-if="slide.attemptCount > 1">
                          · {{ slide.attemptCount }} ATTEMPTS
                        </template>
                      </small>
                      <q-icon
                        name="expand_more"
                        class="operation-expand-icon"
                        :class="{
                          'is-expanded': isOperationExpanded(slide.id)
                        }"
                        aria-hidden="true"
                      />
                    </div>
                  </q-card-section>

                  <q-slide-transition>
                    <div v-show="isOperationExpanded(slide.id)">
                      <q-separator />

                      <q-card-section class="operation-card__body">
                        <div v-if="slide.isMissing" class="operation-empty">
                          <span>{{ slide.index }}</span>
                          <div>
                            <strong>실행 준비 중입니다.</strong>
                            <p>예정 시간까지 조금만 기다려 주세요 🤖</p>
                          </div>
                        </div>

                        <template v-else>
                          <div
                            v-if="slide.job.errorCode || slide.job.errorMessage"
                            class="operation-error"
                          >
                            <strong>{{
                              slide.job.errorCode || 'ERROR'
                            }}</strong>
                            <span>{{
                              slide.job.errorMessage ||
                              '작업이 완료되지 않았습니다.'
                            }}</span>
                          </div>

                          <template v-if="slide.jobType === 'PREPARE'">
                            <div class="operation-mode-banner">
                              <span>MODE TRANSITION</span>
                              <strong>
                                {{ slide.job.details?.mode || '-' }}
                                <i>→</i>
                                {{ slide.job.details?.nextMode || '-' }}
                              </strong>
                            </div>
                            <div class="operation-data-grid">
                              <div
                                ><span>계획 기준일</span
                                ><strong>{{
                                  slide.job.details?.calculatedThroughDate ||
                                  '-'
                                }}</strong></div
                              >
                              <div
                                ><span>주문 대상일</span
                                ><strong>{{
                                  slide.targetDate || '-'
                                }}</strong></div
                              >
                              <div
                                ><span>완료 세션</span
                                ><strong>{{
                                  formatInteger(
                                    slide.job.details?.completedSessionCount
                                  )
                                }}</strong></div
                              >
                              <div
                                ><span>종가</span
                                ><strong>{{
                                  formatClosePrice(
                                    slide.job.details?.closePrice
                                  )
                                }}</strong></div
                              >
                              <div
                                ><span>일간 변화</span
                                ><strong
                                  :class="
                                    profitClass(
                                      slide.job.details?.dailyChangePct
                                    )
                                  "
                                  >{{
                                    formatPct(slide.job.details?.dailyChangePct)
                                  }}</strong
                                ></div
                              >
                              <div
                                ><span>거래량</span
                                ><strong>{{
                                  formatInteger(slide.job.details?.volume)
                                }}</strong></div
                              >
                              <div
                                ><span>MA 3</span
                                ><strong>{{
                                  formatPrice(slide.job.details?.ma3)
                                }}</strong></div
                              >
                              <div
                                ><span>MA 5</span
                                ><strong>{{
                                  formatPrice(slide.job.details?.ma5)
                                }}</strong></div
                              >
                              <div
                                ><span>MA Spread</span
                                ><strong
                                  :class="maTrendClass(slide.job.details)"
                                  >{{
                                    formatMaTrend(slide.job.details)
                                  }}</strong
                                ></div
                              >
                              <div
                                ><span>Daily RSI</span
                                ><strong>{{
                                  formatNumber(slide.job.details?.dailyRsi)
                                }}</strong></div
                              >
                              <div
                                ><span>Weekly RSI</span
                                ><strong>{{
                                  formatNumber(slide.job.details?.weeklyRsi)
                                }}</strong></div
                              >
                              <div
                                ><span>Week Closed</span
                                ><strong>{{
                                  formatBoolean(slide.job.details?.weekClosed)
                                }}</strong></div
                              >
                            </div>
                          </template>

                          <template v-else-if="slide.jobType === 'APPLY'">
                            <div class="operation-data-grid">
                              <div
                                ><span>적용 거래일</span
                                ><strong>{{
                                  slide.job.details?.appliedSessionDate || '-'
                                }}</strong></div
                              >
                              <div
                                ><span>체결</span
                                ><strong
                                  >{{
                                    (slide.job.details?.executions || [])
                                      .length
                                  }}건</strong
                                ></div
                              >
                              <div
                                ><span>종가</span
                                ><strong>{{
                                  formatClosePrice(
                                    slide.job.details?.closePrice
                                  )
                                }}</strong></div
                              >
                              <div
                                ><span>총자산</span
                                ><strong>{{
                                  formatMoney(slide.job.details?.totalAsset)
                                }}</strong></div
                              >
                              <div
                                ><span>현금</span
                                ><strong class="operation-cash-value"
                                  >{{
                                    formatMoney(
                                      slide.job.details?.availableCash
                                    )
                                  }}
                                  <small
                                    v-if="
                                      formatCashRatio(slide.job.details) !== '-'
                                    "
                                    >({{
                                      formatCashRatio(slide.job.details)
                                    }})</small
                                  ></strong
                                ></div
                              >
                              <div
                                ><span>보유 수량</span
                                ><strong>{{
                                  formatInteger(
                                    slide.job.details?.managedQuantity
                                  )
                                }}</strong></div
                              >
                            </div>
                            <div class="operation-detail-block">
                              <h4>체결 내역</h4>
                              <div
                                v-if="slide.job.details?.executions?.length"
                                class="operation-table-scroll"
                              >
                                <q-markup-table
                                  flat
                                  dense
                                  separator="horizontal"
                                  class="operation-desktop-table"
                                >
                                  <thead
                                    ><tr
                                      ><th class="text-left">구분</th
                                      ><th class="text-left">티어</th
                                      ><th class="text-left">주문 유형</th
                                      ><th class="text-right">주문가</th
                                      ><th class="text-right">체결가</th
                                      ><th class="text-right">수량</th
                                      ><th class="text-right">Broker ID</th></tr
                                    ></thead
                                  >
                                  <tbody>
                                    <tr
                                      v-for="execution in slide.job.details
                                        .executions"
                                      :key="execution.executionId"
                                    >
                                      <td class="text-left"
                                        ><span
                                          class="operation-side"
                                          :class="
                                            sideClass(execution.tradeSide)
                                          "
                                          >{{
                                            sideLabel(execution.tradeSide)
                                          }}</span
                                        ></td
                                      ><td class="text-left">{{
                                        execution.tier || '-'
                                      }}</td
                                      ><td class="text-left">{{
                                        execution.orderType || '-'
                                      }}</td
                                      ><td class="text-right">{{
                                        formatPrice(execution.orderPrice)
                                      }}</td
                                      ><td class="text-right">{{
                                        formatPrice(execution.fillPrice)
                                      }}</td
                                      ><td class="text-right">{{
                                        formatInteger(execution.quantity)
                                      }}</td
                                      ><td class="text-right">{{
                                        execution.brokerOrderId || '-'
                                      }}</td>
                                    </tr>
                                  </tbody>
                                </q-markup-table>
                                <div
                                  class="operation-mobile-rows operation-mobile-rows--three-columns"
                                >
                                  <article
                                    v-for="execution in slide.job.details
                                      .executions"
                                    :key="`mobile-${execution.executionId}`"
                                  >
                                    <div class="operation-mobile-row__head">
                                      <strong
                                        ><span
                                          class="operation-side"
                                          :class="
                                            sideClass(execution.tradeSide)
                                          "
                                          >{{
                                            sideLabel(execution.tradeSide)
                                          }}</span
                                        ></strong
                                      >
                                    </div>
                                    <dl>
                                      <div
                                        ><dt>Tier</dt
                                        ><dd>{{
                                          execution.tier || '-'
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>수량</dt
                                        ><dd
                                          >{{
                                            formatInteger(execution.quantity)
                                          }}주</dd
                                        ></div
                                      >
                                      <div
                                        ><dt>주문 유형</dt
                                        ><dd>{{
                                          shortTypeLabel(execution.orderType)
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>주문가</dt
                                        ><dd>{{
                                          formatPrice(execution.orderPrice)
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>체결가</dt
                                        ><dd>{{
                                          formatPrice(execution.fillPrice)
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>Broker ID</dt
                                        ><dd>{{
                                          execution.brokerOrderId || '-'
                                        }}</dd></div
                                      >
                                    </dl>
                                  </article>
                                </div>
                              </div>
                              <p v-else class="detail-empty">체결 없음</p>
                            </div>
                          </template>

                          <template v-else-if="slide.jobType === 'PLAN'">
                            <div class="operation-data-grid">
                              <div
                                ><span>계획 기준일</span
                                ><strong>{{
                                  slide.job.details?.basisDate || '-'
                                }}</strong></div
                              >
                              <div
                                ><span>주문 대상일</span
                                ><strong>{{ slide.targetDate }}</strong></div
                              >
                              <div
                                ><span>모드</span
                                ><strong>{{
                                  slide.job.details?.mode || '-'
                                }}</strong></div
                              >
                              <div
                                ><span>주문 계획</span
                                ><strong
                                  >{{
                                    formatInteger(
                                      (slide.job.details?.orders || []).length
                                    )
                                  }}건</strong
                                ></div
                              >
                              <div
                                ><span>대상</span
                                ><strong
                                  >{{
                                    formatInteger(
                                      regularPlanCount(
                                        slide.job.details?.orders
                                      )
                                    )
                                  }}건</strong
                                ></div
                              >
                              <div
                                ><span>매수가</span
                                ><strong>{{
                                  formatPrice(slide.job.details?.buyPrice, 2)
                                }}</strong></div
                              >
                            </div>
                            <div class="operation-detail-block">
                              <h4>주문 계획</h4>
                              <div
                                v-if="slide.job.details?.orders?.length"
                                class="operation-table-scroll"
                              >
                                <q-markup-table
                                  flat
                                  dense
                                  separator="horizontal"
                                  class="operation-desktop-table"
                                >
                                  <thead
                                    ><tr
                                      ><th class="text-left">구분</th
                                      ><th class="text-left">티어</th
                                      ><th class="text-left">주문 유형</th
                                      ><th class="text-left">상태</th
                                      ><th class="text-right">주문가</th
                                      ><th class="text-right">매수가</th
                                      ><th class="text-right">수량</th
                                      ><th class="text-right">배정 금액</th
                                      ><th class="text-right">보유 기간</th></tr
                                    ></thead
                                  >
                                  <tbody>
                                    <tr
                                      v-for="order in slide.job.details.orders"
                                      :key="order.orderId"
                                    >
                                      <td class="text-left"
                                        ><span
                                          class="operation-side"
                                          :class="sideClass(order.tradeSide)"
                                          >{{
                                            sideLabel(order.tradeSide)
                                          }}</span
                                        ></td
                                      ><td class="text-left">{{
                                        order.tier || '-'
                                      }}</td
                                      ><td class="text-left">{{
                                        order.orderType || '-'
                                      }}</td
                                      ><td class="text-left">{{
                                        order.planType || '-'
                                      }}</td
                                      ><td class="text-right">{{
                                        formatPrice(order.orderPrice, 2)
                                      }}</td
                                      ><td class="text-right">{{
                                        order.tradeSide === 'BUY'
                                          ? '-'
                                          : formatPrice(order.buyPrice, 2)
                                      }}</td
                                      ><td class="text-right">{{
                                        formatInteger(order.quantity)
                                      }}</td
                                      ><td class="text-right">{{
                                        formatMoney(order.allocationAmount)
                                      }}</td
                                      ><td class="text-right"
                                        >{{
                                          formatInteger(order.heldSessionCount)
                                        }}
                                        /
                                        {{
                                          formatInteger(order.maxHoldDays)
                                        }}</td
                                      >
                                    </tr>
                                  </tbody>
                                </q-markup-table>
                                <div
                                  class="operation-mobile-rows operation-mobile-rows--three-columns"
                                >
                                  <article
                                    v-for="order in slide.job.details.orders"
                                    :key="`mobile-${order.orderId}`"
                                  >
                                    <div class="operation-mobile-row__head">
                                      <strong
                                        ><span
                                          class="operation-side"
                                          :class="sideClass(order.tradeSide)"
                                          >{{
                                            sideLabel(order.tradeSide)
                                          }}</span
                                        ></strong
                                      >
                                    </div>
                                    <dl>
                                      <div
                                        ><dt>Tier</dt
                                        ><dd>{{ order.tier || '-' }}</dd></div
                                      >
                                      <div
                                        ><dt>수량</dt
                                        ><dd
                                          >{{
                                            formatInteger(order.quantity)
                                          }}주</dd
                                        ></div
                                      >
                                      <div
                                        ><dt>주문 유형</dt
                                        ><dd
                                          >{{ shortTypeLabel(order.orderType) }}
                                          ·
                                          {{
                                            shortTypeLabel(order.planType)
                                          }}</dd
                                        ></div
                                      >
                                      <div
                                        ><dt>주문가</dt
                                        ><dd>{{
                                          formatPrice(order.orderPrice, 2)
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>매수가</dt
                                        ><dd>{{
                                          order.tradeSide === 'BUY'
                                            ? '-'
                                            : formatPrice(order.buyPrice, 2)
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>보유 기간</dt
                                        ><dd
                                          >{{
                                            formatInteger(
                                              order.heldSessionCount
                                            )
                                          }}
                                          /
                                          {{
                                            formatInteger(order.maxHoldDays)
                                          }}</dd
                                        ></div
                                      >
                                    </dl>
                                  </article>
                                </div>
                              </div>
                              <p v-else class="detail-empty"
                                >생성된 주문 없음</p
                              >
                            </div>
                          </template>

                          <template v-else>
                            <div class="operation-data-grid">
                              <div
                                ><span>주문 대상일</span
                                ><strong>{{
                                  slide.targetDate || '-'
                                }}</strong></div
                              >
                              <div
                                ><span>주문</span
                                ><strong
                                  >{{
                                    formatInteger(
                                      totalSubmissionCount(slide.job.details)
                                    )
                                  }}건</strong
                                ></div
                              >
                              <div
                                ><span>Broker</span
                                ><strong>{{
                                  summarizeSubmissionValues(
                                    slide.job.details?.submissions,
                                    'submissionMode'
                                  )
                                }}</strong></div
                              >
                            </div>
                            <div class="operation-detail-block">
                              <h4>제출 내역</h4>
                              <div
                                v-if="slide.job.details?.submissions?.length"
                                class="operation-table-scroll"
                              >
                                <q-markup-table
                                  flat
                                  dense
                                  separator="horizontal"
                                  class="operation-desktop-table"
                                >
                                  <thead
                                    ><tr
                                      ><th class="text-left">구분</th
                                      ><th class="text-left">티어</th
                                      ><th class="text-left">주문 유형</th
                                      ><th class="text-left">제출 방식</th
                                      ><th class="text-left">상태</th
                                      ><th class="text-right">주문가</th
                                      ><th class="text-right">수량</th
                                      ><th class="text-right">Broker ID</th></tr
                                    ></thead
                                  >
                                  <tbody>
                                    <tr
                                      v-for="submission in slide.job.details
                                        .submissions"
                                      :key="submission.submissionId"
                                    >
                                      <td class="text-left"
                                        ><span
                                          class="operation-side"
                                          :class="
                                            sideClass(submission.tradeSide)
                                          "
                                          >{{
                                            sideLabel(submission.tradeSide)
                                          }}</span
                                        ></td
                                      ><td class="text-left">{{
                                        submission.tier || '-'
                                      }}</td
                                      ><td class="text-left">{{
                                        submission.orderType || '-'
                                      }}</td
                                      ><td class="text-left">{{
                                        submission.submissionMode || '-'
                                      }}</td
                                      ><td class="text-left">{{
                                        submission.status || '-'
                                      }}</td
                                      ><td class="text-right">{{
                                        formatPrice(submission.orderPrice, 2)
                                      }}</td
                                      ><td class="text-right">{{
                                        formatInteger(submission.quantity)
                                      }}</td
                                      ><td class="text-right"
                                        >{{ submission.brokerOrderId || '-'
                                        }}<small
                                          v-if="submission.brokerErrorMessage"
                                          class="text-negative"
                                          >{{
                                            submission.brokerErrorMessage
                                          }}</small
                                        ></td
                                      >
                                    </tr>
                                  </tbody>
                                </q-markup-table>
                                <div
                                  class="operation-mobile-rows operation-mobile-rows--three-columns"
                                >
                                  <article
                                    v-for="submission in slide.job.details
                                      .submissions"
                                    :key="`mobile-${submission.submissionId}`"
                                  >
                                    <div class="operation-mobile-row__head">
                                      <strong
                                        ><span
                                          class="operation-side"
                                          :class="
                                            sideClass(submission.tradeSide)
                                          "
                                          >{{
                                            sideLabel(submission.tradeSide)
                                          }}</span
                                        ></strong
                                      >
                                    </div>
                                    <dl>
                                      <div
                                        ><dt>Tier</dt
                                        ><dd>{{
                                          submission.tier || '-'
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>수량</dt
                                        ><dd
                                          >{{
                                            formatInteger(submission.quantity)
                                          }}주</dd
                                        ></div
                                      >
                                      <div
                                        ><dt>주문 유형</dt
                                        ><dd>{{
                                          shortTypeLabel(submission.orderType)
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>주문가</dt
                                        ><dd>{{
                                          formatPrice(submission.orderPrice, 2)
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>상태</dt
                                        ><dd>{{
                                          submission.status || '-'
                                        }}</dd></div
                                      >
                                      <div
                                        ><dt>Broker ID</dt
                                        ><dd>{{
                                          submission.brokerOrderId || '-'
                                        }}</dd></div
                                      >
                                    </dl>
                                    <p
                                      v-if="submission.brokerErrorMessage"
                                      class="operation-mobile-row__error"
                                    >
                                      {{ submission.brokerErrorMessage }}
                                    </p>
                                  </article>
                                </div>
                              </div>
                              <p v-else class="detail-empty">제출 내역 없음</p>
                            </div>
                          </template>
                        </template>
                      </q-card-section>
                    </div>
                  </q-slide-transition>
                </q-card>
                <Transition name="timeline-date">
                  <div
                    v-if="slide.isDateBoundary"
                    class="operation-date-divider"
                    role="separator"
                    :aria-label="`${slide.timelineDate} 날짜 구분`"
                  >
                    <div class="operation-date-divider__rail">
                      <span></span>
                      <time :datetime="slide.timelineDate">{{
                        formatOperationDate(slide.timelineDate)
                      }}</time>
                    </div>
                  </div>
                </Transition>
              </article>
            </TransitionGroup>
            <div v-else class="operation-empty-state">
              <strong>표시할 작업 기록이 없습니다.</strong>
              <p>Agent가 실행되면 날짜별 흐름이 이곳에 이어집니다.</p>
            </div>
          </section>
        </section>
      </div>
    </main>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { api } from '@/boot/axios'

import {
  getLatestOperationStartedAt,
  getOperationCountdownState,
  getOperationEstimatedDateTime,
  getOperationTargetDates,
  parseOperationDateTime
} from '@/utils/operation-schedule'

import { useQuasar } from 'quasar'

const STRATEGY_ID = 1

const OPERATION_STATUS_URL = '/api/dualsniper/operations/status'

const OPERATION_PHASES = [
  { jobType: 'PREPARE', label: 'Prepare', index: '01' },
  { jobType: 'APPLY', label: 'Apply', index: '02' },
  { jobType: 'PLAN', label: 'Plan', index: '03' },
  { jobType: 'SUBMIT', label: 'Submit', index: '04' }
]

const OPERATION_WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const OPERATION_TIME_ZONES = {
  KST: 'Asia/Seoul',
  ET: 'America/New_York'
}

const $q = useQuasar()

const operationResult = ref(null)

const isOperationLoading = ref(false)

const isOperationRefreshing = ref(false)

const operationLoadError = ref('')

const operationUpdatedAt = ref(null)

const expandedOperationIds = ref([])

const operationTimeZone = ref('KST')

const clockNow = ref(new Date())

let worldClockIntervalId = null

let operationAutoRefreshTimeoutId = null

const autoRefreshedOperationIds = new Set()

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function operationStatusKind(slide) {
  if (slide.isMissing) return 'waiting'
  const status = String(slide.job?.status || '').toUpperCase()
  if (status === 'SUCCESS') return 'success'
  if (['FAILED', 'FAILURE', 'ERROR', 'CANCELLED'].includes(status)) {
    return 'failed'
  }
  if (['RUNNING', 'PROCESSING', 'IN_PROGRESS', 'PENDING'].includes(status)) {
    return 'running'
  }
  return 'neutral'
}

function operationStatusLabel(slide) {
  if (slide.isMissing) {
    return slide.estimatedTime
      ? `${formatOperationTime(operationSlideDateTime(slide))} 예정`
      : '아직 기록 없음'
  }
  return slide.job?.status || 'UNKNOWN'
}

function operationNodeLabel(slide) {
  const kind = operationStatusKind(slide)
  if (kind === 'success') return '✓'
  if (kind === 'failed') return '!'
  if (kind === 'running') return '•'
  return ''
}

function compareOperationSlidesByIdDesc(left, right) {
  const leftId = finiteNumber(left.job?.id)
  const rightId = finiteNumber(right.job?.id)

  if (leftId !== null && rightId !== null) return rightId - leftId
  if (leftId === null && rightId === null) {
    return right.phaseIndex - left.phaseIndex
  }

  const missingSlide = leftId === null ? left : right
  const recordedSlide = leftId === null ? right : left
  const missingComesFirst = missingSlide.phaseIndex > recordedSlide.phaseIndex

  if (leftId === null) return missingComesFirst ? -1 : 1
  return missingComesFirst ? 1 : -1
}

function getPreviousOperationTime(jobs, targetDate, jobType) {
  if (!targetDate) return null

  return (
    jobs
      .filter(job => job.targetDate === targetDate && job.jobType === jobType)
      .sort(
        (left, right) =>
          (finiteNumber(right.id) ?? -Infinity) -
          (finiteNumber(left.id) ?? -Infinity)
      )
      .map(job => job.startedAt)
      .find(Boolean) || null
  )
}

function normalizeOperationResult(result = {}) {
  const jobs = Array.isArray(result.jobs) ? result.jobs : []
  const activeTiers = Array.isArray(result.activeTiers)
    ? result.activeTiers
    : []
  const dates = getOperationTargetDates(
    jobs,
    OPERATION_PHASES.map(phase => phase.jobType)
  )

  const slides = dates.flatMap((targetDate, dateIndex) => {
    const dateJobs = jobs.filter(job => job.targetDate === targetDate)
    const previousTargetDate = dates[dateIndex + 1] || null
    const estimatedReferenceTime = getLatestOperationStartedAt(
      jobs,
      previousTargetDate
    )

    const dateSlides = OPERATION_PHASES.map((phase, phaseIndex) => {
      const attempts = dateJobs
        .filter(job => job.jobType === phase.jobType)
        .sort(
          (left, right) =>
            (finiteNumber(right.id) ?? -Infinity) -
            (finiteNumber(left.id) ?? -Infinity)
        )
      const job = attempts[0] || null

      return {
        ...phase,
        id: `${targetDate}-${phase.jobType}`,
        targetDate,
        previousTargetDate,
        phaseIndex,
        isMissing: !job,
        estimatedTime: !job
          ? getPreviousOperationTime(jobs, previousTargetDate, phase.jobType)
          : null,
        estimatedReferenceTime: !job ? estimatedReferenceTime : null,
        attemptCount: attempts.length,
        job
      }
    })

    return dateSlides.sort(compareOperationSlidesByIdDesc)
  })

  return { ...result, activeTiers, jobs, slides }
}

function getInitialExpandedOperationIds() {
  return []
}

function operationSlideDateTime(slide) {
  if (slide?.job?.startedAt) {
    return parseOperationDateTime(slide.job.startedAt)
  }

  return getOperationEstimatedDateTime({
    previousTargetDate: slide?.previousTargetDate,
    nextSessionDate: slide?.targetDate,
    previousStartedAt: slide?.estimatedTime,
    referenceStartedAt: slide?.estimatedReferenceTime
  })
}

function operationTimelineDate(slide) {
  const date = operationSlideDateTime(slide)
  if (!date || Number.isNaN(date.getTime())) return slide?.targetDate || '-'

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: OPERATION_TIME_ZONES[operationTimeZone.value],
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )

  return `${parts.year}-${parts.month}-${parts.day}`
}

function formatOperationTime(value) {
  if (!value) return '--:--'

  const date = parseOperationDateTime(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: OPERATION_TIME_ZONES[operationTimeZone.value],
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(date)
}

function formatOperationUpdatedAt(value) {
  return formatZonedDateTime(
    value,
    OPERATION_TIME_ZONES[operationTimeZone.value],
    operationTimeZone.value === 'ET' ? 'AUTO' : 'KST'
  )
}

function formatOperationDate(value) {
  if (!value) return '-'

  const [year, month, day] = String(value).split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const isValidDate =
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  if (!isValidDate) return '-'

  const formattedDate = [year, month, day]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('.')
  const weekday = OPERATION_WEEKDAYS[date.getUTCDay()]

  return `${formattedDate} ${weekday}`
}

function formatOperationDuration(job) {
  if (!job?.startedAt || !job?.completedAt) return '-'
  const duration = new Date(job.completedAt) - new Date(job.startedAt)
  if (!Number.isFinite(duration) || duration < 0) return '-'
  if (duration < 1000) return `${Math.round(duration)}ms`
  return `${formatNumber(duration / 1000, 2)}s`
}

function formatBoolean(value) {
  if (value === true) return 'YES'
  if (value === false) return 'NO'
  return '-'
}

function operationCountdownLabel(slide) {
  if (!slide.isMissing || !slide.isNextPending) return ''

  const countdown = getOperationCountdownState(
    operationSlideDateTime(slide),
    clockNow.value
  )
  return countdown.phase === 'countdown' ? countdown.label : ''
}

function operationSummary(slide) {
  if (slide.isMissing) {
    if (!slide.isNextPending) return '실행 준비 중'

    const countdown = getOperationCountdownState(
      operationSlideDateTime(slide),
      clockNow.value
    )
    return countdown.phase === 'checking' ? '실행 확인 중' : '실행 준비 중'
  }
  const details = slide.job?.details || {}
  if (slide.jobType === 'PREPARE') {
    return `세션 ${formatInteger(details.completedSessionCount)} · 종가 ${formatClosePrice(details.closePrice)}`
  }
  if (slide.jobType === 'APPLY') {
    return `체결 ${(details.executions || []).length}건 · ${formatMoney(details.totalAsset)}`
  }
  if (slide.jobType === 'PLAN') {
    const orders = details.orders || []
    const targetCount = regularPlanCount(orders)
    return `계획 ${orders.length}건 · 대상 ${targetCount}건`
  }
  return `제출 ${totalSubmissionCount(details)}건`
}

function regularPlanCount(orders = []) {
  return orders.filter(
    order => String(order.planType || '').toUpperCase() === 'REGULAR'
  ).length
}

function totalSubmissionCount(details = {}) {
  return details.submissionCount ?? (details.submissions || []).length
}

function summarizeSubmissionValues(submissions = [], primaryKey, fallbackKey) {
  const values = [
    ...new Set(
      submissions
        .map(
          submission =>
            submission?.[primaryKey] ||
            (fallbackKey ? submission?.[fallbackKey] : null)
        )
        .filter(Boolean)
    )
  ]
  return values.length ? values.join(' · ') : '-'
}

function nextPendingOperationId(slides) {
  return (
    slides
      .filter(slide => slide.isMissing)
      .sort((left, right) => {
        const dateOrder = right.targetDate.localeCompare(left.targetDate)
        return dateOrder || left.phaseIndex - right.phaseIndex
      })[0]?.id || null
  )
}

const activeTiers = computed(() => operationResult.value?.activeTiers || [])

const activeTiersClosePrice = computed(() => {
  const asOfDate = operationResult.value?.activeTiersAsOfDate
  const candidates = (operationResult.value?.jobs || [])
    .map(job => {
      const details = job.details || {}
      const sessionDate =
        details.appliedSessionDate || details.calculatedThroughDate
      const closePrice = finiteNumber(details.closePrice)

      return {
        sessionDate,
        closePrice,
        jobId: finiteNumber(job.id) ?? -Infinity
      }
    })
    .filter(
      candidate =>
        candidate.sessionDate &&
        candidate.closePrice !== null &&
        (!asOfDate || candidate.sessionDate <= asOfDate)
    )
    .sort(
      (left, right) =>
        right.sessionDate.localeCompare(left.sessionDate) ||
        right.jobId - left.jobId
    )

  return candidates[0]?.closePrice ?? null
})

function activeTierReturnPct(tier) {
  const buyPrice = finiteNumber(tier?.buyPrice)
  const closePrice = activeTiersClosePrice.value
  if (buyPrice === null || buyPrice === 0 || closePrice === null) return null

  return ((closePrice - buyPrice) / buyPrice) * 100
}

function activeTierProfitLoss(tier) {
  const buyPrice = finiteNumber(tier?.buyPrice)
  const quantity = finiteNumber(tier?.quantity)
  const closePrice = activeTiersClosePrice.value
  if (buyPrice === null || quantity === null || closePrice === null) return null

  return (closePrice - buyPrice) * quantity
}

const activeTiersSummary = computed(() => {
  const totals = activeTiers.value.reduce(
    (result, tier) => {
      const quantity = finiteNumber(tier.quantity)
      const buyPrice = finiteNumber(tier.buyPrice)
      const profitLoss = activeTierProfitLoss(tier)

      if (quantity !== null) result.quantity += quantity
      if (quantity !== null && buyPrice !== null) {
        result.costBasis += quantity * buyPrice
        result.pricedQuantity += quantity
      }
      if (profitLoss !== null) {
        result.profitLoss += profitLoss
        result.hasProfitLoss = true
      }

      return result
    },
    {
      quantity: 0,
      pricedQuantity: 0,
      costBasis: 0,
      profitLoss: 0,
      hasProfitLoss: false
    }
  )

  return {
    quantity: totals.quantity,
    averageBuyPrice:
      totals.pricedQuantity > 0
        ? totals.costBasis / totals.pricedQuantity
        : null,
    profitLoss: totals.hasProfitLoss ? totals.profitLoss : null,
    returnPct:
      totals.costBasis > 0 && totals.hasProfitLoss
        ? (totals.profitLoss / totals.costBasis) * 100
        : null
  }
})

const operationSlides = computed(() => {
  const slides = operationResult.value?.slides || []
  const nextPendingId = nextPendingOperationId(slides)

  return slides.map((slide, index) => {
    const timelineDate = operationTimelineDate(slide)
    const nextTimelineDate = operationTimelineDate(slides[index + 1])

    return {
      ...slide,
      timelineDate,
      isDateBoundary: timelineDate !== nextTimelineDate,
      isNextPending: slide.id === nextPendingId
    }
  })
})

const nextOperationHeadline = computed(() => {
  const slide = operationSlides.value.find(item => item.isNextPending)
  if (!slide) {
    return {
      message: '오늘의 실행을 완료했습니다.',
      countdown: ''
    }
  }

  const countdown = getOperationCountdownState(
    operationSlideDateTime(slide),
    clockNow.value
  )
  if (countdown.phase === 'countdown') {
    return {
      message: `${slide.jobType} 실행까지`,
      countdown: countdown.label
    }
  }
  if (countdown.phase === 'checking') {
    return {
      message: `${slide.jobType} 실행을 확인하고 있습니다.`,
      countdown: ''
    }
  }

  return {
    message: '다음 실행 일정을 확인하고 있습니다.',
    countdown: ''
  }
})

function scheduleOperationAutoRefresh(slides) {
  if (operationAutoRefreshTimeoutId !== null) {
    window.clearTimeout(operationAutoRefreshTimeoutId)
    operationAutoRefreshTimeoutId = null
  }

  const slide = slides.find(item => item.isNextPending)
  if (!slide || autoRefreshedOperationIds.has(slide.id)) return

  const targetTime = operationSlideDateTime(slide)?.getTime()
  if (!Number.isFinite(targetTime)) return

  const refreshDelay = Math.max(0, targetTime + 3_000 - Date.now())
  operationAutoRefreshTimeoutId = window.setTimeout(() => {
    operationAutoRefreshTimeoutId = null
    if (autoRefreshedOperationIds.has(slide.id)) return

    autoRefreshedOperationIds.add(slide.id)
    if (!isOperationLoading.value && !isOperationRefreshing.value) {
      fetchOperationResult()
    }
  }, refreshDelay)
}

function isOperationExpanded(id) {
  return expandedOperationIds.value.includes(id)
}

function toggleOperation(id) {
  expandedOperationIds.value = isOperationExpanded(id)
    ? expandedOperationIds.value.filter(item => item !== id)
    : [...expandedOperationIds.value, id]
}

async function fetchOperationResult() {
  const hasExistingResult = Boolean(operationResult.value)
  isOperationLoading.value = !hasExistingResult
  isOperationRefreshing.value = hasExistingResult
  operationLoadError.value = ''

  try {
    const { data } = await api.get(OPERATION_STATUS_URL, {
      params: { strategyId: STRATEGY_ID }
    })
    const normalizedResult = normalizeOperationResult(data)
    operationResult.value = normalizedResult
    expandedOperationIds.value = getInitialExpandedOperationIds(
      normalizedResult.slides
    )
    operationUpdatedAt.value = new Date()
  } catch (error) {
    const responseMessage =
      error.response?.data?.message || error.response?.data?.error
    operationLoadError.value =
      responseMessage || error.message || '알 수 없는 오류가 발생했습니다.'
    if (hasExistingResult) {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: '운영 상태 갱신에 실패했습니다. 기존 데이터를 유지합니다.'
      })
    }
  } finally {
    isOperationLoading.value = false
    isOperationRefreshing.value = false
  }
}

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
    maximumFractionDigits: 2,
    roundingMode: 'trunc'
  }).format(number)}`
}

function shortTypeLabel(value) {
  const label = String(value || '').trim()
  if (!label) return '-'
  return /^[A-Za-z]/.test(label) ? label.charAt(0).toUpperCase() : label
}

function formatClosePrice(value) {
  const number = finiteNumber(value)
  if (number === null) return '-'
  return `$${new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)}`
}

function formatPct(value, showSign = true) {
  const number = finiteNumber(value)
  if (number === null) return '-'
  return `${showSign && number > 0 ? '+' : ''}${formatNumber(number, 2)}%`
}

function formatCashRatio(details = {}) {
  const availableCash = finiteNumber(details?.availableCash)
  const totalAsset = finiteNumber(details?.totalAsset)
  if (availableCash === null || totalAsset === null || totalAsset === 0) {
    return '-'
  }
  return formatPct((availableCash / totalAsset) * 100, false)
}

function maTrendPercent(details = {}) {
  const ma3 = finiteNumber(details?.ma3)
  const ma5 = finiteNumber(details?.ma5)
  if (ma3 === null || ma5 === null || ma5 === 0) return null
  return ((ma3 - ma5) / Math.abs(ma5)) * 100
}

function formatMaTrend(details) {
  const percent = maTrendPercent(details)
  if (percent === null) return '-'
  return formatPct(percent)
}

function maTrendClass(details) {
  return profitClass(maTrendPercent(details))
}

function formatZonedDateTime(value, timeZone, zoneLabel = '') {
  const parts = zonedDateTimeParts(value, timeZone, zoneLabel)
  if (!parts) return '-'

  return `${parts.dateWeekday} · ${parts.clock}`
}

function zonedDateTimeParts(value, timeZone, zoneLabel = '') {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

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
  const dateWeekday = `${parts.year}.${parts.month}.${parts.day} ${parts.weekday.toUpperCase()}`
  const suffix = zoneLabel === 'AUTO' ? parts.timeZoneName : zoneLabel
  const clock = `${parts.hour}:${parts.minute}${suffix ? ` ${suffix}` : ''}`

  return { dateWeekday, clock }
}

function profitClass(value) {
  const number = finiteNumber(value)
  if (number === null || number === 0) return ''
  return number > 0 ? 'value-positive' : 'value-negative'
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

onMounted(() => {
  fetchOperationResult()
  worldClockIntervalId = window.setInterval(() => {
    clockNow.value = new Date()
  }, 1_000)
})

onBeforeUnmount(() => {
  if (worldClockIntervalId !== null) {
    window.clearInterval(worldClockIntervalId)
  }
  if (operationAutoRefreshTimeoutId !== null) {
    window.clearTimeout(operationAutoRefreshTimeoutId)
  }
})

watch(operationSlides, scheduleOperationAutoRefresh, { immediate: true })
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
    font-variant-numeric: tabular-nums;
  }

  > span {
    color: var(--dk-muted);
    font-size: var(--dk-text-label);
    letter-spacing: 0.1em;
  }
}

.operation-heading-countdown {
  color: var(--dk-ink);
  font-weight: 500;
}

.section-heading--split {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: flex-end;
}

.agent-operation > .section-heading {
  margin-bottom: 10px;
}

.operation-status-card {
  display: flex;
  min-width: 0;
  margin-bottom: 32px;
  padding: 11px 16px;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  border: 1px solid var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
}

.operation-active-tiers {
  min-width: 0;
  overflow: hidden;
  margin-bottom: 10px;
  border: 1px solid var(--dk-line);
  border-radius: 2px;
  background: var(--dk-surface);
}

.operation-active-tiers__heading {
  display: flex;
  min-width: 0;
  padding: 10px 14px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--dk-line);

  .section-index {
    flex: 0 0 auto;
  }

  > span {
    min-width: 0;
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.06em;
    text-align: right;
    white-space: nowrap;
  }
}

.operation-active-tiers__table {
  border-radius: 0;
  box-shadow: none;

  :deep(table) {
    width: 100%;
    table-layout: fixed;
  }

  :deep(th),
  :deep(td) {
    height: 38px;
    padding: 6px 8px;
    font-size: var(--dk-text-body-sm);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  :deep(th) {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    font-weight: 500;
  }

  :deep(th:nth-child(1)),
  :deep(td:nth-child(1)) {
    width: 10%;
  }

  :deep(th:nth-child(2)),
  :deep(td:nth-child(2)) {
    width: 10%;
  }

  :deep(th:nth-child(3)),
  :deep(td:nth-child(3)) {
    width: 22%;
  }

  :deep(th:nth-child(4)),
  :deep(td:nth-child(4)) {
    width: 14%;
  }

  :deep(th:nth-child(5)),
  :deep(td:nth-child(5)) {
    width: 15%;
  }

  :deep(th:nth-child(6)),
  :deep(td:nth-child(6)) {
    width: 13%;
  }

  :deep(th:nth-child(7)),
  :deep(td:nth-child(7)) {
    width: 16%;
  }
}

.operation-active-tiers__summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 0;
  border-bottom: 1px solid var(--dk-line);
  background: var(--dk-surface);

  > div {
    min-width: 0;
    padding: 10px 8px;
    text-align: center;
  }

  dt {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    white-space: nowrap;
  }

  dd {
    margin: 3px 0 0;
    font-size: var(--dk-text-body-sm);
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
}

.operation-active-tier-name {
  color: var(--dk-ink);
  font-weight: 700;
  text-align: center;
}

.operation-active-tiers__empty {
  margin: 0;
  padding: 14px;
  color: var(--dk-muted);
  font-size: var(--dk-text-body-sm);
  text-align: center;
}

.system-state {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
  font-size: var(--dk-text-label);
  letter-spacing: 0.13em;
  white-space: nowrap;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--agent-accent);
    box-shadow: 0 0 0 4px var(--agent-accent-soft);
  }
}

.operation-status-card__head {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.operation-status-card__times {
  display: flex;
  align-self: flex-start;
  min-width: 0;
  min-height: 22px;
  align-items: center;
  color: var(--dk-muted);
  font-size: var(--dk-text-caption);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;

  time {
    white-space: nowrap;
  }
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
  font-size: calc(var(--dk-text-caption) - 1px);
  font-weight: 600;
  letter-spacing: 0.08em;

  button {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    letter-spacing: inherit;
    opacity: 0.42;
    white-space: nowrap;
    transition:
      color 140ms ease,
      opacity 140ms ease;

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
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--dk-line);

  h3 {
    margin: 2px 0 0;
    font-family: var(--dk-font-serif);
    font-size: var(--dk-text-value);
    font-weight: 400;
  }

  > span {
    color: var(--dk-muted);
    font-size: var(--dk-text-caption);
    letter-spacing: 0.08em;
  }
}

.current-tiers__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));

  > article {
    min-width: 0;
    padding: 10px 12px;
    border-right: 1px solid var(--dk-line);
    border-bottom: 1px solid var(--dk-line);

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;

      strong {
        font-size: var(--dk-text-body-sm);
      }

      span {
        padding: 2px 6px;
        border: 1px solid var(--dk-line-strong);
        color: var(--dk-muted);
        font-size: var(--dk-text-caption);
      }
    }

    dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px 12px;
      margin: 0;
    }

    dt {
      color: var(--dk-muted);
      font-size: var(--dk-text-caption);
    }

    dd {
      margin: 2px 0 0;
      font-size: var(--dk-text-body-sm);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
  }
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

  .operation-status-card {
    padding: 11px 12px;
  }

  .operation-status-card__times {
    width: 100%;
  }

  .operation-active-tiers__heading {
    padding: 9px 10px;
  }

  .operation-active-tiers__table {
    :deep(th),
    :deep(td) {
      height: 34px;
      padding: 5px 3px;
      font-size: clamp(0.61rem, 2.5vw, var(--dk-text-caption));
    }

    :deep(th) {
      font-size: clamp(0.57rem, 2.3vw, var(--dk-text-caption));
    }
  }

  .operation-active-tiers__summary {
    > div {
      padding: 9px 3px;
    }

    dt {
      font-size: clamp(0.57rem, 2.3vw, var(--dk-text-caption));
    }

    dd {
      font-size: clamp(0.64rem, 2.7vw, var(--dk-text-label));
    }
  }

  .source-tags {
    justify-content: flex-start;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .current-tiers__grid > article {
    padding: 9px 8px;

    dl {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 5px;
    }

    dt {
      white-space: nowrap;
    }

    dd {
      white-space: nowrap;
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
