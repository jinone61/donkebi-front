<template>
  <header class="section-header" :class="`section-header--${tone}`">
    <p class="dk-eyebrow">{{ eyebrow }}</p>
    <div class="section-header__copy">
      <h2 class="dk-serif">{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
  </header>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'light',
    validator: value => ['light', 'dark'].includes(value)
  }
})
</script>

<style scoped lang="scss">
.section-header {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: start;
  padding-bottom: clamp(36px, 4.2vw, 60px);

  &--dark {
    color: var(--dk-paper);
  }

  > .dk-eyebrow {
    grid-column: 1 / 4;
    padding-top: 10px;
  }

  &__copy {
    grid-column: 5 / 11;
  }

  h2 {
    max-width: 740px;
    margin: 0;
    font-size: clamp(2.2rem, 4.6vw, 4.7rem);
    line-height: 1.12;
  }

  p:not(.dk-eyebrow) {
    max-width: 560px;
    margin: 24px 0 0;
    color: var(--dk-muted);
    font-size: 0.91rem;
    line-height: 1.8;
  }

  &--dark p:not(.dk-eyebrow) {
    color: rgba(244, 241, 234, 0.58);
  }
}

@media (max-width: 767px) {
  .section-header {
    display: block;

    > .dk-eyebrow {
      margin-bottom: 28px;
      padding-top: 0;
    }

    h2 {
      font-size: clamp(2.2rem, 11vw, 3.5rem);
    }
  }
}
</style>
