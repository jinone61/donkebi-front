import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import test from 'node:test'

const readSource = path =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const execFileAsync = promisify(execFile)

test('public navigation reflects the Donkebi agent story', async () => {
  const { navigationItems } = await import('../src/content/home.js')

  assert.deepEqual(
    navigationItems.map(item => item.label),
    ['SYSTEM', 'PRINCIPLE', 'ORIGIN', 'AGENT', 'BACKTEST']
  )
  assert.deepEqual(
    navigationItems.filter(item => item.to),
    [
      { label: 'AGENT', to: '/agent' },
      { label: 'BACKTEST', to: '/backtest' }
    ]
  )
})

test('package metadata describes the AI agent trading product', async () => {
  const packageJson = JSON.parse(await readSource('package.json'))

  assert.equal(
    packageJson.description,
    'Quiet AI agent trading system for strategy backtesting and execution'
  )
  assert.equal(
    packageJson.scripts.deploy,
    'aws s3 sync ./dist/spa/ s3://donkebi-web --delete'
  )
})

test('home presents the quiet AI trading agent narrative', async () => {
  const source = await readSource('src/pages/index/(home).vue')

  assert.match(source, /돈 나와라 와라,<br \/>뚝딱\./)
  assert.match(
    source,
    /\.hero \{[\s\S]*?h1 \{[\s\S]*?font-size: clamp\(3\.5rem, 6\.5vw, 7rem\);/
  )
  assert.match(
    source,
    /@media \(max-width: 767px\)[\s\S]*?\.hero \{[\s\S]*?h1 \{[\s\S]*?font-size: clamp\(2\.5rem, 12\.5vw, 4\.6rem\);/
  )
  for (const sectionId of ['system', 'backtest', 'principle', 'origin']) {
    assert.match(source, new RegExp(`id="${sectionId}"`))
  }
})

test('home backtest links target the registered backtest route', async () => {
  const source = await readSource('src/pages/index/(home).vue')
  const routeTargets = [
    ...source.matchAll(/<router-link[^>]*to="([^"]+)"/g)
  ].map(match => match[1])

  assert.deepEqual(routeTargets, ['/backtest', '/backtest', '/backtest'])
})

test('mobile system descriptions use the available content width', async () => {
  const source = await readSource('src/pages/index/(home).vue')

  assert.match(
    source,
    /@media \(max-width: 767px\)[\s\S]*?\.agent-cycle[\s\S]*?p \{[\s\S]*?max-width: none;/
  )
})

test('home principle matches the Shannon heading type scale', async () => {
  const source = await readSource('src/pages/index/(home).vue')

  assert.match(
    source,
    /\.principle \{[\s\S]*?blockquote \{[^}]*font-size: clamp\(3\.1rem, 5\.7vw, 6rem\);[^}]*\}/
  )
  assert.doesNotMatch(source, /clamp\(3\.5rem, 15vw, 5rem\)/)
})

test('home backtest story contrasts the market with Donkebi', async () => {
  const source = await readSource('src/pages/index/(home).vue')
  const normalizedSource = source.replace(/\s+/g, ' ')

  assert.match(source, /AI driven,<br \/>Real-world magic\./)
  assert.match(
    normalizedSource,
    /AI\. 기술과 경험의 정점에서,\s*<br\s*\/?>시장의 불확실성을 자산으로 바꾸는 현대의 마법을 경험하세요\./
  )
  assert.match(source, /backtest-plate__line--market/)
  assert.match(source, /backtest-plate__line--donkebi/)
  assert.match(source, />MARKET<\/span/)
  assert.match(source, />ASSET<\/span/)
  assert.match(
    source,
    /backtest-plate__line--market"[\s\S]*?d="M0 188[\s\S]*?620 125"/
  )
  assert.match(
    source,
    /backtest-plate__line--donkebi"[\s\S]*?d="M0 188[\s\S]*?620 28"/
  )
  assert.match(source, /backtest-plate__marker--asset/)
  assert.match(source, /backtest-plate__marker--market/)
  assert.match(
    source,
    /&--asset \{[\s\S]*?top: calc\(11\.2% - 3\.5px\);[\s\S]*?right: -3\.5px;/
  )
  assert.match(
    source,
    /&--market \{[\s\S]*?stroke: rgba\(244, 241, 234, 0\.48\);[\s\S]*?stroke-width: 1\.2;/
  )
  assert.match(
    source,
    /&--market \{[\s\S]*?top: calc\(50% - 3\.5px\);[\s\S]*?right: -3\.5px;[\s\S]*?background: rgba\(244, 241, 234, 0\.5\);/
  )
  assert.match(
    source,
    /&--market \{[\s\S]*?top: calc\(50% \+ 8px\);[\s\S]*?background: transparent;/
  )
})

test('backtest route renders the editable workspace component', async () => {
  const source = await readSource('src/pages/index/backtest.vue')

  assert.match(
    source,
    /import BacktestPage from '@\/components\/backtest\/BacktestPage\.vue'/
  )
  assert.match(source, /<BacktestPage\s*\/>/)
})

test('agent route renders the independent operation workspace', async () => {
  const source = await readSource('src/pages/index/agent.vue')

  assert.match(
    source,
    /import AgentPage from '@\/components\/agent\/AgentPage\.vue'/
  )
  assert.match(source, /<AgentPage\s*\/>/)
})

test('editable backtest workspace combines Donkebi branding with Korean task labels', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')

  assert.match(source, /Private Access Only/)
  assert.match(source, /Donkebi<br \/>Backtest\./)
  assert.match(source, /Backtest · Agent 01/)
  assert.match(source, /Strategy backtest\./)
  assert.match(source, /같은 전략을 과거의 시장 위에서 다시 실행합니다\./)
  assert.match(source, /SYSTEM READY/)
  assert.match(source, /label="입력설정"/)
  assert.match(source, /label="현황"/)
  assert.match(source, /label="주문계획"/)
})

test('editable backtest workspace carries the latest range tools without a duplicate header', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')

  assert.match(source, /chart-range-card/)
  assert.match(source, /chart-range-presets/)
  assert.match(source, /chart-range-slider/)
  assert.doesNotMatch(source, /class="[^"]*sticky-header/)
  assert.doesNotMatch(source, /inject\('toggleMenu'\)/)
})

test('mobile setup balances compact and long-form settings', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')
  const mobileStyles = source.match(
    /@media \(max-width: 599px\) \{[\s\S]*\n\}/
  )?.[0]

  assert.ok(mobileStyles)
  assert.match(
    mobileStyles,
    /\.settings-grid \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/
  )
  assert.match(
    mobileStyles,
    /\.basic-settings-grid \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/
  )
})

test('mobile chart range controls group start and end adjustments by column', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')
  const mobileStyles = source.match(
    /@media \(max-width: 599px\) \{[\s\S]*\n\}/
  )?.[0]

  assert.ok(mobileStyles)
  assert.match(
    mobileStyles,
    /\.chart-range-adjustments \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?grid-template-rows: repeat\(2, auto\);[\s\S]*?grid-auto-flow: column;/
  )
})

test('performance cards adapt to available width instead of fixed column counts', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')
  const tabletStyles = source.slice(
    source.indexOf('@media (max-width: 900px)'),
    source.indexOf('@media (max-width: 767px)')
  )

  assert.match(
    source,
    /\.summary-grid \{[\s\S]*?--summary-card-min: 220px;[\s\S]*?grid-template-columns:\s*repeat\(\s*auto-fit,\s*minmax\(min\(100%, var\(--summary-card-min\)\), 1fr\)\s*\);/
  )
  assert.match(
    source,
    /@media \(max-width: 599px\)[\s\S]*?\.summary-grid \{[\s\S]*?--summary-card-min: 150px;/
  )
  assert.doesNotMatch(tabletStyles, /\.summary-grid/)
})

test('daily history uses dense desktop rows and touch-safe mobile rows', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')

  assert.match(source, /\.daily-history \{[\s\S]*?gap: 2px;/)
  assert.match(
    source,
    /:deep\(\.daily-item-header\) \{[\s\S]*?min-height: 38px;[\s\S]*?padding: 3px 12px;/
  )
  assert.match(
    source,
    /@media \(max-width: 599px\)[\s\S]*?:deep\(\.daily-item-header\) \{[\s\S]*?min-height: 48px;[\s\S]*?padding: 8px 12px;/
  )
})

test('daily order details show buy price instead of canceled quantity', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')
  const orderDetail = source.slice(
    source.indexOf('<div class="detail-title">주문 및 체결</div>'),
    source.indexOf('<div class="detail-title">현금 흐름</div>')
  )

  assert.match(orderDetail, /주문수량[\s\S]*매수가[\s\S]*체결가[\s\S]*체결수량/)
  assert.match(orderDetail, /formatPrice\(row\.buyPrice\)/)
  assert.doesNotMatch(orderDetail, /취소수량|canceledQuantity/)
})

test('agent workspace owns its strategy result API and normalization', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(source, /const STRATEGY_ID = 1/)
  assert.match(
    source,
    /const AGENT_RESULT_URL = '\/api\/dualsniper\/strategies\/results'/
  )
  assert.match(
    source,
    /api\.get\(\s*AGENT_RESULT_URL,\s*\{\s*params:\s*\{\s*strategyId:\s*STRATEGY_ID\s*\}\s*\}\s*\)/
  )
  assert.match(source, /day\.plan\?\.orders/)
  assert.match(
    source,
    /submittedOrderCount: orders\.filter\(order => order\.submission\)\.length/
  )
  assert.match(source, /order\.execution\?\.price/)
  assert.match(source, /order\.execution\?\.quantity/)
  assert.match(source, /day\.cash\?\.transactions/)
})

test('agent daily history distinguishes submitted orders and executions', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')
  const history = source.slice(
    source.indexOf('aria-labelledby="agent-history-title"'),
    source.indexOf('<script setup>')
  )

  assert.match(history, /<span>주문<\/span[\s\S]*?><span>체결<\/span>/)
  assert.doesNotMatch(history, /<span>계획<\/span/)
  assert.match(
    history,
    /주문 \{\{ day\.submittedOrderCount \}\} · 체결[\s\S]*?\{\{ day\.executions\.length \}\}/
  )
  assert.match(
    history,
    /주문 실행일[\s\S]*?생성 기준일[\s\S]*?모드[\s\S]*?매수가[\s\S]*?결과 반영[\s\S]*?Broker/
  )
  assert.match(
    history,
    /plan-summary-table[\s\S]*?day\.plan\?\.targetDate[\s\S]*?day\.plan\?\.basisDate[\s\S]*?day\.mode[\s\S]*?day\.plan\?\.buyPrice[\s\S]*?day\.plan\?\.completionStatus[\s\S]*?day\.submissionMode/
  )
  assert.match(history, /<div class="detail-title">계획<\/div>/)
  assert.doesNotMatch(history, /<div class="detail-title">당일 계획<\/div>/)
  assert.match(
    history,
    /text-left">주문 실행일[\s\S]*?text-left">생성 기준일[\s\S]*?text-left">모드[\s\S]*?text-right">매수가[\s\S]*?text-right">결과 반영[\s\S]*?text-right">Broker/
  )
  assert.match(
    source,
    /@media \(max-width: 767px\)[\s\S]*?:deep\(\.plan-summary-table th\),[\s\S]*?:deep\(\.plan-summary-table td\) \{\s*padding: 4px 2px;/
  )
  assert.match(
    source,
    /orders\.map\(order => order\.submission\?\.mode\)\.filter\(Boolean\)/
  )
  assert.match(
    source,
    /submissionMode:\s*submissionMode \|\| day\.plan\?\.completionSource \|\| '-'/
  )
})

test('agent daily order headers align with their data columns', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')
  const orderTable = source.slice(
    source.indexOf('<div class="detail-title">주문 및 체결</div>'),
    source.indexOf('<div class="detail-title">현금 흐름</div>')
  )

  assert.match(
    orderTable,
    /text-left">구분[\s\S]*?text-left">티어[\s\S]*?text-left">유형[\s\S]*?text-right">수량[\s\S]*?daily-submission-status[\s\S]*?제출 상태[\s\S]*?text-left">Broker ID[\s\S]*?text-right">주문가[\s\S]*?text-right">체결가[\s\S]*?text-right">체결수량/
  )
  assert.match(
    orderTable,
    /<td class="daily-submission-status">[\s\S]*?order\.submission\?\.status/
  )
  assert.match(
    source,
    /@media \(max-width: 767px\)[\s\S]*?:deep\(\.daily-submission-status\) \{\s*display: none;/
  )
})

test('agent operation follows the status API in descending id order', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(
    source,
    /const OPERATION_STATUS_URL = '\/api\/dualsniper\/operations\/status'/
  )
  assert.match(
    source,
    /api\.get\(OPERATION_STATUS_URL, \{\s*params: \{ strategyId: STRATEGY_ID \}\s*\}\)/
  )
  assert.match(
    source,
    /const OPERATION_PHASES = \[[\s\S]*?jobType: 'PREPARE', label: 'Prepare',[\s\S]*?jobType: 'APPLY',[\s\S]*?jobType: 'PLAN',[\s\S]*?jobType: 'SUBMIT'/
  )
  assert.match(source, /function normalizeOperationResult\(result = \{\}\)/)
  assert.match(source, /isMissing: !job/)
  assert.match(
    source,
    /function getMostFrequentOperationTime\(jobs, jobType\)[\s\S]*?job\.jobType === jobType[\s\S]*?operationTimeMinute\(job\.startedAt\)[\s\S]*?rightCount - leftCount/
  )
  assert.match(
    source,
    /estimatedTime: !job \? estimatedTimes\[phase\.jobType\] : null/
  )
  assert.match(
    source,
    /slide\.estimatedTime[\s\S]*?`\$\{slide\.estimatedTime\} 예정`[\s\S]*?'아직 기록 없음'/
  )
  assert.match(
    source,
    /if \(slide\.jobType === 'PREPARE'\) \{\s*return `세션 \$\{formatInteger\(details\.completedSessionCount\)\} · 종가 \$\{formatClosePrice\(details\.closePrice\)\}`/
  )
  assert.match(
    source,
    /if \(slide\.jobType === 'PLAN'\) \{[\s\S]*?regularPlanCount\(orders\)[\s\S]*?return `계획 \$\{orders\.length\}건 · 대상 \$\{targetCount\}건`/
  )
  assert.match(
    source,
    /slide\.jobType === 'PLAN'[\s\S]*?계획 기준일[\s\S]*?details\?\.basisDate[\s\S]*?주문 대상일[\s\S]*?slide\.targetDate[\s\S]*?모드[\s\S]*?details\?\.mode[\s\S]*?주문 계획[\s\S]*?orders[\s\S]*?대상[\s\S]*?regularPlanCount[\s\S]*?매수가[\s\S]*?details\?\.buyPrice/
  )
  assert.match(
    source,
    /function regularPlanCount\(orders = \[\]\)[\s\S]*?order\.planType[\s\S]*?=== 'REGULAR'/
  )
  assert.match(
    source,
    /계획 기준일[\s\S]*?slide\.job\.details\?\.calculatedThroughDate[\s\S]*?주문 대상일[\s\S]*?slide\.targetDate[\s\S]*?완료 세션[\s\S]*?slide\.job\.details\?\.completedSessionCount[\s\S]*?종가[\s\S]*?slide\.job\.details\?\.closePrice/
  )
  assert.match(
    source,
    /MA 3[\s\S]*?MA 5[\s\S]*?MA Spread[\s\S]*?formatMaTrend\(slide\.job\.details\)/
  )
  assert.match(
    source,
    /slide\.jobType === 'APPLY'[\s\S]*?적용 거래일[\s\S]*?체결[\s\S]*?executions[\s\S]*?종가[\s\S]*?details\?\.closePrice[\s\S]*?총자산[\s\S]*?현금[\s\S]*?details\?\.availableCash[\s\S]*?formatCashRatio\(slide\.job\.details\)[\s\S]*?보유 수량[\s\S]*?details\?\.managedQuantity/
  )
  assert.match(source, /slide\.jobType === 'APPLY'[\s\S]*?<h4>체결 내역<\/h4>/)
  assert.match(
    source,
    /slide\.jobType === 'APPLY'[\s\S]*?text-left">구분[\s\S]*?text-left">티어[\s\S]*?text-left">주문 유형[\s\S]*?text-right">주문가[\s\S]*?text-right">체결가[\s\S]*?text-right">수량[\s\S]*?text-right"[\s\S]*?>Broker ID/
  )
  assert.match(
    source,
    /function formatCashRatio\(details = \{\}\)[\s\S]*?availableCash \/ totalAsset[\s\S]*?formatPct[\s\S]*?false/
  )
  assert.match(
    source,
    /\.operation-cash-value[\s\S]*?small \{[\s\S]*?color: var\(--dk-muted\)[\s\S]*?font-weight: 500/
  )
  assert.match(
    source,
    /class="operation-side"[\s\S]*?:class="[\s\S]*?sideClass\(execution\.tradeSide\)[\s\S]*?"[\s\S]*?sideLabel\(execution\.tradeSide\)/
  )
  assert.match(
    source,
    /`mobile-\$\{execution\.executionId\}`[\s\S]*?<dl>[\s\S]*?Tier[\s\S]*?execution\.tier[\s\S]*?수량[\s\S]*?execution\.quantity[\s\S]*?주문 유형[\s\S]*?execution\.orderType[\s\S]*?주문가[\s\S]*?execution\.orderPrice[\s\S]*?체결가[\s\S]*?execution\.fillPrice[\s\S]*?Broker ID[\s\S]*?execution\.brokerOrderId/
  )
  assert.match(
    source,
    /operation-mobile-rows operation-mobile-rows--three-columns[\s\S]*?\.operation-mobile-rows--three-columns[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/
  )
  assert.match(
    source,
    /function sideClass\(side\)[\s\S]*?operation-side--buy[\s\S]*?operation-side--sell/
  )
  assert.match(
    source,
    /slide\.jobType === 'PLAN'[\s\S]*?<h4>주문 계획<\/h4>[\s\S]*?sideClass\(order\.tradeSide\)[\s\S]*?operation-mobile-rows--three-columns[\s\S]*?`mobile-\$\{order\.orderId\}`[\s\S]*?<dl>[\s\S]*?Tier[\s\S]*?order\.tier[\s\S]*?수량[\s\S]*?order\.quantity[\s\S]*?주문 유형[\s\S]*?order\.orderType[\s\S]*?order\.planType/
  )
  assert.match(
    source,
    /text-left">구분[\s\S]*?text-left">티어[\s\S]*?text-left">주문 유형[\s\S]*?text-left">상태[\s\S]*?text-right">주문가[\s\S]*?text-right">매수가[\s\S]*?text-right">수량[\s\S]*?text-right">배정 금액[\s\S]*?text-right"[\s\S]*?>보유 기간/
  )
  assert.match(
    source,
    /order\.tier[\s\S]*?<\/td[\s\S]*?order\.orderType[\s\S]*?<\/td[\s\S]*?order\.planType/
  )
  assert.match(
    source,
    /formatPrice\(order\.orderPrice, 2\)[\s\S]*?order\.tradeSide === 'BUY'[\s\S]*?\? '-'[\s\S]*?: formatPrice\(order\.buyPrice, 2\)/
  )
  assert.match(
    source,
    /`mobile-\$\{order\.orderId\}`[\s\S]*?주문가[\s\S]*?formatPrice\(order\.orderPrice, 2\)[\s\S]*?매수가[\s\S]*?order\.tradeSide === 'BUY'[\s\S]*?\? '-'[\s\S]*?formatPrice\(order\.buyPrice, 2\)[\s\S]*?보유 기간[\s\S]*?order\.heldSessionCount/
  )
  assert.match(
    source,
    /function formatPrice\(value, minimumFractionDigits = 0\)[\s\S]*?minimumFractionDigits,[\s\S]*?maximumFractionDigits: 2/
  )
  assert.match(
    source,
    /주문 대상일[\s\S]*?<span>주문<\/span[\s\S]*?totalSubmissionCount\(slide\.job\.details\)[\s\S]*?<span>Broker<\/span[\s\S]*?summarizeSubmissionValues[\s\S]*?'submissionMode'/
  )
  assert.match(
    source,
    /<h4>제출 내역<\/h4>[\s\S]*?text-left">구분[\s\S]*?text-left">티어[\s\S]*?text-left">주문 유형[\s\S]*?text-left">제출 방식[\s\S]*?text-left">상태[\s\S]*?text-right">주문가[\s\S]*?text-right">수량[\s\S]*?text-right"[\s\S]*?>Broker ID/
  )
  assert.match(
    source,
    /`mobile-\$\{submission\.submissionId\}`[\s\S]*?sideClass\(submission\.tradeSide\)[\s\S]*?<dl>[\s\S]*?Tier[\s\S]*?submission\.tier[\s\S]*?수량[\s\S]*?submission\.quantity[\s\S]*?주문 유형[\s\S]*?submission\.orderType[\s\S]*?주문가[\s\S]*?submission\.orderPrice[\s\S]*?상태[\s\S]*?submission\.status[\s\S]*?Broker ID[\s\S]*?submission\.brokerOrderId/
  )
  assert.match(
    source,
    /function totalSubmissionCount[\s\S]*?function summarizeSubmissionValues/
  )
  assert.doesNotMatch(source, /brokerFinalStatus/)
  assert.match(source, /return `제출 \$\{totalSubmissionCount\(details\)\}건`/)
  assert.doesNotMatch(source, /function brokerSubmissionCount/)
  assert.match(
    source,
    /\.operation-side--buy[\s\S]*?var\(--agent-accent-soft\)[\s\S]*?\.operation-side--sell[\s\S]*?rgba\(157, 74, 63, 0\.09\)/
  )
  assert.doesNotMatch(
    source,
    /slide\.jobType === 'APPLY'[\s\S]{0,2000}?<span>주문 계획<\/span/
  )
  assert.match(
    source,
    /function maTrendPercent\(details = \{\}\)[\s\S]*?\(ma3 - ma5\) \/ Math\.abs\(ma5\)[\s\S]*?function formatMaTrend\(details\)[\s\S]*?return formatPct\(percent\)/
  )
  assert.match(source, /function getInitialExpandedOperationIds\(\)/)
  assert.match(
    source,
    /function compareOperationSlidesByIdDesc\(left, right\)[\s\S]*?return rightId - leftId/
  )
  assert.match(
    source,
    /const missingComesFirst = missingSlide\.phaseIndex > recordedSlide\.phaseIndex/
  )
  assert.match(source, /\.sort\(compareOperationSlidesByIdDesc\)/)
  assert.match(source, /isDateStart: index === 0/)
  assert.match(
    source,
    /\.operation-status \{[\s\S]*?min-width: 68px;[\s\S]*?text-align: center;/
  )
})

test('agent workspace separates live operation from performance', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')
  const operationPanel = source.slice(
    source.indexOf('v-show="activeTab === \'operation\'"'),
    source.indexOf('v-show="activeTab === \'performance\'"')
  )
  const performancePanel = source.slice(
    source.indexOf('v-show="activeTab === \'performance\'"'),
    source.indexOf('</div>', source.indexOf('</main>'))
  )

  assert.match(source, /Private Access Only/)
  assert.match(source, /Donkebi<br \/>Agent\./)
  assert.match(source, /Donkebi, at work\./)
  assert.match(source, /const activeTab = ref\('operation'\)/)
  assert.match(source, /<q-tab name="operation" label="OPERATION" \/>/)
  assert.match(source, /<q-tab name="performance" label="PERFORMANCE" \/>/)
  assert.match(operationPanel, /class="operation-list"/)
  assert.match(operationPanel, /<q-slide-transition>/)
  assert.match(
    operationPanel,
    /Donkebi Agent가 시장을 관찰하고 행동한 기록을 확인합니다\./
  )
  assert.match(performancePanel, /class="agent-overview"/)
  assert.match(performancePanel, /class="agent-charts"/)
  assert.match(performancePanel, /class="section-card agent-history"/)
  assert.doesNotMatch(source, /import Agent(?:Overview|Charts|History)/)
})

test('agent operation avoids nested and mobile horizontal scrolling', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.doesNotMatch(source, /<q-tab-panels|<q-tab-panel/)
  assert.match(
    source,
    /\.agent-tab-panels,[\s\S]*?\.agent-tab-panel \{[\s\S]*?overflow: visible;/
  )
  assert.equal(
    (source.match(/class="operation-desktop-table"/g) || []).length,
    3
  )
  assert.equal(
    (source.match(/class="operation-mobile-rows(?: [^"]+)?"/g) || []).length,
    3
  )
  assert.match(
    source,
    /@media \(max-width: 767px\)[\s\S]*?\.operation-table-scroll \{[\s\S]*?overflow: visible;/
  )
  assert.match(
    source,
    /:deep\(\.operation-desktop-table\) \{[\s\S]*?display: none;/
  )
  assert.match(
    source,
    /\.operation-mobile-rows \{[\s\S]*?display: grid;[\s\S]*?overflow-wrap: anywhere;/
  )
  assert.match(
    source,
    /<dt>매수가[\s\S]*?order\.tradeSide === 'BUY'[\s\S]*?\? '-'[\s\S]*?: formatPrice\(order\.buyPrice, 2\)/
  )
  assert.match(
    source,
    /&:last-child:nth-child\(odd\) \{[\s\S]*?grid-column: 1 \/ -1;/
  )
})

test('agent tabs use the backtest navigation treatment', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(
    source,
    /\.tabs-bar \{[\s\S]*?position: sticky;[\s\S]*?top: 82px;[\s\S]*?min-height: 52px;[\s\S]*?border-block: 1px solid var\(--dk-line\);[\s\S]*?backdrop-filter: blur\(4px\);/
  )
  assert.match(
    source,
    /:deep\(\.q-tab\) \{[\s\S]*?min-height: 52px;[\s\S]*?font-size: 0\.68rem;/
  )
})

test('agent refresh sits beside the update time as an icon-only action', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')
  const updateRow = source.slice(
    source.indexOf('<div class="workspace-intro__update">'),
    source.indexOf('</div>', source.indexOf('class="workspace-intro__refresh"'))
  )

  assert.match(updateRow, /UPDATED · \{\{ formatDateTime\(lastUpdatedAt\) \}\}/)
  assert.match(updateRow, /icon="refresh"/)
  assert.match(updateRow, /round/)
  assert.match(updateRow, /aria-label="새로고침"/)
  assert.doesNotMatch(updateRow, /\n\s+label="새로고침"/)
  assert.match(
    source,
    /\.workspace-intro__update \{[\s\S]*?width: 100%;[\s\S]*?justify-content: flex-start;[\s\S]*?gap: 6px;/
  )
})

test('agent page covers current status charts and operation history', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(source, /MODE TRANSITION/)
  assert.match(source, /주문 계획/)
  assert.match(source, /제출 내역/)
  assert.match(source, /가격 및 체결/)
  assert.match(source, /포트폴리오 성과/)
  assert.match(source, /chart-range-adjustments/)
  assert.match(source, /일별 운영 기록/)
  assert.match(source, /submission\?\.brokerOrderId/)
  assert.match(source, /order\.executionPrice/)
  assert.match(source, /DAILY_HISTORY_PAGE_SIZE = 30/)
  assert.match(
    source,
    /const currentTiers = computed\(\(\) => finalPortfolio\.value\.tiers \|\| \[\]\)/
  )
  assert.match(source, /<h3 id="current-tiers-title">현재 Tier<\/h3>/)
  assert.match(source, /v-for="tier in currentTiers"/)
  assert.match(source, /평균 매수가/)
  assert.match(source, /<dt>수익률<\/dt>/)
  assert.match(source, /일별 운영 내역/)
  assert.match(source, /class="daily-header desktop-only"/)
  assert.match(source, /class="daily-row daily-desktop-summary"/)
  assert.match(source, /class="daily-mobile-summary"/)
  assert.match(
    source,
    /class="daily-mobile-summary__cash"[\s\S]*?formatMoney\(day\.closingCash\)/
  )
  assert.match(
    source,
    /\.daily-mobile-summary__cash \{[\s\S]*?font-size: 12px;[\s\S]*?font-weight: 500;/
  )
  assert.match(source, /expand-icon-class="daily-expand-section"/)
  assert.match(
    source,
    /\.daily-history-item :deep\(\.daily-expand-section\) \{[\s\S]*?width: 22px;[\s\S]*?padding-top: 7px;[\s\S]*?padding-left: 6px;[\s\S]*?justify-content: flex-start;/
  )
  assert.match(
    source,
    /\.daily-close-badge \{[\s\S]*?background: rgba\(23, 23, 23, 0\.045\) !important;[\s\S]*?color: var\(--dk-muted\) !important;/
  )
  assert.match(
    source,
    /function formatClosePrice\(value\)[\s\S]*?minimumFractionDigits: 2,[\s\S]*?maximumFractionDigits: 2/
  )
  assert.match(source, /:label="formatClosePrice\(day\.closePrice\)"/)
  assert.match(source, /group="daily-results"/)
  assert.match(source, /class="daily-detail bg-grey-1"/)
  assert.match(
    source,
    /유형[\s\S]*?수량[\s\S]*?제출 상태[\s\S]*?Broker ID[\s\S]*?주문가[\s\S]*?체결가[\s\S]*?체결수량/
  )
  assert.match(
    source,
    /shortTypeLabel\(order\.orderType\)[\s\S]*?shortTypeLabel\(order\.planType\)/
  )
  assert.match(
    source,
    /@media \(max-width: 767px\)[\s\S]*?\.current-tiers__grid > article \{[\s\S]*?grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/
  )
})

test('agent summary cards use the compact readable backtest treatment', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')
  const summaryStyles = source.slice(
    source.indexOf('.summary-grid {'),
    source.indexOf('.current-tiers {')
  )

  assert.match(summaryStyles, /gap: 10px;/)
  assert.match(summaryStyles, /padding: 10px 14px;/)
  assert.match(summaryStyles, /border: 1px solid var\(--dk-line\);/)
  assert.match(summaryStyles, /background: var\(--dk-surface\);/)
  assert.match(summaryStyles, /font-size: 18px;/)
  assert.match(summaryStyles, /font-weight: 650;/)
  assert.match(summaryStyles, /text-align: center;/)
  assert.doesNotMatch(summaryStyles, /min-height: 130px/)
  assert.doesNotMatch(summaryStyles, /font-family: var\(--dk-font-serif\)/)
})

test('agent operation flows with the page and starts with every job closed', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(
    source,
    /function getInitialExpandedOperationIds\(\) \{\s*return \[\]\s*\}/
  )
  assert.doesNotMatch(source, /INITIAL_EXPANDED_OPERATION_COUNT/)
  assert.match(source, /v-show="isOperationExpanded\(slide\.id\)"/)
  assert.match(source, /@click="toggleOperation\(slide\.id\)"/)
  assert.match(
    source,
    /@keydown\.enter\.prevent="toggleOperation\(slide\.id\)"/
  )
  assert.match(source, /\.operation-list \{[\s\S]*?display: grid;/)
  assert.doesNotMatch(source, /overflow-y: auto|scroll-snap-type/)
  assert.match(
    source,
    /\.operation-card__head \{[\s\S]*?min-height: 72px;[\s\S]*?padding: 9px 12px;/
  )
  assert.match(
    source,
    /\.operation-card__body \{[\s\S]*?padding: 10px 12px 12px;/
  )
})

test('agent loads and refreshes operation and performance independently', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(source, /checkPassword\(\)[\s\S]*?fetchOperationResult\(\)/)
  assert.match(
    source,
    /watch\(activeTab,[\s\S]*?tab === 'performance'[\s\S]*?!agentResult\.value[\s\S]*?fetchAgentResult\(\)/
  )
  assert.match(
    source,
    /function refreshActiveTab\(\)[\s\S]*?activeTab\.value === 'operation'[\s\S]*?fetchOperationResult\(\)[\s\S]*?fetchAgentResult\(\)/
  )
  assert.match(source, /@click="refreshActiveTab"/)
})

test('agent data workspace follows the backtest layout system', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(
    source,
    /\.content-container \{[\s\S]*?width: min\(1120px, calc\(100% - 24px\)\);[\s\S]*?padding: 24px 0 56px;/
  )
  assert.match(
    source,
    /\.agent-operation,[\s\S]*?\.agent-charts \{[\s\S]*?padding: 0;[\s\S]*?border: 0;/
  )
  assert.match(
    source,
    /\.section-heading \{[\s\S]*?padding: 14px 16px;[\s\S]*?border: 1px solid var\(--dk-line\);[\s\S]*?background: var\(--dk-surface\);/
  )
  assert.match(
    source,
    /\.section-heading[\s\S]*?h2 \{[\s\S]*?font-size: 1\.22rem;/
  )
  assert.match(
    source,
    /\.charts-grid \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);[\s\S]*?gap: 16px;/
  )
  assert.match(
    source,
    /:deep\(\.daily-item-header\) \{[\s\S]*?min-height: 38px;[\s\S]*?padding: 3px 12px;/
  )
  assert.match(
    source,
    /\.agent-operation > \.section-heading \{[\s\S]*?margin-bottom: 22px;/
  )
  assert.match(
    source,
    /\.current-tiers__grid \{[\s\S]*?grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 300px\), 1fr\)\);/
  )
  assert.match(
    source,
    /\.daily-header,[\s\S]*?\.daily-row \{[\s\S]*?grid-template-columns: 1\.1fr 0\.65fr 0\.75fr 1\.1fr 0\.65fr 0\.5fr 0\.5fr 1\.05fr 0\.75fr;/
  )
  assert.match(
    source,
    /\.daily-mobile-summary__values \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/
  )
})

test('agent charts share the backtest hover guide experience', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(source, /id: 'agentChartRangeGuide'/)
  assert.match(source, /afterDatasetsDraw\(chart, _args, options\)/)
  assert.match(source, /onHover: updateChartHover/)
  assert.match(source, /hoverDate: chartHoverDate\.value/)
  assert.match(source, /ref="priceChartComponent"/)
  assert.match(source, /ref="performanceChartComponent"/)
  assert.match(source, /syncChartTooltips\(nextDate, chartComponents\)/)
  assert.equal((source.match(/@mouseleave="clearChartHover"/g) || []).length, 2)
})

test('agent charts match the backtest card and color system', async () => {
  const source = await readSource('src/components/agent/AgentPage.vue')

  assert.match(source, /class="section-card chart-range-card"/)
  assert.equal((source.match(/class="chart-container"/g) || []).length, 2)
  assert.match(source, /toggle-color="grey-7"/)
  assert.match(source, /color="grey-6"/)
  assert.match(source, /label-color="grey-7"/)
  assert.match(
    source,
    /\.chart-range-presets \{[\s\S]*?width: min\(100%, 520px\);[\s\S]*?margin-bottom: 8px;[\s\S]*?grid-template-columns: repeat\(5, minmax\(0, 1fr\)\);/
  )
  assert.match(source, /\.chart-range-presets \{[\s\S]*?justify-self: center;/)
  assert.match(
    source,
    /:deep\(\.q-btn \+ \.q-btn\) \{\s*border-left: 1px solid var\(--dk-line\);/
  )
  assert.match(
    source,
    /:deep\(\.text-green-5\),[\s\S]*?color: var\(--agent-accent\) !important;/
  )
  assert.match(
    source,
    /:deep\(\.bg-green-5\),[\s\S]*?background: var\(--agent-accent\) !important;/
  )
  assert.match(source, /--agent-accent: #357a55;/)
  assert.match(source, /--agent-accent-soft: rgba\(53, 122, 85, 0\.1\);/)
  assert.match(source, /\.value-positive \{\s*color: var\(--agent-accent\);/)
  assert.match(source, /borderColor: '#78909c'/)
  assert.match(source, /backgroundColor: '#d32f2f'/)
  assert.match(source, /backgroundColor: '#1976d2'/)
  assert.match(source, /const AGENT_ACCENT = '#357a55'/)
  assert.match(source, /borderColor: AGENT_ACCENT/)
  assert.match(source, /backgroundColor: AGENT_ACCENT_FILL/)
  assert.equal((source.match(/align: 'center'/g) || []).length, 2)
  assert.equal((source.match(/fullSize: false/g) || []).length, 2)
  assert.equal((source.match(/boxWidth: 8/g) || []).length, 2)
  assert.equal((source.match(/boxHeight: 6/g) || []).length, 2)
  assert.equal((source.match(/padding: isMobile \? 14 : 18/g) || []).length, 2)
  assert.doesNotMatch(source, /pointStyleWidth:/)
  assert.match(source, /backgroundColor: '#f2c037'/)
  assert.match(source, /borderColor: '#42a5f5'/)
  assert.match(source, /grid: \{ color: 'rgba\(0, 0, 0, 0\.06\)' \}/)
})

test('private agent samples and brainstorm artifacts stay outside Git', async () => {
  const { stdout } = await execFileAsync(
    'git',
    [
      'check-ignore',
      'src/pages/index/strategy_result.json',
      'src/pages/index/operation_result.json',
      '.superpowers/brainstorm/layout.html'
    ],
    { cwd: new URL('..', import.meta.url) }
  )

  assert.deepEqual(stdout.trim().split('\n'), [
    'src/pages/index/strategy_result.json',
    'src/pages/index/operation_result.json',
    '.superpowers/brainstorm/layout.html'
  ])
})
