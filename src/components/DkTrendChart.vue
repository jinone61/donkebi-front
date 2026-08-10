<template>
  <section class="trend-chart" aria-label="시장 추이 차트">
    <div class="trend-chart__periods" aria-label="차트 기간 선택" role="group">
      <button
        v-for="period in periods"
        :key="period"
        type="button"
        :aria-pressed="modelValue === period"
        :class="{ 'is-active': modelValue === period }"
        @click="$emit('update:modelValue', period)"
      >
        {{ period }}
      </button>
    </div>

    <div v-if="validPoints.length > 1" class="trend-chart__canvas">
      <svg :aria-label="chartSummary" role="img" viewBox="0 0 900 320">
        <g class="trend-chart__grid" aria-hidden="true">
          <line
            v-for="y in [44, 112, 180, 248]"
            :key="y"
            x1="0"
            x2="900"
            :y1="y"
            :y2="y"
          />
        </g>
        <path class="trend-chart__area" :d="areaPath" aria-hidden="true" />
        <path class="trend-chart__line" :d="linePath" aria-hidden="true" />
        <circle :cx="lastPoint.x" :cy="lastPoint.y" r="4" aria-hidden="true" />
      </svg>
      <div class="trend-chart__labels dk-tabular" aria-hidden="true">
        <span>{{ validPoints[0].label }}</span>
        <span>{{ middlePoint.label }}</span>
        <span>{{ validPoints.at(-1).label }}</span>
      </div>
    </div>

    <div v-else class="trend-chart__empty" role="status">
      <p>표시할 데이터가 없습니다.</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  periods: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const validPoints = computed(() =>
  props.points.filter(point => {
    if (!point || point.value == null) return false
    if (typeof point.value === 'string' && point.value.trim() === '')
      return false
    return Number.isFinite(Number(point.value))
  })
)

const plottedPoints = computed(() => {
  if (validPoints.value.length < 2) return []

  const values = validPoints.value.map(point => Number(point.value))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return validPoints.value.map((point, index) => ({
    x: (index / (validPoints.value.length - 1)) * 900,
    y: 272 - ((Number(point.value) - min) / range) * 224
  }))
})

const linePath = computed(() =>
  plottedPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
)

const areaPath = computed(() =>
  plottedPoints.value.length ? `${linePath.value} L 900 280 L 0 280 Z` : ''
)

const lastPoint = computed(() => plottedPoints.value.at(-1) ?? { x: 0, y: 0 })
const middlePoint = computed(
  () =>
    validPoints.value[Math.floor((validPoints.value.length - 1) / 2)] ?? {
      label: ''
    }
)
const chartSummary = computed(() => {
  if (validPoints.value.length < 2) return '시장 추이 데이터 없음'

  const first = validPoints.value[0]
  const last = validPoints.value.at(-1)
  return `${first.label} ${first.value}에서 ${last.label} ${last.value}까지의 시장 추이`
})
</script>

<style scoped lang="scss">
.trend-chart {
  &__periods {
    display: flex;
    gap: 22px;
    align-items: center;
    margin-bottom: clamp(26px, 3vw, 44px);

    button {
      position: relative;
      padding: 4px 0 10px;
      border: 0;
      background: transparent;
      color: var(--dk-muted);
      cursor: pointer;
      font-size: 0.66rem;
      font-weight: 600;

      &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 1px;
        background: currentColor;
        content: '';
        opacity: 0;
        transform: scaleX(0.5);
        transition:
          opacity var(--dk-fast),
          transform var(--dk-fast);
      }

      &.is-active {
        color: var(--dk-ink);

        &::after {
          opacity: 1;
          transform: scaleX(1);
        }
      }
    }
  }

  &__canvas {
    min-height: 320px;
  }

  svg {
    display: block;
    width: 100%;
    overflow: visible;
  }

  &__grid line {
    stroke: var(--dk-line);
    stroke-width: 1;
  }

  &__area {
    fill: rgba(69, 107, 130, 0.045);
  }

  &__line {
    fill: none;
    stroke: var(--dk-ink);
    stroke-linecap: square;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  circle {
    fill: var(--dk-paper);
    stroke: var(--dk-ink);
    stroke-width: 1.5;
  }

  &__labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    color: var(--dk-muted);
    font-size: 0.62rem;
  }

  &__empty {
    display: grid;
    min-height: 320px;
    place-items: center;
    border-block: 1px solid var(--dk-line);
    color: var(--dk-muted);
    font-size: 0.82rem;
  }
}

@media (max-width: 767px) {
  .trend-chart {
    &__canvas,
    &__empty {
      min-height: 230px;
    }

    &__periods {
      gap: 0;
      justify-content: space-between;
    }
  }
}
</style>
