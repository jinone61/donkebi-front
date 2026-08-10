<template>
  <article class="research-item" :id="`article-${index}`">
    <div class="research-item__meta">
      <span class="research-item__index dk-serif">{{ index }}</span>
      <span class="dk-eyebrow">{{ eyebrow }}</span>
    </div>
    <div class="research-item__content">
      <h3 class="dk-serif">{{ title }}</h3>
      <p>{{ summary }}</p>
    </div>
    <div class="research-item__action">
      <time :datetime="date.replaceAll('.', '-')">{{ date }}</time>
      <a :href="to" :aria-label="`${title} 읽기`" @click="handleClick">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 12h13M14 7l5 5-5 5" />
        </svg>
      </a>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  index: {
    type: String,
    required: true
  },
  eyebrow: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  date: {
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
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<style scoped lang="scss">
.research-item {
  display: grid;
  grid-template-columns: 2fr 7fr 3fr;
  gap: 24px;
  align-items: start;
  padding-block: clamp(30px, 3vw, 44px);
  border-top: 1px solid var(--dk-line);

  &:last-child {
    border-bottom: 1px solid var(--dk-line);
  }

  &__meta {
    display: flex;
    gap: 24px;
    align-items: baseline;
  }

  &__index {
    font-size: 1rem;
  }

  &__content {
    max-width: 720px;
  }

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: clamp(1.45rem, 2.35vw, 2.55rem);
    line-height: 1.35;
  }

  p {
    max-width: 560px;
    margin-top: 14px;
    color: var(--dk-muted);
    font-size: 0.82rem;
    line-height: 1.7;
  }

  &__action {
    display: flex;
    justify-content: flex-end;
    gap: 30px;
    align-items: center;
    padding-top: 8px;

    time {
      color: var(--dk-muted);
      font-size: 0.67rem;
    }

    a {
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border: 1px solid var(--dk-line);
      transition:
        background var(--dk-fast),
        color var(--dk-fast);

      &:hover {
        background: var(--dk-ink);
        color: var(--dk-paper);
      }
    }

    svg {
      width: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.4;
    }
  }
}

@media (max-width: 767px) {
  .research-item {
    grid-template-columns: 1fr auto;

    &__meta,
    &__content {
      grid-column: 1 / -1;
    }

    &__action {
      grid-column: 1 / -1;
      justify-content: space-between;
    }
  }
}
</style>
