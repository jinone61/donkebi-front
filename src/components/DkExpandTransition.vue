<template>
  <Transition name="dk-expand">
    <div
      v-show="show"
      class="dk-expand"
      :aria-hidden="show ? undefined : 'true'"
    >
      <div class="dk-expand__content">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  }
})
</script>

<style scoped>
.dk-expand {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
}

.dk-expand__content {
  min-height: 0;
  overflow: hidden;
}

.dk-expand-enter-active,
.dk-expand-leave-active {
  overflow: hidden;
  transition:
    grid-template-rows 260ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease;
}

.dk-expand-enter-from,
.dk-expand-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}
</style>
