<template>
  <figure class="editorial-image">
    <div class="editorial-image__frame">
      <img :src="src" :alt="alt" loading="lazy" decoding="async" />
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup>
defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.editorial-image {
  margin: 0;

  &__frame {
    overflow: hidden;
    background: #d8d7d3;
  }

  img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    filter: grayscale(1) contrast(1.06);
    transition: transform var(--dk-slow) cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover img {
    transform: scale(1.018);
  }

  figcaption {
    margin-top: 13px;
    color: var(--dk-muted);
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
}
</style>
