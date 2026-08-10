<template>
  <a class="dk-text-link" :href="to" @click="handleClick">
    <span>{{ label }}</span>
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h13M14 7l5 5-5 5" />
    </svg>
  </a>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  to: {
    type: String,
    default: '#'
  }
})

function handleClick(event) {
  if (!props.to.startsWith('#')) return

  const target = document.querySelector(props.to)
  if (!target) return

  event.preventDefault()
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped lang="scss">
.dk-text-link {
  display: inline-flex;
  gap: 18px;
  align-items: center;
  padding-block: 8px;
  border-bottom: 1px solid currentColor;
  font-size: 0.69rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  line-height: 1;
  text-transform: uppercase;
  transition: gap var(--dk-fast) ease;

  &:hover {
    gap: 25px;
  }

  svg {
    width: 15px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: square;
    stroke-width: 1.4;
  }
}
</style>
