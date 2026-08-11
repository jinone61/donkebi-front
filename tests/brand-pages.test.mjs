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

test('editable backtest workspace uses the Donkebi instrument labels', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')

  assert.match(source, /Private Simulation Interface/)
  assert.match(source, /label="SETUP"/)
  assert.match(source, /label="PERFORMANCE"/)
  assert.match(source, /label="ORDERS"/)
})

test('mobile setup keeps all setting fields in two columns', async () => {
  const source = await readSource('src/components/backtest/BacktestPage.vue')

  assert.match(
    source,
    /@media \(max-width: 767px\)[\s\S]*?\.settings-grid,[\s\S]*?\.basic-settings-grid \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/
  )
})

test('comparison BacktestPage remains byte-for-byte unchanged', async () => {
  const source = await readFile(
    new URL('../src/pages/index/BacktestPage.vue', import.meta.url)
  )
  const digest = createHash('sha256').update(source).digest('hex')

  assert.equal(
    digest,
    'c9b6f907b674b112eb634fc8b7b5a6f63eba435c02d75697276bc4e24ef90f19'
  )
})
