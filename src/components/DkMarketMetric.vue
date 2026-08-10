<template>
  <section class="market-metric" :aria-label="`${label} 시장 지표`">
    <p class="market-metric__label dk-eyebrow">{{ label }}</p>
    <p class="market-metric__value dk-serif dk-tabular">{{ displayValue }}</p>
    <p class="market-metric__delta dk-tabular" :class="`is-${direction}`">
      {{ displayDelta }}
    </p>
    <p v-if="timestamp" class="market-metric__time">{{ timestamp }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: null
  },
  delta: {
    type: [String, Number],
    default: null
  },
  direction: {
    type: String,
    default: 'flat',
    validator: value => ['up', 'down', 'flat'].includes(value)
  },
  timestamp: {
    type: String,
    default: ''
  }
})

function normalizeDisplay(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback
  return value
}

const displayValue = computed(() => normalizeDisplay(props.value, '—'))
const displayDelta = computed(() =>
  normalizeDisplay(props.delta, '변동 정보 없음')
)
</script>

<style scoped lang="scss">
.market-metric {
  &__label,
  &__value,
  &__delta,
  &__time {
    margin: 0;
  }

  &__value {
    margin-top: 32px;
    font-size: clamp(2.7rem, 4.8vw, 5.2rem);
    line-height: 1;
  }

  &__delta {
    margin-top: 16px;
    font-size: 0.76rem;
    font-weight: 600;
  }

  &__time {
    margin-top: 9px;
    color: var(--dk-muted);
    font-size: 0.67rem;
  }
}

.is-up {
  color: var(--dk-positive);
}

.is-down {
  color: var(--dk-negative);
}

.is-flat {
  color: var(--dk-muted);
}
</style>
