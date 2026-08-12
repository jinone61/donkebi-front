export const navigationItems = [
  { label: 'SYSTEM', href: '#system' },
  { label: 'SIMULATION', to: '/simulation' },
  { label: 'PRINCIPLE', href: '#principle' },
  { label: 'ORIGIN', href: '#origin' }
]

export const marketSnapshot = {
  label: 'KOSPI',
  value: '2,752.16',
  delta: '+0.64%',
  direction: 'up',
  timestamp: '2026.08.10 · 15:30 KST'
}

export const chartPeriods = ['1D', '1W', '1M', '3M', '1Y']

export const marketSeriesByPeriod = {
  '1D': [
    { label: '09:00', value: 2718.22 },
    { label: '09:30', value: 2727.48 },
    { label: '10:30', value: 2733.84 },
    { label: '11:30', value: 2739.32 },
    { label: '12:30', value: 2741.76 },
    { label: '13:30', value: 2745.2 },
    { label: '14:30', value: 2748.46 },
    { label: '15:30', value: 2752.16 }
  ],
  '1W': [
    { label: '08.03', value: 2692.41 },
    { label: '08.04', value: 2704.8 },
    { label: '08.05', value: 2698.17 },
    { label: '08.06', value: 2731.44 },
    { label: '08.07', value: 2734.65 },
    { label: '08.10', value: 2752.16 }
  ],
  '1M': [
    { label: '07.10', value: 2638.72 },
    { label: '07.15', value: 2661.35 },
    { label: '07.20', value: 2647.9 },
    { label: '07.24', value: 2685.14 },
    { label: '07.30', value: 2707.62 },
    { label: '08.04', value: 2692.41 },
    { label: '08.10', value: 2752.16 }
  ],
  '3M': [
    { label: '05.11', value: 2584.31 },
    { label: '05.26', value: 2618.47 },
    { label: '06.08', value: 2596.22 },
    { label: '06.22', value: 2652.8 },
    { label: '07.06', value: 2629.55 },
    { label: '07.20', value: 2647.9 },
    { label: '08.10', value: 2752.16 }
  ],
  '1Y': [
    { label: '2025.08', value: 2512.08 },
    { label: '2025.10', value: 2478.42 },
    { label: '2025.12', value: 2556.9 },
    { label: '2026.02', value: 2624.18 },
    { label: '2026.04', value: 2579.64 },
    { label: '2026.06', value: 2652.8 },
    { label: '2026.08', value: 2752.16 }
  ]
}

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
    date: '2026.08.10'
  },
  {
    index: '02',
    eyebrow: 'Equity',
    title: '좋은 실적이 좋은 수익률이 되지 않을 때',
    summary:
      '높아진 기대치와 밸류에이션 사이에서 다시 보아야 할 이익의 지속성.',
    date: '2026.08.08'
  },
  {
    index: '03',
    eyebrow: 'Flow',
    title: '수급은 조용히 방향을 바꾼다',
    summary:
      '외국인과 기관의 포지션 변화가 업종 간 온도 차이를 만드는 과정을 추적합니다.',
    date: '2026.08.06'
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
