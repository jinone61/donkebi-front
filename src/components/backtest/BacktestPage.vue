<template>
  <div class="backtest-page">
    <div v-if="!isAuthenticated" class="auth-area">
      <div class="auth-shell dk-container">
        <div class="auth-intro dk-reveal">
          <p class="dk-eyebrow">Private Simulation Interface</p>
          <h1 class="dk-serif">Enter the<br />simulation.</h1>
          <p>
            Donkebi의 전략 검증 인터페이스입니다. 승인된 사용자만 접근할 수
            있습니다.
          </p>
          <div class="auth-intro__meta" aria-hidden="true">
            <span>AGENT / 01</span>
            <span>ACCESS / RESTRICTED</span>
          </div>
        </div>

        <q-form class="auth-form dk-reveal" @submit.prevent="checkPassword">
          <div class="auth-form__head">
            <span>AUTHENTICATION</span>
            <span>01 / 01</span>
          </div>
          <q-input
            v-model="inputPassword"
            type="password"
            label="비밀번호"
            outlined
            color="dark"
            :error="passwordError"
            error-message="비밀번호가 틀렸습니다."
          />
          <q-btn
            type="submit"
            label="ENTER INTERFACE"
            color="dark"
            unelevated
            class="full-width auth-form__button"
          />
        </q-form>
      </div>
    </div>

    <template v-else>
      <section class="workspace-intro dk-container">
        <div>
          <p class="dk-eyebrow">Backtest · Agent 01</p>
          <h1 class="dk-serif">Strategy<br />simulation.</h1>
        </div>
        <div class="workspace-intro__note">
          <span class="workspace-intro__status"><i></i> SYSTEM READY</span>
          <p>
            같은 전략을 과거의 시장 위에서 다시 실행합니다. 조건을 설정한 뒤
            성과와 다음 주문을 하나의 흐름으로 확인하세요.
          </p>
        </div>
      </section>

      <q-tabs
        v-model="activeTab"
        dense
        align="justify"
        active-color="dark"
        indicator-color="dark"
        class="tabs-bar"
      >
        <q-tab name="settings" label="SETUP" />
        <q-tab name="status" label="PERFORMANCE" :disable="!hasResult" />
        <q-tab name="plan" label="ORDERS" :disable="!hasResult" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="bg-transparent">
        <q-tab-panel name="settings" class="q-pa-none">
          <div class="content-container settings-container">
            <q-banner
              v-if="submitError"
              rounded
              class="bg-red-1 text-negative q-mb-md"
            >
              {{ submitError }}
            </q-banner>

            <q-banner
              v-if="showValidation && validationErrors.length"
              rounded
              class="bg-orange-1 text-orange-10 q-mb-md"
            >
              <div class="text-weight-bold q-mb-xs"
                >입력값을 확인해 주세요.</div
              >
              <div v-for="message in validationErrors" :key="message"
                >• {{ message }}</div
              >
            </q-banner>

            <q-form @submit.prevent="runBacktest">
              <q-card flat bordered class="section-card">
                <q-card-section class="section-heading">
                  <div class="text-h6 text-grey-9">기본 설정</div>
                  <div class="text-caption text-grey-6">
                    백테스트 대상과 기간, 초기 자산을 입력합니다.
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section class="settings-grid basic-settings-grid">
                  <q-select
                    v-model="selectedPreset"
                    :options="presetOptions"
                    label="전략 프리셋"
                    outlined
                    dense
                    color="green-5"
                    @update:model-value="applyPreset"
                  />
                  <q-input
                    v-model="form.symbol"
                    label="종목"
                    outlined
                    dense
                    color="green-5"
                    disable
                    @blur="normalizeSymbol"
                  />
                  <q-input
                    v-model="form.startDate"
                    class="date-input"
                    label="시작일"
                    outlined
                    dense
                    readonly
                    color="green-5"
                    @click="startDateDialog = true"
                  >
                    <template #append>
                      <q-icon
                        name="event"
                        class="cursor-pointer"
                        @click.stop="startDateDialog = true"
                      />
                    </template>
                  </q-input>
                  <q-input
                    v-model="form.targetDate"
                    class="date-input"
                    label="목표일"
                    outlined
                    dense
                    readonly
                    color="green-5"
                    @click="targetDateDialog = true"
                  >
                    <template #append>
                      <q-icon
                        name="event"
                        class="cursor-pointer"
                        @click.stop="targetDateDialog = true"
                      />
                    </template>
                  </q-input>
                  <q-input
                    v-model.number="form.initialAvailableCash"
                    type="number"
                    label="초기 현금"
                    prefix="$"
                    min="0"
                    outlined
                    dense
                    color="green-5"
                  />
                  <q-input
                    v-model.number="form.commissionRatePct"
                    type="number"
                    label="수수료율"
                    suffix="%"
                    min="0"
                    step="0.01"
                    outlined
                    dense
                    color="green-5"
                  />
                </q-card-section>
              </q-card>

              <q-dialog v-model="startDateDialog">
                <q-date
                  v-model="form.startDate"
                  mask="YYYY-MM-DD"
                  color="green-5"
                  @update:model-value="startDateDialog = false"
                />
              </q-dialog>

              <q-dialog v-model="targetDateDialog">
                <q-date
                  v-model="form.targetDate"
                  mask="YYYY-MM-DD"
                  color="green-5"
                  @update:model-value="targetDateDialog = false"
                />
              </q-dialog>

              <q-card flat bordered class="section-card strategy-settings">
                <q-expansion-item
                  expand-separator
                  header-class="section-heading"
                >
                  <template #header>
                    <q-item-section>
                      <div class="text-h6 text-grey-9">공격 모드</div>
                      <div class="text-caption text-grey-6"
                        >공격 티어의 분할과 매수·매도 조건</div
                      >
                    </q-item-section>
                    <q-item-section side>
                      <div class="column items-end q-gutter-y-xs">
                        <q-badge
                          outline
                          color="grey-7"
                          :label="selectedPreset"
                        />
                        <q-badge
                          :color="isCustomPreset ? 'green-6' : 'grey-6'"
                          :label="isCustomPreset ? '수정 가능' : '잠김'"
                        />
                      </div>
                    </q-item-section>
                  </template>

                  <q-card-section class="settings-grid">
                    <q-input
                      v-for="field in attackFields"
                      :key="field.key"
                      v-model.number="form.attackMode[field.key]"
                      type="number"
                      :label="field.label"
                      :suffix="field.suffix"
                      :step="field.step"
                      :readonly="!isCustomPreset"
                      outlined
                      dense
                      color="green-5"
                      @update:model-value="markCustom"
                    />
                  </q-card-section>
                </q-expansion-item>
              </q-card>

              <q-card flat bordered class="section-card strategy-settings">
                <q-expansion-item
                  expand-separator
                  header-class="section-heading"
                >
                  <template #header>
                    <q-item-section>
                      <div class="text-h6 text-grey-9">방어 모드</div>
                      <div class="text-caption text-grey-6"
                        >방어 티어와 이동평균 기반 조건</div
                      >
                    </q-item-section>
                    <q-item-section side>
                      <div class="column items-end q-gutter-y-xs">
                        <q-badge
                          outline
                          color="grey-7"
                          :label="selectedPreset"
                        />
                        <q-badge
                          :color="isCustomPreset ? 'green-6' : 'grey-6'"
                          :label="isCustomPreset ? '수정 가능' : '잠김'"
                        />
                      </div>
                    </q-item-section>
                  </template>

                  <q-card-section class="settings-grid">
                    <q-input
                      v-for="field in defenseFields"
                      :key="field.key"
                      v-model.number="form.defenseMode[field.key]"
                      type="number"
                      :label="field.label"
                      :suffix="field.suffix"
                      :step="field.step"
                      :readonly="!isCustomPreset"
                      outlined
                      dense
                      color="green-5"
                      @update:model-value="
                        field.key === 'splitCount'
                          ? handleDefenseSplitCount()
                          : markCustom()
                      "
                    />
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="text-subtitle2 text-grey-8"
                        >티어별 매수 비율</div
                      >
                      <q-badge
                        :color="tierRatioTotal === 100 ? 'green-6' : 'orange-7'"
                        :label="`합계 ${formatNumber(tierRatioTotal, 2)}%`"
                      />
                    </div>
                    <div class="ratio-grid">
                      <q-input
                        v-for="(_, index) in form.defenseMode.tierBuyRatiosPct"
                        :key="`ratio-${index}`"
                        v-model.number="
                          form.defenseMode.tierBuyRatiosPct[index]
                        "
                        type="number"
                        :label="`방T${index + 1}`"
                        suffix="%"
                        min="0"
                        step="1"
                        :readonly="!isCustomPreset"
                        outlined
                        dense
                        color="green-5"
                        @update:model-value="markCustom"
                      />
                    </div>
                  </q-card-section>
                </q-expansion-item>
              </q-card>

              <q-btn
                type="submit"
                label="RUN SIMULATION"
                color="dark"
                unelevated
                class="full-width run-button"
                :loading="isLoading"
                :disable="isLoading"
              />
            </q-form>
          </div>
        </q-tab-panel>

        <q-tab-panel name="status" class="q-pa-none">
          <div class="content-container" v-if="hasResult">
            <q-card flat bordered class="section-card">
              <q-card-section class="section-heading">
                <div class="row items-center justify-between q-col-gutter-md">
                  <div>
                    <div class="text-h6 text-grey-9"
                      >{{ backtestResult.symbol }} 백테스트</div
                    >
                    <div class="text-caption text-grey-6">
                      {{ backtestResult.actualStartDate }} ~
                      {{ backtestResult.backtestedThroughDate }}
                    </div>
                  </div>
                  <q-badge
                    color="green-6"
                    :label="finalPortfolio.currency || 'USD'"
                  />
                </div>
              </q-card-section>
              <q-banner
                v-if="startDateWasAdjusted"
                dense
                rounded
                class="bg-blue-1 text-blue-9 q-ma-md q-mt-none"
              >
                요청 시작일 {{ backtestResult.requestedStartDate }}이 거래일
                {{ backtestResult.actualStartDate }}로 조정되었습니다.
              </q-banner>
            </q-card>

            <div class="metric-grid summary-grid">
              <q-card
                v-for="card in summaryCards"
                :key="card.label"
                flat
                bordered
                class="metric-card"
              >
                <div class="metric-label">{{ card.label }}</div>
                <div class="metric-value" :class="card.valueClass">{{
                  card.value
                }}</div>
                <div v-if="card.caption" class="metric-caption">{{
                  card.caption
                }}</div>
              </q-card>
            </div>

            <q-card flat bordered class="section-card">
              <q-card-section class="section-heading">
                <div class="text-h6 text-grey-9">최종 포트폴리오</div>
                <div class="text-caption text-grey-6"
                  >{{ finalPortfolio.date || '-' }} 기준</div
                >
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div class="metric-grid compact-grid">
                  <div class="metric-card">
                    <div class="metric-label">가용 현금</div>
                    <div class="metric-value">{{
                      formatMoney(finalPortfolio.availableCash)
                    }}</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">보유 평가액</div>
                    <div class="metric-value">
                      {{ formatMoney(finalPortfolio.holdingsMarketValue) }}
                    </div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">총 보유수량</div>
                    <div class="metric-value">
                      {{ formatInteger(finalPortfolio.totalQuantity) }}주
                    </div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">마지막 종가</div>
                    <div class="metric-value">{{
                      formatPrice(finalPortfolio.closePrice)
                    }}</div>
                  </div>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div
                  class="text-subtitle1 text-weight-bold text-grey-8 q-mb-sm"
                >
                  티어별 보유 현황
                </div>
                <q-table
                  v-if="finalTiers.length"
                  flat
                  bordered
                  dense
                  row-key="tier"
                  :rows="finalTiers"
                  :columns="tierColumns"
                  :rows-per-page-options="[0]"
                  hide-pagination
                  :grid="$q.screen.xs"
                >
                  <template #item="props">
                    <div class="col-12">
                      <q-card flat bordered class="mobile-data-card">
                        <div class="mobile-data-card__header">
                          <div class="row items-center q-gutter-xs">
                            <q-badge
                              :color="modeColor(props.row.mode)"
                              :label="props.row.mode"
                            />
                            <span class="text-weight-bold text-grey-8">{{
                              props.row.tier
                            }}</span>
                          </div>
                          <span class="text-caption text-grey-6">
                            {{ formatInteger(props.row.quantity) }}주
                          </span>
                        </div>
                        <div class="mobile-data-card__grid">
                          <div>
                            <div class="data-label">평균 매수가</div>
                            <div class="data-value">
                              {{ formatPrice(props.row.averageBuyPrice) }}
                            </div>
                          </div>
                          <div>
                            <div class="data-label">평가액</div>
                            <div class="data-value">{{
                              formatMoney(props.row.marketValue)
                            }}</div>
                          </div>
                          <div>
                            <div class="data-label">미실현 손익</div>
                            <div
                              class="data-value"
                              :class="profitClass(props.row.unrealizedProfit)"
                            >
                              {{ formatMoney(props.row.unrealizedProfit) }}
                            </div>
                          </div>
                          <div>
                            <div class="data-label">수익률</div>
                            <div
                              class="data-value"
                              :class="
                                profitClass(props.row.unrealizedReturnPct)
                              "
                            >
                              {{ formatPct(props.row.unrealizedReturnPct) }}
                            </div>
                          </div>
                        </div>
                      </q-card>
                    </div>
                  </template>
                  <template #body-cell-mode="props">
                    <q-td :props="props">
                      <q-badge
                        :color="modeColor(props.value)"
                        :label="props.value"
                      />
                    </q-td>
                  </template>
                  <template #body-cell-averageBuyPrice="props">
                    <q-td :props="props">{{ formatPrice(props.value) }}</q-td>
                  </template>
                  <template #body-cell-marketValue="props">
                    <q-td :props="props">{{ formatMoney(props.value) }}</q-td>
                  </template>
                  <template #body-cell-unrealizedProfit="props">
                    <q-td :props="props" :class="profitClass(props.value)">
                      {{ formatMoney(props.value) }}
                    </q-td>
                  </template>
                  <template #body-cell-unrealizedReturnPct="props">
                    <q-td :props="props" :class="profitClass(props.value)">
                      {{ formatPct(props.value) }}
                    </q-td>
                  </template>
                </q-table>
                <div v-else class="empty-message"
                  >최종 보유 티어가 없습니다.</div
                >
              </q-card-section>
            </q-card>

            <q-card flat bordered class="section-card">
              <q-card-section class="section-heading">
                <div class="text-h6 text-grey-9">가격 및 체결</div>
                <div class="text-caption text-grey-6"
                  >일별 종가와 실제 매수·매도 체결 위치</div
                >
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div v-if="dailyRows.length" class="chart-container">
                  <Chart
                    :key="`price-${resultKey}`"
                    type="line"
                    :data="priceChartData"
                    :options="priceChartOptions"
                  />
                </div>
                <div v-else class="empty-message"
                  >차트로 표시할 일별 데이터가 없습니다.</div
                >
              </q-card-section>
            </q-card>

            <q-card flat bordered class="section-card">
              <q-card-section class="section-heading">
                <div class="text-h6 text-grey-9">포트폴리오 성과</div>
                <div class="text-caption text-grey-6"
                  >총자산과 drawdown 추이</div
                >
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div v-if="dailyRows.length" class="chart-container">
                  <Chart
                    :key="`performance-${resultKey}`"
                    type="line"
                    :data="performanceChartData"
                    :options="performanceChartOptions"
                  />
                </div>
                <div v-else class="empty-message"
                  >차트로 표시할 일별 데이터가 없습니다.</div
                >
              </q-card-section>
            </q-card>

            <q-card flat bordered class="section-card">
              <q-card-section
                class="section-heading row items-center justify-between"
              >
                <div>
                  <div class="text-h6 text-grey-9">일별 백테스트 내역</div>
                  <div class="text-caption text-grey-6">
                    날짜를 선택하면 주문·체결·현금 흐름을 확인할 수 있습니다.
                  </div>
                </div>
                <q-badge color="grey-7" :label="`${dailyRows.length} 거래일`" />
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <div v-if="dailyRows.length" class="daily-history">
                  <div class="daily-header desktop-only">
                    <span>날짜</span>
                    <span>모드</span>
                    <span>종가</span>
                    <span>총자산</span>
                    <span>DD</span>
                    <span>주문</span>
                    <span>체결</span>
                    <span>마감 현금</span>
                    <span>현금 비중</span>
                  </div>
                  <q-expansion-item
                    v-for="day in visibleDailyRows"
                    :key="day.sessionDate"
                    class="daily-history-item"
                    group="daily-results"
                    dense
                    expand-separator
                    header-class="daily-item-header"
                  >
                    <template #header>
                      <div class="daily-row daily-desktop-summary">
                        <div class="daily-cell">
                          <span class="mobile-label">날짜</span
                          >{{ day.sessionDate }}
                        </div>
                        <div class="daily-cell">
                          <span class="mobile-label">모드</span>
                          <q-badge
                            :color="modeColor(day.mode)"
                            :label="day.mode"
                          />
                        </div>
                        <div class="daily-cell">
                          <span class="mobile-label">종가</span
                          >{{ formatPrice(day.closePrice) }}
                        </div>
                        <div class="daily-cell">
                          <span class="mobile-label">총자산</span
                          >{{ formatMoney(day.totalAsset) }}
                        </div>
                        <div
                          class="daily-cell"
                          :class="profitClass(day.drawdownPct)"
                        >
                          <span class="mobile-label">DD</span
                          >{{ formatPct(day.drawdownPct, false) }}
                        </div>
                        <div class="daily-cell">
                          <span class="mobile-label">주문</span
                          >{{ day.orders.length }}
                        </div>
                        <div class="daily-cell">
                          <span class="mobile-label">체결</span
                          >{{ day.executions.length }}
                        </div>
                        <div class="daily-cell">
                          <span class="mobile-label">마감 현금</span
                          >{{ formatMoney(day.closingCash) }}
                        </div>
                        <div class="daily-cell">
                          <span class="mobile-label">현금 비중</span
                          >{{ formatPct(day.cashRatioPct, false) }}
                        </div>
                      </div>
                      <div class="daily-mobile-summary">
                        <div class="daily-mobile-summary__header">
                          <span class="text-weight-bold text-grey-8">{{
                            day.sessionDate
                          }}</span>
                          <span class="daily-mobile-summary__meta"
                            >종가 {{ formatPrice(day.closePrice) }} ·
                            <q-badge
                              :color="modeColor(day.mode)"
                              :label="day.mode"
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
                          <span
                            ><span>현금</span>
                            {{ formatMoney(day.closingCash) }} ({{
                              formatPct(day.cashRatioPct, false)
                            }})</span
                          >
                          <span></span>
                          <span
                            >주문 {{ day.orders.length }} · 체결
                            {{ day.executions.length }}</span
                          >
                        </div>
                      </div>
                    </template>

                    <div class="daily-detail bg-grey-1">
                      <div class="detail-section">
                        <div class="detail-title">당일 계획</div>
                        <div class="detail-summary">
                          <span>목표일 {{ day.plan?.targetDate || '-' }}</span>
                          <span>모드 {{ day.plan?.mode || '-' }}</span>
                          <span
                            >기준 매수가
                            {{ formatPrice(day.plan?.buyPrice) }}</span
                          >
                        </div>
                        <div v-if="day.plan?.buyOrder" class="detail-note">
                          매수 {{ day.plan.buyOrder.tier }} ·
                          {{ formatInteger(day.plan.buyOrder.quantity) }}주 ·
                          {{ formatPrice(day.plan.buyOrder.orderPrice) }}
                        </div>
                        <div
                          v-if="day.plan?.sellOrders?.length"
                          class="detail-note"
                        >
                          매도 계획 {{ day.plan.sellOrders.length }}건
                        </div>
                      </div>

                      <div class="detail-section">
                        <div class="detail-title">주문 및 체결</div>
                        <div
                          v-if="day.orderExecutionRows.length"
                          class="table-scroll"
                        >
                          <q-markup-table flat bordered dense>
                            <thead>
                              <tr>
                                <th class="text-left">구분</th>
                                <th class="text-left">티어</th>
                                <th class="text-left">유형</th>
                                <th class="text-right">주문가</th>
                                <th class="text-right">주문수량</th>
                                <th class="text-right">체결가</th>
                                <th class="text-right">체결수량</th>
                                <th class="text-right">취소수량</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(row, index) in day.orderExecutionRows"
                                :key="`${day.sessionDate}-order-execution-${index}`"
                              >
                                <td>
                                  <q-badge
                                    :color="sideColor(row.tradeSide)"
                                    :label="row.tradeSide"
                                  />
                                </td>
                                <td>{{ row.tier }}</td>
                                <td>{{ row.orderType }}</td>
                                <td class="text-right">{{
                                  formatPrice(row.orderPrice)
                                }}</td>
                                <td class="text-right">{{
                                  formatInteger(row.orderedQuantity)
                                }}</td>
                                <td class="text-right">{{
                                  formatPrice(row.executionPrice)
                                }}</td>
                                <td class="text-right">
                                  {{ formatInteger(row.executedQuantity) }}
                                </td>
                                <td class="text-right">
                                  {{ formatInteger(row.canceledQuantity) }}
                                </td>
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
                            >시작 {{ formatMoney(day.cash?.openingCash) }}</span
                          >
                          <span
                            >마감 {{ formatMoney(day.cash?.closingCash) }}</span
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
                                <th class="text-left">티어</th>
                                <th class="text-right">변동액</th>
                                <th class="text-right">변동 후 현금</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(transaction, index) in day.transactions"
                                :key="`${day.sessionDate}-cash-${index}`"
                              >
                                <td>{{ transaction.type }}</td>
                                <td>{{ transaction.tier || '-' }}</td>
                                <td
                                  class="text-right"
                                  :class="profitClass(transaction.changeAmount)"
                                >
                                  {{ formatMoney(transaction.changeAmount) }}
                                </td>
                                <td class="text-right">{{
                                  formatMoney(transaction.cashAfter)
                                }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>
                        <div v-else class="detail-note">현금 거래 없음</div>
                      </div>
                    </div>
                  </q-expansion-item>
                  <div v-if="hasMoreDailyRows" class="q-pa-md">
                    <q-btn
                      outline
                      color="green-7"
                      label="더 불러오기"
                      class="full-width"
                      @click="loadMoreDailyRows"
                    />
                  </div>
                </div>
                <div v-else class="empty-message q-pa-lg"
                  >일별 결과가 없습니다.</div
                >
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <q-tab-panel name="plan" class="q-pa-none">
          <div class="content-container" v-if="hasResult">
            <q-card flat bordered class="section-card">
              <q-card-section
                class="section-heading row items-center justify-between"
              >
                <div>
                  <div class="text-h6 text-grey-9">다음 거래 계획</div>
                  <div class="text-caption text-grey-6">
                    시뮬레이션이 생성한 조회 전용 계획입니다.
                  </div>
                </div>
                <div class="row items-center q-gutter-sm">
                  <q-badge
                    color="grey-7"
                    :label="nextPlan.targetDate || backtestResult.targetDate"
                  />
                  <q-badge
                    :color="modeColor(nextPlan.mode)"
                    :label="nextPlan.mode || '-'"
                  />
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-sm"
                  >매수 계획</div
                >
                <q-table
                  v-if="nextBuyOrders.length"
                  flat
                  bordered
                  dense
                  row-key="tier"
                  :rows="nextBuyOrders"
                  :columns="buyPlanColumns"
                  :rows-per-page-options="[0]"
                  hide-pagination
                  :grid="$q.screen.xs"
                >
                  <template #item="props">
                    <div class="col-12">
                      <q-card flat bordered class="mobile-data-card">
                        <div class="mobile-data-card__header">
                          <div class="row items-center q-gutter-xs">
                            <q-badge
                              color="blue-grey-7"
                              :label="props.row.tier"
                            />
                            <span class="text-weight-bold text-grey-8">
                              {{ props.row.orderType }} 매수
                            </span>
                          </div>
                          <q-badge color="red-7" label="매수" />
                        </div>
                        <div class="mobile-data-card__grid">
                          <div>
                            <div class="data-label">배정금액</div>
                            <div class="data-value">
                              {{ formatMoney(props.row.allocationAmount) }}
                            </div>
                          </div>
                          <div>
                            <div class="data-label">주문가</div>
                            <div class="data-value">{{
                              formatPrice(props.row.orderPrice)
                            }}</div>
                          </div>
                          <div>
                            <div class="data-label">수량</div>
                            <div class="data-value"
                              >{{ formatInteger(props.row.quantity) }}주</div
                            >
                          </div>
                          <div>
                            <div class="data-label">주문 방식</div>
                            <div class="data-value">{{
                              props.row.orderType
                            }}</div>
                          </div>
                        </div>
                      </q-card>
                    </div>
                  </template>
                  <template #body-cell-allocationAmount="props">
                    <q-td :props="props">{{ formatMoney(props.value) }}</q-td>
                  </template>
                  <template #body-cell-orderPrice="props">
                    <q-td :props="props">{{ formatPrice(props.value) }}</q-td>
                  </template>
                  <template #body-cell-quantity="props">
                    <q-td :props="props"
                      >{{ formatInteger(props.value) }}주</q-td
                    >
                  </template>
                </q-table>
                <div v-else class="empty-message"
                  >다음 매수 계획이 없습니다.</div
                >
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-sm"
                  >매도 계획</div
                >
                <q-table
                  v-if="nextSellOrders.length"
                  flat
                  bordered
                  dense
                  row-key="tier"
                  :rows="nextSellOrders"
                  :columns="sellPlanColumns"
                  :rows-per-page-options="[0]"
                  hide-pagination
                  :grid="$q.screen.xs"
                >
                  <template #item="props">
                    <div class="col-12">
                      <q-card flat bordered class="mobile-data-card">
                        <div class="mobile-data-card__header">
                          <div class="row items-center q-gutter-xs">
                            <q-badge
                              color="blue-grey-7"
                              :label="props.row.tier"
                            />
                            <span class="text-weight-bold text-grey-8">
                              {{ props.row.orderType }} 매도
                            </span>
                          </div>
                          <q-badge color="grey-6" :label="props.row.planType" />
                        </div>
                        <div class="mobile-data-card__grid">
                          <div>
                            <div class="data-label">수량</div>
                            <div class="data-value"
                              >{{ formatInteger(props.row.quantity) }}주</div
                            >
                          </div>
                          <div>
                            <div class="data-label">주문가</div>
                            <div class="data-value">{{
                              formatPrice(props.row.orderPrice)
                            }}</div>
                          </div>
                          <div>
                            <div class="data-label">매수일</div>
                            <div class="data-value">{{
                              props.row.buySessionDate
                            }}</div>
                          </div>
                          <div>
                            <div class="data-label">보유/최대</div>
                            <div class="data-value">
                              {{ props.row.heldSessionCount }}/{{
                                props.row.maxHoldDays
                              }}일
                            </div>
                          </div>
                        </div>
                      </q-card>
                    </div>
                  </template>
                  <template #body-cell-orderPrice="props">
                    <q-td :props="props">{{ formatPrice(props.value) }}</q-td>
                  </template>
                </q-table>
                <div v-else class="empty-message"
                  >다음 매도 계획이 없습니다.</div
                >
              </q-card-section>
            </q-card>

            <q-card flat bordered class="section-card">
              <q-card-section class="section-heading">
                <div class="text-h6 text-grey-9">주문표</div>
                <div class="text-caption text-grey-6">
                  실제 제출 대상 형식으로 정리한 다음 주문입니다.
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <q-table
                  v-if="nextOrders.length"
                  flat
                  bordered
                  dense
                  row-key="rowKey"
                  :rows="nextOrders"
                  :columns="nextOrderColumns"
                  :rows-per-page-options="[0]"
                  hide-pagination
                  :grid="$q.screen.xs"
                >
                  <template #item="props">
                    <div class="col-12">
                      <q-card flat bordered class="mobile-data-card">
                        <div class="mobile-data-card__header">
                          <div class="row items-center q-gutter-xs">
                            <q-badge
                              :color="sideColor(props.row.tradeSide)"
                              :label="props.row.tradeSide"
                            />
                            <span class="text-weight-bold text-grey-8">{{
                              props.row.tier
                            }}</span>
                          </div>
                          <span class="text-caption text-grey-6">{{
                            props.row.orderType
                          }}</span>
                        </div>
                        <div
                          class="mobile-data-card__grid mobile-data-card__grid--three"
                        >
                          <div>
                            <div class="data-label">주문가</div>
                            <div class="data-value">{{
                              formatPrice(props.row.orderPrice)
                            }}</div>
                          </div>
                          <div>
                            <div class="data-label">수량</div>
                            <div class="data-value"
                              >{{ formatInteger(props.row.quantity) }}주</div
                            >
                          </div>
                          <div>
                            <div class="data-label">배정금액</div>
                            <div class="data-value">
                              {{ formatMoney(props.row.allocationAmount) }}
                            </div>
                          </div>
                        </div>
                      </q-card>
                    </div>
                  </template>
                  <template #body-cell-tradeSide="props">
                    <q-td :props="props">
                      <q-badge
                        :color="sideColor(props.value)"
                        :label="props.value"
                      />
                    </q-td>
                  </template>
                  <template #body-cell-allocationAmount="props">
                    <q-td :props="props">{{ formatMoney(props.value) }}</q-td>
                  </template>
                  <template #body-cell-orderPrice="props">
                    <q-td :props="props">{{ formatPrice(props.value) }}</q-td>
                  </template>
                </q-table>
                <div v-else class="empty-message"
                  >생성된 다음 주문이 없습니다.</div
                >
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineController,
  ScatterController,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function mergeOrdersWithExecutions(orders = [], executions = []) {
  return orders.map(order => {
    const execution = executions.find(
      candidate =>
        candidate.tradeSide === order.tradeSide && candidate.tier === order.tier
    )

    return {
      ...order,
      executionPrice: execution?.price ?? null,
      executedQuantity: execution?.quantity ?? 0
    }
  })
}

function calculateCashRatioPct(closingCash, totalAsset) {
  const cash = finiteNumber(closingCash)
  const assets = finiteNumber(totalAsset)
  if (cash === null || assets === null || assets === 0) return null
  return (cash / assets) * 100
}

function formatMonthTickLabel(currentLabel, previousLabel) {
  const currentMonth = String(currentLabel || '').slice(0, 7)
  if (!currentMonth) return undefined
  const previousMonth = String(previousLabel || '').slice(0, 7)
  return currentMonth === previousMonth ? undefined : currentMonth
}

const $q = useQuasar()
const BACKTEST_URL = '/api/dualsniper/backtest'
const PAGE_PASSWORD = '1q2w3e!!'
const CUSTOM_PRESET = 'Custom'
const DAILY_HISTORY_PAGE_SIZE = 30

const COMMON_DEFENSE_MODE = {
  splitCount: 5,
  holdingPeriod: 8,
  buyCondition1MaPct: -0.6,
  buyCondition2ClosePct: 5.5,
  sellConditionMaPct: 0.7,
  maWindow: 3,
  tierBuyRatiosPct: [6, 13, 20, 27, 34]
}

const PRESETS = {
  'Preset 1': {
    attackMode: {
      splitCount: 6,
      holdingPeriodAlpha: 2,
      buyConditionClosePct: -0.1,
      sellConditionAlpha: 0.4
    }
  },
  'Preset 2': {
    attackMode: {
      splitCount: 6,
      holdingPeriodAlpha: 2,
      buyConditionClosePct: 0.5,
      sellConditionAlpha: 0.4
    }
  },
  'Preset 3': {
    attackMode: {
      splitCount: 5,
      holdingPeriodAlpha: 2,
      buyConditionClosePct: 0.5,
      sellConditionAlpha: 0.4
    }
  },
  'Preset 4': {
    attackMode: {
      splitCount: 7,
      holdingPeriodAlpha: 2,
      buyConditionClosePct: 8,
      sellConditionAlpha: 0.4
    }
  },
  'Preset 5': {
    attackMode: {
      splitCount: 6,
      holdingPeriodAlpha: 2,
      buyConditionClosePct: 8,
      sellConditionAlpha: 0.4
    }
  }
}

const presetOptions = [...Object.keys(PRESETS), CUSTOM_PRESET]
const attackFields = [
  { key: 'splitCount', label: '공격 분할 수', step: 1 },
  { key: 'holdingPeriodAlpha', label: '보유기간 계수', step: 0.1 },
  {
    key: 'buyConditionClosePct',
    label: '종가 매수조건',
    suffix: '%',
    step: 0.1
  },
  { key: 'sellConditionAlpha', label: '매도조건 계수', step: 0.1 }
]
const defenseFields = [
  { key: 'splitCount', label: '방어 분할 수', step: 1 },
  { key: 'holdingPeriod', label: '최대 보유기간', suffix: '일', step: 1 },
  { key: 'buyCondition1MaPct', label: 'MA 매수조건', suffix: '%', step: 0.1 },
  {
    key: 'buyCondition2ClosePct',
    label: '종가 매수조건',
    suffix: '%',
    step: 0.1
  },
  { key: 'sellConditionMaPct', label: 'MA 매도조건', suffix: '%', step: 0.1 },
  { key: 'maWindow', label: 'MA 기간', suffix: '일', step: 1 }
]

const isAuthenticated = ref(false)
const inputPassword = ref('')
const passwordError = ref(false)
const startDateDialog = ref(false)
const targetDateDialog = ref(false)
const activeTab = ref('settings')
const selectedPreset = ref('Preset 5')
const isLoading = ref(false)
const submitError = ref('')
const showValidation = ref(false)
const backtestResult = ref(null)
const visibleDailyCount = ref(DAILY_HISTORY_PAGE_SIZE)

const form = reactive({
  symbol: 'SOXL',
  startDate: '2026-06-14',
  targetDate: getKstToday(),
  initialAvailableCash: 120000,
  commissionRatePct: 0.04,
  attackMode: cloneAttackMode(PRESETS['Preset 5'].attackMode),
  defenseMode: cloneDefenseMode(COMMON_DEFENSE_MODE)
})

const isCustomPreset = computed(() => selectedPreset.value === CUSTOM_PRESET)
const hasResult = computed(() => Boolean(backtestResult.value))
const finalPortfolio = computed(
  () => backtestResult.value?.finalPortfolio || {}
)
const finalTiers = computed(() => finalPortfolio.value.tiers || [])
const nextPlan = computed(() => backtestResult.value?.nextPlan || {})
const nextSellOrders = computed(() => nextPlan.value.sellOrders || [])
const nextOrders = computed(() =>
  (backtestResult.value?.nextOrders || []).map((order, index) => ({
    ...order,
    rowKey: `${order.tradeSide}-${order.tier}-${index}`
  }))
)
const nextBuyOrders = computed(() => {
  if (!nextPlan.value.buyOrder) return []

  const matchingOrder = nextOrders.value.find(
    order =>
      order.tradeSide === 'BUY' && order.tier === nextPlan.value.buyOrder.tier
  )

  return [
    {
      ...nextPlan.value.buyOrder,
      orderType: matchingOrder?.orderType || 'LOC'
    }
  ]
})
const startDateWasAdjusted = computed(
  () =>
    backtestResult.value?.requestedStartDate &&
    backtestResult.value.requestedStartDate !==
      backtestResult.value.actualStartDate
)
const resultKey = computed(
  () =>
    `${backtestResult.value?.symbol || ''}-${backtestResult.value?.actualStartDate || ''}-${backtestResult.value?.backtestedThroughDate || ''}`
)

const tierRatioTotal = computed(() =>
  form.defenseMode.tierBuyRatiosPct.reduce(
    (sum, value) => sum + (toNumber(value) || 0),
    0
  )
)

const validationErrors = computed(() => {
  const errors = []
  if (!form.symbol.trim()) errors.push('종목을 입력해 주세요.')
  if (!form.startDate || !form.targetDate)
    errors.push('시작일과 목표일을 입력해 주세요.')
  if (form.startDate && form.targetDate && form.startDate > form.targetDate) {
    errors.push('시작일은 목표일보다 늦을 수 없습니다.')
  }
  if (!isPositiveNumber(form.initialAvailableCash))
    errors.push('초기 현금은 0보다 커야 합니다.')
  if (!isNonNegativeNumber(form.commissionRatePct))
    errors.push('수수료율은 0 이상이어야 합니다.')
  if (!isPositiveInteger(form.attackMode.splitCount))
    errors.push('공격 분할 수는 양의 정수여야 합니다.')
  if (!isPositiveNumber(form.attackMode.holdingPeriodAlpha))
    errors.push('공격 보유기간 계수는 0보다 커야 합니다.')
  if (!isFiniteNumber(form.attackMode.buyConditionClosePct))
    errors.push('공격 종가 매수조건을 확인해 주세요.')
  if (!isFiniteNumber(form.attackMode.sellConditionAlpha))
    errors.push('공격 매도조건 계수를 확인해 주세요.')
  if (!isPositiveInteger(form.defenseMode.splitCount))
    errors.push('방어 분할 수는 양의 정수여야 합니다.')
  if (!isPositiveInteger(form.defenseMode.holdingPeriod))
    errors.push('방어 보유기간은 양의 정수여야 합니다.')
  if (!isFiniteNumber(form.defenseMode.buyCondition1MaPct))
    errors.push('방어 MA 매수조건을 확인해 주세요.')
  if (!isFiniteNumber(form.defenseMode.buyCondition2ClosePct))
    errors.push('방어 종가 매수조건을 확인해 주세요.')
  if (!isFiniteNumber(form.defenseMode.sellConditionMaPct))
    errors.push('방어 MA 매도조건을 확인해 주세요.')
  if (!isPositiveInteger(form.defenseMode.maWindow))
    errors.push('MA 기간은 양의 정수여야 합니다.')
  if (
    form.defenseMode.tierBuyRatiosPct.length !==
    Number(form.defenseMode.splitCount)
  ) {
    errors.push('티어별 매수 비율 개수는 방어 분할 수와 같아야 합니다.')
  }
  if (
    form.defenseMode.tierBuyRatiosPct.some(value => !isPositiveNumber(value))
  ) {
    errors.push('각 티어 매수 비율은 0보다 커야 합니다.')
  }
  if (Math.abs(tierRatioTotal.value - 100) > 0.0001) {
    errors.push('티어별 매수 비율 합계는 100%여야 합니다.')
  }
  return errors
})

const dailyRows = computed(() =>
  (backtestResult.value?.dailyResults || []).map(day => {
    const orders = day.orders || []
    const executions = day.executions || []
    const totalAsset = day.portfolio?.totalAsset
    const closingCash = day.cash?.closingCash

    return {
      ...day,
      mode: day.plan?.mode || '-',
      orders,
      executions,
      orderExecutionRows: mergeOrdersWithExecutions(orders, executions),
      transactions: day.cash?.transactions || [],
      totalAsset,
      closingCash,
      cashRatioPct: calculateCashRatioPct(closingCash, totalAsset)
    }
  })
)

const dailyHistoryRows = computed(() =>
  [...dailyRows.value].sort((left, right) =>
    right.sessionDate.localeCompare(left.sessionDate)
  )
)
const visibleDailyRows = computed(() =>
  dailyHistoryRows.value.slice(0, visibleDailyCount.value)
)
const hasMoreDailyRows = computed(
  () => visibleDailyCount.value < dailyHistoryRows.value.length
)
const latestDailyRow = computed(() => dailyHistoryRows.value[0] || null)

const summaryCards = computed(() => {
  const initialCash = toNumber(backtestResult.value?.initialAvailableCash) || 0
  const initialDate = backtestResult.value?.actualStartDate || '-'
  const totalAsset = toNumber(finalPortfolio.value.totalAsset) || 0
  const totalProfit = totalAsset - initialCash
  const totalReturnPct = initialCash ? (totalProfit / initialCash) * 100 : 0
  const ath = backtestResult.value?.allTimeHigh || {}

  return [
    { label: '현재', value: formatMoney(totalAsset) },
    {
      label: '최고',
      value: formatMoney(ath.totalAsset),
      caption: ath.sessionDate || '-'
    },
    {
      label: '원금',
      value: formatMoney(initialCash),
      caption: initialDate || '-'
    },
    {
      label: '투자기간',
      value:
        Math.ceil(
          Math.abs(new Date() - new Date(initialDate)) / (1000 * 60 * 60 * 24)
        ) + '일',
      caption: `${initialDate} ~ ${new Date().toISOString().split('T')[0]}`
    },
    {
      label: '총손익',
      value: formatMoney(totalProfit),
      valueClass: profitClass(totalProfit)
    },
    {
      label: '총수익률',
      value: formatPct(totalReturnPct),
      valueClass: profitClass(totalReturnPct)
    },
    {
      label: 'MDD',
      value: formatPct(backtestResult.value?.maximumDrawdownPct, false),
      valueClass: profitClass(backtestResult.value?.maximumDrawdownPct)
    },
    {
      label: 'DD',
      value: formatPct(latestDailyRow.value?.drawdownPct, false),
      valueClass: profitClass(latestDailyRow.value?.drawdownPct)
    }
  ]
})

const priceChartData = computed(() => {
  const rows = dailyRows.value
  const buyExecutions = []
  const sellExecutions = []

  rows.forEach(day => {
    day.executions.forEach(execution => {
      const point = {
        x: execution.sessionDate || day.sessionDate,
        y: toNumber(execution.price),
        tier: execution.tier,
        quantity: execution.quantity,
        tradeSide: execution.tradeSide
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
        data: rows.map(day => toNumber(day.closePrice)),
        borderColor: '#171717',
        backgroundColor: 'rgba(23, 23, 23, 0.06)',
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
        backgroundColor: '#a64b40',
        borderColor: '#a64b40',
        pointStyle: 'triangle',
        pointRadius: 6,
        pointHoverRadius: 8,
        order: 0
      },
      {
        type: 'scatter',
        label: '매도 체결',
        data: sellExecutions,
        backgroundColor: '#456b82',
        borderColor: '#456b82',
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
  const rows = dailyRows.value
  const initialCash = toNumber(backtestResult.value?.initialAvailableCash)
  const ath = backtestResult.value?.allTimeHigh
  const athPoint = ath
    ? [
        {
          x: ath.sessionDate,
          y: toNumber(ath.totalAsset),
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
        data: rows.map(day => toNumber(day.totalAsset)),
        yAxisID: 'asset',
        borderColor: '#171717',
        backgroundColor: 'rgba(23, 23, 23, 0.06)',
        borderWidth: 2,
        pointRadius: rows.length > 50 ? 0 : 2,
        pointHoverRadius: 5,
        tension: 0.15
      },
      {
        type: 'line',
        label: '초기자산',
        data: rows.map(() => initialCash),
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
        backgroundColor: '#8c806b',
        borderColor: '#8c806b',
        pointStyle: 'rectRot',
        pointRadius: 7,
        pointHoverRadius: 9
      },
      {
        type: 'line',
        label: 'Drawdown',
        data: rows.map(day => toNumber(day.drawdownPct)),
        yAxisID: 'drawdown',
        borderColor: '#456b82',
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

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: isMobile ? 8 : 10,
          padding: isMobile ? 8 : 10,
          font: { size: isMobile ? 10 : 12 }
        }
      },
      tooltip: {
        callbacks: {
          label(context) {
            const raw = context.raw || {}
            if (raw.tradeSide) {
              return `${raw.tradeSide} ${raw.tier} · ${formatPrice(raw.y)} · ${formatInteger(raw.quantity)}주`
            }
            return `종가 ${formatPrice(context.parsed.y)}`
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

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: isMobile ? 8 : 10,
          padding: isMobile ? 8 : 10,
          font: { size: isMobile ? 10 : 12 }
        }
      },
      tooltip: {
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
        suggestedMax: 0,
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

const buyPlanColumns = [
  { name: 'tier', label: '티어', field: 'tier', align: 'left' },
  {
    name: 'orderType',
    label: '주문 방식',
    field: 'orderType',
    align: 'center'
  },
  {
    name: 'allocationAmount',
    label: '배정금액',
    field: 'allocationAmount',
    align: 'right'
  },
  { name: 'orderPrice', label: '주문가', field: 'orderPrice', align: 'right' },
  { name: 'quantity', label: '수량', field: 'quantity', align: 'right' }
]

const sellPlanColumns = [
  { name: 'tier', label: '티어', field: 'tier', align: 'left' },
  { name: 'quantity', label: '수량', field: 'quantity', align: 'right' },
  { name: 'orderPrice', label: '주문가', field: 'orderPrice', align: 'right' },
  {
    name: 'buySessionDate',
    label: '매수일',
    field: 'buySessionDate',
    align: 'center'
  },
  {
    name: 'holding',
    label: '보유/최대',
    field: row => `${row.heldSessionCount}/${row.maxHoldDays}일`,
    align: 'center'
  },
  { name: 'planType', label: '계획 유형', field: 'planType', align: 'center' }
]

const nextOrderColumns = [
  { name: 'tradeSide', label: '구분', field: 'tradeSide', align: 'left' },
  { name: 'tier', label: '티어', field: 'tier', align: 'left' },
  {
    name: 'orderType',
    label: '주문 방식',
    field: 'orderType',
    align: 'center'
  },
  {
    name: 'allocationAmount',
    label: '배정금액',
    field: 'allocationAmount',
    align: 'right'
  },
  { name: 'orderPrice', label: '주문가', field: 'orderPrice', align: 'right' },
  { name: 'quantity', label: '수량', field: 'quantity', align: 'right' }
]

const tierColumns = [
  { name: 'mode', label: '모드', field: 'mode', align: 'left' },
  { name: 'tier', label: '티어', field: 'tier', align: 'left' },
  { name: 'quantity', label: '수량', field: 'quantity', align: 'right' },
  {
    name: 'averageBuyPrice',
    label: '평균 매수가',
    field: 'averageBuyPrice',
    align: 'right'
  },
  {
    name: 'marketValue',
    label: '평가액',
    field: 'marketValue',
    align: 'right'
  },
  {
    name: 'unrealizedProfit',
    label: '미실현 손익',
    field: 'unrealizedProfit',
    align: 'right'
  },
  {
    name: 'unrealizedReturnPct',
    label: '미실현 수익률',
    field: 'unrealizedReturnPct',
    align: 'right'
  }
]

function getKstToday() {
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(
    dateParts.map(({ type, value }) => [type, value])
  )

  return `${values.year}-${values.month}-${values.day}`
}

function cloneAttackMode(mode) {
  return { ...mode }
}

function cloneDefenseMode(mode) {
  return { ...mode, tierBuyRatiosPct: [...mode.tierBuyRatiosPct] }
}

function checkPassword() {
  if (inputPassword.value === PAGE_PASSWORD) {
    isAuthenticated.value = true
    passwordError.value = false
    inputPassword.value = ''
    return
  }
  passwordError.value = true
}

function normalizeSymbol() {
  form.symbol = form.symbol.trim().toUpperCase()
}

function applyPreset(name) {
  if (!PRESETS[name]) return
  form.attackMode = cloneAttackMode(PRESETS[name].attackMode)
  form.defenseMode = cloneDefenseMode(COMMON_DEFENSE_MODE)
  selectedPreset.value = name
}

function markCustom() {
  if (selectedPreset.value !== CUSTOM_PRESET)
    selectedPreset.value = CUSTOM_PRESET
}

function handleDefenseSplitCount() {
  const count = Number(form.defenseMode.splitCount)
  if (Number.isInteger(count) && count > 0) {
    while (form.defenseMode.tierBuyRatiosPct.length < count) {
      form.defenseMode.tierBuyRatiosPct.push(0)
    }
    if (form.defenseMode.tierBuyRatiosPct.length > count) {
      form.defenseMode.tierBuyRatiosPct.splice(count)
    }
  }
  markCustom()
}

function buildPayload() {
  return {
    symbol: form.symbol.trim().toUpperCase(),
    startDate: form.startDate,
    targetDate: form.targetDate,
    initialAvailableCash: Number(form.initialAvailableCash),
    parameters: {
      commission_rate_pct: Number(form.commissionRatePct),
      attack_mode: {
        split_count: Number(form.attackMode.splitCount),
        holding_period_alpha: Number(form.attackMode.holdingPeriodAlpha),
        buy_condition_close_pct: Number(form.attackMode.buyConditionClosePct),
        sell_condition_alpha: Number(form.attackMode.sellConditionAlpha)
      },
      defense_mode: {
        split_count: Number(form.defenseMode.splitCount),
        holding_period: Number(form.defenseMode.holdingPeriod),
        buy_condition_1_ma_pct: Number(form.defenseMode.buyCondition1MaPct),
        buy_condition_2_close_pct: Number(
          form.defenseMode.buyCondition2ClosePct
        ),
        sell_condition_ma_pct: Number(form.defenseMode.sellConditionMaPct),
        ma_window: Number(form.defenseMode.maWindow),
        tier_buy_ratios_pct: form.defenseMode.tierBuyRatiosPct.map(Number)
      }
    }
  }
}

function loadMoreDailyRows() {
  visibleDailyCount.value += DAILY_HISTORY_PAGE_SIZE
}

async function runBacktest() {
  normalizeSymbol()
  showValidation.value = true
  submitError.value = ''
  if (validationErrors.value.length) return

  isLoading.value = true
  try {
    const { data } = await api.post(BACKTEST_URL, buildPayload())
    backtestResult.value = data
    visibleDailyCount.value = DAILY_HISTORY_PAGE_SIZE
    showValidation.value = false
    activeTab.value = 'status'
    $q.notify({
      type: 'positive',
      message: '백테스트가 완료되었습니다.',
      position: 'top'
    })
  } catch (error) {
    const responseMessage =
      error.response?.data?.message || error.response?.data?.error
    console.log(error.response)
    submitError.value =
      responseMessage || `백테스트 호출에 실패했습니다: ${error.message}`
    activeTab.value = 'settings'
  } finally {
    isLoading.value = false
  }
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value))
}

function isPositiveNumber(value) {
  return isFiniteNumber(value) && Number(value) > 0
}

function isNonNegativeNumber(value) {
  return isFiniteNumber(value) && Number(value) >= 0
}

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function formatNumber(value, maximumFractionDigits = 2) {
  const numericValue = toNumber(value)
  if (numericValue === null) return '-'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(
    numericValue
  )
}

function formatCompactNumber(value) {
  const numericValue = toNumber(value)
  if (numericValue === null) return '-'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(numericValue)
}

function formatMoney(value) {
  const numericValue = toNumber(value)
  if (numericValue === null) return '-'
  const currency = finalPortfolio.value.currency || 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue)
}

function formatPrice(value) {
  const numericValue = toNumber(value)
  if (numericValue === null) return '-'
  return `$${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue)}`
}

function formatInteger(value) {
  const numericValue = toNumber(value)
  if (numericValue === null) return '-'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    numericValue
  )
}

function formatPct(value, showSign = true) {
  const numericValue = toNumber(value)
  if (numericValue === null) return '-'
  const sign = showSign && numericValue > 0 ? '+' : ''
  return `${sign}${formatNumber(numericValue, 2)}%`
}

function profitClass(value) {
  const numericValue = toNumber(value)
  if (numericValue === null || numericValue === 0) return 'text-grey-8'
  return numericValue > 0 ? 'text-red-7' : 'text-blue-7'
}

function modeColor(mode) {
  if (mode === '공격') return 'amber-8'
  if (mode === '방어') return 'green-6'
  return 'grey-6'
}

function sideColor(side) {
  return side === 'BUY' ? 'red-7' : 'blue-7'
}
</script>

<style scoped>
.backtest-page {
  min-height: 100vh;
  background: #fafafa;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  min-height: 50px;
  padding-top: env(safe-area-inset-top);
}

.tabs-bar {
  position: sticky;
  top: calc(50px + env(safe-area-inset-top));
  z-index: 900;
  border-bottom: 1px solid #e0e0e0;
}

.auth-area {
  height: calc(100vh - 50px);
}

.auth-card {
  width: 310px;
  margin-bottom: 25vh;
}

.content-container {
  width: min(1120px, calc(100% - 24px));
  margin: 0 auto;
  padding: 16px 0 48px;
}

.settings-container {
  max-width: 900px;
}

.section-card {
  margin-bottom: 16px;
  background: white;
}

.section-heading {
  padding: 14px 16px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.ratio-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(90px, 1fr));
  gap: 10px;
}

.date-input.q-field--outlined.q-field--readonly
  :deep(.q-field__control::before) {
  border-style: solid;
}

.date-input :deep(.q-field__control),
.date-input :deep(.q-field__native) {
  cursor: pointer;
}

.metric-grid {
  display: grid;
  gap: 10px;
}

.summary-grid {
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 16px;
}

.compact-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card {
  min-width: 0;
  padding: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.metric-label {
  color: #757575;
  font-size: 12px;
}

.metric-value {
  margin-top: 5px;
  color: #424242;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.metric-caption {
  margin-top: 3px;
  color: #9e9e9e;
  font-size: 11px;
}

.mobile-data-card {
  padding: 12px;
}

.mobile-data-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mobile-data-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin-top: 12px;
}

.mobile-data-card__grid > div {
  min-width: 0;
}

.data-label {
  color: #9e9e9e;
  font-size: 11px;
}

.data-value {
  margin-top: 2px;
  color: #424242;
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 340px;
}

.daily-history {
  display: grid;
  gap: 6px;
}

.daily-history-item {
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
}

.daily-header,
.daily-row {
  display: grid;
  grid-template-columns: 1.1fr 0.65fr 0.75fr 1.1fr 0.65fr 0.5fr 0.5fr 1.05fr 0.75fr;
  gap: 8px;
  align-items: center;
}

.daily-header {
  padding: 10px 52px 10px 16px;
  color: #616161;
  font-size: 12px;
  font-weight: 700;
  background: #f5f5f5;
}

.daily-row {
  width: 100%;
  color: #424242;
  font-size: 13px;
}

.daily-cell {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-label {
  display: none;
}

.daily-mobile-summary {
  display: none;
}

.daily-detail {
  padding: 16px;
}

.detail-section + .detail-section {
  margin-top: 16px;
}

.detail-title {
  margin-bottom: 8px;
  color: #424242;
  font-size: 14px;
  font-weight: 700;
}

.detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  color: #616161;
  font-size: 13px;
}

.detail-note {
  margin-top: 6px;
  color: #757575;
  font-size: 13px;
}

.table-scroll {
  max-width: 100%;
  overflow-x: auto;
}

.empty-message {
  padding: 18px;
  color: #9e9e9e;
  text-align: center;
}

.run-button {
  height: 46px;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ratio-grid {
    grid-template-columns: repeat(3, minmax(90px, 1fr));
  }
}

@media (max-width: 599px) {
  .content-container {
    width: calc(100% - 16px);
    padding-top: 8px;
  }

  .summary-grid,
  .compact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-grid,
  .basic-settings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .ratio-grid {
    grid-template-columns: repeat(2, minmax(90px, 1fr));
  }

  .section-heading {
    padding: 12px;
  }

  .metric-card {
    padding: 12px;
  }

  .metric-value {
    font-size: 16px;
  }

  .chart-container {
    height: 300px;
  }

  .mobile-data-card__grid--three > :last-child {
    grid-column: 1 / -1;
  }

  .daily-desktop-summary {
    display: none;
  }

  .daily-header {
    display: none;
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
    color: #424242;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
  }

  .daily-mobile-summary__meta {
    margin-top: 4px;
    color: #9e9e9e;
    font-size: 11px;
  }

  .daily-detail {
    padding: 12px;
  }
}
</style>

<style scoped lang="scss">
.backtest-page {
  min-height: calc(100vh - 82px);
  background: var(--dk-paper);
  color: var(--dk-ink);
}

.auth-area {
  display: block;
  height: auto;
  min-height: calc(100vh - 82px);
  background: var(--dk-paper);
}

.auth-shell {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: center;
  min-height: calc(100vh - 82px);
  padding-block: clamp(72px, 8vw, 120px);
}

.auth-intro {
  grid-column: 1 / 8;

  h1 {
    margin: 38px 0 0;
    font-size: clamp(4.2rem, 7.5vw, 7.8rem);
    line-height: 1.02;
  }

  > p:not(.dk-eyebrow) {
    max-width: 440px;
    margin: 32px 0 0;
    color: var(--dk-muted);
    font-size: 0.82rem;
    line-height: 1.85;
  }

  &__meta {
    display: flex;
    gap: 32px;
    margin-top: 70px;
    color: var(--dk-muted);
    font-size: 0.56rem;
    letter-spacing: 0.12em;
  }
}

.auth-form {
  grid-column: 9 / 13;
  padding-top: 18px;
  border-top: 1px solid var(--dk-ink);
  animation-delay: 150ms;

  &__head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 46px;
    font-size: 0.56rem;
    letter-spacing: 0.13em;
  }

  &__button {
    height: 52px;
    margin-top: 12px;
    border-radius: 0;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
  }
}

.workspace-intro {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: end;
  padding-block: clamp(68px, 7vw, 105px) clamp(52px, 6vw, 86px);

  > div:first-child {
    grid-column: 1 / 8;
  }

  h1 {
    margin: 34px 0 0;
    font-size: clamp(4rem, 7vw, 7.5rem);
    line-height: 1.02;
  }

  &__note {
    grid-column: 9 / 13;
    padding-top: 18px;
    border-top: 1px solid var(--dk-line-strong);

    > p {
      margin: 24px 0 0;
      color: var(--dk-muted);
      font-size: 0.76rem;
      line-height: 1.8;
    }
  }

  &__status {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.56rem;
    letter-spacing: 0.13em;

    i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #486b52;
    }
  }
}

.tabs-bar {
  position: sticky;
  top: 82px;
  z-index: 4;
  min-height: 58px;
  border-block: 1px solid var(--dk-line);
  background: rgba(244, 241, 234, 0.94);
  color: var(--dk-muted);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  :deep(.q-tab) {
    min-height: 58px;
    font-size: 0.6rem;
    letter-spacing: 0.14em;
  }
}

:deep(.q-tab-panels),
:deep(.q-tab-panel) {
  background: transparent;
}

.content-container {
  width: min(1240px, calc(100% - (var(--dk-page-gutter) * 2)));
  padding: clamp(42px, 5vw, 76px) 0 clamp(80px, 8vw, 120px);
}

.settings-container {
  max-width: 1040px;
}

.section-card {
  overflow: hidden;
  margin-bottom: 42px;
  border: 0;
  border-top: 1px solid var(--dk-line-strong);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.section-heading {
  padding: 22px 0;

  :deep(.text-h6) {
    color: var(--dk-ink) !important;
    font-family: var(--dk-font-serif);
    font-size: 1.5rem;
    font-weight: 400;
  }

  :deep(.text-caption) {
    margin-top: 5px;
    color: var(--dk-muted) !important;
    font-size: 0.67rem;
    letter-spacing: 0.02em;
  }
}

.settings-grid {
  gap: 18px 20px;
  padding: 28px 0;
}

.ratio-grid {
  gap: 12px;
}

:deep(.q-separator) {
  background: var(--dk-line);
}

:deep(.q-field__control) {
  border-radius: 0;
  background: rgba(251, 250, 247, 0.72);
}

:deep(.q-field--outlined .q-field__control::before) {
  border-color: var(--dk-line);
}

:deep(.q-field--outlined.q-field--focused .q-field__control::after) {
  border-color: var(--dk-ink);
  border-width: 1px;
}

:deep(.q-field__label),
:deep(.q-field__native),
:deep(.q-field__prefix),
:deep(.q-field__suffix) {
  color: var(--dk-ink);
}

:deep(.q-expansion-item__container > .q-item) {
  min-height: 90px;
  padding-inline: 0;
}

:deep(.q-badge) {
  border-radius: 0;
  font-size: 0.6rem;
  letter-spacing: 0.04em;
}

:deep(.text-green-5),
:deep(.text-green-6),
:deep(.text-green-7),
:deep(.text-green-8) {
  color: var(--dk-ink) !important;
}

:deep(.bg-green-5),
:deep(.bg-green-6),
:deep(.bg-green-7),
:deep(.bg-green-8) {
  background: var(--dk-ink) !important;
}

.run-button {
  height: 58px;
  border-radius: 0;
  font-size: 0.64rem;
  letter-spacing: 0.15em;
}

.metric-grid {
  gap: 1px;
  background: var(--dk-line);
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 42px;
  border-block: 1px solid var(--dk-line);
}

.compact-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: transparent;
}

.metric-card {
  min-height: 114px;
  padding: 20px;
  border: 0;
  border-radius: 0;
  background: var(--dk-surface);
  box-shadow: none;
}

.metric-label,
.data-label {
  color: var(--dk-muted);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-value {
  margin-top: 18px;
  color: var(--dk-ink);
  font-family: var(--dk-font-serif);
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 400;
}

.metric-caption {
  color: var(--dk-muted);
}

.chart-container {
  height: 420px;
  padding: 24px 0;
}

:deep(.q-table__container) {
  border: 1px solid var(--dk-line);
  border-radius: 0;
  background: var(--dk-surface);
  box-shadow: none;
}

:deep(.q-table thead tr),
:deep(.q-table tbody td) {
  background: transparent;
}

:deep(.q-table th) {
  color: var(--dk-muted);
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.06em;
}

:deep(.q-table td) {
  color: var(--dk-ink);
  font-size: 0.72rem;
}

.daily-history {
  gap: 0;
  border-top: 1px solid var(--dk-line);
}

.daily-history-item {
  border: 0;
  border-bottom: 1px solid var(--dk-line);
  border-radius: 0;
  background: transparent;
}

.daily-header {
  background: var(--dk-surface);
  color: var(--dk-muted);
  font-size: 0.62rem;
  letter-spacing: 0.03em;
}

.daily-row,
.data-value,
.detail-title {
  color: var(--dk-ink);
}

.daily-detail {
  background: var(--dk-surface) !important;
}

.mobile-data-card {
  border-radius: 0;
  background: var(--dk-surface);
}

.empty-message {
  color: var(--dk-muted);
}

@media (max-width: 900px) {
  .auth-intro {
    grid-column: 1 / 7;
  }

  .auth-form {
    grid-column: 8 / 13;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .backtest-page {
    min-height: calc(100vh - 68px);
  }

  .auth-area,
  .auth-shell {
    min-height: calc(100vh - 68px);
  }

  .auth-shell,
  .workspace-intro {
    display: flex;
    flex-direction: column;
    gap: 74px;
    align-items: stretch;
  }

  .auth-intro h1,
  .workspace-intro h1 {
    font-size: clamp(3.8rem, 17vw, 5.5rem);
  }

  .auth-form {
    width: 100%;
  }

  .workspace-intro {
    padding-block: 64px;

    &__note {
      padding-top: 22px;
    }
  }

  .tabs-bar {
    top: 68px;
  }

  .content-container {
    width: calc(100% - (var(--dk-page-gutter) * 2));
    padding-top: 40px;
  }

  .settings-grid,
  .basic-settings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 10px;

    > * {
      min-width: 0;
    }
  }

  .summary-grid,
  .compact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card {
    min-height: 105px;
    padding: 16px;
  }

  .chart-container {
    height: 320px;
    padding-inline: 0;
  }

  .section-card {
    margin-bottom: 34px;
  }
}

@media (max-width: 420px) {
  .auth-intro__meta {
    display: grid;
    gap: 8px;
  }

  .summary-grid,
  .compact-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
