import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = path =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('public navigation reflects the Donkebi agent story', async () => {
  const { navigationItems } = await import('../src/content/home.js')

  assert.deepEqual(
    navigationItems.map(item => item.label),
    ['SYSTEM', 'BACKTEST', 'PRINCIPLE', 'ORIGIN']
  )
})

test('package metadata describes the AI agent trading product', async () => {
  const packageJson = JSON.parse(await readSource('package.json'))

  assert.equal(
    packageJson.description,
    'Quiet AI agent trading system for strategy simulation and execution'
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
  assert.match(source, /simulation-plate__line--market/)
  assert.match(source, /simulation-plate__line--donkebi/)
  assert.match(source, />MARKET<\/span/)
  assert.match(source, />ASSET<\/span/)
  assert.match(
    source,
    /simulation-plate__line--market"[\s\S]*?d="M0 188[\s\S]*?620 125"/
  )
  assert.match(
    source,
    /simulation-plate__line--donkebi"[\s\S]*?d="M0 188[\s\S]*?620 28"/
  )
  assert.match(source, /simulation-plate__marker--asset/)
  assert.match(source, /simulation-plate__marker--market/)
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

test('new backtest route renders the editable workspace component', async () => {
  const source = await readSource('src/pages/index/backtest.vue')

  assert.match(
    source,
    /import BacktestPage from '@\/components\/backtest\/BacktestPage\.vue'/
  )
  assert.match(source, /<BacktestPage\s*\/>/)
})

test('editable backtest workspace combines Donkebi branding with Korean task labels', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')

  assert.match(source, /Private Simulation Interface/)
  assert.match(source, /Backtest · Agent 01/)
  assert.match(source, /Strategy simulation\./)
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

test('editable backtest workspace keeps the comparison page logic in sync', async () => {
  const comparisonSource = await readSource('src/pages/index/BacktestPage.vue')
  const editableSource = await readSource(
    'src/components/backtest/BacktestPage.vue'
  )
  const extractScript = source =>
    source.match(/<script setup>([\s\S]*?)<\/script>/)?.[1]
  const normalizeScript = script => script?.replace(/[\s(),]/g, '')
  const expectedScript = extractScript(comparisonSource)
    ?.replace('computed, inject, reactive, ref', 'computed, reactive, ref')
    .replace("\nconst toggleMenu = inject('toggleMenu')", '')

  assert.equal(
    normalizeScript(extractScript(editableSource)),
    normalizeScript(expectedScript)
  )
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

test('comparison BacktestPage remains byte-for-byte unchanged', async () => {
  const source = await readFile(
    new URL('../src/pages/index/BacktestPage.vue', import.meta.url)
  )
  const digest = createHash('sha256').update(source).digest('hex')

  assert.equal(
    digest,
    '00dec4ad7fb38b314ec2a58db013c9f8f5de8a3398c30ccf4ba63b593f78e4b4'
  )
})
