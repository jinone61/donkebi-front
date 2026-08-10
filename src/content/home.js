export const navigationItems = [
  { label: '시장', href: '#market' },
  { label: '리서치', href: '#research' },
  { label: '테마', href: '#perspective' },
  { label: '아카이브', href: '#archive' }
]

export const marketSnapshot = {
  label: 'KOSPI',
  value: '2,752.16',
  delta: '+0.64%',
  direction: 'up',
  timestamp: '2026.08.10 · 15:30 KST'
}

export const marketSeries = [
  { label: '09:00', value: 2718.22 },
  { label: '09:30', value: 2727.48 },
  { label: '10:00', value: 2724.16 },
  { label: '10:30', value: 2733.84 },
  { label: '11:00', value: 2731.6 },
  { label: '11:30', value: 2739.32 },
  { label: '12:00', value: 2736.18 },
  { label: '12:30', value: 2741.76 },
  { label: '13:00', value: 2738.92 },
  { label: '13:30', value: 2745.2 },
  { label: '14:00', value: 2743.88 },
  { label: '14:30', value: 2748.46 },
  { label: '15:00', value: 2746.1 },
  { label: '15:30', value: 2752.16 }
]

export const chartPeriods = ['1D', '1W', '1M', '3M', '1Y']

export const featuredResearch = {
  eyebrow: 'Featured Perspective · 08',
  title: '금리 이후의 시장은 무엇으로 움직이는가',
  summary:
    '유동성의 방향이 달라진 뒤에도 가격을 움직이는 힘은 남아 있습니다. 이익의 질과 수급의 변화를 함께 읽습니다.',
  caption: 'Structure and silence · Donkebi visual archive 01'
}

export const researchItems = [
  {
    index: '01',
    eyebrow: 'Macro',
    title: '낮아진 물가보다 중요한 것',
    summary:
      '통화정책의 전환보다 먼저 움직이는 신용과 고용의 작은 변화를 살펴봅니다.',
    date: '2026.08.10',
    to: '#article-01'
  },
  {
    index: '02',
    eyebrow: 'Equity',
    title: '좋은 실적이 좋은 수익률이 되지 않을 때',
    summary:
      '높아진 기대치와 밸류에이션 사이에서 다시 보아야 할 이익의 지속성.',
    date: '2026.08.08',
    to: '#article-02'
  },
  {
    index: '03',
    eyebrow: 'Flow',
    title: '수급은 조용히 방향을 바꾼다',
    summary:
      '외국인과 기관의 포지션 변화가 업종 간 온도 차이를 만드는 과정을 추적합니다.',
    date: '2026.08.06',
    to: '#article-03'
  }
]

export const footerGroups = [
  {
    title: 'Explore',
    items: ['시장 개요', '지수', '섹터', '리서치']
  },
  {
    title: 'About',
    items: ['Donkebi', '방법론', '데이터', '문의']
  }
]
